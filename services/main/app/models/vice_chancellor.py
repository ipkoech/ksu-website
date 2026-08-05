"""Editorial models for the Meet the Vice Chancellor content studio."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base, SEOMixin

from .content import RichContentMixin, ScopedContentMixin

if TYPE_CHECKING:
    from .auth import User
    from .content import Event, News
    from .media import Media
    from .staff import StaffAssignment


VC_SECTIONS = (
    "story",
    "activities",
    "speeches",
    "videos",
    "events",
    "gallery",
)
VC_VIDEO_PROVIDERS = ("youtube", "uploaded")
VC_SPEECH_TYPES = (
    "speech",
    "address",
    "statement",
    "reflection",
    "interview",
)
VC_SPEECH_VIDEO_ROLES = (
    "primary",
    "full_recording",
    "excerpt",
    "related",
)


class VcHub(Base, ScopedContentMixin):
    """University-scoped editorial configuration for the VC hub."""

    __tablename__ = "vc_hubs"
    __table_args__ = (
        sa.CheckConstraint(
            "scope_type = 'university' AND scope_id IS NULL",
            name="ck_vc_hubs_university_scope",
        ),
        sa.Index(
            "uq_vc_hubs_university_active",
            "scope_type",
            unique=True,
            postgresql_where=sa.text("scope_id IS NULL AND deleted_at IS NULL"),
        ),
        sa.Index(
            "ix_vc_hubs_public_workflow",
            "is_public",
            "is_published",
            "workflow_status",
            "published_at",
        ),
    )

    staff_assignment_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("staff_assignments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    eyebrow: Mapped[str] = mapped_column(
        sa.String(128),
        nullable=False,
        default="Leadership in motion",
        server_default="Leadership in motion",
    )
    title: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
        default="Meet the Vice Chancellor",
        server_default="Meet the Vice Chancellor",
    )
    introduction: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    welcome_title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    welcome_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    hero_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    welcome_video_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("vc_videos.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    professional_profile_url: Mapped[str] = mapped_column(
        sa.String(1024),
        nullable=False,
        default="/about/vice-chancellor/profile",
        server_default="/about/vice-chancellor/profile",
    )
    section_order: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=lambda: list(VC_SECTIONS),
    )
    section_visibility: Mapped[dict[str, bool]] = mapped_column(
        JSONB,
        nullable=False,
        default=lambda: {section: True for section in VC_SECTIONS},
    )

    staff_assignment: Mapped[Optional["StaffAssignment"]] = relationship(
        "StaffAssignment",
        foreign_keys=[staff_assignment_id],
    )
    hero_media: Mapped[Optional["Media"]] = relationship(
        "Media",
        foreign_keys=[hero_media_id],
    )
    welcome_video: Mapped[Optional["VcVideo"]] = relationship(
        "VcVideo",
        foreign_keys=[welcome_video_id],
    )
    placements: Mapped[list["VcHubPlacement"]] = relationship(
        "VcHubPlacement",
        back_populates="hub",
        cascade="all, delete-orphan",
        order_by="VcHubPlacement.display_order",
    )
    portraits: Mapped[list["VcPortrait"]] = relationship(
        "VcPortrait",
        back_populates="hub",
        cascade="all, delete-orphan",
        order_by="VcPortrait.display_order",
    )


class VcPortrait(Base):
    """A reusable portrait candidate attached to the VC hub."""

    __tablename__ = "vc_portraits"
    __table_args__ = (
        sa.Index("ix_vc_portraits_hub_order", "hub_id", "display_order"),
        sa.Index(
            "uq_vc_portraits_hub_media_active",
            "hub_id",
            "media_id",
            unique=True,
            postgresql_where=sa.text("deleted_at IS NULL"),
        ),
    )

    hub_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("vc_hubs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    media_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("media.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    alt_text: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    display_order: Mapped[int] = mapped_column(
        sa.Integer, nullable=False, default=100, server_default=sa.text("100")
    )

    hub: Mapped["VcHub"] = relationship("VcHub", back_populates="portraits")
    media: Mapped["Media"] = relationship("Media", foreign_keys=[media_id])


class VcVideo(Base, ScopedContentMixin):
    """Reusable YouTube or uploaded video."""

    __tablename__ = "vc_videos"
    __table_args__ = (
        sa.CheckConstraint(
            "provider IN ('youtube', 'uploaded')",
            name="ck_vc_videos_provider",
        ),
        sa.CheckConstraint(
            "((provider = 'youtube' AND provider_video_id IS NOT NULL "
            "AND source_url IS NOT NULL AND embed_url IS NOT NULL "
            "AND uploaded_media_id IS NULL) OR "
            "(provider = 'uploaded' AND uploaded_media_id IS NOT NULL "
            "AND provider_video_id IS NULL AND embed_url IS NULL))",
            name="ck_vc_videos_provider_source",
        ),
        sa.Index(
            "uq_vc_videos_youtube_provider_id",
            "provider",
            "provider_video_id",
            unique=True,
            postgresql_where=sa.text(
                "provider = 'youtube' AND provider_video_id IS NOT NULL "
                "AND deleted_at IS NULL"
            ),
        ),
        sa.Index(
            "ix_vc_videos_public_workflow",
            "is_public",
            "is_published",
            "workflow_status",
            "published_at",
        ),
    )

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(255), nullable=False, unique=True, index=True)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    transcript: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    provider: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    source_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    provider_video_id: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    embed_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    poster_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True
    )
    uploaded_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True
    )
    duration_seconds: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    recorded_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(sa.String(96), nullable=True, index=True)
    is_featured: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        server_default=sa.text("false"),
    )

    poster_media: Mapped[Optional["Media"]] = relationship(
        "Media", foreign_keys=[poster_media_id]
    )
    uploaded_media: Mapped[Optional["Media"]] = relationship(
        "Media", foreign_keys=[uploaded_media_id]
    )
    speech_links: Mapped[list["VcSpeechVideo"]] = relationship(
        "VcSpeechVideo",
        back_populates="video",
        cascade="all, delete-orphan",
        order_by="VcSpeechVideo.display_order",
    )


class VcSpeech(Base, SEOMixin, ScopedContentMixin, RichContentMixin):
    """A formal speech, statement, reflection, address, or interview."""

    __tablename__ = "vc_speeches"
    __table_args__ = (
        sa.CheckConstraint(
            "speech_type IN ('speech', 'address', 'statement', 'reflection', 'interview')",
            name="ck_vc_speeches_type",
        ),
        sa.Index(
            "ix_vc_speeches_public_workflow",
            "is_public",
            "is_published",
            "workflow_status",
            "published_at",
        ),
    )

    speech_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        default="speech",
        server_default="speech",
    )
    delivered_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    venue: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    occasion: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    audience: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    document_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True
    )
    is_featured: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        server_default=sa.text("false"),
    )

    featured_media: Mapped[Optional["Media"]] = relationship(
        "Media", foreign_keys="VcSpeech.featured_media_id"
    )
    document_media: Mapped[Optional["Media"]] = relationship(
        "Media", foreign_keys=[document_media_id]
    )
    author: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys="VcSpeech.author_user_id"
    )
    video_links: Mapped[list["VcSpeechVideo"]] = relationship(
        "VcSpeechVideo",
        back_populates="speech",
        cascade="all, delete-orphan",
        order_by="VcSpeechVideo.display_order",
    )


class VcSpeechVideo(Base):
    """Ordered relationship between a speech and a reusable video."""

    __tablename__ = "vc_speech_videos"
    __table_args__ = (
        sa.CheckConstraint(
            "role IN ('primary', 'full_recording', 'excerpt', 'related')",
            name="ck_vc_speech_videos_role",
        ),
        sa.UniqueConstraint(
            "speech_id",
            "video_id",
            "role",
            name="uq_vc_speech_videos_speech_video_role",
        ),
        sa.Index(
            "uq_vc_speech_videos_primary",
            "speech_id",
            unique=True,
            postgresql_where=sa.text("role = 'primary' AND deleted_at IS NULL"),
        ),
        sa.Index("ix_vc_speech_videos_speech_order", "speech_id", "display_order"),
    )

    speech_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("vc_speeches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    video_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("vc_videos.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, default="related", server_default="related"
    )
    display_order: Mapped[int] = mapped_column(
        sa.Integer, nullable=False, default=100, server_default=sa.text("100")
    )

    speech: Mapped["VcSpeech"] = relationship("VcSpeech", back_populates="video_links")
    video: Mapped["VcVideo"] = relationship("VcVideo", back_populates="speech_links")


class VcGalleryAlbum(Base, SEOMixin, ScopedContentMixin):
    """Editorial album whose images are linked through MediaLink."""

    __tablename__ = "vc_gallery_albums"
    __table_args__ = (
        sa.Index(
            "ix_vc_gallery_albums_public_workflow",
            "is_public",
            "is_published",
            "workflow_status",
            "published_at",
        ),
    )

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(255), nullable=False, unique=True, index=True)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    event_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True, index=True)
    location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    cover_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True
    )
    is_featured: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        server_default=sa.text("false"),
    )

    cover_media: Mapped[Optional["Media"]] = relationship(
        "Media", foreign_keys=[cover_media_id]
    )


class VcHubPlacement(Base):
    """Editorial placement of one authoritative source into a hub section."""

    __tablename__ = "vc_hub_placements"
    __table_args__ = (
        sa.CheckConstraint(
            "section IN ('activities', 'speeches', 'videos', 'events', 'gallery')",
            name="ck_vc_hub_placements_section",
        ),
        sa.CheckConstraint(
            "num_nonnulls(news_id, event_id, speech_id, video_id, gallery_album_id) = 1",
            name="ck_vc_hub_placements_one_source",
        ),
        sa.CheckConstraint(
            "((section = 'activities' AND news_id IS NOT NULL) OR "
            "(section = 'events' AND event_id IS NOT NULL) OR "
            "(section = 'speeches' AND speech_id IS NOT NULL) OR "
            "(section = 'videos' AND video_id IS NOT NULL) OR "
            "(section = 'gallery' AND gallery_album_id IS NOT NULL))",
            name="ck_vc_hub_placements_section_source",
        ),
        sa.CheckConstraint(
            "visible_to IS NULL OR visible_from IS NULL OR visible_to >= visible_from",
            name="ck_vc_hub_placements_visible_window",
        ),
        sa.Index("ix_vc_hub_placements_hub_section_order", "hub_id", "section", "display_order"),
        sa.Index(
            "uq_vc_hub_placements_news",
            "hub_id",
            "news_id",
            unique=True,
            postgresql_where=sa.text("news_id IS NOT NULL AND deleted_at IS NULL"),
        ),
        sa.Index(
            "uq_vc_hub_placements_event",
            "hub_id",
            "event_id",
            unique=True,
            postgresql_where=sa.text("event_id IS NOT NULL AND deleted_at IS NULL"),
        ),
        sa.Index(
            "uq_vc_hub_placements_speech",
            "hub_id",
            "speech_id",
            unique=True,
            postgresql_where=sa.text("speech_id IS NOT NULL AND deleted_at IS NULL"),
        ),
        sa.Index(
            "uq_vc_hub_placements_video",
            "hub_id",
            "video_id",
            unique=True,
            postgresql_where=sa.text("video_id IS NOT NULL AND deleted_at IS NULL"),
        ),
        sa.Index(
            "uq_vc_hub_placements_gallery",
            "hub_id",
            "gallery_album_id",
            unique=True,
            postgresql_where=sa.text("gallery_album_id IS NOT NULL AND deleted_at IS NULL"),
        ),
    )

    hub_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("vc_hubs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    section: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    news_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("news.id", ondelete="SET NULL"), nullable=True, index=True
    )
    event_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("events.id", ondelete="SET NULL"), nullable=True, index=True
    )
    speech_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("vc_speeches.id", ondelete="SET NULL"), nullable=True, index=True
    )
    video_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("vc_videos.id", ondelete="SET NULL"), nullable=True, index=True
    )
    gallery_album_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("vc_gallery_albums.id", ondelete="SET NULL"), nullable=True, index=True
    )
    editorial_label: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    title_override: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    summary_override: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    poster_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True
    )
    is_featured: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, default=False, server_default=sa.text("false")
    )
    display_order: Mapped[int] = mapped_column(
        sa.Integer, nullable=False, default=100, server_default=sa.text("100")
    )
    visible_from: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    visible_to: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    is_enabled: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, default=True, server_default=sa.text("true")
    )

    hub: Mapped["VcHub"] = relationship("VcHub", back_populates="placements")
    news: Mapped[Optional["News"]] = relationship("News", foreign_keys=[news_id])
    event: Mapped[Optional["Event"]] = relationship("Event", foreign_keys=[event_id])
    speech: Mapped[Optional["VcSpeech"]] = relationship("VcSpeech", foreign_keys=[speech_id])
    video: Mapped[Optional["VcVideo"]] = relationship("VcVideo", foreign_keys=[video_id])
    gallery_album: Mapped[Optional["VcGalleryAlbum"]] = relationship(
        "VcGalleryAlbum", foreign_keys=[gallery_album_id]
    )
    poster_media: Mapped[Optional["Media"]] = relationship(
        "Media", foreign_keys=[poster_media_id]
    )


__all__ = [
    "VC_SECTIONS",
    "VC_SPEECH_TYPES",
    "VC_SPEECH_VIDEO_ROLES",
    "VC_VIDEO_PROVIDERS",
    "VcGalleryAlbum",
    "VcHub",
    "VcHubPlacement",
    "VcPortrait",
    "VcSpeech",
    "VcSpeechVideo",
    "VcVideo",
]
