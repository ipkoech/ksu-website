"""School Portal façade for Research-owned publications."""

import uuid

from fastapi import APIRouter, HTTPException, Query, Request, status

from ....clients.research import ResearchClient
from ....core.config import get_settings
from ....schemas.school_portal_publications import (
    SchoolPublicationCreate,
    SchoolPublicationUpdate,
)
from ....services.school_portal_context import CurrentSchoolContext

router = APIRouter()


def _require(context, permission: str) -> None:
    if permission not in context.permissions:
        raise HTTPException(status_code=403, detail=f"{permission} permission is required")


def _client(request: Request) -> ResearchClient:
    authorization = request.headers.get("Authorization")
    if not authorization and (token := request.cookies.get("ksu_access")):
        authorization = f"Bearer {token}"
    request_id = request.headers.get("X-Request-ID") or getattr(
        request.state,
        "request_id",
        None,
    )
    return ResearchClient(
        base_url=get_settings().RESEARCH_SERVICE_URL,
        authorization=authorization,
        request_id=request_id,
    )


@router.get("/publications")
async def list_publications(
    request: Request,
    context: CurrentSchoolContext,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
):
    _require(context, "school.publications.view")
    return await _client(request).list_school_publications(
        page=page,
        per_page=per_page,
        status=status_filter,
    )


@router.post("/publications", status_code=status.HTTP_201_CREATED)
async def create_publication(
    data: SchoolPublicationCreate,
    request: Request,
    context: CurrentSchoolContext,
):
    _require(context, "school.publications.manage")
    return await _client(request).create_school_publication(
        data.model_dump(mode="json", exclude_unset=True)
    )


@router.get("/publications/{publication_id}")
async def get_publication(
    publication_id: uuid.UUID,
    request: Request,
    context: CurrentSchoolContext,
):
    _require(context, "school.publications.view")
    return await _client(request).get_school_publication(publication_id)


@router.patch("/publications/{publication_id}")
async def update_publication(
    publication_id: uuid.UUID,
    data: SchoolPublicationUpdate,
    request: Request,
    context: CurrentSchoolContext,
):
    _require(context, "school.publications.manage")
    return await _client(request).update_school_publication(
        publication_id,
        data.model_dump(mode="json", exclude_unset=True),
    )


@router.post("/publications/{publication_id}/submit")
async def submit_publication(
    publication_id: uuid.UUID,
    request: Request,
    context: CurrentSchoolContext,
):
    _require(context, "school.publications.submit")
    return await _client(request).submit_school_publication(publication_id)


@router.post("/publications/{publication_id}/withdraw")
async def withdraw_publication(
    publication_id: uuid.UUID,
    request: Request,
    context: CurrentSchoolContext,
):
    _require(context, "school.publications.submit")
    return await _client(request).withdraw_school_publication(publication_id)
