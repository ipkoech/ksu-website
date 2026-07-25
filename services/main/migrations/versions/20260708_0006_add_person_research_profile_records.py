"""add person research profile records

Revision ID: 20260708_0006
Revises: 20260707_0005
Create Date: 2026-07-08 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260708_0006"
down_revision = "20260707_0005"
branch_labels = None
depends_on = None


def _columns(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns(table_name)}


def _add_column_if_missing(table_name: str, column: sa.Column) -> None:
    if column.name in _columns(table_name):
        return
    op.add_column(table_name, column)


def upgrade() -> None:
    _add_column_if_missing(
        "persons",
        sa.Column("publication_records", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    _add_column_if_missing(
        "persons",
        sa.Column("research_grants_won", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )


def downgrade() -> None:
    columns = _columns("persons")
    if "research_grants_won" in columns:
        op.drop_column("persons", "research_grants_won")
    if "publication_records" in columns:
        op.drop_column("persons", "publication_records")
