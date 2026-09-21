"""Seed admissions information pages and procedure entries."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AdmissionInfo
from app.schemas.base import slugify

from ._shared import SeedContext, upsert_admission_info
from .live_site_snapshot import LIVE_SITE_PAGES


_CONTENT_TYPE_BY_PATH = {
    "/admission/certificatebridging-application": "application_form",
    "/admission/diploma-application": "application_form",
    "/admission/how-to-apply": "how_to_apply",
    "/admission/international-students": "international_students",
    "/admission/kisii-university-15th-graduation-booklet-2026": "booklet",
    "/admission/kisii-university-2025-brochure": "brochure",
    "/admission/postgraduate-education": "application_procedure",
    "/admission/undergraduate-application": "requirements",
}


def _official_admission_specs() -> list[dict[str, object]]:
    """Project the exact admission pages from the official page snapshot."""

    specs: list[dict[str, object]] = []
    for page in LIVE_SITE_PAGES:
        path = str(page.get("path") or "")
        content_type = _CONTENT_TYPE_BY_PATH.get(path)
        if content_type is None:
            continue
        specs.append(
            {
                "title": page["title"],
                "content_type": content_type,
                "summary": None,
                "content": page.get("plain_text"),
                "external_url": page["source_url"],
                "audience_levels": None,
            }
        )
    return specs


ADMISSION_INFO_SPECS = _official_admission_specs()


async def seed_admission_info(db: AsyncSession, ctx: SeedContext) -> None:
    active_slugs: set[str] = set()
    for order, spec in enumerate(ADMISSION_INFO_SPECS, start=10):
        item_slug = slugify(spec["title"])
        active_slugs.add(item_slug)
        await upsert_admission_info(
            db,
            ctx,
            title=spec["title"],
            slug=item_slug,
            content_type=spec["content_type"],
            audience_levels=spec.get("audience_levels"),
            summary=spec.get("summary"),
            content=spec.get("content"),
            external_url=spec.get("external_url"),
            school_id=None,
            cover_image_id=None,
            attachment_media_id=None,
            is_published=True,
            display_order=order,
        )

    existing = (await db.execute(select(AdmissionInfo))).scalars().all()
    for item in existing:
        if item.slug not in active_slugs:
            item.is_published = False
