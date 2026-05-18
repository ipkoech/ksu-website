"""Electronic resource models: ElectronicResource, ElectronicResourceGuide."""

from __future__ import annotations

import uuid
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base


class ElectronicResource(Base):
    """An electronic database or e-resource available to library users (A-Z listing)."""

    __tablename__ = "electronic_resources"
    __table_args__ = (
        sa.Index(
            "ix_library_electronic_resources_library_active_letter_sort",
            "library_id",
            "is_active",
            "section_letter",
            "sort_order",
            "name",
        ),
        sa.Index(
            "ix_library_electronic_resources_active_type_access",
            "is_active",
            "resource_type",
            "access_level",
        ),
        {"schema": "library"},
    )

    library_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.libraries.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(
        sa.String(128), nullable=False, unique=True, index=True
    )
    provider: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    access_url: Mapped[str] = mapped_column(sa.String(1000), nullable=False)

    # For A-Z navigation (single uppercase letter, e.g. "A", "B")
    section_letter: Mapped[str] = mapped_column(
        sa.String(1), nullable=False, index=True
    )

    # "database" | "ebook_platform" | "ejournal_aggregator" | "news" | "reference" | "other"
    resource_type: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="database", index=True
    )

    subjects: Mapped[Optional[dict]] = mapped_column(
        sa.JSON, nullable=True
    )  # list of subject strings
    coverage_dates: Mapped[Optional[str]] = mapped_column(
        sa.String(128), nullable=True
    )  # e.g. "1990–present"
    simultaneous_users: Mapped[Optional[str]] = mapped_column(
        sa.String(64), nullable=True
    )

    # "all" | "staff" | "students" | "postgraduate" | "academic_staff"
    access_level: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="all"
    )

    # "on_campus" | "off_campus" | "both"
    access_type: Mapped[str] = mapped_column(
        sa.String(16), nullable=False, default="both"
    )

    requires_vpn: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, default=False
    )
    requires_registration: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, default=False
    )

    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=False)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)

    # Cross-service FK: resolves to main.media.id — no ORM relationship
    logo_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )

    notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    library: Mapped[Optional["Library"]] = relationship(
        "Library", back_populates="electronic_resources"
    )
    guides: Mapped[list[ElectronicResourceGuide]] = relationship(
        "ElectronicResourceGuide",
        back_populates="electronic_resource",
        cascade="all, delete-orphan",
    )


class ElectronicResourceGuide(Base):
    """Step-by-step access guide for an electronic resource."""

    __tablename__ = "electronic_resource_guides"
    __table_args__ = (
        sa.Index(
            "ix_library_electronic_guides_resource_active_sort",
            "electronic_resource_id",
            "is_active",
            "sort_order",
        ),
        {"schema": "library"},
    )

    electronic_resource_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.electronic_resources.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Ordered list of steps: [{"step": 1, "instruction": "...", "screenshot_url": "..."}]
    access_steps: Mapped[Optional[dict]] = mapped_column(sa.JSON, nullable=True)

    search_tips: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    recommended_subjects: Mapped[Optional[dict]] = mapped_column(
        sa.JSON, nullable=True
    )  # list of strings

    # "pdf" | "video" | "html"
    guide_type: Mapped[str] = mapped_column(
        sa.String(16), nullable=False, default="html"
    )

    # Cross-service FK: resolves to main.media.id for PDF/video upload — no ORM relationship
    media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )

    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)

    electronic_resource: Mapped[ElectronicResource] = relationship(
        "ElectronicResource", back_populates="guides"
    )
