"""Durable encrypted assistant notifications."""

import sqlalchemy as sa
from alembic import op

revision = "20260907_0012"
down_revision = "20260906_0011"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("notification_outbox",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("encrypted_payload", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("available_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("claim_token", sa.Uuid),
        sa.Column("attempts", sa.Integer, nullable=False, server_default="0"),
        sa.Column("status", sa.String(16), nullable=False, server_default="pending"),
        sa.Column("failure_code", sa.String(64)), schema="library", if_not_exists=True,
    )
    op.create_index("ix_library_notifications_ready", "notification_outbox", ["available_at", "id"],
                    schema="library", postgresql_where=sa.text("status = 'pending'"), if_not_exists=True)


def downgrade():
    if op.get_bind().scalar(sa.text("SELECT EXISTS (SELECT 1 FROM library.notification_outbox WHERE status = 'pending')")):
        raise RuntimeError("Drain pending Library notifications before downgrade")
    op.drop_table("notification_outbox", schema="library")
