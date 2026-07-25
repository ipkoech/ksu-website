"""Restricted schemas for the public contact-directory aggregate."""

from __future__ import annotations

import uuid

from pydantic import BaseModel, Field

from .base import BaseReadSchema
from .support import FAQRead


class PublicUniversityContactSummary(BaseReadSchema):
    name: str
    short_name: str | None = None
    acronym: str | None = None
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
    cover_image_id: uuid.UUID | None = None


class PublicContactDirectoryEntry(BaseReadSchema):
    name: str
    contact_type: str | None = None
    email: str | None = None
    phone: list[str] | None = None
    extension: str | None = None
    physical_address: str | None = None
    building: str | None = None
    room_number: str | None = None
    operating_hours: dict | None = None
    contact_person_id: uuid.UUID | None = None
    scope_type: str | None = None
    scope_id: uuid.UUID | None = None
    is_main: bool
    is_public: bool
    status: str


class PublicCampusContactSummary(BaseReadSchema):
    name: str
    slug: str
    code: str
    campus_type: str
    address: str | None = None
    city: str | None = None
    county: str | None = None
    postal_code: str | None = None
    gps_latitude: float | None = None
    gps_longitude: float | None = None
    description: str | None = None
    email: str | None = None
    phone: str | None = None
    cover_image_id: uuid.UUID | None = None
    is_active: bool
    display_order: int


class ContactDirectoryPaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    pages: int


class PublicContactDirectoryPage(BaseModel):
    items: list[PublicContactDirectoryEntry] = Field(default_factory=list)
    meta: ContactDirectoryPaginationMeta


class PublicContactDirectoryRead(BaseModel):
    institution: PublicUniversityContactSummary | None = None
    main_contacts: list[PublicContactDirectoryEntry] = Field(default_factory=list)
    contacts: PublicContactDirectoryPage
    campuses: list[PublicCampusContactSummary] = Field(default_factory=list)
    faqs: list[FAQRead] = Field(default_factory=list)


__all__ = [
    "ContactDirectoryPaginationMeta",
    "PublicCampusContactSummary",
    "PublicContactDirectoryEntry",
    "PublicContactDirectoryPage",
    "PublicContactDirectoryRead",
    "PublicUniversityContactSummary",
]
