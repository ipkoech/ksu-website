"""Project and classification endpoints."""

from __future__ import annotations

from fastapi import APIRouter

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
from ...services import FocusAreaService, ProjectService, TagService, ThemeService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/projects", tag="Research Projects", service=ProjectService, create_schema=ResearchProjectCreate, update_schema=ResearchProjectUpdate, write_scope="research.manage_projects"))
router.include_router(build_crud_router(prefix="/themes", tag="Research Themes", service=ThemeService, create_schema=ResearchThemeCreate, update_schema=ResearchThemeUpdate, write_scope="research_theme.manage"))
router.include_router(build_crud_router(prefix="/focus-areas", tag="Focus Areas", service=FocusAreaService, create_schema=FocusAreaCreate, update_schema=FocusAreaUpdate, write_scope="research_theme.manage"))
router.include_router(build_crud_router(prefix="/expertise-tags", tag="Expertise Tags", service=TagService, create_schema=ExpertiseTagCreate, update_schema=ExpertiseTagUpdate, write_scope="research_theme.manage"))

