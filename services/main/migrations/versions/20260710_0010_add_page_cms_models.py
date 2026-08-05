"""add page CMS models

Revision ID: 20260710_0010
Revises: 20260708_0006
Create Date: 2026-07-10 00:10:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260710_0010"
down_revision = "20260708_0006"
branch_labels = None
depends_on = None


def _tables() -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return set(inspector.get_table_names())


def _indexes(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {index["name"] for index in inspector.get_indexes(table_name)}


def _create_index_if_missing(index_name: str, table_name: str, columns: list[str]) -> None:
    if index_name in _indexes(table_name):
        return
    op.create_index(index_name, table_name, columns, unique=False)


def upgrade() -> None:
    tables = _tables()

    if "page_sections" not in tables:
        op.create_table(
            "page_sections",
            sa.Column("page_key", sa.String(length=64), nullable=False),
            sa.Column("scope_type", sa.String(length=32), server_default="university", nullable=False),
            sa.Column("scope_id", sa.UUID(), nullable=True),
            sa.Column("section_key", sa.String(length=64), nullable=False),
            sa.Column("title", sa.String(length=255), nullable=True),
            sa.Column("layout_variant", sa.String(length=64), server_default="default", nullable=False),
            sa.Column("status", sa.String(length=32), server_default="draft", nullable=False),
            sa.Column("valid_from", sa.DateTime(timezone=True), nullable=True),
            sa.Column("valid_to", sa.DateTime(timezone=True), nullable=True),
            sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_by_id", sa.UUID(), nullable=True),
            sa.Column("updated_by_id", sa.UUID(), nullable=True),
            sa.Column("approved_by_id", sa.UUID(), nullable=True),
            sa.Column("published_by_id", sa.UUID(), nullable=True),
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
            sa.CheckConstraint(
                "scope_type IN ('university', 'school', 'research', 'library')",
                name="ck_page_sections_scope_type",
            ),
            sa.CheckConstraint(
                "status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived')",
                name="ck_page_sections_status",
            ),
            sa.CheckConstraint(
                "(valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)",
                name="ck_page_sections_valid_window",
            ),
            sa.CheckConstraint(
                "(scope_type != 'school') OR (scope_id IS NOT NULL)",
                name="ck_page_sections_school_scope_requires_id",
            ),
            sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["approved_by_id"], ["users.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["published_by_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "page_key",
                "scope_type",
                "scope_id",
                "section_key",
                name="uq_page_sections_scope_section",
            ),
        )

    if "section_items" not in tables:
        op.create_table(
            "section_items",
            sa.Column("page_section_id", sa.UUID(), nullable=False),
            sa.Column("item_type", sa.String(length=32), server_default="text", nullable=False),
            sa.Column("title", sa.String(length=255), nullable=True),
            sa.Column("subtitle", sa.String(length=255), nullable=True),
            sa.Column("body_text", sa.Text(), nullable=True),
            sa.Column("content", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            sa.Column("cta_label", sa.String(length=255), nullable=True),
            sa.Column("cta_url", sa.String(length=1024), nullable=True),
            sa.Column("cta_description", sa.String(length=255), nullable=True),
            sa.Column("media_caption", sa.Text(), nullable=True),
            sa.Column("media_alt_text", sa.String(length=255), nullable=True),
            sa.Column("video_provider", sa.String(length=64), nullable=True),
            sa.Column("video_url", sa.String(length=1024), nullable=True),
            sa.Column("video_duration_seconds", sa.Integer(), nullable=True),
            sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
            sa.Column("is_enabled", sa.Boolean(), server_default=sa.text("true"), nullable=False),
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
            sa.CheckConstraint(
                "item_type IN ('text', 'card', 'stat', 'cta', 'media', 'video')",
                name="ck_section_items_item_type",
            ),
            sa.ForeignKeyConstraint(["page_section_id"], ["page_sections.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )

    if "partnership_spotlights" not in tables:
        op.create_table(
            "partnership_spotlights",
            sa.Column("source_type", sa.String(length=64), server_default="research_partner", nullable=False),
            sa.Column("source_id", sa.UUID(), nullable=False),
            sa.Column("cta_source", sa.String(length=32), server_default="research_partner", nullable=False),
            sa.Column("cta_label", sa.String(length=255), nullable=True),
            sa.Column("cta_url", sa.String(length=1024), nullable=True),
            sa.Column("headline", sa.String(length=255), nullable=False),
            sa.Column("summary", sa.Text(), nullable=True),
            sa.Column("pillars", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            sa.Column("opportunities", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            sa.Column("status", sa.String(length=32), server_default="draft", nullable=False),
            sa.Column("valid_from", sa.DateTime(timezone=True), nullable=True),
            sa.Column("valid_to", sa.DateTime(timezone=True), nullable=True),
            sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
            sa.CheckConstraint(
                "source_type = 'research_partner'",
                name="ck_partnership_spotlights_source_type",
            ),
            sa.CheckConstraint(
                "cta_source IN ('research_partner', 'custom')",
                name="ck_partnership_spotlights_cta_source",
            ),
            sa.CheckConstraint(
                "status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived')",
                name="ck_partnership_spotlights_status",
            ),
            sa.CheckConstraint(
                "(valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)",
                name="ck_partnership_spotlights_valid_window",
            ),
            sa.PrimaryKeyConstraint("id"),
        )

    tables = _tables()
    if "page_sections" in tables:
        _create_index_if_missing("ix_page_sections_scope_page", "page_sections", ["scope_type", "scope_id", "page_key"])
        _create_index_if_missing("ix_page_sections_status_window", "page_sections", ["status", "valid_from", "valid_to"])
    if "section_items" in tables:
        _create_index_if_missing("ix_section_items_section_order", "section_items", ["page_section_id", "display_order"])
    if "partnership_spotlights" in tables:
        _create_index_if_missing(
            "ix_partnership_spotlights_source",
            "partnership_spotlights",
            ["source_type", "source_id"],
        )


def downgrade() -> None:
    op.drop_index("ix_partnership_spotlights_source", table_name="partnership_spotlights")
    op.drop_index("ix_section_items_section_order", table_name="section_items")
    op.drop_index("ix_page_sections_status_window", table_name="page_sections")
    op.drop_index("ix_page_sections_scope_page", table_name="page_sections")
    op.drop_table("partnership_spotlights")
    op.drop_table("section_items")
    op.drop_table("page_sections")
