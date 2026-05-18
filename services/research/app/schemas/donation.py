"""Schemas for donation models."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, EmailField, PhoneStr, SEOFieldsMixin, SlugMixin, SlugStr, StatusMixin, UrlStr


class DonorBase(BaseSchema):
    user_id: uuid.UUID | None = None
    donor_type: str = Field(default="individual", max_length=32)
    first_name: str | None = Field(None, max_length=128)
    last_name: str | None = Field(None, max_length=128)
    title: str | None = Field(None, max_length=32)
    organization_name: str | None = Field(None, max_length=255)
    organization_type: str | None = Field(None, max_length=64)
    display_name: str | None = Field(None, max_length=255)
    is_anonymous: bool = False
    email: EmailField | None = None
    phone: PhoneStr | None = None
    address: str | None = None
    city: str | None = Field(None, max_length=128)
    country: str | None = Field(None, max_length=128)
    communication_preferences: dict | None = None
    interests: list[str] | None = None
    tier: str | None = Field(None, max_length=32)
    notes: str | None = None
    photo_url: UrlStr | None = None
    logo_url: UrlStr | None = None


class DonorCreate(DonorBase):
    is_active: bool = True


class DonorUpdate(BaseSchema):
    display_name: str | None = Field(None, max_length=255)
    is_anonymous: bool | None = None
    tier: str | None = None
    notes: str | None = None
    is_active: bool | None = None


class DonorRead(DonorBase, BaseReadSchema):
    total_donated: Decimal
    donation_count: int
    first_donation_date: date | None
    last_donation_date: date | None
    is_active: bool


class DonorList(BaseReadSchema):
    donor_type: str
    display_name: str | None
    organization_name: str | None
    tier: str | None
    total_donated: Decimal
    donation_count: int
    is_active: bool


class DonationBase(BaseSchema):
    donor_id: uuid.UUID
    amount: Decimal
    currency: str = Field(default="KES", max_length=3)
    amount_usd: Decimal | None = None
    donation_type: str = Field(default="one_time", max_length=32)
    designation: str = Field(default="unrestricted", max_length=32)
    purpose: str | None = Field(None, max_length=255)
    fund_id: uuid.UUID | None = None
    project_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    scholarship_id: uuid.UUID | None = None
    payment_method: str | None = Field(None, max_length=32)
    payment_reference: str | None = Field(None, max_length=128)
    payment_provider: str | None = Field(None, max_length=64)
    donation_date: date
    received_date: date | None = None
    message: str | None = None
    dedication: str | None = None
    is_tribute: bool = False
    tribute_type: str | None = Field(None, max_length=32)
    tribute_name: str | None = Field(None, max_length=255)
    is_public: bool = False
    is_tax_deductible: bool = True
    receipt_number: str | None = Field(None, max_length=64)
    receipt_sent: bool = False
    receipt_sent_at: datetime | None = None
    notes: str | None = None


class DonationCreate(DonationBase):
    status: str = Field(default="completed", max_length=32)


class DonationUpdate(BaseSchema):
    amount: Decimal | None = None
    received_date: date | None = None
    receipt_sent: bool | None = None
    receipt_sent_at: datetime | None = None
    status: str | None = None
    notes: str | None = None


class DonationRead(DonationBase, BaseReadSchema):
    donation_number: str | None
    status: str


class DonationList(BaseReadSchema):
    donor_id: uuid.UUID
    donation_number: str | None
    amount: Decimal
    currency: str
    donation_type: str
    donation_date: date
    status: str
    is_public: bool


class DonationSettingsBase(BaseSchema):
    key: str = Field(max_length=128)
    value: str | None = None
    value_json: dict | None = None
    setting_type: str = Field(default="general", max_length=32)
    description: str | None = None


class DonationSettingsCreate(DonationSettingsBase):
    is_active: bool = True


class DonationSettingsUpdate(BaseSchema):
    value: str | None = None
    value_json: dict | None = None
    description: str | None = None
    is_active: bool | None = None


class DonationSettingsRead(DonationSettingsBase, BaseReadSchema):
    is_active: bool


class DonationImpactBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    impact_type: str = Field(default="project", max_length=32)
    project_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    scholarship_id: uuid.UUID | None = None
    fund_id: uuid.UUID | None = None
    summary: str | None = None
    description: str | None = None
    achievements: str | None = None
    beneficiaries: str | None = None
    total_raised: Decimal | None = None
    total_spent: Decimal | None = None
    currency: str = Field(default="KES", max_length=3)
    beneficiary_count: int | None = None
    metrics: list[dict] | None = None
    period_start: date | None = None
    period_end: date | None = None
    reporting_year: int | None = None
    quotes: list[dict] | None = None
    video_url: UrlStr | None = None
    cover_image_url: UrlStr | None = None
    attachments: list[dict] | None = None
    status: str = Field(default="published", max_length=32)


class DonationImpactCreate(DonationImpactBase, StatusMixin):
    pass


class DonationImpactUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    reporting_year: int | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class DonationImpactRead(DonationImpactBase, BaseReadSchema, StatusMixin):
    pass


class DonationImpactList(BaseReadSchema):
    title: str
    slug: str
    impact_type: str
    reporting_year: int | None
    total_raised: Decimal | None
    status: str
    is_active: bool
    is_featured: bool


class DonationStoryBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    donor_id: uuid.UUID | None = None
    donor_name: str | None = Field(None, max_length=255)
    donor_title: str | None = Field(None, max_length=128)
    donor_organization: str | None = Field(None, max_length=255)
    summary: str | None = None
    story: str | None = None
    motivation: str | None = None
    impact_witnessed: str | None = None
    quote: str | None = None
    video_url: UrlStr | None = None
    photo_url: UrlStr | None = None
    status: str = Field(default="published", max_length=32)


class DonationStoryCreate(DonationStoryBase, StatusMixin):
    pass


class DonationStoryUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    quote: str | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class DonationStoryRead(DonationStoryBase, BaseReadSchema, StatusMixin):
    pass


class DonationStoryList(BaseReadSchema):
    title: str
    slug: str
    donor_name: str | None
    donor_organization: str | None
    status: str
    is_active: bool
    is_featured: bool

