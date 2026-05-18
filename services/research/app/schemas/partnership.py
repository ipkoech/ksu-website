"""Schemas for partnership models."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from pydantic import Field

from .base import (
    BaseReadSchema,
    BaseSchema,
    EmailField,
    PhoneStr,
    SEOFieldsMixin,
    SlugMixin,
    SlugStr,
    StatusMixin,
    UrlStr,
)


class PartnerBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=255)
    acronym: str | None = Field(None, max_length=32)
    partner_type: str = Field(default="academic", max_length=32)
    partnership_level: str | None = Field(None, max_length=32)
    about: str | None = None
    collaboration_areas: str | None = None
    key_achievements: str | None = None
    website: UrlStr | None = None
    email: EmailField | None = None
    phone: PhoneStr | None = None
    address: str | None = None
    country: str | None = Field(None, max_length=128)
    contact_person_name: str | None = Field(None, max_length=255)
    contact_person_title: str | None = Field(None, max_length=128)
    contact_person_email: EmailField | None = None
    partnership_start: date | None = None
    partnership_end: date | None = None
    mou_signed_date: date | None = None
    mou_expiry_date: date | None = None
    social_links: dict | None = None
    cover_image_url: UrlStr | None = None
    logo_url: UrlStr | None = None
    document_url: UrlStr | None = None
    status: str = Field(default="active", max_length=32)


class PartnerCreate(PartnerBase, StatusMixin):
    pass


class PartnerUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    partnership_level: str | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class PartnerRead(PartnerBase, BaseReadSchema, StatusMixin):
    pass


class PartnerList(BaseReadSchema):
    name: str
    slug: str
    acronym: str | None
    partner_type: str
    country: str | None
    status: str
    is_active: bool
    is_featured: bool


class ConsultancyBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    code: str | None = Field(None, max_length=32)
    consultancy_type: str = Field(default="research", max_length=32)
    client_name: str | None = Field(None, max_length=255)
    client_type: str | None = Field(None, max_length=32)
    partner_id: uuid.UUID | None = None
    lead_consultant_id: uuid.UUID | None = None
    team_members: list[dict] | None = None
    center_id: uuid.UUID | None = None
    summary: str | None = None
    description: str | None = None
    objectives: str | None = None
    methodology: str | None = None
    deliverables: str | None = None
    outcomes: str | None = None
    impact: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    contract_value: Decimal | None = None
    currency: str = Field(default="KES", max_length=3)
    location: str | None = Field(None, max_length=255)
    country: str | None = Field(None, max_length=128)
    cover_image_url: UrlStr | None = None
    documents: list[dict] | None = None
    status: str = Field(default="ongoing", max_length=32)


class ConsultancyCreate(ConsultancyBase, StatusMixin):
    is_public: bool = True


class ConsultancyUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    status: str | None = None
    contract_value: Decimal | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    is_public: bool | None = None
    display_order: int | None = None


class ConsultancyRead(ConsultancyBase, BaseReadSchema, StatusMixin):
    is_public: bool


class ConsultancyList(BaseReadSchema):
    title: str
    slug: str
    code: str | None
    consultancy_type: str
    client_name: str | None
    status: str
    is_active: bool
    is_featured: bool

