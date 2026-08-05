"""Add public guide, specialist, workflow, and policy models.

Revision ID: 20260623_0003
Revises: 20260622_0002
Create Date: 2026-06-23 12:00:00
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision = "20260623_0003"
down_revision = "20260622_0002"
branch_labels = None
depends_on = None


PUBLIC_TABLES = {
    "library_specialists",
    "library_guides",
    "library_guide_sections",
    "library_guide_specialists",
    "library_workflows",
    "library_workflow_steps",
    "library_policy_pages",
}


def _base_columns() -> list[sa.Column]:
    return [
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    ]


def _table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return table_name in inspector.get_table_names(schema="library")


def _indexes(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {index["name"] for index in inspector.get_indexes(table_name, schema="library")}


def _create_index_if_missing(index_name: str, table_name: str, columns: list[str]) -> None:
    if index_name in _indexes(table_name):
        return
    op.create_index(index_name, table_name, columns, schema="library")


def upgrade() -> None:
    if all(_table_exists(table_name) for table_name in PUBLIC_TABLES):
        _create_index_if_missing(
            "ix_library_specialists_library_public_active_sort",
            "library_specialists",
            ["library_id", "is_public", "is_active", "sort_order"],
        )
        _create_index_if_missing(
            "ix_library_guides_library_public_active_type_sort",
            "library_guides",
            ["library_id", "is_public", "is_active", "guide_type", "sort_order"],
        )
        _create_index_if_missing(
            "ix_library_guide_sections_guide_active_sort",
            "library_guide_sections",
            ["guide_id", "is_active", "sort_order"],
        )
        _create_index_if_missing(
            "ix_library_workflows_library_public_active_type_sort",
            "library_workflows",
            ["library_id", "is_public", "is_active", "workflow_type", "sort_order"],
        )
        _create_index_if_missing(
            "ix_library_workflow_steps_workflow_active_sort",
            "library_workflow_steps",
            ["workflow_id", "is_active", "sort_order"],
        )
        _create_index_if_missing(
            "ix_library_policy_pages_library_public_status_type_sort",
            "library_policy_pages",
            ["library_id", "is_public", "status", "policy_type", "sort_order"],
        )
        return

    op.create_table(
        "library_specialists",
        *_base_columns(),
        sa.Column("library_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("staff_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("subjects", sa.JSON(), nullable=True),
        sa.Column("schools", sa.JSON(), nullable=True),
        sa.Column("departments", sa.JSON(), nullable=True),
        sa.Column("support_areas", sa.JSON(), nullable=True),
        sa.Column("booking_url", sa.String(length=500), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["library_id"], ["library.libraries.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["staff_id"], ["library.library_staff.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        schema="library",
    )
    op.create_index(
        "ix_library_specialists_library_public_active_sort",
        "library_specialists",
        ["library_id", "is_public", "is_active", "sort_order"],
        schema="library",
    )

    op.create_table(
        "library_guides",
        *_base_columns(),
        sa.Column("library_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("guide_type", sa.String(length=32), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=True),
        sa.Column("course_code", sa.String(length=64), nullable=True),
        sa.Column("audience", sa.String(length=128), nullable=True),
        sa.Column("school_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("department_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("owner_staff_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["library_id"], ["library.libraries.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["owner_staff_id"], ["library.library_staff.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_library_guides_slug"),
        schema="library",
    )
    op.create_index(
        "ix_library_guides_library_public_active_type_sort",
        "library_guides",
        ["library_id", "is_public", "is_active", "guide_type", "sort_order"],
        schema="library",
    )

    op.create_table(
        "library_guide_sections",
        *_base_columns(),
        sa.Column("guide_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("heading", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("section_type", sa.String(length=32), nullable=False),
        sa.Column("resource_links", sa.JSON(), nullable=True),
        sa.Column("file_ids", sa.JSON(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["guide_id"], ["library.library_guides.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="library",
    )
    op.create_index(
        "ix_library_guide_sections_guide_active_sort",
        "library_guide_sections",
        ["guide_id", "is_active", "sort_order"],
        schema="library",
    )

    op.create_table(
        "library_guide_specialists",
        *_base_columns(),
        sa.Column("guide_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("specialist_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["guide_id"], ["library.library_guides.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["specialist_id"], ["library.library_specialists.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "guide_id",
            "specialist_id",
            name="uq_library_guide_specialists_guide_specialist",
        ),
        schema="library",
    )

    op.create_table(
        "library_workflows",
        *_base_columns(),
        sa.Column("library_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("workflow_type", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("audience", sa.String(length=128), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["library_id"], ["library.libraries.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_library_workflows_slug"),
        schema="library",
    )
    op.create_index(
        "ix_library_workflows_library_public_active_type_sort",
        "library_workflows",
        ["library_id", "is_public", "is_active", "workflow_type", "sort_order"],
        schema="library",
    )

    op.create_table(
        "library_workflow_steps",
        *_base_columns(),
        sa.Column("workflow_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("instructions", sa.Text(), nullable=True),
        sa.Column("link_url", sa.String(length=500), nullable=True),
        sa.Column("file_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["workflow_id"], ["library.library_workflows.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="library",
    )
    op.create_index(
        "ix_library_workflow_steps_workflow_active_sort",
        "library_workflow_steps",
        ["workflow_id", "is_active", "sort_order"],
        schema="library",
    )

    op.create_table(
        "library_policy_pages",
        *_base_columns(),
        sa.Column("library_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("policy_type", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("related_regulation_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("file_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["library_id"], ["library.libraries.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["related_regulation_id"],
            ["library.library_regulations.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_library_policy_pages_slug"),
        schema="library",
    )
    op.create_index(
        "ix_library_policy_pages_library_public_status_type_sort",
        "library_policy_pages",
        ["library_id", "is_public", "status", "policy_type", "sort_order"],
        schema="library",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_library_policy_pages_library_public_status_type_sort",
        table_name="library_policy_pages",
        schema="library",
    )
    op.drop_table("library_policy_pages", schema="library")
    op.drop_index(
        "ix_library_workflow_steps_workflow_active_sort",
        table_name="library_workflow_steps",
        schema="library",
    )
    op.drop_table("library_workflow_steps", schema="library")
    op.drop_index(
        "ix_library_workflows_library_public_active_type_sort",
        table_name="library_workflows",
        schema="library",
    )
    op.drop_table("library_workflows", schema="library")
    op.drop_table("library_guide_specialists", schema="library")
    op.drop_index(
        "ix_library_guide_sections_guide_active_sort",
        table_name="library_guide_sections",
        schema="library",
    )
    op.drop_table("library_guide_sections", schema="library")
    op.drop_index(
        "ix_library_guides_library_public_active_type_sort",
        table_name="library_guides",
        schema="library",
    )
    op.drop_table("library_guides", schema="library")
    op.drop_index(
        "ix_library_specialists_library_public_active_sort",
        table_name="library_specialists",
        schema="library",
    )
    op.drop_table("library_specialists", schema="library")
