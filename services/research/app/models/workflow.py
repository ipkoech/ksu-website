"""Service-owned provenance for canonical Research editorial commands."""

import uuid

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class ResearchWorkflowEvent(Base):
    __tablename__ = "research_workflow_events"
    __table_args__ = (sa.Index("ix_research_workflow_record_history", "resource_key", "resource_id", "created_at", "id"),)

    resource_key: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    resource_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False)
    actor_id: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    session_jti: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    previous_state: Mapped[str] = mapped_column(sa.String(16), nullable=False)
    target_state: Mapped[str] = mapped_column(sa.String(16), nullable=False)
    note: Mapped[str | None] = mapped_column(sa.String(2000), nullable=True)
