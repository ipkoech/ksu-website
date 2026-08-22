"""Add structured academic and examination timetables."""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "20260813_0840"
down_revision = "20260813_0830"
branch_labels = None
depends_on = None


def _base_columns() -> list[sa.Column]:
    return [
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    ]


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
    op.create_table(
        "timetable_venues", *_base_columns(),
        sa.Column("campus_id", sa.Uuid(), sa.ForeignKey("campuses.id", ondelete="SET NULL"), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("code", sa.String(64), nullable=False, unique=True),
        sa.Column("building", sa.String(128), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.CheckConstraint("capacity IS NULL OR capacity > 0", name="ck_timetable_venue_capacity"),
    )
    op.create_index("ix_timetable_venues_campus_id", "timetable_venues", ["campus_id"])
    op.create_index("ix_timetable_venues_code", "timetable_venues", ["code"], unique=True)
    op.create_index("ix_timetable_venues_is_active", "timetable_venues", ["is_active"])

    op.create_table(
        "academic_timetables", *_base_columns(), *_workflow_columns(),
        sa.Column("updated_by_id", sa.Uuid(), nullable=True),
        sa.Column("calendar_id", sa.Uuid(), sa.ForeignKey("academic_calendars.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("timetable_type", sa.String(32), nullable=False, server_default="examination"),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("fallback_document_id", sa.Uuid(), sa.ForeignKey("documents.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="draft"),
        sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("supersedes_id", sa.Uuid(), sa.ForeignKey("academic_timetables.id", ondelete="SET NULL"), nullable=True),
        sa.UniqueConstraint("calendar_id", "timetable_type", "version", name="uq_academic_timetable_version"),
    )
    for name in ("submitted_by_id", "reviewed_by_id", "approved_by_id", "published_by_id", "unpublished_by_id", "updated_by_id"):
        op.create_foreign_key(f"fk_academic_timetables_{name}_users", "academic_timetables", "users", [name], ["id"], ondelete="SET NULL")
    for name in ("workflow_status", "owner_portal", "owner_scope_type", "owner_scope_id", "scheduled_publish_at", "expires_at", "updated_by_id", "calendar_id", "timetable_type", "fallback_document_id", "status", "is_public", "is_published", "published_at", "supersedes_id"):
        op.create_index(f"ix_academic_timetables_{name}", "academic_timetables", [name])

    op.create_table(
        "timetable_sittings", *_base_columns(),
        sa.Column("timetable_id", sa.Uuid(), sa.ForeignKey("academic_timetables.id", ondelete="CASCADE"), nullable=False),
        sa.Column("course_code", sa.String(64), nullable=False),
        sa.Column("course_title", sa.String(255), nullable=False),
        sa.Column("sitting_date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("venue_id", sa.Uuid(), sa.ForeignKey("timetable_venues.id", ondelete="SET NULL"), nullable=True),
        sa.Column("cohort_label", sa.String(128), nullable=True),
        sa.Column("candidate_count", sa.Integer(), nullable=True),
        sa.Column("special_instructions", sa.Text(), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="scheduled"),
        sa.CheckConstraint("end_time > start_time", name="ck_timetable_sitting_times"),
        sa.CheckConstraint("candidate_count IS NULL OR candidate_count >= 0", name="ck_timetable_candidate_count"),
    )
    for name in ("timetable_id", "course_code", "sitting_date", "venue_id", "status"):
        op.create_index(f"ix_timetable_sittings_{name}", "timetable_sittings", [name])
    op.create_index("ix_timetable_sittings_slot", "timetable_sittings", ["timetable_id", "sitting_date", "start_time", "end_time"])

    op.create_table(
        "timetable_sitting_programmes", *_base_columns(),
        sa.Column("sitting_id", sa.Uuid(), sa.ForeignKey("timetable_sittings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("programme_id", sa.Uuid(), sa.ForeignKey("programmes.id", ondelete="CASCADE"), nullable=False),
        sa.UniqueConstraint("sitting_id", "programme_id", name="uq_timetable_sitting_programme"),
    )
    op.create_index("ix_timetable_sitting_programmes_sitting_id", "timetable_sitting_programmes", ["sitting_id"])
    op.create_index("ix_timetable_sitting_programmes_programme_id", "timetable_sitting_programmes", ["programme_id"])


def downgrade() -> None:
    op.drop_table("timetable_sitting_programmes")
    op.drop_table("timetable_sittings")
    op.drop_table("academic_timetables")
    op.drop_table("timetable_venues")
