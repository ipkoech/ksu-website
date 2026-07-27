"""Create the HERI schema boundary.

The domain tables are added in the next migration task; this revision makes
clean-database bootstrapping and service ownership explicit first.
"""

from alembic import op

revision = "0001_heri_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS heri")


def downgrade() -> None:
    op.execute("DROP SCHEMA IF EXISTS heri CASCADE")
