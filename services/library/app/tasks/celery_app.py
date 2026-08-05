"""Celery application for the library service."""

from __future__ import annotations

from celery.schedules import crontab

from ksu_common.task_queue import TaskQueueConfig, create_celery_app

from ..core.config import get_settings
from ..core.database import database

settings = get_settings()

celery_app = create_celery_app(
    TaskQueueConfig(
        name="ksu_library",
        broker_url=settings.CELERY_BROKER_URL or settings.REDIS_URL,
        result_backend=settings.CELERY_RESULT_BACKEND or settings.REDIS_URL,
        default_queue="library.default",
        task_routes={
            "library.maintenance.expire_reservations": {"queue": "library.maintenance"},
            "library.maintenance.mark_overdue_loans": {"queue": "library.maintenance"},
        },
        shutdown_hooks=(database.engine.dispose,),
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
    ),
    task_packages=("app.tasks",),
)
