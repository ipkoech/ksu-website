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
    tables = [
        table
        for table_name, table in Base.metadata.tables.items()
        if table_name != "heri.command_idempotency"
    ]
    Base.metadata.create_all(bind=op.get_bind(), tables=tables)


def downgrade() -> None:
    tables = [
        table
        for table_name, table in Base.metadata.tables.items()
        if table_name != "heri.command_idempotency"
    ]
    Base.metadata.drop_all(bind=op.get_bind(), tables=tables)
    op.execute("DROP SCHEMA IF EXISTS heri CASCADE")
