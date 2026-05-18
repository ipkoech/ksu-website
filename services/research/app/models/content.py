"""Content models: news, articles, events, sliders specific to research service."""

from __future__ import annotations

import uuid
from datetime import date, datetime, time
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from ksu_common.models.base import AttachmentRefsMixin, CoverImageRefMixin, PhotoRefMixin, SEOMixin, ThumbnailRefMixin

from .base import Base


class ResearchNews(Base, SEOMixin, CoverImageRefMixin, AttachmentRefsMixin):
    """
    Research-specific news article.
    """

    __tablename__ = "research_news"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)

    news_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="news",
        index=True,
    )  # news | announcement | press_release | update | achievement

    # Author
    author_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    author_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Related entities
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    publication_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    innovation_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    content: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    excerpt: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)

    # Media
    video_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Tags & categories
    tags: Mapped[Optional[list[str]]] = mapped_column(sa.JSON, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)

    # Dates
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    # External link
    external_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    source: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Stats
    view_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="draft",
        index=True,
    )  # draft | published | archived | scheduled
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    is_pinned: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<ResearchNews {self.slug}: {self.title[:50]}>"


class ResearchArticle(Base, SEOMixin, CoverImageRefMixin, PhotoRefMixin, AttachmentRefsMixin):
    """
    Long-form research article/blog post.
    """

    __tablename__ = "research_articles"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)

    article_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="article",
        index=True,
    )  # article | opinion | explainer | interview | feature | review

    # Author
    author_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    author_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    author_bio: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Related entities
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    theme_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    content: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    excerpt: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)

    # Media
    cover_image_caption: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Tags & categories
    tags: Mapped[Optional[list[str]]] = mapped_column(sa.JSON, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)

    # Reading
    reading_time_minutes: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # Dates
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)

    # Stats
    view_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    share_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))

    # Related articles
    related_article_ids: Mapped[Optional[list[uuid.UUID]]] = mapped_column(sa.JSON, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="draft",
        index=True,
    )  # draft | published | archived | scheduled
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<ResearchArticle {self.slug}: {self.title[:50]}>"


class ResearchEvent(Base, SEOMixin, CoverImageRefMixin, AttachmentRefsMixin):
    """
    Research-specific event (conference, seminar, workshop, etc.).
    """

    __tablename__ = "research_events"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)

    event_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="seminar",
        index=True,
    )  # conference | seminar | workshop | webinar | symposium | colloquium | defense | lecture

    # Organizer
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    organizer_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    organizer_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    target_audience: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    agenda: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Speakers
    speakers: Mapped[Optional[list[dict]]] = mapped_column(sa.JSON, nullable=True)
    keynote_speaker: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Schedule
    start_date: Mapped[date] = mapped_column(sa.Date, nullable=False, index=True)
    end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    start_time: Mapped[Optional[time]] = mapped_column(sa.Time, nullable=True)
    end_time: Mapped[Optional[time]] = mapped_column(sa.Time, nullable=True)
    timezone: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="Africa/Nairobi")

    # Location
    venue: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    room: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    gps_latitude: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)
    gps_longitude: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)

    # Virtual
    is_virtual: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    is_hybrid: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    meeting_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    platform: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)

    # Registration
    requires_registration: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    registration_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    registration_deadline: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    max_participants: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    current_registrations: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))

    # Fees
    is_free: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    fee: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)

    # Contact
    contact_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)

    # Media
    recording_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Tags
    tags: Mapped[Optional[list[str]]] = mapped_column(sa.JSON, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="upcoming",
        index=True,
    )  # draft | upcoming | ongoing | completed | cancelled | postponed
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<ResearchEvent {self.slug}: {self.title[:50]}>"


class ResearchSlider(Base, CoverImageRefMixin, ThumbnailRefMixin):
    """
    Homepage/section slider for research portal.
    """

    __tablename__ = "research_sliders"

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)

    slider_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="hero",
        index=True,
    )  # hero | section | banner | announcement

    # Placement
    placement: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        server_default="homepage",
        index=True,
    )  # homepage | centers | projects | grants | publications | innovations

    # Content
    subtitle: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Link
    link_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    link_text: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    link_target: Mapped[str] = mapped_column(sa.String(16), nullable=False, server_default="_self")

    # Media
    image_alt: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Styling
    overlay_color: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    overlay_opacity: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)
    text_color: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    text_alignment: Mapped[str] = mapped_column(sa.String(16), nullable=False, server_default="center")

    # Schedule
    starts_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    ends_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<ResearchSlider {self.slug}: {self.title}>"


__all__ = [
    "ResearchNews",
    "ResearchArticle",
    "ResearchEvent",
    "ResearchSlider",
]
