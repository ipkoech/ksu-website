"""add workflow metadata to club activities

Revision ID: 20260712_0018
Revises: 20260712_0017
Create Date: 2026-07-12 13:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260712_0018"
down_revision = "20260712_0017"
branch_labels = None
depends_on = None


def upgrade() -> None:
    columns = (
        sa.Column("author_user_id", sa.UUID(), nullable=True),
        sa.Column("is_published", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("workflow_status", sa.String(length=32), server_default="draft", nullable=False),
        sa.Column("owner_portal", sa.String(length=64), nullable=True),
        sa.Column("owner_scope_type", sa.String(length=32), nullable=True),
        sa.Column("owner_scope_id", sa.UUID(), nullable=True),
        sa.Column("submitted_by_id", sa.UUID(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_by_id", sa.UUID(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_by_id", sa.UUID(), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_by_id", sa.UUID(), nullable=True),
        sa.Column("scheduled_publish_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("unpublished_by_id", sa.UUID(), nullable=True),
        sa.Column("unpublished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("revision_notes", sa.Text(), nullable=True),
    )
    for column in columns:
        op.add_column("club_activities", column)
    for column_name in (
        "author_user_id", "submitted_by_id", "reviewed_by_id", "approved_by_id",
        "published_by_id", "unpublished_by_id",
    ):
        op.create_foreign_key(
            f"fk_club_activities_{column_name}_users",
            "club_activities",
            "users",
            [column_name],
            ["id"],
            ondelete="SET NULL",
        )
    for column_name in (
        "author_user_id", "is_published", "published_at", "archived_at", "workflow_status",
        "owner_portal", "owner_scope_type", "owner_scope_id", "scheduled_publish_at", "expires_at",
    ):
        op.create_index(f"ix_club_activities_{column_name}", "club_activities", [column_name])
    op.create_index(
        "ix_club_activities_owner_scope",
        "club_activities",
        ["owner_scope_type", "owner_scope_id"],
    )
    op.execute(
        sa.text(
            "UPDATE club_activities SET is_published = true, workflow_status = 'published', "
            "status = 'published' WHERE is_public IS TRUE"
        )
    )


def downgrade() -> None:
    for column_name in (
        "unpublished_by_id", "published_by_id", "approved_by_id", "reviewed_by_id",
        "submitted_by_id", "author_user_id",
    ):
        op.drop_constraint(
            f"fk_club_activities_{column_name}_users",
            "club_activities",
            type_="foreignkey",
        )
    for index_name in (
        "owner_scope", "expires_at", "scheduled_publish_at", "owner_scope_id", "owner_scope_type",
        "owner_portal", "workflow_status", "archived_at", "published_at", "is_published", "author_user_id",
    ):
        op.drop_index(f"ix_club_activities_{index_name}", table_name="club_activities")
    for column_name in reversed((
        "author_user_id", "is_published", "published_at", "archived_at", "workflow_status",
        "owner_portal", "owner_scope_type", "owner_scope_id", "submitted_by_id", "submitted_at",
        "reviewed_by_id", "reviewed_at", "approved_by_id", "approved_at", "published_by_id",
        "scheduled_publish_at", "expires_at", "unpublished_by_id", "unpublished_at", "rejection_reason",
        "revision_notes",
    )):
        op.drop_column("club_activities", column_name)
