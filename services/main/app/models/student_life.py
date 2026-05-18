"""Student life models."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .academic import Campus, Department, School
    from .media import Media
    from .person import Person


class Club(Base):
    __tablename__ = "clubs"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    club_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)

    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("schools.id", ondelete="SET NULL"), nullable=True, index=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)

    patron_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    chairperson_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    vice_chairperson_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    secretary_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    treasurer_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)

    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mission: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    social_media: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    membership_fee: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    meeting_schedule: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    registration_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    logo_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)

    membership_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    school: Mapped[Optional["School"]] = relationship("School")
    department: Mapped[Optional["Department"]] = relationship("Department")
    patron: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[patron_id])
    chairperson: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[chairperson_id])
    vice_chairperson: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[vice_chairperson_id])
    secretary: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[secretary_id])
    treasurer: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[treasurer_id])
    logo: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[logo_id])
    cover_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cover_image_id])
    activities: Mapped[list["ClubActivity"]] = relationship(
        "ClubActivity",
        back_populates="club",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class ClubActivity(Base):
    __tablename__ = "club_activities"

    club_id: Mapped[uuid.UUID] = mapped_column(sa.ForeignKey("clubs.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    activity_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    start_datetime: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, index=True)
    end_datetime: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    is_virtual: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    meeting_link: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="upcoming", index=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)

    club: Mapped["Club"] = relationship("Club", back_populates="activities")
    cover_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cover_image_id])

    __table_args__ = (
        sa.UniqueConstraint("club_id", "slug", name="uq_club_activity_slug"),
    )


class Accommodation(Base):
    __tablename__ = "accommodations"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    accommodation_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    gender: Mapped[str] = mapped_column(sa.String(16), nullable=False, index=True)
    campus_id: Mapped[uuid.UUID] = mapped_column(sa.ForeignKey("campuses.id", ondelete="CASCADE"), nullable=False, index=True)
    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    amenities: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    rules: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    total_rooms: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    capacity: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    fee_per_semester: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    fee_per_year: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    warden_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    gallery_images: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    is_accepting_applications: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)

    campus: Mapped["Campus"] = relationship("Campus")
    warden: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[warden_id])
    cover_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cover_image_id])


class SportsFacility(Base):
    __tablename__ = "sports_facilities"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    facility_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    sport_types: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    campus_id: Mapped[uuid.UUID] = mapped_column(sa.ForeignKey("campuses.id", ondelete="CASCADE"), nullable=False, index=True)
    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    operating_hours: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    gps_coordinates: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)

    campus: Mapped["Campus"] = relationship("Campus")
    manager: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[manager_id])
    cover_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cover_image_id])


class ArtsCulture(Base):
    __tablename__ = "arts_culture"

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    category: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("schools.id", ondelete="SET NULL"), nullable=True, index=True)
    club_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("clubs.id", ondelete="SET NULL"), nullable=True, index=True)
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)

    school: Mapped[Optional["School"]] = relationship("School")
    club: Mapped[Optional["Club"]] = relationship("Club")
    cover_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cover_image_id])


class StudentGovernance(Base):
    __tablename__ = "student_governance"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    acronym: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    governance_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("schools.id", ondelete="SET NULL"), nullable=True, index=True)
    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    constitution: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mandate: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    chairperson_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    vice_chairperson_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    secretary_general_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    term_start: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    term_end: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    office_location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    logo_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)

    school: Mapped[Optional["School"]] = relationship("School")
    chairperson: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[chairperson_id])
    vice_chairperson: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[vice_chairperson_id])
    secretary_general: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[secretary_general_id])
    logo: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[logo_id])


__all__ = [
    "Club",
    "ClubActivity",
    "Accommodation",
    "SportsFacility",
    "ArtsCulture",
    "StudentGovernance",
]
