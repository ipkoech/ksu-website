"""Media service."""

from __future__ import annotations

import re
import uuid

from fastapi import UploadFile
from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import Sequence

from ksu_common import PaginatedResult

from ..core.config import get_settings
from ..helpers.slug import unique_slug
from ..models import (
    Announcement,
    Blog,
    Board,
    ClubActivity,
    Event,
    News,
    PageSection,
    PartnershipSpotlight,
    Person,
    School,
    Slider,
    SliderGroup,
    User,
)
from ..helpers.storage import delete_file, upload_file
from ..models import Media, MediaFolder, MediaLink
from ..security.role_assignments import is_role_assignment_current
from ._base import apply_updates, ilike_any, paginate_query

settings = get_settings()

CV_MIME_TYPES = frozenset(
    {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
)


ENTITY_FOLDER_ALIASES = {
    "campus": "campuses",
    "campuses": "campuses",
    "school": "schools",
    "schools": "schools",
    "department": "departments",
    "departments": "departments",
    "person": "persons",
    "persons": "persons",
    "staff": "persons",
    "programme": "programmes",
    "programmes": "programmes",
    "program": "programmes",
    "programs": "programmes",
    "division": "divisions",
    "divisions": "divisions",
    "wing": "wings",
    "wings": "wings",
    "board": "boards",
    "boards": "boards",
    "news": "news",
    "blog": "blogs",
    "blogs": "blogs",
    "event": "events",
    "events": "events",
    "announcement": "announcements",
    "announcements": "announcements",
    "slider": "sliders",
    "sliders": "sliders",
    "slider-group": "slider-groups",
    "slider-groups": "slider-groups",
}

DIRECT_ATTACHMENT_SCOPE_TYPES = frozenset(
    {
        "campus",
        "school",
        "department",
        "programme",
        "division",
        "wing",
    }
)

CONTENT_ATTACHMENT_MODELS = {
    "announcement": Announcement,
    "blog": Blog,
    "club_activity": ClubActivity,
    "event": Event,
    "news": News,
    "slider": Slider,
    "slider_group": SliderGroup,
    "page_section": PageSection,
    "partnership_spotlight": PartnershipSpotlight,
}


def _safe_folder_segment(value: str) -> str:
    segment = re.sub(r"[^a-zA-Z0-9_-]+", "-", value.strip().replace("_", "-")).strip("-").lower()
    return segment or "general"


def build_entity_upload_folder(entity_type: str, entity_id: uuid.UUID, role: str | None = None) -> str:
    """Build deterministic upload folders like schools/{id}/cover-image."""
    normalized_type = _safe_folder_segment(entity_type)
    entity_folder = ENTITY_FOLDER_ALIASES.get(normalized_type, normalized_type)
    parts = [entity_folder, str(entity_id)]
    if role:
        parts.append(_safe_folder_segment(role))
    return "/".join(parts)


class MediaService:
    """Media upload and management."""

    @staticmethod
    def validate_cv_mime_type(mime_type: str | None) -> None:
        if mime_type not in CV_MIME_TYPES:
            raise ValueError("CV file must be a PDF or Word document.")

    @staticmethod
    def validate_cv_media(media: Media) -> None:
        if media.media_type != "document":
            raise ValueError("CV file must be a document.")
        mime_type = getattr(media, "mime_type", None)
        if mime_type is not None:
            MediaService.validate_cv_mime_type(mime_type)

    @staticmethod
    async def ensure_school_media_folder(
        db: AsyncSession,
        school_id: uuid.UUID,
    ) -> MediaFolder:
        """Return the deterministic private media folder for one school."""
        slug = build_entity_upload_folder("school", school_id)
        result = await db.execute(
            MediaFolder.active_query().where(
                MediaFolder.parent_id.is_(None),
                MediaFolder.slug == slug,
                MediaFolder.scope_type == "school",
                MediaFolder.scope_id == school_id,
            )
        )
        folder = result.scalar_one_or_none()
        if folder is not None:
            return folder

        school_result = await db.execute(
            select(School.name, School.code).where(
                School.id == school_id,
                School.deleted_at.is_(None),
            ).with_for_update()
        )
        school = school_result.one_or_none()
        if school is None:
            raise ValueError("School not found")
        folder = MediaFolder(
            name=f"{school.code or school.name} Media",
            slug=slug,
            description="Media owned and managed by this school.",
            is_public=False,
            scope_type="school",
            scope_id=school_id,
        )
        db.add(folder)
        await db.flush()
        return folder

    @staticmethod
    async def upload(
        db: AsyncSession,
        *,
        file: UploadFile,
        folder_id: uuid.UUID | None = None,
        uploaded_by_id: uuid.UUID,
        is_public: bool = False,
        entity_type: str | None = None,
        entity_id: uuid.UUID | None = None,
        role: str | None = None,
        folder_path: str | None = None,
    ) -> Media:
        _validate_upload_mime_type(file.content_type)

        resolved_folder_path = folder_path or ""
        folder: MediaFolder | None = None
        attachment_scope: tuple[str, uuid.UUID | None] | None = None
        if entity_type or entity_id:
            if not entity_type or entity_id is None:
                raise ValueError("Both entity_type and entity_id are required for entity uploads")
            resolved_folder_path = build_entity_upload_folder(entity_type, entity_id, role)
            attachment_scope = await MediaService.get_attachment_scope(
                db,
                entity_type=entity_type,
                entity_id=entity_id,
            )
            if (
                folder_id is None
                and attachment_scope[0] == "school"
                and attachment_scope[1] is not None
            ):
                folder = await MediaService.ensure_school_media_folder(db, attachment_scope[1])
                folder_id = folder.id

        if folder_id:
            folder = folder or await MediaFolder.get_by_id(db, folder_id)
            if folder is None:
                raise ValueError("Media folder not found")
            if not resolved_folder_path:
                resolved_folder_path = folder.slug

        metadata = await upload_file(file, resolved_folder_path)
        try:
            _validate_upload_size(metadata["file_size"])
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
            if entity_type and entity_id is not None:
                scope_type, scope_id = attachment_scope or await MediaService.get_attachment_scope(
                    db, entity_type=entity_type, entity_id=entity_id
                )
            if scope_type == "club":
                media.is_public = False
            link_metadata = {"is_public": is_public}
            if folder_id is not None:
                link_metadata["folder_id"] = folder_id
            if scope_type == "school":
                link_metadata.update(
                    status="draft",
                    workflow_status="draft",
                    owner_portal="schools",
                    owner_scope_type="school",
                    owner_scope_id=scope_id,
                    author_user_id=uploaded_by_id,
                )
            if scope_type == "club":
                link_metadata = {
                    "is_public": False,
                    "status": "draft",
                    "workflow_status": "draft",
                    "owner_portal": "student-clubs",
                    "owner_scope_type": "club",
                    "owner_scope_id": scope_id,
                    "author_user_id": uploaded_by_id,
                }
            await MediaService.link_media(
                db,
                media_id=media.id,
                entity_type=entity_type,
                entity_id=entity_id,
                role=role or "attachment",
                **link_metadata,
            )
            return media
        except Exception:
            await db.rollback()
            try:
                await delete_file(metadata["storage_path"])
            except Exception:
                pass
            raise

    @staticmethod
    async def get_attachment_scope(
        db: AsyncSession,
        *,
        entity_type: str,
        entity_id: uuid.UUID,
    ) -> tuple[str, uuid.UUID | None]:
        """Resolve an attachment target to the scope used for authorization."""
        normalized_type = _safe_folder_segment(entity_type).replace("-", "_")
        normalized_type = {
            "campuses": "campus",
            "schools": "school",
            "departments": "department",
            "programmes": "programme",
            "programs": "programme",
            "divisions": "division",
            "wings": "wing",
            "persons": "person",
            "blogs": "blog",
            "events": "event",
            "announcements": "announcement",
            "sliders": "slider",
            "slider_groups": "slider_group",
            "page_sections": "page_section",
            "partnership_spotlights": "partnership_spotlight",
        }.get(normalized_type, normalized_type)
        if normalized_type in DIRECT_ATTACHMENT_SCOPE_TYPES:
            return normalized_type, entity_id

        if normalized_type == "club_activity":
            result = await db.execute(
                select(ClubActivity.owner_scope_type, ClubActivity.owner_scope_id, ClubActivity.club_id).where(
                    ClubActivity.id == entity_id,
                    ClubActivity.deleted_at.is_(None),
                )
            )
            scope = result.one_or_none()
            if scope is not None:
                return scope[0] or "club", scope[1] or scope[2]

        if normalized_type == "person":
            result = await db.execute(
                select(Person.department_id).where(Person.id == entity_id, Person.deleted_at.is_(None))
            )
            department_id = result.scalar_one_or_none()
            return ("department", department_id) if department_id else ("person", entity_id)

        content_model = CONTENT_ATTACHMENT_MODELS.get(normalized_type)
        if content_model is not None:
            if normalized_type == "partnership_spotlight":
                result = await db.execute(
                    select(
                        PartnershipSpotlight.owner_scope_type,
                        PartnershipSpotlight.owner_scope_id,
                    ).where(
                        PartnershipSpotlight.id == entity_id,
                        PartnershipSpotlight.deleted_at.is_(None),
                    )
                )
                scope = result.one_or_none()
                if scope is not None:
                    return scope[0] or "global", scope[1]
            result = await db.execute(
                select(content_model.scope_type, content_model.scope_id).where(
                    content_model.id == entity_id,
                    content_model.deleted_at.is_(None),
                )
            )
            scope = result.one_or_none()
            if scope is not None:
                return scope[0] or "global", scope[1]

        if normalized_type == "board":
            result = await db.execute(
                select(Board.parent_entity_type, Board.parent_entity_id, Board.division_id).where(
                    Board.id == entity_id,
                    Board.deleted_at.is_(None),
                )
            )
            scope = result.one_or_none()
            if scope is not None:
                if scope[0] and scope[1]:
                    return scope[0], scope[1]
                if scope[2]:
                    return "division", scope[2]
                return "university", None

        return normalized_type, entity_id

    @staticmethod
    def serialize_link(link: MediaLink) -> dict:
        """Return the display-ready attachment contract shared by media link endpoints."""
        media = link.media
        return {
            "id": link.id,
            "media_id": link.media_id,
            "entity_type": link.entity_type,
            "entity_id": link.entity_id,
            "role": link.role,
            "folder_id": link.folder_id,
            "display_order": link.display_order,
            "is_public": link.is_public,
            "is_published": getattr(link, "is_published", False),
            "status": getattr(link, "status", "draft"),
            "workflow_status": getattr(link, "workflow_status", "draft"),
            "owner_portal": getattr(link, "owner_portal", None),
            "owner_scope_type": getattr(link, "owner_scope_type", None),
            "owner_scope_id": getattr(link, "owner_scope_id", None),
            "submitted_at": getattr(link, "submitted_at", None),
            "approved_at": getattr(link, "approved_at", None),
            "published_at": getattr(link, "published_at", None),
            "media": (
                {
                    "id": media.id,
                    "title": media.title,
                    "filename": media.filename,
                    "original_filename": media.original_filename,
                    "mime_type": media.mime_type,
                    "media_type": media.media_type,
                    "file_size": media.file_size,
                    "thumbnail_url": media.thumbnail_url,
                    "is_public": media.is_public,
                    "url": media.url,
                }
                if media is not None
                else None
            ),
        }

    @staticmethod
    async def get_by_id(db: AsyncSession, media_id: uuid.UUID, *, load_options: Sequence = ()) -> Media | None:
        query = Media.active_query().options(selectinload(Media.folder)).where(Media.id == media_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_authorized_by_id(db: AsyncSession, media_id: uuid.UUID, user: User, *, load_options: Sequence = ()) -> Media | None:
        media = await MediaService.get_by_id(db, media_id, load_options=load_options)
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
    async def update(db: AsyncSession, media: Media, **data) -> Media:
        if "metadata" in data:
            data["extra_metadata"] = data.pop("metadata")
        apply_updates(media, **data)
        await db.flush()
        return media

    @staticmethod
    async def get_folder_by_id(db: AsyncSession, folder_id: uuid.UUID, *, load_options: Sequence = ()) -> MediaFolder | None:
        query = MediaFolder.active_query().where(MediaFolder.id == folder_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_authorized_folder_by_id(db: AsyncSession, folder_id: uuid.UUID, user: User, *, load_options: Sequence = ()) -> MediaFolder | None:
        folder = await MediaService.get_folder_by_id(db, folder_id, load_options=load_options)
        if folder is None:
            return None
        if user.has_role("admin") or folder.is_public or await MediaService._has_scope_access(user, folder.scope_type, folder.scope_id):
            return folder
        return None

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
        entity_type: str | None = None,
        entity_id: uuid.UUID | None = None,
        role: str | None = None,
        search: str | None = None,
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
        if entity_type or entity_id or role:
            query = query.join(MediaLink, MediaLink.media_id == Media.id).where(MediaLink.deleted_at.is_(None))
            if entity_type:
                query = query.where(MediaLink.entity_type == entity_type)
            if entity_id:
                query = query.where(MediaLink.entity_id == entity_id)
            if role:
                query = query.where(MediaLink.role == role)
        if search:
            query = query.where(ilike_any(search, Media.title, Media.original_filename, Media.filename, Media.alt_text, Media.description))
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
    async def update_folder(db: AsyncSession, folder: MediaFolder, **data) -> MediaFolder:
        if data.get("name") and not data.get("slug"):
            data["slug"] = await unique_slug(db, MediaFolder, data["name"], exclude_id=folder.id)
        apply_updates(folder, **data)
        await db.flush()
        return folder

    @staticmethod
    async def delete_folder(db: AsyncSession, folder: MediaFolder) -> None:
        folder.soft_delete()
        await db.flush()

    @staticmethod
    async def list_folders(
        db: AsyncSession,
        *,
        user: User,
        parent_id: uuid.UUID | None = None,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        load_options: Sequence = (),
    ) -> list[MediaFolder]:
        query = MediaFolder.active_query().order_by(MediaFolder.name.asc())
        query = query.where(await MediaService._folder_visibility_filter(user))
        if load_options:
            query = query.options(*load_options)
        if scope_type is not None:
            query = query.where(MediaFolder.scope_type == scope_type)
        if scope_id is not None:
            query = query.where(MediaFolder.scope_id == scope_id)
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
        **metadata,
    ) -> MediaLink:
        link = MediaLink(
            media_id=media_id,
            entity_type=entity_type,
            entity_id=entity_id,
            role=role,
            folder_id=folder_id,
            display_order=display_order,
            is_public=is_public,
            **metadata,
        )
        db.add(link)
        await db.flush()
        return link

    @staticmethod
    async def get_link_by_id(db: AsyncSession, link_id: uuid.UUID, *, load_options: Sequence = ()) -> MediaLink | None:
        query = (
            MediaLink.active_query()
            .options(selectinload(MediaLink.media), selectinload(MediaLink.folder))
            .where(MediaLink.id == link_id)
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_link_parent_snapshot(
        db: AsyncSession,
        link_id: uuid.UUID,
    ) -> tuple[str, uuid.UUID] | None:
        result = await db.execute(
            select(MediaLink.entity_type, MediaLink.entity_id).where(
                MediaLink.id == link_id,
                MediaLink.deleted_at.is_(None),
            )
        )
        row = result.one_or_none()
        if row is None:
            return None
        return row.entity_type, row.entity_id

    @staticmethod
    async def get_link_for_update(db: AsyncSession, link_id: uuid.UUID) -> MediaLink | None:
        """Lock and refresh a link before authorizing or mutating it."""
        result = await db.execute(
            MediaLink.active_query()
            .options(selectinload(MediaLink.media), selectinload(MediaLink.folder))
            .where(MediaLink.id == link_id)
            .with_for_update()
            .execution_options(populate_existing=True)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_link_for_media(
        db: AsyncSession,
        *,
        media_id: uuid.UUID,
        entity_type: str,
        entity_id: uuid.UUID,
        role: str,
    ) -> MediaLink | None:
        result = await db.execute(
            MediaLink.active_query()
            .options(selectinload(MediaLink.media), selectinload(MediaLink.folder))
            .where(
                MediaLink.media_id == media_id,
                MediaLink.entity_type == entity_type,
                MediaLink.entity_id == entity_id,
                MediaLink.role == role,
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_authorized_link_by_id(db: AsyncSession, link_id: uuid.UUID, user: User, *, load_options: Sequence = ()) -> MediaLink | None:
        link = await MediaService.get_link_by_id(db, link_id, load_options=load_options)
        if link is None:
            return None
        if user.has_role("admin"):
            return link
        if link.is_public:
            return link
        if link.media and await MediaService.can_view_media(db, link.media, user):
            return link
        return None

    @staticmethod
    async def update_link(db: AsyncSession, link: MediaLink, **data) -> MediaLink:
        apply_updates(link, **data)
        await db.flush()
        return link

    @staticmethod
    async def delete_link(db: AsyncSession, link: MediaLink) -> None:
        link.soft_delete()
        await db.flush()

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
            if is_role_assignment_current(assignment) and assignment.scope_type == scope_type and assignment.scope_id == scope_id:
                return True
        person = getattr(user, "person", None)
        for assignment in getattr(person, "assignments", []) or []:
            if (
                assignment.status == "active"
                and assignment.entity_type == scope_type
                and assignment.entity_id == scope_id
            ):
                return True
        return False

    @staticmethod
    async def _visibility_filter(user: User):
        scope_filters = []
        for assignment in user.role_assignments:
            if is_role_assignment_current(assignment) and assignment.scope_type and assignment.scope_id:
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
            if is_role_assignment_current(assignment) and assignment.scope_type and assignment.scope_id:
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


def _allowed_upload_types() -> set[str]:
    return {*settings.allowed_image_types, *settings.allowed_document_types}


def _validate_upload_mime_type(mime_type: str | None) -> None:
    if not mime_type:
        raise ValueError("Uploaded file content type is required")
    if mime_type not in _allowed_upload_types():
        raise ValueError(f"Unsupported file type: {mime_type}")


def _validate_upload_size(file_size: int) -> None:
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if file_size > max_bytes:
        raise ValueError(f"Uploaded file exceeds the {settings.MAX_UPLOAD_MB} MB size limit")
