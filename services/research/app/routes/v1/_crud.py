"""Shared router builder for CRUD endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import get_current_user, require_scope
from ...core.database import get_db
from ._fields import FieldSelection, FieldsDep, build_selector


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
    @cached_public(
        timeout=cache_timeout,
        vary_on=(
            "page",
            "per_page",
            "search",
            "status",
            "is_featured",
            "is_active",
            "is_public",
            "category",
            "grant_type",
            "project_type",
            "center_type",
            "farm_type",
            "publication_type",
            "access_type",
            "innovation_type",
            "development_stage",
            "ip_status",
            "commercialization_status",
            "partner_type",
            "partnership_level",
            "consultancy_type",
            "client_type",
            "fund_type",
            "event_type",
            "output_type",
            "program_type",
            "scholarship_type",
            "initiative_type",
            "center_id",
            "program_id",
            "project_id",
            "partner_id",
            "year",
            "sort",
            "order",
            "fields",
            "include",
        ),
    )
    async def list_items(
        request: Request,
        page: int = Query(1, ge=1),
        per_page: int = Query(20, ge=1, le=100),
        search: str | None = None,
        status_filter: str | None = Query(default=None, alias="status"),
        is_active: bool | None = None,
        is_featured: bool | None = None,
        is_public: bool | None = None,
        category: str | None = None,
        grant_type: str | None = None,
        project_type: str | None = None,
        center_type: str | None = None,
        farm_type: str | None = None,
        publication_type: str | None = None,
        access_type: str | None = None,
        innovation_type: str | None = None,
        development_stage: str | None = None,
        ip_status: str | None = None,
        commercialization_status: str | None = None,
        partner_type: str | None = None,
        partnership_level: str | None = None,
        consultancy_type: str | None = None,
        client_type: str | None = None,
        fund_type: str | None = None,
        event_type: str | None = None,
        output_type: str | None = None,
        program_type: str | None = None,
        scholarship_type: str | None = None,
        initiative_type: str | None = None,
        center_id: uuid.UUID | None = None,
        program_id: uuid.UUID | None = None,
        project_id: uuid.UUID | None = None,
        partner_id: uuid.UUID | None = None,
        year: int | None = Query(default=None, ge=1900, le=2200),
        sort: str | None = Query(default=None, max_length=64),
        order: str | None = Query(default="desc", pattern="^(asc|desc)$"),
        fields: FieldSelection = FieldsDep,
        db: AsyncSession = Depends(get_db),
    ):
        selector = build_selector(service.model, fields)
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
                "category": category,
                "grant_type": grant_type,
                "project_type": project_type,
                "center_type": center_type,
                "farm_type": farm_type,
                "publication_type": publication_type,
                "access_type": access_type,
                "innovation_type": innovation_type,
                "development_stage": development_stage,
                "ip_status": ip_status,
                "commercialization_status": commercialization_status,
                "partner_type": partner_type,
                "partnership_level": partnership_level,
                "consultancy_type": consultancy_type,
                "client_type": client_type,
                "fund_type": fund_type,
                "event_type": event_type,
                "output_type": output_type,
                "program_type": program_type,
                "scholarship_type": scholarship_type,
                "initiative_type": initiative_type,
                "center_id": center_id,
                "program_id": program_id,
                "project_id": project_id,
                "partner_id": partner_id,
            },
            year=year,
            sort=sort,
            order=order,
            load_options=selector.load_options,
        )
        return success(data=selector.apply(result.items), meta=result.meta)

    @router.get("/{slug}")
    @cached_public(timeout=cache_timeout)
    async def get_item(
        slug: str,
        request: Request,
        fields: FieldSelection = FieldsDep,
        db: AsyncSession = Depends(get_db),
    ):
        selector = build_selector(service.model, fields)
        item = await service.get_by_slug(db, slug, load_options=selector.load_options)
        if item is None:
            raise HTTPException(status_code=404, detail=f"{tag.rstrip('s')} not found")
        return success(data=selector.apply(item))

    @router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope(write_scope))])
    async def create_item(data: create_schema, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
        try:
            item = await service.create(db, data, actor_id=user.sub)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
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
        try:
            item = await service.update(db, item, data, actor_id=user.sub)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
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
