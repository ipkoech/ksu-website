"""Signed, bounded webhook delivery from the transactional event outbox."""

from __future__ import annotations

import hashlib
import hmac
import json
import time
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy import func, or_, select

from ksu_common.internal_client import IntegrationResponseTooLargeError, get_integration_pool
from ksu_common.security import is_safe_public_url
from ksu_common.task_queue import run_worker_async

from ..core.config import get_settings
from ..core.database import AsyncSessionLocal
from ..models import OutboxEvent, Webhook, WebhookDelivery
from ..services.domain_events import domain_event_envelope
from .celery_app import celery_app

RETRYABLE_STATUS_CODES = frozenset({408, 425, 429, 500, 502, 503, 504})


def webhook_signature(secret: str, timestamp: int, body: bytes) -> str:
    """Return the v1 signature over the exact timestamp and request bytes."""
    message = str(timestamp).encode("ascii") + b"." + body
    return "v1=" + hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()


def verify_webhook_signature(
    secret: str,
    timestamp: int,
    body: bytes,
    signature: str,
    *,
    now: int | None = None,
    replay_window_seconds: int = 300,
) -> bool:
    """Verify a delivery signature and reject stale or future timestamps."""
    current = int(time.time()) if now is None else now
    if abs(current - timestamp) > replay_window_seconds:
        return False
    return hmac.compare_digest(webhook_signature(secret, timestamp, body), signature)


def _target(url: str) -> tuple[str, str]:
    if not is_safe_public_url(url) or url.startswith("/"):
        raise ValueError("webhook URL must be a public HTTP(S) endpoint")
    parsed = httpx.URL(url)
    base_url = f"{parsed.scheme}://{parsed.host}"
    if parsed.port is not None:
        base_url += f":{parsed.port}"
    target = parsed.raw_path.decode("ascii")
    return base_url, target


def _retry_delay(attempt: int) -> int:
    return min(900, 2 ** max(0, attempt - 1))


async def _dispatch_event(event_id: uuid.UUID) -> int:
    async with AsyncSessionLocal() as db:
        event = await OutboxEvent.get_by_id(db, event_id)
        if (
            event is None
            or event.published_at is None
            or event.webhooks_dispatched_at is not None
        ):
            return 0
        result = await db.execute(
            select(Webhook.id).where(
                Webhook.deleted_at.is_(None),
                Webhook.is_active.is_(True),
                or_(
                    Webhook.events.contains([event.event_type]),
                    Webhook.events.contains(["*"]),
                ),
            )
        )
        webhook_ids = list(result.scalars().all())
    for webhook_id in webhook_ids:
        celery_app.send_task(
            "main.webhooks.deliver",
            args=[str(webhook_id), str(event_id)],
        )
    async with AsyncSessionLocal() as db:
        current = await OutboxEvent.get_by_id(db, event_id)
        if current is not None and current.webhooks_dispatched_at is None:
            current.webhooks_dispatched_at = datetime.now(timezone.utc)
            await db.commit()
    return len(webhook_ids)


async def _dispatch_pending(batch_size: int) -> int:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(OutboxEvent.id)
            .where(
                OutboxEvent.deleted_at.is_(None),
                OutboxEvent.published_at.is_not(None),
                OutboxEvent.webhooks_dispatched_at.is_(None),
            )
            .order_by(OutboxEvent.published_at)
            .limit(batch_size)
        )
        event_ids = list(result.scalars().all())
    for event_id in event_ids:
        celery_app.send_task("main.webhooks.dispatch_event", args=[str(event_id)])
    return len(event_ids)


async def _deliver(webhook_id: uuid.UUID, event_id: uuid.UUID, *, force: bool = False) -> str:
    settings = get_settings()
    async with AsyncSessionLocal() as db:
        webhook = await Webhook.get_by_id(db, webhook_id)
        event = await OutboxEvent.get_by_id(db, event_id)
        if webhook is None or event is None or not webhook.is_active:
            return "skipped"
        attempt = int(
            await db.scalar(
                select(func.count(WebhookDelivery.id)).where(
                    WebhookDelivery.webhook_id == webhook_id,
                    WebhookDelivery.event_id == event_id,
                )
            )
            or 0
        ) + 1
        if attempt > settings.WEBHOOK_MAX_ATTEMPTS and not force:
            return "dead_letter"
        secret = webhook.secret
        url = webhook.url
        envelope = domain_event_envelope(event).model_dump(mode="json")

    body = json.dumps(envelope, separators=(",", ":"), sort_keys=True).encode("utf-8")
    timestamp = int(time.time())
    status_code: int | None = None
    error: str | None = None
    started = time.monotonic()
    try:
        if not secret:
            raise ValueError("webhook has no signing secret")
        base_url, target = _target(url)
        response = await get_integration_pool().request(
            f"webhook:{webhook_id}",
            base_url,
            "POST",
            target,
            headers={
                "Content-Type": "application/json",
                "Idempotency-Key": str(event_id),
                "X-KSU-Webhook-Id": str(webhook_id),
                "X-KSU-Event-Id": str(event_id),
                "X-KSU-Webhook-Timestamp": str(timestamp),
                "X-KSU-Webhook-Signature": webhook_signature(secret, timestamp, body),
            },
            content=body,
            timeout=settings.WEBHOOK_DELIVERY_TIMEOUT_SECONDS,
            max_response_bytes=settings.WEBHOOK_MAX_RESPONSE_BYTES,
        )
        status_code = response.status_code
        if not 200 <= response.status_code < 300:
            error = f"webhook returned HTTP {response.status_code}"
    except Exception as exc:
        error = f"{type(exc).__name__}: {exc}"[:1000]
    duration_ms = round((time.monotonic() - started) * 1000, 3)

    retryable = error is not None and not error.startswith(
        IntegrationResponseTooLargeError.__name__
    ) and (
        status_code is None or status_code in RETRYABLE_STATUS_CODES
    )
    will_retry = retryable and attempt < settings.WEBHOOK_MAX_ATTEMPTS
    next_attempt_at = (
        datetime.now(timezone.utc) + timedelta(seconds=_retry_delay(attempt))
        if will_retry else None
    )
    delivery_status = "retrying" if will_retry else ("delivered" if error is None else "dead_letter")

    async with AsyncSessionLocal() as db:
        webhook = await Webhook.get_by_id(db, webhook_id)
        if webhook is None:
            return "skipped"
        db.add(
            WebhookDelivery(
                webhook_id=webhook_id,
                event_id=event_id,
                attempt_number=attempt,
                status=delivery_status,
                status_code=status_code,
                duration_ms=duration_ms,
                error=error,
                attempted_at=datetime.now(timezone.utc),
                next_attempt_at=next_attempt_at,
            )
        )
        webhook.last_triggered_at = datetime.now(timezone.utc)
        webhook.last_status = status_code
        webhook.failure_count = webhook.failure_count + 1 if error else 0
        await db.commit()

    if will_retry:
        celery_app.send_task(
            "main.webhooks.deliver",
            args=[str(webhook_id), str(event_id)],
            countdown=_retry_delay(attempt),
        )
    return delivery_status


@celery_app.task(name="main.webhooks.dispatch_event")
def dispatch_webhook_event(event_id: str) -> int:
    return run_worker_async(_dispatch_event(uuid.UUID(event_id)))


@celery_app.task(name="main.webhooks.deliver")
def deliver_webhook(webhook_id: str, event_id: str, force: bool = False) -> str:
    return run_worker_async(
        _deliver(uuid.UUID(webhook_id), uuid.UUID(event_id), force=force)
    )


@celery_app.task(name="main.webhooks.dispatch_pending")
def dispatch_pending_webhook_events(batch_size: int = 100) -> int:
    return run_worker_async(_dispatch_pending(batch_size))


__all__ = ["verify_webhook_signature", "webhook_signature"]
