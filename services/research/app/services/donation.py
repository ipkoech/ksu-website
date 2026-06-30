"""Donation services."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Any

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Donation, DonationImpact, DonationSettings, DonationStory, Donor
from ._crud import CRUDService, build_simple_service

DonorService = build_simple_service(Donor, "display_name", "organization_name", "first_name", "last_name", "email")
DonationSettingsService = build_simple_service(DonationSettings, "key", "setting_type", "description", default_order=("created_at",))
DonationImpactService = build_simple_service(DonationImpact, "title", "summary", "description", "impact_type")
DonationStoryService = build_simple_service(DonationStory, "title", "donor_name", "donor_organization", "summary")


def _brief(item: Any, *extra_fields: str) -> dict[str, Any]:
    payload = {
        "id": item.id,
        "title": getattr(item, "title", None),
        "name": getattr(item, "name", None),
        "slug": getattr(item, "slug", None),
        "status": getattr(item, "status", None),
        "created_at": getattr(item, "created_at", None),
        "updated_at": getattr(item, "updated_at", None),
    }
    for field in extra_fields:
        payload[field] = getattr(item, field, None)
    return {key: value for key, value in payload.items() if value is not None}


async def _related_many(db: AsyncSession, statement, *extra_fields: str) -> list[dict[str, Any]]:
    result = await db.execute(statement)
    return [_brief(item, *extra_fields) for item in result.scalars().all()]


def _source_conditions(model, source: dict[str, uuid.UUID | None]):
    conditions = []
    for field, value in source.items():
        if value is not None and hasattr(model, field):
            conditions.append(getattr(model, field) == value)
    return conditions


class DonationRelationshipService:
    """Read donation relationships backed by source binding fields."""

    @staticmethod
    async def _ensure_donor(db: AsyncSession, donor_id: uuid.UUID) -> Donor:
        return await Donor.get_or_raise(db, donor_id, error_message="Donor not found")

    @staticmethod
    async def _ensure_impact(db: AsyncSession, impact_id: uuid.UUID) -> DonationImpact:
        return await DonationImpact.get_or_raise(db, impact_id, error_message="Donation impact not found")

    @staticmethod
    async def list_donor_impacts(db: AsyncSession, donor_id: uuid.UUID) -> list[dict[str, Any]]:
        await DonationRelationshipService._ensure_donor(db, donor_id)
        source_result = await db.execute(
            select(
                Donation.project_id,
                Donation.center_id,
                Donation.scholarship_id,
                Donation.fund_id,
            )
            .where(
                Donation.deleted_at.is_(None),
                Donation.donor_id == donor_id,
                Donation.status == "completed",
            )
            .distinct()
        )
        conditions = []
        for project_id, center_id, scholarship_id, fund_id in source_result.all():
            conditions.extend(
                _source_conditions(
                    DonationImpact,
                    {
                        "project_id": project_id,
                        "center_id": center_id,
                        "scholarship_id": scholarship_id,
                        "fund_id": fund_id,
                    },
                )
            )
        if not conditions:
            return []

        return await _related_many(
            db,
            DonationImpact.active_query()
            .where(or_(*conditions))
            .order_by(DonationImpact.reporting_year.desc().nullslast(), DonationImpact.created_at.desc()),
            "impact_type",
            "reporting_year",
            "total_raised",
            "currency",
        )

    @staticmethod
    async def list_impact_donations(db: AsyncSession, impact_id: uuid.UUID) -> list[dict[str, Any]]:
        impact = await DonationRelationshipService._ensure_impact(db, impact_id)
        conditions = _source_conditions(
            Donation,
            {
                "project_id": impact.project_id,
                "center_id": impact.center_id,
                "scholarship_id": impact.scholarship_id,
                "fund_id": impact.fund_id,
            },
        )
        if not conditions:
            return []

        return await _related_many(
            db,
            Donation.active_query()
            .where(or_(*conditions))
            .order_by(Donation.donation_date.desc(), Donation.created_at.desc()),
            "donor_id",
            "amount",
            "currency",
            "donation_type",
            "designation",
            "purpose",
            "donation_date",
        )

    @staticmethod
    async def list_impact_stories(db: AsyncSession, impact_id: uuid.UUID) -> list[dict[str, Any]]:
        impact = await DonationRelationshipService._ensure_impact(db, impact_id)
        conditions = _source_conditions(
            Donation,
            {
                "project_id": impact.project_id,
                "center_id": impact.center_id,
                "scholarship_id": impact.scholarship_id,
                "fund_id": impact.fund_id,
            },
        )
        if not conditions:
            return []

        donor_result = await db.execute(
            select(Donation.donor_id)
            .where(
                Donation.deleted_at.is_(None),
                Donation.status == "completed",
                or_(*conditions),
            )
            .distinct()
        )
        donor_ids = [row[0] for row in donor_result.all() if row[0]]
        if not donor_ids:
            return []

        return await _related_many(
            db,
            DonationStory.active_query()
            .where(DonationStory.donor_id.in_(donor_ids))
            .order_by(DonationStory.is_featured.desc(), DonationStory.created_at.desc()),
            "donor_id",
            "donor_name",
            "donor_organization",
            "is_featured",
        )


class DonationService(CRUDService):
    model = Donation
    search_fields = ("donation_number", "purpose", "payment_reference", "status")
    default_order = ("created_at",)

    @classmethod
    async def summary(cls, db: AsyncSession) -> dict:
        donation_totals = await db.execute(
            select(
                func.coalesce(func.sum(Donation.amount), 0),
                func.count(Donation.id),
            ).where(
                Donation.deleted_at.is_(None),
                Donation.status == "completed",
            )
        )
        total_donations, donation_count = donation_totals.one()

        donor_count = await db.scalar(
            select(func.count(Donor.id)).where(
                Donor.deleted_at.is_(None),
                Donor.is_active.is_(True),
            )
        )
        impact_count = await db.scalar(
            select(func.count(DonationImpact.id)).where(
                DonationImpact.deleted_at.is_(None),
                DonationImpact.is_active.is_(True),
            )
        )
        story_count = await db.scalar(
            select(func.count(DonationStory.id)).where(
                DonationStory.deleted_at.is_(None),
                DonationStory.is_active.is_(True),
                DonationStory.status == "published",
            )
        )
        pending_count = await db.scalar(
            select(func.count(Donation.id)).where(
                Donation.deleted_at.is_(None),
                Donation.status == "pending",
            )
        )

        return {
            "total_donations": total_donations,
            "donation_count": donation_count or 0,
            "donors": donor_count or 0,
            "impact_records": impact_count or 0,
            "stories_published": story_count or 0,
            "pending_donations": pending_count or 0,
        }

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
