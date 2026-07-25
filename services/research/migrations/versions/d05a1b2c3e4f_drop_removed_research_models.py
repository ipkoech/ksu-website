"""drop removed research models

Revision ID: d05a1b2c3e4f
Revises: 20260601_0001
Create Date: 2026-06-26 12:00:00.000000

Drops tables for models removed in favor of main-service equivalents:
- research_news, research_articles, research_events, research_sliders → main service content with scope_type
- research_offices, research_office_staff → main service departments/staff assignments
- research_boards, board_members → main service boards/governance
"""

from alembic import op

revision = "d05a1b2c3e4f"
down_revision = "20260601_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("DROP TABLE IF EXISTS board_members CASCADE")
    op.execute("DROP TABLE IF EXISTS research_boards CASCADE")
    op.execute("DROP TABLE IF EXISTS research_office_staff CASCADE")
    op.execute("DROP TABLE IF EXISTS research_offices CASCADE")
    op.execute("DROP TABLE IF EXISTS research_sliders CASCADE")
    op.execute("DROP TABLE IF EXISTS research_events CASCADE")
    op.execute("DROP TABLE IF EXISTS research_articles CASCADE")
    op.execute("DROP TABLE IF EXISTS research_news CASCADE")


def downgrade() -> None:
    # Tables were dropped because their models were removed.
    # Re-adding them requires restoring the Python model definitions first.
    pass
