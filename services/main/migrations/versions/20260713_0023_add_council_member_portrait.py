"""add council member portrait media

Revision ID: 20260713_0023
Revises: 20260713_0022
Create Date: 2026-07-13 16:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260713_0023"
down_revision = "20260713_0022"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("staff_assignments", sa.Column("portrait_media_id", sa.UUID(), nullable=True))
    op.create_foreign_key(
        "fk_staff_assignments_portrait_media_id_media",
        "staff_assignments",
        "media",
        ["portrait_media_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_staff_assignments_portrait_media_id_media", "staff_assignments", type_="foreignkey")
    op.drop_column("staff_assignments", "portrait_media_id")
