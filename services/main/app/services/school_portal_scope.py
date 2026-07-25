"""Explicit ownership adapters and query guards for school-owned records."""

from __future__ import annotations

import uuid
from collections.abc import Sequence
from typing import Any, TypeVar

from fastapi import HTTPException, status
from sqlalchemy import Select, and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    Announcement,
    Blog,
    Department,
    Document,
    Event,
    MediaFolder,
    News,
    Programme,
    School,
    StaffAssignment,
)

SchoolOwnedRecord = TypeVar("SchoolOwnedRecord")

SCHOOL_CONTENT_MODELS = frozenset({News, Event, Blog, Announcement})
SCHOOL_OWNED_MODELS = frozenset(
    {
        School,
        Department,
        Programme,
        StaffAssignment,
        Document,
        MediaFolder,
        *SCHOOL_CONTENT_MODELS,
    }
)


def effective_school_id(record: Any) -> uuid.UUID | None:
    """Return a loaded record's effective school without issuing a query."""
    if isinstance(record, School):
        return record.id
    if isinstance(record, Department):
        return record.school_id
    if isinstance(record, Programme):
        department = getattr(record, "department", None)
        return getattr(department, "school_id", None)
    if isinstance(record, StaffAssignment):
        if record.entity_type == "school":
            return record.entity_id
        department = getattr(record, "department", None)
        return getattr(department, "school_id", None)
    if isinstance(record, (Document, MediaFolder)):
        if record.scope_type == "school":
            return record.scope_id
        department = getattr(record, "department", None)
        return getattr(department, "school_id", None)
    if type(record) in SCHOOL_CONTENT_MODELS:
        owner_scope_type = getattr(record, "owner_scope_type", None)
        owner_scope_id = getattr(record, "owner_scope_id", None)
        if owner_scope_type == "school":
            return owner_scope_id
        if getattr(record, "scope_type", None) == "school":
            return getattr(record, "scope_id", None)
        department = getattr(record, "department", None)
        return getattr(department, "school_id", None)
    raise TypeError(f"Unsupported school-owned record type: {type(record).__name__}")


def _department_ids_for_school(school_id: uuid.UUID):
    return select(Department.id).where(
        Department.school_id == school_id,
        Department.deleted_at.is_(None),
    )


def _scoped_record_filter(model, school_id: uuid.UUID):
    department_ids = _department_ids_for_school(school_id)
    return or_(
        and_(model.scope_type == "school", model.scope_id == school_id),
        and_(
            model.scope_type == "department",
            model.scope_id.in_(department_ids),
        ),
    )


def school_owned_query(
    model: type[SchoolOwnedRecord],
    school_id: uuid.UUID,
) -> Select:
    """Build a model-specific select constrained to one school."""
    if model not in SCHOOL_OWNED_MODELS:
        raise TypeError(f"Unsupported school-owned model: {model.__name__}")

    query = select(model)
    if model is School:
        query = query.where(School.id == school_id)
    elif model is Department:
        query = query.where(Department.school_id == school_id)
    elif model is Programme:
        query = query.join(Department, Programme.department_id == Department.id).where(
            Department.school_id == school_id,
            Department.deleted_at.is_(None),
        )
    elif model is StaffAssignment:
        query = query.where(
            or_(
                and_(
                    StaffAssignment.entity_type == "school",
                    StaffAssignment.entity_id == school_id,
                ),
                and_(
                    StaffAssignment.entity_type == "department",
                    StaffAssignment.entity_id.in_(
                        _department_ids_for_school(school_id)
                    ),
                ),
            )
        )
    elif model in {Document, MediaFolder}:
        query = query.where(_scoped_record_filter(model, school_id))
    elif model in SCHOOL_CONTENT_MODELS:
        query = query.where(
            or_(
                _scoped_record_filter(model, school_id),
                and_(
                    model.owner_scope_type == "school",
                    model.owner_scope_id == school_id,
                ),
                and_(
                    model.owner_scope_type == "department",
                    model.owner_scope_id.in_(
                        _department_ids_for_school(school_id)
                    ),
                ),
            )
        )

    deleted_at = getattr(model, "deleted_at", None)
    if deleted_at is not None:
        query = query.where(deleted_at.is_(None))
    return query


async def get_school_record_or_404(
    db: AsyncSession,
    model: type[SchoolOwnedRecord],
    record_id: uuid.UUID,
    *,
    school_id: uuid.UUID,
    load_options: Sequence = (),
) -> SchoolOwnedRecord:
    """Load a record through its school filter, hiding cross-school existence."""
    query = school_owned_query(model, school_id).where(model.id == record_id)
    if load_options:
        query = query.options(*load_options)
    result = await db.execute(query)
    record = result.unique().scalar_one_or_none()
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Record not found",
        )
    return record


__all__ = [
    "SCHOOL_CONTENT_MODELS",
    "SCHOOL_OWNED_MODELS",
    "effective_school_id",
    "get_school_record_or_404",
    "school_owned_query",
]
