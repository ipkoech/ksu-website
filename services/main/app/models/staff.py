"""StaffAssignment model - universal assignment linking persons to organizational units."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from enum import IntEnum
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .person import Person
    from .auth import User


class HierarchyLevel(IntEnum):
    """
    Hierarchy levels for organizational positions.
    Lower number = higher in hierarchy.

    Administrative Track: VC → DVCs → Registrars → Directors → Managers → Deputies → Staff → Assistants
    Academic Track: DVC Academic → Registrar Academic → Deans → CODs/Coordinators → Professors → Staff
    """

    COUNCIL_CHAIR = 1       # Council Chairperson (supreme governing authority)
    VICE_CHANCELLOR = 2     # VC + Council Members
    DEPUTY_VC = 3           # DVCs
    REGISTRAR = 4           # Registrars, Finance Officer
    DIRECTOR = 5            # Division Directors, Deans
    MANAGER = 6             # Managers, Deputy Directors
    HEAD = 7                # HODs, CODs, Deputies
    COORDINATOR = 8         # Program Coordinators
    SENIOR_STAFF = 9        # Senior Lecturers, Senior Officers
    STAFF = 10              # Lecturers, Admin Staff
    ASSISTANT = 11          # Assistant Lecturers, Tutorial Fellows, Assistants


# Academic rank hierarchy (for Person.academic_rank)
ACADEMIC_RANK_ORDER = {
    "professor": 1,
    "associate_professor": 2,
    "senior_lecturer": 3,
    "lecturer": 4,
    "assistant_lecturer": 5,
    "tutorial_fellow": 6,
    "graduate_assistant": 7,
}

# Role to hierarchy level mapping
ROLE_HIERARCHY = {
    # Level 1 - Council
    "chairperson": HierarchyLevel.COUNCIL_CHAIR,
    "council_chair": HierarchyLevel.COUNCIL_CHAIR,
    "chancellor": HierarchyLevel.COUNCIL_CHAIR,

    # Level 2 - VC & Council
    "vc": HierarchyLevel.VICE_CHANCELLOR,
    "vice_chancellor": HierarchyLevel.VICE_CHANCELLOR,
    "council_member": HierarchyLevel.VICE_CHANCELLOR,
    "member": HierarchyLevel.VICE_CHANCELLOR,
    "vice_chairperson": HierarchyLevel.VICE_CHANCELLOR,
    "ex_officio": HierarchyLevel.VICE_CHANCELLOR,

    # Level 3 - DVCs
    "dvc": HierarchyLevel.DEPUTY_VC,
    "deputy_vice_chancellor": HierarchyLevel.DEPUTY_VC,
    "dvc_arsa": HierarchyLevel.DEPUTY_VC,
    "dvc_apf": HierarchyLevel.DEPUTY_VC,

    # Level 4 - Registrars
    "registrar": HierarchyLevel.REGISTRAR,
    "registrar_academic": HierarchyLevel.REGISTRAR,
    "registrar_admin": HierarchyLevel.REGISTRAR,
    "finance_officer": HierarchyLevel.REGISTRAR,
    "board_secretary": HierarchyLevel.REGISTRAR,
    "secretary": HierarchyLevel.REGISTRAR,

    # Level 5 - Deans & Directors
    "dean": HierarchyLevel.DIRECTOR,
    "director": HierarchyLevel.DIRECTOR,
    "librarian": HierarchyLevel.DIRECTOR,
    "chief_officer": HierarchyLevel.DIRECTOR,

    # Level 6 - Managers
    "manager": HierarchyLevel.MANAGER,
    "deputy_director": HierarchyLevel.MANAGER,
    "deputy_dean": HierarchyLevel.MANAGER,
    "deputy_librarian": HierarchyLevel.MANAGER,
    "deputy_registrar": HierarchyLevel.MANAGER,

    # Level 7 - HODs & CODs
    "hod": HierarchyLevel.HEAD,
    "head": HierarchyLevel.HEAD,
    "cod": HierarchyLevel.HEAD,
    "section_head": HierarchyLevel.HEAD,
    "deputy_hod": HierarchyLevel.HEAD,

    # Level 8 - Coordinators
    "coordinator": HierarchyLevel.COORDINATOR,
    "program_coordinator": HierarchyLevel.COORDINATOR,
    "project_coordinator": HierarchyLevel.COORDINATOR,

    # Level 9 - Senior Staff
    "senior_lecturer": HierarchyLevel.SENIOR_STAFF,
    "associate_professor": HierarchyLevel.SENIOR_STAFF,
    "professor": HierarchyLevel.SENIOR_STAFF,
    "senior_officer": HierarchyLevel.SENIOR_STAFF,
    "senior_admin": HierarchyLevel.SENIOR_STAFF,
    "principal_officer": HierarchyLevel.SENIOR_STAFF,

    # Level 10 - Staff
    "lecturer": HierarchyLevel.STAFF,
    "admin": HierarchyLevel.STAFF,
    "officer": HierarchyLevel.STAFF,
    "technician": HierarchyLevel.STAFF,
    "staff": HierarchyLevel.STAFF,
    "researcher": HierarchyLevel.STAFF,
    "senior_researcher": HierarchyLevel.STAFF,
    "staff_rep": HierarchyLevel.STAFF,
    "student_rep": HierarchyLevel.STAFF,
    "convenor": HierarchyLevel.STAFF,

    # Level 11 - Assistants
    "assistant_lecturer": HierarchyLevel.ASSISTANT,
    "tutorial_fellow": HierarchyLevel.ASSISTANT,
    "graduate_assistant": HierarchyLevel.ASSISTANT,
    "assistant": HierarchyLevel.ASSISTANT,
    "admin_assistant": HierarchyLevel.ASSISTANT,
}

# Valid roles per entity type
ENTITY_ROLES = {
    "university": ["vc", "vice_chancellor", "chancellor"],
    "board": [
        "chairperson", "council_chair", "vice_chairperson", "board_secretary", "secretary",
        "member", "council_member", "ex_officio", "student_rep", "staff_rep",
    ],
    "division": ["dvc", "deputy_vice_chancellor", "dvc_arsa", "dvc_apf"],
    "wing": ["registrar", "registrar_academic", "registrar_admin", "finance_officer", "director", "deputy_registrar"],
    "school": [
        "dean", "deputy_dean", "coordinator", "program_coordinator",
        "admin", "senior_admin", "staff",
    ],
    "department": [
        "hod", "head", "cod", "deputy_hod", "section_head", "coordinator",
        "professor", "associate_professor", "senior_lecturer", "lecturer",
        "assistant_lecturer", "tutorial_fellow", "graduate_assistant",
        "admin", "technician", "officer", "assistant", "staff",
    ],
    "committee": ["chairperson", "vice_chairperson", "secretary", "member", "ex_officio", "convenor"],
    "library": ["librarian", "deputy_librarian", "senior_officer", "officer", "admin", "assistant", "staff"],
    "research": [
        "director", "deputy_director", "manager", "coordinator", "project_coordinator",
        "researcher", "senior_researcher", "admin", "officer", "staff",
    ],
    "directorate": ["director", "deputy_director", "manager", "coordinator", "officer", "admin", "staff"],
}


class StaffAssignment(Base):
    """
    Universal assignment linking a Person to any organizational unit.

    Handles ALL positions from Chancellor to Support Staff with explicit reporting chains.

    Entity types:
    - university: Top-level (VC)
    - board: Council, Senate, Management Board
    - division: Divisions headed by DVCs
    - wing: Wings headed by Registrars
    - school: Academic schools/faculties
    - department: Academic & administrative departments
    - committee: Committees, taskforces
    - library: Library system
    - research: Research centers
    """

    __tablename__ = "staff_assignments"

    # ─── Who ───
    person_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("persons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ─── What entity ───
    entity_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        index=True,
    )  # university | board | division | wing | school | department | committee | library | research
    entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.Uuid,
        nullable=True,
        index=True,
    )  # NULL for university-level positions (VC)

    # ─── Role & Hierarchy ───
    role: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        server_default="staff",
        index=True,
    )  # chairperson | vc | dvc | registrar | dean | hod | lecturer | admin | etc.
    title: Mapped[Optional[str]] = mapped_column(
        sa.String(255),
        nullable=True,
    )  # Display title: "Vice Chancellor", "Deputy Vice Chancellor (ARSA)"
    hierarchy_level: Mapped[int] = mapped_column(
        sa.Integer,
        nullable=False,
        server_default=sa.text("10"),
        index=True,
    )  # 1=Council Chair, 2=VC, 3=DVC, 4=Registrar, 5=Director, 6=Manager, 7=Head, 8=Coordinator, 9=Senior, 10=Staff, 11=Assistant

    # ─── Reporting Chain ───
    reports_to_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("staff_assignments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )  # Self-referential FK for reporting chain

    # ─── Assignment Details ───
    is_primary: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        server_default=sa.text("false"),
    )  # Primary role for this person
    is_acting: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        server_default=sa.text("false"),
    )  # Acting capacity
    is_public: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        server_default=sa.text("true"),
    )  # Show on public website

    start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)  # NULL = current
    term_years: Mapped[Optional[int]] = mapped_column(
        sa.Integer,
        nullable=True,
    )  # Standard term length in years (e.g., 4 for VC, 3 for Dean)
    term_renewable: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        server_default=sa.text("true"),
    )  # Whether the term can be renewed
    show_term_dates: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        server_default=sa.text("false"),
    )  # Display term dates on public website

    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="active",
        index=True,
    )  # active | inactive | ended | pending

    display_order: Mapped[int] = mapped_column(
        sa.Integer,
        nullable=False,
        server_default=sa.text("100"),
    )  # For sorting within same level

    # Assignment notes
    notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # ─── Relationships ───
    person: Mapped["Person"] = relationship(
        "Person",
        back_populates="assignments",
        foreign_keys=[person_id],
    )
    user: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[user_id],
    )
    reports_to: Mapped[Optional["StaffAssignment"]] = relationship(
        "StaffAssignment",
        remote_side="StaffAssignment.id",
        back_populates="subordinates",
        foreign_keys=[reports_to_id],
    )
    subordinates: Mapped[list["StaffAssignment"]] = relationship(
        "StaffAssignment",
        back_populates="reports_to",
        foreign_keys=[reports_to_id],
    )

    # ─── Indexes ───
    __table_args__ = (
        sa.Index("ix_staff_assignments_entity", "entity_type", "entity_id"),
        sa.Index("ix_staff_assignments_entity_role", "entity_type", "entity_id", "role"),
        sa.Index("ix_staff_assignments_hierarchy", "entity_type", "entity_id", "hierarchy_level"),
        sa.Index("ix_staff_assignments_active", "status", "entity_type"),
    )

    @property
    def computed_hierarchy_level(self) -> int:
        """Get hierarchy level from role if not explicitly set."""
        return ROLE_HIERARCHY.get(self.role, HierarchyLevel.STAFF)

    @property
    def is_leadership(self) -> bool:
        """Check if this is a leadership position (level 1-7)."""
        return self.hierarchy_level <= HierarchyLevel.HEAD

    @property
    def is_current(self) -> bool:
        """Check if this assignment is currently active."""
        if self.status != "active":
            return False
        today = date.today()
        if self.start_date and self.start_date > today:
            return False
        if self.end_date and self.end_date < today:
            return False
        return True

    @property
    def term_end_date(self) -> Optional[date]:
        """Calculate expected term end date based on start_date and term_years."""
        if not self.start_date or not self.term_years:
            return self.end_date
        from datetime import timedelta
        return self.start_date + timedelta(days=self.term_years * 365)

    @property
    def role_display(self) -> str:
        """Human-readable role name."""
        if self.title:
            return self.title
        role_name = self.role.replace("_", " ").title()
        if self.is_acting:
            return f"{role_name} (Acting)"
        return role_name

    @property
    def term_display(self) -> Optional[str]:
        """Human-readable term period."""
        if not self.show_term_dates:
            return None
        start = self.start_date.strftime("%b %Y") if self.start_date else "?"
        if self.end_date:
            end = self.end_date.strftime("%b %Y")
        elif self.term_end_date:
            end = self.term_end_date.strftime("%b %Y")
        else:
            end = "Present"
        return f"{start} - {end}"

    def __repr__(self) -> str:
        return f"<StaffAssignment person_id={self.person_id} entity_type={self.entity_type} role={self.role}>"


__all__ = ["StaffAssignment", "HierarchyLevel", "ROLE_HIERARCHY", "ENTITY_ROLES", "ACADEMIC_RANK_ORDER"]
