"""StaffAssignment model - universal assignment linking persons to organizational units."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .media import Media
    from .governance import GovernanceRole
    from .person import Person
    from .auth import User


# Hierarchy levels for organizational positions.
# Lower number = higher in hierarchy.
#
# Administrative Track: VC → DVCs → Registrars → Directors → Managers → Deputies → Staff → Assistants
# Academic Track: DVC Academic → Registrar Academic → Deans → CODs/Coordinators → Professors → Staff
HIERARCHY_LEVEL_COUNCIL_CHAIR = 1
HIERARCHY_LEVEL_VICE_CHANCELLOR = 2
HIERARCHY_LEVEL_DEPUTY_VC = 3
HIERARCHY_LEVEL_REGISTRAR = 4
HIERARCHY_LEVEL_DIRECTOR = 5
HIERARCHY_LEVEL_MANAGER = 6
HIERARCHY_LEVEL_HEAD = 7
HIERARCHY_LEVEL_COORDINATOR = 8
HIERARCHY_LEVEL_SENIOR_STAFF = 9
HIERARCHY_LEVEL_STAFF = 10
HIERARCHY_LEVEL_ASSISTANT = 11


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
    "chairperson": HIERARCHY_LEVEL_COUNCIL_CHAIR,
    "council_chair": HIERARCHY_LEVEL_COUNCIL_CHAIR,
    "chancellor": HIERARCHY_LEVEL_COUNCIL_CHAIR,

    # Level 2 - VC & Council
    "vc": HIERARCHY_LEVEL_VICE_CHANCELLOR,
    "vice_chancellor": HIERARCHY_LEVEL_VICE_CHANCELLOR,
    "council_member": HIERARCHY_LEVEL_VICE_CHANCELLOR,
    "member": HIERARCHY_LEVEL_VICE_CHANCELLOR,
    "vice_chairperson": HIERARCHY_LEVEL_VICE_CHANCELLOR,
    "ex_officio": HIERARCHY_LEVEL_VICE_CHANCELLOR,

    # Level 3 - DVCs
    "dvc": HIERARCHY_LEVEL_DEPUTY_VC,
    "deputy_vice_chancellor": HIERARCHY_LEVEL_DEPUTY_VC,
    "dvc_arsa": HIERARCHY_LEVEL_DEPUTY_VC,
    "dvc_apf": HIERARCHY_LEVEL_DEPUTY_VC,

    # Level 4 - Registrars
    "registrar": HIERARCHY_LEVEL_REGISTRAR,
    "registrar_academic": HIERARCHY_LEVEL_REGISTRAR,
    "registrar_admin": HIERARCHY_LEVEL_REGISTRAR,
    "finance_officer": HIERARCHY_LEVEL_REGISTRAR,
    "board_secretary": HIERARCHY_LEVEL_REGISTRAR,
    "secretary": HIERARCHY_LEVEL_REGISTRAR,

    # Level 5 - Deans & Directors
    "dean": HIERARCHY_LEVEL_DIRECTOR,
    "director": HIERARCHY_LEVEL_DIRECTOR,
    "librarian": HIERARCHY_LEVEL_DIRECTOR,
    "university_librarian": HIERARCHY_LEVEL_DIRECTOR,
    "chief_librarian": HIERARCHY_LEVEL_DIRECTOR,
    "head_librarian": HIERARCHY_LEVEL_DIRECTOR,
    "chief_officer": HIERARCHY_LEVEL_DIRECTOR,

    # Level 6 - Managers
    "manager": HIERARCHY_LEVEL_MANAGER,
    "deputy_director": HIERARCHY_LEVEL_MANAGER,
    "deputy_dean": HIERARCHY_LEVEL_MANAGER,
    "deputy_librarian": HIERARCHY_LEVEL_MANAGER,
    "deputy_registrar": HIERARCHY_LEVEL_MANAGER,

    # Level 7 - HODs & CODs
    "hod": HIERARCHY_LEVEL_HEAD,
    "head": HIERARCHY_LEVEL_HEAD,
    "cod": HIERARCHY_LEVEL_HEAD,
    "section_head": HIERARCHY_LEVEL_HEAD,
    "deputy_hod": HIERARCHY_LEVEL_HEAD,

    # Level 8 - Coordinators
    "coordinator": HIERARCHY_LEVEL_COORDINATOR,
    "program_coordinator": HIERARCHY_LEVEL_COORDINATOR,
    "project_coordinator": HIERARCHY_LEVEL_COORDINATOR,
    "postgraduate_coordinator": HIERARCHY_LEVEL_COORDINATOR,
    "branch_librarian": HIERARCHY_LEVEL_COORDINATOR,
    "principal_investigator": HIERARCHY_LEVEL_COORDINATOR,
    "project_lead": HIERARCHY_LEVEL_COORDINATOR,

    # Level 9 - Senior Staff
    "senior_lecturer": HIERARCHY_LEVEL_SENIOR_STAFF,
    "associate_professor": HIERARCHY_LEVEL_SENIOR_STAFF,
    "professor": HIERARCHY_LEVEL_SENIOR_STAFF,
    "senior_officer": HIERARCHY_LEVEL_SENIOR_STAFF,
    "senior_admin": HIERARCHY_LEVEL_SENIOR_STAFF,
    "principal_officer": HIERARCHY_LEVEL_SENIOR_STAFF,

    # Level 10 - Staff
    "lecturer": HIERARCHY_LEVEL_STAFF,
    "admin": HIERARCHY_LEVEL_STAFF,
    "officer": HIERARCHY_LEVEL_STAFF,
    "technician": HIERARCHY_LEVEL_STAFF,
    "staff": HIERARCHY_LEVEL_STAFF,
    "researcher": HIERARCHY_LEVEL_STAFF,
    "senior_researcher": HIERARCHY_LEVEL_STAFF,
    "staff_rep": HIERARCHY_LEVEL_STAFF,
    "student_rep": HIERARCHY_LEVEL_STAFF,
    "convenor": HIERARCHY_LEVEL_STAFF,

    # Level 11 - Assistants
    "assistant_lecturer": HIERARCHY_LEVEL_ASSISTANT,
    "tutorial_fellow": HIERARCHY_LEVEL_ASSISTANT,
    "graduate_assistant": HIERARCHY_LEVEL_ASSISTANT,
    "assistant": HIERARCHY_LEVEL_ASSISTANT,
    "admin_assistant": HIERARCHY_LEVEL_ASSISTANT,
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
        "postgraduate_coordinator",
        "professor", "associate_professor", "senior_lecturer", "lecturer",
        "assistant_lecturer", "tutorial_fellow", "graduate_assistant",
        "admin", "technician", "officer", "assistant", "staff",
    ],
    "committee": ["chairperson", "vice_chairperson", "secretary", "member", "ex_officio", "convenor"],
    "library": [
        "university_librarian", "chief_librarian", "librarian", "deputy_librarian",
        "head_librarian", "senior_librarian", "branch_librarian", "senior_officer",
        "manager", "coordinator", "officer", "admin", "assistant", "staff",
    ],
    "research": [
        "director", "deputy_director", "manager", "coordinator", "project_coordinator",
        "principal_investigator", "project_lead", "chairperson", "researcher",
        "senior_researcher", "admin", "officer", "staff",
    ],
    "club": ["patron", "chairperson", "vice_chairperson", "secretary", "treasurer", "official", "member"],
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

    # ─── Governance Appointment ───
    governance_role_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("governance_roles.id", ondelete="SET NULL"), nullable=True
    )
    appointment_category: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    official_designation: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    public_role_label: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    represented_institution: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    current_office: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    appointing_authority: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    appointment_reference: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    term_number: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    is_ex_officio: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    is_voting_member: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    show_contact_publicly: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    portrait_media_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True
    )
    profile_slug: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    profile_summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    appointment_status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft")
    workflow_status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft")
    submitted_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    published_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    unpublished_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    archived_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    publish_without_portrait_override: Mapped[bool] = mapped_column(
        sa.Boolean, nullable=False, server_default=sa.text("false")
    )
    publication_notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

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
    governance_role: Mapped[Optional["GovernanceRole"]] = relationship(
        "GovernanceRole", foreign_keys=[governance_role_id]
    )
    portrait_media: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[portrait_media_id])
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
        sa.Index("ix_staff_assignments_governance_workflow", "entity_type", "entity_id", "workflow_status"),
        sa.Index(
            "uq_staff_assignments_governance_profile_slug",
            "profile_slug",
            unique=True,
            postgresql_where=sa.text("profile_slug IS NOT NULL AND deleted_at IS NULL"),
        ),
        sa.Index(
            "uq_staff_assignments_active_school_dean",
            "entity_type",
            "entity_id",
            "role",
            unique=True,
            postgresql_where=sa.text(
                "status = 'active' AND deleted_at IS NULL AND entity_type = 'school' AND role = 'dean'"
            ),
        ),
        sa.Index(
            "uq_staff_assignments_active_department_head_role",
            "entity_type",
            "entity_id",
            "role",
            unique=True,
            postgresql_where=sa.text(
                "status = 'active' AND deleted_at IS NULL AND entity_type = 'department' AND role IN ('hod', 'cod', 'head')"
            ),
        ),
    )

    @property
    def computed_hierarchy_level(self) -> int:
        """Get hierarchy level from role if not explicitly set."""
        return ROLE_HIERARCHY.get(self.role, HIERARCHY_LEVEL_STAFF)

    @property
    def is_leadership(self) -> bool:
        """Check if this is a leadership position (level 1-7)."""
        return self.hierarchy_level <= HIERARCHY_LEVEL_HEAD

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


__all__ = [
    "StaffAssignment",
    "ROLE_HIERARCHY",
    "ENTITY_ROLES",
    "ACADEMIC_RANK_ORDER",
    "HIERARCHY_LEVEL_HEAD",
    "HIERARCHY_LEVEL_STAFF",
]
