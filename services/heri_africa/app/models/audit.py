from __future__ import annotations

from typing import Any

from sqlalchemy import JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base
from .content import UUIDMixin


class AuditLog(UUIDMixin, Base):
    __tablename__ = "audit_logs"
    action: Mapped[str] = mapped_column(String(80), index=True)
    entity_type: Mapped[str] = mapped_column(String(120), index=True)
    entity_id: Mapped[str] = mapped_column(String(80), index=True)
    actor_id: Mapped[str | None] = mapped_column(String(80))
    previous_value: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    new_value: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    ip_address: Mapped[str | None] = mapped_column(String(64))
    user_agent: Mapped[str | None] = mapped_column(Text)
