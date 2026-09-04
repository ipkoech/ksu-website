from __future__ import annotations

from sqlalchemy import Boolean, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base
from .content import UUIDMixin


class ChairProfile(UUIDMixin, Base):
    """Structured public identity for the HERI Africa research chair."""

    __tablename__ = "chair_profiles"

    name: Mapped[str] = mapped_column(String(255))
    acronym: Mapped[str | None] = mapped_column(String(80))
    host_institution: Mapped[str] = mapped_column(String(255), default="Kisii University")
    initiative_name: Mapped[str] = mapped_column(String(255), default="HERI Africa")
    about: Mapped[str] = mapped_column(Text, default="")
    tagline: Mapped[str | None] = mapped_column(String(255))
    vision: Mapped[str] = mapped_column(Text, default="")
    mission: Mapped[str] = mapped_column(Text, default="")
    mandate: Mapped[str] = mapped_column(Text, default="")
    objectives: Mapped[str] = mapped_column(Text, default="")
    values: Mapped[list | dict | None] = mapped_column(JSONB)
    why_it_matters: Mapped[str] = mapped_column(Text, default="")
    logo_url: Mapped[str | None] = mapped_column(String(500))
    cover_image_url: Mapped[str | None] = mapped_column(String(500))
    seo: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

