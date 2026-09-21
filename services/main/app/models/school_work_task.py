"""Persisted follow-up tasks for the School Admin workspace."""
from __future__ import annotations

import uuid
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from ksu_common.models.base import Base


class SchoolWorkTask(Base):
    __tablename__ = "school_work_tasks"
    __table_args__ = (
        sa.Index("ix_school_work_tasks_school_status_due", "school_id", "status", "due_at"),
        sa.Index("ix_school_work_tasks_owner_status", "owner_id", "status"),
    )

    school_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False)
    title: Mapped[str] = mapped_column(sa.String(240), nullable=False)
    description: Mapped[str | None] = mapped_column(sa.Text)
    status: Mapped[str] = mapped_column(sa.String(24), nullable=False, default="open", server_default="open")
    priority: Mapped[str] = mapped_column(sa.String(16), nullable=False, default="normal", server_default="normal")
    owner_id: Mapped[uuid.UUID | None] = mapped_column(sa.Uuid)
    due_at: Mapped[datetime | None] = mapped_column(sa.DateTime(timezone=True))
    resource_type: Mapped[str | None] = mapped_column(sa.String(64))
    resource_id: Mapped[uuid.UUID | None] = mapped_column(sa.Uuid)
    evidence_ids: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list, server_default=sa.text("'[]'::jsonb"))
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict, server_default=sa.text("'{}'::jsonb"))


__all__ = ["SchoolWorkTask"]
