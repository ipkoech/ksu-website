"""Celery application for the research service."""

from __future__ import annotations

from ksu_common.task_queue import TaskQueueConfig, create_celery_app

from ..core.config import get_settings
from ..core.database import database

settings = get_settings()

celery_app = create_celery_app(
    TaskQueueConfig(
        name="ksu_research",
        broker_url=settings.CELERY_BROKER_URL or settings.REDIS_URL,
        result_backend=settings.CELERY_RESULT_BACKEND or settings.REDIS_URL,
        default_queue="research.default",
        task_routes={
            "research.exports.generate": {"queue": "research.exports"},
            "research.donations.*": {"queue": "research.donations"},
            "research.audit.persist": {"queue": "research.audit"},
        },
        imports=("app.tasks.audit", "app.tasks.exports", "app.tasks.donations"),
        shutdown_hooks=(database.engine.dispose,),
    ),
    task_packages=("app.tasks",),
)
