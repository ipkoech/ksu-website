"""Create school evidence review records."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260908_0024"
down_revision = "20260908_0023"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "school_evidence",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("school_id", sa.Uuid(), nullable=False),
        sa.Column("document_type", sa.String(64), nullable=False),
        sa.Column("title", sa.String(240), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("file_id", sa.Uuid()),
        sa.Column("verification_state", sa.String(32), nullable=False, server_default="pending"),
        sa.Column("reviewer_id", sa.Uuid()),
        sa.Column("reviewer_notes", sa.Text()),
        sa.Column("expires_at", sa.DateTime(timezone=True)),
        sa.Column("replacement_requested", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("metadata", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
    )
    op.create_index("ix_school_evidence_school_state_expiry", "school_evidence", ["school_id", "verification_state", "expires_at"])


def downgrade() -> None:
    op.drop_index("ix_school_evidence_school_state_expiry", table_name="school_evidence")
    op.drop_table("school_evidence")
