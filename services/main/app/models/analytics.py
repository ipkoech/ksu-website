"""First-party analytics event storage."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base


class AnalyticsEvent(Base):
    """Anonymous public/admin interaction event."""

    __tablename__ = "analytics_events"
    __table_args__ = (
        sa.Index("ix_analytics_events_source_type_time", "source_app", "event_type", "occurred_at"),
        sa.Index("ix_analytics_events_entity", "entity_type", "entity_id"),
        sa.Index("ix_analytics_events_path_time", "path", "occurred_at"),
    )

    event_type: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    source_app: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    path: Mapped[str] = mapped_column(sa.String(1024), nullable=False, index=True)
    referrer: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    referrer_host: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True, index=True)
    entity_type: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.UUID(), nullable=True, index=True)
    entity_slug: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True, index=True)
    entity_title: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    session_hash: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True, index=True)
    user_agent: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    device_type: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    browser: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    os: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    country_code: Mapped[Optional[str]] = mapped_column(sa.String(8), nullable=True, index=True)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    event_metadata: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, index=True)

    user = relationship("User", foreign_keys=[user_id])


__all__ = ["AnalyticsEvent"]
