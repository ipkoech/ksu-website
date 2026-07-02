"""Add department address.

Revision ID: 20260702_0005
Revises: 20260630_0004
Create Date: 2026-07-02 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260702_0005"
down_revision = "20260630_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("departments", sa.Column("address", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("departments", "address")
