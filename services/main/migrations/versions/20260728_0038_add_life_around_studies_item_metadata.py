"""Add structured Life Around Studies metadata to CMS section items."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260728_0038"
down_revision = "20260721_0037"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "section_items",
        sa.Column("audience", sa.String(length=32), nullable=False, server_default="all"),
    )
    op.add_column("section_items", sa.Column("source_type", sa.String(length=32), nullable=True))
    op.add_column("section_items", sa.Column("source_id", sa.Uuid(), nullable=True))
    op.add_column(
        "section_items",
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column("section_items", sa.Column("poster_media_id", sa.Uuid(), nullable=True))
    op.add_column("section_items", sa.Column("transcript", sa.Text(), nullable=True))
    op.create_foreign_key(
        "fk_section_items_poster_media_id",
        "section_items",
        "media",
        ["poster_media_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_check_constraint(
        "ck_section_items_audience",
        "section_items",
        "audience IN ('all', 'prospective', 'current_student', 'visitor_partner')",
    )
    op.create_check_constraint(
        "ck_section_items_source_type",
        "section_items",
        "source_type IS NULL OR source_type IN ('manual', 'club', 'club_activity', 'sport', 'accommodation', 'arts', 'governance', 'story', 'event')",
    )
    op.create_index("ix_section_items_source", "section_items", ["source_type", "source_id"])
    op.create_index(
        "ix_section_items_featured_audience",
        "section_items",
        ["is_featured", "audience", "is_enabled"],
    )


def downgrade() -> None:
    op.drop_index("ix_section_items_featured_audience", table_name="section_items")
    op.drop_index("ix_section_items_source", table_name="section_items")
    op.drop_constraint("ck_section_items_source_type", "section_items", type_="check")
    op.drop_constraint("ck_section_items_audience", "section_items", type_="check")
    op.drop_constraint("fk_section_items_poster_media_id", "section_items", type_="foreignkey")
    op.drop_column("section_items", "transcript")
    op.drop_column("section_items", "poster_media_id")
    op.drop_column("section_items", "is_featured")
    op.drop_column("section_items", "source_id")
    op.drop_column("section_items", "source_type")
    op.drop_column("section_items", "audience")
