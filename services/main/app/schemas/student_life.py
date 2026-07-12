"""Student life schemas."""

from __future__ import annotations

import uuid
from typing import Any
from datetime import date, datetime

from pydantic import ConfigDict, Field

from .base import BaseReadSchema, BaseSchema, PhoneStr, SlugStr, UrlStr


class ClubCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    club_type: str = Field(min_length=1, max_length=32)
    school_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    patron_id: uuid.UUID | None = None
    chairperson_id: uuid.UUID | None = None
    vice_chairperson_id: uuid.UUID | None = None
    secretary_id: uuid.UUID | None = None
    treasurer_id: uuid.UUID | None = None
    about: str | None = None
    mission: str | None = None
    objectives: str | None = None
    email: str | None = None
    phone: PhoneStr | None = None
    social_media: dict | None = None
    membership_fee: int | None = Field(default=None, ge=0)
    meeting_schedule: str | None = Field(default=None, max_length=255)
    registration_date: date | None = None
    logo_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    membership_count: int = Field(default=0, ge=0)
    is_active: bool = True
    is_public: bool = True
    display_order: int = 100


class ClubUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    club_type: str | None = Field(default=None, max_length=32)
    school_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    patron_id: uuid.UUID | None = None
    chairperson_id: uuid.UUID | None = None
    vice_chairperson_id: uuid.UUID | None = None
    secretary_id: uuid.UUID | None = None
    treasurer_id: uuid.UUID | None = None
    about: str | None = None
    mission: str | None = None
    objectives: str | None = None
    email: str | None = None
    phone: PhoneStr | None = None
    social_media: dict | None = None
    membership_fee: int | None = Field(default=None, ge=0)
    meeting_schedule: str | None = Field(default=None, max_length=255)
    registration_date: date | None = None
    logo_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    membership_count: int | None = Field(default=None, ge=0)
    is_active: bool | None = None
    is_public: bool | None = None
    display_order: int | None = None


class ClubActivityCreate(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    description: str | None = None
    activity_type: str = Field(min_length=1, max_length=32)
    start_datetime: datetime
    end_datetime: datetime | None = None
    location: str | None = Field(default=None, max_length=255)
    is_virtual: bool = False
    meeting_link: UrlStr | None = None
    cover_image_id: uuid.UUID | None = None


class ClubActivityUpdate(BaseSchema):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    description: str | None = None
    activity_type: str | None = Field(default=None, max_length=32)
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None
    location: str | None = Field(default=None, max_length=255)
    is_virtual: bool | None = None
    meeting_link: UrlStr | None = None
    cover_image_id: uuid.UUID | None = None


class ClubActivityRead(BaseReadSchema):
    club_id: uuid.UUID
    title: str
    slug: str
    description: str | None = None
    activity_type: str
    start_datetime: datetime
    end_datetime: datetime | None = None
    location: str | None = None
    is_virtual: bool
    meeting_link: str | None = None
    cover_image_id: uuid.UUID | None = None
    author_user_id: uuid.UUID | None = None
    status: str
    club: dict[str, Any] | None = None
    cover_image: dict[str, Any] | None = None
    is_public: bool
    is_published: bool
    workflow_status: str
    owner_portal: str | None = None
    owner_scope_type: str | None = None
    owner_scope_id: uuid.UUID | None = None
    submitted_at: datetime | None = None
    approved_at: datetime | None = None
    published_at: datetime | None = None


class ClubMediaCreate(BaseSchema):
    media_id: uuid.UUID
    role: str = Field(default="gallery", max_length=64)
    display_order: int = 100


class ClubMediaUpdate(BaseSchema):
    role: str | None = Field(default=None, max_length=64)
    display_order: int | None = None


class ClubMediaPublicationUpdate(BaseSchema):
    is_public: bool


class ClubRead(BaseReadSchema):
    name: str
    slug: str
    club_type: str
    school_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    patron_id: uuid.UUID | None = None
    chairperson_id: uuid.UUID | None = None
    vice_chairperson_id: uuid.UUID | None = None
    secretary_id: uuid.UUID | None = None
    treasurer_id: uuid.UUID | None = None
    about: str | None = None
    mission: str | None = None
    objectives: str | None = None
    email: str | None = None
    phone: str | None = None
    social_media: dict | None = None
    membership_fee: int | None = None
    meeting_schedule: str | None = None
    registration_date: date | None = None
    logo_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    membership_count: int
    is_active: bool
    is_public: bool
    display_order: int
    chairperson: dict[str, Any] | None = None
    cover_image: dict[str, Any] | None = None
    department: dict[str, Any] | None = None
    logo: dict[str, Any] | None = None
    patron: dict[str, Any] | None = None
    school: dict[str, Any] | None = None
    secretary: dict[str, Any] | None = None
    treasurer: dict[str, Any] | None = None
    vice_chairperson: dict[str, Any] | None = None
    activities: list[ClubActivityRead] = Field(default_factory=list)


class AccommodationCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    accommodation_type: str = Field(min_length=1, max_length=32)
    gender: str = Field(min_length=1, max_length=16)
    campus_id: uuid.UUID
    about: str | None = None
    amenities: list[str] | None = None
    rules: str | None = None
    total_rooms: int | None = Field(default=None, ge=0)
    capacity: int | None = Field(default=None, ge=0)
    fee_per_semester: int | None = Field(default=None, ge=0)
    fee_per_year: int | None = Field(default=None, ge=0)
    warden_id: uuid.UUID | None = None
    email: str | None = None
    phone: PhoneStr | None = None
    cover_image_id: uuid.UUID | None = None
    gallery_images: list[str] | None = None
    is_active: bool = True
    is_accepting_applications: bool = True


class AccommodationUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    accommodation_type: str | None = Field(default=None, max_length=32)
    gender: str | None = Field(default=None, max_length=16)
    campus_id: uuid.UUID | None = None
    about: str | None = None
    amenities: list[str] | None = None
    rules: str | None = None
    total_rooms: int | None = Field(default=None, ge=0)
    capacity: int | None = Field(default=None, ge=0)
    fee_per_semester: int | None = Field(default=None, ge=0)
    fee_per_year: int | None = Field(default=None, ge=0)
    warden_id: uuid.UUID | None = None
    email: str | None = None
    phone: PhoneStr | None = None
    cover_image_id: uuid.UUID | None = None
    gallery_images: list[str] | None = None
    is_active: bool | None = None
    is_accepting_applications: bool | None = None


class AccommodationRead(BaseReadSchema):
    name: str
    slug: str
    accommodation_type: str
    gender: str
    campus_id: uuid.UUID
    about: str | None = None
    amenities: list[str] | None = None
    rules: str | None = None
    total_rooms: int | None = None
    capacity: int | None = None
    fee_per_semester: int | None = None
    fee_per_year: int | None = None
    warden_id: uuid.UUID | None = None
    email: str | None = None
    phone: str | None = None
    cover_image_id: uuid.UUID | None = None
    gallery_images: list[str] | None = None
    is_active: bool
    campus: dict[str, Any] | None = None
    cover_image: dict[str, Any] | None = None
    warden: dict[str, Any] | None = None
    is_accepting_applications: bool


class SportsFacilityCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    facility_type: str = Field(min_length=1, max_length=32)
    sport_types: list[str]
    campus_id: uuid.UUID
    about: str | None = None
    operating_hours: dict | None = None
    location: str | None = Field(default=None, max_length=255)
    gps_coordinates: dict | None = None
    manager_id: uuid.UUID | None = None
    email: str | None = None
    phone: PhoneStr | None = None
    cover_image_id: uuid.UUID | None = None
    is_active: bool = True


class SportsFacilityUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    facility_type: str | None = Field(default=None, max_length=32)
    sport_types: list[str] | None = None
    campus_id: uuid.UUID | None = None
    about: str | None = None
    operating_hours: dict | None = None
    location: str | None = Field(default=None, max_length=255)
    gps_coordinates: dict | None = None
    manager_id: uuid.UUID | None = None
    email: str | None = None
    phone: PhoneStr | None = None
    cover_image_id: uuid.UUID | None = None
    is_active: bool | None = None


class SportsFacilityRead(BaseReadSchema):
    name: str
    slug: str
    facility_type: str
    sport_types: list[str]
    campus_id: uuid.UUID
    about: str | None = None
    operating_hours: dict | None = None
    location: str | None = None
    gps_coordinates: dict | None = None
    manager_id: uuid.UUID | None = None
    email: str | None = None
    phone: str | None = None
    cover_image_id: uuid.UUID | None = None
    campus: dict[str, Any] | None = None
    cover_image: dict[str, Any] | None = None
    manager: dict[str, Any] | None = None
    is_active: bool


class ArtsCultureCreate(BaseSchema):
    title: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    category: str = Field(min_length=1, max_length=32)
    about: str | None = None
    school_id: uuid.UUID | None = None
    club_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    is_active: bool = True


class ArtsCultureUpdate(BaseSchema):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    category: str | None = Field(default=None, max_length=32)
    about: str | None = None
    school_id: uuid.UUID | None = None
    club_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    is_active: bool | None = None


class ArtsCultureRead(BaseReadSchema):
    title: str
    slug: str
    category: str
    about: str | None = None
    school_id: uuid.UUID | None = None
    club_id: uuid.UUID | None = None
    cover_image_id: uuid.UUID | None = None
    club: dict[str, Any] | None = None
    cover_image: dict[str, Any] | None = None
    school: dict[str, Any] | None = None
    is_active: bool


class StudentGovernanceCreate(BaseSchema):
    name: str = Field(min_length=1, max_length=255)
    slug: SlugStr | None = None
    acronym: str | None = Field(default=None, max_length=32)
    governance_type: str = Field(min_length=1, max_length=32)
    school_id: uuid.UUID | None = None
    about: str | None = None
    constitution: str | None = None
    mandate: str | None = None
    chairperson_id: uuid.UUID | None = None
    vice_chairperson_id: uuid.UUID | None = None
    secretary_general_id: uuid.UUID | None = None
    term_start: date | None = None
    term_end: date | None = None
    email: str | None = None
    phone: PhoneStr | None = None
    office_location: str | None = Field(default=None, max_length=255)
    logo_id: uuid.UUID | None = None
    is_active: bool = True


class StudentGovernanceUpdate(BaseSchema):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: SlugStr | None = None
    acronym: str | None = Field(default=None, max_length=32)
    governance_type: str | None = Field(default=None, max_length=32)
    school_id: uuid.UUID | None = None
    about: str | None = None
    constitution: str | None = None
    mandate: str | None = None
    chairperson_id: uuid.UUID | None = None
    vice_chairperson_id: uuid.UUID | None = None
    secretary_general_id: uuid.UUID | None = None
    term_start: date | None = None
    term_end: date | None = None
    email: str | None = None
    phone: PhoneStr | None = None
    office_location: str | None = Field(default=None, max_length=255)
    logo_id: uuid.UUID | None = None
    is_active: bool | None = None


class StudentGovernanceRead(BaseReadSchema):
    name: str
    slug: str
    acronym: str | None = None
    governance_type: str
    school_id: uuid.UUID | None = None
    about: str | None = None
    constitution: str | None = None
    mandate: str | None = None
    chairperson_id: uuid.UUID | None = None
    vice_chairperson_id: uuid.UUID | None = None
    secretary_general_id: uuid.UUID | None = None
    term_start: date | None = None
    term_end: date | None = None
    email: str | None = None
    phone: str | None = None
    office_location: str | None = None
    logo_id: uuid.UUID | None = None
    chairperson: dict[str, Any] | None = None
    logo: dict[str, Any] | None = None
    school: dict[str, Any] | None = None
    secretary_general: dict[str, Any] | None = None
    vice_chairperson: dict[str, Any] | None = None
    is_active: bool


__all__ = [
    "ClubCreate",
    "ClubUpdate",
    "ClubRead",
    "ClubActivityCreate",
    "ClubActivityUpdate",
    "ClubActivityRead",
    "AccommodationCreate",
    "AccommodationUpdate",
    "AccommodationRead",
    "SportsFacilityCreate",
    "SportsFacilityUpdate",
    "SportsFacilityRead",
    "ArtsCultureCreate",
    "ArtsCultureUpdate",
    "ArtsCultureRead",
    "StudentGovernanceCreate",
    "StudentGovernanceUpdate",
    "StudentGovernanceRead",
]
