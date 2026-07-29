"""Seed applicant pathways, requirements, fees, documents, FAQs and admissions page sections."""

from __future__ import annotations

from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    AdmissionDocument,
    AdmissionFaq,
    AdmissionPageSection,
    AdmissionPathway,
    AdmissionRequirement,
    Intake,
    Programme,
    ProgrammeFeeStructure,
)
from app.schemas.base import slugify

from ._shared import SeedContext


PATHWAYS = [
    {
        "title": "KUCCPS",
        "applicant_type": "kuccps",
        "summary": "Government-sponsored applicants placed through KUCCPS.",
        "eligibility_notes": "Confirm placement details, programme requirements and reporting instructions before registration.",
        "cta_label": "Open admission centre",
        "cta_url": "https://digital.kisiiuniversity.ac.ke/students/admissions/center",
    },
    {
        "title": "Self-sponsored",
        "applicant_type": "self_sponsored",
        "summary": "Applicants applying directly through the Kisii University online application system.",
        "eligibility_notes": "Choose a programme, confirm entry requirements and submit before the advertised deadline.",
        "cta_label": "Apply online",
        "cta_url": "https://digital.kisiiuniversity.ac.ke/new_student_landing_page",
    },
    {
        "title": "International",
        "applicant_type": "international",
        "summary": "Applicants with international qualifications or joining from outside Kenya.",
        "eligibility_notes": "Prepare certified records, passport details and equivalence documentation where required.",
        "cta_label": "Contact admissions",
        "cta_url": "/contact",
    },
    {
        "title": "Transfer",
        "applicant_type": "transfer",
        "summary": "Applicants seeking inter-university or programme transfer guidance.",
        "eligibility_notes": "Provide certified academic history and confirm current transfer rules with admissions.",
        "cta_label": "Ask admissions",
        "cta_url": "/contact",
    },
    {
        "title": "Postgraduate",
        "applicant_type": "postgraduate",
        "summary": "Postgraduate diploma, masters and doctoral applicants.",
        "eligibility_notes": "Prepare degree certificates, transcripts, referees and research concept documents where required.",
        "cta_label": "Apply online",
        "cta_url": "https://digital.kisiiuniversity.ac.ke/new_student_landing_page",
    },
    {
        "title": "Diploma / Certificate",
        "applicant_type": "diploma_certificate",
        "summary": "Certificate, bridging and diploma applicants joining academic and professional pathways.",
        "eligibility_notes": "Confirm minimum grade and programme-specific requirements before applying.",
        "cta_label": "Apply online",
        "cta_url": "https://digital.kisiiuniversity.ac.ke/new_student_landing_page",
    },
]

COMMON_STEPS = [
    {"title": "Choose a programme", "body": "Compare level, duration, department and career fit."},
    {"title": "Check requirements", "body": "Confirm the route and programme-specific entry rules."},
    {"title": "Apply officially", "body": "Submit through the approved university system."},
]

COMMON_DOCUMENTS = [
    {"title": "Academic certificates"},
    {"title": "National ID / passport / birth certificate"},
    {"title": "Passport-size photo"},
    {"title": "Supporting documents required by the applicant route"},
]

FAQS = [
    ("How do I apply to Kisii University?", "Choose a programme, confirm requirements, then submit through the official online application portal."),
    ("Where do I download my admission letter?", "Use the external Kisii University admission centre when admission letters are released."),
    ("Can international applicants apply?", "Yes. International applicants should prepare certified academic records, passport details and any equivalence evidence required."),
    ("Where are programme fees shown?", "Programme fees are managed on programme detail pages and should be verified against approved fee-structure documents."),
    ("Can I change programme after admission?", "Programme changes depend on current university rules, capacity and Senate-approved requirements. Contact admissions for guidance."),
]


async def _one_or_none(db: AsyncSession, model, **filters):
    query = select(model)
    for key, value in filters.items():
        query = query.where(getattr(model, key) == value)
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def seed_admissions_catalog(db: AsyncSession, ctx: SeedContext) -> None:
    pathway_by_type: dict[str, AdmissionPathway] = {}
    for index, spec in enumerate(PATHWAYS, start=1):
        slug = slugify(spec["title"].replace("/", " "))
        pathway = await _one_or_none(db, AdmissionPathway, slug=slug)
        payload = {
            **spec,
            "slug": slug,
            "application_steps": COMMON_STEPS,
            "required_documents": COMMON_DOCUMENTS,
            "is_published": True,
            "display_order": index * 10,
        }
        if pathway is None:
            pathway = AdmissionPathway(**payload)
            db.add(pathway)
        else:
            for key, value in payload.items():
                setattr(pathway, key, value)
        pathway_by_type[pathway.applicant_type] = pathway

    programmes = list(
        (
            await db.execute(
                select(Programme)
                .options(selectinload(Programme.department))
                .where(Programme.is_active.is_(True))
                .order_by(Programme.display_order.asc(), Programme.name.asc())
                .limit(10)
            )
        )
        .scalars()
        .all()
    )
    intake = (
        await db.execute(
            select(Intake)
            .where(Intake.is_active.is_(True))
            .order_by(Intake.application_start.desc())
            .limit(1)
        )
    ).scalar_one_or_none()

    for programme in programmes:
        applicant_type = (
            "postgraduate"
            if "post" in programme.level.lower() or "master" in programme.level.lower() or "phd" in programme.level.lower()
            else "diploma_certificate"
            if "diploma" in programme.level.lower() or "certificate" in programme.level.lower()
            else "self_sponsored"
        )
        requirement_title = f"{programme.name} entry requirement"
        requirement = await _one_or_none(
            db,
            AdmissionRequirement,
            programme_id=programme.id,
            applicant_type=applicant_type,
        )
        if requirement is None:
            requirement = AdmissionRequirement(
                title=requirement_title,
                applicant_type=applicant_type,
                programme_id=programme.id,
            )
            db.add(requirement)
        requirement.title = requirement_title
        requirement.level = programme.level
        requirement.school_id = getattr(programme.department, "school_id", None)
        requirement.intake_id = intake.id if intake else None
        requirement.pathway_id = pathway_by_type.get(applicant_type).id if pathway_by_type.get(applicant_type) else None
        requirement.minimum_grade = "Programme-specific minimum requirement"
        requirement.notes = programme.entry_requirements or "Confirm the current approved requirement with admissions."
        requirement.effective_from = date(2026, 1, 1)
        requirement.is_active = True
        requirement.display_order = programme.display_order

        fee = await _one_or_none(
            db,
            ProgrammeFeeStructure,
            programme_id=programme.id,
            applicant_type=applicant_type,
        )
        if fee is None:
            fee = ProgrammeFeeStructure(
                title=f"{programme.name} annual fee estimate",
                programme_id=programme.id,
                applicant_type=applicant_type,
            )
            db.add(fee)
        fee.title = f"{programme.name} annual fee estimate"
        fee.fee_category = "tuition"
        fee.currency = "KES"
        fee.tuition_amount = 120000
        fee.statutory_amount = 18500
        fee.other_amount = 11500
        fee.total_amount = 150000
        fee.notes = "Seeded planning estimate. Confirm approved fees before payment."
        fee.intake_id = intake.id if intake else None
        fee.effective_from = date(2026, 1, 1)
        fee.is_active = True
        fee.display_order = programme.display_order

    documents = [
        {
            "title": "Admission Letter Centre",
            "document_type": "joining_instructions",
            "summary": "External portal for admission letters and admission documents when released.",
            "external_url": "https://digital.kisiiuniversity.ac.ke/students/admissions/center",
        },
        {
            "title": "Online Application Portal",
            "document_type": "application_form",
            "summary": "Official online application system for current intakes.",
            "external_url": "https://digital.kisiiuniversity.ac.ke/new_student_landing_page",
        },
        {
            "title": "Course Brochure",
            "document_type": "brochure",
            "summary": "Programme and admissions planning reference.",
            "external_url": "https://kisiiuniversity.ac.ke/storage/public/downloads//KISII%20UNIVERSITY%20COURSE%20BROCHURE.pdf",
        },
    ]
    for index, spec in enumerate(documents, start=1):
        slug = slugify(spec["title"])
        document = await _one_or_none(db, AdmissionDocument, slug=slug)
        payload = {
            **spec,
            "slug": slug,
            "is_published": True,
            "display_order": index * 10,
        }
        if document is None:
            db.add(AdmissionDocument(**payload))
        else:
            for key, value in payload.items():
                setattr(document, key, value)

    for index, (question, answer) in enumerate(FAQS, start=1):
        faq = await _one_or_none(db, AdmissionFaq, question=question)
        payload = {
            "question": question,
            "answer": answer,
            "category": "general",
            "is_published": True,
            "display_order": index * 10,
        }
        if faq is None:
            db.add(AdmissionFaq(**payload))
        else:
            for key, value in payload.items():
                setattr(faq, key, value)

    sections = [
        ("admissions", "hero", "Admissions at Kisii University", "Start with the right pathway.", "hero"),
        ("admissions", "pathways", "Choose your applicant pathway", "Compare KUCCPS, self-sponsored, international, transfer, postgraduate and diploma/certificate routes.", "pathway_tabs"),
        ("requirements", "matrix", "Entry requirements at a glance", "Filter requirements by programme, level and applicant type.", "requirements_matrix"),
        ("fees", "programme-fees", "Fees belong to programme detail", "Use programme detail pages for approved programme/intake/category fee records.", "fees_summary"),
        ("documents", "downloads", "Admissions documents", "Access forms, brochures, joining instructions and admission-centre links.", "document_grid"),
    ]
    for index, (page_key, section_key, title, body, layout_variant) in enumerate(sections, start=1):
        section = await _one_or_none(
            db,
            AdmissionPageSection,
            page_key=page_key,
            section_key=section_key,
        )
        payload = {
            "page_key": page_key,
            "section_key": section_key,
            "title": title,
            "body": body,
            "layout_variant": layout_variant,
            "is_enabled": True,
            "display_order": index * 10,
        }
        if section is None:
            db.add(AdmissionPageSection(**payload))
        else:
            for key, value in payload.items():
                setattr(section, key, value)
