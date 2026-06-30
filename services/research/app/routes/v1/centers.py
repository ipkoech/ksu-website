"""Center, farm, and program endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import require_scope
from ...core.database import get_db
from ...schemas import (
    ResearchCenterCreate,
    ResearchCenterUpdate,
    ResearchFarmCreate,
    ResearchFarmUpdate,
    ResearchProgramCreate,
    ResearchProgramUpdate,
)
from ...services import CenterService, FarmDetailService, FarmRelationshipService, FarmService, ProgramService
from ._crud import build_crud_router

router = APIRouter()


@router.get("/farms/{slug}/detail", tags=["Research Farms"])
async def get_farm_detail(slug: str, db: AsyncSession = Depends(get_db)):
    detail = await FarmDetailService.get_by_slug(db, slug)
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research Farm not found")
    return success(data=detail)


@router.get("/farms/id/{farm_id}/projects", tags=["Research Farms"])
async def list_farm_projects(farm_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await FarmRelationshipService.list_projects(db, farm_id))


@router.put("/farms/id/{farm_id}/projects/{project_id}", tags=["Research Farms"], dependencies=[Depends(require_scope("research.manage_projects"))])
async def add_farm_project(farm_id: uuid.UUID, project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await FarmRelationshipService.add_project(db, farm_id, project_id)
    return success(data={"farm_id": farm_id, "project_id": project_id}, message="Farm project linked")


@router.delete("/farms/id/{farm_id}/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Research Farms"], dependencies=[Depends(require_scope("research.manage_projects"))])
async def remove_farm_project(farm_id: uuid.UUID, project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await FarmRelationshipService.remove_project(db, farm_id, project_id)


@router.get("/farms/id/{farm_id}/partners", tags=["Research Farms"])
async def list_farm_partners(farm_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await FarmRelationshipService.list_partners(db, farm_id))


@router.get("/farms/id/{farm_id}/activities", tags=["Research Farms"])
async def list_farm_activities(farm_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await FarmRelationshipService.list_activities(db, farm_id))


@router.get("/farms/id/{farm_id}/impact-stories", tags=["Research Farms"])
async def list_farm_impact_stories(farm_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await FarmRelationshipService.list_impact_stories(db, farm_id))


router.include_router(build_crud_router(prefix="/centers", tag="Research Centers", service=CenterService, create_schema=ResearchCenterCreate, update_schema=ResearchCenterUpdate, write_scope="research.manage_projects"))
router.include_router(build_crud_router(prefix="/farms", tag="Research Farms", service=FarmService, create_schema=ResearchFarmCreate, update_schema=ResearchFarmUpdate, write_scope="research.manage_projects"))
router.include_router(build_crud_router(prefix="/programs", tag="Research Programs", service=ProgramService, create_schema=ResearchProgramCreate, update_schema=ResearchProgramUpdate, write_scope="research_program.manage"))
