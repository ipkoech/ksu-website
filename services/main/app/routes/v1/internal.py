"""Internal endpoints consumed only by sibling services (Research, Library).

Protected by INTERNAL_API_KEY header — not exposed through the public gateway.
"""

from __future__ import annotations

import uuid
from hashlib import sha256
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status
from fastapi.responses import JSONResponse
from ksu_common.audit import insert_audit_batch
from ksu_common.rate_limit import rate_limit
from ksu_common.internal_client import internal_key_guard
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ...core.config import get_settings
from ...core.database import get_db
from ...deps import get_current_active_user, get_token_payload
from ...helpers.email import send_email
from ...models import AuditLog, Document, Event, Media, Person, StaffAssignment
from ...schemas.audit import AuditLogRead
from ...services import (
    DepartmentService,
    EventService,
    NotificationService,
    PersonService,
    StaffService,
)

router = APIRouter(tags=["Internal"])
settings = get_settings()


verify_internal_key = internal_key_guard(
    lambda: get_settings().INTERNAL_API_KEY,
    allow_legacy_header=False,
)


class InternalEmailPayload(BaseModel):
    to_email: str = Field(..., max_length=320)
    subject: str = Field(..., max_length=255)
    text_body: str
    html_body: str | None = None


class InternalNotificationBroadcastPayload(BaseModel):
    role_names: list[str] = Field(default_factory=list)
    title: str = Field(..., max_length=255)
    message: str
    subject: str | None = Field(default=None, max_length=255)
    notification_type: str = Field(default="info", max_length=50)
    priority: str = Field(default="normal", max_length=32)
    action_url: str | None = Field(default=None, max_length=500)
    channels: list[str] = Field(default_factory=lambda: ["in_app"])
    payload: dict | None = None


class InternalMediaResolvePayload(BaseModel):
    ids: list[uuid.UUID] = Field(min_length=1, max_length=100)


class InternalMediaSource(BaseModel):
    source_url: str = Field(..., min_length=1, max_length=1024)
    filename: str = Field(..., min_length=1, max_length=255)


class InternalMediaSourceResolvePayload(BaseModel):
    sources: list[InternalMediaSource] = Field(min_length=1, max_length=100)


class InternalDocumentResolvePayload(BaseModel):
    ids: list[uuid.UUID] = Field(min_length=1, max_length=100)


class InternalPersonResolvePayload(BaseModel):
    ids: list[uuid.UUID] = Field(min_length=1, max_length=100)


class InternalAuditPageMeta(BaseModel):
    page: int
    per_page: int
    has_next: bool


class InternalAuditListResponse(BaseModel):
    status: str
    message: str
    data: list[AuditLogRead]
    meta: InternalAuditPageMeta


class InternalMediaSnapshot(BaseModel):
    id: uuid.UUID
    title: str | None = None
    alt_text: str | None = None
    description: str | None = None
    caption: str | None = None
    media_type: str
    thumbnail_url: str | None = None
    url: str
    is_public: bool


class InternalMediaResolveResponse(BaseModel):
    status: str
    data: list[InternalMediaSnapshot]


class InternalMediaSourceMatch(BaseModel):
    source_url: str
    filename: str
    media_id: uuid.UUID


class InternalMediaSourceResolveResponse(BaseModel):
    status: str
    data: list[InternalMediaSourceMatch]


class InternalDocumentResolveResponse(BaseModel):
    status: str
    data: list[uuid.UUID]


class InternalEmailResponse(BaseModel):
    provider_id: str | None = None


class InternalNotificationBroadcastResponse(BaseModel):
    recipient_count: int
    notification_ids: list[uuid.UUID]


class InternalPersonSnapshot(BaseModel):
    id: uuid.UUID
    display_name: str
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    department_id: uuid.UUID | None = None
    photo_id: uuid.UUID | None = None
    is_active: bool


class InternalStaffPersonSnapshot(BaseModel):
    id: uuid.UUID
    display_name: str
    email: str | None = None
    photo_id: uuid.UUID | None = None


class InternalStaffAssignmentSnapshot(BaseModel):
    id: uuid.UUID
    person_id: uuid.UUID
    entity_type: str | None = None
    entity_id: uuid.UUID | None = None
    role: str | None = None
    title: str | None = None
    status: str | None = None
    is_public: bool
    display_order: int
    person: InternalStaffPersonSnapshot | None = None


class InternalDepartmentSnapshot(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    code: str | None = None
    department_type: str | None = None
    school_id: uuid.UUID | None = None
    is_active: bool


class InternalDepartmentCheckResponse(BaseModel):
    school_id: uuid.UUID
    department_id: uuid.UUID
    exists: bool


class InternalPublicMediaSnapshot(BaseModel):
    id: uuid.UUID
    filename: str
    original_filename: str | None = None
    mime_type: str
    file_size: int
    title: str | None = None
    alt_text: str | None = None
    description: str | None = None
    caption: str | None = None
    media_type: str
    thumbnail_url: str | None = None
    url: str
    is_public: bool


class InternalPersonResolveSnapshot(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    display_name: str
    full_name: str
    title: str | None = None
    academic_rank: str | None = None
    institutional_role: str | None = None
    specialization: str | None = None
    photo_url: str | None = None


class InternalPersonResolveResponse(BaseModel):
    status: str
    data: list[InternalPersonResolveSnapshot]


class InternalReferenceCheckResponse(BaseModel):
    kind: str
    id: uuid.UUID
    exists: bool


class InternalEventSnapshot(BaseModel):
    """Selectable public event columns exposed to sibling services."""

    id: uuid.UUID | None = None
    title: str | None = None
    slug: str | None = None
    summary: str | None = None
    plain_text: str | None = None
    rich_text: str | None = None
    structured_content: dict[str, Any] | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    location: str | None = None
    is_virtual: bool | None = None
    meeting_link: str | None = None
    is_featured: bool | None = None
    featured_media_id: uuid.UUID | None = None
    author_user_id: uuid.UUID | None = None
    related_links: list[dict[str, Any]] | None = None
    scope_type: str | None = None
    scope_id: uuid.UUID | None = None
    is_main: bool | None = None
    is_public: bool | None = None
    is_published: bool | None = None
    published_at: datetime | None = None
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    archived_at: datetime | None = None
    status: str | None = None
    display_order: int | None = None
    workflow_status: str | None = None
    owner_portal: str | None = None
    owner_scope_type: str | None = None
    owner_scope_id: uuid.UUID | None = None
    submitted_by_id: uuid.UUID | None = None
    submitted_at: datetime | None = None
    reviewed_by_id: uuid.UUID | None = None
    reviewed_at: datetime | None = None
    approved_by_id: uuid.UUID | None = None
    approved_at: datetime | None = None
    published_by_id: uuid.UUID | None = None
    scheduled_publish_at: datetime | None = None
    expires_at: datetime | None = None
    unpublished_by_id: uuid.UUID | None = None
    unpublished_at: datetime | None = None
    rejection_reason: str | None = None
    revision_notes: str | None = None
    updated_by_id: uuid.UUID | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class InternalEventListResponse(BaseModel):
    status: str
    message: str
    data: list[InternalEventSnapshot]
    meta: dict[str, int]


class InternalAuditPayload(BaseModel):
    id: uuid.UUID
    service_name: str = Field(max_length=64)
    action: str = Field(max_length=128)
    resource_type: str | None = Field(default=None, max_length=64)
    resource_id: str | None = Field(default=None, max_length=64)
    request_method: str = Field(max_length=16)
    request_path: str = Field(max_length=512)
    route_name: str | None = Field(default=None, max_length=255)
    status_code: int
    status: str = Field(max_length=20)
    user_id: uuid.UUID | None = None
    session_jti: str | None = Field(default=None, max_length=64)
    ip_address: str | None = Field(default=None, max_length=45)
    user_agent: str | None = Field(default=None, max_length=512)
    error_message: str | None = None
    details: dict | None = None
    changes: dict | None = None
    happened_at: datetime

    @field_validator("service_name", "action", "resource_type", "resource_id", "request_method",
                     "request_path", "route_name", "status", "session_jti", "ip_address",
                     "user_agent", "error_message")
    @classmethod
    def validate_storage_text(cls, value):
        if value is not None and any(character == "\x00" or "\ud800" <= character <= "\udfff" for character in value):
            raise ValueError("audit text contains unsupported characters")
        return value


@router.post("/audit", dependencies=[Depends(verify_internal_key)], status_code=status.HTTP_202_ACCEPTED, response_model=dict[str, str])
async def ingest_internal_audit(request: Request, payload: InternalAuditPayload, db: AsyncSession = Depends(get_db)):
    """Idempotently persist a sibling service's audit event in Main's schema."""
    await insert_audit_batch(db, [payload.model_dump()], AuditLog)
    request.scope["ksu.audit_ingested"] = True
    return {"status": "accepted", "id": str(payload.id)}


class InternalAuditBatch(BaseModel):
    events: list[InternalAuditPayload] = Field(min_length=1, max_length=100)


class InternalAuditBatchResult(BaseModel):
    status: str
    received: int
    inserted: int


@router.post("/audit/batch", dependencies=[Depends(verify_internal_key)],
             status_code=status.HTTP_202_ACCEPTED, response_model=InternalAuditBatchResult)
@rate_limit(requests=60, window=60, prefix="main:internal-audit-batch", max_body_bytes=256 * 1024)
async def ingest_internal_audit_batch(
    request: Request, payload: InternalAuditBatch, db: AsyncSession = Depends(get_db),
):
    inserted = await insert_audit_batch(db, [event.model_dump() for event in payload.events], AuditLog)
    request.scope["ksu.audit_ingested"] = True
    return InternalAuditBatchResult(status="accepted", received=len(payload.events), inserted=inserted)


@router.get("/audit", dependencies=[Depends(verify_internal_key)], response_model=InternalAuditListResponse)
async def list_internal_audit(
    service_name: str = Query(..., max_length=64),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: uuid.UUID | None = None,
    resource_type: str | None = Query(default=None, max_length=64),
    resource_id: str | None = Query(default=None, max_length=64),
    status_filter: str | None = Query(default=None, alias="status", max_length=20),
    db: AsyncSession = Depends(get_db),
):
    """Return only the requested service's audit stream to authenticated callers."""
    query = select(AuditLog).where(AuditLog.deleted_at.is_(None), AuditLog.service_name == service_name)
    if user_id is not None:
        query = query.where(AuditLog.user_id == user_id)
    if resource_type is not None:
        query = query.where(AuditLog.resource_type == resource_type)
    if resource_id is not None:
        query = query.where(AuditLog.resource_id == resource_id)
    if status_filter is not None:
        query = query.where(AuditLog.status == status_filter)
    query = query.order_by(AuditLog.happened_at.desc()).offset((page - 1) * per_page).limit(per_page + 1)
    items = list((await db.execute(query)).scalars().all())
    has_next = len(items) > per_page
    data = [AuditLogRead.model_validate(item).model_dump(mode="json") for item in items[:per_page]]
    return {
        "status": "success",
        "message": "ok",
        "data": data,
        "meta": {"page": page, "per_page": per_page, "has_next": has_next},
    }


class IdentitySnapshot(BaseModel):
    sub: str
    jti: str
    person_id: uuid.UUID | None = None
    scope_grants: list[dict[str, Any]]
    mfa_enabled: bool = False
    mfa_verified_at: float | None = None


@router.post("/auth/introspect", response_model=IdentitySnapshot,
             dependencies=[Depends(verify_internal_key)])
async def introspect_identity(
    user=Depends(get_current_active_user),
    token=Depends(get_token_payload),
    db: AsyncSession = Depends(get_db),
):
    """Validate the real user session and return current database assignments."""
    from ...services.auth import _active_scope_grants

    person_id = await db.scalar(select(Person.id).where(
        Person.user_id == user.id, Person.deleted_at.is_(None), Person.is_active.is_(True),
    ))
    return IdentitySnapshot(sub=str(user.id), jti=token.jti, person_id=person_id,
                            mfa_enabled=token.raw.get("mfa_enabled") is True,
                            mfa_verified_at=token.raw.get("mfa_verified_at"),
                            scope_grants=_active_scope_grants(user))


@router.get(
    "/events",
    dependencies=[Depends(verify_internal_key)],
    response_model=InternalEventListResponse,
)
async def list_internal_events(
    scope_type: str | None = Query(default=None, max_length=64),
    scope_id: uuid.UUID | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    fields: Any = None,
    db: AsyncSession = Depends(get_db),
):
    """Return public scoped events to authenticated sibling services."""
    from ...api.v1._fields import FieldSelection, build_selector
    fields = fields or FieldSelection()
    selector = build_selector(Event, fields)
    result = await EventService.list(
        db,
        page=page,
        per_page=per_page,
        scope_type=scope_type,
        scope_id=scope_id,
        is_public=True,
        load_options=selector.load_options,
    )
    return {"status": "success", "message": "ok", "data": selector.apply(result.items), "meta": result.meta}


@router.post("/email/send", dependencies=[Depends(verify_internal_key)], response_model=InternalEmailResponse)
async def send_internal_email(
    payload: InternalEmailPayload, request: Request,
    db: AsyncSession = Depends(get_db),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key", min_length=8, max_length=255),
):
    from ...services.idempotency import acquire_json_command, complete_json_command

    claim = None
    if idempotency_key is not None:
        principal = sha256(request.headers.get("X-Internal-Key", "").encode()).hexdigest()
        claim = await acquire_json_command(
            db, command_name="internal.email.send", scope=f"service:{principal}",
            idempotency_key=idempotency_key, request_payload=payload.model_dump(mode="json"),
            in_progress_body={"detail": "Email handoff is in progress"},
            key_reuse_body={"detail": "Idempotency key was used with a different email"},
        )
        if isinstance(claim, JSONResponse):
            return claim
        if claim.kind == "replay":
            return claim.record.response_body
    provider_id = await send_email(
        to_email=payload.to_email,
        subject=payload.subject,
        text_body=payload.text_body,
        html_body=payload.html_body,
    )
    body = {"provider_id": provider_id}
    if claim is not None:
        return complete_json_command(claim.record, status_code=200, response_body=body)
    return body


@router.post(
    "/notifications/broadcast",
    dependencies=[Depends(verify_internal_key)],
    response_model=InternalNotificationBroadcastResponse,
)
async def broadcast_internal_notification(
    payload: InternalNotificationBroadcastPayload,
    db: AsyncSession = Depends(get_db),
):
    result = await NotificationService.send_broadcast(
        db,
        role_names=payload.role_names,
        title=payload.title,
        subject=payload.subject,
        message=payload.message,
        notification_type=payload.notification_type,
        priority=payload.priority,
        action_url=payload.action_url,
        channels=payload.channels,
        payload=payload.payload,
    )
    return result


@router.get(
    "/persons/{person_id}",
    dependencies=[Depends(verify_internal_key)],
    response_model=InternalPersonSnapshot,
)
async def get_person_snapshot(person_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Return a minimal person snapshot for sibling services (Research, Library)."""
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    return {
        "id": str(person.id),
        "display_name": person.display_name,
        "first_name": person.first_name,
        "last_name": person.last_name,
        "email": person.email,
        "department_id": str(person.department_id) if person.department_id else None,
        "photo_id": str(person.photo_id) if person.photo_id else None,
        "is_active": person.is_active,
    }


@router.get(
    "/staff-assignments/{assignment_id}",
    dependencies=[Depends(verify_internal_key)],
    response_model=InternalStaffAssignmentSnapshot,
)
async def get_staff_assignment_snapshot(assignment_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    assignment = await StaffService.get_by_id(
        db,
        assignment_id,
        load_options=(selectinload(StaffAssignment.person),),
    )
    if assignment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff assignment not found")
    person = assignment.person
    return {
        "id": str(assignment.id),
        "person_id": str(assignment.person_id),
        "entity_type": assignment.entity_type,
        "entity_id": str(assignment.entity_id) if assignment.entity_id else None,
        "role": assignment.role,
        "title": assignment.title,
        "status": assignment.status,
        "is_public": assignment.is_public,
        "display_order": assignment.display_order,
        "person": {
            "id": str(person.id),
            "display_name": person.display_name,
            "email": person.email,
            "photo_id": str(person.photo_id) if person.photo_id else None,
        } if person else None,
    }


@router.get(
    "/departments/{department_id}",
    dependencies=[Depends(verify_internal_key)],
    response_model=InternalDepartmentSnapshot,
)
async def get_department_snapshot(department_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    department = await DepartmentService.get_by_id(db, department_id, is_active=None)
    if department is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    return {
        "id": str(department.id),
        "name": department.name,
        "slug": department.slug,
        "code": department.code,
        "department_type": department.department_type,
        "school_id": str(department.school_id) if department.school_id else None,
        "is_active": department.is_active,
    }


@router.get(
    "/schools/{school_id}/departments/{department_id}",
    dependencies=[Depends(verify_internal_key)],
    response_model=InternalDepartmentCheckResponse,
)
async def check_department_school(
    school_id: uuid.UUID,
    department_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Validate the cross-service school/department ownership pair."""
    department = await DepartmentService.get_by_id(db, department_id, is_active=None)
    if department is None or department.school_id != school_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department does not belong to school",
        )
    return {
        "school_id": str(school_id),
        "department_id": str(department_id),
        "exists": True,
    }


@router.get(
    "/media/{media_id}",
    dependencies=[Depends(verify_internal_key)],
    response_model=InternalPublicMediaSnapshot,
)
async def get_public_media_snapshot(media_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Return browser-safe fields for public media referenced by sibling services."""
    media = await Media.get_by_id(db, media_id)
    if media is None or not media.is_public:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    return {
        "id": str(media.id),
        "filename": media.filename,
        "original_filename": media.original_filename,
        "mime_type": media.mime_type,
        "file_size": media.file_size,
        "title": media.title,
        "alt_text": media.alt_text,
        "description": media.description,
        "caption": media.caption,
        "media_type": media.media_type,
        "thumbnail_url": media.thumbnail_url,
        "url": media.url,
        "is_public": media.is_public,
    }


@router.post(
    "/media/resolve",
    dependencies=[Depends(verify_internal_key)],
    response_model=InternalMediaResolveResponse,
)
async def resolve_public_media(
    payload: InternalMediaResolvePayload,
    db: AsyncSession = Depends(get_db),
):
    """Resolve browser-safe media snapshots without exposing Main's tables."""
    result = await db.execute(
        select(Media).where(
            Media.id.in_(set(payload.ids)),
            Media.deleted_at.is_(None),
            Media.is_public.is_(True),
        )
    )
    by_id = {item.id: item for item in result.scalars().all()}
    data = []
    for identifier in payload.ids:
        media = by_id.get(identifier)
        if media is not None:
            data.append(
                {
                    "id": str(media.id),
                    "title": media.title,
                    "alt_text": media.alt_text,
                    "description": media.description,
                    "caption": media.caption,
                    "media_type": media.media_type,
                    "thumbnail_url": media.thumbnail_url,
                    "url": media.url,
                    "is_public": True,
                }
            )
    return {"status": "success", "data": data}


@router.post(
    "/media/resolve-by-source",
    dependencies=[Depends(verify_internal_key)],
    response_model=InternalMediaSourceResolveResponse,
)
async def resolve_public_media_by_source(
    payload: InternalMediaSourceResolvePayload,
    db: AsyncSession = Depends(get_db),
):
    """Resolve public media IDs by the stable source metadata used by seeders."""
    data = []
    for source in payload.sources:
        media = await db.scalar(
            select(Media)
            .where(
                Media.public_url == source.source_url,
                Media.deleted_at.is_(None),
                Media.is_public.is_(True),
            )
            .order_by(Media.created_at, Media.id)
        )
        if media is None:
            media = await db.scalar(
                select(Media)
                .where(
                    Media.original_filename == source.filename,
                    Media.deleted_at.is_(None),
                    Media.is_public.is_(True),
                )
                .order_by(Media.created_at, Media.id)
            )
        if media is not None:
            data.append(
                {
                    "source_url": source.source_url,
                    "filename": source.filename,
                    "media_id": media.id,
                }
            )
    return {"status": "success", "data": data}


@router.post(
    "/documents/resolve",
    dependencies=[Depends(verify_internal_key)],
    response_model=InternalDocumentResolveResponse,
)
async def resolve_public_documents(
    payload: InternalDocumentResolvePayload,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Document).where(
        Document.id.in_(set(payload.ids)), Document.deleted_at.is_(None),
        Document.is_active.is_(True), Document.is_public.is_(True),
        Document.is_published.is_(True),
    ))
    found = {item.id for item in result.scalars().all()}
    return {"status": "success", "data": [str(identifier) for identifier in payload.ids if identifier in found]}


@router.post(
    "/persons/resolve",
    dependencies=[Depends(verify_internal_key)],
    response_model=InternalPersonResolveResponse,
)
async def resolve_public_persons(
    payload: InternalPersonResolvePayload,
    db: AsyncSession = Depends(get_db),
):
    """Resolve public researcher snapshots for records owned by sibling services."""
    result = await db.execute(
        select(Person)
        .options(selectinload(Person.photo))
        .where(
            Person.id.in_(set(payload.ids)),
            Person.deleted_at.is_(None),
            Person.is_active.is_(True),
            Person.is_public.is_(True),
        )
    )
    by_id = {item.id: item for item in result.scalars().all()}
    data = []
    for identifier in payload.ids:
        person = by_id.get(identifier)
        if person is None:
            continue
        photo = person.photo
        data.append(
            {
                "id": str(person.id),
                "slug": person.slug,
                "name": person.display_name,
                "display_name": person.display_name,
                "full_name": person.full_name,
                "title": person.title,
                "academic_rank": person.academic_rank,
                "institutional_role": person.institutional_role,
                "specialization": person.specialization,
                "photo_url": photo.url if photo and photo.is_public else None,
            }
        )
    return {"status": "success", "data": data}


@router.get(
    "/references/{kind}/{item_id}",
    dependencies=[Depends(verify_internal_key)],
    response_model=InternalReferenceCheckResponse,
)
async def check_reference(kind: str, item_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Validate shared main-owned references for sibling services."""
    normalized = kind.replace("_", "-")
    if normalized in {"person", "persons"}:
        exists = await Person.get_by_id(db, item_id) is not None
    elif normalized in {"department", "departments"}:
        exists = await DepartmentService.get_by_id(db, item_id, is_active=None) is not None
    elif normalized in {"staff-assignment", "staff-assignments"}:
        exists = await StaffService.get_by_id(db, item_id) is not None
    elif normalized in {"school", "schools"}:
        from ...services import SchoolService

        exists = await SchoolService.get_by_id(db, item_id) is not None
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported reference kind")

    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference not found")
    return {"kind": normalized, "id": str(item_id), "exists": True}
