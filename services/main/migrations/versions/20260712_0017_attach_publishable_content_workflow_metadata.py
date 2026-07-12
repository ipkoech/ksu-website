"""attach workflow metadata to publishable content

Revision ID: 20260712_0017
Revises: 20260712_0016
Create Date: 2026-07-12 12:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260712_0017"
down_revision = "20260712_0016"
branch_labels = None
depends_on = None


PUBLISHABLE_TABLES = ("news", "blogs", "announcements", "events", "sliders")
PAGE_CMS_TABLE_COLUMNS = {
    "page_sections": (
        "workflow_status", "owner_portal", "owner_scope_type", "owner_scope_id",
        "submitted_by_id", "submitted_at", "reviewed_by_id", "reviewed_at",
        "scheduled_publish_at", "expires_at", "unpublished_by_id", "unpublished_at",
        "rejection_reason", "revision_notes",
    ),
    "partnership_spotlights": (
        "workflow_status", "owner_portal", "owner_scope_type", "owner_scope_id",
        "submitted_by_id", "submitted_at", "reviewed_by_id", "reviewed_at",
        "approved_by_id", "published_by_id", "scheduled_publish_at",
        "expires_at", "unpublished_by_id", "unpublished_at", "rejection_reason",
        "revision_notes",
    ),
}


def _columns() -> tuple[sa.Column, ...]:
    return (
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


def _page_cms_column(name: str) -> sa.Column:
    if name == "workflow_status":
        return sa.Column(name, sa.String(length=32), server_default="draft", nullable=False)
    if name == "owner_portal":
        return sa.Column(name, sa.String(length=64), nullable=True)
    if name == "owner_scope_type":
        return sa.Column(name, sa.String(length=32), nullable=True)
    if name.endswith("_id") or name == "owner_scope_id":
        return sa.Column(name, sa.UUID(), nullable=True)
    if name.endswith("_at") or name in {"scheduled_publish_at", "expires_at"}:
        return sa.Column(name, sa.DateTime(timezone=True), nullable=True)
    return sa.Column(name, sa.Text(), nullable=True)


def upgrade() -> None:
    for table_name in PUBLISHABLE_TABLES:
        for column in _columns():
            op.add_column(table_name, column)
        op.create_index(f"ix_{table_name}_workflow_status", table_name, ["workflow_status"])
        op.create_index(f"ix_{table_name}_owner_portal", table_name, ["owner_portal"])
        op.create_index(f"ix_{table_name}_owner_scope", table_name, ["owner_scope_type", "owner_scope_id"])
        op.create_index(f"ix_{table_name}_scheduled_publish_at", table_name, ["scheduled_publish_at"])
        op.create_index(f"ix_{table_name}_expires_at", table_name, ["expires_at"])
        op.execute(
            sa.text(
                f"UPDATE {table_name} SET workflow_status = 'published' "
                "WHERE is_public IS TRUE AND is_published IS TRUE "
                "AND archived_at IS NULL "
                "AND (valid_from IS NULL OR valid_from <= CURRENT_TIMESTAMP) "
                "AND (valid_to IS NULL OR valid_to >= CURRENT_TIMESTAMP)"
            )
        )
        op.execute(
            sa.text(
                f"UPDATE {table_name} SET workflow_status = 'draft' "
                "WHERE workflow_status IS NULL"
            )
        )
    for table_name, column_names in PAGE_CMS_TABLE_COLUMNS.items():
        for column_name in column_names:
            op.add_column(table_name, _page_cms_column(column_name))
        op.create_index(f"ix_{table_name}_workflow_status", table_name, ["workflow_status"])
        op.create_index(f"ix_{table_name}_owner_portal", table_name, ["owner_portal"])
        op.create_index(f"ix_{table_name}_owner_scope", table_name, ["owner_scope_type", "owner_scope_id"])
        op.create_index(f"ix_{table_name}_scheduled_publish_at", table_name, ["scheduled_publish_at"])
        op.create_index(f"ix_{table_name}_expires_at", table_name, ["expires_at"])
        op.execute(
            sa.text(
                f"UPDATE {table_name} SET workflow_status = 'published' "
                "WHERE status = 'published' "
                "AND (valid_from IS NULL OR valid_from <= CURRENT_TIMESTAMP) "
                "AND (valid_to IS NULL OR valid_to >= CURRENT_TIMESTAMP)"
            )
        )


def downgrade() -> None:
    for table_name, column_names in reversed(tuple(PAGE_CMS_TABLE_COLUMNS.items())):
        for index_name in ("expires_at", "scheduled_publish_at", "owner_scope", "owner_portal", "workflow_status"):
            op.drop_index(f"ix_{table_name}_{index_name}", table_name=table_name)
        for column_name in reversed(column_names):
            op.drop_column(table_name, column_name)
    for table_name in reversed(PUBLISHABLE_TABLES):
        for index_name in ("expires_at", "scheduled_publish_at", "owner_scope", "owner_portal", "workflow_status"):
            op.drop_index(f"ix_{table_name}_{index_name}", table_name=table_name)
        for column in reversed(_columns()):
            op.drop_column(table_name, column.name)
