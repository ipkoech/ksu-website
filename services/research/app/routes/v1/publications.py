"""Publication endpoints."""

import uuid

from fastapi import APIRouter, Depends, Query, status
from ksu_common.schemas.responses import success

from ...core.auth import get_current_user
from ...core.database import get_db
from ...schemas.base import JsonObject, SuccessEnvelope, SuccessEnvelopeWithMeta
from ...schemas import (
    JournalCreate,
    JournalUpdate,
    PublicationCreate,
    PublicationUpdate,
    SchoolPublicationCreate,
    SchoolPublicationUpdate,
)
from ...services import JournalService, PublicationService
from ._crud import build_crud_router
from ._fields import serialize_full_record

router = APIRouter()


@router.get(
    "/school-publications",
    tags=["School Publications"],
    response_model=SuccessEnvelopeWithMeta[list[JsonObject]],
)
async def list_school_publications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    result = await PublicationService.list_for_school(
        db,
        user,
        page=page,
        per_page=per_page,
        status_filter=status_filter,
    )
    return success(
        data=serialize_full_record(PublicationService.model, result.items),
        meta=result.meta,
    )


@router.post(
    "/school-publications",
    tags=["School Publications"],
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessEnvelope[JsonObject],
)
async def create_school_publication(
    data: SchoolPublicationCreate,
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    item = await PublicationService.create_for_school(db, data, user)
    return success(data=serialize_full_record(PublicationService.model, item))


@router.get(
    "/school-publications/summary",
    tags=["School Publications"],
    response_model=SuccessEnvelope[JsonObject],
)
async def summarize_school_publications(
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    return success(
        data=await PublicationService.status_summary_for_school(db, user)
    )


@router.get(
    "/school-publications/{publication_id}",
    tags=["School Publications"],
    response_model=SuccessEnvelope[JsonObject],
)
async def get_school_publication(
    publication_id: uuid.UUID,
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    item = await PublicationService.get_for_school(db, publication_id, user)
    return success(data=serialize_full_record(PublicationService.model, item))

@router.patch(
    "/school-publications/{publication_id}",
    tags=["School Publications"],
    response_model=SuccessEnvelope[JsonObject],
)
async def update_school_publication(
    publication_id: uuid.UUID,
    data: SchoolPublicationUpdate,
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    item = await PublicationService.get_for_school(
        db,
        publication_id,
        user,
        permission="school.publications.manage",
    )
    updated = await PublicationService.update_for_school(db, item, data, user)
    return success(data=serialize_full_record(PublicationService.model, updated))


@router.post(
    "/school-publications/{publication_id}/submit",
    tags=["School Publications"],
    response_model=SuccessEnvelope[JsonObject],
)
async def submit_school_publication(
    publication_id: uuid.UUID,
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    item = await PublicationService.get_for_school(
        db,
        publication_id,
        user,
        permission="school.publications.submit",
    )
    updated = await PublicationService.submit_for_school(db, item, user)
    return success(data=serialize_full_record(PublicationService.model, updated))


@router.post(
    "/school-publications/{publication_id}/withdraw",
    tags=["School Publications"],
    response_model=SuccessEnvelope[JsonObject],
)
async def withdraw_school_publication(
    publication_id: uuid.UUID,
    db=Depends(get_db),
    user=Depends(get_current_user),
):
    item = await PublicationService.get_for_school(
        db,
        publication_id,
        user,
        permission="school.publications.submit",
    )
    updated = await PublicationService.withdraw_for_school(db, item, user)
    return success(data=serialize_full_record(PublicationService.model, updated))


router.include_router(build_crud_router(prefix="/publications", tag="Publications", service=PublicationService, create_schema=PublicationCreate, update_schema=PublicationUpdate, write_scope="publications.manage"))
router.include_router(build_crud_router(prefix="/journals", tag="Journals", service=JournalService, create_schema=JournalCreate, update_schema=JournalUpdate, write_scope="publications.manage"))
