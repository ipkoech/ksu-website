"""Content and support endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ...schemas import (
    BoardMemberCreate,
    BoardMemberUpdate,
    ResearchArticleCreate,
    ResearchArticleUpdate,
    ResearchBoardCreate,
    ResearchBoardUpdate,
    ResearchEventCreate,
    ResearchEventUpdate,
    ResearchGuidelineCreate,
    ResearchGuidelineUpdate,
    ResearchNewsCreate,
    ResearchNewsUpdate,
    ResearchResourceCreate,
    ResearchResourceUpdate,
    ResearchServiceCreate,
    ResearchServiceUpdate,
    ResearchSliderCreate,
    ResearchSliderUpdate,
)
from ...services import ArticleService, BoardMemberService, BoardService, EventService, GuidelineService, NewsService, ResourceService, SliderService, SupportService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/news", tag="Research News", service=NewsService, create_schema=ResearchNewsCreate, update_schema=ResearchNewsUpdate, write_scope="content.manage_news"))
router.include_router(build_crud_router(prefix="/articles", tag="Research Articles", service=ArticleService, create_schema=ResearchArticleCreate, update_schema=ResearchArticleUpdate, write_scope="content.manage_news"))
router.include_router(build_crud_router(prefix="/events", tag="Research Events", service=EventService, create_schema=ResearchEventCreate, update_schema=ResearchEventUpdate, write_scope="content.manage_announcements"))
router.include_router(build_crud_router(prefix="/sliders", tag="Research Sliders", service=SliderService, create_schema=ResearchSliderCreate, update_schema=ResearchSliderUpdate, write_scope="marketing.manage_sliders"))
router.include_router(build_crud_router(prefix="/resources", tag="Research Resources", service=ResourceService, create_schema=ResearchResourceCreate, update_schema=ResearchResourceUpdate, write_scope="research.manage_resources"))
router.include_router(build_crud_router(prefix="/services", tag="Research Services", service=SupportService, create_schema=ResearchServiceCreate, update_schema=ResearchServiceUpdate, write_scope="research.manage_services"))
router.include_router(build_crud_router(prefix="/guidelines", tag="Research Guidelines", service=GuidelineService, create_schema=ResearchGuidelineCreate, update_schema=ResearchGuidelineUpdate, write_scope="research.manage_guidelines"))
router.include_router(build_crud_router(prefix="/boards", tag="Research Boards", service=BoardService, create_schema=ResearchBoardCreate, update_schema=ResearchBoardUpdate, write_scope="research.manage_guidelines"))
router.include_router(build_crud_router(prefix="/board-members", tag="Board Members", service=BoardMemberService, create_schema=BoardMemberCreate, update_schema=BoardMemberUpdate, write_scope="research.manage_guidelines"))

