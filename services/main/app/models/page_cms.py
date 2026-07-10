"""Page CMS models for structured public page sections and spotlights."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .auth import User


PAGE_SCOPE_TYPES = ("university", "school", "research", "library")
PAGE_SECTION_STATUSES = ("draft", "in_review", "changes_requested", "approved", "published", "archived")
SECTION_ITEM_TYPES = ("text", "card", "stat", "cta", "media", "video")
PARTNERSHIP_CTA_SOURCES = ("research_partner", "custom")


class PageSection(Base):
    """Structured section configuration for a scoped public page."""

    __tablename__ = "page_sections"
    __table_args__ = (
        sa.Index(
            "uq_page_sections_scope_section_with_scope_id",
            "page_key",
            "scope_type",
            "scope_id",
            "section_key",
            unique=True,
            postgresql_where=sa.text("scope_id IS NOT NULL"),
        ),
        sa.Index(
            "uq_page_sections_scope_section_without_scope_id",
            "page_key",
            "scope_type",
            "section_key",
            unique=True,
            postgresql_where=sa.text("scope_id IS NULL"),
        ),
        sa.CheckConstraint(
            "scope_type IN ('university', 'school', 'research', 'library')",
            name="ck_page_sections_scope_type",
        ),
        sa.CheckConstraint(
            "status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived')",
            name="ck_page_sections_status",
        ),
        sa.CheckConstraint(
            "(valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)",
            name="ck_page_sections_valid_window",
        ),
        sa.CheckConstraint(
            "(scope_type != 'school') OR (scope_id IS NOT NULL)",
            name="ck_page_sections_school_scope_requires_id",
        ),
        sa.Index("ix_page_sections_scope_page", "scope_type", "scope_id", "page_key"),
        sa.Index("ix_page_sections_status_window", "status", "valid_from", "valid_to"),
    )

    page_key: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    scope_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default=PAGE_SCOPE_TYPES[0])
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True)
    section_key: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    is_enabled: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    layout_variant: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="default")
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default=PAGE_SECTION_STATUSES[0])
    valid_from: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    valid_to: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    updated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    published_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    items: Mapped[list["SectionItem"]] = relationship(
        "SectionItem",
        back_populates="page_section",
        cascade="all, delete-orphan",
        order_by="SectionItem.display_order",
        lazy="selectin",
    )
    created_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[created_by_id])
    updated_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[updated_by_id])
    approved_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[approved_by_id])
    published_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[published_by_id])


class SectionItem(Base):
    """Flexible item content rendered within a page section."""

    __tablename__ = "section_items"
    __table_args__ = (
        sa.CheckConstraint(
            "item_type IN ('text', 'card', 'stat', 'cta', 'media', 'video')",
            name="ck_section_items_item_type",
        ),
        sa.Index("ix_section_items_section_order", "page_section_id", "display_order"),
    )

    page_section_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("page_sections.id", ondelete="CASCADE"),
        nullable=False,
    )
    item_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default=SECTION_ITEM_TYPES[0])
    title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    subtitle: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    body_text: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    content: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    cta_label: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    cta_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    cta_description: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    media_caption: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    media_alt_text: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    video_provider: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    video_duration_seconds: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    is_enabled: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))

    page_section: Mapped["PageSection"] = relationship("PageSection", back_populates="items")


class PartnershipSpotlight(Base):
    """Editorial spotlight content keyed to a research partner source record."""

    __tablename__ = "partnership_spotlights"
    __table_args__ = (
        sa.CheckConstraint(
            "source_type = 'research_partner'",
            name="ck_partnership_spotlights_source_type",
        ),
        sa.CheckConstraint(
            "cta_source IN ('research_partner', 'custom')",
            name="ck_partnership_spotlights_cta_source",
        ),
        sa.CheckConstraint(
            "status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived')",
            name="ck_partnership_spotlights_status",
        ),
        sa.CheckConstraint(
            "(valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)",
            name="ck_partnership_spotlights_valid_window",
        ),
        sa.Index("ix_partnership_spotlights_source", "source_type", "source_id"),
    )

    source_type: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="research_partner")
    source_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False)
    cta_source: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default=PARTNERSHIP_CTA_SOURCES[0],
    )
    cta_label: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    cta_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    headline: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    pillars: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    opportunities: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    is_enabled: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default=PAGE_SECTION_STATUSES[0])
    valid_from: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    valid_to: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)


__all__ = [
    "PAGE_SCOPE_TYPES",
    "PAGE_SECTION_STATUSES",
    "SECTION_ITEM_TYPES",
    "PARTNERSHIP_CTA_SOURCES",
    "PageSection",
    "SectionItem",
    "PartnershipSpotlight",
]
