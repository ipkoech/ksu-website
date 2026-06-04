"""University info schemas."""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, Field

from .base import BaseReadSchema, BaseSchema, PhoneStr, SlugStr, UrlStr


class HeadMessageItem(BaseModel):
    role_key: str = Field(min_length=1, max_length=64)
    title: str = Field(min_length=1, max_length=255)
    person_id: uuid.UUID | None = None
    message: str = Field(min_length=1)
    display_order: int = 100
    is_active: bool = True


class UniversityInfoCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    short_name: str | None = Field(default=None, max_length=128)
    acronym: str | None = Field(default=None, max_length=32)
    slug: SlugStr | None = None
    motto: str | None = Field(default=None, max_length=255)
    overview: str | None = None
    vision: str | None = None
    mission: str | None = None
    core_values: str | None = None
    founding_year: int | None = Field(default=None, ge=1800, le=2100)
    institution_type: str | None = Field(default=None, max_length=64)
    charter_summary: str | None = None
    history_summary: str | None = None
    email: str | None = None
    phone: PhoneStr | None = None
    alternate_phone: PhoneStr | None = None
    website: UrlStr | None = None
    postal_address: str | None = None
    physical_address: str | None = None
    city: str | None = Field(default=None, max_length=128)
    county: str | None = Field(default=None, max_length=128)
    country: str | None = Field(default=None, max_length=128)
    social_links: dict | None = None
    quick_facts: dict | None = None
    strategic_priorities: list[dict] | None = None
    logo_id: uuid.UUID | None = None
    seal_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    main_campus_id: uuid.UUID | None = None
    chancellor_id: uuid.UUID | None = None
    vc_id: uuid.UUID | None = None
    council_chair_id: uuid.UUID | None = None
    chancellor_message_title: str | None = Field(default=None, max_length=255)
    chancellor_message: str | None = None
    vc_message_title: str | None = Field(default=None, max_length=255)
    vc_message: str | None = None
    council_chair_message_title: str | None = Field(default=None, max_length=255)
    council_chair_message: str | None = None
    additional_head_messages: list[HeadMessageItem] | None = None
    is_public: bool = True
    is_active: bool = True


class UniversityInfoUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    short_name: str | None = Field(default=None, max_length=128)
    acronym: str | None = Field(default=None, max_length=32)
    slug: SlugStr | None = None
    motto: str | None = Field(default=None, max_length=255)
    overview: str | None = None
    vision: str | None = None
    mission: str | None = None
    core_values: str | None = None
    founding_year: int | None = Field(default=None, ge=1800, le=2100)
    institution_type: str | None = Field(default=None, max_length=64)
    charter_summary: str | None = None
    history_summary: str | None = None
    email: str | None = None
    phone: PhoneStr | None = None
    alternate_phone: PhoneStr | None = None
    website: UrlStr | None = None
    postal_address: str | None = None
    physical_address: str | None = None
    city: str | None = Field(default=None, max_length=128)
    county: str | None = Field(default=None, max_length=128)
    country: str | None = Field(default=None, max_length=128)
    social_links: dict | None = None
    quick_facts: dict | None = None
    strategic_priorities: list[dict] | None = None
    logo_id: uuid.UUID | None = None
    seal_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    main_campus_id: uuid.UUID | None = None
    chancellor_id: uuid.UUID | None = None
    vc_id: uuid.UUID | None = None
    council_chair_id: uuid.UUID | None = None
    chancellor_message_title: str | None = Field(default=None, max_length=255)
    chancellor_message: str | None = None
    vc_message_title: str | None = Field(default=None, max_length=255)
    vc_message: str | None = None
    council_chair_message_title: str | None = Field(default=None, max_length=255)
    council_chair_message: str | None = None
    additional_head_messages: list[HeadMessageItem] | None = None
    is_public: bool | None = None
    is_active: bool | None = None


class UniversityInfoRead(BaseReadSchema):
    name: str
    short_name: str | None = None
    acronym: str | None = None
    slug: str
    motto: str | None = None
    overview: str | None = None
    vision: str | None = None
    mission: str | None = None
    core_values: str | None = None
    founding_year: int | None = None
    institution_type: str | None = None
    charter_summary: str | None = None
    history_summary: str | None = None
    email: str | None = None
    phone: str | None = None
    alternate_phone: str | None = None
    website: str | None = None
    postal_address: str | None = None
    physical_address: str | None = None
    city: str | None = None
    county: str | None = None
    country: str | None = None
    social_links: dict | None = None
    quick_facts: dict | None = None
    strategic_priorities: list[dict] | None = None
    logo_id: uuid.UUID | None = None
    seal_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    main_campus_id: uuid.UUID | None = None
    chancellor_id: uuid.UUID | None = None
    vc_id: uuid.UUID | None = None
    council_chair_id: uuid.UUID | None = None
    chancellor_message_title: str | None = None
    chancellor_message: str | None = None
    vc_message_title: str | None = None
    vc_message: str | None = None
    council_chair_message_title: str | None = None
    council_chair_message: str | None = None
    additional_head_messages: list[HeadMessageItem] | None = None
    is_public: bool
    brochure: dict[str, Any] | None = None
    chancellor: dict[str, Any] | None = None
    council_chair: dict[str, Any] | None = None
    cover_image: dict[str, Any] | None = None
    logo: dict[str, Any] | None = None
    main_campus: dict[str, Any] | None = None
    seal: dict[str, Any] | None = None
    vc: dict[str, Any] | None = None
    is_active: bool


__all__ = [
    "HeadMessageItem",
    "UniversityInfoCreate",
    "UniversityInfoUpdate",
    "UniversityInfoRead",
]
