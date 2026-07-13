"""Search and resolution adapters for records referenced by Page CMS sections."""

from __future__ import annotations

import math
import uuid
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from datetime import date, datetime, timezone
from enum import Enum
from typing import Any, Protocol

import httpx
from sqlalchemy import String, false, func, or_, select
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..models import (
    AcademicCalendar,
    Alumni,
    Club,
    ClubActivity,
    Department,
    Event,
    Intake,
    News,
    Person,
    Programme,
    ProgrammeIntake,
    School,
    StaffAssignment,
    Testimonial,
)
from ..schemas.page_cms import PageCmsSourceSummary
from ._base import ilike_any, paginate_query
from .page_cms_source_errors import (
    PageCmsSourcePreviewUnsupportedError,
    PageCmsSourceProviderError,
)
from .page_cms_stats import PageCmsStatsProxyService
from .research_partners import ResearchPartnersProxyService
from .stats import public_stats

SUPPORTED_SOURCE_TYPES = frozenset(
    {
        "programme", "news", "event", "person", "research_partner", "public_stat",
        "intake", "academic_calendar", "staff_assignment", "alumni", "testimonial", "club_activity",
    }
)
PUBLIC_STAT_NAMESPACE = uuid.UUID("64a394c9-9dab-4807-90ef-e05cbf3dde8e")
PAGE_CMS_BULK_CHUNK_SIZE = 500


class PageCmsPreviewCapability(Protocol):
    async def allows(
        self,
        *,
        source_scope_type: str,
        source_scope_id: uuid.UUID | None,
        destination_scope_type: str,
        destination_scope_id: uuid.UUID | None,
    ) -> bool: ...


class PageCmsSourceResolutionState(str, Enum):
    RESOLVED = "resolved"
    INACCESSIBLE = "inaccessible"
    UNAVAILABLE = "unavailable"
    PROVIDER_ERROR = "provider_error"
    UNSUPPORTED_TYPE = "unsupported_type"
    PREVIEW_UNSUPPORTED = "preview_unsupported"


SOURCE_STATE_MESSAGES = {
    PageCmsSourceResolutionState.RESOLVED: "",
    PageCmsSourceResolutionState.INACCESSIBLE: "Source is inaccessible.",
    PageCmsSourceResolutionState.UNAVAILABLE: "Source is unavailable.",
    PageCmsSourceResolutionState.PROVIDER_ERROR: "Source provider is unavailable.",
    PageCmsSourceResolutionState.UNSUPPORTED_TYPE: "Source type is unsupported.",
    PageCmsSourceResolutionState.PREVIEW_UNSUPPORTED: "Draft preview is unsupported for this source type.",
}


@dataclass(frozen=True)
class PageCmsSourceResolution:
    source_type: str
    source_id: uuid.UUID
    state: PageCmsSourceResolutionState
    source: PageCmsSourceSummary | None = None
    message: str = ""

    def __post_init__(self) -> None:
        if not self.message:
            object.__setattr__(self, "message", SOURCE_STATE_MESSAGES[self.state])


@dataclass
class PageCmsSourceResolutionCache:
    """Request-local provider results shared by bulk source resolution calls."""

    public_partner_records: list[dict[str, Any]] | None = None
    public_partner_error: PageCmsSourceProviderError | None = None


def _source_resolution(
    source_type: str,
    source_id: uuid.UUID,
    state: PageCmsSourceResolutionState,
    source: PageCmsSourceSummary | None = None,
) -> PageCmsSourceResolution:
    return PageCmsSourceResolution(
        source_type=source_type,
        source_id=source_id,
        state=state,
        source=source,
    )


def _media_url(media: Any | None) -> str | None:
    if media is None or not _not_deleted(media) or not getattr(media, "is_public", False):
        return None
    return (
        getattr(media, "thumbnail_url", None)
        or getattr(media, "cdn_url", None)
        or getattr(media, "public_url", None)
    )


def _public_content_filters(model, now: datetime):
    return (
        model.deleted_at.is_(None),
        model.archived_at.is_(None),
        model.is_public.is_(True),
        model.is_published.is_(True),
        model.status == "published",
        or_(model.published_at.is_(None), model.published_at <= now),
        or_(model.scheduled_publish_at.is_(None), model.scheduled_publish_at <= now),
        or_(model.valid_from.is_(None), model.valid_from <= now),
        or_(model.valid_to.is_(None), model.valid_to > now),
        or_(model.expires_at.is_(None), model.expires_at > now),
        model.unpublished_at.is_(None),
    )


def _content_is_selectable(item: Any, now: datetime) -> bool:
    return bool(
        item.deleted_at is None
        and item.archived_at is None
        and item.is_public
        and item.is_published
        and item.status == "published"
        and (item.published_at is None or item.published_at <= now)
        and (item.scheduled_publish_at is None or item.scheduled_publish_at <= now)
        and (item.valid_from is None or item.valid_from <= now)
        and (item.valid_to is None or item.valid_to > now)
        and (item.expires_at is None or item.expires_at > now)
        and item.unpublished_at is None
    )


def _apply_content_scope(query, model, scope_type: str, scope_id: uuid.UUID | None):
    if scope_type == "university":
        return query.where(or_(model.scope_type.is_(None), model.scope_type == "university"))
    return query.where(model.scope_type == scope_type, model.scope_id == scope_id)


def _format_level(value: str) -> str:
    return value.replace("_", " ").title()


def _programme_summary(item: Programme) -> PageCmsSourceSummary:
    secondary = " | ".join(part for part in (item.code, _format_level(item.level)) if part)
    return PageCmsSourceSummary(
        id=item.id,
        source_type="programme",
        label=item.name,
        secondary_label=secondary or None,
        status="active" if item.is_active else "inactive",
        thumbnail_url=_media_url(item.cover_image),
        metadata={
            "code": item.code,
            "level": item.level,
            "duration": item.duration,
            "department": item.department.name if item.department else None,
            "school": item.department.school.name if item.department and item.department.school else None,
        },
        selectable=_programme_is_public(item),
    )


def _news_summary(item: News, now: datetime) -> PageCmsSourceSummary:
    return PageCmsSourceSummary(
        id=item.id,
        source_type="news",
        label=item.title,
        secondary_label=item.summary,
        status=item.status,
        published_at=item.published_at,
        thumbnail_url=_media_url(item.featured_media),
        metadata={"slug": item.slug, "scope": item.scope_type or "university"},
        selectable=_content_is_selectable(item, now),
    )


def _event_summary(item: Event, now: datetime) -> PageCmsSourceSummary:
    secondary = item.location or item.summary
    return PageCmsSourceSummary(
        id=item.id,
        source_type="event",
        label=item.title,
        secondary_label=secondary,
        status=item.status,
        published_at=item.published_at,
        thumbnail_url=_media_url(item.featured_media),
        metadata={
            "slug": item.slug,
            "start_date": item.start_date,
            "end_date": item.end_date,
            "location": item.location,
            "scope": item.scope_type or "university",
        },
        selectable=_content_is_selectable(item, now),
    )


def _programme_is_public(item: Programme) -> bool:
    department = item.department
    school = department.school if department else None
    return bool(
        item.deleted_at is None and item.is_active
        and department and department.deleted_at is None and department.is_active and department.is_public
        and school and school.deleted_at is None and school.is_active and school.is_public
    )


def _assignment_for_scope(
    person: Person,
    scope_type: str,
    scope_id: uuid.UUID | None,
    *,
    include_private: bool = False,
) -> StaffAssignment | None:
    today = date.today()
    assignments = [
        assignment
        for assignment in person.assignments
        if assignment.deleted_at is None
        and assignment.status == "active"
        and (include_private or assignment.is_public)
        and assignment.entity_type == scope_type
        and assignment.entity_id == scope_id
        and (assignment.start_date is None or assignment.start_date <= today)
        and (assignment.end_date is None or assignment.end_date >= today)
    ]
    assignments.sort(key=lambda item: (not item.is_primary, item.hierarchy_level, item.display_order, str(item.id)))
    return assignments[0] if assignments else None


def _person_summary(
    item: Person,
    scope_type: str,
    scope_id: uuid.UUID | None,
    *,
    include_private_assignment: bool = False,
) -> PageCmsSourceSummary:
    assignment = _assignment_for_scope(item, scope_type, scope_id, include_private=include_private_assignment)
    secondary = (
        assignment.title if assignment and assignment.title
        else item.institutional_role or item.academic_rank
    )
    return PageCmsSourceSummary(
        id=item.id,
        source_type="person",
        label=item.full_name,
        secondary_label=secondary,
        status="active" if item.is_active else "inactive",
        thumbnail_url=_media_url(item.photo),
        metadata={
            "role": _format_level(assignment.role) if assignment else _format_level(item.institutional_role or ""),
        },
        selectable=bool(item.deleted_at is None and item.is_active and item.is_public and assignment),
    )


LOCAL_SOURCE_TYPES = frozenset(
    {"intake", "academic_calendar", "staff_assignment", "alumni", "testimonial", "club_activity"}
)


def _not_deleted(item: Any) -> bool:
    return getattr(item, "deleted_at", None) is None


def _intake_school_ids(item: Intake) -> set[uuid.UUID]:
    return {
        programme_intake.programme.department.school_id
        for programme_intake in item.programmes
        if _not_deleted(programme_intake)
        and programme_intake.is_active
        and programme_intake.programme is not None
        and _not_deleted(programme_intake.programme)
        and programme_intake.programme.is_active
        and programme_intake.programme.department is not None
        and _not_deleted(programme_intake.programme.department)
        and programme_intake.programme.department.is_active
        and programme_intake.programme.department.school_id is not None
        and programme_intake.programme.department.school is not None
        and _not_deleted(programme_intake.programme.department.school)
        and programme_intake.programme.department.school.is_active
        and programme_intake.programme.department.school.is_public
    }


def _calendar_school_ids(item: AcademicCalendar) -> set[uuid.UUID]:
    return {
        school_id
        for intake in item.intakes
        if _not_deleted(intake) and intake.is_active
        for school_id in _intake_school_ids(intake)
    }


def _intake_is_public(item: Intake) -> bool:
    return bool(_not_deleted(item) and item.is_active)


def _calendar_is_public(item: AcademicCalendar) -> bool:
    return bool(_not_deleted(item) and item.status in {"published", "current"})


def _staff_assignment_is_public(item: StaffAssignment) -> bool:
    person = item.person
    today = date.today()
    now = datetime.now(timezone.utc)
    return bool(
        _not_deleted(item)
        and item.status == "active"
        and item.is_public
        and item.workflow_status == "published"
        and item.archived_at is None
        and item.unpublished_at is None
        and item.published_at is not None
        and item.published_at <= now
        and (item.start_date is None or item.start_date <= today)
        and (item.end_date is None or item.end_date >= today)
        and person is not None
        and _not_deleted(person)
        and person.is_active
        and person.is_public
    )


def _alumni_is_public(item: Alumni) -> bool:
    person = item.person
    return bool(
        _not_deleted(item)
        and item.is_public
        and item.is_verified
        and person is not None
        and _not_deleted(person)
        and person.is_active
        and person.is_public
    )


def _testimonial_is_public(item: Testimonial) -> bool:
    return bool(_not_deleted(item) and item.is_public and item.is_approved)


def _club_activity_is_public(item: ClubActivity) -> bool:
    club = item.club
    now = datetime.now(timezone.utc)
    return bool(
        _not_deleted(item)
        and item.archived_at is None
        and item.status == "published"
        and item.is_public
        and item.is_published
        and item.workflow_status == "published"
        and item.unpublished_at is None
        and (item.scheduled_publish_at is None or item.scheduled_publish_at <= now)
        and (item.expires_at is None or item.expires_at >= now)
        and club is not None
        and _not_deleted(club)
        and club.is_active
        and club.is_public
    )


def _intake_summary(item: Intake) -> PageCmsSourceSummary:
    return PageCmsSourceSummary(
        id=item.id,
        source_type="intake",
        label=item.name,
        secondary_label=item.code,
        status="active" if item.is_active else "inactive",
        thumbnail_url=_media_url(item.cover_image),
        metadata={
            key: value
            for key, value in {
                "slug": item.slug,
                "application_start": item.application_start,
                "application_end": item.application_end,
                "late_application_end": item.late_application_end,
                "is_open": item.is_open,
            }.items()
            if value is not None
        },
        selectable=_intake_is_public(item),
    )


def _calendar_summary(item: AcademicCalendar) -> PageCmsSourceSummary:
    return PageCmsSourceSummary(
        id=item.id,
        source_type="academic_calendar",
        label=f"{item.academic_year} Semester {item.semester}",
        secondary_label=f"{item.start_date.isoformat()} to {item.end_date.isoformat()}",
        status=item.status,
        metadata={
            key: value
            for key, value in {
                "academic_year": item.academic_year,
                "semester": item.semester,
                "start_date": item.start_date,
                "end_date": item.end_date,
                "registration_start": item.registration_start,
                "registration_end": item.registration_end,
                "teaching_start": item.teaching_start,
                "teaching_end": item.teaching_end,
                "exam_start": item.exam_start,
                "exam_end": item.exam_end,
            }.items()
            if value is not None
        },
        selectable=_calendar_is_public(item),
    )


def _staff_assignment_summary(item: StaffAssignment) -> PageCmsSourceSummary:
    person = item.person
    public_title = item.public_role_label or item.title or _format_level(item.role)
    return PageCmsSourceSummary(
        id=item.id,
        source_type="staff_assignment",
        label=person.full_name,
        secondary_label=public_title,
        status=item.status,
        thumbnail_url=_media_url(person.photo),
        metadata={"role": _format_level(item.role)},
        selectable=_staff_assignment_is_public(item),
    )


def _alumni_summary(item: Alumni) -> PageCmsSourceSummary:
    person = item.person
    programme_name = item.programme.name if item.programme else None
    school_name = item.school.name if item.school else None
    return PageCmsSourceSummary(
        id=item.id,
        source_type="alumni",
        label=person.full_name,
        secondary_label=item.current_position or programme_name or school_name,
        status="verified" if item.is_verified else "unverified",
        thumbnail_url=_media_url(person.photo),
        metadata={
            key: value
            for key, value in {
                "graduation_year": item.graduation_year,
                "programme": programme_name,
                "school": school_name,
                "current_position": item.current_position,
                "industry": item.industry,
                "location_city": item.location_city,
            }.items()
            if value is not None
        },
        selectable=_alumni_is_public(item),
    )


def _testimonial_summary(item: Testimonial) -> PageCmsSourceSummary:
    return PageCmsSourceSummary(
        id=item.id,
        source_type="testimonial",
        label=item.name,
        secondary_label=item.role,
        status="approved" if item.is_approved else "pending",
        thumbnail_url=_media_url(item.photo),
        metadata={
            key: value
            for key, value in {"quote": item.quote, "story": item.full_story}.items()
            if value is not None
        },
        selectable=_testimonial_is_public(item),
    )


def _club_activity_summary(item: ClubActivity) -> PageCmsSourceSummary:
    return PageCmsSourceSummary(
        id=item.id,
        source_type="club_activity",
        label=item.title,
        secondary_label=item.club.name if item.club else None,
        status=item.status,
        published_at=item.published_at,
        thumbnail_url=_media_url(item.cover_image),
        metadata={
            key: value
            for key, value in {
                "slug": item.slug,
                "activity_type": item.activity_type,
                "start_datetime": item.start_datetime,
                "end_datetime": item.end_datetime,
                "location": item.location,
                "club": item.club.name if item.club else None,
            }.items()
            if value is not None
        },
        selectable=_club_activity_is_public(item),
    )


def _local_summary(source_type: str, item: Any) -> PageCmsSourceSummary:
    return {
        "intake": _intake_summary,
        "academic_calendar": _calendar_summary,
        "staff_assignment": _staff_assignment_summary,
        "alumni": _alumni_summary,
        "testimonial": _testimonial_summary,
        "club_activity": _club_activity_summary,
    }[source_type](item)


def _local_is_public(source_type: str, item: Any) -> bool:
    return {
        "intake": _intake_is_public,
        "academic_calendar": _calendar_is_public,
        "staff_assignment": _staff_assignment_is_public,
        "alumni": _alumni_is_public,
        "testimonial": _testimonial_is_public,
        "club_activity": _club_activity_is_public,
    }[source_type](item)


def _local_scope(source_type: str, item: Any) -> tuple[str, uuid.UUID | None]:
    if source_type in {"alumni", "testimonial"}:
        return "university", None
    if source_type == "staff_assignment":
        return item.entity_type, item.entity_id
    if source_type == "club_activity":
        club = item.club
        if club is None:
            return "university", None
        school_id = club.school_id or (club.department.school_id if club.department else None)
        return ("school", school_id) if school_id is not None else ("university", None)
    return "university", None


def _local_preview_scope(
    source_type: str,
    item: Any,
    destination_scope_type: str,
    destination_scope_id: uuid.UUID | None,
) -> tuple[str, uuid.UUID | None]:
    if source_type in {"intake", "academic_calendar"} and destination_scope_type == "school":
        return "school", destination_scope_id
    return _local_scope(source_type, item)


def _local_scope_matches(
    source_type: str,
    item: Any,
    destination_scope_type: str,
    destination_scope_id: uuid.UUID | None,
) -> bool:
    if destination_scope_type == "university":
        return True
    if source_type == "intake":
        return destination_scope_type == "school" and destination_scope_id in _intake_school_ids(item)
    if source_type == "academic_calendar":
        return destination_scope_type == "school" and destination_scope_id in _calendar_school_ids(item)
    if source_type in {"alumni", "testimonial"}:
        return False
    if source_type == "club_activity" and destination_scope_type not in {"school"}:
        return False
    source_scope_type, source_scope_id = _local_scope(source_type, item)
    return source_scope_type == destination_scope_type and source_scope_id == destination_scope_id


def _local_source_statement(source_type: str):
    if source_type == "intake":
        return select(Intake).options(
            selectinload(Intake.cover_image),
            selectinload(Intake.programmes)
            .selectinload(ProgrammeIntake.programme)
            .selectinload(Programme.department)
            .selectinload(Department.school),
        )
    if source_type == "academic_calendar":
        return select(AcademicCalendar).options(
            selectinload(AcademicCalendar.intakes)
            .selectinload(Intake.programmes)
            .selectinload(ProgrammeIntake.programme)
            .selectinload(Programme.department)
            .selectinload(Department.school),
        )
    if source_type == "staff_assignment":
        return select(StaffAssignment).options(selectinload(StaffAssignment.person).selectinload(Person.photo))
    if source_type == "alumni":
        return select(Alumni).options(
            selectinload(Alumni.person).selectinload(Person.photo),
            selectinload(Alumni.programme),
            selectinload(Alumni.school),
        )
    if source_type == "testimonial":
        return select(Testimonial).options(selectinload(Testimonial.photo))
    return select(ClubActivity).options(
        selectinload(ClubActivity.cover_image),
        selectinload(ClubActivity.club).selectinload(Club.department),
    )


def _partner_date(value: Any) -> date | None:
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        try:
            return date.fromisoformat(value[:10])
        except ValueError:
            return None
    return None


def _partner_is_public(item: dict[str, Any]) -> bool:
    today = date.today()
    partnership_start = _partner_date(item.get("partnership_start"))
    expiry_dates = [
        parsed
        for field in ("partnership_end", "mou_expiry_date")
        if (parsed := _partner_date(item.get(field))) is not None
    ]
    return bool(
        item.get("deleted_at") is None
        and item.get("is_active", True)
        and item.get("is_public", True)
        and item.get("status") == "active"
        and (partnership_start is None or partnership_start <= today)
        and all(expiry >= today for expiry in expiry_dates)
    )


def _partner_summary(item: dict[str, Any]) -> PageCmsSourceSummary:
    status = str(item.get("status") or "inactive")
    secondary = item.get("acronym") or item.get("country") or item.get("partner_type")
    return PageCmsSourceSummary(
        id=uuid.UUID(str(item["id"])),
        source_type="research_partner",
        label=str(item.get("name") or item.get("title") or item["id"]),
        secondary_label=str(secondary) if secondary else None,
        status=status,
        thumbnail_url=item.get("logo_url") or item.get("cover_image_url"),
        metadata={
            key: item.get(key)
            for key in (
                "slug", "acronym", "partner_type", "partnership_level", "country", "website",
                "partnership_end", "mou_expiry_date",
            )
            if item.get(key) is not None
        },
        selectable=_partner_is_public(item),
    )


def _stat_authority(scope_type: str, scope_identity: str | None) -> str:
    return f"{scope_type}:{scope_identity or '-'}"


def _stat_id(scope_type: str, scope_identity: str | None, key: str) -> uuid.UUID:
    return uuid.uuid5(PUBLIC_STAT_NAMESPACE, f"{_stat_authority(scope_type, scope_identity)}:{key}")


def _stat_value(item: Any, key: str, default: Any = None) -> Any:
    return item.get(key, default) if isinstance(item, dict) else getattr(item, key, default)


def _stat_summary(item: Any, scope: str, scope_identity: str | None) -> PageCmsSourceSummary:
    raw_value = _stat_value(item, "value")
    value = f"{raw_value:g}" if isinstance(raw_value, float) else str(raw_value)
    key = _stat_value(item, "key")
    return PageCmsSourceSummary(
        id=_stat_id(scope, scope_identity, key),
        source_type="public_stat",
        label=_stat_value(item, "label"),
        secondary_label=f"{value}{_stat_value(item, 'suffix', '')}",
        status="verified",
        metadata={
            "key": key,
            "value": raw_value,
            "suffix": _stat_value(item, "suffix", ""),
            "description": _stat_value(item, "description"),
            "href": _stat_value(item, "href"),
            "scope": scope,
            "verified": True,
        },
        selectable=True,
    )


def _map_page(result: PaginatedResult, mapper) -> PaginatedResult:
    return PaginatedResult(items=[mapper(item) for item in result.items], meta=result.meta)


def _chunks(values: Sequence[Any]) -> list[Sequence[Any]]:
    return [
        values[start:start + PAGE_CMS_BULK_CHUNK_SIZE]
        for start in range(0, len(values), PAGE_CMS_BULK_CHUNK_SIZE)
    ]


async def _load_records_in_chunks(
    db,
    source_ids: Sequence[uuid.UUID],
    build_statement: Callable[[Sequence[uuid.UUID]], Any],
) -> dict[uuid.UUID, Any]:
    records: dict[uuid.UUID, Any] = {}
    for source_id_chunk in _chunks(source_ids):
        result = await db.execute(build_statement(source_id_chunk))
        records.update((item.id, item) for item in result.scalars().all())
    return records


class PageCmsSourceService:
    """Dispatch source searches and resolution through explicit source adapters."""

    @staticmethod
    def validate_source_type(source_type: str) -> str:
        if source_type not in SUPPORTED_SOURCE_TYPES:
            raise ValueError(f"Unsupported Page CMS source type: {source_type}")
        return source_type

    @staticmethod
    async def search(
        db,
        source_type: str,
        query: str,
        scope_type: str,
        scope_id: uuid.UUID | None,
        page: int,
        per_page: int,
    ) -> PaginatedResult:
        PageCmsSourceService.validate_source_type(source_type)
        page = max(1, page)
        per_page = max(1, min(50, per_page))
        query = query.strip()

        if source_type == "programme":
            statement = select(Programme).join(Department).join(School).options(
                selectinload(Programme.cover_image),
                selectinload(Programme.department).selectinload(Department.school),
            ).where(
                Programme.deleted_at.is_(None), Programme.is_active.is_(True),
                Department.deleted_at.is_(None), Department.is_active.is_(True), Department.is_public.is_(True),
                School.deleted_at.is_(None), School.is_active.is_(True), School.is_public.is_(True),
            )
            if scope_type == "school":
                statement = statement.where(Department.school_id == scope_id)
            elif scope_type != "university":
                statement = statement.where(false())
            if query:
                statement = statement.where(ilike_any(query, Programme.name, Programme.code, Programme.level))
            statement = statement.order_by(Programme.display_order.asc(), Programme.name.asc(), Programme.id.asc())
            result = await paginate_query(db, statement, page=page, per_page=per_page)
            return _map_page(result, _programme_summary)

        if source_type in {"news", "event"}:
            model = News if source_type == "news" else Event
            media_relation = News.featured_media if model is News else Event.featured_media
            now = datetime.now(timezone.utc)
            statement = select(model).options(selectinload(media_relation)).where(*_public_content_filters(model, now))
            statement = _apply_content_scope(statement, model, scope_type, scope_id)
            if query:
                statement = statement.where(ilike_any(query, model.title, model.summary))
            if model is News:
                statement = statement.order_by(News.published_at.desc().nullslast(), News.title.asc(), News.id.asc())
                mapper = lambda item: _news_summary(item, now)
            else:
                statement = statement.where(func.coalesce(Event.end_date, Event.start_date) >= now)
                statement = statement.order_by(Event.start_date.asc(), Event.title.asc(), Event.id.asc())
                mapper = lambda item: _event_summary(item, now)
            result = await paginate_query(db, statement, page=page, per_page=per_page)
            return _map_page(result, mapper)

        if source_type == "person":
            statement = select(Person).options(
                selectinload(Person.photo), selectinload(Person.assignments)
            ).where(Person.deleted_at.is_(None), Person.is_active.is_(True), Person.is_public.is_(True))
            if scope_type != "university":
                statement = statement.join(StaffAssignment).where(
                    StaffAssignment.deleted_at.is_(None),
                    StaffAssignment.entity_type == scope_type,
                    StaffAssignment.entity_id == scope_id,
                    StaffAssignment.status == "active",
                    StaffAssignment.is_public.is_(True),
                    or_(StaffAssignment.start_date.is_(None), StaffAssignment.start_date <= date.today()),
                    or_(StaffAssignment.end_date.is_(None), StaffAssignment.end_date >= date.today()),
                ).distinct()
            else:
                statement = statement.join(StaffAssignment).where(
                    StaffAssignment.deleted_at.is_(None),
                    StaffAssignment.entity_type == "university",
                    StaffAssignment.entity_id.is_(None),
                    StaffAssignment.status == "active",
                    StaffAssignment.is_public.is_(True),
                    or_(StaffAssignment.start_date.is_(None), StaffAssignment.start_date <= date.today()),
                    or_(StaffAssignment.end_date.is_(None), StaffAssignment.end_date >= date.today()),
                ).distinct()
            if query:
                statement = statement.where(ilike_any(query, Person.full_name, Person.academic_rank))
            statement = statement.order_by(Person.full_name.asc(), Person.id.asc())
            result = await paginate_query(db, statement, page=page, per_page=per_page)
            return _map_page(result, lambda item: _person_summary(item, scope_type, scope_id))

        if source_type == "intake":
            statement = _local_source_statement("intake").where(
                Intake.deleted_at.is_(None), Intake.is_active.is_(True),
            )
            if scope_type == "school":
                statement = statement.join(ProgrammeIntake).join(Programme).join(Department).join(School).where(
                    ProgrammeIntake.deleted_at.is_(None), ProgrammeIntake.is_active.is_(True),
                    Programme.deleted_at.is_(None), Programme.is_active.is_(True),
                    Department.deleted_at.is_(None), Department.is_active.is_(True),
                    School.deleted_at.is_(None), School.is_active.is_(True), School.is_public.is_(True),
                    Department.school_id == scope_id,
                ).distinct()
            elif scope_type != "university":
                statement = statement.where(false())
            if query:
                statement = statement.where(ilike_any(query, Intake.name, Intake.code, Intake.slug))
            statement = statement.order_by(Intake.application_end.asc(), Intake.name.asc(), Intake.id.asc())
            result = await paginate_query(db, statement, page=page, per_page=per_page)
            return _map_page(result, _intake_summary)

        if source_type == "academic_calendar":
            statement = _local_source_statement("academic_calendar").where(
                AcademicCalendar.deleted_at.is_(None), AcademicCalendar.status.in_(("published", "current")),
            )
            if scope_type == "school":
                statement = statement.join(Intake).join(ProgrammeIntake).join(Programme).join(Department).join(School).where(
                    Intake.deleted_at.is_(None), Intake.is_active.is_(True),
                    ProgrammeIntake.deleted_at.is_(None), ProgrammeIntake.is_active.is_(True),
                    Programme.deleted_at.is_(None), Programme.is_active.is_(True),
                    Department.deleted_at.is_(None), Department.is_active.is_(True),
                    School.deleted_at.is_(None), School.is_active.is_(True), School.is_public.is_(True),
                    Department.school_id == scope_id,
                ).distinct()
            elif scope_type != "university":
                statement = statement.where(false())
            if query:
                statement = statement.where(ilike_any(query, AcademicCalendar.academic_year, func.cast(AcademicCalendar.semester, String)))
            statement = statement.order_by(AcademicCalendar.academic_year.desc(), AcademicCalendar.semester.asc(), AcademicCalendar.id.asc())
            result = await paginate_query(db, statement, page=page, per_page=per_page)
            return _map_page(result, _calendar_summary)

        if source_type == "staff_assignment":
            now = datetime.now(timezone.utc)
            statement = _local_source_statement("staff_assignment").join(Person).where(
                StaffAssignment.deleted_at.is_(None), StaffAssignment.status == "active",
                StaffAssignment.is_public.is_(True),
                StaffAssignment.workflow_status == "published",
                StaffAssignment.archived_at.is_(None), StaffAssignment.unpublished_at.is_(None),
                StaffAssignment.published_at.is_not(None), StaffAssignment.published_at <= now,
                or_(StaffAssignment.start_date.is_(None), StaffAssignment.start_date <= date.today()),
                or_(StaffAssignment.end_date.is_(None), StaffAssignment.end_date >= date.today()),
                Person.deleted_at.is_(None), Person.is_active.is_(True), Person.is_public.is_(True),
                StaffAssignment.entity_type == scope_type,
                StaffAssignment.entity_id.is_(None) if scope_type == "university" else StaffAssignment.entity_id == scope_id,
            )
            if query:
                statement = statement.where(ilike_any(query, Person.full_name, StaffAssignment.title, StaffAssignment.public_role_label, StaffAssignment.role))
            statement = statement.order_by(StaffAssignment.hierarchy_level.asc(), StaffAssignment.display_order.asc(), Person.full_name.asc(), StaffAssignment.id.asc())
            result = await paginate_query(db, statement, page=page, per_page=per_page)
            return _map_page(result, _staff_assignment_summary)

        if source_type == "alumni":
            statement = _local_source_statement("alumni").join(Person).where(
                Alumni.deleted_at.is_(None), Alumni.is_public.is_(True), Alumni.is_verified.is_(True),
                Person.deleted_at.is_(None), Person.is_active.is_(True), Person.is_public.is_(True),
            )
            if scope_type != "university":
                statement = statement.where(false())
            if query:
                statement = statement.where(ilike_any(query, Person.full_name, Alumni.current_position, Alumni.industry))
            statement = statement.order_by(Alumni.graduation_year.desc(), Person.full_name.asc(), Alumni.id.asc())
            result = await paginate_query(db, statement, page=page, per_page=per_page)
            return _map_page(result, _alumni_summary)

        if source_type == "testimonial":
            statement = _local_source_statement("testimonial").where(
                Testimonial.deleted_at.is_(None), Testimonial.is_public.is_(True), Testimonial.is_approved.is_(True),
            )
            if scope_type != "university":
                statement = statement.where(false())
            if query:
                statement = statement.where(ilike_any(query, Testimonial.name, Testimonial.role, Testimonial.quote, Testimonial.full_story))
            statement = statement.order_by(Testimonial.display_order.asc(), Testimonial.name.asc(), Testimonial.id.asc())
            result = await paginate_query(db, statement, page=page, per_page=per_page)
            return _map_page(result, _testimonial_summary)

        if source_type == "club_activity":
            now = datetime.now(timezone.utc)
            statement = _local_source_statement("club_activity").join(Club).outerjoin(
                Department, Club.department_id == Department.id,
            ).where(
                ClubActivity.deleted_at.is_(None), ClubActivity.archived_at.is_(None),
                ClubActivity.status == "published", ClubActivity.is_public.is_(True), ClubActivity.is_published.is_(True),
                ClubActivity.workflow_status == "published", ClubActivity.unpublished_at.is_(None),
                or_(ClubActivity.scheduled_publish_at.is_(None), ClubActivity.scheduled_publish_at <= now),
                or_(ClubActivity.expires_at.is_(None), ClubActivity.expires_at >= now),
                Club.deleted_at.is_(None), Club.is_active.is_(True), Club.is_public.is_(True),
            )
            if scope_type == "school":
                statement = statement.where(or_(Club.school_id == scope_id, Department.school_id == scope_id))
            elif scope_type != "university":
                statement = statement.where(false())
            if query:
                statement = statement.where(ilike_any(query, ClubActivity.title, ClubActivity.description, Club.name))
            statement = statement.distinct().order_by(
                ClubActivity.start_datetime.asc(), ClubActivity.title.asc(), ClubActivity.id.asc(),
            )
            result = await paginate_query(db, statement, page=page, per_page=per_page)
            return _map_page(result, _club_activity_summary)

        if source_type == "research_partner":
            if scope_type not in {"university", "research"}:
                raise ValueError(f"Research partner catalog is not available for scope {scope_type}")
            return await PageCmsSourceService._search_partners(query, page, per_page)

        return await PageCmsSourceService._search_stats(db, query, scope_type, scope_id, page, per_page)

    @staticmethod
    async def resolve(
        db,
        source_type: str,
        source_id: uuid.UUID,
        *,
        destination_scope_type: str,
        destination_scope_id: uuid.UUID | None,
        preview_capability: PageCmsPreviewCapability | None = None,
    ) -> PageCmsSourceSummary | None:
        PageCmsSourceService.validate_source_type(source_type)
        now = datetime.now(timezone.utc)

        if source_type == "programme":
            statement = select(Programme).options(
                selectinload(Programme.cover_image),
                selectinload(Programme.department).selectinload(Department.school),
            ).where(
                Programme.id == source_id, Programme.deleted_at.is_(None)
            )
            if preview_capability is None:
                statement = statement.join(Department).join(School).where(
                    Programme.is_active.is_(True),
                    Department.deleted_at.is_(None), Department.is_active.is_(True), Department.is_public.is_(True),
                    School.deleted_at.is_(None), School.is_active.is_(True), School.is_public.is_(True),
                )
                if destination_scope_type == "school":
                    statement = statement.where(Department.school_id == destination_scope_id)
            item = (await db.execute(statement)).scalar_one_or_none()
            if item is None:
                return None
            school_id = item.department.school_id if item.department else None
            scope_matches = destination_scope_type == "university" or (
                destination_scope_type == "school" and destination_scope_id == school_id
            )
            if not scope_matches:
                return None
            if _programme_is_public(item):
                return _programme_summary(item)
            if not await PageCmsSourceService._preview_allowed(
                preview_capability, "school", school_id, destination_scope_type, destination_scope_id,
            ):
                return None
            return _programme_summary(item)

        if source_type in {"news", "event"}:
            model = News if source_type == "news" else Event
            media_relation = News.featured_media if model is News else Event.featured_media
            statement = select(model).options(selectinload(media_relation)).where(
                model.id == source_id, model.deleted_at.is_(None)
            )
            if preview_capability is None:
                statement = statement.where(*_public_content_filters(model, now))
                statement = _apply_content_scope(
                    statement, model, destination_scope_type, destination_scope_id,
                )
                if model is Event:
                    statement = statement.where(func.coalesce(Event.end_date, Event.start_date) >= now)
            item = (await db.execute(statement)).scalar_one_or_none()
            if item is None:
                return None
            source_scope_type = item.scope_type or "university"
            source_scope_id = item.scope_id
            if source_scope_type != destination_scope_type or source_scope_id != destination_scope_id:
                return None
            is_public = _content_is_selectable(item, now)
            if model is Event:
                is_public = is_public and (item.end_date or item.start_date) >= now
            if not is_public and not await PageCmsSourceService._preview_allowed(
                preview_capability,
                source_scope_type,
                source_scope_id,
                destination_scope_type,
                destination_scope_id,
            ):
                return None
            return _news_summary(item, now) if model is News else _event_summary(item, now)

        if source_type == "person":
            statement = select(Person).options(
                selectinload(Person.photo), selectinload(Person.assignments)
            ).where(Person.id == source_id, Person.deleted_at.is_(None))
            if preview_capability is None:
                statement = statement.join(StaffAssignment).where(
                    Person.is_active.is_(True),
                    Person.is_public.is_(True),
                    StaffAssignment.deleted_at.is_(None),
                    StaffAssignment.entity_type == destination_scope_type,
                    StaffAssignment.entity_id == destination_scope_id,
                    StaffAssignment.status == "active",
                    StaffAssignment.is_public.is_(True),
                    or_(StaffAssignment.start_date.is_(None), StaffAssignment.start_date <= date.today()),
                    or_(StaffAssignment.end_date.is_(None), StaffAssignment.end_date >= date.today()),
                )
            item = (await db.execute(statement)).scalar_one_or_none()
            if item is None:
                return None
            public_assignment = _assignment_for_scope(item, destination_scope_type, destination_scope_id)
            person_is_public = bool(item.is_active and item.is_public and public_assignment)
            if person_is_public:
                return _person_summary(item, destination_scope_type, destination_scope_id)
            private_assignment = _assignment_for_scope(
                item, destination_scope_type, destination_scope_id, include_private=True,
            )
            if private_assignment is None or not await PageCmsSourceService._preview_allowed(
                preview_capability,
                destination_scope_type,
                destination_scope_id,
                destination_scope_type,
                destination_scope_id,
            ):
                return None
            return _person_summary(
                item, destination_scope_type, destination_scope_id, include_private_assignment=True,
            )

        if source_type in LOCAL_SOURCE_TYPES:
            model = {
                "intake": Intake,
                "academic_calendar": AcademicCalendar,
                "staff_assignment": StaffAssignment,
                "alumni": Alumni,
                "testimonial": Testimonial,
                "club_activity": ClubActivity,
            }[source_type]
            statement = _local_source_statement(source_type).where(
                model.id == source_id,
                model.deleted_at.is_(None),
            )
            item = (await db.execute(statement)).scalar_one_or_none()
            if item is None or not _not_deleted(item) or not _local_scope_matches(
                source_type, item, destination_scope_type, destination_scope_id,
            ):
                return None
            if _local_is_public(source_type, item):
                return _local_summary(source_type, item)
            source_scope_type, source_scope_id = _local_preview_scope(
                source_type, item, destination_scope_type, destination_scope_id,
            )
            if not await PageCmsSourceService._preview_allowed(
                preview_capability,
                source_scope_type,
                source_scope_id,
                destination_scope_type,
                destination_scope_id,
            ):
                return None
            return _local_summary(source_type, item)

        if source_type == "research_partner":
            if destination_scope_type not in {"university", "research"}:
                return None
            records = await PageCmsSourceService._load_public_partners("")
            item = next((record for record in records if str(record.get("id")) == str(source_id)), None)
            if item and _partner_is_public(item):
                return _partner_summary(item)
            if preview_capability is not None:
                raise PageCmsSourcePreviewUnsupportedError(
                    "Research partner preview is unsupported because no privileged provider endpoint is available"
                )
            return None

        result = await PageCmsSourceService._search_stats(
            db, "", destination_scope_type, destination_scope_id, 1, 50,
        )
        return next((item for item in result.items if item.id == source_id), None)

    @staticmethod
    async def resolve_many(
        db,
        references: Sequence[tuple[str, uuid.UUID]],
        *,
        destination_scope_type: str,
        destination_scope_id: uuid.UUID | None,
        preview_capability: PageCmsPreviewCapability | None = None,
        resolution_cache: PageCmsSourceResolutionCache | None = None,
    ) -> dict[tuple[str, uuid.UUID], PageCmsSourceResolution]:
        unique_references = list(dict.fromkeys(references))
        results: dict[tuple[str, uuid.UUID], PageCmsSourceResolution] = {}
        grouped: dict[str, list[uuid.UUID]] = {}
        for source_type, source_id in unique_references:
            if source_type not in SUPPORTED_SOURCE_TYPES:
                results[(source_type, source_id)] = _source_resolution(
                    source_type,
                    source_id,
                    PageCmsSourceResolutionState.UNSUPPORTED_TYPE,
                )
                continue
            grouped.setdefault(source_type, []).append(source_id)

        capability_cache: dict[tuple[str, uuid.UUID | None], bool] = {}

        async def preview_allowed(source_scope_type: str, source_scope_id: uuid.UUID | None) -> bool:
            key = (source_scope_type, source_scope_id)
            if key not in capability_cache:
                capability_cache[key] = await PageCmsSourceService._preview_allowed(
                    preview_capability,
                    source_scope_type,
                    source_scope_id,
                    destination_scope_type,
                    destination_scope_id,
                )
            return capability_cache[key]

        programme_ids = grouped.get("programme", [])
        if programme_ids:
            programmes = await _load_records_in_chunks(
                db,
                programme_ids,
                lambda source_id_chunk: select(Programme).options(
                    selectinload(Programme.cover_image),
                    selectinload(Programme.department).selectinload(Department.school),
                ).where(Programme.id.in_(source_id_chunk), Programme.deleted_at.is_(None)),
            )
            for source_id in programme_ids:
                item = programmes.get(source_id)
                if item is None or not _not_deleted(item):
                    state = PageCmsSourceResolutionState.UNAVAILABLE
                    results[("programme", source_id)] = _source_resolution("programme", source_id, state)
                    continue
                school_id = item.department.school_id if item.department else None
                scope_matches = destination_scope_type == "university" or (
                    destination_scope_type == "school" and destination_scope_id == school_id
                )
                if not scope_matches:
                    results[("programme", source_id)] = _source_resolution(
                        "programme", source_id, PageCmsSourceResolutionState.INACCESSIBLE,
                    )
                    continue
                is_public = _programme_is_public(item)
                if is_public or await preview_allowed("school", school_id):
                    results[("programme", source_id)] = _source_resolution(
                        "programme",
                        source_id,
                        PageCmsSourceResolutionState.RESOLVED,
                        _programme_summary(item),
                    )
                else:
                    results[("programme", source_id)] = _source_resolution(
                        "programme", source_id, PageCmsSourceResolutionState.UNAVAILABLE,
                    )

        for source_type, model in (("news", News), ("event", Event)):
            source_ids = grouped.get(source_type, [])
            if not source_ids:
                continue
            media_relation = News.featured_media if model is News else Event.featured_media
            records = await _load_records_in_chunks(
                db,
                source_ids,
                lambda source_id_chunk: select(model).options(selectinload(media_relation)).where(
                    model.id.in_(source_id_chunk),
                    model.deleted_at.is_(None),
                ),
            )
            now = datetime.now(timezone.utc)
            for source_id in source_ids:
                item = records.get(source_id)
                if item is None:
                    results[(source_type, source_id)] = _source_resolution(
                        source_type, source_id, PageCmsSourceResolutionState.UNAVAILABLE,
                    )
                    continue
                source_scope_type = item.scope_type or "university"
                source_scope_id = item.scope_id
                if source_scope_type != destination_scope_type or source_scope_id != destination_scope_id:
                    results[(source_type, source_id)] = _source_resolution(
                        source_type, source_id, PageCmsSourceResolutionState.INACCESSIBLE,
                    )
                    continue
                if item.archived_at is not None:
                    results[(source_type, source_id)] = _source_resolution(
                        source_type, source_id, PageCmsSourceResolutionState.UNAVAILABLE,
                    )
                    continue
                is_public = _content_is_selectable(item, now)
                if model is Event:
                    is_public = is_public and (item.end_date or item.start_date) >= now
                if is_public or await preview_allowed(source_scope_type, source_scope_id):
                    summary = _news_summary(item, now) if model is News else _event_summary(item, now)
                    results[(source_type, source_id)] = _source_resolution(
                        source_type,
                        source_id,
                        PageCmsSourceResolutionState.RESOLVED,
                        summary,
                    )
                else:
                    results[(source_type, source_id)] = _source_resolution(
                        source_type, source_id, PageCmsSourceResolutionState.UNAVAILABLE,
                    )

        person_ids = grouped.get("person", [])
        if person_ids:
            people = await _load_records_in_chunks(
                db,
                person_ids,
                lambda source_id_chunk: select(Person).options(
                    selectinload(Person.photo),
                    selectinload(Person.assignments),
                ).where(Person.id.in_(source_id_chunk), Person.deleted_at.is_(None)),
            )
            for source_id in person_ids:
                item = people.get(source_id)
                if item is None:
                    results[("person", source_id)] = _source_resolution(
                        "person", source_id, PageCmsSourceResolutionState.UNAVAILABLE,
                    )
                    continue
                public_assignment = _assignment_for_scope(item, destination_scope_type, destination_scope_id)
                private_assignment = _assignment_for_scope(
                    item,
                    destination_scope_type,
                    destination_scope_id,
                    include_private=True,
                )
                if private_assignment is None:
                    results[("person", source_id)] = _source_resolution(
                        "person", source_id, PageCmsSourceResolutionState.INACCESSIBLE,
                    )
                    continue
                if item.is_active and item.is_public and public_assignment:
                    summary = _person_summary(item, destination_scope_type, destination_scope_id)
                    results[("person", source_id)] = _source_resolution(
                        "person", source_id, PageCmsSourceResolutionState.RESOLVED, summary,
                    )
                elif await preview_allowed(destination_scope_type, destination_scope_id):
                    summary = _person_summary(
                        item,
                        destination_scope_type,
                        destination_scope_id,
                        include_private_assignment=True,
                    )
                    results[("person", source_id)] = _source_resolution(
                        "person", source_id, PageCmsSourceResolutionState.RESOLVED, summary,
                    )
                else:
                    results[("person", source_id)] = _source_resolution(
                        "person", source_id, PageCmsSourceResolutionState.UNAVAILABLE,
                    )

        local_models = {
            "intake": Intake,
            "academic_calendar": AcademicCalendar,
            "staff_assignment": StaffAssignment,
            "alumni": Alumni,
            "testimonial": Testimonial,
            "club_activity": ClubActivity,
        }
        for source_type, model in local_models.items():
            source_ids = grouped.get(source_type, [])
            if not source_ids:
                continue
            records = await _load_records_in_chunks(
                db,
                source_ids,
                lambda source_id_chunk: _local_source_statement(source_type).where(
                    model.id.in_(source_id_chunk), model.deleted_at.is_(None),
                ),
            )
            for source_id in source_ids:
                item = records.get(source_id)
                if item is None:
                    results[(source_type, source_id)] = _source_resolution(
                        source_type, source_id, PageCmsSourceResolutionState.UNAVAILABLE,
                    )
                    continue
                if not _local_scope_matches(source_type, item, destination_scope_type, destination_scope_id):
                    results[(source_type, source_id)] = _source_resolution(
                        source_type, source_id, PageCmsSourceResolutionState.INACCESSIBLE,
                    )
                    continue
                if _local_is_public(source_type, item):
                    results[(source_type, source_id)] = _source_resolution(
                        source_type, source_id, PageCmsSourceResolutionState.RESOLVED,
                        _local_summary(source_type, item),
                    )
                    continue
                source_scope_type, source_scope_id = _local_preview_scope(
                    source_type, item, destination_scope_type, destination_scope_id,
                )
                if await preview_allowed(source_scope_type, source_scope_id):
                    results[(source_type, source_id)] = _source_resolution(
                        source_type, source_id, PageCmsSourceResolutionState.RESOLVED,
                        _local_summary(source_type, item),
                    )
                else:
                    results[(source_type, source_id)] = _source_resolution(
                        source_type, source_id, PageCmsSourceResolutionState.UNAVAILABLE,
                    )

        partner_ids = grouped.get("research_partner", [])
        if partner_ids:
            if destination_scope_type not in {"university", "research"}:
                for source_id in partner_ids:
                    results[("research_partner", source_id)] = _source_resolution(
                        "research_partner", source_id, PageCmsSourceResolutionState.INACCESSIBLE,
                    )
            else:
                try:
                    if resolution_cache and resolution_cache.public_partner_error is not None:
                        raise resolution_cache.public_partner_error
                    if resolution_cache and resolution_cache.public_partner_records is not None:
                        partner_records = resolution_cache.public_partner_records
                    else:
                        partner_records = await PageCmsSourceService._load_public_partners("")
                        if resolution_cache is not None:
                            resolution_cache.public_partner_records = partner_records
                except PageCmsSourceProviderError as exc:
                    if resolution_cache is not None:
                        resolution_cache.public_partner_error = exc
                    for source_id in partner_ids:
                        results[("research_partner", source_id)] = _source_resolution(
                            "research_partner", source_id, PageCmsSourceResolutionState.PROVIDER_ERROR,
                        )
                else:
                    partners_by_id = {str(item.get("id")): item for item in partner_records}
                    for source_id in partner_ids:
                        item = partners_by_id.get(str(source_id))
                        if item is not None and _partner_is_public(item):
                            results[("research_partner", source_id)] = _source_resolution(
                                "research_partner",
                                source_id,
                                PageCmsSourceResolutionState.RESOLVED,
                                _partner_summary(item),
                            )
                        else:
                            state = (
                                PageCmsSourceResolutionState.PREVIEW_UNSUPPORTED
                                if preview_capability is not None
                                else PageCmsSourceResolutionState.UNAVAILABLE
                            )
                            results[("research_partner", source_id)] = _source_resolution(
                                "research_partner", source_id, state,
                            )

        stat_ids = grouped.get("public_stat", [])
        if stat_ids:
            try:
                stats = await PageCmsSourceService._load_stat_summaries(
                    db,
                    destination_scope_type,
                    destination_scope_id,
                )
            except PageCmsSourceProviderError:
                for source_id in stat_ids:
                    results[("public_stat", source_id)] = _source_resolution(
                        "public_stat", source_id, PageCmsSourceResolutionState.PROVIDER_ERROR,
                    )
            else:
                stats_by_id = {item.id: item for item in stats}
                for source_id in stat_ids:
                    source = stats_by_id.get(source_id)
                    state = (
                        PageCmsSourceResolutionState.RESOLVED
                        if source is not None
                        else PageCmsSourceResolutionState.UNAVAILABLE
                    )
                    results[("public_stat", source_id)] = _source_resolution(
                        "public_stat", source_id, state, source,
                    )

        return results

    @staticmethod
    async def _preview_allowed(
        capability: PageCmsPreviewCapability | None,
        source_scope_type: str,
        source_scope_id: uuid.UUID | None,
        destination_scope_type: str,
        destination_scope_id: uuid.UUID | None,
    ) -> bool:
        if capability is None:
            return False
        return await capability.allows(
            source_scope_type=source_scope_type,
            source_scope_id=source_scope_id,
            destination_scope_type=destination_scope_type,
            destination_scope_id=destination_scope_id,
        )

    @staticmethod
    async def _search_partners(query: str, page: int, per_page: int) -> PaginatedResult:
        records = await PageCmsSourceService._load_public_partners(query)
        unique_records = {str(item["id"]): item for item in records}
        summaries = [_partner_summary(item) for item in unique_records.values()]
        summaries.sort(key=lambda item: (item.label.casefold(), str(item.id)))
        total = len(summaries)
        start = (page - 1) * per_page
        return PaginatedResult(
            items=summaries[start:start + per_page],
            meta={
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": math.ceil(total / per_page) if total else 0,
            },
        )

    @staticmethod
    async def _load_public_partners(query: str) -> list[dict[str, Any]]:
        remote_page = 1
        records: list[dict[str, Any]] = []
        expected_pages: int | None = None
        expected_total: int | None = None
        traversed_count = 0
        while True:
            try:
                payload = await ResearchPartnersProxyService.list_partners(
                    page=remote_page,
                    per_page=50,
                    search=query or None,
                    status="active",
                    is_active=True,
                )
            except PageCmsSourceProviderError:
                raise
            except (httpx.HTTPError, ValueError) as exc:
                raise PageCmsSourceProviderError("Research partner provider is unavailable") from exc
            remote_records = payload.get("data")
            meta = payload.get("meta")
            if not isinstance(remote_records, list) or not isinstance(meta, dict):
                raise PageCmsSourceProviderError("Research partner provider returned an invalid page")
            pages = meta.get("pages")
            total = meta.get("total")
            provider_page = meta.get("page")
            if not all(isinstance(value, int) and not isinstance(value, bool) for value in (pages, total, provider_page)):
                raise PageCmsSourceProviderError("Research partner provider returned invalid pagination metadata")
            if provider_page != remote_page or pages < 0 or total < 0 or (total > 0 and pages < 1):
                raise PageCmsSourceProviderError("Research partner provider returned inconsistent pagination metadata")
            if expected_pages is None:
                expected_pages, expected_total = pages, total
            elif pages != expected_pages or total != expected_total:
                raise PageCmsSourceProviderError("Research partner pagination metadata changed during traversal")

            if remote_page < pages and not remote_records:
                raise PageCmsSourceProviderError("Research partner pagination made no progress")
            traversed_count += len(remote_records)
            records.extend(item for item in remote_records if isinstance(item, dict) and _partner_is_public(item))
            if remote_page >= pages:
                break
            remote_page += 1

        if expected_total is not None and traversed_count != expected_total:
            raise PageCmsSourceProviderError("Research partner provider total does not match traversed records")
        return records

    @staticmethod
    async def _search_stats(
        db,
        query: str,
        scope_type: str,
        scope_id: uuid.UUID | None,
        page: int,
        per_page: int,
    ) -> PaginatedResult:
        summaries = await PageCmsSourceService._load_stat_summaries(db, scope_type, scope_id)
        if query:
            term = query.casefold()
            summaries = [
                item for item in summaries
                if term in item.label.casefold()
                or term in str(item.metadata.get("description", "")).casefold()
            ]
        summaries.sort(key=lambda item: (item.label.casefold(), str(item.id)))
        total = len(summaries)
        start = (page - 1) * per_page
        return PaginatedResult(
            items=summaries[start:start + per_page],
            meta={
                "page": page,
                "per_page": per_page,
                "total": total,
                "pages": math.ceil(total / per_page) if total else 0,
            },
        )

    @staticmethod
    async def _load_stat_summaries(
        db,
        scope_type: str,
        scope_id: uuid.UUID | None,
    ) -> list[PageCmsSourceSummary]:
        stats_scope = scope_type
        slug = None
        if scope_type == "school":
            school = (await db.execute(
                select(School).where(
                    School.id == scope_id,
                    School.deleted_at.is_(None),
                    School.is_active.is_(True),
                    School.is_public.is_(True),
                )
            )).scalar_one_or_none()
            if school is None:
                return []
            slug = school.slug
        elif scope_type not in {"homepage", "university", "research", "library"}:
            return []

        if scope_type in {"research", "library"}:
            response = await PageCmsStatsProxyService.get_public_stats(scope_type)
            response_scope = response["scope"]
            response_stats = response["stats"]
        else:
            response = await public_stats(db, scope=stats_scope, slug=slug)
            response_scope = response.scope if response else stats_scope
            response_stats = response.stats if response else []
        scope_identity = str(scope_id) if scope_id is not None else None
        return [
            _stat_summary(item, response_scope, scope_identity)
            for item in response_stats
        ]


__all__ = [
    "PageCmsPreviewCapability",
    "PageCmsSourceResolution",
    "PageCmsSourceResolutionCache",
    "PageCmsSourceResolutionState",
    "PageCmsSourcePreviewUnsupportedError",
    "PageCmsSourceProviderError",
    "PageCmsSourceService",
    "PAGE_CMS_BULK_CHUNK_SIZE",
    "SUPPORTED_SOURCE_TYPES",
]
