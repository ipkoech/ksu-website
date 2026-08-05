#!/usr/bin/env bash
set -euo pipefail

: "${BACKUP_FILE:?BACKUP_FILE is required}"
: "${POSTGRES_CONTAINER:?POSTGRES_CONTAINER is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"
[[ -r "${BACKUP_FILE}" ]] || { echo "error: backup file is not readable" >&2; exit 1; }
case "${BACKUP_FILE}" in
  *.sql.gz) gzip -t "${BACKUP_FILE}" ;;
  *) echo "error: backup must be a .sql.gz file" >&2; exit 1 ;;
esac
gzip -dc "${BACKUP_FILE}" | docker exec -i "${POSTGRES_CONTAINER}" psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null
echo "restore completed"
