"""Media endpoints."""

from __future__ import annotations

import uuid
from types import SimpleNamespace

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import select

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope
from ...models import Media, MediaFolder, MediaLink, PageSection
from ...security.scopes import can_access_scope
from ...schemas import MediaFolderCreate, MediaFolderUpdate, MediaLinkCreate, MediaLinkUpdate, MediaUpdate
from ...services import ContentWorkflowService, MediaService
from ._fields import FieldSelection, FieldsDep, build_selector
from .page_cms import _require_page_authoring_edit, _require_page_section_access

router = APIRouter()

MEDIA_FOLDER_MANAGE_PERMISSIONS = ["media.manage", "media.upload"]
MEDIA_LINK_MANAGE_PERMISSIONS = ["media.manage"]


def _page_section_entity_id(entity_type: str, entity_id: uuid.UUID) -> uuid.UUID | None:
    normalized_type = entity_type.replace("-", "_")
    return entity_id if normalized_type in {"page_section", "page_sections"} else None


async def _lock_page_section_media_parents(
    db: DbSession,
    *,
    entity_targets: list[tuple[str, uuid.UUID]],
) -> dict[uuid.UUID, PageSection]:
    section_ids = {
        section_id
        for entity_type, entity_id in entity_targets
        if (section_id := _page_section_entity_id(entity_type, entity_id)) is not None
    }
    if not section_ids:
        return {}

    result = await db.execute(
        select(PageSection)
        .where(PageSection.id.in_(section_ids))
        .order_by(PageSection.id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    sections = list(result.scalars().all())
    if {section.id for section in sections} != section_ids:
        raise HTTPException(status_code=404, detail="Page section not found")
    return {section.id: section for section in sections}


async def _authorize_locked_page_section_media_parents(
    db: DbSession,
    user: CurrentUser,
    *,
    sections: dict[uuid.UUID, PageSection],
    media_permissions: list[str],
) -> None:
    for section in sorted(sections.values(), key=lambda item: item.id):
        await _require_media_folder_scope(
            db,
            user,
            media_permissions,
            section.scope_type,
            section.scope_id,
        )
        await _require_page_section_access(
            db,
            user,
            page_key=section.page_key,
            scope_type=section.scope_type,
            scope_id=section.scope_id,
            action="item_manage",
        )
        _require_page_authoring_edit(user, section)


async def _touch_locked_page_section_media_parents(
    db: DbSession,
    user: CurrentUser,
    *,
    sections: dict[uuid.UUID, PageSection],
    changed_fields: dict,
) -> None:
    for section in sorted(sections.values(), key=lambda item: item.id):
        await ContentWorkflowService.reset_after_authoring_edit(
            db,
            section,
            "page-sections",
            user.id,
            changed_fields=changed_fields,
        )
        section.revision = (section.revision or 1) + 1
        section.updated_by_id = user.id


async def _touch_page_section_media_parents(
    db: DbSession,
    user: CurrentUser,
    *,
    entity_targets: list[tuple[str, uuid.UUID]],
    changed_fields: dict,
    media_permissions: list[str],
) -> None:
    sections = await _lock_page_section_media_parents(db, entity_targets=entity_targets)
    await _authorize_locked_page_section_media_parents(
        db,
        user,
        sections=sections,
        media_permissions=media_permissions,
    )
    await _touch_locked_page_section_media_parents(
        db,
        user,
        sections=sections,
        changed_fields=changed_fields,
    )


async def _lock_media_link_after_parent_snapshot(
    db: DbSession,
    link_id: uuid.UUID,
    *,
    snapshot: tuple[str, uuid.UUID],
    entity_targets: list[tuple[str, uuid.UUID]],
) -> tuple[MediaLink, dict[uuid.UUID, PageSection]]:
    sections = await _lock_page_section_media_parents(db, entity_targets=entity_targets)
    link = await MediaService.get_link_for_update(db, link_id)
    if (
        link is None
        or link.id != link_id
        or link.entity_type != snapshot[0]
        or link.entity_id != snapshot[1]
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Media link changed concurrently; reload and retry",
        )
    return link, sections


def _media_folder_scope(scope_type: str | None, scope_id: uuid.UUID | None) -> tuple[str, uuid.UUID | None]:
    return (scope_type or "global", scope_id)


async def _can_access_media_folder_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    scope_type: str | None,
    scope_id: uuid.UUID | None,
) -> bool:
    target_scope_type, target_scope_id = _media_folder_scope(scope_type, scope_id)
    for permission in permissions:
        if await can_access_scope(db, user, permission, target_scope_type, target_scope_id):
            return True
    return False


async def _require_media_folder_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    scope_type: str | None,
    scope_id: uuid.UUID | None,
) -> None:
    if not await _can_access_media_folder_scope(db, user, permissions, scope_type, scope_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this media folder scope",
        )


async def _require_media_entity_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    entity_type: str,
    entity_id: uuid.UUID,
) -> None:
    scope_type, scope_id = await MediaService.get_attachment_scope(
        db,
        entity_type=entity_type,
        entity_id=entity_id,
    )
    await _require_media_folder_scope(db, user, permissions, scope_type, scope_id)


async def _authorized_media_entity_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    entity_type: str,
    entity_id: uuid.UUID,
) -> tuple[str, uuid.UUID | None]:
    scope_type, scope_id = await MediaService.get_attachment_scope(
        db,
        entity_type=entity_type,
        entity_id=entity_id,
    )
    await _require_media_folder_scope(db, user, permissions, scope_type, scope_id)
    return scope_type, scope_id


def _is_workflow_managed_link(link: MediaLink) -> bool:
    return (
        getattr(link, "owner_portal", None) == "student-clubs"
        or getattr(link, "owner_scope_type", None) == "club"
    )


@router.get("")
async def list_media(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    folder_id: uuid.UUID | None = None,
    media_type: str | None = None,
    uploaded_by_id: uuid.UUID | None = None,
    entity_type: str | None = Query(default=None, max_length=64),
    entity_id: uuid.UUID | None = None,
    role: str | None = Query(default=None, max_length=64),
    search: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Media, fields)
    result = await MediaService.list(
        db,
        user=user,
        page=page,
        per_page=per_page,
        folder_id=folder_id,
        media_type=media_type,
        uploaded_by_id=uploaded_by_id,
        entity_type=entity_type,
        entity_id=entity_id,
        role=role,
        search=search,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_media(
    db: DbSession,
    user: CurrentUser,
    file: UploadFile = File(...),
    folder_id: uuid.UUID | None = Form(default=None),
    is_public: bool = Form(default=False),
    entity_type: str | None = Form(default=None, max_length=64),
    entity_id: uuid.UUID | None = Form(default=None),
    role: str | None = Form(default=None, max_length=64),
):
    if entity_type or entity_id is not None:
        if not entity_type or entity_id is None:
            raise HTTPException(status_code=400, detail="Both entity_type and entity_id are required for entity uploads")
        await _require_media_entity_scope(
            db,
            user,
            MEDIA_FOLDER_MANAGE_PERMISSIONS,
            entity_type,
            entity_id,
        )
        if _page_section_entity_id(entity_type, entity_id) is not None:
            await _touch_page_section_media_parents(
                db,
                user,
                entity_targets=[(entity_type, entity_id)],
                changed_fields={
                    "media_link_create": {
                        "entity_type": entity_type,
                        "entity_id": str(entity_id),
                        "role": role or "attachment",
                        "is_public": is_public,
                    },
                },
                media_permissions=MEDIA_FOLDER_MANAGE_PERMISSIONS,
            )
    elif folder_id is None:
        await _require_media_folder_scope(db, user, MEDIA_FOLDER_MANAGE_PERMISSIONS, "global", None)
    if folder_id is not None:
        folder = await MediaService.get_folder_by_id(db, folder_id)
        if folder is None:
            raise HTTPException(status_code=404, detail="Folder not found")
        await _require_media_folder_scope(
            db,
            user,
            MEDIA_FOLDER_MANAGE_PERMISSIONS,
            folder.scope_type,
            folder.scope_id,
        )
    try:
        media = await MediaService.upload(
            db,
            file=file,
            folder_id=folder_id,
            uploaded_by_id=user.id,
            is_public=is_public,
            entity_type=entity_type,
            entity_id=entity_id,
            role=role,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return success(data=media, message="Media uploaded")


@router.get("/folders")
async def list_folders(
    db: DbSession,
    user: CurrentUser,
    parent_id: uuid.UUID | None = None,
    scope_type: str | None = Query(default=None, max_length=32),
    scope_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(MediaFolder, fields)
    folders = await MediaService.list_folders(
        db,
        user=user,
        parent_id=parent_id,
        scope_type=scope_type,
        scope_id=scope_id,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(folders))


@router.post("/folders", status_code=status.HTTP_201_CREATED)
async def create_folder(data: MediaFolderCreate, db: DbSession, user: CurrentUser):
    await _require_media_folder_scope(
        db,
        user,
        MEDIA_FOLDER_MANAGE_PERMISSIONS,
        data.scope_type,
        data.scope_id,
    )
    folder = await MediaService.create_folder(db, **data.model_dump())
    return success(data=folder, message="Folder created")


@router.get("/folders/{folder_id}")
async def get_folder(folder_id: uuid.UUID, db: DbSession, user: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(MediaFolder, fields)
    folder = await MediaService.get_authorized_folder_by_id(db, folder_id, user, load_options=selector.load_options)
    if folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    return success(data=selector.apply(folder))


@router.patch("/folders/{folder_id}")
async def update_folder(folder_id: uuid.UUID, data: MediaFolderUpdate, db: DbSession, user: CurrentUser):
    folder = await MediaService.get_folder_by_id(db, folder_id)
    if folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    await _require_media_folder_scope(
        db,
        user,
        MEDIA_FOLDER_MANAGE_PERMISSIONS,
        folder.scope_type,
        folder.scope_id,
    )
    payload = data.model_dump(exclude_unset=True)
    next_scope = SimpleNamespace(
        scope_type=payload.get("scope_type", folder.scope_type),
        scope_id=payload.get("scope_id", folder.scope_id),
    )
    await _require_media_folder_scope(
        db,
        user,
        MEDIA_FOLDER_MANAGE_PERMISSIONS,
        next_scope.scope_type,
        next_scope.scope_id,
    )
    folder = await MediaService.update_folder(db, folder, **payload)
    return success(data=folder, message="Folder updated")


@router.delete("/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(folder_id: uuid.UUID, db: DbSession, user: CurrentUser):
    folder = await MediaService.get_folder_by_id(db, folder_id)
    if folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    await _require_media_folder_scope(
        db,
        user,
        MEDIA_FOLDER_MANAGE_PERMISSIONS,
        folder.scope_type,
        folder.scope_id,
    )
    await MediaService.delete_folder(db, folder)


@router.get("/links")
async def list_media_links(
    db: DbSession,
    user: CurrentUser,
    entity_type: str,
    entity_id: uuid.UUID,
    role: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    links = await MediaService.list_links(
        db,
        user=user,
        entity_type=entity_type,
        entity_id=entity_id,
        role=role,
        load_options=(),
    )
    return success(data=[MediaService.serialize_link(link) for link in links])


@router.post("/links", status_code=status.HTTP_201_CREATED)
async def create_media_link(data: MediaLinkCreate, db: DbSession, user: CurrentUser):
    scope_type, scope_id = await _authorized_media_entity_scope(
        db,
        user,
        MEDIA_LINK_MANAGE_PERMISSIONS,
        data.entity_type,
        data.entity_id,
    )
    media = await MediaService.get_authorized_by_id(db, data.media_id, user)
    if media is None:
        raise HTTPException(status_code=404, detail="Media not found")
    payload = data.model_dump()
    await _touch_page_section_media_parents(
        db,
        user,
        entity_targets=[(data.entity_type, data.entity_id)],
        changed_fields={"media_link_create": payload},
        media_permissions=MEDIA_LINK_MANAGE_PERMISSIONS,
    )
    if scope_type == "club":
        payload.update(
            is_public=False,
            status="draft",
            workflow_status="draft",
            owner_portal="student-clubs",
            owner_scope_type="club",
            owner_scope_id=scope_id,
            author_user_id=user.id,
        )
    link = await MediaService.link_media(db, **payload)
    link.media = media
    return success(data=MediaService.serialize_link(link), message="Media linked")


@router.get("/links/{link_id}")
async def get_media_link(link_id: uuid.UUID, db: DbSession, user: CurrentUser, fields: FieldSelection = FieldsDep):
    link = await MediaService.get_authorized_link_by_id(db, link_id, user, load_options=())
    if link is None:
        raise HTTPException(status_code=404, detail="Media link not found")
    return success(data=MediaService.serialize_link(link))


@router.patch("/links/{link_id}")
async def update_media_link(link_id: uuid.UUID, data: MediaLinkUpdate, db: DbSession, user: CurrentUser):
    snapshot = await MediaService.get_link_parent_snapshot(db, link_id)
    if snapshot is None:
        raise HTTPException(status_code=404, detail="Media link not found")
    payload = data.model_dump(exclude_unset=True)
    next_entity_type = payload.get("entity_type", snapshot[0])
    next_entity_id = payload.get("entity_id", snapshot[1])
    entity_targets = [snapshot, (next_entity_type, next_entity_id)]
    link, sections = await _lock_media_link_after_parent_snapshot(
        db,
        link_id,
        snapshot=snapshot,
        entity_targets=entity_targets,
    )
    await _authorize_locked_page_section_media_parents(
        db,
        user,
        sections=sections,
        media_permissions=MEDIA_LINK_MANAGE_PERMISSIONS,
    )
    if _page_section_entity_id(link.entity_type, link.entity_id) is None:
        await _require_media_entity_scope(
            db,
            user,
            MEDIA_LINK_MANAGE_PERMISSIONS,
            link.entity_type,
            link.entity_id,
        )
    next_section_id = _page_section_entity_id(next_entity_type, next_entity_id)
    if next_section_id is not None:
        next_section = sections[next_section_id]
        next_scope_type, next_scope_id = next_section.scope_type, next_section.scope_id
    else:
        next_scope_type, next_scope_id = await _authorized_media_entity_scope(
            db, user, MEDIA_LINK_MANAGE_PERMISSIONS, next_entity_type, next_entity_id,
        )
    if "is_public" in payload and _is_workflow_managed_link(link):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workflow-managed media visibility must be changed through publication workflow",
        )
    if next_scope_type == "club":
        payload.update(
            owner_portal="student-clubs",
            owner_scope_type="club",
            owner_scope_id=next_scope_id,
        )
    if "media_id" in payload:
        media = await MediaService.get_authorized_by_id(db, payload["media_id"], user)
        if media is None:
            raise HTTPException(status_code=404, detail="Media not found")
    if payload:
        await _touch_locked_page_section_media_parents(
            db,
            user,
            sections=sections,
            changed_fields={"media_link_update": payload},
        )
    link = await MediaService.update_link(db, link, **payload)
    if "media_id" in payload:
        link.media = media
    return success(data=MediaService.serialize_link(link), message="Media link updated")


@router.delete("/links/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media_link(link_id: uuid.UUID, db: DbSession, user: CurrentUser):
    snapshot = await MediaService.get_link_parent_snapshot(db, link_id)
    if snapshot is None:
        raise HTTPException(status_code=404, detail="Media link not found")
    link, sections = await _lock_media_link_after_parent_snapshot(
        db,
        link_id,
        snapshot=snapshot,
        entity_targets=[snapshot],
    )
    await _authorize_locked_page_section_media_parents(
        db,
        user,
        sections=sections,
        media_permissions=MEDIA_LINK_MANAGE_PERMISSIONS,
    )
    if _page_section_entity_id(link.entity_type, link.entity_id) is None:
        await _require_media_entity_scope(
            db,
            user,
            MEDIA_LINK_MANAGE_PERMISSIONS,
            link.entity_type,
            link.entity_id,
        )
    await _touch_locked_page_section_media_parents(
        db,
        user,
        sections=sections,
        changed_fields={"media_link_delete": {"id": str(link.id)}},
    )
    await MediaService.delete_link(db, link)


@router.get("/{media_id}")
async def get_media(media_id: uuid.UUID, db: DbSession, user: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(Media, fields)
    media = await MediaService.get_authorized_by_id(db, media_id, user, load_options=selector.load_options)
    if media is None:
        raise HTTPException(status_code=404, detail="Media not found")
    return success(data=selector.apply(media))


@router.patch("/{media_id}", dependencies=[Depends(require_scope("media:manage"))])
async def update_media(media_id: uuid.UUID, data: MediaUpdate, db: DbSession, user: CurrentUser):
    media = await MediaService.get_authorized_by_id(db, media_id, user)
    if media is None:
        raise HTTPException(status_code=404, detail="Media not found")
    payload = data.model_dump(exclude_unset=True)
    if "folder_id" in payload and payload["folder_id"] is not None:
        folder = await MediaService.get_folder_by_id(db, payload["folder_id"])
        if folder is None:
            raise HTTPException(status_code=404, detail="Folder not found")
        await _require_media_folder_scope(
            db,
            user,
            MEDIA_FOLDER_MANAGE_PERMISSIONS,
            folder.scope_type,
            folder.scope_id,
        )
    media = await MediaService.update(db, media, **payload)
    return success(data=media, message="Media updated")


@router.delete("/{media_id}", dependencies=[Depends(require_scope("media:delete"))], status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(media_id: uuid.UUID, db: DbSession, user: CurrentUser):
    media = await MediaService.get_authorized_by_id(db, media_id, user)
    if media is None:
        raise HTTPException(status_code=404, detail="Media not found")
    await MediaService.delete(db, media)
