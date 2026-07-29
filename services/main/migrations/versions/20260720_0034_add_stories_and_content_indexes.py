"""Add public stories and contributor account requests.

Revision ID: 20260720_0034
Revises: 20260718_0033
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260720_0034"
down_revision = "20260718_0033"
branch_labels = None
depends_on = None


def _base_columns() -> list[sa.Column]:
    return [
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    ]


def _seo_columns() -> list[sa.Column]:
    return [
        sa.Column("meta_title", sa.String(length=255), nullable=True),
        sa.Column("meta_description", sa.String(length=500), nullable=True),
        sa.Column("keywords", sa.JSON(), nullable=True),
    ]


def _workflow_columns() -> list[sa.Column]:
    return [
        sa.Column("workflow_status", sa.String(length=32), server_default="draft", nullable=False),
        sa.Column("owner_portal", sa.String(length=64), nullable=True),
        sa.Column("owner_scope_type", sa.String(length=32), nullable=True),
        sa.Column("owner_scope_id", sa.UUID(), nullable=True),
        sa.Column("submitted_by_id", sa.UUID(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_by_id", sa.UUID(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_by_id", sa.UUID(), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_by_id", sa.UUID(), nullable=True),
        sa.Column("scheduled_publish_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("unpublished_by_id", sa.UUID(), nullable=True),
        sa.Column("unpublished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("revision_notes", sa.Text(), nullable=True),
    ]


def _scoped_columns() -> list[sa.Column]:
    return [
        *_workflow_columns(),
        sa.Column("scope_type", sa.String(length=32), nullable=True),
        sa.Column("scope_id", sa.UUID(), nullable=True),
        sa.Column("is_main", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("is_public", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("is_published", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("valid_from", sa.DateTime(timezone=True), nullable=True),
        sa.Column("valid_to", sa.DateTime(timezone=True), nullable=True),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=32), server_default="draft", nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
    ]


def _rich_columns() -> list[sa.Column]:
    return [
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("plain_text", sa.Text(), nullable=True),
        sa.Column("rich_text", sa.Text(), nullable=True),
        sa.Column("structured_content", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("related_links", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("featured_media_id", sa.UUID(), nullable=True),
        sa.Column("author_user_id", sa.UUID(), nullable=True),
    ]


def upgrade() -> None:
    op.drop_constraint("ck_page_sections_layout_variant", "page_sections", type_="check")
    op.create_check_constraint(
        "ck_page_sections_layout_variant",
        "page_sections",
        "layout_variant IN "
        "('hero_admissions', 'pulse_strip', 'featured_partnership', 'programme_finder', "
        "'featured_stories', 'date_timeline', 'pillar_grid', 'media_mosaic', 'leadership_activity', "
        "'research_cards', 'news_grid', 'events_list', 'logo_carousel', 'alumni_story', 'facts_strip')",
    )

    op.create_table(
        "stories",
        *_base_columns(),
        *_seo_columns(),
        *_scoped_columns(),
        *_rich_columns(),
        sa.Column("story_type", sa.String(length=64), server_default="article", nullable=False),
        sa.Column("category", sa.String(length=96), nullable=True),
        sa.Column("source_type", sa.String(length=64), server_default="external", nullable=False),
        sa.Column("contributor_user_id", sa.UUID(), nullable=True),
        sa.Column("contributor_name_snapshot", sa.String(length=255), nullable=True),
        sa.Column("contributor_email_snapshot", sa.String(length=320), nullable=True),
        sa.Column("contributor_affiliation_snapshot", sa.String(length=255), nullable=True),
        sa.Column("show_contributor_name", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("consent_to_publish", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("is_featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("featured_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("homepage_priority", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.Column("reading_minutes", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["approved_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["author_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["contributor_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["featured_media_id"], ["media.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["published_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["submitted_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["unpublished_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    for column in (
        "workflow_status", "owner_portal", "owner_scope_type", "owner_scope_id", "scheduled_publish_at",
        "expires_at", "scope_type", "scope_id", "is_main", "is_public", "is_published", "published_at",
        "valid_from", "valid_to", "archived_at", "status", "slug", "featured_media_id", "author_user_id",
        "story_type", "category", "source_type", "contributor_user_id", "is_featured", "featured_until",
    ):
        op.create_index(op.f(f"ix_stories_{column}"), "stories", [column])
    op.create_index("ix_stories_public_listing", "stories", ["is_public", "is_published", "workflow_status", "published_at"])
    op.create_index("ix_stories_workflow_queue", "stories", ["workflow_status", "submitted_at"])
    op.create_index("ix_stories_owner_workflow_queue", "stories", ["owner_portal", "workflow_status", "submitted_at"])
    op.create_index("ix_stories_contributor_dashboard", "stories", ["contributor_user_id", "workflow_status", "updated_at"])
    op.create_index("ix_stories_featured_homepage", "stories", ["is_featured", "featured_until", "homepage_priority", "published_at"])
    op.create_index("ix_stories_type_published", "stories", ["story_type", "published_at"])
    op.create_index("ix_stories_category_published", "stories", ["category", "published_at"])

    op.create_table(
        "story_contributor_account_requests",
        *_base_columns(),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column("affiliation", sa.String(length=255), nullable=True),
        sa.Column("contributor_type", sa.String(length=64), server_default="external", nullable=False),
        sa.Column("reason_for_request", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=32), server_default="pending", nullable=False),
        sa.Column("reviewed_by_id", sa.UUID(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_user_id", sa.UUID(), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("verification_token", sa.String(length=255), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ip_address", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.ForeignKeyConstraint(["approved_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    for column in ("email", "contributor_type", "status", "reviewed_by_id", "approved_user_id", "verification_token"):
        op.create_index(op.f(f"ix_story_contributor_account_requests_{column}"), "story_contributor_account_requests", [column])
    op.create_index("ix_story_contributor_requests_status_created", "story_contributor_account_requests", ["status", "created_at"])
    op.create_index("ix_story_contributor_requests_email_status", "story_contributor_account_requests", ["email", "status"])
    op.create_index("ix_story_contributor_requests_reviewed", "story_contributor_account_requests", ["reviewed_by_id", "reviewed_at"])

    for table in ("news", "blogs", "announcements", "events"):
        op.create_index(f"ix_{table}_public_listing_workflow", table, ["is_public", "is_published", "workflow_status", "published_at"])
        op.create_index(f"ix_{table}_workflow_queue", table, ["workflow_status", "submitted_at"])
        op.create_index(f"ix_{table}_owner_workflow_queue", table, ["owner_portal", "workflow_status", "submitted_at"])
        op.create_index(f"ix_{table}_schedule_expiry", table, ["scheduled_publish_at", "expires_at"])
    op.create_index("ix_events_upcoming_public", "events", ["start_date", "is_public", "is_published", "workflow_status"])
    op.create_index("ix_page_sections_homepage_render", "page_sections", ["page_key", "scope_type", "is_enabled", "status", "display_order"])


def downgrade() -> None:
    op.drop_constraint("ck_page_sections_layout_variant", "page_sections", type_="check")
    op.create_check_constraint(
        "ck_page_sections_layout_variant",
        "page_sections",
        "layout_variant IN "
        "('hero_admissions', 'pulse_strip', 'featured_partnership', 'programme_finder', "
        "'date_timeline', 'pillar_grid', 'media_mosaic', 'leadership_activity', "
        "'research_cards', 'news_grid', 'events_list', 'logo_carousel', 'alumni_story', 'facts_strip')",
    )

    op.drop_index("ix_page_sections_homepage_render", table_name="page_sections")
    op.drop_index("ix_events_upcoming_public", table_name="events")
    for table in ("events", "announcements", "blogs", "news"):
        op.drop_index(f"ix_{table}_schedule_expiry", table_name=table)
        op.drop_index(f"ix_{table}_owner_workflow_queue", table_name=table)
        op.drop_index(f"ix_{table}_workflow_queue", table_name=table)
        op.drop_index(f"ix_{table}_public_listing_workflow", table_name=table)

    op.drop_index("ix_story_contributor_requests_reviewed", table_name="story_contributor_account_requests")
    op.drop_index("ix_story_contributor_requests_email_status", table_name="story_contributor_account_requests")
    op.drop_index("ix_story_contributor_requests_status_created", table_name="story_contributor_account_requests")
    for column in ("verification_token", "approved_user_id", "reviewed_by_id", "status", "contributor_type", "email"):
        op.drop_index(op.f(f"ix_story_contributor_account_requests_{column}"), table_name="story_contributor_account_requests")
    op.drop_table("story_contributor_account_requests")

    for index_name in (
        "ix_stories_category_published",
        "ix_stories_type_published",
        "ix_stories_featured_homepage",
        "ix_stories_contributor_dashboard",
        "ix_stories_owner_workflow_queue",
        "ix_stories_workflow_queue",
        "ix_stories_public_listing",
    ):
        op.drop_index(index_name, table_name="stories")
    for column in (
        "featured_until", "is_featured", "contributor_user_id", "source_type", "category", "story_type",
        "author_user_id", "featured_media_id", "slug", "status", "archived_at", "valid_to", "valid_from",
        "published_at", "is_published", "is_public", "is_main", "scope_id", "scope_type", "expires_at",
        "scheduled_publish_at", "owner_scope_id", "owner_scope_type", "owner_portal", "workflow_status",
    ):
        op.drop_index(op.f(f"ix_stories_{column}"), table_name="stories")
    op.drop_table("stories")
