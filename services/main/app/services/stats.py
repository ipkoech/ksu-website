"""Public-safe aggregate stats for the public website."""

from __future__ import annotations

from ksu_common.internal_client import outbound_client
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import get_settings
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
    "corporate-communication": (
        "pending_review_count",
        "published_count",
        "draft_count",
        "scheduled_count",
        "media_count",
    ),
    "schools": ("schools_count", "programmes_count", "departments_count"),
    "departments": (
        "departments_count",
        "programmes_count",
        "unpublished_count",
    ),
    "research": (
        "researchers_count",
        "published_publications_count",
    ),
    "library": (
        "active_branches_count",
        "catalogue_resources_count",
        "active_regulations_count",
        "loans_count",
    ),
}

PORTAL_ALIASES = {
    "cocms": "corporate-communication",
    "publications": "research",
    "governance": "admin",
    "institutional-administration": "admin",
}

settings = get_settings()


async def _count(db: AsyncSession, model, *conditions) -> int:
    result = await db.execute(
        select(func.count(model.id)).where(model.deleted_at.is_(None), *conditions)
    )
    return int(result.scalar_one() or 0)


async def _published_publications_count() -> int:
    """Read the public publication count from the owning Research service."""

    async with outbound_client(
        base_url=settings.RESEARCH_SERVICE_URL.rstrip("/"),
        timeout=20.0,
        connect_timeout=5.0,
        headers={"X-KSU-Proxy": "main-stats"},
    ) as client:
        response = await client.get("/api/v1/stats")
        response.raise_for_status()
        payload = response.json()

    if not isinstance(payload, dict) or payload.get("status") != "success":
        raise ValueError("Research service returned an unexpected stats payload")
    data = payload.get("data")
    if not isinstance(data, dict) or not isinstance(data.get("stats"), list):
        raise ValueError("Research service returned an unexpected stats payload")

    for item in data["stats"]:
        if item.get("key") == "publications" and isinstance(item.get("value"), int):
            return item["value"]

    raise ValueError("Research service did not return a publications count")


async def _library_portal_stat_counts() -> dict[str, int]:
    """Read dashboard counters from the owning Library service."""

    async with outbound_client(
        base_url=settings.LIBRARY_SERVICE_URL.rstrip("/"),
        timeout=20.0,
        connect_timeout=5.0,
        headers={"X-KSU-Proxy": "main-stats"},
    ) as client:
        response = await client.get("/api/v1/stats/admin")
        response.raise_for_status()
        payload = response.json()

    if not isinstance(payload, dict) or payload.get("status") != "success":
        raise ValueError("Library service returned an unexpected stats payload")
    data = payload.get("data")
    if not isinstance(data, dict) or not isinstance(data.get("stats"), list):
        raise ValueError("Library service returned an unexpected stats payload")

    service_values: dict[str, int] = {}
    for item in data["stats"]:
        if isinstance(item, dict) and isinstance(item.get("value"), int):
            key = item.get("key")
            if isinstance(key, str):
                service_values[key] = item["value"]

    return {
        "active_branches_count": service_values.get("active_branches", 0),
        "catalogue_resources_count": service_values.get("catalogue_resources", 0),
        "active_regulations_count": service_values.get("active_regulations", 0),
        "loans_count": service_values.get("loans", 0),
    }


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

    portal = PORTAL_ALIASES.get(portal, portal)

    if portal == "admin":
        stats = {
            "boards_count": await _count(db, Board),
            "divisions_count": await _count(db, Division),
            "offices_count": await _count(db, Wing),
            "staff_assignments_count": await _count(db, StaffAssignment),
            "documents_count": await _count(db, Document),
        }
        title = "Admin operational counters"
    elif portal == "corporate-communication":
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
            "published_count": sum(
                [
                    await _count(db, model, model.workflow_status == "published", *extra_filters)
                    for model, extra_filters in content_sources
                ]
            ),
            "draft_count": sum(
                [
                    await _count(db, model, model.workflow_status == "draft", *extra_filters)
                    for model, extra_filters in content_sources
                ]
            ),
            "scheduled_count": sum(
                [
                    await _count(db, model, model.workflow_status == "scheduled", *extra_filters)
                    for model, extra_filters in content_sources
                ]
            ),
            "media_count": await _count(db, Media),
        }
        title = "Corporate Communication publishing counters"
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
    elif portal == "research":
        stats = {
            "researchers_count": await _count(
                db,
                Person,
                Person.is_researcher.is_(True),
            ),
            "published_publications_count": await _published_publications_count(),
        }
        title = "Research and publications counters"
    elif portal == "library":
        stats = await _library_portal_stat_counts()
        title = "Library administration counters"
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
