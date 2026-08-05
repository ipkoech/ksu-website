"""add youtube_url to announcements

Revision ID: 350b401d06a9
Revises: 20260525_0002
Create Date: 2026-06-25 16:09:13.246967
"""

from alembic import op
import sqlalchemy as sa

revision = "350b401d06a9"
down_revision = "99536bbf9625"
branch_labels = None
depends_on = None


def _columns(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    if "youtube_url" in _columns("announcements"):
        return
    op.add_column(
        "announcements",
        sa.Column("youtube_url", sa.String(512), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("announcements", "youtube_url")
