"""Read models for Research-owned partner projections."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from .base import BaseSchema


class PartnerListSnapshot(BaseSchema):
    id: uuid.UUID
    name: str
    slug: str
    acronym: str | None = None
    partner_type: str
    country: str | None = None
    status: str
    is_active: bool
    is_featured: bool


class PartnerDetailSnapshot(PartnerListSnapshot):
    partnership_level: str | None = None
    about: str | None = None
    collaboration_areas: str | None = None
    key_achievements: str | None = None
    website: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    contact_person_name: str | None = None
    contact_person_title: str | None = None
    contact_person_email: str | None = None
    partnership_start: date | None = None
    partnership_end: date | None = None
    mou_signed_date: date | None = None
    mou_expiry_date: date | None = None
    social_links: dict | None = None
    cover_image_url: str | None = None
    logo_url: str | None = None
    document_url: str | None = None
    display_order: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class PartnerPageRead(BaseSchema):
    items: list[PartnerListSnapshot]
    meta: dict


__all__ = ["PartnerDetailSnapshot", "PartnerListSnapshot", "PartnerPageRead"]
