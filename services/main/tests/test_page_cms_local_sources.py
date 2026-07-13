from __future__ import annotations

import uuid
from datetime import date, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

from app.models import (
    AcademicCalendar,
    Alumni,
    Club,
    ClubActivity,
    Department,
    Intake,
    Person,
    Programme,
    ProgrammeIntake,
    School,
    StaffAssignment,
    Testimonial as MarketingTestimonial,
)
from app.services.page_cms_sources import (
    PageCmsSourceResolutionState,
    PageCmsSourceService,
)
from ksu_common import PaginatedResult


class _ScalarResult:
    def __init__(self, value):
        self.value = value

    def scalar_one_or_none(self):
        return self.value

    def scalars(self):
        return self

    def all(self):
        if self.value is None:
            return []
        return list(self.value) if isinstance(self.value, (list, tuple)) else [self.value]


class _Db:
    def __init__(self, value=None):
        self.value = value
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        return _ScalarResult(self.value)


class _PreviewCapability:
    def __init__(self, scope_type: str, scope_id: uuid.UUID | None):
        self.scope_type = scope_type
        self.scope_id = scope_id

    async def allows(self, *, source_scope_type, source_scope_id, destination_scope_type, destination_scope_id):
        return (
            source_scope_type == self.scope_type == destination_scope_type
            and source_scope_id == self.scope_id == destination_scope_id
        )


def _page(*items):
    return PaginatedResult(
        items=list(items),
        meta={"page": 1, "per_page": 20, "total": len(items), "pages": 1 if items else 0},
    )


def _school_tree():
    school = School(name="School of Computing", slug="computing", code="SOC", is_active=True, is_public=True)
    school.id = uuid.uuid4()
    department = Department(
        name="Computer Science", slug="computer-science", code="CSC", school_id=school.id,
        is_active=True, is_public=True,
    )
    department.id = uuid.uuid4()
    department.school = school
    programme = Programme(
        name="Bachelor of Software Engineering", code="BSE", slug="software-engineering",
        level="undergraduate", duration="4 years", department_id=department.id, is_active=True,
    )
    programme.id = uuid.uuid4()
    programme.department = department
    return school, department, programme


def _person(name: str = "Amina Otieno"):
    first_name, last_name = name.split()
    person = Person(
        first_name=first_name, last_name=last_name, full_name=name,
        email=f"{first_name.casefold()}@example.test", is_active=True, is_public=True,
    )
    person.id = uuid.uuid4()
    return person


def _intake(school_id: uuid.UUID):
    _, department, programme = _school_tree()
    department.school_id = school_id
    programme.department = department
    calendar = AcademicCalendar(
        academic_year="2026/2027", semester=1, start_date=date(2026, 9, 1), end_date=date(2026, 12, 15),
        status="published",
    )
    calendar.id = uuid.uuid4()
    intake = Intake(
        name="September 2026 Intake", code="SEP26", slug="september-2026",
        academic_calendar_id=calendar.id, application_start=date(2026, 4, 1), application_end=date(2026, 8, 31),
        is_active=True, is_open=True,
    )
    intake.id = uuid.uuid4()
    intake.academic_calendar = calendar
    programme_intake = ProgrammeIntake(programme_id=programme.id, intake_id=intake.id, is_active=True)
    programme_intake.id = uuid.uuid4()
    programme_intake.programme = programme
    intake.programmes = [programme_intake]
    return intake


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("source_type", "factory", "scope_type", "scope_id", "expected_sql"),
    [
        ("intake", lambda school_id: _intake(school_id), "school", lambda school_id: school_id, ("intakes.deleted_at is null", "intakes.is_active is true", "programme_intakes.is_active is true", "departments.school_id")),
        ("academic_calendar", lambda school_id: _intake(school_id).academic_calendar, "school", lambda school_id: school_id, ("academic_calendars.deleted_at is null", "academic_calendars.status", "intakes", "programme_intakes", "departments.school_id")),
        ("staff_assignment", None, "school", lambda school_id: school_id, ("staff_assignments.deleted_at is null", "staff_assignments.status", "staff_assignments.is_public is true", "persons.is_active is true", "persons.is_public is true", "staff_assignments.entity_id")),
        ("alumni", None, "university", lambda _school_id: None, ("alumni.deleted_at is null", "alumni.is_public is true", "alumni.is_verified is true", "persons.is_active is true", "persons.is_public is true")),
        ("testimonial", None, "university", lambda _school_id: None, ("testimonials.deleted_at is null", "testimonials.is_public is true", "testimonials.is_approved is true")),
        ("club_activity", None, "school", lambda school_id: school_id, ("club_activities.deleted_at is null", "club_activities.is_public is true", "club_activities.is_published is true", "club_activities.status", "clubs.is_active is true", "clubs.is_public is true")),
    ],
)
async def test_local_source_searches_filter_public_records_and_return_sanitized_summaries(
    source_type, factory, scope_type, scope_id, expected_sql,
):
    school_id = uuid.uuid4()
    if source_type == "staff_assignment":
        person = _person()
        item = StaffAssignment(
            person_id=person.id, entity_type="school", entity_id=school_id, role="dean",
            title="Dean of Computing", status="active", is_public=True,
        )
        item.id = uuid.uuid4()
        item.person = person
    elif source_type == "alumni":
        person = _person()
        item = Alumni(person_id=person.id, graduation_year=2020, is_public=True, is_verified=True)
        item.id = uuid.uuid4()
        item.person = person
        item.programme = None
        item.school = None
    elif source_type == "testimonial":
        item = MarketingTestimonial(
            name="Jane Doe", role="Software Engineer", quote="KSU prepared me well.",
            full_story="A public account of study.", testimonial_type="alumni", is_public=True, is_approved=True,
        )
        item.id = uuid.uuid4()
    elif source_type == "club_activity":
        club = Club(name="Robotics Club", slug="robotics", club_type="academic", school_id=school_id, is_active=True, is_public=True)
        club.id = uuid.uuid4()
        item = ClubActivity(
            club_id=club.id, title="Robotics Showcase", slug="showcase", description="Public demo",
            activity_type="event", start_datetime=date.today(), status="published", is_public=True, is_published=True,
        )
        item.id = uuid.uuid4()
        item.club = club
    else:
        item = factory(school_id)

    with patch("app.services.page_cms_sources.paginate_query", AsyncMock(return_value=_page(item))) as paginate:
        result = await PageCmsSourceService.search(
            _Db(), source_type, "comput", scope_type, scope_id(school_id), 1, 20,
        )

    sql = str(paginate.await_args.args[1]).lower()
    for expected in expected_sql:
        assert expected in sql
    assert result.items[0].source_type == source_type
    assert result.items[0].id == item.id
    assert not any(key.endswith("_id") for key in result.items[0].metadata)


@pytest.mark.asyncio
async def test_local_source_summaries_expose_human_metadata_only():
    school_id = uuid.uuid4()
    intake = _intake(school_id)
    calendar = intake.academic_calendar
    person = _person()
    assignment = StaffAssignment(
        person_id=person.id, entity_type="university", role="director", title="Director of Quality",
        status="active", is_public=True,
    )
    assignment.id = uuid.uuid4()
    assignment.person = person
    alumni = Alumni(person_id=person.id, graduation_year=2020, is_public=True, is_verified=True)
    alumni.id = uuid.uuid4()
    alumni.person = person
    alumni.programme = intake.programmes[0].programme
    alumni.school = intake.programmes[0].programme.department.school
    testimonial = MarketingTestimonial(
        name="Jane Doe", role="Engineer", quote="A public quote", full_story="A public story",
        testimonial_type="alumni", is_public=True, is_approved=True,
    )
    testimonial.id = uuid.uuid4()
    club = Club(name="Robotics Club", slug="robotics-human", club_type="academic", school_id=school_id, is_active=True, is_public=True)
    club.id = uuid.uuid4()
    activity = ClubActivity(
        club_id=club.id, title="Robotics Showcase", slug="showcase-human", description="Public demo",
        activity_type="event", start_datetime=date.today(), status="published", is_public=True, is_published=True,
    )
    activity.id = uuid.uuid4()
    activity.club = club

    cases = [
        ("intake", intake, "university", None, "September 2026 Intake"),
        ("academic_calendar", calendar, "university", None, "2026/2027 Semester 1"),
        ("staff_assignment", assignment, "university", None, "Amina Otieno"),
        ("alumni", alumni, "university", None, "Amina Otieno"),
        ("testimonial", testimonial, "university", None, "Jane Doe"),
        ("club_activity", activity, "university", None, "Robotics Showcase"),
    ]
    for source_type, item, scope_type, scope_id, label in cases:
        summary = await PageCmsSourceService.resolve(
            _Db(item), source_type, item.id, destination_scope_type=scope_type, destination_scope_id=scope_id,
        )
        assert summary is not None
        assert summary.label == label
        assert not any(key.endswith("_id") for key in summary.metadata)

    assert intake.code in (await PageCmsSourceService.resolve(_Db(intake), "intake", intake.id, destination_scope_type="university", destination_scope_id=None)).secondary_label
    assert testimonial.full_story in (await PageCmsSourceService.resolve(_Db(testimonial), "testimonial", testimonial.id, destination_scope_type="university", destination_scope_id=None)).metadata["story"]


@pytest.mark.asyncio
async def test_local_source_resolution_denies_wrong_scope_and_nonpublic_preview_without_capability():
    school_id = uuid.uuid4()
    other_school_id = uuid.uuid4()
    intake = _intake(school_id)
    private_testimonial = MarketingTestimonial(
        name="Private Person", role="Private role", quote="Not public", testimonial_type="alumni",
        is_public=False, is_approved=False,
    )
    private_testimonial.id = uuid.uuid4()

    wrong_scope = await PageCmsSourceService.resolve(
        _Db(intake), "intake", intake.id, destination_scope_type="school", destination_scope_id=other_school_id,
    )
    public = await PageCmsSourceService.resolve(
        _Db(private_testimonial), "testimonial", private_testimonial.id,
        destination_scope_type="university", destination_scope_id=None,
    )
    preview = await PageCmsSourceService.resolve(
        _Db(private_testimonial), "testimonial", private_testimonial.id,
        destination_scope_type="university", destination_scope_id=None,
        preview_capability=_PreviewCapability("university", None),
    )

    assert wrong_scope is None
    assert public is None
    assert preview is not None
    assert preview.selectable is False


@pytest.mark.asyncio
async def test_preview_never_resolves_a_deleted_local_source():
    testimonial = MarketingTestimonial(
        name="Removed Person", role="Former role", quote="Removed", testimonial_type="alumni",
        is_public=False, is_approved=False,
    )
    testimonial.id = uuid.uuid4()
    testimonial.deleted_at = date.today()

    preview = await PageCmsSourceService.resolve(
        _Db(testimonial), "testimonial", testimonial.id,
        destination_scope_type="university", destination_scope_id=None,
        preview_capability=_PreviewCapability("university", None),
    )

    assert preview is None


@pytest.mark.asyncio
async def test_resolve_many_batches_local_sources_and_returns_unavailable_for_missing_records():
    school_id = uuid.uuid4()
    intake = _intake(school_id)
    missing_id = uuid.uuid4()
    db = _Db([intake])

    resolutions = await PageCmsSourceService.resolve_many(
        db,
        [("intake", intake.id), ("intake", missing_id)],
        destination_scope_type="school", destination_scope_id=school_id,
    )

    assert len(db.statements) == 1
    assert resolutions[("intake", intake.id)].state is PageCmsSourceResolutionState.RESOLVED
    assert resolutions[("intake", missing_id)].state is PageCmsSourceResolutionState.UNAVAILABLE


@pytest.mark.asyncio
async def test_resolve_many_marks_nonpublic_local_sources_unavailable_without_exposing_them():
    testimonial = MarketingTestimonial(
        name="Private Person", role="Private role", quote="Not public", testimonial_type="alumni",
        is_public=False, is_approved=False,
    )
    testimonial.id = uuid.uuid4()

    resolutions = await PageCmsSourceService.resolve_many(
        _Db([testimonial]), [("testimonial", testimonial.id)],
        destination_scope_type="university", destination_scope_id=None,
    )

    result = resolutions[("testimonial", testimonial.id)]
    assert result.state is PageCmsSourceResolutionState.UNAVAILABLE
    assert result.source is None
