"""Merge the legacy guides branch into the active library migration chain.

Revision ID: 20260807_0010
Revises: 20260622_0003, 20260806_0009
Create Date: 2026-08-07
"""

from __future__ import annotations

revision = "20260807_0010"
down_revision = ("20260622_0003", "20260806_0009")
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Merge migration histories without changing schema objects."""


def downgrade() -> None:
    """Split the migration histories without changing schema objects."""
