"""Import reviewed programme illustrations into media storage and programme records."""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import shutil
import uuid
from collections import Counter
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Media, MediaLink, Programme

from .programme_cover_concepts import ProgrammeCoverConcept, load_programme_cover_concepts
from .programme_cover_review import ReviewStatus, SchoolReviewManifest, load_manifest
from .programme_cover_schools import SCHOOL_COVER_SCOPES, SchoolCoverScope


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


class CoverApprovalError(ValueError):
    """Raised when a review manifest does not approve an exact school batch."""


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


def validate_cover_approval(
    concepts: Sequence[ProgrammeCoverConcept],
    *,
    school_scope: SchoolCoverScope,
    manifest: SchoolReviewManifest,
) -> None:
    """Require an exact, school-matched, human-approved review manifest."""

    if (
        manifest.school_code != school_scope.code
        or manifest.school_slug != school_scope.slug
        or manifest.school_name != school_scope.name
    ):
        raise CoverApprovalError(
            f"Manifest school {manifest.school_code}/{manifest.school_slug} does not match "
            f"{school_scope.code}/{school_scope.slug}"
        )

    wrong_school = sorted(
        concept.slug for concept in concepts if concept.school_code != school_scope.code
    )
    if wrong_school:
        raise CoverApprovalError(
            f"Concepts do not belong to {school_scope.code}: {', '.join(wrong_school)}"
        )

    expected = {concept.slug: concept for concept in concepts}
    actual = set(manifest.items)
    missing = sorted(set(expected) - actual)
    unexpected = sorted(actual - set(expected))
    if missing or unexpected:
        details = []
        if missing:
            details.append(f"missing: {', '.join(missing)}")
        if unexpected:
            details.append(f"unexpected: {', '.join(unexpected)}")
        raise CoverApprovalError("Manifest batch is incomplete: " + "; ".join(details))

    inconsistent = sorted(
        slug
        for slug, concept in expected.items()
        if manifest.items[slug].programme_slug != slug
        or manifest.items[slug].programme_name != concept.programme_name
        or manifest.items[slug].department_code != concept.department_code
    )
    if inconsistent:
        raise CoverApprovalError(
            "Manifest items do not match the selected registry: " + ", ".join(inconsistent)
        )

    unapproved = sorted(
        slug
        for slug, item in manifest.items.items()
        if item.status is not ReviewStatus.HUMAN_APPROVED
    )
    if unapproved:
        raise CoverApprovalError(
            "Manifest items are not human_approved: " + ", ".join(unapproved)
        )


def canonical_school_concepts(
    concepts: Sequence[ProgrammeCoverConcept],
    school_scope: SchoolCoverScope,
) -> tuple[ProgrammeCoverConcept, ...]:
    """Return the canonical registry after rejecting a partial or altered batch."""

    canonical = load_programme_cover_concepts(school_scope.code)
    canonical_by_slug = {concept.slug: concept for concept in canonical}
    supplied_by_slug = {concept.slug: concept for concept in concepts}
    duplicate_slugs = sorted(
        slug for slug, count in Counter(concept.slug for concept in concepts).items() if count > 1
    )
    missing = sorted(set(canonical_by_slug) - set(supplied_by_slug))
    unexpected = sorted(set(supplied_by_slug) - set(canonical_by_slug))
    altered = sorted(
        slug
        for slug in set(canonical_by_slug) & set(supplied_by_slug)
        if supplied_by_slug[slug] != canonical_by_slug[slug]
    )
    if missing or unexpected or duplicate_slugs or altered:
        details = []
        if missing:
            details.append(f"missing: {', '.join(missing)}")
        if unexpected:
            details.append(f"unexpected: {', '.join(unexpected)}")
        if duplicate_slugs:
            details.append(f"duplicates: {', '.join(duplicate_slugs)}")
        if altered:
            details.append(f"altered: {', '.join(altered)}")
        raise CoverApprovalError(
            f"Supplied concepts are not the canonical {school_scope.code} registry: "
            + "; ".join(details)
        )
    return canonical


def _media_payload(
    concept: ProgrammeCoverConcept,
    destination: Path,
    storage_path: str,
    school_scope: SchoolCoverScope,
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
        "tags": [
            "kisii-university",
            "programme-cover",
            school_scope.code,
            school_scope.slug,
            concept.visual_family,
        ],
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
            "school_code": school_scope.code,
            "school_slug": school_scope.slug,
            "programme_slug": concept.slug,
            "visual_family": concept.visual_family,
        },
    }


async def import_programme_covers(
    db: AsyncSession,
    source_dir: Path,
    concepts: Sequence[ProgrammeCoverConcept],
    *,
    school_scope: SchoolCoverScope,
    manifest: SchoolReviewManifest,
    upload_root: Path,
) -> ImportSummary:
    concepts = canonical_school_concepts(concepts, school_scope)
    validate_cover_approval(concepts, school_scope=school_scope, manifest=manifest)
    assets = validate_cover_assets(source_dir, concepts)
    storage_root = f"seed/programme-covers/{school_scope.slug}"

    programmes: dict[str, Programme] = {}
    for concept in concepts:
        programme = (
            await db.execute(select(Programme).where(Programme.slug == concept.slug))
        ).scalar_one_or_none()
        if programme is None:
            raise LookupError(f"Programme not found for illustration: {concept.slug}")
        programmes[concept.slug] = programme

    destination_root = upload_root / storage_root
    destination_root.mkdir(parents=True, exist_ok=True)
    imported = 0
    updated = 0

    for concept in concepts:
        programme = programmes[concept.slug]
        storage_path = f"{storage_root}/{concept.filename}"
        destination = destination_root / concept.filename
        shutil.copy2(assets[concept.filename], destination)
        payload = _media_payload(concept, destination, storage_path, school_scope)
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


async def _run_cli(source_dir: Path, school_code: str, manifest_path: Path) -> ImportSummary:
    from app.core.config import get_settings
    from app.core.database import AsyncSessionLocal

    school_scope = SCHOOL_COVER_SCOPES[school_code]
    concepts = load_programme_cover_concepts(school_code)
    manifest = load_manifest(manifest_path)
    async with AsyncSessionLocal() as db:
        try:
            summary = await import_programme_covers(
                db,
                source_dir,
                concepts,
                school_scope=school_scope,
                manifest=manifest,
                upload_root=get_settings().upload_dir_path,
            )
            await db.commit()
            return summary
        except Exception:
            await db.rollback()
            raise


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--school",
        choices=tuple(sorted(SCHOOL_COVER_SCOPES)),
        required=True,
    )
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    return parser


def main(argv: Sequence[str] | None = None) -> None:
    args = _parser().parse_args(argv)
    summary = asyncio.run(
        _run_cli(args.source.resolve(), args.school, args.manifest.resolve())
    )
    print(
        f"Imported {summary.imported} and updated {summary.updated} "
        f"{args.school} programme covers."
    )


if __name__ == "__main__":
    main()
