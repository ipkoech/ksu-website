"""Partner and consultancy endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ...schemas import ConsultancyCreate, ConsultancyUpdate, PartnerCreate, PartnerUpdate
from ...services import ConsultancyService, PartnerService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/partners", tag="Partners", service=PartnerService, create_schema=PartnerCreate, update_schema=PartnerUpdate, write_scope="partnerships.manage_partners"))
router.include_router(build_crud_router(prefix="/consultancies", tag="Consultancies", service=ConsultancyService, create_schema=ConsultancyCreate, update_schema=ConsultancyUpdate, write_scope="research.manage_consultancies"))

