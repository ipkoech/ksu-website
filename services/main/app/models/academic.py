"""Academic structure models: Campus, School, Department, AcademicCalendar."""

from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .admissions import Intake, Programme
    from .person import Person
    from .organization import Wing


class Campus(Base):
    """
    Physical university campus/location.

    Examples: Main Campus, Nairobi Campus, Eldoret Campus
    """

    __tablename__ = "campuses"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[str] = mapped_column(sa.String(32), unique=True, nullable=False, index=True)  # MAIN, NRB, ELD

    campus_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="main",
    )  # main | satellite | regional_center | learning_center

    # Location
    address: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    county: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    postal_code: Mapped[Optional[str]] = mapped_column(sa.String(20), nullable=True)
    gps_latitude: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)
    gps_longitude: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)

    # Content
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Contact
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)

    # Media
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    schools: Mapped[list["School"]] = relationship(
        "School",
        back_populates="campus",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Campus {self.code}: {self.name}>"


class School(Base):
    """
    Faculty/College/School within the university.

    Headed by a Dean, contains Departments.
    """

    __tablename__ = "schools"

    campus_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("campuses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[str] = mapped_column(sa.String(32), unique=True, nullable=False, index=True)  # SOE, SOM, SOB

    school_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="school",
    )  # faculty | school | college | institute

    # Head (Dean) - convenience FK, also tracked in StaffAssignment
    dean_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("persons.id", ondelete="SET NULL", use_alter=True, name="fk_school_dean_id"),
        nullable=True,
        index=True,
    )

    establishment_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Content
    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    head_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mission: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    vision: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mandate: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    core_values: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Contact
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    office_location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Media
    logo_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )
    brochure_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    campus: Mapped[Optional["Campus"]] = relationship("Campus", back_populates="schools")
    dean: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[dean_id])
    departments: Mapped[list["Department"]] = relationship(
        "Department",
        back_populates="school",
        lazy="selectin",
        foreign_keys="Department.school_id",
    )

    def __repr__(self) -> str:
        return f"<School {self.code}: {self.name}>"


class Department(Base):
    """
    Department - academic (under School) or administrative (under Wing).

    Academic departments are headed by HOD/COD.
    Administrative departments are headed by Director.
    """

    __tablename__ = "departments"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, index=True)
    code: Mapped[str] = mapped_column(sa.String(32), unique=True, nullable=False, index=True)  # CS, EE, HR, FIN

    department_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="academic",
        index=True,
    )  # academic | administrative | support

    # Academic departments belong to a School
    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("schools.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Administrative departments belong to a Wing
    wing_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("wings.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Sub-departments
    parent_department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Head (HOD/Director) - convenience FK, also tracked in StaffAssignment
    head_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("persons.id", ondelete="SET NULL", use_alter=True, name="fk_department_head_id"),
        nullable=True,
        index=True,
    )

    # Postgraduate coordinator (academic departments)
    postgraduate_coordinator_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("persons.id", ondelete="SET NULL", use_alter=True, name="fk_department_pg_coordinator_id"),
        nullable=True,
        index=True,
    )

    establishment_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Content
    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    head_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mission: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    vision: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mandate: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    core_values: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    service_charter: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    guidelines: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Contact
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    office_location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Media
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Statistics (denormalized for quick display)
    student_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    postgraduate_student_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    allows_staff_management: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    school: Mapped[Optional["School"]] = relationship(
        "School",
        back_populates="departments",
        foreign_keys=[school_id],
    )
    wing: Mapped[Optional["Wing"]] = relationship(
        "Wing",
        back_populates="departments",
        foreign_keys=[wing_id],
    )
    parent_department: Mapped[Optional["Department"]] = relationship(
        "Department",
        remote_side="Department.id",
        back_populates="sub_departments",
        foreign_keys=[parent_department_id],
    )
    sub_departments: Mapped[list["Department"]] = relationship(
        "Department",
        back_populates="parent_department",
        foreign_keys=[parent_department_id],
    )
    head: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[head_id])
    postgraduate_coordinator: Mapped[Optional["Person"]] = relationship(
        "Person",
        foreign_keys=[postgraduate_coordinator_id],
    )
    staff: Mapped[list["Person"]] = relationship(
        "Person",
        back_populates="department",
        foreign_keys="Person.department_id",
    )
    services: Mapped[list["DepartmentService"]] = relationship(
        "DepartmentService",
        back_populates="department",
        cascade="all, delete-orphan",
    )
    programmes: Mapped[list["Programme"]] = relationship(
        "Programme",
        back_populates="department",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    @property
    def is_academic(self) -> bool:
        return self.department_type == "academic"

    @property
    def is_administrative(self) -> bool:
        return self.department_type == "administrative"

    def __repr__(self) -> str:
        return f"<Department {self.code}: {self.name}>"


class DepartmentService(Base):
    """Services offered by a department (especially administrative departments)."""

    __tablename__ = "department_services"

    department_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    requirements: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    process: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)  # Step-by-step guide
    turnaround_time: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)  # "3-5 working days"
    fee: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)  # "KES 500" or "Free"

    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)

    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    department: Mapped["Department"] = relationship("Department", back_populates="services")

    __table_args__ = (
        sa.UniqueConstraint("department_id", "slug", name="uq_department_service_slug"),
    )

    def __repr__(self) -> str:
        return f"<DepartmentService {self.name}>"


class AcademicCalendar(Base):
    """Term/semester scheduling data per academic year."""

    __tablename__ = "academic_calendars"

    academic_year: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)  # "2024/2025"
    semester: Mapped[int] = mapped_column(sa.Integer, nullable=False)  # 1, 2, 3

    # Dates
    start_date: Mapped[date] = mapped_column(sa.Date, nullable=False)
    end_date: Mapped[date] = mapped_column(sa.Date, nullable=False)
    registration_start: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    registration_end: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    late_registration_end: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    teaching_start: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    teaching_end: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    exam_start: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    exam_end: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    results_release: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Events & holidays
    holidays: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)  # [{name, date, description}]
    events: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)  # [{name, date, description}]

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="draft",
    )  # draft | published | archived | current

    intakes: Mapped[list["Intake"]] = relationship(
        "Intake",
        back_populates="academic_calendar",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        sa.UniqueConstraint("academic_year", "semester", name="uq_academic_calendar_year_semester"),
    )

    def __repr__(self) -> str:
        return f"<AcademicCalendar {self.academic_year} S{self.semester}>"


__all__ = ["Campus", "School", "Department", "DepartmentService", "AcademicCalendar"]
