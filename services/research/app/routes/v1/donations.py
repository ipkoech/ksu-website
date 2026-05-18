"""Donation endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from ...schemas import DonationCreate, DonationImpactCreate, DonationImpactUpdate, DonationSettingsCreate, DonationSettingsUpdate, DonationStoryCreate, DonationStoryUpdate, DonationUpdate, DonorCreate, DonorUpdate
from ...services import DonationImpactService, DonationService, DonationSettingsService, DonationStoryService, DonorService
from ._crud import build_crud_router

router = APIRouter()
router.include_router(build_crud_router(prefix="/donors", tag="Donors", service=DonorService, create_schema=DonorCreate, update_schema=DonorUpdate, write_scope="donations.manage"))
router.include_router(build_crud_router(prefix="/donations", tag="Donations", service=DonationService, create_schema=DonationCreate, update_schema=DonationUpdate, write_scope="donations.manage"))
router.include_router(build_crud_router(prefix="/donation-impacts", tag="Donation Impacts", service=DonationImpactService, create_schema=DonationImpactCreate, update_schema=DonationImpactUpdate, write_scope="donations.manage_metrics"))
router.include_router(build_crud_router(prefix="/donation-stories", tag="Donation Stories", service=DonationStoryService, create_schema=DonationStoryCreate, update_schema=DonationStoryUpdate, write_scope="donations.manage_stories"))
router.include_router(build_crud_router(prefix="/donation-settings", tag="Donation Settings", service=DonationSettingsService, create_schema=DonationSettingsCreate, update_schema=DonationSettingsUpdate, write_scope="donations.manage"))

