"""Validate and attach an approved complete batch of school panorama covers."""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import os
import shutil
import struct
import uuid
from collections import defaultdict
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import cast

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Media, MediaLink, School

from .school_cover_concepts import (
    SCHOOL_COVER_CONCEPTS,
    SchoolCoverConcept,
    school_cover_prompt,
)


class SchoolCoverBatchError(ValueError):
    """Raised when approved school assets or their manifest are incomplete."""

    def __init__(
        self,
        *,
        missing: Sequence[str] = (),
        unexpected: Sequence[str] = (),
        invalid: Sequence[str] = (),
        unapproved: Sequence[str] = (),
        hash_mismatches: Sequence[str] = (),
        duplicates: Sequence[Sequence[str]] = (),
        manifest_errors: Sequence[str] = (),
    ) -> None:
        self.missing = tuple(sorted(missing))
        self.unexpected = tuple(sorted(unexpected))
        self.invalid = tuple(sorted(invalid))
        self.unapproved = tuple(sorted(unapproved))
        self.hash_mismatches = tuple(sorted(hash_mismatches))
        self.duplicates = tuple(tuple(sorted(group)) for group in duplicates)
        self.manifest_errors = tuple(sorted(manifest_errors))
        details = {
            "missing": self.missing,
            "unexpected": self.unexpected,
            "invalid": self.invalid,
            "unapproved": self.unapproved,
            "hash_mismatches": self.hash_mismatches,
            "duplicates": self.duplicates,
            "manifest_errors": self.manifest_errors,
        }
        message = "; ".join(f"{key}={value}" for key, value in details.items() if value)
        super().__init__(message or "invalid school cover batch")


@dataclass(frozen=True, slots=True)
class ImportSummary:
    imported: int
    updated: int


class SchoolCoverStorageJournal:
    """Install cover files atomically and restore the previous bytes on failure."""

    def __init__(self, upload_root: Path) -> None:
        self._backup_root = upload_root / ".school-cover-journal" / uuid.uuid4().hex
        self._entries: dict[Path, Path | None] = {}

    def install(self, source: Path, destination: Path) -> None:
        if destination not in self._entries:
            backup: Path | None = None
            if destination.exists():
                backup = self._backup_root / f"{len(self._entries):02d}.webp"
                backup.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(destination, backup)
            self._entries[destination] = backup
        destination.parent.mkdir(parents=True, exist_ok=True)
        staged = destination.with_name(f".{destination.name}.{uuid.uuid4().hex}.tmp")
        try:
            shutil.copy2(source, staged)
            os.replace(staged, destination)
        finally:
            staged.unlink(missing_ok=True)

    def rollback(self) -> None:
        for destination, backup in reversed(tuple(self._entries.items())):
            if backup is None:
                destination.unlink(missing_ok=True)
            else:
                destination.parent.mkdir(parents=True, exist_ok=True)
                os.replace(backup, destination)
        self._cleanup()

    def finalize(self) -> None:
        self._cleanup()

    def _cleanup(self) -> None:
        shutil.rmtree(self._backup_root, ignore_errors=True)
        parent = self._backup_root.parent
        try:
            if parent.is_dir() and not any(parent.iterdir()):
                parent.rmdir()
        except OSError:
            pass
        self._entries.clear()


def _manifest_items(
    manifest: Path | Mapping[str, object],
) -> Mapping[str, Mapping[str, object]]:
    payload: object
    if isinstance(manifest, Path):
        payload = json.loads(manifest.read_text(encoding="utf-8"))
    else:
        payload = manifest
    if not isinstance(payload, Mapping) or not isinstance(
        payload.get("items"), Mapping
    ):
        raise SchoolCoverBatchError(
            manifest_errors=("manifest must contain an items mapping",)
        )
    items = cast(Mapping[object, object], payload["items"])
    if not all(
        isinstance(key, str) and isinstance(value, Mapping)
        for key, value in items.items()
    ):
        raise SchoolCoverBatchError(
            manifest_errors=("manifest items must be keyed objects",)
        )
    return cast(Mapping[str, Mapping[str, object]], items)


def _webp_dimensions(path: Path) -> tuple[int, int] | None:
    data = path.read_bytes()
    if (
        len(data) < 20
        or data[:4] != b"RIFF"
        or data[8:12] != b"WEBP"
        or struct.unpack_from("<I", data, 4)[0] != len(data) - 8
    ):
        return None
    offset = 12
    extended_dimensions: tuple[int, int] | None = None
    image_dimensions: tuple[int, int] | None = None
    while offset + 8 <= len(data):
        kind = data[offset : offset + 4]
        size = struct.unpack_from("<I", data, offset + 4)[0]
        chunk = data[offset + 8 : offset + 8 + size]
        if len(chunk) != size:
            return None
        if kind == b"VP8X" and size == 10:
            extended_dimensions = (
                1 + int.from_bytes(chunk[4:7], "little"),
                1 + int.from_bytes(chunk[7:10], "little"),
            )
        elif kind == b"VP8 " and size >= 20 and chunk[3:6] == b"\x9d\x01\x2a":
            frame_tag = int.from_bytes(chunk[:3], "little")
            first_partition_size = frame_tag >> 5
            if (
                frame_tag & 1
                or first_partition_size == 0
                or 10 + first_partition_size > size
            ):
                return None
            image_dimensions = (
                struct.unpack_from("<H", chunk, 6)[0] & 0x3FFF,
                struct.unpack_from("<H", chunk, 8)[0] & 0x3FFF,
            )
        elif kind == b"VP8L" and size >= 10 and chunk[0] == 0x2F:
            bits = int.from_bytes(chunk[1:5], "little")
            if (bits >> 29) & 0x07:
                return None
            image_dimensions = (
                1 + (bits & 0x3FFF),
                1 + ((bits >> 14) & 0x3FFF),
            )
        offset += 8 + size + (size % 2)
    if offset != len(data) or image_dimensions is None:
        return None
    return (
        image_dimensions
        if extended_dimensions in (None, image_dimensions)
        else None
    )


def validate_school_cover_batch(
    source_dir: Path,
    manifest: Path | Mapping[str, object],
    concepts: Sequence[SchoolCoverConcept] = SCHOOL_COVER_CONCEPTS,
) -> dict[str, Path]:
    """Validate the exact approved eight-file set before any mutation."""

    if tuple(concepts) != SCHOOL_COVER_CONCEPTS:
        raise SchoolCoverBatchError(
            manifest_errors=("concept registry is not canonical",)
        )
    expected = {concept.filename for concept in concepts}
    actual = (
        {path.name for path in source_dir.iterdir() if path.is_file()}
        if source_dir.is_dir()
        else set()
    )
    missing = expected - actual
    unexpected = actual - expected
    paths = {name: source_dir / name for name in expected & actual}
    invalid = {
        name for name, path in paths.items() if _webp_dimensions(path) != (1600, 900)
    }

    items = _manifest_items(manifest)
    expected_codes = {concept.school_code for concept in concepts}
    manifest_errors: list[str] = []
    if set(items) != expected_codes:
        manifest_errors.append(
            f"manifest codes must be exactly {', '.join(sorted(expected_codes))}"
        )
    unapproved: list[str] = []
    hash_mismatches: list[str] = []
    hashes: defaultdict[str, list[str]] = defaultdict(list)
    for concept in concepts:
        item = items.get(concept.school_code)
        if item is None:
            continue
        if (
            item.get("school_code") != concept.school_code
            or item.get("school_slug") != concept.school_slug
            or item.get("filename") != concept.filename
        ):
            manifest_errors.append(
                f"{concept.school_code} identity does not match registry"
            )
        canonical_review_fields = {
            "prompt": school_cover_prompt(concept),
            "subject": concept.subject,
            "alt_text": concept.alt_text,
            "distinctiveness": concept.distinctiveness,
        }
        for field_name, expected_value in canonical_review_fields.items():
            if item.get(field_name) != expected_value:
                manifest_errors.append(
                    f"{concept.school_code} {field_name} does not match registry"
                )
        if item.get("status") != "approved":
            unapproved.append(concept.school_code)
        path = paths.get(concept.filename)
        if path is None:
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        hashes[digest].append(concept.filename)
        if item.get("sha256") != digest:
            hash_mismatches.append(concept.school_code)
    duplicates = tuple(names for names in hashes.values() if len(names) > 1)
    if (
        missing
        or unexpected
        or invalid
        or unapproved
        or hash_mismatches
        or duplicates
        or manifest_errors
    ):
        raise SchoolCoverBatchError(
            missing=missing,
            unexpected=unexpected,
            invalid=invalid,
            unapproved=unapproved,
            hash_mismatches=hash_mismatches,
            duplicates=duplicates,
            manifest_errors=manifest_errors,
        )
    return paths


def _media_payload(
    concept: SchoolCoverConcept,
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
        "title": f"{concept.school_name} academic panorama",
        "alt_text": concept.alt_text,
        "description": f"Discipline-defining academic panorama for {concept.school_name}.",
        "caption": None,
        "tags": [
            "kisii-university",
            "school-cover",
            "academic-panorama",
            concept.school_code,
            concept.school_slug,
        ],
        "credit": "Generated for Kisii University",
        "media_type": "image",
        "width": 1600,
        "height": 900,
        "thumbnail_url": public_url,
        "thumbnails": None,
        "uploaded_by_id": None,
        "is_public": True,
        "is_processed": True,
        "extra_metadata": {
            "source": "generated-school-panorama",
            "school_code": concept.school_code,
            "school_slug": concept.school_slug,
            "distinctiveness": concept.distinctiveness,
        },
    }


async def import_school_covers(
    db: AsyncSession,
    source_dir: Path,
    *,
    manifest: Path | Mapping[str, object],
    upload_root: Path,
    storage_journal: SchoolCoverStorageJournal | None = None,
) -> ImportSummary:
    assets = validate_school_cover_batch(source_dir, manifest)
    schools: dict[str, School] = {}
    for concept in SCHOOL_COVER_CONCEPTS:
        school = (
            await db.execute(select(School).where(School.code == concept.school_code))
        ).scalar_one_or_none()
        if school is None:
            raise LookupError(f"School not found for panorama: {concept.school_code}")
        schools[concept.school_code] = school

    storage_root = "seed/school-covers"
    destination_root = upload_root / storage_root
    owns_storage_journal = storage_journal is None
    journal = storage_journal or SchoolCoverStorageJournal(upload_root)
    imported = 0
    updated = 0
    try:
        for concept in SCHOOL_COVER_CONCEPTS:
            school = schools[concept.school_code]
            storage_path = f"{storage_root}/{concept.filename}"
            destination = destination_root / concept.filename
            journal.install(assets[concept.filename], destination)
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
                        MediaLink.entity_type == "school",
                        MediaLink.entity_id == school.id,
                        MediaLink.role == "cover-image",
                    )
                )
            ).scalar_one_or_none()
            if link is None:
                db.add(
                    MediaLink(
                        id=uuid.uuid4(),
                        media_id=media.id,
                        entity_type="school",
                        entity_id=school.id,
                        role="cover-image",
                        folder_id=None,
                        display_order=1,
                        is_public=True,
                        is_published=True,
                        status="published",
                    )
                )
            else:
                link.media_id = media.id
                link.is_public = True
                link.is_published = True
                link.status = "published"
                link.display_order = 1
            school.cover_image_id = media.id
            await db.flush()
    except Exception:
        if owns_storage_journal:
            journal.rollback()
        raise
    if owns_storage_journal:
        journal.finalize()
    return ImportSummary(imported=imported, updated=updated)


async def _run_cli(source_dir: Path, manifest_path: Path) -> ImportSummary:
    from app.core.config import get_settings
    from app.core.database import AsyncSessionLocal

    upload_root = get_settings().upload_dir_path
    journal = SchoolCoverStorageJournal(upload_root)
    async with AsyncSessionLocal() as db:
        try:
            summary = await import_school_covers(
                db,
                source_dir,
                manifest=manifest_path,
                upload_root=upload_root,
                storage_journal=journal,
            )
            await db.commit()
            journal.finalize()
            return summary
        except Exception:
            try:
                await db.rollback()
            finally:
                journal.rollback()
            raise


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    return parser


def main(argv: Sequence[str] | None = None) -> None:
    args = _parser().parse_args(argv)
    summary = asyncio.run(_run_cli(args.source.resolve(), args.manifest.resolve()))
    print(f"Imported {summary.imported} and updated {summary.updated} school covers.")


if __name__ == "__main__":
    main()
