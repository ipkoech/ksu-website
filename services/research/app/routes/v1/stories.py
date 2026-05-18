"""Impact and sustainability endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ...schemas import ImpactMetricCreate, ImpactMetricUpdate, SuccessStoryCreate, SuccessStoryUpdate, SustainabilityCreate, SustainabilityUpdate
from ...services import MetricService, StoryService, SustainabilityService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/stories", tag="Success Stories", service=StoryService, create_schema=SuccessStoryCreate, update_schema=SuccessStoryUpdate, write_scope="sustainability.manage"))
router.include_router(build_crud_router(prefix="/impact-metrics", tag="Impact Metrics", service=MetricService, create_schema=ImpactMetricCreate, update_schema=ImpactMetricUpdate, write_scope="sustainability.manage"))
router.include_router(build_crud_router(prefix="/sustainability", tag="Sustainability", service=SustainabilityService, create_schema=SustainabilityCreate, update_schema=SustainabilityUpdate, write_scope="sustainability.manage"))

