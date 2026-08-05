"""Add shared editorial workflow metadata to documents.

Revision ID: 20260717_0029
Revises: 20260717_0028
"""

from alembic import op
import sqlalchemy as sa


revision = "20260717_0029"
down_revision = "20260717_0028"
branch_labels = None
depends_on = None


def upgrade() -> None:
    columns = (
        sa.Column("workflow_status", sa.String(32), server_default="draft", nullable=False),
        sa.Column("owner_portal", sa.String(64), nullable=True),
        sa.Column("owner_scope_type", sa.String(32), nullable=True),
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
        sa.Column("author_user_id", sa.UUID(), nullable=True),
        sa.Column("status", sa.String(32), server_default="draft", nullable=False),
    )
    for column in columns:
        op.add_column("documents", column)
    for field in (
        "submitted_by_id",
        "reviewed_by_id",
        "approved_by_id",
        "published_by_id",
        "unpublished_by_id",
        "author_user_id",
    ):
        op.create_foreign_key(
            f"fk_documents_{field}_users",
            "documents",
            "users",
            [field],
            ["id"],
            ondelete="SET NULL",
        )
    op.create_index(
        "ix_documents_school_workflow",
        "documents",
        ["owner_scope_type", "owner_scope_id", "workflow_status"],
    )
    for field in (
        "workflow_status",
        "owner_portal",
        "owner_scope_type",
        "owner_scope_id",
        "scheduled_publish_at",
        "expires_at",
        "is_published",
        "published_at",
        "author_user_id",
        "status",
    ):
        op.create_index(f"ix_documents_{field}", "documents", [field])


def downgrade() -> None:
    for field in (
        "workflow_status",
        "owner_portal",
        "owner_scope_type",
        "owner_scope_id",
        "scheduled_publish_at",
        "expires_at",
        "is_published",
        "published_at",
        "author_user_id",
        "status",
    ):
        op.drop_index(f"ix_documents_{field}", table_name="documents")
    op.drop_index("ix_documents_school_workflow", table_name="documents")
    for field in (
        "submitted_by_id",
        "reviewed_by_id",
        "approved_by_id",
        "published_by_id",
        "unpublished_by_id",
        "author_user_id",
    ):
        op.drop_constraint(f"fk_documents_{field}_users", "documents", type_="foreignkey")
    for field in (
        "status",
        "author_user_id",
        "archived_at",
        "published_at",
        "is_published",
        "revision_notes",
        "rejection_reason",
        "unpublished_at",
        "unpublished_by_id",
        "expires_at",
        "scheduled_publish_at",
        "published_by_id",
        "approved_at",
        "approved_by_id",
        "reviewed_at",
        "reviewed_by_id",
        "submitted_at",
        "submitted_by_id",
        "owner_scope_id",
        "owner_scope_type",
        "owner_portal",
        "workflow_status",
    ):
        op.drop_column("documents", field)
