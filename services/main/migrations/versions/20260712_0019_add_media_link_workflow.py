"""add workflow metadata to media links

Revision ID: 20260712_0019
Revises: 20260712_0018
Create Date: 2026-07-12 14:30:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260712_0019"
down_revision = "20260712_0018"
branch_labels = None
depends_on = None


def upgrade() -> None:
    columns = (
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
        sa.Column("is_published", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=32), server_default="draft", nullable=False),
        sa.Column("author_user_id", sa.UUID(), nullable=True),
    )
    for column in columns:
        op.add_column("media_links", column)

    for column_name in (
        "submitted_by_id", "reviewed_by_id", "approved_by_id",
        "published_by_id", "unpublished_by_id", "author_user_id",
    ):
        op.create_foreign_key(
            f"fk_media_links_{column_name}_users",
            "media_links",
            "users",
            [column_name],
            ["id"],
            ondelete="SET NULL",
        )

    for column_name in (
        "workflow_status", "owner_portal", "owner_scope_type", "owner_scope_id",
        "scheduled_publish_at", "expires_at", "is_published", "published_at",
        "archived_at", "status", "author_user_id",
    ):
        op.create_index(f"ix_media_links_{column_name}", "media_links", [column_name])
    op.create_index("ix_media_links_owner_scope", "media_links", ["owner_scope_type", "owner_scope_id"])

    op.execute(
        sa.text(
            "UPDATE media_links SET is_published = true, workflow_status = 'published', "
            "status = 'published' WHERE is_public IS TRUE AND entity_type = 'club'"
        )
    )


def downgrade() -> None:
    for column_name in (
        "author_user_id", "unpublished_by_id", "published_by_id", "approved_by_id",
        "reviewed_by_id", "submitted_by_id",
    ):
        op.drop_constraint(f"fk_media_links_{column_name}_users", "media_links", type_="foreignkey")

    for index_name in (
        "owner_scope", "author_user_id", "status", "archived_at", "published_at",
        "is_published", "expires_at", "scheduled_publish_at", "owner_scope_id",
        "owner_scope_type", "owner_portal", "workflow_status",
    ):
        op.drop_index(f"ix_media_links_{index_name}", table_name="media_links")

    for column_name in reversed((
        "workflow_status", "owner_portal", "owner_scope_type", "owner_scope_id",
        "submitted_by_id", "submitted_at", "reviewed_by_id", "reviewed_at",
        "approved_by_id", "approved_at", "published_by_id", "scheduled_publish_at",
        "expires_at", "unpublished_by_id", "unpublished_at", "rejection_reason",
        "revision_notes", "is_published", "published_at", "archived_at", "status",
        "author_user_id",
    )):
        op.drop_column("media_links", column_name)
