"""Reusable bulk import service for admin-managed resources."""

from __future__ import annotations

import csv
import io
import json
import uuid
from dataclasses import dataclass, field
from datetime import date
from types import NoneType, UnionType
from typing import Any, Awaitable, Callable, Union, get_args, get_origin

from pydantic import BaseModel, ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import (
    AcademicCalendar,
    Board,
    Campus,
    Department,
    Division,
    FAQ,
    Intake,
    Person,
    Programme,
    School,
    StaffAssignment,
    Wing,
)
from ..schemas import (
    AcademicCalendarCreate,
    CampusCreate,
    DepartmentCreate,
    DivisionCreate,
    FAQCreate,
    IntakeCreate,
    PersonCreate,
    ProgrammeCreate,
    SchoolCreate,
    StaffAssignmentCreate,
    WingCreate,
)
from ..schemas.base import slugify
from ..schemas.imports import (
    ImportColumnRead,
    ImportCommitRead,
    ImportCommitRequest,
    ImportCommitRowRead,
    ImportPreviewRead,
    ImportPreviewRow,
    ImportResourceRead,
)
from .academic import CampusService, DepartmentService, SchoolService
from .admissions import IntakeService, ProgrammeService
from .organization import DivisionService, WingService
from .person import PersonService
from .staff import StaffService
from .support import FAQService


CreateFunc = Callable[[AsyncSession, dict[str, Any]], Awaitable[Any]]
PrepareFunc = Callable[[AsyncSession, dict[str, Any], dict[str, Any], list[str]], Awaitable[dict[str, Any]]]


@dataclass(frozen=True)
class ImportColumn:
    key: str
    label: str | None = None
    required: bool = False
    description: str | None = None
    sample: Any | None = None

    def read(self) -> ImportColumnRead:
        return ImportColumnRead(
            key=self.key,
            label=self.label or self.key.replace("_", " ").title(),
            required=self.required,
            description=self.description,
            sample=self.sample,
        )


@dataclass(frozen=True)
class ReferenceResolver:
    input_key: str
    output_key: str
    model: type
    lookup_field: str
    label: str
    normalize: Callable[[Any], Any] | None = None
    required: bool = False


@dataclass(frozen=True)
class UniqueCheck:
    fields: tuple[str, ...]
    model: type
    label: str


@dataclass(frozen=True)
class ImportResourceConfig:
    key: str
    label: str
    description: str
    scope: str
    schema: type[BaseModel]
    create: CreateFunc
    columns: tuple[ImportColumn, ...]
    references: tuple[ReferenceResolver, ...] = ()
    unique_checks: tuple[UniqueCheck, ...] = ()
    prepare: PrepareFunc | None = None
    ignored_schema_fields: tuple[str, ...] = ()

    @property
    def allowed_columns(self) -> set[str]:
        return (
            set(self.schema.model_fields.keys())
            | {column.key for column in self.columns}
            | {reference.input_key for reference in self.references}
        )

    def read(self) -> ImportResourceRead:
        return ImportResourceRead(
            key=self.key,
            label=self.label,
            description=self.description,
            scope=self.scope,
            columns=[column.read() for column in self.columns],
        )


async def _create_academic_calendar(db: AsyncSession, payload: dict[str, Any]) -> AcademicCalendar:
    item = AcademicCalendar(**payload)
    db.add(item)
    await db.flush()
    return item


async def _create_campus(db: AsyncSession, payload: dict[str, Any]) -> Campus:
    return await CampusService.create(db, **payload)


async def _create_school(db: AsyncSession, payload: dict[str, Any]) -> School:
    return await SchoolService.create(db, **payload)


async def _create_department(db: AsyncSession, payload: dict[str, Any]) -> Department:
    return await DepartmentService.create(db, **payload)


async def _create_division(db: AsyncSession, payload: dict[str, Any]) -> Division:
    return await DivisionService.create(db, **payload)


async def _create_wing(db: AsyncSession, payload: dict[str, Any]) -> Wing:
    data = dict(payload)
    division_id = data.pop("division_id")
    return await WingService.create(db, division_id=division_id, **data)


async def _create_intake(db: AsyncSession, payload: dict[str, Any]) -> Intake:
    return await IntakeService.create(db, **payload)


async def _create_programme(db: AsyncSession, payload: dict[str, Any]) -> Programme:
    return await ProgrammeService.create(db, **payload)


async def _create_person(db: AsyncSession, payload: dict[str, Any]) -> Person:
    return await PersonService.create(db, **payload)


async def _create_staff_assignment(db: AsyncSession, payload: dict[str, Any]) -> StaffAssignment:
    conflict = await StaffService.check_position_conflict(
        db,
        payload["entity_type"],
        payload.get("entity_id"),
        payload["role"],
    )
    if conflict and not payload.get("is_acting"):
        raise ValueError(f"Position {payload['role']} is already filled")
    data = {
        key: value
        for key, value in payload.items()
        if key not in {"conflict_resolution", "conflict_end_date", "conflict_notes"}
    }
    return await StaffService.assign(db, **data)


async def _create_faq(db: AsyncSession, payload: dict[str, Any]) -> FAQ:
    return await FAQService.create(db, **payload)


def _upper(value: Any) -> str:
    return str(value).strip().upper()


def _lower(value: Any) -> str:
    return str(value).strip().lower()


async def _first_or_error(
    db: AsyncSession,
    model: type,
    lookup_field: str,
    value: Any,
    label: str,
    errors: list[str],
):
    query = select(model).where(getattr(model, lookup_field) == value)
    if hasattr(model, "deleted_at"):
        query = query.where(model.deleted_at.is_(None))
    result = await db.execute(query)
    items = list(result.scalars().all())
    if not items:
        errors.append(f"{label} '{value}' was not found")
        return None
    if len(items) > 1:
        errors.append(f"{label} '{value}' matched multiple records")
        return None
    return items[0]


async def _prepare_academic_calendar(
    db: AsyncSession,
    raw: dict[str, Any],
    payload: dict[str, Any],
    errors: list[str],
) -> dict[str, Any]:
    return payload


async def _prepare_intake(
    db: AsyncSession,
    raw: dict[str, Any],
    payload: dict[str, Any],
    errors: list[str],
) -> dict[str, Any]:
    if payload.get("academic_calendar_id"):
        return payload

    key = raw.get("academic_calendar_key")
    academic_year = raw.get("academic_year")
    semester = raw.get("semester")
    if key and (not academic_year or not semester):
        parts = str(key).split("-S")
        if len(parts) == 2:
            academic_year = parts[0]
            semester = parts[1]

    if academic_year and semester:
        try:
            semester_number = int(semester)
        except (TypeError, ValueError):
            errors.append(f"Academic calendar semester '{semester}' is invalid")
            return payload

        result = await db.execute(
            select(AcademicCalendar).where(
                AcademicCalendar.academic_year == str(academic_year),
                AcademicCalendar.semester == semester_number,
                AcademicCalendar.deleted_at.is_(None),
            )
        )
        calendar = result.scalar_one_or_none()
        if calendar is None:
            errors.append(f"Academic calendar '{academic_year}-S{semester}' was not found")
        else:
            payload["academic_calendar_id"] = calendar.id
    return payload


async def _prepare_person(
    db: AsyncSession,
    raw: dict[str, Any],
    payload: dict[str, Any],
    errors: list[str],
) -> dict[str, Any]:
    if payload.get("email"):
        payload["email"] = str(payload["email"]).strip().lower()
    if not payload.get("full_name"):
        names = [payload.get("first_name"), payload.get("middle_name"), payload.get("last_name")]
        payload["full_name"] = " ".join(str(part).strip() for part in names if part)
    return payload


async def _prepare_staff_assignment(
    db: AsyncSession,
    raw: dict[str, Any],
    payload: dict[str, Any],
    errors: list[str],
) -> dict[str, Any]:
    if not payload.get("person_id"):
        person = None
        if raw.get("person_email"):
            person = await _first_or_error(db, Person, "email", _lower(raw["person_email"]), "Person email", errors)
        elif raw.get("employee_number"):
            person = await _first_or_error(db, Person, "employee_number", raw["employee_number"], "Employee number", errors)
        if person:
            payload["person_id"] = person.id

    entity_type = payload.get("entity_type")
    if entity_type:
        entity_type = str(entity_type).strip().lower()
        payload["entity_type"] = entity_type

    entity_code = raw.get("entity_code")
    if entity_type == "university":
        payload["entity_id"] = None
    elif entity_type and not payload.get("entity_id"):
        entity_configs = {
            "board": (Board, "slug", "Board slug", str),
            "division": (Division, "code", "Division code", _upper),
            "wing": (Wing, "code", "Wing code", _upper),
            "school": (School, "code", "School code", _upper),
            "department": (Department, "code", "Department code", _upper),
            "directorate": (Division, "code", "Directorate code", _upper),
        }
        entity_config = entity_configs.get(entity_type)
        if entity_config is None:
            errors.append(f"Unsupported staff assignment entity_type '{entity_type}'")
        elif not entity_code:
            errors.append("entity_code is required unless entity_type is university or entity_id is provided")
        else:
            model, lookup_field, label, normalize = entity_config
            entity = await _first_or_error(db, model, lookup_field, normalize(entity_code), label, errors)
            if entity:
                payload["entity_id"] = entity.id

    if payload.get("role") and not payload.get("hierarchy_level"):
        payload["hierarchy_level"] = StaffService.resolve_hierarchy_level(str(payload["role"]))
    return payload


def _column(key: str, *, required: bool = False, sample: Any = None, description: str | None = None, label: str | None = None) -> ImportColumn:
    return ImportColumn(key=key, required=required, sample=sample, description=description, label=label)


def _person_ref(input_key: str, output_key: str, label: str) -> ReferenceResolver:
    return ReferenceResolver(input_key, output_key, Person, "email", label, normalize=_lower)


RESOURCE_CONFIGS: dict[str, ImportResourceConfig] = {
    "campuses": ImportResourceConfig(
        key="campuses",
        label="Campuses",
        description="Bulk create campus/location records.",
        scope="academic:write",
        schema=CampusCreate,
        create=_create_campus,
        columns=(
            _column("name", required=True, sample="Main Campus"),
            _column("code", required=True, sample="MAIN"),
            _column("slug", sample="main-campus"),
            _column("campus_type", sample="main"),
            _column("city", sample="Kisii"),
            _column("county", sample="Kisii"),
            _column("email", sample="info@kisiiuniversity.ac.ke"),
            _column("phone", sample="+254700000000"),
            _column("is_active", sample=True),
            _column("display_order", sample=100),
        ),
        unique_checks=(UniqueCheck(("code",), Campus, "Campus code"), UniqueCheck(("slug",), Campus, "Campus slug")),
    ),
    "academic-calendars": ImportResourceConfig(
        key="academic-calendars",
        label="Academic Calendars",
        description="Bulk create academic calendar terms used by intakes.",
        scope="academic:write",
        schema=AcademicCalendarCreate,
        create=_create_academic_calendar,
        prepare=_prepare_academic_calendar,
        columns=(
            _column("academic_year", required=True, sample="2026/2027"),
            _column("semester", required=True, sample=1),
            _column("start_date", required=True, sample="2026-09-01"),
            _column("end_date", required=True, sample="2026-12-20"),
            _column("registration_start", sample="2026-08-10"),
            _column("registration_end", sample="2026-09-12"),
            _column("status", sample="published"),
        ),
        unique_checks=(UniqueCheck(("academic_year", "semester"), AcademicCalendar, "Academic calendar"),),
    ),
    "schools": ImportResourceConfig(
        key="schools",
        label="Schools",
        description="Bulk create school/faculty records.",
        scope="academic:write",
        schema=SchoolCreate,
        create=_create_school,
        columns=(
            _column("name", required=True, sample="School of Information Science and Technology"),
            _column("code", required=True, sample="SIST"),
            _column("slug", sample="school-of-information-science-and-technology"),
            _column("campus_code", sample="MAIN", description="Resolves to campus_id."),
            _column("school_type", sample="school"),
            _column("dean_email", sample="dean@example.ac.ke", description="Resolves to dean_id."),
            _column("about", sample="Academic school overview."),
            _column("email", sample="sist@kisiiuniversity.ac.ke"),
            _column("is_public", sample=True),
            _column("is_active", sample=True),
            _column("display_order", sample=100),
        ),
        references=(
            ReferenceResolver("campus_code", "campus_id", Campus, "code", "Campus code", normalize=_upper),
            _person_ref("dean_email", "dean_id", "Dean email"),
        ),
        unique_checks=(UniqueCheck(("code",), School, "School code"), UniqueCheck(("slug",), School, "School slug")),
    ),
    "departments": ImportResourceConfig(
        key="departments",
        label="Departments",
        description="Bulk create academic, administrative, or support departments.",
        scope="academic:write",
        schema=DepartmentCreate,
        create=_create_department,
        columns=(
            _column("name", required=True, sample="Department of Computing Sciences"),
            _column("code", required=True, sample="COMP"),
            _column("slug", sample="department-of-computing-sciences"),
            _column("department_type", sample="academic"),
            _column("school_code", sample="SIST", description="Resolves to school_id."),
            _column("wing_code", sample="ICT", description="Resolves to wing_id for administrative departments."),
            _column("head_email", sample="hod@example.ac.ke", description="Resolves to head_id."),
            _column("about", sample="Department overview."),
            _column("email", sample="computing@kisiiuniversity.ac.ke"),
            _column("is_public", sample=True),
            _column("is_active", sample=True),
            _column("display_order", sample=100),
        ),
        references=(
            ReferenceResolver("school_code", "school_id", School, "code", "School code", normalize=_upper),
            ReferenceResolver("wing_code", "wing_id", Wing, "code", "Wing code", normalize=_upper),
            _person_ref("head_email", "head_id", "Head email"),
        ),
        unique_checks=(UniqueCheck(("code",), Department, "Department code"),),
    ),
    "divisions": ImportResourceConfig(
        key="divisions",
        label="Divisions",
        description="Bulk create organizational division records.",
        scope="organization.manage_divisions",
        schema=DivisionCreate,
        create=_create_division,
        columns=(
            _column("name", required=True, sample="Division of Academic, Research and Student Affairs"),
            _column("code", required=True, sample="ARSA"),
            _column("slug", sample="division-of-academic-research-and-student-affairs"),
            _column("division_type", sample="division"),
            _column("head_email", sample="dvc@example.ac.ke", description="Resolves to head_id."),
            _column("description", sample="Division overview."),
            _column("email", sample="arsa@kisiiuniversity.ac.ke"),
            _column("is_public", sample=True),
            _column("is_active", sample=True),
            _column("display_order", sample=100),
        ),
        references=(_person_ref("head_email", "head_id", "Head email"),),
        unique_checks=(UniqueCheck(("code",), Division, "Division code"), UniqueCheck(("slug",), Division, "Division slug")),
    ),
    "wings": ImportResourceConfig(
        key="wings",
        label="Wings",
        description="Bulk create wings under organizational divisions.",
        scope="academic:write",
        schema=WingCreate,
        create=_create_wing,
        columns=(
            _column("division_code", required=True, sample="ARSA", description="Resolves to division_id."),
            _column("name", required=True, sample="Academic Affairs Wing"),
            _column("code", required=True, sample="AA"),
            _column("slug", sample="academic-affairs-wing"),
            _column("wing_type", sample="wing"),
            _column("head_email", sample="registrar@example.ac.ke", description="Resolves to head_id."),
            _column("description", sample="Wing overview."),
            _column("email", sample="academic@kisiiuniversity.ac.ke"),
            _column("is_public", sample=True),
            _column("is_active", sample=True),
            _column("display_order", sample=100),
        ),
        references=(
            ReferenceResolver("division_code", "division_id", Division, "code", "Division code", normalize=_upper, required=True),
            _person_ref("head_email", "head_id", "Head email"),
        ),
        unique_checks=(UniqueCheck(("division_id", "code"), Wing, "Wing code within division"), UniqueCheck(("division_id", "slug"), Wing, "Wing slug within division")),
    ),
    "intakes": ImportResourceConfig(
        key="intakes",
        label="Intakes",
        description="Bulk create admission intakes.",
        scope="academic:write",
        schema=IntakeCreate,
        create=_create_intake,
        prepare=_prepare_intake,
        columns=(
            _column("name", required=True, sample="September 2026 Intake"),
            _column("code", required=True, sample="SEP2026"),
            _column("slug", sample="september-2026-intake"),
            _column("academic_calendar_key", required=True, sample="2026/2027-S1", description="Alternative to academic_calendar_id."),
            _column("application_start", required=True, sample="2026-05-01"),
            _column("application_end", required=True, sample="2026-08-20"),
            _column("late_application_end", sample="2026-08-31"),
            _column("max_students", sample=5000),
            _column("is_open", sample=False),
            _column("is_active", sample=True),
        ),
        unique_checks=(UniqueCheck(("code",), Intake, "Intake code"),),
    ),
    "programmes": ImportResourceConfig(
        key="programmes",
        label="Programmes",
        description="Bulk create academic programme records.",
        scope="academic:write",
        schema=ProgrammeCreate,
        create=_create_programme,
        columns=(
            _column("department_code", required=True, sample="COMP", description="Resolves to department_id."),
            _column("name", required=True, sample="Bachelor of Science in Computer Science"),
            _column("code", required=True, sample="BSC-CS"),
            _column("slug", sample="bachelor-of-science-in-computer-science"),
            _column("level", required=True, sample="undergraduate"),
            _column("mode_of_study", sample="full_time"),
            _column("duration", required=True, sample="4 years"),
            _column("credits_required", sample=120),
            _column("entry_requirements", sample="Mean grade C+ or equivalent."),
            _column("intake_months", sample="May;September"),
            _column("is_active", sample=True),
            _column("display_order", sample=100),
        ),
        references=(ReferenceResolver("department_code", "department_id", Department, "code", "Department code", normalize=_upper, required=True),),
        unique_checks=(UniqueCheck(("code",), Programme, "Programme code"), UniqueCheck(("slug",), Programme, "Programme slug")),
    ),
    "persons": ImportResourceConfig(
        key="persons",
        label="Persons",
        description="Bulk create public person/staff profile records.",
        scope="staff:write",
        schema=PersonCreate,
        create=_create_person,
        prepare=_prepare_person,
        columns=(
            _column("title", sample="Dr."),
            _column("first_name", required=True, sample="Amina"),
            _column("middle_name", sample="Nyaboke"),
            _column("last_name", required=True, sample="Otieno"),
            _column("full_name", sample="Amina Nyaboke Otieno"),
            _column("email", required=True, sample="amina.otieno@kisiiuniversity.ac.ke"),
            _column("employee_number", sample="KSU1234"),
            _column("department_code", sample="COMP", description="Resolves to department_id."),
            _column("academic_rank", sample="lecturer"),
            _column("employment_type", sample="full_time"),
            _column("is_public", sample=True),
            _column("is_active", sample=True),
            _column("is_researcher", sample=True),
        ),
        references=(ReferenceResolver("department_code", "department_id", Department, "code", "Department code", normalize=_upper),),
        unique_checks=(UniqueCheck(("email",), Person, "Person email"), UniqueCheck(("employee_number",), Person, "Employee number")),
    ),
    "staff-assignments": ImportResourceConfig(
        key="staff-assignments",
        label="Staff Assignments",
        description="Bulk assign persons to schools, departments, boards, divisions, wings, or university-level roles.",
        scope="staff:write",
        schema=StaffAssignmentCreate,
        create=_create_staff_assignment,
        prepare=_prepare_staff_assignment,
        ignored_schema_fields=("conflict_resolution", "conflict_end_date", "conflict_notes"),
        columns=(
            _column("person_email", required=True, sample="amina.otieno@kisiiuniversity.ac.ke", description="Resolves to person_id."),
            _column("entity_type", required=True, sample="department"),
            _column("entity_code", sample="COMP", description="Use school/department/division/wing code, or board slug."),
            _column("role", required=True, sample="lecturer"),
            _column("title", sample="Lecturer"),
            _column("hierarchy_level", sample=10, description="Optional; derived from role when omitted."),
            _column("is_primary", sample=True),
            _column("is_acting", sample=False),
            _column("is_public", sample=True),
            _column("start_date", sample="2026-01-01"),
            _column("status", sample="active"),
            _column("display_order", sample=100),
        ),
    ),
    "faqs": ImportResourceConfig(
        key="faqs",
        label="FAQs",
        description="Bulk create frequently asked questions.",
        scope="admin:*",
        schema=FAQCreate,
        create=_create_faq,
        columns=(
            _column("question", required=True, sample="How do I apply?"),
            _column("answer_plain_text", sample="Apply through the admissions portal."),
            _column("category", sample="Admissions"),
            _column("scope_type", sample="admissions"),
            _column("is_main", sample=True),
            _column("is_public", sample=True),
            _column("status", sample="published"),
            _column("display_order", sample=100),
        ),
    ),
}


class ImportService:
    """Parse, validate, and commit bulk import rows."""

    @staticmethod
    def list_resources() -> list[ImportResourceRead]:
        return [config.read() for config in RESOURCE_CONFIGS.values()]

    @staticmethod
    def get_resource(resource_key: str) -> ImportResourceConfig | None:
        return RESOURCE_CONFIGS.get(resource_key)

    @staticmethod
    def template_csv(config: ImportResourceConfig) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([column.key for column in config.columns])
        writer.writerow(["" if column.sample is None else column.sample for column in config.columns])
        return output.getvalue()

    @staticmethod
    async def parse_upload(filename: str, content: bytes) -> list[dict[str, Any]]:
        suffix = filename.rsplit(".", 1)[-1].lower() if "." in filename else "csv"
        text = content.decode("utf-8-sig")
        if suffix == "json":
            payload = json.loads(text)
            if isinstance(payload, dict):
                rows = payload.get("rows", payload.get("data"))
            else:
                rows = payload
            if not isinstance(rows, list):
                raise ValueError("JSON import must be an array or an object with rows/data")
            if not all(isinstance(row, dict) for row in rows):
                raise ValueError("JSON import rows must be objects")
            return [_normalize_row(row) for row in rows]

        reader = csv.DictReader(io.StringIO(text))
        if not reader.fieldnames:
            raise ValueError("CSV file must include a header row")
        return [_normalize_row(row) for row in reader]

    @staticmethod
    async def preview(db: AsyncSession, config: ImportResourceConfig, rows: list[dict[str, Any]]) -> ImportPreviewRead:
        seen: dict[tuple[str, ...], set[tuple[Any, ...]]] = {
            unique.fields: set() for unique in config.unique_checks
        }
        preview_rows: list[ImportPreviewRow] = []
        for index, row in enumerate(rows, start=1):
            preview = await _validate_row(db, config, row, index, seen)
            preview_rows.append(preview)

        return ImportPreviewRead(
            resource=config.key,
            total_rows=len(preview_rows),
            valid_rows=sum(1 for row in preview_rows if row.status == "valid"),
            invalid_rows=sum(1 for row in preview_rows if row.status == "invalid"),
            duplicate_rows=sum(1 for row in preview_rows if row.status == "duplicate"),
            rows=preview_rows,
        )

    @staticmethod
    async def commit(
        db: AsyncSession,
        config: ImportResourceConfig,
        request: ImportCommitRequest,
    ) -> ImportCommitRead:
        preview = await ImportService.preview(db, config, request.rows)
        if request.mode == "all_or_nothing" and preview.valid_rows != preview.total_rows:
            invalid = preview.invalid_rows + preview.duplicate_rows
            raise ValueError(f"Import has {invalid} invalid or duplicate row(s)")

        results: list[ImportCommitRowRead] = []
        for preview_row in preview.rows:
            if preview_row.status != "valid" or preview_row.payload is None:
                results.append(
                    ImportCommitRowRead(
                        row_number=preview_row.row_number,
                        status="skipped",
                        errors=preview_row.errors,
                    )
                )
                continue

            if request.mode == "all_or_nothing":
                item = await config.create(db, _clean_payload(config, preview_row.payload))
                results.append(ImportCommitRowRead(row_number=preview_row.row_number, status="created", id=str(item.id)))
                continue

            try:
                async with db.begin_nested():
                    item = await config.create(db, _clean_payload(config, preview_row.payload))
                    item_id = str(item.id)
            except Exception as exc:  # noqa: BLE001 - per-row import failure is returned to the user.
                results.append(ImportCommitRowRead(row_number=preview_row.row_number, status="failed", errors=[str(exc)]))
            else:
                results.append(ImportCommitRowRead(row_number=preview_row.row_number, status="created", id=item_id))

        return ImportCommitRead(
            resource=config.key,
            total_rows=len(results),
            created_rows=sum(1 for row in results if row.status == "created"),
            skipped_rows=sum(1 for row in results if row.status == "skipped"),
            failed_rows=sum(1 for row in results if row.status == "failed"),
            rows=results,
        )


def _normalize_row(row: dict[str, Any]) -> dict[str, Any]:
    normalized: dict[str, Any] = {}
    for key, value in row.items():
        if key is None:
            continue
        cleaned_key = str(key).strip()
        if cleaned_key == "":
            continue
        if isinstance(value, str):
            value = value.strip()
            normalized[cleaned_key] = None if value == "" else value
        else:
            normalized[cleaned_key] = value
    return normalized


async def _validate_row(
    db: AsyncSession,
    config: ImportResourceConfig,
    row: dict[str, Any],
    row_number: int,
    seen: dict[tuple[str, ...], set[tuple[Any, ...]]],
) -> ImportPreviewRow:
    errors: list[str] = []
    warnings: list[str] = []
    unknown_columns = sorted(set(row.keys()) - config.allowed_columns)
    if unknown_columns:
        warnings.append(f"Ignored columns: {', '.join(unknown_columns)}")

    payload = await _payload_from_row(db, config, row, errors)
    if errors:
        return ImportPreviewRow(row_number=row_number, status="invalid", raw=row, errors=errors, warnings=warnings)

    try:
        model = config.schema.model_validate(payload)
    except ValidationError as exc:
        errors.extend(_format_validation_errors(exc))
        return ImportPreviewRow(row_number=row_number, status="invalid", raw=row, errors=errors, warnings=warnings)

    model_payload = model.model_dump(exclude_none=True)
    duplicate_errors = await _duplicate_errors(db, config, model_payload, seen)
    if duplicate_errors:
        return ImportPreviewRow(
            row_number=row_number,
            status="duplicate",
            raw=row,
            payload=model_payload,
            errors=duplicate_errors,
            warnings=warnings,
        )

    return ImportPreviewRow(row_number=row_number, status="valid", raw=row, payload=model_payload, warnings=warnings)


async def _payload_from_row(
    db: AsyncSession,
    config: ImportResourceConfig,
    row: dict[str, Any],
    errors: list[str],
) -> dict[str, Any]:
    payload: dict[str, Any] = {}
    for field_name, model_field in config.schema.model_fields.items():
        if field_name in row:
            try:
                payload[field_name] = _coerce_value(model_field.annotation, row[field_name])
            except (TypeError, ValueError, json.JSONDecodeError) as exc:
                errors.append(f"{field_name}: {exc}")

    for reference in config.references:
        if payload.get(reference.output_key):
            continue
        value = row.get(reference.input_key)
        if value is None or value == "":
            if reference.required:
                errors.append(f"{reference.label} is required")
            continue
        normalized = reference.normalize(value) if reference.normalize else value
        item = await _first_or_error(db, reference.model, reference.lookup_field, normalized, reference.label, errors)
        if item:
            payload[reference.output_key] = item.id

    if config.prepare:
        payload = await config.prepare(db, row, payload, errors)

    if "code" in payload and isinstance(payload["code"], str):
        payload["code"] = _upper(payload["code"])
    if "slug" in config.schema.model_fields and not payload.get("slug"):
        source = payload.get("name") or payload.get("title")
        if source:
            payload["slug"] = slugify(str(source))

    return payload


def _coerce_value(annotation: Any, value: Any) -> Any:
    if value is None:
        return None
    annotation = _unwrap_optional(annotation)
    origin = get_origin(annotation)
    if annotation is bool:
        return _coerce_bool(value)
    if annotation is int:
        return int(value) if isinstance(value, str) else value
    if annotation is float:
        return float(value) if isinstance(value, str) else value
    if annotation is uuid.UUID:
        return uuid.UUID(value) if isinstance(value, str) else value
    if annotation is date:
        return value
    if origin in {list, tuple}:
        if isinstance(value, str):
            if value.startswith("["):
                return json.loads(value)
            return [part.strip() for part in value.replace("|", ";").split(";") if part.strip()]
        return value
    if origin is dict or annotation is dict:
        if isinstance(value, str) and value.startswith("{"):
            return json.loads(value)
        return value
    return value


def _unwrap_optional(annotation: Any) -> Any:
    origin = get_origin(annotation)
    if origin in {UnionType, Union}:
        args = [arg for arg in get_args(annotation) if arg is not NoneType]
        if len(args) == 1:
            return args[0]
    return annotation


def _coerce_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    normalized = str(value).strip().lower()
    if normalized in {"1", "true", "yes", "y", "on"}:
        return True
    if normalized in {"0", "false", "no", "n", "off"}:
        return False
    raise ValueError(f"Cannot parse boolean value '{value}'")


def _format_validation_errors(exc: ValidationError) -> list[str]:
    messages: list[str] = []
    for error in exc.errors():
        loc = ".".join(str(part) for part in error.get("loc", ()))
        prefix = f"{loc}: " if loc else ""
        messages.append(f"{prefix}{error.get('msg', 'Invalid value')}")
    return messages


async def _duplicate_errors(
    db: AsyncSession,
    config: ImportResourceConfig,
    payload: dict[str, Any],
    seen: dict[tuple[str, ...], set[tuple[Any, ...]]],
) -> list[str]:
    errors: list[str] = []
    for unique in config.unique_checks:
        values = tuple(payload.get(field_name) for field_name in unique.fields)
        if any(value is None or value == "" for value in values):
            continue
        if values in seen[unique.fields]:
            errors.append(f"Duplicate {unique.label} in import file")
            continue
        seen[unique.fields].add(values)

        query = select(unique.model)
        for field_name, value in zip(unique.fields, values, strict=True):
            query = query.where(getattr(unique.model, field_name) == value)
        if hasattr(unique.model, "deleted_at"):
            query = query.where(unique.model.deleted_at.is_(None))
        result = await db.execute(query)
        if result.scalars().first() is not None:
            errors.append(f"{unique.label} already exists")
    return errors


def _clean_payload(config: ImportResourceConfig, payload: dict[str, Any]) -> dict[str, Any]:
    return {
        key: value
        for key, value in payload.items()
        if key not in config.ignored_schema_fields
    }
