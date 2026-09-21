"""Persist integration job authority and safe execution results."""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from alembic import op

revision = "20260907_0013"
down_revision = "20260907_0012"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("SET LOCAL lock_timeout = '5s'")
    op.create_table("integration_jobs",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("actor_id", sa.Uuid, nullable=False),
        sa.Column("session_jti", sa.String(64), nullable=False),
        sa.Column("integration", sa.String(32), nullable=False),
        sa.Column("scope_type", sa.String(32), nullable=False),
        sa.Column("scope_id", sa.Uuid),
        sa.Column("status", sa.String(16), nullable=False, server_default="PENDING"),
        sa.Column("attempts", sa.Integer, nullable=False, server_default="0"),
        sa.Column("result", JSONB), sa.Column("error", sa.String(255)),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("finished_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_integration_jobs_actor_created", "integration_jobs", ["actor_id", "created_at"])


def downgrade():
    op.drop_index("ix_integration_jobs_actor_created", table_name="integration_jobs")
    op.drop_table("integration_jobs")
