"""Celery application for the library service."""

from __future__ import annotations

from celery import Celery
from celery.schedules import crontab

from ..core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "ksu_library",
    broker=settings.CELERY_BROKER_URL or settings.REDIS_URL,
    backend=settings.CELERY_RESULT_BACKEND or settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Africa/Nairobi",
    enable_utc=True,
    task_track_started=True,
    broker_connection_retry_on_startup=True,
    task_default_queue="library.default",
    task_routes={
        "library.maintenance.expire_reservations": {"queue": "library.maintenance"},
        "library.maintenance.mark_overdue_loans": {"queue": "library.maintenance"},
    },
    beat_schedule={
        "expire-library-reservations-every-15-minutes": {
            "task": "library.maintenance.expire_reservations",
            "schedule": crontab(minute="*/15"),
        },
        "mark-library-overdue-loans-hourly": {
            "task": "library.maintenance.mark_overdue_loans",
            "schedule": crontab(minute=0),
        },
    },
)

celery_app.autodiscover_tasks(["app.tasks"])
