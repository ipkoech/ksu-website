"""Record domain events without leaving the caller's database transaction."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession
from ksu_common.after_commit import defer_after_commit

from ..core.config import get_settings
from ..models.outbox_event import OutboxEvent
from ..schemas.domain_events import (
    DomainEventEnvelope,
    DomainEventResource,
    DomainEventScope,
)

UNTRUSTED_SCOPE_PAYLOAD_KEYS = frozenset({"scope", "scope_id", "school_id"})


def enqueue_celery_after_commit(
    db: AsyncSession,
    task_name: str,
    *,
    args: list[Any] | None = None,
    kwargs: dict[str, Any] | None = None,
    recoverable: bool = False,
) -> None:
    """Schedule a Celery task only after the surrounding transaction commits."""
    task_args, task_kwargs = list(args or []), dict(kwargs or {})

    def dispatch() -> None:
        from ..tasks.celery_app import celery_app

        celery_app.send_task(task_name, args=task_args, kwargs=task_kwargs)

    defer_after_commit(db, dispatch, recoverable=recoverable)


def enqueue_domain_event(
    db: AsyncSession,
    *,
    event_type: str,
    scope_type: str,
    scope_id: uuid.UUID | None,
    actor_id: uuid.UUID | None,
    resource_type: str,
    resource_id: uuid.UUID,
    data: dict[str, Any] | None = None,
    event_version: int = 1,
    event_id: uuid.UUID | None = None,
    occurred_at: datetime | None = None,
) -> OutboxEvent | None:
    """Attach an event to the current unit of work without flushing or committing."""
    if not get_settings().SCHOOL_PORTAL_EVENTS_ENABLED:
        return None
    if event_version < 1:
        raise ValueError("event_version must be at least 1")
    normalized_type = event_type.strip()
    normalized_scope_type = scope_type.strip()
    normalized_resource_type = resource_type.strip()
    if not normalized_type or not normalized_scope_type or not normalized_resource_type:
        raise ValueError("event type, scope type, and resource type are required")

    safe_data = {
        key: value
        for key, value in (data or {}).items()
        if key not in UNTRUSTED_SCOPE_PAYLOAD_KEYS
    }
    event = OutboxEvent(
        id=event_id or uuid.uuid4(),
        event_type=normalized_type,
        event_version=event_version,
        occurred_at=occurred_at or datetime.now(timezone.utc),
        scope_type=normalized_scope_type,
        scope_id=scope_id,
        actor_id=actor_id,
        resource_type=normalized_resource_type,
        resource_id=resource_id,
        payload=safe_data,
        delivery_status="pending",
        publish_attempts=0,
    )
    db.add(event)
    enqueue_celery_after_commit(
        db,
        "main.outbox.publish_one",
        args=[str(event.id)],
        recoverable=True,
    )
    return event


def enqueue_email_event(
    db: AsyncSession,
    *,
    event_type: str,
    user_id: uuid.UUID,
    payload: dict[str, Any],
) -> OutboxEvent:
    """Persist a critical email delivery request in the transactional outbox."""
    event = OutboxEvent(
        id=uuid.uuid4(),
        event_type=event_type,
        event_version=1,
        occurred_at=datetime.now(timezone.utc),
        scope_type="main",
        scope_id=user_id,
        actor_id=None,
        resource_type="auth_email",
        resource_id=user_id,
        payload=payload,
        delivery_status="pending",
        publish_attempts=0,
    )
    db.add(event)
    enqueue_celery_after_commit(
        db,
        "main.outbox.publish_one",
        args=[str(event.id)],
        recoverable=True,
    )
    return event


def domain_event_envelope(event: OutboxEvent) -> DomainEventEnvelope:
    """Convert one persisted outbox record to the stable public envelope."""
    return DomainEventEnvelope(
        id=event.id,
        type=event.event_type,
        version=event.event_version,
        occurred_at=event.occurred_at,
        scope=DomainEventScope(type=event.scope_type, id=event.scope_id),
        actor_id=event.actor_id,
        resource=DomainEventResource(
            type=event.resource_type,
            id=event.resource_id,
        ),
        data=event.payload or {},
    )


__all__ = [
    "domain_event_envelope",
    "enqueue_email_event",
    "enqueue_celery_after_commit",
    "enqueue_domain_event",
]
