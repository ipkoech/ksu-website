"""Innovation pathway endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Body, Depends, HTTPException
from ksu_common.schemas.responses import success
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.auth import get_current_user, require_scope, require_scoped_record
from ...core.database import get_db
from ...schemas import (
    CompetitionEntryStatusAction,
    CompetitionEntryCreate,
    CompetitionEntryUpdate,
    IncubationStageAction,
    IncubationRecordCreate,
    IncubationRecordUpdate,
    MentorAssignmentAction,
    PathwayActionNote,
    StartupStageAction,
    StartupVentureCreate,
    StartupVentureUpdate,
    TechnologyTransferStatusAction,
    TechnologyTransferCaseCreate,
    TechnologyTransferCaseUpdate,
)
from ...services import (
    CompetitionEntryService,
    IncubationRecordService,
    InnovationPathwayAdminActionService,
    InnovationPathwayRelationshipService,
    StartupVentureService,
    TechnologyTransferCaseService,
)
from ._crud import build_crud_router

router = APIRouter()


async def _get_authorized_action_item(
    service,
    item_id: uuid.UUID,
    write_scope: str,
    db: AsyncSession,
    user,
):
    item = await service.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Innovation pathway record not found")
    center_id = getattr(item, "center_id", None)
    if hasattr(service.model, "center_id") or center_id is not None:
        require_scoped_record(user, write_scope, "research", center_id)
    return item


def _include_common_action_routes(prefix: str, service, tag: str, write_scope: str) -> None:
    @router.post(f"{prefix}/id/{{item_id}}/approve", tags=[tag], dependencies=[Depends(require_scope(write_scope))])
    async def approve_item(
        item_id: uuid.UUID,
        data: PathwayActionNote | None = Body(default=None),
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user),
    ):
        await _get_authorized_action_item(service, item_id, write_scope, db, user)
        item = await InnovationPathwayAdminActionService.approve(db, service, item_id, actor_id=user.sub)
        return success(data=item, message=f"{tag.rstrip('s')} approved")

    @router.post(f"{prefix}/id/{{item_id}}/publish", tags=[tag], dependencies=[Depends(require_scope(write_scope))])
    async def publish_item(
        item_id: uuid.UUID,
        data: PathwayActionNote | None = Body(default=None),
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user),
    ):
        await _get_authorized_action_item(service, item_id, write_scope, db, user)
        item = await InnovationPathwayAdminActionService.publish(db, service, item_id, actor_id=user.sub)
        return success(data=item, message=f"{tag.rstrip('s')} published")

    @router.post(f"{prefix}/id/{{item_id}}/unpublish", tags=[tag], dependencies=[Depends(require_scope(write_scope))])
    async def unpublish_item(
        item_id: uuid.UUID,
        data: PathwayActionNote | None = Body(default=None),
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user),
    ):
        await _get_authorized_action_item(service, item_id, write_scope, db, user)
        item = await InnovationPathwayAdminActionService.unpublish(db, service, item_id, actor_id=user.sub)
        return success(data=item, message=f"{tag.rstrip('s')} unpublished")

    @router.post(f"{prefix}/id/{{item_id}}/archive", tags=[tag], dependencies=[Depends(require_scope(write_scope))])
    async def archive_item(
        item_id: uuid.UUID,
        data: PathwayActionNote | None = Body(default=None),
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user),
    ):
        await _get_authorized_action_item(service, item_id, write_scope, db, user)
        item = await InnovationPathwayAdminActionService.archive(db, service, item_id, actor_id=user.sub)
        return success(data=item, message=f"{tag.rstrip('s')} archived")

    @router.post(f"{prefix}/id/{{item_id}}/feature", tags=[tag], dependencies=[Depends(require_scope(write_scope))])
    async def feature_item(
        item_id: uuid.UUID,
        data: PathwayActionNote | None = Body(default=None),
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user),
    ):
        await _get_authorized_action_item(service, item_id, write_scope, db, user)
        item = await InnovationPathwayAdminActionService.set_featured(db, service, item_id, True, actor_id=user.sub)
        return success(data=item, message=f"{tag.rstrip('s')} featured")

    @router.post(f"{prefix}/id/{{item_id}}/unfeature", tags=[tag], dependencies=[Depends(require_scope(write_scope))])
    async def unfeature_item(
        item_id: uuid.UUID,
        data: PathwayActionNote | None = Body(default=None),
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user),
    ):
        await _get_authorized_action_item(service, item_id, write_scope, db, user)
        item = await InnovationPathwayAdminActionService.set_featured(db, service, item_id, False, actor_id=user.sub)
        return success(data=item, message=f"{tag.rstrip('s')} unfeatured")


@router.get("/innovations/id/{innovation_id}/startups", tags=["Innovations"])
async def list_innovation_startups(innovation_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await InnovationPathwayRelationshipService.list_startups(db, innovation_id))


@router.get("/innovations/id/{innovation_id}/incubation-records", tags=["Innovations"])
async def list_innovation_incubation_records(innovation_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await InnovationPathwayRelationshipService.list_incubation_records(db, innovation_id))


@router.get("/innovations/id/{innovation_id}/competition-entries", tags=["Innovations"])
async def list_innovation_competition_entries(innovation_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await InnovationPathwayRelationshipService.list_competition_entries(db, innovation_id))


@router.get("/innovations/id/{innovation_id}/technology-transfer-cases", tags=["Innovations"])
async def list_innovation_technology_transfer_cases(innovation_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return success(data=await InnovationPathwayRelationshipService.list_technology_transfer_cases(db, innovation_id))


_include_common_action_routes("/startups", StartupVentureService, "Startup Ventures", "innovation.manage_startups")
_include_common_action_routes("/incubation-records", IncubationRecordService, "Incubation Records", "innovation.manage_startups")
_include_common_action_routes("/competition-entries", CompetitionEntryService, "Competition Entries", "innovation.manage_competitions")
_include_common_action_routes(
    "/technology-transfer-cases",
    TechnologyTransferCaseService,
    "Technology Transfer Cases",
    "innovation.manage_transfers",
)


@router.post("/startups/id/{item_id}/stage", tags=["Startup Ventures"], dependencies=[Depends(require_scope("innovation.manage_startups"))])
async def set_startup_stage(
    item_id: uuid.UUID,
    data: StartupStageAction,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    await _get_authorized_action_item(StartupVentureService, item_id, "innovation.manage_startups", db, user)
    updates = {
        "venture_stage": data.venture_stage,
        "registration_status": data.registration_status,
        "status": data.status,
    }
    item = await InnovationPathwayAdminActionService.apply_updates(
        db,
        StartupVentureService,
        item_id,
        updates,
        actor_id=user.sub,
    )
    return success(data=item, message="Startup venture stage updated")


@router.post("/incubation-records/id/{item_id}/stage", tags=["Incubation Records"], dependencies=[Depends(require_scope("innovation.manage_startups"))])
async def set_incubation_stage(
    item_id: uuid.UUID,
    data: IncubationStageAction,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    await _get_authorized_action_item(IncubationRecordService, item_id, "innovation.manage_startups", db, user)
    item = await InnovationPathwayAdminActionService.apply_updates(
        db,
        IncubationRecordService,
        item_id,
        {"stage": data.stage, "status": data.status},
        actor_id=user.sub,
    )
    return success(data=item, message="Incubation stage updated")


@router.post("/incubation-records/id/{item_id}/assign-mentors", tags=["Incubation Records"], dependencies=[Depends(require_scope("innovation.manage_startups"))])
async def assign_incubation_mentors(
    item_id: uuid.UUID,
    data: MentorAssignmentAction,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    await _get_authorized_action_item(IncubationRecordService, item_id, "innovation.manage_startups", db, user)
    item = await InnovationPathwayAdminActionService.assign_mentors(
        db,
        item_id,
        data.mentor_ids,
        actor_id=user.sub,
    )
    return success(data=item, message="Incubation mentors assigned")


@router.post("/competition-entries/id/{item_id}/entry-status", tags=["Competition Entries"], dependencies=[Depends(require_scope("innovation.manage_competitions"))])
async def set_competition_entry_status(
    item_id: uuid.UUID,
    data: CompetitionEntryStatusAction,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    await _get_authorized_action_item(CompetitionEntryService, item_id, "innovation.manage_competitions", db, user)
    item = await InnovationPathwayAdminActionService.apply_updates(
        db,
        CompetitionEntryService,
        item_id,
        {
            "entry_status": data.entry_status,
            "award": data.award,
            "position": data.position,
            "status": data.status,
        },
        actor_id=user.sub,
    )
    return success(data=item, message="Competition entry status updated")


@router.post("/technology-transfer-cases/id/{item_id}/transfer-status", tags=["Technology Transfer Cases"], dependencies=[Depends(require_scope("innovation.manage_transfers"))])
async def set_technology_transfer_status(
    item_id: uuid.UUID,
    data: TechnologyTransferStatusAction,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    await _get_authorized_action_item(TechnologyTransferCaseService, item_id, "innovation.manage_transfers", db, user)
    item = await InnovationPathwayAdminActionService.apply_updates(
        db,
        TechnologyTransferCaseService,
        item_id,
        {
            "transfer_status": data.transfer_status,
            "case_type": data.case_type,
            "status": data.status,
        },
        actor_id=user.sub,
    )
    return success(data=item, message="Technology transfer status updated")


router.include_router(
    build_crud_router(
        prefix="/startups",
        tag="Startup Ventures",
        service=StartupVentureService,
        create_schema=StartupVentureCreate,
        update_schema=StartupVentureUpdate,
        write_scope="innovation.manage_startups",
    )
)
router.include_router(
    build_crud_router(
        prefix="/incubation-records",
        tag="Incubation Records",
        service=IncubationRecordService,
        create_schema=IncubationRecordCreate,
        update_schema=IncubationRecordUpdate,
        write_scope="innovation.manage_startups",
    )
)
router.include_router(
    build_crud_router(
        prefix="/competition-entries",
        tag="Competition Entries",
        service=CompetitionEntryService,
        create_schema=CompetitionEntryCreate,
        update_schema=CompetitionEntryUpdate,
        write_scope="innovation.manage_competitions",
    )
)
router.include_router(
    build_crud_router(
        prefix="/technology-transfer-cases",
        tag="Technology Transfer Cases",
        service=TechnologyTransferCaseService,
        create_schema=TechnologyTransferCaseCreate,
        update_schema=TechnologyTransferCaseUpdate,
        write_scope="innovation.manage_transfers",
    )
)
