"""Base schema utilities for Research service."""

from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Annotated, Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field, field_validator

T = TypeVar("T")
JsonScalar = str | int | float | bool | None


class BaseSchema(BaseModel):
    """Base schema with common config."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True,
    )


class StrictSchema(BaseSchema):
    """Base schema for concrete response models that reject unknown fields."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )


class TimestampMixin(BaseModel):
    """Timestamp fields for read schemas."""

    created_at: datetime
    updated_at: datetime


class BaseReadSchema(BaseSchema, TimestampMixin):
    """Base for all read (response) schemas."""

    id: uuid.UUID


class SEOFieldsMixin(BaseModel):
    """SEO fields for content schemas."""

    meta_title: str | None = None
    meta_description: str | None = None
    keywords: dict | None = None


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
EmailField = Annotated[str, Field(max_length=320)]


def slugify(value: str) -> str:
    """Convert string to URL-safe slug."""
    value = value.lower().strip()
    value = re.sub(r"[^\w\s-]", "", value)
    value = re.sub(r"[-\s]+", "-", value)
    return value.strip("-")


class SlugMixin(BaseModel):
    """Auto-generate slug from name/title."""

    slug: str | None = None

    @field_validator("slug", mode="before")
    @classmethod
    def auto_slug(cls, v: str | None, info) -> str:
        if v:
            return v
        name = info.data.get("name") or info.data.get("title")
        if name:
            return slugify(name)
        return ""


class StatusMixin(BaseModel):
    """Common status fields."""

    is_active: bool = True
    is_featured: bool = False
    display_order: int = 100
