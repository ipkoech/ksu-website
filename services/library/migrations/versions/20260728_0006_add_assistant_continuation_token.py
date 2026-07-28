"""Add revocable continuation credentials to Library assistant conversations.

Revision ID: 20260728_0006
Revises: 20260728_0005
Create Date: 2026-07-28 16:30:00
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "20260728_0006"
down_revision = "20260728_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "library_conversations",
        sa.Column("continuation_token_hash", sa.String(128), nullable=True),
        schema="library",
    )
    op.add_column(
        "library_conversations",
        sa.Column("continuation_expires_at", sa.DateTime(timezone=True), nullable=True),
        schema="library",
    )
    op.create_index(
        "ix_library_conversations_continuation_token_hash",
        "library_conversations",
        ["continuation_token_hash"],
        unique=False,
        schema="library",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_library_conversations_continuation_token_hash",
        table_name="library_conversations",
        schema="library",
    )
    op.drop_column("library_conversations", "continuation_expires_at", schema="library")
    op.drop_column("library_conversations", "continuation_token_hash", schema="library")
