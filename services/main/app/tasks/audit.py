"""Durable Main audit capture with bounded worker transfer and legacy delivery."""

from __future__ import annotations

from time import perf_counter

from ksu_common.audit import build_audit_tasks
from ksu_common.audit_outbox import capture_audit, drain_audit_batch, has_retained_audit_failure, oldest_pending_audit_age
from ksu_common.audit_outbox import limit_audit_transaction
from ksu_common.task_queue import run_worker_async

from ..core.database import AsyncSessionLocal
from ..models import AuditLog, audit_outbox
from .celery_app import celery_app

persist_audit, _legacy_dispatch_audit = build_audit_tasks(
    celery_app,
    AsyncSessionLocal,
    task_name="main.audit.persist",
    audit_model=AuditLog,
)


async def capture_request_audit(session, payload: dict) -> None:
    await capture_audit(session, audit_outbox, payload)


async def dispatch_audit(payload: dict) -> None:
    """Capture failures/no-session requests in an independent short transaction.

    Failed business transactions have already rolled back. Never enqueue these
    events only in the broker or retry them as indexed audit-log writes inline.
    The existing periodic drainer owns eventual audit-log persistence.
    """
    async with AsyncSessionLocal.begin() as session:
        await capture_request_audit(session, payload)


async def _drain_pending() -> int:
    started = perf_counter()
    outcome = "failed"
    metrics = celery_app._ksu_metrics
    try:
        async with AsyncSessionLocal.begin() as session:
            owns_drain = await limit_audit_transaction(session, owner_key="main.audit.drain")
            transferred = await drain_audit_batch(session, audit_outbox, AuditLog) if owns_drain else 0
        # A count before context exit would report success on commit failure.
        if not owns_drain:
            outcome = "overlap_skipped"
            return 0
        outcome = "transferred" if transferred else "no_transfer"
        metrics.increment("audit.transferred", transferred, tags={"service": "main"})
        return transferred
    finally:
        tags = {"service": "main", "outcome": outcome}
        metrics.increment("audit.drain", tags=tags)
        metrics.observe_latency("audit.drain.duration", (perf_counter() - started) * 1000, tags=tags)


@celery_app.task(name="main.audit.drain", ignore_result=True, soft_time_limit=30, time_limit=45)
def drain_pending() -> int:
    # A failed transaction leaves source rows intact. The next periodic poll
    # recovers without multiplying retries or requiring a request-side wakeup.
    return run_worker_async(_drain_pending())


async def _observe_pending() -> None:
    import time

    async with AsyncSessionLocal() as session:
        await limit_audit_transaction(session)
        age = await oldest_pending_audit_age(session, audit_outbox)
        retained = await has_retained_audit_failure(session, audit_outbox)
    metrics = celery_app._ksu_metrics
    metrics.gauge("audit.pending_age", age, tags={"service": "main"})
    metrics.gauge("audit.retained_failure", int(retained), tags={"service": "main"})
    metrics.gauge("audit.observed_at", time.time(), tags={"service": "main"})


@celery_app.task(name="main.audit.observe", ignore_result=True, soft_time_limit=10, time_limit=15)
def observe_pending() -> None:
    run_worker_async(_observe_pending())
