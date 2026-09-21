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
        task_routes={
            "heri.audit.persist": {"queue": "heri.audit"},
            "heri.audit.relay": {"queue": "heri.audit"},
            "heri.audit.observe": {"queue": "heri.audit"},
        },
        beat_schedule={
            "observe-pending-audits": {
                "task": "heri.audit.observe", "schedule": 30.0,
                "options": {"expires": 30},
            },
            "relay-pending-audits": {
                "task": "heri.audit.relay", "schedule": 5.0,
                "options": {"expires": 5},
            },
            "publish-due-social-jobs": {
                "task": "heri.publish_due_social_jobs", "schedule": 30.0,
                "options": {"expires": 30},
            },
        },
        imports=("app.tasks.audit", "app.tasks.publication"),
        shutdown_hooks=(database.engine.dispose,),
    ),
    task_packages=("app.tasks",),
)
