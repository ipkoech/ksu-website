"""Person model - central identity for all staff, faculty, and administrators."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .admissions import ProgrammeTutor
    from .alumni import Alumni
    from .auth import User
    from .media import Media
    from .staff import StaffAssignment
    from .academic import Department


class Person(Base):
    """
    Profile record for staff, faculty, or administrators.

    A Person can exist without a User account (e.g., listed on website but no login).
    When a User account exists, user_id links to it.
    """

    __tablename__ = "persons"

    # Link to User account (optional)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
        index=True,
    )

    # Basic info
    title: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)  # Prof., Dr., Mr., Ms.
    first_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    middle_name: Mapped[Optional[str]] = mapped_column(sa.String(100), nullable=True)
    last_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    full_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)  # Computed/denormalized

    # Contact
    email: Mapped[str] = mapped_column(sa.String(320), unique=True, nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    alternative_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    alternative_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)

    # Profile
    photo_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    bio: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    qualifications: Mapped[Optional[list[dict]]] = mapped_column(
        JSONB,
        nullable=True,
    )  # [{degree, institution, year, field}]

    # Employment
    employee_number: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)
    employment_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="full_time",
    )  # full_time | part_time | contract | visiting | adjunct
    employment_start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    employment_end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    job_group: Mapped[Optional[str]] = mapped_column(sa.String(16), nullable=True)  # Pay grade
    date_of_appointment: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    contract_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    # Primary department (for quick access - detailed assignments in StaffAssignment)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("departments.id", ondelete="SET NULL", use_alter=True, name="fk_person_department_id"),
        nullable=True,
        index=True,
    )

    # Academic/Faculty fields
    academic_rank: Mapped[Optional[str]] = mapped_column(
        sa.String(64),
        nullable=True,
    )  # tutorial_fellow | assistant_lecturer | lecturer | senior_lecturer | associate_professor | professor
    tenure_status: Mapped[Optional[str]] = mapped_column(
        sa.String(32),
        nullable=True,
    )  # tenured | tenure_track | non_tenure
    specialization: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    research_interests: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    teaching_areas: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    publications_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    publication_records: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    research_grants_won: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    h_index: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # Office
    office_location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    office_hours: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # {day: [{start, end}]}
    office_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    courses_taught: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)

    # Leadership/institutional role (for VCs, DVCs, Deans displayed on website)
    institutional_role: Mapped[Optional[str]] = mapped_column(
        sa.String(64),
        nullable=True,
        index=True,
    )  # chancellor | vc | dvc | registrar | dean | hod | director
    leadership_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Social/web presence
    website_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    linkedin_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    google_scholar_id: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    google_scholar_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    orcid: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    researchgate_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    scopus_id: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)

    full_bio: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    education_background: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    professional_memberships: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    awards_honors: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    cv_file_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Flags
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_researcher: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    show_on_directory: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="person")
    photo: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[photo_id])
    cv_file: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cv_file_id])
    department: Mapped[Optional["Department"]] = relationship(
        "Department",
        foreign_keys=[department_id],
        back_populates="staff",
    )
    assignments: Mapped[list["StaffAssignment"]] = relationship(
        "StaffAssignment",
        back_populates="person",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    programme_tutorships: Mapped[list["ProgrammeTutor"]] = relationship(
        "ProgrammeTutor",
        back_populates="person",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    alumni_profile: Mapped[Optional["Alumni"]] = relationship(
        "Alumni",
        back_populates="person",
        uselist=False,
    )

    @property
    def display_name(self) -> str:
        """Full name with title."""
        if self.title:
            return f"{self.title} {self.full_name}"
        return self.full_name

    @property
    def photo_url(self) -> Optional[str]:
        """Resolved profile photo URL for API clients."""
        if self.photo:
            return self.photo.url
        return None

    @property
    def slug(self) -> str:
        """Stable public identifier for legacy slug-shaped frontend contracts."""
        return str(self.id)

    @property
    def primary_assignment(self) -> Optional["StaffAssignment"]:
        """Get the primary staff assignment."""
        for assignment in self.assignments:
            if assignment.is_primary and assignment.status == "active":
                return assignment
        return None

    @property
    def active_assignments(self) -> list["StaffAssignment"]:
        """Get all active staff assignments."""
        return [a for a in self.assignments if a.status == "active"]

    def __repr__(self) -> str:
        return f"<Person {self.full_name}>"


__all__ = ["Person"]
