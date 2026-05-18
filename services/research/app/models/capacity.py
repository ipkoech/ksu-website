"""Capacity building models: training, mentorship, scholarships."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import AttachmentRefsMixin, CoverImageRefMixin, DocumentRefMixin, LogoRefMixin, SEOMixin

from .base import Base


class TrainingProgram(Base, SEOMixin, CoverImageRefMixin, DocumentRefMixin, AttachmentRefsMixin):
    """
    Research capacity building training program/workshop/course.
    """

    __tablename__ = "training_programs"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    program_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="workshop",
        index=True,
    )  # workshop | course | seminar | webinar | bootcamp | conference | retreat

    category: Mapped[Optional[str]] = mapped_column(
        sa.String(64),
        nullable=True,
        index=True,
    )  # research_methods | writing | grant_writing | data_analysis | leadership | ethics | career

    # Organizer
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    organizer_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    target_audience: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    prerequisites: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    curriculum: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    outcomes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Facilitators
    facilitators: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    # Schedule
    start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    schedule: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    duration_hours: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # Delivery
    delivery_mode: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="in_person",
    )  # in_person | online | hybrid
    venue: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    platform: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    meeting_link: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Registration
    registration_deadline: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    max_participants: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    current_registrations: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))

    # Fees
    is_free: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    fee: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(10, 2), nullable=True)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="KES")
    early_bird_fee: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(10, 2), nullable=True)
    early_bird_deadline: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    # Certification
    offers_certificate: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    cpd_points: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # Contact
    contact_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="draft",
        index=True,
    )  # draft | published | ongoing | completed | cancelled | postponed
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<TrainingProgram {self.slug}: {self.title[:50]}>"


class MentorshipProgram(Base, SEOMixin, CoverImageRefMixin, DocumentRefMixin):
    """
    Research mentorship program connecting mentors and mentees.
    """

    __tablename__ = "mentorship_programs"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    program_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="research",
    )  # research | career | academic | writing | grant_writing | leadership

    # Organizer
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    coordinator_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    benefits: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mentor_requirements: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mentee_requirements: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    expectations: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    guidelines: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Duration
    duration_months: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    commitment_hours_weekly: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # Cohort dates
    application_open: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    application_deadline: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    cohort_start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    cohort_end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Capacity
    max_mentees: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    max_mentors: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # Contact
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="active",
        index=True,
    )  # draft | accepting_applications | matching | active | completed | suspended
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    applications: Mapped[list["MentorshipApplication"]] = relationship(
        "MentorshipApplication",
        back_populates="program",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    matches: Mapped[list["MentorshipMatch"]] = relationship(
        "MentorshipMatch",
        back_populates="program",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<MentorshipProgram {self.slug}: {self.name}>"


class MentorshipApplication(Base, DocumentRefMixin, AttachmentRefsMixin):
    """Application to join a mentorship program as mentor or mentee."""

    __tablename__ = "mentorship_applications"

    program_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("mentorship_programs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    applicant_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False, index=True)

    application_type: Mapped[str] = mapped_column(
        sa.String(16),
        nullable=False,
        index=True,
    )  # mentor | mentee

    # Application content
    motivation: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    experience: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    expertise_areas: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    goals: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    availability: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    preferred_communication: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)

    # For mentees - what they're looking for
    looking_for: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Submission
    submitted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="draft",
        index=True,
    )  # draft | submitted | under_review | approved | rejected | withdrawn | matched

    review_notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    reviewed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True)

    # Relationships
    program: Mapped["MentorshipProgram"] = relationship("MentorshipProgram", back_populates="applications")

    __table_args__ = (
        sa.UniqueConstraint("program_id", "applicant_id", "application_type", name="uq_mentorship_application"),
    )

    def __repr__(self) -> str:
        return f"<MentorshipApplication {self.application_type} for program={self.program_id}>"


class MentorshipMatch(Base):
    """Mentor-mentee pairing within a mentorship program."""

    __tablename__ = "mentorship_matches"

    program_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("mentorship_programs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    mentor_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False, index=True)
    mentee_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False, index=True)

    # Match details
    match_date: Mapped[date] = mapped_column(sa.Date, nullable=False)
    start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Goals & progress
    goals: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    milestones: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    meeting_schedule: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    meeting_log: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    # Feedback
    mentor_feedback: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mentee_feedback: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    rating: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="active",
    )  # pending | active | completed | terminated | paused

    termination_reason: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Relationships
    program: Mapped["MentorshipProgram"] = relationship("MentorshipProgram", back_populates="matches")

    __table_args__ = (
        sa.UniqueConstraint("program_id", "mentor_id", "mentee_id", name="uq_mentorship_match"),
    )

    def __repr__(self) -> str:
        return f"<MentorshipMatch mentor={self.mentor_id} mentee={self.mentee_id}>"


class Scholarship(Base, SEOMixin, CoverImageRefMixin, LogoRefMixin, AttachmentRefsMixin):
    """
    Research scholarship opportunity.
    """

    __tablename__ = "scholarships"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    scholarship_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="research",
        index=True,
    )  # research | doctoral | masters | postdoc | travel | conference | publication

    # Funder
    funder_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    endowment_fund_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    requirements: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    benefits: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    obligations: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    selection_criteria: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Value
    value: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="KES")
    covers_tuition: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    covers_stipend: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    covers_travel: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    covers_research: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    # Duration
    duration_months: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    renewable: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    # Dates
    application_open: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    application_deadline: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    award_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Capacity
    number_available: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # External
    external_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    application_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Contact
    contact_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="open",
        index=True,
    )  # draft | open | closed | reviewing | awarded | cancelled
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    applications: Mapped[list["ScholarshipApplication"]] = relationship(
        "ScholarshipApplication",
        back_populates="scholarship",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Scholarship {self.slug}: {self.name}>"


class ScholarshipApplication(Base, DocumentRefMixin, AttachmentRefsMixin):
    """Application for a scholarship."""

    __tablename__ = "scholarship_applications"

    scholarship_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("scholarships.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    applicant_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False, index=True)

    application_number: Mapped[Optional[str]] = mapped_column(
        sa.String(64),
        unique=True,
        nullable=True,
        index=True,
    )

    # Application content
    research_proposal: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    personal_statement: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    research_experience: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    career_goals: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    budget_justification: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # References
    references: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    # Submission
    submitted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="draft",
        index=True,
    )  # draft | submitted | under_review | shortlisted | awarded | rejected | withdrawn

    # Review
    review_score: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    review_comments: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    decision_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Award details (if awarded)
    awarded_amount: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    award_start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    award_end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Relationships
    scholarship: Mapped["Scholarship"] = relationship("Scholarship", back_populates="applications")

    __table_args__ = (
        sa.UniqueConstraint("scholarship_id", "applicant_id", name="uq_scholarship_application"),
    )

    def __repr__(self) -> str:
        return f"<ScholarshipApplication {self.application_number}>"


__all__ = [
    "TrainingProgram",
    "MentorshipProgram",
    "MentorshipApplication",
    "MentorshipMatch",
    "Scholarship",
    "ScholarshipApplication",
]
