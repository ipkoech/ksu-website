#!/usr/bin/env bash
set -euo pipefail

: "${BACKUP_FILE:?BACKUP_FILE is required}"
: "${RECOVERY_CONTAINER:?RECOVERY_CONTAINER is required}"
: "${RECOVERY_DB:?RECOVERY_DB is required}"
: "${RECOVERY_USER:?RECOVERY_USER is required}"
BACKUP_FILE="${BACKUP_FILE}" POSTGRES_CONTAINER="${RECOVERY_CONTAINER}" POSTGRES_DB="${RECOVERY_DB}" POSTGRES_USER="${RECOVERY_USER}" scripts/restore_database.sh
docker exec "${RECOVERY_CONTAINER}" psql -v ON_ERROR_STOP=1 -U "${RECOVERY_USER}" -d "${RECOVERY_DB}" -c 'SELECT 1;' >/dev/null
echo "restore smoke test completed"
