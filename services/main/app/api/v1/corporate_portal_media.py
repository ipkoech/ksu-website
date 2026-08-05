"""Corporate Communication portal media upload batches.

Mirrors the school portal batch API (``school_portal/media.py``) for the
global Corporate Communication media screen: multi-file batch create with
server-side processing, polling with real per-file progress, and per-file
retry. Batches are portal-scoped (``portal="corporate-communication"``,
no school) and uploaded files land as plain media rows honoring the
optional target folder.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession
from ...security.scopes import can_access_scope
from ...services.media import MediaService
from ...services.upload_batch import UploadBatchService

router = APIRouter()

CORPORATE_MEDIA_PORTAL = "corporate-communication"

#: Same scopes the shared media screen uses to gate uploads (see
#: ``media.py:MEDIA_FOLDER_MANAGE_PERMISSIONS``).
MEDIA_UPLOAD_PERMISSIONS = ("media.manage", "media.upload")
MEDIA_VIEW_PERMISSIONS = ("media.manage", "media.upload", "media.view")


async def _require_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: tuple[str, ...],
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
) -> None:
    target_scope_type = scope_type or "global"
    for permission in permissions:
        if await can_access_scope(db, user, permission, target_scope_type, scope_id):
            return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Media upload permission is required",
    )


@router.post("/media/batches", status_code=status.HTTP_201_CREATED)
async def create_media_batch(
    db: DbSession,
    user: CurrentUser,
    files: list[UploadFile] = File(...),
    folder_id: uuid.UUID | None = Form(default=None),
    is_public: bool = Form(default=False),
):
    if folder_id is not None:
        folder = await MediaService.get_folder_by_id(db, folder_id)
        if folder is None:
            raise HTTPException(status_code=404, detail="Folder not found")
        await _require_scope(
            db,
            user,
            MEDIA_UPLOAD_PERMISSIONS,
            folder.scope_type,
            folder.scope_id,
        )
    else:
        await _require_scope(db, user, MEDIA_UPLOAD_PERMISSIONS)
    batch = await UploadBatchService.create_for_portal(
        db,
        portal=CORPORATE_MEDIA_PORTAL,
        actor_id=user.id,
        files=files,
        folder_id=folder_id,
        is_public=is_public,
    )
    return success(data=batch)


@router.get("/media/batches/{batch_id}")
async def get_media_batch(
    batch_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
):
    await _require_scope(db, user, MEDIA_VIEW_PERMISSIONS)
    return success(
        data=await UploadBatchService.get_for_portal(
            db,
            batch_id,
            CORPORATE_MEDIA_PORTAL,
        )
    )


@router.post("/media/batches/{batch_id}/files/{file_id}/retry")
async def retry_media_file(
    batch_id: uuid.UUID,
    file_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
):
    await _require_scope(db, user, MEDIA_UPLOAD_PERMISSIONS)
    batch = await UploadBatchService.get_for_portal(db, batch_id, CORPORATE_MEDIA_PORTAL)
    item = next((candidate for candidate in batch.files if candidate.id == file_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Upload file not found")
    return success(data=await UploadBatchService.retry_file(db, batch, item))


__all__ = ["router"]
