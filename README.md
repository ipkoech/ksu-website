# KSU Platform

KSU Platform is a multi-portal university web platform for Kisii University. It contains the public
website, admin portal, research portal, library portal, HERI Africa portal, shared frontend packages,
and Python backend services.

## Repository Layout

```text
frontend/                    Next.js apps and shared frontend packages (pnpm workspace + Turborepo)
frontend/apps/web            Public website
frontend/apps/admin          Administration portal
frontend/apps/research       Research portal
frontend/apps/library        Library portal
frontend/apps/heri-africa    HERI Africa portal
frontend/packages/ui         Shared design system and components
frontend/packages/api-client Typed API client and React Query hooks
frontend/packages/auth       Token store, auth hooks, and route guards
frontend/e2e                 Playwright end-to-end specs
services/                    FastAPI backend services
services/main                Main institutional API
services/research            Research API
services/library             Library API
services/heri_africa         HERI Africa API
services/common              Shared Python library (ksu_common) used by every service
gateway/                     nginx API gateway configuration and VM edge templates
contracts/                   Generated OpenAPI documents and frontend contract notes
scripts/                     Repository automation and utility scripts
monitoring/                  Prometheus, Alertmanager, and exporter configuration
docs/                        Operations runbooks and hardening baselines
```

Local design notes, generated docs, runtime logs, environment files, caches, and agent instructions
are intentionally ignored unless explicitly requested.

`packages/` at the repository root holds unused placeholder scaffolding that predates
`frontend/packages/`. Do not build on it.

## Architecture

Requests enter through the nginx gateway, which routes by URL prefix to the service that owns the
path. `gateway/nginx.conf` sends `/api/v1/(research|projects|grants|...)` to the research API,
`/api/v1/library` to the library API, `/api/v1/heri` to the HERI Africa API, and everything else,
including `/uploads/` and the `/api/v1/realtime` WebSocket, to the main API. Paths matching
`.../internal/` are blocked at the edge.

Every service is built from the same shared factory. `services/common/ksu_common/runtime.py` exposes
`create_service_app(ServiceAppConfig)`, which each service's `app/main.py` calls, so CORS, audit
logging, observability, and error handling are defined once. `ksu_common` also owns JWT validation,
the RBAC role and permission catalogue, pagination, caching, rate limiting, reliability primitives,
and the internal client used for service-to-service calls authenticated with an `X-Internal-Key`
header.

Within a service, routers live in `app/api/v1/`, business logic in `app/services/`, SQLAlchemy models
in `app/models/`, Pydantic schemas in `app/schemas/`, Celery tasks in `app/tasks/`, and Alembic
revisions in `migrations/`.

Authentication is stateless. The main service issues JWTs and every service validates them
independently against a shared `JWT_SECRET_KEY`, so there is no auth round-trip between services.
Permission strings from `ksu_common/roles.py` are mirrored in `@ksu/auth` and enforced in the browser
by the `auth-guard`, `permission-guard`, and `service-guard` components.

All services share one PostgreSQL database with a dedicated schema and role per service (`main`,
`research`, `library`, `heri`), provisioned by `scripts/init-database-ownership.sh`. Redis is
partitioned by database index — main `0`, library `1`, research `2`, heri `3` — and serves as both
cache and Celery broker.

Writes that must notify other parts of the system use a transactional outbox. `app/services/domain_events.py`
records an `OutboxEvent` in the same transaction as the business change, and a relay task publishes it
afterwards. Realtime updates flow through Redis pub/sub into `app/realtime/redis_subscriber.py` and out
over WebSocket via `connection_manager.py`.

On the frontend, `frontend/packages/api-client/src/service-urls.ts` resolves base URLs with a
server/browser split: server rendering uses the in-cluster `KSU_*_API_URL` values and the browser falls
back to `NEXT_PUBLIC_*`. `scripts/generate_api_contracts.py` regenerates `contracts/*/openapi.json` so
client types stay aligned with the services.

## Prerequisites

- Node.js 22
- pnpm 9
- Python 3.12
- Docker and Docker Compose

## Environment

Create service environment files from the examples before running the full stack:

```bash
cp services/main/.env.example services/main/.env
cp services/research/.env.example services/research/.env
cp services/library/.env.example services/library/.env
cp services/heri_africa/.env.example services/heri_africa/.env
```

Replace every `REPLACE_*` value with local development values.

Compose also requires database secrets in a root `.env` file. It refuses to start without them:

```text
POSTGRES_PASSWORD
MAIN_DB_PASSWORD
RESEARCH_DB_PASSWORD
LIBRARY_DB_PASSWORD
HERI_DB_PASSWORD
```

`.env.example` covers the School Portal feature flags and realtime tuning. `.env.production.example`
lists the full production variable set; copy it into a deployment secret store rather than committing a
populated file. Do not commit real `.env` files, credentials, uploads, logs, local databases, or
generated caches.

## Frontend

Install dependencies:

```bash
cd frontend
pnpm install
```

Run individual apps:

```bash
pnpm dev:web
pnpm dev:admin
pnpm dev:research
pnpm dev:library
pnpm dev:heri
```

The web, admin, and heri scripts pin ports to `3000`, `3001`, and `3004`. The research and library
scripts use Next.js defaults when run directly. The Docker Compose stack pins frontend ports as
follows:

```text
web      3000
admin    3001
research 3002
library  3003
heri     3004
```

Check frontend quality:

```bash
cd frontend
pnpm lint
pnpm typecheck
```

## Backend And Local Stack

Run the backend stack from the repository root:

```bash
docker compose up --build
```

That command starts PostgreSQL, Redis, the gateway, the four APIs, and the Celery workers. Only the
gateway is published to the host:

```text
gateway  http://localhost:8080
```

The frontend apps sit behind Compose profiles, so they only start when a profile is selected:

```bash
docker compose --profile frontend up --build
```

Available profiles are `main`, `research`, `library`, `heri`, `frontend`, `all`, and `observability`.
The `observability` profile adds Prometheus, Alertmanager, and the PostgreSQL and Redis exporters
configured under `monitoring/`.

To reach the APIs directly on the host instead of through the gateway, add the developer overlay. It
publishes each service on loopback and sets development secrets and CORS origins:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

```text
main     http://localhost:8000
research http://localhost:8001
library  http://localhost:8002
```

Never use `docker-compose.dev.yml` for VM or production deployments. `docker-compose.vm.yml` and
`docker-compose.research-vm.yml` cover those targets.

## Development Workflow

Use the project helper when committing changes after verification:

```bash
scripts/commit-changes.sh -m "Describe the change" --run-checks
```

For broader changes, run full checks:

```bash
scripts/commit-changes.sh -m "Describe the change" --run-full-checks
```

Use explicit paths when unrelated local changes exist.

## Continuous Integration

`.github/workflows/quality.yml` runs on every pull request and on pushes to `dev`, `staging`, and
`main`. It validates repository files and the Compose production topology, inspects Dockerfiles for
root runtime, then runs compile, Ruff, pytest, and dependency audits across `common`, `main`,
`research`, `library`, and `heri_africa`. It also validates migration history per service, runs
frontend lint and build, exercises PostgreSQL and Redis integration, and builds and scans the
production backend images.

`.github/workflows/actions-smoke.yml` is a manual runner health check.

## VM Deployment Pipeline

GitHub Actions deploys the staging VM when a push lands on `staging` with `[deploy staging]` or
`[deploy]` in the head commit message. The workflow can also be run manually with
`workflow_dispatch`, which always targets staging.

Add these repository or environment secrets:

```text
VM_SSH_PRIVATE_KEY
VM_SSH_KNOWN_HOSTS
```

`VM_SSH_KNOWN_HOSTS` is optional. Without it the workflow falls back to `ssh-keyscan`.

Optional repository or environment variables:

```text
VM_SSH_HOST
VM_SSH_PORT
VM_SSH_USER
VM_REPO_PATH
CERT_EMAIL
STAGING_PUBLIC_HOST
STAGING_API_HOST
STAGING_RESEARCH_HOST
```

The workflow defaults point to the current VM and DNS names:

```text
VM_SSH_HOST=41.220.243.19
VM_SSH_PORT=2222
VM_SSH_USER=ubuntu
VM_REPO_PATH=/srv/ksu
CERT_EMAIL=website@kisiiuniversity.ac.ke
STAGING_PUBLIC_HOST=kisiiuniversity.ac.ke
STAGING_API_HOST=api.kisiiuniversity.ac.ke
STAGING_RESEARCH_HOST=research.kisiiuniversity.ac.ke
```

The deploy job runs `scripts/deploy.sh vm`, takes a pre-deploy database backup when the local
PostgreSQL container is present, then rebuilds and restarts the Compose services. If the VM has
`.deploy/docker-compose.external-data.yml`, the deploy script includes it automatically so external
database, Redis, and upload storage wiring is preserved.

`scripts/deploy.sh` also supports `local`, `vm-status`, `vm-logs`, `vm-backup`, and `cloud`
subcommands. Run `scripts/deploy.sh` with no arguments for the full option list.

## Repository Hygiene

The repository should not track:

- Real environment files or credentials
- Generated caches such as `__pycache__`, `.next`, `.turbo`, and `node_modules`
- Runtime logs, uploads, local databases, and temporary files
- Local design folders, generated documentation, and private agent instruction files

If sensitive values were ever committed, rotate them. Removing a file from the current tree does not
remove it from Git history.
