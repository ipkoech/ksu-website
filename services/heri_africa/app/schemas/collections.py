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
