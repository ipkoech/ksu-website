"""Align HERI partner projections with Research Service centres and partners."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0004_partner_center_alignment"
down_revision = "0003_public_work_content"
branch_labels = None
depends_on = None


def upgrade() -> None:
    columns = (
        sa.Column("research_partner_id", sa.Uuid(), nullable=True),
        sa.Column("research_center_id", sa.Uuid(), nullable=True),
        sa.Column("partner_type", sa.String(32), nullable=True),
        sa.Column("partnership_level", sa.String(32), nullable=True),
        sa.Column("about", sa.Text(), nullable=True),
        sa.Column("collaboration_areas", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("partnership_start", sa.Date(), nullable=True),
        sa.Column("partnership_end", sa.Date(), nullable=True),
        sa.Column("mou_signed_date", sa.Date(), nullable=True),
        sa.Column("mou_expiry_date", sa.Date(), nullable=True),
        sa.Column("relationship_status", sa.String(32), server_default="active", nullable=False),
        sa.Column("relationship_notes", sa.Text(), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default="100", nullable=False),
    )
    for column in columns:
        op.add_column("partners", column, schema="heri")
    op.create_index("ix_heri_partners_research_partner_id", "partners", ["research_partner_id"], schema="heri")
    op.create_index("ix_heri_partners_research_center_id", "partners", ["research_center_id"], schema="heri")
    op.create_index("ix_heri_partners_relationship_status", "partners", ["relationship_status"], schema="heri")


def downgrade() -> None:
    for name in ("relationship_status", "research_center_id", "research_partner_id"):
        op.drop_index(f"ix_heri_partners_{name}", table_name="partners", schema="heri") if name != "relationship_status" else op.drop_index("ix_heri_partners_relationship_status", table_name="partners", schema="heri")
    for name in ("display_order", "relationship_notes", "relationship_status", "mou_expiry_date", "mou_signed_date", "partnership_end", "partnership_start", "collaboration_areas", "about", "partnership_level", "partner_type", "research_center_id", "research_partner_id"):
        op.drop_column("partners", name, schema="heri")
