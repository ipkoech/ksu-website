"""Editorial About KSU, history, and institutional facts models."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

from .content import WorkflowMetadataMixin

if TYPE_CHECKING:
    from .document import Document
    from .media import Media
    from .university import UniversityInfo


ABOUT_WORKFLOW_STATUSES = (
    "draft", "in_review", "changes_requested", "approved", "published", "archived"
)
FACT_KINDS = ("evergreen", "annual")
_WORKFLOW_SQL = "'draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived'"


class AboutPublishingMixin(WorkflowMetadataMixin):
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft", index=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_enabled: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)


class AboutPageContent(Base, AboutPublishingMixin):
    __tablename__ = "about_page_content"

    university_info_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("university_info.id", ondelete="CASCADE"), nullable=False
    )
    hero_eyebrow: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    hero_headline: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    hero_introduction: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    identity_heading: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    identity_narrative: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mandate_introduction: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    video_title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    video_transcript_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    hero_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    identity_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    video_poster_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    old_campus_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    modern_campus_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    history_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    section_settings: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    university_info: Mapped["UniversityInfo"] = relationship("UniversityInfo", back_populates="about_page_content")
    hero_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[hero_media_id])
    identity_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[identity_media_id])
    video_poster_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[video_poster_media_id])
    old_campus_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[old_campus_media_id])
    modern_campus_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[modern_campus_media_id])
    history_document: Mapped[Optional["Document"]] = relationship("Document", foreign_keys=[history_document_id])
    milestones: Mapped[list["HistoryMilestone"]] = relationship(
        "HistoryMilestone", back_populates="about_page_content", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (
        sa.Index("uq_about_page_content_university_active", "university_info_id", unique=True, postgresql_where=sa.text("deleted_at IS NULL")),
        sa.CheckConstraint(f"workflow_status IN ({_WORKFLOW_SQL})", name="ck_about_page_content_workflow_status"),
    )


class HistoryMilestone(Base, AboutPublishingMixin):
    __tablename__ = "history_milestones"

    about_page_content_id: Mapped[uuid.UUID] = mapped_column(sa.ForeignKey("about_page_content.id", ondelete="CASCADE"), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    year_label: Mapped[str] = mapped_column(sa.String(32), nullable=False)
    event_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    summary: Mapped[str] = mapped_column(sa.Text, nullable=False)
    expanded_body: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    image_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    image_alt_text: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    source_title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    source_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)

    about_page_content: Mapped["AboutPageContent"] = relationship("AboutPageContent", back_populates="milestones")
    image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[image_id])
    source_document: Mapped[Optional["Document"]] = relationship("Document", foreign_keys=[source_document_id])

    __table_args__ = (
        sa.UniqueConstraint("about_page_content_id", "slug", name="uq_history_milestones_page_slug"),
        sa.CheckConstraint(f"workflow_status IN ({_WORKFLOW_SQL})", name="ck_history_milestones_workflow_status"),
        sa.Index("ix_history_milestones_page_order", "about_page_content_id", "display_order"),
    )


class FactEdition(Base, AboutPublishingMixin):
    __tablename__ = "fact_editions"

    reporting_year: Mapped[int] = mapped_column(sa.Integer, nullable=False, unique=True, index=True)
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    introduction: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    methodology_note: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    verified_on: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    source_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    is_current: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)

    source_document: Mapped[Optional["Document"]] = relationship("Document", foreign_keys=[source_document_id])
    groups: Mapped[list["FactGroup"]] = relationship("FactGroup", back_populates="edition", cascade="all, delete-orphan", lazy="selectin")

    __table_args__ = (
        sa.CheckConstraint("reporting_year >= 1965 AND reporting_year <= 2100", name="ck_fact_editions_reporting_year"),
        sa.CheckConstraint(f"workflow_status IN ({_WORKFLOW_SQL})", name="ck_fact_editions_workflow_status"),
        sa.Index("uq_fact_editions_one_published_current", "is_current", unique=True, postgresql_where=sa.text("is_current IS TRUE AND workflow_status = 'published' AND deleted_at IS NULL")),
    )


class FactGroup(Base, AboutPublishingMixin):
    __tablename__ = "fact_groups"

    fact_edition_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("fact_editions.id", ondelete="CASCADE"), nullable=True, index=True)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    heading: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    image_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    image_alt_text: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    edition: Mapped[Optional["FactEdition"]] = relationship("FactEdition", back_populates="groups")
    image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[image_id])
    items: Mapped[list["FactItem"]] = relationship("FactItem", back_populates="group", cascade="all, delete-orphan", lazy="selectin")

    __table_args__ = (
        sa.Index("uq_fact_groups_edition_slug", "fact_edition_id", "slug", unique=True),
        sa.CheckConstraint(f"workflow_status IN ({_WORKFLOW_SQL})", name="ck_fact_groups_workflow_status"),
        sa.Index("ix_fact_groups_edition_order", "fact_edition_id", "display_order"),
    )


class FactItem(Base, AboutPublishingMixin):
    __tablename__ = "fact_items"

    fact_group_id: Mapped[uuid.UUID] = mapped_column(sa.ForeignKey("fact_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    fact_kind: Mapped[str] = mapped_column(sa.String(32), nullable=False)
    label: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    display_value: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    numeric_value: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(20, 4), nullable=True)
    prefix: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    suffix: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    unit: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    explanation: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    icon_key: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    link_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    link_label: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    source_title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    verified_on: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    group: Mapped["FactGroup"] = relationship("FactGroup", back_populates="items")

    __table_args__ = (
        sa.CheckConstraint("fact_kind IN ('evergreen', 'annual')", name="ck_fact_items_kind"),
        sa.CheckConstraint(f"workflow_status IN ({_WORKFLOW_SQL})", name="ck_fact_items_workflow_status"),
        sa.Index("ix_fact_items_group_order", "fact_group_id", "display_order"),
    )


__all__ = [
    "ABOUT_WORKFLOW_STATUSES", "FACT_KINDS", "AboutPageContent",
    "HistoryMilestone", "FactEdition", "FactGroup", "FactItem",
]
