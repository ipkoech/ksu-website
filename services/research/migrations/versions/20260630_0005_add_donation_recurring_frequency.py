"""add donation recurring frequency

Revision ID: 20260630_0005
Revises: 20260630_0004
Create Date: 2026-06-30 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260630_0005"
down_revision = "20260630_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "donations",
        sa.Column("recurring_frequency", sa.String(length=32), nullable=True),
        schema="research",
    )


def downgrade() -> None:
    op.drop_column("donations", "recurring_frequency", schema="research")
