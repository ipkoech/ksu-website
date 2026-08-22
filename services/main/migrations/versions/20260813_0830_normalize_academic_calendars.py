"""Normalize academic calendar entries and add publishing workflow metadata."""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "20260813_0830"
down_revision = "20260810_0820"
branch_labels = None
depends_on = None


def _workflow_columns() -> list[sa.Column]:
    return [
        sa.Column("workflow_status", sa.String(32), nullable=False, server_default="draft"),
        sa.Column("owner_portal", sa.String(64), nullable=True),
        sa.Column("owner_scope_type", sa.String(32), nullable=True),
        sa.Column("owner_scope_id", sa.Uuid(), nullable=True),
        sa.Column("submitted_by_id", sa.Uuid(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_by_id", sa.Uuid(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_by_id", sa.Uuid(), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_by_id", sa.Uuid(), nullable=True),
        sa.Column("scheduled_publish_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("unpublished_by_id", sa.Uuid(), nullable=True),
        sa.Column("unpublished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("revision_notes", sa.Text(), nullable=True),
    ]


def upgrade() -> None:
    for column in _workflow_columns():
        op.add_column("academic_calendars", column)
    for name in ("submitted_by_id", "reviewed_by_id", "approved_by_id", "published_by_id", "unpublished_by_id"):
        op.create_foreign_key(f"fk_academic_calendars_{name}_users", "academic_calendars", "users", [name], ["id"], ondelete="SET NULL")
    op.add_column("academic_calendars", sa.Column("updated_by_id", sa.Uuid(), nullable=True))
    op.add_column("academic_calendars", sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("academic_calendars", sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("academic_calendars", sa.Column("published_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("academic_calendars", sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("academic_calendars", sa.Column("supersedes_id", sa.Uuid(), nullable=True))
    op.create_foreign_key("fk_academic_calendars_updated_by_id_users", "academic_calendars", "users", ["updated_by_id"], ["id"], ondelete="SET NULL")
    op.create_foreign_key("fk_academic_calendars_supersedes_id", "academic_calendars", "academic_calendars", ["supersedes_id"], ["id"], ondelete="SET NULL")
    for name in ("workflow_status", "owner_portal", "owner_scope_type", "owner_scope_id", "scheduled_publish_at", "expires_at", "updated_by_id", "is_public", "is_published", "published_at", "supersedes_id"):
        op.create_index(f"ix_academic_calendars_{name}", "academic_calendars", [name])

    event_columns = [
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("calendar_id", sa.Uuid(), sa.ForeignKey("academic_calendars.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("event_type", sa.String(32), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("audience", sa.String(128), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("document_id", sa.Uuid(), sa.ForeignKey("documents.id", ondelete="SET NULL"), nullable=True),
        sa.Column("is_highlighted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("status", sa.String(32), nullable=False, server_default="draft"),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_by_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        *_workflow_columns(),
        sa.CheckConstraint("end_date IS NULL OR end_date >= start_date", name="ck_academic_calendar_event_dates"),
    ]
    op.create_table("academic_calendar_events", *event_columns)
    for name in ("submitted_by_id", "reviewed_by_id", "approved_by_id", "published_by_id", "unpublished_by_id"):
        op.create_foreign_key(f"fk_academic_calendar_events_{name}_users", "academic_calendar_events", "users", [name], ["id"], ondelete="SET NULL")
    for name in ("calendar_id", "event_type", "start_date", "audience", "document_id", "status", "workflow_status", "is_public", "is_published", "published_at", "updated_by_id"):
        op.create_index(f"ix_academic_calendar_events_{name}", "academic_calendar_events", [name])
    op.create_index("ix_academic_calendar_events_public", "academic_calendar_events", ["calendar_id", "is_public", "is_published", "start_date"])

    op.create_table(
        "academic_calendar_documents",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("calendar_id", sa.Uuid(), sa.ForeignKey("academic_calendars.id", ondelete="CASCADE"), nullable=False),
        sa.Column("document_id", sa.Uuid(), sa.ForeignKey("documents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("relationship_type", sa.String(32), nullable=False, server_default="supporting"),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="100"),
        sa.UniqueConstraint("calendar_id", "document_id", "relationship_type", name="uq_academic_calendar_document"),
    )
    op.create_index("ix_academic_calendar_documents_calendar_id", "academic_calendar_documents", ["calendar_id"])
    op.create_index("ix_academic_calendar_documents_document_id", "academic_calendar_documents", ["document_id"])

    op.execute("""
        UPDATE academic_calendars
        SET workflow_status = CASE WHEN status IN ('published', 'current') THEN 'published' WHEN status = 'archived' THEN 'archived' ELSE 'draft' END,
            is_public = status IN ('published', 'current'),
            is_published = status IN ('published', 'current'),
            published_at = CASE WHEN status IN ('published', 'current') THEN updated_at ELSE NULL END
    """)
    op.execute("""
        INSERT INTO academic_calendar_events
            (id, calendar_id, title, event_type, description, start_date, status, workflow_status,
             is_public, is_published, published_at, created_at, updated_at)
        SELECT gen_random_uuid(), c.id, COALESCE(item->>'title', item->>'name', 'Calendar event'), source.event_type,
               item->>'description', (item->>'date')::date,
               CASE WHEN c.status IN ('published', 'current') THEN 'published' ELSE 'draft' END,
               CASE WHEN c.status IN ('published', 'current') THEN 'published' ELSE 'draft' END,
               c.status IN ('published', 'current'), c.status IN ('published', 'current'),
               CASE WHEN c.status IN ('published', 'current') THEN c.updated_at ELSE NULL END,
               c.created_at, c.updated_at
        FROM academic_calendars c
        CROSS JOIN LATERAL (
            SELECT 'event'::text AS event_type, value AS item FROM jsonb_array_elements(COALESCE(c.events, '[]'::jsonb))
            UNION ALL
            SELECT 'holiday'::text, value FROM jsonb_array_elements(COALESCE(c.holidays, '[]'::jsonb))
        ) source
        WHERE source.item->>'date' ~ '^\\d{4}-\\d{2}-\\d{2}$'
    """)


def downgrade() -> None:
    op.drop_table("academic_calendar_documents")
    op.drop_table("academic_calendar_events")
    for name in ("workflow_status", "owner_portal", "owner_scope_type", "owner_scope_id", "scheduled_publish_at", "expires_at", "updated_by_id", "is_public", "is_published", "published_at", "supersedes_id"):
        op.drop_index(f"ix_academic_calendars_{name}", table_name="academic_calendars")
    op.drop_constraint("fk_academic_calendars_supersedes_id", "academic_calendars", type_="foreignkey")
    op.drop_constraint("fk_academic_calendars_updated_by_id_users", "academic_calendars", type_="foreignkey")
    for name in ("submitted_by_id", "reviewed_by_id", "approved_by_id", "published_by_id", "unpublished_by_id"):
        op.drop_constraint(f"fk_academic_calendars_{name}_users", "academic_calendars", type_="foreignkey")
    for name in ("supersedes_id", "archived_at", "published_at", "is_published", "is_public", "updated_by_id"):
        op.drop_column("academic_calendars", name)
    for column in reversed(_workflow_columns()):
        op.drop_column("academic_calendars", column.name)
