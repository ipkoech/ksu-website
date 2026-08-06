"""Pydantic v2 schemas for LibraryStaff and LibraryService, LibraryStatistics."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator

from ..domain.leadership import LIBRARY_LEADERSHIP_ROLES

# ── LibraryStaff ──────────────────────────────────────────────────────────────


class LibraryStaffBase(BaseModel):
    library_id: uuid.UUID
    person_id: uuid.UUID
    job_title: Optional[str] = None
    department: Optional[str] = None
    role: str = "librarian"
    is_public: bool = False
    is_active: bool = True
    sort_order: int = 0
    bio: Optional[str] = None
    specialization: Optional[str] = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        allowed = {
            *LIBRARY_LEADERSHIP_ROLES,
            "librarian",
            "assistant_librarian",
            "senior_librarian",
            "chief_librarian",
            "it_support",
            "officer",
            "assistant",
            "staff",
            "other",
        }
        if v not in allowed:
            raise ValueError(f"role must be one of {allowed}")
        return v


class LibraryStaffCreate(LibraryStaffBase):
    pass


class LibraryStaffUpdate(BaseModel):
    job_title: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    is_public: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    bio: Optional[str] = None
    specialization: Optional[str] = None


class LibraryStaffOut(LibraryStaffBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


# ── LibraryService ────────────────────────────────────────────────────────────


class LibraryServiceBase(BaseModel):
    library_id: uuid.UUID
    name: str
    slug: str
    description: Optional[str] = None
    eligibility: Optional[str] = None
    service_type: str = "other"
    how_to_access: Optional[str] = None
    contact_info: Optional[str] = None
    is_public: bool = True
    is_active: bool = True
    sort_order: int = 0
    icon_media_id: Optional[uuid.UUID] = None

    @field_validator("service_type")
    @classmethod
    def validate_service_type(cls, v: str) -> str:
        allowed = {
            "borrowing",
            "printing",
            "scanning",
            "inter_library_loan",
            "reference",
            "training",
            "other",
        }
        if v not in allowed:
            raise ValueError(f"service_type must be one of {allowed}")
        return v


class LibraryServiceCreate(LibraryServiceBase):
    pass


class LibraryServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    eligibility: Optional[str] = None
    service_type: Optional[str] = None
    how_to_access: Optional[str] = None
    contact_info: Optional[str] = None
    is_public: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    icon_media_id: Optional[uuid.UUID] = None


class LibraryServiceOut(LibraryServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


# ── LibraryStatistics ─────────────────────────────────────────────────────────


class LibraryStatisticsCreate(BaseModel):
    library_id: uuid.UUID
    period_type: str = "monthly"
    period_start: date
    period_end: date
    total_books: Optional[int] = None
    total_journals: Optional[int] = None
    total_theses: Optional[int] = None
    total_ebooks: Optional[int] = None
    total_loans: Optional[int] = None
    total_renewals: Optional[int] = None
    total_reservations: Optional[int] = None
    total_visits: Optional[int] = None
    fines_collected: Optional[Decimal] = None
    currency: str = "KES"
    extra: Optional[dict] = None
    notes: Optional[str] = None

    @field_validator("period_type")
    @classmethod
    def validate_period_type(cls, v: str) -> str:
        allowed = {"monthly", "annual"}
        if v not in allowed:
            raise ValueError(f"period_type must be one of {allowed}")
        return v


class LibraryStatisticsOut(LibraryStatisticsCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
