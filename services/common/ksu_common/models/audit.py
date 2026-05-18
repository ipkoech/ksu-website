"""Shared audit log model used by all services."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class AuditLog(Base):
    """Persisted audit event for request/activity tracking."""

    __tablename__ = "audit_logs"

    service_name: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    action: Mapped[str] = mapped_column(sa.String(128), nullable=False, index=True)
    resource_type: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    resource_id: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    request_method: Mapped[str] = mapped_column(sa.String(16), nullable=False, index=True)
    request_path: Mapped[str] = mapped_column(sa.String(512), nullable=False)
    route_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    status_code: Mapped[int] = mapped_column(sa.Integer, nullable=False, index=True)
    status: Mapped[str] = mapped_column(sa.String(20), nullable=False, server_default="success", index=True)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    session_jti: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    ip_address: Mapped[Optional[str]] = mapped_column(sa.String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    details: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    changes: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    happened_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        index=True,
    )


__all__ = ["AuditLog"]
