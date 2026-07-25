"""Marketing models."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .admissions import Programme
    from .academic import Department, School
    from .auth import User
    from .media import Media
    from .person import Person


class Newsletter(Base):
    __tablename__ = "newsletters"

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    edition: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    content: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    scheduled_send_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    send_status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft", index=True)
    send_error: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    pdf_file_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    view_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft", index=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)

    cover_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cover_image_id])
    pdf_file: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[pdf_file_id])


class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"

    email: Mapped[str] = mapped_column(sa.String(320), nullable=False, unique=True, index=True)
    name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    subscribed_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now())
    unsubscribed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    frequency: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="all")
    categories: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    is_verified: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    verification_token: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True, index=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="active", index=True)


class Testimonial(Base):
    __tablename__ = "testimonials"

    person_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    role: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    quote: Mapped[str] = mapped_column(sa.Text, nullable=False)
    full_story: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    testimonial_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("schools.id", ondelete="SET NULL"), nullable=True, index=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    programme_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("programmes.id", ondelete="SET NULL"), nullable=True, index=True)
    photo_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    video_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    is_approved: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)

    person: Mapped[Optional["Person"]] = relationship("Person")
    school: Mapped[Optional["School"]] = relationship("School")
    department: Mapped[Optional["Department"]] = relationship("Department")
    programme: Mapped[Optional["Programme"]] = relationship("Programme")
    photo: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[photo_id])


class SocialMediaPost(Base):
    __tablename__ = "social_media_posts"

    source_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    source_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    content: Mapped[str] = mapped_column(sa.Text, nullable=False)
    media_ids: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    platforms: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    posted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    platform_post_ids: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft", index=True)
    error_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    validation_summary: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_by_id: Mapped[uuid.UUID] = mapped_column(sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    created_by: Mapped["User"] = relationship("User")
    deliveries: Mapped[list["SocialMediaDelivery"]] = relationship(
        "SocialMediaDelivery",
        back_populates="social_post",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class SocialPlatformAccount(Base):
    __tablename__ = "social_platform_accounts"

    provider: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    account_ref: Mapped[str] = mapped_column(sa.String(255), nullable=False, index=True)
    credentials: Mapped[dict] = mapped_column(JSONB, nullable=False)
    settings: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    last_validated_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    last_used_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    last_error: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    created_by_id: Mapped[uuid.UUID] = mapped_column(sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    created_by: Mapped["User"] = relationship("User")
    deliveries: Mapped[list["SocialMediaDelivery"]] = relationship(
        "SocialMediaDelivery",
        back_populates="account",
        lazy="selectin",
    )

    __table_args__ = (
        sa.UniqueConstraint("provider", "account_ref", name="uq_social_platform_account_provider_ref"),
    )


class SocialMediaDelivery(Base):
    __tablename__ = "social_media_deliveries"

    social_post_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("social_media_posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    platform: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    account_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("social_platform_accounts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft", index=True)
    provider_post_id: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    attempts: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    last_attempted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    posted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    validation_errors: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    request_payload: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    response_payload: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    social_post: Mapped["SocialMediaPost"] = relationship("SocialMediaPost", back_populates="deliveries")
    account: Mapped[Optional["SocialPlatformAccount"]] = relationship("SocialPlatformAccount", back_populates="deliveries")

    __table_args__ = (
        sa.UniqueConstraint("social_post_id", "platform", name="uq_social_media_delivery_post_platform"),
    )


__all__ = [
    "Newsletter",
    "NewsletterSubscriber",
    "Testimonial",
    "SocialMediaPost",
    "SocialPlatformAccount",
    "SocialMediaDelivery",
]
