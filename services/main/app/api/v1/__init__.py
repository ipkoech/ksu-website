"""API v1 route registration."""

from fastapi import FastAPI
from ksu_common import install_request_body_limit_middleware

from ...core.config import get_settings
from ...routes.v1.health import router as health_router
from ...routes.v1.internal import router as internal_router
from .accommodations import router as accommodations_router
from .academic_calendars import router as academic_calendars_router
from .admin import router as admin_router
from .admissions import router as admissions_router
from .announcements import router as announcements_router
from .analytics import router as analytics_router
from .alumni import router as alumni_router
from .alumni_associations import router as alumni_associations_router
from .arts_culture import router as arts_culture_router
from .about_content import router as about_content_router
from .auth import router as auth_router
from .blogs import router as blogs_router
from .campuses import router as campuses_router
from .campus_life import router as campus_life_router
from .clubs import router as clubs_router
from .contact_directory import router as contact_directory_router
from .contacts import router as contacts_router
from .content_workflow import router as content_workflow_router
from .departments import router as departments_router
from .department_services import router as department_services_router
from .divisions import router as divisions_router
from .documents import router as documents_router
from .events import router as events_router
from .exchange_programmes import router as exchange_programmes_router
from .faqs import router as faqs_router
from .governance import router as governance_router
from .imports import router as imports_router
from .intakes import router as intakes_router
from .media import router as media_router
from .me import router as me_router
from .news import router as news_router
from .newsletters import router as newsletters_router
from .notifications import router as notifications_router
from .partners import router as partners_router
from .page_cms import router as page_cms_router
from .persons import router as persons_router
from .policies import router as policies_router
from .public_media import router as public_media_router
from .public_leadership import router as public_leadership_router
from .public_people import router as public_people_router
from .public_pages import router as public_pages_router
from .public_research_context import router as public_research_context_router
from .public_entity_content import router as public_entity_content_router
from .public_team import router as public_team_router
from .public.inquiries import router as public_inquiries_router
from .realtime import router as realtime_router
from .record_recovery import router as record_recovery_router
from .programmes import router as programmes_router
from .search import router as search_router
from .schools import router as schools_router
from .school_portal import router as school_portal_router
from .sliders import router as sliders_router
from .social_posts import router as social_posts_router
from .sports import router as sports_router
from .staff import router as staff_router
from .stats import router as stats_router
from .settings import router as settings_router
from .stories import router as stories_router
from .student_governance import router as student_governance_router
from .support import router as support_router
from .testimonials import router as testimonials_router
from .university_info import router as university_info_router
from .users import router as users_router
from .wings import router as wings_router
from .vice_chancellor import router as vice_chancellor_router
from .content_workflow_bulk import router as content_workflow_bulk_router
from .exports import router as exports_router


def register_routes(app: FastAPI) -> None:
    """Register all API v1 routes."""
    app.include_router(health_router, prefix="/api/v1", tags=["Health"])
    app.include_router(internal_router, prefix="/api/v1/internal", tags=["Internal"])
    app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
    app.include_router(me_router, prefix="/api/v1/me", tags=["Me"])
    app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["Analytics"])
    app.include_router(about_content_router, prefix="/api/v1", tags=["About"])
    app.include_router(news_router, prefix="/api/v1/news", tags=["Content"])
    app.include_router(blogs_router, prefix="/api/v1/blogs", tags=["Content"])
    app.include_router(announcements_router, prefix="/api/v1/announcements", tags=["Content"])
    app.include_router(events_router, prefix="/api/v1/events", tags=["Content"])
    app.include_router(stories_router, prefix="/api/v1/stories", tags=["Content"])
    app.include_router(content_workflow_router, prefix="/api/v1/content-workflow", tags=["Content"])
    app.include_router(record_recovery_router, prefix="/api/v1/records", tags=["Content"])
    app.include_router(sliders_router, prefix="/api/v1/sliders", tags=["Content"])
    app.include_router(newsletters_router, prefix="/api/v1/newsletters", tags=["Marketing"])
    app.include_router(testimonials_router, prefix="/api/v1/testimonials", tags=["Marketing"])
    app.include_router(social_posts_router, prefix="/api/v1/social-posts", tags=["Marketing"])
    app.include_router(page_cms_router, prefix="/api/v1", tags=["Content"])
    app.include_router(vice_chancellor_router, prefix="/api/v1", tags=["Vice Chancellor"])
    app.include_router(partners_router, prefix="/api/v1/partners", tags=["Research"])
    app.include_router(users_router, prefix="/api/v1/users", tags=["Users"])
    app.include_router(search_router, prefix="/api/v1/search", tags=["Search"])
    app.include_router(stats_router, prefix="/api/v1/stats", tags=["Stats"])
    app.include_router(settings_router, prefix="/api/v1/settings", tags=["System"])
    app.include_router(university_info_router, prefix="/api/v1/university-info", tags=["University"])
    app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["Users"])
    app.include_router(realtime_router, prefix="/api/v1", tags=["Realtime"])
    app.include_router(persons_router, prefix="/api/v1/persons", tags=["Persons"])
    app.include_router(staff_router, prefix="/api/v1/staff", tags=["Staff"])
    app.include_router(governance_router, prefix="/api/v1/governance", tags=["Governance"])
    app.include_router(imports_router, prefix="/api/v1/imports", tags=["Imports"])
    app.include_router(divisions_router, prefix="/api/v1/divisions", tags=["Organization"])
    app.include_router(wings_router, prefix="/api/v1/wings", tags=["Organization"])
    app.include_router(schools_router, prefix="/api/v1/schools", tags=["Academic"])
    if get_settings().SCHOOL_PORTAL_ROUTES_ENABLED:
        app.include_router(
            school_portal_router,
            prefix="/api/v1/school-portal",
            tags=["School Portal"],
        )
    app.include_router(departments_router, prefix="/api/v1/departments", tags=["Academic"])
    app.include_router(department_services_router, prefix="/api/v1/department-services", tags=["Academic"])
    app.include_router(campuses_router, prefix="/api/v1/campuses", tags=["Academic"])
    app.include_router(campus_life_router, prefix="/api/v1/campus-life", tags=["Student Life"])
    app.include_router(academic_calendars_router, prefix="/api/v1/academic-calendars", tags=["Academic"])
    app.include_router(programmes_router, prefix="/api/v1/programmes", tags=["Admissions"])
    app.include_router(intakes_router, prefix="/api/v1/intakes", tags=["Admissions"])
    app.include_router(admissions_router, prefix="/api/v1/admissions", tags=["Admissions"])
    app.include_router(clubs_router, prefix="/api/v1/clubs", tags=["Student Life"])
    app.include_router(accommodations_router, prefix="/api/v1/accommodations", tags=["Student Life"])
    app.include_router(sports_router, prefix="/api/v1/sports-facilities", tags=["Student Life"])
    app.include_router(arts_culture_router, prefix="/api/v1/arts-culture", tags=["Student Life"])
    app.include_router(student_governance_router, prefix="/api/v1/student-governance", tags=["Student Life"])
    app.include_router(policies_router, prefix="/api/v1/policies", tags=["Documents"])
    app.include_router(documents_router, prefix="/api/v1/documents", tags=["Documents"])
    app.include_router(alumni_router, prefix="/api/v1/alumni", tags=["Alumni"])
    app.include_router(alumni_associations_router, prefix="/api/v1/alumni-associations", tags=["Alumni"])
    app.include_router(exchange_programmes_router, prefix="/api/v1/exchange-programmes", tags=["Exchange"])
    app.include_router(faqs_router, prefix="/api/v1/faqs", tags=["Support"])
    app.include_router(contact_directory_router, prefix="/api/v1/contact-directory", tags=["Support"])
    app.include_router(contacts_router, prefix="/api/v1/contacts", tags=["Support"])
    app.include_router(support_router, prefix="/api/v1/support", tags=["Support"])
    app.include_router(media_router, prefix="/api/v1/media", tags=["Media"])
    app.include_router(admin_router, prefix="/api/v1/admin", tags=["Admin"])
    app.include_router(public_media_router, prefix="/api/v1/public/media", tags=["Public"])
    app.include_router(public_leadership_router, prefix="/api/v1/public/leadership", tags=["Public"])
    app.include_router(public_people_router, prefix="/api/v1/public/people", tags=["Public"])
    app.include_router(public_pages_router, prefix="/api/v1/public-pages", tags=["Public"])
    app.include_router(public_research_context_router, prefix="/api/v1/public/research/context", tags=["Public"])
    app.include_router(public_entity_content_router, prefix="/api/v1/public/content", tags=["Public"])
    app.include_router(public_team_router, prefix="/api/v1/public", tags=["Public"])
    app.include_router(public_inquiries_router, prefix="/api/v1/public", tags=["Public"])
    app.include_router(content_workflow_bulk_router, prefix="/api/v1/content-workflow", tags=["Content"])
    app.include_router(exports_router, prefix="/api/v1/exports", tags=["Exports"])
    install_request_body_limit_middleware(app)
