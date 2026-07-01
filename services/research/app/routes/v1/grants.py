"""Funding and grant endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import require_scope
from ...core.database import get_db
from ...schemas import (
    EndowmentFundCreate,
    EndowmentFundUpdate,
    FundingCreate,
    FundingUpdate,
    GrantApplicationCreate,
    GrantApplicationUpdate,
    GrantCreate,
    GrantGuidelineCreate,
    GrantGuidelineUpdate,
    GrantReportCreate,
    GrantReportUpdate,
    GrantReviewCreate,
    GrantReviewUpdate,
    GrantUpdate,
)
from ...services import (
    ApplicationRelationshipService,
    ApplicationService,
    EndowmentFundService,
    FundingRelationshipService,
    FundingService,
    GrantGuidelineService,
    GrantRelationshipService,
    GrantService,
    ReportService,
    ReviewService,
)
from ._crud import build_crud_router

router = APIRouter()


@router.get("/grants/id/{grant_id}/projects", tags=["Grants"])
async def list_grant_projects(grant_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await GrantRelationshipService.list_projects(db, grant_id))


@router.get("/grants/id/{grant_id}/themes", tags=["Grants"])
async def list_grant_themes(grant_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await GrantRelationshipService.list_themes(db, grant_id))


@router.put("/grants/id/{grant_id}/themes/{theme_id}", tags=["Grants"], dependencies=[Depends(require_scope("funding.manage"))])
async def add_grant_theme(grant_id: uuid.UUID, theme_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await GrantRelationshipService.add_theme(db, grant_id, theme_id)
    return success(data={"grant_id": grant_id, "theme_id": theme_id}, message="Grant theme linked")


@router.delete("/grants/id/{grant_id}/themes/{theme_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Grants"], dependencies=[Depends(require_scope("funding.manage"))])
async def remove_grant_theme(grant_id: uuid.UUID, theme_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await GrantRelationshipService.remove_theme(db, grant_id, theme_id)


@router.get("/funders/id/{funder_id}/projects", tags=["Funding Sources"])
async def list_funder_projects(funder_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await FundingRelationshipService.list_projects(db, funder_id))


@router.get("/grant-applications/id/{application_id}/reviews", tags=["Grant Applications"], dependencies=[Depends(require_scope("funding.manage"))])
async def list_application_reviews(application_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ApplicationRelationshipService.list_reviews(db, application_id))


@router.get("/grant-applications/id/{application_id}/reports", tags=["Grant Applications"], dependencies=[Depends(require_scope("funding.manage"))])
async def list_application_reports(application_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ApplicationRelationshipService.list_reports(db, application_id))


router.include_router(build_crud_router(prefix="/grants", tag="Grants", service=GrantService, create_schema=GrantCreate, update_schema=GrantUpdate, write_scope="funding.manage"))
router.include_router(build_crud_router(prefix="/grant-guidelines", tag="Grant Guidelines", service=GrantGuidelineService, create_schema=GrantGuidelineCreate, update_schema=GrantGuidelineUpdate, write_scope="funding.manage"))
router.include_router(build_crud_router(prefix="/grant-applications", tag="Grant Applications", service=ApplicationService, create_schema=GrantApplicationCreate, update_schema=GrantApplicationUpdate, write_scope="funding.manage", public_read=False))
router.include_router(build_crud_router(prefix="/funders", tag="Funding Sources", service=FundingService, create_schema=FundingCreate, update_schema=FundingUpdate, write_scope="funding.manage"))
router.include_router(build_crud_router(prefix="/endowments", tag="Endowment Funds", service=EndowmentFundService, create_schema=EndowmentFundCreate, update_schema=EndowmentFundUpdate, write_scope="research.manage_endowments"))
router.include_router(build_crud_router(prefix="/grant-reviews", tag="Grant Reviews", service=ReviewService, create_schema=GrantReviewCreate, update_schema=GrantReviewUpdate, write_scope="funding.manage", public_read=False))
router.include_router(build_crud_router(prefix="/grant-reports", tag="Grant Reports", service=ReportService, create_schema=GrantReportCreate, update_schema=GrantReportUpdate, write_scope="funding.manage", public_read=False))
