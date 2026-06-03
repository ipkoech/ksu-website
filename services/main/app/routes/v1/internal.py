"""Internal endpoints consumed only by sibling services (Research, Library).

Protected by INTERNAL_API_KEY header — not exposed through the public gateway.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ...core.config import get_settings
from ...core.database import get_db
from ...models import Department, Person, StaffAssignment
from ...services import DepartmentService, PersonService, StaffService

router = APIRouter(tags=["Internal"])
settings = get_settings()


def verify_internal_key(x_internal_key: str = Header(...)) -> None:
    if x_internal_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid internal key")


@router.get("/persons/{person_id}", dependencies=[Depends(verify_internal_key)])
async def get_person_snapshot(person_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Return a minimal person snapshot for sibling services (Research, Library)."""
    person = await PersonService.get_by_id(db, person_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Person not found")
    return {
        "id": str(person.id),
        "display_name": person.display_name,
        "first_name": person.first_name,
        "last_name": person.last_name,
        "email": person.email,
        "department_id": str(person.department_id) if person.department_id else None,
        "photo_id": str(person.photo_id) if person.photo_id else None,
        "is_active": person.is_active,
    }


@router.get("/staff-assignments/{assignment_id}", dependencies=[Depends(verify_internal_key)])
async def get_staff_assignment_snapshot(assignment_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    assignment = await StaffService.get_by_id(
        db,
        assignment_id,
        load_options=(selectinload(StaffAssignment.person),),
    )
    if assignment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Staff assignment not found")
    person = assignment.person
    return {
        "id": str(assignment.id),
        "person_id": str(assignment.person_id),
        "entity_type": assignment.entity_type,
        "entity_id": str(assignment.entity_id) if assignment.entity_id else None,
        "role": assignment.role,
        "title": assignment.title,
        "status": assignment.status,
        "is_public": assignment.is_public,
        "display_order": assignment.display_order,
        "person": {
            "id": str(person.id),
            "display_name": person.display_name,
            "email": person.email,
            "photo_id": str(person.photo_id) if person.photo_id else None,
        } if person else None,
    }


@router.get("/departments/{department_id}", dependencies=[Depends(verify_internal_key)])
async def get_department_snapshot(department_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    department = await DepartmentService.get_by_id(db, department_id, is_active=None)
    if department is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    return {
        "id": str(department.id),
        "name": department.name,
        "slug": department.slug,
        "code": department.code,
        "department_type": department.department_type,
        "school_id": str(department.school_id) if department.school_id else None,
        "is_active": department.is_active,
    }


@router.get("/references/{kind}/{item_id}", dependencies=[Depends(verify_internal_key)])
async def check_reference(kind: str, item_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Validate shared main-owned references for sibling services."""
    normalized = kind.replace("_", "-")
    if normalized in {"person", "persons"}:
        exists = await Person.get_by_id(db, item_id) is not None
    elif normalized in {"department", "departments"}:
        exists = await DepartmentService.get_by_id(db, item_id, is_active=None) is not None
    elif normalized in {"staff-assignment", "staff-assignments"}:
        exists = await StaffService.get_by_id(db, item_id) is not None
    elif normalized in {"school", "schools"}:
        from ...services import SchoolService

        exists = await SchoolService.get_by_id(db, item_id) is not None
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported reference kind")

    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reference not found")
    return {"kind": normalized, "id": str(item_id), "exists": True}
