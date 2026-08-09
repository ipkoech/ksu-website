"""Scheduled pruning for the two tables that otherwise grow without bound.

``audit_logs`` gains a row per audited request and ``outbox_events`` keeps every
event it has already delivered. Neither had a reaper, so both grew for the life
of the deployment: the audit table dominates database size and backup time, and
the outbox heap keeps autovacuum busy even though its partial index stays small.

Both tasks delete in bounded batches so a long-overdue first run cannot hold a
single long transaction over a hot table.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from ksu_common.models import AuditLog
from ksu_common.task_queue import run_worker_async
from sqlalchemy import delete, select

from ..core.config import get_settings
from ..core.database import AsyncSessionLocal
from ..models import OutboxEvent
from .celery_app import celery_app

logger = logging.getLogger(__name__)

settings = get_settings()

#: Rows removed per statement. Keeps each transaction short enough that the
#: delete never blocks writes on the table for long.
DELETE_BATCH_SIZE = 5_000

#: Stop after this many batches in one run so a backlog is worked off over
#: several scheduled runs instead of one unbounded transaction.
MAX_BATCHES_PER_RUN = 20


@celery_app.task(name="main.audit.prune")
def prune_audit_logs() -> int:
    return run_worker_async(_prune_audit_logs())


async def _prune_audit_logs() -> int:
    retention_days = settings.AUDIT_LOG_RETENTION_DAYS
    if retention_days <= 0:
        return 0

    cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)
    removed = 0
    async with AsyncSessionLocal() as db:
        for _ in range(MAX_BATCHES_PER_RUN):
            ids = (
                await db.execute(
                    select(AuditLog.id).where(AuditLog.happened_at < cutoff).limit(DELETE_BATCH_SIZE)
                )
            ).scalars().all()
            if not ids:
                break
            await db.execute(delete(AuditLog).where(AuditLog.id.in_(ids)))
            await db.commit()
            removed += len(ids)

    if removed:
        logger.info("pruned %d audit_logs rows older than %s", removed, cutoff.isoformat())
    return removed


@celery_app.task(name="main.outbox.prune")
def prune_outbox_events() -> int:
    return run_worker_async(_prune_outbox_events())


async def _prune_outbox_events() -> int:
    retention_days = settings.OUTBOX_RETENTION_DAYS
    if retention_days <= 0:
        return 0

    cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)
    removed = 0
    async with AsyncSessionLocal() as db:
        for _ in range(MAX_BATCHES_PER_RUN):
            # Only events already delivered. Pending, failed, and dead-lettered
            # rows are left alone so nothing unresolved is ever discarded.
            ids = (
                await db.execute(
                    select(OutboxEvent.id)
                    .where(
                        OutboxEvent.published_at.is_not(None),
                        OutboxEvent.webhooks_dispatched_at.is_not(None),
                        OutboxEvent.published_at < cutoff,
                    )
                    .limit(DELETE_BATCH_SIZE)
                )
            ).scalars().all()
            if not ids:
                break
            await db.execute(delete(OutboxEvent).where(OutboxEvent.id.in_(ids)))
            await db.commit()
            removed += len(ids)

    if removed:
        logger.info("pruned %d published outbox_events older than %s", removed, cutoff.isoformat())
    return removed
