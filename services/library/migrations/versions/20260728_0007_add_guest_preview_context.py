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
    inspector = sa.inspect(op.get_bind())
    columns = {column["name"] for column in inspector.get_columns("library_guest_sessions", schema="library")}
    indexes = {index["name"] for index in inspector.get_indexes("library_guest_sessions", schema="library")}
    if "context_id" not in columns:
        op.add_column(
            "library_guest_sessions",
            sa.Column("context_id", postgresql.UUID(as_uuid=True), nullable=True),
            schema="library",
        )
    if "page_context" not in columns:
        op.add_column(
            "library_guest_sessions",
            sa.Column("page_context", sa.JSON(), nullable=True),
            schema="library",
        )
    if "ix_library_guest_sessions_context_id" not in indexes:
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
