"""School-scoped media upload batches and metadata imports."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile, status
from ksu_common.schemas.responses import success

from ....deps import DbSession
from ....schemas.school_portal import SchoolPortalMediaMetadataUpdate
from ....schemas.school_portal_content import SchoolContentCreate
from ....schemas.upload_batch import SchoolContentMetadataImport
from ....services.domain_events import enqueue_domain_event
from ....services.media import MediaService
from ....services.school_portal_content import create_school_content
from ....services.school_portal_context import CurrentSchoolContext
from ....services.upload_batch import UploadBatchService

router = APIRouter()


def _require(context, permission: str) -> None:
    if permission not in context.permissions:
        raise HTTPException(status_code=403, detail=f"{permission} permission is required")


@router.patch("/media/{media_id}")
async def update_school_media_metadata(
    media_id: uuid.UUID,
    data: SchoolPortalMediaMetadataUpdate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    if not {
        "school.media.manage",
        "school.profile.manage",
    }.intersection(context.permissions):
        raise HTTPException(
            status_code=403,
            detail="School media or profile management permission is required",
        )
    media = await MediaService.get_by_id(db, media_id)
    if media is None or not MediaService.is_owned_by_school(
        media,
        context.school.id,
    ):
        raise HTTPException(status_code=404, detail="Media not found")
    media = await MediaService.update(
        db,
        media,
        **data.model_dump(exclude_unset=True),
    )
    return success(data=media, message="School media updated")


@router.delete("/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_school_media(
    media_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.media.manage")
    media = await MediaService.get_by_id(db, media_id)
    if media is None or not MediaService.is_owned_by_school(media, context.school.id):
        raise HTTPException(status_code=404, detail="Media not found")
    await MediaService.delete(db, media)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/media/batches", status_code=status.HTTP_201_CREATED)
async def create_media_batch(
    db: DbSession,
    context: CurrentSchoolContext,
    files: list[UploadFile] = File(...),
    target_entity_type: str | None = Form(None),
    target_entity_id: uuid.UUID | None = Form(None),
    target_role: str = Form("attachment"),
):
    _require(context, "school.media.manage")
    batch = await UploadBatchService.create(
        db,
        school_id=context.school.id,
        actor_id=context.user.id,
        files=files,
        target_entity_type=target_entity_type,
        target_entity_id=target_entity_id,
        target_role=target_role,
    )
    return success(data=batch)


@router.get("/media/batches/{batch_id}")
async def get_media_batch(
    batch_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.media.view")
    return success(
        data=await UploadBatchService.get_for_school(
            db,
            batch_id,
            context.school.id,
        )
    )


@router.post("/media/batches/{batch_id}/files/{file_id}/retry")
async def retry_media_file(
    batch_id: uuid.UUID,
    file_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.media.manage")
    batch = await UploadBatchService.get_for_school(db, batch_id, context.school.id)
    item = next((candidate for candidate in batch.files if candidate.id == file_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Upload file not found")
    return success(data=await UploadBatchService.retry_file(db, batch, item))


def _metadata_preview(data: SchoolContentMetadataImport, media_by_reference: dict[str, uuid.UUID]):
    rows = []
    for index, row in enumerate(data.rows, start=1):
        media_reference = row.data.get("media_client_reference")
        errors = []
        if media_reference and media_reference not in media_by_reference:
            errors.append("Referenced upload is not completed")
        rows.append(
            {
                "row_number": index,
                "client_reference": row.client_reference,
                "content_type": row.content_type,
                "status": "invalid" if errors else "valid",
                "errors": errors,
                "data": row.data,
            }
        )
    return rows


async def _media_reference_map(db, context, batch_id: uuid.UUID | None):
    if batch_id is None:
        return {}
    batch = await UploadBatchService.get_for_school(db, batch_id, context.school.id)
    return {
        item.client_reference: item.media_id
        for item in batch.files
        if item.status == "completed" and item.media_id is not None
    }


@router.post("/media/content-imports/preview")
async def preview_content_metadata_import(
    data: SchoolContentMetadataImport,
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.content.bulk")
    media_by_reference = await _media_reference_map(db, context, data.batch_id)
    return success(data={"rows": _metadata_preview(data, media_by_reference)})


@router.post("/media/content-imports")
async def commit_content_metadata_import(
    data: SchoolContentMetadataImport,
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.content.bulk")
    media_by_reference = await _media_reference_map(db, context, data.batch_id)
    preview = _metadata_preview(data, media_by_reference)
    results = []
    for source, checked in zip(data.rows, preview, strict=True):
        if checked["status"] != "valid":
            results.append(checked)
            continue
        payload = dict(source.data)
        media_reference = payload.pop("media_client_reference", None)
        if media_reference:
            media_id = media_by_reference[media_reference]
            if source.content_type in {"document", "download"}:
                payload["file_id"] = media_id
            elif source.content_type == "gallery_link":
                payload["media_id"] = media_id
            else:
                payload["featured_media_id"] = media_id
        try:
            item = await create_school_content(
                db,
                context,
                SchoolContentCreate(content_type=source.content_type, data=payload),
            )
        except Exception as exc:  # noqa: BLE001 - return row-level import errors.
            results.append({**checked, "status": "failed", "errors": [str(exc)]})
        else:
            results.append({**checked, "status": "created", "id": str(item.id)})
    enqueue_domain_event(
        db,
        event_type="school.content.import_completed",
        scope_type="school",
        scope_id=context.school.id,
        actor_id=context.user.id,
        resource_type="content_import",
        resource_id=uuid.uuid4(),
        data={
            "total_rows": len(results),
            "created_rows": sum(row["status"] == "created" for row in results),
            "failed_rows": sum(row["status"] in {"failed", "invalid"} for row in results),
        },
    )
    return success(data={"rows": results})
