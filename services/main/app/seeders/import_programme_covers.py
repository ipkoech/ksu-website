"""Import reviewed programme illustrations into media storage and programme records."""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import shutil
import uuid
from dataclasses import dataclass
from pathlib import Path
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Media, MediaLink, Programme

from .programme_cover_concepts import (
    ICT_PROGRAMME_COVER_CONCEPTS,
    ProgrammeCoverConcept,
)


STORAGE_ROOT = "seed/programme-covers/ict"


class CoverAssetValidationError(ValueError):
    def __init__(
        self,
        *,
        missing: Sequence[str] = (),
        unexpected: Sequence[str] = (),
        invalid: Sequence[str] = (),
    ) -> None:
        self.missing = tuple(sorted(missing))
        self.unexpected = tuple(sorted(unexpected))
        self.invalid = tuple(sorted(invalid))
        details = []
        if self.missing:
            details.append(f"missing: {', '.join(self.missing)}")
        if self.unexpected:
            details.append(f"unexpected: {', '.join(self.unexpected)}")
        if self.invalid:
            details.append(f"invalid WebP: {', '.join(self.invalid)}")
        super().__init__("; ".join(details) or "invalid programme cover asset batch")


@dataclass(frozen=True, slots=True)
class ImportSummary:
    imported: int
    updated: int


def _has_webp_signature(path: Path) -> bool:
    with path.open("rb") as handle:
        header = handle.read(12)
    return len(header) == 12 and header[:4] == b"RIFF" and header[8:12] == b"WEBP"


def validate_cover_assets(
    source_dir: Path,
    concepts: Sequence[ProgrammeCoverConcept],
) -> dict[str, Path]:
    expected = {concept.filename for concept in concepts}
    actual = {path.name for path in source_dir.iterdir() if path.is_file()} if source_dir.is_dir() else set()
    paths = {name: source_dir / name for name in expected & actual}
    invalid = tuple(name for name, path in paths.items() if not _has_webp_signature(path))
    missing = expected - actual
    unexpected = actual - expected
    if missing or unexpected or invalid:
        raise CoverAssetValidationError(
            missing=missing,
            unexpected=unexpected,
            invalid=invalid,
        )
    return paths


def _media_payload(
    concept: ProgrammeCoverConcept,
    destination: Path,
    storage_path: str,
) -> dict[str, object]:
    content = destination.read_bytes()
    public_url = f"/uploads/{storage_path}"
    return {
        "filename": concept.filename,
        "original_filename": concept.filename,
        "mime_type": "image/webp",
        "file_size": len(content),
        "file_hash": hashlib.sha256(content).hexdigest(),
        "storage_provider": "local",
        "storage_path": storage_path,
        "public_url": public_url,
        "cdn_url": None,
        "title": f"{concept.programme_name} programme illustration",
        "alt_text": concept.alt_text,
        "description": f"Editorial programme artwork for {concept.programme_name}.",
        "caption": None,
        "tags": ["kisii-university", "programme-cover", "ict", concept.visual_family],
        "credit": "Generated for Kisii University",
        "media_type": "image",
        "width": 1200,
        "height": 675,
        "thumbnail_url": public_url,
        "thumbnails": None,
        "uploaded_by_id": None,
        "is_public": True,
        "is_processed": True,
        "extra_metadata": {
            "source": "generated-editorial-illustration",
            "programme_slug": concept.slug,
            "visual_family": concept.visual_family,
        },
    }


async def import_programme_covers(
    db: AsyncSession,
    source_dir: Path,
    concepts: Sequence[ProgrammeCoverConcept],
    *,
    upload_root: Path,
) -> ImportSummary:
    assets = validate_cover_assets(source_dir, concepts)
    destination_root = upload_root / STORAGE_ROOT
    destination_root.mkdir(parents=True, exist_ok=True)
    imported = 0
    updated = 0

    for concept in concepts:
        programme = (
            await db.execute(select(Programme).where(Programme.slug == concept.slug))
        ).scalar_one_or_none()
        if programme is None:
            raise LookupError(f"Programme not found for illustration: {concept.slug}")

        storage_path = f"{STORAGE_ROOT}/{concept.filename}"
        destination = destination_root / concept.filename
        shutil.copy2(assets[concept.filename], destination)
        payload = _media_payload(concept, destination, storage_path)
        media = (
            await db.execute(select(Media).where(Media.storage_path == storage_path))
        ).scalar_one_or_none()
        if media is None:
            media = Media(id=uuid.uuid4(), **payload)
            db.add(media)
            imported += 1
        else:
            for field_name, value in payload.items():
                setattr(media, field_name, value)
            updated += 1
        await db.flush()

        link = (
            await db.execute(
                select(MediaLink).where(
                    MediaLink.media_id == media.id,
                    MediaLink.entity_type == "programme",
                    MediaLink.entity_id == programme.id,
                    MediaLink.role == "cover-image",
                )
            )
        ).scalar_one_or_none()
        if link is None:
            db.add(
                MediaLink(
                    id=uuid.uuid4(),
                    media_id=media.id,
                    entity_type="programme",
                    entity_id=programme.id,
                    role="cover-image",
                    folder_id=None,
                    display_order=1,
                    is_public=True,
                    is_published=True,
                    status="published",
                )
            )
        else:
            link.is_public = True
            link.is_published = True
            link.status = "published"
            link.display_order = 1
        programme.cover_image_id = media.id
        await db.flush()

    return ImportSummary(imported=imported, updated=updated)


async def _run_cli(source_dir: Path) -> ImportSummary:
    from app.core.config import get_settings
    from app.core.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        try:
            summary = await import_programme_covers(
                db,
                source_dir,
                ICT_PROGRAMME_COVER_CONCEPTS,
                upload_root=get_settings().upload_dir_path,
            )
            await db.commit()
            return summary
        except Exception:
            await db.rollback()
            raise


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--school", choices=("ict",), default="ict")
    parser.add_argument("--source", type=Path, required=True)
    args = parser.parse_args()
    summary = asyncio.run(_run_cli(args.source.resolve()))
    print(f"Imported {summary.imported} and updated {summary.updated} ICT programme covers.")


if __name__ == "__main__":
    main()
