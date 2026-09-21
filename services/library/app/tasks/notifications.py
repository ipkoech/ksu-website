"""Drain committed notification jobs using the existing Library worker."""

from ksu_common.task_queue import run_worker_async

from ..core.database import AsyncSessionLocal
from ..services.notification_outbox import deliver_pending
from .celery_app import celery_app


@celery_app.task(name="library.notifications.deliver", ignore_result=True, soft_time_limit=35, time_limit=45)
def deliver_notifications():
    return run_worker_async(deliver_pending(AsyncSessionLocal, limit=2))
