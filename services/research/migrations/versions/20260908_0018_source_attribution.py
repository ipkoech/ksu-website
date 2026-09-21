"""Preserve project-register attribution and distinguish copyright from patents."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260908_0018"
down_revision = "20260907_0017"
branch_labels = None
depends_on = None


def upgrade():
    for column in (
        sa.Column("principal_investigator_name", sa.Text(), nullable=True),
        sa.Column("school_name", sa.String(255), nullable=True),
        sa.Column("funder_name", sa.Text(), nullable=True),
        sa.Column("source_references", postgresql.JSONB(), nullable=True),
    ):
        op.add_column("research_projects", column, schema="research")
    op.add_column(
        "innovations",
        sa.Column("copyright_number", sa.String(128), nullable=True),
        schema="research",
    )


def downgrade():
    op.drop_column("innovations", "copyright_number", schema="research")
    for name in (
        "source_references",
        "funder_name",
        "school_name",
        "principal_investigator_name",
    ):
        op.drop_column("research_projects", name, schema="research")
