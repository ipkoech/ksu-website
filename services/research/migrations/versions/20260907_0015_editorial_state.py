"""Persist editorial state for resources previously gated by a boolean only."""

from alembic import op
import sqlalchemy as sa

revision = "20260907_0015"
down_revision = "20260906_0014"
branch_labels = None
depends_on = None

SCHEMA = "research"
TABLES = {"research_farms": "is_public", "focus_areas": "is_active", "impact_metrics": "is_active"}


def upgrade():
    op.execute("SET LOCAL lock_timeout = '5s'")
    for table, visibility in TABLES.items():
        op.add_column(table, sa.Column("editorial_state", sa.String(16), nullable=True), schema=SCHEMA)
        # Preserve existing public visibility; never infer submission history.
        op.execute(sa.text(f"UPDATE {SCHEMA}.{table} SET editorial_state = CASE WHEN {visibility} IS TRUE THEN 'published' ELSE 'draft' END"))
        op.alter_column(table, "editorial_state", nullable=False, server_default="draft", schema=SCHEMA)
        op.create_check_constraint(f"ck_{table}_editorial_state", table,
                                   "editorial_state IN ('draft','pending','published','rejected')", schema=SCHEMA)


def downgrade():
    for table in TABLES:
        op.drop_constraint(f"ck_{table}_editorial_state", table, schema=SCHEMA, type_="check")
        op.drop_column(table, "editorial_state", schema=SCHEMA)
