from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NewsSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    excerpt: str | None
    published_at: datetime | None


class SiteResponse(BaseModel):
    name: str
    tagline: str | None
    contact: dict[str, object]
    social_links: dict[str, object]
    seo_defaults: dict[str, object]
