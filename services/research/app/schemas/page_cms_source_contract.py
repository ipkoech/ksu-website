"""Public, minimal source records for Main service Page CMS references."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Literal

from pydantic import Field

from .base import BaseSchema

PageCmsResearchSourceType = Literal["research_project", "publication"]


class PageCmsResearchSourceSummary(BaseSchema):
    """A display-safe source summary with no ownership or storage identifiers."""

    id: uuid.UUID
    source_type: PageCmsResearchSourceType
    label: str
    secondary_label: str | None = None
    status: str
    published_at: date | None = None
    thumbnail_url: str | None = None
    metadata: dict[str, str | int | bool | None] = Field(default_factory=dict)


class PageCmsResearchSourceResolveRequest(BaseSchema):
    ids: list[uuid.UUID] = Field(min_length=1, max_length=100)
    center_id: uuid.UUID | None = None


__all__ = [
    "PageCmsResearchSourceResolveRequest",
    "PageCmsResearchSourceSummary",
    "PageCmsResearchSourceType",
]
