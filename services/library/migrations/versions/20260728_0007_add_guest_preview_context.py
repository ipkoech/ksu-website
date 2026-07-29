"""Persist the selected assistant context for guest preview promotion.

Revision ID: 20260728_0007
Revises: 20260728_0006
Create Date: 2026-07-28 17:00:00
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision = "20260728_0007"
down_revision = "20260728_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "library_guest_sessions",
        sa.Column("context_id", postgresql.UUID(as_uuid=True), nullable=True),
        schema="library",
    )
    op.add_column(
        "library_guest_sessions",
        sa.Column("page_context", sa.JSON(), nullable=True),
        schema="library",
    )
    op.create_index(
        "ix_library_guest_sessions_context_id",
        "library_guest_sessions",
        ["context_id"],
        unique=False,
        schema="library",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_library_guest_sessions_context_id",
        table_name="library_guest_sessions",
        schema="library",
    )
    op.drop_column("library_guest_sessions", "page_context", schema="library")
    op.drop_column("library_guest_sessions", "context_id", schema="library")
