from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from ksu_common.auth import TokenPayload
from ksu_common.internal_client import get_integration_pool, internal_headers
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import require_permission
from ...core.config import get_settings
from ...core.database import get_db
from ...models.audit import AuditLog
from ...models.content import SiteSettings
from ...models.partners import Partner
from ...services.admin_resources import (
    READ_ONLY_RESOURCES,
    model_for_resource,
    writable_fields,
)
from ...services.audit import record_audit

router = APIRouter(prefix="/admin", tags=["HERI Admin CRUD"])


@router.post("/partners/sync")
async def sync_partners_from_research(request: Request, db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(require_permission("heri.content.write"))):
    """Refresh HERI partner projections from the canonical Research Service."""
    settings = get_settings()
    try:
        internal_headers(settings.RESEARCH_SERVICE_API_KEY)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Research integration is not configured",
        ) from exc
    base = settings.RESEARCH_SERVICE_URL.rstrip("/")
    pool = get_integration_pool()
    response = await pool.request_internal(
        "research-heri-partner-sync",
        base,
        "GET",
        "/api/v1/internal/partners",
        api_key=settings.RESEARCH_SERVICE_API_KEY,
        timeout=15.0,
        params={"page": 1, "per_page": 100},
    )
    response.raise_for_status()
    payload = response.json()
    center_by_partner: dict[str, tuple[str, str]] = {}
    centers_response = await pool.request_internal(
        "research-heri-partner-sync",
        base,
        "GET",
        "/api/v1/internal/centers",
        api_key=settings.RESEARCH_SERVICE_API_KEY,
        timeout=15.0,
        params={"page": 1, "per_page": 100},
    )
    if centers_response.is_success:
        centers_payload = centers_response.json()
        centers = centers_payload.get("data", centers_payload if isinstance(centers_payload, list) else [])
        for center in centers:
            center_id = center.get("id")
            if not center_id:
                continue
            links_response = await pool.request_internal(
                "research-heri-partner-sync",
                base,
                "GET",
                f"/api/v1/internal/centers/{center_id}/partners",
                api_key=settings.RESEARCH_SERVICE_API_KEY,
                timeout=15.0,
            )
            if not links_response.is_success:
                continue
            links_payload = links_response.json()
            links = links_payload.get("data", links_payload if isinstance(links_payload, list) else [])
            for partner in links:
                if partner.get("id"):
                    center_by_partner[str(partner["id"])] = (str(center_id), str(center.get("slug") or ""))
    source_records = payload.get("data", payload if isinstance(payload, list) else [])
    center_slugs = {slug for _, slug in center_by_partner.values() if slug}
    if len(center_slugs) == 1:
        settings_record = (await db.execute(select(SiteSettings).order_by(SiteSettings.created_at.asc()))).scalars().first()
        if settings_record is not None and not settings_record.research_center_slug:
            settings_record.research_center_slug = next(iter(center_slugs))
    created = updated = 0
    for source in source_records:
        try:
            source_id = UUID(str(source.get("id")))
        except (TypeError, ValueError):
            continue
        record = (await db.execute(select(Partner).where(Partner.research_partner_id == source_id))).scalar_one_or_none()
        values = {
            "research_partner_id": source_id,
            "slug": source.get("slug") or f"partner-{str(source_id)[:8]}",
            "name": source.get("name") or "Unnamed partner",
            "description": source.get("about") or source.get("description") or "",
            "about": source.get("about"),
            "logo_url": source.get("logo_url") or source.get("logo_image_url"),
            "website_url": source.get("website") or source.get("website_url"),
            "country": source.get("country"),
            "partner_type": source.get("partner_type"),
            "partnership_level": source.get("partnership_level"),
            "relationship_status": source.get("status") or "active",
            "research_center_id": (center_by_partner.get(str(source_id)) or (None, None))[0],
            "research_center_slug": (center_by_partner.get(str(source_id)) or (None, None))[1],
            "is_active": source.get("is_active", True),
            "is_featured": source.get("is_featured", False),
        }
        if record is None:
            db.add(Partner(**values))
            created += 1
        else:
            for key, value in values.items():
                setattr(record, key, value)
            updated += 1
    await record_audit(db, action="sync", entity_type="partners", entity_id="bulk", actor_id=str(user.sub), new_value={"created": created, "updated": updated}, ip_address=request.client.host if request.client else None)
    return {"created": created, "updated": updated, "total": created + updated}


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


@router.post("/{resource}/{record_id}/restore")
async def restore_resource(resource: str, record_id: UUID, payload: dict[str, object], request: Request, db: AsyncSession = Depends(get_db), user: TokenPayload = Depends(require_permission("heri.content.write"))):
    """Restore the changed fields captured by an audit entry and record the restore itself."""
    try:
        model = model_for_resource(resource)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    record = await db.get(model, record_id)
    audit_id = payload.get("audit_id")
    direction = str(payload.get("direction", "previous"))
    if record is None or record.deleted_at is not None or not audit_id or direction not in {"previous", "new"}:
        raise HTTPException(status_code=422, detail="A valid record, audit entry, and restore direction are required")
    try:
        audit_uuid = UUID(str(audit_id))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="audit_id must be a UUID") from exc
    audit = await db.get(AuditLog, audit_uuid)
    if audit is None or audit.entity_type != resource or audit.entity_id != str(record_id):
        raise HTTPException(status_code=404, detail="Audit entry not found")
    snapshot = audit.previous_value if direction == "previous" else audit.new_value
    values = {key: value for key, value in (snapshot or {}).items() if key in writable_fields(model)}
    before = {key: getattr(record, key, None) for key in values}
    if "status" in values and hasattr(model, "status"):
        values["status"] = model.status.type.enum_class(values["status"])
    for key, value in values.items():
        setattr(record, key, value)
    await record_audit(db, action="restore", entity_type=resource, entity_id=str(record.id), actor_id=str(user.sub), previous_value=before, new_value={**values, "source_audit_id": str(audit.id), "direction": direction}, ip_address=request.client.host if request.client else None)
    return record


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
