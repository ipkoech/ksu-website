"""Document and policy models."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

if TYPE_CHECKING:
    from .academic import Department
    from .media import Media
    from .organization import Division
    from .person import Person


class Policy(Base):
    __tablename__ = "policies"

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    code: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    category: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    content: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    division_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("divisions.id", ondelete="SET NULL"), nullable=True, index=True)
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    version: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    effective_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    review_date: Mapped[Optional[date]] = mapped_column(sa.Date, nullable=True)
    supersedes_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("policies.id", ondelete="SET NULL"), nullable=True, index=True)
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("persons.id", ondelete="SET NULL"), nullable=True, index=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    pdf_file_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft", index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    division: Mapped[Optional["Division"]] = relationship("Division")
    department: Mapped[Optional["Department"]] = relationship("Department")
    supersedes: Mapped[Optional["Policy"]] = relationship("Policy", remote_side="Policy.id")
    approved_by: Mapped[Optional["Person"]] = relationship("Person", foreign_keys=[approved_by_id])
    pdf_file: Mapped[Optional["Media"]] = relationship("Media", foreign_keys=[pdf_file_id])


class Document(Base):
    __tablename__ = "documents"

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(128), nullable=False, unique=True, index=True)
    document_type: Mapped[str] = mapped_column(sa.String(32), nullable=False, index=True)
    category: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    scope_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True, index=True)
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    file_id: Mapped[uuid.UUID] = mapped_column(sa.ForeignKey("media.id", ondelete="RESTRICT"), nullable=False, index=True)
    version: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    requires_login: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    download_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    is_active: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    file: Mapped["Media"] = relationship("Media", foreign_keys=[file_id])


__all__ = ["Policy", "Document"]
