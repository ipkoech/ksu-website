"""Page CMS endpoints for public composition and admin editing workflows."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope
from ...models import PageSection, PartnershipSpotlight, SectionItem
from ...schemas import (
    PageSectionCreate,
    PageSectionUpdate,
    PartnershipSpotlightCreate,
    PartnershipSpotlightUpdate,
    SectionItemCreate,
    SectionItemUpdate,
)
from ...services import HomepageCompositionService, PageSectionService, PageSectionWorkflowService
from ...services._base import apply_updates
from ._scoped import can_access_scoped_record, require_scoped_record

router = APIRouter()

PAGE_SECTION_FALLBACK_MANAGE = "page_sections.manage"
PARTNERSHIP_SPOTLIGHT_MANAGE_SCOPE = require_scope("partnership_spotlights.manage")


def _page_specific_permissions(*, page_key: str, scope_type: str, action: str) -> list[str]:
    if page_key != "homepage":
        return []

    if action == "view":
        permissions = ["homepage.view"]
    elif action in {"create", "update", "delete", "item_manage"}:
        permissions = ["homepage.manage"]
    elif action == "publish":
        permissions = ["homepage.publish"]
    else:
        permissions = []

    if action in {"create", "update", "delete", "item_manage"}:
        if scope_type == "school":
            permissions.append("school_homepage.manage")
        elif scope_type == "research":
            permissions.append("research_homepage.manage")
        elif scope_type == "library":
            permissions.append("library_homepage.manage")

    return permissions


def _page_section_permissions(*, page_key: str, scope_type: str, action: str) -> list[str]:
    permissions_by_action = {
        "view": ["page_sections.view", PAGE_SECTION_FALLBACK_MANAGE],
        "create": ["page_sections.create", PAGE_SECTION_FALLBACK_MANAGE],
        "update": ["page_sections.update", PAGE_SECTION_FALLBACK_MANAGE],
        "delete": ["page_sections.delete", PAGE_SECTION_FALLBACK_MANAGE],
        "review": ["page_sections.review", PAGE_SECTION_FALLBACK_MANAGE],
        "publish": ["page_sections.publish", "homepage.publish", PAGE_SECTION_FALLBACK_MANAGE],
        "item_manage": ["section_items.manage", PAGE_SECTION_FALLBACK_MANAGE],
    }
    permissions = list(permissions_by_action.get(action, [PAGE_SECTION_FALLBACK_MANAGE]))
    permissions.extend(_page_specific_permissions(page_key=page_key, scope_type=scope_type, action=action))
    return permissions


async def _require_page_section_access(
    db: DbSession,
    user: CurrentUser,
    *,
    page_key: str,
    scope_type: str,
    scope_id: uuid.UUID | None,
    action: str,
) -> None:
    await require_scoped_record(
        db,
        user,
        _page_section_permissions(page_key=page_key, scope_type=scope_type, action=action),
        scope_type,
        scope_id,
        resource_name="page section",
    )


async def _can_view_page_section(db: DbSession, user: CurrentUser, section: PageSection) -> bool:
    return await can_access_scoped_record(
        db,
        user,
        _page_section_permissions(
            page_key=section.page_key,
            scope_type=section.scope_type,
            action="view",
        ),
        section.scope_type,
        section.scope_id,
    )


async def _get_page_section_or_404(db: DbSession, section_id: uuid.UUID) -> PageSection:
    item = await PageSection.get_by_id(db, section_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Page section not found")
    return item


async def _get_section_item_or_404(db: DbSession, item_id: uuid.UUID) -> SectionItem:
    item = await SectionItem.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Section item not found")
    return item


async def _get_partnership_spotlight_or_404(db: DbSession, spotlight_id: uuid.UUID) -> PartnershipSpotlight:
    item = await PartnershipSpotlight.get_by_id(db, spotlight_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Partnership spotlight not found")
    return item


def _workflow_action_scope(action: str) -> str:
    if action in {"approve", "request_changes"}:
        return "review"
    if action in {"publish", "unpublish"}:
        return "publish"
    if action == "archive":
        return "delete"
    return "update"


@router.get("/pages/{page_key}")
async def get_page_composition(
    page_key: str,
    db: DbSession,
    scope_type: str = Query("university"),
    scope_id: uuid.UUID | None = None,
):
    composition = await HomepageCompositionService.compose(db, page_key, scope_type, scope_id)
    return success(data=composition)


@router.get("/homepage")
async def get_homepage(
    db: DbSession,
    scope_type: str = Query("university"),
    scope_id: uuid.UUID | None = None,
):
    composition = await HomepageCompositionService.compose(db, "homepage", scope_type, scope_id)
    return success(data=composition)


@router.get("/page-sections/admin")
async def list_admin_page_sections(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    page_key: str | None = None,
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = None,
):
    result = await PageSectionService.list_admin(
        db,
        page=page,
        per_page=per_page,
        page_key=page_key,
        scope_type=scope_type,
        scope_id=scope_id,
        status=status_filter,
        search=search,
    )
    items = []
    for item in result.items:
        if await _can_view_page_section(db, user, item):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=items, meta=meta)


@router.post("/page-sections", status_code=status.HTTP_201_CREATED)
async def create_page_section(data: PageSectionCreate, db: DbSession, user: CurrentUser):
    payload = data.model_dump()
    await _require_page_section_access(
        db,
        user,
        page_key=payload["page_key"],
        scope_type=payload["scope_type"],
        scope_id=payload.get("scope_id"),
        action="create",
    )
    items = payload.pop("items", [])
    item = PageSection(
        **payload,
        status="draft",
        created_by_id=user.id,
        updated_by_id=user.id,
    )
    item.items = [SectionItem(**section_item) for section_item in items]
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Page section created")


@router.patch("/page-sections/{section_id}")
async def update_page_section(
    section_id: uuid.UUID,
    data: PageSectionUpdate,
    db: DbSession,
    user: CurrentUser,
):
    item = await _get_page_section_or_404(db, section_id)
    await _require_page_section_access(
        db,
        user,
        page_key=item.page_key,
        scope_type=item.scope_type,
        scope_id=item.scope_id,
        action="update",
    )
    payload = data.model_dump(exclude_unset=True)
    payload.pop("items", None)
    await _require_page_section_access(
        db,
        user,
        page_key=payload.get("page_key", item.page_key),
        scope_type=payload.get("scope_type", item.scope_type),
        scope_id=payload.get("scope_id", item.scope_id),
        action="update",
    )
    payload["updated_by_id"] = user.id
    apply_updates(item, **payload)
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Page section updated")


@router.post("/page-sections/{section_id}/{action}")
async def run_page_section_workflow_action(
    section_id: uuid.UUID,
    action: str,
    db: DbSession,
    user: CurrentUser,
):
    item = await _get_page_section_or_404(db, section_id)
    await _require_page_section_access(
        db,
        user,
        page_key=item.page_key,
        scope_type=item.scope_type,
        scope_id=item.scope_id,
        action=_workflow_action_scope(action),
    )
    item = await PageSectionWorkflowService.transition(item, action, user.id)
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Page section updated")


@router.post("/page-sections/{section_id}/items", status_code=status.HTTP_201_CREATED)
async def create_section_item(
    section_id: uuid.UUID,
    data: SectionItemCreate,
    db: DbSession,
    user: CurrentUser,
):
    section = await _get_page_section_or_404(db, section_id)
    await _require_page_section_access(
        db,
        user,
        page_key=section.page_key,
        scope_type=section.scope_type,
        scope_id=section.scope_id,
        action="item_manage",
    )
    item = SectionItem(page_section_id=section.id, **data.model_dump(exclude={"page_section_id"}))
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Section item created")


@router.patch("/section-items/{item_id}")
async def update_section_item(
    item_id: uuid.UUID,
    data: SectionItemUpdate,
    db: DbSession,
    user: CurrentUser,
):
    item = await _get_section_item_or_404(db, item_id)
    section = await _get_page_section_or_404(db, item.page_section_id)
    await _require_page_section_access(
        db,
        user,
        page_key=section.page_key,
        scope_type=section.scope_type,
        scope_id=section.scope_id,
        action="item_manage",
    )
    payload = data.model_dump(exclude_unset=True)
    next_section_id = payload.pop("page_section_id", item.page_section_id)
    if next_section_id != item.page_section_id:
        next_section = await _get_page_section_or_404(db, next_section_id)
        await _require_page_section_access(
            db,
            user,
            page_key=next_section.page_key,
            scope_type=next_section.scope_type,
            scope_id=next_section.scope_id,
            action="item_manage",
        )
        item.page_section_id = next_section_id
    apply_updates(item, **payload)
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Section item updated")


@router.post(
    "/partnership-spotlights",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PARTNERSHIP_SPOTLIGHT_MANAGE_SCOPE)],
)
async def create_partnership_spotlight(
    data: PartnershipSpotlightCreate,
    db: DbSession,
    user: CurrentUser,
):
    del user
    item = PartnershipSpotlight(**data.model_dump(), status="draft")
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Partnership spotlight created")


@router.patch(
    "/partnership-spotlights/{spotlight_id}",
    dependencies=[Depends(PARTNERSHIP_SPOTLIGHT_MANAGE_SCOPE)],
)
async def update_partnership_spotlight(
    spotlight_id: uuid.UUID,
    data: PartnershipSpotlightUpdate,
    db: DbSession,
    user: CurrentUser,
):
    del user
    item = await _get_partnership_spotlight_or_404(db, spotlight_id)
    apply_updates(item, **data.model_dump(exclude_unset=True))
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Partnership spotlight updated")
