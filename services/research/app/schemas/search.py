"""Schemas for unified public research search."""

from __future__ import annotations

from ksu_common.schemas.responses import SuccessResponse
from pydantic import Field

from .base import JsonScalar, StrictSchema


class ResearchSearchResult(StrictSchema):
    id: str
    type: str
    title: str
    description: str | None = None
    url: str | None = None
    date: str | None = None
    status: str | None = None
    is_featured: bool = False
    metadata: dict[str, JsonScalar] = Field(default_factory=dict)


class ResearchSearchResponse(StrictSchema):
    query: str
    total: int
    results: list[ResearchSearchResult]
    by_type: dict[str, int]


class ResearchSearchSuccessResponse(SuccessResponse[ResearchSearchResponse]):
    """Concrete success envelope for public unified research search."""
