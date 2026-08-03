from __future__ import annotations

from datetime import date

from sqlalchemy import Boolean, Date, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from .content import UUIDMixin
from .base import Base


class Partner(UUIDMixin, Base):
    __tablename__ = "partners"
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    logo_url: Mapped[str | None] = mapped_column(String(500))
    website_url: Mapped[str | None] = mapped_column(String(500))
    country: Mapped[str | None] = mapped_column(String(120))
    # Canonical Research Service references. These IDs allow the HERI projection
    # to stay aligned with the university-wide partner and centre records.
    research_partner_id: Mapped[str | None] = mapped_column(String(36), index=True)
    research_center_id: Mapped[str | None] = mapped_column(String(36), index=True)
    partner_type: Mapped[str | None] = mapped_column(String(32), index=True)
    partnership_level: Mapped[str | None] = mapped_column(String(32))
    about: Mapped[str | None] = mapped_column(Text)
    collaboration_areas: Mapped[list | dict | None] = mapped_column(JSONB)
    partnership_start: Mapped[date | None] = mapped_column(Date)
    partnership_end: Mapped[date | None] = mapped_column(Date)
    mou_signed_date: Mapped[date | None] = mapped_column(Date)
    mou_expiry_date: Mapped[date | None] = mapped_column(Date)
    relationship_status: Mapped[str] = mapped_column(String(32), default="active", index=True)
    relationship_notes: Mapped[str | None] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, default=100)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
