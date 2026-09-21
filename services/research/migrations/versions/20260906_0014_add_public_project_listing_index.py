"""Index the public research-project listing predicates and ordering."""

from alembic import op
import sqlalchemy as sa


revision = "20260906_0014"
down_revision = "20260906_0013"
branch_labels = None
depends_on = None


PUBLIC_STATUSES = (
    "published",
    "active",
    "available",
    "open",
    "ongoing",
    "upcoming",
    "approved",
    "completed",
    "closed",
    "awarded",
    "building",
)


def upgrade() -> None:
    # The public CRUD query applies these fixed predicates and orders by
    # display_order then newest creation. The partial index excludes private,
    # inactive, deleted and non-publication rows before the LIMIT is applied.
    # Do not let an index migration hold an application table lock forever
    # during a busy rollout. A deployment can retry after draining traffic or
    # choose a separately scheduled concurrent build for a large table.
    op.execute("SET LOCAL lock_timeout = '5s'")
    statuses = ", ".join(f"'{status}'" for status in PUBLIC_STATUSES)
    op.create_index(
        "ix_research_projects_public_listing",
        "research_projects",
        ["display_order", sa.text("created_at DESC")],
        schema="research",
        postgresql_where=sa.text(
            "deleted_at IS NULL AND is_active IS TRUE AND is_public IS TRUE "
            f"AND status IN ({statuses})"
        ),
    )


def downgrade() -> None:
    op.drop_index(
        "ix_research_projects_public_listing",
        table_name="research_projects",
        schema="research",
    )
