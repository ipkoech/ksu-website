"""Public and School Portal inquiry contracts."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import ConfigDict, EmailStr, Field

from .base import BaseReadSchema, BaseSchema

InquiryStatus = Literal[
    "new",
    "open",
    "in_progress",
    "waiting_for_requester",
    "replied",
    "resolved",
    "closed",
    "spam",
]


class PublicEntityInquiryCreate(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    sender_name: str = Field(min_length=2, max_length=255)
    sender_email: EmailStr
    sender_phone: str | None = Field(None, max_length=32)
    subject: str = Field(min_length=3, max_length=255)
    message: str = Field(min_length=5, max_length=20_000)
    category: str = Field("general", max_length=64)
    consent_to_contact: bool
    website: str = Field("", max_length=500, exclude=True)
    source_page_url: str | None = Field(None, max_length=1024)


PublicSchoolInquiryCreate = PublicEntityInquiryCreate


class InquiryAssign(BaseSchema):
    assigned_to_user_id: uuid.UUID | None = None


class InquiryStatusUpdate(BaseSchema):
    status: InquiryStatus


class InquiryNoteCreate(BaseSchema):
    body: str = Field(min_length=1, max_length=20_000)


class InquiryReplyCreate(BaseSchema):
    body: str = Field(min_length=1, max_length=20_000)
    idempotency_key: str = Field(min_length=8, max_length=128)


class ContactInquiryMessageRead(BaseReadSchema):
    inquiry_id: uuid.UUID
    sender_type: str
    sender_user_id: uuid.UUID | None = None
    sender_name: str | None = None
    sender_email: EmailStr | None = None
    body: str
    is_internal_note: bool
    delivery_status: str
    delivery_attempts: int
    idempotency_key: str | None = None
    provider_message_id: str | None = None
    delivery_error: str | None = None
    reply_to_email: EmailStr | None = None
    sent_at: datetime | None = None
    failed_at: datetime | None = None


class ContactInquiryRead(BaseReadSchema):
    school_id: uuid.UUID | None = None
    target_entity_type: str
    target_entity_id: uuid.UUID
    target_entity_name: str | None = None
    target_entity_slug: str | None = None
    owner_scope_type: str
    owner_scope_id: uuid.UUID | None = None
    source_page_url: str | None = None
    reference_number: str
    sender_name: str
    sender_email: EmailStr
    sender_phone: str | None = None
    subject: str
    category: str
    priority: str
    assigned_to_user_id: uuid.UUID | None = None
    status: InquiryStatus
    consent_to_contact: bool
    source: str
    first_response_at: datetime | None = None
    last_message_at: datetime | None = None
    resolved_at: datetime | None = None
    closed_at: datetime | None = None
    messages: list[ContactInquiryMessageRead] = Field(default_factory=list)
