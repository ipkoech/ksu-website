"""Structured academic and examination timetable models."""

from __future__ import annotations

import uuid
from datetime import date, datetime, time
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

from .content import UpdatedByMixin, WorkflowMetadataMixin

if TYPE_CHECKING:
    from .academic import AcademicCalendar, Campus
    from .admissions import Programme
    from .document import Document


class TimetableVenue(Base):
    __tablename__ = "timetable_venues"

    campus_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("campuses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    code: Mapped[str] = mapped_column(sa.String(64), nullable=False, unique=True, index=True)
    building: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    capacity: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.true(), index=True)

    campus: Mapped[Optional["Campus"]] = relationship("Campus")


class AcademicTimetable(Base, WorkflowMetadataMixin, UpdatedByMixin):
    __tablename__ = "academic_timetables"

    calendar_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("academic_calendars.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    timetable_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="examination", index=True)
    version: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default="1")
    notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    fallback_document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True
    )
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft", index=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.false(), index=True)
    is_published: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.false(), index=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    archived_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    supersedes_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("academic_timetables.id", ondelete="SET NULL"), nullable=True, index=True
    )

    calendar: Mapped["AcademicCalendar"] = relationship("AcademicCalendar")
    fallback_document: Mapped[Optional["Document"]] = relationship("Document")
    supersedes: Mapped[Optional["AcademicTimetable"]] = relationship(
        "AcademicTimetable", remote_side="AcademicTimetable.id", foreign_keys=[supersedes_id]
    )
    sittings: Mapped[list["TimetableSitting"]] = relationship(
        "TimetableSitting", back_populates="timetable", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (
        sa.UniqueConstraint("calendar_id", "timetable_type", "version", name="uq_academic_timetable_version"),
    )


class TimetableSitting(Base):
    __tablename__ = "timetable_sittings"

    timetable_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("academic_timetables.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_code: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    course_title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    sitting_date: Mapped[date] = mapped_column(sa.Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(sa.Time, nullable=False)
    end_time: Mapped[time] = mapped_column(sa.Time, nullable=False)
    venue_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("timetable_venues.id", ondelete="SET NULL"), nullable=True, index=True
    )
    cohort_label: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    candidate_count: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    special_instructions: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="scheduled", index=True)

    timetable: Mapped["AcademicTimetable"] = relationship("AcademicTimetable", back_populates="sittings")
    venue: Mapped[Optional["TimetableVenue"]] = relationship("TimetableVenue")
    programmes: Mapped[list["Programme"]] = relationship(
        "Programme", secondary="timetable_sitting_programmes", lazy="selectin"
    )

    __table_args__ = (
        sa.CheckConstraint("end_time > start_time", name="ck_timetable_sitting_times"),
        sa.CheckConstraint("candidate_count IS NULL OR candidate_count >= 0", name="ck_timetable_candidate_count"),
        sa.Index("ix_timetable_sittings_slot", "timetable_id", "sitting_date", "start_time", "end_time"),
    )


class TimetableSittingProgramme(Base):
    __tablename__ = "timetable_sitting_programmes"

    sitting_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("timetable_sittings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    programme_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("programmes.id", ondelete="CASCADE"), nullable=False, index=True
    )

    __table_args__ = (
        sa.UniqueConstraint("sitting_id", "programme_id", name="uq_timetable_sitting_programme"),
    )


__all__ = ["AcademicTimetable", "TimetableSitting", "TimetableSittingProgramme", "TimetableVenue"]
