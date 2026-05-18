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
from ..models import Notification, NotificationDelivery
from ..services import NotificationService
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
