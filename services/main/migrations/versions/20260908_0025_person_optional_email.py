"""Allow source-verified staff profiles whose email has not been supplied."""
from alembic import op
import sqlalchemy as sa

revision = "20260908_0025"
down_revision = "20260908_0024"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("persons", "email", existing_type=sa.String(320), nullable=True)


def downgrade() -> None:
    if op.get_bind().execute(sa.text("SELECT EXISTS (SELECT 1 FROM persons WHERE email IS NULL)")).scalar():
        raise RuntimeError("Supply verified emails for profiles with missing email before downgrading")
    op.alter_column("persons", "email", existing_type=sa.String(320), nullable=False)
