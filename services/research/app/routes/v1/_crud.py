"""Shared router builder for CRUD endpoints."""

import uuid

from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    Query,
    Request,
    Response,
    status,
)
from ksu_common import cached_public, rate_limit
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import get_current_user, require_scope, require_scoped_record
from ...core.database import get_db
from ._fields import FieldsDep, FieldSelection, build_selector


def build_crud_router(
    *,
    prefix: str,
    tag: str,
    service,
    create_schema,
    update_schema,
    write_scope: str,
    cache_timeout: int = 300,
    public_read: bool = True,
    public_create: bool = False,
    public_create_rate_limit: tuple[int, int] = (5, 60),
):
    router = APIRouter(prefix=prefix, tags=[tag])
    read_dependencies = [] if public_read else [Depends(require_scope(write_scope))]
    model_has_center_scope = hasattr(service.model, "center_id")

    def maybe_cached_public(*args, **kwargs):
        if public_read:
            return cached_public(*args, **kwargs)

        def decorator(func):
            return func

        return decorator

    @router.get("", dependencies=read_dependencies)
    @maybe_cached_public(
        timeout=cache_timeout,
        vary_on=(
            "page",
            "per_page",
            "search",
            "status",
            "is_featured",
            "is_active",
            "is_public",
            "is_open_access",
            "is_university_journal",
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
            "venture_stage",
            "registration_status",
            "startup_id",
            "incubation_type",
            "stage",
            "entry_type",
            "entry_status",
            "case_type",
            "transfer_status",
            "fund_type",
            "event_type",
            "output_type",
            "program_type",
            "delivery_mode",
            "scholarship_type",
            "resource_type",
            "service_type",
            "guideline_type",
            "initiative_type",
            "news_type",
            "article_type",
            "center_id",
            "program_id",
            "project_id",
            "innovation_id",
            "partner_id",
            "pi_id",
            "journal_id",
            "author_id",
            "grant_id",
            "funder_id",
            "farm_id",
            "focus_area_id",
            "has_grant",
            "missing_pi",
            "start_date_from",
            "end_date_to",
            "application_id",
            "applicant_id",
            "reviewer_id",
            "submitter_id",
            "report_type",
            "funder_type",
            "is_required",
            "is_accepting_contributions",
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
        is_open_access: bool | None = None,
        is_university_journal: bool | None = None,
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
        venture_stage: str | None = None,
        registration_status: str | None = None,
        startup_id: uuid.UUID | None = None,
        incubation_type: str | None = None,
        stage: str | None = None,
        entry_type: str | None = None,
        entry_status: str | None = None,
        case_type: str | None = None,
        transfer_status: str | None = None,
        fund_type: str | None = None,
        event_type: str | None = None,
        output_type: str | None = None,
        program_type: str | None = None,
        delivery_mode: str | None = None,
        scholarship_type: str | None = None,
        resource_type: str | None = None,
        service_type: str | None = None,
        guideline_type: str | None = None,
        initiative_type: str | None = None,
        news_type: str | None = None,
        article_type: str | None = None,
        center_id: uuid.UUID | None = None,
        program_id: uuid.UUID | None = None,
        project_id: uuid.UUID | None = None,
        innovation_id: uuid.UUID | None = None,
        partner_id: uuid.UUID | None = None,
        pi_id: uuid.UUID | None = None,
        journal_id: uuid.UUID | None = None,
        author_id: uuid.UUID | None = None,
        grant_id: uuid.UUID | None = None,
        funder_id: uuid.UUID | None = None,
        farm_id: uuid.UUID | None = None,
        focus_area_id: uuid.UUID | None = None,
        has_grant: bool | None = None,
        missing_pi: bool | None = None,
        start_date_from: str | None = None,
        end_date_to: str | None = None,
        application_id: uuid.UUID | None = None,
        applicant_id: uuid.UUID | None = None,
        reviewer_id: uuid.UUID | None = None,
        submitter_id: uuid.UUID | None = None,
        report_type: str | None = None,
        funder_type: str | None = None,
        is_required: bool | None = None,
        is_accepting_contributions: bool | None = None,
        year: int | None = Query(default=None, ge=1900, le=2200),
        sort: str | None = Query(default=None, max_length=64),
        order: str | None = Query(default="desc", pattern="^(asc|desc)$"),
        fields: FieldSelection = FieldsDep,
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user) if not public_read else None,
    ):
        if not public_read and model_has_center_scope:
            require_scoped_record(user, write_scope, "research", center_id)
        selector = build_selector(service.model, fields)
        list_method = service.list_public if public_read else service.list
        result = await list_method(
            db,
            page=page,
            per_page=per_page,
            search=search,
            filters={
                "status": status_filter,
                "is_active": is_active,
                "is_featured": is_featured,
                "is_public": is_public,
                "is_open_access": is_open_access,
                "is_university_journal": is_university_journal,
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
                "venture_stage": venture_stage,
                "registration_status": registration_status,
                "startup_id": startup_id,
                "incubation_type": incubation_type,
                "stage": stage,
                "entry_type": entry_type,
                "entry_status": entry_status,
                "case_type": case_type,
                "transfer_status": transfer_status,
                "fund_type": fund_type,
                "event_type": event_type,
                "output_type": output_type,
                "program_type": program_type,
                "delivery_mode": delivery_mode,
                "scholarship_type": scholarship_type,
                "resource_type": resource_type,
                "service_type": service_type,
                "guideline_type": guideline_type,
                "initiative_type": initiative_type,
                "news_type": news_type,
                "article_type": article_type,
                "center_id": center_id,
                "program_id": program_id,
                "project_id": project_id,
                "innovation_id": innovation_id,
                "partner_id": partner_id,
                "pi_id": pi_id,
                "journal_id": journal_id,
                "author_id": author_id,
                "grant_id": grant_id,
                "funder_id": funder_id,
                "farm_id": farm_id,
                "focus_area_id": focus_area_id,
                "has_grant": has_grant,
                "missing_pi": missing_pi,
                "start_date_from": start_date_from,
                "end_date_to": end_date_to,
                "application_id": application_id,
                "applicant_id": applicant_id,
                "reviewer_id": reviewer_id,
                "submitter_id": submitter_id,
                "report_type": report_type,
                "funder_type": funder_type,
                "is_required": is_required,
                "is_accepting_contributions": is_accepting_contributions,
            },
            year=year,
            sort=sort,
            order=order,
            load_options=selector.load_options,
        )
        return success(data=selector.apply(result.items), meta=result.meta)

    @router.get("/{slug}", dependencies=read_dependencies)
    @maybe_cached_public(timeout=cache_timeout, vary_on=("slug", "fields", "include"))
    async def get_item(
        slug: str,
        request: Request,
        fields: FieldSelection = FieldsDep,
        db: AsyncSession = Depends(get_db),
    ):
        selector = build_selector(service.model, fields)
        get_method = service.get_public_by_slug if public_read else service.get_by_slug
        item = await get_method(db, slug, load_options=selector.load_options)
        if item is None:
            raise HTTPException(status_code=404, detail=f"{tag.rstrip('s')} not found")
        return success(data=selector.apply(item))

    if public_create:
        requests, window = public_create_rate_limit
        public_create_prefix = prefix.strip("/").replace("/", ":")

        @router.post("", status_code=status.HTTP_201_CREATED)
        @rate_limit(
            requests=requests,
            window=window,
            by_user=False,
            prefix=f"research:public-create:{public_create_prefix}",
            max_body_bytes=64 * 1024,
        )
        async def create_item(
            request: Request,
            data: create_schema = Body(...),
            db: AsyncSession = Depends(get_db),
        ):
            try:
                item = await service.create(db, data)
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=str(exc)) from exc
            return success(data=item, message=f"{tag.rstrip('s')} created")

    else:
        @router.post(
            "",
            status_code=status.HTTP_201_CREATED,
        )
        async def create_item(
            data: create_schema = Body(...),
            db: AsyncSession = Depends(get_db),
            access=Depends(require_scope(write_scope)),
        ):
            center_id = getattr(data, "center_id", None)
            if access is not None and (model_has_center_scope or center_id is not None):
                require_scoped_record(access, write_scope, "research", center_id)
            try:
                item = await service.create(
                    db,
                    data,
                    actor_id=access.sub,
                )
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=str(exc)) from exc
            return success(data=item, message=f"{tag.rstrip('s')} created")

    @router.patch("/id/{item_id}", dependencies=[Depends(require_scope(write_scope))])
    async def update_item(
        item_id: uuid.UUID,
        data: update_schema = Body(...),
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user),
    ):
        item = await service.get_by_id(db, item_id)
        if item is None:
            raise HTTPException(status_code=404, detail=f"{tag.rstrip('s')} not found")
        current_center_id = getattr(item, "center_id", None)
        next_center_id = getattr(data, "center_id", None)
        center_ids = {current_center_id, next_center_id} if next_center_id is not None else {current_center_id}
        for center_id in center_ids:
            if center_id is not None:
                require_scoped_record(user, write_scope, "research", center_id)
        if model_has_center_scope and current_center_id is None and next_center_id is None:
            require_scoped_record(user, write_scope, "research", None)
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
        center_id = getattr(item, "center_id", None)
        if model_has_center_scope or center_id is not None:
            require_scoped_record(user, write_scope, "research", center_id)
        await service.soft_delete(db, item, actor_id=user.sub)
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return router
