"""Support and contact schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import EmailStr, Field

from .base import BaseReadSchema, BaseSchema


class FAQCreate(BaseSchema):
    question: str
    answer_plain_text: str | None = None
    answer_rich_text: str | None = None
    answer_structured: dict[str, Any] | None = None
    category: str | None = Field(default=None, max_length=64)
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    is_main: bool = False
    is_public: bool = True
    status: str = Field(default="draft", max_length=32)
    display_order: int = 100


class FAQUpdate(BaseSchema):
    question: str | None = None
    answer_plain_text: str | None = None
    answer_rich_text: str | None = None
    answer_structured: dict[str, Any] | None = None
    category: str | None = Field(default=None, max_length=64)
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    is_main: bool | None = None
    is_public: bool | None = None
    status: str | None = Field(default=None, max_length=32)
    display_order: int | None = None


class FAQRead(BaseReadSchema):
    question: str
    answer_plain_text: str | None = None
    answer_rich_text: str | None = None
    answer_structured: dict[str, Any] | None = None
    category: str | None = None
    scope_type: str | None = None
    scope_id: uuid.UUID | None = None
    is_main: bool
    is_public: bool
    status: str
    display_order: int
    views_count: int
    helpful_count: int
    deleted_at: datetime | None = None


class ContactDirectoryCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    contact_type: str | None = Field(default=None, max_length=64)
    email: EmailStr | None = None
    phone: list[str] | None = None
    extension: str | None = Field(default=None, max_length=16)
    physical_address: str | None = Field(default=None, max_length=255)
    building: str | None = Field(default=None, max_length=128)
    room_number: str | None = Field(default=None, max_length=64)
    operating_hours: dict[str, Any] | None = None
    contact_person_id: uuid.UUID | None = None
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    is_main: bool = False
    is_public: bool = True
    status: str = Field(default="active", max_length=32)


class ContactDirectoryUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    contact_type: str | None = Field(default=None, max_length=64)
    email: EmailStr | None = None
    phone: list[str] | None = None
    extension: str | None = Field(default=None, max_length=16)
    physical_address: str | None = Field(default=None, max_length=255)
    building: str | None = Field(default=None, max_length=128)
    room_number: str | None = Field(default=None, max_length=64)
    operating_hours: dict[str, Any] | None = None
    contact_person_id: uuid.UUID | None = None
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    is_main: bool | None = None
    is_public: bool | None = None
    status: str | None = Field(default=None, max_length=32)


class ContactDirectoryRead(BaseReadSchema):
    name: str
    contact_type: str | None = None
    email: str | None = None
    phone: list[str] | None = None
    extension: str | None = None
    physical_address: str | None = None
    building: str | None = None
    room_number: str | None = None
    operating_hours: dict[str, Any] | None = None
    contact_person_id: uuid.UUID | None = None
    scope_type: str | None = None
    scope_id: uuid.UUID | None = None
    is_main: bool
    is_public: bool
    status: str
    deleted_at: datetime | None = None


class SupportTicketCreate(BaseSchema):
    requester_name: str | None = Field(default=None, max_length=255)
    requester_email: EmailStr | None = None
    requester_phone: str | None = Field(default=None, max_length=24)
    subject: str = Field(min_length=1, max_length=255)
    description_plain_text: str | None = None
    description_rich_text: str | None = None
    description_structured: dict[str, Any] | None = None
    ticket_type: str | None = Field(default=None, max_length=64)
    category: str | None = Field(default=None, max_length=64)
    priority: str = Field(default="medium", max_length=32)
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    meta_data: dict[str, Any] | None = None


class SupportTicketUpdate(BaseSchema):
    subject: str | None = Field(default=None, min_length=1, max_length=255)
    description_plain_text: str | None = None
    description_rich_text: str | None = None
    description_structured: dict[str, Any] | None = None
    ticket_type: str | None = Field(default=None, max_length=64)
    category: str | None = Field(default=None, max_length=64)
    priority: str | None = Field(default=None, max_length=32)
    status: str | None = Field(default=None, max_length=32)
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    assigned_to_user_id: uuid.UUID | None = None
    resolution: str | None = None
    resolved_at: datetime | None = None
    meta_data: dict[str, Any] | None = None


class SupportTicketRead(BaseReadSchema):
    requester_user_id: uuid.UUID | None = None
    requester_name: str | None = None
    requester_email: str | None = None
    requester_phone: str | None = None
    subject: str
    description_plain_text: str | None = None
    description_rich_text: str | None = None
    description_structured: dict[str, Any] | None = None
    ticket_type: str | None = None
    category: str | None = None
    priority: str
    status: str
    scope_type: str | None = None
    scope_id: uuid.UUID | None = None
    assigned_to_user_id: uuid.UUID | None = None
    resolution: str | None = None
    resolved_at: datetime | None = None
    meta_data: dict[str, Any] | None = None
    is_public: bool
    deleted_at: datetime | None = None
