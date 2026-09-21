"""Encrypted, Library-owned transactional email delivery queue."""

import sqlalchemy as sa

from ksu_common.models.base import Base

notification_outbox = sa.Table(
    "notification_outbox", Base.metadata,
    sa.Column("id", sa.Uuid, primary_key=True),
    sa.Column("encrypted_payload", sa.Text),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    sa.Column("available_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
    sa.Column("claim_token", sa.Uuid),
    sa.Column("attempts", sa.Integer, nullable=False, server_default="0"),
    sa.Column("status", sa.String(16), nullable=False, server_default="pending"),
    sa.Column("failure_code", sa.String(64)),
    schema="library",
)
sa.Index("ix_library_notifications_ready", notification_outbox.c.available_at, notification_outbox.c.id,
         postgresql_where=notification_outbox.c.status == "pending")
