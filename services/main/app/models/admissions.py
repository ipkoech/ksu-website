"""Admissions models."""

from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .academic import AcademicCalendar, Department, School
    from .media import Media
    from .person import Person


class Programme(Base):
    """Academic programme offered by a department."""

    __tablename__ = "programmes"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    code: Mapped[str] = mapped_column(sa.String(32), nullable=False, unique=True, index=True)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)

    level: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    mode_of_study: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="full_time", index=True)

    duration: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    credits_required: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    department_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    career_prospects: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    curriculum_overview: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    entry_requirements: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    cluster_subjects: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    fees_structure: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    intake_months: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)

    min_students: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    max_students: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    accreditation_status: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    accrediting_body: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    brochure_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    department: Mapped["Department"] = relationship("Department", back_populates="programmes")
    cover_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cover_image_id])
    brochure: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[brochure_id])
    tutors: Mapped[list["ProgrammeTutor"]] = relationship(
        "ProgrammeTutor",
        back_populates="programme",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    intakes: Mapped[list["ProgrammeIntake"]] = relationship(
        "ProgrammeIntake",
        back_populates="programme",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        sa.Index("ix_programmes_department_active_level", "department_id", "is_active", "level"),
    )


class ProgrammeTutor(Base):
    """Lecturers or tutors attached to a programme."""

    __tablename__ = "programme_tutors"

    programme_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("programmes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    person_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("persons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    role: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="lecturer")
    is_lead: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    programme: Mapped["Programme"] = relationship("Programme", back_populates="tutors")
    person: Mapped["Person"] = relationship("Person", back_populates="programme_tutorships")

    __table_args__ = (
        sa.UniqueConstraint("programme_id", "person_id", name="uq_programme_tutor"),
    )


class Intake(Base):
    """Admission intake/cycle linked to an academic calendar."""

    __tablename__ = "intakes"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    code: Mapped[str] = mapped_column(sa.String(32), nullable=False, unique=True, index=True)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, index=True)

    academic_calendar_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("academic_calendars.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    application_start: Mapped[date] = mapped_column(sa.Date, nullable=False)
    application_end: Mapped[date] = mapped_column(sa.Date, nullable=False)
    late_application_end: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    max_students: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    is_open: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)

    academic_calendar: Mapped["AcademicCalendar"] = relationship("AcademicCalendar", back_populates="intakes")
    cover_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cover_image_id])
    programmes: Mapped[list["ProgrammeIntake"]] = relationship(
        "ProgrammeIntake",
        back_populates="intake",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        sa.Index("ix_intakes_calendar_active_open", "academic_calendar_id", "is_active", "is_open"),
    )


class ProgrammeIntake(Base):
    """Programme availability within an intake."""

    __tablename__ = "programme_intakes"

    programme_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("programmes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    intake_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("intakes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    slots_available: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    application_deadline: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)

    programme: Mapped["Programme"] = relationship("Programme", back_populates="intakes")
    intake: Mapped["Intake"] = relationship("Intake", back_populates="programmes")

    __table_args__ = (
        sa.UniqueConstraint("programme_id", "intake_id", name="uq_programme_intake"),
    )


class AdmissionInfo(Base):
    """General admission information pages."""

    __tablename__ = "admission_infos"

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    content_type: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    audience_levels: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)

    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    content: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    external_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)

    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("schools.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    attachment_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    is_published: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    school: Mapped[Optional["School"]] = relationship("School")
    cover_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cover_image_id])
    attachment_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[attachment_media_id])


__all__ = [
    "Programme",
    "ProgrammeTutor",
    "Intake",
    "ProgrammeIntake",
    "AdmissionInfo",
]
