"""Base schema utilities for Main service."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated, Any, get_args

from pydantic import BaseModel, ConfigDict, Field, create_model

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


def optional_snapshot(name: str, source: type[BaseModel]) -> type[BaseModel]:
    """Build a field-selection-safe response model from a read schema.

    Field selection intentionally permits omitted properties. Reusing a read
    schema with required columns would turn a valid sparse response into a
    500 during FastAPI response validation, so snapshots retain the same
    bounded field set while making every property optional.
    """

    fields: dict[str, tuple[Any, None]] = {}
    for field_name, field in source.model_fields.items():
        annotation = field.annotation
        if annotation is not Any and type(None) not in get_args(annotation):
            annotation = annotation | None
        fields[field_name] = (annotation, None)
    return create_model(name, __base__=BaseSchema, **fields)


# Common field types
SlugStr = Annotated[
    str,
    Field(min_length=1, max_length=128, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$"),
]


__all__ = [
    "BaseSchema",
    "BaseReadSchema",
    "TimestampMixin",
    "optional_snapshot",
    "SlugStr",
    "CodeStr",
    "PhoneStr",
    "UrlStr",
]
CodeStr = Annotated[str, Field(min_length=1, max_length=32, pattern=r"^[A-Z0-9_]+$")]
PhoneStr = Annotated[str, Field(max_length=24)]
UrlStr = Annotated[str, Field(max_length=512)]
