"""Alumni association endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import AlumniAssociation, AlumniAssociationMember
from ...schemas import AlumniAssociationCreate, AlumniAssociationMemberCreate, AlumniAssociationUpdate
from ...services import AlumniAssociationService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "association_type", "school_id", "fields", "include"))
async def list_alumni_associations(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    association_type: str | None = None,
    school_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(AlumniAssociation, fields)
    result = await AlumniAssociationService.list(
        db,
        page=page,
        per_page=per_page,
        association_type=association_type,
        school_id=school_id,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_alumni_association(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(AlumniAssociation, fields)
    item = await AlumniAssociationService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Alumni association not found")
    return success(data=selector.apply(item))


@router.get("/{slug}/members")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_alumni_association_members(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    item = await AlumniAssociationService.get_by_slug(db, slug)
    if item is None:
        raise HTTPException(status_code=404, detail="Alumni association not found")
    selector = build_selector(AlumniAssociationMember, fields)
    return success(data=selector.apply(item.members))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_alumni_association(data: AlumniAssociationCreate, db: DbSession, _: CurrentUser):
    item = await AlumniAssociationService.create(db, **data.model_dump())
    return success(data=item, message="Alumni association created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_alumni_association(item_id: uuid.UUID, data: AlumniAssociationUpdate, db: DbSession, _: CurrentUser):
    item = await AlumniAssociationService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Alumni association not found")
    item = await AlumniAssociationService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Alumni association updated")


@router.post("/{association_id}/members", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def add_alumni_association_member(
    association_id: uuid.UUID,
    data: AlumniAssociationMemberCreate,
    db: DbSession,
    _: CurrentUser,
):
    item = await AlumniAssociationService.get_by_id(db, association_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Alumni association not found")
    member = await AlumniAssociationService.add_member(db, association_id, **data.model_dump())
    return success(data=member, message="Association member saved")


@router.delete("/{association_id}/members/{alumni_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def remove_alumni_association_member(association_id: uuid.UUID, alumni_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AlumniAssociationService.get_by_id(db, association_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Alumni association not found")
    await AlumniAssociationService.remove_member(db, association_id, alumni_id)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_alumni_association(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AlumniAssociationService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Alumni association not found")
    await AlumniAssociationService.delete(db, item)
