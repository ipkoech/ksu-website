"""Public and School Portal inquiry contracts."""

from __future__ import annotations

import uuid
from typing import Literal

from pydantic import ConfigDict, EmailStr, Field

from .base import BaseSchema

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


class PublicSchoolInquiryCreate(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    sender_name: str = Field(min_length=2, max_length=255)
    sender_email: EmailStr
    sender_phone: str | None = Field(None, max_length=32)
    subject: str = Field(min_length=3, max_length=255)
    message: str = Field(min_length=5, max_length=20_000)
    category: str = Field("general", max_length=64)
    consent_to_contact: bool
    website: str = Field("", max_length=500, exclude=True)


class InquiryAssign(BaseSchema):
    assigned_to_user_id: uuid.UUID | None = None


class InquiryStatusUpdate(BaseSchema):
    status: InquiryStatus


class InquiryNoteCreate(BaseSchema):
    body: str = Field(min_length=1, max_length=20_000)


class InquiryReplyCreate(BaseSchema):
    body: str = Field(min_length=1, max_length=20_000)
    idempotency_key: str = Field(min_length=8, max_length=128)
