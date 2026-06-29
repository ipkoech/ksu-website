"""Core research models: centers, farms, programs, projects, and team members."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import AttachmentRefsMixin, CoverImageRefMixin, LogoRefMixin, SEOMixin

from .base import Base

if TYPE_CHECKING:
    from .classification import ResearchTheme, FocusArea
    from .funding import Grant, Funding
    from .impact import SuccessStory, Sustainability
    from .innovation import Innovation, ResearchOutput
    from .publication import Publication
    from .partnership import Partner


class ResearchCenter(Base, SEOMixin, CoverImageRefMixin, LogoRefMixin, AttachmentRefsMixin):
    """
    Research center or institute within the university.

    Can be a thematic center, regional center, or research farm.
    Examples: Center for Biodiversity, Lake Region Economic Bloc Research Hub
    """

    __tablename__ = "research_centers"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)
    acronym: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    center_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="research_center",
        index=True,
    )  # research_center | institute | hub | laboratory | farm

    # Organizational link (optional - center may be under a school/department)
    school_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Leadership
    director_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Dates
    established_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Content
    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mission: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    vision: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mandate: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    research_areas: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Location
    location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    gps_latitude: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)
    gps_longitude: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)

    # Contact
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Social
    social_links: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    team_members: Mapped[list["CenterTeamMember"]] = relationship(
        "CenterTeamMember",
        back_populates="center",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    programs: Mapped[list["ResearchProgram"]] = relationship(
        "ResearchProgram",
        back_populates="center",
        lazy="selectin",
    )
    projects: Mapped[list["ResearchProject"]] = relationship(
        "ResearchProject",
        back_populates="center",
        lazy="selectin",
    )
    farms: Mapped[list["ResearchFarm"]] = relationship(
        "ResearchFarm",
        back_populates="center",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<ResearchCenter {self.slug}: {self.name}>"


class ResearchFarm(Base, SEOMixin, CoverImageRefMixin, AttachmentRefsMixin):
    """
    Research/demonstration farm facility.

    Can be standalone or under a ResearchCenter.
    """

    __tablename__ = "research_farms"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    # Parent center (optional)
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("research_centers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    farm_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="mixed",
    )  # crop | livestock | aquaculture | mixed | demonstration | experimental

    # Content
    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    activities: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    products: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    facilities: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Size & capacity
    size_hectares: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(10, 2), nullable=True)
    capacity_info: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Location
    location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    county: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    gps_latitude: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)
    gps_longitude: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)

    # Contact
    manager_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    center: Mapped[Optional["ResearchCenter"]] = relationship(
        "ResearchCenter",
        back_populates="farms",
    )
    projects: Mapped[list["ResearchProject"]] = relationship(
        "ResearchProject",
        back_populates="farm",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<ResearchFarm {self.slug}: {self.name}>"


class ResearchProgram(Base, SEOMixin, CoverImageRefMixin):
    """
    Research program - umbrella for related projects.

    A program is a strategic initiative that may contain multiple projects.
    Programs can be under a center or standalone.
    """

    __tablename__ = "research_programs"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    # Parent center (optional)
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("research_centers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    # Leadership
    lead_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Dates
    start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    expected_outcomes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    methodology: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Funding
    budget: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="KES")

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="active",
        index=True,
    )  # planning | active | completed | suspended | cancelled
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    center: Mapped[Optional["ResearchCenter"]] = relationship(
        "ResearchCenter",
        back_populates="programs",
    )
    projects: Mapped[list["ResearchProject"]] = relationship(
        "ResearchProject",
        back_populates="program",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<ResearchProgram {self.slug}: {self.name}>"


class ResearchProject(Base, SEOMixin, CoverImageRefMixin, AttachmentRefsMixin):
    """
    Individual research project.

    Can be standalone or under a program/center.
    """

    __tablename__ = "research_projects"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    # Parent relationships (all optional)
    program_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("research_programs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("research_centers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    farm_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("research_farms.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Principal investigator
    pi_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    project_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="applied",
        index=True,
    )  # basic | applied | action | collaborative | commissioned

    # Dates
    start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    abstract: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    background: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    methodology: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    expected_outcomes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    impact: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    deliverables: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Funding
    budget: Mapped[Optional[Decimal]] = mapped_column(sa.Numeric(15, 2), nullable=True)
    currency: Mapped[str] = mapped_column(sa.String(3), nullable=False, server_default="KES")
    grant_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="ongoing",
        index=True,
    )  # proposal | approved | ongoing | completed | suspended | cancelled
    progress_percentage: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    program: Mapped[Optional["ResearchProgram"]] = relationship(
        "ResearchProgram",
        back_populates="projects",
    )
    center: Mapped[Optional["ResearchCenter"]] = relationship(
        "ResearchCenter",
        back_populates="projects",
    )
    farm: Mapped[Optional["ResearchFarm"]] = relationship(
        "ResearchFarm",
        back_populates="projects",
    )
    team_members: Mapped[list["ProjectTeamMember"]] = relationship(
        "ProjectTeamMember",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<ResearchProject {self.slug}: {self.title[:50]}>"


class ProjectTeamMember(Base):
    """Team member assignment to a research project."""

    __tablename__ = "project_team_members"

    project_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("research_projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Person reference (from main service)
    person_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False, index=True)

    role: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        server_default="researcher",
    )  # pi | co_pi | researcher | assistant | student | consultant | advisor

    title: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    responsibilities: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Period
    joined_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    left_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    project: Mapped["ResearchProject"] = relationship(
        "ResearchProject",
        back_populates="team_members",
    )

    __table_args__ = (
        sa.UniqueConstraint("project_id", "person_id", name="uq_project_team_member"),
    )

    def __repr__(self) -> str:
        return f"<ProjectTeamMember project={self.project_id} person={self.person_id} role={self.role}>"


class CenterTeamMember(Base):
    """Team member assignment to a research center."""

    __tablename__ = "center_team_members"

    center_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("research_centers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Person reference (from main service)
    person_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False, index=True)

    role: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        server_default="researcher",
    )  # director | deputy_director | researcher | coordinator | admin | student

    title: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    responsibilities: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Period
    joined_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    left_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    center: Mapped["ResearchCenter"] = relationship(
        "ResearchCenter",
        back_populates="team_members",
    )

    __table_args__ = (
        sa.UniqueConstraint("center_id", "person_id", name="uq_center_team_member"),
    )

    def __repr__(self) -> str:
        return f"<CenterTeamMember center={self.center_id} person={self.person_id} role={self.role}>"


__all__ = [
    "ResearchCenter",
    "ResearchFarm",
    "ResearchProgram",
    "ResearchProject",
    "ProjectTeamMember",
    "CenterTeamMember",
]
