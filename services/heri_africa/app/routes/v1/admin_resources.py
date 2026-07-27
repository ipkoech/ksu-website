from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from ksu_common.auth import TokenPayload
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import require_permission
from ...core.database import get_db
from ...services.admin_resources import READ_ONLY_RESOURCES, model_for_resource, writable_fields
from ...services.audit import record_audit
from ...models.audit import AuditLog

router = APIRouter(prefix="/admin", tags=["HERI Admin CRUD"])


@router.get("/{resource}/{record_id}")
async def get_resource(resource: str, record_id: UUID, db: AsyncSession = Depends(get_db), _: TokenPayload = Depends(require_permission("heri.content.read"))):
    try:
        model = model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    record = await db.get(model, record_id)
    if record is None or record.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.get("/{resource}/{record_id}/audit")
async def list_resource_audit(resource: str, record_id: UUID, db: AsyncSession = Depends(get_db), _: TokenPayload = Depends(require_permission("heri.content.read"))):
    """Return the immutable change history used by the HERI revision panel."""
    try:
        model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return (await db.execute(select(AuditLog).where(AuditLog.entity_type == resource, AuditLog.entity_id == str(record_id)).order_by(AuditLog.created_at.desc()))).scalars().all()


@router.get("/{resource}")
async def list_resource(resource: str, page: int = Query(1, ge=1), per_page: int = Query(25, ge=1, le=100), search: str | None = Query(None, min_length=1, max_length=120), status_filter: str | None = Query(None, alias="status"), db: AsyncSession = Depends(get_db), _: TokenPayload = Depends(require_permission("heri.content.read"))):
    try:
        model = model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    filters = [model.deleted_at.is_(None)]
    if status_filter and hasattr(model, "status"):
        filters.append(model.status == status_filter)
    if search:
        searchable = [getattr(model, field) for field in ("title", "name", "slug", "email", "file_name") if hasattr(model, field)]
        if searchable:
            filters.append(or_(*(column.ilike(f"%{search}%") for column in searchable)))
    total = int((await db.execute(select(func.count()).select_from(model).where(*filters))).scalar_one())
    records = (await db.execute(select(model).where(*filters).order_by(model.created_at.desc()).offset((page - 1) * per_page).limit(per_page))).scalars().all()
    return {"data": records, "meta": {"page": page, "per_page": per_page, "total": total, "pages": max(1, (total + per_page - 1) // per_page)}}


@router.post("/{resource}", status_code=status.HTTP_201_CREATED)
async def create_resource(resource: str, payload: dict[str, object], request: Request, db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(require_permission("heri.content.write"))):
    try:
        model = model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if resource in READ_ONLY_RESOURCES:
        raise HTTPException(status_code=405, detail="Resource is read-only")
    values = {key: value for key, value in payload.items() if key in writable_fields(model)}
    if "status" in values and hasattr(model, "status"):
        values["status"] = model.status.type.enum_class(values["status"])
    try:
        record = model(**values)
    except TypeError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    db.add(record)
    await record_audit(db, action="create", entity_type=resource, entity_id=str(record.id), actor_id=str(user.sub), new_value=values, ip_address=request.client.host if request.client else None)
    return record


@router.patch("/{resource}/{record_id}")
async def update_resource(resource: str, record_id: UUID, payload: dict[str, object], request: Request, db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(require_permission("heri.content.write"))):
    try:
        model = model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if resource in READ_ONLY_RESOURCES:
        raise HTTPException(status_code=405, detail="Resource is read-only")
    record = await db.get(model, record_id)
    if record is None or record.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Record not found")
    values = {key: value for key, value in payload.items() if key in writable_fields(model)}
    if "status" in values and hasattr(model, "status"):
        values["status"] = model.status.type.enum_class(values["status"])
    before = {key: getattr(record, key, None) for key in values}
    for key, value in values.items():
        setattr(record, key, value)
    await record_audit(db, action="update", entity_type=resource, entity_id=str(record.id), actor_id=str(user.sub), previous_value=before, new_value=values, ip_address=request.client.host if request.client else None)
    return record


@router.delete("/{resource}/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(resource: str, record_id: UUID, request: Request, db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(require_permission("heri.content.write"))):
    try:
        model = model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if resource in READ_ONLY_RESOURCES:
        raise HTTPException(status_code=405, detail="Resource is read-only")
    record = await db.get(model, record_id)
    if record is None or record.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Record not found")
    record.deleted_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
    await record_audit(db, action="soft_delete", entity_type=resource, entity_id=str(record.id), actor_id=str(user.sub), ip_address=request.client.host if request.client else None)
