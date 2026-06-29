"""add project farm relation

Revision ID: 20260630_0002
Revises: 20260601_0001
Create Date: 2026-06-30 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260630_0002"
down_revision = "20260601_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("research_projects", sa.Column("farm_id", sa.Uuid(), nullable=True), schema="research")
    op.create_index(op.f("ix_research_research_projects_farm_id"), "research_projects", ["farm_id"], unique=False, schema="research")
    op.create_foreign_key(
        "fk_research_projects_farm_id_research_farms",
        "research_projects",
        "research_farms",
        ["farm_id"],
        ["id"],
        source_schema="research",
        referent_schema="research",
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_research_projects_farm_id_research_farms", "research_projects", schema="research", type_="foreignkey")
    op.drop_index(op.f("ix_research_research_projects_farm_id"), table_name="research_projects", schema="research")
    op.drop_column("research_projects", "farm_id", schema="research")
