"""Add library guides, specialists, workflows, and policy pages.

Revision ID: 20260622_0003
Revises: 20260622_0002
Create Date: 2026-06-22 00:03:00
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op


revision = "20260622_0003"
down_revision = "20260622_0002"
branch_labels = None
depends_on = None

LEGACY_TABLES = {
    "library_guides",
    "library_guide_sections",
    "library_specialists",
    "library_workflows",
    "library_workflow_steps",
    "library_policy_pages",
}


def _audit_columns() -> list[sa.Column]:
    return [
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    ]


def upgrade() -> None:
    # The canonical 20260623 branch creates the same domain surface and is
    # applied first on a fresh database. Keep this legacy branch stampable
    # without attempting duplicate DDL when those tables already exist.
    existing = set(sa.inspect(op.get_bind()).get_table_names(schema="library"))
    if LEGACY_TABLES <= existing:
        return
    op.create_table(
        "library_guides",
        sa.Column("library_id", sa.Uuid(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("guide_type", sa.String(length=32), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=True),
        sa.Column("course_code", sa.String(length=64), nullable=True),
        sa.Column("audience", sa.String(length=128), nullable=True),
        sa.Column("school_id", sa.Uuid(), nullable=True),
        sa.Column("department_id", sa.Uuid(), nullable=True),
        sa.Column("owner_staff_id", sa.Uuid(), nullable=True),
        sa.Column("is_public", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        *_audit_columns(),
        sa.ForeignKeyConstraint(["library_id"], ["library.libraries.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
        schema="library",
    )
    op.create_index("ix_library_guides_library_id", "library_guides", ["library_id"], schema="library")
    op.create_index("ix_library_guides_slug", "library_guides", ["slug"], schema="library")
    op.create_index("ix_library_guides_guide_type", "library_guides", ["guide_type"], schema="library")
    op.create_index("ix_library_guides_subject", "library_guides", ["subject"], schema="library")
    op.create_index("ix_library_guides_course_code", "library_guides", ["course_code"], schema="library")
    op.create_index("ix_library_guides_audience", "library_guides", ["audience"], schema="library")
    op.create_index("ix_library_guides_school_id", "library_guides", ["school_id"], schema="library")
    op.create_index("ix_library_guides_department_id", "library_guides", ["department_id"], schema="library")
    op.create_index("ix_library_guides_owner_staff_id", "library_guides", ["owner_staff_id"], schema="library")
    op.create_index(
        "ix_library_guides_library_public_active_sort",
        "library_guides",
        ["library_id", "is_public", "is_active", "sort_order"],
        schema="library",
    )
    op.create_index(
        "ix_library_guides_type_subject",
        "library_guides",
        ["guide_type", "subject"],
        schema="library",
    )

    op.create_table(
        "library_guide_sections",
        sa.Column("guide_id", sa.Uuid(), nullable=False),
        sa.Column("heading", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("section_type", sa.String(length=32), server_default="text", nullable=False),
        sa.Column("resource_links", sa.JSON(), nullable=True),
        sa.Column("file_ids", sa.JSON(), nullable=True),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        *_audit_columns(),
        sa.ForeignKeyConstraint(["guide_id"], ["library.library_guides.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="library",
    )
    op.create_index("ix_library_guide_sections_guide_id", "library_guide_sections", ["guide_id"], schema="library")
    op.create_index(
        "ix_library_guide_sections_guide_active_sort",
        "library_guide_sections",
        ["guide_id", "is_active", "sort_order"],
        schema="library",
    )

    op.create_table(
        "library_specialists",
        sa.Column("library_id", sa.Uuid(), nullable=True),
        sa.Column("staff_id", sa.Uuid(), nullable=False),
        sa.Column("subjects", sa.JSON(), nullable=True),
        sa.Column("schools", sa.JSON(), nullable=True),
        sa.Column("departments", sa.JSON(), nullable=True),
        sa.Column("support_areas", sa.JSON(), nullable=True),
        sa.Column("booking_url", sa.String(length=500), nullable=True),
        sa.Column("is_public", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        *_audit_columns(),
        sa.ForeignKeyConstraint(["library_id"], ["library.libraries.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        schema="library",
    )
    op.create_index("ix_library_specialists_library_id", "library_specialists", ["library_id"], schema="library")
    op.create_index("ix_library_specialists_staff_id", "library_specialists", ["staff_id"], schema="library")
    op.create_index(
        "ix_library_specialists_library_public_active_sort",
        "library_specialists",
        ["library_id", "is_public", "is_active", "sort_order"],
        schema="library",
    )

    op.create_table(
        "library_workflows",
        sa.Column("library_id", sa.Uuid(), nullable=True),
        sa.Column("workflow_type", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("audience", sa.String(length=128), nullable=True),
        sa.Column("is_public", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        *_audit_columns(),
        sa.ForeignKeyConstraint(["library_id"], ["library.libraries.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
        schema="library",
    )
    op.create_index("ix_library_workflows_library_id", "library_workflows", ["library_id"], schema="library")
    op.create_index("ix_library_workflows_workflow_type", "library_workflows", ["workflow_type"], schema="library")
    op.create_index("ix_library_workflows_slug", "library_workflows", ["slug"], schema="library")
    op.create_index("ix_library_workflows_audience", "library_workflows", ["audience"], schema="library")
    op.create_index(
        "ix_library_workflows_library_public_active_sort",
        "library_workflows",
        ["library_id", "is_public", "is_active", "sort_order"],
        schema="library",
    )

    op.create_table(
        "library_workflow_steps",
        sa.Column("workflow_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("instructions", sa.Text(), nullable=False),
        sa.Column("link_url", sa.String(length=500), nullable=True),
        sa.Column("file_id", sa.Uuid(), nullable=True),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        *_audit_columns(),
        sa.ForeignKeyConstraint(["workflow_id"], ["library.library_workflows.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="library",
    )
    op.create_index("ix_library_workflow_steps_workflow_id", "library_workflow_steps", ["workflow_id"], schema="library")
    op.create_index(
        "ix_library_workflow_steps_workflow_active_sort",
        "library_workflow_steps",
        ["workflow_id", "is_active", "sort_order"],
        schema="library",
    )

    op.create_table(
        "library_policy_pages",
        sa.Column("library_id", sa.Uuid(), nullable=True),
        sa.Column("policy_type", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("related_regulation_id", sa.Uuid(), nullable=True),
        sa.Column("file_id", sa.Uuid(), nullable=True),
        sa.Column("is_public", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("status", sa.String(length=32), server_default="active", nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        *_audit_columns(),
        sa.ForeignKeyConstraint(["library_id"], ["library.libraries.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["related_regulation_id"],
            ["library.library_regulations.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
        schema="library",
    )
    op.create_index("ix_library_policy_pages_library_id", "library_policy_pages", ["library_id"], schema="library")
    op.create_index("ix_library_policy_pages_policy_type", "library_policy_pages", ["policy_type"], schema="library")
    op.create_index("ix_library_policy_pages_slug", "library_policy_pages", ["slug"], schema="library")
    op.create_index(
        "ix_library_policy_pages_related_regulation_id",
        "library_policy_pages",
        ["related_regulation_id"],
        schema="library",
    )
    op.create_index("ix_library_policy_pages_status", "library_policy_pages", ["status"], schema="library")
    op.create_index(
        "ix_library_policy_pages_library_public_status_sort",
        "library_policy_pages",
        ["library_id", "is_public", "status", "sort_order"],
        schema="library",
    )


def downgrade() -> None:
    op.drop_index("ix_library_policy_pages_library_public_status_sort", table_name="library_policy_pages", schema="library")
    op.drop_index("ix_library_policy_pages_status", table_name="library_policy_pages", schema="library")
    op.drop_index("ix_library_policy_pages_related_regulation_id", table_name="library_policy_pages", schema="library")
    op.drop_index("ix_library_policy_pages_slug", table_name="library_policy_pages", schema="library")
    op.drop_index("ix_library_policy_pages_policy_type", table_name="library_policy_pages", schema="library")
    op.drop_index("ix_library_policy_pages_library_id", table_name="library_policy_pages", schema="library")
    op.drop_table("library_policy_pages", schema="library")

    op.drop_index("ix_library_workflow_steps_workflow_active_sort", table_name="library_workflow_steps", schema="library")
    op.drop_index("ix_library_workflow_steps_workflow_id", table_name="library_workflow_steps", schema="library")
    op.drop_table("library_workflow_steps", schema="library")

    op.drop_index("ix_library_workflows_library_public_active_sort", table_name="library_workflows", schema="library")
    op.drop_index("ix_library_workflows_audience", table_name="library_workflows", schema="library")
    op.drop_index("ix_library_workflows_slug", table_name="library_workflows", schema="library")
    op.drop_index("ix_library_workflows_workflow_type", table_name="library_workflows", schema="library")
    op.drop_index("ix_library_workflows_library_id", table_name="library_workflows", schema="library")
    op.drop_table("library_workflows", schema="library")

    op.drop_index("ix_library_specialists_library_public_active_sort", table_name="library_specialists", schema="library")
    op.drop_index("ix_library_specialists_staff_id", table_name="library_specialists", schema="library")
    op.drop_index("ix_library_specialists_library_id", table_name="library_specialists", schema="library")
    op.drop_table("library_specialists", schema="library")

    op.drop_index("ix_library_guide_sections_guide_active_sort", table_name="library_guide_sections", schema="library")
    op.drop_index("ix_library_guide_sections_guide_id", table_name="library_guide_sections", schema="library")
    op.drop_table("library_guide_sections", schema="library")

    op.drop_index("ix_library_guides_type_subject", table_name="library_guides", schema="library")
    op.drop_index("ix_library_guides_library_public_active_sort", table_name="library_guides", schema="library")
    op.drop_index("ix_library_guides_owner_staff_id", table_name="library_guides", schema="library")
    op.drop_index("ix_library_guides_department_id", table_name="library_guides", schema="library")
    op.drop_index("ix_library_guides_school_id", table_name="library_guides", schema="library")
    op.drop_index("ix_library_guides_audience", table_name="library_guides", schema="library")
    op.drop_index("ix_library_guides_course_code", table_name="library_guides", schema="library")
    op.drop_index("ix_library_guides_subject", table_name="library_guides", schema="library")
    op.drop_index("ix_library_guides_guide_type", table_name="library_guides", schema="library")
    op.drop_index("ix_library_guides_slug", table_name="library_guides", schema="library")
    op.drop_index("ix_library_guides_library_id", table_name="library_guides", schema="library")
    op.drop_table("library_guides", schema="library")
