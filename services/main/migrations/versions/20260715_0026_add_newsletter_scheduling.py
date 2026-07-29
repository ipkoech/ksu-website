"""add newsletter scheduling metadata

Revision ID: 20260715_0026
Revises: 20260715_0025
Create Date: 2026-07-15 18:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260715_0026"
down_revision = "20260715_0025"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("newsletters", sa.Column("scheduled_send_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("newsletters", sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("newsletters", sa.Column("send_status", sa.String(32), server_default="draft", nullable=False))
    op.add_column("newsletters", sa.Column("send_error", sa.Text(), nullable=True))
    op.create_index(op.f("ix_newsletters_scheduled_send_at"), "newsletters", ["scheduled_send_at"], unique=False)
    op.create_index(op.f("ix_newsletters_sent_at"), "newsletters", ["sent_at"], unique=False)
    op.create_index(op.f("ix_newsletters_send_status"), "newsletters", ["send_status"], unique=False)


def downgrade():
    op.drop_index(op.f("ix_newsletters_send_status"), table_name="newsletters")
    op.drop_index(op.f("ix_newsletters_sent_at"), table_name="newsletters")
    op.drop_index(op.f("ix_newsletters_scheduled_send_at"), table_name="newsletters")
    op.drop_column("newsletters", "send_error")
    op.drop_column("newsletters", "send_status")
    op.drop_column("newsletters", "sent_at")
    op.drop_column("newsletters", "scheduled_send_at")
