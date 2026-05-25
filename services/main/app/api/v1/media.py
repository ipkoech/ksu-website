"""Media endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope
from ...models import Media, MediaFolder, MediaLink
from ...schemas import MediaFolderCreate, MediaFolderUpdate, MediaLinkCreate, MediaLinkUpdate, MediaUpdate
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
async def list_folders(db: DbSession, user: CurrentUser, parent_id: uuid.UUID | None = None, fields: FieldSelection = FieldsDep):
    selector = build_selector(MediaFolder, fields)
    folders = await MediaService.list_folders(db, user=user, parent_id=parent_id, load_options=selector.load_options)
    return success(data=selector.apply(folders))


@router.post("/folders", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("media:manage"))])
async def create_folder(data: MediaFolderCreate, db: DbSession, _: CurrentUser):
    folder = await MediaService.create_folder(db, **data.model_dump())
    return success(data=folder, message="Folder created")


@router.get("/folders/{folder_id}")
async def get_folder(folder_id: uuid.UUID, db: DbSession, user: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(MediaFolder, fields)
    folder = await MediaService.get_authorized_folder_by_id(db, folder_id, user, load_options=selector.load_options)
    if folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    return success(data=selector.apply(folder))


@router.patch("/folders/{folder_id}", dependencies=[Depends(require_scope("media:manage"))])
async def update_folder(folder_id: uuid.UUID, data: MediaFolderUpdate, db: DbSession, _: CurrentUser):
    folder = await MediaService.get_folder_by_id(db, folder_id)
    if folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    folder = await MediaService.update_folder(db, folder, **data.model_dump(exclude_unset=True))
    return success(data=folder, message="Folder updated")


@router.delete("/folders/{folder_id}", dependencies=[Depends(require_scope("media:manage"))], status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(folder_id: uuid.UUID, db: DbSession, _: CurrentUser):
    folder = await MediaService.get_folder_by_id(db, folder_id)
    if folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
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
    media = await MediaService.update(db, media, **data.model_dump(exclude_unset=True))
    return success(data=media, message="Media updated")


@router.delete("/{media_id}", dependencies=[Depends(require_scope("media:delete"))], status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(media_id: uuid.UUID, db: DbSession, user: CurrentUser):
    media = await MediaService.get_authorized_by_id(db, media_id, user)
    if media is None:
        raise HTTPException(status_code=404, detail="Media not found")
    await MediaService.delete(db, media)
