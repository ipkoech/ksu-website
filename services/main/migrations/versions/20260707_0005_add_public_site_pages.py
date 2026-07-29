"""add public site page snapshots

Revision ID: 20260707_0005
Revises: 20260630_0004
Create Date: 2026-07-07 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260707_0005"
down_revision = "20260630_0004"
branch_labels = None
depends_on = None


def _tables() -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return set(inspector.get_table_names())


def upgrade() -> None:
    if "public_site_pages" in _tables():
        return

    op.create_table(
        "public_site_pages",
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("path", sa.String(length=512), nullable=False),
        sa.Column("page_type", sa.String(length=64), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("plain_text", sa.Text(), nullable=True),
        sa.Column("headings", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("links", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("images", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("source_url", sa.String(length=1024), nullable=False),
        sa.Column("source_hash", sa.String(length=64), nullable=False),
        sa.Column("is_public", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("status", sa.String(length=32), server_default="published", nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
        sa.UniqueConstraint("source_url"),
    )
    op.create_index("ix_public_site_pages_slug", "public_site_pages", ["slug"], unique=False)
    op.create_index("ix_public_site_pages_path", "public_site_pages", ["path"], unique=False)
    op.create_index("ix_public_site_pages_page_type", "public_site_pages", ["page_type"], unique=False)
    op.create_index("ix_public_site_pages_source_url", "public_site_pages", ["source_url"], unique=False)
    op.create_index("ix_public_site_pages_source_hash", "public_site_pages", ["source_hash"], unique=False)
    op.create_index("ix_public_site_pages_is_public", "public_site_pages", ["is_public"], unique=False)
    op.create_index("ix_public_site_pages_status", "public_site_pages", ["status"], unique=False)
    op.create_index(
        "ix_public_site_pages_type_public",
        "public_site_pages",
        ["page_type", "is_public", "status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_public_site_pages_type_public", table_name="public_site_pages")
    op.drop_index("ix_public_site_pages_status", table_name="public_site_pages")
    op.drop_index("ix_public_site_pages_is_public", table_name="public_site_pages")
    op.drop_index("ix_public_site_pages_source_hash", table_name="public_site_pages")
    op.drop_index("ix_public_site_pages_source_url", table_name="public_site_pages")
    op.drop_index("ix_public_site_pages_page_type", table_name="public_site_pages")
    op.drop_index("ix_public_site_pages_path", table_name="public_site_pages")
    op.drop_index("ix_public_site_pages_slug", table_name="public_site_pages")
    op.drop_table("public_site_pages")
