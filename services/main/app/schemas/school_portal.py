"""Schemas for the authenticated, school-scoped portal bootstrap."""

from __future__ import annotations

import uuid

from pydantic import Field

from .base import BaseSchema


class SchoolPortalUserSummary(BaseSchema):
    id: uuid.UUID
    email: str
    full_name: str


class SchoolPortalEntitySummary(BaseSchema):
    id: uuid.UUID
    name: str
    code: str | None = None
    slug: str | None = None


class SchoolPortalPersonSummary(BaseSchema):
    id: uuid.UUID
    display_name: str


class SchoolPortalMediaSummary(BaseSchema):
    id: uuid.UUID
    url: str
    alt_text: str | None = None


class SchoolPortalDepartmentSummary(SchoolPortalEntitySummary):
    display_order: int = 100


class SchoolPortalSchoolSummary(SchoolPortalEntitySummary):
    school_type: str
    campus_id: uuid.UUID | None = None
    administrative_wing_id: uuid.UUID | None = None
    dean_id: uuid.UUID | None = None
    logo_image_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    is_active: bool
    is_public: bool
    campus: SchoolPortalEntitySummary | None = None
    administrative_wing: SchoolPortalEntitySummary | None = None
    dean: SchoolPortalPersonSummary | None = None
    logo_image: SchoolPortalMediaSummary | None = None
    cover_image: SchoolPortalMediaSummary | None = None
    brochure: SchoolPortalMediaSummary | None = None
    departments: list[SchoolPortalDepartmentSummary] = Field(default_factory=list)


class SchoolPortalContextResponse(BaseSchema):
    school: SchoolPortalSchoolSummary
    user: SchoolPortalUserSummary
    permissions: list[str]
    role_names: list[str]
    capabilities: dict[str, bool]
    allowed_navigation: list[str]


class SchoolPortalCapabilitiesResponse(BaseSchema):
    school_id: uuid.UUID
    permissions: list[str]
    capabilities: dict[str, bool]
    allowed_navigation: list[str]


__all__ = [
    "SchoolPortalCapabilitiesResponse",
    "SchoolPortalContextResponse",
    "SchoolPortalDepartmentSummary",
    "SchoolPortalEntitySummary",
    "SchoolPortalMediaSummary",
    "SchoolPortalPersonSummary",
    "SchoolPortalSchoolSummary",
    "SchoolPortalUserSummary",
]
