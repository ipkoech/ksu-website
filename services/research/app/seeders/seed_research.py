"""Seed public Research portal records for local iteration and verification."""

from __future__ import annotations

import asyncio
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from typing import Any, TypeVar

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models import (
    Grant,
    Innovation,
    MentorshipProgram,
    Partner,
    Publication,
    PublicationAuthor,
    ResearchBoard,
    Consultancy,
    ResearchCenter,
    ResearchEvent,
    ResearchNews,
    ResearchOffice,
    ResearchOutput,
    ResearchProgram,
    ResearchProject,
    Scholarship,
    TrainingProgram,
)
from app.schemas.base import slugify

ModelT = TypeVar("ModelT")

NOW = datetime.now(timezone.utc)

REIRM_ABOUT = (
    "The Department of Research, Extension, Innovation, and Resource Mobilization (REIRM) is the "
    "engine of knowledge preservation, creation, and societal impact at Kisii University. Its "
    "identity is borderless and inclusive, grounded in the belief that research and innovation are "
    "vital bridges connecting scholarly excellence to tangible global progress."
)

REIRM_PILLARS: list[dict[str, str]] = [
    {
        "title": "Research, Innovation & Commercialisation",
        "description": (
            "Cultivates curiosity-driven and solution-oriented inquiry across Health, Agriculture, "
            "Applied Sciences, Environmental Conservation, ICT, Socio-Economics, Law, Education, "
            "and Culture, while translating discoveries into practical technologies and enterprises."
        ),
    },
    {
        "title": "Extension & Community Engagement",
        "description": (
            "Fosters reciprocal relationships between the university, industry, and communities so "
            "research is co-created and responsive to local and global challenges. The office also "
            "champions environmental sustainability through tree planting and reforestation drives, "
            "climate-smart agriculture demonstrations, biodiversity awareness programs, and local "
            "capacity building for long-term environmental stewardship."
        ),
    },
    {
        "title": "Strategic Partnerships & Collaborations",
        "description": (
            "Forges robust linkages with international and local universities, industry, and "
            "development partners to support joint research, exchanges, and shared resources."
        ),
    },
    {
        "title": "Capacity Building & Knowledge Dissemination",
        "description": (
            "Nurtures the next generation of researchers through training, mentorship, and the "
            "dissemination of high-quality scholarship through publications, seminars, and conferences."
        ),
    },
    {
        "title": "Grant Management and Resource Mobilization",
        "description": (
            "Secures and administers research grants, endowments, and financial or material resources "
            "for academic programmes and research infrastructure; drafts data-driven research and "
            "project proposals for donors; and builds relationships with funding bodies, governments, "
            "international partners, corporate foundations, and philanthropic organizations."
        ),
    },
]

REIRM_ANNUAL_EVENTS = [
    {
        "event": "International Multidisciplinary Conference",
        "description": (
            "A premier platform for researchers, scholars, and practitioners to exchange knowledge, "
            "present findings, and discuss emerging trends across disciplines. Recent themes have "
            "focused on global health, sustainable development, and inclusive knowledge systems."
        ),
        "typical_timing": "Annually (June)",
    },
    {
        "event": "Innovation Week",
        "description": (
            "The flagship REIRM event bringing together students, researchers, industry leaders, and "
            "development partners to showcase innovations that matter. It features exhibitions, "
            "keynote lectures, pitching competitions, workshops, and an awards ceremony celebrating "
            "SDG-aligned innovations."
        ),
        "typical_timing": "Annually (April)",
    },
    {
        "event": "Public Lectures",
        "description": (
            "Formal, accessible presentations delivered by experts to a general audience to share "
            "knowledge, spark public interest, and foster civic awareness on themes including "
            "societal issues, scientific breakthroughs, economics, politics, culture, and other "
            "contemporary topics."
        ),
        "typical_timing": "Quarterly",
    },
]


async def upsert_by_slug(
    db: AsyncSession,
    model: type[ModelT],
    slug: str,
    payload: dict[str, Any],
) -> ModelT:
    result = await db.execute(select(model).where(model.slug == slug))
    record = result.scalar_one_or_none()
    payload = {**payload, "slug": slug}

    if record is None:
        record = model(**payload)
        db.add(record)
    else:
        for field_name, value in payload.items():
            setattr(record, field_name, value)

    await db.flush()
    return record


async def seed_research_offices(db: AsyncSession) -> dict[str, ResearchOffice]:
    specs = [
        {
            "name": "Department of Research, Extension, Innovation and Resource Mobilization",
            "code": "REIRM",
            "about": REIRM_ABOUT,
            "mandate": (
                "Empower scholars, students, and partners to generate and apply high-impact "
                "knowledge through research, innovation and commercialisation, extension and "
                "community engagement, strategic partnerships, capacity building and knowledge "
                "dissemination, grant management, and resource mobilization."
            ),
            "mission": (
                "Create an enabling, inclusive, and collaborative research environment where staff, "
                "students, and partners can excel and contribute to humanity through knowledge, "
                "innovation, and collaboration."
            ),
            "vision": (
                "Position Kisii University as a globally recognized institution renowned for "
                "research, consultancy, innovation, and extension."
            ),
            "objectives": (
                "Benchmark against leading global universities, align research practice with "
                "international standards, and ensure Kisii University's contributions are recognized "
                "worldwide."
            ),
            "functions": (
                "Research, innovation and commercialisation; extension and community engagement; "
                "strategic partnerships and collaborations; capacity building and knowledge "
                "dissemination; grant management and resource mobilization."
            ),
            "services_summary": (
                "Research and innovation coordination, community engagement, partnership development, "
                "training and mentorship, publications and conferences, grant administration, proposal "
                "development, donor engagement, and event sponsorship coordination."
            ),
            "leadership_message": (
                "Join us in advancing humanity through the transformative power of knowledge, "
                "innovation, and collaboration. To partner with us or sponsor an event, email "
                "research@kisiiuniversity.ac.ke."
            ),
            "strategic_priorities": [
                *REIRM_PILLARS,
                {"title": "Annual Events", "items": REIRM_ANNUAL_EVENTS},
            ],
            "location": "Kisii University Main Campus",
            "address": "P.O. Box 408-40200, Kisii, Kenya",
            "email": "research@kisiiuniversity.ac.ke",
            "website": "https://research.kisiiuniversity.ac.ke/",
            "status": "active",
            "is_active": True,
            "is_featured": True,
            "display_order": 10,
            "meta_title": "About Research at Kisii University",
            "meta_description": (
                "Research, Extension, Innovation and Resource Mobilization at Kisii University: "
                "research, innovation, partnerships, capacity building, grants, and annual events."
            ),
            "keywords": [
                "research",
                "innovation",
                "commercialisation",
                "extension",
                "community engagement",
                "grant management",
                "resource mobilization",
            ],
        }
    ]
    records: dict[str, ResearchOffice] = {}
    for spec in specs:
        slug = slugify(spec["name"])
        records[slug] = await upsert_by_slug(db, ResearchOffice, slug, spec)
    return records


async def seed_research_boards(db: AsyncSession) -> None:
    specs = [
        {
            "name": "REIRM Research and Innovation Coordination",
            "code": "REIRM-RIC",
            "acronym": "REIRM",
            "board_type": "committee",
            "about": "Coordination structure supporting the REIRM mandate across research, innovation, partnerships, capacity building, and grants.",
            "mandate": "Provide oversight, advice, and coordination for research support, innovation, community engagement, partnerships, and resource mobilization.",
            "responsibilities": (
                "Coordinate annual research events, support proposal and grant processes, strengthen "
                "partner engagement, promote knowledge dissemination, and align research activities "
                "with institutional priorities."
            ),
            "composition": "Research office leadership, school representatives, innovation leads, and administrative support officers.",
            "meeting_schedule": "Quarterly and as required by active research programmes and events.",
            "contact_email": "research@kisiiuniversity.ac.ke",
            "is_active": True,
            "display_order": 10,
        }
    ]
    for spec in specs:
        await upsert_by_slug(db, ResearchBoard, slugify(spec["name"]), spec)


async def seed_centers(db: AsyncSession) -> dict[str, ResearchCenter]:
    specs = [
        {
            "name": "Research, Extension, Innovation and Resource Mobilization",
            "code": "REIRM",
            "acronym": "REIRM",
            "center_type": "directorate",
            "about": (
                "Academic Division unit listed on the official site for research, extension, innovation, "
                "resource mobilization, funding opportunities, external research grants, and ongoing research projects."
            ),
            "mission": "Coordinate university research, extension, innovation, and resource mobilization.",
            "research_areas": "Funding opportunities, external research grants, ongoing research projects, innovation, and resource mobilization.",
            "location": "Kisii University Main Campus",
            "email": "research@kisiiuniversity.ac.ke",
            "is_active": True,
            "is_featured": True,
            "display_order": 10,
        },
        {
            "name": "School of Information Science and Technology Research",
            "code": "SIST-R",
            "acronym": "SIST",
            "center_type": "school_research",
            "about": (
                "School research activity listed on the official site, including Mozilla Responsible Computing "
                "Challenge work, ethical artificial intelligence, and computing innovation projects."
            ),
            "mission": "Advance responsible computing, ethical AI, information science, communication, and technology research.",
            "research_areas": "Responsible computing, ethical artificial intelligence, computing science, media, communication, and information science.",
            "location": "School of Information Science and Technology",
            "email": "research@kisiiuniversity.ac.ke",
            "is_active": True,
            "is_featured": True,
            "display_order": 20,
        },
    ]
    records: dict[str, ResearchCenter] = {}
    for spec in specs:
        slug = slugify(spec["name"])
        records[slug] = await upsert_by_slug(db, ResearchCenter, slug, spec)
    return records


async def seed_programs(
    db: AsyncSession,
    centers: dict[str, ResearchCenter],
) -> dict[str, ResearchProgram]:
    research_center = centers["research-extension-innovation-and-resource-mobilization"]
    sist_center = centers["school-of-information-science-and-technology-research"]
    specs = [
        {
            "name": "Carbon Literacy for Youth Employability and Job Creation",
            "code": "CL4YEJCP",
            "center_id": research_center.id,
            "start_date": date(2023, 8, 4),
            "end_date": date(2025, 12, 31),
            "summary": "British Council Innovation for African Universities project on carbon literacy, employability, and job creation.",
            "description": "Kisii University collaborates with Sheffield Hallam University, Durban University of Technology, Ladoke Akintola University of Technology, and Innovate Durban.",
            "objectives": "Localize and trans-create carbon literacy training, build green innovation skills, and improve youth employability.",
            "budget": Decimal("60000.00"),
            "currency": "GBP",
            "status": "active",
            "is_active": True,
            "is_featured": True,
            "display_order": 10,
        },
        {
            "name": "Responsible Computing Challenge",
            "code": "RCC",
            "center_id": sist_center.id,
            "start_date": date(2023, 5, 1),
            "end_date": date(2025, 3, 31),
            "summary": "Mozilla Foundation supported responsible computing and ethical AI curriculum project.",
            "description": "Kisii University partners with Mozilla Foundation to embed ethical computing and responsible AI into computing science courses.",
            "objectives": "Train faculty and students on data privacy, cybersecurity, algorithmic bias, responsible AI, and ethical technology practice.",
            "budget": Decimal("62500.00"),
            "currency": "USD",
            "status": "active",
            "is_active": True,
            "is_featured": False,
            "display_order": 20,
        },
    ]
    records: dict[str, ResearchProgram] = {}
    for spec in specs:
        slug = slugify(spec["name"])
        records[slug] = await upsert_by_slug(db, ResearchProgram, slug, spec)
    return records


async def seed_projects(
    db: AsyncSession,
    centers: dict[str, ResearchCenter],
    programs: dict[str, ResearchProgram],
) -> dict[str, ResearchProject]:
    research_center = centers["research-extension-innovation-and-resource-mobilization"]
    sist_center = centers["school-of-information-science-and-technology-research"]
    carbon_program = programs["carbon-literacy-for-youth-employability-and-job-creation"]
    responsible_program = programs["responsible-computing-challenge"]
    specs = [
        {
            "title": "Carbon Literacy for Youth Employability and Job Creation",
            "code": "CL4YEJCP",
            "program_id": carbon_program.id,
            "center_id": research_center.id,
            "project_type": "collaborative",
            "start_date": date(2025, 5, 1),
            "end_date": date(2027, 4, 30),
            "summary": (
                "A regional collaboration building carbon literacy, green innovation skills, and "
                "youth employability pathways."
            ),
            "abstract": "The project designs carbon literacy modules, tests youth enterprise support models, and documents employability outcomes.",
            "objectives": "Develop training modules, support student innovation teams, and publish regional learning briefs.",
            "expected_outcomes": "Carbon literacy toolkit, employability evidence, student prototypes, and policy briefs.",
            "impact": "Improves youth readiness for green jobs and climate-aware entrepreneurship.",
            "budget": Decimal("60000.00"),
            "currency": "GBP",
            "status": "ongoing",
            "progress_percentage": 42,
            "is_active": True,
            "is_featured": True,
            "is_public": True,
            "display_order": 10,
        },
        {
            "title": "Responsible Computing Challenge",
            "code": "RCC",
            "program_id": responsible_program.id,
            "center_id": sist_center.id,
            "project_type": "curriculum",
            "start_date": date(2023, 5, 1),
            "end_date": date(2025, 3, 31),
            "summary": (
                "Mozilla Foundation supported project embedding responsible computing and ethical AI in the "
                "Computer Science syllabus."
            ),
            "abstract": "Faculty and students are trained to navigate data privacy, cybersecurity, algorithmic bias, and ethical technology practice.",
            "objectives": "Embed ethical computing practices into academic curricula and professional practice.",
            "expected_outcomes": "Curriculum integration, workshops, industry collaboration, and student responsible-computing projects.",
            "impact": "Shapes technology professionals who are skilled and aware of societal and environmental implications.",
            "budget": Decimal("62500.00"),
            "currency": "USD",
            "status": "ongoing",
            "progress_percentage": 80,
            "is_active": True,
            "is_featured": True,
            "is_public": True,
            "display_order": 20,
        },
        {
            "title": "Ethical Artificial Intelligence Curriculum Project",
            "code": "EAI-CURR",
            "program_id": responsible_program.id,
            "center_id": sist_center.id,
            "project_type": "curriculum",
            "start_date": date(2024, 5, 16),
            "end_date": date(2025, 5, 31),
            "summary": "Ethical AI learning initiative reflected in official university research stories and student reflections.",
            "abstract": "The course links AI ethics with law, psychology, sociology, and interdisciplinary responsible-technology practice.",
            "objectives": "Support ethical AI learning, reflective practice, and responsible innovation among computing students.",
            "expected_outcomes": "Student reflections, responsible AI projects, and stronger ethical technology practice.",
            "impact": "Builds student confidence in questioning, designing, and applying AI responsibly.",
            "budget": Decimal("25000.00"),
            "currency": "USD",
            "status": "ongoing",
            "progress_percentage": 71,
            "is_active": True,
            "is_featured": False,
            "is_public": True,
            "display_order": 30,
        },
    ]
    records: dict[str, ResearchProject] = {}
    for spec in specs:
        slug = slugify(spec["title"])
        records[slug] = await upsert_by_slug(db, ResearchProject, slug, spec)
    return records


async def seed_publications(
    db: AsyncSession,
    centers: dict[str, ResearchCenter],
    projects: dict[str, ResearchProject],
) -> None:
    research_center = centers["research-extension-innovation-and-resource-mobilization"]
    sist_center = centers["school-of-information-science-and-technology-research"]
    specs = [
        {
            "payload": {
                "title": "Carbon Literacy, Green Skills, and Employability Pathways among University Students",
                "publication_type": "journal_article",
                "project_id": projects["carbon-literacy-for-youth-employability-and-job-creation"].id,
                "center_id": research_center.id,
                "abstract": "Examines how carbon literacy training influences student innovation confidence and employability readiness.",
                "keywords": ["carbon literacy", "green skills", "employability", "higher education"],
                "journal_name": "African Journal of Climate and Development",
                "publisher": "Regional Research Press",
                "year": 2026,
                "doi": "10.5555/ksu.2026.001",
                "url": "https://research.kisiiuniversity.ac.ke/publications/carbon-literacy-green-skills",
                "is_open_access": True,
                "access_type": "gold",
                "citation_count": 12,
                "status": "published",
                "is_active": True,
                "is_featured": True,
                "display_order": 10,
            },
            "authors": ["Dr. Mary Bosibori", "Dr. Daniel Ochieng", "Prof. Amina Patel"],
        },
        {
            "payload": {
                "title": "Responsible Computing Challenge",
                "publication_type": "conference_paper",
                "project_id": projects["responsible-computing-challenge"].id,
                "center_id": sist_center.id,
                "abstract": "Official ongoing research project embedding ethical computing practices into academic curricula and professional practices.",
                "keywords": ["responsible computing", "ethical ai", "data privacy", "algorithmic bias"],
                "journal_name": "Kisii University Research Projects",
                "publisher": "Kisii University",
                "year": 2025,
                "doi": "10.5555/ksu.2026.002",
                "url": "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/ongoing_research_projects_s/responsible-computing-challenge",
                "is_open_access": True,
                "access_type": "green",
                "citation_count": 5,
                "status": "published",
                "is_active": True,
                "is_featured": True,
                "display_order": 20,
            },
            "authors": ["Dr. Judith Nyaboke", "Dr. Samuel Mwangi"],
        },
        {
            "payload": {
                "title": "Which Way Ethics; Onboarding Artificial Intelligence",
                "publication_type": "blog_article",
                "project_id": projects["ethical-artificial-intelligence-curriculum-project"].id,
                "center_id": sist_center.id,
                "abstract": "Official university research story reflecting on ethical AI learning and interdisciplinary responsible-technology practice.",
                "keywords": ["ethical artificial intelligence", "responsible innovation", "computing education"],
                "journal_name": "Kisii University News",
                "publisher": "Kisii University",
                "year": 2024,
                "doi": "10.5555/ksu.2025.014",
                "url": "https://kisiiuniversity.ac.ke/blog/which-way-ethics-onboarding-artificial-intelligence",
                "is_open_access": True,
                "access_type": "gold",
                "citation_count": 8,
                "status": "published",
                "is_active": True,
                "is_featured": False,
                "display_order": 30,
            },
            "authors": ["Kisii University"],
        },
    ]
    for spec in specs:
        payload = spec["payload"]
        slug = slugify(payload["title"])
        publication = await upsert_by_slug(db, Publication, slug, payload)
        await db.execute(delete(PublicationAuthor).where(PublicationAuthor.publication_id == publication.id))
        for order, author in enumerate(spec["authors"], start=1):
            db.add(
                PublicationAuthor(
                    publication_id=publication.id,
                    name=author,
                    affiliation="Kisii University" if order <= 2 else "Collaborating Institution",
                    author_order=order,
                    is_corresponding=order == 1,
                    is_internal=order <= 2,
                ),
            )
    await db.flush()


async def seed_grants(db: AsyncSession) -> None:
    specs = [
        {
            "title": "Carbon Literacy for Youth Employability and Job Creation Grant",
            "code": "CL4YEJCP-IAU",
            "grant_type": "external",
            "category": "research",
            "funder_name": "British Council Innovation for African Universities",
            "summary": "Official CL4YEJCP collaboration funded at GBP 60,000 through the British Council IAU programme.",
            "description": "Supports Kisii University and partners to leverage carbon literacy for youth employability and job creation.",
            "eligibility": "Project partners named by Kisii University: Sheffield Hallam University, Durban University of Technology, Ladoke Akintola University of Technology, Innovate Durban, and Kisii University.",
            "focus_areas": "Carbon literacy, youth employability, job creation, green innovation, and entrepreneurship.",
            "total_budget": Decimal("60000.00"),
            "min_award": Decimal("60000.00"),
            "max_award": Decimal("60000.00"),
            "currency": "GBP",
            "number_of_awards": 1,
            "announcement_date": date(2023, 8, 4),
            "open_date": date(2023, 8, 4),
            "deadline": date(2025, 12, 31),
            "application_url": "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/ongoing_research_projects_s/kisii-university-partners-with-universities-in-ssa-and-uk-to-leverage-carbon-literacy-for-youth-employability-and-job-creation",
            "contact_name": "Directorate of Research",
            "contact_email": "research@kisiiuniversity.ac.ke",
            "status": "awarded",
            "is_active": True,
            "is_featured": True,
            "display_order": 10,
        },
        {
            "title": "Responsible Computing Challenge Grant",
            "code": "RCC-MOZILLA",
            "grant_type": "external",
            "category": "innovation",
            "funder_name": "Mozilla Foundation",
            "summary": "Official Responsible Computing Challenge support for ethical AI and computing curriculum integration.",
            "description": "Kisii University reports USD 62,500 support for embedding responsible computing into the Computer Science syllabus.",
            "eligibility": "Kisii University School of Information Science and Technology and responsible computing project participants.",
            "focus_areas": "Responsible computing, ethical artificial intelligence, data privacy, cybersecurity, and algorithmic bias.",
            "total_budget": Decimal("62500.00"),
            "min_award": Decimal("62500.00"),
            "max_award": Decimal("62500.00"),
            "currency": "USD",
            "number_of_awards": 1,
            "announcement_date": date(2024, 5, 16),
            "open_date": date(2024, 5, 16),
            "deadline": date(2025, 3, 31),
            "external_url": "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/ongoing_research_projects_s/responsible-computing-challenge",
            "application_url": "https://kisiiuniversity.ac.ke/blog/which-way-ethics-onboarding-artificial-intelligence",
            "contact_email": "innovation@kisiiuniversity.ac.ke",
            "status": "awarded",
            "is_active": True,
            "is_featured": True,
            "display_order": 20,
        },
    ]
    for spec in specs:
        await upsert_by_slug(db, Grant, slugify(spec["title"]), spec)


async def seed_innovations_and_outputs(
    db: AsyncSession,
    centers: dict[str, ResearchCenter],
    projects: dict[str, ResearchProject],
) -> None:
    research_center = centers["research-extension-innovation-and-resource-mobilization"]
    sist_center = centers["school-of-information-science-and-technology-research"]
    innovations = [
        {
            "title": "Carbon Literacy Micro-Credential Toolkit",
            "code": "CL-MCT",
            "innovation_type": "service",
            "category": "environment",
            "project_id": projects["carbon-literacy-for-youth-employability-and-job-creation"].id,
            "center_id": research_center.id,
            "summary": "A modular toolkit for delivering carbon literacy training to student enterprise teams.",
            "description": "Includes facilitation guides, assessment rubrics, and project-based learning templates.",
            "problem_addressed": "Students need practical carbon literacy linked to employability and enterprise creation.",
            "solution": "Short modules tied to local climate problems and business model development.",
            "benefits": "Faster curriculum adoption, consistent assessment, and reusable training assets.",
            "applications": "Student training, community workshops, enterprise incubation, and partner programmes.",
            "ip_status": "open_source",
            "commercialization_status": "pilot",
            "development_stage": "validation",
            "trl_level": 6,
            "status": "active",
            "is_active": True,
            "is_featured": True,
            "is_public": True,
            "display_order": 10,
        },
        {
            "title": "Responsible Computing Curriculum Integration",
            "code": "RCCI",
            "innovation_type": "software",
            "category": "ict",
            "project_id": projects["responsible-computing-challenge"].id,
            "center_id": sist_center.id,
            "summary": "Curriculum integration work for ethical artificial intelligence and responsible computing.",
            "description": "Embeds responsible computing concepts into computing science teaching and student project work.",
            "problem_addressed": "Computing graduates need practical grounding in data privacy, cybersecurity, algorithmic bias, and responsible AI.",
            "solution": "Curriculum activities, workshops, and industry collaboration around responsible computing.",
            "benefits": "Improves ethical reasoning and responsible technology practice among students.",
            "applications": "Computer science teaching, student projects, industry workshops, and responsible AI learning.",
            "ip_status": "pending",
            "commercialization_status": "prototype",
            "development_stage": "testing",
            "trl_level": 5,
            "status": "active",
            "is_active": True,
            "is_featured": True,
            "is_public": True,
            "display_order": 20,
        },
    ]
    outputs = [
        {
            "title": "Lake Region Carbon Literacy Training Dataset",
            "output_type": "dataset",
            "project_id": projects["carbon-literacy-for-youth-employability-and-job-creation"].id,
            "center_id": research_center.id,
            "summary": "De-identified training participation and assessment dataset for carbon literacy evaluation.",
            "description": "Contains cohort-level progress indicators and project assessment scores.",
            "access_type": "request",
            "repository_url": "https://research.kisiiuniversity.ac.ke/outputs/carbon-literacy-dataset",
            "keywords": ["carbon literacy", "training", "green skills"],
            "status": "published",
            "is_active": True,
            "is_featured": True,
            "display_order": 10,
        },
        {
            "title": "Responsible Computing Challenge Curriculum Record",
            "output_type": "guideline",
            "project_id": projects["responsible-computing-challenge"].id,
            "center_id": sist_center.id,
            "summary": "Public record for integrating ethical artificial intelligence into the Computer Science syllabus.",
            "description": "Covers responsible computing concepts including data privacy, cybersecurity, algorithmic bias, and ethical AI.",
            "access_type": "open",
            "access_url": "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99l/bio/school-of-information-technology/Dr.%20Jane%20Cherono%20Maina",
            "keywords": ["responsible computing", "ethical ai", "computer science syllabus"],
            "status": "published",
            "is_active": True,
            "is_featured": True,
            "display_order": 20,
        },
    ]
    for spec in innovations:
        await upsert_by_slug(db, Innovation, slugify(spec["title"]), spec)
    for spec in outputs:
        await upsert_by_slug(db, ResearchOutput, slugify(spec["title"]), spec)


async def seed_partners(db: AsyncSession) -> None:
    specs = [
        {
            "name": "University of Minnesota",
            "acronym": "UMN",
            "partner_type": "academic",
            "partnership_level": "strategic",
            "about": "Strategic academic partner supporting research collaboration, staff development, and student exchange.",
            "collaboration_areas": "Research funding, academic exchange, community leadership, and internationalization.",
            "key_achievements": "Joint initiatives have supported research training and international collaboration.",
            "website": "https://twin-cities.umn.edu/",
            "country": "United States",
            "status": "active",
            "is_active": True,
            "is_featured": True,
            "display_order": 10,
        },
        {
            "name": "Mozilla Foundation",
            "acronym": "Mozilla",
            "partner_type": "foundation",
            "partnership_level": "technical",
            "about": "Foundation partner supporting responsible computing, ethical AI, and curriculum innovation.",
            "collaboration_areas": "Responsible computing, AI ethics, curriculum redesign, and student innovation.",
            "key_achievements": "Supports Kisii University responsible computing and public-interest technology work.",
            "website": "https://foundation.mozilla.org/",
            "country": "United States",
            "status": "active",
            "is_active": True,
            "is_featured": True,
            "display_order": 20,
        },
        {
            "name": "Sheffield Hallam University",
            "partner_type": "academic",
            "partnership_level": "implementing",
            "about": "United Kingdom university collaborator in Kisii University's Carbon Literacy for Youth Employability and Job Creation project.",
            "collaboration_areas": "Carbon literacy, youth employability, green innovation, and entrepreneurship.",
            "key_achievements": "Named by Kisii University as a collaborator in the British Council-funded CL4YEJCP project.",
            "website": "https://www.shu.ac.uk/",
            "country": "United Kingdom",
            "status": "active",
            "is_active": True,
            "is_featured": False,
            "display_order": 30,
        },
        {
            "name": "Durban University of Technology",
            "acronym": "DUT",
            "partner_type": "academic",
            "partnership_level": "implementing",
            "about": "South African university collaborator in Kisii University's carbon literacy and youth employability project.",
            "collaboration_areas": "Climate innovation, carbon literacy, youth employability, and joint project delivery.",
            "key_achievements": "Named by Kisii University as part of the CL4YEJCP international university collaboration network.",
            "website": "https://www.dut.ac.za/",
            "country": "South Africa",
            "status": "active",
            "is_active": True,
            "is_featured": False,
            "display_order": 40,
        },
        {
            "name": "Ladoke Akintola University of Technology",
            "acronym": "LAUTECH",
            "partner_type": "academic",
            "partnership_level": "implementing",
            "about": "West African university collaborator in Kisii University's carbon literacy and youth employability project.",
            "collaboration_areas": "Carbon literacy, youth employability, innovation, and entrepreneurship.",
            "key_achievements": "Listed by Kisii University as one of the institutions participating in the CL4YEJCP grant network.",
            "website": "https://www.lautech.edu.ng/",
            "country": "Nigeria",
            "status": "active",
            "is_active": True,
            "is_featured": False,
            "display_order": 50,
        },
        {
            "name": "Innovate Durban",
            "partner_type": "industry",
            "partnership_level": "technical",
            "about": "Innovation ecosystem partner participating in Kisii University's carbon literacy employability collaboration.",
            "collaboration_areas": "Innovation ecosystems, entrepreneurship, green skills, and project implementation.",
            "key_achievements": "Listed by Kisii University among the CL4YEJCP collaborating organizations funded through the British Council IAU grant.",
            "website": "https://www.innovate.durban/",
            "country": "South Africa",
            "status": "active",
            "is_active": True,
            "is_featured": False,
            "display_order": 60,
        },
    ]
    for spec in specs:
        await upsert_by_slug(db, Partner, slugify(spec["name"]), spec)


async def seed_consultancies_and_events(db: AsyncSession) -> None:
    consultancies = [
        {
            "title": "University of Minnesota Partnership Research Support",
            "code": "UMN-KSU-2025",
            "consultancy_type": "partnership",
            "client_name": "University of Minnesota",
            "client_type": "academic",
            "summary": "Official KSU partnership record describing research funding, academic exchange, and community leadership collaboration.",
            "description": "Kisii University publicized University of Minnesota support for research funding, staff development, student development, and community leadership programmes.",
            "objectives": "Strengthen research collaboration, internationalization, academic exchange, and community leadership training.",
            "deliverables": "Research collaboration, exchange activities, and partnership implementation records.",
            "start_date": date(2025, 1, 1),
            "end_date": date(2027, 12, 31),
            "contract_value": Decimal("660000.00"),
            "currency": "USD",
            "location": "Kisii University and University of Minnesota",
            "country": "Kenya",
            "status": "active",
            "is_active": True,
            "is_featured": True,
            "is_public": True,
            "display_order": 10,
        },
    ]
    events = [
        {
            "title": "Innovation Week 2026",
            "event_type": "innovation_week",
            "organizer_name": "Kisii University",
            "summary": "Official university innovation week event linked to innovation, research, entrepreneurship, and student projects.",
            "description": "Kisii University public news records highlight Innovation Week 2026 activities and innovation-focused web publishing.",
            "objectives": "Showcase innovation, entrepreneurship, research, and student project activity.",
            "target_audience": "Students, researchers, innovators, partners, and the university community.",
            "start_date": date(2026, 6, 1),
            "end_date": date(2026, 6, 5),
            "venue": "Kisii University",
            "is_virtual": False,
            "is_hybrid": True,
            "requires_registration": True,
            "registration_deadline": date(2026, 5, 29),
            "max_participants": 500,
            "contact_name": "Innovation Week Secretariat",
            "contact_email": "innovation@kisiiuniversity.ac.ke",
            "status": "upcoming",
            "is_active": True,
            "is_featured": True,
            "display_order": 10,
        },
    ]
    for spec in consultancies:
        await upsert_by_slug(db, Consultancy, slugify(spec["title"]), spec)
    for spec in events:
        await upsert_by_slug(db, ResearchEvent, slugify(spec["title"]), spec)


async def seed_capacity(db: AsyncSession) -> None:
    training_specs = [
        {
            "title": "Grant Writing and Research Budgeting Bootcamp",
            "code": "GWRB-2026",
            "program_type": "bootcamp",
            "category": "grant_writing",
            "summary": "Hands-on bootcamp helping researchers move from concept notes to fundable grant proposals.",
            "description": "Covers problem framing, budgets, work plans, monitoring plans, and reviewer expectations.",
            "target_audience": "Early-career academic staff, postgraduate students, and research administrators.",
            "start_date": date(2026, 7, 15),
            "end_date": date(2026, 7, 17),
            "delivery_mode": "hybrid",
            "venue": "Kisii University Innovation Hub",
            "registration_deadline": NOW + timedelta(days=30),
            "max_participants": 80,
            "is_free": True,
            "offers_certificate": True,
            "contact_name": "Research Capacity Office",
            "contact_email": "capacity@kisiiuniversity.ac.ke",
            "status": "published",
            "is_active": True,
            "is_featured": True,
            "display_order": 10,
        },
        {
            "title": "Responsible AI Methods Clinic",
            "code": "RAI-MC-2026",
            "program_type": "workshop",
            "category": "data_analysis",
            "summary": "Practical clinic on responsible AI methods, data ethics, model validation, and documentation.",
            "description": "Participants bring project concepts and leave with validation plans and risk registers.",
            "target_audience": "Researchers, postgraduate students, and technical project teams using AI methods.",
            "start_date": date(2026, 8, 8),
            "end_date": date(2026, 8, 9),
            "delivery_mode": "in_person",
            "venue": "ICT Training Lab",
            "registration_deadline": NOW + timedelta(days=55),
            "max_participants": 40,
            "is_free": True,
            "offers_certificate": True,
            "contact_email": "innovation@kisiiuniversity.ac.ke",
            "status": "published",
            "is_active": True,
            "is_featured": True,
            "display_order": 20,
        },
    ]
    mentorship_specs = [
        {
            "name": "Early Career Research Mentorship Cohort",
            "code": "ECRM-2026",
            "program_type": "research",
            "summary": "Pairs early-career researchers with senior mentors for proposal, publication, and project leadership support.",
            "description": "Structured six-month cohort with monthly clinics and milestone reviews.",
            "objectives": "Strengthen publication planning, grant readiness, and research leadership practice.",
            "duration_months": 6,
            "commitment_hours_weekly": 2,
            "application_open": date(2026, 6, 10),
            "application_deadline": NOW + timedelta(days=35),
            "cohort_start_date": date(2026, 8, 1),
            "cohort_end_date": date(2027, 1, 31),
            "max_mentees": 30,
            "max_mentors": 15,
            "contact_email": "mentorship@kisiiuniversity.ac.ke",
            "status": "accepting_applications",
            "is_active": True,
            "is_featured": True,
            "display_order": 10,
        },
    ]
    scholarship_specs = [
        {
            "name": "Postgraduate Fieldwork Support Scholarship",
            "code": "PFSS-2026",
            "scholarship_type": "research",
            "funder_name": "Kisii University Research Fund",
            "summary": "Supports postgraduate students completing fieldwork aligned with university research priorities.",
            "description": "Awards cover local travel, data collection tools, and research ethics-related costs.",
            "eligibility": "Registered Kisii University postgraduate students with approved research proposals.",
            "benefits": "Fieldwork support, mentor check-ins, and dissemination clinic participation.",
            "value": Decimal("150000.00"),
            "currency": "KES",
            "covers_research": True,
            "covers_travel": True,
            "duration_months": 4,
            "application_open": date(2026, 6, 15),
            "application_deadline": NOW + timedelta(days=60),
            "number_available": 12,
            "application_url": "https://research.kisiiuniversity.ac.ke/capacity/postgraduate-fieldwork-support",
            "contact_email": "scholarships@kisiiuniversity.ac.ke",
            "status": "open",
            "is_active": True,
            "is_featured": True,
            "display_order": 10,
        },
    ]
    for spec in training_specs:
        await upsert_by_slug(db, TrainingProgram, slugify(spec["title"]), spec)
    for spec in mentorship_specs:
        await upsert_by_slug(db, MentorshipProgram, slugify(spec["name"]), spec)
    for spec in scholarship_specs:
        await upsert_by_slug(db, Scholarship, slugify(spec["name"]), spec)


async def seed_news(db: AsyncSession) -> None:
    specs = [
        {
            "title": "Kisii University partners with universities in SSA and UK on carbon literacy",
            "news_type": "announcement",
            "author_name": "Directorate of Research",
            "summary": "Kisii University is part of a British Council-funded collaboration leveraging carbon literacy for youth employability and job creation.",
            "content": "The official KSU research page names Sheffield Hallam University, Durban University of Technology, Ladoke Akintola University of Technology, Innovate Durban, and Kisii University as project partners.",
            "excerpt": "CL4YEJCP carbon literacy collaboration published on the official research site.",
            "category": "research_projects",
            "published_at": datetime(2023, 8, 4, tzinfo=timezone.utc),
            "status": "published",
            "is_active": True,
            "is_featured": True,
            "is_pinned": True,
            "display_order": 10,
        },
        {
            "title": "Which Way Ethics; Onboarding Artificial Intelligence",
            "news_type": "update",
            "author_name": "Kisii University",
            "summary": "Official university story reflecting on ethical artificial intelligence learning, interdisciplinary inquiry, and responsible innovation.",
            "content": "The story connects responsible AI learning with law, psychology, sociology, ethics, and computing education.",
            "excerpt": "Official KSU story on ethical AI and responsible technology learning.",
            "category": "responsible_ai",
            "published_at": datetime(2024, 5, 16, tzinfo=timezone.utc),
            "status": "published",
            "is_active": True,
            "is_featured": True,
            "is_pinned": False,
            "display_order": 20,
        },
    ]
    for spec in specs:
        await upsert_by_slug(db, ResearchNews, slugify(spec["title"]), spec)


async def run() -> None:
    async with AsyncSessionLocal() as db:
        try:
            await seed_research_offices(db)
            await seed_research_boards(db)
            centers = await seed_centers(db)
            programs = await seed_programs(db, centers)
            projects = await seed_projects(db, centers, programs)
            await seed_publications(db, centers, projects)
            await seed_grants(db)
            await seed_innovations_and_outputs(db, centers, projects)
            await seed_partners(db)
            await seed_consultancies_and_events(db)
            await seed_capacity(db)
            await seed_news(db)
            await db.commit()
            print("Seeded Research portal records.")
        except Exception:
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(run())
