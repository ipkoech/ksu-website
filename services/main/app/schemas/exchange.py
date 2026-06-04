"""Exchange programme schemas."""

from __future__ import annotations

import uuid
from typing import Any
from datetime import date

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, SlugStr, UrlStr


class ExchangeProgrammeCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    partner_institution: str = Field(min_length=1, max_length=255)
    partner_country: str = Field(min_length=1, max_length=128)
    partner_website: UrlStr | None = None
    programme_type: str = Field(min_length=1, max_length=32)
    duration: str | None = Field(default=None, max_length=64)
    about: str | None = None
    benefits: str | None = None
    eligibility: str | None = None
    application_process: str | None = None
    school_id: uuid.UUID | None = None
    application_deadline: date | None = None
    programme_start: date | None = None
    coordinator_id: uuid.UUID | None = None
    email: str | None = None
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    is_active: bool = True
    is_accepting_applications: bool = False


class ExchangeProgrammeUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    partner_institution: str | None = Field(default=None, max_length=255)
    partner_country: str | None = Field(default=None, max_length=128)
    partner_website: UrlStr | None = None
    programme_type: str | None = Field(default=None, max_length=32)
    duration: str | None = Field(default=None, max_length=64)
    about: str | None = None
    benefits: str | None = None
    eligibility: str | None = None
    application_process: str | None = None
    school_id: uuid.UUID | None = None
    application_deadline: date | None = None
    programme_start: date | None = None
    coordinator_id: uuid.UUID | None = None
    email: str | None = None
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    is_active: bool | None = None
    is_accepting_applications: bool | None = None


class ExchangeProgrammeRead(BaseReadSchema):
    name: str
    slug: str
    partner_institution: str
    partner_country: str
    partner_website: str | None = None
    programme_type: str
    duration: str | None = None
    about: str | None = None
    benefits: str | None = None
    eligibility: str | None = None
    application_process: str | None = None
    school_id: uuid.UUID | None = None
    application_deadline: date | None = None
    programme_start: date | None = None
    coordinator_id: uuid.UUID | None = None
    email: str | None = None
    cover_image_id: uuid.UUID | None = None
    brochure_id: uuid.UUID | None = None
    is_active: bool
    brochure: dict[str, Any] | None = None
    coordinator: dict[str, Any] | None = None
    cover_image: dict[str, Any] | None = None
    school: dict[str, Any] | None = None
    is_accepting_applications: bool


__all__ = ["ExchangeProgrammeCreate", "ExchangeProgrammeUpdate", "ExchangeProgrammeRead"]
