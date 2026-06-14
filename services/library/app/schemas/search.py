"""Schemas for unified public library search."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class LibrarySearchResult(BaseModel):
    id: str
    type: str
    title: str
    description: str | None = None
    url: str | None = None
    library_id: str | None = None
    library_name: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class LibrarySearchResponse(BaseModel):
    query: str
    total: int
    results: list[LibrarySearchResult]
    by_type: dict[str, int]
