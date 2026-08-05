"""Schemas for innovation models: innovations, research outputs."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from pydantic import Field

from .base import (
    BaseSchema,
    BaseReadSchema,
    SEOFieldsMixin,
    SlugMixin,
    StatusMixin,
    SlugStr,
    UrlStr,
)


# ============================================================================
# Innovation
# ============================================================================


class InnovationBase(BaseSchema, SlugMixin, SEOFieldsMixin):
    title: str = Field(max_length=500)
    code: str | None = Field(None, max_length=32)
    innovation_type: str = Field(default="product", max_length=32)
    category: str | None = Field(None, max_length=64)
    project_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    lead_inventor_id: uuid.UUID | None = None
    inventors: list[dict] | None = None
    summary: str | None = None
    description: str | None = None
    problem_addressed: str | None = None
    solution: str | None = None
    benefits: str | None = None
    applications: str | None = None
    target_users: str | None = None
    ip_status: str | None = Field(None, max_length=32)
    patent_number: str | None = Field(None, max_length=128)
    patent_filing_date: date | None = None
    patent_grant_date: date | None = None
    patent_countries: list[str] | None = None
    license_type: str | None = Field(None, max_length=128)
    commercialization_status: str | None = Field(None, max_length=32)
    commercial_value: Decimal | None = None
    revenue_generated: Decimal | None = None
    currency: str = Field(default="KES", max_length=3)
    development_stage: str = Field(default="research", max_length=32)
    trl_level: int | None = Field(None, ge=1, le=9)
    invention_date: date | None = None
    cover_image_url: UrlStr | None = None
    gallery: list[dict] | None = None
    video_url: UrlStr | None = None
    documents: list[dict] | None = None
    awards: list[dict] | None = None
    status: str = Field(default="active", max_length=32)


class InnovationCreate(InnovationBase, StatusMixin):
    is_public: bool = True


class InnovationUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    development_stage: str | None = None
    trl_level: int | None = None
    ip_status: str | None = None
    commercialization_status: str | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    is_public: bool | None = None


class InnovationRead(InnovationBase, BaseReadSchema, StatusMixin):
    is_public: bool


class InnovationList(BaseReadSchema):
    title: str
    slug: str
    code: str | None
    innovation_type: str
    category: str | None
    development_stage: str
    trl_level: int | None
    status: str
    cover_image_url: str | None
    is_active: bool
    is_featured: bool


# ============================================================================
# Research Output
# ============================================================================


class ResearchOutputBase(BaseSchema, SlugMixin):
    title: str = Field(max_length=500)
    output_type: str = Field(default="dataset", max_length=32)
    project_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    author_ids: list[uuid.UUID] | None = None
    summary: str | None = None
    description: str | None = None
    methodology: str | None = None
    usage_notes: str | None = None
    citation: str | None = None
    access_type: str = Field(default="open", max_length=32)
    access_url: UrlStr | None = None
    download_url: UrlStr | None = None
    repository_url: UrlStr | None = None
    doi: str | None = Field(None, max_length=128)
    version: str | None = Field(None, max_length=32)
    license: str | None = Field(None, max_length=128)
    license_url: UrlStr | None = None
    format: str | None = Field(None, max_length=64)
    size_bytes: int | None = None
    technical_requirements: str | None = None
    release_date: date | None = None
    last_updated: date | None = None
    keywords: list[str] | None = None
    cover_image_url: UrlStr | None = None
    status: str = Field(default="published", max_length=32)


class ResearchOutputCreate(ResearchOutputBase, StatusMixin):
    pass


class ResearchOutputUpdate(BaseSchema):
    title: str | None = Field(None, max_length=500)
    slug: SlugStr | None = None
    output_type: str | None = Field(None, max_length=32)
    project_id: uuid.UUID | None = None
    center_id: uuid.UUID | None = None
    author_ids: list[uuid.UUID] | None = None
    summary: str | None = None
    description: str | None = None
    methodology: str | None = None
    usage_notes: str | None = None
    citation: str | None = None
    access_type: str | None = Field(None, max_length=32)
    access_url: UrlStr | None = None
    download_url: UrlStr | None = None
    repository_url: UrlStr | None = None
    doi: str | None = Field(None, max_length=128)
    version: str | None = None
    license: str | None = Field(None, max_length=128)
    license_url: UrlStr | None = None
    format: str | None = Field(None, max_length=64)
    size_bytes: int | None = None
    technical_requirements: str | None = None
    release_date: date | None = None
    last_updated: date | None = None
    keywords: list[str] | None = None
    cover_image_url: UrlStr | None = None
    status: str | None = None
    is_active: bool | None = None
    is_featured: bool | None = None


class ResearchOutputRead(ResearchOutputBase, BaseReadSchema, StatusMixin):
    download_count: int
    citation_count: int


class ResearchOutputList(BaseReadSchema):
    title: str
    slug: str
    output_type: str
    access_type: str
    release_date: date | None
    status: str
    download_count: int
    is_active: bool
