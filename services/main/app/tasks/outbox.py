"""Reliable transactional outbox publication to Redis."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import and_, or_, select

from ksu_common.cache import get_redis
from ksu_common.task_queue import run_worker_async

from ..core.database import AsyncSessionLocal
from ..models import OutboxEvent
from ..services.domain_events import domain_event_envelope
from .celery_app import celery_app

MAX_PUBLISH_ATTEMPTS = 8


def mark_published(event: OutboxEvent, *, now: datetime | None = None) -> None:
    event.delivery_status = "published"
    event.published_at = now or datetime.now(timezone.utc)
    event.next_attempt_at = None
    event.last_error = None


def mark_publish_failed(
    event: OutboxEvent,
    error: str,
    *,
    now: datetime | None = None,
    max_attempts: int = MAX_PUBLISH_ATTEMPTS,
) -> None:
    now = now or datetime.now(timezone.utc)
    event.last_error = error[:4000]
    if event.publish_attempts >= max_attempts:
        event.delivery_status = "dead_letter"
        event.dead_lettered_at = now
        event.next_attempt_at = None
    else:
        event.delivery_status = "failed"
        event.next_attempt_at = now + timedelta(
            seconds=min(300, 2 ** max(0, event.publish_attempts - 1))
        )


async def _claim_event(event_id: uuid.UUID) -> OutboxEvent | None:
    now = datetime.now(timezone.utc)
    stale_claim = now - timedelta(minutes=5)
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(OutboxEvent)
            .where(
                OutboxEvent.id == event_id,
                OutboxEvent.deleted_at.is_(None),
                OutboxEvent.published_at.is_(None),
                OutboxEvent.dead_lettered_at.is_(None),
                or_(
                    and_(
                        OutboxEvent.delivery_status.in_(("pending", "failed")),
                        or_(
                            OutboxEvent.next_attempt_at.is_(None),
                            OutboxEvent.next_attempt_at <= now,
                        ),
                    ),
                    and_(
                        OutboxEvent.delivery_status == "publishing",
                        OutboxEvent.updated_at <= stale_claim,
                    ),
                ),
            )
            .with_for_update(skip_locked=True)
        )
        event = result.scalar_one_or_none()
        if event is None:
            return None
        event.delivery_status = "publishing"
        event.publish_attempts += 1
        await db.commit()
        return event


async def _publish_one(event_id: uuid.UUID) -> str:
    event = await _claim_event(event_id)
    if event is None:
        return "skipped"
    envelope = domain_event_envelope(event).model_dump(mode="json")
    serialized = json.dumps(envelope, separators=(",", ":"), sort_keys=True)
    try:
        redis = await get_redis()
        cursor = await redis.xadd(
            "ksu:domain-events",
            {"event_id": str(event.id), "event": serialized},
            maxlen=20_000,
            approximate=True,
        )
        await redis.publish(
            "ksu:domain-events",
            json.dumps({"cursor": cursor, "event": envelope}, separators=(",", ":")),
        )
    except Exception as exc:
        async with AsyncSessionLocal() as db:
            current = await OutboxEvent.get_by_id(db, event.id)
            if current is not None:
                mark_publish_failed(current, str(exc))
                await db.commit()
        raise

    async with AsyncSessionLocal() as db:
        current = await OutboxEvent.get_by_id(db, event.id)
        if current is not None:
            mark_published(current)
            await db.commit()
    celery_app.send_task("main.notifications.consume_event", args=[str(event.id)])
    return "published"


@celery_app.task(name="main.outbox.publish_one")
def publish_one_outbox_event(event_id: str) -> str:
    return run_worker_async(_publish_one(uuid.UUID(event_id)))


@celery_app.task(name="main.outbox.publish_pending")
def publish_pending_outbox(batch_size: int = 100) -> int:
    async def _dispatch() -> int:
        now = datetime.now(timezone.utc)
        stale_claim = now - timedelta(minutes=5)
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(OutboxEvent.id)
                .where(
                    OutboxEvent.deleted_at.is_(None),
                    OutboxEvent.published_at.is_(None),
                    OutboxEvent.dead_lettered_at.is_(None),
                    or_(
                        and_(
                            OutboxEvent.delivery_status.in_(("pending", "failed")),
                            or_(
                                OutboxEvent.next_attempt_at.is_(None),
                                OutboxEvent.next_attempt_at <= now,
                            ),
                        ),
                        and_(
                            OutboxEvent.delivery_status == "publishing",
                            OutboxEvent.updated_at <= stale_claim,
                        ),
                    ),
                )
                .order_by(OutboxEvent.occurred_at)
                .limit(batch_size)
            )
            ids = list(result.scalars().all())
        for event_id in ids:
            celery_app.send_task("main.outbox.publish_one", args=[str(event_id)])
        return len(ids)

    return run_worker_async(_dispatch())
