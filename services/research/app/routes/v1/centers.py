"""Center, farm, and program endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ...schemas import (
    ResearchCenterCreate,
    ResearchCenterUpdate,
    ResearchFarmCreate,
    ResearchFarmUpdate,
    ResearchProgramCreate,
    ResearchProgramUpdate,
)
from ...services import CenterService, FarmService, ProgramService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/centers", tag="Research Centers", service=CenterService, create_schema=ResearchCenterCreate, update_schema=ResearchCenterUpdate, write_scope="research.manage_projects"))
router.include_router(build_crud_router(prefix="/farms", tag="Research Farms", service=FarmService, create_schema=ResearchFarmCreate, update_schema=ResearchFarmUpdate, write_scope="research.manage_projects"))
router.include_router(build_crud_router(prefix="/programs", tag="Research Programs", service=ProgramService, create_schema=ResearchProgramCreate, update_schema=ResearchProgramUpdate, write_scope="research_program.manage"))

