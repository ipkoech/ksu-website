"""Center, farm, and program endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import require_scope
from ...core.database import get_db
from ...schemas import (
    CenterPartnerLink,
    ResearchCenterCreate,
    ResearchCenterUpdate,
    ResearchFarmCreate,
    ResearchFarmUpdate,
    ResearchProgramCreate,
    ResearchProgramUpdate,
)
from ...services import (
    CenterRelationshipService,
    CenterService,
    FarmDetailService,
    FarmRelationshipService,
    FarmService,
    ProgramRelationshipService,
    ProgramService,
)
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


@router.get("/centers/id/{center_id}/projects", tags=["Research Centers"])
async def list_center_projects(center_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await CenterRelationshipService.list_projects(db, center_id))


@router.get("/centers/id/{center_id}/programs", tags=["Research Centers"])
async def list_center_programs(center_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await CenterRelationshipService.list_programs(db, center_id))


@router.get("/centers/id/{center_id}/farms", tags=["Research Centers"])
async def list_center_farms(center_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await CenterRelationshipService.list_farms(db, center_id))


@router.get("/centers/id/{center_id}/focus-areas", tags=["Research Centers"])
async def list_center_focus_areas(center_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await CenterRelationshipService.list_focus_areas(db, center_id))


@router.get("/centers/id/{center_id}/partners", tags=["Research Centers"])
async def list_center_partners(center_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await CenterRelationshipService.list_partners(db, center_id))


@router.get("/public/heri/centers/{center_id}/partners", tags=["HERI Public"])
async def list_public_heri_center_partners(center_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Public partner directory feed consumed by the HERI Africa site."""
    return success(data=await CenterRelationshipService.list_partners(db, center_id))


@router.put("/centers/id/{center_id}/partners/{partner_id}", tags=["Research Centers"], dependencies=[Depends(require_scope("research.manage_projects"))])
async def add_center_partner(center_id: uuid.UUID, partner_id: uuid.UUID, payload: CenterPartnerLink | None = None, db: AsyncSession = Depends(get_db)):
    await CenterRelationshipService.add_partner(db, center_id, partner_id, payload.model_dump(exclude_none=True) if payload else None)
    return success(data={"center_id": center_id, "partner_id": partner_id}, message="Center partner linked")


@router.delete("/centers/id/{center_id}/partners/{partner_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Research Centers"], dependencies=[Depends(require_scope("research.manage_projects"))])
async def remove_center_partner(center_id: uuid.UUID, partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await CenterRelationshipService.remove_partner(db, center_id, partner_id)


@router.put("/centers/id/{center_id}/focus-areas/{focus_area_id}", tags=["Research Centers"], dependencies=[Depends(require_scope("research.manage_projects"))])
async def add_center_focus_area(center_id: uuid.UUID, focus_area_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await CenterRelationshipService.add_focus_area(db, center_id, focus_area_id)
    return success(data={"center_id": center_id, "focus_area_id": focus_area_id}, message="Center focus area linked")


@router.delete("/centers/id/{center_id}/focus-areas/{focus_area_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Research Centers"], dependencies=[Depends(require_scope("research.manage_projects"))])
async def remove_center_focus_area(center_id: uuid.UUID, focus_area_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await CenterRelationshipService.remove_focus_area(db, center_id, focus_area_id)


@router.get("/programs/id/{program_id}/projects", tags=["Research Programs"])
async def list_program_projects(program_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ProgramRelationshipService.list_projects(db, program_id))


@router.get("/programs/id/{program_id}/themes", tags=["Research Programs"])
async def list_program_themes(program_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ProgramRelationshipService.list_themes(db, program_id))


@router.put("/programs/id/{program_id}/themes/{theme_id}", tags=["Research Programs"], dependencies=[Depends(require_scope("research_program.manage"))])
async def add_program_theme(program_id: uuid.UUID, theme_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProgramRelationshipService.add_theme(db, program_id, theme_id)
    return success(data={"program_id": program_id, "theme_id": theme_id}, message="Program theme linked")


@router.delete("/programs/id/{program_id}/themes/{theme_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Research Programs"], dependencies=[Depends(require_scope("research_program.manage"))])
async def remove_program_theme(program_id: uuid.UUID, theme_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProgramRelationshipService.remove_theme(db, program_id, theme_id)


router.include_router(build_crud_router(prefix="/centers", tag="Research Centers", service=CenterService, create_schema=ResearchCenterCreate, update_schema=ResearchCenterUpdate, write_scope="research.manage_projects"))
router.include_router(build_crud_router(prefix="/farms", tag="Research Farms", service=FarmService, create_schema=ResearchFarmCreate, update_schema=ResearchFarmUpdate, write_scope="research.manage_projects"))
router.include_router(build_crud_router(prefix="/programs", tag="Research Programs", service=ProgramService, create_schema=ResearchProgramCreate, update_schema=ResearchProgramUpdate, write_scope="research_program.manage"))
