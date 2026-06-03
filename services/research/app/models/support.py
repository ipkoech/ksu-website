"""Support models: resources, services, guidelines, boards."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import AttachmentRefsMixin, CoverImageRefMixin, DocumentRefMixin, LogoRefMixin, PhotoRefMixin, SEOMixin

from .base import Base


class ResearchOffice(Base, SEOMixin, CoverImageRefMixin, LogoRefMixin, AttachmentRefsMixin):
    """Research office profile linked to the main-service research department."""

    __tablename__ = "research_offices"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    director_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mandate: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mission: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    vision: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    functions: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    services_summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    leadership_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    strategic_priorities: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)

    location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    social_links: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="active", index=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    staff_members: Mapped[list["ResearchOfficeStaff"]] = relationship(
        "ResearchOfficeStaff",
        back_populates="office",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<ResearchOffice {self.slug}: {self.name}>"


class ResearchOfficeStaff(Base, PhotoRefMixin):
    """Research office staff or leadership assignment."""

    __tablename__ = "research_office_staff"

    office_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("research_offices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # References main.staff_assignments.id; no FK because this service owns the research schema.
    staff_assignment_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False, index=True)

    staff_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="staff",
        index=True,
    )  # leadership | staff | committee | liaison
    role: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    title_override: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    responsibilities: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    leadership_rank: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    start_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    office: Mapped["ResearchOffice"] = relationship("ResearchOffice", back_populates="staff_members")

    __table_args__ = (
        sa.UniqueConstraint("office_id", "staff_assignment_id", name="uq_research_office_staff_assignment"),
    )

    def __repr__(self) -> str:
        return f"<ResearchOfficeStaff office={self.office_id} role={self.role}>"


class ResearchResource(Base, SEOMixin, CoverImageRefMixin, AttachmentRefsMixin):
    """
    Research resource/tool/facility available to researchers.
    """

    __tablename__ = "research_resources"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    resource_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="equipment",
        index=True,
    )  # equipment | facility | database | software | instrument | material | service

    category: Mapped[Optional[str]] = mapped_column(
        sa.String(64),
        nullable=True,
        index=True,
    )  # laboratory | computing | library | field | imaging | analysis

    # Location/ownership
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    room: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)

    # Content
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    specifications: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    capabilities: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    usage_guidelines: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    training_required: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Access
    access_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="internal",
    )  # open | internal | restricted | booking_required
    access_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    booking_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Availability
    availability: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    operating_hours: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Fees
    is_free: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    fee_structure: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Contact
    contact_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="available",
    )  # available | in_use | maintenance | unavailable
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<ResearchResource {self.slug}: {self.name}>"


class ResearchService(Base, SEOMixin, CoverImageRefMixin, AttachmentRefsMixin):
    """
    Research support service offered by the university.
    """

    __tablename__ = "research_services"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    service_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="support",
        index=True,
    )  # support | technical | administrative | consulting | training | editing

    category: Mapped[Optional[str]] = mapped_column(
        sa.String(64),
        nullable=True,
        index=True,
    )  # grants | ethics | ip | statistics | writing | compliance | data

    # Provider
    center_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    scope: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    process: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    eligibility: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    deliverables: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    turnaround_time: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)

    # Access
    how_to_access: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    request_url: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)

    # Fees
    is_free: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    fee_structure: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Contact
    contact_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_featured: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<ResearchService {self.slug}: {self.name}>"


class ResearchGuideline(Base, SEOMixin, DocumentRefMixin):
    """
    Research policy, guideline, or procedure document.
    """

    __tablename__ = "research_guidelines"

    title: Mapped[str] = mapped_column(sa.String(500), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)

    guideline_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="guideline",
        index=True,
    )  # policy | guideline | procedure | template | form | manual | standard

    category: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        server_default="general",
        index=True,
    )  # ethics | grants | ip | data | publication | collaboration | safety | compliance

    # Content
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    content: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    scope: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    applicability: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Document
    document_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    version: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    # Approval
    approved_by: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    approval_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    effective_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    review_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    # Related
    supersedes_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("research_guidelines.id", ondelete="SET NULL"),
        nullable=True,
    )
    related_guideline_ids: Mapped[Optional[list[uuid.UUID]]] = mapped_column(JSONB, nullable=True)

    # Contact
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="active",
    )  # draft | active | under_review | superseded | archived
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_mandatory: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    def __repr__(self) -> str:
        return f"<ResearchGuideline {self.slug}: {self.title[:50]}>"


class ResearchBoard(Base, SEOMixin, DocumentRefMixin, AttachmentRefsMixin):
    """
    Research governance board or committee.
    """

    __tablename__ = "research_boards"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(32), unique=True, nullable=True, index=True)
    acronym: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)

    board_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="committee",
        index=True,
    )  # board | committee | council | panel | working_group

    # Content
    about: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mandate: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    responsibilities: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    composition: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    meeting_schedule: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Chair
    chair_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Contact
    secretary_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    contact_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    members: Mapped[list["BoardMember"]] = relationship(
        "BoardMember",
        back_populates="board",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<ResearchBoard {self.slug}: {self.name}>"


class BoardMember(Base, PhotoRefMixin):
    """Member of a research board or committee."""

    __tablename__ = "board_members"

    board_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("research_boards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Internal person (if KSU staff)
    person_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)

    # Member details
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    affiliation: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Role
    role: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="member",
    )  # chair | vice_chair | secretary | member | ex_officio

    representation: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Term
    term_start: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    term_end: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)

    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    board: Mapped["ResearchBoard"] = relationship("ResearchBoard", back_populates="members")

    __table_args__ = (
        sa.UniqueConstraint("board_id", "person_id", name="uq_board_member_person"),
    )

    def __repr__(self) -> str:
        return f"<BoardMember {self.name} ({self.role})>"


__all__ = [
    "ResearchOffice",
    "ResearchOfficeStaff",
    "ResearchResource",
    "ResearchService",
    "ResearchGuideline",
    "ResearchBoard",
    "BoardMember",
]
