"""add transactional domain event outbox

Revision ID: 20260717_0028
Revises: 20260716_0027
Create Date: 2026-07-17 18:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260717_0028"
down_revision = "20260716_0027"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "outbox_events",
        sa.Column("event_type", sa.String(length=128), nullable=False),
        sa.Column(
            "event_version",
            sa.Integer(),
            server_default=sa.text("1"),
            nullable=False,
        ),
        sa.Column(
            "occurred_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("scope_type", sa.String(length=32), nullable=False),
        sa.Column("scope_id", sa.UUID(), nullable=True),
        sa.Column("actor_id", sa.UUID(), nullable=True),
        sa.Column("resource_type", sa.String(length=64), nullable=False),
        sa.Column("resource_id", sa.UUID(), nullable=False),
        sa.Column(
            "payload",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'{}'::jsonb"),
            nullable=False,
        ),
        sa.Column(
            "delivery_status",
            sa.String(length=24),
            server_default="pending",
            nullable=False,
        ),
        sa.Column(
            "publish_attempts",
            sa.Integer(),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column("next_attempt_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("dead_lettered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "event_version > 0",
            name="ck_outbox_events_positive_version",
        ),
        sa.CheckConstraint(
            "delivery_status IN ('pending', 'publishing', 'published', 'failed', 'dead_letter')",
            name="ck_outbox_events_delivery_status",
        ),
        sa.ForeignKeyConstraint(
            ["actor_id"],
            ["users.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_outbox_events_pending",
        "outbox_events",
        ["next_attempt_at", "occurred_at"],
        unique=False,
        postgresql_where=sa.text(
            "published_at IS NULL AND dead_lettered_at IS NULL AND deleted_at IS NULL"
        ),
    )
    op.create_index(
        "ix_outbox_events_scope_occurred",
        "outbox_events",
        ["scope_type", "scope_id", "occurred_at"],
        unique=False,
    )
    op.create_index(
        "ix_outbox_events_type_occurred",
        "outbox_events",
        ["event_type", "occurred_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_table("outbox_events")
