"""Services for innovation pathway records."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    IncubationRecord,
    Innovation,
    InnovationCompetitionEntry,
    StartupVenture,
    TechnologyTransferCase,
)
from ._crud import build_simple_service


StartupVentureService = build_simple_service(
    StartupVenture,
    "name",
    "code",
    "summary",
    "sector",
    "venture_stage",
    reference_fields={"lead_founder_id": "persons"},
)
IncubationRecordService = build_simple_service(
    IncubationRecord,
    "title",
    "code",
    "program_name",
    "cohort",
    "support_received",
    "outcomes",
)
CompetitionEntryService = build_simple_service(
    InnovationCompetitionEntry,
    "title",
    "code",
    "competition_name",
    "organizer_name",
    "award",
)
TechnologyTransferCaseService = build_simple_service(
    TechnologyTransferCase,
    "title",
    "code",
    "ip_reference",
    "agreement_reference",
    "summary",
    reference_fields={"lead_officer_id": "persons"},
)


class InnovationPathwayAdminActionService:
    """Apply authenticated workflow actions to innovation pathway records."""

    @staticmethod
    async def apply_updates(
        db: AsyncSession,
        service,
        item_id: uuid.UUID,
        updates: dict[str, Any],
        *,
        actor_id: str | uuid.UUID | None = None,
    ):
        item = await service.get_by_id(db, item_id)
        if item is None:
            return None
        for field_name, value in updates.items():
            if value is not None and hasattr(item, field_name):
                setattr(item, field_name, value)
        await db.flush()
        await db.refresh(item)
        return item

    @staticmethod
    async def approve(db: AsyncSession, service, item_id: uuid.UUID, *, actor_id: str | uuid.UUID | None = None):
        return await InnovationPathwayAdminActionService.apply_updates(
            db,
            service,
            item_id,
            {"status": "active", "is_active": True},
            actor_id=actor_id,
        )

    @staticmethod
    async def publish(db: AsyncSession, service, item_id: uuid.UUID, *, actor_id: str | uuid.UUID | None = None):
        return await InnovationPathwayAdminActionService.apply_updates(
            db,
            service,
            item_id,
            {"status": "active", "is_active": True, "is_public": True},
            actor_id=actor_id,
        )

    @staticmethod
    async def unpublish(db: AsyncSession, service, item_id: uuid.UUID, *, actor_id: str | uuid.UUID | None = None):
        return await InnovationPathwayAdminActionService.apply_updates(
            db,
            service,
            item_id,
            {"is_public": False},
            actor_id=actor_id,
        )

    @staticmethod
    async def archive(db: AsyncSession, service, item_id: uuid.UUID, *, actor_id: str | uuid.UUID | None = None):
        return await InnovationPathwayAdminActionService.apply_updates(
            db,
            service,
            item_id,
            {"status": "archived", "is_active": False, "is_public": False, "is_featured": False},
            actor_id=actor_id,
        )

    @staticmethod
    async def set_featured(
        db: AsyncSession,
        service,
        item_id: uuid.UUID,
        featured: bool,
        *,
        actor_id: str | uuid.UUID | None = None,
    ):
        return await InnovationPathwayAdminActionService.apply_updates(
            db,
            service,
            item_id,
            {"is_featured": featured},
            actor_id=actor_id,
        )

    @staticmethod
    async def assign_mentors(
        db: AsyncSession,
        item_id: uuid.UUID,
        mentor_ids: list[uuid.UUID],
        *,
        actor_id: str | uuid.UUID | None = None,
    ):
        return await InnovationPathwayAdminActionService.apply_updates(
            db,
            IncubationRecordService,
            item_id,
            {"mentor_ids": [str(mentor_id) for mentor_id in mentor_ids]},
            actor_id=actor_id,
        )


def _brief(item: Any, *extra_fields: str) -> dict[str, Any]:
    payload = {
        "id": item.id,
        "title": getattr(item, "title", None),
        "name": getattr(item, "name", None),
        "slug": getattr(item, "slug", None),
        "status": getattr(item, "status", None),
        "is_featured": getattr(item, "is_featured", None),
        "created_at": getattr(item, "created_at", None),
        "updated_at": getattr(item, "updated_at", None),
    }
    for field in extra_fields:
        payload[field] = getattr(item, field, None)
    return {key: value for key, value in payload.items() if value is not None}


async def _related_many(db: AsyncSession, statement, *extra_fields: str) -> list[dict[str, Any]]:
    result = await db.execute(statement)
    return [_brief(item, *extra_fields) for item in result.scalars().all()]


class InnovationPathwayRelationshipService:
    """Read innovation-scoped pathway records."""

    @staticmethod
    async def _ensure_innovation(db: AsyncSession, innovation_id: uuid.UUID) -> Innovation:
        return await Innovation.get_or_raise(db, innovation_id, error_message="Innovation not found")

    @staticmethod
    async def list_startups(db: AsyncSession, innovation_id: uuid.UUID) -> list[dict[str, Any]]:
        await InnovationPathwayRelationshipService._ensure_innovation(db, innovation_id)
        return await _related_many(
            db,
            StartupVenture.active_query()
            .where(
                StartupVenture.innovation_id == innovation_id,
                StartupVenture.is_active.is_(True),
                StartupVenture.is_public.is_(True),
            )
            .order_by(StartupVenture.display_order.asc(), StartupVenture.created_at.desc()),
            "code",
            "venture_stage",
            "registration_status",
            "sector",
            "partner_id",
        )

    @staticmethod
    async def list_incubation_records(db: AsyncSession, innovation_id: uuid.UUID) -> list[dict[str, Any]]:
        await InnovationPathwayRelationshipService._ensure_innovation(db, innovation_id)
        return await _related_many(
            db,
            IncubationRecord.active_query()
            .where(
                IncubationRecord.innovation_id == innovation_id,
                IncubationRecord.is_active.is_(True),
                IncubationRecord.is_public.is_(True),
            )
            .order_by(IncubationRecord.display_order.asc(), IncubationRecord.created_at.desc()),
            "code",
            "program_name",
            "cohort",
            "incubation_type",
            "stage",
            "startup_id",
            "partner_id",
        )

    @staticmethod
    async def list_competition_entries(db: AsyncSession, innovation_id: uuid.UUID) -> list[dict[str, Any]]:
        await InnovationPathwayRelationshipService._ensure_innovation(db, innovation_id)
        return await _related_many(
            db,
            InnovationCompetitionEntry.active_query()
            .where(
                InnovationCompetitionEntry.innovation_id == innovation_id,
                InnovationCompetitionEntry.is_active.is_(True),
                InnovationCompetitionEntry.is_public.is_(True),
            )
            .order_by(
                InnovationCompetitionEntry.event_date.desc().nullslast(),
                InnovationCompetitionEntry.display_order.asc(),
            ),
            "code",
            "entry_type",
            "competition_name",
            "entry_status",
            "event_date",
            "award",
            "startup_id",
            "partner_id",
        )

    @staticmethod
    async def list_technology_transfer_cases(db: AsyncSession, innovation_id: uuid.UUID) -> list[dict[str, Any]]:
        await InnovationPathwayRelationshipService._ensure_innovation(db, innovation_id)
        return await _related_many(
            db,
            TechnologyTransferCase.active_query()
            .where(
                TechnologyTransferCase.innovation_id == innovation_id,
                TechnologyTransferCase.is_active.is_(True),
                TechnologyTransferCase.is_public.is_(True),
            )
            .order_by(
                TechnologyTransferCase.agreement_date.desc().nullslast(),
                TechnologyTransferCase.display_order.asc(),
            ),
            "code",
            "case_type",
            "transfer_status",
            "agreement_date",
            "ip_reference",
            "partner_id",
        )
