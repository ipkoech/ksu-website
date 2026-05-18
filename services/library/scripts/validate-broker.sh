#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
python3 - <<'PY'
from app.tasks.celery_app import celery_app

with celery_app.connection_for_read() as conn:
    conn.ensure_connection(max_retries=3)
    print(f"Broker OK: {conn.as_uri(include_password=False)}")
PY
