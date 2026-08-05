"""Read-only shared media mappings used by research public records."""

from __future__ import annotations

from typing import Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


def _media_url(value: str) -> str:
    if value.startswith(("http://", "https://", "data:", "blob:", "/")):
        return value

    path = value.replace("\\", "/").strip().lstrip("/")
    parts = [part for part in path.split("/") if part and part not in {".", ".."}]
    relative_path = "/".join(parts)
    return f"/uploads/{relative_path}" if relative_path else "/uploads"


class PublicMedia(Base):
    """Minimal mapping of the main service media table for public includes."""

    __tablename__ = "media"
    __table_args__ = {"schema": "main"}

    filename: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(sa.String(128), nullable=False)
    file_size: Mapped[int] = mapped_column(sa.BigInteger, nullable=False)
    storage_provider: Mapped[str] = mapped_column(sa.String(32), nullable=False)
    storage_path: Mapped[str] = mapped_column(sa.String(1024), nullable=False)
    public_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    cdn_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    alt_text: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    caption: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    media_type: Mapped[str] = mapped_column(sa.String(32), nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(sa.String(1024), nullable=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)
    is_processed: Mapped[bool] = mapped_column(sa.Boolean, nullable=False)

    @property
    def url(self) -> str:
        if self.cdn_url:
            return self.cdn_url
        if self.public_url:
            return _media_url(self.public_url)
        return _media_url(self.storage_path)


__all__ = ["PublicMedia"]
