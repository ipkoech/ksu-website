"""Partner and consultancy endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...schemas import ConsultancyCreate, ConsultancyUpdate, PartnerCreate, PartnerUpdate
from ...services import ConsultancyService, PartnerRelationshipService, PartnerService
from ._crud import build_crud_router

router = APIRouter()


@router.get("/partners/id/{partner_id}/projects", tags=["Partners"])
async def list_partner_projects(partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await PartnerRelationshipService.list_projects(db, partner_id))


@router.get("/partners/id/{partner_id}/farms", tags=["Partners"])
async def list_partner_farms(partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await PartnerRelationshipService.list_farms(db, partner_id))


@router.get("/partners/id/{partner_id}/activities", tags=["Partners"])
async def list_partner_activities(partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await PartnerRelationshipService.list_activities(db, partner_id))


@router.get("/partners/id/{partner_id}/impact-stories", tags=["Partners"])
async def list_partner_impact_stories(partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await PartnerRelationshipService.list_impact_stories(db, partner_id))


@router.get("/partners/id/{partner_id}/impact-metrics", tags=["Partners"])
async def list_partner_impact_metrics(partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await PartnerRelationshipService.list_impact_metrics(db, partner_id))


@router.get("/partners/id/{partner_id}/consultancies", tags=["Partners"])
async def list_partner_consultancies(partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await PartnerRelationshipService.list_consultancies(db, partner_id))


@router.get("/partners/id/{partner_id}/sustainability", tags=["Partners"])
async def list_partner_sustainability(partner_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await PartnerRelationshipService.list_sustainability(db, partner_id))


router.include_router(build_crud_router(prefix="/partners", tag="Partners", service=PartnerService, create_schema=PartnerCreate, update_schema=PartnerUpdate, write_scope="partnerships.manage_partners"))
router.include_router(build_crud_router(prefix="/consultancies", tag="Consultancies", service=ConsultancyService, create_schema=ConsultancyCreate, update_schema=ConsultancyUpdate, write_scope="research.manage_consultancies"))
