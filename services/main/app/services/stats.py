"""Public-safe aggregate stats for the public website."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..models import (
    Announcement,
    ArtsCulture,
    Blog,
    Campus,
    Club,
    ClubActivity,
    ContactDirectory,
    Department,
    DepartmentService,
    Document,
    Event,
    FAQ,
    Intake,
    NewsletterSubscriber,
    News,
    Person,
    Programme,
    School,
    SportsFacility,
    StaffAssignment,
    SupportTicket,
    User,
    Division,
    Wing,
    Board,
    Alumni,
    AlumniAssociation,
    ExchangeProgramme,
    Media,
    MediaLink,
    PageSection,
    PartnershipSpotlight,
    Policy,
    Slider,
)
from ..schemas.stats import PortalStatsResponse, PublicStatItem, PublicStatsResponse


# These names are the dashboard contract.  Main-service portals are calculated
# below; service-owned portals use their matching research or library endpoint.
PORTAL_STAT_CONTRACTS: dict[str, tuple[str, ...]] = {
    "admin": (
        "boards_count",
        "divisions_count",
        "offices_count",
        "staff_assignments_count",
        "documents_count",
    ),
    "cocms": (
        "pending_review_count",
        "published_count",
        "draft_count",
        "scheduled_count",
        "media_count",
        "in_review_count",
        "changes_requested_count",
        "approved_count",
        "expired_count",
        "validation_blocker_count",
        "spotlight_count",
    ),
    "schools": ("schools_count", "programmes_count", "departments_count"),
    "departments": (
        "departments_count",
        "programmes_count",
        "unpublished_count",
    ),
    "student-clubs": ("active_clubs_count", "active_members_count"),
    "research": (
        "active_projects_count",
        "grants_count",
        "centres_count",
        "outputs_count",
    ),
    "library": (
        "active_branches_count",
        "catalogue_resources_count",
        "active_regulations_count",
        "loans_count",
    ),
    "publications": (
        "draft_count",
        "submitted_count",
        "school_approved_count",
        "published_count",
    ),
}

PORTAL_ALIASES = {
    "cocms": "corporate-communication",
    "publications": "research",
    "governance": "admin",
    "institutional-administration": "admin",
}


async def _count(db: AsyncSession, model, *conditions) -> int:
    result = await db.execute(
        select(func.count(model.id)).where(model.deleted_at.is_(None), *conditions)
    )
    return int(result.scalar_one() or 0)


async def _sum_publications_for_people(
    db: AsyncSession,
    person_ids_query,
) -> int:
    result = await db.execute(
        select(func.coalesce(func.sum(Person.publications_count), 0)).where(
            Person.deleted_at.is_(None),
            Person.id.in_(person_ids_query),
        )
    )
    return int(result.scalar_one() or 0)


async def _sum(db: AsyncSession, field, model, *conditions) -> int:
    result = await db.execute(
        select(func.coalesce(func.sum(field), 0)).where(
            model.deleted_at.is_(None),
            *conditions,
        )
    )
    return int(result.scalar_one() or 0)


class _PageCmsStatsPreviewCapability:
    """Authorize validation only within the section's own page scope."""

    def __init__(self, scope_type: str, scope_id):
        self.scope_type = scope_type
        self.scope_id = scope_id

    async def allows(
        self,
        *,
        source_scope_type: str,
        source_scope_id,
        destination_scope_type: str,
        destination_scope_id,
    ) -> bool:
        return (
            source_scope_type == self.scope_type == destination_scope_type
            and source_scope_id == self.scope_id == destination_scope_id
        )


def _page_cms_active_publication_start(model, now):
    return (
        or_(model.valid_from.is_(None), model.valid_from <= now),
        or_(model.scheduled_publish_at.is_(None), model.scheduled_publish_at <= now),
    )


def _page_cms_active_publication_window(model, now):
    return (
        *_page_cms_active_publication_start(model, now),
        or_(model.valid_to.is_(None), model.valid_to >= now),
        or_(model.expires_at.is_(None), model.expires_at >= now),
    )


def _page_cms_public_composition_candidate(model):
    return (
        model.is_enabled.is_(True),
        model.status == "published",
        model.workflow_status == "published",
    )


async def _page_cms_workflow_stats(db: AsyncSession) -> dict[str, int]:
    now = datetime.now(timezone.utc)
    future_start = or_(
        PageSection.valid_from > now,
        PageSection.scheduled_publish_at > now,
    )
    scheduled = and_(
        *_page_cms_public_composition_candidate(PageSection),
        future_start,
    )
    expired = and_(
        *_page_cms_public_composition_candidate(PageSection),
        *_page_cms_active_publication_start(PageSection, now),
        or_(
            PageSection.valid_to < now,
            PageSection.expires_at < now,
        ),
    )
    result = await db.execute(
        select(
            func.count(PageSection.id)
            .filter(PageSection.workflow_status == "draft")
            .label("draft_count"),
            func.count(PageSection.id)
            .filter(PageSection.workflow_status == "in_review")
            .label("in_review_count"),
            func.count(PageSection.id)
            .filter(PageSection.workflow_status == "changes_requested")
            .label("changes_requested_count"),
            func.count(PageSection.id)
            .filter(PageSection.workflow_status == "approved")
            .label("approved_count"),
            func.count(PageSection.id).filter(scheduled).label("scheduled_count"),
            func.count(PageSection.id)
            .filter(
                *_page_cms_public_composition_candidate(PageSection),
                *_page_cms_active_publication_window(PageSection, now),
            )
            .label("published_count"),
            func.count(PageSection.id).filter(expired).label("expired_count"),
        ).where(PageSection.deleted_at.is_(None))
    )
    return {key: int(value or 0) for key, value in result.mappings().one().items()}


async def _page_cms_validation_blocker_count(db: AsyncSession) -> int:
    from .page_cms import PageSectionValidationService, group_preview_media_links_many
    from .page_cms_sources import PageCmsSourceResolutionCache

    result = await db.execute(
        select(PageSection)
        .options(selectinload(PageSection.items))
        .where(
            PageSection.deleted_at.is_(None),
            PageSection.status != "archived",
        )
    )
    sections = list(result.scalars().all())
    if not sections:
        return 0

    media_by_section = await group_preview_media_links_many(
        db,
        "page_section",
        [section.id for section in sections],
    )
    sections_by_scope = {}
    for section in sections:
        key = (section.page_key, section.scope_type, section.scope_id)
        sections_by_scope.setdefault(key, []).append(section)

    blocker_count = 0
    resolution_cache = PageCmsSourceResolutionCache()
    for (_, scope_type, scope_id), scoped_sections in sections_by_scope.items():
        resolved_by_section = await PageSectionValidationService.resolve_items_for_sections(
            db,
            scoped_sections,
            _PageCmsStatsPreviewCapability(scope_type, scope_id),
            resolution_cache=resolution_cache,
        )
        for section in scoped_sections:
            issues = PageSectionValidationService.validate(
                section,
                resolved_by_section.get(section.id, []),
                media_by_section.get(section.id, {}),
            )
            blocker_count += int(any(issue.blocking for issue in issues))
    return blocker_count


async def _page_cms_spotlight_count(db: AsyncSession) -> int:
    result = await db.execute(
        select(func.count(PartnershipSpotlight.id).label("spotlight_count")).where(
            PartnershipSpotlight.deleted_at.is_(None)
        )
    )
    return int(result.mappings().one()["spotlight_count"] or 0)


def _item(
    key: str,
    label: str,
    value: int,
    description: str,
    href: str | None = None,
    suffix: str = "",
) -> PublicStatItem:
    return PublicStatItem(
        key=key,
        label=label,
        value=value,
        suffix=suffix,
        description=description,
        href=href,
    )


async def homepage_stats(db: AsyncSession) -> PublicStatsResponse:
    def public_content(model):
        return (
            model.is_public.is_(True),
            model.is_published.is_(True),
            model.status == "published",
            model.archived_at.is_(None),
            model.deleted_at.is_(None),
        )

    students_result = await db.execute(
        select(
            func.coalesce(
                func.sum(Department.student_count + Department.postgraduate_student_count),
                0,
            )
        ).where(
            Department.deleted_at.is_(None),
            Department.is_active.is_(True),
            Department.is_public.is_(True),
            Department.department_type == "academic",
        )
    )
    students = int(students_result.scalar_one() or 0)

    stats = [
        _item(
            "schools",
            "Schools",
            await _count(db, School, School.is_active.is_(True), School.is_public.is_(True)),
            "Active public schools",
            "/academics/schools",
        ),
        _item(
            "departments",
            "Departments",
            await _count(
                db,
                Department,
                Department.is_active.is_(True),
                Department.is_public.is_(True),
                Department.department_type == "academic",
            ),
            "Active public academic departments",
            "/academics/departments",
        ),
        _item(
            "students",
            "Students",
            students,
            "Students recorded across public academic departments",
            "/academics",
        ),
        _item(
            "programmes",
            "Programmes",
            await _count(db, Programme, Programme.is_active.is_(True)),
            "Active academic programmes",
            "/academics/programmes",
        ),
        _item(
            "published_updates",
            "Published Updates",
            sum(
                [
                    await _count(db, News, *public_content(News)),
                    await _count(db, Event, *public_content(Event)),
                    await _count(db, Blog, *public_content(Blog)),
                    await _count(db, Announcement, *public_content(Announcement)),
                ]
            ),
            "Published news, events, blogs, and announcements",
            "/news",
        ),
        _item(
            "public_staff",
            "Public Staff Records",
            await _count(
                db,
                StaffAssignment,
                StaffAssignment.is_public.is_(True),
                StaffAssignment.status == "active",
            ),
            "Published staff assignments",
            "/people",
        ),
        _item(
            "student_life",
            "Student Life Records",
            sum(
                [
                    await _count(db, Club, Club.is_active.is_(True), Club.is_public.is_(True)),
                    await _count(db, ArtsCulture, ArtsCulture.is_active.is_(True)),
                    await _count(db, SportsFacility, SportsFacility.is_active.is_(True)),
                ]
            ),
            "Active clubs, arts, culture, and sports records",
            "/campus-life",
        ),
        _item(
            "downloads",
            "Public Downloads",
            await _count(
                db,
                Document,
                Document.is_active.is_(True),
                Document.is_public.is_(True),
                Document.requires_login.is_(False),
            ),
            "Public documents and downloads",
            "/downloads",
        ),
    ]

    return PublicStatsResponse(
        scope="homepage",
        title="Kisii University at a glance",
        stats=stats,
    )


async def university_stats(db: AsyncSession) -> PublicStatsResponse:
    """Comprehensive public-safe university-wide stats."""

    def public_content(model):
        return (
            model.is_public.is_(True),
            model.is_published.is_(True),
            model.status == "published",
            model.archived_at.is_(None),
        )

    students_result = await db.execute(
        select(
            func.coalesce(
                func.sum(Department.student_count + Department.postgraduate_student_count),
                0,
            )
        ).where(
            Department.deleted_at.is_(None),
            Department.is_active.is_(True),
            Department.is_public.is_(True),
            Department.department_type == "academic",
        )
    )
    students = int(students_result.scalar_one() or 0)

    postgraduate_result = await db.execute(
        select(func.coalesce(func.sum(Department.postgraduate_student_count), 0)).where(
            Department.deleted_at.is_(None),
            Department.is_active.is_(True),
            Department.is_public.is_(True),
            Department.department_type == "academic",
        )
    )
    postgraduate_students = int(postgraduate_result.scalar_one() or 0)

    active_staff_people = (
        select(StaffAssignment.person_id)
        .where(
            StaffAssignment.deleted_at.is_(None),
            StaffAssignment.is_public.is_(True),
            StaffAssignment.status == "active",
        )
        .distinct()
    )

    public_updates = sum(
        [
            await _count(db, News, *public_content(News)),
            await _count(db, Event, *public_content(Event)),
            await _count(db, Blog, *public_content(Blog)),
            await _count(db, Announcement, *public_content(Announcement)),
        ]
    )

    student_life_records = sum(
        [
            await _count(db, Club, Club.is_active.is_(True), Club.is_public.is_(True)),
            await _count(db, ArtsCulture, ArtsCulture.is_active.is_(True)),
            await _count(db, SportsFacility, SportsFacility.is_active.is_(True)),
        ]
    )

    support_records = sum(
        [
            await _count(db, FAQ, FAQ.is_public.is_(True), FAQ.status == "published"),
            await _count(
                db,
                ContactDirectory,
                ContactDirectory.is_public.is_(True),
                ContactDirectory.status == "active",
            ),
        ]
    )

    stats = [
        _item("campuses", "Campuses", await _count(db, Campus, Campus.is_active.is_(True)), "Active campuses", "/about/campuses"),
        _item("schools", "Schools", await _count(db, School, School.is_active.is_(True), School.is_public.is_(True)), "Active public schools", "/academics/schools"),
        _item(
            "academic_departments",
            "Academic Departments",
            await _count(
                db,
                Department,
                Department.is_active.is_(True),
                Department.is_public.is_(True),
                Department.department_type == "academic",
            ),
            "Active public academic departments",
            "/academics/departments",
        ),
        _item("programmes", "Programmes", await _count(db, Programme, Programme.is_active.is_(True)), "Active academic programmes", "/academics/programmes"),
        _item("students", "Students", students, "Students recorded across active public academic departments", "/academics"),
        _item("postgraduate_students", "Postgraduate Students", postgraduate_students, "Postgraduate students recorded across public academic departments", "/academics/postgraduate"),
        _item(
            "public_staff",
            "Public Staff Profiles",
            await _count(db, Person, Person.is_active.is_(True), Person.is_public.is_(True)),
            "Active public people and staff profiles",
            "/people",
        ),
        _item(
            "staff_assignments",
            "Staff Assignments",
            await _count(db, StaffAssignment, StaffAssignment.is_public.is_(True), StaffAssignment.status == "active"),
            "Published active staff assignments",
            "/people",
        ),
        _item(
            "publication_records",
            "Publication Records",
            await _sum_publications_for_people(db, active_staff_people),
            "Publication counts linked to published staff profiles",
            "/research/publications",
        ),
        _item("open_intakes", "Open Intakes", await _count(db, Intake, Intake.is_active.is_(True), Intake.is_open.is_(True)), "Currently open admission intakes", "/admissions"),
        _item("published_updates", "Published Updates", public_updates, "Published news, events, blogs, and announcements", "/news"),
        _item("student_life", "Student Life Records", student_life_records, "Published clubs, arts, culture, and sports records", "/campus-life"),
        _item("public_downloads", "Public Downloads", await _count(db, Document, Document.is_active.is_(True), Document.is_public.is_(True), Document.requires_login.is_(False)), "Public documents and downloads", "/downloads"),
        _item("support_records", "Support Records", support_records, "Published FAQs and public contact records", "/contact"),
        _item("alumni_records", "Alumni Records", await _count(db, Alumni, Alumni.is_public.is_(True)), "Public alumni records", "/alumni"),
        _item("exchange_programmes", "Exchange Programmes", await _count(db, ExchangeProgramme, ExchangeProgramme.is_active.is_(True)), "Active exchange programmes", "/international"),
    ]

    return PublicStatsResponse(
        scope="university",
        title="University-wide institutional statistics",
        stats=stats,
    )


async def school_stats(db: AsyncSession, slug: str) -> PublicStatsResponse | None:
    school = await db.scalar(
        select(School).where(
            School.slug == slug,
            School.deleted_at.is_(None),
            School.is_active.is_(True),
            School.is_public.is_(True),
        )
    )
    if school is None:
        return None

    department_ids = select(Department.id).where(
        Department.deleted_at.is_(None),
        Department.school_id == school.id,
        Department.is_active.is_(True),
        Department.is_public.is_(True),
    )
    staff_filter = or_(
        and_(StaffAssignment.entity_type == "school", StaffAssignment.entity_id == school.id),
        and_(StaffAssignment.entity_type == "department", StaffAssignment.entity_id.in_(department_ids)),
    )
    staff_people = (
        select(StaffAssignment.person_id)
        .where(
            StaffAssignment.deleted_at.is_(None),
            StaffAssignment.is_public.is_(True),
            StaffAssignment.status == "active",
            staff_filter,
        )
        .distinct()
    )

    stats = [
        _item(
            "departments",
            "Departments",
            await _count(
                db,
                Department,
                Department.school_id == school.id,
                Department.is_active.is_(True),
                Department.is_public.is_(True),
            ),
            "Active public departments in this school",
            f"/academics/schools/{school.slug}/departments",
        ),
        _item(
            "programmes",
            "Programmes",
            await _count(
                db,
                Programme,
                Programme.is_active.is_(True),
                Programme.department_id.in_(department_ids),
            ),
            "Active programmes offered through this school",
            f"/academics/schools/{school.slug}/programmes",
        ),
        _item(
            "staff",
            "Staff Records",
            await _count(
                db,
                StaffAssignment,
                StaffAssignment.is_public.is_(True),
                StaffAssignment.status == "active",
                staff_filter,
            ),
            "Published school and department staff assignments",
            f"/academics/schools/{school.slug}/team",
        ),
        _item(
            "publications",
            "Publication Records",
            await _sum_publications_for_people(db, staff_people),
            "Publication counts linked to published staff profiles",
            f"/academics/schools/{school.slug}/publications",
        ),
        _item(
            "news",
            "News Records",
            await _count(
                db,
                News,
                News.is_public.is_(True),
                News.is_published.is_(True),
                News.status == "published",
                News.archived_at.is_(None),
                News.scope_type == "school",
                News.scope_id == school.id,
            ),
            "Published news connected to this school",
            f"/academics/schools/{school.slug}/news",
        ),
        _item(
            "downloads",
            "Downloads",
            await _count(
                db,
                Document,
                Document.is_active.is_(True),
                Document.is_public.is_(True),
                Document.requires_login.is_(False),
                Document.scope_type == "school",
                Document.scope_id == school.id,
            ),
            "Public documents connected to this school",
            f"/academics/schools/{school.slug}/downloads",
        ),
        _item(
            "clubs",
            "Clubs",
            await _count(
                db,
                Club,
                Club.is_active.is_(True),
                Club.is_public.is_(True),
                Club.school_id == school.id,
            ),
            "Active public clubs connected to this school",
            f"/academics/schools/{school.slug}/clubs",
        ),
    ]

    return PublicStatsResponse(scope="school", title=f"{school.name} at a glance", stats=stats)


async def department_stats(db: AsyncSession, slug: str) -> PublicStatsResponse | None:
    department = await db.scalar(
        select(Department).where(
            Department.slug == slug,
            Department.deleted_at.is_(None),
            Department.is_active.is_(True),
            Department.is_public.is_(True),
        )
    )
    if department is None:
        return None

    staff_people = (
        select(StaffAssignment.person_id)
        .where(
            StaffAssignment.deleted_at.is_(None),
            StaffAssignment.is_public.is_(True),
            StaffAssignment.status == "active",
            StaffAssignment.entity_type == "department",
            StaffAssignment.entity_id == department.id,
        )
        .distinct()
    )

    base_href = (
        f"/academics/departments/{department.slug}"
        if department.department_type == "academic"
        else f"/administration/{department.slug}"
    )

    stats = [
        _item(
            "programmes",
            "Programmes",
            await _count(
                db,
                Programme,
                Programme.is_active.is_(True),
                Programme.department_id == department.id,
            ),
            "Active programmes in this department",
            f"{base_href}/programmes",
        ),
        _item(
            "staff",
            "Staff Records",
            await _count(
                db,
                StaffAssignment,
                StaffAssignment.is_public.is_(True),
                StaffAssignment.status == "active",
                StaffAssignment.entity_type == "department",
                StaffAssignment.entity_id == department.id,
            ),
            "Published department staff assignments",
            f"{base_href}/team",
        ),
        _item(
            "services",
            "Services",
            await _count(
                db,
                DepartmentService,
                DepartmentService.is_active.is_(True),
                DepartmentService.department_id == department.id,
            ),
            "Active services connected to this department",
            f"{base_href}/services",
        ),
        _item(
            "publications",
            "Publication Records",
            await _sum_publications_for_people(db, staff_people),
            "Publication counts linked to published staff profiles",
            f"{base_href}/publications",
        ),
        _item(
            "news",
            "News Records",
            await _count(
                db,
                News,
                News.is_public.is_(True),
                News.is_published.is_(True),
                News.status == "published",
                News.archived_at.is_(None),
                News.scope_type == "department",
                News.scope_id == department.id,
            ),
            "Published news connected to this department",
            f"{base_href}/news",
        ),
        _item(
            "downloads",
            "Downloads",
            await _count(
                db,
                Document,
                Document.is_active.is_(True),
                Document.is_public.is_(True),
                Document.requires_login.is_(False),
                Document.scope_type == "department",
                Document.scope_id == department.id,
            ),
            "Public documents connected to this department",
            f"{base_href}/downloads",
        ),
    ]

    return PublicStatsResponse(
        scope="department",
        title=f"{department.name} at a glance",
        stats=stats,
    )


async def public_stats(
    db: AsyncSession,
    *,
    scope: str = "homepage",
    slug: str | None = None,
) -> PublicStatsResponse | None:
    if scope == "homepage":
        return await homepage_stats(db)
    if scope == "university":
        return await university_stats(db)
    if scope == "school" and slug:
        return await school_stats(db, slug)
    if scope == "department" and slug:
        return await department_stats(db, slug)
    return None


async def portal_stats(
    db: AsyncSession,
    portal: str,
) -> PortalStatsResponse | None:
    """Return definite counters for Main-service admin portal dashboards."""

    if portal == "admin":
        stats = {
            "boards_count": await _count(db, Board),
            "divisions_count": await _count(db, Division),
            "offices_count": await _count(db, Wing),
            "staff_assignments_count": await _count(db, StaffAssignment),
            "documents_count": await _count(db, Document),
        }
        title = "Admin operational counters"
    elif portal == "cocms":
        content_sources = (
            (News, ()),
            (Blog, ()),
            (Event, ()),
            (Announcement, ()),
            (ClubActivity, ()),
            (MediaLink, (MediaLink.owner_portal == "student-clubs",)),
            (PageSection, ()),
            (PartnershipSpotlight, ()),
            (Slider, ()),
        )
        stats = {
            "pending_review_count": sum(
                [
                    await _count(
                        db,
                        model,
                        model.workflow_status.in_(("submitted", "in_review")),
                        *extra_filters,
                    )
                    for model, extra_filters in content_sources
                ]
            ),
            "media_count": await _count(db, Media),
        }
        stats.update(await _page_cms_workflow_stats(db))
        stats["validation_blocker_count"] = await _page_cms_validation_blocker_count(db)
        stats["spotlight_count"] = await _page_cms_spotlight_count(db)
        title = "CoCMS publishing counters"
    elif portal == "schools":
        stats = {
            "schools_count": await _count(db, School),
            "programmes_count": await _count(db, Programme),
            "departments_count": await _count(db, Department),
        }
        title = "School administration counters"
    elif portal == "departments":
        content_models = (News, Event, Announcement)
        stats = {
            "departments_count": await _count(db, Department),
            "programmes_count": await _count(db, Programme),
            "unpublished_count": sum(
                [
                    await _count(
                        db,
                        model,
                        model.scope_type == "department",
                        model.is_published.is_(False),
                    )
                    for model in content_models
                ]
            ),
        }
        title = "Department administration counters"
    elif portal == "student-clubs":
        stats = {
            "active_clubs_count": await _count(db, Club, Club.is_active.is_(True)),
            "active_members_count": await _sum(
                db,
                Club.membership_count,
                Club,
                Club.is_active.is_(True),
            ),
        }
        title = "Student club counters"
    else:
        return None

    return PortalStatsResponse(portal=portal, title=title, stats=stats)


async def admin_stats(db: AsyncSession) -> PublicStatsResponse:
    """Operational stats for admin dashboards."""

    published_content = sum(
        [
            await _count(db, News, News.status == "published", News.is_published.is_(True)),
            await _count(db, Event, Event.status == "published", Event.is_published.is_(True)),
            await _count(db, Blog, Blog.status == "published", Blog.is_published.is_(True)),
            await _count(db, Announcement, Announcement.status == "published", Announcement.is_published.is_(True)),
        ]
    )
    draft_content = sum(
        [
            await _count(db, News, News.status != "published"),
            await _count(db, Event, Event.status != "published"),
            await _count(db, Blog, Blog.status != "published"),
            await _count(db, Announcement, Announcement.status != "published"),
        ]
    )

    stats = [
        _item("users", "Users", await _count(db, User), "User accounts in the main system", "/system/users"),
        _item("active_users", "Active Users", await _count(db, User, User.is_active.is_(True)), "Active user accounts", "/system/users"),
        _item("campuses", "Campuses", await _count(db, Campus), "Campus records", "/campuses"),
        _item("schools", "Schools", await _count(db, School), "School records", "/schools"),
        _item("departments", "Departments", await _count(db, Department), "Department records", "/departments"),
        _item("divisions", "Divisions", await _count(db, Division), "Administrative division records", "/governance"),
        _item("wings", "Wings", await _count(db, Wing), "Administrative wing records", "/governance"),
        _item("boards", "Boards", await _count(db, Board), "Governance board records", "/governance"),
        _item("programmes", "Programmes", await _count(db, Programme), "Programme records", "/academic/programmes"),
        _item("open_intakes", "Open Intakes", await _count(db, Intake, Intake.is_open.is_(True)), "Admission intakes currently open", "/admissions"),
        _item("people", "People Profiles", await _count(db, Person), "People and staff profile records", "/people"),
        _item("staff_assignments", "Staff Assignments", await _count(db, StaffAssignment), "Staff assignment records", "/people"),
        _item("published_content", "Published Content", published_content, "Published public content records", "/content"),
        _item("draft_content", "Draft Content", draft_content, "Content records still not published", "/content"),
        _item("documents", "Documents", await _count(db, Document), "Document records", "/documents"),
        _item("policies", "Policies", await _count(db, Policy), "Policy records", "/policies"),
        _item("media", "Media Assets", await _count(db, Media), "Media library assets", "/media"),
        _item("support_tickets", "Support Tickets", await _count(db, SupportTicket), "Support ticket records", "/support"),
        _item("newsletter_subscribers", "Newsletter Subscribers", await _count(db, NewsletterSubscriber, NewsletterSubscriber.status == "active"), "Active newsletter subscribers", "/newsletters"),
        _item("alumni", "Alumni", await _count(db, Alumni), "Alumni records", "/alumni"),
        _item("alumni_associations", "Alumni Associations", await _count(db, AlumniAssociation), "Alumni association records", "/alumni"),
    ]

    return PublicStatsResponse(scope="admin", title="Main service operational statistics", stats=stats)
