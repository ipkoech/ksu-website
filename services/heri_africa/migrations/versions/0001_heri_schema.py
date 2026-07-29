"""Create the HERI schema boundary.

The domain tables are added in the next migration task; this revision makes
clean-database bootstrapping and service ownership explicit first.
"""

from alembic import op

from app.models import Base  # noqa: E402

revision = "0001_heri_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS heri")
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())
    op.execute("DROP SCHEMA IF EXISTS heri CASCADE")
