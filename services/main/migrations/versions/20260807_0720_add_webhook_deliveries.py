"""add durable webhook delivery attempts

Revision ID: 20260807_0720
Revises: 20260805_0710
Create Date: 2026-08-07 14:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260807_0720"
down_revision = "20260805_0710"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Legacy webhook rows were never delivered and could omit a secret. Keep
    # them visible to operators but fail closed until explicitly reconfigured.
    op.execute(
        "UPDATE webhooks SET is_active = false "
        "WHERE secret IS NULL OR length(secret) < 32"
    )
    op.add_column(
        "outbox_events",
        sa.Column("webhooks_dispatched_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_outbox_events_webhook_dispatch",
        "outbox_events",
        ["published_at"],
        unique=False,
        postgresql_where=sa.text(
            "published_at IS NOT NULL AND webhooks_dispatched_at IS NULL AND deleted_at IS NULL"
        ),
    )
    op.create_table(
        "webhook_deliveries",
        sa.Column("webhook_id", sa.UUID(), nullable=False),
        sa.Column("event_id", sa.UUID(), nullable=False),
        sa.Column("attempt_number", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("status_code", sa.Integer(), nullable=True),
        sa.Column("duration_ms", sa.Float(), nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("attempted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("next_attempt_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("attempt_number > 0", name="ck_webhook_deliveries_positive_attempt"),
        sa.CheckConstraint(
            "status IN ('delivered', 'retrying', 'dead_letter')",
            name="ck_webhook_deliveries_status",
        ),
        sa.ForeignKeyConstraint(["event_id"], ["outbox_events.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["webhook_id"], ["webhooks.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "webhook_id", "event_id", "attempt_number",
            name="uq_webhook_deliveries_webhook_event_attempt",
        ),
    )
    op.create_index(
        "ix_webhook_deliveries_webhook_attempted",
        "webhook_deliveries", ["webhook_id", "attempted_at"], unique=False,
    )
    op.create_index(
        "ix_webhook_deliveries_event",
        "webhook_deliveries", ["event_id", "attempt_number"], unique=False,
    )


def downgrade() -> None:
    op.drop_table("webhook_deliveries")
    op.drop_index("ix_outbox_events_webhook_dispatch", table_name="outbox_events")
    op.drop_column("outbox_events", "webhooks_dispatched_at")
