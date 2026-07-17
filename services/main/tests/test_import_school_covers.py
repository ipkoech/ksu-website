from __future__ import annotations

import hashlib
import json
import struct
import uuid
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest

from app.seeders import import_school_covers as importer
from app.seeders.import_school_covers import (
    SchoolCoverBatchError,
    import_school_covers,
    validate_school_cover_batch,
)
from app.seeders.school_cover_concepts import SCHOOL_COVER_CONCEPTS


def _write_webp(
    path: Path, *, marker: int, width: int = 1600, height: int = 900
) -> None:
    vp8x = (
        bytes((0, 0, 0, marker % 256))
        + (width - 1).to_bytes(3, "little")
        + (height - 1).to_bytes(3, "little")
    )
    chunk = b"VP8X" + struct.pack("<I", len(vp8x)) + vp8x
    path.write_bytes(b"RIFF" + struct.pack("<I", len(chunk) + 4) + b"WEBP" + chunk)


def _batch(tmp_path: Path, *, status: str = "approved") -> tuple[Path, Path]:
    source_dir = tmp_path / "approved"
    source_dir.mkdir()
    items: dict[str, dict[str, str]] = {}
    for marker, concept in enumerate(SCHOOL_COVER_CONCEPTS, start=1):
        path = source_dir / concept.filename
        _write_webp(path, marker=marker)
        items[concept.school_code] = {
            "school_code": concept.school_code,
            "school_slug": concept.school_slug,
            "filename": concept.filename,
            "status": status,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        }
    manifest_path = tmp_path / "manifest.json"
    manifest_path.write_text(json.dumps({"items": items}), encoding="utf-8")
    return source_dir, manifest_path


def test_validator_requires_exact_complete_approved_batch(tmp_path: Path) -> None:
    source_dir, manifest_path = _batch(tmp_path)
    missing = SCHOOL_COVER_CONCEPTS[-1]
    (source_dir / missing.filename).unlink()
    (source_dir / "unexpected.webp").write_bytes(b"unexpected")

    with pytest.raises(SchoolCoverBatchError) as error:
        validate_school_cover_batch(source_dir, manifest_path)

    assert missing.filename in error.value.missing
    assert "unexpected.webp" in error.value.unexpected


def test_validator_rejects_unapproved_wrong_size_hash_and_duplicate_assets(
    tmp_path: Path,
) -> None:
    source_dir, manifest_path = _batch(tmp_path)
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    first, second, third = SCHOOL_COVER_CONCEPTS[:3]
    manifest["items"][first.school_code]["status"] = "needs_manual_review"
    _write_webp(source_dir / second.filename, marker=22, width=1200, height=675)
    (source_dir / third.filename).write_bytes(
        (source_dir / SCHOOL_COVER_CONCEPTS[3].filename).read_bytes()
    )
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")

    with pytest.raises(SchoolCoverBatchError) as error:
        validate_school_cover_batch(source_dir, manifest_path)

    assert first.school_code in error.value.unapproved
    assert second.filename in error.value.invalid
    assert any(third.filename in group for group in error.value.duplicates)
    assert second.school_code in error.value.hash_mismatches


@pytest.mark.asyncio
async def test_import_assigns_school_media_link_and_panorama_metadata(
    tmp_path: Path,
) -> None:
    source_dir, manifest_path = _batch(tmp_path)
    schools = [
        SimpleNamespace(id=uuid.uuid4(), code=concept.school_code, cover_image_id=None)
        for concept in SCHOOL_COVER_CONCEPTS
    ]
    db = SimpleNamespace(
        execute=AsyncMock(
            side_effect=[
                *(_Result(school) for school in schools),
                *(_Result(None) for _ in range(16)),
            ]
        ),
        add=Mock(),
        flush=AsyncMock(),
    )

    summary = await import_school_covers(
        db,
        source_dir,
        manifest=manifest_path,
        upload_root=tmp_path / "uploads",
    )

    assert summary == importer.ImportSummary(imported=8, updated=0)
    assert db.add.call_count == 16
    assert all(school.cover_image_id is not None for school in schools)
    media = db.add.call_args_list[0].args[0]
    assert (
        media.storage_path == f"seed/school-covers/{SCHOOL_COVER_CONCEPTS[0].filename}"
    )
    assert (media.width, media.height, media.mime_type) == (1600, 900, "image/webp")
    assert media.extra_metadata["source"] == "generated-school-panorama"
    assert {"school-cover", SCHOOL_COVER_CONCEPTS[0].school_code} <= set(media.tags)
    link = db.add.call_args_list[1].args[0]
    assert (
        link.entity_type,
        link.role,
        link.is_public,
        link.is_published,
        link.status,
    ) == (
        "school",
        "cover-image",
        True,
        True,
        "published",
    )


@pytest.mark.asyncio
async def test_import_rerun_updates_without_duplicate_media_or_links(
    tmp_path: Path,
) -> None:
    source_dir, manifest_path = _batch(tmp_path)
    schools = [
        SimpleNamespace(id=uuid.uuid4(), code=concept.school_code, cover_image_id=None)
        for concept in SCHOOL_COVER_CONCEPTS
    ]
    media = [SimpleNamespace(id=uuid.uuid4()) for _ in SCHOOL_COVER_CONCEPTS]
    links = [
        SimpleNamespace(
            is_public=False,
            is_published=False,
            status="draft",
            display_order=99,
        )
        for _ in SCHOOL_COVER_CONCEPTS
    ]
    results = [_Result(school) for school in schools]
    for existing_media, link in zip(media, links, strict=True):
        results.extend((_Result(existing_media), _Result(link)))
    db = SimpleNamespace(
        execute=AsyncMock(side_effect=results), add=Mock(), flush=AsyncMock()
    )

    summary = await import_school_covers(
        db,
        source_dir,
        manifest=manifest_path,
        upload_root=tmp_path / "uploads",
    )

    assert summary == importer.ImportSummary(imported=0, updated=8)
    db.add.assert_not_called()
    assert all(
        school.cover_image_id == existing.id
        for school, existing in zip(schools, media, strict=True)
    )
    assert all(
        (link.is_public, link.is_published, link.status, link.display_order)
        == (True, True, "published", 1)
        for link in links
    )


@pytest.mark.asyncio
async def test_missing_school_propagates_without_transaction_control(
    tmp_path: Path,
) -> None:
    source_dir, manifest_path = _batch(tmp_path)
    db = SimpleNamespace(
        execute=AsyncMock(return_value=_Result(None)),
        add=Mock(),
        flush=AsyncMock(),
        commit=AsyncMock(),
        rollback=AsyncMock(),
    )

    with pytest.raises(LookupError, match=SCHOOL_COVER_CONCEPTS[0].school_code):
        await import_school_covers(
            db,
            source_dir,
            manifest=manifest_path,
            upload_root=tmp_path / "uploads",
        )

    db.add.assert_not_called()
    db.commit.assert_not_awaited()
    db.rollback.assert_not_awaited()


@pytest.mark.asyncio
async def test_cli_rolls_back_import_failure(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    source_dir, manifest_path = _batch(tmp_path)
    db = SimpleNamespace(
        execute=AsyncMock(return_value=_Result(None)),
        add=Mock(),
        flush=AsyncMock(),
        commit=AsyncMock(),
        rollback=AsyncMock(),
    )

    class _SessionContext:
        async def __aenter__(self):
            return db

        async def __aexit__(self, exc_type, exc, traceback):
            return False

    monkeypatch.setattr(
        "app.core.database.AsyncSessionLocal", lambda: _SessionContext()
    )
    monkeypatch.setattr(
        "app.core.config.get_settings",
        lambda: SimpleNamespace(upload_dir_path=tmp_path / "uploads"),
    )

    with pytest.raises(LookupError):
        await importer._run_cli(source_dir, manifest_path)

    db.commit.assert_not_awaited()
    db.rollback.assert_awaited_once_with()


class _Result:
    def __init__(self, value: object) -> None:
        self.value = value

    def scalar_one_or_none(self) -> object:
        return self.value
