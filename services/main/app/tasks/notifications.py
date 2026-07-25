"""Celery tasks for notifications."""

from __future__ import annotations

import asyncio
import smtplib
import uuid
from datetime import datetime, timezone

from celery.exceptions import MaxRetriesExceededError
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..core.database import AsyncSessionLocal
from ..helpers import send_notification_email, send_push, send_sms
from ..models import Notification, NotificationDelivery, OutboxEvent
from ..services import NotificationService
from ..services.notification import (
    notification_channels_from_preferences,
    notification_policy_for_event,
)
from .celery_app import celery_app


async def _dispatch_delivery(delivery_id: str) -> None:
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                select(NotificationDelivery)
                .options(selectinload(NotificationDelivery.notification).selectinload(Notification.user))
                .where(NotificationDelivery.id == uuid.UUID(delivery_id), NotificationDelivery.deleted_at.is_(None))
            )
            delivery = result.scalar_one_or_none()
            if delivery is None or delivery.notification is None or delivery.notification.user is None:
                return

            notification = delivery.notification
            if notification.archived_at is not None:
                delivery.status = "expired"
                await db.commit()
                return

            if delivery.expires_at and delivery.expires_at < datetime.now(timezone.utc):
                delivery.status = "expired"
                notification.mark_archived()
                await db.commit()
                return

            delivery.attempts += 1
            provider_id = None
            if delivery.channel == "in_app":
                provider_id = f"in-app:{delivery.notification_id}"
            elif delivery.channel == "email":
                if not delivery.recipient:
                    raise ValueError("Email recipient missing")
                provider_id = await send_notification_email(delivery.recipient, notification.subject or notification.title, notification.message)
            elif delivery.channel == "sms":
                if not delivery.recipient:
                    raise ValueError("SMS recipient missing")
                provider_id = await send_sms(delivery.recipient, notification.message)
            elif delivery.channel == "push":
                if not delivery.recipient:
                    raise ValueError("Push recipient missing")
                provider_id = await send_push(delivery.recipient, notification.title, notification.message)
            else:
                raise ValueError(f"Unsupported channel: {delivery.channel}")

            now = datetime.now(timezone.utc)
            delivery.provider_message_id = provider_id
            delivery.status = "sent"
            delivery.sent_at = now
            delivery.delivered_at = now
            await db.commit()
        except Exception as exc:
            await db.rollback()
            retry_session = AsyncSessionLocal()
            async with retry_session as db2:
                result = await db2.execute(
                    select(NotificationDelivery).where(
                        NotificationDelivery.id == uuid.UUID(delivery_id),
                        NotificationDelivery.deleted_at.is_(None),
                    )
                )
                delivery = result.scalar_one_or_none()
                if delivery is not None:
                    delivery.status = "failed"
                    delivery.failed_at = datetime.now(timezone.utc)
                    delivery.error_message = str(exc)
                    await db2.commit()
            raise


@celery_app.task(
    bind=True,
    name="main.notifications.dispatch_delivery",
    autoretry_for=(smtplib.SMTPException, TimeoutError, OSError, ConnectionError),
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True,
    max_retries=5,
)
def dispatch_notification_delivery(self, delivery_id: str) -> None:
    try:
        asyncio.run(_dispatch_delivery(delivery_id))
    except (smtplib.SMTPException, TimeoutError, OSError, ConnectionError) as exc:
        async def _mark_retry() -> None:
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(NotificationDelivery).where(
                        NotificationDelivery.id == uuid.UUID(delivery_id),
                        NotificationDelivery.deleted_at.is_(None),
                    )
                )
                delivery = result.scalar_one_or_none()
                if delivery is not None:
                    delivery.status = "retrying"
                    delivery.error_message = str(exc)
                    delivery.next_retry_at = datetime.now(timezone.utc)
                    await db.commit()

        asyncio.run(_mark_retry())
        try:
            raise self.retry(exc=exc)
        except MaxRetriesExceededError:
            async def _dead_letter() -> None:
                async with AsyncSessionLocal() as db:
                    result = await db.execute(
                        select(NotificationDelivery).where(
                            NotificationDelivery.id == uuid.UUID(delivery_id),
                            NotificationDelivery.deleted_at.is_(None),
                        )
                    )
                    delivery = result.scalar_one_or_none()
                    if delivery is not None:
                        delivery.status = "dead_letter"
                        delivery.failed_at = datetime.now(timezone.utc)
                        delivery.dead_lettered_at = datetime.now(timezone.utc)
                        delivery.dead_letter_reason = str(exc)
                        await db.commit()

            asyncio.run(_dead_letter())
            raise


@celery_app.task(name="main.notifications.expire")
def expire_notifications() -> int:
    async def _expire() -> int:
        async with AsyncSessionLocal() as db:
            count = await NotificationService.archive_expired_notifications(db)
            await db.commit()
            return count

    return asyncio.run(_expire())


async def _consume_event(event_id: uuid.UUID) -> int:
    async with AsyncSessionLocal() as db:
        event = await OutboxEvent.get_by_id(db, event_id)
        if event is None:
            return 0
        policy = notification_policy_for_event(event.event_type)
        if policy is None:
            return 0
        audience = policy["audience"]
        if audience == "actor":
            recipients = [event.actor_id] if event.actor_id else []
        elif audience == "cocms":
            recipients = await NotificationService.resolve_user_ids(
                db,
                role_names=["cocms_admin", "corporate_communication_admin"],
            )
        else:
            recipients = await NotificationService.resolve_user_ids(
                db,
                audience_scope_type=event.scope_type,
                audience_scope_id=event.scope_id,
            )

        created = 0
        for user_id in recipients:
            existing = await db.execute(
                select(Notification.id).where(
                    Notification.user_id == user_id,
                    Notification.source_event_id == event.id,
                )
            )
            if existing.scalar_one_or_none() is not None:
                continue
            preferences = await NotificationService.notification_preferences(db, user_id)
            channels = notification_channels_from_preferences(policy, preferences)
            if not channels:
                continue
            notification = await NotificationService.create(
                db,
                user_id=user_id,
                source_event_id=event.id,
                title=policy["title"],
                subject=policy["title"],
                message=policy["message"],
                notification_type="school_event",
                priority="high" if "failed" in event.event_type else "normal",
                action_url=policy.get("action_url"),
                scope_type=event.scope_type,
                scope_id=event.scope_id,
                channels=channels,
                payload={
                    "event_id": str(event.id),
                    "event_type": event.event_type,
                    "resource_type": event.resource_type,
                    "resource_id": str(event.resource_id),
                    **(event.payload or {}),
                },
            )
            await NotificationService.queue_deliveries(db, notification)
            created += 1
        await db.commit()
        return created


@celery_app.task(name="main.notifications.consume_event")
def consume_event_notifications(event_id: str) -> int:
    return asyncio.run(_consume_event(uuid.UUID(event_id)))
