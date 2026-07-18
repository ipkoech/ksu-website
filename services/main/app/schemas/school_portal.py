"""Schemas for the authenticated, school-scoped portal bootstrap."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Literal

from pydantic import ConfigDict, EmailStr, Field

from .base import BaseSchema, PhoneStr, UrlStr


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
    link_id: uuid.UUID | None = None
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


class SchoolPortalProfileUpdate(BaseSchema):
    """Editable school profile fields; identity and ownership are server controlled."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    establishment_date: date | None = None
    about: str | None = None
    head_message: str | None = None
    mission: str | None = None
    vision: str | None = None
    mandate: str | None = None
    core_values: str | None = None
    email: EmailStr | None = None
    phone: PhoneStr | None = None
    office_location: str | None = Field(default=None, max_length=255)
    website: UrlStr | None = None
    is_public: bool | None = None


class SchoolPortalDeanUpdate(BaseSchema):
    person_id: uuid.UUID
    reassign_existing: bool = False


class SchoolPortalMediaLinkCreate(BaseSchema):
    media_id: uuid.UUID
    role: Literal["logo", "cover", "brochure", "gallery"]
    display_order: int = Field(default=100, ge=0)


class SchoolPortalProfileResponse(BaseSchema):
    id: uuid.UUID
    name: str
    slug: str
    code: str
    school_type: str
    campus_id: uuid.UUID | None = None
    administrative_wing_id: uuid.UUID | None = None
    dean_id: uuid.UUID | None = None
    establishment_date: date | None = None
    about: str | None = None
    head_message: str | None = None
    mission: str | None = None
    vision: str | None = None
    mandate: str | None = None
    core_values: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    office_location: str | None = None
    website: str | None = None
    logo_image_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    is_active: bool
    is_public: bool
    logo_image: SchoolPortalMediaSummary | None = None
    cover_image: SchoolPortalMediaSummary | None = None
    brochure: SchoolPortalMediaSummary | None = None
    gallery: list[SchoolPortalMediaSummary] = Field(default_factory=list)


__all__ = [
    "SchoolPortalCapabilitiesResponse",
    "SchoolPortalContextResponse",
    "SchoolPortalDeanUpdate",
    "SchoolPortalDepartmentSummary",
    "SchoolPortalEntitySummary",
    "SchoolPortalMediaSummary",
    "SchoolPortalMediaLinkCreate",
    "SchoolPortalPersonSummary",
    "SchoolPortalSchoolSummary",
    "SchoolPortalProfileResponse",
    "SchoolPortalProfileUpdate",
    "SchoolPortalUserSummary",
]
