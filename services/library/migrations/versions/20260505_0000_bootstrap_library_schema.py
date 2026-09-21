"""Bootstrap the library service schema from the current ORM metadata.

Revision ID: 20260505_0000
Revises:
Create Date: 2026-05-05 00:00:00
"""

from __future__ import annotations

from alembic import op

from app.models import Base


revision = "20260505_0000"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    # This baseline migration runs before later additive revisions. Exclude
    # tables introduced after the baseline, otherwise current ORM metadata
    # would create them early and their own migrations would fail with
    # duplicate-table errors on a fresh database.
    tables = [
        table
        for table_name, table in Base.metadata.tables.items()
        if table_name != "library.audit_relay"
    ]
    Base.metadata.create_all(bind=bind, tables=tables)


def downgrade() -> None:
    bind = op.get_bind()
    tables = [
        table
        for table_name, table in Base.metadata.tables.items()
        if table_name != "library.audit_relay"
    ]
    Base.metadata.drop_all(bind=bind, tables=tables)
