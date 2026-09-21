"""Seed selected official institutional photographs supplied for the website."""

from __future__ import annotations

import hashlib
import shutil
import uuid
from pathlib import Path

from PIL import Image
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AboutPageContent, InstitutionalPage, InstitutionalPageSection, Media, UniversityInfo
from app.core.config import get_settings


ASSET_ROOT = Path(__file__).resolve().parent / "assets" / "institutional"
STORAGE_ROOT = "seed/institutional"

IMAGE_SPECS = (
    ("campus-lawn.jpg", "Kisii University campus lawn", "Campus green space with students and academic buildings."),
    ("registrar-academic-affairs.jpg", "Registrar Academic Affairs office", "Registrar Academic Affairs and Admissions office on the Kisii University campus."),
    ("campus-forest-walk.jpg", "Kisii University campus forest walk", "Landscaped campus path surrounded by trees and green space."),
)


async def seed_institutional_images(db: AsyncSession, ctx) -> None:
    """Copy supplied originals to managed storage and attach them to About content."""
    cover_media = None
    forest_media = None
    registrar_media = None
    upload_root = get_settings().upload_dir_path

    for filename, title, description in IMAGE_SPECS:
        asset_path = ASSET_ROOT / filename
        if not asset_path.exists():
            raise FileNotFoundError(f"Missing institutional image seed asset: {asset_path}")

        storage_path = f"{STORAGE_ROOT}/{filename}"
        upload_path = upload_root / storage_path
        upload_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(asset_path, upload_path)
        file_hash = hashlib.sha256(asset_path.read_bytes()).hexdigest()
        with Image.open(asset_path) as image:
            width, height = image.size
        aspect_ratio = round(width / height, 6) if height else None
        media = (await db.execute(select(Media).where(Media.storage_path == storage_path))).scalar_one_or_none()
        payload = {
            "filename": filename,
            "original_filename": filename,
            "mime_type": "image/jpeg",
            "file_size": asset_path.stat().st_size,
            "file_hash": file_hash,
            "storage_provider": "local",
            "storage_path": storage_path,
            "public_url": f"/uploads/{storage_path}",
            "thumbnail_url": f"/uploads/{storage_path}",
            "title": title,
            "alt_text": title,
            "description": description,
            "tags": ["kisii-university", "institutional", "campus"],
            "credit": "Kisii University supplied institutional photography",
            "media_type": "image",
            "is_public": True,
            "is_processed": True,
            "width": width,
            "height": height,
            "extra_metadata": {
                "seed_asset": True,
                "source_folder": "Ksu images/Without Branding",
                "source_asset": filename,
                "preserve_aspect_ratio": "3:2",
                "width": width,
                "height": height,
                "aspect_ratio": aspect_ratio,
            },
        }
        if media is None:
            media = Media(id=uuid.uuid4(), **payload)
            db.add(media)
        else:
            for field_name, value in payload.items():
                setattr(media, field_name, value)
        await db.flush()
        if filename == "campus-lawn.jpg":
            cover_media = media
        elif filename == "campus-forest-walk.jpg":
            forest_media = media
        elif filename == "registrar-academic-affairs.jpg":
            registrar_media = media

    university = (await db.execute(select(UniversityInfo).where(UniversityInfo.is_active.is_(True)).order_by(UniversityInfo.created_at.asc()))).scalars().first()
    if university is not None and cover_media is not None:
        university.cover_image_id = cover_media.id

    if university is not None:
        about = (await db.execute(
            select(AboutPageContent).where(AboutPageContent.university_info_id == university.id)
        )).scalars().first()
        if about is not None:
            if cover_media is not None:
                about.hero_media_id = cover_media.id
            if forest_media is not None:
                about.identity_media_id = forest_media.id

        about_page = (await db.execute(
            select(InstitutionalPage).where(InstitutionalPage.slug == "about")
        )).scalars().first()
        if about_page is not None:
            section_media = {
                "university-mandate": forest_media,
                "governance": registrar_media,
            }
            for section_slug, media in section_media.items():
                if media is None:
                    continue
                section = (await db.execute(
                    select(InstitutionalPageSection).where(
                        InstitutionalPageSection.institutional_page_id == about_page.id,
                        InstitutionalPageSection.slug == section_slug,
                    )
                )).scalars().first()
                if section is not None:
                    section.primary_media_id = media.id
    await db.flush()


__all__ = ["seed_institutional_images"]
