"""Add single-use recovery links for Library assistant conversations.

Revision ID: 20260728_0008
Revises: 20260728_0007
Create Date: 2026-07-28 17:30:00
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision = "20260728_0008"
down_revision = "20260728_0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    if "library_conversation_recoveries" in sa.inspect(op.get_bind()).get_table_names(schema="library"):
        return
    op.create_table(
        "library_conversation_recoveries",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["conversation_id"], ["library.library_conversations.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
        schema="library",
    )
    op.create_index(
        "ix_library_conversation_recoveries_token_hash",
        "library_conversation_recoveries",
        ["token_hash"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_conversation_recoveries_conversation_id",
        "library_conversation_recoveries",
        ["conversation_id"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_conversation_recoveries_conversation_expires",
        "library_conversation_recoveries",
        ["conversation_id", "expires_at"],
        unique=False,
        schema="library",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_library_conversation_recoveries_conversation_expires",
        table_name="library_conversation_recoveries",
        schema="library",
    )
    op.drop_index(
        "ix_library_conversation_recoveries_conversation_id",
        table_name="library_conversation_recoveries",
        schema="library",
    )
    op.drop_index(
        "ix_library_conversation_recoveries_token_hash",
        table_name="library_conversation_recoveries",
        schema="library",
    )
    op.drop_table("library_conversation_recoveries", schema="library")
