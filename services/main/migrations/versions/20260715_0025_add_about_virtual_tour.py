"""add virtual tour media to About KSU content

Revision ID: 20260715_0025
Revises: 20260714_0024
Create Date: 2026-07-15 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260715_0025"
down_revision = "20260714_0024"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("about_page_content", sa.Column("virtual_tour_type", sa.String(32), nullable=True))
    op.add_column("about_page_content", sa.Column("virtual_tour_title", sa.String(255), nullable=True))
    op.add_column("about_page_content", sa.Column("virtual_tour_provider", sa.String(64), nullable=True))
    op.add_column("about_page_content", sa.Column("virtual_tour_url", sa.String(1024), nullable=True))
    op.add_column("about_page_content", sa.Column("virtual_tour_media_id", sa.UUID(), nullable=True))
    op.add_column("about_page_content", sa.Column("virtual_tour_poster_media_id", sa.UUID(), nullable=True))
    op.add_column("about_page_content", sa.Column("virtual_tour_accessibility_url", sa.String(1024), nullable=True))
    op.create_foreign_key(
        "fk_about_page_content_virtual_tour_media_id_media",
        "about_page_content",
        "media",
        ["virtual_tour_media_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_about_page_content_virtual_tour_poster_media_id_media",
        "about_page_content",
        "media",
        ["virtual_tour_poster_media_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_check_constraint(
        "ck_about_page_content_virtual_tour_type",
        "about_page_content",
        "virtual_tour_type IS NULL OR virtual_tour_type IN ('embed', 'video')",
    )


def downgrade():
    op.drop_constraint("ck_about_page_content_virtual_tour_type", "about_page_content", type_="check")
    op.drop_constraint(
        "fk_about_page_content_virtual_tour_poster_media_id_media",
        "about_page_content",
        type_="foreignkey",
    )
    op.drop_constraint(
        "fk_about_page_content_virtual_tour_media_id_media",
        "about_page_content",
        type_="foreignkey",
    )
    for column in (
        "virtual_tour_accessibility_url",
        "virtual_tour_poster_media_id",
        "virtual_tour_media_id",
        "virtual_tour_url",
        "virtual_tour_provider",
        "virtual_tour_title",
        "virtual_tour_type",
    ):
        op.drop_column("about_page_content", column)
