#!/usr/bin/env sh
set -eu

exec celery -A app.tasks.celery_app.celery_app worker --loglevel="${CELERY_LOG_LEVEL:-info}" \
  --concurrency="${CELERY_CONCURRENCY:-1}" \
  --queues="${CELERY_QUEUES:-research.default,research.exports,research.donations}"
