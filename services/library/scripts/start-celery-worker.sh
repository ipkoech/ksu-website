#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
exec celery -A app.tasks.celery_app.celery_app worker --loglevel="${CELERY_LOG_LEVEL:-info}" \
  --concurrency="${CELERY_CONCURRENCY:-1}" \
  --queues="${CELERY_QUEUES:-library.default,library.maintenance}"
