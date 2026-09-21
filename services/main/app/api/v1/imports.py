"""Bulk import endpoints for admin-managed resources."""

from __future__ import annotations

from celery.result import AsyncResult
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse

from ksu_common.response_validation import allow_response_model_exemption
from ksu_common.schemas.responses import SuccessResponse, success

from ...deps import CurrentUser, DbSession, _has_permission, permissions_for_user
from ...schemas.imports import ImportCommitRead, ImportCommitRequest, ImportJobRead, ImportPreviewRead, ImportResourceRead
from ...services.imports import ImportService
from ...tasks.celery_app import celery_app

router = APIRouter()


def _permissions_for_user(user) -> set[str]:
    return permissions_for_user(user)


def _ensure_scope(user, scope: str) -> None:
    if not _has_permission(_permissions_for_user(user), scope):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")


def _ensure_import_job_owner(result_data, user) -> None:
    """Reject completed async results owned by a different account."""
    owner = result_data.get("_actor_id") if isinstance(result_data, dict) else None
    if owner is not None and str(owner) != str(user.id):
        raise HTTPException(status_code=404, detail="Import job not found")


@router.get("/resources", response_model=SuccessResponse[list[ImportResourceRead]])
async def list_import_resources(user: CurrentUser):
    permissions = _permissions_for_user(user)
    resources = [
        resource
        for resource in ImportService.list_resources()
        if _has_permission(permissions, resource.scope)
    ]
    return success(data=resources)


@router.get("/resources/{resource_key}", response_model=SuccessResponse[ImportResourceRead])
async def get_import_resource(resource_key: str, user: CurrentUser):
    config = ImportService.get_resource(resource_key)
    if config is None:
        raise HTTPException(status_code=404, detail="Import resource not found")
    _ensure_scope(user, config.scope)
    return success(data=config.read())


@allow_response_model_exemption("stream", path="/api/v1/imports/{resource_key}/template")
@router.get("/{resource_key}/template", response_class=StreamingResponse)
async def download_import_template(resource_key: str, user: CurrentUser):
    config = ImportService.get_resource(resource_key)
    if config is None:
        raise HTTPException(status_code=404, detail="Import resource not found")
    _ensure_scope(user, config.scope)
    filename = f"{config.key}-import-template.csv"
    return StreamingResponse(
        iter([ImportService.template_csv(config)]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/{resource_key}/preview", response_model=SuccessResponse[ImportPreviewRead])
async def preview_import(
    resource_key: str,
    db: DbSession,
    user: CurrentUser,
    file: UploadFile = File(...),
):
    config = ImportService.get_resource(resource_key)
    if config is None:
        raise HTTPException(status_code=404, detail="Import resource not found")
    _ensure_scope(user, config.scope)
    rows = await ImportService.parse_upload(file.filename or "import.csv", await file.read())
    return success(data=await ImportService.preview(db, config, rows))


@router.post("/{resource_key}/commit", status_code=status.HTTP_201_CREATED, response_model=SuccessResponse[ImportCommitRead])
async def commit_import(
    resource_key: str,
    data: ImportCommitRequest,
    db: DbSession,
    user: CurrentUser,
):
    config = ImportService.get_resource(resource_key)
    if config is None:
        raise HTTPException(status_code=404, detail="Import resource not found")
    _ensure_scope(user, config.scope)
    result = await ImportService.commit(db, config, data)
    return success(data=result, message="Import processed")


@router.post("/{resource_key}/commit-async", status_code=status.HTTP_202_ACCEPTED, response_model=SuccessResponse[ImportJobRead])
async def queue_import_commit(
    resource_key: str,
    data: ImportCommitRequest,
    user: CurrentUser,
):
    config = ImportService.get_resource(resource_key)
    if config is None:
        raise HTTPException(status_code=404, detail="Import resource not found")
    _ensure_scope(user, config.scope)
    task = celery_app.send_task(
        "main.imports.commit",
        kwargs={
            "resource_key": resource_key,
            "payload": data.model_dump(mode="json"),
            "user_id": str(user.id),
        },
    )
    return success(
        data=ImportJobRead(job_id=task.id, status="PENDING", resource=resource_key),
        message="Import queued",
    )


@router.get("/jobs/{job_id}", response_model=SuccessResponse[ImportJobRead])
async def get_import_job(job_id: str, user: CurrentUser):
    result = AsyncResult(job_id, app=celery_app)
    payload: ImportCommitRead | None = None
    error: str | None = None
    resource: str | None = None

    if result.successful():
        result_data = result.result or {}
        _ensure_import_job_owner(result_data, user)
        payload = ImportCommitRead.model_validate(result_data)
        resource = payload.resource
    elif result.failed():
        error = str(result.result)

    return success(
        data=ImportJobRead(
            job_id=job_id,
            status=result.status,
            resource=resource,
            result=payload,
            error=error,
        )
    )
