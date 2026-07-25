"""School-scoped contact inquiry conversations."""

from __future__ import annotations

import re
import uuid
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import selectinload

from ..models import ContactInquiry, ContactInquiryMessage, User, UserRole
from ..schemas.contact_inquiry import PublicEntityInquiryCreate
from .public_inquiry_target import PublicInquiryTarget
from ._base import paginate_query
from .domain_events import enqueue_domain_event
from ..tasks.inquiries import queue_inquiry_reply

INQUIRY_STATUSES = frozenset(
    {
        "new",
        "open",
        "in_progress",
        "waiting_for_requester",
        "replied",
        "resolved",
        "closed",
        "spam",
    }
)

INQUIRY_OWNER_SCOPE_TYPES = frozenset(
    {"university", "division", "wing", "school", "department"}
)


@dataclass(frozen=True, slots=True)
class InquiryActionContext:
    user: User
    scope_type: str
    scope_id: uuid.UUID | None
    reply_to_email: str | None = None


def _context_scope(inquiry, context) -> tuple[str, uuid.UUID | None]:
    school = getattr(context, "school", None)
    if school is not None:
        return "school", school.id
    return (
        getattr(context, "scope_type", inquiry.owner_scope_type),
        getattr(context, "scope_id", inquiry.owner_scope_id),
    )


def _event_name(scope_type: str, action: str) -> str:
    prefix = "school" if scope_type == "school" else "entity"
    return f"{prefix}.inquiry.{action}"


def classify_inquiry_spam(message: str, *, honeypot: str) -> tuple[bool, int]:
    score = 100 if honeypot.strip() else 0
    urls = len(re.findall(r"https?://", message, flags=re.IGNORECASE))
    score += max(0, urls - 2) * 20
    normalized = message.casefold()
    if any(term in normalized for term in ("buy followers", "crypto investment", "seo ranking")):
        score += 60
    return score >= 60, min(score, 100)


class ContactInquiryService:
    @staticmethod
    def verify_school(inquiry, school_id: uuid.UUID) -> None:
        if inquiry.school_id != school_id:
            raise HTTPException(status_code=404, detail="Inquiry not found")

    @staticmethod
    async def create_public(
        db,
        *,
        data: PublicEntityInquiryCreate,
        source_ip: str | None,
        user_agent: str | None,
        target: PublicInquiryTarget | None = None,
        school=None,
    ) -> ContactInquiry:
        if target is None:
            if school is None:
                raise ValueError("An inquiry target is required")
            target = PublicInquiryTarget(
                entity_type="school",
                entity_id=school.id,
                name=school.name,
                slug=school.slug,
                owner_scope_type="school",
                owner_scope_id=school.id,
                school_id=school.id,
            )
        is_spam, spam_score = classify_inquiry_spam(data.message, honeypot=data.website)
        now = datetime.now(timezone.utc)
        inquiry = ContactInquiry(
            school_id=target.school_id,
            target_entity_type=target.entity_type,
            target_entity_id=target.entity_id,
            target_entity_name=target.name,
            target_entity_slug=target.slug,
            owner_scope_type=target.owner_scope_type,
            owner_scope_id=target.owner_scope_id,
            source_page_url=data.source_page_url,
            reference_number=f"INQ-{now:%y%m%d}-{uuid.uuid4().hex[:8].upper()}",
            sender_name=data.sender_name,
            sender_email=str(data.sender_email),
            sender_phone=data.sender_phone,
            subject=data.subject,
            category=data.category,
            priority="normal",
            status="spam" if is_spam else "new",
            consent_to_contact=data.consent_to_contact,
            source="public_entity_website",
            source_ip=source_ip,
            user_agent=(user_agent or "")[:512] or None,
            spam_score=spam_score,
            last_message_at=now,
        )
        db.add(inquiry)
        await db.flush()
        message = ContactInquiryMessage(
            inquiry_id=inquiry.id,
            sender_type="requester",
            sender_name=data.sender_name,
            sender_email=str(data.sender_email),
            body=data.message,
            is_internal_note=False,
            delivery_status="received",
        )
        db.add(message)
        enqueue_domain_event(
            db,
            event_type="entity.inquiry.spam_detected" if is_spam else "entity.inquiry.created",
            scope_type=target.owner_scope_type,
            scope_id=target.owner_scope_id,
            actor_id=None,
            resource_type="contact_inquiry",
            resource_id=inquiry.id,
            data={
                "category": inquiry.category,
                "priority": inquiry.priority,
                "target_entity_type": target.entity_type,
                "target_entity_id": str(target.entity_id),
            },
        )
        await db.flush()
        await db.refresh(inquiry)
        return inquiry

    @staticmethod
    async def list_for_school(
        db,
        school_id: uuid.UUID,
        *,
        page: int = 1,
        per_page: int = 20,
        status: str | None = None,
        category: str | None = None,
        priority: str | None = None,
        assigned_to_user_id: uuid.UUID | None = None,
    ):
        query = ContactInquiry.active_query().where(ContactInquiry.school_id == school_id)
        for column, value in (
            (ContactInquiry.status, status),
            (ContactInquiry.category, category),
            (ContactInquiry.priority, priority),
            (ContactInquiry.assigned_to_user_id, assigned_to_user_id),
        ):
            if value is not None:
                query = query.where(column == value)
        query = query.order_by(ContactInquiry.last_message_at.desc().nullslast())
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def list_for_admin(
        db,
        *,
        page: int = 1,
        per_page: int = 20,
        status: str | None = None,
        category: str | None = None,
        priority: str | None = None,
        assigned_to_user_id: uuid.UUID | None = None,
        target_entity_type: str | None = None,
        owner_scope_type: str | None = None,
        owner_scope_id: uuid.UUID | None = None,
        include_school_owned: bool = False,
        search: str | None = None,
        created_from: date | None = None,
        created_to: date | None = None,
    ):
        query = ContactInquiry.active_query()
        if not include_school_owned:
            query = query.where(ContactInquiry.owner_scope_type != "school")
        for column, value in (
            (ContactInquiry.status, status),
            (ContactInquiry.category, category),
            (ContactInquiry.priority, priority),
            (ContactInquiry.assigned_to_user_id, assigned_to_user_id),
            (ContactInquiry.target_entity_type, target_entity_type),
            (ContactInquiry.owner_scope_type, owner_scope_type),
            (ContactInquiry.owner_scope_id, owner_scope_id),
        ):
            if value is not None:
                query = query.where(column == value)
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.where(
                or_(
                    ContactInquiry.reference_number.ilike(term),
                    ContactInquiry.sender_name.ilike(term),
                    ContactInquiry.sender_email.ilike(term),
                    ContactInquiry.subject.ilike(term),
                    ContactInquiry.target_entity_name.ilike(term),
                )
            )
        if created_from:
            query = query.where(
                ContactInquiry.created_at
                >= datetime.combine(created_from, time.min, tzinfo=timezone.utc)
            )
        if created_to:
            query = query.where(
                ContactInquiry.created_at
                < datetime.combine(
                    created_to + timedelta(days=1),
                    time.min,
                    tzinfo=timezone.utc,
                )
            )
        query = query.order_by(
            ContactInquiry.last_message_at.desc().nullslast(),
            ContactInquiry.created_at.desc(),
        )
        return await paginate_query(db, query, page=page, per_page=per_page)

    @classmethod
    async def get_for_school(cls, db, inquiry_id: uuid.UUID, school_id: uuid.UUID):
        result = await db.execute(
            ContactInquiry.active_query()
            .options(selectinload(ContactInquiry.messages))
            .where(ContactInquiry.id == inquiry_id)
        )
        inquiry = result.scalar_one_or_none()
        if inquiry is None:
            raise HTTPException(status_code=404, detail="Inquiry not found")
        cls.verify_school(inquiry, school_id)
        return inquiry

    @staticmethod
    async def get_for_admin(
        db,
        inquiry_id: uuid.UUID,
        *,
        include_school_owned: bool = False,
    ):
        query = (
            ContactInquiry.active_query()
            .options(selectinload(ContactInquiry.messages))
            .where(ContactInquiry.id == inquiry_id)
        )
        if not include_school_owned:
            query = query.where(ContactInquiry.owner_scope_type != "school")
        result = await db.execute(query)
        inquiry = result.scalar_one_or_none()
        if inquiry is None:
            raise HTTPException(status_code=404, detail="Inquiry not found")
        return inquiry

    @staticmethod
    async def assign(db, inquiry, context, assigned_to_user_id: uuid.UUID | None):
        scope_type, scope_id = _context_scope(inquiry, context)
        if assigned_to_user_id is not None:
            if getattr(context, "school", None) is not None:
                result = await db.execute(
                    select(UserRole.id).where(
                        UserRole.user_id == assigned_to_user_id,
                        UserRole.scope_type == "school",
                        UserRole.scope_id == scope_id,
                        UserRole.is_active.is_(True),
                        UserRole.deleted_at.is_(None),
                    )
                )
                detail = "Assignee is not active in this school"
            else:
                result = await db.execute(
                    select(User.id).where(
                        User.id == assigned_to_user_id,
                        User.is_active.is_(True),
                        User.deleted_at.is_(None),
                    )
                )
                detail = "Assignee is not an active user"
            if result.scalar_one_or_none() is None:
                raise HTTPException(status_code=422, detail=detail)
        inquiry.assigned_to_user_id = assigned_to_user_id
        if inquiry.status == "new":
            inquiry.status = "open"
        enqueue_domain_event(
            db,
            event_type=_event_name(scope_type, "assigned"),
            scope_type=scope_type,
            scope_id=scope_id,
            actor_id=context.user.id,
            resource_type="contact_inquiry",
            resource_id=inquiry.id,
            data={
                "assigned_to_user_id": (
                    str(assigned_to_user_id) if assigned_to_user_id else None
                )
            },
        )
        await db.flush()
        return inquiry

    @staticmethod
    async def update_status(db, inquiry, new_status: str):
        if new_status not in INQUIRY_STATUSES:
            raise HTTPException(status_code=422, detail="Unsupported inquiry status")
        now = datetime.now(timezone.utc)
        inquiry.status = new_status
        if new_status == "resolved":
            inquiry.resolved_at = now
        elif new_status == "closed":
            inquiry.closed_at = now
        await db.flush()
        return inquiry

    @staticmethod
    async def add_note(db, inquiry, context, body: str):
        message = ContactInquiryMessage(
            inquiry_id=inquiry.id,
            sender_type="staff",
            sender_user_id=context.user.id,
            sender_name=context.user.full_name,
            sender_email=context.user.email,
            body=body,
            is_internal_note=True,
            delivery_status="not_applicable",
        )
        db.add(message)
        inquiry.last_message_at = datetime.now(timezone.utc)
        await db.flush()
        return message

    @staticmethod
    async def reply(db, inquiry, context, data):
        if not inquiry.sender_email:
            raise HTTPException(status_code=409, detail="Requester has no reply address")
        if not getattr(inquiry, "consent_to_contact", True):
            raise HTTPException(status_code=409, detail="Requester did not consent to contact")
        if hasattr(db, "execute"):
            existing_result = await db.execute(
                select(ContactInquiryMessage).where(
                    ContactInquiryMessage.inquiry_id == inquiry.id,
                    ContactInquiryMessage.idempotency_key == data.idempotency_key,
                )
            )
            existing = existing_result.scalar_one_or_none()
            if existing is not None:
                return existing
        now = datetime.now(timezone.utc)
        scope_type, scope_id = _context_scope(inquiry, context)
        school = getattr(context, "school", None)
        message = ContactInquiryMessage(
            inquiry_id=inquiry.id,
            sender_type="staff",
            sender_user_id=context.user.id,
            sender_name=context.user.full_name,
            sender_email=context.user.email,
            body=data.body,
            is_internal_note=False,
            delivery_status="pending",
            delivery_attempts=0,
            idempotency_key=data.idempotency_key,
            reply_to_email=(
                getattr(school, "email", None)
                or getattr(context, "reply_to_email", None)
                or context.user.email
            ),
        )
        db.add(message)
        await db.flush()
        inquiry.status = "replied"
        inquiry.last_message_at = now
        if inquiry.first_response_at is None:
            inquiry.first_response_at = now
        enqueue_domain_event(
            db,
            event_type=_event_name(scope_type, "reply_queued"),
            scope_type=scope_type,
            scope_id=scope_id,
            actor_id=context.user.id,
            resource_type="contact_inquiry",
            resource_id=inquiry.id,
            data={"message_id": str(message.id), "delivery_status": "pending"},
        )
        await db.flush()
        queue_inquiry_reply.apply_async(args=[str(message.id)], countdown=1)
        return message

    @staticmethod
    async def retry_delivery(db, inquiry, message_id: uuid.UUID):
        result = await db.execute(
            select(ContactInquiryMessage).where(
                ContactInquiryMessage.id == message_id,
                ContactInquiryMessage.inquiry_id == inquiry.id,
            )
        )
        message = result.scalar_one_or_none()
        if message is None:
            raise HTTPException(status_code=404, detail="Inquiry message not found")
        if message.delivery_status not in {"failed", "dead_letter"}:
            raise HTTPException(status_code=409, detail="Only failed replies can be retried")
        message.delivery_status = "pending"
        message.delivery_error = None
        message.failed_at = None
        await db.flush()
        queue_inquiry_reply.apply_async(args=[str(message.id)], countdown=1)
        return message


__all__ = [
    "ContactInquiryService",
    "INQUIRY_OWNER_SCOPE_TYPES",
    "INQUIRY_STATUSES",
    "InquiryActionContext",
    "classify_inquiry_spam",
]
