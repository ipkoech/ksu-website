"""Add durable command idempotency records.

Revision ID: 20260805_0040
Revises: 20260805_0500
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260805_0040"
down_revision = "20260805_0500"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "command_idempotency",
        sa.Column("command_name", sa.String(length=128), nullable=False),
        sa.Column("scope", sa.String(length=255), nullable=False),
        sa.Column("idempotency_key", sa.String(length=255), nullable=False),
        sa.Column("request_fingerprint", sa.String(length=64), nullable=False),
        sa.Column("state", sa.String(length=16), server_default="pending", nullable=False),
        sa.Column("status_code", sa.Integer(), nullable=True),
        sa.Column("response_body", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "state IN ('pending', 'completed', 'failed')",
            name="ck_command_idempotency_state",
        ),
        sa.CheckConstraint(
            "status_code IS NULL OR status_code BETWEEN 100 AND 599",
            name="ck_command_idempotency_status_code",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "command_name",
            "scope",
            "idempotency_key",
            name="uq_command_idempotency_scope_key",
        ),
    )
    op.create_index(
        "ix_command_idempotency_state",
        "command_idempotency",
        ["state"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_table("command_idempotency")
