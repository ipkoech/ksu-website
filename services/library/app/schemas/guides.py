"""Pydantic v2 schemas for library guides, specialists, workflows, and policy pages."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


GUIDE_TYPES = {"subject", "course", "audience", "topic", "general"}
SECTION_TYPES = {"text", "resources", "links", "files", "contact"}
WORKFLOW_TYPES = {
    "remote_access",
    "borrowing",
    "borrowing_access",
    "repository_deposit",
    "digital_scholarship",
    "research_support",
    "citation_support",
    "inter_library_loan",
    "general",
}
POLICY_TYPES = {
    "privacy",
    "borrowing",
    "access",
    "accessibility",
    "copyright",
    "acceptable_use",
    "conduct",
    "fees",
    "general",
}
POLICY_STATUSES = {"draft", "active", "archived"}


# ── LibraryGuide ─────────────────────────────────────────────────────────────


class LibraryGuideBase(BaseModel):
    library_id: Optional[uuid.UUID] = None
    title: str
    slug: str
    summary: Optional[str] = None
    guide_type: str
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
        if v not in GUIDE_TYPES:
            raise ValueError(f"guide_type must be one of {GUIDE_TYPES}")
        return v


class LibraryGuideCreate(LibraryGuideBase):
    pass


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

    @field_validator("guide_type")
    @classmethod
    def validate_guide_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if v not in GUIDE_TYPES:
            raise ValueError(f"guide_type must be one of {GUIDE_TYPES}")
        return v


class LibraryGuideSectionBase(BaseModel):
    guide_id: Optional[uuid.UUID] = None
    heading: str
    content: str
    section_type: str = "text"
    resource_links: Optional[list[dict]] = None
    file_ids: Optional[list[str]] = None
    sort_order: int = 0
    is_active: bool = True

    @field_validator("file_ids", mode="before")
    @classmethod
    def normalize_file_ids(cls, v: object) -> object:
        if v is None or isinstance(v, (str, bytes)):
            return v
        return [str(file_id) for file_id in v]

    @field_validator("section_type")
    @classmethod
    def validate_section_type(cls, v: str) -> str:
        if v not in SECTION_TYPES:
            raise ValueError(f"section_type must be one of {SECTION_TYPES}")
        return v


class LibraryGuideSectionCreate(LibraryGuideSectionBase):
    pass


class LibraryGuideSectionUpdate(BaseModel):
    guide_id: Optional[uuid.UUID] = None
    heading: Optional[str] = None
    content: Optional[str] = None
    section_type: Optional[str] = None
    resource_links: Optional[list[dict]] = None
    file_ids: Optional[list[str]] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

    @field_validator("file_ids", mode="before")
    @classmethod
    def normalize_file_ids(cls, v: object) -> object:
        if v is None or isinstance(v, (str, bytes)):
            return v
        return [str(file_id) for file_id in v]

    @field_validator("section_type")
    @classmethod
    def validate_section_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if v not in SECTION_TYPES:
            raise ValueError(f"section_type must be one of {SECTION_TYPES}")
        return v


class LibraryGuideSectionOut(LibraryGuideSectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    guide_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class LibrarySpecialistBase(BaseModel):
    library_id: Optional[uuid.UUID] = None
    staff_id: uuid.UUID
    subjects: list[str] = Field(default_factory=list)
    schools: list[str] = Field(default_factory=list)
    departments: list[str] = Field(default_factory=list)
    support_areas: list[str] = Field(default_factory=list)
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


class LibraryGuideOut(LibraryGuideBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    sections: list[LibraryGuideSectionOut] = Field(default_factory=list)
    specialists: list[LibrarySpecialistOut] = Field(default_factory=list)


# ── LibraryWorkflow ──────────────────────────────────────────────────────────


class LibraryWorkflowStepBase(BaseModel):
    workflow_id: Optional[uuid.UUID] = None
    title: str
    instructions: str
    link_url: Optional[str] = None
    file_id: Optional[uuid.UUID] = None
    sort_order: int = 0
    is_active: bool = True


class LibraryWorkflowStepCreate(LibraryWorkflowStepBase):
    pass


class LibraryWorkflowStepUpdate(BaseModel):
    workflow_id: Optional[uuid.UUID] = None
    title: Optional[str] = None
    instructions: Optional[str] = None
    link_url: Optional[str] = None
    file_id: Optional[uuid.UUID] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class LibraryWorkflowStepOut(LibraryWorkflowStepBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    workflow_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class LibraryWorkflowBase(BaseModel):
    library_id: Optional[uuid.UUID] = None
    workflow_type: str
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
        if v not in WORKFLOW_TYPES:
            raise ValueError(f"workflow_type must be one of {WORKFLOW_TYPES}")
        return v


class LibraryWorkflowCreate(LibraryWorkflowBase):
    pass


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

    @field_validator("workflow_type")
    @classmethod
    def validate_workflow_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if v not in WORKFLOW_TYPES:
            raise ValueError(f"workflow_type must be one of {WORKFLOW_TYPES}")
        return v


class LibraryWorkflowOut(LibraryWorkflowBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    steps: list[LibraryWorkflowStepOut] = Field(default_factory=list)


# ── LibraryPolicyPage ────────────────────────────────────────────────────────


class LibraryPolicyPageBase(BaseModel):
    library_id: Optional[uuid.UUID] = None
    policy_type: str
    title: str
    slug: str
    content: str
    related_regulation_id: Optional[uuid.UUID] = None
    file_id: Optional[uuid.UUID] = None
    is_public: bool = True
    status: str = "active"
    sort_order: int = 0

    @field_validator("policy_type")
    @classmethod
    def validate_policy_type(cls, v: str) -> str:
        if v not in POLICY_TYPES:
            raise ValueError(f"policy_type must be one of {POLICY_TYPES}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in POLICY_STATUSES:
            raise ValueError(f"status must be one of {POLICY_STATUSES}")
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

    @field_validator("policy_type")
    @classmethod
    def validate_policy_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if v not in POLICY_TYPES:
            raise ValueError(f"policy_type must be one of {POLICY_TYPES}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if v not in POLICY_STATUSES:
            raise ValueError(f"status must be one of {POLICY_STATUSES}")
        return v


class LibraryPolicyPageOut(LibraryPolicyPageBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
