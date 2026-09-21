"""Service-owned execution and access context for integration commands."""

import uuid
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from ksu_common.models.base import Base


class IntegrationJob(Base):
    __tablename__ = "integration_jobs"
    __table_args__ = (
        sa.Index("ix_integration_jobs_actor_created", "actor_id", "created_at"),
        sa.UniqueConstraint("actor_id", "integration", "idempotency_digest", name="uq_integration_job_request"),
    )

    actor_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False)
    session_jti: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    idempotency_digest: Mapped[str | None] = mapped_column(sa.String(64))
    request_id: Mapped[str | None] = mapped_column(sa.String(128))
    integration: Mapped[str] = mapped_column(sa.String(32), nullable=False)
    scope_type: Mapped[str] = mapped_column(sa.String(32), nullable=False)
    scope_id: Mapped[uuid.UUID | None] = mapped_column(sa.Uuid)
    status: Mapped[str] = mapped_column(sa.String(16), nullable=False, default="PENDING", server_default="PENDING")
    attempts: Mapped[int] = mapped_column(sa.Integer, nullable=False, default=0, server_default="0")
    retryable: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, default=True, server_default=sa.true())
    retry_history: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list, server_default=sa.text("'[]'::jsonb"))
    result: Mapped[dict | None] = mapped_column(JSONB)
    error: Mapped[str | None] = mapped_column(sa.String(255))
    started_at: Mapped[datetime | None] = mapped_column(sa.DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(sa.DateTime(timezone=True))
