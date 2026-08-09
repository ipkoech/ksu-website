"""System and integration platform models."""

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
    from .outbox_event import OutboxEvent


class Setting(Base):
    """System configuration key/value store."""

    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    value: Mapped[dict | list | str | int | float | bool | None] = mapped_column(JSONB, nullable=False)
    value_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    category: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    updated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    updated_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[updated_by_id])


class UserPreference(Base):
    """Per-user preference or onboarding state."""

    __tablename__ = "user_preferences"
    __table_args__ = (
        sa.UniqueConstraint("user_id", "namespace", "key", name="uq_user_preferences_user_namespace_key"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    namespace: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    key: Mapped[str] = mapped_column(sa.String(128), nullable=False, index=True)
    value: Mapped[dict | list | str | int | float | bool | None] = mapped_column(JSONB, nullable=False)

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])


class ApiKey(Base):
    """API keys for external integrations."""

    __tablename__ = "api_keys"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    key_hash: Mapped[str] = mapped_column(sa.String(64), nullable=False, unique=True, index=True)
    scopes: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    rate_limit: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("1000"))
    expires_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    last_used_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_id])


class Webhook(Base):
    """Webhooks for external event notifications."""

    __tablename__ = "webhooks"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    url: Mapped[str] = mapped_column(sa.String(1024), nullable=False)
    secret: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    events: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    last_triggered_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    last_status: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    failure_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_id])
    deliveries: Mapped[list["WebhookDelivery"]] = relationship(
        "WebhookDelivery", back_populates="webhook", cascade="all, delete-orphan"
    )


class WebhookDelivery(Base):
    """Immutable outcome of one bounded webhook delivery attempt."""

    __tablename__ = "webhook_deliveries"
    __table_args__ = (
        sa.UniqueConstraint(
            "webhook_id", "event_id", "attempt_number",
            name="uq_webhook_deliveries_webhook_event_attempt",
        ),
        sa.CheckConstraint("attempt_number > 0", name="ck_webhook_deliveries_positive_attempt"),
        sa.CheckConstraint(
            "status IN ('delivered', 'retrying', 'dead_letter')",
            name="ck_webhook_deliveries_status",
        ),
        sa.Index("ix_webhook_deliveries_webhook_attempted", "webhook_id", "attempted_at"),
        sa.Index("ix_webhook_deliveries_event", "event_id", "attempt_number"),
    )

    webhook_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("webhooks.id", ondelete="CASCADE"), nullable=False
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("outbox_events.id", ondelete="CASCADE"), nullable=False
    )
    attempt_number: Mapped[int] = mapped_column(sa.Integer, nullable=False)
    status: Mapped[str] = mapped_column(sa.String(24), nullable=False)
    status_code: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    duration_ms: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)
    error: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    attempted_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
    )
    next_attempt_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True))

    webhook: Mapped["Webhook"] = relationship("Webhook", back_populates="deliveries")
    event: Mapped["OutboxEvent"] = relationship("OutboxEvent")


__all__ = ["Setting", "UserPreference", "ApiKey", "Webhook", "WebhookDelivery"]
