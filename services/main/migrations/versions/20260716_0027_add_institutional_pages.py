"""add reusable institutional page content

Revision ID: 20260716_0027
Revises: 20260715_0026
Create Date: 2026-07-16 10:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260716_0027"
down_revision = "20260715_0026"
branch_labels = None
depends_on = None


def _workflow_columns():
    return (
        sa.Column("status", sa.String(32), server_default="draft", nullable=False),
        sa.Column("workflow_status", sa.String(32), server_default="draft", nullable=False),
        sa.Column("owner_portal", sa.String(64), nullable=True),
        sa.Column("owner_scope_type", sa.String(32), nullable=True),
        sa.Column("owner_scope_id", sa.UUID(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_id", sa.UUID(), nullable=True),
        sa.Column("updated_by_id", sa.UUID(), nullable=True),
        sa.Column("submitted_by_id", sa.UUID(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_by_id", sa.UUID(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_by_id", sa.UUID(), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_by_id", sa.UUID(), nullable=True),
        sa.Column("unpublished_by_id", sa.UUID(), nullable=True),
        sa.Column("unpublished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("revision_notes", sa.Text(), nullable=True),
        sa.Column("scheduled_publish_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_enabled", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )


def _workflow_foreign_keys(table: str):
    for field in (
        "created_by_id", "updated_by_id", "submitted_by_id", "reviewed_by_id",
        "approved_by_id", "published_by_id", "unpublished_by_id",
    ):
        op.create_foreign_key(f"fk_{table}_{field}_users", table, "users", [field], ["id"], ondelete="SET NULL")


def upgrade():
    op.create_table(
        "institutional_pages",
        sa.Column("university_info_id", sa.UUID(), nullable=False),
        sa.Column("page_type", sa.String(32), nullable=False),
        sa.Column("slug", sa.String(128), nullable=False),
        sa.Column("eyebrow", sa.String(255), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("introduction", sa.Text(), nullable=False),
        sa.Column("hero_media_id", sa.UUID(), nullable=True),
        sa.Column("mobile_hero_media_id", sa.UUID(), nullable=True),
        sa.Column("hero_alt_text", sa.String(255), nullable=True),
        sa.Column("primary_document_id", sa.UUID(), nullable=True),
        sa.Column("reporting_period_label", sa.String(128), nullable=True),
        sa.Column("effective_date", sa.Date(), nullable=True),
        sa.Column("review_date", sa.Date(), nullable=True),
        sa.Column("seo_title", sa.String(255), nullable=True),
        sa.Column("seo_description", sa.String(512), nullable=True),
        *_workflow_columns(),
        sa.CheckConstraint("page_type IN ('about', 'service_charter', 'strategic_plan')", name="ck_institutional_pages_type"),
        sa.CheckConstraint("workflow_status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived')", name="ck_institutional_pages_workflow_status"),
        sa.ForeignKeyConstraint(["university_info_id"], ["university_info.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["hero_media_id"], ["media.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["mobile_hero_media_id"], ["media.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["primary_document_id"], ["documents.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_institutional_pages_slug"),
    )
    _workflow_foreign_keys("institutional_pages")
    op.create_index("ix_institutional_pages_status", "institutional_pages", ["status"])
    op.create_index("ix_institutional_pages_workflow_status", "institutional_pages", ["workflow_status"])
    op.create_index("ix_institutional_pages_published_at", "institutional_pages", ["published_at"])
    op.create_index("ix_institutional_pages_owner_portal", "institutional_pages", ["owner_portal"])
    op.create_index("ix_institutional_pages_owner_scope_type", "institutional_pages", ["owner_scope_type"])
    op.create_index("ix_institutional_pages_owner_scope_id", "institutional_pages", ["owner_scope_id"])
    op.create_index("ix_institutional_pages_scheduled_publish_at", "institutional_pages", ["scheduled_publish_at"])
    op.create_index("ix_institutional_pages_expires_at", "institutional_pages", ["expires_at"])

    op.create_table(
        "institutional_page_sections",
        sa.Column("institutional_page_id", sa.UUID(), nullable=False),
        sa.Column("slug", sa.String(128), nullable=False),
        sa.Column("section_type", sa.String(32), nullable=False),
        sa.Column("eyebrow", sa.String(255), nullable=True),
        sa.Column("heading", sa.String(255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("layout_variant", sa.String(32), server_default="default", nullable=False),
        sa.Column("theme", sa.String(32), server_default="light", nullable=False),
        sa.Column("primary_media_id", sa.UUID(), nullable=True),
        sa.Column("media_alt_text", sa.String(255), nullable=True),
        sa.Column("video_url", sa.String(1024), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        *_workflow_columns(),
        sa.CheckConstraint("section_type IN ('narrative', 'commitments', 'process', 'priorities', 'outcomes', 'quote', 'document_collection', 'related_links', 'governance_links', 'institutional_profile')", name="ck_institutional_sections_type"),
        sa.CheckConstraint("theme IN ('light', 'ivory', 'blue', 'green')", name="ck_institutional_sections_theme"),
        sa.CheckConstraint("workflow_status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived')", name="ck_institutional_sections_workflow_status"),
        sa.ForeignKeyConstraint(["institutional_page_id"], ["institutional_pages.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["primary_media_id"], ["media.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("institutional_page_id", "slug", name="uq_institutional_sections_page_slug"),
    )
    _workflow_foreign_keys("institutional_page_sections")
    op.create_index("ix_institutional_sections_page_order", "institutional_page_sections", ["institutional_page_id", "display_order"])
    op.create_index("ix_institutional_page_sections_workflow_status", "institutional_page_sections", ["workflow_status"])
    op.create_index("ix_institutional_page_sections_owner_portal", "institutional_page_sections", ["owner_portal"])
    op.create_index("ix_institutional_page_sections_owner_scope_type", "institutional_page_sections", ["owner_scope_type"])
    op.create_index("ix_institutional_page_sections_owner_scope_id", "institutional_page_sections", ["owner_scope_id"])
    op.create_index("ix_institutional_page_sections_scheduled_publish_at", "institutional_page_sections", ["scheduled_publish_at"])
    op.create_index("ix_institutional_page_sections_expires_at", "institutional_page_sections", ["expires_at"])
    op.create_index("ix_institutional_page_sections_status", "institutional_page_sections", ["status"])
    op.create_index("ix_institutional_page_sections_published_at", "institutional_page_sections", ["published_at"])

    op.create_table(
        "institutional_page_items",
        sa.Column("section_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("supporting_label", sa.String(128), nullable=True),
        sa.Column("supporting_value", sa.String(255), nullable=True),
        sa.Column("icon_key", sa.String(64), nullable=True),
        sa.Column("image_id", sa.UUID(), nullable=True),
        sa.Column("image_alt_text", sa.String(255), nullable=True),
        sa.Column("link_label", sa.String(255), nullable=True),
        sa.Column("link_url", sa.String(1024), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        *_workflow_columns(),
        sa.CheckConstraint("workflow_status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived')", name="ck_institutional_items_workflow_status"),
        sa.ForeignKeyConstraint(["section_id"], ["institutional_page_sections.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["image_id"], ["media.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    _workflow_foreign_keys("institutional_page_items")
    op.create_index("ix_institutional_items_section_order", "institutional_page_items", ["section_id", "display_order"])
    op.create_index("ix_institutional_page_items_workflow_status", "institutional_page_items", ["workflow_status"])
    op.create_index("ix_institutional_page_items_owner_portal", "institutional_page_items", ["owner_portal"])
    op.create_index("ix_institutional_page_items_owner_scope_type", "institutional_page_items", ["owner_scope_type"])
    op.create_index("ix_institutional_page_items_owner_scope_id", "institutional_page_items", ["owner_scope_id"])
    op.create_index("ix_institutional_page_items_scheduled_publish_at", "institutional_page_items", ["scheduled_publish_at"])
    op.create_index("ix_institutional_page_items_expires_at", "institutional_page_items", ["expires_at"])
    op.create_index("ix_institutional_page_items_status", "institutional_page_items", ["status"])
    op.create_index("ix_institutional_page_items_published_at", "institutional_page_items", ["published_at"])

    op.create_table(
        "institutional_section_documents",
        sa.Column("section_id", sa.UUID(), nullable=False),
        sa.Column("document_id", sa.UUID(), nullable=False),
        sa.Column("public_label", sa.String(255), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.Column("is_featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["section_id"], ["institutional_page_sections.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("section_id", "document_id", name="uq_institutional_section_document"),
    )
    op.create_index("ix_institutional_section_documents_order", "institutional_section_documents", ["section_id", "display_order"])


def downgrade():
    op.drop_table("institutional_section_documents")
    op.drop_table("institutional_page_items")
    op.drop_table("institutional_page_sections")
    op.drop_table("institutional_pages")
