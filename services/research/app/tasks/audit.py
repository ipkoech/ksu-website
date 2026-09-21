"""Research-owned durable audit capture and bounded forwarding to Main."""

from __future__ import annotations

from ksu_common.audit import build_audit_tasks, forward_audit_payload
from ksu_common.audit_outbox import capture_audit, has_retained_audit_failure, limit_audit_transaction
from ksu_common.audit_relay import oldest_ready_audit_age, relay_audit_batch
from time import time
from ksu_common.task_queue import run_worker_async

from ..core.config import get_settings
from ..core.database import AsyncSessionLocal
from ..models import audit_relay
from .celery_app import celery_app


async def _persist_in_main(payload: dict | list[dict]) -> None:
    settings = get_settings()
    await forward_audit_payload(
        payload, base_url=settings.MAIN_SERVICE_URL,
        api_key=settings.MAIN_SERVICE_API_KEY,
    )


persist_audit, _legacy_dispatch_audit = build_audit_tasks(
    celery_app,
    None,
    task_name="research.audit.persist",
    persist_payload=_persist_in_main,
)


async def capture_request_audit(session, payload: dict) -> None:
    await capture_audit(session, audit_relay, payload)


async def dispatch_audit(payload: dict) -> None:
    """Durably capture failed/no-session requests in their own transaction."""
    async with AsyncSessionLocal.begin() as session:
        await capture_request_audit(session, payload)


async def _relay_pending() -> int:
    return await relay_audit_batch(
        AsyncSessionLocal, audit_relay, _persist_in_main, owner_key="research.audit.relay"
    )


@celery_app.task(name="research.audit.relay", ignore_result=True, soft_time_limit=30, time_limit=45)
def relay_pending() -> int:
    # Durable eligibility controls retries; Beat polls recover lost wakeups.
    return run_worker_async(_relay_pending())


async def _observe_pending() -> None:
    async with AsyncSessionLocal() as session:
        await limit_audit_transaction(session)
        age = await oldest_ready_audit_age(session, audit_relay)
        retained = await has_retained_audit_failure(session, audit_relay)
    metrics = celery_app._ksu_metrics
    tags = {"service": "research"}
    metrics.gauge("audit.relay.ready_age", age, tags=tags)
    metrics.gauge("audit.relay.retained_failure", int(retained), tags=tags)
    metrics.gauge("audit.relay.observed_at", time(), tags=tags)


@celery_app.task(name="research.audit.observe", ignore_result=True, soft_time_limit=10, time_limit=15)
def observe_pending() -> None:
    run_worker_async(_observe_pending())
