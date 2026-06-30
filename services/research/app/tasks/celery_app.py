"""Celery application for the research service."""

from __future__ import annotations

from celery import Celery

from ..core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "ksu_research",
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
    task_default_queue="research.default",
    task_routes={
        "research.exports.generate": {"queue": "research.exports"},
        "research.donations.*": {"queue": "research.donations"},
    },
)

celery_app.autodiscover_tasks(["app.tasks"])
celery_app.conf.imports = ("app.tasks.exports", "app.tasks.donations")
