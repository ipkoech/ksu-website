"""Narrow, authenticated Research endpoints for sibling services."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from ksu_common.internal_client import internal_key_guard
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.config import get_settings
from ...core.database import get_db
from ...services import (
    CenterRelationshipService,
    CenterService,
    CompetitionEntryService,
    ConsultancyService,
    DonationService,
    DonorService,
    EndowmentFundService,
    FarmService,
    FocusAreaService,
    FundingService,
    GrantGuidelineService,
    GrantService,
    IncubationRecordService,
    InnovationService,
    JournalService,
    MentorshipService,
    MetricService,
    OutputService,
    PartnerService,
    ProgramService,
    ProjectService,
    PublicationService,
    ScholarshipService,
    StartupVentureService,
    StoryService,
    SustainabilityService,
    TagService,
    TechnologyTransferCaseService,
    ThemeService,
    TrainingService,
)
from ...services.stats import public_research_stats

router = APIRouter(prefix="/internal", tags=["Internal"])

verify_internal_key = internal_key_guard(
    lambda: get_settings().INTERNAL_API_KEY,
    allow_legacy_header=False,
)


class _InternalPayload(dict):
    """Small adapter for service create methods that expect a Pydantic payload."""

    def model_dump(self, *, exclude_unset: bool = False):
        return dict(self)


INTERNAL_IMPORT_SERVICES = {
    "projects": ProjectService,
    "publications": PublicationService,
    "grants": GrantService,
    "innovations": InnovationService,
    "startups": StartupVentureService,
    "incubation-records": IncubationRecordService,
    "competition-entries": CompetitionEntryService,
    "technology-transfer-cases": TechnologyTransferCaseService,
    "partners": PartnerService,
    "centers": CenterService,
    "outputs": OutputService,
    "training": TrainingService,
    "scholarships": ScholarshipService,
    "mentorship": MentorshipService,
    "consultancies": ConsultancyService,
    "endowments": EndowmentFundService,
    "programs": ProgramService,
    "farms": FarmService,
    "sustainability": SustainabilityService,
    "donors": DonorService,
    "funders": FundingService,
    "impact-metrics": MetricService,
    "themes": ThemeService,
    "focus-areas": FocusAreaService,
    "expertise-tags": TagService,
    "journals": JournalService,
    "grant-guidelines": GrantGuidelineService,
    "donations": DonationService,
    "stories": StoryService,
}


@router.post("/imports/{resource}", dependencies=[Depends(verify_internal_key)])
async def create_internal_import(
    resource: str,
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """Create only the explicitly supported Main bulk-import resources.

    This endpoint replaces the old service-key bypass on every public CRUD
    create route. Resource names and model columns are allow-listed here.
    """
    service = INTERNAL_IMPORT_SERVICES.get(resource)
    if service is None:
        raise HTTPException(status_code=404, detail="Unsupported internal import resource")
    allowed = {column.key for column in service.model.__table__.columns}
    unknown = sorted(set(payload) - allowed)
    if unknown:
        raise HTTPException(status_code=422, detail={"unknown_fields": unknown})
    try:
        item = await service.create(db, _InternalPayload(payload), actor_id="service:main")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return success(data=item, message=f"{resource} created")


@router.get("/stats", dependencies=[Depends(verify_internal_key)])
async def get_internal_stats(db: AsyncSession = Depends(get_db)):
    """Return the public Research statistics contract to authenticated peers."""
    result = await public_research_stats(db)
    return success(data=result.model_dump())


@router.get("/partners", dependencies=[Depends(verify_internal_key)])
async def list_internal_partners(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None, max_length=128),
    status: str | None = Query(default="active", max_length=32),
    is_active: bool | None = True,
    is_featured: bool | None = None,
    partner_ids: list[uuid.UUID] | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    result = await PartnerService.list_public(
        db,
        page=page,
        per_page=per_page,
        search=search,
        filters={
            "status": status,
            "is_active": is_active,
            "is_featured": is_featured,
            "id__in": partner_ids,
        },
    )
    return success(data=result.items, meta=result.meta)


@router.get("/partners/{slug}", dependencies=[Depends(verify_internal_key)])
async def get_internal_partner(slug: str, db: AsyncSession = Depends(get_db)):
    item = await PartnerService.get_public_by_slug(db, slug)
    if item is None:
        raise HTTPException(status_code=404, detail="Partner not found")
    return success(data=item)


@router.get("/centers", dependencies=[Depends(verify_internal_key)])
async def list_internal_centers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None, max_length=128),
    status: str | None = Query(default=None, max_length=32),
    is_active: bool | None = True,
    db: AsyncSession = Depends(get_db),
):
    result = await CenterService.list_public(
        db,
        page=page,
        per_page=per_page,
        search=search,
        filters={"status": status, "is_active": is_active},
    )
    return success(data=result.items, meta=result.meta)


@router.get("/centers/{center_id}/partners", dependencies=[Depends(verify_internal_key)])
async def list_internal_center_partners(
    center_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    return success(data=await CenterRelationshipService.list_partners(db, center_id))
