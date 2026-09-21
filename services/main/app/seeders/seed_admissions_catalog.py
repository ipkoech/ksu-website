"""Seed applicant pathways, requirements, fees, documents, FAQs and admissions page sections."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    AdmissionDocument,
    AdmissionFaq,
    AdmissionPageSection,
    AdmissionPathway,
    AdmissionRequirement,
    Programme,
    ProgrammeFeeStructure,
)
from app.schemas.base import slugify

from ._shared import SeedContext


PATHWAYS = [
    {
        "title": "KUCCPS",
        "applicant_type": "kuccps",
        "summary": (
            "The Kenya Universities and Colleges Central Placement Service (KUCCPS) is the state corporation "
            "that coordinates the placement of Government-Sponsored Students to Kenyan universities and colleges."
        ),
        "eligibility_notes": (
            "Only candidates who apply for placement will be considered; candidates must meet the minimum admission "
            "requirement approved by the respective regulating authority; placement shall be on merit; affirmative "
            "action criteria approved by the Placement Service shall be applied for marginalized and disadvantaged "
            "applicants."
        ),
        "cta_label": "Open admission centre",
        "cta_url": "http://digital.kisiiuniversity.ac.ke/students/admissions/center",
    },
    {
        "title": "Self-sponsored",
        "applicant_type": "self_sponsored",
        "summary": (
            "Applications for admission to study at the University as self sponsored students are online. The online "
            "application system has a list of all the courses on offer at the University, open Intakes, application "
            "deadlines, reporting dates and program requirements."
        ),
        "eligibility_notes": (
            "First time applicants are encouraged to explore the list of available academic programmes and the set "
            "requirements to ensure that they qualify to apply for their programme of choice."
        ),
        "cta_label": "Apply online",
        "cta_url": "https://digital.kisiiuniversity.ac.ke/new_student_landing_page",
    },
    {
        "title": "International",
        "applicant_type": "international",
        "summary": (
            "Kisii University College was founded in 1965 as a Primary Teachers Training College on a 61 acre land "
            "that was donated by the County Council of Gusii."
        ),
        "eligibility_notes": None,
        "cta_label": "International students page",
        "cta_url": "https://kisiiuniversity.ac.ke/admission/international-students",
    },
    {
        "title": "Postgraduate",
        "applicant_type": "postgraduate",
        "summary": (
            "The Academic Affairs Office co-ordinates graduate programmes at Kisii University; the division "
            "coordinates syllabi and regulations; admission of graduate students; coordination of supervision of "
            "graduate programmes; and processing of graduate theses, projects and dissertations."
        ),
        "eligibility_notes": None,
        "cta_label": "Apply online",
        "cta_url": "https://digital.kisiiuniversity.ac.ke/new_student_landing_page",
    },
    {
        "title": "Diploma / Certificate",
        "applicant_type": "diploma_certificate",
        "summary": "Application forms for Diploma Programmes and Certificate/Bridging Application Forms.",
        "eligibility_notes": None,
        "cta_label": "Diploma application page",
        "cta_url": "https://kisiiuniversity.ac.ke/admission/diploma-application",
    },
]

FAQS: list[tuple[str, str]] = []


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
            "application_steps": None,
            "required_documents": None,
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

    active_applicant_types = {str(spec["applicant_type"]) for spec in PATHWAYS}
    existing_pathways = (await db.execute(select(AdmissionPathway))).scalars().all()
    for pathway in existing_pathways:
        if pathway.applicant_type not in active_applicant_types:
            pathway.is_published = False

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
        requirement.intake_id = None
        requirement.pathway_id = pathway_by_type.get(applicant_type).id if pathway_by_type.get(applicant_type) else None
        requirement.minimum_grade = None
        requirement.notes = programme.entry_requirements
        requirement.effective_from = None
        requirement.is_active = True
        requirement.display_order = programme.display_order

        fee = await _one_or_none(
            db,
            ProgrammeFeeStructure,
            programme_id=programme.id,
            applicant_type=applicant_type,
        )
        fee_spec = programme.fees_structure if isinstance(programme.fees_structure, dict) else None
        if not fee_spec:
            if fee is not None:
                fee.is_active = False
            continue
        if fee is None:
            fee = ProgrammeFeeStructure(
                title=f"{programme.name} fee structure",
                programme_id=programme.id,
                applicant_type=applicant_type,
            )
            db.add(fee)
        fee.title = f"{programme.name} fee structure"
        fee.fee_category = "tuition"
        fee.currency = "KES"
        items = fee_spec.get("items") if isinstance(fee_spec.get("items"), list) else []
        amount = fee_spec.get("amount")
        fee.tuition_amount = int(amount) if isinstance(amount, (int, float)) else next(
            (
                int(item["amount"])
                for item in items
                if isinstance(item, dict)
                and isinstance(item.get("amount"), (int, float))
                and "tuition" in str(item.get("item") or "").lower()
            ),
            None,
        )
        fee.statutory_amount = next(
            (
                int(item["amount"])
                for item in items
                if isinstance(item, dict)
                and isinstance(item.get("amount"), (int, float))
                and "statutory" in str(item.get("item") or "").lower()
            ),
            None,
        )
        fee.other_amount = next(
            (
                int(item["amount"])
                for item in items
                if isinstance(item, dict)
                and isinstance(item.get("amount"), (int, float))
                and "other" in str(item.get("item") or "").lower()
            ),
            None,
        )
        known_amounts = [
            int(item["amount"])
            for item in items
            if isinstance(item, dict) and isinstance(item.get("amount"), (int, float))
        ]
        fee.total_amount = int(amount) if isinstance(amount, (int, float)) else sum(known_amounts) if len(known_amounts) == len(items) else None
        fee.notes = " | ".join(
            str(item.get("notes"))
            for item in items
            if isinstance(item, dict) and item.get("notes")
        ) or None
        fee.intake_id = None
        fee.effective_from = None
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

    for faq in (await db.execute(select(AdmissionFaq))).scalars().all():
        faq.is_published = False

    # The live FAQ page currently states that no FAQ has been added.  Likewise,
    # the landing-section copy previously here was application scaffolding, not
    # text published by Kisii University, so keep those old sections disabled.
    sections: list[tuple[str, str, str, str | None, str]] = []
    legacy_section_keys = {"hero", "pathways", "matrix", "programme-fees", "downloads"}
    for section in (await db.execute(select(AdmissionPageSection))).scalars().all():
        if section.section_key in legacy_section_keys:
            section.is_enabled = False

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
