#!/usr/bin/env bash
set -Eeuo pipefail

: "${BACKUP_FILE:?BACKUP_FILE is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${ALLOW_DESTRUCTIVE_RESTORE:?Set ALLOW_DESTRUCTIVE_RESTORE=yes for the explicit restore target}"
[[ "${ALLOW_DESTRUCTIVE_RESTORE}" == "yes" ]] || { echo "error: ALLOW_DESTRUCTIVE_RESTORE must equal yes" >&2; exit 1; }
[[ -r "${BACKUP_FILE}" ]] || { echo "error: backup file is not readable" >&2; exit 1; }
[[ "${BACKUP_FILE}" == *.dump ]] || { echo "error: backup must be a PostgreSQL custom-format .dump file" >&2; exit 1; }

metadata="${BACKUP_METADATA_FILE:-${BACKUP_FILE}.metadata}"
[[ -r "${metadata}" ]] || { echo "error: backup metadata is missing" >&2; exit 1; }
expected_sha="$(awk -F= '$1 == "sha256" {print $2}' "${metadata}")"
[[ "${expected_sha}" =~ ^[0-9a-f]{64}$ ]] || { echo "error: backup metadata checksum is invalid" >&2; exit 1; }
actual_sha="$(sha256sum "${BACKUP_FILE}" | awk '{print $1}')"
[[ "${actual_sha}" == "${expected_sha}" ]] || { echo "error: backup checksum mismatch" >&2; exit 1; }

table_count_sql="SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind IN ('r','p') AND n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname !~ '^pg_toast'"
if [[ -n "${POSTGRES_CONTAINER:-}" ]]; then
  existing_tables="$(docker exec "${POSTGRES_CONTAINER}" psql -XAt -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "${table_count_sql}")"
else
  existing_tables="$(PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -XAt -h "${POSTGRES_HOST:-127.0.0.1}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "${table_count_sql}")"
fi
if (( existing_tables > 0 )) && [[ "${RESTORE_REQUIRE_EMPTY:-true}" != "false" ]]; then
  echo "error: restore target contains ${existing_tables} tables; use a disposable empty database or set RESTORE_REQUIRE_EMPTY=false explicitly" >&2
  exit 1
fi

restore_args=(--exit-on-error --clean --if-exists --no-owner --no-privileges --dbname "${POSTGRES_DB}" --username "${POSTGRES_USER}")
if [[ -n "${POSTGRES_CONTAINER:-}" ]]; then
  docker exec -i "${POSTGRES_CONTAINER}" pg_restore --list <"${BACKUP_FILE}" >/dev/null
  docker exec -i "${POSTGRES_CONTAINER}" pg_restore "${restore_args[@]}" <"${BACKUP_FILE}"
else
  pg_restore --list "${BACKUP_FILE}" >/dev/null
  PGPASSWORD="${POSTGRES_PASSWORD:-}" pg_restore "${restore_args[@]}" --host "${POSTGRES_HOST:-127.0.0.1}" --port "${POSTGRES_PORT:-5432}" "${BACKUP_FILE}"
fi

echo "restore completed; run ownership and recovery verification before serving traffic"
