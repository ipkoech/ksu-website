"""Add librarian-governed Library AI assistant persistence.

Revision ID: 20260728_0005
Revises: 20260630_0004
Create Date: 2026-07-28 16:00:00
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


revision = "20260728_0005"
down_revision = "20260630_0004"
branch_labels = None
depends_on = None


def _base_columns() -> list[sa.Column]:
    return [
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    ]


def _table_exists(table_name: str) -> bool:
    return table_name in sa.inspect(op.get_bind()).get_table_names(schema="library")


def upgrade() -> None:
    # The bootstrap migration creates from current ORM metadata, which may
    # already include assistant tables on a fresh database. Preserve those
    # tables and let the follow-up migrations add only missing revisions.
    if _table_exists("library_assistant_contexts"):
        return
    op.create_table(
        "library_assistant_contexts",
        *_base_columns(),
        sa.Column("library_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("audience", sa.String(255), nullable=True),
        sa.Column("instructions", sa.Text(), nullable=False),
        sa.Column("allowed_source_types", sa.JSON(), nullable=False),
        sa.Column("suggested_prompts", sa.JSON(), nullable=False),
        sa.Column("escalation_guidance", sa.Text(), nullable=True),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("is_public", sa.Boolean(), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["library_id"], ["library.libraries.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_library_assistant_contexts_slug"),
        schema="library",
    )
    op.create_index(
        "ix_library_assistant_contexts_slug",
        "library_assistant_contexts",
        ["slug"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_assistant_contexts_public_status_sort",
        "library_assistant_contexts",
        ["is_public", "status", "sort_order"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_assistant_contexts_library_id",
        "library_assistant_contexts",
        ["library_id"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_assistant_contexts_status",
        "library_assistant_contexts",
        ["status"],
        unique=False,
        schema="library",
    )

    op.create_table(
        "library_guest_sessions",
        *_base_columns(),
        sa.Column("session_hash", sa.String(128), nullable=False),
        sa.Column("preview_messages", sa.JSON(), nullable=False),
        sa.Column("answer_consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_hash", name="uq_library_guest_sessions_hash"),
        schema="library",
    )
    op.create_index(
        "ix_library_guest_sessions_expires",
        "library_guest_sessions",
        ["expires_at"],
        unique=False,
        schema="library",
    )

    op.create_table(
        "library_assistant_context_sources",
        *_base_columns(),
        sa.Column("context_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_type", sa.String(64), nullable=False),
        sa.Column("source_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("public_url", sa.String(1000), nullable=True),
        sa.Column("is_approved", sa.Boolean(), nullable=False),
        sa.Column("approved_by_person_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["context_id"],
            ["library.library_assistant_contexts.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "context_id",
            "source_type",
            "source_id",
            name="uq_library_assistant_context_sources_record",
        ),
        schema="library",
    )
    op.create_index(
        "ix_library_assistant_context_sources_context_id",
        "library_assistant_context_sources",
        ["context_id"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_assistant_context_sources_context_approved",
        "library_assistant_context_sources",
        ["context_id", "is_approved"],
        unique=False,
        schema="library",
    )

    op.create_table(
        "library_conversations",
        *_base_columns(),
        sa.Column("context_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("library_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("guest_session_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("person_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("verified_email", sa.String(320), nullable=False),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column("status", sa.String(24), nullable=False),
        sa.Column("assigned_to_person_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("page_context", sa.JSON(), nullable=True),
        sa.Column("last_message_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["context_id"],
            ["library.library_assistant_contexts.id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["library_id"], ["library.libraries.id"], ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(
            ["guest_session_id"],
            ["library.library_guest_sessions.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="library",
    )
    op.create_unique_constraint(
        "uq_library_conversations_guest_session",
        "library_conversations",
        ["guest_session_id"],
        schema="library",
    )
    op.create_index(
        "ix_library_conversations_context_id",
        "library_conversations",
        ["context_id"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_conversations_library_id",
        "library_conversations",
        ["library_id"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_conversations_person_id",
        "library_conversations",
        ["person_id"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_conversations_verified_email",
        "library_conversations",
        ["verified_email"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_conversations_status",
        "library_conversations",
        ["status"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_conversations_assigned_to_person_id",
        "library_conversations",
        ["assigned_to_person_id"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_conversations_last_message_at",
        "library_conversations",
        ["last_message_at"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_conversations_owner_status_updated",
        "library_conversations",
        ["verified_email", "status", "updated_at"],
        unique=False,
        schema="library",
    )

    op.create_table(
        "library_conversation_messages",
        *_base_columns(),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sender_type", sa.String(16), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("citations", sa.JSON(), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("sender_person_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["conversation_id"],
            ["library.library_conversations.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="library",
    )
    op.create_index(
        "ix_library_conversation_messages_conversation_id",
        "library_conversation_messages",
        ["conversation_id"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_conversation_messages_conversation_created",
        "library_conversation_messages",
        ["conversation_id", "created_at"],
        unique=False,
        schema="library",
    )

    op.create_table(
        "library_email_verifications",
        *_base_columns(),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column("guest_session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("token_hash", sa.String(128), nullable=False),
        sa.Column("code_hash", sa.String(128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("attempt_count", sa.Integer(), nullable=False),
        sa.Column("resend_count", sa.Integer(), nullable=False),
        sa.Column("last_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["guest_session_id"],
            ["library.library_guest_sessions.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["conversation_id"],
            ["library.library_conversations.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
        schema="library",
    )
    op.create_index(
        "ix_library_email_verifications_email",
        "library_email_verifications",
        ["email"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_email_verifications_guest_session_id",
        "library_email_verifications",
        ["guest_session_id"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_email_verifications_email_expiry",
        "library_email_verifications",
        ["email", "expires_at"],
        unique=False,
        schema="library",
    )
    op.create_index(
        "ix_library_email_verifications_expires_at",
        "library_email_verifications",
        ["expires_at"],
        unique=False,
        schema="library",
    )


def downgrade() -> None:
    op.drop_table("library_email_verifications", schema="library")
    op.drop_table("library_conversation_messages", schema="library")
    op.drop_table("library_conversations", schema="library")
    op.drop_table("library_assistant_context_sources", schema="library")
    op.drop_table("library_guest_sessions", schema="library")
    op.drop_table("library_assistant_contexts", schema="library")
