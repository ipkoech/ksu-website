"""Repair Research command idempotency storage created in the public schema.

An early deployment applied the command-idempotency revision while the
service schema setting was still ``public``.  The application always queries
the Research-owned table, so that drift made every guarded Research mutation
fail after reserving its command.  Move the legacy table into ``research``
without rewriting rows; fresh databases remain unchanged.
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260907_0017"
down_revision = "20260907_0016"
branch_labels = None
depends_on = None


def _exists(bind, qualified_name: str) -> bool:
    return bool(bind.scalar(sa.text("SELECT to_regclass(:name) IS NOT NULL"), {"name": qualified_name}))


def _create_expected_table() -> None:
    op.create_table(
        "command_idempotency",
        sa.Column("command_name", sa.String(length=255), nullable=False),
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
        sa.CheckConstraint("state IN ('pending', 'completed', 'failed')", name="ck_research_command_idempotency_state"),
        sa.CheckConstraint("status_code IS NULL OR status_code BETWEEN 100 AND 599", name="ck_research_command_idempotency_status_code"),
        sa.CheckConstraint(
            "(state = 'pending' AND status_code IS NULL AND response_body IS NULL) "
            "OR (state IN ('completed', 'failed') AND status_code BETWEEN 100 AND 599 "
            "AND response_body IS NOT NULL)",
            name="ck_research_command_idempotency_response_shape",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "command_name", "scope", "idempotency_key",
            name="uq_research_command_idempotency_scope_key",
        ),
        schema="research",
    )
    op.create_index(
        "ix_research_command_idempotency_state",
        "command_idempotency",
        ["state"],
        schema="research",
    )


def _ensure_terminal_guard() -> None:
    op.execute(
        """
        CREATE OR REPLACE FUNCTION research.research_command_idempotency_reject_terminal_update()
        RETURNS trigger AS $$
        BEGIN
            IF OLD.state IN ('completed', 'failed') THEN
                RAISE EXCEPTION 'terminal Research command idempotency records are immutable';
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
        """
    )
    op.execute(
        """
        DROP TRIGGER IF EXISTS research_command_idempotency_terminal_immutable
        ON research.command_idempotency
        """
    )
    op.execute(
        """
        CREATE TRIGGER research_command_idempotency_terminal_immutable
        BEFORE UPDATE ON research.command_idempotency
        FOR EACH ROW EXECUTE FUNCTION research.research_command_idempotency_reject_terminal_update()
        """
    )


def upgrade() -> None:
    bind = op.get_bind()
    bind.execute(sa.text("CREATE SCHEMA IF NOT EXISTS research"))
    research_exists = _exists(bind, "research.command_idempotency")
    public_exists = _exists(bind, "public.command_idempotency")
    if not research_exists and public_exists:
        # PostgreSQL keeps indexes and constraints with the table when it is
        # moved, preserving any already-recorded idempotency state.
        bind.execute(sa.text("ALTER TABLE public.command_idempotency SET SCHEMA research"))
    elif not research_exists:
        _create_expected_table()
    _ensure_terminal_guard()


def downgrade() -> None:
    # Keep the repaired table in Research when rolling back later revisions;
    # dropping it would discard durable command history.
    return None
