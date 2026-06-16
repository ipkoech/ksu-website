"""Donation services."""

from __future__ import annotations

from datetime import date

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

    @staticmethod
    def _public_display_name(payload: dict) -> str | None:
        if payload.get("is_anonymous"):
            return "Anonymous Donor"
        if payload.get("display_name"):
            return payload["display_name"]
        if payload.get("organization_name"):
            return payload["organization_name"]
        full_name = " ".join(
            part for part in (payload.get("first_name"), payload.get("last_name")) if part
        ).strip()
        return full_name or None

    @classmethod
    async def create_public_submission(cls, db: AsyncSession, data):
        payload = data.model_dump(exclude_unset=True) if hasattr(data, "model_dump") else dict(data)
        donor = Donor(
            donor_type=payload.get("donor_type", "individual"),
            first_name=payload.get("first_name"),
            last_name=payload.get("last_name"),
            organization_name=payload.get("organization_name"),
            organization_type=payload.get("organization_type"),
            display_name=cls._public_display_name(payload),
            is_anonymous=payload.get("is_anonymous", False),
            email=payload.get("email"),
            phone=payload.get("phone"),
            city=payload.get("city"),
            country=payload.get("country"),
            interests=payload.get("interests"),
            is_active=True,
        )
        db.add(donor)
        await db.flush()

        donation = Donation(
            donor_id=donor.id,
            amount=payload["amount"],
            currency=payload.get("currency", "KES"),
            donation_type=payload.get("donation_type", "one_time"),
            designation=payload.get("designation", "unrestricted"),
            purpose=payload.get("purpose"),
            fund_id=payload.get("fund_id"),
            project_id=payload.get("project_id"),
            center_id=payload.get("center_id"),
            scholarship_id=payload.get("scholarship_id"),
            payment_method=payload.get("preferred_payment_method"),
            donation_date=date.today(),
            message=payload.get("message"),
            dedication=payload.get("dedication"),
            is_tribute=payload.get("is_tribute", False),
            tribute_type=payload.get("tribute_type"),
            tribute_name=payload.get("tribute_name"),
            is_public=payload.get("recognition_public", False),
            status="pending",
        )
        db.add(donation)
        await db.flush()
        await db.refresh(donor)
        await db.refresh(donation)
        return donation

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
