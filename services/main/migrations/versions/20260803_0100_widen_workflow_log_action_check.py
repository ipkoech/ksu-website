"""Widen content_workflow_logs action CHECK to include withdraw/review_edit."""
from __future__ import annotations

from alembic import op

revision = "20260803_0100"
down_revision = "20260728_0038"
branch_labels = None
depends_on = None

NEW_ACTIONS = (
    "submit", "start_review", "request_changes", "approve", "schedule",
    "publish", "unpublish", "reject", "archive", "edit_reset",
    "withdraw", "review_edit",
)
OLD_ACTIONS = NEW_ACTIONS[:10]


def _check(actions: tuple[str, ...]) -> str:
    return "action IN ({})".format(", ".join(f"'{a}'" for a in actions))


def upgrade() -> None:
    op.drop_constraint("ck_content_workflow_logs_action", "content_workflow_logs", type_="check")
    op.create_check_constraint(
        "ck_content_workflow_logs_action", "content_workflow_logs", _check(NEW_ACTIONS)
    )


def downgrade() -> None:
    op.execute(
        "DELETE FROM content_workflow_logs WHERE action IN ('withdraw', 'review_edit')"
    )
    op.drop_constraint("ck_content_workflow_logs_action", "content_workflow_logs", type_="check")
    op.create_check_constraint(
        "ck_content_workflow_logs_action", "content_workflow_logs", _check(OLD_ACTIONS)
    )
