"""Celery application for the main service."""

from __future__ import annotations

from celery import Celery
from celery.schedules import crontab

from ..core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "ksu_main",
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
    task_default_queue="main.default",
    task_routes={
        "main.notifications.dispatch_delivery": {"queue": "main.notifications"},
        "main.notifications.expire": {"queue": "main.maintenance"},
        "main.social.queue_publish": {"queue": "main.social"},
        "main.social.publish_due": {"queue": "main.social"},
        "main.email.send_account_created": {"queue": "main.email"},
        "main.email.send_password_reset": {"queue": "main.email"},
        "main.email.send_verification": {"queue": "main.email"},
    },
    beat_schedule={
        "expire-notifications-every-15-minutes": {
            "task": "main.notifications.expire",
            "schedule": crontab(minute="*/15"),
        },
        "publish-due-social-posts-every-10-minutes": {
            "task": "main.social.publish_due",
            "schedule": crontab(minute="*/10"),
        },
    },
)

celery_app.autodiscover_tasks(["app.tasks"])
celery_app.conf.imports = (
    "app.tasks.email",
    "app.tasks.notifications",
    "app.tasks.social_posts",
)
