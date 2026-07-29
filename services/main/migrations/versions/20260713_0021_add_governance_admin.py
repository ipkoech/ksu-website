"""add governance administration schema

Revision ID: 20260713_0021
Revises: 20260712_0020
Create Date: 2026-07-13 12:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260713_0021"
down_revision = "20260712_0020"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "governance_roles",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("category", sa.String(length=64), server_default="member", nullable=False),
        sa.Column("display_group", sa.String(length=32), server_default="member", nullable=False),
        sa.Column("public_label", sa.String(length=255), nullable=False),
        sa.Column("default_hierarchy_level", sa.Integer(), server_default="2", nullable=False),
        sa.Column("default_display_order", sa.Integer(), server_default="100", nullable=False),
        sa.Column("badge_style", sa.String(length=64), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_by_id", sa.UUID(), nullable=True),
        sa.Column("updated_by_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_governance_roles_slug", "governance_roles", ["slug"], unique=True)
    op.create_index("ix_governance_roles_group_order", "governance_roles", ["display_group", "default_display_order"])

    op.create_table(
        "governance_page_content",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("board_id", sa.UUID(), nullable=False),
        sa.Column("page_key", sa.String(length=64), server_default="overview", nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("intro", sa.Text(), nullable=True),
        sa.Column("breadcrumb_label", sa.String(length=255), nullable=True),
        sa.Column("hero_image_id", sa.UUID(), nullable=True),
        sa.Column("hero_focal_point", sa.String(length=64), nullable=True),
        sa.Column("overlay_intensity", sa.Integer(), nullable=True),
        sa.Column("mandate_label", sa.String(length=255), nullable=True),
        sa.Column("mandate_heading", sa.String(length=255), nullable=True),
        sa.Column("mandate_body", sa.Text(), nullable=True),
        sa.Column("mandate_icon", sa.String(length=64), nullable=True),
        sa.Column("document_cta_label", sa.String(length=255), nullable=True),
        sa.Column("document_cta_url", sa.String(length=1024), nullable=True),
        sa.Column("status", sa.String(length=32), server_default="draft", nullable=False),
        sa.Column("workflow_status", sa.String(length=32), server_default="draft", nullable=False),
        sa.Column("submitted_by_id", sa.UUID(), nullable=True),
        sa.Column("approved_by_id", sa.UUID(), nullable=True),
        sa.Column("published_by_id", sa.UUID(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("unpublished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_id", sa.UUID(), nullable=True),
        sa.Column("updated_by_id", sa.UUID(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["board_id"], ["boards.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["hero_image_id"], ["media.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["submitted_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["approved_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["published_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["updated_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("uq_governance_page_content_board_page", "governance_page_content", ["board_id", "page_key"], unique=True)
    op.create_index("ix_governance_page_content_workflow_status", "governance_page_content", ["workflow_status"])

    staff_columns = (
        sa.Column("governance_role_id", sa.UUID(), nullable=True),
        sa.Column("appointment_category", sa.String(length=64), nullable=True),
        sa.Column("official_designation", sa.String(length=255), nullable=True),
        sa.Column("public_role_label", sa.String(length=255), nullable=True),
        sa.Column("represented_institution", sa.String(length=255), nullable=True),
        sa.Column("current_office", sa.String(length=255), nullable=True),
        sa.Column("appointing_authority", sa.String(length=255), nullable=True),
        sa.Column("appointment_reference", sa.String(length=255), nullable=True),
        sa.Column("term_number", sa.Integer(), nullable=True),
        sa.Column("is_ex_officio", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("is_voting_member", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("show_contact_publicly", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("profile_slug", sa.String(length=128), nullable=True),
        sa.Column("profile_summary", sa.Text(), nullable=True),
        sa.Column("appointment_status", sa.String(length=32), server_default="draft", nullable=False),
        sa.Column("workflow_status", sa.String(length=32), server_default="draft", nullable=False),
        sa.Column("submitted_by_id", sa.UUID(), nullable=True),
        sa.Column("approved_by_id", sa.UUID(), nullable=True),
        sa.Column("published_by_id", sa.UUID(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("unpublished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("publish_without_portrait_override", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("publication_notes", sa.Text(), nullable=True),
    )
    for column in staff_columns:
        op.add_column("staff_assignments", column)

    op.create_foreign_key("fk_staff_assignments_governance_role_id_governance_roles", "staff_assignments", "governance_roles", ["governance_role_id"], ["id"], ondelete="SET NULL")
    for column_name in ("submitted_by_id", "approved_by_id", "published_by_id"):
        op.create_foreign_key(f"fk_staff_assignments_{column_name}_users", "staff_assignments", "users", [column_name], ["id"], ondelete="SET NULL")
    op.create_index("ix_staff_assignments_governance_workflow", "staff_assignments", ["entity_type", "entity_id", "workflow_status"])
    op.create_index(
        "uq_staff_assignments_governance_profile_slug",
        "staff_assignments",
        ["profile_slug"],
        unique=True,
        postgresql_where=sa.text("profile_slug IS NOT NULL AND deleted_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("uq_staff_assignments_governance_profile_slug", table_name="staff_assignments")
    op.drop_index("ix_staff_assignments_governance_workflow", table_name="staff_assignments")
    for column_name in ("published_by_id", "approved_by_id", "submitted_by_id"):
        op.drop_constraint(f"fk_staff_assignments_{column_name}_users", "staff_assignments", type_="foreignkey")
    op.drop_constraint("fk_staff_assignments_governance_role_id_governance_roles", "staff_assignments", type_="foreignkey")
    for column_name in reversed((
        "governance_role_id", "appointment_category", "official_designation", "public_role_label",
        "represented_institution", "current_office", "appointing_authority", "appointment_reference",
        "term_number", "is_ex_officio", "is_voting_member", "show_contact_publicly", "profile_slug",
        "profile_summary", "appointment_status", "workflow_status", "submitted_by_id", "approved_by_id",
        "published_by_id", "submitted_at", "approved_at", "published_at", "unpublished_at", "archived_at",
        "publish_without_portrait_override", "publication_notes",
    )):
        op.drop_column("staff_assignments", column_name)

    op.drop_index("ix_governance_page_content_workflow_status", table_name="governance_page_content")
    op.drop_index("uq_governance_page_content_board_page", table_name="governance_page_content")
    op.drop_table("governance_page_content")

    op.drop_index("ix_governance_roles_group_order", table_name="governance_roles")
    op.drop_index("ix_governance_roles_slug", table_name="governance_roles")
    op.drop_table("governance_roles")
