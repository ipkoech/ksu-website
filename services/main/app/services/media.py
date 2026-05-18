"""Media service."""

from __future__ import annotations

import uuid

from fastapi import UploadFile
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import Sequence

from ksu_common import PaginatedResult

from ..helpers.slug import unique_slug
from ..models import User
from ..helpers.storage import delete_file, upload_file
from ..models import Media, MediaFolder, MediaLink
from ._base import paginate_query


class MediaService:
    """Media upload and management."""

    @staticmethod
    async def upload(
        db: AsyncSession,
        *,
        file: UploadFile,
        folder_id: uuid.UUID | None = None,
        uploaded_by_id: uuid.UUID,
        is_public: bool = False,
    ) -> Media:
        folder_path = ""
        if folder_id:
            folder = await MediaFolder.get_by_id(db, folder_id)
            if folder is None:
                raise ValueError("Media folder not found")
            folder_path = folder.slug
        metadata = await upload_file(file, folder_path)
        media = Media(
            folder_id=folder_id,
            uploaded_by_id=uploaded_by_id,
            is_public=is_public,
            is_processed=True,
            media_type=_infer_media_type(metadata["mime_type"]),
            **metadata,
        )
        db.add(media)
        await db.flush()
        return media

    @staticmethod
    async def get_by_id(db: AsyncSession, media_id: uuid.UUID, *, load_options: Sequence = ()) -> Media | None:
        query = Media.active_query().where(Media.id == media_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_authorized_by_id(db: AsyncSession, media_id: uuid.UUID, user: User) -> Media | None:
        media = await MediaService.get_by_id(db, media_id)
        if media is None:
            return None
        if await MediaService.can_view_media(db, media, user):
            return media
        return None

    @staticmethod
    async def delete(db: AsyncSession, media: Media) -> None:
        media.soft_delete()
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        user: User,
        page: int = 1,
        per_page: int = 20,
        folder_id: uuid.UUID | None = None,
        media_type: str | None = None,
        uploaded_by_id: uuid.UUID | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = Media.active_query().outerjoin(MediaFolder, Media.folder_id == MediaFolder.id).order_by(Media.created_at.desc())
        query = query.where(await MediaService._visibility_filter(user))
        if load_options:
            query = query.options(*load_options)
        if folder_id:
            query = query.where(Media.folder_id == folder_id)
        if media_type:
            query = query.where(Media.media_type == media_type)
        if uploaded_by_id:
            query = query.where(Media.uploaded_by_id == uploaded_by_id)
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def create_folder(db: AsyncSession, **data) -> MediaFolder:
        if not data.get("slug") and data.get("name"):
            data["slug"] = await unique_slug(db, MediaFolder, data["name"])
        folder = MediaFolder(**data)
        db.add(folder)
        await db.flush()
        return folder

    @staticmethod
    async def list_folders(
        db: AsyncSession,
        *,
        user: User,
        parent_id: uuid.UUID | None = None,
        load_options: Sequence = (),
    ) -> list[MediaFolder]:
        query = MediaFolder.active_query().order_by(MediaFolder.name.asc())
        query = query.where(await MediaService._folder_visibility_filter(user))
        if load_options:
            query = query.options(*load_options)
        if parent_id is None:
            query = query.where(MediaFolder.parent_id.is_(None))
        else:
            query = query.where(MediaFolder.parent_id == parent_id)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def link_media(
        db: AsyncSession,
        *,
        media_id: uuid.UUID,
        entity_type: str,
        entity_id: uuid.UUID,
        role: str = "attachment",
        folder_id: uuid.UUID | None = None,
        display_order: int = 100,
        is_public: bool = True,
    ) -> MediaLink:
        link = MediaLink(
            media_id=media_id,
            entity_type=entity_type,
            entity_id=entity_id,
            role=role,
            folder_id=folder_id,
            display_order=display_order,
            is_public=is_public,
        )
        db.add(link)
        await db.flush()
        return link

    @staticmethod
    async def list_links(
        db: AsyncSession,
        *,
        user: User,
        entity_type: str,
        entity_id: uuid.UUID,
        role: str | None = None,
        load_options: Sequence = (),
    ) -> list[MediaLink]:
        query = (
            MediaLink.active_query()
            .options(selectinload(MediaLink.media), selectinload(MediaLink.folder))
            .join(Media, MediaLink.media_id == Media.id)
            .outerjoin(MediaFolder, Media.folder_id == MediaFolder.id)
            .where(
                MediaLink.entity_type == entity_type,
                MediaLink.entity_id == entity_id,
            )
        )
        query = query.where(await MediaService._visibility_filter(user))
        if load_options:
            query = query.options(*load_options)
        if role:
            query = query.where(MediaLink.role == role)
        result = await db.execute(query.order_by(MediaLink.display_order.asc(), MediaLink.created_at.asc()))
        return list(result.scalars().all())

    @staticmethod
    async def can_view_media(db: AsyncSession, media: Media, user: User) -> bool:
        if media.is_public:
            return True
        if media.uploaded_by_id == user.id:
            return True
        if user.has_role("admin"):
            return True
        if media.folder and await MediaService._has_scope_access(user, media.folder.scope_type, media.folder.scope_id):
            return True
        return False

    @staticmethod
    async def _has_scope_access(user: User, scope_type: str | None, scope_id: uuid.UUID | None) -> bool:
        if scope_type is None or scope_id is None:
            return False
        for assignment in user.role_assignments:
            if assignment.is_active and assignment.scope_type == scope_type and assignment.scope_id == scope_id:
                return True
        return False

    @staticmethod
    async def _visibility_filter(user: User):
        scope_filters = []
        for assignment in user.role_assignments:
            if assignment.is_active and assignment.scope_type and assignment.scope_id:
                scope_filters.append(and_(MediaFolder.scope_type == assignment.scope_type, MediaFolder.scope_id == assignment.scope_id))
        if user.has_role("admin"):
            return True
        return or_(
            Media.is_public.is_(True),
            Media.uploaded_by_id == user.id,
            *scope_filters,
        )

    @staticmethod
    async def _folder_visibility_filter(user: User):
        scope_filters = []
        for assignment in user.role_assignments:
            if assignment.is_active and assignment.scope_type and assignment.scope_id:
                scope_filters.append(and_(MediaFolder.scope_type == assignment.scope_type, MediaFolder.scope_id == assignment.scope_id))
        if user.has_role("admin"):
            return True
        return or_(
            MediaFolder.is_public.is_(True),
            *scope_filters,
        )


def _infer_media_type(mime_type: str) -> str:
    if mime_type.startswith("image/"):
        return "image"
    if mime_type.startswith("video/"):
        return "video"
    if mime_type.startswith("audio/"):
        return "audio"
    if mime_type in {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }:
        return "document"
    return "file"
