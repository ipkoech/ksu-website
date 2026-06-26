"""Schemas for research support models."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Any

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, EmailField, PhoneStr, SEOFieldsMixin, SlugMixin, SlugStr, StatusMixin, UrlStr


class ResearchOfficeBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    department_id: uuid.UUID | None = None
    director_id: uuid.UUID | None = None
    about: str | None = None
    mandate: str | None = None
    mission: str | None = None
    vision: str | None = None
    objectives: str | None = None
    functions: str | None = None
    services_summary: str | None = None
    leadership_message: str | None = None
    strategic_priorities: list[dict] | None = None
    location: str | None = Field(None, max_length=255)
    address: str | None = None
    email: EmailField | None = None
    phone: PhoneStr | None = None
    website: UrlStr | None = None
    social_links: dict | None = None
    logo_image_url: UrlStr | None = None
    cover_image_url: UrlStr | None = None
    attachments: list[dict] | None = None
    status: str = Field(default="active", max_length=32)


class ResearchOfficeCreate(ResearchOfficeBase, StatusMixin):
    pass


class ResearchOfficeUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    code: str | None = Field(None, max_length=32)
    department_id: uuid.UUID | None = None
    director_id: uuid.UUID | None = None
    about: str | None = None
    mandate: str | None = None
    mission: str | None = None
    vision: str | None = None
    objectives: str | None = None
    functions: str | None = None
    services_summary: str | None = None
    leadership_message: str | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class ResearchOfficeRead(ResearchOfficeBase, BaseReadSchema, StatusMixin):
    staff_members: list[dict[str, Any]] | None = None


class ResearchOfficeList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    department_id: uuid.UUID | None
    director_id: uuid.UUID | None
    status: str
    is_active: bool
    is_featured: bool


class ResearchResourceBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    resource_type: str = Field(default="equipment", max_length=32)
    category: str | None = Field(None, max_length=64)
    center_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    location: str | None = Field(None, max_length=255)
    room: str | None = Field(None, max_length=64)
    description: str | None = None
    specifications: str | None = None
    capabilities: str | None = None
    usage_guidelines: str | None = None
    training_required: str | None = None
    access_type: str = Field(default="internal", max_length=32)
    access_url: UrlStr | None = None
    booking_url: UrlStr | None = None
    availability: str | None = None
    operating_hours: str | None = Field(None, max_length=255)
    is_free: bool = True
    fee_structure: str | None = None
    contact_name: str | None = Field(None, max_length=255)
    contact_email: EmailField | None = None
    contact_phone: PhoneStr | None = None
    manager_id: uuid.UUID | None = None
    cover_image_url: UrlStr | None = None
    attachments: list[dict] | None = None
    status: str = Field(default="available", max_length=32)


class ResearchResourceCreate(ResearchResourceBase, StatusMixin):
    pass


class ResearchResourceUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class ResearchResourceRead(ResearchResourceBase, BaseReadSchema, StatusMixin):
    pass


class ResearchResourceList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    resource_type: str
    category: str | None
    location: str | None
    status: str
    is_active: bool
    is_featured: bool


class ResearchServiceBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    service_type: str = Field(default="support", max_length=32)
    category: str | None = Field(None, max_length=64)
    center_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    summary: str | None = None
    description: str | None = None
    scope: str | None = None
    process: str | None = None
    eligibility: str | None = None
    deliverables: str | None = None
    turnaround_time: str | None = Field(None, max_length=128)
    how_to_access: str | None = None
    request_url: UrlStr | None = None
    is_free: bool = True
    fee_structure: str | None = None
    contact_name: str | None = Field(None, max_length=255)
    contact_email: EmailField | None = None
    contact_phone: PhoneStr | None = None
    cover_image_url: UrlStr | None = None
    attachments: list[dict] | None = None


class ResearchServiceCreate(ResearchServiceBase, StatusMixin):
    pass


class ResearchServiceUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class ResearchServiceRead(ResearchServiceBase, BaseReadSchema, StatusMixin):
    pass


class ResearchServiceList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    service_type: str
    category: str | None
    is_free: bool
    is_active: bool
    is_featured: bool


class ResearchGuidelineBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    code: str | None = Field(None, max_length=32)
    guideline_type: str = Field(default="guideline", max_length=32)
    category: str = Field(default="general", max_length=64)
    summary: str | None = None
    content: str | None = None
    scope: str | None = None
    applicability: str | None = None
    document_name: str | None = Field(None, max_length=255)
    version: str | None = Field(None, max_length=32)
    approved_by: str | None = Field(None, max_length=255)
    approval_date: date | None = None
    effective_date: date | None = None
    review_date: date | None = None
    supersedes_id: uuid.UUID | None = None
    related_guideline_ids: list[uuid.UUID] | None = None
    contact_email: EmailField | None = None
    document_url: UrlStr | None = None
    status: str = Field(default="active", max_length=32)


class ResearchGuidelineCreate(ResearchGuidelineBase, StatusMixin):
    is_mandatory: bool = False


class ResearchGuidelineUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    version: str | None = None
    review_date: date | None = None
    status: str | None = None
    is_active: bool | None = None
    is_mandatory: bool | None = None
    display_order: int | None = None


class ResearchGuidelineRead(ResearchGuidelineBase, BaseReadSchema, StatusMixin):
    is_mandatory: bool


class ResearchGuidelineList(BaseReadSchema):
    title: str
    slug: str
    code: str | None
    guideline_type: str
    category: str
    version: str | None
    status: str
    is_active: bool
    is_mandatory: bool


class ResearchBoardBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    acronym: str | None = Field(None, max_length=32)
    board_type: str = Field(default="committee", max_length=32)
    about: str | None = None
    mandate: str | None = None
    responsibilities: str | None = None
    composition: str | None = None
    meeting_schedule: str | None = None
    chair_id: uuid.UUID | None = None
    secretary_name: str | None = Field(None, max_length=255)
    contact_email: EmailField | None = None
    contact_phone: PhoneStr | None = None
    document_url: UrlStr | None = None
    attachments: list[dict] | None = None


class ResearchBoardCreate(ResearchBoardBase):
    is_active: bool = True
    display_order: int = 100


class ResearchBoardUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    is_active: bool | None = None
    display_order: int | None = None


class ResearchBoardRead(ResearchBoardBase, BaseReadSchema):
    is_active: bool
    display_order: int
    members: list[dict[str, Any]] | None = None


class ResearchBoardList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    board_type: str
    acronym: str | None
    is_active: bool
    display_order: int


class BoardMemberBase(BaseSchema):
    board_id: uuid.UUID
    person_id: uuid.UUID | None = None
    name: str = Field(max_length=255)
    title: str | None = Field(None, max_length=128)
    affiliation: str | None = Field(None, max_length=255)
    email: EmailField | None = None
    bio: str | None = None
    role: str = Field(default="member", max_length=32)
    representation: str | None = Field(None, max_length=255)
    term_start: date | None = None
    term_end: date | None = None
    photo_url: UrlStr | None = None


class BoardMemberCreate(BoardMemberBase):
    is_active: bool = True
    display_order: int = 100


class BoardMemberUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    role: str | None = None
    term_end: date | None = None
    is_active: bool | None = None
    display_order: int | None = None


class BoardMemberRead(BoardMemberBase, BaseReadSchema):
    is_active: bool
    display_order: int
    board: dict[str, Any] | None = None
