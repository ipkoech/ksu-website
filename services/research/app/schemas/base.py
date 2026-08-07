"""Base schema utilities for Research service."""

from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Annotated, Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, Field, field_validator

T = TypeVar("T")
JsonScalar = str | int | float | bool | uuid.UUID | datetime | None
JsonValue = JsonScalar | list[JsonScalar] | dict[str, JsonScalar]
JsonObject = dict[str, JsonValue]


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


class SuccessEnvelope(StrictSchema, Generic[T]):
    """Strict success envelope for concrete Research responses."""

    status: Literal["success"] = "success"
    message: str = "ok"
    data: T | None = None


class SuccessEnvelopeWithMeta(SuccessEnvelope[T], Generic[T]):
    """Strict success envelope with typed metadata."""

    meta: JsonObject | None = None


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
    keywords: JsonObject | None = None


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
