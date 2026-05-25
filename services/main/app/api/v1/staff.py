"""Staff assignment endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope
from ...models import StaffAssignment
from ...models.staff import ENTITY_ROLES
from ...schemas import (
    StaffAssignmentActivate,
    StaffAssignmentConflictCheck,
    StaffAssignmentCreate,
    StaffAssignmentEnd,
    StaffAssignmentReassign,
    StaffAssignmentUpdate,
)
from ...services import StaffService
from ._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()


CONTROL_FIELDS = {"conflict_resolution", "conflict_end_date", "conflict_notes"}


async def _prepare_conflict_or_raise(
    db: DbSession,
    *,
    entity_type: str,
    entity_id: uuid.UUID | None,
    role: str,
    exclude_assignment_id: uuid.UUID | None = None,
    is_acting: bool = False,
    resolution: str | None = None,
    end_date=None,
    notes: str | None = None,
) -> bool:
    conflict = await StaffService.check_position_conflict(
        db,
        entity_type,
        entity_id,
        role,
        exclude_assignment_id=exclude_assignment_id,
    )
    if conflict is None or is_acting:
        return False
    if resolution == "assign_acting":
        return True
    handled = await StaffService.resolve_conflict(
        db,
        conflict,
        resolution=resolution,
        end_date=end_date,
        notes=notes,
    )
    if handled:
        return False
    payload = await StaffService.get_conflict_payload(
        db,
        entity_type=entity_type,
        entity_id=entity_id,
        role=role,
        exclude_assignment_id=exclude_assignment_id,
    )
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=payload)


@router.get("/assignments")
async def list_assignments(
    db: DbSession,
    _: CurrentUser,
    entity_type: str | None = None,
    entity_id: uuid.UUID | None = None,
    person_id: uuid.UUID | None = None,
    status_filter: str = Query("active", alias="status", pattern="^(active|ended|inactive|pending|all)$"),
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(StaffAssignment, fields)
    items = await StaffService.list_assignments(
        db,
        person_id=person_id,
        entity_type=entity_type,
        entity_id=entity_id,
        status=status_filter,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(items))


@router.post("/assignments/check-conflict")
async def check_conflict(data: StaffAssignmentConflictCheck, db: DbSession, _: CurrentUser):
    payload = await StaffService.get_conflict_payload(
        db,
        entity_type=data.entity_type,
        entity_id=data.entity_id,
        role=data.role,
        exclude_assignment_id=data.exclude_assignment_id,
    )
    return success(data=payload)


@router.get("/assignments/{assignment_id}")
async def get_assignment(assignment_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(StaffAssignment, fields)
    assignment = await StaffService.get_by_id(db, assignment_id, load_options=selector.load_options)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return success(data=selector.apply(assignment))


@router.get("/assignments/{assignment_id}/reporting-chain")
async def get_reporting_chain(assignment_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(StaffAssignment, fields)
    chain = await StaffService.get_reporting_chain(db, assignment_id, load_options=selector.load_options)
    return success(data=selector.apply(chain))


@router.get("/assignments/{assignment_id}/direct-reports")
async def get_direct_reports(assignment_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(StaffAssignment, fields)
    reports = await StaffService.get_direct_reports(db, assignment_id, load_options=selector.load_options)
    return success(data=selector.apply(reports))


@router.post("/assignments", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("staff:write"))])
async def create_assignment(data: StaffAssignmentCreate, db: DbSession, _: CurrentUser):
    payload = data.model_dump()
    resolution = payload.pop("conflict_resolution", None)
    conflict_end_date = payload.pop("conflict_end_date", None)
    conflict_notes = payload.pop("conflict_notes", None)
    force_acting = await _prepare_conflict_or_raise(
        db,
        entity_type=payload["entity_type"],
        entity_id=payload.get("entity_id"),
        role=payload["role"],
        is_acting=payload.get("is_acting", False),
        resolution=resolution,
        end_date=conflict_end_date,
        notes=conflict_notes,
    )
    if force_acting:
        payload["is_acting"] = True
    assignment = await StaffService.assign(db, **payload)
    return success(data=assignment, message="Assignment created")


@router.patch("/assignments/{assignment_id}", dependencies=[Depends(require_scope("staff:write"))])
async def update_assignment(assignment_id: uuid.UUID, data: StaffAssignmentUpdate, db: DbSession, _: CurrentUser):
    assignment = await StaffService.get_by_id(db, assignment_id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")

    payload = data.model_dump(exclude_unset=True)
    resolution = payload.pop("conflict_resolution", None)
    conflict_end_date = payload.pop("conflict_end_date", None)
    conflict_notes = payload.pop("conflict_notes", None)
    next_entity_type = payload.get("entity_type", assignment.entity_type)
    next_entity_id = payload.get("entity_id", assignment.entity_id)
    next_role = payload.get("role", assignment.role)
    next_is_acting = payload.get("is_acting", assignment.is_acting)
    next_status = payload.get("status", assignment.status)
    if next_status == "active":
        force_acting = await _prepare_conflict_or_raise(
            db,
            entity_type=next_entity_type,
            entity_id=next_entity_id,
            role=next_role,
            exclude_assignment_id=assignment.id,
            is_acting=next_is_acting,
            resolution=resolution,
            end_date=conflict_end_date,
            notes=conflict_notes,
        )
        if force_acting:
            payload["is_acting"] = True
    assignment = await StaffService.update(db, assignment, **payload)
    return success(data=assignment, message="Assignment updated")


@router.patch("/assignments/{assignment_id}/end", dependencies=[Depends(require_scope("staff:write"))])
async def end_assignment(assignment_id: uuid.UUID, data: StaffAssignmentEnd, db: DbSession, _: CurrentUser):
    try:
        assignment = await StaffService.end_assignment(db, assignment_id, end_date=data.end_date, notes=data.notes)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return success(data=assignment, message="Assignment ended")


@router.patch("/assignments/{assignment_id}/activate", dependencies=[Depends(require_scope("staff:write"))])
async def activate_assignment(assignment_id: uuid.UUID, data: StaffAssignmentActivate, db: DbSession, _: CurrentUser):
    assignment = await StaffService.get_by_id(db, assignment_id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    force_acting = await _prepare_conflict_or_raise(
        db,
        entity_type=assignment.entity_type,
        entity_id=assignment.entity_id,
        role=assignment.role,
        exclude_assignment_id=assignment.id,
        is_acting=assignment.is_acting,
        resolution=data.conflict_resolution,
        end_date=data.conflict_end_date,
        notes=data.conflict_notes,
    )
    if force_acting:
        assignment.is_acting = True
    assignment = await StaffService.activate_assignment(db, assignment, start_date=data.start_date, notes=data.notes)
    return success(data=assignment, message="Assignment activated")


@router.post("/assignments/{assignment_id}/reassign", dependencies=[Depends(require_scope("staff:write"))])
async def reassign_assignment(assignment_id: uuid.UUID, data: StaffAssignmentReassign, db: DbSession, _: CurrentUser):
    assignment = await StaffService.get_by_id(db, assignment_id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    force_acting = await _prepare_conflict_or_raise(
        db,
        entity_type=assignment.entity_type,
        entity_id=assignment.entity_id,
        role=assignment.role,
        exclude_assignment_id=assignment.id,
        is_acting=assignment.is_acting,
        resolution=data.conflict_resolution,
        end_date=data.conflict_end_date,
        notes=data.conflict_notes,
    )
    if force_acting:
        assignment.is_acting = True
    replacement = await StaffService.reassign_assignment(
        db,
        assignment,
        person_id=data.person_id,
        title=data.title,
        start_date=data.start_date,
        end_previous_date=data.end_previous_date,
        notes=data.notes,
    )
    return success(data=replacement, message="Assignment reassigned")


@router.delete("/assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("staff:delete"))])
async def delete_assignment(assignment_id: uuid.UUID, db: DbSession, _: CurrentUser):
    assignment = await StaffService.get_by_id(db, assignment_id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    await StaffService.delete_assignment(db, assignment)


@router.get("/entities")
async def list_staff_entities(
    db: DbSession,
    _: CurrentUser,
    entity_type: str,
    search: str | None = None,
    limit: int = Query(20, ge=1, le=100),
):
    items = await StaffService.search_entities(db, entity_type=entity_type, search=search, limit=limit)
    return success(data=items)


@router.get("/entity-types")
async def list_entity_types(_: CurrentUser):
    """List all entity types with their available roles."""
    labels = {
        "university": ("University", "University-level positions"),
        "division": ("Division", "Major divisions headed by DVCs"),
        "wing": ("Wing", "Administrative wings"),
        "school": ("School/Faculty", "Academic schools and faculties"),
        "department": ("Department", "Academic and administrative departments"),
        "board": ("Board", "Governance boards"),
        "committee": ("Committee", "Standing or ad-hoc committees"),
        "library": ("Library", "Library units"),
        "directorate": ("Directorate", "Directorates and centers"),
        "research": ("Research", "Research units"),
    }
    data = [
        {
            "type": entity_type,
            "label": labels.get(entity_type, (entity_type.title(), ""))[0],
            "description": labels.get(entity_type, (entity_type.title(), ""))[1],
            "roles": roles,
        }
        for entity_type, roles in ENTITY_ROLES.items()
    ]
    return success(data=data)


@router.get("/roles")
async def list_roles(_: CurrentUser, entity_type: str | None = None):
    """List roles, optionally filtered by entity type."""
    return success(data=StaffService.roles_for_entity(entity_type))


@router.get("/academic-ranks")
async def list_academic_ranks(_: CurrentUser):
    """List all academic ranks in order."""
    return success(data=[
        {"rank": "professor", "label": "Professor", "order": 1},
        {"rank": "associate_professor", "label": "Associate Professor", "order": 2},
        {"rank": "senior_lecturer", "label": "Senior Lecturer", "order": 3},
        {"rank": "lecturer", "label": "Lecturer", "order": 4},
        {"rank": "assistant_lecturer", "label": "Assistant Lecturer", "order": 5},
        {"rank": "tutorial_fellow", "label": "Tutorial Fellow", "order": 6},
        {"rank": "graduate_assistant", "label": "Graduate Assistant", "order": 7},
    ])
