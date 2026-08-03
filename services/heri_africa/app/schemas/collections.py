from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict


class TeamSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    name: str
    role: str
    biography: str
    photo_url: str | None


class PartnerSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    name: str
    description: str
    logo_url: str | None
    website_url: str | None
    country: str | None
    research_partner_id: str | None = None
    research_center_id: str | None = None
    partner_type: str | None = None
    partnership_level: str | None = None
    collaboration_areas: list | dict | None = None
    partnership_start: object | None = None
    partnership_end: object | None = None
    mou_signed_date: object | None = None
    mou_expiry_date: object | None = None
    relationship_status: str = "active"
    relationship_notes: str | None = None


class ResearchSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    title: str
    summary: str


class EventSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    title: str
    summary: str
    starts_at: object | None
    ends_at: object | None
    location: str | None


class OpportunitySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    title: str
    summary: str
    application_url: str | None
    closing_at: object | None


class ImpactMetricSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    label: str
    value: str
    unit: str | None
    description: str
    position: int


class PageSectionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    section_type: str
    position: int
    configuration: dict[str, object]


class PublicPageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    title: str
    seo_title: str | None
    seo_description: str | None
    sections: list[PageSectionSummary]


class PaginatedCollection(BaseModel):
    items: list[object]
    page: int
    per_page: int
    total: int
    pages: int
