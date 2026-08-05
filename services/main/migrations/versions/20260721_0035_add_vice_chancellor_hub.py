"""Add the Meet the Vice Chancellor content studio domain.

Revision ID: 20260721_0035
Revises: 20260720_0034
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260721_0035"
down_revision = "20260720_0034"
branch_labels = None
depends_on = None


def _base_columns() -> list[sa.Column]:
    return [
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
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


def _seo_columns() -> list[sa.Column]:
    return [
        sa.Column("meta_title", sa.String(length=255), nullable=True),
        sa.Column("meta_description", sa.String(length=500), nullable=True),
        sa.Column("keywords", sa.JSON(), nullable=True),
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


def _workflow_foreign_keys() -> list[sa.ForeignKeyConstraint]:
    return [
        sa.ForeignKeyConstraint(["submitted_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["approved_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["published_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["unpublished_by_id"], ["users.id"], ondelete="SET NULL"),
    ]


def _create_scoped_indexes(table: str) -> None:
    for column in (
        "workflow_status",
        "owner_portal",
        "owner_scope_type",
        "owner_scope_id",
        "scheduled_publish_at",
        "expires_at",
        "scope_type",
        "scope_id",
        "is_main",
        "is_public",
        "is_published",
        "published_at",
        "valid_from",
        "valid_to",
        "archived_at",
        "status",
    ):
        op.create_index(op.f(f"ix_{table}_{column}"), table, [column])


def upgrade() -> None:
    op.create_table(
        "vc_videos",
        *_base_columns(),
        *_scoped_columns(),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("transcript", sa.Text(), nullable=True),
        sa.Column("provider", sa.String(length=32), nullable=False),
        sa.Column("source_url", sa.String(length=1024), nullable=True),
        sa.Column("provider_video_id", sa.String(length=64), nullable=True),
        sa.Column("embed_url", sa.String(length=1024), nullable=True),
        sa.Column("thumbnail_url", sa.String(length=1024), nullable=True),
        sa.Column("poster_media_id", sa.UUID(), nullable=True),
        sa.Column("uploaded_media_id", sa.UUID(), nullable=True),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("category", sa.String(length=96), nullable=True),
        sa.Column("is_featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        *_workflow_foreign_keys(),
        sa.ForeignKeyConstraint(["poster_media_id"], ["media.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["uploaded_media_id"], ["media.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
        sa.CheckConstraint("provider IN ('youtube', 'uploaded')", name="ck_vc_videos_provider"),
        sa.CheckConstraint(
            "((provider = 'youtube' AND provider_video_id IS NOT NULL AND source_url IS NOT NULL "
            "AND embed_url IS NOT NULL AND uploaded_media_id IS NULL) OR "
            "(provider = 'uploaded' AND uploaded_media_id IS NOT NULL "
            "AND provider_video_id IS NULL AND embed_url IS NULL))",
            name="ck_vc_videos_provider_source",
        ),
    )
    _create_scoped_indexes("vc_videos")
    for column in ("slug", "provider", "provider_video_id", "poster_media_id", "uploaded_media_id", "category"):
        op.create_index(op.f(f"ix_vc_videos_{column}"), "vc_videos", [column])
    op.create_index(
        "uq_vc_videos_youtube_provider_id",
        "vc_videos",
        ["provider", "provider_video_id"],
        unique=True,
        postgresql_where=sa.text("provider = 'youtube' AND provider_video_id IS NOT NULL AND deleted_at IS NULL"),
    )
    op.create_index(
        "ix_vc_videos_public_workflow",
        "vc_videos",
        ["is_public", "is_published", "workflow_status", "published_at"],
    )

    op.create_table(
        "vc_hubs",
        *_base_columns(),
        *_scoped_columns(),
        sa.Column("staff_assignment_id", sa.UUID(), nullable=True),
        sa.Column("eyebrow", sa.String(length=128), server_default="Leadership in motion", nullable=False),
        sa.Column("title", sa.String(length=255), server_default="Meet the Vice Chancellor", nullable=False),
        sa.Column("introduction", sa.Text(), nullable=True),
        sa.Column("welcome_title", sa.String(length=255), nullable=True),
        sa.Column("welcome_message", sa.Text(), nullable=True),
        sa.Column("hero_media_id", sa.UUID(), nullable=True),
        sa.Column("welcome_video_id", sa.UUID(), nullable=True),
        sa.Column("professional_profile_url", sa.String(length=1024), server_default="/about/vice-chancellor/profile", nullable=False),
        sa.Column("section_order", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("section_visibility", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        *_workflow_foreign_keys(),
        sa.ForeignKeyConstraint(["staff_assignment_id"], ["staff_assignments.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["hero_media_id"], ["media.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["welcome_video_id"], ["vc_videos.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint("scope_type = 'university' AND scope_id IS NULL", name="ck_vc_hubs_university_scope"),
    )
    _create_scoped_indexes("vc_hubs")
    for column in ("staff_assignment_id", "hero_media_id", "welcome_video_id"):
        op.create_index(op.f(f"ix_vc_hubs_{column}"), "vc_hubs", [column])
    op.create_index(
        "uq_vc_hubs_university_active",
        "vc_hubs",
        ["scope_type"],
        unique=True,
        postgresql_where=sa.text("scope_id IS NULL AND deleted_at IS NULL"),
    )
    op.create_index(
        "ix_vc_hubs_public_workflow",
        "vc_hubs",
        ["is_public", "is_published", "workflow_status", "published_at"],
    )

    op.create_table(
        "vc_speeches",
        *_base_columns(),
        *_seo_columns(),
        *_scoped_columns(),
        *_rich_columns(),
        sa.Column("speech_type", sa.String(length=32), server_default="speech", nullable=False),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("venue", sa.String(length=255), nullable=True),
        sa.Column("occasion", sa.String(length=255), nullable=True),
        sa.Column("audience", sa.String(length=255), nullable=True),
        sa.Column("document_media_id", sa.UUID(), nullable=True),
        sa.Column("is_featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        *_workflow_foreign_keys(),
        sa.ForeignKeyConstraint(["featured_media_id"], ["media.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["document_media_id"], ["media.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["author_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
        sa.CheckConstraint(
            "speech_type IN ('speech', 'address', 'statement', 'reflection', 'interview')",
            name="ck_vc_speeches_type",
        ),
    )
    _create_scoped_indexes("vc_speeches")
    for column in ("slug", "featured_media_id", "author_user_id", "delivered_at", "document_media_id"):
        op.create_index(op.f(f"ix_vc_speeches_{column}"), "vc_speeches", [column])
    op.create_index(
        "ix_vc_speeches_public_workflow",
        "vc_speeches",
        ["is_public", "is_published", "workflow_status", "published_at"],
    )

    op.create_table(
        "vc_speech_videos",
        *_base_columns(),
        sa.Column("speech_id", sa.UUID(), nullable=False),
        sa.Column("video_id", sa.UUID(), nullable=False),
        sa.Column("role", sa.String(length=32), server_default="related", nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.ForeignKeyConstraint(["speech_id"], ["vc_speeches.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["video_id"], ["vc_videos.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("speech_id", "video_id", "role", name="uq_vc_speech_videos_speech_video_role"),
        sa.CheckConstraint(
            "role IN ('primary', 'full_recording', 'excerpt', 'related')",
            name="ck_vc_speech_videos_role",
        ),
    )
    op.create_index(op.f("ix_vc_speech_videos_speech_id"), "vc_speech_videos", ["speech_id"])
    op.create_index(op.f("ix_vc_speech_videos_video_id"), "vc_speech_videos", ["video_id"])
    op.create_index("ix_vc_speech_videos_speech_order", "vc_speech_videos", ["speech_id", "display_order"])
    op.create_index(
        "uq_vc_speech_videos_primary",
        "vc_speech_videos",
        ["speech_id"],
        unique=True,
        postgresql_where=sa.text("role = 'primary' AND deleted_at IS NULL"),
    )

    op.create_table(
        "vc_gallery_albums",
        *_base_columns(),
        *_seo_columns(),
        *_scoped_columns(),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("event_date", sa.Date(), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("cover_media_id", sa.UUID(), nullable=True),
        sa.Column("is_featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        *_workflow_foreign_keys(),
        sa.ForeignKeyConstraint(["cover_media_id"], ["media.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    _create_scoped_indexes("vc_gallery_albums")
    for column in ("slug", "event_date", "cover_media_id"):
        op.create_index(op.f(f"ix_vc_gallery_albums_{column}"), "vc_gallery_albums", [column])
    op.create_index(
        "ix_vc_gallery_albums_public_workflow",
        "vc_gallery_albums",
        ["is_public", "is_published", "workflow_status", "published_at"],
    )

    op.create_table(
        "vc_hub_placements",
        *_base_columns(),
        sa.Column("hub_id", sa.UUID(), nullable=False),
        sa.Column("section", sa.String(length=32), nullable=False),
        sa.Column("news_id", sa.UUID(), nullable=True),
        sa.Column("event_id", sa.UUID(), nullable=True),
        sa.Column("speech_id", sa.UUID(), nullable=True),
        sa.Column("video_id", sa.UUID(), nullable=True),
        sa.Column("gallery_album_id", sa.UUID(), nullable=True),
        sa.Column("editorial_label", sa.String(length=128), nullable=True),
        sa.Column("title_override", sa.String(length=255), nullable=True),
        sa.Column("summary_override", sa.Text(), nullable=True),
        sa.Column("poster_media_id", sa.UUID(), nullable=True),
        sa.Column("is_featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.Column("visible_from", sa.DateTime(timezone=True), nullable=True),
        sa.Column("visible_to", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_enabled", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.ForeignKeyConstraint(["hub_id"], ["vc_hubs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["news_id"], ["news.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["speech_id"], ["vc_speeches.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["video_id"], ["vc_videos.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["gallery_album_id"], ["vc_gallery_albums.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["poster_media_id"], ["media.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "section IN ('activities', 'speeches', 'videos', 'events', 'gallery')",
            name="ck_vc_hub_placements_section",
        ),
        sa.CheckConstraint(
            "num_nonnulls(news_id, event_id, speech_id, video_id, gallery_album_id) = 1",
            name="ck_vc_hub_placements_one_source",
        ),
        sa.CheckConstraint(
            "((section = 'activities' AND news_id IS NOT NULL) OR "
            "(section = 'events' AND event_id IS NOT NULL) OR "
            "(section = 'speeches' AND speech_id IS NOT NULL) OR "
            "(section = 'videos' AND video_id IS NOT NULL) OR "
            "(section = 'gallery' AND gallery_album_id IS NOT NULL))",
            name="ck_vc_hub_placements_section_source",
        ),
        sa.CheckConstraint(
            "visible_to IS NULL OR visible_from IS NULL OR visible_to >= visible_from",
            name="ck_vc_hub_placements_visible_window",
        ),
    )
    for column in ("hub_id", "section", "news_id", "event_id", "speech_id", "video_id", "gallery_album_id", "poster_media_id"):
        op.create_index(op.f(f"ix_vc_hub_placements_{column}"), "vc_hub_placements", [column])
    op.create_index("ix_vc_hub_placements_hub_section_order", "vc_hub_placements", ["hub_id", "section", "display_order"])
    for source in ("news", "event", "speech", "video", "gallery_album"):
        column = f"{source}_id"
        suffix = "gallery" if source == "gallery_album" else source
        op.create_index(
            f"uq_vc_hub_placements_{suffix}",
            "vc_hub_placements",
            ["hub_id", column],
            unique=True,
            postgresql_where=sa.text(f"{column} IS NOT NULL AND deleted_at IS NULL"),
        )


def downgrade() -> None:
    op.drop_table("vc_hub_placements")
    op.drop_table("vc_gallery_albums")
    op.drop_table("vc_speech_videos")
    op.drop_table("vc_speeches")
    op.drop_table("vc_hubs")
    op.drop_table("vc_videos")
