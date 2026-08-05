"""Persisted outbound delivery for school inquiry replies."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ksu_common.task_queue import run_worker_async

from ..core.database import AsyncSessionLocal
from ..helpers.email import send_email
from ..models import ContactInquiryMessage
from ..services.domain_events import enqueue_domain_event
from .celery_app import celery_app

def _event_name(inquiry, action: str) -> str:
    prefix = "school" if inquiry.owner_scope_type == "school" else "entity"
    return f"{prefix}.inquiry.{action}"


@celery_app.task(name="main.inquiries.send_reply")
def queue_inquiry_reply(message_id: str) -> str:
    message_uuid = uuid.UUID(message_id)
    try:
        return run_worker_async(_deliver_reply(message_uuid))
    except Exception as exc:
        run_worker_async(_mark_delivery_failure(message_uuid, str(exc), dead_letter=True))
        raise


async def _deliver_reply(message_id: uuid.UUID) -> str:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ContactInquiryMessage)
            .options(selectinload(ContactInquiryMessage.inquiry))
            .where(ContactInquiryMessage.id == message_id)
        )
        message = result.scalar_one_or_none()
        if message is None:
            raise ValueError("Inquiry reply message not found")
        if message.delivery_status == "sent":
            return message.provider_message_id or "already-sent"
        if message.delivery_status == "dead_letter":
            raise ValueError("Inquiry reply is dead-lettered")
        message.delivery_attempts += 1
        message.delivery_status = "sending"
        await db.commit()
        recipient = message.inquiry.sender_email
        target = message.inquiry.target_entity_name or "Kisii University"
        subject = (
            f"Re: {message.inquiry.subject} — {target} "
            f"[{message.inquiry.reference_number}]"
        )
        body = (
            f"Hello {message.inquiry.sender_name},\n\n"
            f"{message.body}\n\n"
            f"Reference: {message.inquiry.reference_number}"
        )

    provider_id = await send_email(
        to_email=recipient,
        subject=subject,
        text_body=body,
        reply_to_email=message.reply_to_email,
    )

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ContactInquiryMessage)
            .options(selectinload(ContactInquiryMessage.inquiry))
            .where(ContactInquiryMessage.id == message_id)
        )
        message = result.scalar_one_or_none()
        if message is None:
            raise ValueError("Inquiry reply message not found after delivery")
        message.delivery_status = "sent"
        message.provider_message_id = provider_id
        message.delivery_error = None
        message.sent_at = datetime.now(timezone.utc)
        enqueue_domain_event(
            db,
            event_type=_event_name(message.inquiry, "reply_sent"),
            scope_type=message.inquiry.owner_scope_type,
            scope_id=message.inquiry.owner_scope_id,
            actor_id=message.sender_user_id,
            resource_type="contact_inquiry",
            resource_id=message.inquiry_id,
            data={"message_id": str(message.id), "delivery_status": "sent"},
        )
        await db.commit()
    return provider_id


async def _mark_delivery_failure(
    message_id: uuid.UUID,
    error: str,
    *,
    dead_letter: bool,
) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ContactInquiryMessage)
            .options(selectinload(ContactInquiryMessage.inquiry))
            .where(ContactInquiryMessage.id == message_id)
        )
        message = result.scalar_one_or_none()
        if message is None or message.delivery_status == "sent":
            return
        message.delivery_status = "dead_letter" if dead_letter else "failed"
        message.delivery_error = error[:2000]
        message.failed_at = datetime.now(timezone.utc)
        enqueue_domain_event(
            db,
            event_type=_event_name(
                message.inquiry,
                "reply_dead_lettered" if dead_letter else "reply_failed",
            ),
            scope_type=message.inquiry.owner_scope_type,
            scope_id=message.inquiry.owner_scope_id,
            actor_id=message.sender_user_id,
            resource_type="contact_inquiry",
            resource_id=message.inquiry_id,
            data={
                "message_id": str(message.id),
                "delivery_status": message.delivery_status,
                "attempts": message.delivery_attempts,
            },
        )
        await db.commit()
