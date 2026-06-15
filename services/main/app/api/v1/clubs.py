"""Club endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Club, ClubActivity
from ...schemas import ClubActivityCreate, ClubActivityUpdate, ClubCreate, ClubUpdate
from ...services import ClubService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "q", "club_type", "school_id", "department_id", "fields", "include"))
async def list_clubs(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    q: str | None = None,
    club_type: str | None = None,
    school_id: uuid.UUID | None = None,
    department_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Club, fields)
    result = await ClubService.list(
        db,
        page=page,
        per_page=per_page,
        q=q,
        club_type=club_type,
        school_id=school_id,
        department_id=department_id,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300)
async def get_club(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Club, fields)
    item = await ClubService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Club not found")
    return success(data=selector.apply(item))


@router.get("/{slug}/activities")
@cached_public(timeout=300)
async def get_club_activities(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    item = await ClubService.get_by_slug(db, slug)
    if item is None:
        raise HTTPException(status_code=404, detail="Club not found")
    selector = build_selector(ClubActivity, fields)
    items = await ClubService.list_activities(db, item.id)
    return success(data=selector.apply(items))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_club(data: ClubCreate, db: DbSession, _: CurrentUser):
    item = await ClubService.create(db, **data.model_dump())
    return success(data=item, message="Club created")


@router.patch("/{club_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_club(club_id: uuid.UUID, data: ClubUpdate, db: DbSession, _: CurrentUser):
    item = await ClubService.get_by_id(db, club_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Club not found")
    item = await ClubService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Club updated")


@router.post("/{club_id}/activities", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_club_activity(club_id: uuid.UUID, data: ClubActivityCreate, db: DbSession, _: CurrentUser):
    club = await ClubService.get_by_id(db, club_id)
    if club is None:
        raise HTTPException(status_code=404, detail="Club not found")
    item = await ClubService.add_activity(db, club_id, **data.model_dump())
    return success(data=item, message="Club activity created")


@router.patch("/activities/{activity_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_club_activity(activity_id: uuid.UUID, data: ClubActivityUpdate, db: DbSession, _: CurrentUser):
    item = await ClubService.get_activity(db, activity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Club activity not found")
    item = await ClubService.update_activity(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Club activity updated")


@router.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_club_activity(activity_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await ClubService.get_activity(db, activity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Club activity not found")
    await ClubService.delete_activity(db, item)


@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_club(club_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await ClubService.get_by_id(db, club_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Club not found")
    await ClubService.delete(db, item)
