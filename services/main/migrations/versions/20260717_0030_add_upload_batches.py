"""Add school media upload batches.

Revision ID: 20260717_0030
Revises: 20260717_0029
"""

from alembic import op
import sqlalchemy as sa


revision = "20260717_0030"
down_revision = "20260717_0029"
branch_labels = None
depends_on = None


def _base_columns():
    return (
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )


def upgrade() -> None:
    op.create_table(
        "upload_batches",
        sa.Column("school_id", sa.UUID(), nullable=False),
        sa.Column("created_by_id", sa.UUID(), nullable=True),
        sa.Column("status", sa.String(24), server_default="pending", nullable=False),
        sa.Column("total_files", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("completed_files", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("failed_files", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("total_bytes", sa.BigInteger(), server_default=sa.text("0"), nullable=False),
        sa.Column("received_bytes", sa.BigInteger(), server_default=sa.text("0"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        *_base_columns(),
        sa.ForeignKeyConstraint(["school_id"], ["schools.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    for field in ("school_id", "created_by_id", "status", "expires_at"):
        op.create_index(f"ix_upload_batches_{field}", "upload_batches", [field])

    op.create_table(
        "upload_batch_files",
        sa.Column("batch_id", sa.UUID(), nullable=False),
        sa.Column("client_reference", sa.String(128), nullable=False),
        sa.Column("original_filename", sa.String(255), nullable=False),
        sa.Column("mime_type", sa.String(128), nullable=False),
        sa.Column("file_size", sa.BigInteger(), nullable=False),
        sa.Column("bytes_received", sa.BigInteger(), server_default=sa.text("0"), nullable=False),
        sa.Column("checksum_sha256", sa.String(64), nullable=True),
        sa.Column("target_entity_type", sa.String(64), nullable=True),
        sa.Column("target_entity_id", sa.UUID(), nullable=True),
        sa.Column("target_role", sa.String(64), server_default="attachment", nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("100"), nullable=False),
        sa.Column("status", sa.String(24), server_default="pending", nullable=False),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column("attempts", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("media_id", sa.UUID(), nullable=True),
        *_base_columns(),
        sa.CheckConstraint("file_size >= 0 AND bytes_received >= 0", name="ck_upload_batch_file_bytes"),
        sa.ForeignKeyConstraint(["batch_id"], ["upload_batches.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["media_id"], ["media.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("batch_id", "client_reference", name="uq_upload_batch_client_reference"),
    )
    for field in ("batch_id", "checksum_sha256", "status", "media_id"):
        op.create_index(f"ix_upload_batch_files_{field}", "upload_batch_files", [field])


def downgrade() -> None:
    op.drop_table("upload_batch_files")
    op.drop_table("upload_batches")
