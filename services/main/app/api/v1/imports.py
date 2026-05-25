"""Bulk import endpoints for admin-managed resources."""

from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import Response

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, _has_permission
from ...schemas.imports import ImportCommitRequest
from ...services.imports import ImportService

router = APIRouter()


def _permissions_for_user(user) -> set[str]:
    return {
        role_permission.permission.name
        for assignment in user.role_assignments
        if assignment.is_active and assignment.role and assignment.role.is_active
        for role_permission in assignment.role.role_permissions
        if role_permission.permission and role_permission.permission.is_active
    }


def _ensure_scope(user, scope: str) -> None:
    if not _has_permission(_permissions_for_user(user), scope):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")


@router.get("/resources")
async def list_import_resources(user: CurrentUser):
    permissions = _permissions_for_user(user)
    resources = [
        resource
        for resource in ImportService.list_resources()
        if _has_permission(permissions, resource.scope)
    ]
    return success(data=resources)


@router.get("/resources/{resource_key}")
async def get_import_resource(resource_key: str, user: CurrentUser):
    config = ImportService.get_resource(resource_key)
    if config is None:
        raise HTTPException(status_code=404, detail="Import resource not found")
    _ensure_scope(user, config.scope)
    return success(data=config.read())


@router.get("/{resource_key}/template")
async def download_import_template(resource_key: str, user: CurrentUser):
    config = ImportService.get_resource(resource_key)
    if config is None:
        raise HTTPException(status_code=404, detail="Import resource not found")
    _ensure_scope(user, config.scope)
    filename = f"{config.key}-import-template.csv"
    return Response(
        content=ImportService.template_csv(config),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/{resource_key}/preview")
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


@router.post("/{resource_key}/commit", status_code=status.HTTP_201_CREATED)
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
