"""Generic public website pages crawled from the official Kisii University site."""

from __future__ import annotations

from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ksu_common.models.base import Base


class PublicSitePage(Base):
    """Official public-site page snapshot for pages without a more specific model."""

    __tablename__ = "public_site_pages"

    title: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    slug: Mapped[str] = mapped_column(sa.String(255), nullable=False, unique=True, index=True)
    path: Mapped[str] = mapped_column(sa.String(512), nullable=False, index=True)
    page_type: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    summary: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    plain_text: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    headings: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    links: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    images: Mapped[Optional[list[dict]]] = mapped_column(JSONB, nullable=True)
    source_url: Mapped[str] = mapped_column(sa.String(1024), nullable=False, unique=True, index=True)
    source_hash: Mapped[str] = mapped_column(sa.String(64), nullable=False, index=True)
    is_public: Mapped[bool] = mapped_column(sa.Boolean, nullable=False, server_default=sa.text("true"), index=True)
    status: Mapped[str] = mapped_column(sa.String(32), nullable=False, server_default="published", index=True)
    display_order: Mapped[int] = mapped_column(sa.Integer, nullable=False, server_default=sa.text("100"))

    __table_args__ = (
        sa.Index("ix_public_site_pages_type_public", "page_type", "is_public", "status"),
    )


__all__ = ["PublicSitePage"]
