"""Media endpoints."""

from __future__ import annotations

import uuid
from types import SimpleNamespace

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope
from ...models import Media, MediaFolder, MediaLink
from ...security.scopes import can_access_scope
from ...schemas import MediaFolderCreate, MediaFolderUpdate, MediaLinkCreate, MediaLinkUpdate, MediaUpdate
from ...services import MediaService
from ._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()

MEDIA_FOLDER_MANAGE_PERMISSIONS = ["media.manage", "media.upload"]


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


@router.get("")
async def list_media(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    folder_id: uuid.UUID | None = None,
    media_type: str | None = None,
    uploaded_by_id: uuid.UUID | None = None,
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
        search=search,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.post("/upload", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("media:upload"))])
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
    selector = build_selector(MediaLink, fields)
    links = await MediaService.list_links(
        db,
        user=user,
        entity_type=entity_type,
        entity_id=entity_id,
        role=role,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(links))


@router.post("/links", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("media:manage"))])
async def create_media_link(data: MediaLinkCreate, db: DbSession, _: CurrentUser):
    link = await MediaService.link_media(db, **data.model_dump())
    return success(data=link, message="Media linked")


@router.get("/links/{link_id}")
async def get_media_link(link_id: uuid.UUID, db: DbSession, user: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(MediaLink, fields)
    link = await MediaService.get_authorized_link_by_id(db, link_id, user, load_options=selector.load_options)
    if link is None:
        raise HTTPException(status_code=404, detail="Media link not found")
    return success(data=selector.apply(link))


@router.patch("/links/{link_id}", dependencies=[Depends(require_scope("media:manage"))])
async def update_media_link(link_id: uuid.UUID, data: MediaLinkUpdate, db: DbSession, _: CurrentUser):
    link = await MediaService.get_link_by_id(db, link_id)
    if link is None:
        raise HTTPException(status_code=404, detail="Media link not found")
    link = await MediaService.update_link(db, link, **data.model_dump(exclude_unset=True))
    return success(data=link, message="Media link updated")


@router.delete("/links/{link_id}", dependencies=[Depends(require_scope("media:manage"))], status_code=status.HTTP_204_NO_CONTENT)
async def delete_media_link(link_id: uuid.UUID, db: DbSession, _: CurrentUser):
    link = await MediaService.get_link_by_id(db, link_id)
    if link is None:
        raise HTTPException(status_code=404, detail="Media link not found")
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
