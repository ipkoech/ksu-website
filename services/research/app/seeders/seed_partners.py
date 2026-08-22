"""Seed verified Kisii University partner organizations into the Research service."""

from __future__ import annotations

import asyncio

from ksu_common.research_partners import PARTNER_SOURCE_URL, RESEARCH_PARTNERS, partner_logo_id
from sqlalchemy import delete, select

from app.core.database import AsyncSessionLocal
from app.models import Partner
from app.schemas.base import slugify

PARTNER_SPECS = RESEARCH_PARTNERS


async def upsert_partner(db, spec: dict, display_order: int) -> None:
    slug = slugify(spec["name"])
    candidate_slugs = [slug, spec.get("legacy_slug")]
    result = await db.execute(select(Partner).where(Partner.slug.in_([item for item in candidate_slugs if item])))
    partner = result.scalars().first()
    payload = {
        **{key: value for key, value in spec.items() if key not in {"logo_url", "legacy_slug"}},
        "slug": slug,
        "logo_id": partner_logo_id(slug),
        "status": "active",
        "is_active": True,
        "is_featured": display_order <= 60,
        "display_order": display_order,
        "about": spec.get("about") or f"Active memorandum of understanding between Kisii University and {spec['name']}.",
        "collaboration_areas": spec.get("collaboration_areas") or "Research, academic collaboration, extension, innovation, and institutional partnership.",
        "key_achievements": spec.get("key_achievements") or "Published by Kisii University as an active memorandum of understanding.",
        "social_links": {
            **(spec.get("social_links") or {}),
            "source_url": PARTNER_SOURCE_URL,
            "source_type": "official_ksu_research_partnerships",
            "logo_url": spec["logo_url"],
            "asset_path": spec["logo_url"],
            "logo_asset_path": spec["logo_url"],
            "logo_source_url": spec["logo_url"],
        },
    }

    if partner is None:
        partner = Partner(**payload)
        db.add(partner)
    else:
        for field_name, value in payload.items():
            setattr(partner, field_name, value)


async def run() -> None:
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
