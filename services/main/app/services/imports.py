"""Reusable bulk import service for admin-managed resources."""

from __future__ import annotations

import csv
import io
import json
import uuid
import xml.etree.ElementTree as ET
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import date
from types import NoneType, UnionType
from typing import Any, Union, get_args, get_origin
from zipfile import BadZipFile, ZipFile

from ksu_common.internal_client import get_integration_pool
from pydantic import BaseModel, ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import get_settings
from ..models import (
    FAQ,
    AcademicCalendar,
    Board,
    Campus,
    Department,
    Division,
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


class ResearchImportSchema(BaseModel):
    """Permissive schema that accepts any fields for research service imports."""

    model_config = {"extra": "allow"}


_settings = get_settings()

SCHOOL_PORTAL_IMPORT_RESOURCES = {
    "departments": {
        "accepted_formats": ("csv", "xlsx"),
        "columns": (
            "name",
            "code",
            "slug",
            "department_type",
            "parent_department_id",
            "head_id",
            "postgraduate_coordinator_id",
            "email",
            "phone",
            "office_location",
            "is_public",
            "display_order",
        ),
    },
    "programmes": {
        "accepted_formats": ("csv", "xlsx"),
        "columns": (
            "name",
            "code",
            "slug",
            "level",
            "mode_of_study",
            "duration",
            "department_id",
            "entry_requirements",
            "curriculum_overview",
            "fees_structure",
            "accreditation_status",
            "display_order",
        ),
    },
}


def _make_research_create(api_path: str) -> CreateFunc:
    """Factory that creates records by POSTing to the research service."""

    async def _create(db: AsyncSession, payload: dict[str, Any]) -> None:
        response = await get_integration_pool().request_internal(
            "research-imports",
            _settings.RESEARCH_SERVICE_URL.rstrip("/"),
            "POST",
            f"/api/v1/internal/imports/{api_path.rsplit('/', 1)[-1]}",
            api_key=_settings.RESEARCH_SERVICE_API_KEY,
            headers={"X-KSU-Proxy": "main-imports"},
            json=payload,
        )
        response.raise_for_status()

    return _create


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
        scope="academic.manage_campuses",
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
        scope="academic.manage_calendar",
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
        scope="academic.manage_schools",
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
        scope="academic.manage_departments",
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
        scope="academic.manage_departments",
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
        scope="admissions.manage_intakes",
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
        scope="academic.manage_programmes",
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
        scope="staff.manage_assignments",
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
        scope="staff.manage_assignments",
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
        scope="support.manage_faqs",
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
    "research-projects": ImportResourceConfig(
        key="research-projects",
        label="Research Projects",
        description="Bulk create research project records via the research service.",
        scope="research.manage_projects",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/projects"),
        columns=(
            _column("title", required=True, sample="Climate-Smart Agriculture for Smallholder Farmers"),
            _column("slug", sample="climate-smart-agriculture-for-smallholder-farmers"),
            _column("project_type", sample="applied"),
            _column("status", sample="active"),
            _column("summary", sample="Investigating climate adaptation strategies for smallholder farmers in Kisii and Nyamira counties."),
            _column("abstract", sample="This project examines climate-smart agricultural practices..."),
            _column("background", sample="Smallholder farmers in western Kenya face..."),
            _column("methodology", sample="Mixed-methods: household surveys, field trials, and stakeholder workshops."),
            _column("objectives", sample="1. Assess current adaptation practices; 2. Develop context-specific interventions."),
            _column("expected_outcomes", sample="Improved crop resilience, reduced post-harvest losses."),
            _column("impact", sample="Enhanced food security for 5,000+ farming households."),
            _column("deliverables", sample="Technical report, policy brief, 2 journal publications."),
            _column("start_date", sample="2026-01-15"),
            _column("end_date", sample="2027-12-31"),
            _column("budget", sample=15000000),
            _column("funding_source", sample="National Research Fund"),
            _column("progress_percentage", sample=35),
            _column("is_featured", sample=False),
            _column("is_public", sample=True),
            _column("is_active", sample=True),
        ),
    ),
    "research-publications": ImportResourceConfig(
        key="research-publications",
        label="Research Publications",
        description="Bulk create publication records via the research service.",
        scope="research.manage_publications",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/publications"),
        columns=(
            _column("title", required=True, sample="Climate Adaptation Practices Among Smallholder Maize Farmers"),
            _column("slug", sample="climate-adaptation-practices-among-smallholder-maize-farmers"),
            _column("publication_type", sample="journal_article"),
            _column("status", sample="published"),
            _column("abstract", sample="This study investigates the adoption of climate adaptation strategies..."),
            _column("publication_date", sample="2026-03-15"),
            _column("year", sample=2026),
            _column("journal_name", sample="African Journal of Agricultural Research"),
            _column("doi", sample="10.1234/ajar.2026.0123"),
            _column("volume", sample="18"),
            _column("issue", sample="2"),
            _column("pages", sample="123-145"),
            _column("publisher", sample="Academic Journals"),
            _column("language", sample="en"),
            _column("keywords", sample="climate adaptation; smallholder farmers; maize production"),
            _column("citation_count", sample=5),
            _column("is_peer_reviewed", sample=True),
            _column("is_open_access", sample=True),
            _column("is_featured", sample=False),
            _column("is_public", sample=True),
        ),
    ),
    "research-grants": ImportResourceConfig(
        key="research-grants",
        label="Research Grants",
        description="Bulk create grant/funding opportunity records via the research service.",
        scope="research.manage_grants",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/grants"),
        columns=(
            _column("title", required=True, sample="2026/2027 National Research Fund Call"),
            _column("slug", sample="2026-2027-national-research-fund-call"),
            _column("grant_type", sample="research"),
            _column("status", sample="open"),
            _column("summary", sample="NRF is inviting proposals for multi-disciplinary research projects."),
            _column("description", sample="The National Research Fund invites applications for..."),
            _column("objectives", sample="Support high-impact research aligned to national development priorities."),
            _column("eligibility", sample="Principal investigators must hold a PhD and be affiliated with a Kenyan university."),
            _column("focus_areas", sample="Agriculture, health, ICT, energy, water, and climate change."),
            _column("requirements", sample="Full proposal, budget, CV of PI, institutional approval letter."),
            _column("award_ceiling", sample=5000000),
            _column("award_floor", sample=500000),
            _column("duration_months", sample=24),
            _column("application_start", sample="2026-06-01"),
            _column("application_deadline", sample="2026-08-31"),
            _column("contact_email", sample="grants@nrf.go.ke"),
            _column("is_featured", sample=True),
            _column("is_public", sample=True),
        ),
    ),
    "research-innovations": ImportResourceConfig(
        key="research-innovations",
        label="Research Innovations",
        description="Bulk create innovation/invention records via the research service.",
        scope="innovation.manage_ecosystem",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/innovations"),
        columns=(
            _column("title", required=True, sample="Solar-Powered Maize Dryer"),
            _column("slug", sample="solar-powered-maize-dryer"),
            _column("innovation_type", sample="product"),
            _column("status", sample="prototype"),
            _column("summary", sample="A low-cost solar dryer that reduces post-harvest losses for smallholder farmers."),
            _column("description", sample="The Solar-Powered Maize Dryer is a portable..."),
            _column("problem_addressed", sample="Post-harvest losses due to inadequate drying facilities."),
            _column("solution", sample="Utilizes solar energy and a convection-based airflow design."),
            _column("benefits", sample="Reduces drying time by 60%, preserves grain quality."),
            _column("applications", sample="Smallholder maize farming, grain storage cooperatives."),
            _column("target_users", sample="Smallholder farmers, agricultural cooperatives."),
            _column("patent_number", sample="KE/P/2026/00123"),
            _column("patent_status", sample="filed"),
            _column("development_stage", sample="prototype"),
            _column("is_featured", sample=False),
            _column("is_public", sample=True),
        ),
    ),
    "research-startups": ImportResourceConfig(
        key="research-startups",
        label="Research Startup Ventures",
        description="Bulk create startup, spinout, and venture records via the research service.",
        scope="innovation.manage_startups",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/startups"),
        columns=(
            _column("name", required=True, sample="SoilSense Analytics"),
            _column("slug", sample="soilsense-analytics"),
            _column("code", sample="SSA-001"),
            _column("innovation_id", required=True, sample="00000000-0000-0000-0000-000000000000"),
            _column("partner_id", sample="00000000-0000-0000-0000-000000000000"),
            _column("center_id", sample="00000000-0000-0000-0000-000000000000"),
            _column("venture_stage", sample="incubating"),
            _column("registration_status", sample="in_progress"),
            _column("sector", sample="agriculture"),
            _column("summary", sample="A venture commercializing smart soil monitoring tools."),
            _column("business_model", sample="Device sales, support contracts, and advisory subscriptions."),
            _column("funding_raised", sample=250000),
            _column("currency", sample="KES"),
            _column("status", sample="active"),
            _column("is_public", sample=True),
        ),
    ),
    "research-incubation-records": ImportResourceConfig(
        key="research-incubation-records",
        label="Research Incubation Records",
        description="Bulk create incubation, acceleration, and mentorship records via the research service.",
        scope="innovation.manage_startups",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/incubation-records"),
        columns=(
            _column("title", required=True, sample="SoilSense Commercialization Incubation"),
            _column("slug", sample="soilsense-commercialization-incubation"),
            _column("innovation_id", required=True, sample="00000000-0000-0000-0000-000000000000"),
            _column("startup_id", sample="00000000-0000-0000-0000-000000000000"),
            _column("partner_id", sample="00000000-0000-0000-0000-000000000000"),
            _column("program_name", sample="Kisii Innovation Incubation Programme"),
            _column("cohort", sample="2026 Cohort"),
            _column("incubation_type", sample="incubation"),
            _column("stage", sample="active"),
            _column("start_date", sample="2026-02-01"),
            _column("end_date", sample="2026-08-31"),
            _column("support_received", sample="Mentorship, market testing, and prototype refinement."),
            _column("outcomes", sample="Pilot customers identified and support plan completed."),
            _column("status", sample="active"),
            _column("is_public", sample=True),
        ),
    ),
    "research-competition-entries": ImportResourceConfig(
        key="research-competition-entries",
        label="Research Competition Entries",
        description="Bulk create innovation competition, showcase, hackathon, and pitch records via the research service.",
        scope="innovation.manage_competitions",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/competition-entries"),
        columns=(
            _column("title", required=True, sample="SoilSense Innovation Showcase Entry"),
            _column("slug", sample="soilsense-innovation-showcase-entry"),
            _column("innovation_id", required=True, sample="00000000-0000-0000-0000-000000000000"),
            _column("startup_id", sample="00000000-0000-0000-0000-000000000000"),
            _column("partner_id", sample="00000000-0000-0000-0000-000000000000"),
            _column("entry_type", sample="showcase"),
            _column("competition_name", sample="Kisii University Innovation Week"),
            _column("organizer_name", sample="Research, Extension, Innovation and Resource Mobilization"),
            _column("event_date", sample="2026-05-20"),
            _column("entry_status", sample="finalist"),
            _column("award", sample="Best Agriculture Innovation"),
            _column("prize_value", sample=100000),
            _column("currency", sample="KES"),
            _column("status", sample="completed"),
            _column("is_public", sample=True),
        ),
    ),
    "research-technology-transfer-cases": ImportResourceConfig(
        key="research-technology-transfer-cases",
        label="Technology Transfer Cases",
        description="Bulk create disclosure, licensing, adoption, and commercialization records via the research service.",
        scope="innovation.manage_transfers",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/technology-transfer-cases"),
        columns=(
            _column("title", required=True, sample="SoilSense Field Deployment Transfer"),
            _column("slug", sample="soilsense-field-deployment-transfer"),
            _column("innovation_id", required=True, sample="00000000-0000-0000-0000-000000000000"),
            _column("partner_id", sample="00000000-0000-0000-0000-000000000000"),
            _column("case_type", sample="license"),
            _column("transfer_status", sample="licensed"),
            _column("disclosure_date", sample="2026-01-15"),
            _column("agreement_date", sample="2026-04-01"),
            _column("ip_reference", sample="KSU-IP-2026-001"),
            _column("agreement_reference", sample="KSU-TT-2026-001"),
            _column("license_type", sample="non-exclusive"),
            _column("territory", sample="Kenya"),
            _column("summary", sample="Transfer case for partner-supported field deployment."),
            _column("public_benefit", sample="Improves water-use decisions for smallholder farms."),
            _column("status", sample="active"),
            _column("is_public", sample=True),
        ),
    ),
    "research-partners": ImportResourceConfig(
        key="research-partners",
        label="Research Partners",
        description="Bulk create partner/collaborator records via the research service.",
        scope="partnerships.manage_partners",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/partners"),
        columns=(
            _column("name", required=True, sample="Kenya Agricultural and Livestock Research Organization"),
            _column("slug", sample="kenya-agricultural-and-livestock-research-organization"),
            _column("partner_type", sample="research_institute"),
            _column("status", sample="active"),
            _column("about", sample="KALRO is a premier research institution driving agricultural innovation in Kenya."),
            _column("collaboration_areas", sample="Crop science research, extension services, farmer training."),
            _column("key_achievements", sample="Joint publications, 3 collaborative research projects, farmer field schools."),
            _column("website", sample="https://www.kalro.org"),
            _column("email", sample="partnerships@kalro.org"),
            _column("phone", sample="+254700000000"),
            _column("country", sample="Kenya"),
            _column("is_featured", sample=True),
            _column("is_public", sample=True),
            _column("is_active", sample=True),
        ),
    ),
    "research-centers": ImportResourceConfig(
        key="research-centers",
        label="Research Centers",
        description="Bulk create research center records via the research service.",
        scope="research.manage_centers",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/centers"),
        columns=(
            _column("name", required=True, sample="Center for Climate Change and Sustainability"),
            _column("slug", sample="center-for-climate-change-and-sustainability"),
            _column("code", sample="CCCS"),
            _column("center_type", sample="research"),
            _column("about", sample="The center conducts interdisciplinary research on climate resilience."),
            _column("mission", sample="To advance climate adaptation research and policy engagement."),
            _column("vision", sample="To be a leading climate research center in East Africa."),
            _column("email", sample="cccs@kisiiuniversity.ac.ke"),
            _column("phone", sample="+254720000000"),
            _column("website", sample="https://cccs.kisiiuniversity.ac.ke"),
            _column("is_public", sample=True),
            _column("is_active", sample=True),
        ),
    ),
    "research-outputs": ImportResourceConfig(
        key="research-outputs",
        label="Research Outputs",
        description="Bulk create research output records via the research service.",
        scope="research.manage_publications",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/outputs"),
        columns=(
            _column("title", required=True, sample="Climate-Smart Agriculture Policy Brief"),
            _column("slug", sample="climate-smart-agriculture-policy-brief"),
            _column("output_type", sample="policy_brief"),
            _column("summary", sample="Evidence-based policy recommendations for county governments."),
            _column("description", sample="This policy brief synthesizes findings from..."),
            _column("publication_date", sample="2026-04-01"),
            _column("language", sample="en"),
            _column("keywords", sample="climate policy; agriculture; county government"),
            _column("is_public", sample=True),
        ),
    ),
    "research-training": ImportResourceConfig(
        key="research-training",
        label="Research Training",
        description="Bulk create training program records via the research service.",
        scope="training_program.manage",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/training"),
        columns=(
            _column("title", required=True, sample="Advanced Research Methods Workshop"),
            _column("slug", sample="advanced-research-methods-workshop"),
            _column("program_type", sample="workshop"),
            _column("summary", sample="A 5-day hands-on workshop on advanced quantitative and qualitative research methods."),
            _column("description", sample="This workshop covers survey design, statistical analysis, and NVivo for qualitative data."),
            _column("objectives", sample="Equip researchers with advanced data collection and analysis skills."),
            _column("target_audience", sample="Postgraduate students and early-career researchers."),
            _column("prerequisites", sample="Basic knowledge of research methodology."),
            _column("duration", sample="5 days"),
            _column("start_date", sample="2026-07-10"),
            _column("end_date", sample="2026-07-14"),
            _column("is_public", sample=True),
        ),
    ),
    "research-scholarships": ImportResourceConfig(
        key="research-scholarships",
        label="Research Scholarships",
        description="Bulk create scholarship records via the research service.",
        scope="scholarship.manage",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/scholarships"),
        columns=(
            _column("title", required=True, sample="PhD Research Fellowship in Climate Science"),
            _column("slug", sample="phd-research-fellowship-in-climate-science"),
            _column("scholarship_type", sample="doctoral"),
            _column("summary", sample="Fully-funded 3-year PhD position in climate adaptation research."),
            _column("description", sample="The fellowship supports doctoral research on..."),
            _column("eligibility", sample="Master's degree in climate science, agriculture, or related field."),
            _column("requirements", sample="Research proposal, academic transcripts, 2 reference letters."),
            _column("benefits", sample="Tuition, stipend, research grant, conference travel."),
            _column("application_deadline", sample="2026-09-30"),
            _column("covers_tuition", sample=True),
            _column("covers_stipend", sample=True),
            _column("covers_research", sample=True),
            _column("duration_months", sample=36),
            _column("is_public", sample=True),
        ),
    ),
    "research-mentorship": ImportResourceConfig(
        key="research-mentorship",
        label="Research Mentorship",
        description="Bulk create mentorship program records via the research service.",
        scope="mentorship.manage_programs",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/mentorship"),
        columns=(
            _column("title", required=True, sample="Early-Career Researcher Mentorship Program"),
            _column("slug", sample="early-career-researcher-mentorship-program"),
            _column("program_type", sample="one-on-one"),
            _column("summary", sample="6-month mentorship pairing early-career researchers with senior faculty."),
            _column("description", sample="This program connects early-career researchers..."),
            _column("objectives", sample="Build research capacity, grant-writing skills, and publication readiness."),
            _column("target_audience", sample="PhD students and lecturers within 3 years of appointment."),
            _column("duration_months", sample=6),
            _column("is_public", sample=True),
        ),
    ),
    "research-consultancies": ImportResourceConfig(
        key="research-consultancies",
        label="Research Consultancies",
        description="Bulk create consultancy records via the research service.",
        scope="research.manage_consultancies",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/consultancies"),
        columns=(
            _column("title", required=True, sample="Environmental Impact Assessment for Kisii Water Project"),
            _column("slug", sample="environmental-impact-assessment-for-kisii-water-project"),
            _column("consultancy_type", sample="environmental"),
            _column("summary", sample="Conducting a comprehensive environmental impact assessment."),
            _column("description", sample="The consultancy involves baseline studies, stakeholder engagement..."),
            _column("client_name", sample="Kisii County Government"),
            _column("start_date", sample="2026-04-01"),
            _column("end_date", sample="2026-08-31"),
            _column("is_public", sample=True),
        ),
    ),
    "research-endowments": ImportResourceConfig(
        key="research-endowments",
        label="Research Endowments",
        description="Bulk create endowment fund records via the research service.",
        scope="research.manage_endowments",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/endowments"),
        columns=(
            _column("name", required=True, sample="Prof. John Okoth Research Excellence Fund"),
            _column("slug", sample="prof-john-okoth-research-excellence-fund"),
            _column("fund_type", sample="research_excellence"),
            _column("summary", sample="Endowment fund supporting graduate research in agricultural sciences."),
            _column("description", sample="Established in 2024 to promote research excellence..."),
            _column("target_amount", sample=10000000),
            _column("current_amount", sample=3500000),
            _column("is_public", sample=True),
        ),
    ),
    "research-programs": ImportResourceConfig(
        key="research-programs",
        label="Research Programs",
        description="Bulk create research program records via the research service.",
        scope="research_program.manage",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/programs"),
        columns=(
            _column("name", required=True, sample="Sustainable Agriculture Research Program"),
            _column("slug", sample="sustainable-agriculture-research-program"),
            _column("code", sample="SARP"),
            _column("description", sample="A multi-year institutional program focused on sustainable agricultural systems."),
            _column("objectives", sample="Advance food security research, build farmer resilience, influence policy."),
            _column("is_public", sample=True),
        ),
    ),
    "research-farms": ImportResourceConfig(
        key="research-farms",
        label="Research Farms",
        description="Bulk create research farm records via the research service.",
        scope="research.manage_projects",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/farms"),
        columns=(
            _column("name", required=True, sample="Kisii University Demonstration Farm"),
            _column("slug", sample="kisii-university-demonstration-farm"),
            _column("code", sample="KUDF"),
            _column("farm_type", sample="demonstration"),
            _column("location", sample="Main Campus, Kisii"),
            _column("description", sample="A 20-acre demonstration farm showcasing sustainable agricultural practices."),
            _column("is_public", sample=True),
        ),
    ),
    "research-sustainability": ImportResourceConfig(
        key="research-sustainability",
        label="Sustainability Initiatives",
        description="Bulk create sustainability initiative records via the research service.",
        scope="sustainability.manage",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/sustainability"),
        columns=(
            _column("title", required=True, sample="Campus Zero-Waste Initiative"),
            _column("slug", sample="campus-zero-waste-initiative"),
            _column("initiative_type", sample="waste_management"),
            _column("summary", sample="A campus-wide program to reduce, reuse, and recycle waste."),
            _column("description", sample="The initiative includes waste segregation, composting, and recycling programs."),
            _column("objectives", sample="Reduce landfill waste by 70%, establish composting facility."),
            _column("is_public", sample=True),
        ),
    ),
    "research-donors": ImportResourceConfig(
        key="research-donors",
        label="Research Donors",
        description="Bulk create donor records via the research service.",
        scope="funding.manage",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/donors"),
        columns=(
            _column("name", required=True, sample="Mastercard Foundation"),
            _column("donor_type", sample="foundation"),
            _column("about", sample="The Mastercard Foundation supports education and youth employment in Africa."),
            _column("email", sample="partnerships@mastercardfdn.org"),
            _column("website", sample="https://mastercardfdn.org"),
            _column("country", sample="Kenya"),
            _column("is_public", sample=True),
        ),
    ),
    "research-funders": ImportResourceConfig(
        key="research-funders",
        label="Research Funders",
        description="Bulk create funder records via the research service.",
        scope="funding.manage",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/funders"),
        columns=(
            _column("name", required=True, sample="National Research Fund"),
            _column("funder_type", sample="government"),
            _column("about", sample="The NRF supports research aligned to Kenya's development priorities."),
            _column("email", sample="info@nrf.go.ke"),
            _column("website", sample="https://www.nrf.go.ke"),
            _column("country", sample="Kenya"),
            _column("is_public", sample=True),
        ),
    ),
    "research-impact-metrics": ImportResourceConfig(
        key="research-impact-metrics",
        label="Research Impact Metrics",
        description="Bulk create impact metric records via the research service.",
        scope="research.manage_impact",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/impact-metrics"),
        columns=(
            _column("title", required=True, sample="2026 Research Impact Report"),
            _column("slug", sample="2026-research-impact-report"),
            _column("metric_type", sample="annual_report"),
            _column("category", sample="research_outputs"),
            _column("summary", sample="Annual report tracking research outputs, citations, and community impact."),
            _column("reporting_year", sample=2026),
            _column("is_public", sample=True),
        ),
    ),
    "research-themes": ImportResourceConfig(
        key="research-themes",
        label="Research Themes",
        description="Bulk create research theme records via the research service.",
        scope="research_theme.manage",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/themes"),
        columns=(
            _column("name", required=True, sample="Food Security and Sustainable Agriculture"),
            _column("slug", sample="food-security-and-sustainable-agriculture"),
            _column("code", sample="FSSA"),
            _column("description", sample="Research addressing food production, distribution, and sustainability."),
            _column("is_public", sample=True),
        ),
    ),
    "research-focus-areas": ImportResourceConfig(
        key="research-focus-areas",
        label="Research Focus Areas",
        description="Bulk create focus area records via the research service.",
        scope="research.manage_expertise",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/focus-areas"),
        columns=(
            _column("name", required=True, sample="Climate-Smart Agriculture"),
            _column("slug", sample="climate-smart-agriculture"),
            _column("code", sample="CSA"),
            _column("description", sample="Research on agricultural practices that adapt to and mitigate climate change."),
            _column("is_public", sample=True),
        ),
    ),
    "research-expertise-tags": ImportResourceConfig(
        key="research-expertise-tags",
        label="Research Expertise Tags",
        description="Bulk create expertise tag records via the research service.",
        scope="research.manage_expertise",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/expertise-tags"),
        columns=(
            _column("name", required=True, sample="Climate Modelling"),
            _column("slug", sample="climate-modelling"),
            _column("category", sample="environmental_science"),
            _column("description", sample="Expertise in regional and global climate modelling techniques."),
            _column("is_public", sample=True),
        ),
    ),
    "research-journals": ImportResourceConfig(
        key="research-journals",
        label="Research Journals",
        description="Bulk create journal records via the research service.",
        scope="research.manage_journals",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/journals"),
        columns=(
            _column("name", required=True, sample="East African Journal of Science and Technology"),
            _column("slug", sample="east-african-journal-of-science-and-technology"),
            _column("publisher", sample="Kisii University Press"),
            _column("issn", sample="2958-1234"),
            _column("description", sample="A peer-reviewed journal publishing research across scientific disciplines."),
            _column("is_public", sample=True),
        ),
    ),
    "research-grant-guidelines": ImportResourceConfig(
        key="research-grant-guidelines",
        label="Research Grant Guidelines",
        description="Bulk create grant guideline records via the research service.",
        scope="research.manage_grant_guidelines",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/grant-guidelines"),
        columns=(
            _column("title", required=True, sample="NRF Proposal Writing Guidelines"),
            _column("slug", sample="nrf-proposal-writing-guidelines"),
            _column("guideline_type", sample="proposal_writing"),
            _column("summary", sample="Step-by-step guide for preparing competitive research proposals."),
            _column("description", sample="Guidelines cover proposal structure, budget preparation..."),
            _column("is_public", sample=True),
        ),
    ),
    "research-donations": ImportResourceConfig(
        key="research-donations",
        label="Research Donations",
        description="Bulk create donation records via the research service.",
        scope="donations.manage",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/donations"),
        columns=(
            _column("donation_number", required=True, sample="DON2026-001"),
            _column("donation_type", sample="monetary"),
            _column("amount", sample=1500000),
            _column("currency", sample="KES"),
            _column("description", sample="Equipment donation for the chemistry laboratory."),
            _column("donation_date", sample="2026-02-14"),
            _column("is_public", sample=True),
        ),
    ),
    "research-stories": ImportResourceConfig(
        key="research-stories",
        label="Research Success Stories",
        description="Bulk create success story records via the research service.",
        scope="content.manage_blogs",
        schema=ResearchImportSchema,
        create=_make_research_create("/api/v1/stories"),
        columns=(
            _column("title", required=True, sample="How Solar Dryers Transformed Maize Farming in Kisii"),
            _column("slug", sample="how-solar-dryers-transformed-maize-farming-in-kisii"),
            _column("story_type", sample="impact"),
            _column("summary", sample="A story of how university research reduced post-harvest losses for 200+ farmers."),
            _column("description", sample="In 2025, researchers from Kisii University deployed solar dryers..."),
            _column("is_public", sample=True),
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
        if suffix == "xlsx":
            return _parse_xlsx(content)
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


def _parse_xlsx(content: bytes) -> list[dict[str, Any]]:
    """Read the first worksheet from a standard XLSX archive."""
    namespace = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    try:
        with ZipFile(io.BytesIO(content)) as workbook:
            shared_strings: list[str] = []
            if "xl/sharedStrings.xml" in workbook.namelist():
                root = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
                shared_strings = [
                    "".join(node.itertext())
                    for node in root.findall("x:si", namespace)
                ]
            sheet_paths = sorted(
                name
                for name in workbook.namelist()
                if name.startswith("xl/worksheets/sheet") and name.endswith(".xml")
            )
            if not sheet_paths:
                raise ValueError("XLSX file does not contain a worksheet")
            sheet = ET.fromstring(workbook.read(sheet_paths[0]))
    except (BadZipFile, ET.ParseError, KeyError) as exc:
        raise ValueError("Invalid XLSX file") from exc

    values: list[list[Any]] = []
    for row in sheet.findall(".//x:sheetData/x:row", namespace):
        cells: dict[int, Any] = {}
        for cell in row.findall("x:c", namespace):
            reference = cell.attrib.get("r", "A1")
            letters = "".join(char for char in reference if char.isalpha())
            column = 0
            for letter in letters.upper():
                column = column * 26 + ord(letter) - 64
            value_node = cell.find("x:v", namespace)
            inline_node = cell.find("x:is", namespace)
            value: Any = None
            if inline_node is not None:
                value = "".join(inline_node.itertext())
            elif value_node is not None:
                value = value_node.text
                if cell.attrib.get("t") == "s" and value is not None:
                    value = shared_strings[int(value)]
            cells[max(column - 1, 0)] = value
        if cells:
            values.append([cells.get(index) for index in range(max(cells) + 1)])
    if not values:
        return []
    headers = [str(value or "").strip() for value in values[0]]
    return [
        _normalize_row(
            {
                header: row[index] if index < len(row) else None
                for index, header in enumerate(headers)
                if header
            }
        )
        for row in values[1:]
        if any(value not in (None, "") for value in row)
    ]


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
