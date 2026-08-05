"""Resolve a public inquiry target and its accountable owner scope."""

from __future__ import annotations

from dataclasses import dataclass
import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..models import Department, Division, Person, School, UniversityInfo, Wing


@dataclass(frozen=True, slots=True)
class PublicInquiryTarget:
    entity_type: str
    entity_id: uuid.UUID
    name: str
    slug: str
    owner_scope_type: str
    owner_scope_id: uuid.UUID | None
    school_id: uuid.UUID | None = None


def _not_found() -> HTTPException:
    return HTTPException(status_code=404, detail="Inquiry recipient not found")


async def _department_target(db, department: Department, entity_type: str = "department"):
    if department.school_id:
        return PublicInquiryTarget(
            entity_type, department.id, department.name, department.slug,
            "school", department.school_id, department.school_id,
        )
    return PublicInquiryTarget(
        entity_type, department.id, department.name, department.slug,
        "department", department.id,
    )


async def resolve_public_inquiry_target(db, entity_type: str, slug: str) -> PublicInquiryTarget:
    if entity_type == "university":
        result = await db.execute(
            select(UniversityInfo).where(
                UniversityInfo.slug == slug,
                UniversityInfo.is_active.is_(True),
                UniversityInfo.is_public.is_(True),
                UniversityInfo.deleted_at.is_(None),
            )
        )
        entity = result.scalar_one_or_none()
        if entity:
            return PublicInquiryTarget("university", entity.id, entity.name, entity.slug, "university", None)

    if entity_type == "school":
        result = await db.execute(
            select(School).where(
                School.slug == slug, School.is_active.is_(True),
                School.is_public.is_(True), School.deleted_at.is_(None),
            )
        )
        entity = result.scalar_one_or_none()
        if entity:
            return PublicInquiryTarget("school", entity.id, entity.name, entity.slug, "school", entity.id, entity.id)

    if entity_type == "department":
        result = await db.execute(
            select(Department).where(
                Department.slug == slug, Department.is_active.is_(True),
                Department.is_public.is_(True), Department.deleted_at.is_(None),
            )
        )
        entity = result.scalar_one_or_none()
        if entity:
            return await _department_target(db, entity)

    if entity_type == "office":
        for model, owner_type in ((Division, "division"), (Wing, "wing")):
            result = await db.execute(
                select(model).where(
                    model.slug == slug, model.is_active.is_(True),
                    model.is_public.is_(True), model.deleted_at.is_(None),
                )
            )
            entity = result.scalar_one_or_none()
            if entity:
                return PublicInquiryTarget("office", entity.id, entity.name, entity.slug, owner_type, entity.id)
        result = await db.execute(
            select(Department).where(
                Department.slug == slug, Department.is_active.is_(True),
                Department.is_public.is_(True), Department.deleted_at.is_(None),
            )
        )
        entity = result.scalar_one_or_none()
        if entity:
            return await _department_target(db, entity, "office")

    if entity_type == "person":
        try:
            person_id = uuid.UUID(slug)
        except ValueError:
            raise _not_found()
        result = await db.execute(
            select(Person)
            .options(selectinload(Person.assignments))
            .where(
                Person.id == person_id, Person.is_active.is_(True),
                Person.is_public.is_(True), Person.deleted_at.is_(None),
            )
        )
        person = result.scalar_one_or_none()
        if person:
            assignments = sorted(
                (item for item in person.assignments if item.status == "active" and item.is_public),
                key=lambda item: (not item.is_primary, item.hierarchy_level, item.display_order),
            )
            for assignment in assignments:
                if assignment.entity_type == "school" and assignment.entity_id:
                    return PublicInquiryTarget("person", person.id, person.display_name, slug, "school", assignment.entity_id, assignment.entity_id)
                if assignment.entity_type == "department" and assignment.entity_id:
                    department = await db.get(Department, assignment.entity_id)
                    if department:
                        target = await _department_target(db, department)
                        return PublicInquiryTarget("person", person.id, person.display_name, slug, target.owner_scope_type, target.owner_scope_id, target.school_id)
                if assignment.entity_type in {"division", "wing"} and assignment.entity_id:
                    return PublicInquiryTarget("person", person.id, person.display_name, slug, assignment.entity_type, assignment.entity_id)
                if assignment.entity_type == "university":
                    return PublicInquiryTarget("person", person.id, person.display_name, slug, "university", None)

    raise _not_found()


__all__ = ["PublicInquiryTarget", "resolve_public_inquiry_target"]
