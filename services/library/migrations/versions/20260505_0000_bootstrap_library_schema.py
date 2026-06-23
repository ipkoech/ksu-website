"""Bootstrap the library service schema from the current ORM metadata.

Revision ID: 20260505_0000
Revises:
Create Date: 2026-05-05 00:00:00
"""

from __future__ import annotations

from alembic import op

from app.models import Base


revision = "20260505_0000"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind)
