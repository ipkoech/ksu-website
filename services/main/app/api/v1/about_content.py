"""Public and administrative About KSU content endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, permissions_for_user, require_scope
from ...models import AboutPageContent, FactEdition, FactGroup, FactItem, HistoryMilestone
from ...schemas import (
    AboutPageContentCreate, AboutPageContentUpdate, AboutWorkflowAction,
    FactEditionClone, FactEditionCreate, FactEditionUpdate, FactGroupCreate,
    FactGroupUpdate, FactItemCreate, FactItemUpdate, HistoryMilestoneCreate,
    HistoryMilestoneUpdate, ReorderRequest,
)
from ...services import AboutContentAdminService, AboutContentService, FactsService

router = APIRouter()


@router.get("/public/about")
@cached_public(timeout=600)
async def get_public_about(db: DbSession):
    payload = await AboutContentService.get_public_about(db)
    if payload is None:
        raise HTTPException(status_code=404, detail="About KSU content not found")
    return success(data=payload)


@router.get("/public/about/history")
@cached_public(timeout=600)
async def get_public_history(db: DbSession):
    return success(data=await AboutContentService.get_public_history(db))


@router.get("/public/about/facts")
@cached_public(timeout=600, vary_on=("year",))
async def get_public_facts(db: DbSession, year: int | None = Query(default=None, ge=1965, le=2100)):
    payload = await FactsService.get_public_facts(db, year=year)
    if payload is None:
        raise HTTPException(status_code=404, detail="Published facts edition not found")
    return success(data=payload)


def _bad_request(error: ValueError) -> HTTPException:
    message = str(error)
    code = status.HTTP_409_CONFLICT if "already exists" in message else status.HTTP_422_UNPROCESSABLE_ENTITY
    return HTTPException(status_code=code, detail=message)


async def _item_or_404(db: DbSession, model: type, item_id: uuid.UUID):
    item = await AboutContentAdminService.get(db, model, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return item


@router.get("/about-content", dependencies=[Depends(require_scope("about.manage"))])
async def get_about_content_admin(db: DbSession, _: CurrentUser):
    items = await AboutContentAdminService.list(db, AboutPageContent)
    return success(data=items[0] if items else None)


@router.post("/about-content", status_code=201, dependencies=[Depends(require_scope("about.manage"))])
async def create_about_content(data: AboutPageContentCreate, db: DbSession, user: CurrentUser):
    item = await AboutContentAdminService.create(db, AboutPageContent, data.model_dump(), user.id)
    return success(data=item, message="About content created")


@router.patch("/about-content/{item_id}", dependencies=[Depends(require_scope("about.manage"))])
async def update_about_content(item_id: uuid.UUID, data: AboutPageContentUpdate, db: DbSession, user: CurrentUser):
    item = await _item_or_404(db, AboutPageContent, item_id)
    return success(data=await AboutContentAdminService.update(db, item, data.model_dump(exclude_unset=True), user.id))


@router.delete("/about-content/{item_id}", status_code=204, dependencies=[Depends(require_scope("about.manage"))])
async def delete_about_content(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    try:
        await AboutContentAdminService.soft_delete(db, await _item_or_404(db, AboutPageContent, item_id))
    except ValueError as error:
        raise _bad_request(error) from error


@router.get("/about-content/history-milestones", dependencies=[Depends(require_scope("about.manage"))])
async def list_history_milestones(db: DbSession, _: CurrentUser, about_page_content_id: uuid.UUID):
    return success(data=await AboutContentAdminService.list(db, HistoryMilestone, HistoryMilestone.about_page_content_id == about_page_content_id))


@router.post("/about-content/history-milestones", status_code=201, dependencies=[Depends(require_scope("about.manage"))])
async def create_history_milestone(data: HistoryMilestoneCreate, db: DbSession, user: CurrentUser):
    return success(data=await AboutContentAdminService.create(db, HistoryMilestone, data.model_dump(), user.id))


@router.patch("/about-content/history-milestones/{item_id}", dependencies=[Depends(require_scope("about.manage"))])
async def update_history_milestone(item_id: uuid.UUID, data: HistoryMilestoneUpdate, db: DbSession, user: CurrentUser):
    item = await _item_or_404(db, HistoryMilestone, item_id)
    return success(data=await AboutContentAdminService.update(db, item, data.model_dump(exclude_unset=True), user.id))


@router.delete("/about-content/history-milestones/{item_id}", status_code=204, dependencies=[Depends(require_scope("about.manage"))])
async def delete_history_milestone(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    try:
        await AboutContentAdminService.soft_delete(db, await _item_or_404(db, HistoryMilestone, item_id))
    except ValueError as error:
        raise _bad_request(error) from error


@router.post("/about-content/history-order", dependencies=[Depends(require_scope("about.manage"))])
async def reorder_history(data: ReorderRequest, db: DbSession, _: CurrentUser, about_page_content_id: uuid.UUID):
    try:
        items = await AboutContentAdminService.reorder(db, HistoryMilestone, "about_page_content_id", about_page_content_id, [(x.id, x.display_order) for x in data.items])
    except ValueError as error:
        raise _bad_request(error) from error
    return success(data=items)


@router.get("/fact-editions", dependencies=[Depends(require_scope("about.manage"))])
async def list_fact_editions(db: DbSession, _: CurrentUser):
    return success(data=await AboutContentAdminService.list(db, FactEdition))


@router.post("/fact-editions", status_code=201, dependencies=[Depends(require_scope("about.manage"))])
async def create_fact_edition(data: FactEditionCreate, db: DbSession, user: CurrentUser):
    return success(data=await AboutContentAdminService.create(db, FactEdition, data.model_dump(), user.id))


@router.patch("/fact-editions/{item_id}", dependencies=[Depends(require_scope("about.manage"))])
async def update_fact_edition(item_id: uuid.UUID, data: FactEditionUpdate, db: DbSession, user: CurrentUser):
    item = await _item_or_404(db, FactEdition, item_id)
    return success(data=await AboutContentAdminService.update(db, item, data.model_dump(exclude_unset=True), user.id))


@router.delete("/fact-editions/{item_id}", status_code=204, dependencies=[Depends(require_scope("about.manage"))])
async def delete_fact_edition(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    try:
        await AboutContentAdminService.soft_delete(db, await _item_or_404(db, FactEdition, item_id))
    except ValueError as error:
        raise _bad_request(error) from error


@router.post("/fact-editions/{item_id}/clone", status_code=201, dependencies=[Depends(require_scope("about.manage"))])
async def clone_fact_edition(item_id: uuid.UUID, data: FactEditionClone, db: DbSession, user: CurrentUser):
    item = await _item_or_404(db, FactEdition, item_id)
    try:
        clone = await AboutContentAdminService.clone_edition(db, item, data.reporting_year, user.id)
    except ValueError as error:
        raise _bad_request(error) from error
    return success(data=clone, message="Facts edition cloned")


@router.post("/fact-editions/{edition_id}/groups", status_code=201, dependencies=[Depends(require_scope("about.manage"))])
async def create_fact_group(edition_id: uuid.UUID, data: FactGroupCreate, db: DbSession, user: CurrentUser):
    payload = data.model_dump()
    payload["fact_edition_id"] = edition_id
    return success(data=await AboutContentAdminService.create(db, FactGroup, payload, user.id))


@router.get("/fact-editions/{edition_id}/groups", dependencies=[Depends(require_scope("about.manage"))])
async def list_fact_groups(edition_id: uuid.UUID, db: DbSession, _: CurrentUser):
    return success(data=await AboutContentAdminService.list(db, FactGroup, FactGroup.fact_edition_id == edition_id))


@router.get("/fact-groups/evergreen", dependencies=[Depends(require_scope("about.manage"))])
async def list_evergreen_fact_groups(db: DbSession, _: CurrentUser):
    return success(data=await AboutContentAdminService.list(db, FactGroup, FactGroup.fact_edition_id.is_(None)))


@router.post("/fact-groups/evergreen", status_code=201, dependencies=[Depends(require_scope("about.manage"))])
async def create_evergreen_fact_group(data: FactGroupCreate, db: DbSession, user: CurrentUser):
    payload = data.model_dump()
    payload["fact_edition_id"] = None
    return success(data=await AboutContentAdminService.create(db, FactGroup, payload, user.id))


@router.patch("/fact-groups/{item_id}", dependencies=[Depends(require_scope("about.manage"))])
async def update_fact_group(item_id: uuid.UUID, data: FactGroupUpdate, db: DbSession, user: CurrentUser):
    item = await _item_or_404(db, FactGroup, item_id)
    return success(data=await AboutContentAdminService.update(db, item, data.model_dump(exclude_unset=True), user.id))


@router.delete("/fact-groups/{item_id}", status_code=204, dependencies=[Depends(require_scope("about.manage"))])
async def delete_fact_group(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    try:
        await AboutContentAdminService.soft_delete(db, await _item_or_404(db, FactGroup, item_id))
    except ValueError as error:
        raise _bad_request(error) from error


@router.post("/fact-groups/{group_id}/items", status_code=201, dependencies=[Depends(require_scope("about.manage"))])
async def create_fact_item(group_id: uuid.UUID, data: FactItemCreate, db: DbSession, user: CurrentUser):
    payload = data.model_dump()
    payload["fact_group_id"] = group_id
    group = await _item_or_404(db, FactGroup, group_id)
    if (group.fact_edition_id is None) != (data.fact_kind == "evergreen"):
        raise HTTPException(status_code=422, detail="Fact kind must match evergreen or annual group ownership")
    return success(data=await AboutContentAdminService.create(db, FactItem, payload, user.id))


@router.get("/fact-groups/{group_id}/items", dependencies=[Depends(require_scope("about.manage"))])
async def list_fact_items(group_id: uuid.UUID, db: DbSession, _: CurrentUser):
    return success(data=await AboutContentAdminService.list(db, FactItem, FactItem.fact_group_id == group_id))


@router.patch("/fact-items/{item_id}", dependencies=[Depends(require_scope("about.manage"))])
async def update_fact_item(item_id: uuid.UUID, data: FactItemUpdate, db: DbSession, user: CurrentUser):
    item = await _item_or_404(db, FactItem, item_id)
    return success(data=await AboutContentAdminService.update(db, item, data.model_dump(exclude_unset=True), user.id))


@router.delete("/fact-items/{item_id}", status_code=204, dependencies=[Depends(require_scope("about.manage"))])
async def delete_fact_item(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    try:
        await AboutContentAdminService.soft_delete(db, await _item_or_404(db, FactItem, item_id))
    except ValueError as error:
        raise _bad_request(error) from error


_WORKFLOW_MODELS = {
    "about": AboutPageContent, "milestone": HistoryMilestone, "edition": FactEdition,
    "group": FactGroup, "item": FactItem,
}


@router.post("/about-content/workflow/{kind}/{item_id}")
async def transition_about_content(kind: str, item_id: uuid.UUID, data: AboutWorkflowAction, db: DbSession, user: CurrentUser):
    model = _WORKFLOW_MODELS.get(kind)
    if model is None:
        raise HTTPException(status_code=404, detail="Unknown About content kind")
    item = await _item_or_404(db, model, item_id)
    permissions = permissions_for_user(user)
    required = "content.publish" if data.action in {"publish", "unpublish"} else "content.review" if data.action in {"approve", "request_changes"} else "about.manage"
    if required not in permissions and "admin:*" not in permissions:
        raise HTTPException(status_code=403, detail="Insufficient workflow permission")
    try:
        item = await AboutContentAdminService.transition(db, item, data.action, user.id, data.reason)
    except ValueError as error:
        raise _bad_request(error) from error
    return success(data=item, message=f"Content {data.action} complete")
