"""Alumni schemas."""

from __future__ import annotations

import uuid
from typing import Any
from datetime import date, datetime

from pydantic import Field

from .base import BaseReadSchema, BaseSchema, PhoneStr, SlugStr, UrlStr


class AlumniCreate(BaseSchema):
    person_id: uuid.UUID
    graduation_year: int = Field(ge=1950, le=2100)
    programme_id: uuid.UUID | None = None
    school_id: uuid.UUID | None = None
    degree_classification: str | None = Field(default=None, max_length=32)
    student_number: str | None = Field(default=None, max_length=64)
    current_employer: str | None = Field(default=None, max_length=255)
    current_position: str | None = Field(default=None, max_length=255)
    industry: str | None = Field(default=None, max_length=128)
    location_city: str | None = Field(default=None, max_length=128)
    location_country: str | None = Field(default=None, max_length=128)
    linkedin_url: UrlStr | None = None
    website: UrlStr | None = None
    bio: str | None = None
    achievements: str | None = None
    is_mentor_available: bool = False
    mentor_areas: list[str] | None = None
    is_public: bool = False
    show_contact: bool = False
    is_verified: bool = False
    verified_at: datetime | None = None


class AlumniUpdate(BaseSchema):
    graduation_year: int | None = Field(default=None, ge=1950, le=2100)
    programme_id: uuid.UUID | None = None
    school_id: uuid.UUID | None = None
    degree_classification: str | None = Field(default=None, max_length=32)
    student_number: str | None = Field(default=None, max_length=64)
    current_employer: str | None = Field(default=None, max_length=255)
    current_position: str | None = Field(default=None, max_length=255)
    industry: str | None = Field(default=None, max_length=128)
    location_city: str | None = Field(default=None, max_length=128)
    location_country: str | None = Field(default=None, max_length=128)
    linkedin_url: UrlStr | None = None
    website: UrlStr | None = None
    bio: str | None = None
    achievements: str | None = None
    is_mentor_available: bool | None = None
    mentor_areas: list[str] | None = None
    is_public: bool | None = None
    show_contact: bool | None = None
    is_verified: bool | None = None
    verified_at: datetime | None = None


class AlumniRead(BaseReadSchema):
    person_id: uuid.UUID
    graduation_year: int
    programme_id: uuid.UUID | None = None
    school_id: uuid.UUID | None = None
    degree_classification: str | None = None
    student_number: str | None = None
    current_employer: str | None = None
    current_position: str | None = None
    industry: str | None = None
    location_city: str | None = None
    location_country: str | None = None
    linkedin_url: str | None = None
    website: str | None = None
    bio: str | None = None
    achievements: str | None = None
    is_mentor_available: bool
    mentor_areas: list[str] | None = None
    is_public: bool
    show_contact: bool
    is_verified: bool
    association_memberships: list[dict[str, Any]] | None = None
    person: dict[str, Any] | None = None
    programme: dict[str, Any] | None = None
    school: dict[str, Any] | None = None
    verified_at: datetime | None = None


class AlumniAssociationCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    acronym: str | None = Field(default=None, max_length=32)
    association_type: str = Field(min_length=1, max_length=32)
    school_id: uuid.UUID | None = None
    region: str | None = Field(default=None, max_length=128)
    about: str | None = None
    mission: str | None = None
    objectives: str | None = None
    chairperson_id: uuid.UUID | None = None
    secretary_id: uuid.UUID | None = None
    email: str | None = None
    phone: PhoneStr | None = None
    social_media: dict | None = None
    logo_id: uuid.UUID | None = None
    is_active: bool = True
    established_date: date | None = None


class AlumniAssociationUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    acronym: str | None = Field(default=None, max_length=32)
    association_type: str | None = Field(default=None, max_length=32)
    school_id: uuid.UUID | None = None
    region: str | None = Field(default=None, max_length=128)
    about: str | None = None
    mission: str | None = None
    objectives: str | None = None
    chairperson_id: uuid.UUID | None = None
    secretary_id: uuid.UUID | None = None
    email: str | None = None
    phone: PhoneStr | None = None
    social_media: dict | None = None
    logo_id: uuid.UUID | None = None
    is_active: bool | None = None
    established_date: date | None = None


class AlumniAssociationMemberCreate(BaseSchema):
    alumni_id: uuid.UUID
    role: str = Field(default="member", max_length=32)
    position: str | None = Field(default=None, max_length=128)
    joined_at: date
    left_at: date | None = None
    is_active: bool = True


class AlumniAssociationMemberRead(BaseReadSchema):
    alumni_id: uuid.UUID
    association_id: uuid.UUID
    role: str
    position: str | None = None
    joined_at: date
    left_at: date | None = None
    alumni: dict[str, Any] | None = None
    association: dict[str, Any] | None = None
    is_active: bool


class AlumniAssociationRead(BaseReadSchema):
    name: str
    slug: str
    acronym: str | None = None
    association_type: str
    school_id: uuid.UUID | None = None
    region: str | None = None
    about: str | None = None
    mission: str | None = None
    objectives: str | None = None
    chairperson_id: uuid.UUID | None = None
    secretary_id: uuid.UUID | None = None
    email: str | None = None
    phone: str | None = None
    social_media: dict | None = None
    logo_id: uuid.UUID | None = None
    is_active: bool
    established_date: date | None = None
    chairperson: dict[str, Any] | None = None
    logo: dict[str, Any] | None = None
    school: dict[str, Any] | None = None
    secretary: dict[str, Any] | None = None
    members: list[AlumniAssociationMemberRead] = Field(default_factory=list)


__all__ = [
    "AlumniCreate",
    "AlumniUpdate",
    "AlumniRead",
    "AlumniAssociationCreate",
    "AlumniAssociationUpdate",
    "AlumniAssociationRead",
    "AlumniAssociationMemberCreate",
    "AlumniAssociationMemberRead",
]
