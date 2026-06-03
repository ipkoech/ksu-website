"""add research office profile

Revision ID: 20260601_0001
Revises: d04ccea88462
Create Date: 2026-06-01 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260601_0001"
down_revision = "d04ccea88462"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "research_offices",
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("code", sa.String(length=32), nullable=True),
        sa.Column("department_id", sa.Uuid(), nullable=True),
        sa.Column("director_id", sa.Uuid(), nullable=True),
        sa.Column("about", sa.Text(), nullable=True),
        sa.Column("mandate", sa.Text(), nullable=True),
        sa.Column("mission", sa.Text(), nullable=True),
        sa.Column("vision", sa.Text(), nullable=True),
        sa.Column("objectives", sa.Text(), nullable=True),
        sa.Column("functions", sa.Text(), nullable=True),
        sa.Column("services_summary", sa.Text(), nullable=True),
        sa.Column("leadership_message", sa.Text(), nullable=True),
        sa.Column("strategic_priorities", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("email", sa.String(length=320), nullable=True),
        sa.Column("phone", sa.String(length=24), nullable=True),
        sa.Column("website", sa.String(length=512), nullable=True),
        sa.Column("social_links", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("status", sa.String(length=32), server_default="active", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("is_featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.Column("meta_title", sa.String(length=255), nullable=True),
        sa.Column("meta_description", sa.String(length=500), nullable=True),
        sa.Column("keywords", sa.JSON(), nullable=True),
        sa.Column("cover_image_id", sa.Uuid(), nullable=True),
        sa.Column("logo_id", sa.Uuid(), nullable=True),
        sa.Column("gallery_media_ids", sa.JSON(), nullable=True),
        sa.Column("attachment_media_ids", sa.JSON(), nullable=True),
        sa.Column("document_media_ids", sa.JSON(), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        schema="research",
    )
    op.create_index(op.f("ix_research_research_offices_code"), "research_offices", ["code"], unique=True, schema="research")
    op.create_index(op.f("ix_research_research_offices_cover_image_id"), "research_offices", ["cover_image_id"], unique=False, schema="research")
    op.create_index(op.f("ix_research_research_offices_department_id"), "research_offices", ["department_id"], unique=False, schema="research")
    op.create_index(op.f("ix_research_research_offices_director_id"), "research_offices", ["director_id"], unique=False, schema="research")
    op.create_index(op.f("ix_research_research_offices_is_active"), "research_offices", ["is_active"], unique=False, schema="research")
    op.create_index(op.f("ix_research_research_offices_is_featured"), "research_offices", ["is_featured"], unique=False, schema="research")
    op.create_index(op.f("ix_research_research_offices_logo_id"), "research_offices", ["logo_id"], unique=False, schema="research")
    op.create_index(op.f("ix_research_research_offices_slug"), "research_offices", ["slug"], unique=True, schema="research")
    op.create_index(op.f("ix_research_research_offices_status"), "research_offices", ["status"], unique=False, schema="research")

    op.create_table(
        "research_office_staff",
        sa.Column("office_id", sa.Uuid(), nullable=False),
        sa.Column("staff_assignment_id", sa.Uuid(), nullable=False),
        sa.Column("staff_type", sa.String(length=32), server_default="staff", nullable=False),
        sa.Column("role", sa.String(length=128), nullable=False),
        sa.Column("title_override", sa.String(length=128), nullable=True),
        sa.Column("responsibilities", sa.Text(), nullable=True),
        sa.Column("leadership_rank", sa.Integer(), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("photo_id", sa.Uuid(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["office_id"], ["research.research_offices.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("office_id", "staff_assignment_id", name="uq_research_office_staff_assignment"),
        schema="research",
    )
    op.create_index(op.f("ix_research_research_office_staff_office_id"), "research_office_staff", ["office_id"], unique=False, schema="research")
    op.create_index(op.f("ix_research_research_office_staff_photo_id"), "research_office_staff", ["photo_id"], unique=False, schema="research")
    op.create_index(op.f("ix_research_research_office_staff_staff_assignment_id"), "research_office_staff", ["staff_assignment_id"], unique=False, schema="research")
    op.create_index(op.f("ix_research_research_office_staff_staff_type"), "research_office_staff", ["staff_type"], unique=False, schema="research")


def downgrade() -> None:
    op.drop_index(op.f("ix_research_research_office_staff_staff_type"), table_name="research_office_staff", schema="research")
    op.drop_index(op.f("ix_research_research_office_staff_staff_assignment_id"), table_name="research_office_staff", schema="research")
    op.drop_index(op.f("ix_research_research_office_staff_photo_id"), table_name="research_office_staff", schema="research")
    op.drop_index(op.f("ix_research_research_office_staff_office_id"), table_name="research_office_staff", schema="research")
    op.drop_table("research_office_staff", schema="research")

    op.drop_index(op.f("ix_research_research_offices_status"), table_name="research_offices", schema="research")
    op.drop_index(op.f("ix_research_research_offices_slug"), table_name="research_offices", schema="research")
    op.drop_index(op.f("ix_research_research_offices_logo_id"), table_name="research_offices", schema="research")
    op.drop_index(op.f("ix_research_research_offices_is_featured"), table_name="research_offices", schema="research")
    op.drop_index(op.f("ix_research_research_offices_is_active"), table_name="research_offices", schema="research")
    op.drop_index(op.f("ix_research_research_offices_director_id"), table_name="research_offices", schema="research")
    op.drop_index(op.f("ix_research_research_offices_department_id"), table_name="research_offices", schema="research")
    op.drop_index(op.f("ix_research_research_offices_cover_image_id"), table_name="research_offices", schema="research")
    op.drop_index(op.f("ix_research_research_offices_code"), table_name="research_offices", schema="research")
    op.drop_table("research_offices", schema="research")
