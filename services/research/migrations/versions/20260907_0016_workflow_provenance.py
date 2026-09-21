"""Persist Research workflow provenance in the business transaction."""

from alembic import op
import sqlalchemy as sa

revision = "20260907_0016"
SCHEMA = "research"
down_revision = "20260907_0015"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("SET LOCAL lock_timeout = '5s'")
    op.create_table(
        "research_workflow_events",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("resource_key", sa.String(64), nullable=False),
        sa.Column("resource_id", sa.Uuid, nullable=False),
        sa.Column("actor_id", sa.String(64), nullable=False),
        sa.Column("session_jti", sa.String(64), nullable=False),
        sa.Column("previous_state", sa.String(16), nullable=False),
        sa.Column("target_state", sa.String(16), nullable=False),
        sa.Column("note", sa.String(2000)),
        schema=SCHEMA, if_not_exists=True,
    )
    op.create_index("ix_research_workflow_record_history", "research_workflow_events",
                    ["resource_key", "resource_id", "created_at", "id"], schema=SCHEMA, if_not_exists=True)


def downgrade():
    op.drop_index("ix_research_workflow_record_history", table_name="research_workflow_events", schema=SCHEMA)
    op.drop_table("research_workflow_events", schema=SCHEMA)
