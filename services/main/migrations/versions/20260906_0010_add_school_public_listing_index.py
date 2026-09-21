"""Index the public school listing's fixed visibility and sort predicates."""

from alembic import op
import sqlalchemy as sa


revision = "20260906_0010"
down_revision = "20260905_0930"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # The public v1 listing always filters these two flags and orders by the
    # same fields. A partial index keeps the index small and lets PostgreSQL
    # satisfy the LIMIT without scanning or sorting inactive/private rows.
    # Bound the wait for an application-table lock during rollout. The
    # additive migration can be retried after traffic is drained or scheduled
    # as a concurrent build for a large table.
    op.execute("SET LOCAL lock_timeout = '5s'")
    op.create_index(
        "ix_schools_public_listing",
        "schools",
        ["display_order", "name"],
        postgresql_where=sa.text("is_active IS TRUE AND is_public IS TRUE"),
    )


def downgrade() -> None:
    op.drop_index("ix_schools_public_listing", table_name="schools")
