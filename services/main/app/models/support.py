"""Support, FAQ, contacts, and ticketing models."""

from __future__ import annotations

import uuid
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

from .content import UpdatedByMixin


class FAQ(Base, UpdatedByMixin):
    __tablename__ = "faqs"

    question: Mapped[str] = mapped_column(sa.Text, nullable=False)
    answer_plain_text: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    answer_rich_text: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    answer_structured: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    scope_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True, index=True)
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    is_main: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="draft", index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    views_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    helpful_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))


class ContactDirectory(Base, UpdatedByMixin):
    __tablename__ = "contact_directory"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    contact_type: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    phone: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    extension: Mapped[Optional[str]] = mapped_column(sa.String(16), nullable=True)
    physical_address: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    building: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    room_number: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    operating_hours: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    contact_person_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("persons.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    scope_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True, index=True)
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    is_main: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="active", index=True)

    contact_person: Mapped[Optional["Person"]] = relationship("Person")


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    requester_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    requester_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    requester_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True, index=True)
    requester_phone: Mapped[Optional[str]] = mapped_column(sa.String(24), nullable=True)
    subject: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    description_plain_text: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description_rich_text: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    description_structured: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    ticket_type: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    priority: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="medium", index=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="open", index=True)
    scope_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True, index=True)
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True, index=True)
    assigned_to_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    resolution: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    resolved_at: Mapped[Optional[sa.DateTime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    meta_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    requester_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[requester_user_id])
    assigned_to_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_to_user_id])


__all__ = ["FAQ", "ContactDirectory", "SupportTicket"]
