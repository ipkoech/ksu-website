"""Index the retained-failure existence probe without indexing audit payloads."""

from alembic import op
import sqlalchemy as sa

revision = "20260905_0930"
down_revision = "20260905_0920"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index("ix_audit_outbox_failed", "audit_outbox", ["failed_at"],
                    postgresql_where=sa.text("failed_at IS NOT NULL"))


def downgrade() -> None:
    op.drop_index("ix_audit_outbox_failed", table_name="audit_outbox")
