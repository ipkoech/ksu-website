"""School-authored content and CoCMS handoff endpoints."""

import uuid

from fastapi import APIRouter, Query, status
from ksu_common.schemas.responses import success

from ....deps import DbSession
from ....schemas.school_portal_content import (
    SchoolContentAction,
    SchoolContentCreate,
    SchoolContentUpdate,
)
from ....services.school_portal_content import (
    create_school_content,
    delete_school_content,
    get_school_content,
    list_school_content,
    run_school_content_action,
    update_school_content,
)
from ....services.school_portal_context import CurrentSchoolContext

router = APIRouter()


@router.get("/content")
async def list_content(
    db: DbSession,
    context: CurrentSchoolContext,
    content_type: str | None = Query(None),
):
    return success(data=await list_school_content(db, context, content_type))


@router.post("/content", status_code=status.HTTP_201_CREATED)
async def create_content(
    data: SchoolContentCreate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    return success(data=await create_school_content(db, context, data))


@router.get("/content/{content_type}/{content_id}")
async def get_content(
    content_type: str,
    content_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    return success(data=await get_school_content(db, context, content_type, content_id))


@router.patch("/content/{content_type}/{content_id}")
async def patch_content(
    content_type: str,
    content_id: uuid.UUID,
    data: SchoolContentUpdate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    if data.content_type != content_type:
        from fastapi import HTTPException

        raise HTTPException(status_code=422, detail="Content type does not match route")
    return success(data=await update_school_content(db, context, content_id, data))


@router.delete(
    "/content/{content_type}/{content_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_content(
    content_type: str,
    content_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    await delete_school_content(db, context, content_type, content_id)


@router.post("/content/{content_type}/{content_id}/submit")
async def submit_content(
    content_type: str,
    content_id: uuid.UUID,
    data: SchoolContentAction,
    db: DbSession,
    context: CurrentSchoolContext,
):
    return success(
        data=await run_school_content_action(
            db,
            context,
            content_type,
            content_id,
            "submit",
            comments=data.comments,
        )
    )


@router.post("/content/{content_type}/{content_id}/withdraw")
async def withdraw_content(
    content_type: str,
    content_id: uuid.UUID,
    data: SchoolContentAction,
    db: DbSession,
    context: CurrentSchoolContext,
):
    return success(
        data=await run_school_content_action(
            db,
            context,
            content_type,
            content_id,
            "withdraw",
            comments=data.comments,
        )
    )
