"""Add school contact inquiry conversations.

Revision ID: 20260717_0031
Revises: 20260717_0030
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260717_0031"
down_revision = "20260717_0030"
branch_labels = None
depends_on = None


def _base_columns():
    return (
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )


def upgrade() -> None:
    op.create_table(
        "contact_inquiries",
        sa.Column("school_id", sa.UUID(), nullable=False),
        sa.Column("reference_number", sa.String(32), nullable=False),
        sa.Column("sender_name", sa.String(255), nullable=False),
        sa.Column("sender_email", sa.String(320), nullable=False),
        sa.Column("sender_phone", sa.String(32), nullable=True),
        sa.Column("subject", sa.String(255), nullable=False),
        sa.Column("category", sa.String(64), server_default="general", nullable=False),
        sa.Column("priority", sa.String(24), server_default="normal", nullable=False),
        sa.Column("assigned_to_user_id", sa.UUID(), nullable=True),
        sa.Column("status", sa.String(32), server_default="new", nullable=False),
        sa.Column("consent_to_contact", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("source", sa.String(64), server_default="school_website", nullable=False),
        sa.Column("source_ip", sa.String(64), nullable=True),
        sa.Column("user_agent", sa.String(512), nullable=True),
        sa.Column("spam_score", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("first_response_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_message_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        *_base_columns(),
        sa.ForeignKeyConstraint(["school_id"], ["schools.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["assigned_to_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("reference_number"),
    )
    for field in (
        "school_id",
        "reference_number",
        "sender_email",
        "category",
        "priority",
        "assigned_to_user_id",
        "status",
        "last_message_at",
    ):
        op.create_index(f"ix_contact_inquiries_{field}", "contact_inquiries", [field])

    op.create_table(
        "contact_inquiry_messages",
        sa.Column("inquiry_id", sa.UUID(), nullable=False),
        sa.Column("sender_type", sa.String(24), nullable=False),
        sa.Column("sender_user_id", sa.UUID(), nullable=True),
        sa.Column("sender_name", sa.String(255), nullable=True),
        sa.Column("sender_email", sa.String(320), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("is_internal_note", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("delivery_status", sa.String(24), server_default="pending", nullable=False),
        sa.Column("delivery_attempts", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("idempotency_key", sa.String(128), nullable=True),
        sa.Column("provider_message_id", sa.String(255), nullable=True),
        sa.Column("delivery_error", sa.Text(), nullable=True),
        sa.Column("reply_to_email", sa.String(320), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_at", sa.DateTime(timezone=True), nullable=True),
        *_base_columns(),
        sa.ForeignKeyConstraint(["inquiry_id"], ["contact_inquiries.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("inquiry_id", "idempotency_key", name="uq_inquiry_message_idempotency"),
    )
    for field in (
        "inquiry_id",
        "sender_type",
        "sender_user_id",
        "is_internal_note",
        "delivery_status",
    ):
        op.create_index(
            f"ix_contact_inquiry_messages_{field}",
            "contact_inquiry_messages",
            [field],
        )


def downgrade() -> None:
    op.drop_table("contact_inquiry_messages")
    op.drop_table("contact_inquiries")
