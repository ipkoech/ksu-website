from __future__ import annotations

from typing import Any

import sqlalchemy as sa
from sqlalchemy import Enum, JSON, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base
from .content import SubmissionStatus, UUIDMixin


class Submission(UUIDMixin, Base):
    __tablename__ = "submissions"
    kind: Mapped[str] = mapped_column(String(60), index=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(320), index=True)
    organisation: Mapped[str | None] = mapped_column(String(255))
    country: Mapped[str | None] = mapped_column(String(120))
    message: Mapped[str] = mapped_column(Text, default="")
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    status: Mapped[SubmissionStatus] = mapped_column(Enum(SubmissionStatus), default=SubmissionStatus.NEW, index=True)
    internal_notes: Mapped[str | None] = mapped_column(Text)


class CommandIdempotency(UUIDMixin, Base):
    __tablename__ = "command_idempotency"
    __table_args__ = (
        sa.UniqueConstraint(
            "command_name",
            "scope",
            "idempotency_key",
            name="uq_heri_command_idempotency_scope_key",
        ),
        sa.CheckConstraint(
            "state IN ('pending', 'completed', 'failed')",
            name="ck_heri_command_idempotency_state",
        ),
        sa.CheckConstraint(
            "status_code IS NULL OR status_code BETWEEN 100 AND 599",
            name="ck_heri_command_idempotency_status_code",
        ),
        sa.CheckConstraint(
            "(state = 'pending' AND status_code IS NULL AND response_body IS NULL) "
            "OR (state IN ('completed', 'failed') AND status_code BETWEEN 100 AND 599 AND response_body IS NOT NULL)",
            name="ck_heri_command_idempotency_response_shape",
        ),
        sa.Index("ix_heri_command_idempotency_state", "state"),
    )

    command_name: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    scope: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    idempotency_key: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    request_fingerprint: Mapped[str] = mapped_column(sa.String(64), nullable=False)
    state: Mapped[str] = mapped_column(sa.String(16), nullable=False, default="pending", server_default="pending")
    status_code: Mapped[int | None] = mapped_column(sa.Integer, nullable=True)
    response_body: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
