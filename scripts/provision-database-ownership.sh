#!/usr/bin/env bash

set -Eeuo pipefail

# Run this before switching an existing database to service-owned credentials.
# It deliberately requires a separately supplied privileged administrator and
# can therefore be used against an existing volume, unlike initdb hooks.
: "${DATABASE_ADMIN_USER:?DATABASE_ADMIN_USER is required}"
: "${DATABASE_ADMIN_PASSWORD:?DATABASE_ADMIN_PASSWORD is required}"
: "${DATABASE_HOST:?DATABASE_HOST is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
export DATABASE_ADMIN_USER DATABASE_ADMIN_PASSWORD DATABASE_HOST POSTGRES_DB

"$SCRIPT_DIR/init-database-ownership.sh"

echo "Existing database ownership provisioning completed. Verify roles and schemas before deploying APIs."
