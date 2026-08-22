"""Repair logo references for the verified Kisii University partner register.

Main owns the actual media rows. This compatibility command only attaches the
shared deterministic IDs and browser-safe URLs to existing Research partners.
"""

from __future__ import annotations

import asyncio

from ksu_common.research_partners import RESEARCH_PARTNERS, partner_logo_id
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models import Partner
from app.schemas.base import slugify


async def attach_partner_logos() -> list[str]:
    attached: list[str] = []
    async with AsyncSessionLocal() as db:
        try:
            for spec in RESEARCH_PARTNERS:
                slug = slugify(spec["name"])
                partner = await db.scalar(
                    select(Partner).where(
                        Partner.slug == slug,
                        Partner.deleted_at.is_(None),
                    )
                )
                if partner is None:
                    continue

                logo_url = str(spec["logo_url"])
                partner.logo_id = partner_logo_id(slug)
                partner.social_links = {
                    **(partner.social_links or {}),
                    "logo_url": logo_url,
                    "asset_path": logo_url,
                    "logo_asset_path": logo_url,
                    "logo_source_url": logo_url,
                }
                attached.append(slug)

            await db.commit()
        except Exception:
            await db.rollback()
            raise

    return attached


async def run() -> None:
    attached = await attach_partner_logos()
    print(f"Attached {len(attached)} partner logos: {', '.join(attached)}")


if __name__ == "__main__":
    asyncio.run(run())
