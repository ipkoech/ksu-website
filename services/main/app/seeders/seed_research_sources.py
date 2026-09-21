"""Seed Main-owned research media, office information, news and events."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from html import escape

from ksu_common.research_sources import (
    research_about_text,
    research_media_id,
    research_source_catalog,
)
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models import Department, Event, Media, News, Wing


async def upsert(db, model, slug, payload):
    record = await db.scalar(select(model).where(model.slug == slug))
    if record is None:
        record = model(slug=slug, **payload)
        db.add(record)
    else:
        for key, value in payload.items():
            setattr(record, key, value)
    await db.flush()
    return record


async def seed_research_sources(db, _ctx=None):
    catalog = research_source_catalog()
    for spec in catalog["media"]:
        media_id = research_media_id(spec["key"])
        record = await db.get(Media, media_id)
        payload = {
            "filename": spec["filename"],
            "original_filename": spec["filename"],
            "mime_type": "image/jpeg",
            "file_size": spec["size"],
            "file_hash": spec["sha256"],
            "storage_provider": "external",
            "storage_path": "seed/research-sources/" + spec["filename"],
            "public_url": spec["url"],
            "thumbnail_url": spec["url"],
            "title": spec["title"],
            "alt_text": spec["title"],
            "credit": "Kisii University",
            "media_type": "image",
            "is_public": True,
            "is_processed": True,
            "extra_metadata": {
                "seed_asset": True,
                "source_document": spec["source"],
                "embedded_path": spec.get("embedded_path"),
                "source_sha256": spec["sha256"],
            },
        }
        if record is None:
            db.add(Media(id=media_id, **payload))
        else:
            for key, value in payload.items():
                setattr(record, key, value)
    await db.flush()
    department = await db.scalar(select(Department).where(Department.code == "REIRM"))
    wing = await db.scalar(select(Wing).where(Wing.code == "REIRM"))
    about = catalog["about"]
    for entity in [department, wing]:
        if entity is None:
            continue
        setattr(
            entity,
            "about" if isinstance(entity, Department) else "description",
            research_about_text(),
        )
        entity.mandate = "\n\n".join(about[3:8])
        entity.email = "research@kisiiuniversity.ac.ke"
        entity.phone = "+254773452323"
        entity.office_location = "P.O. Box 408-40200, Kisii, Kenya"
        entity.cover_image_id = research_media_id("conference-2026")
        if hasattr(entity, "mission"):
            entity.mission = "Sustain production of high quality research and consultancy and dissemination of knowledge, skills and competencies for the advancement of humanity."
    if department is None and wing is None:
        raise RuntimeError(
            "Seed the REIRM organizational unit before its research content."
        )
    scope_type = "department" if department else "wing"
    scope_id = (department or wing).id
    publication = {
        "scope_type": "research",
        "scope_id": scope_id,
        "owner_portal": "research",
        "owner_scope_type": scope_type,
        "owner_scope_id": scope_id,
        "is_main": False,
        "is_public": True,
        "is_published": True,
        "status": "published",
        "workflow_status": "published",
        "deleted_at": None,
    }
    for slug, title, body, key in [
        (
            "inaugural-innovation-week-2026",
            "Kisii University's Inaugural Innovation Week: Co-creating a Sustainable Future",
            catalog["innovation_report"],
            "innovation-week-05",
        ),
        (
            "riana-community-outreach-2025-2026",
            catalog["outreach"][0],
            catalog["outreach"][1:],
            "riana-outreach-01",
        ),
        (
            "environmental-sustainability-2025-2026",
            catalog["environment"][0],
            catalog["environment"][1:],
            "environment-03",
        ),
    ]:
        text = "\n\n".join(body)
        await upsert(
            db,
            News,
            slug,
            {
                **publication,
                "title": title,
                "summary": body[0],
                "plain_text": text,
                "rich_text": "".join(f"<p>{escape(p)}</p>" for p in body),
                "featured_media_id": research_media_id(key),
                "is_featured": True,
                "published_at": datetime(2026, 9, 8, tzinfo=timezone.utc),
                "structured_content": {
                    "source_catalog": "2026-09-08",
                    "publication_note": "Imported from supplied REIRM reports; original publication day not specified.",
                },
            },
        )
    # The report supplies calendar dates but no precise event times.
    await upsert(
        db,
        Event,
        "kisii-university-inaugural-innovation-week-2026",
        {
            **publication,
            "title": "Kisii University Inaugural Innovation Week 2026",
            "summary": "Co-creating a Sustainable Future Through Interdisciplinary Research, Green Innovation and Community Impact.",
            "plain_text": "\n\n".join(catalog["innovation_report"]),
            "start_date": datetime(2026, 4, 7, tzinfo=timezone.utc),
            "end_date": datetime(2026, 4, 10, 23, 59, 59, tzinfo=timezone.utc),
            "location": "New Auditorium, Kisii University",
            "featured_media_id": research_media_id("innovation-week-05"),
            "is_featured": True,
            "published_at": datetime(2026, 9, 8, tzinfo=timezone.utc),
            "structured_content": {
                "all_day": True,
                "source_document": "3-Citadel innovation.docx",
            },
        },
    )
    # The supplied conference photo proves the event, but not a full timetable.
    await upsert(
        db,
        News,
        "international-multidisciplinary-conference-june-2026",
        {
            **publication,
            "title": "International Multidisciplinary Conference — June 2026",
            "summary": "Kisii University's International Multidisciplinary Conference brings researchers, scholars and practitioners together across disciplines.",
            "plain_text": "The REIRM annual events programme identifies the International Multidisciplinary Conference as an annual June platform for exchanging knowledge, presenting findings and discussing emerging trends across disciplines.",
            "featured_media_id": research_media_id("conference-2026"),
            "published_at": datetime(2026, 9, 8, tzinfo=timezone.utc),
            "is_featured": True,
            "structured_content": {
                "source_document": "ABOUT RESEARCH AT KISII UNIVERSITY-1.docx",
                "source_image": next(
                    s["source"]
                    for s in catalog["media"]
                    if s["key"] == "conference-2026"
                ),
            },
        },
    )


async def run():
    async with AsyncSessionLocal() as db:
        async with db.begin():
            await seed_research_sources(db)
    print("Seeded Main-owned research source media, office content, news and event.")


if __name__ == "__main__":
    asyncio.run(run())
