"""add homepage admissions actions and milestones

Revision ID: 20260713_0022
Revises: 20260713_0021
Create Date: 2026-07-13 14:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260713_0022"
down_revision = "20260713_0021"
branch_labels = None
depends_on = None


WORKFLOW_STATUSES = "'draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived'"


def _workflow_actor_columns() -> tuple[sa.Column, ...]:
    return tuple(
        sa.Column(column_name, sa.UUID(), nullable=True)
        for column_name in (
            "created_by_id",
            "updated_by_id",
            "submitted_by_id",
            "reviewed_by_id",
            "approved_by_id",
            "published_by_id",
        )
    )


def _workflow_actor_constraints() -> tuple[sa.ForeignKeyConstraint, ...]:
    return tuple(
        sa.ForeignKeyConstraint([column_name], ["users.id"], ondelete="SET NULL")
        for column_name in (
            "created_by_id",
            "updated_by_id",
            "submitted_by_id",
            "reviewed_by_id",
            "approved_by_id",
            "published_by_id",
        )
    )


def _workflow_columns() -> tuple[sa.Column, ...]:
    return (
        sa.Column("status", sa.String(length=32), server_default="draft", nullable=False),
        sa.Column("workflow_status", sa.String(length=32), server_default="draft", nullable=False),
        sa.Column("scheduled_publish_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("unpublished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("revision_notes", sa.Text(), nullable=True),
    )


def _base_columns() -> tuple[sa.Column, ...]:
    return (
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )


def upgrade() -> None:
    op.add_column("intakes", sa.Column("application_opens_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("intakes", sa.Column("application_closes_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("intakes", sa.Column("late_application_closes_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "intakes",
        sa.Column("application_override", sa.String(length=32), server_default="automatic", nullable=False),
    )
    op.add_column("intakes", sa.Column("override_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "intakes",
        sa.Column("late_applications_enabled", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )
    op.add_column(
        "intakes",
        sa.Column("is_featured_on_homepage", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )
    op.add_column(
        "intakes",
        sa.Column("homepage_priority", sa.Integer(), server_default=sa.text("100"), nullable=False),
    )
    op.add_column(
        "intakes",
        sa.Column("timezone", sa.String(length=64), server_default="Africa/Nairobi", nullable=False),
    )

    op.execute(
        sa.text(
            "UPDATE intakes SET "
            "application_opens_at = application_start::timestamp AT TIME ZONE 'Africa/Nairobi', "
            "application_closes_at = (application_end::timestamp + interval '23 hours 59 minutes 59 seconds') "
            "AT TIME ZONE 'Africa/Nairobi', "
            "late_application_closes_at = CASE WHEN late_application_end IS NULL THEN NULL ELSE "
            "(late_application_end::timestamp + interval '23 hours 59 minutes 59 seconds') "
            "AT TIME ZONE 'Africa/Nairobi' END"
        )
    )
    op.alter_column("intakes", "application_opens_at", nullable=False)
    op.alter_column("intakes", "application_closes_at", nullable=False)
    op.create_check_constraint(
        "ck_intakes_application_override",
        "intakes",
        "application_override IN ('automatic', 'force_open', 'force_hidden')",
    )
    op.create_check_constraint(
        "ck_intakes_application_timestamp_window",
        "intakes",
        "application_closes_at >= application_opens_at",
    )
    op.create_check_constraint(
        "ck_intakes_late_application_timestamp_window",
        "intakes",
        "late_application_closes_at IS NULL OR late_application_closes_at >= application_closes_at",
    )
    op.create_check_constraint(
        "ck_intakes_manual_override_expiry",
        "intakes",
        "application_override = 'automatic' OR override_expires_at IS NOT NULL",
    )
    op.create_check_constraint(
        "ck_intakes_featured_homepage_requires_active",
        "intakes",
        "NOT is_featured_on_homepage OR is_active",
    )
    op.create_index("ix_intakes_is_featured_on_homepage", "intakes", ["is_featured_on_homepage"])
    op.create_index(
        "ix_intakes_homepage_resolution",
        "intakes",
        (
            "is_active",
            "is_featured_on_homepage",
            "homepage_priority",
            "application_opens_at",
            "application_closes_at",
        ),
    )

    op.create_table(
        "intake_public_actions",
        *_base_columns(),
        sa.Column("intake_id", sa.UUID(), nullable=False),
        sa.Column("action_type", sa.String(length=64), nullable=False),
        sa.Column("label", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("target_url", sa.String(length=1024), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_enabled", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("priority", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.Column("open_in_new_tab", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        *_workflow_columns(),
        *_workflow_actor_columns(),
        sa.CheckConstraint(
            "action_type IN ('apply', 'check_requirements', 'explore_programmes', "
            "'download_admission_letter', 'reporting_instructions', 'student_portal', "
            "'contact_admissions')",
            name="ck_intake_public_actions_action_type",
        ),
        sa.CheckConstraint(f"status IN ({WORKFLOW_STATUSES})", name="ck_intake_public_actions_status"),
        sa.CheckConstraint(
            f"workflow_status IN ({WORKFLOW_STATUSES})",
            name="ck_intake_public_actions_workflow_status",
        ),
        sa.CheckConstraint(
            "ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at",
            name="ck_intake_public_actions_window",
        ),
        sa.ForeignKeyConstraint(["intake_id"], ["intakes.id"], ondelete="CASCADE"),
        *_workflow_actor_constraints(),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_intake_public_actions_intake_id", "intake_public_actions", ["intake_id"])
    op.create_index("ix_intake_public_actions_workflow_status", "intake_public_actions", ["workflow_status"])
    op.create_index(
        "uq_intake_public_actions_current_type",
        "intake_public_actions",
        ["intake_id", "action_type"],
        unique=True,
        postgresql_where=sa.text("deleted_at IS NULL AND workflow_status != 'archived'"),
    )
    op.create_index(
        "ix_intake_public_actions_public_window",
        "intake_public_actions",
        ["intake_id", "workflow_status", "is_enabled", "starts_at", "ends_at", "expires_at"],
    )

    op.create_table(
        "intake_milestones",
        *_base_columns(),
        sa.Column("intake_id", sa.UUID(), nullable=False),
        sa.Column("milestone_type", sa.String(length=64), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("instructions_url", sa.String(length=1024), nullable=True),
        sa.Column("is_public", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        *_workflow_columns(),
        *_workflow_actor_columns(),
        sa.CheckConstraint(
            "milestone_type IN ('applications_open', 'applications_close', "
            "'admission_letters_release', 'reporting', 'orientation', 'registration', "
            "'semester_opening')",
            name="ck_intake_milestones_milestone_type",
        ),
        sa.CheckConstraint(f"status IN ({WORKFLOW_STATUSES})", name="ck_intake_milestones_status"),
        sa.CheckConstraint(
            f"workflow_status IN ({WORKFLOW_STATUSES})",
            name="ck_intake_milestones_workflow_status",
        ),
        sa.CheckConstraint(
            "ends_at IS NULL OR ends_at >= starts_at",
            name="ck_intake_milestones_window",
        ),
        sa.ForeignKeyConstraint(["intake_id"], ["intakes.id"], ondelete="CASCADE"),
        *_workflow_actor_constraints(),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_intake_milestones_intake_id", "intake_milestones", ["intake_id"])
    op.create_index("ix_intake_milestones_workflow_status", "intake_milestones", ["workflow_status"])
    op.create_index(
        "ix_intake_milestones_public_window",
        "intake_milestones",
        ["intake_id", "workflow_status", "is_public", "starts_at", "expires_at"],
    )
    op.create_index(
        "ix_intake_milestones_intake_order",
        "intake_milestones",
        ["intake_id", "display_order"],
    )


def downgrade() -> None:
    op.drop_index("ix_intake_milestones_intake_order", table_name="intake_milestones")
    op.drop_index("ix_intake_milestones_public_window", table_name="intake_milestones")
    op.drop_index("ix_intake_milestones_workflow_status", table_name="intake_milestones")
    op.drop_index("ix_intake_milestones_intake_id", table_name="intake_milestones")
    op.drop_table("intake_milestones")

    op.drop_index("ix_intake_public_actions_public_window", table_name="intake_public_actions")
    op.drop_index("uq_intake_public_actions_current_type", table_name="intake_public_actions")
    op.drop_index("ix_intake_public_actions_workflow_status", table_name="intake_public_actions")
    op.drop_index("ix_intake_public_actions_intake_id", table_name="intake_public_actions")
    op.drop_table("intake_public_actions")

    op.drop_index("ix_intakes_homepage_resolution", table_name="intakes")
    op.drop_index("ix_intakes_is_featured_on_homepage", table_name="intakes")
    for constraint_name in (
        "ck_intakes_featured_homepage_requires_active",
        "ck_intakes_manual_override_expiry",
        "ck_intakes_late_application_timestamp_window",
        "ck_intakes_application_timestamp_window",
        "ck_intakes_application_override",
    ):
        op.drop_constraint(constraint_name, "intakes", type_="check")
    for column_name in reversed(
        (
            "application_opens_at",
            "application_closes_at",
            "late_application_closes_at",
            "application_override",
            "override_expires_at",
            "late_applications_enabled",
            "is_featured_on_homepage",
            "homepage_priority",
            "timezone",
        )
    ):
        op.drop_column("intakes", column_name)
