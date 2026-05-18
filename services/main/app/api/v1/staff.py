"""Staff assignment endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope
from ...models import StaffAssignment
from ...schemas import StaffAssignmentCreate, StaffAssignmentUpdate
from ...services import StaffService
from ._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()


@router.get("/assignments")
async def list_assignments(
    db: DbSession,
    _: CurrentUser,
    entity_type: str | None = None,
    entity_id: uuid.UUID | None = None,
    person_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(StaffAssignment, fields)
    if person_id:
        items = await StaffService.get_assignments_for_person(db, person_id, load_options=selector.load_options)
    elif entity_type and entity_id:
        items = await StaffService.get_assignments_for_entity(db, entity_type, entity_id, load_options=selector.load_options)
    else:
        raise HTTPException(status_code=400, detail="Provide either person_id or entity_type with entity_id")
    return success(data=selector.apply(items))


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
    conflict = await StaffService.check_position_conflict(db, data.entity_type, data.entity_id, data.role)
    if conflict and not data.is_acting:
        raise HTTPException(status_code=409, detail=f"Position {data.role} is already filled")
    assignment = await StaffService.assign(db, **data.model_dump())
    return success(data=assignment, message="Assignment created")


@router.patch("/assignments/{assignment_id}", dependencies=[Depends(require_scope("staff:write"))])
async def update_assignment(assignment_id: uuid.UUID, data: StaffAssignmentUpdate, db: DbSession, _: CurrentUser):
    assignment = await StaffService.get_by_id(db, assignment_id)
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    assignment = await StaffService.update(db, assignment, **data.model_dump(exclude_unset=True))
    return success(data=assignment, message="Assignment updated")


@router.patch("/assignments/{assignment_id}/end", dependencies=[Depends(require_scope("staff:write"))])
async def end_assignment(assignment_id: uuid.UUID, db: DbSession, _: CurrentUser):
    assignment = await StaffService.end_assignment(db, assignment_id)
    return success(data=assignment, message="Assignment ended")


@router.post("/assignments/check-conflict")
async def check_conflict(
    db: DbSession,
    _: CurrentUser,
    entity_type: str,
    entity_id: uuid.UUID | None = None,
    role: str = "",
    exclude_assignment_id: uuid.UUID | None = None,
):
    conflict = await StaffService.check_position_conflict(
        db, entity_type, entity_id, role, exclude_assignment_id
    )
    if conflict:
        return success(data={
            "has_conflict": True,
            "current_holder": {
                "assignment_id": str(conflict.id),
                "person_id": str(conflict.person_id),
                "person_name": conflict.person.full_name if conflict.person else None,
                "start_date": conflict.start_date.isoformat() if conflict.start_date else None,
                "is_acting": conflict.is_acting,
            }
        })
    return success(data={"has_conflict": False, "current_holder": None})


@router.get("/entity-types")
async def list_entity_types(_: CurrentUser):
    """List all entity types with their available roles."""
    return success(data=[
        {
            "type": "university",
            "label": "University",
            "description": "University-level positions (VC)",
            "roles": ["vc", "vice_chancellor", "chancellor", "council_member"]
        },
        {
            "type": "division",
            "label": "Division",
            "description": "Major divisions headed by DVCs",
            "roles": ["dvc", "deputy_vice_chancellor", "dvc_arsa", "dvc_apf"]
        },
        {
            "type": "wing",
            "label": "Wing",
            "description": "Administrative wings",
            "roles": ["registrar", "registrar_academic", "registrar_admin", "finance_officer", "director", "deputy_registrar"]
        },
        {
            "type": "school",
            "label": "School/Faculty",
            "description": "Academic schools and faculties",
            "roles": ["dean", "deputy_dean", "coordinator", "program_coordinator", "admin", "senior_admin", "staff"]
        },
        {
            "type": "department",
            "label": "Department",
            "description": "Academic departments",
            "roles": ["hod", "head", "cod", "deputy_hod", "section_head", "coordinator", "professor", "associate_professor", "senior_lecturer", "lecturer", "assistant_lecturer", "tutorial_fellow", "graduate_assistant", "admin", "technician", "officer", "assistant", "staff"]
        },
        {
            "type": "board",
            "label": "Board",
            "description": "Governance boards",
            "roles": ["chairperson", "council_chair", "vice_chairperson", "board_secretary", "secretary", "member", "council_member", "ex_officio", "student_rep", "staff_rep"]
        },
        {
            "type": "committee",
            "label": "Committee",
            "description": "Standing or ad-hoc committees",
            "roles": ["chairperson", "vice_chairperson", "secretary", "member", "ex_officio", "convenor"]
        },
        {
            "type": "library",
            "label": "Library",
            "description": "Library units",
            "roles": ["librarian", "deputy_librarian", "senior_officer", "officer", "admin", "assistant", "staff"]
        },
        {
            "type": "directorate",
            "label": "Directorate",
            "description": "Directorates and centers",
            "roles": ["director", "deputy_director", "manager", "coordinator", "officer", "admin", "staff"]
        },
        {
            "type": "research",
            "label": "Research",
            "description": "Research units",
            "roles": ["director", "deputy_director", "manager", "coordinator", "project_coordinator", "researcher", "senior_researcher", "admin", "officer", "staff"]
        },
    ])


@router.get("/roles")
async def list_roles(
    _: CurrentUser,
    entity_type: str | None = None,
):
    """List roles, optionally filtered by entity type."""
    all_roles = [
        {"role": "vc", "label": "Vice Chancellor", "hierarchy_level": 2, "is_unique": True},
        {"role": "vice_chancellor", "label": "Vice Chancellor", "hierarchy_level": 2, "is_unique": True},
        {"role": "council_member", "label": "Council Member", "hierarchy_level": 2, "is_unique": False},
        {"role": "dvc", "label": "Deputy Vice Chancellor", "hierarchy_level": 3, "is_unique": True},
        {"role": "deputy_vice_chancellor", "label": "Deputy Vice Chancellor", "hierarchy_level": 3, "is_unique": True},
        {"role": "registrar", "label": "Registrar", "hierarchy_level": 4, "is_unique": True},
        {"role": "registrar_academic", "label": "Registrar (Academic)", "hierarchy_level": 4, "is_unique": True},
        {"role": "registrar_admin", "label": "Registrar (Admin)", "hierarchy_level": 4, "is_unique": True},
        {"role": "finance_officer", "label": "Finance Officer", "hierarchy_level": 4, "is_unique": True},
        {"role": "dean", "label": "Dean", "hierarchy_level": 5, "is_unique": True},
        {"role": "director", "label": "Director", "hierarchy_level": 5, "is_unique": True},
        {"role": "librarian", "label": "Librarian", "hierarchy_level": 5, "is_unique": True},
        {"role": "deputy_director", "label": "Deputy Director", "hierarchy_level": 6, "is_unique": False},
        {"role": "deputy_dean", "label": "Deputy Dean", "hierarchy_level": 6, "is_unique": False},
        {"role": "deputy_librarian", "label": "Deputy Librarian", "hierarchy_level": 6, "is_unique": False},
        {"role": "deputy_registrar", "label": "Deputy Registrar", "hierarchy_level": 6, "is_unique": False},
        {"role": "manager", "label": "Manager", "hierarchy_level": 6, "is_unique": False},
        {"role": "hod", "label": "Head of Department", "hierarchy_level": 7, "is_unique": True},
        {"role": "head", "label": "Head", "hierarchy_level": 7, "is_unique": True},
        {"role": "cod", "label": "Chair of Department", "hierarchy_level": 7, "is_unique": True},
        {"role": "deputy_hod", "label": "Deputy HOD", "hierarchy_level": 7, "is_unique": False},
        {"role": "section_head", "label": "Section Head", "hierarchy_level": 7, "is_unique": False},
        {"role": "coordinator", "label": "Coordinator", "hierarchy_level": 8, "is_unique": False},
        {"role": "program_coordinator", "label": "Program Coordinator", "hierarchy_level": 8, "is_unique": False},
        {"role": "project_coordinator", "label": "Project Coordinator", "hierarchy_level": 8, "is_unique": False},
        {"role": "senior_lecturer", "label": "Senior Lecturer", "hierarchy_level": 9, "is_unique": False},
        {"role": "senior_officer", "label": "Senior Officer", "hierarchy_level": 9, "is_unique": False},
        {"role": "senior_admin", "label": "Senior Admin", "hierarchy_level": 9, "is_unique": False},
        {"role": "principal_officer", "label": "Principal Officer", "hierarchy_level": 9, "is_unique": False},
        {"role": "lecturer", "label": "Lecturer", "hierarchy_level": 10, "is_unique": False},
        {"role": "officer", "label": "Officer", "hierarchy_level": 10, "is_unique": False},
        {"role": "admin", "label": "Admin", "hierarchy_level": 10, "is_unique": False},
        {"role": "technician", "label": "Technician", "hierarchy_level": 10, "is_unique": False},
        {"role": "staff", "label": "Staff", "hierarchy_level": 10, "is_unique": False},
        {"role": "researcher", "label": "Researcher", "hierarchy_level": 10, "is_unique": False},
        {"role": "assistant_lecturer", "label": "Assistant Lecturer", "hierarchy_level": 11, "is_unique": False},
        {"role": "tutorial_fellow", "label": "Tutorial Fellow", "hierarchy_level": 11, "is_unique": False},
        {"role": "graduate_assistant", "label": "Graduate Assistant", "hierarchy_level": 11, "is_unique": False},
        {"role": "assistant", "label": "Assistant", "hierarchy_level": 11, "is_unique": False},
        {"role": "admin_assistant", "label": "Admin Assistant", "hierarchy_level": 11, "is_unique": False},
        {"role": "chairperson", "label": "Chairperson", "hierarchy_level": 1, "is_unique": True},
        {"role": "vice_chairperson", "label": "Vice Chairperson", "hierarchy_level": 2, "is_unique": False},
        {"role": "board_secretary", "label": "Board Secretary", "hierarchy_level": 4, "is_unique": False},
        {"role": "secretary", "label": "Secretary", "hierarchy_level": 4, "is_unique": False},
        {"role": "member", "label": "Member", "hierarchy_level": 10, "is_unique": False},
        {"role": "ex_officio", "label": "Ex-Officio", "hierarchy_level": 2, "is_unique": False},
        {"role": "student_rep", "label": "Student Representative", "hierarchy_level": 10, "is_unique": False},
        {"role": "staff_rep", "label": "Staff Representative", "hierarchy_level": 10, "is_unique": False},
        {"role": "convenor", "label": "Convenor", "hierarchy_level": 5, "is_unique": False},
    ]
    
    if entity_type:
        entity_roles = {
            "university": ["vc", "vice_chancellor", "chancellor", "council_member"],
            "division": ["dvc", "deputy_vice_chancellor", "dvc_arsa", "dvc_apf"],
            "wing": ["registrar", "registrar_academic", "registrar_admin", "finance_officer", "director", "deputy_registrar"],
            "school": ["dean", "deputy_dean", "coordinator", "program_coordinator", "admin", "senior_admin", "staff"],
            "department": ["hod", "head", "cod", "deputy_hod", "section_head", "coordinator", "professor", "associate_professor", "senior_lecturer", "lecturer", "assistant_lecturer", "tutorial_fellow", "graduate_assistant", "admin", "technician", "officer", "assistant", "staff"],
            "board": ["chairperson", "council_chair", "vice_chairperson", "board_secretary", "secretary", "member", "council_member", "ex_officio", "student_rep", "staff_rep"],
            "committee": ["chairperson", "vice_chairperson", "secretary", "member", "ex_officio", "convenor"],
            "library": ["librarian", "deputy_librarian", "senior_officer", "officer", "admin", "assistant", "staff"],
            "research": ["director", "deputy_director", "manager", "coordinator", "project_coordinator", "researcher", "senior_researcher", "admin", "officer", "staff"],
            "directorate": ["director", "deputy_director", "manager", "coordinator", "officer", "admin", "staff"],
        }
        allowed_roles = entity_roles.get(entity_type, [])
        return success(data=[r for r in all_roles if r["role"] in allowed_roles])
    
    return success(data=all_roles)


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
