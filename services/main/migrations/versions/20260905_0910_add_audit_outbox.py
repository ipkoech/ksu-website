"""Add an inexpensive durable staging table for Main audit batching.

Additive: no existing-table rewrite or backfill. Deploy before enabling capture.
Downgrade requires draining pending events first; never silently discard them.
"""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from alembic import op

revision = "20260905_0910"
down_revision = "20260904_0900"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "audit_outbox",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("payload", JSONB, nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
    )
    op.create_index("ix_audit_outbox_captured", "audit_outbox", ["captured_at", "id"])


def downgrade() -> None:
    # Hold the lock through DROP so a concurrent producer cannot lose an event
    # between the emptiness check and removal of the staging table.
    bind = op.get_bind()
    bind.execute(sa.text("LOCK TABLE audit_outbox IN ACCESS EXCLUSIVE MODE"))
    if bind.scalar(sa.text("SELECT EXISTS (SELECT 1 FROM audit_outbox)")):
        raise RuntimeError("drain pending audit events before dropping audit_outbox")
    op.drop_table("audit_outbox")
