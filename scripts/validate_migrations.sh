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
  head_count="$(printf '%s\n' "${heads}" | rg -c '\(head\)' || true)"
  if [[ "${head_count}" -ne 1 ]]; then
    echo "error: ${service} migration history must have exactly one head" >&2
    printf '%s\n' "${heads}" >&2
    exit 1
  fi
  changed_migrations="$(git diff --name-only --diff-filter=AM HEAD -- "${migration_dir}" || true)"
  changed_migrations+="$(git ls-files --others --exclude-standard -- "${migration_dir}" || true)"
  [[ -n "${changed_migrations}" ]] || continue
  upgrade_source="$(mktemp)"
  trap 'rm -f "${upgrade_source}"' EXIT
  while IFS= read -r migration; do
    [[ -f "${migration}" ]] || continue
    awk '/^def upgrade/{in_upgrade=1} /^def downgrade/{in_upgrade=0} in_upgrade' "${migration}" >> "${upgrade_source}"
  done <<< "${changed_migrations}"
  if rg -n -i 'drop_table|drop_column|op\.execute\s*\(.*\b(drop|truncate)\b' "${upgrade_source}"; then
    if [[ "${MIGRATION_DESTRUCTIVE_REVIEW:-}" != approved ]]; then
      echo "error: destructive migration detected in ${service}; set MIGRATION_DESTRUCTIVE_REVIEW=approved only after review" >&2
      exit 1
    fi
  fi
done
echo "migration source validation passed"
