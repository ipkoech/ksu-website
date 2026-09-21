"""Create school workspace follow-up tasks."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260908_0023"
down_revision = "20260907_0022"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "school_work_tasks",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("school_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("status", sa.String(length=24), nullable=False, server_default="open"),
        sa.Column("priority", sa.String(length=16), nullable=False, server_default="normal"),
        sa.Column("owner_id", sa.Uuid()),
        sa.Column("due_at", sa.DateTime(timezone=True)),
        sa.Column("resource_type", sa.String(length=64)),
        sa.Column("resource_id", sa.Uuid()),
        sa.Column("evidence_ids", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("metadata", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
    )
    op.create_index("ix_school_work_tasks_school_status_due", "school_work_tasks", ["school_id", "status", "due_at"])
    op.create_index("ix_school_work_tasks_owner_status", "school_work_tasks", ["owner_id", "status"])


def downgrade() -> None:
    op.drop_index("ix_school_work_tasks_owner_status", table_name="school_work_tasks")
    op.drop_index("ix_school_work_tasks_school_status_due", table_name="school_work_tasks")
    op.drop_table("school_work_tasks")
