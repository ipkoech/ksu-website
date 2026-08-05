"""SQLAlchemy 2.0 base mixins — framework-agnostic, no Flask dependency."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional, TypeVar

import sqlalchemy as sa
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import Select

T = TypeVar("T", bound="Base")


class TimestampMixin:
    """UUID primary key + created_at / updated_at timestamps."""

    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
    )


class SoftDeleteMixin:
    """Soft-delete helpers — never hard-delete rows."""

    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True, default=None
    )

    def soft_delete(self, when: datetime | None = None) -> None:
        self.deleted_at = when or datetime.now(timezone.utc)

    def restore(self) -> None:
        self.deleted_at = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None


class SEOMixin:
    meta_title: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    meta_description: Mapped[Optional[str]] = mapped_column(sa.String(500), nullable=True)
    keywords: Mapped[Optional[dict]] = mapped_column(sa.JSON, nullable=True)


class PolymorphicMixin:
    related_entity_type: Mapped[Optional[str]] = mapped_column(
        sa.String(64), nullable=True, index=True
    )
    related_entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True), nullable=True, index=True
    )


class CoverImageRefMixin:
    """Reference a shared media record used as a cover image."""

    cover_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        nullable=True,
        index=True,
    )


class LogoRefMixin:
    """Reference a shared media record used as a logo."""

    logo_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        nullable=True,
        index=True,
    )


class PhotoRefMixin:
    """Reference a shared media record used as a profile photo."""

    photo_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        nullable=True,
        index=True,
    )


class ThumbnailRefMixin:
    """Reference a shared media record used as a thumbnail/alternate image."""

    thumbnail_image_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        nullable=True,
        index=True,
    )


class DocumentRefMixin:
    """Reference a shared media record used as a primary document."""

    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        nullable=True,
        index=True,
    )


class AttachmentRefsMixin:
    """Reference shared media records for multi-file attachments."""

    gallery_media_ids: Mapped[Optional[list[uuid.UUID]]] = mapped_column(sa.JSON, nullable=True)
    attachment_media_ids: Mapped[Optional[list[uuid.UUID]]] = mapped_column(sa.JSON, nullable=True)
    document_media_ids: Mapped[Optional[list[uuid.UUID]]] = mapped_column(sa.JSON, nullable=True)


class Base(TimestampMixin, SoftDeleteMixin, DeclarativeBase):
    """Base class for all ORM models.

    Every model gets:
    - `id`
    - `created_at`
    - `updated_at`
    - `deleted_at`
    """

    @classmethod
    def active_query(cls: type[T]) -> Select:
        """Return a select() that filters out soft-deleted rows."""
        return select(cls).where(cls.deleted_at.is_(None))

    @classmethod
    async def get_by_id(
        cls: type[T],
        db: AsyncSession,
        id: uuid.UUID,
        *,
        include_deleted: bool = False,
    ) -> T | None:
        """Fetch a single row by primary key, optionally filtering deleted."""
        query = select(cls).where(cls.id == id)
        if not include_deleted:
            query = query.where(cls.deleted_at.is_(None))
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def get_or_raise(
        cls: type[T],
        db: AsyncSession,
        id: uuid.UUID,
        *,
        error_message: str | None = None,
    ) -> T:
        """Fetch by ID or raise ValueError if not found."""
        instance = await cls.get_by_id(db, id)
        if instance is None:
            msg = error_message or f"{cls.__name__} not found"
            raise ValueError(msg)
        return instance

    @classmethod
    async def exists(
        cls: type[T],
        db: AsyncSession,
        id: uuid.UUID,
    ) -> bool:
        """Check if a non-deleted row exists."""
        instance = await cls.get_by_id(db, id)
        return instance is not None
