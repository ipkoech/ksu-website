"""School-scoped department and programme operations."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    Department,
    DepartmentService as DepartmentServiceRecord,
    Intake,
    Programme,
    ProgrammeIntake,
    ProgrammeTutor,
    StaffAssignment,
)
from ..schemas.imports import ImportPreviewRead, ImportPreviewRow
from ..schemas.school_portal_academics import (
    SchoolAcademicImportRequest,
    SchoolDepartmentCreate,
    SchoolDepartmentUpdate,
    SchoolProgrammeCreate,
    SchoolProgrammeUpdate,
)
from ..schemas.school_portal_audit import SchoolPortalAuditCreate
from .academic import DepartmentService
from .admissions import ProgrammeService
from .audit import record_school_portal_audit
from .domain_events import enqueue_domain_event
from .media import MediaService
from .school_portal_context import SchoolPortalContext
from .school_portal_scope import get_school_record_or_404, school_owned_query
from .staff import StaffService


def _require(context: SchoolPortalContext, permission: str) -> None:
    if permission not in context.permissions:
        raise HTTPException(status_code=403, detail=f"{permission} permission is required")


async def ensure_department_identity_available(
    db: AsyncSession,
    *,
    school_id: uuid.UUID,
    code: str | None,
    slug: str | None,
    exclude_id: uuid.UUID | None = None,
) -> None:
    filters = []
    if code:
        filters.append(Department.code == code)
    if slug:
        filters.append(
            (Department.slug == slug) & (Department.school_id == school_id)
        )
    if not filters:
        return
    query = select(Department.id).where(or_(*filters), Department.deleted_at.is_(None))
    if exclude_id:
        query = query.where(Department.id != exclude_id)
    if (await db.execute(query.limit(1))).scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Department code or slug already exists")


async def ensure_programme_identity_available(
    db: AsyncSession,
    *,
    code: str | None,
    slug: str | None,
    exclude_id: uuid.UUID | None = None,
) -> None:
    filters = []
    if code:
        filters.append(Programme.code == code)
    if slug:
        filters.append(Programme.slug == slug)
    if not filters:
        return
    query = select(Programme.id).where(or_(*filters))
    if exclude_id:
        query = query.where(Programme.id != exclude_id)
    if (await db.execute(query.limit(1))).scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Programme code or slug already exists")


async def ensure_person_in_school(
    db: AsyncSession,
    *,
    school_id: uuid.UUID,
    person_id: uuid.UUID,
) -> None:
    query = school_owned_query(StaffAssignment, school_id).where(
        StaffAssignment.person_id == person_id,
        StaffAssignment.status == "active",
    )
    if (await db.execute(query.limit(1))).scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Person not found")


async def _validate_school_media(
    db: AsyncSession,
    *,
    school_id: uuid.UUID,
    media_id: uuid.UUID | None,
    role: str,
) -> None:
    if media_id is None:
        return
    media = await MediaService.get_by_id(db, media_id)
    if media is None or not MediaService.is_owned_by_school(media, school_id):
        raise HTTPException(status_code=404, detail="Media not found")
    try:
        MediaService.validate_profile_media(media, role)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


async def _audit_event(
    db: AsyncSession,
    context: SchoolPortalContext,
    *,
    event_type: str,
    resource_type: str,
    resource_id: uuid.UUID,
    action: str,
    changes: dict[str, Any],
) -> None:
    safe = jsonable_encoder(changes)
    enqueue_domain_event(
        db,
        event_type=event_type,
        scope_type="school",
        scope_id=context.school.id,
        actor_id=context.user.id,
        resource_type=resource_type,
        resource_id=resource_id,
        data={"action": action, "changes": safe},
    )
    await record_school_portal_audit(
        db,
        SchoolPortalAuditCreate(
            school_id=context.school.id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            actor_id=context.user.id,
            changed_fields=safe,
            request_path=f"/api/v1/school-portal/{resource_type}s",
        ),
    )


async def _validate_parent_department(
    db: AsyncSession,
    context: SchoolPortalContext,
    parent_id: uuid.UUID | None,
) -> None:
    if parent_id is not None:
        await get_school_record_or_404(
            db,
            Department,
            parent_id,
            school_id=context.school.id,
        )


async def _sync_postgraduate_coordinator(
    db: AsyncSession,
    context: SchoolPortalContext,
    department: Department,
    person_id: uuid.UUID | None,
) -> None:
    result = await db.execute(
        select(StaffAssignment).where(
            StaffAssignment.entity_type == "department",
            StaffAssignment.entity_id == department.id,
            StaffAssignment.role == "postgraduate_coordinator",
            StaffAssignment.status == "active",
            StaffAssignment.deleted_at.is_(None),
        )
    )
    current = list(result.scalars().all())
    for assignment in current:
        if assignment.person_id != person_id:
            await StaffService.end_assignment(db, assignment.id)
    if person_id is None or any(item.person_id == person_id for item in current):
        return
    await ensure_person_in_school(
        db, school_id=context.school.id, person_id=person_id
    )
    await StaffService.assign(
        db,
        person_id=person_id,
        entity_type="department",
        entity_id=department.id,
        role="postgraduate_coordinator",
        title="Postgraduate Coordinator",
        is_primary=True,
        is_public=True,
    )


async def create_school_department(
    db: AsyncSession,
    context: SchoolPortalContext,
    data: SchoolDepartmentCreate,
) -> Department:
    _require(context, "school.departments.manage")
    payload = data.model_dump()
    await ensure_department_identity_available(
        db,
        school_id=context.school.id,
        code=payload["code"],
        slug=payload["slug"],
    )
    await _validate_parent_department(db, context, payload.get("parent_department_id"))
    await _validate_school_media(
        db,
        school_id=context.school.id,
        media_id=payload.get("cover_image_id"),
        role="cover",
    )
    coordinator_id = payload.get("postgraduate_coordinator_id")
    if payload.get("head_id"):
        await ensure_person_in_school(
            db, school_id=context.school.id, person_id=payload["head_id"]
        )
    department = await DepartmentService.create(
        db,
        **payload,
        school_id=context.school.id,
        wing_id=None,
        is_active=True,
    )
    if coordinator_id:
        await _sync_postgraduate_coordinator(
            db, context, department, coordinator_id
        )
    await _audit_event(
        db,
        context,
        event_type="school.department.changed",
        resource_type="department",
        resource_id=department.id,
        action="school.department.created",
        changes=payload,
    )
    return department


async def get_school_department(
    db: AsyncSession,
    context: SchoolPortalContext,
    department_id: uuid.UUID,
) -> Department:
    _require(context, "school.departments.view")
    return await get_school_record_or_404(
        db, Department, department_id, school_id=context.school.id
    )


async def update_school_department(
    db: AsyncSession,
    context: SchoolPortalContext,
    department_id: uuid.UUID,
    data: SchoolDepartmentUpdate,
) -> Department:
    _require(context, "school.departments.manage")
    department = await get_school_record_or_404(
        db, Department, department_id, school_id=context.school.id
    )
    payload = data.model_dump(exclude_unset=True)
    await ensure_department_identity_available(
        db,
        school_id=context.school.id,
        code=payload.get("code"),
        slug=payload.get("slug"),
        exclude_id=department.id,
    )
    if "parent_department_id" in payload:
        await _validate_parent_department(
            db, context, payload["parent_department_id"]
        )
    if "cover_image_id" in payload:
        await _validate_school_media(
            db,
            school_id=context.school.id,
            media_id=payload["cover_image_id"],
            role="cover",
        )
    if payload.get("head_id"):
        await ensure_person_in_school(
            db, school_id=context.school.id, person_id=payload["head_id"]
        )
    coordinator_supplied = "postgraduate_coordinator_id" in payload
    coordinator_id = payload.get("postgraduate_coordinator_id")
    updated = await DepartmentService.update(db, department, **payload)
    if coordinator_supplied:
        await _sync_postgraduate_coordinator(
            db, context, department, coordinator_id
        )
    await _audit_event(
        db,
        context,
        event_type="school.department.changed",
        resource_type="department",
        resource_id=department.id,
        action="school.department.updated",
        changes=payload,
    )
    return updated


async def department_dependency_count(
    db: AsyncSession,
    department_id: uuid.UUID,
) -> int:
    counts = []
    for model in (Programme, StaffAssignment, DepartmentServiceRecord):
        field = (
            model.entity_id
            if model is StaffAssignment
            else model.department_id
        )
        query = select(func.count(model.id)).where(field == department_id)
        if model is StaffAssignment:
            query = query.where(model.entity_type == "department")
        counts.append(int((await db.execute(query)).scalar_one()))
    return sum(counts)


async def delete_school_department(
    db: AsyncSession,
    context: SchoolPortalContext,
    department_id: uuid.UUID,
) -> str:
    _require(context, "school.departments.manage")
    department = await get_school_record_or_404(
        db, Department, department_id, school_id=context.school.id
    )
    dependencies = await department_dependency_count(db, department.id)
    if dependencies or department.is_public:
        department.is_active = False
        disposition = "deactivated"
    else:
        await db.delete(department)
        disposition = "deleted"
    await db.flush()
    await _audit_event(
        db,
        context,
        event_type="school.department.changed",
        resource_type="department",
        resource_id=department.id,
        action=f"school.department.{disposition}",
        changes={"is_active": False, "disposition": disposition},
    )
    return disposition


async def create_school_programme(
    db: AsyncSession,
    context: SchoolPortalContext,
    data: SchoolProgrammeCreate,
) -> Programme:
    _require(context, "school.programmes.manage")
    department = await get_school_record_or_404(
        db, Department, data.department_id, school_id=context.school.id
    )
    payload = data.model_dump()
    tutor_ids = payload.pop("tutor_ids")
    intake_ids = payload.pop("intake_ids")
    payload.pop("department_id", None)
    await ensure_programme_identity_available(
        db, code=payload["code"], slug=payload["slug"]
    )
    await _validate_school_media(
        db,
        school_id=context.school.id,
        media_id=payload.get("cover_image_id"),
        role="cover",
    )
    await _validate_school_media(
        db,
        school_id=context.school.id,
        media_id=payload.get("brochure_id"),
        role="brochure",
    )
    programme = await ProgrammeService.create(
        db, **payload, department_id=department.id
    )
    for person_id in tutor_ids:
        await ensure_person_in_school(
            db, school_id=context.school.id, person_id=person_id
        )
        await ProgrammeService.add_tutor(
            db, programme.id, person_id, role="lecturer"
        )
    for intake_id in intake_ids:
        if await Intake.get_by_id(db, intake_id) is None:
            raise HTTPException(status_code=404, detail="Intake not found")
        await ProgrammeService.attach_intake(db, programme.id, intake_id)
    await _audit_event(
        db,
        context,
        event_type="school.programme.changed",
        resource_type="programme",
        resource_id=programme.id,
        action="school.programme.created",
        changes=payload,
    )
    return programme


async def get_school_programme(
    db: AsyncSession,
    context: SchoolPortalContext,
    programme_id: uuid.UUID,
) -> Programme:
    _require(context, "school.programmes.view")
    return await get_school_record_or_404(
        db, Programme, programme_id, school_id=context.school.id
    )


async def _sync_programme_relations(
    db: AsyncSession,
    context: SchoolPortalContext,
    programme: Programme,
    *,
    tutor_ids: list[uuid.UUID] | None,
    intake_ids: list[uuid.UUID] | None,
) -> None:
    if tutor_ids is not None:
        result = await db.execute(
            select(ProgrammeTutor).where(
                ProgrammeTutor.programme_id == programme.id
            )
        )
        current = {item.person_id for item in result.scalars().all()}
        requested = set(tutor_ids)
        for person_id in requested - current:
            await ensure_person_in_school(
                db, school_id=context.school.id, person_id=person_id
            )
            await ProgrammeService.add_tutor(
                db, programme.id, person_id, role="lecturer"
            )
        for person_id in current - requested:
            await ProgrammeService.remove_tutor(db, programme.id, person_id)
    if intake_ids is not None:
        result = await db.execute(
            select(ProgrammeIntake).where(
                ProgrammeIntake.programme_id == programme.id
            )
        )
        current_items = list(result.scalars().all())
        current = {item.intake_id for item in current_items}
        requested = set(intake_ids)
        for intake_id in requested - current:
            if await Intake.get_by_id(db, intake_id) is None:
                raise HTTPException(status_code=404, detail="Intake not found")
            await ProgrammeService.attach_intake(db, programme.id, intake_id)
        for item in current_items:
            if item.intake_id not in requested:
                await db.delete(item)


async def update_school_programme(
    db: AsyncSession,
    context: SchoolPortalContext,
    programme_id: uuid.UUID,
    data: SchoolProgrammeUpdate,
) -> Programme:
    _require(context, "school.programmes.manage")
    programme = await get_school_record_or_404(
        db, Programme, programme_id, school_id=context.school.id
    )
    payload = data.model_dump(exclude_unset=True)
    tutor_ids = payload.pop("tutor_ids", None)
    intake_ids = payload.pop("intake_ids", None)
    if "department_id" in payload:
        department = await get_school_record_or_404(
            db,
            Department,
            payload["department_id"],
            school_id=context.school.id,
        )
        payload["department_id"] = department.id
    await ensure_programme_identity_available(
        db,
        code=payload.get("code"),
        slug=payload.get("slug"),
        exclude_id=programme.id,
    )
    for field, role in (("cover_image_id", "cover"), ("brochure_id", "brochure")):
        if field in payload:
            await _validate_school_media(
                db,
                school_id=context.school.id,
                media_id=payload[field],
                role=role,
            )
    updated = await ProgrammeService.update(db, programme, **payload)
    await _sync_programme_relations(
        db,
        context,
        programme,
        tutor_ids=tutor_ids,
        intake_ids=intake_ids,
    )
    await _audit_event(
        db,
        context,
        event_type="school.programme.changed",
        resource_type="programme",
        resource_id=programme.id,
        action="school.programme.updated",
        changes=payload,
    )
    return updated


async def programme_dependency_count(
    db: AsyncSession,
    programme_id: uuid.UUID,
) -> int:
    total = 0
    for model in (ProgrammeTutor, ProgrammeIntake):
        total += int(
            (
                await db.execute(
                    select(func.count(model.id)).where(
                        model.programme_id == programme_id
                    )
                )
            ).scalar_one()
        )
    return total


async def delete_school_programme(
    db: AsyncSession,
    context: SchoolPortalContext,
    programme_id: uuid.UUID,
) -> str:
    _require(context, "school.programmes.manage")
    programme = await get_school_record_or_404(
        db, Programme, programme_id, school_id=context.school.id
    )
    if await programme_dependency_count(db, programme.id) or programme.is_active:
        programme.is_active = False
        disposition = "deactivated"
    else:
        await db.delete(programme)
        disposition = "deleted"
    await db.flush()
    await _audit_event(
        db,
        context,
        event_type="school.programme.changed",
        resource_type="programme",
        resource_id=programme.id,
        action=f"school.programme.{disposition}",
        changes={"is_active": False, "disposition": disposition},
    )
    return disposition


def stamp_school_academic_import_row(
    resource: str,
    row: dict[str, Any],
    school_id: uuid.UUID,
) -> dict[str, Any]:
    stamped = {
        key: value
        for key, value in row.items()
        if key not in {"school_id", "scope_id", "scope_type"}
    }
    stamped["school_id"] = school_id
    if resource == "departments":
        stamped["wing_id"] = None
    return stamped


async def preview_school_academic_import(
    db: AsyncSession | None,
    resource: str,
    school_id: uuid.UUID,
    rows: list[dict[str, Any]],
) -> ImportPreviewRead:
    del db
    if resource not in {"departments", "programmes"}:
        raise HTTPException(status_code=404, detail="Academic import resource not found")
    seen_codes: set[str] = set()
    seen_slugs: set[str] = set()
    previews = []
    for index, raw in enumerate(rows, start=1):
        row = stamp_school_academic_import_row(resource, raw, school_id)
        errors = []
        code = str(row.get("code") or "").strip().upper()
        slug = str(row.get("slug") or "").strip().lower()
        required = ("name", "code", "slug")
        if resource == "programmes":
            required += ("level", "duration", "department_id")
        for field in required:
            if not row.get(field):
                errors.append(f"{field} is required")
        duplicate = (code and code in seen_codes) or (slug and slug in seen_slugs)
        if code:
            row["code"] = code
            seen_codes.add(code)
        if slug:
            row["slug"] = slug
            seen_slugs.add(slug)
        status = "duplicate" if duplicate else ("invalid" if errors else "valid")
        previews.append(
            ImportPreviewRow(
                row_number=index,
                status=status,
                raw=raw,
                payload=row if status == "valid" else None,
                errors=["Duplicate code or slug in import"] if duplicate else errors,
            )
        )
    return ImportPreviewRead(
        resource=resource,
        total_rows=len(previews),
        valid_rows=sum(item.status == "valid" for item in previews),
        invalid_rows=sum(item.status == "invalid" for item in previews),
        duplicate_rows=sum(item.status == "duplicate" for item in previews),
        rows=previews,
    )


async def commit_school_academic_import(
    db: AsyncSession,
    context: SchoolPortalContext,
    request: SchoolAcademicImportRequest,
) -> dict[str, Any]:
    permission = f"school.{request.resource}.bulk"
    _require(context, permission)
    preview = await preview_school_academic_import(
        db, request.resource, context.school.id, request.rows
    )
    if (
        request.mode == "all_or_nothing"
        and preview.valid_rows != preview.total_rows
    ):
        raise HTTPException(
            status_code=422,
            detail="Import contains invalid or duplicate rows",
        )

    results = []
    for row in preview.rows:
        if row.status != "valid" or row.payload is None:
            results.append(
                {
                    "row_number": row.row_number,
                    "status": "skipped",
                    "errors": row.errors,
                }
            )
            continue
        try:
            if request.resource == "departments":
                payload = {
                    key: value
                    for key, value in row.payload.items()
                    if key not in {"school_id", "wing_id"}
                }
                item = await create_school_department(
                    db,
                    context,
                    SchoolDepartmentCreate.model_validate(payload),
                )
            else:
                payload = {
                    key: value
                    for key, value in row.payload.items()
                    if key != "school_id"
                }
                item = await create_school_programme(
                    db,
                    context,
                    SchoolProgrammeCreate.model_validate(payload),
                )
        except Exception as exc:
            if request.mode == "all_or_nothing":
                raise
            results.append(
                {
                    "row_number": row.row_number,
                    "status": "failed",
                    "errors": [str(exc)],
                }
            )
        else:
            results.append(
                {
                    "row_number": row.row_number,
                    "status": "created",
                    "id": str(item.id),
                }
            )

    result = {
        "resource": request.resource,
        "total_rows": len(results),
        "created_rows": sum(row["status"] == "created" for row in results),
        "skipped_rows": sum(row["status"] == "skipped" for row in results),
        "failed_rows": sum(row["status"] == "failed" for row in results),
        "rows": results,
    }
    import_id = uuid.uuid5(
        uuid.NAMESPACE_URL,
        f"ksu:school-academic-import:{request.idempotency_key}",
    )
    await _audit_event(
        db,
        context,
        event_type="school.import.completed",
        resource_type="import",
        resource_id=import_id,
        action=f"school.{request.resource}.imported",
        changes=result,
    )
    return result


__all__ = [
    "commit_school_academic_import",
    "create_school_department",
    "create_school_programme",
    "delete_school_department",
    "delete_school_programme",
    "department_dependency_count",
    "ensure_department_identity_available",
    "ensure_person_in_school",
    "ensure_programme_identity_available",
    "get_school_department",
    "get_school_programme",
    "preview_school_academic_import",
    "programme_dependency_count",
    "stamp_school_academic_import_row",
    "update_school_department",
    "update_school_programme",
]
