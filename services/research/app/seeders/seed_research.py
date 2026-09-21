"""Seed Research from the supplied REIRM documents and official-site snapshot.

Run Main's seed_research_sources first to register shared media. Re-running is
idempotent. --replace-projects retires other local projects without destroying
their history or relationships; ordinary runs retire only known legacy samples.
"""

from __future__ import annotations

import argparse
import asyncio
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any

from ksu_common.live_research_site import LIVE_RESEARCH_PROFILE
from ksu_common.research_sources import research_media_id, research_source_catalog
from ksu_common.research_partners import RESEARCH_PARTNERS
from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert

from app.core.database import AsyncSessionLocal
from app import models
from app.schemas.base import slugify
from app.seeders.seed_partners import upsert_partner


def seed_slug(value: str) -> str:
    return slugify(value)[:128].rstrip("-") or "record"


async def upsert_by_slug(db, model, slug: str, payload: dict[str, Any]):
    for field in ("gallery_media_ids", "attachment_media_ids", "document_media_ids"):
        if payload.get(field) is not None:
            payload[field] = [str(identifier) for identifier in payload[field]]
    record = await db.scalar(select(model).where(model.slug == seed_slug(slug)))
    payload = {**payload, "slug": seed_slug(slug), "deleted_at": None}
    if record is None:
        record = model(**payload)
        db.add(record)
    else:
        for name, value in payload.items():
            setattr(record, name, value)
    await db.flush()
    return record


async def retire_legacy_samples(db, catalog):
    groups = {
        "seed_centers": [models.ResearchCenter],
        "seed_programs": [models.ResearchProgram],
        "seed_projects": [models.ResearchProject],
        "seed_publications": [models.Publication],
        "seed_success_stories": [models.SuccessStory],
        "seed_grants": [models.Grant],
        "seed_innovations_and_outputs": [models.Innovation, models.ResearchOutput],
        "seed_innovation_pathways": [
            models.StartupVenture,
            models.TechnologyTransferCase,
            models.IncubationRecord,
            models.InnovationCompetitionEntry,
        ],
        "seed_consultancies_and_events": [models.Consultancy],
        "seed_capacity": [
            models.TrainingProgram,
            models.MentorshipProgram,
            models.Scholarship,
        ],
    }
    for group, model_types in groups.items():
        titles = [
            s.get("title", s.get("name")) for s in catalog["legacy_records"][group]
        ]
        for model in model_types:
            label = model.title if hasattr(model, "title") else model.name
            await db.execute(
                update(model)
                .where(label.in_(titles), model.deleted_at.is_(None))
                .values(is_active=False, deleted_at=datetime.now(timezone.utc))
            )


def record_payload(spec):
    return {
        k: v
        for k, v in spec.items()
        if k not in {"source_url", "source_document", "cover_media_key"}
    }


async def seed_projects(db, catalog, center, replace_projects=False):
    if replace_projects:
        # Soft removal preserves dependent records and is restricted to projects.
        await db.execute(
            update(models.ResearchProject)
            .where(
                models.ResearchProject.slug.not_in(
                    [p["slug"] for p in catalog["projects"]]
                ),
                models.ResearchProject.deleted_at.is_(None),
            )
            .values(
                is_active=False, is_public=False, deleted_at=datetime.now(timezone.utc)
            )
        )
    for spec in catalog["projects"]:
        payload = record_payload(spec)
        # Clear old demo fields on a matching slug; the source does not supply them.
        payload = {
            "code": None,
            "pi_id": None,
            "program_id": None,
            "farm_id": None,
            "start_date": None,
            "end_date": None,
            "budget": None,
            "grant_id": None,
            "progress_percentage": 0,
            "background": None,
            "objectives": None,
            "methodology": None,
            "expected_outcomes": None,
            "impact": None,
            "deliverables": None,
            "gallery_media_ids": [],
            "attachment_media_ids": [],
            "document_media_ids": [],
            **payload,
        }
        payload.update(
            center_id=center.id,
            cover_image_id=research_media_id(spec["cover_media_key"]),
        )
        if payload.get("budget") is not None:
            payload["budget"] = Decimal(payload["budget"])
        project = await upsert_by_slug(
            db, models.ResearchProject, spec["slug"], payload
        )
        # Preserve a source's multi-organization string intact instead of inventing
        # identities or splitting ambiguous institutional names.
        funder_name = spec.get("funder_name")
        if funder_name and len(funder_name) <= 255:
            funder = await upsert_by_slug(
                db,
                models.Funding,
                funder_name,
                {
                    "name": funder_name,
                    "about": "Funding organization(s) as listed in the supplied Kisii University donor-funded project register.",
                    "funder_type": "international",
                    "is_active": True,
                },
            )
            await db.execute(
                insert(models.project_funders)
                .values(project_id=project.id, funding_id=funder.id)
                .on_conflict_do_nothing()
            )


async def seed_research(db, *, replace_projects=False):
    catalog = research_source_catalog()
    await retire_legacy_samples(db, catalog)
    center = await upsert_by_slug(
        db,
        models.ResearchCenter,
        "research-extension-innovation-and-resource-mobilization",
        {
            "name": "Research, Extension, Innovation and Resource Mobilization",
            "code": "REIRM",
            "acronym": "REIRM",
            "center_type": "directorate",
            "about": LIVE_RESEARCH_PROFILE["overview"],
            "objectives": LIVE_RESEARCH_PROFILE["objectives"],
            "mandate": LIVE_RESEARCH_PROFILE["mandate"],
            "mission": LIVE_RESEARCH_PROFILE["mission"],
            "vision": LIVE_RESEARCH_PROFILE["vision"],
            "research_areas": LIVE_RESEARCH_PROFILE["research_areas"],
            "email": None,
            "phone": LIVE_RESEARCH_PROFILE["phone"],
            "address": LIVE_RESEARCH_PROFILE["address"],
            "website": LIVE_RESEARCH_PROFILE["source_url"],
            "social_links": {
                "additional_phone": LIVE_RESEARCH_PROFILE["additional_phone"],
                **LIVE_RESEARCH_PROFILE["external_links"],
            },
            "cover_image_id": research_media_id("conference-2026"),
            "is_active": True,
            "is_featured": True,
        },
    )
    await seed_projects(db, catalog, center, replace_projects)
    for spec in catalog["innovations"]:
        payload = record_payload(spec)
        payload.update(center_id=center.id, patent_number=None)
        await upsert_by_slug(db, models.Innovation, spec["slug"], payload)
    for title, kind, description, inventor in [
        (
            "Kenya Watch AI",
            "software",
            "Overall winner at Kisii University's inaugural Innovation Week.",
            "Douglas Mwebi",
        ),
        (
            "Banana Hair & Vegan Leather",
            "product",
            "Exhibited at Kisii University's inaugural Innovation Week.",
            None,
        ),
        (
            "MediBot",
            "technology",
            "Exhibited at Kisii University's inaugural Innovation Week.",
            None,
        ),
        (
            "NeuroBridge",
            "technology",
            "Exhibited at Kisii University's inaugural Innovation Week.",
            None,
        ),
        (
            "Eco-Bricks from Plastic Waste",
            "product",
            "Exhibited at Kisii University's inaugural Innovation Week.",
            None,
        ),
        (
            "Aquaflow",
            "technology",
            "AI and IoT solution for real-time monitoring and prediction to prevent fish mortality. First place at the Technical University of Mombasa Innovation Week hackathon.",
            "Aron Barbra",
        ),
    ]:
        await upsert_by_slug(
            db,
            models.Innovation,
            title,
            {
                "title": title,
                "innovation_type": kind,
                "summary": description,
                "description": description,
                "inventors": [{"name": inventor}] if inventor else None,
                "center_id": center.id,
                "status": "active",
                "is_active": True,
                "is_public": True,
            },
        )
    for slug, competition, position, amount in [
        (
            "aquaflow",
            "Technical University of Mombasa Innovation Week Hackathon",
            "1",
            200000,
        ),
        (
            "advanced-exam-proctor-engine",
            "Technical University of Mombasa Innovation Week Hackathon",
            "5",
            25000,
        ),
        (
            "kenya-watch-ai",
            "Kisii University Inaugural Innovation Week 2026",
            "Overall winner",
            None,
        ),
    ]:
        innovation = await db.scalar(
            select(models.Innovation).where(models.Innovation.slug == slug)
        )
        await upsert_by_slug(
            db,
            models.InnovationCompetitionEntry,
            slug + "-innovation-week-award",
            {
                "title": innovation.title + " — " + competition,
                "innovation_id": innovation.id,
                "competition_name": competition,
                "position": position,
                "entry_status": "winner",
                "prize_value": Decimal(amount) if amount else None,
                "currency": "KES",
                "status": "active",
                "is_active": True,
                "is_public": True,
            },
        )
    for spec in catalog["grants"]:
        payload = record_payload(spec)
        if "scholarship" in spec["title"].lower() and not spec["title"].startswith(
            "Scholarships and Courses"
        ):
            await upsert_by_slug(
                db,
                models.Scholarship,
                spec["slug"],
                {
                    "name": spec["title"][:255],
                    "description": spec["description"],
                    "summary": spec["summary"],
                    "external_url": spec["external_url"],
                    "status": "published",
                    "is_active": True,
                },
            )
        elif "consultancy" in spec["title"].lower() or spec["title"] in {
            "Scholarships and Courses:",
            "Grants and Awards:",
        }:
            await upsert_by_slug(
                db,
                models.ResearchResource,
                spec["slug"],
                {
                    "name": spec["title"][:255],
                    "resource_type": "document",
                    "category": "funding",
                    "description": spec["description"],
                    "access_url": spec["external_url"],
                    "status": "available",
                    "is_active": True,
                },
            )
        else:
            await upsert_by_slug(db, models.Grant, spec["slug"], payload)
    for spec in catalog["awards"]:
        payload = record_payload(spec)
        payload.update(
            grant_type="external",
            category="research",
            status="awarded",
            is_active=True,
            external_url=spec["source_url"],
        )
        if payload.get("total_budget"):
            payload["total_budget"] = Decimal(payload["total_budget"])
        await upsert_by_slug(db, models.Grant, spec["title"], payload)
    for spec in catalog["scholarships"]:
        await upsert_by_slug(
            db,
            models.Scholarship,
            spec["funder_name"] + "-awards",
            {
                "name": spec["title"],
                "funder_name": spec["funder_name"],
                "description": spec["description"],
                "external_url": spec["source_url"],
                "status": "awarded",
                "is_active": True,
            },
        )
    for spec in catalog["resources"]:
        await upsert_by_slug(db, models.ResearchResource, spec["slug"], spec)
    for i, spec in enumerate(RESEARCH_PARTNERS, 1):
        await upsert_partner(db, spec, i * 10)
    for name, kind, area in [
        (
            "Equity Bank",
            "corporate",
            "Joint tree planting at seven schools; 30,800 seedlings reported in FY 2025/2026.",
        ),
        (
            "Safaricom Foundation",
            "foundation",
            "Donated 500 grafted avocado and 4,500 fodder tree seedlings for the university farm.",
        ),
        (
            "Technical University of Mombasa",
            "university",
            "Innovation Week collaboration and student hackathons.",
        ),
        ("University of Eldoret", "university", "Innovation Week collaboration."),
        ("Maasai Mara University", "university", "Innovation Week collaboration."),
        (
            "Web3Clubs Foundation Limited",
            "foundation",
            "Hackathon awards and paid internships for student innovators.",
        ),
        (
            "Gusii Mwalimu SACCO",
            "corporate",
            "Partner acknowledged in the inaugural Innovation Week report.",
        ),
        (
            "Elite Savers CBO",
            "ngo",
            "Partner acknowledged in the inaugural Innovation Week report.",
        ),
        (
            "Chip Globe International",
            "corporate",
            "Partner acknowledged in the inaugural Innovation Week report.",
        ),
        (
            "Fie_Labs Innovation Hub",
            "corporate",
            "Green Silicon Savannah and WEFE Nexus vision presented at Innovation Week.",
        ),
    ]:
        await upsert_by_slug(
            db,
            models.Partner,
            name,
            {
                "name": name,
                "partner_type": kind,
                "collaboration_areas": area,
                "about": area,
                "status": "active",
                "is_active": True,
            },
        )

    environment = catalog["environment"]
    await upsert_by_slug(
        db,
        models.ResearchFarm,
        "nyosia-farm",
        {
            "name": "Nyosia Farm",
            "farm_type": "demonstration",
            "center_id": center.id,
            "about": "Tree nursery supporting Kisii University's tree propagation, planting and agroforestry activities.",
            "activities": environment[3],
            "cover_image_id": research_media_id("environment-01"),
            "gallery_media_ids": [research_media_id("environment-02")],
            "editorial_state": "published",
            "is_active": True,
            "is_public": True,
        },
    )
    await upsert_by_slug(
        db,
        models.Sustainability,
        "environmental-sustainability-and-tree-planting",
        {
            "name": "Environmental Sustainability and Tree Planting",
            "initiative_type": "conservation",
            "summary": environment[1],
            "description": "\n\n".join(environment[2:]),
            "center_id": center.id,
            "cover_image_id": research_media_id("environment-03"),
            "gallery_media_ids": [
                research_media_id(f"environment-{i:02}") for i in range(1, 8)
            ],
            "status": "active",
            "is_active": True,
            "is_featured": True,
        },
    )
    for name, value, target, description in [
        (
            "Trees planted in FY 2025/2026",
            89800,
            130000,
            "Reported trees planted; annual planting target is over 130,000.",
        ),
        (
            "Seedlings planted with Equity Bank",
            30800,
            None,
            "Reported joint planting across seven comprehensive schools in FY 2025/2026.",
        ),
        (
            "Grafted avocado seedlings donated",
            500,
            None,
            "Safaricom Foundation donation planted at the university farm.",
        ),
        (
            "Fodder tree seedlings donated",
            4500,
            None,
            "Safaricom Foundation donation planted at the university farm.",
        ),
    ]:
        await upsert_by_slug(
            db,
            models.ImpactMetric,
            name,
            {
                "name": name,
                "value": Decimal(value),
                "target_value": Decimal(target) if target else None,
                "unit": "seedlings",
                "category": "environmental",
                "description": description,
                "data_source": "Citadel -Environmental sustainability.docx",
                "period_start": date(2025, 7, 1),
                "period_end": date(2026, 6, 30),
                "reporting_year": 2026,
                "editorial_state": "published",
                "is_active": True,
                "is_featured": True,
            },
        )
    # 260,000 is a propagation commitment, not a measured output; it stays in
    # narrative content rather than becoming a fabricated achieved metric.
    outreach = catalog["outreach"]
    await upsert_by_slug(
        db,
        models.SuccessStory,
        "riana-community-outreach",
        {
            "title": outreach[0],
            "story_type": "community",
            "summary": outreach[1],
            "approach": "\n\n".join(outreach[2:]),
            "location": "Riana Location, Suneka",
            "county": "Kisii",
            "country": "Kenya",
            "center_id": center.id,
            "cover_image_id": research_media_id("riana-outreach-01"),
            "gallery_media_ids": [
                research_media_id(f"riana-outreach-{i:02}") for i in range(1, 4)
            ],
            "status": "published",
            "is_active": True,
            "is_featured": True,
        },
    )
    boundaries = [
        outreach.index(t)
        for t in outreach
        if t.startswith(
            (
                "1. Training",
                "2. Training",
                "Training on Environmental",
                "Training on Health",
            )
        )
    ] + [len(outreach)]
    for i, (start, end) in enumerate(zip(boundaries, boundaries[1:])):
        title = outreach[start].removeprefix("1. ").removeprefix("2. ")
        await upsert_by_slug(
            db,
            models.TrainingProgram,
            "riana-" + title,
            {
                "title": title + " — Riana Community Outreach",
                "program_type": "workshop",
                "summary": outreach[start + 1],
                "description": "\n\n".join(outreach[start + 1 : end]),
                "center_id": center.id,
                "venue": "Riana Location, Suneka",
                "schedule": "Delivered during the 2025/2026 financial year.",
                "cover_image_id": research_media_id(f"riana-outreach-{min(i+1,3):02}"),
                "status": "completed",
                "is_active": True,
            },
        )
    return {
        "projects": len(catalog["projects"]),
        "registered_innovations": len(catalog["innovations"]),
        "source_pages": len(catalog["live_pages"]),
    }


async def run(*, replace_projects=False):
    async with AsyncSessionLocal() as db:
        async with db.begin():
            result = await seed_research(db, replace_projects=replace_projects)
        print("Seeded verified Research catalog:", result)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--replace-projects",
        action="store_true",
        help="Retire local projects absent from the source catalog.",
    )
    asyncio.run(run(replace_projects=parser.parse_args().replace_projects))
