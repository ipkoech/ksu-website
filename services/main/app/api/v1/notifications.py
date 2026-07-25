"""Authenticated notification endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession
from ...models import Notification
from ...services import NotificationService
from ...schemas.notification import NotificationPreferences
from ._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()


@router.get("")
async def list_notifications(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    unread_only: bool = False,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Notification, fields)
    result = await NotificationService.list_for_user(
        db,
        user.id,
        page=page,
        per_page=per_page,
        unread_only=unread_only,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/unread-count")
async def unread_notification_count(db: DbSession, user: CurrentUser):
    return success(data={"count": await NotificationService.unread_count(db, user.id)})


@router.post("/read-all")
async def mark_all_notifications_read(db: DbSession, user: CurrentUser):
    count = await NotificationService.mark_all_as_read(db, user.id)
    return success(data={"updated": count}, message="Notifications marked as read")


@router.get("/preferences")
async def get_notification_preferences(db: DbSession, user: CurrentUser):
    return success(
        data=await NotificationService.notification_preferences(db, user.id)
    )


@router.put("/preferences")
async def put_notification_preferences(
    data: NotificationPreferences,
    db: DbSession,
    user: CurrentUser,
):
    return success(
        data=await NotificationService.update_notification_preferences(
            db,
            user.id,
            data.model_dump(),
        )
    )


@router.patch("/{notification_id}/read")
async def mark_notification_as_read(notification_id: uuid.UUID, db: DbSession, user: CurrentUser):
    notification = await NotificationService.get_by_id(db, notification_id)
    if notification is None or notification.user_id != user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification = await NotificationService.mark_as_read(db, notification)
    return success(data=notification, message="Notification marked as read")


@router.post("/{notification_id}/archive")
async def archive_notification(
    notification_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
):
    notification = await NotificationService.get_by_id(db, notification_id)
    if notification is None or notification.user_id != user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    return success(
        data=await NotificationService.archive(db, notification),
        message="Notification archived",
    )


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(notification_id: uuid.UUID, db: DbSession, user: CurrentUser):
    notification = await NotificationService.get_by_id(db, notification_id)
    if notification is None or notification.user_id != user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    await NotificationService.delete(db, notification)
