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
    Consultancy,
    ResearchCenter,
    ResearchEvent,
    ResearchNews,
    ResearchOutput,
    ResearchProgram,
    ResearchProject,
    Scholarship,
    TrainingProgram,
)
from app.schemas.base import slugify

ModelT = TypeVar("ModelT")

NOW = datetime.now(timezone.utc)


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


async def seed_centers(db: AsyncSession) -> dict[str, ResearchCenter]:
    specs = [
        {
            "name": "Centre for Climate Smart Agriculture and Food Systems",
            "code": "CCSAFS",
            "acronym": "CCSAFS",
            "center_type": "research_center",
            "about": (
                "Coordinates applied research on resilient farming systems, post-harvest handling, "
                "food security, and farmer-facing innovation in the Lake Region."
            ),
            "mission": "Advance evidence-based agricultural systems that improve livelihoods and climate resilience.",
            "research_areas": "Climate-smart agriculture, soil health, seed systems, aquaculture, and food value chains.",
            "location": "Kisii University Main Campus",
            "email": "research@kisiiuniversity.ac.ke",
            "is_active": True,
            "is_featured": True,
            "display_order": 10,
        },
        {
            "name": "Health Data and Community Wellbeing Research Hub",
            "code": "HDCWRH",
            "acronym": "HDCW",
            "center_type": "hub",
            "about": (
                "Supports health systems research, community wellbeing studies, and responsible data "
                "use for county and regional health planning."
            ),
            "mission": "Turn community evidence into practical health interventions and policy guidance.",
            "research_areas": "Digital health, public health surveillance, mental health, maternal health, and health economics.",
            "location": "School of Health Sciences",
            "email": "healthresearch@kisiiuniversity.ac.ke",
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
    climate_center = centers["centre-for-climate-smart-agriculture-and-food-systems"]
    health_center = centers["health-data-and-community-wellbeing-research-hub"]
    specs = [
        {
            "name": "Lake Region Resilience Research Programme",
            "code": "LRRRP",
            "center_id": climate_center.id,
            "start_date": date(2025, 1, 15),
            "end_date": date(2028, 12, 31),
            "summary": "Multidisciplinary research programme on food systems, climate risk, and livelihoods.",
            "description": "Brings together agriculture, economics, education, and community extension teams.",
            "objectives": "Generate county-ready evidence, pilot adaptation tools, and publish open datasets.",
            "budget": Decimal("18500000.00"),
            "currency": "KES",
            "status": "active",
            "is_active": True,
            "is_featured": True,
            "display_order": 10,
        },
        {
            "name": "Community Health Evidence and Digital Systems Programme",
            "code": "CHEDSP",
            "center_id": health_center.id,
            "start_date": date(2025, 7, 1),
            "end_date": date(2027, 6, 30),
            "summary": "Research programme strengthening community health evidence and digital reporting.",
            "description": "Links household-level research with health facility data and county planning teams.",
            "objectives": "Improve data quality, test interventions, and train early-career researchers.",
            "budget": Decimal("12600000.00"),
            "currency": "KES",
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
    climate_center = centers["centre-for-climate-smart-agriculture-and-food-systems"]
    health_center = centers["health-data-and-community-wellbeing-research-hub"]
    resilience_program = programs["lake-region-resilience-research-programme"]
    health_program = programs["community-health-evidence-and-digital-systems-programme"]
    specs = [
        {
            "title": "Carbon Literacy for Youth Employability and Job Creation",
            "code": "CL4YEJCP",
            "program_id": resilience_program.id,
            "center_id": climate_center.id,
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
            "budget": Decimal("9200000.00"),
            "currency": "KES",
            "status": "ongoing",
            "progress_percentage": 42,
            "is_active": True,
            "is_featured": True,
            "is_public": True,
            "display_order": 10,
        },
        {
            "title": "AI-Enabled Community Health Risk Mapping in Western Kenya",
            "code": "AI-CHRM",
            "program_id": health_program.id,
            "center_id": health_center.id,
            "project_type": "applied",
            "start_date": date(2026, 1, 10),
            "end_date": date(2027, 12, 15),
            "summary": (
                "A responsible AI research project mapping community health risk patterns with county "
                "health teams and community health promoters."
            ),
            "abstract": "Combines survey data, health facility signals, and responsible AI governance to guide local interventions.",
            "objectives": "Prototype risk maps, validate indicators, and train health teams in evidence use.",
            "expected_outcomes": "Risk dashboards, governance checklist, validation study, and training package.",
            "impact": "Supports targeted public health planning and faster intervention design.",
            "budget": Decimal("14500000.00"),
            "currency": "KES",
            "status": "approved",
            "progress_percentage": 18,
            "is_active": True,
            "is_featured": True,
            "is_public": True,
            "display_order": 20,
        },
        {
            "title": "Indigenous Vegetables Value Chain and Nutrition Outcomes Study",
            "code": "IVVC-NOS",
            "program_id": resilience_program.id,
            "center_id": climate_center.id,
            "project_type": "action",
            "start_date": date(2024, 9, 1),
            "end_date": date(2026, 11, 30),
            "summary": "Tracks production, market access, and household nutrition effects of indigenous vegetable value chains.",
            "abstract": "The project works with farmer groups and local markets to test value-chain interventions.",
            "objectives": "Measure adoption, nutrition outcomes, and market constraints across selected communities.",
            "expected_outcomes": "Nutrition evidence, extension materials, and market linkage recommendations.",
            "impact": "Improves local food diversity and farmer income opportunities.",
            "budget": Decimal("6800000.00"),
            "currency": "KES",
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
    climate_center = centers["centre-for-climate-smart-agriculture-and-food-systems"]
    health_center = centers["health-data-and-community-wellbeing-research-hub"]
    specs = [
        {
            "payload": {
                "title": "Carbon Literacy, Green Skills, and Employability Pathways among University Students",
                "publication_type": "journal_article",
                "project_id": projects["carbon-literacy-for-youth-employability-and-job-creation"].id,
                "center_id": climate_center.id,
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
                "title": "Responsible AI Governance for Community Health Risk Mapping",
                "publication_type": "conference_paper",
                "project_id": projects["ai-enabled-community-health-risk-mapping-in-western-kenya"].id,
                "center_id": health_center.id,
                "abstract": "Presents a governance checklist for responsible AI use in county-level health analytics.",
                "keywords": ["responsible ai", "community health", "risk mapping", "governance"],
                "journal_name": "Proceedings of the East Africa Digital Health Symposium",
                "publisher": "Digital Health Network",
                "year": 2026,
                "doi": "10.5555/ksu.2026.002",
                "url": "https://research.kisiiuniversity.ac.ke/publications/responsible-ai-health-risk",
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
                "title": "Indigenous Vegetable Markets and Household Dietary Diversity in Kisii County",
                "publication_type": "report",
                "project_id": projects["indigenous-vegetables-value-chain-and-nutrition-outcomes-study"].id,
                "center_id": climate_center.id,
                "abstract": "Reports early evidence on indigenous vegetable value chains and dietary diversity indicators.",
                "keywords": ["nutrition", "value chains", "indigenous vegetables", "markets"],
                "journal_name": "Kisii University Research Briefs",
                "publisher": "Kisii University",
                "year": 2025,
                "doi": "10.5555/ksu.2025.014",
                "url": "https://research.kisiiuniversity.ac.ke/publications/indigenous-vegetable-markets",
                "is_open_access": True,
                "access_type": "gold",
                "citation_count": 8,
                "status": "published",
                "is_active": True,
                "is_featured": False,
                "display_order": 30,
            },
            "authors": ["Dr. Erick Omwenga", "Dr. Agnes Moraa", "Dr. Lydia Atieno"],
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
            "title": "Kisii University Early Career Research Grant 2026",
            "code": "KSU-ECRG-2026",
            "grant_type": "internal",
            "category": "research",
            "funder_name": "Kisii University Directorate of Research",
            "summary": "Seed funding for early-career researchers developing competitive external grant proposals.",
            "description": "Supports pilot data collection, research assistants, publication preparation, and mentorship.",
            "eligibility": "Kisii University academic staff within seven years of doctoral graduation.",
            "focus_areas": "Food systems, public health, education, digital transformation, and sustainability.",
            "total_budget": Decimal("6000000.00"),
            "min_award": Decimal("250000.00"),
            "max_award": Decimal("750000.00"),
            "currency": "KES",
            "number_of_awards": 8,
            "announcement_date": date(2026, 6, 1),
            "open_date": date(2026, 6, 3),
            "deadline": NOW + timedelta(days=45),
            "application_url": "https://research.kisiiuniversity.ac.ke/funding/ecrg-2026",
            "contact_name": "Directorate of Research",
            "contact_email": "researchgrants@kisiiuniversity.ac.ke",
            "status": "open",
            "is_active": True,
            "is_featured": True,
            "display_order": 10,
        },
        {
            "title": "Responsible AI and Society Collaborative Call",
            "code": "RAISC-2026",
            "grant_type": "external",
            "category": "innovation",
            "funder_name": "Responsible Computing Challenge Partners",
            "summary": "Collaborative funding for responsible AI curriculum, prototypes, and community-facing research.",
            "description": "Supports interdisciplinary teams working on ethics, governance, and public-interest AI.",
            "eligibility": "Teams must include academic, student, and community or industry collaborators.",
            "focus_areas": "Responsible AI, computing education, civic technology, and digital inclusion.",
            "total_budget": Decimal("9800000.00"),
            "min_award": Decimal("500000.00"),
            "max_award": Decimal("1800000.00"),
            "currency": "KES",
            "number_of_awards": 5,
            "announcement_date": date(2026, 5, 20),
            "open_date": date(2026, 6, 10),
            "deadline": NOW + timedelta(days=75),
            "external_url": "https://research.kisiiuniversity.ac.ke/funding/responsible-ai-society",
            "application_url": "https://research.kisiiuniversity.ac.ke/funding/responsible-ai-society/apply",
            "contact_email": "innovation@kisiiuniversity.ac.ke",
            "status": "open",
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
    climate_center = centers["centre-for-climate-smart-agriculture-and-food-systems"]
    health_center = centers["health-data-and-community-wellbeing-research-hub"]
    innovations = [
        {
            "title": "Carbon Literacy Micro-Credential Toolkit",
            "code": "CL-MCT",
            "innovation_type": "service",
            "category": "environment",
            "project_id": projects["carbon-literacy-for-youth-employability-and-job-creation"].id,
            "center_id": climate_center.id,
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
            "title": "Community Health Risk Triage Dashboard",
            "code": "CHRTD",
            "innovation_type": "software",
            "category": "health",
            "project_id": projects["ai-enabled-community-health-risk-mapping-in-western-kenya"].id,
            "center_id": health_center.id,
            "summary": "A dashboard prototype helping county teams prioritize health outreach using transparent risk indicators.",
            "description": "Combines mapped indicators, explainability notes, and data quality flags.",
            "problem_addressed": "Community health managers need interpretable evidence for intervention planning.",
            "solution": "A dashboard with risk layers, confidence levels, and governance checks.",
            "benefits": "Improves planning conversations and keeps responsible AI controls visible.",
            "applications": "County health planning, field supervision, and research validation.",
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
            "center_id": climate_center.id,
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
            "title": "Responsible AI Community Health Governance Checklist",
            "output_type": "guideline",
            "project_id": projects["ai-enabled-community-health-risk-mapping-in-western-kenya"].id,
            "center_id": health_center.id,
            "summary": "Checklist for validating community health AI workflows before public-sector deployment.",
            "description": "Covers data provenance, explainability, community review, and risk communication.",
            "access_type": "open",
            "access_url": "https://research.kisiiuniversity.ac.ke/outputs/ai-health-governance-checklist",
            "keywords": ["responsible ai", "governance", "community health"],
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
            "name": "Innovate Durban",
            "partner_type": "industry",
            "partnership_level": "technical",
            "about": "Innovation ecosystem partner for green skills, entrepreneurship, and youth employability projects.",
            "collaboration_areas": "Green innovation, student enterprise support, and carbon literacy project implementation.",
            "key_achievements": "Collaborates in regional carbon literacy and employability initiatives.",
            "website": "https://www.innovate.durban/",
            "country": "South Africa",
            "status": "active",
            "is_active": True,
            "is_featured": False,
            "display_order": 30,
        },
        {
            "name": "Kisii County Farmer Cooperative Network",
            "acronym": "KCFCN",
            "partner_type": "community",
            "partnership_level": "implementing",
            "about": "Community partner network supporting farm demonstrations, farmer feedback loops, and field learning sites.",
            "collaboration_areas": "Demonstration plots, indigenous vegetable value chains, farmer training, and community extension.",
            "key_achievements": "Hosts field activities for student research teams and farmer-facing innovation pilots.",
            "website": "https://research.kisiiuniversity.ac.ke/partners/kisii-county-farmer-cooperative-network",
            "country": "Kenya",
            "status": "active",
            "is_active": True,
            "is_featured": True,
            "display_order": 40,
        },
    ]
    for spec in specs:
        await upsert_by_slug(db, Partner, slugify(spec["name"]), spec)


async def seed_consultancies_and_events(db: AsyncSession) -> None:
    consultancies = [
        {
            "title": "County Agricultural Extension Data Review Consultancy",
            "code": "CAEDR-2026",
            "consultancy_type": "evaluation",
            "client_name": "County Agriculture Extension Office",
            "client_type": "government",
            "summary": "Evaluation of extension data workflows and recommendations for research-informed farmer support.",
            "description": "Reviews data collection tools, reporting cadence, and feedback channels used by extension teams.",
            "objectives": "Identify data quality gaps, improve reporting templates, and align extension evidence with university farm research.",
            "deliverables": "Assessment report, redesigned field template, and implementation workshop.",
            "start_date": date(2026, 6, 15),
            "end_date": date(2026, 9, 30),
            "contract_value": Decimal("1200000.00"),
            "currency": "KES",
            "location": "Kisii County",
            "country": "Kenya",
            "status": "ongoing",
            "is_active": True,
            "is_featured": True,
            "is_public": True,
            "display_order": 10,
        },
    ]
    events = [
        {
            "title": "University Farm Climate-Smart Field Day",
            "event_type": "workshop",
            "organizer_name": "Centre for Climate Smart Agriculture and Food Systems",
            "summary": "A practical field day for farmers, students, and partners on resilient crop demonstrations.",
            "description": "Includes demonstration plots, soil health sessions, and value-chain discussion groups.",
            "objectives": "Share early research findings, gather farmer feedback, and demonstrate climate-smart practices.",
            "target_audience": "Farmers, students, extension officers, and research partners.",
            "start_date": date(2026, 7, 24),
            "end_date": date(2026, 7, 24),
            "venue": "Kisii University Farm",
            "is_virtual": False,
            "is_hybrid": False,
            "requires_registration": True,
            "registration_deadline": NOW + timedelta(days=35),
            "max_participants": 120,
            "contact_name": "University Farm Coordinator",
            "contact_email": "farmresearch@kisiiuniversity.ac.ke",
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
            "title": "Research portal publishes new project, funding, and innovation records",
            "news_type": "announcement",
            "author_name": "Directorate of Research",
            "summary": "The Research portal now exposes live service-backed records for projects, publications, grants, partners, and capacity building.",
            "content": "Kisii University has expanded the Research portal to surface public records from the Research service.",
            "excerpt": "Live research records are now available across the portal.",
            "category": "portal",
            "published_at": NOW,
            "status": "published",
            "is_active": True,
            "is_featured": True,
            "is_pinned": True,
            "display_order": 10,
        },
        {
            "title": "Early career research grant call opens for 2026",
            "news_type": "update",
            "author_name": "Research Grants Office",
            "summary": "The internal seed grant call is open for early-career researchers preparing externally competitive proposals.",
            "content": "Eligible staff can review the funding page for timelines, award limits, and application guidance.",
            "excerpt": "Seed grants are open for early-career researchers.",
            "category": "funding",
            "published_at": NOW - timedelta(days=2),
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
