#!/usr/bin/env bash
set -euo pipefail

: "${BACKUP_DIR:?BACKUP_DIR is required}"
: "${POSTGRES_CONTAINER:?POSTGRES_CONTAINER is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"

mkdir -p "${BACKUP_DIR}"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
output="${BACKUP_DIR}/${BACKUP_NAME:-ksu-${APP_ENV:-unknown}-${stamp}.sql.gz}"
metadata="${output%.sql.gz}.metadata"
tmp="$(mktemp "${BACKUP_DIR}/.backup.XXXXXX")"
trap 'rm -f "${tmp}"' EXIT

docker exec "${POSTGRES_CONTAINER}" pg_dump --no-owner --no-privileges -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" | gzip -9 > "${tmp}"
test -s "${tmp}"
mv "${tmp}" "${output}"
chmod 600 "${output}"
{
  printf 'timestamp=%s\n' "${stamp}"
  printf 'environment=%s\n' "${APP_ENV:-unknown}"
  printf 'database=%s\n' "${POSTGRES_DB}"
  printf 'schema_version=%s\n' "${SCHEMA_VERSION:-unknown}"
  printf 'sha256=%s\n' "$(sha256sum "${output}" | awk '{print $1}')"
} > "${metadata}"
chmod 600 "${metadata}"
printf 'backup created: %s\n' "${output}"
