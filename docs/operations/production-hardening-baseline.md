# Production hardening baseline

Date: 2026-07-27

## Architecture

The repository is a Docker Compose FastAPI monorepo with Main, Research, and Library APIs; the shared `services/common/ksu_common` package; PostgreSQL; Redis; Celery workers; Nginx gateway/edge proxies; and a VM deployment script. Frontends are built from the `frontend` pnpm workspace and run as separate Next.js services in the VM overlay.

## Existing safeguards

- Alembic migrations exist independently for all three APIs.
- JWT, RBAC roles/scopes, cache, rate limiting, and audit helpers are present in `ksu_common`.
- Compose health checks exist for PostgreSQL and APIs.
- VM deployment already supports pre-deploy backups, image builds, HTTPS, and health polling.
- JSON logging is available through the shared logging package.

## Baseline risks found

- Base Compose published API host ports and interpolated a weak database password fallback.
- Production migration execution was opt-in and occurred after the initial health wait.
- Backend Dockerfiles had no runtime `USER` and therefore ran as root.
- CI was a manually dispatched runner smoke test.
- No repository-enforceable production environment or Compose port audit existed.
- Backup output was local-only and skipped when PostgreSQL was unavailable.
- Environment examples intentionally contain development placeholders; they must never be used as production secrets.

## Controls added

See `scripts/validate_production_env.py`, `scripts/audit_compose_ports.py`, `scripts/validate_migrations.sh`, the quality workflow, the non-root Dockerfiles, and the operations documents in this directory. Authentication/RBAC mechanics were not duplicated: the existing `ksu_common` implementation is the authoritative shared contract and is documented in `docs/architecture/authentication-and-rbac.md`.

## Verification inventory

Run `docker compose -f docker-compose.yml -f docker-compose.vm.yml config` with a CI-only `POSTGRES_PASSWORD`, `scripts/validate_migrations.sh`, `python scripts/validate_production_env.py --help`, and the focused pytest file. Docker builds, real PostgreSQL/Redis tests, ZAP, Trivy, staging scans, and restore tests require the corresponding external services/tools and are reported as unavailable when not run.

## Remaining risks

Central log shipping, Sentry/metrics provider credentials, off-server encrypted backup storage, and regular staging restore execution require deployment-specific provider choices and credentials. The repository now fails closed at the configuration/deployment boundaries but cannot prove those external controls from a local checkout.
