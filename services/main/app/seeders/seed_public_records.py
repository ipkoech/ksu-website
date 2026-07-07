"""Seed public utility records that are consumed by website API pages."""

from __future__ import annotations

import hashlib
import uuid
from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AdmissionInfo, Announcement, Club, ContactDirectory, Document, FAQ, Media
from app.schemas.base import slugify

from ._shared import SeedContext
from .live_site_snapshot import LIVE_SITE_DOCUMENTS


EAT = ZoneInfo("Africa/Nairobi")
PUBLIC_SOURCE = "https://kisiiuniversity.ac.ke"


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
        "description": "Diploma programme application form published by Kisii University.",
        "mime_type": "application/pdf",
        "display_order": 25,
    },
    {
        "slug": "application-form-for-certificate-or-bridging",
        "title": "Application Form for Certificate or Bridging",
        "url": f"{PUBLIC_SOURCE}/storage/public/downloads//APPLICATION%20FORM%20FOR%20CERTIFICATE%20or%20BRIDGING.pdf",
        "document_type": "form",
        "category": "Admissions",
        "description": "Certificate and bridging programme application form published by Kisii University.",
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
        "description": "Student handbook listed on the Dean of Students downloads page.",
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
        "answer": "Students can review active clubs through the campus life section, then contact the dean of students or the listed club contact for registration guidance.",
        "category": "Student Life",
        "scope_type": "student_life",
        "is_main": False,
        "display_order": 80,
    },
    {
        "question": "Where do students get welfare or campus life support?",
        "answer": "Students should contact the dean of students office for welfare, clubs, societies, accommodation guidance, and campus life support.",
        "category": "Student Life",
        "scope_type": "student_life",
        "is_main": False,
        "display_order": 90,
    },
]


CONTACT_SPECS = [
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


def _club_spec(name: str, cohort: str, display_order: int) -> dict[str, object]:
    cohort_label = f"{cohort.replace('-', ' ')} cohort"
    return {
        "slug": slugify(name),
        "name": name,
        "club_type": cohort,
        "about": f"{name} is listed on the official Kisii University Clubs & Societies index under the {cohort_label}.",
        "mission": f"Official Kisii University club record published under the {cohort_label}.",
        "objectives": f"Maintain the public club listing from {CLUB_SOURCE_URL}.",
        "membership_count": 0,
        "display_order": display_order,
    }


CLUB_SPECS = [
    _club_spec(name, cohort, display_order)
    for display_order, (name, cohort) in enumerate(OFFICIAL_CLUB_INDEX, start=10)
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
        "meta_description": spec["summary"],
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

    for spec in ANNOUNCEMENT_SPECS:
        await _upsert_announcement(db, spec)

    await _attach_admissions_downloads(db, media_by_slug)
