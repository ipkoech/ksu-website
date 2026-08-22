"""Seed Main-owned media referenced by Research partner records."""

from __future__ import annotations

import hashlib
from pathlib import PurePosixPath
from urllib.parse import urlparse

from ksu_common.research_partners import PARTNER_SOURCE_URL, RESEARCH_PARTNERS, partner_logo_id
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Media

from ._shared import SeedContext


async def seed_research_partner_media(db: AsyncSession, _ctx: SeedContext) -> None:
    for spec in RESEARCH_PARTNERS:
        slug = str(spec["name"]).lower().replace("&", "and")
        slug = "-".join(part for part in "".join(c if c.isalnum() else " " for c in slug).split())
        logo_url = str(spec["logo_url"])
        source_filename = PurePosixPath(urlparse(logo_url).path).name
        suffix = PurePosixPath(source_filename).suffix.lower() or ".ico"
        mime_type = {".svg": "image/svg+xml", ".png": "image/png"}.get(suffix, "image/x-icon")
        storage_path = f"seed/external/research-partners/{slug}{suffix}"
        media_id = partner_logo_id(slug)
        media = await db.scalar(
            select(Media).where(
                or_(Media.id == media_id, Media.storage_path == storage_path)
            )
        )
        payload = {
            "filename": f"{slug}{suffix}",
            "original_filename": source_filename or f"{slug}{suffix}",
            "mime_type": mime_type,
            "file_size": 0,
            "file_hash": hashlib.sha256(logo_url.encode("utf-8")).hexdigest(),
            "storage_provider": "external",
            "storage_path": storage_path,
            "public_url": logo_url,
            "thumbnail_url": logo_url,
            "title": f"{spec['name']} logo",
            "alt_text": f"{spec['name']} logo",
            "description": "Brand mark for an organization listed by Kisii University as a research partner.",
            "tags": ["research", "partner", "logo", "verified"],
            "credit": str(spec["name"]),
            "media_type": "image",
            "is_public": True,
            "is_processed": True,
            "extra_metadata": {
                "seed_asset": True,
                "source_page_url": PARTNER_SOURCE_URL,
                "organization_website": spec["website"],
                "logo_source_url": logo_url,
            },
        }
        if media is None:
            db.add(Media(id=media_id, **payload))
        else:
            for field_name, value in payload.items():
                setattr(media, field_name, value)
        await db.flush()


__all__ = ["seed_research_partner_media"]
