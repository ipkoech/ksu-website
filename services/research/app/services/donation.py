"""Donation services."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Donation, DonationImpact, DonationSettings, DonationStory, Donor
from ._crud import CRUDService, build_simple_service

DonorService = build_simple_service(Donor, "display_name", "organization_name", "first_name", "last_name", "email")
DonationSettingsService = build_simple_service(DonationSettings, "key", "setting_type", "description", default_order=("created_at",))
DonationImpactService = build_simple_service(DonationImpact, "title", "summary", "description", "impact_type")
DonationStoryService = build_simple_service(DonationStory, "title", "donor_name", "donor_organization", "summary")


class DonationService(CRUDService):
    model = Donation
    search_fields = ("donation_number", "purpose", "payment_reference", "status")
    default_order = ("created_at",)

    @classmethod
    async def _sync_donor_stats(cls, db: AsyncSession, donor_id):
        result = await db.execute(
            select(
                func.coalesce(func.sum(Donation.amount), 0),
                func.count(Donation.id),
                func.min(Donation.donation_date),
                func.max(Donation.donation_date),
            ).where(
                Donation.deleted_at.is_(None),
                Donation.donor_id == donor_id,
                Donation.status == "completed",
            )
        )
        total_donated, donation_count, first_donation_date, last_donation_date = result.one()
        donor = await Donor.get_or_raise(db, donor_id, error_message="Donor not found")
        donor.total_donated = total_donated
        donor.donation_count = donation_count
        donor.first_donation_date = first_donation_date
        donor.last_donation_date = last_donation_date

    @classmethod
    async def create(cls, db: AsyncSession, data, *, actor_id=None):
        donation = await super().create(db, data, actor_id=actor_id)
        await cls._sync_donor_stats(db, donation.donor_id)
        await db.refresh(donation)
        return donation

    @classmethod
    async def update(cls, db: AsyncSession, item, data, *, actor_id=None):
        donation = await super().update(db, item, data, actor_id=actor_id)
        await cls._sync_donor_stats(db, donation.donor_id)
        await db.refresh(donation)
        return donation

    @classmethod
    async def soft_delete(cls, db: AsyncSession, item, *, actor_id=None):
        donor_id = item.donor_id
        await super().soft_delete(db, item, actor_id=actor_id)
        await cls._sync_donor_stats(db, donor_id)

