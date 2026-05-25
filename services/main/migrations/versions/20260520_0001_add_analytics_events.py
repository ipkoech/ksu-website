"""add analytics events

Revision ID: 20260520_0001
Revises: 99536bbf9625
Create Date: 2026-05-20 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260520_0001"
down_revision = "99536bbf9625"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "analytics_events",
        sa.Column("event_type", sa.String(length=64), nullable=False),
        sa.Column("source_app", sa.String(length=32), nullable=False),
        sa.Column("path", sa.String(length=1024), nullable=False),
        sa.Column("referrer", sa.String(length=1024), nullable=True),
        sa.Column("referrer_host", sa.String(length=255), nullable=True),
        sa.Column("entity_type", sa.String(length=64), nullable=True),
        sa.Column("entity_id", sa.UUID(), nullable=True),
        sa.Column("entity_slug", sa.String(length=255), nullable=True),
        sa.Column("entity_title", sa.String(length=500), nullable=True),
        sa.Column("session_hash", sa.String(length=128), nullable=True),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column("device_type", sa.String(length=64), nullable=True),
        sa.Column("browser", sa.String(length=64), nullable=True),
        sa.Column("os", sa.String(length=64), nullable=True),
        sa.Column("country_code", sa.String(length=8), nullable=True),
        sa.Column("user_id", sa.UUID(), nullable=True),
        sa.Column("event_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_analytics_events_country_code"), "analytics_events", ["country_code"], unique=False)
    op.create_index(op.f("ix_analytics_events_device_type"), "analytics_events", ["device_type"], unique=False)
    op.create_index(op.f("ix_analytics_events_entity_id"), "analytics_events", ["entity_id"], unique=False)
    op.create_index(op.f("ix_analytics_events_entity_slug"), "analytics_events", ["entity_slug"], unique=False)
    op.create_index(op.f("ix_analytics_events_entity_type"), "analytics_events", ["entity_type"], unique=False)
    op.create_index(op.f("ix_analytics_events_event_type"), "analytics_events", ["event_type"], unique=False)
    op.create_index(op.f("ix_analytics_events_occurred_at"), "analytics_events", ["occurred_at"], unique=False)
    op.create_index(op.f("ix_analytics_events_path"), "analytics_events", ["path"], unique=False)
    op.create_index(op.f("ix_analytics_events_referrer_host"), "analytics_events", ["referrer_host"], unique=False)
    op.create_index(op.f("ix_analytics_events_session_hash"), "analytics_events", ["session_hash"], unique=False)
    op.create_index(op.f("ix_analytics_events_source_app"), "analytics_events", ["source_app"], unique=False)
    op.create_index(op.f("ix_analytics_events_user_id"), "analytics_events", ["user_id"], unique=False)
    op.create_index("ix_analytics_events_entity", "analytics_events", ["entity_type", "entity_id"], unique=False)
    op.create_index("ix_analytics_events_path_time", "analytics_events", ["path", "occurred_at"], unique=False)
    op.create_index(
        "ix_analytics_events_source_type_time",
        "analytics_events",
        ["source_app", "event_type", "occurred_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_analytics_events_source_type_time", table_name="analytics_events")
    op.drop_index("ix_analytics_events_path_time", table_name="analytics_events")
    op.drop_index("ix_analytics_events_entity", table_name="analytics_events")
    op.drop_index(op.f("ix_analytics_events_user_id"), table_name="analytics_events")
    op.drop_index(op.f("ix_analytics_events_source_app"), table_name="analytics_events")
    op.drop_index(op.f("ix_analytics_events_session_hash"), table_name="analytics_events")
    op.drop_index(op.f("ix_analytics_events_referrer_host"), table_name="analytics_events")
    op.drop_index(op.f("ix_analytics_events_path"), table_name="analytics_events")
    op.drop_index(op.f("ix_analytics_events_occurred_at"), table_name="analytics_events")
    op.drop_index(op.f("ix_analytics_events_event_type"), table_name="analytics_events")
    op.drop_index(op.f("ix_analytics_events_entity_type"), table_name="analytics_events")
    op.drop_index(op.f("ix_analytics_events_entity_slug"), table_name="analytics_events")
    op.drop_index(op.f("ix_analytics_events_entity_id"), table_name="analytics_events")
    op.drop_index(op.f("ix_analytics_events_device_type"), table_name="analytics_events")
    op.drop_index(op.f("ix_analytics_events_country_code"), table_name="analytics_events")
    op.drop_table("analytics_events")
