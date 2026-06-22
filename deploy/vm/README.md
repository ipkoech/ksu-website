# VM Deployment Runbook

This path deploys the `dev` branch from GitHub onto an Ubuntu server over SSH and runs the whole platform with Docker Compose.

## DNS

Point these records to the VM public IP:

```text
A  dev           YOUR_PUBLIC_IP
A  dev.research  YOUR_PUBLIC_IP
A  api.dev       YOUR_PUBLIC_IP
```

## Backend Routing

Public requests enter the VM through the `edge` Nginx container:

```text
http://dev.kisiiuniversity.ac.ke          -> public frontend
http://dev.kisiiuniversity.ac.ke/admin    -> admin frontend
http://dev.kisiiuniversity.ac.ke/library  -> library frontend
http://dev.research.kisiiuniversity.ac.ke -> research frontend
http://api.dev.kisiiuniversity.ac.ke      -> API gateway
```

The API gateway then routes backend paths internally:

```text
/api/v1/...                     -> main API
/api/v1/research...             -> research API
/api/v1/publications...         -> research API
/api/v1/library...              -> library API
/api/v1/my/library...           -> library API
```

Service-to-service traffic stays inside Docker Compose:

```text
main     -> http://research:8001
main     -> http://library:8002
research -> http://main:8000
library  -> http://main:8000
```

## First Server Setup

The deploy script can install Git, Docker, and the Compose plugin on Ubuntu/Debian with `--bootstrap`.

The server must be reachable by SSH:

```bash
ssh ubuntu@YOUR_PUBLIC_IP
```

## Required Env Files

After the repo is cloned to `/srv/ksu`, create these files on the VM:

```text
/srv/ksu/services/main/.env
/srv/ksu/services/research/.env
/srv/ksu/services/library/.env
```

Use these templates:

```text
deploy/vm/dev/main.env.example
deploy/vm/dev/research.env.example
deploy/vm/dev/library.env.example
```

Replace every `REPLACE_*` value before deployment. Use the same `POSTGRES_PASSWORD`, `JWT_SECRET_KEY`, and `INTERNAL_API_KEY` values consistently across services where applicable.

## Deploy Dev

From your local checkout:

```bash
scripts/deploy.sh vm \
  --host ubuntu@YOUR_PUBLIC_IP \
  --env dev \
  --path /srv/ksu \
  --bootstrap
```

To issue HTTPS certificates during deployment:

```bash
scripts/deploy.sh vm \
  --host ubuntu@YOUR_PUBLIC_IP \
  --env dev \
  --path /srv/ksu \
  --bootstrap \
  --https \
  --cert-email admin@kisiiuniversity.ac.ke
```

The script defaults to:

```text
branch:        dev
repo:          local origin URL
public host:   dev.kisiiuniversity.ac.ke
research host: dev.research.kisiiuniversity.ac.ke
api host:      api.dev.kisiiuniversity.ac.ke
```

## HTTPS and Nginx

When `--https` is used:

1. Docker's edge Nginx binds to `127.0.0.1:8080`.
2. Host Nginx listens on public ports `80` and `443`.
3. Certbot issues one Let's Encrypt certificate covering:

```text
dev.kisiiuniversity.ac.ke
dev.research.kisiiuniversity.ac.ke
api.dev.kisiiuniversity.ac.ke
```

4. Host Nginx forwards all three domains to Docker edge Nginx.

Open these firewall ports before running HTTPS:

```text
22/tcp   SSH
80/tcp   HTTP challenge and redirect
443/tcp  HTTPS
```

DNS must point to the VM before Certbot can issue certificates. If DNS has not propagated, run the deploy without `--https` first, then rerun with `--https --cert-email ...` after DNS resolves.

## Database Backup

VM deploy creates a compressed Postgres backup before updating containers:

```text
/srv/ksu/backups/dev/ksu-dev-YYYYMMDDTHHMMSSZ.sql.gz
```

Backup only:

```bash
scripts/deploy.sh vm-backup \
  --host ubuntu@YOUR_PUBLIC_IP \
  --env dev \
  --path /srv/ksu
```

## Useful Checks

```bash
curl -I http://dev.kisiiuniversity.ac.ke
curl -I http://dev.kisiiuniversity.ac.ke/admin/
curl -I http://dev.kisiiuniversity.ac.ke/library/
curl -I http://dev.research.kisiiuniversity.ac.ke
curl http://api.dev.kisiiuniversity.ac.ke/health
```

After HTTPS:

```bash
curl -I https://dev.kisiiuniversity.ac.ke
curl -I https://dev.kisiiuniversity.ac.ke/admin/
curl -I https://dev.kisiiuniversity.ac.ke/library/
curl -I https://dev.research.kisiiuniversity.ac.ke
curl https://api.dev.kisiiuniversity.ac.ke/health
```
