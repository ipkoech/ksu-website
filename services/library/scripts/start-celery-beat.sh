#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
exec celery -A app.tasks.celery_app.celery_app beat --loglevel="${CELERY_LOG_LEVEL:-info}"
