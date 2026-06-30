"""Donation endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Request, status
from ksu_common import rate_limit
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...core.auth import require_scope
from ...schemas import (
    DonationCreate,
    DonationImpactCreate,
    DonationImpactUpdate,
    DonationSettingsCreate,
    DonationSettingsUpdate,
    DonationStoryCreate,
    DonationStoryUpdate,
    DonationUpdate,
    DonorCreate,
    DonorUpdate,
    PublicDonationSubmission,
    PublicDonationSubmissionRead,
)
from ...services import DonationImpactService, DonationRelationshipService, DonationService, DonationSettingsService, DonationStoryService, DonorService
from ._crud import build_crud_router

router = APIRouter()


@router.post("/donations/submit", status_code=status.HTTP_201_CREATED, tags=["Donations"])
@rate_limit(requests=5, window=60, by_user=False)
async def submit_public_donation(
    request: Request,
    data: PublicDonationSubmission,
    db: AsyncSession = Depends(get_db),
):
    donation = await DonationService.create_public_submission(db, data)
    return success(
        data=PublicDonationSubmissionRead(
            donation_id=donation.id,
            donor_id=donation.donor_id,
            status=donation.status,
            amount=donation.amount,
            currency=donation.currency,
            donation_type=donation.donation_type,
            designation=donation.designation,
            payment_method=donation.payment_method,
        ),
        message="Donation submission received",
    )


@router.get("/donations/summary", tags=["Donations"], dependencies=[Depends(require_scope("donations.manage"))])
async def get_donation_summary(db: AsyncSession = Depends(get_db)):
    return success(data=await DonationService.summary(db))


@router.get("/donors/id/{donor_id}/impacts", tags=["Donors"], dependencies=[Depends(require_scope("donations.manage"))])
async def list_donor_impacts(donor_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await DonationRelationshipService.list_donor_impacts(db, donor_id))


@router.get("/donation-impacts/id/{impact_id}/donations", tags=["Donation Impacts"], dependencies=[Depends(require_scope("donations.manage"))])
async def list_impact_donations(impact_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await DonationRelationshipService.list_impact_donations(db, impact_id))


router.include_router(
    build_crud_router(
        prefix="/donors",
        tag="Donors",
        service=DonorService,
        create_schema=DonorCreate,
        update_schema=DonorUpdate,
        write_scope="donations.manage",
        public_read=False,
    )
)
router.include_router(
    build_crud_router(
        prefix="/donations",
        tag="Donations",
        service=DonationService,
        create_schema=DonationCreate,
        update_schema=DonationUpdate,
        write_scope="donations.manage",
        public_read=False,
    )
)
router.include_router(
    build_crud_router(
        prefix="/donation-impacts",
        tag="Donation Impacts",
        service=DonationImpactService,
        create_schema=DonationImpactCreate,
        update_schema=DonationImpactUpdate,
        write_scope="donations.manage_metrics",
    )
)
router.include_router(
    build_crud_router(
        prefix="/donation-stories",
        tag="Donation Stories",
        service=DonationStoryService,
        create_schema=DonationStoryCreate,
        update_schema=DonationStoryUpdate,
        write_scope="donations.manage_stories",
    )
)
router.include_router(
    build_crud_router(
        prefix="/donation-settings",
        tag="Donation Settings",
        service=DonationSettingsService,
        create_schema=DonationSettingsCreate,
        update_schema=DonationSettingsUpdate,
        write_scope="donations.manage",
        public_read=False,
    )
)
