"""Pydantic v2 schemas for LibraryInquiry, SupportTicket, SavedPublication, and LibraryRegulation."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from .library import LibraryOut


# ── LibraryInquiry (Ask Librarian) ────────────────────────────────────────────


class LibraryInquiryCreate(BaseModel):
    library_id: Optional[uuid.UUID] = None
    sender_name: str
    sender_email: EmailStr
    sender_phone: Optional[str] = None
    subject: str
    message: str


class LibraryInquiryReply(BaseModel):
    reply_message: str


class LibraryInquiryUpdate(BaseModel):
    status: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {"open", "in_progress", "replied", "closed"}
        if v not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v


class LibraryInquiryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    library_id: Optional[uuid.UUID] = None
    library: Optional[LibraryOut] = None
    sender_name: str
    sender_email: str
    sender_phone: Optional[str] = None
    person_id: Optional[uuid.UUID] = None
    subject: str
    message: str
    status: str
    replied_at: Optional[datetime] = None
    reply_message: Optional[str] = None
    replied_by_person_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


# ── SupportTicket ─────────────────────────────────────────────────────────────


class SupportTicketCreate(BaseModel):
    requester_email: Optional[EmailStr] = None
    requester_name: Optional[str] = None
    subject: str
    description: str
    target_entity_type: Optional[str] = None
    target_entity_id: Optional[uuid.UUID] = None
    priority: str = "medium"
    category: str = "other"

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        allowed = {"low", "medium", "high", "critical"}
        if v not in allowed:
            raise ValueError(f"priority must be one of {allowed}")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        allowed = {
            "library_service",
            "access_issue",
            "resource_request",
            "complaint",
            "other",
        }
        if v not in allowed:
            raise ValueError(f"category must be one of {allowed}")
        return v


class SupportTicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to_person_id: Optional[uuid.UUID] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    meta: Optional[dict] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {"open", "in_progress", "resolved", "closed", "rejected"}
        if v not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v


class SupportTicketTargetSummary(BaseModel):
    id: uuid.UUID
    type: str
    label: str
    description: Optional[str] = None


class SupportTicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    requester_person_id: Optional[uuid.UUID] = None
    requester_email: Optional[str] = None
    requester_name: Optional[str] = None
    subject: str
    description: str
    target_entity_type: Optional[str] = None
    target_entity_id: Optional[uuid.UUID] = None
    target: Optional[SupportTicketTargetSummary] = None
    status: str
    priority: str
    category: str
    assigned_to_person_id: Optional[uuid.UUID] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    meta: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


# ── SavedPublication ──────────────────────────────────────────────────────────


class SavedPublicationCreate(BaseModel):
    source: str
    external_id: Optional[str] = None
    internal_publication_id: Optional[uuid.UUID] = None
    cached_metadata: Optional[dict] = None
    notes: Optional[str] = None
    reading_status: str = "unread"

    @field_validator("source")
    @classmethod
    def validate_source(cls, v: str) -> str:
        allowed = {"internal", "crossref", "openalex", "pubmed", "doaj", "other"}
        if v not in allowed:
            raise ValueError(f"source must be one of {allowed}")
        return v

    @field_validator("reading_status")
    @classmethod
    def validate_reading_status(cls, v: str) -> str:
        allowed = {"unread", "reading", "completed"}
        if v not in allowed:
            raise ValueError(f"reading_status must be one of {allowed}")
        return v


class SavedPublicationUpdate(BaseModel):
    notes: Optional[str] = None
    reading_status: Optional[str] = None
    cached_metadata: Optional[dict] = None


class SavedPublicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    person_id: uuid.UUID
    source: str
    external_id: Optional[str] = None
    internal_publication_id: Optional[uuid.UUID] = None
    cached_metadata: Optional[dict] = None
    notes: Optional[str] = None
    reading_status: str
    created_at: datetime
    updated_at: datetime


# ── LibraryRegulation ─────────────────────────────────────────────────────────


class LibraryRegulationCreate(BaseModel):
    library_id: Optional[uuid.UUID] = None
    title: str
    category: Optional[str] = None
    content: str
    effective_date: Optional[date] = None
    document_id: Optional[uuid.UUID] = None
    status: str = "active"

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {"general", "borrowing", "conduct", "access", "fees", "other"}
        if v not in allowed:
            raise ValueError(f"category must be one of {allowed}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"draft", "active", "archived"}
        if v not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v


class LibraryRegulationUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    effective_date: Optional[date] = None
    document_id: Optional[uuid.UUID] = None
    status: Optional[str] = None


class LibraryRegulationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    library_id: Optional[uuid.UUID] = None
    title: str
    category: Optional[str] = None
    content: str
    effective_date: Optional[date] = None
    document_id: Optional[uuid.UUID] = None
    status: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
