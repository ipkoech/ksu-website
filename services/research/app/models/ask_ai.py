"""Ask AI persistence models."""

from __future__ import annotations

import uuid
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class ResearchAIConversation(Base):
    """A read-only Ask AI conversation owned by a research admin user."""

    __tablename__ = "ai_conversations"

    user_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False, index=True)
    title: Mapped[str] = mapped_column(sa.String(255), nullable=False, server_default="Research Ask AI")
    section_key: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    resource_key: Mapped[Optional[str]] = mapped_column(sa.String(96), nullable=True, index=True)
    record_id: Mapped[Optional[str]] = mapped_column(sa.String(96), nullable=True, index=True)
    context: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    is_archived: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"), index=True)

    messages: Mapped[list["ResearchAIMessage"]] = relationship(
        "ResearchAIMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="ResearchAIMessage.created_at",
    )


class ResearchAIMessage(Base):
    """A persisted user or assistant message in an Ask AI conversation."""

    __tablename__ = "ai_messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("ai_conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(sa.String(24), nullable=False, index=True)
    content: Mapped[str] = mapped_column(sa.Text, nullable=False)
    content_format: Mapped[str] = mapped_column(sa.String(24), nullable=False, server_default="markdown")
    context_snapshot: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    references: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    message_metadata: Mapped[Optional[dict]] = mapped_column("metadata", JSONB, nullable=True)

    conversation: Mapped[ResearchAIConversation] = relationship(
        "ResearchAIConversation",
        back_populates="messages",
    )
