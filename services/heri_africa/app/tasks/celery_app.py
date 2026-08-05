from __future__ import annotations

from ksu_common.task_queue import TaskQueueConfig, create_celery_app

from ..core.config import get_settings
from ..core.database import database

settings = get_settings()
celery_app = create_celery_app(
    TaskQueueConfig(
        name="heri_africa",
        broker_url=settings.CELERY_BROKER_URL or settings.REDIS_URL,
        result_backend=settings.CELERY_RESULT_BACKEND or settings.REDIS_URL,
        imports=("app.tasks.audit", "app.tasks.publication"),
        shutdown_hooks=(database.engine.dispose,),
    ),
    task_packages=("app.tasks",),
)
