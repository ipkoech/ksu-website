"""Notification, delivery, and template models."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base


class NotificationTemplate(Base):
    __tablename__ = "notification_templates"

    code: Mapped[str] = mapped_column(sa.String(64), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    title_template: Mapped[str] = mapped_column(sa.Text, nullable=False)
    subject_template: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    message_template: Mapped[str] = mapped_column(sa.Text, nullable=False)
    channels: Mapped[list[str]] = mapped_column(JSONB, nullable=False, server_default=sa.text("'[\"in_app\"]'::jsonb"))
    variables: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)

    notifications: Mapped[list["Notification"]] = relationship("Notification", back_populates="template")


class Notification(Base):
    __tablename__ = "notifications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    template_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("notification_templates.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    subject: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    message: Mapped[str] = mapped_column(sa.Text, nullable=False)
    notification_type: Mapped[str] = mapped_column(sa.String(50), nullable=False, server_default="info")
    priority: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="normal", index=True)
    action_url: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    scope_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True, index=True)
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    channels: Mapped[list[str]] = mapped_column(JSONB, nullable=False, server_default=sa.text("'[\"in_app\"]'::jsonb"))
    payload: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    is_read: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    read_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    dispatched_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    archived_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)

    user: Mapped["User"] = relationship("User", back_populates="notifications")
    template: Mapped[Optional["NotificationTemplate"]] = relationship("NotificationTemplate", back_populates="notifications")
    deliveries: Mapped[list["NotificationDelivery"]] = relationship(
        "NotificationDelivery",
        back_populates="notification",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def mark_as_read(self) -> None:
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.now(timezone.utc)

    def mark_archived(self) -> None:
        self.archived_at = datetime.now(timezone.utc)


class NotificationDelivery(Base):
    __tablename__ = "notification_deliveries"

    notification_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("notifications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    channel: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    recipient: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="pending", index=True)
    provider_message_id: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    attempts: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    scheduled_for: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    failed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    next_retry_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    dead_lettered_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    dead_letter_reason: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    extra_metadata: Mapped[Optional[dict]] = mapped_column("metadata", JSONB, nullable=True)

    notification: Mapped["Notification"] = relationship("Notification", back_populates="deliveries")


__all__ = [
    "Notification",
    "NotificationDelivery",
    "NotificationTemplate",
]
