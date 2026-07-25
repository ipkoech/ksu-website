"""add About KSU and institutional facts content

Revision ID: 20260714_0024
Revises: 20260713_0023
Create Date: 2026-07-14 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260714_0024"
down_revision = "20260713_0023"
branch_labels = None
depends_on = None


def _base_columns():
    return (
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )


def _workflow_columns():
    return (
        sa.Column("status", sa.String(32), server_default="draft", nullable=False),
        sa.Column("workflow_status", sa.String(32), server_default="draft", nullable=False),
        sa.Column("is_enabled", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("owner_portal", sa.String(64), nullable=True),
        sa.Column("owner_scope_type", sa.String(32), nullable=True),
        sa.Column("owner_scope_id", sa.UUID(), nullable=True),
        sa.Column("scheduled_publish_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("unpublished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("revision_notes", sa.Text(), nullable=True),
        *(sa.Column(name, sa.UUID(), nullable=True) for name in (
            "created_by_id", "updated_by_id", "submitted_by_id", "reviewed_by_id",
            "approved_by_id", "published_by_id", "unpublished_by_id",
        )),
    )


def _actor_constraints():
    return tuple(sa.ForeignKeyConstraint([name], ["users.id"], ondelete="SET NULL") for name in (
        "created_by_id", "updated_by_id", "submitted_by_id", "reviewed_by_id",
        "approved_by_id", "published_by_id", "unpublished_by_id",
    ))


def upgrade():
    op.add_column("university_info", sa.Column("philosophy", sa.Text(), nullable=True))
    op.add_column("university_info", sa.Column("strategic_plan_summary", sa.Text(), nullable=True))
    op.execute(sa.text("UPDATE university_info SET philosophy = strategic_priorities ->> 'philosophy' WHERE philosophy IS NULL AND strategic_priorities IS NOT NULL"))

    op.create_table(
        "about_page_content", *_base_columns(), *_workflow_columns(),
        sa.Column("university_info_id", sa.UUID(), nullable=False),
        sa.Column("hero_eyebrow", sa.String(255)), sa.Column("hero_headline", sa.String(255)),
        sa.Column("hero_introduction", sa.Text()), sa.Column("identity_heading", sa.String(255)),
        sa.Column("identity_narrative", sa.Text()), sa.Column("mandate_introduction", sa.Text()),
        sa.Column("video_title", sa.String(255)), sa.Column("video_url", sa.String(1024)),
        sa.Column("video_transcript_url", sa.String(1024)),
        *(sa.Column(name, sa.UUID(), nullable=True) for name in ("hero_media_id", "identity_media_id", "video_poster_media_id", "old_campus_media_id", "modern_campus_media_id")),
        sa.Column("history_document_id", sa.UUID()), sa.Column("section_settings", postgresql.JSONB()),
        sa.ForeignKeyConstraint(["university_info_id"], ["university_info.id"], ondelete="CASCADE"),
        *(sa.ForeignKeyConstraint([name], ["media.id"], ondelete="SET NULL") for name in ("hero_media_id", "identity_media_id", "video_poster_media_id", "old_campus_media_id", "modern_campus_media_id")),
        sa.ForeignKeyConstraint(["history_document_id"], ["documents.id"], ondelete="SET NULL"),
        *_actor_constraints(), sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("workflow_status IN ('draft','in_review','changes_requested','approved','published','archived')", name="ck_about_page_content_workflow_status"),
    )
    op.create_index("uq_about_page_content_university_active", "about_page_content", ["university_info_id"], unique=True, postgresql_where=sa.text("deleted_at IS NULL"))

    op.create_table(
        "history_milestones", *_base_columns(), *_workflow_columns(),
        sa.Column("about_page_content_id", sa.UUID(), nullable=False), sa.Column("slug", sa.String(128), nullable=False),
        sa.Column("year_label", sa.String(32), nullable=False), sa.Column("event_date", sa.Date()),
        sa.Column("title", sa.String(255), nullable=False), sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("expanded_body", sa.Text()), sa.Column("image_id", sa.UUID()),
        sa.Column("image_alt_text", sa.String(255)), sa.Column("source_title", sa.String(255)),
        sa.Column("source_url", sa.String(1024)), sa.Column("source_document_id", sa.UUID()),
        sa.Column("display_order", sa.Integer(), server_default="100", nullable=False),
        sa.Column("is_featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("is_public", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.ForeignKeyConstraint(["about_page_content_id"], ["about_page_content.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["image_id"], ["media.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["source_document_id"], ["documents.id"], ondelete="SET NULL"),
        *_actor_constraints(), sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("about_page_content_id", "slug", name="uq_history_milestones_page_slug"),
        sa.CheckConstraint("workflow_status IN ('draft','in_review','changes_requested','approved','published','archived')", name="ck_history_milestones_workflow_status"),
    )

    op.create_table(
        "fact_editions", *_base_columns(), *_workflow_columns(),
        sa.Column("reporting_year", sa.Integer(), nullable=False), sa.Column("title", sa.String(255), nullable=False),
        sa.Column("introduction", sa.Text()), sa.Column("methodology_note", sa.Text()),
        sa.Column("verified_on", sa.Date()), sa.Column("source_document_id", sa.UUID()),
        sa.Column("is_current", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.ForeignKeyConstraint(["source_document_id"], ["documents.id"], ondelete="SET NULL"),
        *_actor_constraints(), sa.PrimaryKeyConstraint("id"), sa.UniqueConstraint("reporting_year"),
        sa.CheckConstraint("reporting_year >= 1965 AND reporting_year <= 2100", name="ck_fact_editions_reporting_year"),
        sa.CheckConstraint("workflow_status IN ('draft','in_review','changes_requested','approved','published','archived')", name="ck_fact_editions_workflow_status"),
    )
    op.create_index("uq_fact_editions_one_published_current", "fact_editions", ["is_current"], unique=True, postgresql_where=sa.text("is_current IS TRUE AND workflow_status = 'published' AND deleted_at IS NULL"))

    op.create_table(
        "fact_groups", *_base_columns(), *_workflow_columns(),
        sa.Column("fact_edition_id", sa.UUID()), sa.Column("slug", sa.String(128), nullable=False),
        sa.Column("heading", sa.String(255), nullable=False), sa.Column("summary", sa.Text()),
        sa.Column("image_id", sa.UUID()), sa.Column("image_alt_text", sa.String(255)),
        sa.Column("display_order", sa.Integer(), server_default="100", nullable=False),
        sa.ForeignKeyConstraint(["fact_edition_id"], ["fact_editions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["image_id"], ["media.id"], ondelete="SET NULL"),
        *_actor_constraints(), sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("fact_edition_id", "slug", name="uq_fact_groups_edition_slug"),
        sa.CheckConstraint("workflow_status IN ('draft','in_review','changes_requested','approved','published','archived')", name="ck_fact_groups_workflow_status"),
    )

    op.create_table(
        "fact_items", *_base_columns(), *_workflow_columns(),
        sa.Column("fact_group_id", sa.UUID(), nullable=False), sa.Column("fact_kind", sa.String(32), nullable=False),
        sa.Column("label", sa.String(255), nullable=False), sa.Column("display_value", sa.String(255), nullable=False),
        sa.Column("numeric_value", sa.Numeric(20, 4)), sa.Column("prefix", sa.String(32)),
        sa.Column("suffix", sa.String(32)), sa.Column("unit", sa.String(64)), sa.Column("explanation", sa.Text()),
        sa.Column("icon_key", sa.String(64)), sa.Column("link_url", sa.String(1024)), sa.Column("link_label", sa.String(255)),
        sa.Column("source_title", sa.String(255)), sa.Column("source_url", sa.String(1024)), sa.Column("verified_on", sa.Date()),
        sa.Column("display_order", sa.Integer(), server_default="100", nullable=False),
        sa.Column("is_featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.ForeignKeyConstraint(["fact_group_id"], ["fact_groups.id"], ondelete="CASCADE"),
        *_actor_constraints(), sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("fact_kind IN ('evergreen','annual')", name="ck_fact_items_kind"),
        sa.CheckConstraint("workflow_status IN ('draft','in_review','changes_requested','approved','published','archived')", name="ck_fact_items_workflow_status"),
    )
    op.create_index("ix_history_milestones_page_order", "history_milestones", ["about_page_content_id", "display_order"])
    op.create_index("ix_fact_groups_edition_order", "fact_groups", ["fact_edition_id", "display_order"])
    op.create_index("ix_fact_items_group_order", "fact_items", ["fact_group_id", "display_order"])


def downgrade():
    for table in ("fact_items", "fact_groups", "fact_editions", "history_milestones", "about_page_content"):
        op.drop_table(table)
    op.drop_column("university_info", "strategic_plan_summary")
    op.drop_column("university_info", "philosophy")
