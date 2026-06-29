"""Project and classification endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import require_scope
from ...core.database import get_db
from ...schemas import (
    ExpertiseTagCreate,
    ExpertiseTagUpdate,
    FocusAreaCreate,
    FocusAreaUpdate,
    ResearchProjectCreate,
    ResearchProjectUpdate,
    ResearchThemeCreate,
    ResearchThemeUpdate,
)
from ...services import FocusAreaService, ProjectDetailService, ProjectRelationshipService, ProjectService, TagService, ThemeService
from ._crud import build_crud_router

router = APIRouter()


@router.get("/projects/{slug}/detail", tags=["Research Projects"])
async def get_project_detail(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    detail = await ProjectDetailService.get_by_slug(db, slug)
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research Project not found")
    return success(data=detail)


@router.get("/projects/id/{project_id}/partners", tags=["Research Projects"])
async def list_project_partners(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ProjectRelationshipService.list_partners(db, project_id))


@router.put("/projects/id/{project_id}/partners/{partner_id}", tags=["Research Projects"], dependencies=[Depends(require_scope("research.manage_projects"))])
async def add_project_partner(project_id: uuid.UUID, partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProjectRelationshipService.add_partner(db, project_id, partner_id)
    return success(data={"project_id": project_id, "partner_id": partner_id}, message="Project partner linked")


@router.delete("/projects/id/{project_id}/partners/{partner_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Research Projects"], dependencies=[Depends(require_scope("research.manage_projects"))])
async def remove_project_partner(project_id: uuid.UUID, partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProjectRelationshipService.remove_partner(db, project_id, partner_id)


@router.get("/projects/id/{project_id}/funders", tags=["Research Projects"])
async def list_project_funders(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ProjectRelationshipService.list_funders(db, project_id))


@router.put("/projects/id/{project_id}/funders/{funder_id}", tags=["Research Projects"], dependencies=[Depends(require_scope("research.manage_projects"))])
async def add_project_funder(project_id: uuid.UUID, funder_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProjectRelationshipService.add_funder(db, project_id, funder_id)
    return success(data={"project_id": project_id, "funder_id": funder_id}, message="Project funder linked")


@router.delete("/projects/id/{project_id}/funders/{funder_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Research Projects"], dependencies=[Depends(require_scope("research.manage_projects"))])
async def remove_project_funder(project_id: uuid.UUID, funder_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProjectRelationshipService.remove_funder(db, project_id, funder_id)


@router.get("/projects/id/{project_id}/focus-areas", tags=["Research Projects"])
async def list_project_focus_areas(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ProjectRelationshipService.list_focus_areas(db, project_id))


@router.put("/projects/id/{project_id}/focus-areas/{focus_area_id}", tags=["Research Projects"], dependencies=[Depends(require_scope("research.manage_projects"))])
async def add_project_focus_area(project_id: uuid.UUID, focus_area_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProjectRelationshipService.add_focus_area(db, project_id, focus_area_id)
    return success(data={"project_id": project_id, "focus_area_id": focus_area_id}, message="Project focus area linked")


@router.delete("/projects/id/{project_id}/focus-areas/{focus_area_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Research Projects"], dependencies=[Depends(require_scope("research.manage_projects"))])
async def remove_project_focus_area(project_id: uuid.UUID, focus_area_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProjectRelationshipService.remove_focus_area(db, project_id, focus_area_id)


router.include_router(build_crud_router(prefix="/projects", tag="Research Projects", service=ProjectService, create_schema=ResearchProjectCreate, update_schema=ResearchProjectUpdate, write_scope="research.manage_projects"))
router.include_router(build_crud_router(prefix="/themes", tag="Research Themes", service=ThemeService, create_schema=ResearchThemeCreate, update_schema=ResearchThemeUpdate, write_scope="research_theme.manage"))
router.include_router(build_crud_router(prefix="/focus-areas", tag="Focus Areas", service=FocusAreaService, create_schema=FocusAreaCreate, update_schema=FocusAreaUpdate, write_scope="research_theme.manage"))
router.include_router(build_crud_router(prefix="/expertise-tags", tag="Expertise Tags", service=TagService, create_schema=ExpertiseTagCreate, update_schema=ExpertiseTagUpdate, write_scope="research_theme.manage"))
