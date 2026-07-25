"""Add innovation pathway models.

Revision ID: 20260702_0009
Revises: 20260701_0008
Create Date: 2026-07-02 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260702_0009"
down_revision = "20260701_0008"
branch_labels = None
depends_on = None


def base_columns() -> list[sa.Column]:
    return [
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    ]


def seo_columns() -> list[sa.Column]:
    return [
        sa.Column("meta_title", sa.String(length=255), nullable=True),
        sa.Column("meta_description", sa.String(length=500), nullable=True),
        sa.Column("keywords", sa.JSON(), nullable=True),
    ]


def attachment_columns(include_cover: bool = False) -> list[sa.Column]:
    columns = []
    if include_cover:
        columns.append(sa.Column("cover_image_id", sa.UUID(), nullable=True))
    columns.extend(
        [
            sa.Column("gallery_media_ids", sa.JSON(), nullable=True),
            sa.Column("attachment_media_ids", sa.JSON(), nullable=True),
            sa.Column("document_media_ids", sa.JSON(), nullable=True),
        ]
    )
    return columns


def public_columns(default_status: str = "active") -> list[sa.Column]:
    return [
        sa.Column("status", sa.String(length=32), server_default=default_status, nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("is_public", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("is_featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
    ]


def upgrade() -> None:
    op.create_table(
        "startup_ventures",
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("code", sa.String(length=32), nullable=True),
        sa.Column("innovation_id", sa.Uuid(), nullable=False),
        sa.Column("partner_id", sa.Uuid(), nullable=True),
        sa.Column("center_id", sa.Uuid(), nullable=True),
        sa.Column("lead_founder_id", sa.Uuid(), nullable=True),
        sa.Column("venture_stage", sa.String(length=32), server_default="idea", nullable=False),
        sa.Column("registration_status", sa.String(length=32), server_default="not_registered", nullable=False),
        sa.Column("registration_number", sa.String(length=128), nullable=True),
        sa.Column("incorporation_date", sa.Date(), nullable=True),
        sa.Column("sector", sa.String(length=128), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("problem", sa.Text(), nullable=True),
        sa.Column("solution", sa.Text(), nullable=True),
        sa.Column("business_model", sa.Text(), nullable=True),
        sa.Column("market", sa.Text(), nullable=True),
        sa.Column("traction", sa.Text(), nullable=True),
        sa.Column("founders", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("funding_raised", sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column("currency", sa.String(length=3), server_default="KES", nullable=False),
        sa.Column("website", sa.String(length=512), nullable=True),
        sa.Column("pitch_deck_url", sa.String(length=512), nullable=True),
        *public_columns("active"),
        *base_columns(),
        *seo_columns(),
        *attachment_columns(include_cover=True),
        sa.ForeignKeyConstraint(["innovation_id"], ["research.innovations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["partner_id"], ["research.partners.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        schema="research",
    )
    op.create_table(
        "incubation_records",
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("code", sa.String(length=32), nullable=True),
        sa.Column("innovation_id", sa.Uuid(), nullable=False),
        sa.Column("startup_id", sa.Uuid(), nullable=True),
        sa.Column("partner_id", sa.Uuid(), nullable=True),
        sa.Column("center_id", sa.Uuid(), nullable=True),
        sa.Column("program_name", sa.String(length=255), nullable=True),
        sa.Column("cohort", sa.String(length=128), nullable=True),
        sa.Column("incubation_type", sa.String(length=32), server_default="incubation", nullable=False),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("stage", sa.String(length=32), server_default="active", nullable=False),
        sa.Column("milestones", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("support_received", sa.Text(), nullable=True),
        sa.Column("outcomes", sa.Text(), nullable=True),
        sa.Column("next_steps", sa.Text(), nullable=True),
        sa.Column("mentor_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        *public_columns("active"),
        *base_columns(),
        *seo_columns(),
        *attachment_columns(),
        sa.ForeignKeyConstraint(["innovation_id"], ["research.innovations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["startup_id"], ["research.startup_ventures.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["partner_id"], ["research.partners.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        schema="research",
    )
    op.create_table(
        "innovation_competition_entries",
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("code", sa.String(length=32), nullable=True),
        sa.Column("innovation_id", sa.Uuid(), nullable=False),
        sa.Column("startup_id", sa.Uuid(), nullable=True),
        sa.Column("partner_id", sa.Uuid(), nullable=True),
        sa.Column("event_id", sa.Uuid(), nullable=True),
        sa.Column("center_id", sa.Uuid(), nullable=True),
        sa.Column("entry_type", sa.String(length=32), server_default="competition", nullable=False),
        sa.Column("competition_name", sa.String(length=255), nullable=True),
        sa.Column("organizer_name", sa.String(length=255), nullable=True),
        sa.Column("venue", sa.String(length=255), nullable=True),
        sa.Column("country", sa.String(length=128), nullable=True),
        sa.Column("event_date", sa.Date(), nullable=True),
        sa.Column("application_deadline", sa.Date(), nullable=True),
        sa.Column("entry_status", sa.String(length=32), server_default="submitted", nullable=False),
        sa.Column("award", sa.String(length=255), nullable=True),
        sa.Column("position", sa.String(length=64), nullable=True),
        sa.Column("prize_value", sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column("currency", sa.String(length=3), server_default="KES", nullable=False),
        sa.Column("pitch_summary", sa.Text(), nullable=True),
        sa.Column("judges_feedback", sa.Text(), nullable=True),
        sa.Column("public_url", sa.String(length=512), nullable=True),
        sa.Column("pitch_deck_url", sa.String(length=512), nullable=True),
        *public_columns("active"),
        *base_columns(),
        *seo_columns(),
        *attachment_columns(),
        sa.ForeignKeyConstraint(["innovation_id"], ["research.innovations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["startup_id"], ["research.startup_ventures.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["partner_id"], ["research.partners.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        schema="research",
    )
    op.create_table(
        "technology_transfer_cases",
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("slug", sa.String(length=128), nullable=False),
        sa.Column("code", sa.String(length=32), nullable=True),
        sa.Column("innovation_id", sa.Uuid(), nullable=False),
        sa.Column("partner_id", sa.Uuid(), nullable=True),
        sa.Column("center_id", sa.Uuid(), nullable=True),
        sa.Column("lead_officer_id", sa.Uuid(), nullable=True),
        sa.Column("case_type", sa.String(length=32), server_default="disclosure", nullable=False),
        sa.Column("transfer_status", sa.String(length=32), server_default="disclosed", nullable=False),
        sa.Column("disclosure_date", sa.Date(), nullable=True),
        sa.Column("protection_date", sa.Date(), nullable=True),
        sa.Column("agreement_date", sa.Date(), nullable=True),
        sa.Column("expiry_date", sa.Date(), nullable=True),
        sa.Column("ip_reference", sa.String(length=128), nullable=True),
        sa.Column("agreement_reference", sa.String(length=128), nullable=True),
        sa.Column("license_type", sa.String(length=128), nullable=True),
        sa.Column("territory", sa.String(length=128), nullable=True),
        sa.Column("exclusivity", sa.String(length=32), nullable=True),
        sa.Column("commercial_terms", sa.Text(), nullable=True),
        sa.Column("revenue_terms", sa.Text(), nullable=True),
        sa.Column("upfront_value", sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column("annual_value", sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column("revenue_generated", sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column("currency", sa.String(length=3), server_default="KES", nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("public_benefit", sa.Text(), nullable=True),
        sa.Column("next_steps", sa.Text(), nullable=True),
        *public_columns("active"),
        *base_columns(),
        *seo_columns(),
        *attachment_columns(),
        sa.ForeignKeyConstraint(["innovation_id"], ["research.innovations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["partner_id"], ["research.partners.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        schema="research",
    )

    indexes = {
        "startup_ventures": (
            ("slug", True),
            ("code", True),
            ("innovation_id", False),
            ("partner_id", False),
            ("center_id", False),
            ("lead_founder_id", False),
            ("venture_stage", False),
            ("registration_status", False),
            ("status", False),
            ("cover_image_id", False),
        ),
        "incubation_records": (
            ("slug", True),
            ("code", True),
            ("innovation_id", False),
            ("startup_id", False),
            ("partner_id", False),
            ("center_id", False),
            ("incubation_type", False),
            ("stage", False),
            ("status", False),
        ),
        "innovation_competition_entries": (
            ("slug", True),
            ("code", True),
            ("innovation_id", False),
            ("startup_id", False),
            ("partner_id", False),
            ("event_id", False),
            ("center_id", False),
            ("entry_type", False),
            ("entry_status", False),
            ("event_date", False),
            ("status", False),
        ),
        "technology_transfer_cases": (
            ("slug", True),
            ("code", True),
            ("innovation_id", False),
            ("partner_id", False),
            ("center_id", False),
            ("lead_officer_id", False),
            ("case_type", False),
            ("transfer_status", False),
            ("agreement_date", False),
            ("status", False),
        ),
    }
    for table_name, table_indexes in indexes.items():
        for column_name, unique in table_indexes:
            op.create_index(
                op.f(f"ix_research_{table_name}_{column_name}"),
                table_name,
                [column_name],
                unique=unique,
                schema="research",
            )


def downgrade() -> None:
    indexes = {
        "technology_transfer_cases": (
            "status",
            "agreement_date",
            "transfer_status",
            "case_type",
            "lead_officer_id",
            "center_id",
            "partner_id",
            "innovation_id",
            "code",
            "slug",
        ),
        "innovation_competition_entries": (
            "status",
            "event_date",
            "entry_status",
            "entry_type",
            "center_id",
            "event_id",
            "partner_id",
            "startup_id",
            "innovation_id",
            "code",
            "slug",
        ),
        "incubation_records": (
            "status",
            "stage",
            "incubation_type",
            "center_id",
            "partner_id",
            "startup_id",
            "innovation_id",
            "code",
            "slug",
        ),
        "startup_ventures": (
            "cover_image_id",
            "status",
            "registration_status",
            "venture_stage",
            "lead_founder_id",
            "center_id",
            "partner_id",
            "innovation_id",
            "code",
            "slug",
        ),
    }
    for table_name, columns in indexes.items():
        for column_name in columns:
            op.drop_index(op.f(f"ix_research_{table_name}_{column_name}"), table_name=table_name, schema="research")
    op.drop_table("technology_transfer_cases", schema="research")
    op.drop_table("innovation_competition_entries", schema="research")
    op.drop_table("incubation_records", schema="research")
    op.drop_table("startup_ventures", schema="research")
