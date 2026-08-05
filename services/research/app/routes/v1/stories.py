"""Impact and sustainability endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status
from ksu_common import cached_public
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import require_scope
from ...core.database import get_db
from ...schemas import ImpactMetricCreate, ImpactMetricUpdate, SuccessStoryCreate, SuccessStoryUpdate, SustainabilityCreate, SustainabilityUpdate
from ...services import MetricService, StoryService, SustainabilityRelationshipService, SustainabilityService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/stories", tag="Success Stories", service=StoryService, create_schema=SuccessStoryCreate, update_schema=SuccessStoryUpdate, write_scope="sustainability.manage"))
router.include_router(build_crud_router(prefix="/impact-metrics", tag="Impact Metrics", service=MetricService, create_schema=ImpactMetricCreate, update_schema=ImpactMetricUpdate, write_scope="sustainability.manage"))


@router.get("/sustainability/id/{sustainability_id}/projects", tags=["Sustainability"])
@cached_public(timeout=300)
async def list_sustainability_projects(sustainability_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await SustainabilityRelationshipService.list_projects(db, sustainability_id))


@router.put("/sustainability/id/{sustainability_id}/projects/{project_id}", tags=["Sustainability"], dependencies=[Depends(require_scope("sustainability.manage"))])
async def add_sustainability_project(sustainability_id: uuid.UUID, project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await SustainabilityRelationshipService.add_project(db, sustainability_id, project_id)
    return success(data={"sustainability_id": sustainability_id, "project_id": project_id}, message="Sustainability project linked")


@router.delete("/sustainability/id/{sustainability_id}/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Sustainability"], dependencies=[Depends(require_scope("sustainability.manage"))])
async def remove_sustainability_project(sustainability_id: uuid.UUID, project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await SustainabilityRelationshipService.remove_project(db, sustainability_id, project_id)


@router.get("/sustainability/id/{sustainability_id}/partners", tags=["Sustainability"])
@cached_public(timeout=300)
async def list_sustainability_partners(sustainability_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await SustainabilityRelationshipService.list_partners(db, sustainability_id))


@router.put("/sustainability/id/{sustainability_id}/partners/{partner_id}", tags=["Sustainability"], dependencies=[Depends(require_scope("sustainability.manage"))])
async def add_sustainability_partner(sustainability_id: uuid.UUID, partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await SustainabilityRelationshipService.add_partner(db, sustainability_id, partner_id)
    return success(data={"sustainability_id": sustainability_id, "partner_id": partner_id}, message="Sustainability partner linked")


@router.delete("/sustainability/id/{sustainability_id}/partners/{partner_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Sustainability"], dependencies=[Depends(require_scope("sustainability.manage"))])
async def remove_sustainability_partner(sustainability_id: uuid.UUID, partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await SustainabilityRelationshipService.remove_partner(db, sustainability_id, partner_id)


@router.get("/sustainability/id/{sustainability_id}/training", tags=["Sustainability"])
@cached_public(timeout=300)
async def list_sustainability_training(sustainability_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await SustainabilityRelationshipService.list_training(db, sustainability_id))


@router.put("/sustainability/id/{sustainability_id}/training/{training_id}", tags=["Sustainability"], dependencies=[Depends(require_scope("sustainability.manage"))])
async def add_sustainability_training(sustainability_id: uuid.UUID, training_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await SustainabilityRelationshipService.add_training(db, sustainability_id, training_id)
    return success(data={"sustainability_id": sustainability_id, "training_id": training_id}, message="Sustainability training linked")


@router.delete("/sustainability/id/{sustainability_id}/training/{training_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Sustainability"], dependencies=[Depends(require_scope("sustainability.manage"))])
async def remove_sustainability_training(sustainability_id: uuid.UUID, training_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await SustainabilityRelationshipService.remove_training(db, sustainability_id, training_id)


@router.get("/sustainability/id/{sustainability_id}/stories", tags=["Sustainability"])
@cached_public(timeout=300)
async def list_sustainability_stories(sustainability_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await SustainabilityRelationshipService.list_stories(db, sustainability_id))


@router.put("/sustainability/id/{sustainability_id}/stories/{story_id}", tags=["Sustainability"], dependencies=[Depends(require_scope("sustainability.manage"))])
async def add_sustainability_story(sustainability_id: uuid.UUID, story_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await SustainabilityRelationshipService.add_story(db, sustainability_id, story_id)
    return success(data={"sustainability_id": sustainability_id, "story_id": story_id}, message="Sustainability story linked")


@router.delete("/sustainability/id/{sustainability_id}/stories/{story_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Sustainability"], dependencies=[Depends(require_scope("sustainability.manage"))])
async def remove_sustainability_story(sustainability_id: uuid.UUID, story_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await SustainabilityRelationshipService.remove_story(db, sustainability_id, story_id)


router.include_router(build_crud_router(prefix="/sustainability", tag="Sustainability", service=SustainabilityService, create_schema=SustainabilityCreate, update_schema=SustainabilityUpdate, write_scope="sustainability.manage"))
