"""Schemas for impact models."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, SEOFieldsMixin, SlugMixin, SlugStr, StatusMixin, UrlStr, EmailField


class SuccessStoryBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    story_type: str = Field(default="impact", max_length=32)
    project_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    innovation_id: uuid.UUID | None = None
    summary: str | None = None
    challenge: str | None = None
    solution: str | None = None
    approach: str | None = None
    outcomes: str | None = None
    impact: str | None = None
    lessons_learned: str | None = None
    future_directions: str | None = None
    beneficiaries: str | None = None
    beneficiary_count: int | None = None
    location: str | None = Field(None, max_length=255)
    county: str | None = Field(None, max_length=128)
    country: str | None = Field(None, max_length=128)
    quotes: list[dict] | None = None
    researchers: list[dict] | None = None
    video_url: UrlStr | None = None
    story_date: date | None = None
    published_at: date | None = None
    cover_image_url: UrlStr | None = None
    attachments: list[dict] | None = None
    status: str = Field(default="published", max_length=32)


class SuccessStoryCreate(SuccessStoryBase, StatusMixin):
    pass


class SuccessStoryUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    published_at: date | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class SuccessStoryRead(SuccessStoryBase, BaseReadSchema, StatusMixin):
    pass


class SuccessStoryList(BaseReadSchema):
    title: str
    slug: str
    story_type: str
    story_date: date | None
    published_at: date | None
    status: str
    is_active: bool
    is_featured: bool


class ImpactMetricBase(BaseSchema, SlugMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    metric_type: str = Field(default="output", max_length=32)
    category: str = Field(default="research", max_length=64)
    value: Decimal = 0
    unit: str | None = Field(None, max_length=64)
    target_value: Decimal | None = None
    baseline_value: Decimal | None = None
    description: str | None = None
    methodology: str | None = None
    data_source: str | None = Field(None, max_length=255)
    period_start: date | None = None
    period_end: date | None = None
    reporting_year: int | None = None
    project_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    program_id: uuid.UUID | None = None
    icon: str | None = Field(None, max_length=128)
    color: str | None = Field(None, max_length=32)


class ImpactMetricCreate(ImpactMetricBase, StatusMixin):
    pass


class ImpactMetricUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    value: Decimal | None = None
    target_value: Decimal | None = None
    reporting_year: int | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class ImpactMetricRead(ImpactMetricBase, BaseReadSchema, StatusMixin):
    pass


class ImpactMetricList(BaseReadSchema):
    name: str
    slug: str
    metric_type: str
    category: str
    value: Decimal
    unit: str | None
    reporting_year: int | None
    is_active: bool
    is_featured: bool


class SustainabilityBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    name: str = Field(max_length=255)
    code: str | None = Field(None, max_length=32)
    initiative_type: str = Field(default="climate", max_length=32)
    summary: str | None = None
    description: str | None = None
    objectives: str | None = None
    approach: str | None = None
    activities: str | None = None
    impact: str | None = None
    sdg_goals: list[int] | None = None
    lead_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    start_date: date | None = None
    end_date: date | None = None
    contact_email: EmailField | None = None
    website: UrlStr | None = None
    video_url: UrlStr | None = None
    cover_image_url: UrlStr | None = None
    documents: list[dict] | None = None
    status: str = Field(default="active", max_length=32)


class SustainabilityCreate(SustainabilityBase, StatusMixin):
    pass


class SustainabilityUpdate(BaseSchema):
    name: str | None = Field(None, max_length=255)
    slug: SlugStr | None = None
    code: str | None = Field(None, max_length=32)
    initiative_type: str | None = Field(None, max_length=32)
    summary: str | None = None
    description: str | None = None
    objectives: str | None = None
    approach: str | None = None
    activities: str | None = None
    impact: str | None = None
    sdg_goals: list[int] | None = None
    lead_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    status: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    contact_email: EmailField | None = None
    website: UrlStr | None = None
    video_url: UrlStr | None = None
    cover_image_url: UrlStr | None = None
    documents: list[dict] | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    display_order: int | None = None


class SustainabilityRead(SustainabilityBase, BaseReadSchema, StatusMixin):
    pass


class SustainabilityList(BaseReadSchema):
    name: str
    slug: str
    code: str | None
    initiative_type: str
    start_date: date | None
    end_date: date | None
    status: str
    is_active: bool
    is_featured: bool
