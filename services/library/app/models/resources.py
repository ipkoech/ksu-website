"""Physical resource models: LibraryResource, LibraryLoan, LibraryResourceReservation, LibraryCharge."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base


class LibraryResource(Base):
    """A physical or electronic catalog item held by a library branch."""

    __tablename__ = "library_resources"
    __table_args__ = (
        sa.Index(
            "ix_library_resources_library_active_type_status_title",
            "library_id",
            "is_active",
            "resource_type",
            "status",
            "title",
        ),
        {"schema": "library"},
    )

    library_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.libraries.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False, index=True)
    subtitle: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    authors: Mapped[Optional[str]] = mapped_column(
        sa.String(500), nullable=True
    )  # comma-separated
    publisher: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    publication_year: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    edition: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    language: Mapped[str] = mapped_column(sa.String(16), nullable=False, default="en")

    # Identifiers
    isbn: Mapped[Optional[str]] = mapped_column(
        sa.String(32), nullable=True, index=True
    )
    issn: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    call_number: Mapped[Optional[str]] = mapped_column(
        sa.String(64), nullable=True, index=True
    )
    barcode: Mapped[Optional[str]] = mapped_column(
        sa.String(64), nullable=True, unique=True, index=True
    )

    # "book" | "journal" | "thesis" | "report" | "magazine" | "newspaper" | "multimedia" | "map" | "other"
    resource_type: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="book", index=True
    )

    # "available" | "on_loan" | "reserved" | "processing" | "lost" | "damaged" | "withdrawn"
    status: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="available", index=True
    )

    location_shelf: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    total_copies: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=1)
    available_copies: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=1)

    subject_tags: Mapped[Optional[dict]] = mapped_column(
        sa.JSON, nullable=True
    )  # list of strings

    # Cross-service FK: resolves to main.media.id — no ORM relationship
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )

    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    table_of_contents: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Loan duration override (falls back to LibraryCharge default)
    default_loan_days: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    is_loanable: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    is_reference_only: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, default=False
    )
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)

    library: Mapped["Library"] = relationship("Library", back_populates="resources")
    loans: Mapped[list[LibraryLoan]] = relationship(
        "LibraryLoan", back_populates="resource", cascade="all, delete-orphan"
    )
    reservations: Mapped[list[LibraryResourceReservation]] = relationship(
        "LibraryResourceReservation",
        back_populates="resource",
        cascade="all, delete-orphan",
    )


class LibraryLoan(Base):
    """A borrowing record for a library resource."""

    __tablename__ = "library_loans"
    __table_args__ = (
        sa.Index(
            "ix_library_loans_borrower_status_borrowed",
            "borrower_person_id",
            "status",
            "borrowed_at",
        ),
        sa.Index(
            "ix_library_loans_resource_status_due", "resource_id", "status", "due_at"
        ),
        {"schema": "library"},
    )

    resource_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_resources.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Cross-service FK: resolves to main.persons.id — no ORM relationship
    borrower_person_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), nullable=False, index=True
    )

    # Cross-service FK: resolves to main.staff_assignments.id — no ORM relationship
    issued_by_staff_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )
    returned_to_staff_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )

    borrowed_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False
    )
    due_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False, index=True
    )
    returned_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )

    # "active" | "returned" | "overdue" | "lost"
    status: Mapped[str] = mapped_column(
        sa.String(16), nullable=False, default="active", index=True
    )

    renewals_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    max_renewals: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=2)

    fine_amount: Mapped[Decimal] = mapped_column(
        sa.Numeric(10, 2), nullable=False, default=0
    )
    fine_paid: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=False)
    fine_paid_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )

    notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    resource: Mapped[LibraryResource] = relationship(
        "LibraryResource", back_populates="loans"
    )


class LibraryResourceReservation(Base):
    """A hold/reservation request for a library resource."""

    __tablename__ = "library_resource_reservations"
    __table_args__ = (
        sa.Index(
            "ix_library_reservations_requester_status_reserved",
            "requester_person_id",
            "status",
            "reserved_at",
        ),
        sa.Index(
            "ix_library_reservations_resource_status_reserved",
            "resource_id",
            "status",
            "reserved_at",
        ),
        {"schema": "library"},
    )

    resource_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_resources.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Cross-service FK: resolves to main.persons.id — no ORM relationship
    requester_person_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), nullable=False, index=True
    )

    reserved_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )
    ready_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )

    # "pending" | "ready" | "collected" | "cancelled" | "expired"
    status: Mapped[str] = mapped_column(
        sa.String(16), nullable=False, default="pending", index=True
    )

    queue_position: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=1)
    notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    resource: Mapped[LibraryResource] = relationship(
        "LibraryResource", back_populates="reservations"
    )


class LibraryCharge(Base):
    """Fee schedule for a library branch (fines, membership, printing, etc.)."""

    __tablename__ = "library_charges"
    __table_args__ = (
        sa.Index(
            "ix_library_charges_library_active_type",
            "library_id",
            "is_active",
            "charge_type",
        ),
        {"schema": "library"},
    )

    library_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.libraries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # "overdue_fine" | "lost_item" | "damaged_item" | "membership" | "printing" | "photocopy" | "other"
    charge_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)

    amount: Mapped[Decimal] = mapped_column(sa.Numeric(10, 2), nullable=False)

    # "per_day" | "flat" | "per_page" | "per_copy"
    rate_unit: Mapped[str] = mapped_column(
        sa.String(16), nullable=False, default="flat"
    )

    currency: Mapped[str] = mapped_column(sa.String(8), nullable=False, default="KES")
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)

    effective_from: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    effective_to: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    library: Mapped["Library"] = relationship("Library", back_populates="charges")
