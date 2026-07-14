"""University-wide institutional profile model."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .academic import Campus
    from .about_content import AboutPageContent
    from .media import Media
    from .person import Person


class UniversityInfo(Base):
    """Single institutional profile record for the university website."""

    __tablename__ = "university_info"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    short_name: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    acronym: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)

    motto: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    overview: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    vision: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mission: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    core_values: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    founding_year: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    institution_type: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    charter_summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    history_summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    philosophy: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    strategic_plan_summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    alternate_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    postal_address: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    physical_address: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    county: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)

    social_links: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    quick_facts: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    strategic_priorities: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    logo_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    seal_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    brochure_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)

    main_campus_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("campuses.id", ondelete="SET NULL"), nullable=True, index=True)

    chancellor_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    vc_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    council_chair_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)

    chancellor_message_title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    chancellor_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    vc_message_title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    vc_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    council_chair_message_title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    council_chair_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    additional_head_messages: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)

    logo: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[logo_id])
    seal: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[seal_id])
    cover_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cover_image_id])
    brochure: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[brochure_id])
    main_campus: Mapped[Optional["Campus"]] = relationship("Campus", foreign_keys=[main_campus_id])
    chancellor: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[chancellor_id])
    vc: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[vc_id])
    about_page_content: Mapped[Optional["AboutPageContent"]] = relationship(
        "AboutPageContent", back_populates="university_info", uselist=False
    )
    council_chair: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[council_chair_id])

    __table_args__ = (
        sa.Index("ix_university_info_active_public", "is_active", "is_public"),
    )


__all__ = ["UniversityInfo"]
