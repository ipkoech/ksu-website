from __future__ import annotations

from celery import Celery

from ..core.config import get_settings

settings = get_settings()
celery_app = Celery("heri_africa", broker=settings.CELERY_BROKER_URL or settings.REDIS_URL)
celery_app.conf.result_backend = settings.CELERY_RESULT_BACKEND or settings.REDIS_URL
