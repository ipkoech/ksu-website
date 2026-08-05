"""Add per-item workflow status to CMS section items."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260805_0400"
down_revision = "20260803_0300"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "section_items",
        sa.Column("status", sa.String(length=32), nullable=False, server_default="published"),
    )
    op.create_check_constraint(
        "ck_section_items_status",
        "section_items",
        "status IN ('draft', 'in_review', 'published', 'archived')",
    )
    op.create_index("ix_section_items_status", "section_items", ["status"])


def downgrade() -> None:
    op.drop_index("ix_section_items_status", table_name="section_items")
    op.drop_constraint("ck_section_items_status", "section_items", type_="check")
    op.drop_column("section_items", "status")
