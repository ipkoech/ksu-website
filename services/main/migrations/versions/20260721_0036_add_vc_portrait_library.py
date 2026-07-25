"""Add the managed Vice Chancellor portrait library.

Revision ID: 20260721_0036
Revises: 20260721_0035
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260721_0036"
down_revision = "20260721_0035"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "vc_portraits",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("hub_id", sa.UUID(), nullable=False),
        sa.Column("media_id", sa.UUID(), nullable=False),
        sa.Column("alt_text", sa.String(length=255), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.ForeignKeyConstraint(["hub_id"], ["vc_hubs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["media_id"], ["media.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_vc_portraits_hub_id"), "vc_portraits", ["hub_id"])
    op.create_index(op.f("ix_vc_portraits_media_id"), "vc_portraits", ["media_id"])
    op.create_index("ix_vc_portraits_hub_order", "vc_portraits", ["hub_id", "display_order"])
    op.create_index(
        "uq_vc_portraits_hub_media_active",
        "vc_portraits",
        ["hub_id", "media_id"],
        unique=True,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )
    op.execute(
        "INSERT INTO vc_portraits (id, hub_id, media_id, display_order) "
        "SELECT id, id, hero_media_id, 0 FROM vc_hubs "
        "WHERE deleted_at IS NULL AND hero_media_id IS NOT NULL"
    )


def downgrade() -> None:
    op.drop_index("uq_vc_portraits_hub_media_active", table_name="vc_portraits")
    op.drop_index("ix_vc_portraits_hub_order", table_name="vc_portraits")
    op.drop_index(op.f("ix_vc_portraits_media_id"), table_name="vc_portraits")
    op.drop_index(op.f("ix_vc_portraits_hub_id"), table_name="vc_portraits")
    op.drop_table("vc_portraits")
