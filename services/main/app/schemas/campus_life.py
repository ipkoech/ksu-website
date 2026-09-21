"""Public campus-life homepage composition contracts."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import ConfigDict, Field

from .base import BaseSchema


class CampusLifeMediaRead(BaseSchema):
    id: str
    url: str | None = None
    public_url: str | None = None
    cdn_url: str | None = None
    thumbnail_url: str | None = None
    alt_text: str | None = None
    title: str | None = None
    caption: str | None = None


class CampusLifeRecordRead(BaseSchema):
    id: str
    name: str | None = None
    slug: str | None = None
    href: str | None = None
    description: str | None = None
    is_active: bool = True
    club_type: str | None = None
    membership_count: int | None = None
    meeting_schedule: str | None = None
    facility_type: str | None = None
    sport_types: list[str] | None = None
    location: str | None = None
    accommodation_type: str | None = None
    gender: str | None = None
    capacity: int | None = None
    is_accepting_applications: bool | None = None
    category: str | None = None
    acronym: str | None = None
    governance_type: str | None = None
    term_start: datetime | None = None
    term_end: datetime | None = None
    email: str | None = None
    phone: str | None = None
    office_location: str | None = None
    cover_image: CampusLifeMediaRead | None = None


class CampusLifeSectionRead(BaseSchema):
    section_key: str
    title: str | None = None
    subtitle: str | None = None
    description: str | None = None
    items: list[dict[str, Any]] = Field(default_factory=list)


class CampusLifeStatsRead(BaseSchema):
    clubs: int
    sports: int
    accommodation: int
    arts: int
    governance: int


class CampusLifeActivityRead(BaseSchema):
    id: str
    title: str
    description: str | None = None
    activity_type: str
    start_datetime: datetime
    end_datetime: datetime | None = None
    location: str | None = None
    club: dict[str, str] | None = None
    cover_image: CampusLifeMediaRead | None = None


class CampusLifeFaqRead(BaseSchema):
    id: str
    question: str
    answer: str | None = None
    category: str | None = None


class CampusLifeContactRead(BaseSchema):
    id: str
    name: str
    contact_type: str
    email: str | None = None
    phone: str | None = None
    building: str | None = None
    room_number: str | None = None


class CampusLifeHomepageRead(BaseSchema):
    model_config = ConfigDict(extra="allow")

    section: CampusLifeSectionRead
    stats: CampusLifeStatsRead
    clubs: list[CampusLifeRecordRead] = Field(default_factory=list)
    sports: list[CampusLifeRecordRead] = Field(default_factory=list)
    accommodation: list[CampusLifeRecordRead] = Field(default_factory=list)
    arts: list[CampusLifeRecordRead] = Field(default_factory=list)
    governance: list[CampusLifeRecordRead] = Field(default_factory=list)
    activities: list[CampusLifeActivityRead] = Field(default_factory=list)
    faqs: list[CampusLifeFaqRead] = Field(default_factory=list)
    contacts: list[CampusLifeContactRead] = Field(default_factory=list)
