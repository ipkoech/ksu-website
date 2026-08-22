"""Add explicit user service trace and forced password-change state.

Revision ID: 20260810_0820
Revises: 20260810_0810
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260810_0820"
down_revision = "20260810_0810"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "service_memberships",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'::jsonb"),
            nullable=False,
        ),
        schema="main",
    )
    op.add_column(
        "users",
        sa.Column(
            "must_change_password",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        schema="main",
    )
    op.create_check_constraint(
        "ck_users_service_memberships_array",
        "users",
        "jsonb_typeof(service_memberships) = 'array'",
        schema="main",
    )


def downgrade() -> None:
    op.drop_constraint("ck_users_service_memberships_array", "users", schema="main", type_="check")
    op.drop_column("users", "must_change_password", schema="main")
    op.drop_column("users", "service_memberships", schema="main")
