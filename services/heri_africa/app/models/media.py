from __future__ import annotations

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base
from .content import UUIDMixin


class MediaAsset(UUIDMixin, Base):
    __tablename__ = "media_assets"
    file_name: Mapped[str] = mapped_column(String(255))
    mime_type: Mapped[str] = mapped_column(String(120))
    file_size: Mapped[int] = mapped_column(Integer)
    storage_path: Mapped[str] = mapped_column(String(500))
    public_url: Mapped[str | None] = mapped_column(String(500))
    alt_text: Mapped[str] = mapped_column(String(500), default="")
    caption: Mapped[str | None] = mapped_column(Text)
    credit: Mapped[str | None] = mapped_column(String(255))
    width: Mapped[int | None] = mapped_column(Integer)
    height: Mapped[int | None] = mapped_column(Integer)
