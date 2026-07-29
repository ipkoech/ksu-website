from __future__ import annotations

from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import FileResponse
from ksu_common.auth import TokenPayload
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import require_permission
from ...core.config import get_settings
from ...core.database import get_db
from ...models.media import MediaAsset
from ...services.storage import store_bytes

router = APIRouter(prefix="/admin/media", tags=["HERI Media"])


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload(request: Request, folder: str = "general", filename: str = "upload.bin", db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(require_permission("heri.media.write"))):
    try:
        metadata = store_bytes(filename, request.headers.get("content-type", "application/octet-stream"), await request.body(), folder)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    metadata["file_hash"] = metadata.pop("sha256")
    asset = MediaAsset(**metadata, alt_text="")
    db.add(asset)
    return asset


@router.get("/{asset_id}/download")
async def download(asset_id: UUID, db: AsyncSession = Depends(get_db), _: TokenPayload = Depends(require_permission("heri.media.read"))):
    asset = await db.get(MediaAsset, asset_id)
    if asset is None or asset.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Media asset not found")
    path = (Path(get_settings().UPLOAD_DIR).resolve() / asset.storage_path).resolve()
    try:
        path.relative_to(Path(get_settings().UPLOAD_DIR).resolve())
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Media asset not found") from exc
    if not path.exists():
        raise HTTPException(status_code=404, detail="Media file not found")
    return FileResponse(path, media_type=asset.mime_type, filename=asset.file_name)
