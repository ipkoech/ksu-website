"""merge research donation and cleanup heads

Revision ID: 20260630_0007_merge_heads
Revises: 20260630_0005, 20260630_0006_merge_heads
Create Date: 2026-06-30
"""

from typing import Sequence, Union


revision = "20260630_0007_merge_heads"
down_revision: Union[str, Sequence[str], None] = (
    "20260630_0005",
    "20260630_0006_merge_heads",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
