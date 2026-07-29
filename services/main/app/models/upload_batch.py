"""Resumable school media upload batch state."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base


class UploadBatch(Base):
    __tablename__ = "upload_batches"

    school_id: Mapped[uuid.UUID] = mapped_column(sa.ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    status: Mapped[str] = mapped_column(sa.String(24), nullable=False, server_default="pending", index=True)
    total_files: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    completed_files: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    failed_files: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    total_bytes: Mapped[int] = mapped_column(sa.BigInteger, nullable=False, server_default=sa.text("0"))
    received_bytes: Mapped[int] = mapped_column(sa.BigInteger, nullable=False, server_default=sa.text("0"))
    expires_at: Mapped[datetime] = mapped_column(sa.DateTime(timezone=True), nullable=False, index=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(sa.DateTime(timezone=True), nullable=True)

    files: Mapped[list["UploadBatchFile"]] = relationship(
        "UploadBatchFile",
        back_populates="batch",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="UploadBatchFile.display_order",
    )


class UploadBatchFile(Base):
    __tablename__ = "upload_batch_files"

    batch_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("upload_batches.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    client_reference: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    original_filename: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    file_size: Mapped[int] = mapped_column(sa.BigInteger, nullable=False)
    bytes_received: Mapped[int] = mapped_column(sa.BigInteger, nullable=False, server_default=sa.text("0"))
    checksum_sha256: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)
    target_entity_type: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True)
    target_entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.Uuid, nullable=True)
    target_role: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="attachment")
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    status: Mapped[str] = mapped_column(sa.String(24), nullable=False, server_default="pending", index=True)
    error: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    attempts: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("0"))
    media_id: Mapped[Optional[uuid.UUID]] = mapped_column(sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True)

    batch: Mapped[UploadBatch] = relationship("UploadBatch", back_populates="files")

    __table_args__ = (
        sa.UniqueConstraint("batch_id", "client_reference", name="uq_upload_batch_client_reference"),
        sa.CheckConstraint("file_size >= 0 AND bytes_received >= 0", name="ck_upload_batch_file_bytes"),
    )


__all__ = ["UploadBatch", "UploadBatchFile"]
