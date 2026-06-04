"""Media model for file uploads and asset management."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ksu_common.models.base import Base

from ..core.config import get_settings

if TYPE_CHECKING:
    from .auth import User


def _media_url(value: str) -> str:
    """Build a public media URL without importing app.helpers during model import."""
    if value.startswith(("http://", "https://", "data:", "blob:")):
        return value

    settings = get_settings()
    media_prefix = settings.MEDIA_URL.strip("/")
    path = value.replace("\\", "/").strip().lstrip("/")
    while media_prefix and (path == media_prefix or path.startswith(f"{media_prefix}/")):
        if path == media_prefix:
            path = ""
            break
        path = path[len(media_prefix) + 1 :]

    parts = [part for part in path.split("/") if part and part not in {".", ".."}]
    relative_path = "/".join(parts)
    media_url = settings.MEDIA_URL.rstrip("/")
    return f"{media_url}/{relative_path}" if relative_path else media_url


class MediaFolder(Base):
    """Folder for organizing media files."""

    __tablename__ = "media_folders"

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(255), nullable=False, index=True)
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media_folders.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    scope_type: Mapped[Optional[str]] = mapped_column(sa.String(32), nullable=True, index=True)
    scope_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.Uuid,
        nullable=True,
        index=True,
    )

    # Relationships
    parent: Mapped[Optional["MediaFolder"]] = relationship(
        "MediaFolder",
        remote_side="MediaFolder.id",
        back_populates="children",
    )
    children: Mapped[list["MediaFolder"]] = relationship(
        "MediaFolder",
        back_populates="parent",
    )
    files: Mapped[list["Media"]] = relationship("Media", back_populates="folder")
    links: Mapped[list["MediaLink"]] = relationship("MediaLink", back_populates="folder")

    __table_args__ = (
        sa.UniqueConstraint("parent_id", "slug", name="uq_media_folder_parent_slug"),
    )

    def __repr__(self) -> str:
        return f"<MediaFolder {self.name}>"


class Media(Base):
    """
    Uploaded media file (images, documents, videos, etc.).

    Storage can be local filesystem, S3, or other providers.
    """

    __tablename__ = "media"

    # File info
    filename: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    file_size: Mapped[int] = mapped_column(sa.BigInteger, nullable=False)  # bytes
    file_hash: Mapped[Optional[str]] = mapped_column(sa.String(64), nullable=True, index=True)  # SHA256

    # Storage
    storage_provider: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="local",
    )  # local | s3 | gcs | azure
    storage_path: Mapped[str] = mapped_column(sa.String(1024), nullable=False)  # Path/key in storage
    public_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    cdn_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)

    # Organization
    folder_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media_folders.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Metadata
    title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    alt_text: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    caption: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    tags: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    credit: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)

    # Media type classification
    media_type: Mapped[str] = mapped_column(
        sa.String(32),
        nullable=False,
        server_default="file",
        index=True,
    )  # image | video | audio | document | file

    # Image-specific metadata
    width: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)
    height: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # Video/audio duration (seconds)
    duration: Mapped[Optional[int]] = mapped_column(sa.Integer, nullable=True)

    # Thumbnails for images/videos
    thumbnail_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    thumbnails: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)  # {small, medium, large}

    # Upload info
    uploaded_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Status
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))
    is_processed: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("false"))

    # Extended metadata (EXIF, etc.)
    extra_metadata: Mapped[Optional[dict]] = mapped_column("metadata", JSONB, nullable=True)

    # Relationships
    folder: Mapped[Optional["MediaFolder"]] = relationship("MediaFolder", back_populates="files")
    uploaded_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[uploaded_by_id])
    links: Mapped[list["MediaLink"]] = relationship(
        "MediaLink",
        back_populates="media",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    @property
    def url(self) -> str:
        """Get the best available URL for this media."""
        if self.cdn_url:
            return self.cdn_url
        if self.public_url:
            return _media_url(self.public_url)
        return _media_url(self.storage_path)

    @property
    def is_image(self) -> bool:
        return self.media_type == "image" or self.mime_type.startswith("image/")

    @property
    def is_video(self) -> bool:
        return self.media_type == "video" or self.mime_type.startswith("video/")

    @property
    def is_document(self) -> bool:
        return self.media_type == "document" or self.mime_type in (
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )

    def __repr__(self) -> str:
        return f"<Media {self.filename}>"


class MediaLink(Base):
    """Polymorphic attachment link for any entity."""

    __tablename__ = "media_links"

    media_id: Mapped[uuid.UUID] = mapped_column(
        sa.ForeignKey("media.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    entity_type: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    entity_id: Mapped[uuid.UUID] = mapped_column(sa.Uuid, nullable=False, index=True)
    role: Mapped[str] = mapped_column(sa.String(64), nullable=False, server_default="attachment")
    folder_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        sa.ForeignKey("media_folders.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"))

    media: Mapped["Media"] = relationship("Media", back_populates="links")
    folder: Mapped[Optional["MediaFolder"]] = relationship("MediaFolder", back_populates="links")

    __table_args__ = (
        sa.UniqueConstraint("media_id", "entity_type", "entity_id", "role", name="uq_media_link_entity_role"),
    )


__all__ = ["Media", "MediaFolder", "MediaLink"]
