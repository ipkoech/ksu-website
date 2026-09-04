"""Add responsive image focal points to HERI media assets."""

from alembic import op
import sqlalchemy as sa

revision = "0009_media_focal_points"
down_revision = "0008_design_content_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("media_assets", sa.Column("focal_x", sa.Float(), nullable=True), schema="heri")
    op.add_column("media_assets", sa.Column("focal_y", sa.Float(), nullable=True), schema="heri")
    op.create_check_constraint("ck_heri_media_focal_x", "media_assets", "focal_x IS NULL OR (focal_x >= 0 AND focal_x <= 1)", schema="heri")
    op.create_check_constraint("ck_heri_media_focal_y", "media_assets", "focal_y IS NULL OR (focal_y >= 0 AND focal_y <= 1)", schema="heri")


def downgrade() -> None:
    op.drop_constraint("ck_heri_media_focal_y", "media_assets", schema="heri")
    op.drop_constraint("ck_heri_media_focal_x", "media_assets", schema="heri")
    op.drop_column("media_assets", "focal_y", schema="heri")
    op.drop_column("media_assets", "focal_x", schema="heri")
