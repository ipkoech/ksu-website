from __future__ import annotations

from typing import Any

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base
from .content import UUIDMixin


class AnalyticsEvent(UUIDMixin, Base):
    __tablename__ = "analytics_events"
    event_name: Mapped[str] = mapped_column(String(120), index=True)
    path: Mapped[str | None] = mapped_column(String(500))
    session_id: Mapped[str | None] = mapped_column(String(120), index=True)
    properties: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
