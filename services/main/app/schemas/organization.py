"""Organization schemas for divisions and wings."""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, CodeStr, PhoneStr, SlugStr


class DivisionCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    code: CodeStr
    division_type: str = Field(default="division", max_length=64)
    head_id: uuid.UUID | None = None
    description: str | None = None
    head_message: str | None = None
    mission: str | None = None
    vision: str | None = None
    core_values: str | None = None
    email: str | None = Field(default=None, max_length=320)
    phone: PhoneStr | None = None
    office_location: str | None = Field(default=None, max_length=255)
    operating_hours: dict[str, Any] | None = None
    cover_image_id: uuid.UUID | None = None
    settings: dict[str, Any] | None = None
    is_public: bool = True
    is_active: bool = True
    display_order: int = 100


class DivisionUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    code: CodeStr | None = None
    division_type: str | None = Field(default=None, max_length=64)
    head_id: uuid.UUID | None = None
    description: str | None = None
    head_message: str | None = None
    mission: str | None = None
    vision: str | None = None
    core_values: str | None = None
    email: str | None = Field(default=None, max_length=320)
    phone: PhoneStr | None = None
    office_location: str | None = Field(default=None, max_length=255)
    operating_hours: dict[str, Any] | None = None
    cover_image_id: uuid.UUID | None = None
    settings: dict[str, Any] | None = None
    is_public: bool | None = None
    is_active: bool | None = None
    display_order: int | None = None


class DivisionRead(BaseReadSchema):
    name: str
    slug: str
    code: str
    division_type: str
    head_id: uuid.UUID | None = None
    description: str | None = None
    head_message: str | None = None
    mission: str | None = None
    vision: str | None = None
    core_values: str | None = None
    email: str | None = None
    phone: str | None = None
    office_location: str | None = None
    operating_hours: dict[str, Any] | None = None
    cover_image_id: uuid.UUID | None = None
    settings: dict[str, Any] | None = None
    is_public: bool
    is_active: bool
    display_order: int


class WingCreate(BaseSchema):
    division_id: uuid.UUID
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr
    code: CodeStr
    wing_type: str = Field(default="wing", max_length=64)
    head_id: uuid.UUID | None = None
    description: str | None = None
    head_message: str | None = None
    mandate: str | None = None
    service_charter: str | None = None
    email: str | None = Field(default=None, max_length=320)
    phone: PhoneStr | None = None
    office_location: str | None = Field(default=None, max_length=255)
    operating_hours: dict[str, Any] | None = None
    cover_image_id: uuid.UUID | None = None
    is_public: bool = True
    is_active: bool = True
    display_order: int = 100


class WingUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    code: CodeStr | None = None
    wing_type: str | None = Field(default=None, max_length=64)
    head_id: uuid.UUID | None = None
    description: str | None = None
    head_message: str | None = None
    mandate: str | None = None
    service_charter: str | None = None
    email: str | None = Field(default=None, max_length=320)
    phone: PhoneStr | None = None
    office_location: str | None = Field(default=None, max_length=255)
    operating_hours: dict[str, Any] | None = None
    cover_image_id: uuid.UUID | None = None
    is_public: bool | None = None
    is_active: bool | None = None
    display_order: int | None = None


class WingRead(BaseReadSchema):
    division_id: uuid.UUID
    name: str
    slug: str
    code: str
    wing_type: str
    head_id: uuid.UUID | None = None
    description: str | None = None
    head_message: str | None = None
    mandate: str | None = None
    service_charter: str | None = None
    email: str | None = None
    phone: str | None = None
    office_location: str | None = None
    operating_hours: dict[str, Any] | None = None
    cover_image_id: uuid.UUID | None = None
    is_public: bool
    is_active: bool
    display_order: int
