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
PAGE_SECTION_LAYOUT_VARIANTS = (
    "hero_admissions",
    "pulse_strip",
    "featured_partnership",
    "programme_finder",
    "date_timeline",
    "pillar_grid",
    "media_mosaic",
    "leadership_activity",
    "research_cards",
    "news_grid",
    "events_list",
    "logo_carousel",
    "alumni_story",
    "facts_strip",
)
SECTION_ITEM_TYPES = ("text", "card", "stat", "cta", "media", "video", "reference")
SECTION_ITEM_SOURCE_TYPES = (
    "intake",
    "programme",
    "academic_calendar",
    "person",
    "staff_assignment",
    "research_project",
    "publication",
    "news",
    "event",
    "research_partner",
    "alumni",
    "testimonial",
    "public_stat",
    "club_activity",
)
SECTION_ITEM_REFERENCE_CONTENT_FIELDS = (
    "title",
    "subtitle",
    "body_text",
    "content",
    "cta_label",
    "cta_url",
    "cta_description",
    "media_caption",
    "media_alt_text",
    "video_provider",
    "video_url",
    "video_duration_seconds",
)
PARTNERSHIP_CTA_SOURCES = ("manual", "partner_website", "generated_detail_page")


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
        sa.CheckConstraint(
            "layout_variant IN "
            "('hero_admissions', 'pulse_strip', 'featured_partnership', 'programme_finder', "
            "'date_timeline', 'pillar_grid', 'media_mosaic', 'leadership_activity', "
            "'research_cards', 'news_grid', 'events_list', 'logo_carousel', 'alumni_story', "
            "'facts_strip')",
            name="ck_page_sections_layout_variant",
        ),
        sa.Index("ix_page_sections_scope_page", "scope_type", "scope_id", "page_key"),
        sa.Index("ix_page_sections_scope_page_order", "scope_type", "scope_id", "page_key", "display_order"),
        sa.Index("ix_page_sections_status_window", "status", "valid_from", "valid_to"),
    )

    page_key: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    scope_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default=PAGE_SCOPE_TYPES[0])
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True)
    section_key: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    subtitle: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    settings: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    revision: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("1"))
    is_enabled: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    layout_variant: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        server_default=PAGE_SECTION_LAYOUT_VARIANTS[0],
    )
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default=PAGE_SECTION_STATUSES[0])
    workflow_status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default=PAGE_SECTION_STATUSES[0], index=True)
    owner_portal: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    owner_scope_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True, index=True)
    owner_scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    valid_from: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    valid_to: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    scheduled_publish_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    unpublished_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    revision_notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    updated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    submitted_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
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
    unpublished_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
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
    submitted_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[submitted_by_id])
    reviewed_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[reviewed_by_id])
    approved_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[approved_by_id])
    published_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[published_by_id])
    unpublished_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[unpublished_by_id])


class SectionItem(Base):
    """Flexible item content rendered within a page section."""

    __tablename__ = "section_items"
    __table_args__ = (
        sa.CheckConstraint(
            "item_type IN ('text', 'card', 'stat', 'cta', 'media', 'video', 'reference')",
            name="ck_section_items_item_type",
        ),
        sa.CheckConstraint(
            "((source_type IS NULL AND source_id IS NULL) OR "
            "(source_type IS NOT NULL AND source_id IS NOT NULL))",
            name="ck_section_items_source_reference",
        ),
        sa.CheckConstraint(
            "source_type IS NULL OR source_type IN "
            "('intake', 'programme', 'academic_calendar', 'person', 'staff_assignment', "
            "'research_project', 'publication', 'news', 'event', 'research_partner', 'alumni', "
            "'testimonial', 'public_stat', 'club_activity')",
            name="ck_section_items_source_type",
        ),
        sa.CheckConstraint(
            "source_type IS NULL OR item_type = 'reference'",
            name="ck_section_items_source_reference_item_type",
        ),
        sa.CheckConstraint(
            "item_type != 'reference' OR ("
            "(title IS NULL OR btrim(title) = '') AND "
            "(subtitle IS NULL OR btrim(subtitle) = '') AND "
            "(body_text IS NULL OR btrim(body_text) = '') AND "
            "(content IS NULL OR content = '{}'::jsonb) AND "
            "(cta_label IS NULL OR btrim(cta_label) = '') AND "
            "(cta_url IS NULL OR btrim(cta_url) = '') AND "
            "(cta_description IS NULL OR btrim(cta_description) = '') AND "
            "(media_caption IS NULL OR btrim(media_caption) = '') AND "
            "(media_alt_text IS NULL OR btrim(media_alt_text) = '') AND "
            "(video_provider IS NULL OR btrim(video_provider) = '') AND "
            "(video_url IS NULL OR btrim(video_url) = '') AND "
            "(video_duration_seconds IS NULL OR video_duration_seconds = 0)"
            ")",
            name="ck_section_items_reference_content_empty",
        ),
        sa.Index("ix_section_items_section_order", "page_section_id", "display_order"),
        sa.Index("ix_section_items_source", "source_type", "source_id"),
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
    source_type: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    source_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True)
    editorial_overrides: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    revision: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("1"))
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
            "primary_cta_source IN ('manual', 'partner_website', 'generated_detail_page')",
            name="ck_partnership_spotlights_primary_cta_source",
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
    primary_cta_source: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default=PARTNERSHIP_CTA_SOURCES[0],
    )
    primary_cta_label: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    primary_cta_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    headline: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    pillars: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    opportunities: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    is_enabled: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default=PAGE_SECTION_STATUSES[0])
    workflow_status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default=PAGE_SECTION_STATUSES[0], index=True)
    owner_portal: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    owner_scope_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True, index=True)
    owner_scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    valid_from: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    valid_to: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    scheduled_publish_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    unpublished_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    revision_notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    submitted_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
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
    unpublished_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )


__all__ = [
    "PAGE_SCOPE_TYPES",
    "PAGE_SECTION_STATUSES",
    "PAGE_SECTION_LAYOUT_VARIANTS",
    "SECTION_ITEM_TYPES",
    "SECTION_ITEM_SOURCE_TYPES",
    "SECTION_ITEM_REFERENCE_CONTENT_FIELDS",
    "PARTNERSHIP_CTA_SOURCES",
    "PageSection",
    "SectionItem",
    "PartnershipSpotlight",
]
