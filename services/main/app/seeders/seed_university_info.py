"""Seed the single Kisii University institutional profile."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from ._shared import LEADERSHIP_PEOPLE, SeedContext, get_or_create_person, upsert_university_info
from .seed_handbook import (
    HANDBOOK_GOVERNANCE_FACTS,
    HANDBOOK_INSTITUTIONAL_FACTS,
    HANDBOOK_SECTIONS,
    HANDBOOK_SOURCE,
    HANDBOOK_SOURCE_PHRASES,
)


async def seed_university_info(db: AsyncSession, ctx: SeedContext) -> None:
    main_campus = ctx.campuses.get("MAIN")
    if main_campus is None:
        raise ValueError("Main campus must be seeded before university info")

    vc = await get_or_create_person(
        db,
        ctx,
        "vice_chancellor",
        **LEADERSHIP_PEOPLE["vice_chancellor"],
    )
    council_chair = await get_or_create_person(
        db,
        ctx,
        "council_chair",
        **LEADERSHIP_PEOPLE["council_chair"],
    )

    await upsert_university_info(
        db,
        ctx,
        name="Kisii University",
        short_name="Kisii University",
        acronym="KSU",
        slug="kisii-university",
        motto=None,
        overview=(
            "Kisii University is a public chartered institution of higher learning that provides holistic "
            "and value based education, training, research and extension services. Its institutional story "
            "began in 1965 as a Primary Teachers Training College on 61 acres donated by the County Council "
            "of Gusii, later becoming an Egerton University campus, a constituent college, and then a chartered "
            "public university."
        ),
        vision=(
            "To be a World Class University in the advancement of academic excellence, research, innovation, "
            "and enhancement of social welfare."
        ),
        mission=HANDBOOK_INSTITUTIONAL_FACTS["mission"],
        core_values=(
            "Integrity; Diligence; Hard work; Professionalism; Academic freedom; Civility; Social responsiveness; Accountability."
        ),
        founding_year=1965,
        institution_type="public_university",
        charter_summary=(
            "Kisii University was granted a charter on 6 February 2013 through Legal Notice No. 225 "
            "in accordance with the Universities Act 2012. The revised student handbook records this milestone "
            "as Kisii University becoming the 13th Public University in Kenya."
        ),
        history_summary=(
            "The institution began in 1965 as a Primary Teachers Training College, became a Secondary Teachers "
            "College in 1983, was taken over by Egerton University in 1994, introduced its first degree programme "
            "in 1999, became a constituent college in 2007, and attained full university status in 2013."
        ),
        email="info@kisiiuniversity.ac.ke",
        phone="+254720875082",
        alternate_phone=None,
        website="https://kisiiuniversity.ac.ke",
        postal_address="P.O. Box 408-40200, Kisii, Kenya",
        physical_address="Kisii University Main Campus, Kisii",
        city="Kisii",
        county="Kisii",
        country="Kenya",
        social_links={
            "website": "https://kisiiuniversity.ac.ke",
            "x": "https://twitter.com/kisiuniofficial",
        },
        quick_facts={
            "founding_year": 1965,
            "land_acres": 61,
            "egerton_takeover_year": 1994,
            "first_degree_year": 1999,
            "charter_year": 2013,
            "schools": 8,
            "main_campus": "Main Campus",
            "handbook": {
                "title": HANDBOOK_SOURCE["title"],
                "edition": HANDBOOK_SOURCE["edition"],
                "pages": HANDBOOK_SOURCE["pages"],
                "publisher": HANDBOOK_SOURCE["publisher"],
                "publisher_email": HANDBOOK_SOURCE["publisher_email"],
                "source_url": HANDBOOK_SOURCE["url"],
                "source_phrases": list(HANDBOOK_SOURCE_PHRASES),
            },
            "handbook_history": {
                "founded_as": "Primary Teachers Training College",
                "constituent_college_date": "23 August 2007",
                "charter_date": "6 February 2013",
                "charter_rank_phrase": "13th Public University in Kenya",
            },
            "handbook_sections": list(HANDBOOK_SECTIONS),
            "governance": HANDBOOK_GOVERNANCE_FACTS,
            "institutional_facts": HANDBOOK_INSTITUTIONAL_FACTS,
        },
        strategic_priorities={
            "philosophy": "World-class education in an atmosphere of academic freedom, civility, social responsiveness, integrity and accountability.",
            "mandate": [
                "Produce competent and high-quality graduates.",
                "Generate appropriate knowledge, skills, competencies, and innovation outputs impacting national development goals and social welfare.",
                "Produce, transfer, and disseminate appropriate technology for the benefit of the University, industry, and society.",
            ],
            "strategic_goals": [
                "Quality in education, training, and learning.",
                "Knowledge preservation, generation, and communication.",
                "Collaborations, partnerships, and community outreach.",
                "Developing and maintaining adequate physical and technological infrastructure.",
                "Improving and maintaining financial sustainability.",
                "Cancer management and research as the niche area.",
            ],
        },
        logo_id=None,
        seal_id=None,
        cover_image_id=None,
        brochure_id=None,
        main_campus_id=main_campus.id,
        chancellor_id=None,
        vc_id=vc.id,
        council_chair_id=council_chair.id,
        chancellor_message_title="Message from the Chancellor",
        chancellor_message=(
            "The current official About sources do not publish a dedicated Chancellor message. "
            "Official university publications describe the Chancellor as the titular head of the "
            "University who, in the name of the University, confers degrees, diplomas, "
            "certificates, and other awards in consultation with the University Council and Senate."
        ),
        vc_message_title="Message from the Vice Chancellor",
        vc_message=(
            "On behalf of Kisii University Council, Management and the entire University community, "
            "the Vice Chancellor welcomes students to a fast-growing and dynamic institution. "
            "Kisii University is committed to academic excellence, research, integrity, "
            "professionalism, and social responsibility while preparing learners to contribute "
            "meaningfully in a rapidly changing world."
        ),
        council_chair_message_title="Message from the Chairperson, University Council",
        council_chair_message=None,
        additional_head_messages=None,
        is_public=True,
        is_active=True,
    )
