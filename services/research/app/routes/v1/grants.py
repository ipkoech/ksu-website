"""Funding and grant endpoints."""

from __future__ import annotations

from fastapi import APIRouter

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
from ...services import ApplicationService, EndowmentFundService, FundingService, GrantGuidelineService, GrantService, ReportService, ReviewService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/grants", tag="Grants", service=GrantService, create_schema=GrantCreate, update_schema=GrantUpdate, write_scope="funding.manage"))
router.include_router(build_crud_router(prefix="/grant-guidelines", tag="Grant Guidelines", service=GrantGuidelineService, create_schema=GrantGuidelineCreate, update_schema=GrantGuidelineUpdate, write_scope="funding.manage"))
router.include_router(build_crud_router(prefix="/grant-applications", tag="Grant Applications", service=ApplicationService, create_schema=GrantApplicationCreate, update_schema=GrantApplicationUpdate, write_scope="funding.manage", public_read=False))
router.include_router(build_crud_router(prefix="/funders", tag="Funding Sources", service=FundingService, create_schema=FundingCreate, update_schema=FundingUpdate, write_scope="funding.manage"))
router.include_router(build_crud_router(prefix="/endowments", tag="Endowment Funds", service=EndowmentFundService, create_schema=EndowmentFundCreate, update_schema=EndowmentFundUpdate, write_scope="research.manage_endowments"))
router.include_router(build_crud_router(prefix="/grant-reviews", tag="Grant Reviews", service=ReviewService, create_schema=GrantReviewCreate, update_schema=GrantReviewUpdate, write_scope="funding.manage", public_read=False))
router.include_router(build_crud_router(prefix="/grant-reports", tag="Grant Reports", service=ReportService, create_schema=GrantReportCreate, update_schema=GrantReportUpdate, write_scope="funding.manage", public_read=False))
