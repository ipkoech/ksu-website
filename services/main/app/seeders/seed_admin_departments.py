"""Seed administrative departments and ICT sections."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import DepartmentService as DepartmentServiceModel
from app.schemas.base import slugify

from ._shared import (
    ADMIN_DEPARTMENTS,
    ICT_SECTION_DEPARTMENTS,
    LEADERSHIP_PEOPLE,
    SeedContext,
    get_or_create_person,
    upsert_department,
    upsert_department_service,
)


ADMIN_SERVICE_SPECS = [
    {
        "department_code": "ACAFFAIRS",
        "name": "Online Admission",
        "slug": "online-admission",
        "description": "Online admission service for admitted students through the Kisii University digital admission portal.",
        "requirements": "Admission details and student credentials as requested by the portal.",
        "process": "Open the Online Admission portal and follow the prompts for admission processing.",
        "contact_email": "admissions@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 1,
    },
    {
        "department_code": "ACAFFAIRS",
        "name": "Online Application",
        "slug": "online-application",
        "description": "Self-sponsored undergraduate and postgraduate application service through the Kisii University online application portal.",
        "requirements": "Applicant biodata, selected programme, academic documents, and any portal-requested supporting records.",
        "process": "Open the Online Application portal, create or update the application, and submit the requested information.",
        "contact_email": "admissions@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 2,
    },
    {
        "department_code": "ACAFFAIRS",
        "name": "Application Forms",
        "slug": "application-forms",
        "description": "Undergraduate, diploma, certificate or bridging, and postgraduate application forms published by the university.",
        "requirements": "Completed form, certified academic records, identification documents, and payment evidence where required by the form.",
        "process": "Download the applicable form from the university website, complete it, attach supporting documents, and submit it to the academic registrar.",
        "contact_email": "acregistrar@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 3,
    },
    {
        "department_code": "PROC",
        "name": "Tenders and Supplier Notices",
        "slug": "tenders-and-supplier-notices",
        "description": "Public tender notices and supplier prequalification information published by the university.",
        "requirements": "Supplier documents and eligibility evidence as stated in each published tender or prequalification notice.",
        "process": "Review the current tender notice, prepare the required submission documents, and follow the stated submission instructions.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 1,
    },
    {
        "department_code": "ICT",
        "name": "E-Learning Access",
        "slug": "e-learning-access",
        "description": "Access support for the university e-learning platform used for online teaching and learning.",
        "requirements": "Official student or staff credentials.",
        "process": "Open the e-learning platform and sign in with official credentials; request ICT or e-learning support for access issues.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 3,
    },
    {
        "department_code": "ICT",
        "name": "Student and Staff Portal Access",
        "slug": "student-staff-portal-access",
        "description": "Access support for the student and staff portal.",
        "requirements": "Registration number, admission number, PF number, or employee number as applicable.",
        "process": "Open the student or staff portal, register or sign in, and contact system administration for account support.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 4,
    },
    {
        "department_code": "ICT",
        "name": "Turnitin Access",
        "slug": "turnitin-access",
        "description": "Academic originality-checking access listed among university online resources.",
        "requirements": "Authorized university user account or class access details.",
        "process": "Use the Turnitin link listed by the university and follow departmental or library guidance for access.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 5,
    },
    {
        "department_code": "LIB",
        "name": "Library Catalogue",
        "slug": "library-catalogue",
        "description": "Online catalogue access for library discovery and circulation services.",
        "requirements": "Library user details where authentication is required.",
        "process": "Open the library catalogue and search for materials or account information.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 1,
    },
    {
        "department_code": "LIB",
        "name": "Electronic Books and Journals",
        "slug": "electronic-books-and-journals",
        "description": "Electronic resource access through the MyLOFT service listed by the university library.",
        "requirements": "Authorized university library user access.",
        "process": "Open the electronic resources link and sign in using the authorized library access process.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 2,
    },
    {
        "department_code": "LIB",
        "name": "Institutional Repository",
        "slug": "institutional-repository",
        "description": "Repository access for Kisii University scholarly and institutional materials.",
        "requirements": "Repository access details where submission or account access is required.",
        "process": "Open the institutional repository and search or submit materials according to repository guidance.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 3,
    },
    {
        "department_code": "AHRCS",
        "name": "Customer Care Ticket",
        "slug": "customer-care-ticket",
        "description": "Customer care ticket submission through the university help desk.",
        "requirements": "Requester contact details and a clear description of the service issue.",
        "process": "Open the Help Desk, choose Raise a ticket or Get Service, and submit the required information.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 1,
    },
    {
        "department_code": "AHRCS",
        "name": "Complaints, Compliments and Suggestions",
        "slug": "complaints-compliments-suggestions",
        "description": "Feedback services for complaints, compliments, suggestions, information requests, and request follow-up.",
        "requirements": "Requester contact details, request category, and the feedback or information request details.",
        "process": "Use the Customer Care Centre links for complaints, compliments, suggestions, request tracking, or information requests.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 2,
    },
    {
        "department_code": "STUAFFAIRS",
        "name": "Student Welfare and Support",
        "slug": "student-welfare-and-support",
        "description": "Student welfare and support services associated with the Dean of Students office.",
        "requirements": "Student details and a clear description of the student support need.",
        "process": "Contact or visit the Dean of Students office, or use the Customer Care Centre for student-service requests that need ticket tracking.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 1,
    },
    {
        "department_code": "STUAFFAIRS",
        "name": "Student Clubs and Campus Life Support",
        "slug": "student-clubs-and-campus-life-support",
        "description": "Student clubs, societies, campus life, and welfare support through the Dean of Students office.",
        "requirements": "Student details and the relevant club, society, or campus life support request.",
        "process": "Contact the Dean of Students office for student welfare, clubs, societies, and campus life guidance.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 2,
    },
    {
        "department_code": "CAREER",
        "name": "Career Services",
        "slug": "career-services",
        "description": "Student career support service listed under the university administration and student life sections.",
        "requirements": "Student details and the specific career support request.",
        "process": "Contact or visit Student Career Services for employability, career events, and student career support.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 1,
    },
    {
        "department_code": "SPORTSERV",
        "name": "Games and Sports Support",
        "slug": "games-and-sports-support",
        "description": "Games and sports services listed under administration and life at KSU.",
        "requirements": "Student or team details and the requested sports service.",
        "process": "Contact Games and Sports Services for sports participation and support.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 1,
    },
    {
        "department_code": "MEDSERV",
        "name": "Medical Services Support",
        "slug": "medical-services-support",
        "description": "Medical Services department support for student and university health-service needs.",
        "requirements": "Requester details and any medical-service information requested by the department.",
        "process": "Contact or visit Medical Services for health-service guidance and support.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 1,
    },
    {
        "department_code": "SEC",
        "name": "Security Services",
        "slug": "security-services",
        "description": "Security service support listed under the university administration section.",
        "requirements": "Requester details and a clear description of the security concern or service need.",
        "process": "Contact Security or use the Customer Care Centre for security-related service requests.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 1,
    },
    {
        "department_code": "ELEARN",
        "name": "E-Learning Directorate Support",
        "slug": "e-learning-directorate-support",
        "description": "E-Learning Directorate support for online learning coordination and access issues.",
        "requirements": "Student or staff details and the relevant e-learning support request.",
        "process": "Contact the E-Learning Directorate or use the e-learning platform support path for assistance.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 1,
    },
    {
        "department_code": "CENTRAL",
        "name": "Central Services Support",
        "slug": "central-services-support",
        "description": "General central services support listed under the official Central Services department page.",
        "requirements": "Requester details and the specific central service needed.",
        "process": "Contact Central Services or use the Customer Care Centre for service requests that need ticket tracking.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 1,
    },
    {
        "department_code": "TOWNANNEX",
        "name": "Town Annexes Support",
        "slug": "town-annexes-support",
        "description": "Support for Town Annexes listed as an official administration department.",
        "requirements": "Requester details and the specific Town Annexes support request.",
        "process": "Contact Town Annexes or use the Customer Care Centre for service requests that need ticket tracking.",
        "contact_email": "info@kisiiuniversity.ac.ke",
        "contact_phone": "+254720875082",
        "display_order": 1,
    },
]


MOVED_ADMIN_SERVICE_SLUGS = {
    "STUAFFAIRS": {
        "customer-care-ticket",
        "complaints-compliments-suggestions",
    },
}


async def seed_admin_departments(db: AsyncSession, ctx: SeedContext) -> None:
    for spec in ADMIN_DEPARTMENTS:
        head_key = spec.get("head_key")
        head = None
        if head_key:
            head = await get_or_create_person(db, ctx, head_key, **LEADERSHIP_PEOPLE[head_key])
        wing_id = None
        wing_code = spec.get("wing_code")
        if wing_code:
            wing = ctx.wings[wing_code]
            wing_id = wing.id
        await upsert_department(
            db,
            ctx,
            name=spec["name"],
            slug=slugify(spec["name"]),
            code=spec["code"],
            department_type="administrative",
            school_id=None,
            wing_id=wing_id,
            parent_department_id=None,
            head_id=head.id if head else None,
            postgraduate_coordinator_id=None,
            about=spec["about"],
            guidelines=spec.get("source_url"),
            is_active=True,
            is_public=True,
            allows_staff_management=True,
            display_order=100,
        )

    for key in (
        "ict_manager",
        "ict_cybersecurity_head",
        "ict_software_dev_head",
        "ict_installation_maintenance_head",
        "ict_networking_head",
        "ict_website_support_head",
    ):
        await get_or_create_person(db, ctx, key, **LEADERSHIP_PEOPLE[key])

    ict_department = ctx.departments["ICT"]
    for spec in ICT_SECTION_DEPARTMENTS:
        head = ctx.people[spec["head_key"]]
        await upsert_department(
            db,
            ctx,
            name=spec["name"],
            slug=slugify(spec["name"]),
            code=spec["code"],
            department_type="support",
            school_id=None,
            wing_id=ict_department.wing_id,
            parent_department_id=ict_department.id,
            head_id=head.id,
            postgraduate_coordinator_id=None,
            about=f"{spec['name']} section within the ICT Department.",
            is_active=True,
            is_public=True,
            allows_staff_management=True,
            display_order=110,
        )

    await upsert_department_service(
        db,
        ict_department,
        name="Website Support",
        slug="website-support",
        description="Support for Kisii University website administration, publishing, and user-facing issue resolution.",
        turnaround_time="1-3 working days",
        contact_phone="+254720875082",
        is_active=True,
        display_order=1,
    )
    await upsert_department_service(
        db,
        ict_department,
        name="Software Development",
        slug="software-development",
        description="Development and maintenance of internal applications, portals, and digital workflows.",
        turnaround_time="Varies by request scope",
        is_active=True,
        display_order=2,
    )

    for spec in ADMIN_SERVICE_SPECS:
        department = ctx.departments[spec["department_code"]]
        payload = {key: value for key, value in spec.items() if key != "department_code"}
        await upsert_department_service(
            db,
            department,
            **payload,
            turnaround_time=None,
            fee=None,
            is_active=True,
        )

    for department_code, service_slugs in MOVED_ADMIN_SERVICE_SLUGS.items():
        department = ctx.departments[department_code]
        stale_services = (
            await db.execute(
                select(DepartmentServiceModel).where(
                    DepartmentServiceModel.department_id == department.id,
                    DepartmentServiceModel.slug.in_(service_slugs),
                )
            )
        ).scalars()
        for service in stale_services:
            service.is_active = False
