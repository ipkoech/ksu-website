"""Persistent models for the librarian-governed Library AI assistant."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base


class LibraryAssistantContext(Base):
    """A librarian-authored, publishable knowledge boundary for the assistant."""

    __tablename__ = "library_assistant_contexts"
    __table_args__ = (
        sa.UniqueConstraint("slug", name="uq_library_assistant_contexts_slug"),
        sa.Index(
            "ix_library_assistant_contexts_public_status_sort",
            "is_public",
            "status",
            "sort_order",
        ),
        {"schema": "library"},
    )

    library_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.libraries.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(160), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    audience: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    instructions: Mapped[str] = mapped_column(sa.Text, nullable=False, default="")
    allowed_source_types: Mapped[list[str]] = mapped_column(
        sa.JSON, nullable=False, default=list
    )
    suggested_prompts: Mapped[list[dict]] = mapped_column(
        sa.JSON, nullable=False, default=list
    )
    escalation_guidance: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    status: Mapped[str] = mapped_column(
        sa.String(16), nullable=False, default="draft", index=True
    )
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=False)
    published_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)

    sources: Mapped[list["LibraryAssistantContextSource"]] = relationship(
        "LibraryAssistantContextSource",
        back_populates="context",
        cascade="all, delete-orphan",
    )
    conversations: Mapped[list["LibraryConversation"]] = relationship(
        "LibraryConversation", back_populates="context"
    )


class LibraryAssistantContextSource(Base):
    """An explicitly approved Library record available to one context."""

    __tablename__ = "library_assistant_context_sources"
    __table_args__ = (
        sa.UniqueConstraint(
            "context_id",
            "source_type",
            "source_id",
            name="uq_library_assistant_context_sources_record",
        ),
        sa.Index(
            "ix_library_assistant_context_sources_context_approved",
            "context_id",
            "is_approved",
        ),
        {"schema": "library"},
    )

    context_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_assistant_contexts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source_type: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    source_id: Mapped[uuid.UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    public_url: Mapped[Optional[str]] = mapped_column(sa.String(1000), nullable=True)
    is_approved: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True)
    approved_by_person_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )
    sort_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)

    context: Mapped[LibraryAssistantContext] = relationship(
        "LibraryAssistantContext", back_populates="sources"
    )


class LibraryConversation(Base):
    """A verified user conversation with the Library assistant."""

    __tablename__ = "library_conversations"
    __table_args__ = (
        sa.Index(
            "ix_library_conversations_owner_status_updated",
            "verified_email",
            "status",
            "updated_at",
        ),
        {"schema": "library"},
    )

    context_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_assistant_contexts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    library_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.libraries.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    guest_session_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_guest_sessions.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
    )
    person_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True, index=True
    )
    verified_email: Mapped[str] = mapped_column(sa.String(320), nullable=False, index=True)
    title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        sa.String(24), nullable=False, default="active", index=True
    )
    assigned_to_person_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True, index=True
    )
    page_context: Mapped[Optional[dict]] = mapped_column(sa.JSON, nullable=True)
    last_message_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True, index=True
    )

    context: Mapped[Optional[LibraryAssistantContext]] = relationship(
        "LibraryAssistantContext", back_populates="conversations"
    )
    messages: Mapped[list["LibraryConversationMessage"]] = relationship(
        "LibraryConversationMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="LibraryConversationMessage.created_at",
    )
    guest_session: Mapped[Optional["LibraryGuestSession"]] = relationship(
        "LibraryGuestSession", back_populates="conversation", foreign_keys=[guest_session_id]
    )


class LibraryConversationMessage(Base):
    """One user, assistant, librarian, or system message in a conversation."""

    __tablename__ = "library_conversation_messages"
    __table_args__ = (
        sa.Index(
            "ix_library_conversation_messages_conversation_created",
            "conversation_id",
            "created_at",
        ),
        {"schema": "library"},
    )

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender_type: Mapped[str] = mapped_column(sa.String(16), nullable=False)
    content: Mapped[str] = mapped_column(sa.Text, nullable=False)
    citations: Mapped[list[dict]] = mapped_column(sa.JSON, nullable=False, default=list)
    message_metadata: Mapped[Optional[dict]] = mapped_column(
        "metadata", sa.JSON, nullable=True
    )
    sender_person_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True
    )

    conversation: Mapped[LibraryConversation] = relationship(
        "LibraryConversation", back_populates="messages"
    )


class LibraryGuestSession(Base):
    """Short-lived server-side identity for one anonymous preview answer."""

    __tablename__ = "library_guest_sessions"
    __table_args__ = (
        sa.UniqueConstraint("session_hash", name="uq_library_guest_sessions_hash"),
        sa.Index("ix_library_guest_sessions_expires", "expires_at"),
        {"schema": "library"},
    )

    session_hash: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    preview_messages: Mapped[list[dict]] = mapped_column(
        sa.JSON, nullable=False, default=list
    )
    answer_consumed_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )
    expires_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False, index=True
    )

    conversation: Mapped[Optional[LibraryConversation]] = relationship(
        "LibraryConversation",
        back_populates="guest_session",
        foreign_keys="LibraryConversation.guest_session_id",
        uselist=False,
    )


class LibraryEmailVerification(Base):
    """Single-use email verification challenge for a guest conversation."""

    __tablename__ = "library_email_verifications"
    __table_args__ = (
        sa.Index("ix_library_email_verifications_email_expiry", "email", "expires_at"),
        {"schema": "library"},
    )

    email: Mapped[str] = mapped_column(sa.String(320), nullable=False, index=True)
    guest_session_id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_guest_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    conversation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        sa.ForeignKey("library.library_conversations.id", ondelete="SET NULL"),
        nullable=True,
    )
    token_hash: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    code_hash: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False)
    attempt_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    resend_count: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0)
    last_sent_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )
