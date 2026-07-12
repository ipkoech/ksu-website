"""Content models for main site publishing."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base, SEOMixin


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


class News(Base, SEOMixin, ScopedContentMixin, RichContentMixin):
    __tablename__ = "news"

    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    featured_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys="News.featured_media_id")
    author: Mapped[Optional["User"]] = relationship("User", foreign_keys="News.author_user_id")


class Blog(Base, SEOMixin, ScopedContentMixin, RichContentMixin):
    __tablename__ = "blogs"

    excerpt: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    featured_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys="Blog.featured_media_id")
    author: Mapped[Optional["User"]] = relationship("User", foreign_keys="Blog.author_user_id")


class Announcement(Base, SEOMixin, ScopedContentMixin, RichContentMixin):
    __tablename__ = "announcements"

    priority: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="normal")
    category: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    audience: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="all")
    youtube_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    featured_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys="Announcement.featured_media_id")
    author: Mapped[Optional["User"]] = relationship("User", foreign_keys="Announcement.author_user_id")


class Event(Base, SEOMixin, ScopedContentMixin):
    __tablename__ = "events"

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


class Slider(Base, WorkflowMetadataMixin):
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
    "News",
    "Blog",
    "Announcement",
    "Event",
    "SliderGroup",
    "Slider",
]
