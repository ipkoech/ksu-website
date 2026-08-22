#!/usr/bin/env bash
set -Eeuo pipefail

: "${BACKUP_FILE:?BACKUP_FILE is required}"
: "${RECOVERY_DB:?RECOVERY_DB is required}"
: "${RECOVERY_USER:?RECOVERY_USER is required}"

drill_started_epoch="$(date +%s)"
drill_started_utc="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

BACKUP_FILE="${BACKUP_FILE}" \
POSTGRES_CONTAINER="${RECOVERY_CONTAINER:-}" \
POSTGRES_HOST="${RECOVERY_HOST:-127.0.0.1}" \
POSTGRES_PORT="${RECOVERY_PORT:-5432}" \
POSTGRES_PASSWORD="${RECOVERY_PASSWORD:-}" \
POSTGRES_DB="${RECOVERY_DB}" \
POSTGRES_USER="${RECOVERY_USER}" \
ALLOW_DESTRUCTIVE_RESTORE=yes \
scripts/restore_database.sh

POSTGRES_DB="${RECOVERY_DB}" \
DATABASE_ADMIN_USER="${RECOVERY_USER}" \
DATABASE_ADMIN_PASSWORD="${RECOVERY_PASSWORD:-}" \
DATABASE_HOST="${RECOVERY_HOST:-127.0.0.1}" \
DATABASE_PORT="${RECOVERY_PORT:-5432}" \
MAIN_DB_PASSWORD="${MAIN_DB_PASSWORD:?MAIN_DB_PASSWORD is required}" \
RESEARCH_DB_PASSWORD="${RESEARCH_DB_PASSWORD:?RESEARCH_DB_PASSWORD is required}" \
LIBRARY_DB_PASSWORD="${LIBRARY_DB_PASSWORD:?LIBRARY_DB_PASSWORD is required}" \
HERI_DB_PASSWORD="${HERI_DB_PASSWORD:?HERI_DB_PASSWORD is required}" \
scripts/init-database-ownership.sh >/dev/null

DATABASE_ADMIN_URL="${RECOVERY_ADMIN_URL:?RECOVERY_ADMIN_URL is required}" scripts/verify_database_recovery.py
DATABASE_ADMIN_URL="${RECOVERY_ADMIN_URL}" scripts/verify_database_ownership.py
drill_finished_epoch="$(date +%s)"
drill_finished_utc="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
drill_duration_seconds="$((drill_finished_epoch - drill_started_epoch))"
backup_timestamp="$(awk -F= '$1 == "timestamp" {print $2}' "${BACKUP_FILE}.metadata")"
backup_size_bytes="$(awk -F= '$1 == "size_bytes" {print $2}' "${BACKUP_FILE}.metadata")"

if [[ -n "${RECOVERY_REPORT_FILE:-}" ]]; then
  mkdir -p "$(dirname "${RECOVERY_REPORT_FILE}")"
  report_tmp="$(mktemp "$(dirname "${RECOVERY_REPORT_FILE}")/.recovery-report.XXXXXX")"
  {
    printf 'result=passed\n'
    printf 'backup_file=%s\n' "${BACKUP_FILE}"
    printf 'backup_timestamp=%s\n' "${backup_timestamp}"
    printf 'backup_size_bytes=%s\n' "${backup_size_bytes}"
    printf 'recovery_database=%s\n' "${RECOVERY_DB}"
    printf 'started_at_utc=%s\n' "${drill_started_utc}"
    printf 'finished_at_utc=%s\n' "${drill_finished_utc}"
    printf 'recovery_time_seconds=%s\n' "${drill_duration_seconds}"
    printf 'operator=%s\n' "${RECOVERY_OPERATOR:-${USER:-unknown}}"
  } >"${report_tmp}"
  mv "${report_tmp}" "${RECOVERY_REPORT_FILE}"
  chmod 600 "${RECOVERY_REPORT_FILE}"
fi

echo "restore drill completed in ${drill_duration_seconds}s"
