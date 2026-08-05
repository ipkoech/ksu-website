"""Make upload batches portal-aware (nullable school_id + portal discriminator)."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260805_0600"
down_revision = "20260805_0500"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "upload_batches",
        sa.Column("portal", sa.String(length=64), nullable=False, server_default="schools"),
    )
    op.create_index(
        op.f("ix_upload_batches_portal"),
        "upload_batches",
        ["portal"],
        unique=False,
    )
    op.alter_column(
        "upload_batches",
        "school_id",
        existing_type=sa.Uuid(),
        nullable=True,
    )


def downgrade() -> None:
    # Portal batches have no school scope; drop them before restoring NOT NULL.
    op.execute("DELETE FROM upload_batches WHERE school_id IS NULL")
    op.alter_column(
        "upload_batches",
        "school_id",
        existing_type=sa.Uuid(),
        nullable=False,
    )
    op.drop_index(op.f("ix_upload_batches_portal"), table_name="upload_batches")
    op.drop_column("upload_batches", "portal")
