# KSU Platform — backend refactor brief

Paste this whole file as the opening prompt of a new session. It is written to be
self-contained: everything below was verified by running it, not inferred.

---

## 1. The system

`/home/egric/WP/ksu-website`, branch `dev`. A multi-portal university platform.

- **4 FastAPI services**: `main` (100 tables, 744 routes), `research` (66, 358),
  `library` (32, 134), `heri_africa` (22, 48)
- **1 PostgreSQL**, schema + role per service (`main`/`research`/`library`/`heri`)
- **1 Redis** per service by db index; each db holds that service's cache *and* its
  Celery broker
- **Shared kernel** `services/common/ksu_common` — 29 modules, ~8.1k LOC
- **nginx gateway** routes by path prefix; 5 Next.js apps under `frontend/`

Python venv with all four services installed:
`/tmp/claude-1000/-home-egric-WP-ksu-website/fff908d7-8c68-4b9a-9e67-c3c4be6b7a06/scratchpad/venv/bin/python`
`.env` files exist per service (gitignored, dev placeholders) so every service boots.

## 2. Architecture — DECIDED, do not re-litigate

The owner chose this explicitly after being shown the alternatives:

1. **Four services stay separate.** No service imports another's Python package.
2. **One database, schema per service, role per service.** No service role holds any
   privilege in another service's schema.
3. **The shared kernel is isolated** — infrastructure only, no service's domain logic
   or domain tables.
4. **Services communicate over an explicit interface** — internal HTTP with
   `X-Internal-Key` via `ksu_common/internal_client.py` — never by reaching into each
   other's schemas.

**The boundary rule** (settles every "does this belong in the kernel" argument):

> A module belongs in `ksu_common` if and only if a different university, running none
> of these four domains, could adopt it unchanged: it names no KSU entity, no KSU
> permission, no KSU job title, no KSU scope type, and maps no table. Anything two
> services must agree on but neither owns is a versioned artifact under `contracts/`,
> not kernel code. Everything else belongs to the service whose vocabulary it is.

**Also decided:** an `auth` service will be extracted later (~1,210 LOC; only 9 files in
main touch the `User` table; `Person` stays in main). It moves to RS256 + JWKS because
today all four services share one symmetric `JWT_SECRET_KEY` and can therefore *mint*
tokens, not just verify them. Sequenced *after* the kernel work. The platform is the
identity source — no institutional AD/LDAP. Do not build OIDC until a second relying
party exists.

## 3. THE PLATFORM IS BROKEN RIGHT NOW

Fix these before anything else. All pre-existing, all verified by running them.

| # | Defect | Evidence |
|---|---|---|
| 1 | **main's entire write surface returns 500.** `install_main_idempotency` sets `route.app`; `install_strict_response_validation` re-sets it; FastAPI rebuilds from `route.endpoint` and the ContextVar wrapper is lost | `app/api/v1/_idempotency.py:113`, `ksu_common/runtime.py:188`. Reproduced at `b7d6bde2`, i.e. not caused by this refactor |
| 2 | **Nobody can log in.** `POST /api/v1/auth/login` returns 422 with `data`/`db` reported as missing *query* params — same route-adoption bug | fixed the latent `ip_address` TypeError underneath at `25957801`; the 422 remains |
| 3 | **research CRUD 500s on ~352 of 358 routes.** `SuccessEnvelope[JsonObject]` cannot hold the native `UUID`/`datetime` that field selection returns | `research/app/routes/v1/_crud.py:54,300` |
| 4 | **library cannot deploy** — two Alembic heads (`20260622_0003`, `20260806_0009`), and `deploy.sh:778` runs `alembic upgrade head` under `set -e` |
| 5 | **CI produces no signal** — `ruff check .` runs before pytest and fails in all five packages; `.secrets.baseline` is invalid so the `images`/Trivy job has never run. The `migrations` matrix job DOES gate and is red for library |
| 6 | **Celery beat is deployed nowhere** — no `--beat`, no beat service in any compose file. Retention tasks never run; `outbox.publish_pending` is the only consumer of the retry backoff |
| 7 | **`DEBUG=true` in production config** — serves the full 565-route admin OpenAPI publicly *and* sets `echo=True`, writing SQL with bound parameters (argon2 hashes, plaintext reset tokens) to host-bind-mounted logs | `services/main/.env:22`, `docker-compose.yml:186` |
| 8 | **Backups target a role and database that do not exist** — `deploy.sh:663` runs `pg_dump -U ksu -d ksu`; the cluster is `ksu_service_user`/`ksu_services_db`. No WAL archiving |
| 9 | **`--forwarded-allow-ips 172.30.0.2` is one hop too narrow** — every IP-keyed rate limit collapses to one global bucket; WebSocket cap becomes ~40 platform-wide |
| 10 | **Webhooks are a shell** — model, 6 admin endpoints and a correct outbox all exist; `record_delivery` has zero callers |
| 11 | **`ksu_common/auth.py` reads `JWT_SECRET_KEY` from `os.environ`** but only main plants it (`config.py:256`), so library's 37 `get_optional_user` sites raise uncaught `RuntimeError` outside Docker |

## 4. ⚠️ ALL BACKEND TESTS WERE DELETED

At `43308d60`, on request: 260 modules, 40,062 lines, including ~1,600 that passed.
Recover with `git checkout 25957801 -- services/*/tests scripts/tests`.

**There is no pytest signal. Do not propose "add a test" as verification.** Two scripts
replace it — use both on every change:

```bash
# structural regression: capture, change, capture, diff
python scripts/structural_snapshot.py /tmp/before.json
python scripts/structural_snapshot.py /tmp/after.json
diff <(jq -S . /tmp/before.json) <(jq -S . /tmp/after.json)   # must be empty

# proof a promotion is a PURE MOVE (identical => behaviour cannot change)
python scripts/ast_identical.py <symbol> f1.py f2.py othername@f3.py
```

`ast_identical.py` normalises formatting, comments, docstrings and service-name tokens,
and accepts `symbol@path` when a copy was renamed. It exits non-zero on drift and prints
the diff. **Never promote a drifted symbol** — that silently imposes one service's
behaviour on all four.

Current baseline: main 744 routes/100 tables, research 358/66 (`foreign=['main.media']`),
library 134/32 (`foreign=['main.audit_logs']`, 2 heads), heri 48/22.
`ksu_common`: 29 modules, 88 exports, `Base.metadata=['main.audit_logs']`.

## 5. What has landed

```
bf37427c  Delete shim and dead code from the shared kernel
8c099054  Promote the audit task factory into ksu_common
11427365  Compare renamed symbols in ast_identical
6f2e1910  Add structural verification tooling
43308d60  Remove the backend test suites
25957801  Accept ip_address in AuthService.login
4adbcbd7  Take domain vocabulary and dead code out of the shared kernel
75964c60  Make .env.example complete for every service
da36879a  Make Alembic autogenerate safe to rely on
62d31819  Merge duplicate library guide models into engagement.py   <- library now boots
5825a2f4  Fix config tests broken by making INTERNAL_API_KEY required
00889a6e  Move audit writes off the request path and harden traffic handling
```

Parked: `wip/migration-squash` — all 80 migrations squashed to one model-derived baseline
per service, with the non-ORM DDL (pg_trgm, trigram indexes, idempotency triggers)
preserved. Complete but never applied to a real database; 21 tests referenced deleted
files. **Do not merge to fix library's two heads** — it rewrites the stamped revision on
every deployed database with no rollback.

## 6. Kernel work remaining

Honest total: **~270 lines**. Calibrate expectations — the audit factory was the strongest
candidate anyone produced (4/4 AST-identical) and netted **16 lines repo-wide**.

**Safe, no database needed:**
- `ksu_common/auth.py` take the secret/algorithm as explicit args via a
  `build_user_dependencies()` factory (fixes defect 11)
- SSRF guard trio `_is_safe_public_url`/`_has_unsafe_authority`/`_is_numeric_hostname_candidate`
  — 60 of 61 lines byte-identical across main and research → `security.py`
- `_count(db, model, *conditions)` — identical ×3, 163 call sites → new `ksu_common/stats.py`
  as a free function, **not** a method on `Base`
- `validate_celery_urls` — identical ×3, genuinely absent from heri (heri gains a boot gate)
- `PUBLIC_RESPONSE_MODEL_MISSING_BASELINE = 907` is a fleet total applied per service, so
  the ratchet can never fire → per-service baseline arg
- Dead service-side schema classes (main `SlugMixin`/`PaginatedResponse`/`APIResponse`,
  research `PaginatedResponse`/`APIResponse`) — 61 lines
- main's dead `app/routes/__init__.py` shells — `register_routers` is unreferenced

**BLOCKED — no runnable proof available:** anything touching table mapping or migrations
is verified by `alembic revision --autogenerate` producing an empty diff. That fails with
`InvalidPasswordError` (placeholder credentials), the offline fallback dies on
`MockConnection`, and Docker is permission-denied. This blocks: the `models/__init__.py`
one-liner (`from .audit import AuditLog` — the *entire* `Base.metadata` contamination),
per-service `Base`, `AuditLog`-as-contract, and the `migrations/env.py` promotion.
**Get database credentials before attempting these.**

**REJECTED — do not re-propose:**
- `BaseServiceSettings` from the Settings intersection (fatal)
- `slugify`, a real `/readyz`, `make_service_base` as a kernel factory (serious)
- Retention/prune factory rolled out to all four — **permission-infeasible**: siblings hold
  `SELECT, INSERT` on `main.audit_logs`, `DELETE` is deliberately withheld
- main's bearer-or-cookie decode — all four copies are *inside main*; local extraction
- Command idempotency unification — ~1,087 LOC, three schemas, divergent fingerprints; XL

**Accidental duplication, leave alone:** `app/core/database.py` ×4, `app/tasks/celery_app.py`
×4, `alembic.ini`/`wsgi.py` ×4, Dockerfiles, seeders, `_rate_limits.py`, research's
`build_crud_router`, main's `security/scopes.py`, heri's `admin_resources.py`, the library
assistant stack.

**`roles.py` (764 lines, 268 permissions) is a CONTRACT, not kernel and not main.** The
namespaces are federated — research 35, library 13, heri 15, main the rest — so moving it
into any one service makes that service own the others' permission names. It belongs under
`contracts/` as per-service fragments composed at build time. The frontend's
`@ksu/auth permissions.ts` already has only 84 of the 268 and denies 6 that don't exist —
generate both from the same fragments.

## 7. Constraints

- **1–2 developers, no dedicated ops, one VM running docker-compose.** Reject anything
  needing a platform team. Value per unit of maintenance is the ranking criterion.
- No database credentials on this machine; Docker socket permission-denied.
- Python 3.14 locally, CI uses 3.12.
- ruff is unpinned and 0.16 expanded the default rule set — there are ~4,450 pre-existing
  findings. **Only a per-file before/after delta is meaningful.**
- `graphify-out/` does not exist; `graphify` commands fail.

## 8. Working agreement

- Verify claims by running them. Several confident findings in this project turned out to
  be wrong: `ksu_common` was far less domain-polluted than claimed (26 of 33 modules were
  fine); per-service audit tables would have broken two shipped admin UIs because main's
  console reads all services; `migration_check.py` was already wired.
- Run an adversarial pass on anything expensive to get wrong. It has repeatedly caught
  false findings — a wrong high-severity claim costs this team a week.
- State corrections plainly and move on.
- Prefer incremental commits that each leave the system working.

## 9. Suggested next step

Fix CI signal (0.5d) → main's route adoption (1d, unblocks login and all writes) →
`DEBUG` guard (15min) → backup identifiers (2h). Nothing else is verifiable until the
first two land.
