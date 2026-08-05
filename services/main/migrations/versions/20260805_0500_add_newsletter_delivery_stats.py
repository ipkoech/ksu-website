"""Add delivery stats columns to newsletters."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260805_0500"
down_revision = "20260805_0400"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("newsletters", sa.Column("recipients_count", sa.Integer(), nullable=True))
    op.add_column("newsletters", sa.Column("sent_count", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("newsletters", "sent_count")
    op.drop_column("newsletters", "recipients_count")
