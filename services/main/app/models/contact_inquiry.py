"""School contact inquiry conversations and outbound delivery state."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base


class ContactInquiry(Base):
    __tablename__ = "contact_inquiries"

    school_id: Mapped[uuid.UUID] = mapped_column(sa.ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    reference_number: Mapped[str] = mapped_column(sa.String(32), nullable=False, unique=True, index=True)
    sender_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    sender_email: Mapped[str] = mapped_column(sa.String(320), nullable=False, index=True)
    sender_phone: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True)
    subject: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    category: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="general", index=True)
    priority: Mapped[str] = mapped_column(sa.String(24), nullable=False, server_default="normal", index=True)
    assigned_to_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="new", index=True)
    consent_to_contact: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    source: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="school_website")
    source_ip: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(sa.String(512), nullable=True)
    spam_score: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    first_response_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    last_message_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True, index=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    closed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    meta_data: Mapped[Optional[dict]] = mapped_column("metadata", JSONB, nullable=True)

    messages: Mapped[list["ContactInquiryMessage"]] = relationship(
        "ContactInquiryMessage",
        back_populates="inquiry",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="ContactInquiryMessage.created_at",
    )


class ContactInquiryMessage(Base):
    __tablename__ = "contact_inquiry_messages"

    inquiry_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("contact_inquiries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender_type: Mapped[str] = mapped_column(sa.String(24), nullable=False, index=True)
    sender_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    sender_name: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    sender_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    body: Mapped[str] = mapped_column(sa.Text, nullable=False)
    is_internal_note: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)
    delivery_status: Mapped[str] = mapped_column(sa.String(24), nullable=False, server_default="pending", index=True)
    delivery_attempts: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    idempotency_key: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    provider_message_id: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    delivery_error: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    reply_to_email: Mapped[Optional[str]] = mapped_column(sa.String(320), nullable=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)
    failed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    inquiry: Mapped[ContactInquiry] = relationship("ContactInquiry", back_populates="messages")

    __table_args__ = (
        sa.UniqueConstraint(
            "inquiry_id",
            "idempotency_key",
            name="uq_inquiry_message_idempotency",
        ),
    )


__all__ = ["ContactInquiry", "ContactInquiryMessage"]
