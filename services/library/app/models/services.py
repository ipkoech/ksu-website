"""Library service offerings and statistics models."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base


class LibraryService(Base):
    """A service offered by a library branch (e.g. printing, inter-library loan)."""

    __tablename__ = "library_services"
    __table_args__ = (
        sa.Index(
            "ix_library_services_library_active_public_sort",
            "library_id",
            "is_active",
            "is_public",
            "sort_order",
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
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # "borrowing" | "printing" | "scanning" | "inter_library_loan" | "reference" | "training" | "other"
    service_type: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="other"
    )

    how_to_access: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    contact_info: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)

    # Cross-service FK: resolves to main.media.id for icon — no ORM relationship
    icon_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )

    library: Mapped["Library"] = relationship("Library", back_populates="services")  # type: ignore[name-defined]


class LibraryStatistics(Base):
    """Periodic aggregated statistics snapshot for a library branch."""

    __tablename__ = "library_statistics"
    __table_args__ = (
        sa.Index(
            "ix_library_statistics_library_period_start",
            "library_id",
            "period_type",
            "period_start",
        ),
        {"schema": "library"},
    )

    library_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.libraries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # "monthly" | "annual"
    period_type: Mapped[str] = mapped_column(
        sa.String(16), nullable=False, default="monthly"
    )
    period_start: Mapped[date] = mapped_column(sa.Date, nullable=False)
    period_end: Mapped[date] = mapped_column(sa.Date, nullable=False)

    total_books: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    total_journals: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    total_theses: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    total_ebooks: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    total_loans: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    total_renewals: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    total_reservations: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    total_visits: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    fines_collected: Mapped[Optional[Decimal]] = mapped_column(
        sa.Numeric(12, 2), nullable=True
    )
    currency: Mapped[str] = mapped_column(sa.String(8), nullable=False, default="KES")

    # Arbitrary extra stats as JSON
    extra: Mapped[Optional[dict]] = mapped_column(sa.JSON, nullable=True)

    notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    library: Mapped["Library"] = relationship("Library", back_populates="statistics")  # type: ignore[name-defined]
