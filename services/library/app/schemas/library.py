"""Pydantic v2 schemas for Library, LibraryHours, LibraryExternalLink, LibraryFile."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, HttpUrl, field_validator


# ── LibraryHours ─────────────────────────────────────────────────────────────


class LibraryHoursBase(BaseModel):
    day_type: str
    opens_at: Optional[str] = None
    closes_at: Optional[str] = None
    is_closed: bool = False
    note: Optional[str] = None

    @field_validator("day_type")
    @classmethod
    def validate_day_type(cls, v: str) -> str:
        allowed = {"weekday", "saturday", "sunday", "public_holiday"}
        if v not in allowed:
            raise ValueError(f"day_type must be one of {allowed}")
        return v


class LibraryHoursCreate(LibraryHoursBase):
    pass


class LibraryHoursUpdate(BaseModel):
    day_type: Optional[str] = None
    opens_at: Optional[str] = None
    closes_at: Optional[str] = None
    is_closed: Optional[bool] = None
    note: Optional[str] = None


class LibraryHoursOut(LibraryHoursBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    library_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# ── LibraryExternalLink ───────────────────────────────────────────────────────


class LibraryExternalLinkBase(BaseModel):
    link_type: str
    label: str
    url: str
    description: Optional[str] = None
    is_active: bool = False
    opens_in_new_tab: bool = True
    icon: Optional[str] = None
    sort_order: int = 0

    @field_validator("link_type")
    @classmethod
    def validate_link_type(cls, v: str) -> str:
        allowed = {"opac", "repository", "myloft", "database", "ejournal", "other"}
        if v not in allowed:
            raise ValueError(f"link_type must be one of {allowed}")
        return v


class LibraryExternalLinkCreate(LibraryExternalLinkBase):
    pass


class LibraryExternalLinkUpdate(BaseModel):
    link_type: Optional[str] = None
    label: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    opens_in_new_tab: Optional[bool] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = None


class LibraryExternalLinkOut(LibraryExternalLinkBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    library_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


# ── LibraryFile ───────────────────────────────────────────────────────────────


class LibraryFileBase(BaseModel):
    media_id: uuid.UUID
    title: str
    description: Optional[str] = None
    file_category: str = "other"
    access_level: str = "public"
    is_public: bool = True
    sort_order: int = 0
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[uuid.UUID] = None

    @field_validator("file_category")
    @classmethod
    def validate_file_category(cls, v: str) -> str:
        allowed = {"policy", "guide", "form", "report", "brochure", "other"}
        if v not in allowed:
            raise ValueError(f"file_category must be one of {allowed}")
        return v

    @field_validator("access_level")
    @classmethod
    def validate_access_level(cls, v: str) -> str:
        allowed = {"public", "staff", "admin"}
        if v not in allowed:
            raise ValueError(f"access_level must be one of {allowed}")
        return v


class LibraryFileCreate(LibraryFileBase):
    pass


class LibraryFileUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    file_category: Optional[str] = None
    access_level: Optional[str] = None
    is_public: Optional[bool] = None
    sort_order: Optional[int] = None


class LibraryFileOut(LibraryFileBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    library_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


# ── Library ───────────────────────────────────────────────────────────────────


class LibraryBase(BaseModel):
    name: str
    short_name: Optional[str] = None
    slug: str
    description: Optional[str] = None
    objectives: Optional[str] = None
    regulations: Optional[str] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    cover_image_id: Optional[uuid.UUID] = None
    borrowing_policy_id: Optional[uuid.UUID] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    library_type: str = "main"
    is_active: bool = True
    is_public: bool = True
    sort_order: int = 0

    @field_validator("library_type")
    @classmethod
    def validate_library_type(cls, v: str) -> str:
        allowed = {"main", "branch", "digital"}
        if v not in allowed:
            raise ValueError(f"library_type must be one of {allowed}")
        return v


class LibraryCreate(LibraryBase):
    pass


class LibraryUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    description: Optional[str] = None
    objectives: Optional[str] = None
    regulations: Optional[str] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    cover_image_id: Optional[uuid.UUID] = None
    borrowing_policy_id: Optional[uuid.UUID] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    library_type: Optional[str] = None
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None
    sort_order: Optional[int] = None


class LibraryOut(LibraryBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class LibraryDetail(LibraryOut):
    hours: list[LibraryHoursOut] = []
    external_links: list[LibraryExternalLinkOut] = []
    files: list[LibraryFileOut] = []
