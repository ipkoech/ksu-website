"""Pydantic v2 schemas for LibraryResource, LibraryLoan, LibraryResourceReservation, LibraryCharge."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


# ── LibraryResource ───────────────────────────────────────────────────────────


class LibraryResourceBase(BaseModel):
    library_id: uuid.UUID
    title: str
    subtitle: Optional[str] = None
    authors: Optional[str] = None
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    edition: Optional[str] = None
    language: str = "en"
    isbn: Optional[str] = None
    issn: Optional[str] = None
    call_number: Optional[str] = None
    barcode: Optional[str] = None
    resource_type: str = "book"
    status: str = "available"
    location_shelf: Optional[str] = None
    total_copies: int = 1
    available_copies: int = 1
    subject_tags: Optional[list[str]] = None
    cover_image_id: Optional[uuid.UUID] = None
    description: Optional[str] = None
    table_of_contents: Optional[str] = None
    default_loan_days: Optional[int] = None
    is_loanable: bool = True
    is_reference_only: bool = False
    is_active: bool = True

    @field_validator("resource_type")
    @classmethod
    def validate_resource_type(cls, v: str) -> str:
        allowed = {
            "book",
            "journal",
            "thesis",
            "report",
            "magazine",
            "newspaper",
            "multimedia",
            "map",
            "other",
        }
        if v not in allowed:
            raise ValueError(f"resource_type must be one of {allowed}")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {
            "available",
            "on_loan",
            "reserved",
            "processing",
            "lost",
            "damaged",
            "withdrawn",
        }
        if v not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v


class LibraryResourceCreate(LibraryResourceBase):
    pass


class LibraryResourceUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    authors: Optional[str] = None
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    edition: Optional[str] = None
    language: Optional[str] = None
    isbn: Optional[str] = None
    issn: Optional[str] = None
    call_number: Optional[str] = None
    barcode: Optional[str] = None
    resource_type: Optional[str] = None
    status: Optional[str] = None
    location_shelf: Optional[str] = None
    total_copies: Optional[int] = None
    available_copies: Optional[int] = None
    subject_tags: Optional[list[str]] = None
    cover_image_id: Optional[uuid.UUID] = None
    description: Optional[str] = None
    default_loan_days: Optional[int] = None
    is_loanable: Optional[bool] = None
    is_reference_only: Optional[bool] = None
    is_active: Optional[bool] = None


class LibraryResourceOut(LibraryResourceBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


# ── LibraryLoan ───────────────────────────────────────────────────────────────


class LibraryLoanCreate(BaseModel):
    resource_id: uuid.UUID
    borrower_person_id: uuid.UUID
    issued_by_staff_id: Optional[uuid.UUID] = None
    borrowed_at: datetime
    due_at: datetime
    max_renewals: int = 2
    notes: Optional[str] = None


class LibraryLoanUpdate(BaseModel):
    returned_at: Optional[datetime] = None
    returned_to_staff_id: Optional[uuid.UUID] = None
    status: Optional[str] = None
    fine_amount: Optional[Decimal] = None
    fine_paid: Optional[bool] = None
    fine_paid_at: Optional[datetime] = None
    notes: Optional[str] = None


class LibraryLoanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    resource_id: uuid.UUID
    resource: Optional[LibraryResourceOut] = None
    borrower_person_id: uuid.UUID
    issued_by_staff_id: Optional[uuid.UUID] = None
    returned_to_staff_id: Optional[uuid.UUID] = None
    borrowed_at: datetime
    due_at: datetime
    returned_at: Optional[datetime] = None
    status: str
    renewals_count: int
    max_renewals: int
    fine_amount: Decimal
    fine_paid: bool
    fine_paid_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ── LibraryResourceReservation ────────────────────────────────────────────────


class LibraryReservationCreate(BaseModel):
    resource_id: uuid.UUID
    requester_person_id: uuid.UUID
    notes: Optional[str] = None


class LibraryReservationUpdate(BaseModel):
    status: Optional[str] = None
    expires_at: Optional[datetime] = None
    ready_at: Optional[datetime] = None
    queue_position: Optional[int] = None
    notes: Optional[str] = None


class LibraryReservationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    resource_id: uuid.UUID
    resource: Optional[LibraryResourceOut] = None
    requester_person_id: uuid.UUID
    reserved_at: datetime
    expires_at: Optional[datetime] = None
    ready_at: Optional[datetime] = None
    status: str
    queue_position: int
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ── LibraryCharge ─────────────────────────────────────────────────────────────


class LibraryChargeBase(BaseModel):
    library_id: uuid.UUID
    name: str
    description: Optional[str] = None
    charge_type: str
    amount: Decimal
    rate_unit: str = "flat"
    currency: str = "KES"
    is_active: bool = True
    effective_from: Optional[date] = None
    effective_to: Optional[date] = None

    @field_validator("charge_type")
    @classmethod
    def validate_charge_type(cls, v: str) -> str:
        allowed = {
            "overdue_fine",
            "lost_item",
            "damaged_item",
            "membership",
            "printing",
            "photocopy",
            "other",
        }
        if v not in allowed:
            raise ValueError(f"charge_type must be one of {allowed}")
        return v

    @field_validator("rate_unit")
    @classmethod
    def validate_rate_unit(cls, v: str) -> str:
        allowed = {"per_day", "flat", "per_page", "per_copy"}
        if v not in allowed:
            raise ValueError(f"rate_unit must be one of {allowed}")
        return v


class LibraryChargeCreate(LibraryChargeBase):
    pass


class LibraryChargeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    rate_unit: Optional[str] = None
    is_active: Optional[bool] = None
    effective_from: Optional[date] = None
    effective_to: Optional[date] = None


class LibraryChargeOut(LibraryChargeBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
