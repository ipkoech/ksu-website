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
    scheduled_at: datetime | None = None


class EventCreate(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=180)
    title: str = Field(min_length=2, max_length=255)
    summary: str = ""
    description: str = ""
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    location: str | None = None
    registration_url: str | None = None


class EventAdminResponse(EventCreate):
    """The existing admin event wire shape with generated/publishing fields."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: str
    scheduled_at: datetime | None = None
    event_type: str | None = None
    featured_image_url: str | None = None
    is_virtual: bool = False
    virtual_url: str | None = None
    is_featured: bool = False
    position: int = 0


NewsCreate.model_rebuild()
NewsUpdate.model_rebuild()
NewsAdminResponse.model_rebuild()
TransitionRequest.model_rebuild()
EventCreate.model_rebuild()
EventAdminResponse.model_rebuild()
