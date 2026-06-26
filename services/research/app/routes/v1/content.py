"""Content and support endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ...schemas import (
    ResearchGuidelineCreate,
    ResearchGuidelineUpdate,
    ResearchResourceCreate,
    ResearchResourceUpdate,
    ResearchServiceCreate,
    ResearchServiceUpdate,
)
from ...services import GuidelineService, ResourceService, SupportService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/resources", tag="Research Resources", service=ResourceService, create_schema=ResearchResourceCreate, update_schema=ResearchResourceUpdate, write_scope="research.manage_resources"))
router.include_router(build_crud_router(prefix="/services", tag="Research Services", service=SupportService, create_schema=ResearchServiceCreate, update_schema=ResearchServiceUpdate, write_scope="research.manage_services"))
router.include_router(build_crud_router(prefix="/guidelines", tag="Research Guidelines", service=GuidelineService, create_schema=ResearchGuidelineCreate, update_schema=ResearchGuidelineUpdate, write_scope="research.manage_guidelines"))
