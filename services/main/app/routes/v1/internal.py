"""Internal endpoints consumed only by sibling services (Research, Library).

Protected by INTERNAL_API_KEY header — not exposed through the public gateway.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from ksu_common.internal_client import internal_key_guard
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ...api.v1._fields import FieldsDep, FieldSelection, build_selector
from ...core.config import get_settings
from ...core.database import get_db
from ...helpers.email import send_email
from ...models import AuditLog, Event, Media, Person, StaffAssignment
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


@router.post("/audit", dependencies=[Depends(verify_internal_key)], status_code=status.HTTP_202_ACCEPTED, response_model=dict[str, str])
async def ingest_internal_audit(payload: InternalAuditPayload, db: AsyncSession = Depends(get_db)):
    """Idempotently persist a sibling service's audit event in Main's schema."""
    values = payload.model_dump()
    statement = insert(AuditLog).values(**values).on_conflict_do_nothing(index_elements=[AuditLog.id])
    await db.execute(statement)
    await db.commit()
    return {"status": "accepted", "id": str(payload.id)}


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


@router.get("/events", dependencies=[Depends(verify_internal_key)])
async def list_internal_events(
    scope_type: str | None = Query(default=None, max_length=64),
    scope_id: uuid.UUID | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    fields: FieldSelection = FieldsDep,
    db: AsyncSession = Depends(get_db),
):
    """Return public scoped events to authenticated sibling services."""
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


@router.post("/email/send", dependencies=[Depends(verify_internal_key)])
async def send_internal_email(payload: InternalEmailPayload):
    provider_id = await send_email(
        to_email=payload.to_email,
        subject=payload.subject,
        text_body=payload.text_body,
        html_body=payload.html_body,
    )
    return {"provider_id": provider_id}


@router.post("/notifications/broadcast", dependencies=[Depends(verify_internal_key)])
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


@router.get("/persons/{person_id}", dependencies=[Depends(verify_internal_key)])
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


@router.get("/staff-assignments/{assignment_id}", dependencies=[Depends(verify_internal_key)])
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


@router.get("/departments/{department_id}", dependencies=[Depends(verify_internal_key)])
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


@router.get("/media/{media_id}", dependencies=[Depends(verify_internal_key)])
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


@router.get("/references/{kind}/{item_id}", dependencies=[Depends(verify_internal_key)])
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
