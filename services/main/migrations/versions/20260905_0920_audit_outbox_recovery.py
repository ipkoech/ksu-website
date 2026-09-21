"""Retain malformed audits outside the active drain queue for operator repair."""

from alembic import op
import sqlalchemy as sa

revision = "20260905_0920"
down_revision = "20260905_0910"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("audit_outbox", sa.Column("failed_at", sa.DateTime(timezone=True)))
    op.add_column("audit_outbox", sa.Column("failure_code", sa.String(64)))
    op.create_index("ix_audit_outbox_pending", "audit_outbox", ["captured_at", "id"],
                    postgresql_where=sa.text("failed_at IS NULL"))
    op.drop_index("ix_audit_outbox_captured", table_name="audit_outbox")


def downgrade() -> None:
    bind = op.get_bind()
    bind.execute(sa.text("LOCK TABLE audit_outbox IN ACCESS EXCLUSIVE MODE"))
    if bind.scalar(sa.text("SELECT EXISTS (SELECT 1 FROM audit_outbox WHERE failed_at IS NOT NULL)")):
        raise RuntimeError("repair retained audit events before removing recovery fields")
    op.create_index("ix_audit_outbox_captured", "audit_outbox", ["captured_at", "id"])
    op.drop_index("ix_audit_outbox_pending", table_name="audit_outbox")
    op.drop_column("audit_outbox", "failure_code")
    op.drop_column("audit_outbox", "failed_at")
