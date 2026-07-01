"""Schemas for core research models: centers, farms, programs, projects."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from typing import Any, Optional

from pydantic import Field

from .base import (
    BaseSchema,
    BaseReadSchema,
    SEOFieldsMixin,
    SlugMixin,
    StatusMixin,
    SlugStr,
    CodeStr,
    UrlStr,
    EmailField,
    PhoneStr,
)


# ============================================================================
# Research Center
# ============================================================================


class ResearchCenterBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    acronym: str | None = Field(None, max_length=32)
    center_type: str = Field(default="research_center", max_length=32)
    school_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    director_id: uuid.UUID | None = None
    established_date: date | None = None
    about: str | None = None
    mission: str | None = None
    vision: str | None = None
    objectives: str | None = None
    mandate: str | None = None
    research_areas: str | None = None
    location: str | None = Field(None, max_length=255)
    address: str | None = None
    gps_latitude: float | None = None
    gps_longitude: float | None = None
    email: EmailField | None = None
    phone: PhoneStr | None = None
    website: UrlStr | None = None
    logo_image_url: UrlStr | None = None
    cover_image_url: UrlStr | None = None
    gallery: list[dict] | None = None
    social_links: dict | None = None


class ResearchCenterCreate(ResearchCenterBase, StatusMixin):
    pass


class ResearchCenterUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    code: str | None = Field(None, max_length=32)
    acronym: str | None = Field(None, max_length=32)
    center_type: str | None = Field(None, max_length=32)
    director_id: uuid.UUID | None = None
    about: str | None = None
    mission: str | None = None
    vision: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class ResearchCenterRead(ResearchCenterBase, BaseReadSchema, StatusMixin):
    team_members: list[dict[str, Any]] | None = None
    programs: list[dict[str, Any]] | None = None
    projects: list[dict[str, Any]] | None = None
    farms: list[dict[str, Any]] | None = None


class ResearchCenterList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    acronym: str | None
    center_type: str
    location: str | None
    logo_image_url: str | None
    is_active: bool
    is_featured: bool


# ============================================================================
# Research Farm
# ============================================================================


class ResearchFarmBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    center_id: uuid.UUID | None = None
    farm_type: str = Field(default="mixed", max_length=32)
    about: str | None = None
    activities: str | None = None
    products: str | None = None
    facilities: str | None = None
    size_hectares: Decimal | None = None
    capacity_info: str | None = None
    location: str | None = Field(None, max_length=255)
    county: str | None = Field(None, max_length=128)
    address: str | None = None
    gps_latitude: float | None = None
    gps_longitude: float | None = None
    manager_name: str | None = Field(None, max_length=255)
    email: EmailField | None = None
    phone: PhoneStr | None = None
    cover_image_url: UrlStr | None = None
    gallery: list[dict] | None = None


class ResearchFarmCreate(ResearchFarmBase, StatusMixin):
    is_public: bool = True


class ResearchFarmUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    code: str | None = Field(None, max_length=32)
    center_id: uuid.UUID | None = None
    farm_type: str | None = None
    about: str | None = None
    activities: str | None = None
    products: str | None = None
    facilities: str | None = None
    size_hectares: Decimal | None = None
    capacity_info: str | None = None
    location: str | None = Field(None, max_length=255)
    county: str | None = Field(None, max_length=128)
    address: str | None = None
    gps_latitude: float | None = None
    gps_longitude: float | None = None
    manager_name: str | None = Field(None, max_length=255)
    email: EmailField | None = None
    phone: PhoneStr | None = None
    cover_image_url: UrlStr | None = None
    gallery: list[dict] | None = None
    is_active: bool | None = None
    is_public: bool | None = None


class ResearchFarmRead(ResearchFarmBase, BaseReadSchema, StatusMixin):
    is_public: bool
    center: dict[str, Any] | None = None


class ResearchFarmList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    farm_type: str
    location: str | None
    cover_image_url: str | None
    is_active: bool


# ============================================================================
# Research Program
# ============================================================================


class ResearchProgramBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    center_id: uuid.UUID | None = None
    lead_id: uuid.UUID | None = None
    start_date: date | None = None
    end_date: date | None = None
    summary: str | None = None
    description: str | None = None
    objectives: str | None = None
    expected_outcomes: str | None = None
    methodology: str | None = None
    budget: Decimal | None = None
    currency: str = Field(default="KES", max_length=3)
    cover_image_url: UrlStr | None = None
    status: str = Field(default="active", max_length=32)


class ResearchProgramCreate(ResearchProgramBase, StatusMixin):
    pass


class ResearchProgramUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    lead_id: uuid.UUID | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None


class ResearchProgramRead(ResearchProgramBase, BaseReadSchema, StatusMixin):
    center: dict[str, Any] | None = None
    projects: list[dict[str, Any]] | None = None


class ResearchProgramList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    status: str
    start_date: date | None
    end_date: date | None
    cover_image_url: str | None
    is_active: bool
    is_featured: bool


# ============================================================================
# Research Project
# ============================================================================


class ResearchProjectBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    code: str | None = Field(None, max_length=32)
    program_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    farm_id: uuid.UUID | None = None
    pi_id: uuid.UUID | None = None
    project_type: str = Field(default="applied", max_length=32)
    start_date: date | None = None
    end_date: date | None = None
    summary: str | None = None
    abstract: str | None = None
    background: str | None = None
    objectives: str | None = None
    methodology: str | None = None
    expected_outcomes: str | None = None
    impact: str | None = None
    deliverables: str | None = None
    budget: Decimal | None = None
    currency: str = Field(default="KES", max_length=3)
    grant_id: uuid.UUID | None = None
    cover_image_url: UrlStr | None = None
    gallery: list[dict] | None = None
    documents: list[dict] | None = None
    status: str = Field(default="ongoing", max_length=32)
    progress_percentage: int = Field(default=0, ge=0, le=100)


class ResearchProjectCreate(ResearchProjectBase, StatusMixin):
    is_public: bool = True


class ResearchProjectUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    code: str | None = Field(None, max_length=32)
    program_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    farm_id: uuid.UUID | None = None
    pi_id: uuid.UUID | None = None
    project_type: str | None = Field(None, max_length=32)
    start_date: date | None = None
    end_date: date | None = None
    summary: str | None = None
    abstract: str | None = None
    background: str | None = None
    objectives: str | None = None
    methodology: str | None = None
    expected_outcomes: str | None = None
    impact: str | None = None
    deliverables: str | None = None
    budget: Decimal | None = None
    currency: str | None = Field(None, max_length=3)
    grant_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    gallery_media_ids: list[uuid.UUID] | None = None
    attachment_media_ids: list[uuid.UUID] | None = None
    document_media_ids: list[uuid.UUID] | None = None
    meta_title: str | None = Field(None, max_length=255)
    meta_description: str | None = Field(None, max_length=500)
    keywords: dict | None = None
    status: str | None = None
    progress_percentage: int | None = Field(None, ge=0, le=100)
    is_active: bool | None = None
    is_featured: bool | None = None
    is_public: bool | None = None
    display_order: int | None = None


class ResearchProjectRead(ResearchProjectBase, BaseReadSchema, StatusMixin):
    is_public: bool
    program: dict[str, Any] | None = None
    center: dict[str, Any] | None = None
    farm: dict[str, Any] | None = None
    team_members: list[dict[str, Any]] | None = None


class ResearchProjectList(BaseReadSchema):
    title: str
    slug: str
    code: str | None
    project_type: str
    status: str
    progress_percentage: int
    start_date: date | None
    end_date: date | None
    cover_image_url: str | None
    is_active: bool
    is_featured: bool


# ============================================================================
# Team Members
# ============================================================================


class ProjectTeamMemberBase(BaseSchema):
    project_id: uuid.UUID
    person_id: uuid.UUID
    role: str = Field(default="researcher", max_length=64)
    title: str | None = Field(None, max_length=128)
    responsibilities: str | None = None
    joined_date: date | None = None
    left_date: date | None = None
    is_active: bool = True
    display_order: int = 100


class ProjectTeamMemberCreate(ProjectTeamMemberBase):
    pass


class ProjectTeamMemberUpdate(BaseSchema):
    role: str | None = Field(None, max_length=64)
    title: str | None = Field(None, max_length=128)
    responsibilities: str | None = None
    is_active: bool | None = None


class ProjectTeamMemberRead(ProjectTeamMemberBase, BaseReadSchema):
    project: dict[str, Any] | None = None


class CenterTeamMemberBase(BaseSchema):
    center_id: uuid.UUID
    person_id: uuid.UUID
    role: str = Field(default="researcher", max_length=64)
    title: str | None = Field(None, max_length=128)
    responsibilities: str | None = None
    joined_date: date | None = None
    left_date: date | None = None
    is_active: bool = True
    display_order: int = 100


class CenterTeamMemberCreate(CenterTeamMemberBase):
    pass


class CenterTeamMemberUpdate(BaseSchema):
    role: str | None = Field(None, max_length=64)
    title: str | None = Field(None, max_length=128)
    is_active: bool | None = None


class CenterTeamMemberRead(CenterTeamMemberBase, BaseReadSchema):
    center: dict[str, Any] | None = None
