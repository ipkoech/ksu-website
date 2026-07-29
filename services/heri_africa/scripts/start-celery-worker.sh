#!/usr/bin/env bash
set -euo pipefail

exec celery -A app.tasks.celery_app.celery_app worker --loglevel="${CELERY_LOG_LEVEL:-INFO}"
