"""Admin notification endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common.schemas.responses import success

from ....deps import CurrentUser, DbSession, require_scope
from ....models import NotificationDelivery, NotificationTemplate
from ....schemas import (
    NotificationBroadcastCreate,
    NotificationCreate,
    NotificationTemplateCreate,
    NotificationTemplateUpdate,
)
from ....services import NotificationService
from .._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()


@router.get("/templates", dependencies=[Depends(require_scope("notifications.view"))])
async def list_templates(db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(NotificationTemplate, fields)
    items = await NotificationService.list_templates(db, load_options=selector.load_options)
    return success(data=selector.apply(items))


@router.post("/templates", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("notifications.manage"))])
async def create_template(data: NotificationTemplateCreate, db: DbSession, _: CurrentUser):
    item = await NotificationService.create_template(db, **data.model_dump())
    return success(data=item, message="Notification template created")


@router.get("/templates/{template_id}", dependencies=[Depends(require_scope("notifications.view"))])
async def get_template(template_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(NotificationTemplate, fields)
    item = await NotificationService.get_template_by_id(db, template_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Notification template not found")
    return success(data=selector.apply(item))


@router.patch("/templates/{template_id}", dependencies=[Depends(require_scope("notifications.manage"))])
async def update_template(template_id: uuid.UUID, data: NotificationTemplateUpdate, db: DbSession, _: CurrentUser):
    item = await NotificationService.get_template_by_id(db, template_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Notification template not found")
    item = await NotificationService.update_template(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Notification template updated")


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("notifications.delete"))])
async def delete_template(template_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await NotificationService.get_template_by_id(db, template_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Notification template not found")
    await NotificationService.delete_template(db, item)


@router.get("/deliveries", dependencies=[Depends(require_scope("notifications.view"))])
async def list_deliveries(
    db: DbSession,
    _: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: str | None = None,
    channel: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(NotificationDelivery, fields)
    result = await NotificationService.list_deliveries(db, page=page, per_page=per_page, status=status, channel=channel, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.post("/send", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("notifications.send"))])
async def send_notification(data: NotificationCreate, db: DbSession, _: CurrentUser):
    item = await NotificationService.send_to_user(db, **data.model_dump())
    return success(data=item, message="Notification queued")


@router.post("/broadcast", status_code=status.HTTP_202_ACCEPTED, dependencies=[Depends(require_scope("notifications.send"))])
async def broadcast_notification(data: NotificationBroadcastCreate, db: DbSession, _: CurrentUser):
    result = await NotificationService.send_broadcast(db, **data.model_dump())
    return success(data=result, message="Notification broadcast queued")


@router.post("/broadcast/preview", dependencies=[Depends(require_scope("notifications.send"))])
async def preview_broadcast(data: NotificationBroadcastCreate, db: DbSession, _: CurrentUser):
    result = await NotificationService.preview_broadcast(
        db,
        user_ids=data.user_ids,
        role_names=data.role_names,
        audience_scope_type=data.audience_scope_type,
        audience_scope_id=data.audience_scope_id,
    )
    return success(data=result)
