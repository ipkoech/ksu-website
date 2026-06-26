"""Content and support endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ...schemas import (
    BoardMemberCreate,
    BoardMemberUpdate,
    ResearchBoardCreate,
    ResearchBoardUpdate,
    ResearchGuidelineCreate,
    ResearchGuidelineUpdate,
    ResearchOfficeCreate,
    ResearchOfficeStaffCreate,
    ResearchOfficeStaffUpdate,
    ResearchOfficeUpdate,
    ResearchResourceCreate,
    ResearchResourceUpdate,
    ResearchServiceCreate,
    ResearchServiceUpdate,
)
from ...services import BoardMemberService, BoardService, GuidelineService, OfficeService, OfficeStaffService, ResourceService, SupportService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/offices", tag="Research Offices", service=OfficeService, create_schema=ResearchOfficeCreate, update_schema=ResearchOfficeUpdate, write_scope="research.manage_office"))
router.include_router(build_crud_router(prefix="/office-staff", tag="Research Office Staff", service=OfficeStaffService, create_schema=ResearchOfficeStaffCreate, update_schema=ResearchOfficeStaffUpdate, write_scope="research.manage_office"))
router.include_router(build_crud_router(prefix="/resources", tag="Research Resources", service=ResourceService, create_schema=ResearchResourceCreate, update_schema=ResearchResourceUpdate, write_scope="research.manage_resources"))
router.include_router(build_crud_router(prefix="/services", tag="Research Services", service=SupportService, create_schema=ResearchServiceCreate, update_schema=ResearchServiceUpdate, write_scope="research.manage_services"))
router.include_router(build_crud_router(prefix="/guidelines", tag="Research Guidelines", service=GuidelineService, create_schema=ResearchGuidelineCreate, update_schema=ResearchGuidelineUpdate, write_scope="research.manage_guidelines"))
router.include_router(build_crud_router(prefix="/boards", tag="Research Boards", service=BoardService, create_schema=ResearchBoardCreate, update_schema=ResearchBoardUpdate, write_scope="research.manage_guidelines"))
router.include_router(build_crud_router(prefix="/board-members", tag="Board Members", service=BoardMemberService, create_schema=BoardMemberCreate, update_schema=BoardMemberUpdate, write_scope="research.manage_guidelines"))
