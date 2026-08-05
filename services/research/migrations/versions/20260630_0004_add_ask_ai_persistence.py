"""add ask ai persistence

Revision ID: 20260630_0004
Revises: 20260630_0003
Create Date: 2026-06-30 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260630_0004"
down_revision = "20260630_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ai_conversations",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=255), server_default="Research Ask AI", nullable=False),
        sa.Column("section_key", sa.String(length=64), nullable=True),
        sa.Column("resource_key", sa.String(length=96), nullable=True),
        sa.Column("record_id", sa.String(length=96), nullable=True),
        sa.Column("context", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("is_archived", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        schema="research",
    )
    op.create_index("ix_research_ai_conversations_user_id", "ai_conversations", ["user_id"], schema="research")
    op.create_index("ix_research_ai_conversations_section_key", "ai_conversations", ["section_key"], schema="research")
    op.create_index("ix_research_ai_conversations_resource_key", "ai_conversations", ["resource_key"], schema="research")
    op.create_index("ix_research_ai_conversations_record_id", "ai_conversations", ["record_id"], schema="research")
    op.create_index("ix_research_ai_conversations_is_archived", "ai_conversations", ["is_archived"], schema="research")

    op.create_table(
        "ai_messages",
        sa.Column("conversation_id", sa.Uuid(), nullable=False),
        sa.Column("role", sa.String(length=24), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("content_format", sa.String(length=24), server_default="markdown", nullable=False),
        sa.Column("context_snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("references", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["conversation_id"], ["research.ai_conversations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        schema="research",
    )
    op.create_index("ix_research_ai_messages_conversation_id", "ai_messages", ["conversation_id"], schema="research")
    op.create_index("ix_research_ai_messages_role", "ai_messages", ["role"], schema="research")


def downgrade() -> None:
    op.drop_index("ix_research_ai_messages_role", table_name="ai_messages", schema="research")
    op.drop_index("ix_research_ai_messages_conversation_id", table_name="ai_messages", schema="research")
    op.drop_table("ai_messages", schema="research")
    op.drop_index("ix_research_ai_conversations_is_archived", table_name="ai_conversations", schema="research")
    op.drop_index("ix_research_ai_conversations_record_id", table_name="ai_conversations", schema="research")
    op.drop_index("ix_research_ai_conversations_resource_key", table_name="ai_conversations", schema="research")
    op.drop_index("ix_research_ai_conversations_section_key", table_name="ai_conversations", schema="research")
    op.drop_index("ix_research_ai_conversations_user_id", table_name="ai_conversations", schema="research")
    op.drop_table("ai_conversations", schema="research")
