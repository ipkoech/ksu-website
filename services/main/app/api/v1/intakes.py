"""Intake endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import ValidationError

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession
from ...models import Intake
from ...security.scopes import can_access_scope
from ...schemas import IntakeCreate, IntakeHomepageAdmissionUpdate, IntakeUpdate
from ...services import IntakeHomepageAdmissionService, IntakeService

router = APIRouter()

INTAKE_VIEW_PERMISSIONS = ["academic.view", "academic.manage_intakes"]
INTAKE_MANAGE_PERMISSIONS = ["academic.manage_intakes"]


async def _can_access_intake_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
) -> bool:
    for permission in permissions:
        if await can_access_scope(db, user, permission, "university", None):
            return True
    return False


async def _require_intake_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
) -> None:
    if not await _can_access_intake_scope(db, user, permissions):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for intake management",
        )


@router.get("")
@cached_public(
    timeout=300,
    vary_on=(
        "page",
        "per_page",
        "academic_calendar_id",
        "is_open",
        "fields",
        "include",
    ),
)
async def list_intakes(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    academic_calendar_id: uuid.UUID | None = None,
    is_open: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Intake, fields)
    result = await IntakeService.list(
        db,
        page=page,
        per_page=per_page,
        academic_calendar_id=academic_calendar_id,
        is_open=is_open,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/admin")
async def list_admin_intakes(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    academic_calendar_id: uuid.UUID | None = None,
    is_open: bool | None = None,
    is_active: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    await _require_intake_scope(db, user, INTAKE_VIEW_PERMISSIONS)
    selector = build_selector(Intake, fields)
    result = await IntakeService.list(
        db,
        page=page,
        per_page=per_page,
        academic_calendar_id=academic_calendar_id,
        is_active=is_active,
        is_open=is_open,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_intake(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Intake, fields)
    intake = await IntakeService.get_by_slug(
        db, slug, load_options=selector.load_options
    )
    if intake is None:
        raise HTTPException(status_code=404, detail="Intake not found")
    return success(data=selector.apply(intake))


@router.get("/id/{intake_id}")
async def get_intake_by_id(
    intake_id: uuid.UUID,
    db: DbSession,
    _: CurrentUser,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Intake, fields)
    intake = await IntakeService.get_by_id(
        db, intake_id, load_options=selector.load_options
    )
    if intake is None:
        raise HTTPException(status_code=404, detail="Intake not found")
    return success(data=selector.apply(intake))


@router.get("/id/{intake_id}/homepage-admission")
async def get_homepage_admission(
    intake_id: uuid.UUID, db: DbSession, user: CurrentUser
):
    await _require_intake_scope(db, user, INTAKE_MANAGE_PERMISSIONS)
    config = await IntakeHomepageAdmissionService.get_config(db, intake_id)
    if config is None:
        raise HTTPException(status_code=404, detail="Intake not found")
    return success(data=config)


@router.patch("/id/{intake_id}/homepage-admission")
async def update_homepage_admission(
    intake_id: uuid.UUID,
    data: IntakeHomepageAdmissionUpdate,
    db: DbSession,
    user: CurrentUser,
):
    await _require_intake_scope(db, user, INTAKE_MANAGE_PERMISSIONS)
    intake = await IntakeHomepageAdmissionService.get_intake(db, intake_id)
    if intake is None:
        raise HTTPException(status_code=404, detail="Intake not found")
    try:
        config = await IntakeHomepageAdmissionService.update_config(
            db, intake, data, user.id
        )
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=exc.errors(include_url=False, include_context=False),
        ) from exc
    return success(data=config, message="Homepage admission configuration updated")


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_intake(data: IntakeCreate, db: DbSession, user: CurrentUser):
    await _require_intake_scope(db, user, INTAKE_MANAGE_PERMISSIONS)
    intake = await IntakeService.create(db, **data.model_dump())
    return success(data=intake, message="Intake created")


@router.patch("/{intake_id}")
async def update_intake(
    intake_id: uuid.UUID, data: IntakeUpdate, db: DbSession, user: CurrentUser
):
    intake = await IntakeService.get_by_id(db, intake_id)
    if intake is None:
        raise HTTPException(status_code=404, detail="Intake not found")
    await _require_intake_scope(db, user, INTAKE_MANAGE_PERMISSIONS)
    intake = await IntakeService.update(
        db, intake, **data.model_dump(exclude_unset=True)
    )
    return success(data=intake, message="Intake updated")


@router.delete("/{intake_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_intake(intake_id: uuid.UUID, db: DbSession, user: CurrentUser):
    intake = await IntakeService.get_by_id(db, intake_id)
    if intake is None:
        raise HTTPException(status_code=404, detail="Intake not found")
    await _require_intake_scope(db, user, INTAKE_MANAGE_PERMISSIONS)
    await IntakeService.delete(db, intake)
