"""Research-owned durable command idempotency records."""

from __future__ import annotations

from typing import Any

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class CommandIdempotency(Base):
    """A command reservation and immutable terminal response."""

    __tablename__ = "command_idempotency"
    __table_args__ = (
        sa.UniqueConstraint(
            "command_name",
            "scope",
            "idempotency_key",
            name="uq_research_command_idempotency_scope_key",
        ),
        sa.CheckConstraint(
            "state IN ('pending', 'completed', 'failed')",
            name="ck_research_command_idempotency_state",
        ),
        sa.CheckConstraint(
            "status_code IS NULL OR status_code BETWEEN 100 AND 599",
            name="ck_research_command_idempotency_status_code",
        ),
        sa.CheckConstraint(
            "(state = 'pending' AND status_code IS NULL AND response_body IS NULL) "
            "OR (state IN ('completed', 'failed') AND status_code BETWEEN 100 AND 599 "
            "AND response_body IS NOT NULL)",
            name="ck_research_command_idempotency_response_shape",
        ),
        sa.Index("ix_research_command_idempotency_state", "state"),
    )

    command_name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    scope: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    idempotency_key: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    request_fingerprint: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    state: Mapped[str] = mapped_column(
        sa.String(16), nullable=False, default="pending", server_default="pending"
    )
    status_code: Mapped[int | None] = mapped_column(sa.Integer, nullable=True)
    response_body: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)


__all__ = ["CommandIdempotency"]
