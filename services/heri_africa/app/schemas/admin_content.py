from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field



class NewsCreate(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=180)
    title: str = Field(min_length=2, max_length=255)
    excerpt: str | None = None
    body: str = ""
    featured_image_url: str | None = None


class NewsUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    excerpt: str | None = None
    body: str | None = None
    featured_image_url: str | None = None


class NewsAdminResponse(NewsCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    status: str
    published_at: datetime | None
    scheduled_at: datetime | None


class TransitionRequest(BaseModel):
    status: str
    note: str | None = Field(default=None, max_length=2000)


class EventCreate(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=180)
    title: str = Field(min_length=2, max_length=255)
    summary: str = ""
    description: str = ""
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    location: str | None = None
    registration_url: str | None = None
