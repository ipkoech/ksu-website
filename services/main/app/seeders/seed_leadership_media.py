"""Attach official public portraits to seeded Council and Management people."""

from __future__ import annotations

import hashlib
import uuid
from pathlib import PurePosixPath
from urllib.parse import urlparse

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Media

from ._shared import SeedContext


OFFICIAL_SITE = "https://kisiiuniversity.ac.ke"
ACADEMIC_DIVISION_URL = f"{OFFICIAL_SITE}/admin_departments/academic-division"

LEADERSHIP_PORTRAITS = {
    "council_chair": "/storage/staffprofiles/images/NzacepgtIhwzcYKztRJGgDheyWoyI4uBDohTMtjQ.jpg",
    "vice_chancellor": "/storage/staffprofiles/images/azlq2ffNVsU8EOiBwCMShHdLjbm5wKGWYWSd6nen.png",
    "council_member_peter_mageto": "/storage/staffprofiles/images/Oe8ssA1pFFMVXRAq5wmBHCEygrkLmtlGwNGNxnll.png",
    "council_member_scholastica_ndambuki": "/storage/staffprofiles/images/t6AzZENBPT70alMk5zRWqmD1l3PD2cdhoWd6U42K.jpg",
    "council_member_elizabeth_mwangi": "/storage/staffprofiles/images/5JUui2YK9xB8OaBwiogJPCbE9SUOURkvlivvUwXB.jpg",
    "council_member_samson_muchelule": "/storage/staffprofiles/images/kug5rnHGbwcbztKTS1HmSHeTnaEiXVwBBF8eas1g.jpg",
    "council_member_mwenda_makathimo": "/storage/staffprofiles/images/wPfZfLOdXWe8EXkoIDW7RnrxlGOkmPRexrVzD9fZ.png",
    "council_member_pamela_awuor_ochieng": "/storage/staffprofiles/images/wHD7Cilcu11Rn4RoF1MhGb0baJ5TvxFvGliARBVq.png",
    "council_member_josphat_sawe": "/storage/staffprofiles/images/uJpY1KKJYPQvwm2yXiy2fsexCjx5VggkHsUUtfNj.jpg",
    "dvc_arsa": "/storage/public/offices/949KnhS1dZqcBeX7kHbWNpFCYUYdQQ73fuuW4MNT.jpg",
    "dvc_apf": "/storage/public/offices/356ikBz8vIfhuQE7usT0N0IK2OsP7DboaTGlm8cm.png",
    "registrar_admin": "/storage/public/offices/2asib9CUVNv2wJSQTcjj1iK2vpsBr8H9DZc5tfBd.jpg",
    "registrar_academic": "/storage/public/offices/We17qhjxKOZzQC7M548OpiXUiqaCdf26b1kHsfMM.jpg",
    "registrar_reirm": "/storage/public/offices/OGp85GB6otkYGQjQg5N6qB5VDaM3vs6C7uv7Zw74.jpg",
    "finance_officer": "/storage/public/offices/L5xQkM1NP5blIoZzyLvHdm7wp2zyVVvxvKaiflsH.jpg",
    "dean_agriculture": "https://digital.kisiiuniversity.ac.ke/storage/avatars/QEEcNPoWSruiXOyJXdMVytXNfOwuhrVu3abjRFGG.jpg",
    "dean_arts": "https://digital.kisiiuniversity.ac.ke/storage/avatars/Cf85DMmfe0gRnDDoihizE6ygsVDgbQ9AsBWGFxQz.jpg",
    "dean_business": "https://digital.kisiiuniversity.ac.ke/storage/avatars/TRTeh1olBKTCjpFb9x5g7Z0rvJoGTpSwJyKdF87m.jpg",
    "dean_education": "https://digital.kisiiuniversity.ac.ke/storage/avatars/cXWIRez52e0fxAcHL1cScCdnXDsZbtXLZpjaBRIg.jpg",
    "dean_health": "https://digital.kisiiuniversity.ac.ke/storage/avatars/a0bNVqlcYBiKl2w0MdmMwbBGMUyhGH839hNhXHsr.png",
    "dean_ist": "https://digital.kisiiuniversity.ac.ke/storage/avatars/fKjazDzl3QuO9vJIrzP1KU97DJoiPid24ADdhMAO.jpg",
    "dean_law": "https://digital.kisiiuniversity.ac.ke/storage/avatars/kPyjyHI3H9v9wlxnU7OuqmY8dpX1ZlJofVrlPNTo.png",
    "dean_pure_sciences": "https://digital.kisiiuniversity.ac.ke/storage/avatars/C20CHjrgSVMPPmXU0BpE9lEQkmP6H9xal8oEYr4w.jpg",
}

LEADERSHIP_PORTRAIT_SOURCE_PAGES = {
    "dean_agriculture": f"{OFFICIAL_SITE}/profile_view/dr-judith-achieng-odhiambo",
    "dean_arts": f"{OFFICIAL_SITE}/profile_view/dr-peter-nyansera-otieno",
    "dean_business": f"{OFFICIAL_SITE}/profile_view/dr-caleb-n-akuku",
    "dean_education": f"{OFFICIAL_SITE}/profile_view/sr-drjustina-ndaita",
    "dean_health": f"{OFFICIAL_SITE}/profile_view/dr-raymond-oigara",
    "dean_ist": ACADEMIC_DIVISION_URL,
    "dean_law": f"{OFFICIAL_SITE}/profile_view/dr-charles-otuke-moitui",
    "dean_pure_sciences": f"{OFFICIAL_SITE}/profile_view/dr-robert-karieko-obogi",
}


def _public_url(source_path: str) -> str:
    if source_path.startswith(("http://", "https://")):
        return source_path
    return f"{OFFICIAL_SITE}{source_path}"


def _source_path_name(source_path: str) -> str:
    parsed_path = urlparse(source_path).path
    return PurePosixPath(parsed_path).name


def _source_path_suffix(source_path: str) -> str:
    parsed_path = urlparse(source_path).path
    return PurePosixPath(parsed_path).suffix.lower() or ".jpg"


def _source_page_url(key: str) -> str:
    if key in LEADERSHIP_PORTRAIT_SOURCE_PAGES:
        return LEADERSHIP_PORTRAIT_SOURCE_PAGES[key]
    if key.startswith("council_") or key == "vice_chancellor":
        return f"{OFFICIAL_SITE}/about_adminstration"
    return f"{OFFICIAL_SITE}/university_management_board"


async def seed_leadership_media(db: AsyncSession, ctx: SeedContext) -> None:
    for key, source_path in LEADERSHIP_PORTRAITS.items():
        person = ctx.people.get(key)
        if person is None:
            continue

        public_url = _public_url(source_path)
        suffix = _source_path_suffix(source_path)
        storage_path = f"seed/external/leadership/{key}{suffix}"
        media = (
            await db.execute(
                select(Media).where(
                    or_(Media.storage_path == storage_path, Media.public_url == public_url)
                )
            )
        ).scalar_one_or_none()
        payload = {
            "filename": f"{key}{suffix}",
            "original_filename": _source_path_name(source_path),
            "mime_type": "image/png" if suffix == ".png" else "image/jpeg",
            "file_size": 0,
            "file_hash": hashlib.sha256(public_url.encode("utf-8")).hexdigest(),
            "storage_provider": "external",
            "storage_path": storage_path,
            "public_url": public_url,
            "title": f"Official portrait of {person.display_name}",
            "alt_text": f"{person.display_name}, Kisii University leadership",
            "description": "Official portrait published by Kisii University.",
            "tags": ["kisii-university", "leadership", "official-portrait"],
            "credit": "Kisii University",
            "media_type": "image",
            "is_public": True,
            "is_processed": True,
            "extra_metadata": {
                "source": "kisiiuniversity.ac.ke",
                "seed_asset": True,
                "source_page_url": _source_page_url(key),
            },
        }
        if media is None:
            media = Media(id=uuid.uuid4(), **payload)
            db.add(media)
        else:
            for field_name, value in payload.items():
                setattr(media, field_name, value)
        await db.flush()
        person.photo_id = media.id


__all__ = ["LEADERSHIP_PORTRAITS", "seed_leadership_media"]
