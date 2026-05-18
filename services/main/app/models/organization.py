"""Organization models: Division and Wing."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .person import Person
    from .governance import Board
    from .academic import Department


class Division(Base):
    """
    Major administrative division headed by a DVC.

    Examples:
    - Division of Academic, Research & Student Affairs (ARSA)
    - Division of Administration, Planning & Finance (AP&F)

    Contains Wings, each headed by a Registrar or equivalent officer.
    """

    __tablename__ = "divisions"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), unique=True, nullable=False, index=True)
    code: Mapped[str] = mapped_column(sa.String(32), unique=True, nullable=False, index=True)  # ARSA, APF

    division_type: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        server_default="division",
    )  # division | directorate

    # Head (DVC) - convenience FK, also tracked in StaffAssignment
    head_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("persons.id", ondelete="SET NULL", use_alter=True, name="fk_division_head_id"),
        nullable=True,
        index=True,
    )

    # Content
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    head_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mission: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    vision: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    core_values: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Contact
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    office_location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    operating_hours: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # {day: {open, close}}

    # Media
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Settings
    settings: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Status
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    head: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[head_id])
    wings: Mapped[list["Wing"]] = relationship(
        "Wing",
        back_populates="division",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    boards: Mapped[list["Board"]] = relationship("Board", back_populates="division")

    def __repr__(self) -> str:
        return f"<Division {self.code}: {self.name}>"


class Wing(Base):
    """
    Wing within a Division, headed by a Registrar or equivalent officer.

    Examples under Division of AP&F:
    - Administration Wing (Registrar Admin & HR)
    - Finance Wing (Finance Officer)
    - ICT Wing

    Contains Departments.
    """

    __tablename__ = "wings"

    division_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("divisions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, index=True)
    code: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)  # ADMIN, FIN, ICT

    wing_type: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        server_default="wing",
    )  # wing | unit | office

    # Head (Registrar/Officer) - convenience FK, also tracked in StaffAssignment
    head_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("persons.id", ondelete="SET NULL", use_alter=True, name="fk_wing_head_id"),
        nullable=True,
        index=True,
    )

    # Content
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    head_message: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    mandate: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    service_charter: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)

    # Contact
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    office_location: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    operating_hours: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Media
    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Status
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    # Relationships
    division: Mapped["Division"] = relationship("Division", back_populates="wings")
    head: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[head_id])
    departments: Mapped[list["Department"]] = relationship(
        "Department",
        back_populates="wing",
        cascade="all, delete-orphan",
        lazy="selectin",
        foreign_keys="Department.wing_id",
    )

    __table_args__ = (
        sa.UniqueConstraint("division_id", "slug", name="uq_wing_division_slug"),
        sa.UniqueConstraint("division_id", "code", name="uq_wing_division_code"),
    )

    def __repr__(self) -> str:
        return f"<Wing {self.code}: {self.name}>"


__all__ = ["Division", "Wing"]
