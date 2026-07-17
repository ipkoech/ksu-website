"""School-scoped staff lifecycle and onboarding."""

from __future__ import annotations

import csv
import io
import secrets
import string
import uuid
from typing import Any
from xml.sax.saxutils import escape
from zipfile import ZIP_DEFLATED, ZipFile

from fastapi import HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import Department, Person, Role, StaffAssignment, UserRole
from ..schemas.imports import ImportPreviewRead, ImportPreviewRow
from ..schemas.school_portal_audit import SchoolPortalAuditCreate
from ..schemas.school_portal_team import (
    SchoolTeamLifecycleRequest,
    SchoolTeamMemberCreate,
    SchoolTeamMemberUpdate,
)
from .audit import record_school_portal_audit
from ._base import paginate_query
from .domain_events import enqueue_domain_event
from .person import PersonService
from .rbac import RBACService
from .school_portal_context import SchoolPortalContext
from .school_portal_scope import get_school_record_or_404, school_owned_query
from .staff import StaffService
from .user import UserService
from ..tasks.email import queue_account_created_email

TEAM_ROLE_GROUPS = {
    "leadership": ("dean", "deputy_dean"),
    "department_leadership": ("cod", "hod", "coordinator"),
    "administration": ("school_administrator", "administrative_staff"),
    "academic": ("lecturer",),
    "technical": ("technician",),
    "support": ("support_staff",),
}
TEAM_ROLES = frozenset(
    role for roles in TEAM_ROLE_GROUPS.values() for role in roles
)


def _require(context: SchoolPortalContext, permission: str) -> None:
    if permission not in context.permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"{permission} permission is required",
        )


async def _department_or_404(
    db: AsyncSession,
    context: SchoolPortalContext,
    department_id: uuid.UUID | None,
) -> Department | None:
    if department_id is None:
        return None
    department = await Department.get_by_id(db, department_id)
    if (
        department is None
        or department.school_id != context.school.id
        or getattr(department, "deleted_at", None) is not None
    ):
        raise HTTPException(status_code=404, detail="Department not found")
    return department


async def get_role_by_name(db: AsyncSession, name: str) -> Role | None:
    result = await db.execute(
        select(Role).where(Role.name == name, Role.is_active.is_(True))
    )
    return result.scalar_one_or_none()


async def school_portal_roles_for_user(
    db: AsyncSession,
    user_id: uuid.UUID,
    school_id: uuid.UUID,
) -> list[UserRole]:
    result = await db.execute(
        select(UserRole)
        .join(Role, UserRole.role_id == Role.id)
        .where(
            UserRole.user_id == user_id,
            UserRole.scope_type == "school",
            UserRole.scope_id == school_id,
            UserRole.is_active.is_(True),
            UserRole.deleted_at.is_(None),
            Role.name.in_(("school_admin", "school_editor")),
        )
    )
    return list(result.scalars().all())


async def count_active_school_admins(
    db: AsyncSession,
    school_id: uuid.UUID,
) -> int:
    result = await db.execute(
        select(func.count(UserRole.id))
        .join(Role, UserRole.role_id == Role.id)
        .where(
            UserRole.scope_type == "school",
            UserRole.scope_id == school_id,
            UserRole.is_active.is_(True),
            UserRole.deleted_at.is_(None),
            Role.name == "school_admin",
        )
    )
    return int(result.scalar_one())


def _temporary_password() -> str:
    alphabet = string.ascii_letters + string.digits
    return "Ksu!" + "".join(secrets.choice(alphabet) for _ in range(12))


async def _person_for_create(
    db: AsyncSession,
    data: SchoolTeamMemberCreate,
) -> Person:
    if data.person_id is not None:
        person = await PersonService.get_by_id(db, data.person_id)
        if person is None:
            raise HTTPException(status_code=404, detail="Person not found")
        return person

    assert data.email is not None
    result = await db.execute(
        select(Person).where(
            Person.email == str(data.email).lower(),
            Person.deleted_at.is_(None),
        )
    )
    person = result.scalar_one_or_none()
    if person is not None:
        return person
    full_name = data.full_name or " ".join(
        part for part in (data.first_name, data.middle_name, data.last_name) if part
    )
    return await PersonService.create(
        db,
        first_name=data.first_name,
        middle_name=data.middle_name,
        last_name=data.last_name,
        full_name=full_name,
        email=str(data.email).lower(),
        phone=data.phone,
        employee_number=data.employee_number,
        is_active=True,
        is_public=data.is_public,
    )


async def _audit_and_event(
    db: AsyncSession,
    context: SchoolPortalContext,
    *,
    assignment_id: uuid.UUID,
    action: str,
    changes: dict[str, Any],
) -> None:
    safe_changes = jsonable_encoder(changes)
    enqueue_domain_event(
        db,
        event_type="school.team.changed",
        scope_type="school",
        scope_id=context.school.id,
        actor_id=context.user.id,
        resource_type="staff_assignment",
        resource_id=assignment_id,
        data={"action": action, "changes": safe_changes},
    )
    await record_school_portal_audit(
        db,
        SchoolPortalAuditCreate(
            school_id=context.school.id,
            action=action,
            resource_type="staff_assignment",
            resource_id=assignment_id,
            actor_id=context.user.id,
            changed_fields=safe_changes,
            request_path="/api/v1/school-portal/team",
        ),
    )


async def create_school_team_member(
    db: AsyncSession,
    context: SchoolPortalContext,
    data: SchoolTeamMemberCreate,
) -> StaffAssignment:
    _require(context, "school.team.manage")
    department = await _department_or_404(db, context, data.department_id)
    person = await _person_for_create(db, data)
    user = None
    if data.invite_user:
        _require(context, "school.team.roles")
        user = await UserService.get_by_email(db, person.email)
        if user is None:
            user = await UserService.create(
                db,
                email=person.email,
                password=data.temporary_password or _temporary_password(),
                full_name=person.full_name,
                phone=getattr(person, "phone", None),
                is_active=True,
                is_verified=False,
            )
        person.user_id = user.id

    entity_type = "department" if department is not None else "school"
    entity_id = department.id if department is not None else context.school.id
    assignment = await StaffService.assign(
        db,
        person_id=person.id,
        user_id=getattr(user, "id", None) or getattr(person, "user_id", None),
        entity_type=entity_type,
        entity_id=entity_id,
        role=data.role,
        title=data.title,
        hierarchy_level=StaffService.resolve_hierarchy_level(data.role),
        is_primary=data.is_primary,
        is_public=data.is_public,
        start_date=data.start_date,
        display_order=data.display_order,
    )
    if data.role == "dean":
        context.school.dean_id = person.id

    if data.portal_role:
        role = await get_role_by_name(db, data.portal_role)
        if role is None or user is None:
            raise HTTPException(status_code=422, detail="Portal role is unavailable")
        await RBACService.assign_role(
            db,
            user.id,
            role.id,
            scope_type="school",
            scope_id=context.school.id,
            granted_by_id=context.user.id,
        )

    await _audit_and_event(
        db,
        context,
        assignment_id=assignment.id,
        action="school.team.member.created",
        changes={"person_id": person.id, "role": data.role},
    )
    return assignment


async def get_school_team_assignment(
    db: AsyncSession,
    context: SchoolPortalContext,
    assignment_id: uuid.UUID,
) -> StaffAssignment:
    _require(context, "school.team.view")
    return await get_school_record_or_404(
        db,
        StaffAssignment,
        assignment_id,
        school_id=context.school.id,
    )


async def resend_school_team_invite(
    db: AsyncSession,
    context: SchoolPortalContext,
    assignment_id: uuid.UUID,
) -> None:
    _require(context, "school.team.roles")
    assignment = await get_school_record_or_404(
        db,
        StaffAssignment,
        assignment_id,
        school_id=context.school.id,
    )
    if assignment.user_id is None:
        raise HTTPException(status_code=409, detail="Team member has no portal account")
    person = await PersonService.get_by_id(db, assignment.person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    queue_account_created_email.delay(person.email, person.full_name, None)


async def list_school_team(
    db: AsyncSession,
    context: SchoolPortalContext,
    *,
    page: int = 1,
    per_page: int = 20,
    search: str | None = None,
    status_filter: str | None = None,
    role: str | None = None,
    sort: str = "hierarchy_level",
    order: str = "asc",
):
    _require(context, "school.team.view")
    query = school_owned_query(StaffAssignment, context.school.id).options(
        selectinload(StaffAssignment.person)
    )
    if search:
        query = query.join(Person, StaffAssignment.person_id == Person.id).where(
            or_(
                Person.full_name.ilike(f"%{search}%"),
                Person.email.ilike(f"%{search}%"),
                Person.employee_number.ilike(f"%{search}%"),
            )
        )
    if status_filter:
        query = query.where(StaffAssignment.status == status_filter)
    if role:
        query = query.where(StaffAssignment.role == role)
    sort_columns = {
        "hierarchy_level": StaffAssignment.hierarchy_level,
        "display_order": StaffAssignment.display_order,
        "created_at": StaffAssignment.created_at,
        "role": StaffAssignment.role,
    }
    sort_column = sort_columns.get(sort, StaffAssignment.hierarchy_level)
    query = query.order_by(
        sort_column.desc() if order == "desc" else sort_column.asc(),
        StaffAssignment.display_order.asc(),
        StaffAssignment.id.asc(),
    )
    return await paginate_query(db, query, page=page, per_page=per_page)


async def update_school_team_member(
    db: AsyncSession,
    context: SchoolPortalContext,
    assignment_id: uuid.UUID,
    data: SchoolTeamMemberUpdate,
) -> StaffAssignment:
    _require(context, "school.team.manage")
    assignment = await get_school_team_assignment(db, context, assignment_id)
    payload = data.model_dump(exclude_unset=True)
    if "department_id" in payload:
        department = await _department_or_404(
            db, context, payload.pop("department_id")
        )
        payload["entity_type"] = "department" if department else "school"
        payload["entity_id"] = department.id if department else context.school.id
    phone = payload.pop("phone", None)
    if phone is not None:
        person = await PersonService.get_by_id(db, assignment.person_id)
        if person:
            await PersonService.update(db, person, phone=phone)
    updated = await StaffService.update(db, assignment, **payload)
    await _audit_and_event(
        db,
        context,
        assignment_id=assignment.id,
        action="school.team.member.updated",
        changes=payload,
    )
    return updated


async def activate_school_team_assignment(
    db: AsyncSession,
    context: SchoolPortalContext,
    assignment_id: uuid.UUID,
) -> StaffAssignment:
    _require(context, "school.team.manage")
    assignment = await get_school_record_or_404(
        db,
        StaffAssignment,
        assignment_id,
        school_id=context.school.id,
    )
    activated = await StaffService.activate_assignment(db, assignment)
    await _audit_and_event(
        db,
        context,
        assignment_id=assignment.id,
        action="school.team.assignment.activated",
        changes={"status": "active"},
    )
    return activated


async def deactivate_school_team_assignment(
    db: AsyncSession,
    context: SchoolPortalContext,
    assignment_id: uuid.UUID,
    data: SchoolTeamLifecycleRequest,
) -> StaffAssignment:
    _require(context, "school.team.manage")
    assignment = await get_school_record_or_404(
        db,
        StaffAssignment,
        assignment_id,
        school_id=context.school.id,
    )
    if (
        assignment.role == "dean"
        and assignment.status == "active"
        and data.replacement_person_id is None
        and not data.acknowledge_vacancy
    ):
        raise HTTPException(
            status_code=409,
            detail="Deactivating the active dean requires a replacement or vacancy acknowledgement",
        )
    assignment.status = "inactive"
    assignment.is_primary = False
    await db.flush()
    await _audit_and_event(
        db,
        context,
        assignment_id=assignment.id,
        action="school.team.assignment.deactivated",
        changes={"status": "inactive"},
    )
    return assignment


async def transfer_school_team_assignment(
    db: AsyncSession,
    context: SchoolPortalContext,
    assignment_id: uuid.UUID,
    *,
    department_id: uuid.UUID | None,
    role: str | None = None,
    title: str | None = None,
) -> StaffAssignment:
    _require(context, "school.team.manage")
    assignment = await get_school_record_or_404(
        db,
        StaffAssignment,
        assignment_id,
        school_id=context.school.id,
    )
    department = await _department_or_404(db, context, department_id)
    changes = {
        "entity_type": "department" if department else "school",
        "entity_id": department.id if department else context.school.id,
    }
    if role is not None:
        changes["role"] = role
        changes["hierarchy_level"] = StaffService.resolve_hierarchy_level(role)
    if title is not None:
        changes["title"] = title
    transferred = await StaffService.update(db, assignment, **changes)
    await _audit_and_event(
        db,
        context,
        assignment_id=assignment.id,
        action="school.team.assignment.transferred",
        changes=changes,
    )
    return transferred


async def delete_school_team_assignment(
    db: AsyncSession,
    context: SchoolPortalContext,
    assignment_id: uuid.UUID,
) -> None:
    """Delete only an unused pending assignment; preserve all lifecycle history."""
    _require(context, "school.team.manage")
    assignment = await get_school_record_or_404(
        db,
        StaffAssignment,
        assignment_id,
        school_id=context.school.id,
    )
    if assignment.status != "pending" or assignment.user_id is not None:
        raise HTTPException(
            status_code=409,
            detail="Only an unused pending assignment can be deleted",
        )
    assignment.soft_delete()
    await db.flush()
    await _audit_and_event(
        db,
        context,
        assignment_id=assignment.id,
        action="school.team.assignment.deleted",
        changes={"deleted": True},
    )


async def end_school_team_assignment(
    db: AsyncSession,
    context: SchoolPortalContext,
    assignment_id: uuid.UUID,
    data: SchoolTeamLifecycleRequest,
) -> StaffAssignment:
    _require(context, "school.team.manage")
    assignment = await get_school_record_or_404(
        db,
        StaffAssignment,
        assignment_id,
        school_id=context.school.id,
    )
    if (
        assignment.role == "dean"
        and assignment.status == "active"
        and data.replacement_person_id is None
        and not data.acknowledge_vacancy
    ):
        raise HTTPException(
            status_code=409,
            detail="Ending the active dean requires a replacement or vacancy acknowledgement",
        )
    if assignment.role == "dean" and data.replacement_person_id is not None:
        replacement = await PersonService.get_by_id(db, data.replacement_person_id)
        if replacement is None:
            raise HTTPException(status_code=404, detail="Replacement person not found")
        await StaffService.assign(
            db,
            person_id=replacement.id,
            user_id=replacement.user_id,
            entity_type="school",
            entity_id=context.school.id,
            role="dean",
            title="Dean",
            is_primary=True,
        )
        context.school.dean_id = replacement.id
    elif assignment.role == "dean":
        context.school.dean_id = None
    ended = await StaffService.end_assignment(
        db,
        assignment.id,
        end_date=data.effective_date,
        notes=data.notes,
    )
    await _audit_and_event(
        db,
        context,
        assignment_id=assignment.id,
        action="school.team.assignment.ended",
        changes={"status": "ended"},
    )
    return ended


async def revoke_school_portal_access(
    db: AsyncSession,
    context: SchoolPortalContext,
    assignment_id: uuid.UUID,
) -> None:
    _require(context, "school.team.roles")
    assignment = await get_school_record_or_404(
        db,
        StaffAssignment,
        assignment_id,
        school_id=context.school.id,
    )
    if assignment.user_id is None:
        return
    roles = await school_portal_roles_for_user(
        db, assignment.user_id, context.school.id
    )
    if any(role.role.name == "school_admin" for role in roles):
        if await count_active_school_admins(db, context.school.id) <= 1:
            raise HTTPException(
                status_code=409,
                detail="The final active school administrator cannot be revoked",
            )
    for role in roles:
        await RBACService.revoke_role(db, role.id)
    await _audit_and_event(
        db,
        context,
        assignment_id=assignment.id,
        action="school.team.access.revoked",
        changes={"portal_access": False},
    )


def stamp_school_team_import_row(
    row: dict[str, Any],
    school_id: uuid.UUID,
) -> dict[str, Any]:
    stamped = {
        key: value
        for key, value in row.items()
        if key not in {"school_id", "scope_id", "scope_type", "entity_id", "entity_type"}
    }
    stamped.update(
        school_id=school_id,
        entity_type="school",
        entity_id=school_id,
    )
    return stamped


def school_import_resource_id(idempotency_key: str) -> uuid.UUID:
    return uuid.uuid5(uuid.NAMESPACE_URL, f"ksu:school-team-import:{idempotency_key}")


TEAM_IMPORT_COLUMNS = (
    "email",
    "first_name",
    "last_name",
    "employee_number",
    "role",
    "title",
    "department_code",
    "invite_user",
    "portal_role",
)
TEAM_IMPORT_SAMPLE = (
    "amina.otieno@example.com",
    "Amina",
    "Otieno",
    "KSU1234",
    "lecturer",
    "Lecturer",
    "",
    "false",
    "",
)


def team_import_template_csv() -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(TEAM_IMPORT_COLUMNS)
    writer.writerow(TEAM_IMPORT_SAMPLE)
    return output.getvalue()


def team_import_template_xlsx() -> bytes:
    """Create a small dependency-free XLSX template with inline strings."""

    def row_xml(index: int, values: tuple[str, ...]) -> str:
        cells = []
        for column, value in enumerate(values, start=1):
            number = column
            letters = ""
            while number:
                number, remainder = divmod(number - 1, 26)
                letters = chr(65 + remainder) + letters
            cells.append(
                f'<c r="{letters}{index}" t="inlineStr"><is><t>{escape(value)}</t></is></c>'
            )
        return f'<row r="{index}">{"".join(cells)}</row>'

    output = io.BytesIO()
    with ZipFile(output, "w", ZIP_DEFLATED) as workbook:
        workbook.writestr(
            "[Content_Types].xml",
            """<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>""",
        )
        workbook.writestr(
            "_rels/.rels",
            """<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>""",
        )
        workbook.writestr(
            "xl/workbook.xml",
            """<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Team" sheetId="1" r:id="rId1"/></sheets></workbook>""",
        )
        workbook.writestr(
            "xl/_rels/workbook.xml.rels",
            """<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>""",
        )
        workbook.writestr(
            "xl/worksheets/sheet1.xml",
            """<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>"""
            + row_xml(1, TEAM_IMPORT_COLUMNS)
            + row_xml(2, TEAM_IMPORT_SAMPLE)
            + "</sheetData></worksheet>",
        )
    return output.getvalue()


async def preview_school_team_import(
    db: AsyncSession | None,
    school_id: uuid.UUID,
    rows: list[dict[str, Any]],
) -> ImportPreviewRead:
    del db
    seen_emails: set[str] = set()
    preview_rows = []
    for index, raw in enumerate(rows, start=1):
        row = stamp_school_team_import_row(raw, school_id)
        email = str(row.get("email") or "").strip().lower()
        role = str(row.get("role") or "").strip().lower()
        errors = []
        row_status = "valid"
        formula_fields = [
            key
            for key, value in raw.items()
            if isinstance(value, str)
            and value.lstrip().startswith(("=", "+", "-", "@"))
        ]
        if formula_fields:
            errors.append(
                "Potential spreadsheet formula is not allowed in: "
                + ", ".join(sorted(formula_fields))
            )
        if not email:
            errors.append("email is required")
        if role not in TEAM_ROLES:
            errors.append("role is invalid")
        if email and email in seen_emails:
            row_status = "duplicate"
            errors.append("Duplicate email in import")
        elif errors:
            row_status = "invalid"
        if email:
            seen_emails.add(email)
            row["email"] = email
        preview_rows.append(
            ImportPreviewRow(
                row_number=index,
                status=row_status,
                raw=raw,
                payload=row if row_status == "valid" else None,
                errors=errors,
            )
        )
    return ImportPreviewRead(
        resource="school-team",
        total_rows=len(preview_rows),
        valid_rows=sum(row.status == "valid" for row in preview_rows),
        invalid_rows=sum(row.status == "invalid" for row in preview_rows),
        duplicate_rows=sum(row.status == "duplicate" for row in preview_rows),
        rows=preview_rows,
    )


__all__ = [
    "TEAM_ROLE_GROUPS",
    "activate_school_team_assignment",
    "count_active_school_admins",
    "create_school_team_member",
    "deactivate_school_team_assignment",
    "delete_school_team_assignment",
    "end_school_team_assignment",
    "get_role_by_name",
    "get_school_team_assignment",
    "list_school_team",
    "preview_school_team_import",
    "resend_school_team_invite",
    "revoke_school_portal_access",
    "school_import_resource_id",
    "school_portal_roles_for_user",
    "stamp_school_team_import_row",
    "team_import_template_csv",
    "team_import_template_xlsx",
    "transfer_school_team_assignment",
    "update_school_team_member",
]
