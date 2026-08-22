"""Retire unsupported MFA controls and clear ineffective enrollment state.

Revision ID: 20260810_0810
Revises: 20260809_0800
"""

from __future__ import annotations

from alembic import op

revision = "20260810_0810"
down_revision = "20260809_0800"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # The old flag never triggered an MFA challenge. Clear it and its secrets
    # so no account or administrator is led to believe MFA protects a login.
    op.execute(
        """
        UPDATE main.users
        SET mfa_enabled = false, mfa_secret = NULL
        WHERE mfa_enabled IS TRUE OR mfa_secret IS NOT NULL
        """
    )
    op.execute("DELETE FROM main.settings WHERE key = 'require_2fa'")


def downgrade() -> None:
    # Unsupported security state cannot be reconstructed safely.
    pass
