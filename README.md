# KSU Platform

KSU Platform is a multi-portal university web platform. It contains the public website, admin portal, research portal, library portal, shared frontend packages, and Python backend services.

## Repository Layout

```text
frontend/              Next.js apps and shared frontend packages
frontend/apps/web      Public website
frontend/apps/admin    Administration portal
frontend/apps/research Research portal
frontend/apps/library  Library portal
frontend/packages      Shared UI, auth, and API client packages
services/              FastAPI backend services
services/main          Main institutional API
services/research      Research API
services/library       Library API
gateway/               Local API gateway configuration
scripts/               Repository automation and utility scripts
contracts/             Generated API contracts
deploy/                Deployment templates and local runbooks
```

Local design notes, generated docs, runtime logs, environment files, caches, and agent instructions are intentionally ignored unless explicitly requested.

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
```

Replace every `REPLACE_*` value with local development values. Do not commit real `.env` files, credentials, uploads, logs, local databases, or generated caches.

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
```

The web and admin scripts pin ports to `3000` and `3001`. The research and library scripts use Next.js defaults when run directly; the Docker Compose stack pins frontend ports as follows:

```text
web      3000
admin    3001
research 3002
library  3003
```

Check frontend quality:

```bash
cd frontend
pnpm lint
pnpm typecheck
```

## Backend And Local Stack

Run the local Docker Compose stack from the repository root:

```bash
docker compose up --build
```

Core local services:

```text
gateway  http://localhost:8080
main     http://localhost:8000
research http://localhost:8001
library  http://localhost:8002
```

The local stack uses PostgreSQL, Redis, the API gateway, backend services, workers, and frontend apps defined in `docker-compose.yml`.

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

## VM Deployment Pipeline

GitHub Actions can deploy the VM when a push lands on an environment branch with
`[deploy]` or the matching environment marker in the head commit message:

```text
dev branch        [deploy dev]
staging branch    [deploy staging]
production branch [deploy production]
```

The workflow can also be run manually from GitHub Actions with `workflow_dispatch`.

Create GitHub environments named `dev`, `staging`, and `production`. Add this
environment or repository secret:

```text
VM_SSH_PRIVATE_KEY
```

Optional environment or repository variables:

```text
VM_SSH_HOST
VM_SSH_PORT
VM_SSH_USER
VM_REPO_PATH
CERT_EMAIL
DEV_PUBLIC_HOST
DEV_API_HOST
DEV_RESEARCH_HOST
STAGING_PUBLIC_HOST
STAGING_API_HOST
STAGING_RESEARCH_HOST
PRODUCTION_PUBLIC_HOST
PRODUCTION_API_HOST
PRODUCTION_RESEARCH_HOST
```

The dev defaults point to the current VM and DNS names:

```text
VM_SSH_HOST=41.220.243.19
VM_SSH_PORT=2222
VM_SSH_USER=ubuntu
VM_REPO_PATH=/srv/ksu
CERT_EMAIL=website@kisiiuniversity.ac.ke
DEV_PUBLIC_HOST=dev.kisiiuniversity.ac.ke
DEV_API_HOST=api.dev.kisiiuniversity.ac.ke
DEV_RESEARCH_HOST=dev.research.kisiiuniversity.ac.ke
```

The deploy job runs `scripts/deploy.sh vm`, takes a pre-deploy database backup
when the local PostgreSQL container is present, then rebuilds and restarts the
Compose services. If the VM has `.deploy/docker-compose.external-data.yml`, the
deploy script includes it automatically so external database, Redis, and upload
storage wiring is preserved.

## Repository Hygiene

The repository should not track:

- Real environment files or credentials
- Generated caches such as `__pycache__`, `.next`, `.turbo`, and `node_modules`
- Runtime logs, uploads, local databases, and temporary files
- Local design folders, generated documentation, and private agent instruction files

If sensitive values were ever committed, rotate them. Removing a file from the current tree does not remove it from Git history.
