"""Alumni models."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .admissions import Programme
    from .academic import School
    from .media import Media
    from .person import Person


class Alumni(Base):
    __tablename__ = "alumni"

    person_id: Mapped[uuid.UUID] = mapped_column(sa.ForeignKey("persons.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    graduation_year: Mapped[int] = mapped_column(sa.Integer, nullable=False, index=True)
    programme_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("programmes.id", ondelete="SET NULL"), nullable=True, index=True)
    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("schools.id", ondelete="SET NULL"), nullable=True, index=True)
    degree_classification: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    student_number: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    current_employer: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    current_position: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    industry: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    location_city: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    location_country: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    linkedin_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    achievements: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    is_mentor_available: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    mentor_areas: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    show_contact: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    is_verified: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    person: Mapped["Person"] = relationship("Person", back_populates="alumni_profile")
    programme: Mapped[Optional["Programme"]] = relationship("Programme")
    school: Mapped[Optional["School"]] = relationship("School")
    association_memberships: Mapped[list["AlumniAssociationMember"]] = relationship(
        "AlumniAssociationMember",
        back_populates="alumni",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class AlumniAssociation(Base):
    __tablename__ = "alumni_associations"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    acronym: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    association_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("schools.id", ondelete="SET NULL"), nullable=True, index=True)
    region: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mission: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    chairperson_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    secretary_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    social_media: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    logo_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    established_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    school: Mapped[Optional["School"]] = relationship("School")
    chairperson: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[chairperson_id])
    secretary: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[secretary_id])
    logo: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[logo_id])
    members: Mapped[list["AlumniAssociationMember"]] = relationship(
        "AlumniAssociationMember",
        back_populates="association",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class AlumniAssociationMember(Base):
    __tablename__ = "alumni_association_members"

    alumni_id: Mapped[uuid.UUID] = mapped_column(sa.ForeignKey("alumni.id", ondelete="CASCADE"), nullable=False, index=True)
    association_id: Mapped[uuid.UUID] = mapped_column(sa.ForeignKey("alumni_associations.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="member")
    position: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    joined_at: Mapped[date] = mapped_column(sa.Date, nullable=False)
    left_at: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)

    alumni: Mapped["Alumni"] = relationship("Alumni", back_populates="association_memberships")
    association: Mapped["AlumniAssociation"] = relationship("AlumniAssociation", back_populates="members")

    __table_args__ = (
        sa.UniqueConstraint("alumni_id", "association_id", name="uq_alumni_association_member"),
    )


__all__ = ["Alumni", "AlumniAssociation", "AlumniAssociationMember"]
