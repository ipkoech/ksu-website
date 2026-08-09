#!/usr/bin/env bash
set -Eeuo pipefail

: "${BACKUP_DIR:?BACKUP_DIR is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"

mkdir -p "${BACKUP_DIR}"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
output="${BACKUP_DIR}/${BACKUP_NAME:-ksu-${APP_ENV:-unknown}-${stamp}.dump}"
metadata="${output}.metadata"
tmp="$(mktemp "${BACKUP_DIR}/.backup.XXXXXX")"
metadata_tmp="$(mktemp "${BACKUP_DIR}/.metadata.XXXXXX")"
offsite_tmp=""
offsite_metadata_tmp=""
trap 'rm -f "${tmp}" "${metadata_tmp}" ${offsite_tmp:+"${offsite_tmp}"} ${offsite_metadata_tmp:+"${offsite_metadata_tmp}"}' EXIT

pg_dump_command=(pg_dump --format=custom --compress=9 --no-owner --no-privileges --dbname "${POSTGRES_DB}" --username "${POSTGRES_USER}")
if [[ -n "${POSTGRES_CONTAINER:-}" ]]; then
  docker exec "${POSTGRES_CONTAINER}" "${pg_dump_command[@]}" >"${tmp}"
  docker exec -i "${POSTGRES_CONTAINER}" pg_restore --list <"${tmp}" >/dev/null
  postgres_version="$(docker exec "${POSTGRES_CONTAINER}" psql -XAt -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c 'SHOW server_version')"
else
  PGPASSWORD="${POSTGRES_PASSWORD:-}" "${pg_dump_command[@]}" --host "${POSTGRES_HOST:-127.0.0.1}" --port "${POSTGRES_PORT:-5432}" >"${tmp}"
  pg_restore --list "${tmp}" >/dev/null
  postgres_version="$(PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -XAt -h "${POSTGRES_HOST:-127.0.0.1}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c 'SHOW server_version')"
fi

test -s "${tmp}"
checksum="$(sha256sum "${tmp}" | awk '{print $1}')"
size_bytes="$(wc -c <"${tmp}" | tr -d ' ')"
{
  printf 'format=postgres-custom-v1\n'
  printf 'timestamp=%s\n' "${stamp}"
  printf 'environment=%s\n' "${APP_ENV:-unknown}"
  printf 'database=%s\n' "${POSTGRES_DB}"
  printf 'postgres_version=%s\n' "${postgres_version}"
  printf 'size_bytes=%s\n' "${size_bytes}"
  printf 'sha256=%s\n' "${checksum}"
} >"${metadata_tmp}"

mv "${tmp}" "${output}"
mv "${metadata_tmp}" "${metadata}"
chmod 600 "${output}" "${metadata}"

if [[ -n "${BACKUP_OFFSITE_DIR:-}" ]]; then
  mkdir -p "${BACKUP_OFFSITE_DIR}"
  offsite_tmp="$(mktemp "${BACKUP_OFFSITE_DIR}/.backup.XXXXXX")"
  offsite_metadata_tmp="$(mktemp "${BACKUP_OFFSITE_DIR}/.metadata.XXXXXX")"
  cp "${output}" "${offsite_tmp}"
  cp "${metadata}" "${offsite_metadata_tmp}"
  mv "${offsite_tmp}" "${BACKUP_OFFSITE_DIR}/$(basename "${output}")"
  mv "${offsite_metadata_tmp}" "${BACKUP_OFFSITE_DIR}/$(basename "${metadata}")"
  chmod 600 "${BACKUP_OFFSITE_DIR}/$(basename "${output}")" "${BACKUP_OFFSITE_DIR}/$(basename "${metadata}")"
elif [[ "${REQUIRE_OFFSITE_BACKUP:-false}" == "true" ]]; then
  echo "error: off-site backup is required but BACKUP_OFFSITE_DIR is unset" >&2
  exit 1
fi

retention_days="${BACKUP_RETENTION_DAYS:-14}"
if [[ "${retention_days}" =~ ^[0-9]+$ ]] && (( retention_days > 0 )); then
  find "${BACKUP_DIR}" -maxdepth 1 -type f \( -name 'ksu-*.dump' -o -name 'ksu-*.dump.metadata' \) -mtime "+${retention_days}" -delete
fi

printf 'backup created: %s\n' "${output}"
