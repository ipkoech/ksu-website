"""Add updated_by_id attribution to comms-managed record tables."""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "20260803_0300"
down_revision = "20260803_0200"
branch_labels = None
depends_on = None

TABLES = (
    "news",
    "blogs",
    "stories",
    "announcements",
    "events",
    "sliders",
    "documents",
    "faqs",
    "contact_directory",
    "newsletters",
    "testimonials",
)


def upgrade() -> None:
    for table in TABLES:
        op.add_column(table, sa.Column("updated_by_id", sa.Uuid(), nullable=True))
        op.create_foreign_key(
            f"fk_{table}_updated_by_id_users",
            table,
            "users",
            ["updated_by_id"],
            ["id"],
            ondelete="SET NULL",
        )
        op.create_index(f"ix_{table}_updated_by_id", table, ["updated_by_id"])


def downgrade() -> None:
    for table in reversed(TABLES):
        op.drop_index(f"ix_{table}_updated_by_id", table_name=table)
        op.drop_constraint(f"fk_{table}_updated_by_id_users", table, type_="foreignkey")
        op.drop_column(table, "updated_by_id")
