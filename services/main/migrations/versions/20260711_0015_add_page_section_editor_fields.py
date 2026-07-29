"""add page section editor fields

Revision ID: 20260711_0015
Revises: 20260711_0014
Create Date: 2026-07-11 12:15:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260711_0015"
down_revision = "20260711_0014"
branch_labels = None
depends_on = None


def _tables() -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return set(inspector.get_table_names())


def _columns(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    if "page_sections" not in _tables():
        return

    columns = _columns("page_sections")

    if "subtitle" not in columns:
        op.add_column("page_sections", sa.Column("subtitle", sa.String(length=255), nullable=True))

    if "description" not in columns:
        op.add_column("page_sections", sa.Column("description", sa.Text(), nullable=True))

    if "settings" not in columns:
        op.add_column("page_sections", sa.Column("settings", postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    if "page_sections" not in _tables():
        return

    columns = _columns("page_sections")

    if "settings" in columns:
        op.drop_column("page_sections", "settings")

    if "description" in columns:
        op.drop_column("page_sections", "description")

    if "subtitle" in columns:
        op.drop_column("page_sections", "subtitle")
