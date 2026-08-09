"""Attach public logo media to established research partners.

This script is intentionally separate from the official MOU partner seeder because
local/demo datasets may contain a smaller established partner set used by the
homepage. It is safe to run repeatedly.
"""

from __future__ import annotations

import asyncio
import mimetypes
from pathlib import Path
from typing import Any

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models import Partner


PUBLIC_ROOT = "/images/research/partners"
ASSET_ROOT = Path(__file__).resolve().parent / "assets" / "partners"


PARTNER_LOGOS: dict[str, dict[str, str]] = {
    "university-of-minnesota": {
        "name": "University of Minnesota",
        "filename": "university-of-minnesota.svg",
    },
    "mozilla-foundation": {
        "name": "Mozilla Foundation",
        "filename": "mozilla-foundation.svg",
        "source_url": "https://foundation.mozilla.org/",
    },
    "sheffield-hallam-university": {
        "name": "Sheffield Hallam University",
        "filename": "sheffield-hallam-university.svg",
        "source_url": "https://www.shu.ac.uk/brand-guidelines/logos",
    },
    "durban-university-of-technology": {
        "name": "Durban University of Technology",
        "filename": "durban-university-of-technology.png",
        "source_url": "https://www.dut.ac.za/",
    },
    "ladoke-akintola-university-of-technology": {
        "name": "Ladoke Akintola University of Technology",
        "filename": "ladoke-akintola-university-of-technology.png",
        "source_url": "https://lautech.edu.ng/",
    },
    "innovate-durban": {
        "name": "Innovate Durban",
        "filename": "innovate-durban.png",
        "source_url": "https://innovate.durban/",
    },
}


def _media_payload(slug: str, spec: dict[str, str]) -> dict[str, Any]:
    filename = spec["filename"]
    path = ASSET_ROOT / filename
    if not path.exists():
        raise FileNotFoundError(f"Missing partner logo asset: {path}")

    public_url = f"{PUBLIC_ROOT}/{filename}"
    mime_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
    name = spec["name"]
    return {
        "filename": filename,
        "original_filename": filename,
        "mime_type": mime_type,
        "file_size": path.stat().st_size,
        "storage_provider": "local",
        "storage_path": f"research/partners/{filename}",
        "public_url": public_url,
        "cdn_url": public_url,
        "title": f"{name} logo",
        "alt_text": f"{name} logo",
        "description": f"Official public logo for {name}.",
        "caption": f"{name} logo",
        "media_type": "image",
        "thumbnail_url": public_url,
        "is_public": True,
        "is_processed": True,
    }


async def attach_partner_logos() -> list[str]:
    attached: list[str] = []
    async with AsyncSessionLocal() as db:
        try:
            for slug, spec in PARTNER_LOGOS.items():
                partner = await db.scalar(select(Partner).where(Partner.slug == slug, Partner.deleted_at.is_(None)))
                if partner is None:
                    continue

                logo_url = _media_payload(slug, spec)["public_url"]
                social_links = dict(partner.social_links or {})
                social_links.update(
                    {
                        "logo_url": logo_url,
                        "logo_asset_path": logo_url,
                    }
                )
                source_url = spec.get("source_url")
                if source_url:
                    social_links["logo_source_url"] = source_url
                else:
                    social_links.pop("logo_source_url", None)
                partner.logo_id = None
                partner.social_links = social_links
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
