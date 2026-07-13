"""Restricted schemas for the public contact-directory aggregate."""

from __future__ import annotations

from pydantic import BaseModel, Field

from .academic import CampusRead
from .base import BaseReadSchema
from .support import ContactDirectoryRead, FAQRead


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


class ContactDirectoryPaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    pages: int


class PublicContactDirectoryPage(BaseModel):
    items: list[ContactDirectoryRead] = Field(default_factory=list)
    meta: ContactDirectoryPaginationMeta


class PublicContactDirectoryRead(BaseModel):
    institution: PublicUniversityContactSummary | None = None
    main_contacts: list[ContactDirectoryRead] = Field(default_factory=list)
    contacts: PublicContactDirectoryPage
    campuses: list[CampusRead] = Field(default_factory=list)
    faqs: list[FAQRead] = Field(default_factory=list)


__all__ = [
    "ContactDirectoryPaginationMeta",
    "PublicContactDirectoryPage",
    "PublicContactDirectoryRead",
    "PublicUniversityContactSummary",
]
