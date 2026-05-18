"""Governance models: Board for Council, Senate, Management Board."""

from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
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
    division: Mapped[Optional["Division"]] = relationship("Division", back_populates="boards")

    # Indexes for polymorphic parent
    __table_args__ = (
        sa.Index("ix_boards_parent_entity", "parent_entity_type", "parent_entity_id"),
    )

    def __repr__(self) -> str:
        return f"<Board {self.name}>"


__all__ = ["Board"]
