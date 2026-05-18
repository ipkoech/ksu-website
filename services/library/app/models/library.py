"""Core library models: Library, LibraryHours, LibraryExternalLink, LibraryFile."""

from __future__ import annotations

import uuid
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base


class Library(Base):
    """Represents a physical library branch (main or satellite)."""

    __tablename__ = "libraries"
    __table_args__ = (
        sa.Index(
            "ix_library_libraries_active_sort_name", "is_active", "sort_order", "name"
        ),
        {"schema": "library"},
    )

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    short_name: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    slug: Mapped[str] = mapped_column(
        sa.String(128), nullable=False, unique=True, index=True
    )

    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(
        sa.Text, nullable=True
    )  # rich text
    regulations: Mapped[Optional[str]] = mapped_column(
        sa.Text, nullable=True
    )  # rich text
    mission: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    vision: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Cross-service FK: resolves to main.media.id — no ORM relationship
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )

    # Cross-schema FK: resolves to main.policies.id — no ORM relationship
    borrowing_policy_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )

    address: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(30), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    website_url: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)

    # Geographic coordinates
    latitude: Mapped[Optional[float]] = mapped_column(sa.Numeric(10, 7), nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(sa.Numeric(10, 7), nullable=True)

    # "main" | "branch" | "digital"
    library_type: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="main"
    )
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)

    # Sorting
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)

    hours: Mapped[list[LibraryHours]] = relationship(
        "LibraryHours", back_populates="library", cascade="all, delete-orphan"
    )
    external_links: Mapped[list[LibraryExternalLink]] = relationship(
        "LibraryExternalLink", back_populates="library", cascade="all, delete-orphan"
    )
    files: Mapped[list[LibraryFile]] = relationship(
        "LibraryFile", back_populates="library", cascade="all, delete-orphan"
    )
    resources: Mapped[list["LibraryResource"]] = relationship(
        "LibraryResource", back_populates="library", cascade="all, delete-orphan"
    )
    staff: Mapped[list["LibraryStaff"]] = relationship(
        "LibraryStaff", back_populates="library", cascade="all, delete-orphan"
    )
    services: Mapped[list["LibraryService"]] = relationship(
        "LibraryService", back_populates="library", cascade="all, delete-orphan"
    )
    statistics: Mapped[list["LibraryStatistics"]] = relationship(
        "LibraryStatistics", back_populates="library", cascade="all, delete-orphan"
    )
    charges: Mapped[list["LibraryCharge"]] = relationship(
        "LibraryCharge", back_populates="library", cascade="all, delete-orphan"
    )
    electronic_resources: Mapped[list["ElectronicResource"]] = relationship(
        "ElectronicResource", back_populates="library"
    )
    inquiries: Mapped[list["LibraryInquiry"]] = relationship(
        "LibraryInquiry", back_populates="library"
    )
    regulation_entries: Mapped[list["LibraryRegulation"]] = relationship(
        "LibraryRegulation", back_populates="library", cascade="all, delete-orphan"
    )


class LibraryHours(Base):
    """Operating hours per day type for a library branch."""

    __tablename__ = "library_hours"
    __table_args__ = (
        sa.Index("ix_library_hours_library_day_type", "library_id", "day_type"),
        {"schema": "library"},
    )

    library_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.libraries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # "weekday" | "saturday" | "sunday" | "public_holiday"
    day_type: Mapped[str] = mapped_column(sa.String(32), nullable=False)

    opens_at: Mapped[Optional[str]] = mapped_column(
        sa.String(8), nullable=True
    )  # "08:00"
    closes_at: Mapped[Optional[str]] = mapped_column(
        sa.String(8), nullable=True
    )  # "17:00"
    is_closed: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=False)
    note: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    library: Mapped[Library] = relationship("Library", back_populates="hours")


class LibraryExternalLink(Base):
    """Activatable external system links (OPAC, Repository, MYLOFT, etc.)."""

    __tablename__ = "library_external_links"
    __table_args__ = (
        sa.Index(
            "ix_library_external_links_library_active_sort",
            "library_id",
            "is_active",
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

    # "opac" | "repository" | "myloft" | "database" | "ejournal" | "other"
    link_type: Mapped[str] = mapped_column(sa.String(32), nullable=False)

    label: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    url: Mapped[str] = mapped_column(sa.String(1000), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=False)
    opens_in_new_tab: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, default=True
    )

    # Icon slug (e.g. "book-open", "database")
    icon: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)

    library: Mapped[Library] = relationship("Library", back_populates="external_links")


class LibraryFile(Base):
    """Documents/files attached to a library branch (guides, forms, reports)."""

    __tablename__ = "library_files"
    __table_args__ = (
        sa.Index(
            "ix_library_files_library_public_sort",
            "library_id",
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

    # Cross-service FK: resolves to main.media.id — no ORM relationship
    media_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # "policy" | "guide" | "form" | "report" | "brochure" | "other"
    file_category: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="other"
    )

    # "public" | "staff" | "admin"
    access_level: Mapped[str] = mapped_column(
        sa.String(16), nullable=False, default="public"
    )
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)

    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)

    # Optional polymorphic link to another entity within library schema
    related_entity_type: Mapped[Optional[str]] = mapped_column(
        sa.String(64), nullable=True, index=True
    )
    related_entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True, index=True
    )

    library: Mapped[Library] = relationship("Library", back_populates="files")
