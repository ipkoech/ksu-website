"""Add index coverage for bounded lifecycle pruning.

Revision ID: 20260809_0800
Revises: 20260807_0720
"""

from __future__ import annotations

from alembic import op

revision = "20260809_0800"
down_revision = "20260807_0720"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_command_idempotency_state_updated",
        "command_idempotency",
        ["state", "updated_at"],
        schema="main",
        if_not_exists=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_command_idempotency_state_updated",
        table_name="command_idempotency",
        schema="main",
        if_exists=True,
    )
