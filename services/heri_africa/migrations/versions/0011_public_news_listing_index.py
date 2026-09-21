"""Index the public HERI news listing's publication predicates and ordering."""

from alembic import op
import sqlalchemy as sa


revision = "0011_public_news_listing_index"
down_revision = "0010_audit_relay"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Published and scheduled rows are the only candidates for the public
    # listing. The scheduled_at predicate remains a residual filter because
    # its cutoff is request-time; created_at order can still satisfy LIMIT.
    # Bound the wait for an application-table lock during rollout. The
    # migration is additive; a failed lock acquisition is safe to retry.
    op.execute("SET LOCAL lock_timeout = '5s'")
    op.create_index(
        "ix_heri_news_articles_public_listing",
        "news_articles",
        ["created_at"],
        schema="heri",
        postgresql_where=sa.text(
            "deleted_at IS NULL AND status IN ('PUBLISHED', 'SCHEDULED')"
        ),
    )


def downgrade() -> None:
    op.drop_index(
        "ix_heri_news_articles_public_listing",
        table_name="news_articles",
        schema="heri",
    )
