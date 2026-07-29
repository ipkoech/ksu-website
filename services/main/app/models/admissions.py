"""Admissions models."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .academic import AcademicCalendar, Department, School
    from .media import Media
    from .person import Person


INTAKE_APPLICATION_OVERRIDES = ("automatic", "force_open", "force_hidden")
INTAKE_PUBLIC_ACTION_TYPES = (
    "apply",
    "check_requirements",
    "explore_programmes",
    "download_admission_letter",
    "reporting_instructions",
    "student_portal",
    "contact_admissions",
)
INTAKE_MILESTONE_TYPES = (
    "applications_open",
    "applications_close",
    "admission_letters_release",
    "reporting",
    "orientation",
    "registration",
    "semester_opening",
)
INTAKE_WORKFLOW_STATUSES = (
    "draft",
    "in_review",
    "changes_requested",
    "approved",
    "published",
    "archived",
)
ADMISSION_APPLICANT_TYPES = (
    "kuccps",
    "self_sponsored",
    "international",
    "transfer",
    "postgraduate",
    "diploma_certificate",
)
ADMISSION_DOCUMENT_TYPES = (
    "joining_instructions",
    "medical_form",
    "fee_structure",
    "reporting_checklist",
    "brochure",
    "application_form",
    "other",
)
ADMISSION_PAGE_KEYS = (
    "admissions",
    "how-to-apply",
    "requirements",
    "intakes",
    "international",
    "fees",
    "documents",
)


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
    admission_requirements: Mapped[list["AdmissionRequirement"]] = relationship(
        "AdmissionRequirement",
        back_populates="programme",
        lazy="selectin",
    )
    fee_structures: Mapped[list["ProgrammeFeeStructure"]] = relationship(
        "ProgrammeFeeStructure",
        back_populates="programme",
        lazy="selectin",
    )
    admission_documents: Mapped[list["AdmissionDocument"]] = relationship(
        "AdmissionDocument",
        back_populates="programme",
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

    application_opens_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False)
    application_closes_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False)
    late_application_closes_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    application_override: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, server_default=INTAKE_APPLICATION_OVERRIDES[0]
    )
    override_expires_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    late_applications_enabled: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, server_default=sa.text("false")
    )
    is_featured_on_homepage: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, server_default=sa.text("false"), index=True
    )
    homepage_priority: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    timezone: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="Africa/Nairobi")

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
    public_actions: Mapped[list["IntakePublicAction"]] = relationship(
        "IntakePublicAction",
        back_populates="intake",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    milestones: Mapped[list["IntakeMilestone"]] = relationship(
        "IntakeMilestone",
        back_populates="intake",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    admission_requirements: Mapped[list["AdmissionRequirement"]] = relationship(
        "AdmissionRequirement",
        back_populates="intake",
        lazy="selectin",
    )
    fee_structures: Mapped[list["ProgrammeFeeStructure"]] = relationship(
        "ProgrammeFeeStructure",
        back_populates="intake",
        lazy="selectin",
    )
    admission_documents: Mapped[list["AdmissionDocument"]] = relationship(
        "AdmissionDocument",
        back_populates="intake",
        lazy="selectin",
    )

    __table_args__ = (
        sa.CheckConstraint(
            "application_override IN ('automatic', 'force_open', 'force_hidden')",
            name="ck_intakes_application_override",
        ),
        sa.CheckConstraint(
            "application_closes_at >= application_opens_at",
            name="ck_intakes_application_timestamp_window",
        ),
        sa.CheckConstraint(
            "late_application_closes_at IS NULL OR late_application_closes_at >= application_closes_at",
            name="ck_intakes_late_application_timestamp_window",
        ),
        sa.CheckConstraint(
            "application_override = 'automatic' OR override_expires_at IS NOT NULL",
            name="ck_intakes_manual_override_expiry",
        ),
        sa.CheckConstraint(
            "NOT is_featured_on_homepage OR is_active",
            name="ck_intakes_featured_homepage_requires_active",
        ),
        sa.Index("ix_intakes_calendar_active_open", "academic_calendar_id", "is_active", "is_open"),
        sa.Index(
            "ix_intakes_homepage_resolution",
            "is_active",
            "is_featured_on_homepage",
            "homepage_priority",
            "application_opens_at",
            "application_closes_at",
        ),
    )


class IntakePublicAction(Base):
    """Workflow-managed operational CTA attached to an intake."""

    __tablename__ = "intake_public_actions"

    intake_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("intakes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    action_type: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    label: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    target_url: Mapped[str] = mapped_column(sa.String(1024), nullable=False)
    starts_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    ends_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    is_enabled: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    priority: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    open_in_new_tab: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default=INTAKE_WORKFLOW_STATUSES[0])
    workflow_status: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, server_default=INTAKE_WORKFLOW_STATUSES[0], index=True
    )
    scheduled_publish_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    unpublished_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    revision_notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"))
    updated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"))
    submitted_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"))
    reviewed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"))
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"))
    published_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"))

    intake: Mapped["Intake"] = relationship("Intake", back_populates="public_actions")

    __table_args__ = (
        sa.CheckConstraint(
            "action_type IN ('apply', 'check_requirements', 'explore_programmes', "
            "'download_admission_letter', 'reporting_instructions', 'student_portal', "
            "'contact_admissions')",
            name="ck_intake_public_actions_action_type",
        ),
        sa.CheckConstraint(
            "status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived')",
            name="ck_intake_public_actions_status",
        ),
        sa.CheckConstraint(
            "workflow_status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived')",
            name="ck_intake_public_actions_workflow_status",
        ),
        sa.CheckConstraint("ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at", name="ck_intake_public_actions_window"),
        sa.Index(
            "uq_intake_public_actions_current_type",
            "intake_id",
            "action_type",
            unique=True,
            postgresql_where=sa.text("deleted_at IS NULL AND workflow_status != 'archived'"),
        ),
        sa.Index(
            "ix_intake_public_actions_public_window",
            "intake_id",
            "workflow_status",
            "is_enabled",
            "starts_at",
            "ends_at",
            "expires_at",
        ),
    )


class IntakeMilestone(Base):
    """Workflow-managed, cohort-specific admissions milestone."""

    __tablename__ = "intake_milestones"

    intake_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("intakes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    milestone_type: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    starts_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False)
    ends_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    instructions_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default=INTAKE_WORKFLOW_STATUSES[0])
    workflow_status: Mapped[str] = mapped_column(
        sa.String(32), nullable=False, server_default=INTAKE_WORKFLOW_STATUSES[0], index=True
    )
    scheduled_publish_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    unpublished_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    revision_notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"))
    updated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"))
    submitted_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"))
    reviewed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"))
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"))
    published_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"))

    intake: Mapped["Intake"] = relationship("Intake", back_populates="milestones")

    __table_args__ = (
        sa.CheckConstraint(
            "milestone_type IN ('applications_open', 'applications_close', "
            "'admission_letters_release', 'reporting', 'orientation', 'registration', "
            "'semester_opening')",
            name="ck_intake_milestones_milestone_type",
        ),
        sa.CheckConstraint(
            "status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived')",
            name="ck_intake_milestones_status",
        ),
        sa.CheckConstraint(
            "workflow_status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived')",
            name="ck_intake_milestones_workflow_status",
        ),
        sa.CheckConstraint("ends_at IS NULL OR ends_at >= starts_at", name="ck_intake_milestones_window"),
        sa.Index(
            "ix_intake_milestones_public_window",
            "intake_id",
            "workflow_status",
            "is_public",
            "starts_at",
            "expires_at",
        ),
        sa.Index("ix_intake_milestones_intake_order", "intake_id", "display_order"),
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


class AdmissionPathway(Base):
    """Managed applicant pathway such as KUCCPS or international applicants."""

    __tablename__ = "admission_pathways"

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    applicant_type: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    eligibility_notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    application_steps: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    required_documents: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    cta_label: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    cta_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_published: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    cover_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cover_image_id])

    __table_args__ = (
        sa.CheckConstraint(
            "applicant_type IN ('kuccps', 'self_sponsored', 'international', 'transfer', 'postgraduate', 'diploma_certificate')",
            name="ck_admission_pathways_applicant_type",
        ),
        sa.Index("ix_admission_pathways_public_order", "is_published", "display_order", "title"),
    )


class AdmissionRequirement(Base):
    """Normalized admission requirement by programme, level, pathway and intake."""

    __tablename__ = "admission_requirements"

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    applicant_type: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    level: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    minimum_grade: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    subject_requirements: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    alternative_qualifications: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    documents_required: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    effective_from: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    effective_to: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    programme_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("programmes.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("schools.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    intake_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("intakes.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    pathway_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("admission_pathways.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    programme: Mapped[Optional["Programme"]] = relationship("Programme", back_populates="admission_requirements")
    school: Mapped[Optional["School"]] = relationship("School")
    intake: Mapped[Optional["Intake"]] = relationship("Intake", back_populates="admission_requirements")
    pathway: Mapped[Optional["AdmissionPathway"]] = relationship("AdmissionPathway")

    __table_args__ = (
        sa.CheckConstraint(
            "applicant_type IN ('kuccps', 'self_sponsored', 'international', 'transfer', 'postgraduate', 'diploma_certificate')",
            name="ck_admission_requirements_applicant_type",
        ),
        sa.CheckConstraint(
            "effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from",
            name="ck_admission_requirements_effective_window",
        ),
        sa.Index("ix_admission_requirements_lookup", "programme_id", "applicant_type", "intake_id", "is_active"),
        sa.Index("ix_admission_requirements_school_level", "school_id", "level", "applicant_type", "is_active"),
    )


class ProgrammeFeeStructure(Base):
    """Programme-owned fees by intake and applicant/sponsorship category."""

    __tablename__ = "programme_fee_structures"

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    applicant_type: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    fee_category: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="tuition", index=True)
    currency: Mapped[str] = mapped_column(sa.String(8), nullable=False, server_default="KES")
    tuition_amount: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    statutory_amount: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    other_amount: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    total_amount: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    payment_schedule: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    effective_from: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    effective_to: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    programme_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("programmes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    intake_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("intakes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    attachment_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    programme: Mapped["Programme"] = relationship("Programme", back_populates="fee_structures")
    intake: Mapped[Optional["Intake"]] = relationship("Intake", back_populates="fee_structures")
    attachment_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[attachment_media_id])

    __table_args__ = (
        sa.CheckConstraint(
            "applicant_type IN ('kuccps', 'self_sponsored', 'international', 'transfer', 'postgraduate', 'diploma_certificate')",
            name="ck_programme_fee_structures_applicant_type",
        ),
        sa.CheckConstraint(
            "effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from",
            name="ck_programme_fee_structures_effective_window",
        ),
        sa.Index("ix_programme_fee_structures_lookup", "programme_id", "applicant_type", "intake_id", "is_active"),
    )


class AdmissionDocument(Base):
    """Admissions document such as joining instructions, forms or brochures."""

    __tablename__ = "admission_documents"

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    document_type: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    applicant_type: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    external_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    pathway_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("admission_pathways.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    programme_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("programmes.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    intake_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("intakes.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    is_published: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[media_id])
    pathway: Mapped[Optional["AdmissionPathway"]] = relationship("AdmissionPathway")
    programme: Mapped[Optional["Programme"]] = relationship("Programme", back_populates="admission_documents")
    intake: Mapped[Optional["Intake"]] = relationship("Intake", back_populates="admission_documents")

    __table_args__ = (
        sa.CheckConstraint(
            "document_type IN ('joining_instructions', 'medical_form', 'fee_structure', 'reporting_checklist', 'brochure', 'application_form', 'other')",
            name="ck_admission_documents_document_type",
        ),
        sa.CheckConstraint(
            "applicant_type IS NULL OR applicant_type IN ('kuccps', 'self_sponsored', 'international', 'transfer', 'postgraduate', 'diploma_certificate')",
            name="ck_admission_documents_applicant_type",
        ),
        sa.Index("ix_admission_documents_public_lookup", "is_published", "document_type", "applicant_type", "display_order"),
        sa.Index("ix_admission_documents_programme_intake", "programme_id", "intake_id", "is_published"),
    )


class AdmissionFaq(Base):
    """Admissions-scoped frequently asked question."""

    __tablename__ = "admission_faqs"

    question: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    answer: Mapped[str] = mapped_column(sa.Text, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(sa.String(96), nullable=True, index=True)
    applicant_type: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    pathway_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("admission_pathways.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_published: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    pathway: Mapped[Optional["AdmissionPathway"]] = relationship("AdmissionPathway")

    __table_args__ = (
        sa.CheckConstraint(
            "applicant_type IS NULL OR applicant_type IN ('kuccps', 'self_sponsored', 'international', 'transfer', 'postgraduate', 'diploma_certificate')",
            name="ck_admission_faqs_applicant_type",
        ),
        sa.Index("ix_admission_faqs_public_order", "is_published", "category", "display_order"),
    )


class AdmissionPageSection(Base):
    """CMS-managed section for admissions landing and admissions subpages."""

    __tablename__ = "admission_page_sections"

    page_key: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    section_key: Mapped[str] = mapped_column(sa.String(128), nullable=False, index=True)
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    subtitle: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    body: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    layout_variant: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="editorial")
    settings: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    items: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_enabled: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[media_id])

    __table_args__ = (
        sa.CheckConstraint(
            "page_key IN ('admissions', 'how-to-apply', 'requirements', 'intakes', 'international', 'fees', 'documents')",
            name="ck_admission_page_sections_page_key",
        ),
        sa.UniqueConstraint("page_key", "section_key", name="uq_admission_page_sections_page_section"),
        sa.Index("ix_admission_page_sections_render", "page_key", "is_enabled", "display_order"),
    )


__all__ = [
    "INTAKE_APPLICATION_OVERRIDES",
    "INTAKE_PUBLIC_ACTION_TYPES",
    "INTAKE_MILESTONE_TYPES",
    "INTAKE_WORKFLOW_STATUSES",
    "ADMISSION_APPLICANT_TYPES",
    "ADMISSION_DOCUMENT_TYPES",
    "ADMISSION_PAGE_KEYS",
    "Programme",
    "ProgrammeTutor",
    "Intake",
    "ProgrammeIntake",
    "AdmissionInfo",
    "IntakePublicAction",
    "IntakeMilestone",
    "AdmissionPathway",
    "AdmissionRequirement",
    "ProgrammeFeeStructure",
    "AdmissionDocument",
    "AdmissionFaq",
    "AdmissionPageSection",
]
