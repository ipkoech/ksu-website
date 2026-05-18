"""Innovation endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ...schemas import InnovationCreate, InnovationUpdate, ResearchOutputCreate, ResearchOutputUpdate
from ...services import InnovationService, OutputService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/innovations", tag="Innovations", service=InnovationService, create_schema=InnovationCreate, update_schema=InnovationUpdate, write_scope="innovation.review_disclosure"))
router.include_router(build_crud_router(prefix="/outputs", tag="Research Outputs", service=OutputService, create_schema=ResearchOutputCreate, update_schema=ResearchOutputUpdate, write_scope="research.manage_reports"))

