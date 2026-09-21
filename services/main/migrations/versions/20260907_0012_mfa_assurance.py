"""Add authenticator enrollment, recovery and session assurance storage."""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "20260907_0012"
down_revision = "20260907_0011"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("SET LOCAL lock_timeout = '5s'")
    op.add_column("users", sa.Column("mfa_pending_secret", sa.String(255)))
    op.add_column("users", sa.Column("mfa_pending_expires_at", sa.DateTime(timezone=True)))
    op.add_column("users", sa.Column("mfa_last_counter", sa.BigInteger))
    op.add_column("users", sa.Column("mfa_recovery_hashes", JSONB))
    op.add_column("sessions", sa.Column("mfa_verified_at", sa.DateTime(timezone=True)))


def downgrade():
    op.drop_column("sessions", "mfa_verified_at")
    for column in ("mfa_recovery_hashes", "mfa_last_counter", "mfa_pending_expires_at", "mfa_pending_secret"):
        op.drop_column("users", column)
