"""add workflow actor foreign keys

Revision ID: 20260712_0020
Revises: 20260712_0019
Create Date: 2026-07-12 16:00:00.000000
"""

from __future__ import annotations

from alembic import op


revision = "20260712_0020"
down_revision = "20260712_0019"
branch_labels = None
depends_on = None


WORKFLOW_ACTOR_COLUMNS = {
    "news": (
        "submitted_by_id", "reviewed_by_id", "approved_by_id",
        "published_by_id", "unpublished_by_id",
    ),
    "blogs": (
        "submitted_by_id", "reviewed_by_id", "approved_by_id",
        "published_by_id", "unpublished_by_id",
    ),
    "announcements": (
        "submitted_by_id", "reviewed_by_id", "approved_by_id",
        "published_by_id", "unpublished_by_id",
    ),
    "events": (
        "submitted_by_id", "reviewed_by_id", "approved_by_id",
        "published_by_id", "unpublished_by_id",
    ),
    "sliders": (
        "submitted_by_id", "reviewed_by_id", "approved_by_id",
        "published_by_id", "unpublished_by_id",
    ),
    "page_sections": (
        "submitted_by_id", "reviewed_by_id", "unpublished_by_id",
    ),
    "partnership_spotlights": (
        "submitted_by_id", "reviewed_by_id", "approved_by_id",
        "published_by_id", "unpublished_by_id",
    ),
}


def _constraint_name(table_name: str, column_name: str) -> str:
    return f"fk_{table_name}_{column_name}_users"


def upgrade() -> None:
    for table_name, column_names in WORKFLOW_ACTOR_COLUMNS.items():
        for column_name in column_names:
            op.create_foreign_key(
                _constraint_name(table_name, column_name),
                table_name,
                "users",
                [column_name],
                ["id"],
                ondelete="SET NULL",
            )

    op.drop_constraint(
        "ck_content_workflow_logs_action",
        "content_workflow_logs",
        type_="check",
    )
    op.create_check_constraint(
        "ck_content_workflow_logs_action",
        "content_workflow_logs",
        "action IN ('submit', 'start_review', 'request_changes', 'approve', "
        "'schedule', 'publish', 'unpublish', 'reject', 'archive', 'edit_reset')",
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_content_workflow_logs_action",
        "content_workflow_logs",
        type_="check",
    )
    op.create_check_constraint(
        "ck_content_workflow_logs_action",
        "content_workflow_logs",
        "action IN ('submit', 'start_review', 'request_changes', 'approve', "
        "'schedule', 'publish', 'unpublish', 'reject', 'archive')",
    )

    for table_name, column_names in reversed(tuple(WORKFLOW_ACTOR_COLUMNS.items())):
        for column_name in reversed(column_names):
            op.drop_constraint(
                _constraint_name(table_name, column_name),
                table_name,
                type_="foreignkey",
            )
