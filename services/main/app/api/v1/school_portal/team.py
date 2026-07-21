"""School Portal team lifecycle endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status
from fastapi.responses import Response

from ksu_common.schemas.responses import success

from ....deps import DbSession
from ....schemas.school_portal_team import (
    SchoolTeamImportRequest,
    SchoolTeamLifecycleRequest,
    SchoolTeamMemberCreate,
    SchoolTeamMemberUpdate,
    SchoolTeamTransferRequest,
)
from ....services.imports import ImportService
from ....services.school_portal_context import CurrentSchoolContext
from ....services.school_portal_team import (
    activate_school_team_assignment,
    create_school_team_member,
    deactivate_school_team_assignment,
    delete_school_team_assignment,
    end_school_team_assignment,
    get_school_team_assignment,
    list_school_team,
    list_school_team_person_options,
    preview_school_team_import,
    resend_school_team_invite,
    revoke_school_portal_access,
    serialize_school_team_assignments,
    serialize_school_team_person_options,
    team_import_template_csv,
    team_import_template_xlsx,
    transfer_school_team_assignment,
    update_school_team_member,
)
from ....tasks.celery_app import celery_app

router = APIRouter()


@router.get("/team/person-options")
async def get_team_person_options(
    db: DbSession,
    context: CurrentSchoolContext,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = None,
):
    result = await list_school_team_person_options(
        db,
        context,
        page=page,
        per_page=per_page,
        search=search,
    )
    return success(
        data=serialize_school_team_person_options(result.items),
        meta=result.meta,
    )


@router.get("/team")
async def get_team(
    db: DbSession,
    context: CurrentSchoolContext,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    role: str | None = None,
    sort: str = Query("hierarchy_level", pattern="^(hierarchy_level|display_order|created_at|role)$"),
    order: str = Query("asc", pattern="^(asc|desc)$"),
):
    result = await list_school_team(
        db,
        context,
        page=page,
        per_page=per_page,
        search=search,
        status_filter=status_filter,
        role=role,
        sort=sort,
        order=order,
    )
    return success(
        data=await serialize_school_team_assignments(db, context.school.id, result.items),
        meta=result.meta,
    )


@router.post("/team", status_code=status.HTTP_201_CREATED)
async def post_team_member(data: SchoolTeamMemberCreate, db: DbSession, context: CurrentSchoolContext):
    assignment = await create_school_team_member(db, context, data)
    return success(
        data=(await serialize_school_team_assignments(db, context.school.id, [assignment]))[0]
    )


@router.get("/team/imports/template")
async def download_team_import_template(
    context: CurrentSchoolContext,
    format: str = Query("csv", pattern="^(csv|xlsx)$"),
):
    _require_bulk(context)
    if format == "xlsx":
        return Response(
            content=team_import_template_xlsx(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": 'attachment; filename="school-team-template.xlsx"'},
        )
    return Response(
        content=team_import_template_csv(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="school-team-template.csv"'},
    )


@router.post("/team/imports/preview")
async def preview_team_import(
    db: DbSession,
    context: CurrentSchoolContext,
    file: UploadFile = File(...),
):
    _require_bulk(context)
    rows = await ImportService.parse_upload(file.filename or "school-team.csv", await file.read())
    return success(data=await preview_school_team_import(db, context.school.id, rows))


@router.post("/team/imports", status_code=status.HTTP_202_ACCEPTED)
async def queue_team_import(data: SchoolTeamImportRequest, context: CurrentSchoolContext):
    _require_bulk(context)
    task = celery_app.send_task(
        "main.imports.school_team_commit",
        kwargs={
            "payload": data.model_dump(mode="json"),
            "school_id": str(context.school.id),
            "actor_id": str(context.user.id),
        },
        task_id=str(data.idempotency_key),
    )
    return success(data={"job_id": task.id, "status": "PENDING"})


def _require_bulk(context: CurrentSchoolContext) -> None:
    if "school.team.bulk" not in context.permissions:
        raise HTTPException(status_code=403, detail="school.team.bulk permission is required")


@router.get("/team/{assignment_id}")
async def get_team_member(assignment_id: uuid.UUID, db: DbSession, context: CurrentSchoolContext):
    assignment = await get_school_team_assignment(db, context, assignment_id)
    return success(
        data=(await serialize_school_team_assignments(db, context.school.id, [assignment]))[0]
    )


@router.patch("/team/{assignment_id}")
async def patch_team_member(
    assignment_id: uuid.UUID,
    data: SchoolTeamMemberUpdate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    assignment = await update_school_team_member(db, context, assignment_id, data)
    return success(
        data=(await serialize_school_team_assignments(db, context.school.id, [assignment]))[0]
    )


@router.post("/team/{assignment_id}/activate")
async def activate_team_member(assignment_id: uuid.UUID, db: DbSession, context: CurrentSchoolContext):
    assignment = await activate_school_team_assignment(db, context, assignment_id)
    return success(
        data=(await serialize_school_team_assignments(db, context.school.id, [assignment]))[0]
    )


@router.post("/team/{assignment_id}/deactivate")
async def deactivate_team_member(
    assignment_id: uuid.UUID,
    data: SchoolTeamLifecycleRequest,
    db: DbSession,
    context: CurrentSchoolContext,
):
    assignment = await deactivate_school_team_assignment(db, context, assignment_id, data)
    return success(
        data=(await serialize_school_team_assignments(db, context.school.id, [assignment]))[0]
    )


@router.post("/team/{assignment_id}/end")
async def end_team_member(
    assignment_id: uuid.UUID,
    data: SchoolTeamLifecycleRequest,
    db: DbSession,
    context: CurrentSchoolContext,
):
    assignment = await end_school_team_assignment(db, context, assignment_id, data)
    return success(
        data=(await serialize_school_team_assignments(db, context.school.id, [assignment]))[0]
    )


@router.post("/team/{assignment_id}/transfer")
async def transfer_team_member(
    assignment_id: uuid.UUID,
    data: SchoolTeamTransferRequest,
    db: DbSession,
    context: CurrentSchoolContext,
):
    assignment = await transfer_school_team_assignment(
        db,
        context,
        assignment_id,
        department_id=data.department_id,
        role=data.role,
        title=data.title,
    )
    return success(
        data=(await serialize_school_team_assignments(db, context.school.id, [assignment]))[0]
    )


@router.post("/team/{assignment_id}/revoke-access")
async def revoke_team_member_access(assignment_id: uuid.UUID, db: DbSession, context: CurrentSchoolContext):
    await revoke_school_portal_access(db, context, assignment_id)
    return success(message="Portal access revoked")


@router.post("/team/{assignment_id}/resend-invite")
async def resend_team_member_invite(assignment_id: uuid.UUID, db: DbSession, context: CurrentSchoolContext):
    await resend_school_team_invite(db, context, assignment_id)
    return success(message="Invitation queued")


@router.delete("/team/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_team_member(assignment_id: uuid.UUID, db: DbSession, context: CurrentSchoolContext):
    await delete_school_team_assignment(db, context, assignment_id)


__all__ = ["router"]
