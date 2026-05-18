"""Seed the single Kisii University institutional profile."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from ._shared import LEADERSHIP_PEOPLE, SeedContext, get_or_create_person, upsert_university_info


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
            "Kisii University College was founded in 1965 as a Primary Teachers Training College on a 61 acre "
            "land donated by the County Council of Gusii. The college was upgraded to a Secondary Teachers "
            "College in 1983, taken over by Egerton University as a campus in 1994, established as a constituent "
            "college on 23 August 2007, and granted a charter on 6 February 2013."
        ),
        vision="An inclusive and borderless University that creates positive change in the world",
        mission=(
            "Creating a transformative environment that preserves knowledge, enriches the student experience, "
            "delivers quality training and research, and promotes community engagement for sustainable development."
        ),
        core_values=(
            "Transformative thinking; Respect; Inclusivity; Fairness."
        ),
        founding_year=1965,
        institution_type="public_university",
        charter_summary=(
            "Kisii University was granted a charter on 6 February 2013 through Legal Notice No. 225 "
            "in accordance with the Universities Act 2012."
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
        },
        strategic_priorities={
            "philosophy": "Creative, scientific, technological, innovative, and critical thinking, responsive to societal needs and service to humanity.",
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
