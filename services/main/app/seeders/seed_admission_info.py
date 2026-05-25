"""Seed admissions information pages and procedure entries."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.base import slugify

from ._shared import SeedContext, upsert_admission_info


ADMISSION_INFO_SPECS = [
    {
        "title": "How to Apply",
        "content_type": "how_to_apply",
        "summary": "Step-by-step guidance for applying to Kisii University academic programmes.",
        "content": "Choose a programme, confirm the entry requirements, complete the official application form, attach the required academic documents, and submit through the approved university admissions channels before the intake deadline.",
        "audience_levels": ["bachelors", "postgraduate", "diploma", "certificate"],
    },
    {
        "title": "Postgraduate Application Procedure",
        "content_type": "application_procedure",
        "summary": "Admission procedure for postgraduate diploma, masters, and doctoral applicants.",
        "content": "Postgraduate applicants should identify the target school and department, review programme-specific admission requirements, prepare degree transcripts and certificates, submit referee and research concept documents where applicable, and follow the published intake instructions.",
        "audience_levels": ["postgraduate"],
    },
    {
        "title": "Bachelor's Degree Application Procedure",
        "content_type": "application_procedure",
        "summary": "Admission process for undergraduate degree applicants.",
        "content": "Applicants for bachelor's degree programmes should confirm KCSE cluster requirements, select a suitable intake and programme, complete the application form accurately, and attach academic result slips, certificates, and identification documents as required.",
        "audience_levels": ["bachelors"],
    },
    {
        "title": "Diploma Application Procedure",
        "content_type": "application_procedure",
        "summary": "Admission process for diploma programmes.",
        "content": "Diploma applicants should confirm programme-specific entry requirements, complete the admissions form, attach academic credentials, and submit before the intake deadline through the official admissions office or portal.",
        "audience_levels": ["diploma"],
    },
    {
        "title": "Certificate Application Procedure",
        "content_type": "application_procedure",
        "summary": "Admission process for certificate programmes.",
        "content": "Certificate applicants should review the advertised course requirements, complete the application process early, and provide the academic and identity documents requested by the admissions office.",
        "audience_levels": ["certificate"],
    },
    {
        "title": "International and Exchange Students Admission Guide",
        "content_type": "international_students",
        "summary": "Guidance for international applicants and exchange students.",
        "content": "International applicants and exchange students should submit certified academic records, passport details, immigration documentation where required, and confirm exchange-specific approvals with the responsible office before travel and registration.",
        "audience_levels": ["postgraduate", "bachelors", "diploma", "certificate"],
    },
    {
        "title": "Entry Requirements",
        "content_type": "requirements",
        "summary": "General entry requirement guidance for certificate, diploma, undergraduate, and postgraduate applicants.",
        "content": "Applicants should confirm the minimum entry route for the level they are applying for, then check programme-specific subject clusters, professional regulator requirements, school guidance, and Senate-recognized equivalencies before submitting an application.",
        "audience_levels": ["postgraduate", "bachelors", "diploma", "certificate"],
    },
    {
        "title": "Fees and Payment Guidance",
        "content_type": "fees",
        "summary": "Fee guidance for applicants preparing programme, application, accommodation, and joining-cost plans.",
        "content": "Fee information is programme-specific and may include tuition, application charges, approved university charges, accommodation, student services, and programme-specific requirements. Applicants should confirm current fee schedules and payment instructions through official university records before making payment.",
        "audience_levels": ["postgraduate", "bachelors", "diploma", "certificate"],
    },
    {
        "title": "Scholarships and Financial Support",
        "content_type": "scholarships",
        "summary": "Funding and sponsorship guidance for applicants and continuing students.",
        "content": "Applicants should verify government sponsorship, scholarships, bursaries, employer or county sponsorship, research grants, and external funding through official notices, award letters, and university admissions or finance channels before relying on any funding claim.",
        "audience_levels": ["postgraduate", "bachelors", "diploma", "certificate"],
    },
    {
        "title": "Bridging Application Procedure",
        "content_type": "bridging_application",
        "summary": "Guidance for bridging and qualification-upgrade applications.",
        "content": "Applicants seeking bridging opportunities should review the approved bridging pathways, provide evidence of prior qualifications, and submit the required documentation to the relevant academic unit within the published timelines.",
        "audience_levels": ["bachelors", "diploma", "certificate"],
    },
    {
        "title": "Graduation Application and Clearance",
        "content_type": "graduation",
        "summary": "Graduation application, clearance, and ceremony preparation guidance.",
        "content": "Prospective graduands should complete the graduation application, confirm academic and fee clearance, verify their names and award details, and follow the published graduation timelines and communication from the university.",
        "audience_levels": ["postgraduate", "bachelors", "diploma", "certificate"],
    },
    {
        "title": "Admissions Booklet",
        "content_type": "booklet",
        "summary": "Consolidated admissions booklet for applicants.",
        "content": "This admissions booklet provides a compiled reference for available programmes, entry requirements, intake guidance, and application procedures.",
        "audience_levels": ["postgraduate", "bachelors", "diploma", "certificate"],
    },
    {
        "title": "Programme Brochures",
        "content_type": "brochure",
        "summary": "Downloadable brochures for Kisii University programmes and admissions.",
        "content": "Programme brochures provide school-specific and programme-specific details including curriculum highlights, entry requirements, and contacts for further support.",
        "audience_levels": ["postgraduate", "bachelors", "diploma", "certificate"],
    },
]


async def seed_admission_info(db: AsyncSession, ctx: SeedContext) -> None:
    for order, spec in enumerate(ADMISSION_INFO_SPECS, start=10):
        await upsert_admission_info(
            db,
            ctx,
            title=spec["title"],
            slug=slugify(spec["title"]),
            content_type=spec["content_type"],
            audience_levels=spec.get("audience_levels"),
            summary=spec.get("summary"),
            content=spec.get("content"),
            external_url=spec.get("external_url"),
            school_id=None,
            cover_image_id=None,
            attachment_media_id=None,
            is_published=True,
            display_order=order,
        )
