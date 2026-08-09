"""Durable command idempotency records."""

from __future__ import annotations

from typing import Any

import sqlalchemy as sa
from ksu_common.models.base import Base
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

COMMAND_IDEMPOTENCY_STATES = ("pending", "completed", "failed")


class CommandIdempotency(Base):
    """A client command and the terminal response that may be replayed."""

    __tablename__ = "command_idempotency"
    __table_args__ = (
        sa.UniqueConstraint("command_name", "scope", "idempotency_key", name="uq_command_idempotency_scope_key"),
        sa.CheckConstraint("state IN ('pending', 'completed', 'failed')", name="ck_command_idempotency_state"),
        sa.CheckConstraint("status_code IS NULL OR status_code BETWEEN 100 AND 599", name="ck_command_idempotency_status_code"),
        sa.CheckConstraint(
            "(state = 'pending' AND status_code IS NULL AND response_body IS NULL) "
            "OR (state IN ('completed', 'failed') AND status_code BETWEEN 100 AND 599 AND response_body IS NOT NULL)",
            name="ck_command_idempotency_response_shape",
        ),
        sa.Index("ix_command_idempotency_state", "state"),
        sa.Index("ix_command_idempotency_state_updated", "state", "updated_at"),
    )

    command_name: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    scope: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    idempotency_key: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    request_fingerprint: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    state: Mapped[str] = mapped_column(sa.String(16), nullable=False, default="pending", server_default="pending")
    status_code: Mapped[int | None] = mapped_column(sa.Integer, nullable=True)
    response_body: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)


__all__ = ["COMMAND_IDEMPOTENCY_STATES", "CommandIdempotency"]
