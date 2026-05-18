"""Media endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope
from ...models import Media, MediaFolder, MediaLink
from ...schemas import MediaFolderCreate, MediaLinkCreate
from ...services import MediaService
from ._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()


@router.get("")
async def list_media(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    folder_id: uuid.UUID | None = None,
    media_type: str | None = None,
    uploaded_by_id: uuid.UUID | None = None,
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
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.post("/upload", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("media:upload"))])
async def upload_media(
    db: DbSession,
    user: CurrentUser,
    file: UploadFile = File(...),
    folder_id: uuid.UUID | None = None,
    is_public: bool = False,
):
    media = await MediaService.upload(db, file=file, folder_id=folder_id, uploaded_by_id=user.id, is_public=is_public)
    return success(data=media, message="Media uploaded")


@router.get("/folders")
async def list_folders(db: DbSession, user: CurrentUser, parent_id: uuid.UUID | None = None, fields: FieldSelection = FieldsDep):
    selector = build_selector(MediaFolder, fields)
    folders = await MediaService.list_folders(db, user=user, parent_id=parent_id, load_options=selector.load_options)
    return success(data=selector.apply(folders))


@router.post("/folders", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("media:manage"))])
async def create_folder(data: MediaFolderCreate, db: DbSession, _: CurrentUser):
    folder = await MediaService.create_folder(db, **data.model_dump())
    return success(data=folder, message="Folder created")


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


@router.delete("/{media_id}", dependencies=[Depends(require_scope("media:delete"))], status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(media_id: uuid.UUID, db: DbSession, user: CurrentUser):
    media = await MediaService.get_authorized_by_id(db, media_id, user)
    if media is None:
        raise HTTPException(status_code=404, detail="Media not found")
    await MediaService.delete(db, media)
