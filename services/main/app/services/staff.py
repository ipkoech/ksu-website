"""Staff assignment service."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import Board, Department, Division, HierarchyLevel, Person, School, StaffAssignment, UniversityInfo, Wing
from ..models.staff import ENTITY_ROLES, ROLE_HIERARCHY


UNIQUE_POSITION_ROLES = {
    "vc",
    "vice_chancellor",
    "chancellor",
    "council_chair",
    "chairperson",
    "dvc",
    "deputy_vice_chancellor",
    "dvc_arsa",
    "dvc_apf",
    "registrar",
    "registrar_academic",
    "registrar_admin",
    "finance_officer",
    "dean",
    "director",
    "librarian",
    "hod",
    "head",
    "cod",
}

STRICT_UNIQUE_POSITION_ROLES = {
    ("school", "dean"),
    ("department", "hod"),
    ("department", "cod"),
    ("department", "head"),
}

DEPARTMENT_HEAD_ROLES = {"hod", "head", "cod"}

ENTITY_MODEL_CONFIG = {
    "board": (Board, Board.name, Board.board_type),
    "division": (Division, Division.name, Division.code),
    "wing": (Wing, Wing.name, Wing.code),
    "school": (School, School.name, School.code),
    "department": (Department, Department.name, Department.code),
    "directorate": (Division, Division.name, Division.code),
}


class StaffService:
    """Staff assignment operations with reporting chains."""

    @staticmethod
    def resolve_hierarchy_level(role: str, explicit_level: int | None = None) -> int:
        if explicit_level is not None:
            return explicit_level
        return int(ROLE_HIERARCHY.get(role, HierarchyLevel.STAFF))

    @staticmethod
    async def assign(
        db: AsyncSession,
        *,
        person_id: uuid.UUID,
        entity_type: str,
        entity_id: uuid.UUID | None,
        role: str,
        user_id: uuid.UUID | None = None,
        title: str | None = None,
        hierarchy_level: int | None = None,
        reports_to_id: uuid.UUID | None = None,
        is_primary: bool = False,
        is_acting: bool = False,
        is_public: bool = True,
        start_date: date | None = None,
        end_date: date | None = None,
        term_years: int | None = None,
        term_renewable: bool = True,
        show_term_dates: bool = False,
        status: str = "active",
        display_order: int = 100,
        notes: str | None = None,
    ) -> StaffAssignment:
        person = await Person.get_by_id(db, person_id)
        if person is None:
            raise ValueError("Person not found")

        assignment = StaffAssignment(
            person_id=person_id,
            user_id=user_id or person.user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            role=role,
            title=title,
            hierarchy_level=StaffService.resolve_hierarchy_level(role, hierarchy_level),
            reports_to_id=reports_to_id,
            is_primary=is_primary,
            is_acting=is_acting,
            is_public=is_public,
            start_date=start_date,
            end_date=end_date,
            term_years=term_years,
            term_renewable=term_renewable,
            show_term_dates=show_term_dates,
            status=status,
            display_order=display_order,
            notes=notes,
        )
        db.add(assignment)
        await db.flush()
        await StaffService._clear_other_primary_assignments(db, assignment)
        await db.refresh(assignment)
        return assignment

    @staticmethod
    async def get_by_id(db: AsyncSession, assignment_id: uuid.UUID, *, load_options: Sequence = ()) -> StaffAssignment | None:
        query = select(StaffAssignment).where(StaffAssignment.id == assignment_id, StaffAssignment.deleted_at.is_(None))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def update(db: AsyncSession, assignment: StaffAssignment, **data) -> StaffAssignment:
        if data.get("role") and data.get("hierarchy_level") is None:
            data["hierarchy_level"] = StaffService.resolve_hierarchy_level(data["role"])
        for key, value in data.items():
            if hasattr(assignment, key):
                setattr(assignment, key, value)
        await db.flush()
        await StaffService._clear_other_primary_assignments(db, assignment)
        await db.refresh(assignment)
        return assignment

    @staticmethod
    async def delete_assignment(db: AsyncSession, assignment: StaffAssignment) -> None:
        assignment.status = "ended"
        assignment.is_primary = False
        assignment.end_date = assignment.end_date or date.today()
        assignment.soft_delete()
        await db.flush()

    @staticmethod
    async def check_position_conflict(
        db: AsyncSession,
        entity_type: str,
        entity_id: uuid.UUID | None,
        role: str,
        exclude_assignment_id: uuid.UUID | None = None,
    ) -> StaffAssignment | None:
        """Check if a unique position is already filled."""
        if role not in UNIQUE_POSITION_ROLES:
            return None
        strict_unique = StaffService.is_strict_unique_role(entity_type, role)
        role_filter = (
            StaffAssignment.role.in_(DEPARTMENT_HEAD_ROLES)
            if entity_type == "department" and role in DEPARTMENT_HEAD_ROLES
            else StaffAssignment.role == role
        )
        query = (
            select(StaffAssignment)
            .options(selectinload(StaffAssignment.person))
            .where(
                StaffAssignment.entity_type == entity_type,
                StaffAssignment.entity_id == entity_id,
                role_filter,
                StaffAssignment.status == "active",
                StaffAssignment.deleted_at.is_(None),
            )
        )
        if not strict_unique:
            query = query.where(StaffAssignment.is_acting.is_(False))
        if exclude_assignment_id:
            query = query.where(StaffAssignment.id != exclude_assignment_id)
        result = await db.execute(
            query.order_by(
                StaffAssignment.is_primary.desc(),
                StaffAssignment.is_acting.asc(),
                StaffAssignment.start_date.asc().nulls_last(),
                StaffAssignment.created_at.asc(),
            )
        )
        return result.scalars().first()

    @staticmethod
    async def end_assignment(
        db: AsyncSession,
        assignment_id: uuid.UUID,
        end_date: date | None = None,
        notes: str | None = None,
    ) -> StaffAssignment:
        assignment = await StaffService.get_by_id(db, assignment_id)
        if assignment is None:
            raise ValueError("Assignment not found")
        assignment.end_date = end_date or date.today()
        assignment.status = "ended"
        assignment.is_primary = False
        if notes:
            assignment.notes = StaffService._append_note(assignment.notes, notes)
        await db.flush()
        await db.refresh(assignment)
        return assignment

    @staticmethod
    async def activate_assignment(
        db: AsyncSession,
        assignment: StaffAssignment,
        *,
        start_date: date | None = None,
        notes: str | None = None,
    ) -> StaffAssignment:
        assignment.status = "active"
        assignment.end_date = None
        if start_date:
            assignment.start_date = start_date
        if notes:
            assignment.notes = StaffService._append_note(assignment.notes, notes)
        await db.flush()
        await StaffService._clear_other_primary_assignments(db, assignment)
        await db.refresh(assignment)
        return assignment

    @staticmethod
    async def reassign_assignment(
        db: AsyncSession,
        assignment: StaffAssignment,
        *,
        person_id: uuid.UUID,
        title: str | None = None,
        start_date: date | None = None,
        end_previous_date: date | None = None,
        notes: str | None = None,
    ) -> StaffAssignment:
        replacement = await StaffService.assign(
            db,
            person_id=person_id,
            entity_type=assignment.entity_type,
            entity_id=assignment.entity_id,
            role=assignment.role,
            title=title if title is not None else assignment.title,
            hierarchy_level=assignment.hierarchy_level,
            reports_to_id=assignment.reports_to_id,
            is_primary=assignment.is_primary,
            is_acting=assignment.is_acting,
            is_public=assignment.is_public,
            start_date=start_date or date.today(),
            term_years=assignment.term_years,
            term_renewable=assignment.term_renewable,
            show_term_dates=assignment.show_term_dates,
            status="active",
            display_order=assignment.display_order,
            notes=StaffService._append_note(notes, f"Reassigned from assignment {assignment.id}"),
        )
        await StaffService.end_assignment(
            db,
            assignment.id,
            end_date=end_previous_date or date.today(),
            notes=f"Reassigned to {replacement.person_id}",
        )
        await db.refresh(replacement)
        return replacement

    @staticmethod
    async def resolve_conflict(
        db: AsyncSession,
        conflict: StaffAssignment | None,
        *,
        resolution: str | None,
        end_date: date | None = None,
        notes: str | None = None,
    ) -> bool:
        """Apply a conflict resolution. Returns True when caller should continue."""
        if conflict is None:
            return True
        if resolution == "assign_acting":
            return True
        if resolution == "replace_current":
            await StaffService.end_assignment(
                db,
                conflict.id,
                end_date=end_date or date.today(),
                notes=notes or "Ended during staff assignment replacement.",
            )
            return True
        return False

    @staticmethod
    async def get_conflict_payload(
        db: AsyncSession,
        *,
        entity_type: str,
        entity_id: uuid.UUID | None,
        role: str,
        exclude_assignment_id: uuid.UUID | None = None,
    ) -> dict:
        conflict = await StaffService.check_position_conflict(db, entity_type, entity_id, role, exclude_assignment_id)
        role_label = StaffService.role_label(role)
        entity_label = await StaffService.get_entity_label(db, entity_type, entity_id)
        if conflict is None:
            return {
                "has_conflict": False,
                "current_holder": None,
                "role_label": role_label,
                "entity_label": entity_label,
                "allowed_resolutions": [],
            }
        allowed_resolutions = ["cancel", "replace_current", "edit_selection"]
        if not StaffService.is_strict_unique_role(entity_type, role):
            allowed_resolutions.insert(1, "assign_acting")
        return {
            "has_conflict": True,
            "current_holder": {
                "assignment_id": str(conflict.id),
                "person_id": str(conflict.person_id),
                "person_name": conflict.person.full_name if conflict.person else None,
                "start_date": conflict.start_date.isoformat() if conflict.start_date else None,
                "is_acting": conflict.is_acting,
                "role": conflict.role,
                "title": conflict.title,
            },
            "role_label": role_label,
            "entity_label": entity_label,
            "allowed_resolutions": allowed_resolutions,
        }

    @staticmethod
    def role_label(role: str) -> str:
        return role.replace("_", " ").title()

    @staticmethod
    def is_strict_unique_role(entity_type: str, role: str) -> bool:
        return (entity_type, role) in STRICT_UNIQUE_POSITION_ROLES

    @staticmethod
    async def get_entity_label(db: AsyncSession, entity_type: str, entity_id: uuid.UUID | None) -> str:
        if entity_type == "university":
            result = await db.execute(select(UniversityInfo).order_by(UniversityInfo.created_at.asc()))
            university = result.scalars().first()
            return university.name if university else "University"
        if not entity_id:
            return entity_type.replace("_", " ").title()
        config = ENTITY_MODEL_CONFIG.get(entity_type)
        if config is None:
            return entity_type.replace("_", " ").title()
        model, _, _ = config
        result = await db.execute(select(model).where(model.id == entity_id))
        entity = result.scalar_one_or_none()
        return getattr(entity, "name", entity_type.replace("_", " ").title()) if entity else entity_type.replace("_", " ").title()

    @staticmethod
    async def search_entities(
        db: AsyncSession,
        *,
        entity_type: str,
        search: str | None = None,
        limit: int = 20,
    ) -> list[dict]:
        if entity_type == "university":
            result = await db.execute(select(UniversityInfo).order_by(UniversityInfo.created_at.asc()).limit(1))
            university = result.scalars().first()
            return [{
                "id": None,
                "entity_type": "university",
                "label": university.name if university else "University",
                "subtitle": "University-level position",
                "is_active": True,
            }]

        config = ENTITY_MODEL_CONFIG.get(entity_type)
        if config is None:
            return []

        model, label_column, subtitle_column = config
        query = select(model).order_by(label_column.asc()).limit(limit)
        if hasattr(model, "deleted_at"):
            query = query.where(model.deleted_at.is_(None))
        if hasattr(model, "is_active"):
            query = query.where(model.is_active.is_(True))
        if entity_type == "directorate" and hasattr(model, "division_type"):
            query = query.where(model.division_type == "directorate")
        if search:
            query = query.where(label_column.ilike(f"%{search}%"))
        result = await db.execute(query)
        return [
            {
                "id": item.id,
                "entity_type": entity_type,
                "label": getattr(item, "name", str(item.id)),
                "subtitle": str(getattr(item, subtitle_column.key, "") or ""),
                "is_active": bool(getattr(item, "is_active", True)),
            }
            for item in result.scalars().all()
        ]

    @staticmethod
    def roles_for_entity(entity_type: str | None = None) -> list[dict]:
        allowed = set(ENTITY_ROLES.get(entity_type, [])) if entity_type else set()
        role_names = allowed or set(ROLE_HIERARCHY.keys())
        roles = [
            {
                "role": role,
                "label": StaffService.role_label(role),
                "hierarchy_level": int(ROLE_HIERARCHY.get(role, HierarchyLevel.STAFF)),
                "is_unique": role in UNIQUE_POSITION_ROLES,
            }
            for role in role_names
        ]
        return sorted(roles, key=lambda item: (item["hierarchy_level"], item["label"]))

    @staticmethod
    async def list_assignments(
        db: AsyncSession,
        *,
        status: str = "active",
        person_id: uuid.UUID | None = None,
        entity_type: str | None = None,
        entity_id: uuid.UUID | None = None,
        load_options: Sequence = (),
    ) -> list[StaffAssignment]:
        query = select(StaffAssignment).options(selectinload(StaffAssignment.person).selectinload(Person.photo)).where(StaffAssignment.deleted_at.is_(None))
        if load_options:
            query = query.options(*load_options)
        if person_id:
            query = query.where(StaffAssignment.person_id == person_id)
        if entity_type:
            query = query.where(StaffAssignment.entity_type == entity_type)
        if entity_id:
            query = query.where(StaffAssignment.entity_id == entity_id)
        if status != "all":
            if status not in {"active", "ended", "inactive", "pending"}:
                status = "active"
            query = query.where(StaffAssignment.status == status)
        result = await db.execute(query.order_by(StaffAssignment.hierarchy_level.asc(), StaffAssignment.display_order.asc()))
        return list(result.scalars().all())

    @staticmethod
    async def get_assignments_for_person(
        db: AsyncSession,
        person_id: uuid.UUID,
        status: str = "active",
        load_options: Sequence = (),
    ) -> list[StaffAssignment]:
        return await StaffService.list_assignments(db, status=status, person_id=person_id, load_options=load_options)

    @staticmethod
    async def get_assignments_for_entity(
        db: AsyncSession,
        entity_type: str,
        entity_id: uuid.UUID,
        role: str | None = None,
        status: str = "active",
        load_options: Sequence = (),
    ) -> list[StaffAssignment]:
        query = select(StaffAssignment).options(selectinload(StaffAssignment.person).selectinload(Person.photo)).where(
            StaffAssignment.entity_type == entity_type,
            StaffAssignment.entity_id == entity_id,
            StaffAssignment.deleted_at.is_(None),
        )
        if load_options:
            query = query.options(*load_options)
        if role:
            query = query.where(StaffAssignment.role == role)
        if status != "all":
            if status not in {"active", "ended", "inactive", "pending"}:
                status = "active"
            query = query.where(StaffAssignment.status == status)
        result = await db.execute(query.order_by(StaffAssignment.hierarchy_level.asc(), StaffAssignment.display_order.asc()))
        return list(result.scalars().all())

    @staticmethod
    async def get_reporting_chain(
        db: AsyncSession,
        assignment_id: uuid.UUID,
        load_options: Sequence = (),
    ) -> list[StaffAssignment]:
        query = select(StaffAssignment).options(selectinload(StaffAssignment.person)).where(StaffAssignment.id == assignment_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        assignment = result.scalar_one_or_none()
        if assignment is None:
            raise ValueError("Assignment not found")
        chain = [assignment]
        current = assignment
        while current.reports_to_id:
            next_query = select(StaffAssignment).options(selectinload(StaffAssignment.person)).where(StaffAssignment.id == current.reports_to_id)
            if load_options:
                next_query = next_query.options(*load_options)
            next_result = await db.execute(next_query)
            current = next_result.scalar_one_or_none()
            if current is None:
                break
            chain.append(current)
        return chain

    @staticmethod
    async def get_direct_reports(
        db: AsyncSession,
        assignment_id: uuid.UUID,
        load_options: Sequence = (),
    ) -> list[StaffAssignment]:
        query = (
            select(StaffAssignment).options(selectinload(StaffAssignment.person)).where(
                StaffAssignment.reports_to_id == assignment_id,
                StaffAssignment.status == "active",
                StaffAssignment.deleted_at.is_(None),
            ).order_by(StaffAssignment.hierarchy_level.asc(), StaffAssignment.display_order.asc())
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def _clear_other_primary_assignments(db: AsyncSession, assignment: StaffAssignment) -> None:
        if not assignment.is_primary or assignment.status != "active":
            return
        result = await db.execute(
            select(StaffAssignment).where(
                StaffAssignment.person_id == assignment.person_id,
                StaffAssignment.id != assignment.id,
                StaffAssignment.is_primary.is_(True),
                StaffAssignment.status == "active",
                StaffAssignment.deleted_at.is_(None),
            )
        )
        for existing in result.scalars().all():
            existing.is_primary = False
        await db.flush()

    @staticmethod
    def _append_note(existing: str | None, note: str | None) -> str | None:
        if not note:
            return existing
        if not existing:
            return note
        return f"{existing}\n\n{note}"
