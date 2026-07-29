"""add grant funder relation

Revision ID: 20260701_0008
Revises: 20260630_0007_merge_heads
Create Date: 2026-07-01 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260701_0008"
down_revision = "20260630_0007_merge_heads"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("grants", sa.Column("funder_id", sa.Uuid(), nullable=True), schema="research")
    op.create_index(op.f("ix_research_grants_funder_id"), "grants", ["funder_id"], unique=False, schema="research")
    op.create_foreign_key(
        "fk_grants_funder_id_fundings",
        "grants",
        "fundings",
        ["funder_id"],
        ["id"],
        source_schema="research",
        referent_schema="research",
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_grants_funder_id_fundings", "grants", schema="research", type_="foreignkey")
    op.drop_index(op.f("ix_research_grants_funder_id"), table_name="grants", schema="research")
    op.drop_column("grants", "funder_id", schema="research")
