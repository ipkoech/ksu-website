"""Governance models: Board for Council, Senate, Management Board."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .auth import User
    from .media import Media
    from .person import Person
    from .organization import Division


class Board(Base):
    """
    Governance board: University Council, Senate, Management Board, School Board, Department Board, Committee.

    Board hierarchy:
    - University Council: Supreme governing body (parent_entity_type=NULL)
    - Senate: Academic governance (parent_entity_type=NULL)
    - Management Board: Executive management (parent_entity_type=NULL or 'division')
    - School Board: School-level governance (parent_entity_type='school')
    - Department Board: Department-level governance (parent_entity_type='department')
    - Committee/Taskforce: Can be at any level

    Members are tracked via StaffAssignment with entity_type='board'.
    """

    __tablename__ = "boards"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    board_type: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        server_default="board",
        index=True,
    )  # council | senate | management_board | school_board | department_board | committee | taskforce

    # Polymorphic parent (which entity does this board belong to)
    parent_entity_type: Mapped[Optional[str]] = mapped_column(
        sa.String(32),
        nullable=True,
        index=True,
    )  # NULL=university-level | division | school | department
    parent_entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.Uuid,
        nullable=True,
        index=True,
    )

    # Leadership (convenience FKs - also tracked in StaffAssignment)
    chairperson_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("persons.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    vice_chairperson_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("persons.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    secretary_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("persons.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Board details
    mandate: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    establishment_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    meeting_schedule: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)  # "Monthly", "Quarterly"
    member_count: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)  # Expected number of members
    quorum: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)  # Minimum for decisions

    # Term limits for board members
    standard_term_years: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    max_terms: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    show_member_terms: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        server_default=sa.text("false"),
    )

    # Content for public display
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    head_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mission: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    vision: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Media
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Legacy FK - use parent_entity_type/id instead for new boards
    division_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("divisions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Status
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    status: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="active",
    )  # active | inactive | dissolved

    # Display
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    chairperson: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[chairperson_id])
    vice_chairperson: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[vice_chairperson_id])
    secretary: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[secretary_id])
    cover_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[cover_image_id])
    division: Mapped[Optional["Division"]] = relationship("Division", back_populates="boards")

    # Indexes for polymorphic parent
    __table_args__ = (
        sa.Index("ix_boards_parent_entity", "parent_entity_type", "parent_entity_id"),
    )

    def __repr__(self) -> str:
        return f"<Board {self.name}>"


class GovernanceRole(Base):
    """Configurable metadata for governance appointment roles."""

    __tablename__ = "governance_roles"
    __table_args__ = (
        sa.Index("ix_governance_roles_group_order", "display_group", "default_display_order"),
    )

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    category: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="member")
    display_group: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="member")
    public_label: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    default_hierarchy_level: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("2"))
    default_display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    badge_style: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    updated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    created_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[created_by_id])
    updated_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[updated_by_id])


class GovernancePageContent(Base):
    """Workflow-managed public page content for a governance board."""

    __tablename__ = "governance_page_content"
    __table_args__ = (
        sa.Index("uq_governance_page_content_board_page", "board_id", "page_key", unique=True),
    )

    board_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("boards.id", ondelete="CASCADE"), nullable=False
    )
    page_key: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="overview")
    title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    intro: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    breadcrumb_label: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    hero_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True
    )
    hero_focal_point: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    overlay_intensity: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    mandate_label: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    mandate_heading: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    mandate_body: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mandate_icon: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    document_cta_label: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    document_cta_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft")
    workflow_status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft", index=True)
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
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    updated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    board: Mapped["Board"] = relationship("Board", foreign_keys=[board_id])
    hero_image: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[hero_image_id])
    submitted_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[submitted_by_id])
    approved_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[approved_by_id])
    published_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[published_by_id])
    created_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[created_by_id])
    updated_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[updated_by_id])


__all__ = ["Board", "GovernanceRole", "GovernancePageContent"]
