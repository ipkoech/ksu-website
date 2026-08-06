#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "${ROOT}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
if [[ "${PYTHON_BIN}" == */* && "${PYTHON_BIN}" != /* ]]; then
  PYTHON_BIN="${ROOT}/${PYTHON_BIN}"
fi
services=(main research library heri_africa)
if [[ "$#" -gt 0 ]]; then
  services=("$@")
fi

for service in "${services[@]}"; do
  migration_dir="services/${service}/migrations/versions"
  [[ -d "${migration_dir}" ]] || { echo "error: missing ${migration_dir}" >&2; exit 1; }
  "${PYTHON_BIN}" -m compileall -q "${migration_dir}"
  heads="$(cd "services/${service}" && "${PYTHON_BIN}" -m alembic heads)"
  # Delegates to ksu_common.migration_check.require_single_head so the shared
  # rule is enforced here rather than reimplemented. It also rejects diagnostic
  # output on stdout, which a bare marker count would silently accept.
  if ! printf '%s\n' "${heads}" | "${PYTHON_BIN}" -c '
import sys
from ksu_common.migration_check import MigrationCheckError, require_single_head

try:
    require_single_head(sys.stdin.read())
except MigrationCheckError as error:
    sys.exit(str(error))
'; then
    echo "error: ${service} migration history must have exactly one head" >&2
    printf '%s\n' "${heads}" >&2
    exit 1
  fi

  scan_mode="${MIGRATION_SCAN_MODE:-changed}"
  if [[ "${CI:-}" == "true" && -z "${MIGRATION_SCAN_MODE:-}" ]]; then
    scan_mode="committed"
  fi
  migration_files=()
  case "${scan_mode}" in
    all)
      mapfile -t migration_files < <(git ls-files -- "${migration_dir}" | sed '/^$/d' | sort -u)
      ;;
    committed)
      commit_range="${MIGRATION_COMMIT_RANGE:-HEAD^..HEAD}"
      range_start="${commit_range%%..*}"
      if [[ "${range_start}" == "${commit_range}" ]] || ! git rev-parse --verify "${range_start}^{commit}" >/dev/null 2>&1; then
        echo "error: committed migration scan requires a resolvable commit range: ${commit_range}" >&2
        exit 1
      fi
      mapfile -t migration_files < <(
        git diff --name-only --diff-filter=AM "${commit_range}" -- "${migration_dir}" \
          | sed '/^$/d' | sort -u
      )
      ;;
    changed)
      mapfile -t migration_files < <(
        {
          git diff --name-only --diff-filter=AM HEAD -- "${migration_dir}" || true
          git ls-files --others --exclude-standard -- "${migration_dir}" || true
        } | sed '/^$/d' | sort -u
      )
      ;;
    *)
      echo "error: unsupported MIGRATION_SCAN_MODE=${scan_mode}; use changed, committed, or all" >&2
      exit 1
      ;;
  esac
  ((${#migration_files[@]})) || continue
  upgrade_source="$(mktemp)"
  trap 'rm -f "${upgrade_source}"' EXIT
  for migration in "${migration_files[@]}"; do
    [[ -f "${migration}" ]] || continue
    awk '/^def upgrade/{in_upgrade=1} /^def downgrade/{in_upgrade=0} in_upgrade' "${migration}" >> "${upgrade_source}"
  done
  # grep, not rg: ripgrep is not installed on the CI runner, and its absence
  # exits 127 which reads here as "no destructive statements found".
  if grep -n -iE 'drop_table|drop_column|op\.execute[[:space:]]*\(.*\b(drop|truncate)\b' "${upgrade_source}"; then
    if [[ "${MIGRATION_DESTRUCTIVE_REVIEW:-}" != approved ]]; then
      echo "error: destructive migration detected in ${service}; set MIGRATION_DESTRUCTIVE_REVIEW=approved only after review" >&2
      exit 1
    fi
  fi
done
echo "migration source validation passed"
