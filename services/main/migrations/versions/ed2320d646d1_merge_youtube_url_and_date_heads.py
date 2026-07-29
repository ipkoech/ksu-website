"""merge youtube_url and date heads

Revision ID: ed2320d646d1
Revises: 20260525_0002, 350b401d06a9
Create Date: 2026-06-25 16:26:36.719786
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa



# revision identifiers, used by Alembic.
revision = 'ed2320d646d1'
down_revision = ('20260525_0002', '350b401d06a9')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
