"""Project and classification endpoints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from ksu_common import cached_public
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import require_scope
from ...core.database import get_db
from ...schemas.base import JsonObject, SuccessEnvelope
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
from ...services import FocusAreaService, ProjectDetailService, ProjectPublicDetailService, ProjectRelationshipService, ProjectService, TagService, ThemeRelationshipService, ThemeService
from ._crud import build_crud_router

router = APIRouter()


@router.get(
    "/projects/featured",
    tags=["Research Projects"],
    response_model=SuccessEnvelope[JsonObject],
)
@cached_public(timeout=300)
async def get_featured_project(db: AsyncSession = Depends(get_db)):
    project = await ProjectPublicDetailService.get_featured(db)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No featured research project found")
    return success(data=project)


@router.get(
    "/projects/{slug}/public-detail",
    tags=["Research Projects"],
    response_model=SuccessEnvelope[JsonObject],
)
@cached_public(timeout=300)
async def get_public_project_detail(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    detail = await ProjectPublicDetailService.get_by_slug(db, slug)
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research Project not found")
    return success(data=detail)


@router.get(
    "/projects/{slug}/detail",
    tags=["Research Projects"],
    response_model=SuccessEnvelope[JsonObject],
)
@cached_public(timeout=300)
async def get_project_detail(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    detail = await ProjectDetailService.get_by_slug(db, slug)
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Research Project not found")
    return success(data=detail)


@router.get(
    "/projects/id/{project_id}/activities",
    tags=["Research Projects"],
    response_model=SuccessEnvelope[list[JsonObject]],
)
@cached_public(timeout=300)
async def list_project_activities(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ProjectRelationshipService.list_activities(db, project_id))


@router.get(
    "/projects/id/{project_id}/impact-stories",
    tags=["Research Projects"],
    response_model=SuccessEnvelope[list[JsonObject]],
)
@cached_public(timeout=300)
async def list_project_impact_stories(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ProjectRelationshipService.list_impact_stories(db, project_id))


@router.get(
    "/projects/id/{project_id}/impact-metrics",
    tags=["Research Projects"],
    response_model=SuccessEnvelope[list[JsonObject]],
)
@cached_public(timeout=300)
async def list_project_impact_metrics(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ProjectRelationshipService.list_impact_metrics(db, project_id))


@router.get(
    "/projects/id/{project_id}/partners",
    tags=["Research Projects"],
    response_model=SuccessEnvelope[list[JsonObject]],
)
@cached_public(timeout=300)
async def list_project_partners(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ProjectRelationshipService.list_partners(db, project_id))


@router.put(
    "/projects/id/{project_id}/partners/{partner_id}",
    tags=["Research Projects"],
    dependencies=[Depends(require_scope("research.manage_projects"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def add_project_partner(project_id: uuid.UUID, partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProjectRelationshipService.add_partner(db, project_id, partner_id)
    return success(data={"project_id": project_id, "partner_id": partner_id}, message="Project partner linked")


@router.delete(
    "/projects/id/{project_id}/partners/{partner_id}",
    tags=["Research Projects"],
    dependencies=[Depends(require_scope("research.manage_projects"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def remove_project_partner(project_id: uuid.UUID, partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProjectRelationshipService.remove_partner(db, project_id, partner_id)
    return success(data={"project_id": project_id, "partner_id": partner_id, "deleted": True}, message="Project partner unlinked")

@router.get(
    "/projects/id/{project_id}/funders",
    tags=["Research Projects"],
    response_model=SuccessEnvelope[list[JsonObject]],
)
@cached_public(timeout=300)
async def list_project_funders(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ProjectRelationshipService.list_funders(db, project_id))


@router.put(
    "/projects/id/{project_id}/funders/{funder_id}",
    tags=["Research Projects"],
    dependencies=[Depends(require_scope("research.manage_projects"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def add_project_funder(project_id: uuid.UUID, funder_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProjectRelationshipService.add_funder(db, project_id, funder_id)
    return success(data={"project_id": project_id, "funder_id": funder_id}, message="Project funder linked")


@router.delete(
    "/projects/id/{project_id}/funders/{funder_id}",
    tags=["Research Projects"],
    dependencies=[Depends(require_scope("research.manage_projects"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def remove_project_funder(project_id: uuid.UUID, funder_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProjectRelationshipService.remove_funder(db, project_id, funder_id)
    return success(data={"project_id": project_id, "funder_id": funder_id, "deleted": True}, message="Project funder unlinked")

@router.get(
    "/projects/id/{project_id}/focus-areas",
    tags=["Research Projects"],
    response_model=SuccessEnvelope[list[JsonObject]],
)
@cached_public(timeout=300)
async def list_project_focus_areas(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ProjectRelationshipService.list_focus_areas(db, project_id))


@router.put(
    "/projects/id/{project_id}/focus-areas/{focus_area_id}",
    tags=["Research Projects"],
    dependencies=[Depends(require_scope("research.manage_projects"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def add_project_focus_area(project_id: uuid.UUID, focus_area_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProjectRelationshipService.add_focus_area(db, project_id, focus_area_id)
    return success(data={"project_id": project_id, "focus_area_id": focus_area_id}, message="Project focus area linked")


@router.delete(
    "/projects/id/{project_id}/focus-areas/{focus_area_id}",
    tags=["Research Projects"],
    dependencies=[Depends(require_scope("research.manage_projects"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def remove_project_focus_area(project_id: uuid.UUID, focus_area_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ProjectRelationshipService.remove_focus_area(db, project_id, focus_area_id)
    return success(data={"project_id": project_id, "focus_area_id": focus_area_id, "deleted": True}, message="Project focus area unlinked")

@router.get(
    "/themes/id/{theme_id}/focus-areas",
    tags=["Research Themes"],
    response_model=SuccessEnvelope[list[JsonObject]],
)
@cached_public(timeout=300)
async def list_theme_focus_areas(theme_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ThemeRelationshipService.list_focus_areas(db, theme_id))


@router.get(
    "/themes/id/{theme_id}/projects",
    tags=["Research Themes"],
    response_model=SuccessEnvelope[list[JsonObject]],
)
@cached_public(timeout=300)
async def list_theme_projects(theme_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ThemeRelationshipService.list_projects(db, theme_id))


@router.put(
    "/themes/id/{theme_id}/projects/{project_id}",
    tags=["Research Themes"],
    dependencies=[Depends(require_scope("research_theme.manage"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def add_theme_project(theme_id: uuid.UUID, project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ThemeRelationshipService.add_project(db, theme_id, project_id)
    return success(data={"theme_id": theme_id, "project_id": project_id}, message="Theme project linked")


@router.delete(
    "/themes/id/{theme_id}/projects/{project_id}",
    tags=["Research Themes"],
    dependencies=[Depends(require_scope("research_theme.manage"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def remove_theme_project(theme_id: uuid.UUID, project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ThemeRelationshipService.remove_project(db, theme_id, project_id)
    return success(data={"theme_id": theme_id, "project_id": project_id, "deleted": True}, message="Theme project unlinked")

@router.get(
    "/themes/id/{theme_id}/programs",
    tags=["Research Themes"],
    response_model=SuccessEnvelope[list[JsonObject]],
)
@cached_public(timeout=300)
async def list_theme_programs(theme_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ThemeRelationshipService.list_programs(db, theme_id))


@router.put(
    "/themes/id/{theme_id}/programs/{program_id}",
    tags=["Research Themes"],
    dependencies=[Depends(require_scope("research_theme.manage"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def add_theme_program(theme_id: uuid.UUID, program_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ThemeRelationshipService.add_program(db, theme_id, program_id)
    return success(data={"theme_id": theme_id, "program_id": program_id}, message="Theme program linked")


@router.delete(
    "/themes/id/{theme_id}/programs/{program_id}",
    tags=["Research Themes"],
    dependencies=[Depends(require_scope("research_theme.manage"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def remove_theme_program(theme_id: uuid.UUID, program_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ThemeRelationshipService.remove_program(db, theme_id, program_id)
    return success(data={"theme_id": theme_id, "program_id": program_id, "deleted": True}, message="Theme program unlinked")

@router.get(
    "/themes/id/{theme_id}/publications",
    tags=["Research Themes"],
    response_model=SuccessEnvelope[list[JsonObject]],
)
@cached_public(timeout=300)
async def list_theme_publications(theme_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ThemeRelationshipService.list_publications(db, theme_id))


@router.put(
    "/themes/id/{theme_id}/publications/{publication_id}",
    tags=["Research Themes"],
    dependencies=[Depends(require_scope("research_theme.manage"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def add_theme_publication(theme_id: uuid.UUID, publication_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ThemeRelationshipService.add_publication(db, theme_id, publication_id)
    return success(data={"theme_id": theme_id, "publication_id": publication_id}, message="Theme publication linked")


@router.delete(
    "/themes/id/{theme_id}/publications/{publication_id}",
    tags=["Research Themes"],
    dependencies=[Depends(require_scope("research_theme.manage"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def remove_theme_publication(theme_id: uuid.UUID, publication_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ThemeRelationshipService.remove_publication(db, theme_id, publication_id)
    return success(data={"theme_id": theme_id, "publication_id": publication_id, "deleted": True}, message="Theme publication unlinked")

@router.get(
    "/themes/id/{theme_id}/grants",
    tags=["Research Themes"],
    response_model=SuccessEnvelope[list[JsonObject]],
)
@cached_public(timeout=300)
async def list_theme_grants(theme_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await ThemeRelationshipService.list_grants(db, theme_id))


@router.put(
    "/themes/id/{theme_id}/grants/{grant_id}",
    tags=["Research Themes"],
    dependencies=[Depends(require_scope("research_theme.manage"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def add_theme_grant(theme_id: uuid.UUID, grant_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ThemeRelationshipService.add_grant(db, theme_id, grant_id)
    return success(data={"theme_id": theme_id, "grant_id": grant_id}, message="Theme grant linked")


@router.delete(
    "/themes/id/{theme_id}/grants/{grant_id}",
    tags=["Research Themes"],
    dependencies=[Depends(require_scope("research_theme.manage"))],
    response_model=SuccessEnvelope[JsonObject],
)
async def remove_theme_grant(theme_id: uuid.UUID, grant_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ThemeRelationshipService.remove_grant(db, theme_id, grant_id)
    return success(data={"theme_id": theme_id, "grant_id": grant_id, "deleted": True}, message="Theme grant unlinked")


router.include_router(build_crud_router(prefix="/projects", tag="Research Projects", service=ProjectService, create_schema=ResearchProjectCreate, update_schema=ResearchProjectUpdate, write_scope="research.manage_projects"))
router.include_router(build_crud_router(prefix="/themes", tag="Research Themes", service=ThemeService, create_schema=ResearchThemeCreate, update_schema=ResearchThemeUpdate, write_scope="research_theme.manage"))
router.include_router(build_crud_router(prefix="/focus-areas", tag="Focus Areas", service=FocusAreaService, create_schema=FocusAreaCreate, update_schema=FocusAreaUpdate, write_scope="research_theme.manage"))
router.include_router(build_crud_router(prefix="/expertise-tags", tag="Expertise Tags", service=TagService, create_schema=ExpertiseTagCreate, update_schema=ExpertiseTagUpdate, write_scope="research_theme.manage"))
