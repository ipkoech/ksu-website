#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "${ROOT}"
for service in main research library; do
  migration_dir="services/${service}/migrations/versions"
  [[ -d "${migration_dir}" ]] || { echo "error: missing ${migration_dir}" >&2; exit 1; }
  python3 -m compileall -q "${migration_dir}"
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
