"""Add admissions catalog models.

Revision ID: 20260721_0037
Revises: 20260721_0036
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260721_0037"
down_revision = "20260721_0036"
branch_labels = None
depends_on = None


APPLICANT_TYPES = "'kuccps', 'self_sponsored', 'international', 'transfer', 'postgraduate', 'diploma_certificate'"
DOCUMENT_TYPES = "'joining_instructions', 'medical_form', 'fee_structure', 'reporting_checklist', 'brochure', 'application_form', 'other'"
PAGE_KEYS = "'admissions', 'how-to-apply', 'requirements', 'intakes', 'international', 'fees', 'documents'"


def _base_columns() -> tuple[sa.Column, ...]:
    return (
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )


def upgrade() -> None:
    op.create_table(
        "admission_pathways",
        *_base_columns(),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("applicant_type", sa.String(length=64), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("eligibility_notes", sa.Text(), nullable=True),
        sa.Column("application_steps", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("required_documents", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("cta_label", sa.String(length=255), nullable=True),
        sa.Column("cta_url", sa.String(length=1024), nullable=True),
        sa.Column("cover_image_id", sa.UUID(), nullable=True),
        sa.Column("is_published", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.CheckConstraint(f"applicant_type IN ({APPLICANT_TYPES})", name="ck_admission_pathways_applicant_type"),
        sa.ForeignKeyConstraint(["cover_image_id"], ["media.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_admission_pathways_slug"), "admission_pathways", ["slug"])
    op.create_index(op.f("ix_admission_pathways_applicant_type"), "admission_pathways", ["applicant_type"])
    op.create_index(op.f("ix_admission_pathways_cover_image_id"), "admission_pathways", ["cover_image_id"])
    op.create_index(op.f("ix_admission_pathways_is_published"), "admission_pathways", ["is_published"])
    op.create_index("ix_admission_pathways_public_order", "admission_pathways", ["is_published", "display_order", "title"])

    op.create_table(
        "admission_requirements",
        *_base_columns(),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("applicant_type", sa.String(length=64), nullable=False),
        sa.Column("level", sa.String(length=64), nullable=True),
        sa.Column("minimum_grade", sa.String(length=128), nullable=True),
        sa.Column("subject_requirements", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("alternative_qualifications", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("documents_required", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("effective_from", sa.Date(), nullable=True),
        sa.Column("effective_to", sa.Date(), nullable=True),
        sa.Column("programme_id", sa.UUID(), nullable=True),
        sa.Column("school_id", sa.UUID(), nullable=True),
        sa.Column("intake_id", sa.UUID(), nullable=True),
        sa.Column("pathway_id", sa.UUID(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.CheckConstraint(f"applicant_type IN ({APPLICANT_TYPES})", name="ck_admission_requirements_applicant_type"),
        sa.CheckConstraint("effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from", name="ck_admission_requirements_effective_window"),
        sa.ForeignKeyConstraint(["programme_id"], ["programmes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["school_id"], ["schools.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["intake_id"], ["intakes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["pathway_id"], ["admission_pathways.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    for column in ("applicant_type", "level", "programme_id", "school_id", "intake_id", "pathway_id", "is_active"):
        op.create_index(op.f(f"ix_admission_requirements_{column}"), "admission_requirements", [column])
    op.create_index("ix_admission_requirements_lookup", "admission_requirements", ["programme_id", "applicant_type", "intake_id", "is_active"])
    op.create_index("ix_admission_requirements_school_level", "admission_requirements", ["school_id", "level", "applicant_type", "is_active"])

    op.create_table(
        "programme_fee_structures",
        *_base_columns(),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("applicant_type", sa.String(length=64), nullable=False),
        sa.Column("fee_category", sa.String(length=64), server_default="tuition", nullable=False),
        sa.Column("currency", sa.String(length=8), server_default="KES", nullable=False),
        sa.Column("tuition_amount", sa.Integer(), nullable=True),
        sa.Column("statutory_amount", sa.Integer(), nullable=True),
        sa.Column("other_amount", sa.Integer(), nullable=True),
        sa.Column("total_amount", sa.Integer(), nullable=True),
        sa.Column("payment_schedule", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("effective_from", sa.Date(), nullable=True),
        sa.Column("effective_to", sa.Date(), nullable=True),
        sa.Column("programme_id", sa.UUID(), nullable=False),
        sa.Column("intake_id", sa.UUID(), nullable=True),
        sa.Column("attachment_media_id", sa.UUID(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.CheckConstraint(f"applicant_type IN ({APPLICANT_TYPES})", name="ck_programme_fee_structures_applicant_type"),
        sa.CheckConstraint("effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from", name="ck_programme_fee_structures_effective_window"),
        sa.ForeignKeyConstraint(["programme_id"], ["programmes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["intake_id"], ["intakes.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["attachment_media_id"], ["media.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    for column in ("applicant_type", "fee_category", "programme_id", "intake_id", "attachment_media_id", "is_active"):
        op.create_index(op.f(f"ix_programme_fee_structures_{column}"), "programme_fee_structures", [column])
    op.create_index("ix_programme_fee_structures_lookup", "programme_fee_structures", ["programme_id", "applicant_type", "intake_id", "is_active"])

    op.create_table(
        "admission_documents",
        *_base_columns(),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("document_type", sa.String(length=64), nullable=False),
        sa.Column("applicant_type", sa.String(length=64), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("external_url", sa.String(length=1024), nullable=True),
        sa.Column("media_id", sa.UUID(), nullable=True),
        sa.Column("pathway_id", sa.UUID(), nullable=True),
        sa.Column("programme_id", sa.UUID(), nullable=True),
        sa.Column("intake_id", sa.UUID(), nullable=True),
        sa.Column("is_published", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.CheckConstraint(f"document_type IN ({DOCUMENT_TYPES})", name="ck_admission_documents_document_type"),
        sa.CheckConstraint(f"applicant_type IS NULL OR applicant_type IN ({APPLICANT_TYPES})", name="ck_admission_documents_applicant_type"),
        sa.ForeignKeyConstraint(["media_id"], ["media.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["pathway_id"], ["admission_pathways.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["programme_id"], ["programmes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["intake_id"], ["intakes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    for column in ("slug", "document_type", "applicant_type", "media_id", "pathway_id", "programme_id", "intake_id", "is_published"):
        op.create_index(op.f(f"ix_admission_documents_{column}"), "admission_documents", [column])
    op.create_index("ix_admission_documents_public_lookup", "admission_documents", ["is_published", "document_type", "applicant_type", "display_order"])
    op.create_index("ix_admission_documents_programme_intake", "admission_documents", ["programme_id", "intake_id", "is_published"])

    op.create_table(
        "admission_faqs",
        *_base_columns(),
        sa.Column("question", sa.String(length=500), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=96), nullable=True),
        sa.Column("applicant_type", sa.String(length=64), nullable=True),
        sa.Column("pathway_id", sa.UUID(), nullable=True),
        sa.Column("is_published", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.CheckConstraint(f"applicant_type IS NULL OR applicant_type IN ({APPLICANT_TYPES})", name="ck_admission_faqs_applicant_type"),
        sa.ForeignKeyConstraint(["pathway_id"], ["admission_pathways.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    for column in ("category", "applicant_type", "pathway_id", "is_published"):
        op.create_index(op.f(f"ix_admission_faqs_{column}"), "admission_faqs", [column])
    op.create_index("ix_admission_faqs_public_order", "admission_faqs", ["is_published", "category", "display_order"])

    op.create_table(
        "admission_page_sections",
        *_base_columns(),
        sa.Column("page_key", sa.String(length=64), nullable=False),
        sa.Column("section_key", sa.String(length=128), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("subtitle", sa.String(length=255), nullable=True),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("layout_variant", sa.String(length=64), server_default="editorial", nullable=False),
        sa.Column("settings", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("items", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("media_id", sa.UUID(), nullable=True),
        sa.Column("is_enabled", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.CheckConstraint(f"page_key IN ({PAGE_KEYS})", name="ck_admission_page_sections_page_key"),
        sa.ForeignKeyConstraint(["media_id"], ["media.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("page_key", "section_key", name="uq_admission_page_sections_page_section"),
    )
    for column in ("page_key", "section_key", "media_id", "is_enabled"):
        op.create_index(op.f(f"ix_admission_page_sections_{column}"), "admission_page_sections", [column])
    op.create_index("ix_admission_page_sections_render", "admission_page_sections", ["page_key", "is_enabled", "display_order"])


def downgrade() -> None:
    op.drop_index("ix_admission_page_sections_render", table_name="admission_page_sections")
    for column in ("is_enabled", "media_id", "section_key", "page_key"):
        op.drop_index(op.f(f"ix_admission_page_sections_{column}"), table_name="admission_page_sections")
    op.drop_table("admission_page_sections")

    op.drop_index("ix_admission_faqs_public_order", table_name="admission_faqs")
    for column in ("is_published", "pathway_id", "applicant_type", "category"):
        op.drop_index(op.f(f"ix_admission_faqs_{column}"), table_name="admission_faqs")
    op.drop_table("admission_faqs")

    op.drop_index("ix_admission_documents_programme_intake", table_name="admission_documents")
    op.drop_index("ix_admission_documents_public_lookup", table_name="admission_documents")
    for column in ("is_published", "intake_id", "programme_id", "pathway_id", "media_id", "applicant_type", "document_type", "slug"):
        op.drop_index(op.f(f"ix_admission_documents_{column}"), table_name="admission_documents")
    op.drop_table("admission_documents")

    op.drop_index("ix_programme_fee_structures_lookup", table_name="programme_fee_structures")
    for column in ("is_active", "attachment_media_id", "intake_id", "programme_id", "fee_category", "applicant_type"):
        op.drop_index(op.f(f"ix_programme_fee_structures_{column}"), table_name="programme_fee_structures")
    op.drop_table("programme_fee_structures")

    op.drop_index("ix_admission_requirements_school_level", table_name="admission_requirements")
    op.drop_index("ix_admission_requirements_lookup", table_name="admission_requirements")
    for column in ("is_active", "pathway_id", "intake_id", "school_id", "programme_id", "level", "applicant_type"):
        op.drop_index(op.f(f"ix_admission_requirements_{column}"), table_name="admission_requirements")
    op.drop_table("admission_requirements")

    op.drop_index("ix_admission_pathways_public_order", table_name="admission_pathways")
    op.drop_index(op.f("ix_admission_pathways_is_published"), table_name="admission_pathways")
    op.drop_index(op.f("ix_admission_pathways_cover_image_id"), table_name="admission_pathways")
    op.drop_index(op.f("ix_admission_pathways_applicant_type"), table_name="admission_pathways")
    op.drop_index(op.f("ix_admission_pathways_slug"), table_name="admission_pathways")
    op.drop_table("admission_pathways")
