"""Base schema utilities for Main service."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from ..helpers.slug import slugify as slugify


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


# Common field types
SlugStr = Annotated[
    str,
    Field(min_length=1, max_length=128, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$"),
]
CodeStr = Annotated[str, Field(min_length=1, max_length=32, pattern=r"^[A-Z0-9_]+$")]
PhoneStr = Annotated[str, Field(max_length=24)]
UrlStr = Annotated[str, Field(max_length=512)]
