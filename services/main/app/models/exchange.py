"""Exchange programme model."""

from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .academic import School
    from .media import Media
    from .person import Person


class ExchangeProgramme(Base):
    __tablename__ = "exchange_programmes"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    partner_institution: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    partner_country: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    partner_website: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    programme_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    duration: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    benefits: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    application_process: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("schools.id", ondelete="SET NULL"), nullable=True, index=True)
    application_deadline: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    programme_start: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    coordinator_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    brochure_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    is_accepting_applications: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)

    school: Mapped[Optional["School"]] = relationship("School")
    coordinator: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[coordinator_id])
    cover_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cover_image_id])
    brochure: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[brochure_id])


__all__ = ["ExchangeProgramme"]
