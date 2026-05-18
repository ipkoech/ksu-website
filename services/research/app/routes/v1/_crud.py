"""Shared router builder for CRUD endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import get_current_user, require_scope
from ...core.database import get_db


def build_crud_router(
    *,
    prefix: str,
    tag: str,
    service,
    create_schema,
    update_schema,
    write_scope: str,
    cache_timeout: int = 300,
):
    router = APIRouter(prefix=prefix, tags=[tag])

    @router.get("")
    @cached_public(timeout=cache_timeout, vary_on=("page", "per_page", "search", "status", "is_featured", "is_active", "is_public"))
    async def list_items(
        request: Request,
        page: int = Query(1, ge=1),
        per_page: int = Query(20, ge=1, le=100),
        search: str | None = None,
        status_filter: str | None = Query(default=None, alias="status"),
        is_active: bool | None = None,
        is_featured: bool | None = None,
        is_public: bool | None = None,
        db: AsyncSession = Depends(get_db),
    ):
        result = await service.list(
            db,
            page=page,
            per_page=per_page,
            search=search,
            filters={
                "status": status_filter,
                "is_active": is_active,
                "is_featured": is_featured,
                "is_public": is_public,
            },
        )
        return success(data=result.items, meta=result.meta)

    @router.get("/{slug}")
    @cached_public(timeout=cache_timeout)
    async def get_item(slug: str, request: Request, db: AsyncSession = Depends(get_db)):
        item = await service.get_by_slug(db, slug)
        if item is None:
            raise HTTPException(status_code=404, detail=f"{tag.rstrip('s')} not found")
        return success(data=item)

    @router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope(write_scope))])
    async def create_item(data: create_schema, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
        item = await service.create(db, data, actor_id=user.sub)
        return success(data=item, message=f"{tag.rstrip('s')} created")

    @router.patch("/id/{item_id}", dependencies=[Depends(require_scope(write_scope))])
    async def update_item(
        item_id: uuid.UUID,
        data: update_schema,
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user),
    ):
        item = await service.get_by_id(db, item_id)
        if item is None:
            raise HTTPException(status_code=404, detail=f"{tag.rstrip('s')} not found")
        item = await service.update(db, item, data, actor_id=user.sub)
        return success(data=item, message=f"{tag.rstrip('s')} updated")

    @router.delete("/id/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope(write_scope))])
    async def delete_item(
        item_id: uuid.UUID,
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user),
    ):
        item = await service.get_by_id(db, item_id)
        if item is None:
            raise HTTPException(status_code=404, detail=f"{tag.rstrip('s')} not found")
        await service.soft_delete(db, item, actor_id=user.sub)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return router
