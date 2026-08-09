# Backend production audit and refactor plan

## Executive assessment

The four deployables are a sound operational boundary for a small team, but the
current system is not yet production-complete. The primary disconnect is not the
number of services; it is inconsistent adoption of shared infrastructure and a
few cross-schema shortcuts. Each service must bind kernel factories to its own
configuration, own one schema through one database role, and communicate through
the authenticated internal HTTP client.

The current single-VM design can absorb a meaningful public traffic increase by
raising API workers, adding cache capacity, and tuning pool sizes. It cannot be
scaled safely by changing one knob in isolation. The connection budget is:

```text
(API processes + Celery processes) * (pool_size + max_overflow)
  <= max_connections - administration reserve
```

At the production defaults this is 60 application connections against an
80-connection application budget. Increasing workers without reducing each
process pool will exhaust PostgreSQL.

## Findings

### Reliability and performance

- Main's route wrappers were reconstructed with unresolved annotations, causing
  authentication parameters to be treated as query parameters. This blocks login
  and can bypass the intended write wrapper.
- Research field selection returns native UUID and datetime values, while its
  response envelope previously rejected them.
- Library had two migration heads, so automated deploys could not migrate it.
- Celery schedules existed in code but no beat process ran them. Main outbox
  delivery/retry and retention, plus Library loan maintenance, therefore never ran.
- Public caching exists, but Redis is both cache and broker per service. A broker
  backlog can evict or delay cache traffic. Before traffic exceeds one VM, give
  broker and cache separate Redis instances or at least separate memory policies.
- Public list performance depends on real query plans. Capture slow queries and
  add model-derived indexes only with a live database and an empty Alembic
  autogenerate diff as proof.

### Security

- The shared HS256 minting capability has been removed. Main API is the temporary
  RS256 signing boundary; workers and the other services receive verification
  keys only, and Main publishes JWKS for external verifiers.
- Kernel authentication now receives verifier configuration explicitly and pins
  algorithm, issuer, audience, key id, and token type.
- Production Main inherited `DEBUG=true` from its env file. This exposed API docs
  and enabled SQL echo. Production configuration must reject DEBUG, not merely
  rely on operator convention.
- API keys are hashed and scoped, but external integration needs documented key
  rotation, per-key quotas, request IDs, and an auditable revocation path.
- Webhook administration and outbox storage exist, but delivery is incomplete.
  Delivery must sign timestamped payloads, reject stale replay windows, bound
  redirects/response size/timeouts, and record every attempt.

### Database lifecycle

- Schema-per-service is the correct ownership model, but existing foreign-schema
  metadata references show the boundary is not complete. Remove them only with a
  live database available to prove empty autogenerate output and role grants.
- Backups used nonexistent identifiers. A backup is not operational evidence until
  an automated restore drill verifies schema ownership, migration stamps, row
  counts, and application health.
- Add WAL archiving after restore drills are reliable. Keep daily logical backups
  for portable recovery and WAL for recovery-point objectives.
- Audit, outbox, idempotency, metrics, and delivery-attempt tables grow with
  traffic. Run retention from beat, monitor deleted rows/bloat, then partition only
  when measured volume justifies its maintenance cost.

## Execution sequence

1. Restore executable signal: linear migrations, route/runtime checks, structural
   snapshots, Ruff baseline, dependency checks, and production Compose rendering.
2. Repair request correctness: Main wrapper adoption and Research serialization.
3. Close immediate operational risks: DEBUG production gate, valid backups, Celery
   beat, and explicit kernel authentication configuration.
4. Complete integrations: signed webhook delivery from the outbox with bounded
   retries, circuit breaking, attempt records, and operator-visible failure state.
5. Extract authentication: RS256 signing service, JWKS rotation, verifier-only
   services, then remove the shared symmetric secret.
6. With database access, remove cross-schema mappings, verify role grants, run empty
   autogenerate checks, exercise migrations on restored data, and establish restore
   and WAL procedures.
7. Load-test cached reads, uncached reads, login, writes, WebSockets, and worker
   backlog. Scale workers and pools from measured saturation, not request counts.

## Phase 3 implementation status

- KSU permissions, roles, scope vocabulary, and RBAC policy now live in the
  versioned `ksu-contracts` package rather than the infrastructure kernel.
- The kernel owns the reusable SQL count helper, public-URL/SSRF validation,
  and Celery URL validation. The promoted implementations were checked against
  their service copies before those copies were removed.
- Response-model coverage is a per-service production ratchet: Main 742,
  Research 2, Library 133, and HERI Africa 21. Existing debt can deploy, while
  an added uncovered route or invalid exemption fails production startup.
- Cross-schema ORM metadata remains deliberately unchanged until a live
  database can prove an empty Alembic autogenerate diff and validate role grants.

## Phase 4 implementation status

- RS256 replaces the fleet-wide symmetric secret. Only the Main API receives the
  private key; all workers and sibling APIs are configured as verifiers only.
- Access, refresh, and socket tokens carry a `kid`, issuer, audience, and explicit
  token type. Verification fails closed on mismatches.
- Main publishes a public JWKS endpoint, and the versioned token contract records
  claims, process capabilities, and the current coordinated rotation procedure.
- Main remains the temporary identity owner. Moving its user/session storage to a
  dedicated auth deployable is deferred until database-backed migration proof is
  available; the token wire contract will not need to change for that move.
- Zero-logout key rotation is not yet claimed. It requires a public-key ring and
  overlapping JWKS publication and remains explicit follow-up work.

## Phase 5 implementation status

- Published outbox events now fan out to active webhook subscriptions by exact
  event name or wildcard without placing third-party calls on request paths.
- Webhook requests use the versioned domain-event envelope, an event idempotency
  key, timestamped HMAC-SHA256 signatures, fixed deadlines, disabled redirects,
  bounded response bodies, transport retries, and circuit breaking.
- Every attempt is recorded in `webhook_deliveries` with response status,
  duration, error, retry time, and terminal state. Administrators can inspect and
  explicitly replay deliveries.
- The `main.integrations` queue has its own worker and concurrency setting so a
  failing third party cannot consume Main's email, event, notification, or
  maintenance worker capacity.
- Webhook configuration rejects obvious SSRF targets and never returns stored
  secrets. The signing secret is generated when omitted and shown once at
  creation.

## Release gates

- All four applications construct with unchanged route/table surfaces.
- Every service has exactly one Alembic head and migrations apply to a restored copy.
- Authentication and mutation smoke requests reach their intended dependencies.
- Production Compose has DEBUG disabled and all required secrets fail closed.
- Scheduled tasks are present as running services and their task queues are consumed.
- Structural changes are either absent or explicitly explained by the intended
  migration/contract change.
- A restore drill and representative load test are recorded before production cutover.
