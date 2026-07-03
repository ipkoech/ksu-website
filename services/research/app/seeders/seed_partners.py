"""Seed verified Kisii University partner organizations into the Research service."""

from __future__ import annotations

import asyncio
from pathlib import Path

from sqlalchemy import delete, select

from app.core.database import AsyncSessionLocal
from app.models import Partner
from app.schemas.base import slugify

ASSET_ROOT = Path(__file__).resolve().parent / "assets" / "partners"

SOURCE_URL = "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/research_partnerships/2b25301b-de41-435a-a8f1-763f78cd3df2"

PARTNER_SPECS = [
    {"name": "University of Kansas Medical Centre", "partner_type": "academic", "partnership_level": "strategic", "country": "United States"},
    {"name": "Pentecostal Life University", "partner_type": "academic", "partnership_level": "strategic", "country": "Malawi"},
    {"name": "Computer Aid International", "partner_type": "international", "partnership_level": "technical", "country": "United Kingdom"},
    {"name": "Kenya National Library Service", "acronym": "KNLS", "partner_type": "government", "partnership_level": "implementing", "country": "Kenya"},
    {"name": "Kenya Marine Fisheries Research Institute", "acronym": "KMFRI", "partner_type": "government", "partnership_level": "research", "country": "Kenya"},
    {"name": "Books for Africa", "partner_type": "foundation", "partnership_level": "community", "country": "United States"},
    {"name": "Jingdezhen University", "partner_type": "academic", "partnership_level": "strategic", "country": "China"},
    {"name": "Bowling Green State University", "partner_type": "academic", "partnership_level": "strategic", "country": "United States"},
    {"name": "Austin Peay State University", "partner_type": "academic", "partnership_level": "strategic", "country": "United States"},
    {"name": "International Computer Driving License", "acronym": "ICDL Africa", "partner_type": "international", "partnership_level": "technical", "country": "Africa"},
    {"name": "Kenya Agricultural and Livestock Research Organization (KARLO)", "acronym": "KARLO", "partner_type": "government", "partnership_level": "research", "country": "Kenya"},
    {"name": "University of Minnesota", "acronym": "UMN", "partner_type": "academic", "partnership_level": "strategic", "country": "United States"},
    {"name": "Semyung University", "partner_type": "academic", "partnership_level": "strategic", "country": "South Korea"},
    {"name": "University of Cape Town", "partner_type": "academic", "partnership_level": "strategic", "country": "South Africa"},
    {"name": "International Youth Fellowship", "acronym": "IYF", "partner_type": "ngo", "partnership_level": "community", "country": "International"},
    {"name": "Kantar Public", "partner_type": "industry", "partnership_level": "research", "country": "United Kingdom"},
    {"name": "Mogadishu University", "partner_type": "academic", "partnership_level": "strategic", "country": "Somalia"},
    {"name": "Kenya National Commission on Human Rights", "partner_type": "government", "partnership_level": "community", "country": "Kenya"},
]


async def upsert_partner(db, spec: dict, display_order: int) -> None:
    slug = slugify(spec["name"])
    result = await db.execute(select(Partner).where(Partner.slug == slug))
    partner = result.scalar_one_or_none()

    payload = {
        **spec,
        "slug": slug,
        "status": "active",
        "is_active": True,
        "is_featured": display_order <= 60,
        "display_order": display_order,
        "about": spec.get("about") or f"Active memorandum of understanding between Kisii University and {spec['name']}.",
        "collaboration_areas": spec.get("collaboration_areas") or "Research, academic collaboration, extension, innovation, and institutional partnership.",
        "key_achievements": spec.get("key_achievements") or "Published by Kisii University as an active memorandum of understanding.",
        "social_links": {
            **(spec.get("social_links") or {}),
            "source_url": SOURCE_URL,
            "source_type": "official_ksu_research_partnerships",
        },
    }

    if partner is None:
        partner = Partner(**payload)
        db.add(partner)
    else:
        for field_name, value in payload.items():
            setattr(partner, field_name, value)


async def run() -> None:
    ASSET_ROOT.mkdir(parents=True, exist_ok=True)
    async with AsyncSessionLocal() as db:
        try:
            official_slugs = [slugify(spec["name"]) for spec in PARTNER_SPECS]
            for order, spec in enumerate(PARTNER_SPECS, start=1):
                await upsert_partner(db, spec, order * 10)
            await db.execute(delete(Partner).where(Partner.slug.not_in(official_slugs)))
            await db.commit()
        except Exception:
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(run())
