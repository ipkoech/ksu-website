"""add shared content workflow logs

Revision ID: 20260712_0016
Revises: 20260711_0015
Create Date: 2026-07-12 09:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260712_0016"
down_revision = "20260711_0015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "content_workflow_logs",
        sa.Column("content_type", sa.String(length=64), nullable=False),
        sa.Column("content_id", sa.UUID(), nullable=False),
        sa.Column("from_status", sa.String(length=32), nullable=False),
        sa.Column("to_status", sa.String(length=32), nullable=False),
        sa.Column("action", sa.String(length=32), nullable=False),
        sa.Column("actor_id", sa.UUID(), nullable=True),
        sa.Column("comments", sa.Text(), nullable=True),
        sa.Column("changed_fields", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("from_status IN ('draft', 'submitted', 'in_review', 'changes_requested', 'approved', 'scheduled', 'published', 'unpublished', 'rejected', 'archived')", name="ck_content_workflow_logs_from_status"),
        sa.CheckConstraint("to_status IN ('draft', 'submitted', 'in_review', 'changes_requested', 'approved', 'scheduled', 'published', 'unpublished', 'rejected', 'archived')", name="ck_content_workflow_logs_to_status"),
        sa.CheckConstraint("action IN ('submit', 'start_review', 'request_changes', 'approve', 'schedule', 'publish', 'unpublish', 'reject', 'archive')", name="ck_content_workflow_logs_action"),
        sa.ForeignKeyConstraint(["actor_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_content_workflow_logs_content_type", "content_workflow_logs", ["content_type"])
    op.create_index("ix_content_workflow_logs_content_id", "content_workflow_logs", ["content_id"])
    op.create_index("ix_content_workflow_logs_actor_id", "content_workflow_logs", ["actor_id"])
    op.create_index("ix_content_workflow_logs_content_created", "content_workflow_logs", ["content_type", "content_id", "created_at"])


def downgrade() -> None:
    op.drop_table("content_workflow_logs")
