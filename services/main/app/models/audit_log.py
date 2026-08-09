"""Main-owned request audit persistence."""

import uuid
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ksu_common.models.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = {"schema": "main"}

    service_name: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    action: Mapped[str] = mapped_column(sa.String(128), nullable=False, index=True)
    resource_type: Mapped[str | None] = mapped_column(sa.String(64), index=True)
    resource_id: Mapped[str | None] = mapped_column(sa.String(64), index=True)
    request_method: Mapped[str] = mapped_column(sa.String(16), nullable=False, index=True)
    request_path: Mapped[str] = mapped_column(sa.String(512), nullable=False)
    route_name: Mapped[str | None] = mapped_column(sa.String(255))
    status_code: Mapped[int] = mapped_column(sa.Integer, nullable=False, index=True)
    status: Mapped[str] = mapped_column(sa.String(20), nullable=False, server_default="success", index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(sa.Uuid, index=True)
    session_jti: Mapped[str | None] = mapped_column(sa.String(64), index=True)
    ip_address: Mapped[str | None] = mapped_column(sa.String(45))
    user_agent: Mapped[str | None] = mapped_column(sa.String(512))
    error_message: Mapped[str | None] = mapped_column(sa.Text)
    details: Mapped[dict | None] = mapped_column(JSONB)
    changes: Mapped[dict | None] = mapped_column(JSONB)
    happened_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now(), index=True)


__all__ = ["AuditLog"]
