"""Durable evidence records for school-scoped review workflows."""
from __future__ import annotations

import uuid
from datetime import datetime
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from ksu_common.models.base import Base


class SchoolEvidence(Base):
    __tablename__ = "school_evidence"
    __table_args__ = (sa.Index("ix_school_evidence_school_state_expiry", "school_id", "verification_state", "expires_at"),)

    school_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False)
    document_type: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    title: Mapped[str] = mapped_column(sa.String(240), nullable=False)
    description: Mapped[str | None] = mapped_column(sa.Text)
    file_id: Mapped[uuid.UUID | None] = mapped_column(sa.Uuid)
    verification_state: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="pending")
    reviewer_id: Mapped[uuid.UUID | None] = mapped_column(sa.Uuid)
    reviewer_notes: Mapped[str | None] = mapped_column(sa.Text)
    expires_at: Mapped[datetime | None] = mapped_column(sa.DateTime(timezone=True))
    replacement_requested: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.false())
    metadata_json: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, server_default=sa.text("'{}'::jsonb"))


__all__ = ["SchoolEvidence"]
