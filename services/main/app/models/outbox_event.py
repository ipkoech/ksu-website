"""Transactional outbox records for reliable domain-event delivery."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ksu_common.models.base import Base


class OutboxEvent(Base):
    """A domain event committed in the same transaction as its business change."""

    __tablename__ = "outbox_events"
    __table_args__ = (
        sa.CheckConstraint(
            "event_version > 0",
            name="ck_outbox_events_positive_version",
        ),
        sa.CheckConstraint(
            "delivery_status IN ('pending', 'publishing', 'published', 'failed', 'dead_letter')",
            name="ck_outbox_events_delivery_status",
        ),
        sa.Index(
            "ix_outbox_events_pending",
            "next_attempt_at",
            "occurred_at",
            postgresql_where=sa.text(
                "published_at IS NULL AND dead_lettered_at IS NULL AND deleted_at IS NULL"
            ),
        ),
        sa.Index(
            "ix_outbox_events_scope_occurred",
            "scope_type",
            "scope_id",
            "occurred_at",
        ),
        sa.Index(
            "ix_outbox_events_type_occurred",
            "event_type",
            "occurred_at",
        ),
    )

    event_type: Mapped[str] = mapped_column(
        sa.String(128),
        nullable=False,
    )
    event_version: Mapped[int] = mapped_column(
        sa.Integer,
        nullable=False,
        default=1,
        server_default=sa.text("1"),
    )
    occurred_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
    )

    scope_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
    )
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.Uuid,
        nullable=True,
    )
    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    resource_type: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
    )
    resource_id: Mapped[uuid.UUID] = mapped_column(
        sa.Uuid,
        nullable=False,
    )
    payload: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=sa.text("'{}'::jsonb"),
    )

    delivery_status: Mapped[str] = mapped_column(
        sa.String(24),
        nullable=False,
        default="pending",
        server_default="pending",
    )
    publish_attempts: Mapped[int] = mapped_column(
        sa.Integer,
        nullable=False,
        default=0,
        server_default=sa.text("0"),
    )
    next_attempt_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=True,
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=True,
    )
    last_error: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    dead_lettered_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=True,
    )


__all__ = ["OutboxEvent"]
