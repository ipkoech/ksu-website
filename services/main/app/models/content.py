"""Content models for main site publishing."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, declared_attr, mapped_column, relationship

from ksu_common.models.base import Base, SEOMixin


class UpdatedByMixin:
    """Attribution for the most recent edit on a record."""

    updated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    @declared_attr
    def updated_by(cls) -> Mapped[Optional["User"]]:
        return relationship("User", foreign_keys=f"{cls.__name__}.updated_by_id")


class WorkflowMetadataMixin:
    """Audit fields shared by publishable content records."""

    workflow_status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft", index=True)
    owner_portal: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    owner_scope_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True, index=True)
    owner_scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    submitted_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    reviewed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    published_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    scheduled_publish_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    unpublished_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    unpublished_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    revision_notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)


class ScopedContentMixin(WorkflowMetadataMixin):
    """Shared scope, publication, and display controls."""

    scope_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True, index=True)
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    is_main: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    is_published: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    valid_from: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    valid_to: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    archived_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft", index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))


class RichContentMixin:
    """Shared title/body fields for editorial content."""

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(255), nullable=False, unique=True, index=True)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    plain_text: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    rich_text: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    structured_content: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    related_links: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    featured_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    author_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )


class News(Base, SEOMixin, ScopedContentMixin, RichContentMixin, UpdatedByMixin):
    __tablename__ = "news"
    __table_args__ = (
        sa.Index("ix_news_public_listing_workflow", "is_public", "is_published", "workflow_status", "published_at"),
        sa.Index("ix_news_workflow_queue", "workflow_status", "submitted_at"),
        sa.Index("ix_news_owner_workflow_queue", "owner_portal", "workflow_status", "submitted_at"),
        sa.Index("ix_news_schedule_expiry", "scheduled_publish_at", "expires_at"),
    )

    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    featured_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys="News.featured_media_id")
    author: Mapped[Optional["User"]] = relationship("User", foreign_keys="News.author_user_id")


class Blog(Base, SEOMixin, ScopedContentMixin, RichContentMixin, UpdatedByMixin):
    __tablename__ = "blogs"
    __table_args__ = (
        sa.Index("ix_blogs_public_listing_workflow", "is_public", "is_published", "workflow_status", "published_at"),
        sa.Index("ix_blogs_workflow_queue", "workflow_status", "submitted_at"),
        sa.Index("ix_blogs_owner_workflow_queue", "owner_portal", "workflow_status", "submitted_at"),
        sa.Index("ix_blogs_schedule_expiry", "scheduled_publish_at", "expires_at"),
    )

    excerpt: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    featured_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys="Blog.featured_media_id")
    author: Mapped[Optional["User"]] = relationship("User", foreign_keys="Blog.author_user_id")


class Story(Base, SEOMixin, ScopedContentMixin, RichContentMixin, UpdatedByMixin):
    """Submitted and editorial stories for the public website."""

    __tablename__ = "stories"
    __table_args__ = (
        sa.Index("ix_stories_public_listing", "is_public", "is_published", "workflow_status", "published_at"),
        sa.Index("ix_stories_workflow_queue", "workflow_status", "submitted_at"),
        sa.Index("ix_stories_owner_workflow_queue", "owner_portal", "workflow_status", "submitted_at"),
        sa.Index("ix_stories_contributor_dashboard", "contributor_user_id", "workflow_status", "updated_at"),
        sa.Index("ix_stories_featured_homepage", "is_featured", "featured_until", "homepage_priority", "published_at"),
        sa.Index("ix_stories_type_published", "story_type", "published_at"),
        sa.Index("ix_stories_category_published", "category", "published_at"),
    )

    story_type: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="article", index=True)
    category: Mapped[Optional[str]] = mapped_column(sa.String(96), nullable=True, index=True)
    source_type: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="external", index=True)
    contributor_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    contributor_name_snapshot: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contributor_email_snapshot: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    contributor_affiliation_snapshot: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    show_contributor_name: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    consent_to_publish: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    featured_until: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    homepage_priority: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    reading_minutes: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    featured_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys="Story.featured_media_id")
    author: Mapped[Optional["User"]] = relationship("User", foreign_keys="Story.author_user_id")
    contributor: Mapped[Optional["User"]] = relationship("User", foreign_keys="Story.contributor_user_id")


class StoryContributorAccountRequest(Base):
    """Request queue for external story contributor accounts."""

    __tablename__ = "story_contributor_account_requests"
    __table_args__ = (
        sa.Index("ix_story_contributor_requests_status_created", "status", "created_at"),
        sa.Index("ix_story_contributor_requests_email_status", "email", "status"),
        sa.Index("ix_story_contributor_requests_reviewed", "reviewed_by_id", "reviewed_at"),
    )

    full_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    email: Mapped[str] = mapped_column(sa.String(320), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    affiliation: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contributor_type: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="external", index=True)
    reason_for_request: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="pending", index=True)
    reviewed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    approved_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    verification_token: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True, index=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    reviewed_by: Mapped[Optional["User"]] = relationship("User", foreign_keys="StoryContributorAccountRequest.reviewed_by_id")
    approved_user: Mapped[Optional["User"]] = relationship("User", foreign_keys="StoryContributorAccountRequest.approved_user_id")


class Announcement(Base, SEOMixin, ScopedContentMixin, RichContentMixin, UpdatedByMixin):
    __tablename__ = "announcements"
    __table_args__ = (
        sa.Index("ix_announcements_public_listing_workflow", "is_public", "is_published", "workflow_status", "published_at"),
        sa.Index("ix_announcements_workflow_queue", "workflow_status", "submitted_at"),
        sa.Index("ix_announcements_owner_workflow_queue", "owner_portal", "workflow_status", "submitted_at"),
        sa.Index("ix_announcements_schedule_expiry", "scheduled_publish_at", "expires_at"),
    )

    priority: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="normal")
    category: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    audience: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="all")
    youtube_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    featured_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys="Announcement.featured_media_id")
    author: Mapped[Optional["User"]] = relationship("User", foreign_keys="Announcement.author_user_id")


class Event(Base, SEOMixin, ScopedContentMixin, UpdatedByMixin):
    __tablename__ = "events"
    __table_args__ = (
        sa.Index("ix_events_public_listing_workflow", "is_public", "is_published", "workflow_status", "published_at"),
        sa.Index("ix_events_workflow_queue", "workflow_status", "submitted_at"),
        sa.Index("ix_events_owner_workflow_queue", "owner_portal", "workflow_status", "submitted_at"),
        sa.Index("ix_events_schedule_expiry", "scheduled_publish_at", "expires_at"),
        sa.Index("ix_events_upcoming_public", "start_date", "is_public", "is_published", "workflow_status"),
    )

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(255), nullable=False, unique=True, index=True)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    plain_text: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    rich_text: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    structured_content: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    start_date: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, index=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    is_virtual: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    meeting_link: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    featured_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    author_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    related_links: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    featured_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys="Event.featured_media_id")
    author: Mapped[Optional["User"]] = relationship("User", foreign_keys="Event.author_user_id")


class SliderGroup(Base):
    __tablename__ = "slider_groups"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(255), nullable=False, unique=True, index=True)
    location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    scope_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True, index=True)
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    is_main: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    max_slides: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    auto_play: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    auto_play_duration: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    show_navigation_dots: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    show_arrows: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    transition_effect: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)

    sliders: Mapped[list["Slider"]] = relationship(
        "Slider",
        back_populates="slider_group",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class Slider(Base, WorkflowMetadataMixin, UpdatedByMixin):
    __tablename__ = "sliders"

    slider_group_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("slider_groups.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    subtitle: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    plain_text: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    rich_text: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    structured_content: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    desktop_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    mobile_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    external_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    link_text: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    open_in_new_tab: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    scope_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True, index=True)
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    is_main: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    start_datetime: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    end_datetime: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    archived_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    slider_group: Mapped[Optional["SliderGroup"]] = relationship("SliderGroup", back_populates="sliders")
    desktop_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys="Slider.desktop_media_id")
    mobile_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys="Slider.mobile_media_id")


__all__ = [
    "UpdatedByMixin",
    "News",
    "Blog",
    "Story",
    "StoryContributorAccountRequest",
    "Announcement",
    "Event",
    "SliderGroup",
    "Slider",
]
