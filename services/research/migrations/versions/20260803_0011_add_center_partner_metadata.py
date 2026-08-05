"""Add metadata to center-partner links."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260803_0011"
down_revision = "20260717_0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    for column in (
        sa.Column("partnership_type", sa.String(64), nullable=True),
        sa.Column("partnership_level", sa.String(32), nullable=True),
        sa.Column("mou_start_date", sa.Date, nullable=True),
        sa.Column("mou_end_date", sa.Date, nullable=True),
        sa.Column("status", sa.String(32), server_default="active", nullable=False),
        sa.Column("collaboration_areas", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
    ):
        op.add_column("center_partners", column, schema="research")


def downgrade() -> None:
    for name in ("notes", "collaboration_areas", "status", "mou_end_date", "mou_start_date", "partnership_level", "partnership_type"):
        op.drop_column("center_partners", name, schema="research")
