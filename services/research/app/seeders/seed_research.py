"""Seed public Research portal records for local iteration and verification."""

from __future__ import annotations

import asyncio
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from typing import Any, TypeVar

from ksu_common.research_partners import PARTNER_SOURCE_URL, RESEARCH_PARTNERS, partner_logo_id
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models import (
    Consultancy,
    Grant,
    IncubationRecord,
    Innovation,
    InnovationCompetitionEntry,
    MentorshipProgram,
    Partner,
    Publication,
    PublicationAuthor,
    ResearchCenter,
    ResearchOutput,
    ResearchProgram,
    ResearchProject,
    Scholarship,
    StartupVenture,
    SuccessStory,
    TechnologyTransferCase,
    TrainingProgram,
)
from app.schemas.base import slugify

ModelT = TypeVar("ModelT")

NOW = datetime.now(timezone.utc)


def seed_slug(value: str) -> str:
    """Keep generated seed slugs within the shared schema column limit."""
    return slugify(value)[:128].rstrip("-") or "record"


async def upsert_by_slug(
    db: AsyncSession,
    model: type[ModelT],
    slug: str,
    payload: dict[str, Any],
) -> ModelT:
    slug = seed_slug(slug)
    result = await db.execute(select(model).where(model.slug == slug))
    record = result.scalar_one_or_none()
    if record is None and payload.get("code") and hasattr(model, "code"):
        result = await db.execute(select(model).where(model.code == payload["code"]))
        record = result.scalar_one_or_none()
    if record is None and payload.get("doi") and hasattr(model, "doi"):
        result = await db.execute(select(model).where(model.doi == payload["doi"]))
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


async def upsert_public_media(
    db: AsyncSession,
    *,
    public_url: str,
    title: str,
    alt_text: str,
) -> None:
    """Media is Main-owned; seeders may record URLs but never create Main rows."""
    return None


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
            "location": "408 - 40200 Kisii, Kenya",
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
        {
            "name": "Centre for Sustainable Agriculture & Extension",
            "code": "CSAE",
            "acronym": "CSAE",
            "center_type": "research_center",
            "about": (
                "Coordinates applied agriculture, extension, climate resilience, food systems, "
                "and farmer-facing innovation work for Kisii University research programs."
            ),
            "mission": "Advance practical agricultural research that improves productivity, resilience, and livelihoods.",
            "research_areas": "Climate-smart agriculture, soil and water management, resilient livelihoods, food systems, extension, and markets.",
            "location": "Kisii University Main Campus and field sites in Nyamira and neighbouring counties",
            "email": "research@kisiiuniversity.ac.ke",
            "is_active": True,
            "is_featured": True,
            "display_order": 5,
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
    agriculture_center = centers["centre-for-sustainable-agriculture-extension"]
    await upsert_public_media(
        db,
        public_url="/images/research/research-projects-hero.webp",
        title="Climate-resilient agrifood systems program cover image",
        alt_text="Researchers working with farmers in a green agricultural field",
    )
    specs = [
        {
            "name": "Climate-Resilient Agrifood Systems Program",
            "code": "CRASP/2024/01",
            "center_id": agriculture_center.id,
            "cover_image_id": None,
            "start_date": date(2024, 1, 1),
            "end_date": date(2028, 12, 31),
            "summary": (
                "Coordinated research that strengthens climate resilience, productivity, and nutrition "
                "across agrifood value chains in Nyamira and neighbouring counties."
            ),
            "description": (
                "Improve climate resilience, productivity, and nutrition across crop, livestock, and fish "
                "value chains through integrated research and innovation."
            ),
            "objectives": (
                "Smallholder farmers face rising climate risks and market pressures that threaten food "
                "security and income across Western Kenya."
            ),
            "methodology": (
                "Co-design solutions with farmers and partners; test in real-world conditions; scale proven "
                "innovations; and inform policy and practice."
            ),
            "expected_outcomes": (
                "Higher yields and incomes, reduced climate risks, improved nutrition, and stronger value "
                "chain competitiveness."
            ),
            "budget": Decimal("12800000.00"),
            "currency": "KES",
            "status": "active",
            "is_active": True,
            "is_featured": True,
            "display_order": 1,
        },
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
    agriculture_center = centers["centre-for-sustainable-agriculture-extension"]
    agrifood_program = programs["climate-resilient-agrifood-systems-program"]
    carbon_program = programs["carbon-literacy-for-youth-employability-and-job-creation"]
    responsible_program = programs["responsible-computing-challenge"]
    specs = [
        {
            "title": "Climate-Smart Agriculture for Smallholder Food Security",
            "code": "CRASP-CSA-01",
            "program_id": agrifood_program.id,
            "center_id": agriculture_center.id,
            "project_type": "applied",
            "start_date": date(2024, 1, 1),
            "end_date": date(2026, 12, 31),
            "summary": "Improving productivity and food security through climate-smart agriculture technologies.",
            "abstract": "Farmer field trials test drought-tolerant crops, soil health practices, advisory services, and extension models.",
            "objectives": "Increase adoption of climate-smart practices among smallholder farmers.",
            "methodology": "Demonstration plots, farmer learning groups, extension visits, and seasonal monitoring.",
            "expected_outcomes": "Improved yields, stronger soil health, better farm decisions, and reduced climate vulnerability.",
            "impact": "Supports stable food supply and household income in Nyamira and neighbouring counties.",
            "budget": Decimal("3200000.00"),
            "currency": "KES",
            "status": "ongoing",
            "progress_percentage": 75,
            "is_active": True,
            "is_featured": True,
            "is_public": True,
            "display_order": 1,
        },
        {
            "title": "Agroforestry for Landscape Restoration",
            "code": "CRASP-AFLR-02",
            "program_id": agrifood_program.id,
            "center_id": agriculture_center.id,
            "project_type": "applied",
            "start_date": date(2024, 3, 1),
            "end_date": date(2026, 12, 31),
            "summary": "Restoring farms and landscapes through agroforestry, tree nurseries, and soil conservation practices.",
            "abstract": "Community nurseries and farm-level tree integration are used to improve landscape resilience.",
            "objectives": "Improve soil protection, farm biodiversity, and long-term climate resilience.",
            "methodology": "Participatory farm planning, nursery establishment, field days, and survival monitoring.",
            "expected_outcomes": "More trees on farms, reduced erosion, stronger biodiversity, and improved microclimates.",
            "impact": "Creates resilient landscapes that support production and ecosystem services.",
            "budget": Decimal("1800000.00"),
            "currency": "KES",
            "status": "ongoing",
            "progress_percentage": 60,
            "is_active": True,
            "is_featured": False,
            "is_public": True,
            "display_order": 2,
        },
        {
            "title": "Climate Information Services for Farmers",
            "code": "CRASP-CIS-03",
            "program_id": agrifood_program.id,
            "center_id": agriculture_center.id,
            "project_type": "action",
            "start_date": date(2023, 9, 1),
            "end_date": date(2025, 12, 31),
            "summary": "Delivering weather and agronomic information that helps farmers make timely production decisions.",
            "abstract": "Seasonal advisories, SMS updates, and extension clinics are co-produced with local partners.",
            "objectives": "Improve access to usable climate information for farmers and extension workers.",
            "methodology": "Advisory co-design, dissemination pilots, farmer feedback loops, and uptake analysis.",
            "expected_outcomes": "Better planting decisions, improved risk planning, and increased use of climate advisories.",
            "impact": "Reduces production losses caused by rainfall variability and delayed decisions.",
            "budget": Decimal("1400000.00"),
            "currency": "KES",
            "status": "ongoing",
            "progress_percentage": 80,
            "is_active": True,
            "is_featured": False,
            "is_public": True,
            "display_order": 3,
        },
        {
            "title": "Postharvest Loss Reduction Innovations",
            "code": "CRASP-PHL-04",
            "program_id": agrifood_program.id,
            "center_id": agriculture_center.id,
            "project_type": "applied",
            "start_date": date(2024, 5, 1),
            "end_date": date(2026, 12, 31),
            "summary": "Testing storage, handling, and market-linkage innovations that reduce postharvest losses.",
            "abstract": "Farmer groups test practical postharvest handling methods for grains, horticulture, and priority value chains.",
            "objectives": "Reduce losses between farm gate and market while improving quality and farmer returns.",
            "methodology": "Technology pilots, market assessments, group training, and quality monitoring.",
            "expected_outcomes": "Lower losses, better quality, stronger market readiness, and improved incomes.",
            "impact": "Helps households retain more value from harvested produce.",
            "budget": Decimal("1600000.00"),
            "currency": "KES",
            "status": "ongoing",
            "progress_percentage": 55,
            "is_active": True,
            "is_featured": False,
            "is_public": True,
            "display_order": 4,
        },
        {
            "title": "Water Quality and Ecosystem Health in Nyamira",
            "code": "CRASP-WQEH-05",
            "program_id": agrifood_program.id,
            "center_id": agriculture_center.id,
            "project_type": "applied",
            "start_date": date(2024, 1, 1),
            "end_date": date(2027, 12, 31),
            "summary": "Monitoring water quality and ecosystem health to protect livelihoods and agricultural productivity.",
            "abstract": "Water sampling and ecosystem assessments inform land-use recommendations and local stewardship.",
            "objectives": "Track priority water-quality indicators and promote ecosystem management practices.",
            "methodology": "Field sampling, watershed mapping, community reporting, and policy engagement.",
            "expected_outcomes": "Cleaner water systems, improved stewardship, and evidence for local decision-making.",
            "impact": "Protects water resources that sustain farms, households, and ecosystems.",
            "budget": Decimal("2600000.00"),
            "currency": "KES",
            "status": "ongoing",
            "progress_percentage": 40,
            "is_active": True,
            "is_featured": False,
            "is_public": True,
            "display_order": 5,
        },
        {
            "title": "Smart Soil Moisture Monitoring for Smallholders",
            "code": "CRASP-SSMM-06",
            "program_id": agrifood_program.id,
            "center_id": agriculture_center.id,
            "project_type": "applied",
            "start_date": date(2024, 7, 1),
            "end_date": date(2025, 12, 31),
            "summary": "Deploying low-cost soil moisture sensing to guide irrigation and water-use decisions.",
            "abstract": "Field-tested devices and dashboards support smallholder irrigation scheduling.",
            "objectives": "Improve water productivity through affordable monitoring and farmer-friendly guidance.",
            "methodology": "Sensor prototyping, field validation, farmer training, and dashboard feedback.",
            "expected_outcomes": "More efficient water use, reduced crop stress, and practical digital advisory tools.",
            "impact": "Supports smarter water management for smallholder farms.",
            "budget": Decimal("2200000.00"),
            "currency": "KES",
            "status": "ongoing",
            "progress_percentage": 35,
            "is_active": True,
            "is_featured": False,
            "is_public": True,
            "display_order": 6,
        },
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
    agriculture_center = centers["centre-for-sustainable-agriculture-extension"]
    specs = [
        {
            "payload": {
                "title": "Climate-smart technologies improve maize yields in Western Kenya",
                "publication_type": "journal_article",
                "project_id": projects["climate-smart-agriculture-for-smallholder-food-security"].id,
                "center_id": agriculture_center.id,
                "abstract": "Reports field evidence on climate-smart agriculture practices, soil health, and smallholder yield gains.",
                "keywords": ["climate-smart agriculture", "maize yields", "smallholders", "Western Kenya"],
                "journal_name": "Journal of Agrifood Systems and Climate Resilience",
                "publisher": "Kisii University Research",
                "year": 2025,
                "publication_date": date(2025, 4, 10),
                "doi": "10.5555/ksu.crasp.2025.001",
                "url": "https://research.kisiiuniversity.ac.ke/publications/climate-smart-technologies-maize-yields",
                "is_open_access": True,
                "access_type": "gold",
                "citation_count": 18,
                "status": "published",
                "is_active": True,
                "is_featured": True,
                "display_order": 1,
            },
            "authors": ["Dr. Jane Agutu", "Dr. Daniel Ochieng", "Prof. Nancy Onkwaro"],
        },
        {
            "payload": {
                "title": "Policy brief: Scaling conservation agriculture in smallholder systems",
                "publication_type": "report",
                "project_id": projects["climate-smart-agriculture-for-smallholder-food-security"].id,
                "center_id": agriculture_center.id,
                "abstract": "Synthesizes farmer trial evidence and policy actions for scaling conservation agriculture practices.",
                "keywords": ["policy brief", "conservation agriculture", "extension", "smallholder systems"],
                "journal_name": "Kisii University Policy Brief Series",
                "publisher": "Centre for Sustainable Agriculture & Extension",
                "year": 2025,
                "publication_date": date(2025, 3, 14),
                "doi": "10.5555/ksu.crasp.2025.002",
                "url": "https://research.kisiiuniversity.ac.ke/publications/scaling-conservation-agriculture-smallholders",
                "pdf_url": "https://research.kisiiuniversity.ac.ke/downloads/scaling-conservation-agriculture-smallholders.pdf",
                "is_open_access": True,
                "access_type": "green",
                "citation_count": 6,
                "status": "published",
                "is_active": True,
                "is_featured": True,
                "display_order": 2,
            },
            "authors": ["Dr. Jane Agutu", "Centre for Sustainable Agriculture & Extension"],
        },
        {
            "payload": {
                "title": "Water quality indicators and ecosystem health in Nyamira County",
                "publication_type": "report",
                "project_id": projects["water-quality-and-ecosystem-health-in-nyamira"].id,
                "center_id": agriculture_center.id,
                "abstract": "Presents baseline water quality and ecosystem health observations for agricultural landscapes in Nyamira.",
                "keywords": ["water quality", "ecosystem health", "Nyamira", "agricultural landscapes"],
                "journal_name": "Kisii University Environmental Research Reports",
                "publisher": "Kisii University Research",
                "year": 2025,
                "publication_date": date(2025, 2, 28),
                "doi": "10.5555/ksu.crasp.2025.003",
                "url": "https://research.kisiiuniversity.ac.ke/publications/water-quality-ecosystem-health-nyamira",
                "is_open_access": True,
                "access_type": "gold",
                "citation_count": 4,
                "status": "published",
                "is_active": True,
                "is_featured": False,
                "display_order": 3,
            },
            "authors": ["Dr. E. Boahen", "Dr. Jane Agutu"],
        },
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


async def seed_success_stories(
    db: AsyncSession,
    projects: dict[str, ResearchProject],
) -> None:
    climate_project = projects["climate-smart-agriculture-for-smallholder-food-security"]
    specs = [
        {
            "title": "From low yields to stable harvests",
            "story_type": "impact",
            "project_id": climate_project.id,
            "summary": (
                "Farmer field trials helped smallholder households adopt soil health practices, "
                "timely advisories, and climate-smart planting decisions."
            ),
            "challenge": (
                "Smallholder farmers in Nyamira faced erratic rainfall, declining soil fertility, "
                "and limited access to practical climate information."
            ),
            "approach": (
                "The project worked with farmer groups, field schools, and extension teams to test "
                "soil amendments, water-wise practices, and advisory messages under real farm conditions."
            ),
            "outcomes": (
                "Participating farmers reported more reliable crop establishment, stronger soil management "
                "routines, and better confidence in seasonal decisions."
            ),
            "impact": (
                "The story demonstrates how program research translates into practical livelihood gains "
                "for households and extension networks."
            ),
            "future_directions": (
                "The team is expanding demonstration plots and packaging the lessons into farmer-facing "
                "training materials."
            ),
            "beneficiaries": "Smallholder farmers, extension officers, and farmer field school groups.",
            "beneficiary_count": 1340,
            "location": "Nyamira County",
            "county": "Nyamira",
            "country": "Kenya",
            "story_date": date(2025, 4, 18),
            "published_at": date(2025, 5, 10),
            "status": "published",
            "is_active": True,
            "is_featured": True,
            "display_order": 1,
        },
    ]

    for spec in specs:
        await upsert_by_slug(db, SuccessStory, slugify(spec["title"]), spec)


async def seed_grants(db: AsyncSession) -> None:
    source_url = "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/external_research_grants_s/external-research-grants-awarded"
    specs = [
        {
            "title": "Scientific Manuscript Writing Workshop at Kisii University",
            "code": "AUTHORAID-SMW",
            "grant_type": "external",
            "category": "capacity_building",
            "funder_name": "AUTHORAID/INASP",
            "summary": "External research grant awarded for a scientific manuscript writing workshop at Kisii University.",
            "total_budget": Decimal("2500.00"),
            "currency": "USD",
        },
        {
            "title": "Communicating Research findings",
            "code": "AUTHORAID-CRF",
            "grant_type": "external",
            "category": "capacity_building",
            "funder_name": "AUTHORAID/INASP",
            "summary": "External research grant awarded for communicating research findings.",
            "total_budget": Decimal("2500.00"),
            "currency": "USD",
        },
        {
            "title": "Post-Harvest Losses in South Western Kenya",
            "code": "USDA-PHL-SWK",
            "grant_type": "external",
            "category": "research",
            "funder_name": "USDA - United States Department of Agriculture",
            "summary": "External research grant awarded to Kisii University and University of Minnesota for post-harvest losses in South Western Kenya.",
            "total_budget": Decimal("40000.00"),
            "currency": "USD",
        },
        {
            "title": "Effect of Human Immunodeficiency virus on progesterone and cytokines levels during pregnancy",
            "code": "AZ-HIV-PREG",
            "grant_type": "external",
            "category": "research",
            "funder_name": "AstraZeneca",
            "summary": "External research grant awarded to Dr. Stanslaus Kiilu Musyoki.",
            "total_budget": Decimal("5000.00"),
            "currency": "USD",
        },
        {
            "title": "Home and school partnership for child development",
            "code": "UKRI-GCRF-HSP",
            "grant_type": "external",
            "category": "research",
            "funder_name": "UKRI / Global Challenges Research Fund",
            "summary": "External research grant awarded to Dr. Pamela Wadende for home and school partnership for child development.",
            "total_budget": Decimal("70000.00"),
            "currency": "USD",
        },
        {
            "title": "Innovation partnership for accelerating third generation mini girds deployment in Africa, for rural electrification and sustainable development",
            "code": "WB-MINIGRIDS",
            "grant_type": "external",
            "category": "innovation",
            "funder_name": "World Bank",
            "summary": "External research grant awarded to Dr. James Onchieku for rural electrification and sustainable development.",
            "total_budget": Decimal("200000.00"),
            "currency": "USD",
        },
        {
            "title": "Development and promotion of insect-based feeds to sustainably increase productivity, income, and resilience of fish farming in Kenya",
            "code": "KCSAP-FISH-FEED",
            "grant_type": "external",
            "category": "research",
            "funder_name": "Kenya Climate Smart Agriculture Project (KCSAP)",
            "summary": "External research grant awarded to Dr. Simion Omasaki for insect-based fish feeds in Kenya.",
            "total_budget": Decimal("80000.00"),
            "currency": "USD",
        },
        {
            "title": "Enhancing Local Social Capital In Kenya",
            "code": "UMN-FORD-SOC",
            "grant_type": "external",
            "category": "research",
            "funder_name": "University of Minnesota and Ford Foundation",
            "summary": "External research grant awarded to Kisii University and University of Minnesota for rural leadership training in Southwest Kenya.",
            "description": "Full proposal title published as Enhancing Local Social Capital In Kenya: Adapting Rural Leadership Training For Southwest Kenya.",
            "total_budget": Decimal("300642.00"),
            "currency": "USD",
        },
        {
            "title": "African Higher Education Leadership in Advancing Inclusive Innovation for Development",
            "code": "ERASMUS-AHEAD",
            "grant_type": "external",
            "category": "research",
            "funder_name": "European Union (ERASMUS+)",
            "summary": "External research grant awarded for the AHEAD project, coordinated by Universitatea Petru Maior din Tirgu Mures, Romania.",
            "total_budget": Decimal("46494.00"),
            "currency": "EUR",
        },
        {
            "title": "Efficacy of Selected Indigenous Medicinal Plants from Kenya against Drug Resistant Mycobacteria tuberculosis",
            "code": "IFS-SPAS-TB",
            "grant_type": "external",
            "category": "research",
            "funder_name": "International Foundation for Science",
            "summary": "External research grant awarded to SPAS - Sospeter Njeru Ngoci.",
            "total_budget": Decimal("12000.00"),
            "currency": "USD",
        },
        {
            "title": "DAAD Msc and PhD Scholarships in Fisheries",
            "code": "DAAD-FISH-SCH",
            "grant_type": "external",
            "category": "scholarship",
            "funder_name": "DAAD Scholarships",
            "summary": "External scholarship support for fisheries: 16 MSc scholarships and 8 PhD scholarships.",
            "description": "Published amounts: MSc approximately KES 2,456,000 and PhD KES 4,732,000.",
            "max_award": Decimal("4732000.00"),
            "currency": "KES",
            "number_of_awards": 24,
        },
        {
            "title": "African Development Bank Msc and PhD Scholarships",
            "code": "ADB-AGR-SCH",
            "grant_type": "external",
            "category": "scholarship",
            "funder_name": "African Development Bank (ADB) Scholarships",
            "summary": "External scholarship support tenable at the Faculty of Agriculture: 16 MSc and 10 PhD scholarships.",
            "description": "Published amounts: MSc approximately KES 2,456,000 and PhD KES 5,915,000.",
            "max_award": Decimal("5915000.00"),
            "currency": "KES",
            "number_of_awards": 26,
        },
        {
            "title": "National Research Fund Msc and PhD Students",
            "code": "NRF-MSC-PHD",
            "grant_type": "external",
            "category": "scholarship",
            "funder_name": "National Research Fund",
            "summary": "External research scholarship support for MSc and PhD students in the School of Agriculture and Natural Resources and School of Pure and Applied Sciences.",
            "total_budget": Decimal("14818194.00"),
            "currency": "KES",
        },
    ]
    official_slugs: list[str] = []
    for order, spec in enumerate(specs, start=1):
        payload = {
            **spec,
            "description": spec.get("description") or spec["summary"],
            "focus_areas": spec.get("focus_areas") or spec["category"].replace("_", " ").title(),
            "announcement_date": date(2023, 8, 4),
            "open_date": date(2023, 8, 4),
            "external_url": source_url,
            "application_url": source_url,
            "contact_name": "Directorate of Research",
            "contact_email": "research@kisiiuniversity.ac.ke",
            "contact_phone": "+254773452323",
            "status": "awarded",
            "is_active": True,
            "is_featured": order <= 4,
            "display_order": order * 10,
        }
        slug = slugify(spec["title"])
        official_slugs.append(slug)
        await upsert_by_slug(db, Grant, slug, payload)
    await db.execute(delete(Grant).where(Grant.grant_type == "external", Grant.slug.not_in(official_slugs)))


async def seed_innovations_and_outputs(
    db: AsyncSession,
    centers: dict[str, ResearchCenter],
    projects: dict[str, ResearchProject],
) -> None:
    research_center = centers["research-extension-innovation-and-resource-mobilization"]
    sist_center = centers["school-of-information-science-and-technology-research"]
    agriculture_center = centers["centre-for-sustainable-agriculture-extension"]
    innovations = [
        {
            "title": "Smart Soil Moisture Sensor for Smallholder Farms",
            "code": "CRASP-SSMS",
            "innovation_type": "hardware",
            "category": "agriculture",
            "project_id": projects["smart-soil-moisture-monitoring-for-smallholders"].id,
            "center_id": agriculture_center.id,
            "summary": "Low-cost IoT device for real-time soil moisture monitoring in smallholder farms.",
            "description": "Field-tested prototype supporting irrigation decisions and water-use efficiency.",
            "problem_addressed": "Farmers lack affordable, timely soil moisture information for irrigation and crop stress management.",
            "solution": "Sensor kits connected to simple advisory dashboards and farmer-facing guidance.",
            "benefits": "Improves irrigation timing, reduces water waste, and supports better crop performance.",
            "applications": "Smallholder irrigation, demonstration farms, extension clinics, and student innovation projects.",
            "ip_status": "pending",
            "commercialization_status": "prototype",
            "development_stage": "field_tested",
            "trl_level": 6,
            "status": "active",
            "is_active": True,
            "is_featured": True,
            "is_public": True,
            "display_order": 1,
        },
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
            "title": "Nyamira Soil Health Dashboard",
            "output_type": "tool",
            "project_id": projects["climate-smart-agriculture-for-smallholder-food-security"].id,
            "center_id": agriculture_center.id,
            "summary": "Interactive dashboard summarizing soil health observations from CRASP field sites.",
            "description": "Aggregates farmer field school data, soil indicators, and advisory prompts for extension teams.",
            "access_type": "open",
            "access_url": "https://research.kisiiuniversity.ac.ke/outputs/nyamira-soil-health-dashboard",
            "keywords": ["soil health", "dashboard", "Nyamira", "extension"],
            "status": "published",
            "is_active": True,
            "is_featured": True,
            "display_order": 1,
        },
        {
            "title": "Farmer Field School Training Manual",
            "output_type": "guideline",
            "project_id": projects["climate-smart-agriculture-for-smallholder-food-security"].id,
            "center_id": agriculture_center.id,
            "summary": "Training manual for farmer field schools focused on climate-smart agriculture practices.",
            "description": "Provides facilitator notes, activity plans, and farmer learning tools for demonstration plots.",
            "access_type": "open",
            "download_url": "https://research.kisiiuniversity.ac.ke/downloads/farmer-field-school-training-manual.pdf",
            "keywords": ["farmer field school", "training", "climate-smart agriculture"],
            "status": "published",
            "is_active": True,
            "is_featured": True,
            "display_order": 2,
        },
        {
            "title": "Community radio guide on climate-smart practices",
            "output_type": "brief",
            "project_id": projects["climate-information-services-for-farmers"].id,
            "center_id": agriculture_center.id,
            "summary": "Radio guide for communicating climate-smart practices and seasonal advisories to farming communities.",
            "description": "Supports extension teams and media partners with scripts, seasonal prompts, and call-in discussion points.",
            "access_type": "open",
            "access_url": "https://research.kisiiuniversity.ac.ke/outputs/community-radio-guide-climate-smart-practices",
            "keywords": ["community radio", "climate information", "extension"],
            "status": "published",
            "is_active": True,
            "is_featured": False,
            "display_order": 3,
        },
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
    official_slugs: list[str] = []
    for order, spec in enumerate(RESEARCH_PARTNERS, start=1):
        slug = slugify(spec["name"])
        legacy_slug = spec.get("legacy_slug")
        if legacy_slug:
            legacy_partner = await db.scalar(select(Partner).where(Partner.slug == legacy_slug))
            if legacy_partner is not None:
                current_partner = await db.scalar(select(Partner).where(Partner.slug == slug))
                if current_partner is None:
                    legacy_partner.slug = slug
                else:
                    await db.delete(legacy_partner)
                await db.flush()
        payload = {
            **{key: value for key, value in spec.items() if key not in {"logo_url", "legacy_slug"}},
            "logo_id": partner_logo_id(slug),
            "about": f"Active memorandum of understanding between Kisii University and {spec['name']}.",
            "collaboration_areas": "Research, academic collaboration, extension, innovation, and institutional partnership.",
            "key_achievements": "Published by Kisii University as an active memorandum of understanding.",
            "social_links": {
                "source_url": PARTNER_SOURCE_URL,
                "source_type": "official_ksu_research_partnerships",
                "logo_url": spec["logo_url"],
                "asset_path": spec["logo_url"],
                "logo_asset_path": spec["logo_url"],
                "logo_source_url": spec["logo_url"],
            },
            "status": "active",
            "is_active": True,
            "is_featured": order <= 6,
            "display_order": order * 10,
        }
        official_slugs.append(slug)
        await upsert_by_slug(db, Partner, slug, payload)
    await db.execute(delete(Partner).where(Partner.slug.not_in(official_slugs)))


async def seed_innovation_pathways(db: AsyncSession) -> None:
    soil_sensor = await db.scalar(
        select(Innovation).where(Innovation.slug == "smart-soil-moisture-sensor-for-smallholder-farms")
    )
    carbon_toolkit = await db.scalar(
        select(Innovation).where(Innovation.slug == "carbon-literacy-micro-credential-toolkit")
    )
    responsible_computing = await db.scalar(
        select(Innovation).where(Innovation.slug == "responsible-computing-curriculum-integration")
    )
    university_minnesota = await db.scalar(select(Partner).where(Partner.slug == "university-of-minnesota"))
    mozilla = await db.scalar(select(Partner).where(Partner.slug == "mozilla-foundation"))
    innovate_durban = await db.scalar(select(Partner).where(Partner.slug == "innovate-durban"))

    if soil_sensor is not None:
        startup = await upsert_by_slug(
            db,
            StartupVenture,
            "soilsense-analytics",
            {
                "name": "SoilSense Analytics",
                "code": "SSA-001",
                "innovation_id": soil_sensor.id,
                "partner_id": innovate_durban.id if innovate_durban else None,
                "center_id": soil_sensor.center_id,
                "venture_stage": "incubating",
                "registration_status": "in_progress",
                "sector": "agriculture",
                "summary": "Venture pathway for deploying smart soil moisture monitoring support to smallholder farms.",
                "problem": "Smallholder irrigation decisions are often made without timely soil moisture data.",
                "solution": "Bundle low-cost sensors, advisory dashboards, and extension support into a deployable service.",
                "business_model": "Device kits, maintenance support, and advisory subscriptions for farmer groups and partners.",
                "market": "Smallholder irrigation schemes, demonstration farms, and county extension programmes.",
                "traction": "Field-tested prototype with CRASP-linked smallholder sites.",
                "funding_raised": Decimal("250000.00"),
                "currency": "KES",
                "status": "active",
                "is_active": True,
                "is_public": True,
                "is_featured": True,
                "display_order": 1,
            },
        )
        await upsert_by_slug(
            db,
            TechnologyTransferCase,
            "soilsense-field-deployment-transfer",
            {
                "title": "SoilSense Field Deployment Transfer",
                "code": "KSU-TT-2026-001",
                "innovation_id": soil_sensor.id,
                "partner_id": innovate_durban.id if innovate_durban else None,
                "center_id": soil_sensor.center_id,
                "case_type": "license",
                "transfer_status": "licensed",
                "disclosure_date": date(2026, 1, 15),
                "agreement_date": date(2026, 4, 1),
                "ip_reference": "KSU-IP-2026-001",
                "agreement_reference": "KSU-TT-2026-001",
                "license_type": "non-exclusive",
                "territory": "Kenya",
                "exclusivity": "non_exclusive",
                "summary": "Technology transfer case for partner-supported field deployment of smart soil monitoring.",
                "public_benefit": "Improves water-use decisions and crop stress response for smallholder farmers.",
                "next_steps": "Expand county demonstration sites and document adoption outcomes.",
                "status": "active",
                "is_active": True,
                "is_public": True,
                "is_featured": True,
                "display_order": 1,
            },
        )
    else:
        startup = None

    if carbon_toolkit is not None:
        await upsert_by_slug(
            db,
            IncubationRecord,
            "carbon-literacy-toolkit-incubation",
            {
                "title": "Carbon Literacy Toolkit Incubation",
                "code": "CL-MCT-INC",
                "innovation_id": carbon_toolkit.id,
                "startup_id": startup.id if startup else None,
                "partner_id": university_minnesota.id if university_minnesota else None,
                "center_id": carbon_toolkit.center_id,
                "program_name": "Kisii Innovation Incubation Programme",
                "cohort": "2026 Cohort",
                "incubation_type": "incubation",
                "start_date": date(2026, 2, 1),
                "end_date": date(2026, 8, 31),
                "stage": "active",
                "support_received": "Mentorship, curriculum packaging, partner feedback, and market validation.",
                "outcomes": "Toolkit packaged for student enterprise teams and community training cohorts.",
                "next_steps": "Complete pilot delivery and publish adoption results.",
                "status": "active",
                "is_active": True,
                "is_public": True,
                "is_featured": True,
                "display_order": 1,
            },
        )

    if responsible_computing is not None:
        await upsert_by_slug(
            db,
            InnovationCompetitionEntry,
            "responsible-computing-curriculum-showcase",
            {
                "title": "Responsible Computing Curriculum Showcase",
                "code": "RCC-SHOW-2026",
                "innovation_id": responsible_computing.id,
                "partner_id": mozilla.id if mozilla else None,
                "center_id": responsible_computing.center_id,
                "entry_type": "showcase",
                "competition_name": "Kisii University Innovation Week",
                "organizer_name": "Research, Extension, Innovation and Resource Mobilization",
                "venue": "Kisii University Main Campus",
                "country": "Kenya",
                "event_date": date(2026, 5, 20),
                "entry_status": "finalist",
                "award": "Responsible Technology Showcase Finalist",
                "pitch_summary": "Curriculum integration model for responsible computing and ethical AI learning.",
                "status": "completed",
                "is_active": True,
                "is_public": True,
                "is_featured": True,
                "display_order": 1,
            },
        )


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
    for spec in consultancies:
        await upsert_by_slug(db, Consultancy, slugify(spec["title"]), spec)


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


async def run() -> None:
    async with AsyncSessionLocal() as db:
        try:
            centers = await seed_centers(db)
            programs = await seed_programs(db, centers)
            projects = await seed_projects(db, centers, programs)
            await seed_publications(db, centers, projects)
            await seed_success_stories(db, projects)
            await seed_grants(db)
            await seed_innovations_and_outputs(db, centers, projects)
            await seed_partners(db)
            await seed_innovation_pathways(db)
            await seed_consultancies_and_events(db)
            await seed_capacity(db)
            await db.commit()
            print("Seeded Research portal records.")
        except Exception:
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(run())
