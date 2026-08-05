"""Add durable HERI command idempotency records."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0006_command_idempotency"
down_revision = "0005_center_slug_settings"
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
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
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
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "command_name",
            "scope",
            "idempotency_key",
            name="uq_heri_command_idempotency_scope_key",
        ),
        schema="heri",
    )
    op.create_index(
        "ix_heri_command_idempotency_state",
        "command_idempotency",
        ["state"],
        unique=False,
        schema="heri",
    )
    op.execute(
        """
        CREATE FUNCTION heri.heri_command_idempotency_reject_terminal_update()
        RETURNS trigger AS $$
        BEGIN
            IF OLD.state IN ('completed', 'failed') THEN
                RAISE EXCEPTION 'terminal HERI command idempotency records are immutable';
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
        """
    )
    op.execute(
        """
        CREATE TRIGGER heri_command_idempotency_terminal_immutable
        BEFORE UPDATE ON heri.command_idempotency
        FOR EACH ROW EXECUTE FUNCTION heri.heri_command_idempotency_reject_terminal_update()
        """
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS heri_command_idempotency_terminal_immutable ON heri.command_idempotency")
    op.execute("DROP FUNCTION IF EXISTS heri.heri_command_idempotency_reject_terminal_update()")
    op.drop_index("ix_heri_command_idempotency_state", table_name="command_idempotency", schema="heri")
    op.drop_table("command_idempotency", schema="heri")
