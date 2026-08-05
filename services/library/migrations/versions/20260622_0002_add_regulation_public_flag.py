"""Add public visibility flag to library regulations.

Revision ID: 20260622_0002
Revises: 20260505_0001
Create Date: 2026-06-22 23:40:00
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "20260622_0002"
down_revision = "20260505_0001"
branch_labels = None
depends_on = None


def _columns(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns(table_name, schema="library")}


def _indexes(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {index["name"] for index in inspector.get_indexes(table_name, schema="library")}


def upgrade() -> None:
    if "is_public" not in _columns("library_regulations"):
        op.add_column(
            "library_regulations",
            sa.Column(
                "is_public",
                sa.Boolean(),
                nullable=False,
                server_default=sa.true(),
            ),
            schema="library",
        )
        op.alter_column(
            "library_regulations",
            "is_public",
            server_default=None,
            schema="library",
        )
    if "ix_library_regulations_public_status" not in _indexes("library_regulations"):
        op.create_index(
            "ix_library_regulations_public_status",
            "library_regulations",
            ["is_public", "status"],
            unique=False,
            schema="library",
        )


def downgrade() -> None:
    op.drop_index(
        "ix_library_regulations_public_status",
        table_name="library_regulations",
        schema="library",
    )
    op.drop_column("library_regulations", "is_public", schema="library")
