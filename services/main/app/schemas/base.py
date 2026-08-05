"""Base schema utilities for Main service."""

from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Annotated, Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field, field_validator

T = TypeVar("T")


class BaseSchema(BaseModel):
    """Base schema with common config."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True,
    )


class TimestampMixin(BaseModel):
    """Timestamp fields for read schemas."""

    created_at: datetime
    updated_at: datetime


class BaseReadSchema(BaseSchema, TimestampMixin):
    """Base for all read (response) schemas."""

    id: uuid.UUID


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper."""

    items: list[T]
    total: int
    page: int
    per_page: int
    pages: int

    @property
    def has_next(self) -> bool:
        return self.page < self.pages

    @property
    def has_prev(self) -> bool:
        return self.page > 1


class APIResponse(BaseModel, Generic[T]):
    """Standard API response envelope."""

    data: T | None = None
    error: str | None = None
    meta: dict[str, Any] | None = None


# Common field types
SlugStr = Annotated[
    str,
    Field(min_length=1, max_length=128, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$"),
]
CodeStr = Annotated[str, Field(min_length=1, max_length=32, pattern=r"^[A-Z0-9_]+$")]
PhoneStr = Annotated[str, Field(max_length=24)]
UrlStr = Annotated[str, Field(max_length=512)]


def slugify(value: str) -> str:
    """Convert string to URL-safe slug."""
    value = value.lower().strip()
    value = re.sub(r"[^\w\s-]", "", value)
    value = re.sub(r"[-\s]+", "-", value)
    return value.strip("-")


class SlugMixin(BaseModel):
    """Auto-generate slug from name."""

    name: str
    slug: str | None = None

    @field_validator("slug", mode="before")
    @classmethod
    def auto_slug(cls, v: str | None, info) -> str:
        if v:
            return v
        name = info.data.get("name")
        if name:
            return slugify(name)
        return ""
