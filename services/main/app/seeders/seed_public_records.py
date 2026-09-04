"""Seed public utility records that are consumed by website API pages."""

from __future__ import annotations

import hashlib
import uuid
from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    AdmissionInfo,
    Announcement,
    Club,
    ContactDirectory,
    Document,
    FAQ,
    Media,
    StudentGovernance,
)
from app.schemas.base import slugify

from ._shared import SeedContext
from .live_site_snapshot import LIVE_SITE_DOCUMENTS


EAT = ZoneInfo("Africa/Nairobi")
PUBLIC_SOURCE = "https://kisiiuniversity.ac.ke"
SEO_DESCRIPTION_MAX_LENGTH = 500


def _seo_description(value: object) -> str | None:
    if value is None:
        return None
    description = str(value).strip()
    if len(description) <= SEO_DESCRIPTION_MAX_LENGTH:
        return description
    return description[:SEO_DESCRIPTION_MAX_LENGTH].rstrip()


DOWNLOAD_SPECS = [
    {
        "slug": "kisii-university-course-brochure",
        "title": "Kisii University Course Brochure",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//KISII%20UNIVERSITY%20COURSE%20BROCHURE.pdf",
        "document_type": "brochure",
        "category": "Admissions",
        "description": "Official course brochure for applicants reviewing Kisii University programmes.",
        "mime_type": "application/pdf",
        "display_order": 10,
    },
    {
        "slug": "application-form-for-undergraduate",
        "title": "Application Form for Undergraduate",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//APPLICATION%20FORM%20FOR%20UNDERGRADUATE.pdf",
        "document_type": "form",
        "category": "Admissions",
        "description": "Undergraduate application form for prospective Kisii University students.",
        "mime_type": "application/pdf",
        "display_order": 20,
    },
    {
        "slug": "application-form-for-diploma",
        "title": "Application Form for Diploma",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//APPLICATION%20FORM%20FOR%20DIPLOMA.pdf",
        "document_type": "form",
        "category": "Admissions",
        "description": "Application form for diploma programmes, including applicant details and submission requirements.",
        "mime_type": "application/pdf",
        "display_order": 25,
    },
    {
        "slug": "application-form-for-certificate-or-bridging",
        "title": "Application Form for Certificate or Bridging",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//APPLICATION%20FORM%20FOR%20CERTIFICATE%20or%20BRIDGING.pdf",
        "document_type": "form",
        "category": "Admissions",
        "description": "Application form for certificate and bridging programmes, including applicant details and submission requirements.",
        "mime_type": "application/pdf",
        "display_order": 30,
    },
    {
        "slug": "postgraduate-application-form",
        "title": "Postgraduate Application Form",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//POSTGRADUATE-APPLICATION-FORMS.pdf",
        "document_type": "form",
        "category": "Admissions",
        "description": "Postgraduate application form for postgraduate diploma, masters, and doctoral applicants.",
        "mime_type": "application/pdf",
        "display_order": 35,
    },
    {
        "slug": "ksu-13th-graduation-booklet",
        "title": "KSU 13th Graduation Booklet",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//Ksu%20Published%2013th%20Graduation%20Booklet.pdf",
        "document_type": "booklet",
        "category": "Graduation",
        "description": "Archived graduation booklet migrated from the legacy Kisii University website.",
        "mime_type": "application/pdf",
        "display_order": 40,
    },
    {
        "slug": "kisii-university-15th-graduation-booklet-2026",
        "title": "Kisii University 15th Graduation Booklet 2026",
        "url": f"{PUBLIC_SOURCE}/admission/kisii-university-15th-graduation-booklet-2026",
        "document_type": "booklet",
        "category": "Graduation",
        "description": "Graduation booklet reference for the 15th graduation ceremony in 2026.",
        "mime_type": "text/html",
        "display_order": 45,
    },
    {
        "slug": "online-application-portal",
        "title": "Online Application Portal",
        "url": "https://digital.kisiiuniversity.ac.ke/new_student_landing_page",
        "document_type": "portal",
        "category": "Digital Services",
        "description": "Kisii University online application portal for prospective students.",
        "mime_type": "text/html",
        "display_order": 50,
    },
    {
        "slug": "online-admission-portal",
        "title": "Online Admission Portal",
        "url": "https://digital.kisiiuniversity.ac.ke/students/admissions/center",
        "document_type": "portal",
        "category": "Digital Services",
        "description": "Kisii University online admission portal for admitted students.",
        "mime_type": "text/html",
        "display_order": 55,
    },
    {
        "slug": "customer-care-help-desk",
        "title": "Customer Care Help Desk",
        "url": "https://digital.kisiiuniversity.ac.ke/ksu_customer_care_center",
        "document_type": "portal",
        "category": "Support",
        "description": "Kisii University customer care centre for tickets, complaints, compliments, suggestions, and information requests.",
        "mime_type": "text/html",
        "display_order": 60,
    },
    {
        "slug": "e-learning-platform",
        "title": "E-Learning Platform",
        "url": "https://elearning.kisiiuniversity.ac.ke/",
        "document_type": "portal",
        "category": "Digital Services",
        "description": "Kisii University e-learning platform.",
        "mime_type": "text/html",
        "display_order": 65,
    },
    {
        "slug": "student-staff-portal",
        "title": "Student/Staff Portal",
        "url": "https://portal.kisiiuniversity.ac.ke/",
        "document_type": "portal",
        "category": "Digital Services",
        "description": "Kisii University student and staff portal.",
        "mime_type": "text/html",
        "display_order": 70,
    },
    {
        "slug": "library-catalogue",
        "title": "Library Catalogue",
        "url": "http://library.kisiiuniversity.ac.ke/",
        "document_type": "portal",
        "category": "Library",
        "description": "Kisii University library catalogue.",
        "mime_type": "text/html",
        "display_order": 75,
    },
    {
        "slug": "myloft-e-resource-access",
        "title": "MyLOFT E-Resource Access",
        "url": "https://app.myloft.xyz/",
        "document_type": "portal",
        "category": "Library",
        "description": "Electronic books and journals access service listed by Kisii University Library.",
        "mime_type": "text/html",
        "display_order": 80,
    },
    {
        "slug": "institutional-repository",
        "title": "Institutional Repository",
        "url": "https://repository.kisiiuniversity.ac.ke:8080/",
        "document_type": "portal",
        "category": "Library",
        "description": "Kisii University institutional repository.",
        "mime_type": "text/html",
        "display_order": 85,
    },
    {
        "slug": "turnitin",
        "title": "Turnitin",
        "url": "https://www.turnitinuk.com/login_page.asp",
        "document_type": "portal",
        "category": "Digital Services",
        "description": "Turnitin access link listed among Kisii University resources.",
        "mime_type": "text/html",
        "display_order": 90,
    },
    {
        "slug": "kisii-university-revised-handbook-2019",
        "title": "Kisii University Revised Handbook 2019",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//Kisii%20University%20Revised%20Handbook%202019.pdf",
        "document_type": "handbook",
        "category": "Student Life",
        "description": "Dean of Students' Office student handbook source for Kisii University history, governance, student affairs, schools, conduct, and examination regulations.",
        "mime_type": "application/pdf",
        "display_order": 95,
    },
    {
        "slug": "ksuerp-access-and-permissions",
        "title": "KSUERP001 Access and Permissions",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//KSUERP001-Access and Permissions.pdf",
        "document_type": "form",
        "category": "Digital Services",
        "description": "ERP access and permissions document listed on the ICT department downloads page.",
        "mime_type": "application/pdf",
        "display_order": 96,
    },
    {
        "slug": "adverts-february-2026-kisii-university",
        "title": "Adverts February 2026 Kisii University",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//ADVERTS FEBRUARY 2026 KISII UNIVERSITY.pdf",
        "document_type": "notice",
        "category": "Administration",
        "description": "University adverts document listed on the Registrar Administration downloads page.",
        "mime_type": "application/pdf",
        "display_order": 97,
    },
    {
        "slug": "tender-notice-may-2026",
        "title": "Tender Notice May 2026",
        "url": f"{PUBLIC_SOURCE}/blog/tender-notice-may-2026",
        "document_type": "notice",
        "category": "Procurement",
        "description": "Tender notice migrated from the legacy public website.",
        "mime_type": "text/html",
        "display_order": 100,
    },
    {
        "slug": "notification-of-prequalification-of-suppliers-2026-2028",
        "title": "Notification of Prequalification of Suppliers 2026-2028",
        "url": f"{PUBLIC_SOURCE}/blog/notification-of-prequalification-of-suppliers-2026-2028",
        "document_type": "notice",
        "category": "Procurement",
        "description": "Supplier prequalification notice for the 2026-2028 cycle.",
        "mime_type": "text/html",
        "display_order": 110,
    },
    {
        "slug": "tender-servicing-of-printers-and-photocopiers-may-2026",
        "title": "Tender Servicing of Printers and Photocopiers May 2026",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//TENDER SERVICING OF PRINTERS AND PHOTOCOPIERS MAY 2026.pdf",
        "document_type": "tender",
        "category": "Procurement",
        "description": "Tender document listed on the Procurement and Supplies downloads page.",
        "mime_type": "application/pdf",
        "display_order": 120,
    },
    {
        "slug": "tender-for-water-plant-materials-may-2026",
        "title": "Tender for Water Plant Materials May 2026",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//TENDER FOR WATER PLANT MATERIALS MAY 2026.pdf",
        "document_type": "tender",
        "category": "Procurement",
        "description": "Tender document listed on the Procurement and Supplies downloads page.",
        "mime_type": "application/pdf",
        "display_order": 121,
    },
    {
        "slug": "tender-document-for-supply-of-servers-and-other-ict-equipments-may-2026",
        "title": "Tender Document for Supply of Servers and Other ICT Equipments May 2026",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//TENDER DOCUMENT FOR SUPPLY OF SERVERS AND OTHER ICT EQUIPMENTS MAY 2026.pdf",
        "document_type": "tender",
        "category": "Procurement",
        "description": "Tender document listed on the Procurement and Supplies downloads page.",
        "mime_type": "application/pdf",
        "display_order": 122,
    },
    {
        "slug": "structured-cabling-tender-may-2026",
        "title": "Structured Cabling Tender May 2026",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//STRUCTURED CABLING TENDER MAY 2026.pdf",
        "document_type": "tender",
        "category": "Procurement",
        "description": "Tender document listed on the Procurement and Supplies downloads page.",
        "mime_type": "application/pdf",
        "display_order": 123,
    },
    {
        "slug": "printing-press-materials-tender-document-may-2026",
        "title": "Printing Press Materials Tender Document May 2026",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//PRINTING PRESS MATERIALS TENDER DOCUMENT MAY 2026.pdf",
        "document_type": "tender",
        "category": "Procurement",
        "description": "Tender document listed on the Procurement and Supplies downloads page.",
        "mime_type": "application/pdf",
        "display_order": 124,
    },
    {
        "slug": "final-evaluation-report-for-supplier-prequalification-2026-2028",
        "title": "Final Evaluation Report for Supplier Prequalification 2026-2028",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//FINAL EVALUATION REPORT FOR SUPPLIER PREQUALOFICATION 2026-2028.pdf",
        "document_type": "notice",
        "category": "Procurement",
        "description": "Supplier prequalification evaluation report listed on the Procurement and Supplies downloads page.",
        "mime_type": "application/pdf",
        "display_order": 125,
    },
]


def _live_document_spec(spec: dict[str, object]) -> dict[str, object]:
    return {
        "slug": spec["slug"],
        "title": spec["title"],
        "url": spec["url"],
        "document_type": spec.get("document_type", "document"),
        "category": spec.get("category", "Official Website"),
        "description": f"Official Kisii University document linked from {spec['source_page_title']}.",
        "mime_type": spec["mime_type"],
        "display_order": spec["display_order"],
        "source_page_url": spec["source_page_url"],
        "source_page_title": spec["source_page_title"],
    }


def _merged_download_specs() -> list[dict[str, object]]:
    merged: list[dict[str, object]] = []
    seen_urls: set[str] = set()
    for spec in [*DOWNLOAD_SPECS, *(_live_document_spec(spec) for spec in LIVE_SITE_DOCUMENTS)]:
        url = str(spec["url"])
        if url in seen_urls:
            continue
        seen_urls.add(url)
        merged.append(spec)
    return merged


FAQ_SPECS = [
    {
        "question": "How do I apply to Kisii University?",
        "answer": "Choose a programme, confirm the entry requirements, complete the official application process, and submit the required documents through the admissions office or approved digital portal before the advertised deadline.",
        "category": "Admissions",
        "scope_type": "university",
        "is_main": True,
        "display_order": 10,
    },
    {
        "question": "Where do I download application forms and brochures?",
        "answer": "Use the Downloads page for application forms, course brochures, graduation booklets, tender notices, and other public documents migrated from the official website.",
        "category": "Downloads",
        "scope_type": "university",
        "is_main": True,
        "display_order": 20,
    },
    {
        "question": "How do I check admission status or follow up on an application?",
        "answer": "Use the admissions portal or contact the admissions office with your application details, programme name, and intake so the team can trace the application record.",
        "category": "Admissions",
        "scope_type": "university",
        "is_main": True,
        "display_order": 30,
    },
    {
        "question": "Where do I raise a support ticket or complaint?",
        "answer": "Use the Help Desk page to submit a support request, or follow the clear link to the digital portal where customer care and service requests are handled.",
        "category": "Support",
        "scope_type": "university",
        "is_main": True,
        "display_order": 40,
    },
    {
        "question": "How do I access e-learning?",
        "answer": "Students should use the university e-learning platform with their official student credentials and contact ICT or the e-learning directorate if login support is required.",
        "category": "Digital Services",
        "scope_type": "university",
        "is_main": True,
        "display_order": 50,
    },
    {
        "question": "How do I access the student or staff portal?",
        "answer": "Use the Student/Staff Portal link listed in Kisii University resources. Registration or sign-in requires the applicable registration number, admission number, PF number, or employee number.",
        "category": "Digital Services",
        "scope_type": "university",
        "is_main": True,
        "display_order": 55,
    },
    {
        "question": "Where do I access library electronic resources?",
        "answer": "Use the library links for the library website, catalogue, MyLOFT e-resource access, and institutional repository as listed on the official university website.",
        "category": "Library",
        "scope_type": "library",
        "is_main": False,
        "display_order": 58,
    },
    {
        "question": "Where can I find tenders and procurement notices?",
        "answer": "Current procurement notices are listed under Tenders and Downloads. Supplier prequalification and tender notices are also announced through official university communication channels.",
        "category": "Procurement",
        "scope_type": "university",
        "is_main": True,
        "display_order": 60,
    },
    {
        "question": "Where can I find graduation booklets?",
        "answer": "Graduation booklets are available through the Downloads and Admissions graduation booklet pages where public booklet links have been migrated.",
        "category": "Graduation",
        "scope_type": "university",
        "is_main": True,
        "display_order": 70,
    },
    {
        "question": "How do students join clubs and societies?",
        "answer": "Browse the seventy-one registered clubs on the campus life pages and open the one you are interested in. Clubs are registered and administered by the Office of the Dean of Students, so where a club publishes no contact of its own, that office holds the register and can point you to the current officials. Most clubs welcome new members at any point in the semester.",
        "category": "Clubs and societies",
        "scope_type": "student_life",
        "is_main": True,
        "display_order": 80,
    },
    {
        "question": "Where do students get welfare or campus life support?",
        "answer": "The Office of the Dean of Students offers support and welfare services to all students. It handles first-year registration and orientation, coordinates student loans and bursaries, provides counselling and chaplaincy services, manages sports and games activities, and registers and administers students' clubs and societies.",
        "category": "Welfare",
        "scope_type": "student_life",
        "is_main": True,
        "display_order": 90,
    },
    {
        "question": "Who represents students at Kisii University?",
        "answer": "The Kisii University Students Association (KSUSA) is the elected student government. Its officials are chosen by the student body and sworn in before the Vice Chancellor, and they hold the mandate to speak for students in university decisions that affect them.",
        "category": "Student democracy",
        "scope_type": "student_life",
        "is_main": True,
        "display_order": 100,
    },
    {
        "question": "What career support is available to students?",
        "answer": "The Office of Student Career Services, on the ground floor of the Sakagwa Academic Block, provides academic advising and one-on-one career counselling. It runs career progression workshops covering CV and cover letter writing and mock interviews, and links students to industry through recruitment drives, career fairs, internships and mentorship programmes.",
        "category": "Careers",
        "scope_type": "student_life",
        "is_main": True,
        "display_order": 110,
    },
    {
        "question": "Can students start a new club?",
        "answer": "Yes. Write the purpose of the club and find fifteen founding members, ask a member of staff to stand as patron, then register the constitution with the Office of the Dean of Students, which registers and administers all students' clubs and societies.",
        "category": "Clubs and societies",
        "scope_type": "student_life",
        "is_main": False,
        "display_order": 120,
    },
    {
        "question": "Is counselling available on campus?",
        "answer": "Counselling services are provided by the Office of the Dean of Students, alongside programmes on student orientation, mental health awareness, substance abuse prevention, gender-based violence prevention, peer counselling and mentorship.",
        "category": "Welfare",
        "scope_type": "student_life",
        "is_main": True,
        "display_order": 130,
    },
]


CONTACT_SPECS = [
    # Student-life offices. Only the university's published switchboard and
    # address are used: neither department publishes a direct line or a mailbox
    # of its own, and inventing one would send students nowhere.
    {
        "name": "Office of the Dean of Students",
        "contact_type": "student_welfare",
        "email": "info@kisiiuniversity.ac.ke",
        "phone": ["+254 720 875 082"],
        "physical_address": "Kisii University Main Campus, Kisii, Kenya",
        "operating_hours": {"weekdays": "8:00 AM - 5:00 PM"},
        "scope_type": "student_life",
        "is_main": True,
    },
    {
        "name": "Office of Student Career Services",
        "contact_type": "careers",
        "email": "info@kisiiuniversity.ac.ke",
        "phone": ["+254 720 875 082"],
        "physical_address": "Sakagwa Academic Block, ground floor, Kisii University Main Campus",
        "operating_hours": {"weekdays": "8:00 AM - 5:00 PM"},
        "scope_type": "student_life",
        "is_main": False,
    },
    {
        "name": "Kisii University Main Office",
        "contact_type": "main",
        "email": "info@kisiiuniversity.ac.ke",
        "phone": ["+254 720 875 082"],
        "physical_address": "P.O. Box 408-40200, Kisii, Kenya",
        "operating_hours": {"weekdays": "8:00 AM - 5:00 PM"},
        "scope_type": "university",
        "is_main": True,
    },
    {
        "name": "Admissions Office",
        "contact_type": "admissions",
        "email": "admissions@kisiiuniversity.ac.ke",
        "phone": ["+254 720 875 082"],
        "physical_address": "Kisii University Main Campus, Kisii, Kenya",
        "operating_hours": {"weekdays": "8:00 AM - 5:00 PM"},
        "scope_type": "university",
        "is_main": False,
    },
    {
        "name": "Academic Registrar",
        "contact_type": "academic_affairs",
        "email": "acregistrar@kisiiuniversity.ac.ke",
        "phone": ["+254 720 875 082"],
        "physical_address": "Kisii University Main Campus, Kisii, Kenya",
        "operating_hours": {"weekdays": "8:00 AM - 5:00 PM"},
        "scope_type": "university",
        "is_main": False,
    },
    {
        "name": "ICT and Digital Services",
        "contact_type": "ict",
        "email": "info@kisiiuniversity.ac.ke",
        "phone": ["+254 720 875 082"],
        "physical_address": "Kisii University Main Campus, Kisii, Kenya",
        "operating_hours": {"weekdays": "8:00 AM - 5:00 PM"},
        "scope_type": "university",
        "is_main": False,
    },
    {
        "name": "Customer Care Centre",
        "contact_type": "support",
        "email": "info@kisiiuniversity.ac.ke",
        "phone": ["+254 720 875 082"],
        "physical_address": "Kisii University Main Campus, Kisii, Kenya",
        "operating_hours": {"weekdays": "8:00 AM - 5:00 PM"},
        "scope_type": "university",
        "is_main": False,
    },
    {
        "name": "Dean of Students Office",
        "contact_type": "student_life",
        "email": "info@kisiiuniversity.ac.ke",
        "phone": ["+254 720 875 082"],
        "physical_address": "Kisii University Main Campus, Kisii, Kenya",
        "operating_hours": {"weekdays": "8:00 AM - 5:00 PM"},
        "scope_type": "student_life",
        "is_main": False,
    },
]


CLUB_SOURCE_URL = f"{PUBLIC_SOURCE}/A-ZClubs"

OFFICIAL_CLUB_INDEX: list[tuple[str, str]] = [
    ("21. KINYAUSA ASSOCIATION", "county"),
    ("ACCOUNTING STUDENTS ASSOCIATION", "professional"),
    ("ART AND POETRY", "edu-tainment"),
    ("BANKING AND FINANCE STUDENTS ASSOCIATION", "professional"),
    ("BARINGO COUNTY STUDENTS ASSOCIATION", "county"),
    ("BIODIVERSITY", "edu-service"),
    ("BOMET COUNTY STUDENTS ASSOCIATION", "county"),
    ("BUNGOMA COUNTY STUDENTS ASSOCIATION", "county"),
    ("BUSIA COUNTY STUDENTS ASSOCIATION", "county"),
    ("CATHOLIC ACTION", "religious"),
    ("CHRISTIAN UNION", "religious"),
    ("COMEDY CLUB", "edu-tainment"),
    ("COOPERATIVE STUDENTS ASSOCIATION", "professional"),
    ("DRAMA", "edu-tainment"),
    ("ECONOMICS AND APPLIED STATISTICS STUDENTS ASSOCIATION", "professional"),
    ("ELGEYOMARAKWET COUNTY STUDENTS ASSOCIATION", "county"),
    ("EMBU COUNTY STUDENTS ASSOCIATION", "county"),
    ("HEART ASSOCIATION", "edu-service"),
    ("HOMABAY COUNTY STUDENTS ASSOCIATION", "county"),
    ("HUMAN RIGHTS STUDENTS ASSOCIATION", "professional"),
    ("INFORMATION SCIENCE ASSOCIATION", "professional"),
    ("INTERNATIONAL YOUTH FELLOWSHIP", "mentorship"),
    ("KAKAMEGA COUNTY STUDENTS ASSOCIATION", "county"),
    ("KENPO KARATE", "edu-tainment"),
    ("KERICHO COUNTY STUDENTS ASSOCIATION", "county"),
    ("KILIFI COUNTY STUDENTS ASSOCIATION", "county"),
    ("KIRINYANGA COUNTY STUDENTS ASSOCIATION", "county"),
    ("KISII UNIVERSITY PUBLIC POLICY RESEARCH ASSOCIATION", "mentorship"),
    ("KISII UNIVERSITY STUDENTS TEACHERS ASSOCIATION", "professional"),
    ("KWALE COUNTY STUDENTS ASSOCIATION", "county"),
    ("LAIKIPIA COUNTY STUDENTS ASSOCIATION", "county"),
    ("LAW STUDENTS ASSOCIATION", "professional"),
    ("MAKUENI COUNTY STUDENTS ASSOCIATION", "county"),
    ("MEDICAL LABARATORY STUDENTS ASSOCIATION OF KISII UNIVERSITY", "professional"),
    ("MEDICAL STUDENTS ASSOCIATION", "professional"),
    ("MERU AND THARAKA NITHI STUDENTS ASSOCIATION", "county"),
    ("MIGORI COUNTY STUDENTS ASSOCIATION", "county"),
    ("MODELING", "mentorship"),
    ("MODERN DANCE", "edu-tainment"),
    ("MURANG'A COUNTY STUDENTS ASSOCIATION", "county"),
    ("MUSLIM", "religious"),
    ("NAKURU COUNTY STUDENTS ASSOCIATION", "county"),
    ("NANDI COUNTY STUDENTS ASSOCIATION", "county"),
    ("NAROK COUNTY STUDENTS ASSOCIATION", "county"),
    ("NYANDARUA COUNTY STUDENTS ASSOCIATION", "county"),
    ("NYERI COUNTY STUDENTS ASSOCIATION", "county"),
    ("OUTREACH MINISTRIES", "religious"),
    ("PAK", "mentorship"),
    ("PANASA", "mentorship"),
    ("PHARMACY STUDENTS ASSOCIATION", "professional"),
    ("PRESIDENT AWARDS", "mentorship"),
    ("PROCUREMENT AND LOGISTICS STUDENTS ASSOCIATION", "professional"),
    ("PROJECT MANAGEMENT STUDENTS ASSOCIATION", "professional"),
    ("PSYCHOLOGY STUDENTS ASSOCIATION", "professional"),
    ("PURE AND APLLIED SCIENCE STUDENTS ASSOCIATION", "professional"),
    ("ROLLER SKATERS STUDENTS ASSOCIATION", "edu-tainment"),
    ("SALSA", "edu-tainment"),
    ("SAMBURU COUNTY STUDENTS ASSOCIATION", "county"),
    ("SCOUTS", "edu-service"),
    ("SDA", "religious"),
    ("SIAYA COUNTY STDENTS ASSOCIATION", "county"),
    ("ST.JOHN AMBULANCE", "edu-service"),
    ("TAX SOCIETY", "mentorship"),
    ("THE ACTUARIAL STUDENTS SOCIETY", "professional"),
    ("THE KISII UNIVERSITY MATHEMATICS STUDENTS ASSOCIATION", "professional"),
    ("TRANS-NZOIA COUNTY STUDENTS ASSOCIATION", "county"),
    ("TURKANA COUNTY STUDENTS ASSOCIATION", "county"),
    ("UASIN GISHU COUNTY STUDENTS ASSOCIATION", "county"),
    ("UNIVERSITY CHOIR", "edu-tainment"),
    ("VIHIGA COUNTY STUDENTS ASSOCIATION", "county"),
    ("YOUNG FARMERS ASSOCIATION", "mentorship"),
]


# What each cohort actually is, written for a student deciding whether to walk
# in. The official index publishes only a name and a cohort, so these describe
# the kind of body a club belongs to; nothing here asserts a fact about an
# individual club that the university has not published.
#
# Deliberately absent: membership numbers, meeting times, fees, office
# locations and contacts. Those are real-world facts the register does not
# carry, and a plausible guess at one is worse than an honest blank.
CLUB_COHORTS: dict[str, dict[str, str]] = {
    "county": {
        "label": "County students' association",
        "about": (
            "A county students' association brings together everyone at Kisii "
            "University who comes from the same county. For most members it is "
            "the first familiar room they find on campus: people who speak the "
            "same first language, know the same places back home, and have "
            "already worked out where to find what a new student needs."
        ),
        "mission": (
            "To help students from the county settle into university life, keep "
            "ties to home, and look out for one another through their studies."
        ),
        "objectives": (
            "Welcome and orient first-year students from the county. "
            "Organise social, cultural and welfare activities through the year. "
            "Represent members' concerns to the students' association and the "
            "Dean of Students. Support members facing financial or personal "
            "difficulty. Keep contact with alumni from the same county."
        ),
    },
    "professional": {
        "label": "Course-linked professional body",
        "about": (
            "A professional students' association is organised around a course "
            "of study, and exists to put students in contact with the "
            "profession before they graduate into it. Members meet practitioners, "
            "prepare for professional examinations and industry attachments, and "
            "run the academic events their department is known for."
        ),
        "mission": (
            "To bridge the classroom and the profession, so members graduate "
            "with the contacts, practical exposure and confidence the field "
            "expects."
        ),
        "objectives": (
            "Link members with practitioners, employers and professional bodies. "
            "Run seminars, workshops, clinics and industry visits. Support "
            "preparation for professional examinations and attachments. Mentor "
            "junior students through the course. Represent members academically "
            "within the school or department."
        ),
    },
    "edu-tainment": {
        "label": "Performing and creative arts club",
        "about": (
            "A performing arts club is where students go for the part of "
            "university that has nothing to do with a transcript: stage, page, "
            "music, movement and sport for its own sake. These are the groups "
            "that carry the university's name to the annual Cultural Festival "
            "and to inter-university competitions."
        ),
        "mission": (
            "To give students a stage, an audience and the discipline of "
            "rehearsal, and to represent Kisii University where talent is "
            "judged."
        ),
        "objectives": (
            "Train and rehearse members through the semester. Perform at "
            "university events and the annual Cultural Festival. Compete in "
            "inter-university and national festivals. Welcome beginners "
            "alongside experienced performers. Keep the university's cultural "
            "and creative traditions in practice."
        ),
    },
    "mentorship": {
        "label": "Mentorship and advocacy society",
        "about": (
            "A mentorship society organises students around a cause or a skill "
            "rather than a course: public policy, tax literacy, agriculture, "
            "youth leadership, personal development. Members take the subject "
            "beyond campus, and some of these societies have earned national "
            "recognition for it."
        ),
        "mission": (
            "To develop members as leaders and practitioners in a chosen field, "
            "and to carry that work into the community beyond the university."
        ),
        "objectives": (
            "Train members through workshops, mentorship and practical projects. "
            "Engage the wider community and relevant national bodies. Enter "
            "national competitions and awards in the field. Pair junior members "
            "with senior ones and with alumni. Build the professional and civic "
            "networks members will graduate into."
        ),
    },
    "religious": {
        "label": "Faith community",
        "about": (
            "A faith community on campus keeps its own calendar of worship, "
            "fellowship and service alongside the academic one. Members meet "
            "regularly through the semester, and the groups are open to any "
            "student who wants to attend."
        ),
        "mission": (
            "To provide a place of worship, fellowship and pastoral support for "
            "students of the faith throughout their time at the university."
        ),
        "objectives": (
            "Hold regular worship and fellowship meetings on campus. Offer "
            "pastoral care and counsel to members. Run community outreach and "
            "charitable service. Welcome new students into the community each "
            "intake. Work alongside the other faith communities on campus."
        ),
    },
    "edu-service": {
        "label": "Service and volunteering corps",
        "about": (
            "A service corps trains students to be useful when it matters: "
            "first aid, emergency response, conservation, scouting and "
            "community work. Members train so that the person standing closest "
            "in an emergency is someone who knows what to do, and the "
            "university's brigades have represented Kisii at national parades."
        ),
        "mission": (
            "To train students in practical service skills and put them to work "
            "for the university and the surrounding community."
        ),
        "objectives": (
            "Train members in first aid, safety or conservation practice. "
            "Provide duty cover at university events and ceremonies. Serve the "
            "surrounding community through organised outreach. Represent the "
            "university at national parades and camps. Maintain the standards "
            "of the parent national body."
        ),
    },
}


def _club_spec(name: str, cohort: str, display_order: int) -> dict[str, object]:
    """Build a club record from the official index entry and its cohort.

    The public index at ``CLUB_SOURCE_URL`` publishes a name and a cohort and
    nothing else, so the descriptive copy comes from the cohort. Contact
    details, membership counts, fees and schedules are left unset rather than
    invented; the public pages omit what is not published.
    """
    cohort_copy = CLUB_COHORTS.get(cohort)
    if cohort_copy is None:  # pragma: no cover - guards a new cohort appearing
        raise ValueError(f"No description written for club cohort {cohort!r}")
    return {
        "slug": slugify(name),
        "name": name,
        "club_type": cohort,
        "about": cohort_copy["about"],
        "mission": cohort_copy["mission"],
        "objectives": cohort_copy["objectives"],
        "membership_count": 0,
        "display_order": display_order,
    }


CLUB_SPECS = [
    _club_spec(name, cohort, display_order)
    for display_order, (name, cohort) in enumerate(OFFICIAL_CLUB_INDEX, start=10)
]


# The elected student body and the office it answers to.
#
# KSUSA is named on the university's own site, which reports its leaders taking
# the oath of office before the Vice Chancellor. Office bearers are not seeded:
# they change with each election, and naming the wrong student is worse than
# naming none. Terms, contacts and office locations are likewise left unset
# until Student Affairs publishes them.
STUDENT_GOVERNANCE_SPECS: list[dict[str, object]] = [
    {
        "slug": "ksusa",
        "name": "Kisii University Students Association",
        "acronym": "KSUSA",
        "governance_type": "student_association",
        "about": (
            "KSUSA is the elected student government of Kisii University. Its "
            "officials are chosen by the student body and sworn in before the "
            "Vice Chancellor, and they hold the mandate to speak for students "
            "in university decisions that affect them."
        ),
        "mandate": (
            "To represent the interests of every registered student, to channel "
            "student concerns to university management, and to organise and "
            "account for student activities and welfare across the campuses."
        ),
        "constitution": (
            "KSUSA operates under a constitution approved by the university, "
            "which sets out the elected offices, the conduct of elections, and "
            "the handover of office at the end of each term."
        ),
        "display_order": 10,
    },
    {
        "slug": "dean-of-students",
        "name": "Office of the Dean of Students",
        "acronym": None,
        "governance_type": "administration",
        # Wording follows the department's own published About and Mandate at
        # kisiiuniversity.ac.ke/dpt/dean-of-students/about.
        "about": (
            "The Department offers support and welfare services to all students "
            "in the University. Student support services consist of all academic "
            "and non-academic services that students require to enable them "
            "comfortably pursue their studies."
        ),
        "mandate": (
            "To develop, nurture and promote an enabling environment that "
            "supports and enhances both academic and developmental pursuits of "
            "students. The department registers and orients first-year students, "
            "coordinates student loans and bursaries, provides counselling and "
            "chaplaincy services, manages sports and games activities, and "
            "registers and administers students' clubs and societies."
        ),
        "constitution": None,
        "display_order": 20,
    },
    {
        "slug": "student-career-services",
        "name": "Office of Student Career Services",
        "acronym": "OSCS",
        "governance_type": "administration",
        # From the department's published About and Mandate at
        # kisiiuniversity.ac.ke/dpt/student-career-services/about.
        "about": (
            "Established in October 2018, the Office of Student Career Services "
            "is a support system for students in their career journey. It works "
            "with university students and with secondary school students, "
            "helping them explore career options and prepare for the job market."
        ),
        "mandate": (
            "Academic advising and one-on-one career counselling. Career "
            "progression workshops covering CV and cover letter writing and mock "
            "interviews. Industry linkages through recruitment drives, career "
            "fairs, internships and mentorship. Inter-institutional exchanges "
            "and an entrepreneurial incubator for graduates."
        ),
        "constitution": None,
        "office_location": "Sakagwa Academic Block, ground floor",
        "display_order": 30,
    },
]


ANNOUNCEMENT_SPECS = [
    {
        "slug": "tender-notice-may-2026",
        "title": "Tender Notice May 2026",
        "summary": "Kisii University published a tender notice for May 2026.",
        "plain_text": "The university has published a tender notice for May 2026. Suppliers should review the official notice and follow the stated submission instructions and deadlines.",
        "category": "Procurement",
        "priority": "high",
        "audience": "suppliers",
        "published_at": datetime(2026, 5, 1, 9, 0, tzinfo=EAT),
        "valid_to": datetime(2026, 6, 30, 17, 0, tzinfo=EAT),
        "related_links": [{"label": "Tender notice", "url": f"{PUBLIC_SOURCE}/blog/tender-notice-may-2026"}],
        "display_order": 10,
    },
    {
        "slug": "notification-of-prequalification-of-suppliers-2026-2028",
        "title": "Notification of Prequalification of Suppliers 2026-2028",
        "summary": "Kisii University published supplier prequalification information for the 2026-2028 period.",
        "plain_text": "Suppliers should review the official prequalification notice for eligibility, documentation, categories, and submission guidance for the 2026-2028 cycle.",
        "category": "Procurement",
        "priority": "high",
        "audience": "suppliers",
        "published_at": datetime(2026, 5, 1, 9, 30, tzinfo=EAT),
        "valid_to": datetime(2028, 6, 30, 17, 0, tzinfo=EAT),
        "related_links": [
            {
                "label": "Prequalification notice",
                "url": f"{PUBLIC_SOURCE}/blog/notification-of-prequalification-of-suppliers-2026-2028",
            }
        ],
        "display_order": 20,
    },
    {
        "slug": "kuccps-portal-is-now-open-for-undergraduate-programmes",
        "title": "KUCCPS Portal is now open for Undergraduate Programmes",
        "summary": "Prospective undergraduate applicants can use the open KUCCPS portal to select Kisii University programmes.",
        "plain_text": "Prospective undergraduate students should use the KUCCPS portal while it is open and confirm programme choices, requirements, and deadlines before submission.",
        "category": "Admissions",
        "priority": "normal",
        "audience": "applicants",
        "published_at": datetime(2026, 4, 8, 9, 30, tzinfo=EAT),
        "valid_to": datetime(2026, 12, 31, 17, 0, tzinfo=EAT),
        "related_links": [
            {
                "label": "Original Kisii University post",
                "url": f"{PUBLIC_SOURCE}/blog/kuccps-portal-is-now-open-for-undergraduate-programmes",
            }
        ],
        "display_order": 30,
    },
    {
        "slug": "kisii-university-course-brochure",
        "title": "Kisii University Course Brochure",
        "summary": "The official Kisii University course brochure is available for applicants and visitors.",
        "plain_text": "Applicants can download the course brochure to review programme options, entry guidance, and admissions information.",
        "category": "Admissions",
        "priority": "normal",
        "audience": "applicants",
        "published_at": datetime(2026, 1, 15, 9, 0, tzinfo=EAT),
        "valid_to": None,
        "related_links": [{"label": "Download course brochure", "url": DOWNLOAD_SPECS[0]["url"]}],
        "display_order": 40,
    },
]


ADMISSION_ATTACHMENT_MAP = {
    "bachelors-degree-application-procedure": "application-form-for-undergraduate",
    "postgraduate-application-procedure": "postgraduate-application-form",
    "diploma-application-procedure": "application-form-for-diploma",
    "certificate-application-procedure": "application-form-for-certificate-or-bridging",
    "bridging-application-procedure": "application-form-for-certificate-or-bridging",
    "graduation-application-and-clearance": "kisii-university-15th-graduation-booklet-2026",
    "admissions-booklet": "kisii-university-course-brochure",
    "programme-brochures": "kisii-university-course-brochure",
}


def _hash_url(url: str) -> str:
    return hashlib.sha256(url.encode("utf-8")).hexdigest()


def _filename_from_spec(spec: dict[str, object]) -> str:
    suffix = ".pdf" if spec["mime_type"] == "application/pdf" else ".html"
    return f"{spec['slug']}{suffix}"


async def _upsert_external_media(db: AsyncSession, spec: dict[str, object]) -> Media:
    storage_path = f"seed/external/{_filename_from_spec(spec)}"
    media = (
        await db.execute(
            select(Media).where(or_(Media.storage_path == storage_path, Media.public_url == spec["url"]))
        )
    ).scalar_one_or_none()
    payload = {
        "filename": _filename_from_spec(spec),
        "original_filename": _filename_from_spec(spec),
        "mime_type": spec["mime_type"],
        "file_size": 0,
        "file_hash": _hash_url(str(spec["url"])),
        "storage_provider": "external",
        "storage_path": storage_path,
        "public_url": spec["url"],
        "cdn_url": None,
        "title": spec["title"],
        "alt_text": spec["title"],
        "description": spec["description"],
        "caption": None,
        "tags": ["kisii-university", "download", str(spec["category"]).lower()],
        "credit": "Kisii University",
        "media_type": "document",
        "is_public": True,
        "is_processed": True,
        "extra_metadata": {
            "source": "kisiiuniversity.ac.ke",
            "seed_asset": True,
            "source_page_url": spec.get("source_page_url"),
            "source_page_title": spec.get("source_page_title"),
        },
    }
    if media is None:
        media = Media(id=uuid.uuid4(), **payload)
        db.add(media)
    else:
        for field_name, value in payload.items():
            setattr(media, field_name, value)
    await db.flush()
    return media


async def _upsert_document(db: AsyncSession, spec: dict[str, object], media: Media) -> None:
    document = (await db.execute(select(Document).where(Document.slug == spec["slug"]))).scalar_one_or_none()
    payload = {
        "title": spec["title"],
        "slug": spec["slug"],
        "document_type": spec["document_type"],
        "category": spec["category"],
        "description": spec["description"],
        "scope_type": "university",
        "scope_id": None,
        "file_id": media.id,
        "version": "migrated",
        "is_public": True,
        "requires_login": False,
        "is_active": True,
        "display_order": spec["display_order"],
    }
    if document is None:
        document = Document(id=uuid.uuid4(), **payload)
        db.add(document)
    else:
        for field_name, value in payload.items():
            setattr(document, field_name, value)
    await db.flush()


async def _upsert_faq(db: AsyncSession, spec: dict[str, object]) -> None:
    item = (await db.execute(select(FAQ).where(FAQ.question == spec["question"]))).scalar_one_or_none()
    payload = {
        "question": spec["question"],
        "answer_plain_text": spec["answer"],
        "answer_rich_text": f"<p>{spec['answer']}</p>",
        "answer_structured": None,
        "category": spec["category"],
        "scope_type": spec["scope_type"],
        "scope_id": None,
        "is_main": spec["is_main"],
        "is_public": True,
        "status": "published",
        "display_order": spec["display_order"],
    }
    if item is None:
        item = FAQ(id=uuid.uuid4(), **payload)
        db.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await db.flush()


async def _upsert_contact(db: AsyncSession, spec: dict[str, object]) -> None:
    item = (await db.execute(select(ContactDirectory).where(ContactDirectory.name == spec["name"]))).scalar_one_or_none()
    payload = {
        "name": spec["name"],
        "contact_type": spec["contact_type"],
        "email": spec["email"],
        "phone": spec["phone"],
        "extension": None,
        "physical_address": spec["physical_address"],
        "building": None,
        "room_number": None,
        "operating_hours": spec["operating_hours"],
        "contact_person_id": None,
        "scope_type": spec["scope_type"],
        "scope_id": None,
        "is_main": spec["is_main"],
        "is_public": True,
        "status": "active",
    }
    if item is None:
        item = ContactDirectory(id=uuid.uuid4(), **payload)
        db.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await db.flush()


async def _upsert_club(db: AsyncSession, spec: dict[str, object]) -> None:
    club = (await db.execute(select(Club).where(Club.slug == spec["slug"]))).scalar_one_or_none()
    payload = {
        "name": spec["name"],
        "slug": spec["slug"],
        "club_type": spec["club_type"],
        "school_id": None,
        "department_id": None,
        "patron_id": None,
        "chairperson_id": None,
        "vice_chairperson_id": None,
        "secretary_id": None,
        "treasurer_id": None,
        "about": spec["about"],
        "mission": spec["mission"],
        "objectives": spec["objectives"],
        "email": None,
        "phone": None,
        "social_media": None,
        "membership_fee": None,
        "meeting_schedule": None,
        "registration_date": None,
        "logo_id": None,
        "cover_image_id": None,
        "membership_count": spec["membership_count"],
        "is_active": True,
        "is_public": True,
        "display_order": spec["display_order"],
    }
    if club is None:
        club = Club(id=uuid.uuid4(), **payload)
        db.add(club)
    else:
        for field_name, value in payload.items():
            setattr(club, field_name, value)
    await db.flush()


async def _upsert_student_governance(db: AsyncSession, spec: dict[str, object]) -> None:
    item = (
        await db.execute(
            select(StudentGovernance).where(StudentGovernance.slug == spec["slug"])
        )
    ).scalar_one_or_none()
    payload = {
        "name": spec["name"],
        "slug": spec["slug"],
        "acronym": spec["acronym"],
        "governance_type": spec["governance_type"],
        "about": spec["about"],
        "mandate": spec["mandate"],
        "constitution": spec["constitution"],
        # Office bearers, terms and contacts change with each election and are
        # not published on the public site; they stay unset rather than guessed.
        # An office location is seeded only where the department publishes one.
        "school_id": None,
        "chairperson_id": None,
        "vice_chairperson_id": None,
        "secretary_general_id": None,
        "term_start": None,
        "term_end": None,
        "email": None,
        "phone": None,
        "office_location": spec.get("office_location"),
        "logo_id": None,
        "is_active": True,
    }
    if item is None:
        item = StudentGovernance(id=uuid.uuid4(), **payload)
        db.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await db.flush()


async def _upsert_announcement(db: AsyncSession, spec: dict[str, object]) -> None:
    item = (await db.execute(select(Announcement).where(Announcement.slug == spec["slug"]))).scalar_one_or_none()
    payload = {
        "title": spec["title"],
        "slug": spec["slug"],
        "summary": spec["summary"],
        "plain_text": spec["plain_text"],
        "rich_text": f"<p>{spec['plain_text']}</p>",
        "structured_content": {"source": "kisiiuniversity.ac.ke", "seed_asset": True},
        "related_links": spec["related_links"],
        "featured_media_id": None,
        "author_user_id": None,
        "meta_title": spec["title"],
        "meta_description": _seo_description(spec["summary"]),
        "keywords": {"tags": ["kisii university", str(spec["category"]).lower()]},
        "scope_type": "university",
        "scope_id": None,
        "is_main": True,
        "is_public": True,
        "is_published": True,
        "published_at": spec["published_at"],
        "valid_from": spec["published_at"],
        "valid_to": spec["valid_to"],
        "archived_at": None,
        "status": "published",
        "display_order": spec["display_order"],
        "priority": spec["priority"],
        "category": spec["category"],
        "audience": spec["audience"],
    }
    if item is None:
        item = Announcement(id=uuid.uuid4(), **payload)
        db.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await db.flush()


async def _attach_admissions_downloads(db: AsyncSession, media_by_slug: dict[str, Media]) -> None:
    for admission_slug, media_slug in ADMISSION_ATTACHMENT_MAP.items():
        info = (await db.execute(select(AdmissionInfo).where(AdmissionInfo.slug == admission_slug))).scalar_one_or_none()
        media = media_by_slug.get(media_slug)
        if info is None or media is None:
            continue
        info.attachment_media_id = media.id
        info.external_url = media.public_url
    await db.flush()


async def seed_public_records(db: AsyncSession, ctx: SeedContext) -> None:
    del ctx

    media_by_slug: dict[str, Media] = {}
    for spec in _merged_download_specs():
        media = await _upsert_external_media(db, spec)
        media_by_slug[str(spec["slug"])] = media
        await _upsert_document(db, spec, media)

    for spec in FAQ_SPECS:
        await _upsert_faq(db, spec)

    for spec in CONTACT_SPECS:
        await _upsert_contact(db, spec)

    for spec in CLUB_SPECS:
        await _upsert_club(db, spec)

    for spec in STUDENT_GOVERNANCE_SPECS:
        await _upsert_student_governance(db, spec)

    for spec in ANNOUNCEMENT_SPECS:
        await _upsert_announcement(db, spec)

    await _attach_admissions_downloads(db, media_by_slug)
