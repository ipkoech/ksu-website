"""Add Library-owned durable audit relay storage before capture rollout.

Only a new table and its indexes are created; no existing rows are rewritten.
Downgrade refuses pending or retained events. Stop producers before rollback.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "20260906_0011"
down_revision = "20260807_0010"
branch_labels = None
depends_on = None
SCHEMA = "library"


def upgrade():
    op.create_table(
        "audit_relay",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("payload", JSONB, nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("available_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("claim_token", sa.Uuid),
        sa.Column("attempts", sa.Integer, nullable=False, server_default="0"),
        sa.Column("failed_at", sa.DateTime(timezone=True)),
        sa.Column("failure_code", sa.String(64)),
        schema=SCHEMA,
    )
    op.create_index("ix_audit_relay_available", "audit_relay", ["available_at", "id"],
                    schema=SCHEMA, postgresql_where=sa.text("failed_at IS NULL"))
    op.create_index("ix_audit_relay_failed", "audit_relay", ["failed_at"],
                    schema=SCHEMA, postgresql_where=sa.text("failed_at IS NOT NULL"))


def downgrade():
    table = sa.Table("audit_relay", sa.MetaData(), schema=SCHEMA)
    bind = op.get_bind()
    quoted = bind.dialect.identifier_preparer.format_table(table)
    bind.execute(sa.text(f"LOCK TABLE {quoted} IN ACCESS EXCLUSIVE MODE"))
    if bind.scalar(sa.select(sa.exists(sa.select(1).select_from(table)))):
        raise RuntimeError("drain or repair audit relay records before downgrade")
    op.drop_table("audit_relay", schema=SCHEMA)
