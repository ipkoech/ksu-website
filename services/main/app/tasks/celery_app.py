"""Celery application for the main service."""

from __future__ import annotations

from celery.schedules import crontab

from ksu_common.task_queue import TaskQueueConfig, create_celery_app

from ..core.config import get_settings
from ..core.database import database
from ..helpers.email import close_email_transport

settings = get_settings()


async def _shutdown_main_resources() -> None:
    await close_email_transport()
    await database.engine.dispose()

celery_app = create_celery_app(
    TaskQueueConfig(
        name="ksu_main",
        broker_url=settings.CELERY_BROKER_URL or settings.REDIS_URL,
        result_backend=settings.CELERY_RESULT_BACKEND or settings.REDIS_URL,
        default_queue="main.default",
        task_routes={
            "main.notifications.dispatch_delivery": {"queue": "main.notifications"},
            "main.notifications.expire": {"queue": "main.maintenance"},
            "main.newsletters.send": {"queue": "main.email"},
            "main.newsletters.send_due": {"queue": "main.maintenance"},
            "main.social.queue_publish": {"queue": "main.social"},
            "main.social.publish_due": {"queue": "main.social"},
            "main.email.send_account_created": {"queue": "main.email"},
            "main.email.send_password_reset": {"queue": "main.email"},
            "main.email.send_verification": {"queue": "main.email"},
            "main.imports.commit": {"queue": "main.imports"},
            "main.media.process_upload_file": {"queue": "main.media"},
            "main.media.cleanup_expired_batches": {"queue": "main.maintenance"},
            "main.inquiries.send_reply": {"queue": "main.email"},
            "main.outbox.publish_one": {"queue": "main.events"},
            "main.outbox.publish_pending": {"queue": "main.events"},
            "main.webhooks.dispatch_event": {"queue": "main.integrations"},
            "main.webhooks.deliver": {"queue": "main.integrations"},
            "main.webhooks.dispatch_pending": {"queue": "main.integrations"},
            "main.notifications.consume_event": {"queue": "main.notifications"},
            "main.content.publish_due": {"queue": "main.maintenance"},
            "main.content.expire_due": {"queue": "main.maintenance"},
            "main.audit.persist": {"queue": "main.audit"},
            "main.audit.prune": {"queue": "main.maintenance"},
            "main.outbox.prune": {"queue": "main.maintenance"},
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
            "send-due-newsletters-every-5-minutes": {
                "task": "main.newsletters.send_due",
                "schedule": crontab(minute="*/5"),
            },
            "cleanup-expired-upload-batches-hourly": {
                "task": "main.media.cleanup_expired_batches",
                "schedule": crontab(minute=15),
            },
            "publish-due-content-every-5-minutes": {
                "task": "main.content.publish_due",
                "schedule": crontab(minute="*/5"),
            },
            "expire-due-content-every-15-minutes": {
                "task": "main.content.expire_due",
                "schedule": crontab(minute="*/15"),
            },
            "publish-pending-outbox": {
                "task": "main.outbox.publish_pending",
                "schedule": 10.0,
            },
            "dispatch-pending-webhooks": {
                "task": "main.webhooks.dispatch_pending",
                "schedule": 10.0,
            },
            "prune-audit-logs-daily": {
                "task": "main.audit.prune",
                "schedule": crontab(hour=3, minute=20),
            },
            "prune-published-outbox-events-daily": {
                "task": "main.outbox.prune",
                "schedule": crontab(hour=3, minute=40),
            },
        },
        imports=(
            "app.tasks.audit",
            "app.tasks.email",
            "app.tasks.imports",
            "app.tasks.newsletters",
            "app.tasks.content_lifecycle",
            "app.tasks.notifications",
            "app.tasks.social_posts",
            "app.tasks.media",
            "app.tasks.inquiries",
            "app.tasks.outbox",
            "app.tasks.webhooks",
            "app.tasks.retention",
        ),
        shutdown_hooks=(_shutdown_main_resources,),
    ),
    task_packages=("app.tasks",),
)
