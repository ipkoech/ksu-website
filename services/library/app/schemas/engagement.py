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
    is_public: bool = True

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
    is_public: Optional[bool] = None


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
    is_public: bool
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


# ── Library Guides, Specialists, Workflows, Policies ──────────────────────────


class LibrarySpecialistBase(BaseModel):
    library_id: Optional[uuid.UUID] = None
    staff_id: Optional[uuid.UUID] = None
    subjects: Optional[list[str]] = None
    schools: Optional[list[str]] = None
    departments: Optional[list[str]] = None
    support_areas: Optional[list[str]] = None
    booking_url: Optional[str] = None
    is_public: bool = True
    is_active: bool = True
    sort_order: int = 0


class LibrarySpecialistCreate(LibrarySpecialistBase):
    pass


class LibrarySpecialistUpdate(BaseModel):
    library_id: Optional[uuid.UUID] = None
    staff_id: Optional[uuid.UUID] = None
    subjects: Optional[list[str]] = None
    schools: Optional[list[str]] = None
    departments: Optional[list[str]] = None
    support_areas: Optional[list[str]] = None
    booking_url: Optional[str] = None
    is_public: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class LibrarySpecialistOut(LibrarySpecialistBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class LibraryGuideSectionBase(BaseModel):
    heading: str
    content: Optional[str] = None
    section_type: str = "text"
    resource_links: Optional[list[dict]] = None
    file_ids: Optional[list[str]] = None
    sort_order: int = 0
    is_active: bool = True


class LibraryGuideSectionCreate(LibraryGuideSectionBase):
    pass


class LibraryGuideSectionOut(LibraryGuideSectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    guide_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class LibraryGuideBase(BaseModel):
    library_id: Optional[uuid.UUID] = None
    title: str
    slug: str
    summary: Optional[str] = None
    guide_type: str = "subject"
    subject: Optional[str] = None
    course_code: Optional[str] = None
    audience: Optional[str] = None
    school_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    owner_staff_id: Optional[uuid.UUID] = None
    is_public: bool = True
    is_active: bool = True
    sort_order: int = 0

    @field_validator("guide_type")
    @classmethod
    def validate_guide_type(cls, v: str) -> str:
        allowed = {"subject", "course", "database", "research", "other"}
        if v not in allowed:
            raise ValueError(f"guide_type must be one of {allowed}")
        return v


class LibraryGuideCreate(LibraryGuideBase):
    sections: Optional[list[LibraryGuideSectionCreate]] = None
    specialist_ids: Optional[list[uuid.UUID]] = None


class LibraryGuideUpdate(BaseModel):
    library_id: Optional[uuid.UUID] = None
    title: Optional[str] = None
    slug: Optional[str] = None
    summary: Optional[str] = None
    guide_type: Optional[str] = None
    subject: Optional[str] = None
    course_code: Optional[str] = None
    audience: Optional[str] = None
    school_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    owner_staff_id: Optional[uuid.UUID] = None
    is_public: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    sections: Optional[list[LibraryGuideSectionCreate]] = None
    specialist_ids: Optional[list[uuid.UUID]] = None


class LibraryGuideOut(LibraryGuideBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    sections: list[LibraryGuideSectionOut] = []
    specialists: list[LibrarySpecialistOut] = []
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class LibraryWorkflowStepBase(BaseModel):
    title: str
    instructions: Optional[str] = None
    link_url: Optional[str] = None
    file_id: Optional[uuid.UUID] = None
    sort_order: int = 0
    is_active: bool = True


class LibraryWorkflowStepCreate(LibraryWorkflowStepBase):
    pass


class LibraryWorkflowStepOut(LibraryWorkflowStepBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workflow_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class LibraryWorkflowBase(BaseModel):
    library_id: Optional[uuid.UUID] = None
    workflow_type: str = "other"
    title: str
    slug: str
    summary: Optional[str] = None
    audience: Optional[str] = None
    is_public: bool = True
    is_active: bool = True
    sort_order: int = 0

    @field_validator("workflow_type")
    @classmethod
    def validate_workflow_type(cls, v: str) -> str:
        allowed = {"borrowing", "clearance", "research", "repository", "other"}
        if v not in allowed:
            raise ValueError(f"workflow_type must be one of {allowed}")
        return v


class LibraryWorkflowCreate(LibraryWorkflowBase):
    steps: Optional[list[LibraryWorkflowStepCreate]] = None


class LibraryWorkflowUpdate(BaseModel):
    library_id: Optional[uuid.UUID] = None
    workflow_type: Optional[str] = None
    title: Optional[str] = None
    slug: Optional[str] = None
    summary: Optional[str] = None
    audience: Optional[str] = None
    is_public: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    steps: Optional[list[LibraryWorkflowStepCreate]] = None


class LibraryWorkflowOut(LibraryWorkflowBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    steps: list[LibraryWorkflowStepOut] = []
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class LibraryPolicyPageBase(BaseModel):
    library_id: Optional[uuid.UUID] = None
    policy_type: str = "other"
    title: str
    slug: str
    content: Optional[str] = None
    related_regulation_id: Optional[uuid.UUID] = None
    file_id: Optional[uuid.UUID] = None
    is_public: bool = True
    status: str = "active"
    sort_order: int = 0

    @field_validator("policy_type")
    @classmethod
    def validate_policy_type(cls, v: str) -> str:
        allowed = {"borrowing", "access", "clearance", "repository", "other"}
        if v not in allowed:
            raise ValueError(f"policy_type must be one of {allowed}")
        return v

    @field_validator("status")
    @classmethod
    def validate_policy_status(cls, v: str) -> str:
        allowed = {"draft", "active", "archived"}
        if v not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v


class LibraryPolicyPageCreate(LibraryPolicyPageBase):
    pass


class LibraryPolicyPageUpdate(BaseModel):
    library_id: Optional[uuid.UUID] = None
    policy_type: Optional[str] = None
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    related_regulation_id: Optional[uuid.UUID] = None
    file_id: Optional[uuid.UUID] = None
    is_public: Optional[bool] = None
    status: Optional[str] = None
    sort_order: Optional[int] = None


class LibraryPolicyPageOut(LibraryPolicyPageBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
