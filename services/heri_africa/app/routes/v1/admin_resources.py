from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from ksu_common.auth import TokenPayload
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import authorize_permission, get_current_user, require_permission, require_resource_permission
from ...core.database import get_db
from ...models.audit import AuditLog
from ...services.admin_resources import (
    READ_ONLY_RESOURCES,
    model_for_resource,
    writable_fields,
    validated_values,
    require_local_fields,
    reject_protected_fields,
)
from ...services.audit import record_audit
from ...services import partner_sync
from ...services.relationships import require_theme_unlinked, validate_theme_reference
from ...services.workflow import lock_record, require_editable, transition_record, transition_values, validate_section_values
from ...schemas.operations import AuditRecordResponse, DynamicResourceResponse, PartnerSyncResponse
from ksu_common.schemas.pagination import PaginatedResponse

router = APIRouter(prefix="/admin", tags=["HERI Admin CRUD"])
PUBLIC_CONFIGURATION_RESOURCES = frozenset({
    "site-settings", "navigation", "hero-slides", "footer", "chair-profiles",
    "team", "impact-metrics",
})


def _require_visibility_authority(user, record, values):
    changes = {
        key: value for key, value in values.items()
        if key in {"is_active", "is_visible"} and (record is None or value != getattr(record, key))
    }
    if changes and not authorize_permission(user, "heri.content.publish").allowed:
        raise HTTPException(403, "Publishing authority is required to change public visibility")


def _require_public_resource_authority(user, resource):
    if resource in PUBLIC_CONFIGURATION_RESOURCES and not authorize_permission(user, "heri.content.publish").allowed:
        raise HTTPException(403, "Publishing authority is required to change public configuration")


@router.post("/{resource}/{record_id}/transition", response_model=DynamicResourceResponse)
async def transition_resource(
    resource: str,
    record_id: UUID,
    payload: dict[str, object],
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: TokenPayload = Depends(get_current_user),
):
    """Apply the shared draft/review/publish workflow to any status-bearing resource."""
    try:
        model = model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if resource in READ_ONLY_RESOURCES or not hasattr(model, "status"):
        raise HTTPException(status_code=422, detail="Resource does not support editorial workflow")
    return await transition_record(
        db, model, record_id, str(payload.get("status", "")), actor=user,
        entity_type=resource, note=payload.get("note"),
        scheduled_at=payload.get("scheduled_at"),
        ip_address=request.client.host if request.client else None,
    )


@router.post("/partners/sync", response_model=PartnerSyncResponse)
async def sync_partners_from_research(request: Request, db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(require_permission("heri.integrations.sync"))):
    return await partner_sync.sync_partners(
        db, actor=user, ip_address=request.client.host if request.client else None,
    )


@router.get("/{resource}/{record_id}", response_model=DynamicResourceResponse)
async def get_resource(resource: str, record_id: UUID, db: AsyncSession = Depends(get_db), _: TokenPayload = Depends(require_resource_permission("read"))):
    try:
        model = model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    record = await db.get(model, record_id)
    if record is None or record.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.get("/{resource}/{record_id}/audit", response_model=list[AuditRecordResponse])
async def list_resource_audit(resource: str, record_id: UUID, db: AsyncSession = Depends(get_db), _: TokenPayload = Depends(require_resource_permission("read"))):
    """Return the immutable change history used by the HERI revision panel."""
    try:
        model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return (await db.execute(select(AuditLog).where(AuditLog.entity_type == resource, AuditLog.entity_id == str(record_id)).order_by(AuditLog.created_at.desc()))).scalars().all()


@router.post("/{resource}/{record_id}/restore", response_model=DynamicResourceResponse)
async def restore_resource(resource: str, record_id: UUID, payload: dict[str, object], request: Request, db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(require_resource_permission("write"))):
    """Restore the changed fields captured by an audit entry and record the restore itself."""
    try:
        model = model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    record = await lock_record(db, model, record_id)
    if resource in READ_ONLY_RESOURCES:
        raise HTTPException(405, "Resource is read-only")
    audit_id = payload.get("audit_id")
    direction = str(payload.get("direction", "previous"))
    if record is None or record.deleted_at is not None or not audit_id or direction not in {"previous", "new"}:
        raise HTTPException(status_code=422, detail="A valid record, audit entry, and restore direction are required")
    reject_protected_fields(model, payload, allow={"status"})
    try:
        audit_uuid = UUID(str(audit_id))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="audit_id must be a UUID") from exc
    audit = await db.get(AuditLog, audit_uuid)
    if audit is None or audit.entity_type != resource or audit.entity_id != str(record_id):
        raise HTTPException(status_code=404, detail="Audit entry not found")
    snapshot = audit.previous_value if direction == "previous" else audit.new_value
    values = validated_values(model, snapshot or {})
    require_local_fields(record, values)
    await validate_section_values(db, model, values, record=record)
    await validate_theme_reference(db, model, values)
    if values:
        require_editable(record)
    # Publication state is restored only through the same transition policy as
    # the explicit transition endpoint. Generic content.write must not turn a
    # historical snapshot into an unpublished/published bypass. Submission
    # triage remains an explicit allowlist and therefore keeps its legacy
    # status restore behavior.
    workflow_status = (
        (snapshot or {}).get("status")
        if hasattr(model, "status") and "status" not in writable_fields(model)
        else None
    )
    if workflow_status is not None:
        target = str(getattr(workflow_status, "value", workflow_status))
        if target != getattr(record.status, "value", str(record.status)):
            values.update(transition_values(
                record, target, actor=user,
                scheduled_at=values.get("scheduled_at") if target == "scheduled" else None,
            ))
    before = {key: getattr(record, key, None) for key in values}
    if "status" in values and hasattr(model, "status") and not isinstance(values["status"], model.status.type.enum_class):
        values["status"] = model.status.type.enum_class(values["status"])
    for key, value in values.items():
        setattr(record, key, value)
    await record_audit(db, action="restore", entity_type=resource, entity_id=str(record.id), actor_id=str(user.sub), previous_value=before, new_value={**values, "source_audit_id": str(audit.id), "direction": direction}, ip_address=request.client.host if request.client else None)
    return record


@router.get("/{resource}", response_model=PaginatedResponse[DynamicResourceResponse])
async def list_resource(resource: str, page: int = Query(1, ge=1), per_page: int = Query(25, ge=1, le=100), search: str | None = Query(None, min_length=1, max_length=120), status_filter: str | None = Query(None, alias="status"), db: AsyncSession = Depends(get_db), _: TokenPayload = Depends(require_resource_permission("read"))):
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


@router.post("/{resource}", response_model=DynamicResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(resource: str, payload: dict[str, object], request: Request, db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(require_resource_permission("write"))):
    try:
        model = model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if resource in READ_ONLY_RESOURCES:
        raise HTTPException(status_code=405, detail="Resource is read-only")
    _require_public_resource_authority(user, resource)
    reject_protected_fields(model, payload)
    values = validated_values(model, payload)
    _require_visibility_authority(user, None, values)
    await validate_section_values(db, model, values)
    await validate_theme_reference(db, model, values)
    from ...models.content import PublicationStatus
    if hasattr(model, "status") and getattr(model.status.type, "enum_class", None) is PublicationStatus:
        values["status"] = PublicationStatus.DRAFT
    if "status" in values and hasattr(model, "status"):
        values["status"] = model.status.type.enum_class(values["status"])
    try:
        record = model(**values)
    except TypeError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    db.add(record)
    await db.flush()
    await record_audit(db, action="create", entity_type=resource, entity_id=str(record.id), actor_id=str(user.sub), new_value=values, ip_address=request.client.host if request.client else None)
    return record


@router.patch("/{resource}/{record_id}", response_model=DynamicResourceResponse)
async def update_resource(resource: str, record_id: UUID, payload: dict[str, object], request: Request, db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(require_resource_permission("write"))):
    try:
        model = model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if resource in READ_ONLY_RESOURCES:
        raise HTTPException(status_code=405, detail="Resource is read-only")
    _require_public_resource_authority(user, resource)
    reject_protected_fields(model, payload)
    record = await lock_record(db, model, record_id)
    if record is None or record.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Record not found")
    require_editable(record)
    values = validated_values(model, payload)
    _require_visibility_authority(user, record, values)
    require_local_fields(record, values)
    await validate_section_values(db, model, values, record=record)
    await validate_theme_reference(db, model, values)
    if "status" in values and hasattr(model, "status"):
        values["status"] = model.status.type.enum_class(values["status"])
    before = {key: getattr(record, key, None) for key in values}
    for key, value in values.items():
        setattr(record, key, value)
    await record_audit(db, action="update", entity_type=resource, entity_id=str(record.id), actor_id=str(user.sub), previous_value=before, new_value=values, ip_address=request.client.host if request.client else None)
    return record


@router.delete("/{resource}/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(resource: str, record_id: UUID, request: Request, db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(require_resource_permission("write"))):
    try:
        model = model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if resource in READ_ONLY_RESOURCES:
        raise HTTPException(status_code=405, detail="Resource is read-only")
    record = await lock_record(db, model, record_id)
    if record is None or record.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Record not found")
    require_editable(record, deleting=True)
    await require_theme_unlinked(db, record)
    record.deleted_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
    await record_audit(db, action="soft_delete", entity_type=resource, entity_id=str(record.id), actor_id=str(user.sub), ip_address=request.client.host if request.client else None)
