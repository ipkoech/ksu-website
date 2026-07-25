"""Add notification event-consumer idempotency.

Revision ID: 20260717_0032
Revises: 20260717_0031
"""

from alembic import op
import sqlalchemy as sa


revision = "20260717_0032"
down_revision = "20260717_0031"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "notifications",
        sa.Column("source_event_id", sa.UUID(), nullable=True),
    )
    op.create_foreign_key(
        "fk_notifications_source_event_id_outbox_events",
        "notifications",
        "outbox_events",
        ["source_event_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        "ix_notifications_source_event_id",
        "notifications",
        ["source_event_id"],
    )
    op.create_unique_constraint(
        "uq_notifications_user_source_event",
        "notifications",
        ["user_id", "source_event_id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_notifications_user_source_event",
        "notifications",
        type_="unique",
    )
    op.drop_index("ix_notifications_source_event_id", table_name="notifications")
    op.drop_constraint(
        "fk_notifications_source_event_id_outbox_events",
        "notifications",
        type_="foreignkey",
    )
    op.drop_column("notifications", "source_event_id")
