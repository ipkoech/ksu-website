#!/usr/bin/env bash
set -Eeuo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}"

env_file="${ENV_FILE:-.env}"
if [[ -r "${env_file}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${env_file}"
  set +a
fi

: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${MAIN_DB_PASSWORD:?MAIN_DB_PASSWORD is required}"
: "${RESEARCH_DB_PASSWORD:?RESEARCH_DB_PASSWORD is required}"
: "${LIBRARY_DB_PASSWORD:?LIBRARY_DB_PASSWORD is required}"
: "${HERI_DB_PASSWORD:?HERI_DB_PASSWORD is required}"

source_container="$(docker compose ps -q postgres)"
[[ -n "${source_container}" ]] || { echo "error: Compose PostgreSQL is not running" >&2; exit 1; }

drill_dir="${RECOVERY_DRILL_DIR:-${repo_root}/backups/restore-drills}"
mkdir -p "${drill_dir}"

BACKUP_DIR="${drill_dir}" \
APP_ENV="${APP_ENV:-development}" \
POSTGRES_CONTAINER="${source_container}" \
POSTGRES_DB="${POSTGRES_DB}" \
POSTGRES_USER="${POSTGRES_USER}" \
scripts/backup_database.sh

backup_file="$(find "${drill_dir}" -maxdepth 1 -type f -name '*.dump' -printf '%T@ %p\n' | sort -nr | head -1 | cut -d' ' -f2-)"
[[ -n "${backup_file}" ]] || { echo "error: backup drill did not produce a dump" >&2; exit 1; }

recovery_password="$(openssl rand -hex 24)"
recovery_db="ksu_restore_drill"
recovery_container="ksu-restore-drill-$RANDOM-$$"
cleanup() {
  docker rm -f "${recovery_container}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run -d --name "${recovery_container}" \
  -e POSTGRES_DB="${recovery_db}" \
  -e POSTGRES_PASSWORD="${recovery_password}" \
  -p 127.0.0.1::5432 \
  postgres:16-alpine >/dev/null

for _ in $(seq 1 60); do
  if docker exec "${recovery_container}" pg_isready -U postgres -d "${recovery_db}" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker exec "${recovery_container}" pg_isready -U postgres -d "${recovery_db}" >/dev/null

recovery_port="$(docker port "${recovery_container}" 5432/tcp | awk -F: 'NR == 1 {print $NF}')"
report_file="${RECOVERY_REPORT_FILE:-${drill_dir}/recovery-$(date -u +%Y%m%dT%H%M%SZ).report}"

BACKUP_FILE="${backup_file}" \
RECOVERY_CONTAINER="${recovery_container}" \
RECOVERY_DB="${recovery_db}" \
RECOVERY_USER=postgres \
RECOVERY_PASSWORD="${recovery_password}" \
RECOVERY_HOST=127.0.0.1 \
RECOVERY_PORT="${recovery_port}" \
RECOVERY_ADMIN_URL="postgresql://postgres:${recovery_password}@127.0.0.1:${recovery_port}/${recovery_db}" \
RECOVERY_REPORT_FILE="${report_file}" \
RECOVERY_OPERATOR="${RECOVERY_OPERATOR:-${USER:-unknown}}" \
MAIN_DB_PASSWORD="${MAIN_DB_PASSWORD}" \
RESEARCH_DB_PASSWORD="${RESEARCH_DB_PASSWORD}" \
LIBRARY_DB_PASSWORD="${LIBRARY_DB_PASSWORD}" \
HERI_DB_PASSWORD="${HERI_DB_PASSWORD}" \
scripts/test_database_restore.sh

echo "recovery evidence: ${report_file}"
