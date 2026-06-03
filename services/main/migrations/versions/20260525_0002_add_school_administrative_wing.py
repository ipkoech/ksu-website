"""add school administrative wing link

Revision ID: 20260525_0002
Revises: 20260525_0001
Create Date: 2026-05-25 23:40:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260525_0002"
down_revision = "20260525_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("schools", sa.Column("administrative_wing_id", sa.UUID(), nullable=True))
    op.create_index(
        op.f("ix_schools_administrative_wing_id"),
        "schools",
        ["administrative_wing_id"],
        unique=False,
    )
    op.create_foreign_key(
        "fk_schools_administrative_wing_id",
        "schools",
        "wings",
        ["administrative_wing_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_schools_administrative_wing_id", "schools", type_="foreignkey")
    op.drop_index(op.f("ix_schools_administrative_wing_id"), table_name="schools")
    op.drop_column("schools", "administrative_wing_id")
