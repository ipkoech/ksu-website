"""Student governance endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import StudentGovernance
from ...schemas import StudentGovernanceCreate, StudentGovernanceUpdate
from ...services import StudentGovernanceService

router = APIRouter()


@router.get("")
@cached_public(timeout=300)
async def list_student_governance(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    governance_type: str | None = None,
    school_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(StudentGovernance, fields)
    result = await StudentGovernanceService.list(
        db,
        page=page,
        per_page=per_page,
        governance_type=governance_type,
        school_id=school_id,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300)
async def get_student_governance(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(StudentGovernance, fields)
    item = await StudentGovernanceService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Student governance body not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_student_governance(data: StudentGovernanceCreate, db: DbSession, _: CurrentUser):
    item = await StudentGovernanceService.create(db, **data.model_dump())
    return success(data=item, message="Student governance body created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_student_governance(item_id: uuid.UUID, data: StudentGovernanceUpdate, db: DbSession, _: CurrentUser):
    item = await StudentGovernanceService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Student governance body not found")
    item = await StudentGovernanceService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Student governance body updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_student_governance(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await StudentGovernanceService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Student governance body not found")
    await StudentGovernanceService.delete(db, item)
