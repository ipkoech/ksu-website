"""School-scoped notifications for portal users."""

import uuid

from fastapi import APIRouter, HTTPException, Query
from ksu_common.schemas.responses import success

from ....deps import DbSession
from ....services import NotificationService
from ....services.school_portal_context import CurrentSchoolContext

router = APIRouter()


def _require(context, permission: str) -> None:
    if permission not in context.permissions:
        raise HTTPException(status_code=403, detail=f"{permission} permission is required")


async def _notification_for_school(
    notification_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    notification = await NotificationService.get_by_id(db, notification_id)
    if (
        notification is None
        or notification.user_id != context.user.id
        or notification.scope_type != "school"
        or notification.scope_id != context.school.id
    ):
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification


@router.get("/notifications")
async def list_school_notifications(
    db: DbSession,
    context: CurrentSchoolContext,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    unread_only: bool = False,
):
    _require(context, "school.notifications.view")
    result = await NotificationService.list_for_user(
        db,
        context.user.id,
        page=page,
        per_page=per_page,
        unread_only=unread_only,
        scope_type="school",
        scope_id=context.school.id,
    )
    return success(data=result.items, meta=result.meta)


@router.patch("/notifications/{notification_id}/read")
async def mark_school_notification_read(
    notification_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.notifications.view")
    notification = await _notification_for_school(notification_id, db, context)
    return success(data=await NotificationService.mark_as_read(db, notification))


@router.post("/notifications/read-all")
async def mark_all_school_notifications_read(
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.notifications.view")
    count = await NotificationService.mark_all_as_read(
        db,
        context.user.id,
        scope_type="school",
        scope_id=context.school.id,
    )
    return success(data={"updated": count})


@router.post("/notifications/{notification_id}/archive")
async def archive_school_notification(
    notification_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    _require(context, "school.notifications.manage")
    notification = await _notification_for_school(notification_id, db, context)
    return success(data=await NotificationService.archive(db, notification))
