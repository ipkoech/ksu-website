"""Persist safe attempt history without inventing historical attempts."""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from alembic import op

revision = "20260907_0017"
down_revision = "20260907_0016"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("SET LOCAL lock_timeout = '5s'")
    op.add_column("integration_jobs", sa.Column("retryable", sa.Boolean, nullable=False, server_default=sa.true()))
    op.add_column("integration_jobs", sa.Column("retry_history", JSONB, nullable=False, server_default=sa.text("'[]'::jsonb")))
    op.execute("UPDATE integration_jobs SET retryable=false WHERE status='SUCCESS' OR attempts >= 4")


def downgrade():
    op.drop_column("integration_jobs", "retry_history")
    op.drop_column("integration_jobs", "retryable")
