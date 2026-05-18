"""Library staff model."""

from __future__ import annotations

import uuid
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base


class LibraryStaff(Base):
    """A library staff member (links a person from Main service to a library branch)."""

    __tablename__ = "library_staff"
    __table_args__ = (
        sa.Index(
            "ix_library_staff_library_active_public_sort",
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

    # Cross-service FK: resolves to main.persons.id — no ORM relationship
    person_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), nullable=False, index=True
    )

    job_title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # "librarian" | "assistant_librarian" | "senior_librarian" | "chief_librarian" | "it_support" | "other"
    role: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="librarian"
    )

    # Controls public-facing staff directory visibility
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)

    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)

    bio: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    specialization: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    library: Mapped["Library"] = relationship("Library", back_populates="staff")  # type: ignore[name-defined]
