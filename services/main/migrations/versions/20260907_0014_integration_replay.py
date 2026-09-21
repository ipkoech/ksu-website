"""Scope integration request replay to actor and operation."""

import sqlalchemy as sa
from alembic import op

revision = "20260907_0014"
down_revision = "20260907_0013"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("SET LOCAL lock_timeout = '5s'")
    op.add_column("integration_jobs", sa.Column("idempotency_digest", sa.String(64)))
    op.add_column("integration_jobs", sa.Column("request_id", sa.String(128)))
    op.create_unique_constraint("uq_integration_job_request", "integration_jobs", ["actor_id", "integration", "idempotency_digest"])


def downgrade():
    op.drop_constraint("uq_integration_job_request", "integration_jobs", type_="unique")
    op.drop_column("integration_jobs", "request_id")
    op.drop_column("integration_jobs", "idempotency_digest")
