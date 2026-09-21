#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
if [ -n "${PROMETHEUS_MULTIPROC_DIR:-}" ]; then
  mkdir -p "$PROMETHEUS_MULTIPROC_DIR"
  find "$PROMETHEUS_MULTIPROC_DIR" -mindepth 1 -maxdepth 1 -delete
fi
exec celery -A app.tasks.celery_app.celery_app worker --loglevel="${CELERY_LOG_LEVEL:-info}" \
  --concurrency="${CELERY_CONCURRENCY:-1}" \
  --queues="${CELERY_QUEUES:-main.default,main.email,main.notifications,main.maintenance,main.social,main.imports,main.media,main.events}"
