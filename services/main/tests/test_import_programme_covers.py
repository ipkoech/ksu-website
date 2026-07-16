from __future__ import annotations

import uuid
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest

from app.seeders.import_programme_covers import (
    CoverAssetValidationError,
    import_programme_covers,
    validate_cover_assets,
)
from app.seeders.programme_cover_concepts import ICT_PROGRAMME_COVER_CONCEPTS


def _write_webp(path: Path) -> None:
    path.write_bytes(b"RIFF\x10\x00\x00\x00WEBPVP8 " + b"\x00" * 16)


def test_validate_cover_assets_requires_an_exact_complete_batch(tmp_path: Path) -> None:
    first, second = ICT_PROGRAMME_COVER_CONCEPTS[:2]
    _write_webp(tmp_path / first.filename)
    _write_webp(tmp_path / "unexpected.webp")

    with pytest.raises(CoverAssetValidationError) as error:
        validate_cover_assets(tmp_path, (first, second))

    assert second.filename in error.value.missing
    assert "unexpected.webp" in error.value.unexpected


def test_validate_cover_assets_rejects_files_without_webp_signature(tmp_path: Path) -> None:
    concept = ICT_PROGRAMME_COVER_CONCEPTS[0]
    (tmp_path / concept.filename).write_bytes(b"not-a-webp")

    with pytest.raises(CoverAssetValidationError) as error:
        validate_cover_assets(tmp_path, (concept,))

    assert error.value.invalid == (concept.filename,)


@pytest.mark.asyncio
async def test_import_programme_covers_creates_media_link_and_assigns_cover(tmp_path: Path) -> None:
    concept = ICT_PROGRAMME_COVER_CONCEPTS[0]
    source_dir = tmp_path / "approved"
    upload_root = tmp_path / "uploads"
    source_dir.mkdir()
    _write_webp(source_dir / concept.filename)

    programme = SimpleNamespace(id=uuid.uuid4(), slug=concept.slug, cover_image_id=None)
    db = SimpleNamespace(
        execute=AsyncMock(
            side_effect=[
                _Result(programme),
                _Result(None),
                _Result(None),
            ]
        ),
        add=Mock(),
        flush=AsyncMock(),
    )

    summary = await import_programme_covers(db, source_dir, (concept,), upload_root=upload_root)

    assert summary.imported == 1
    assert summary.updated == 0
    assert programme.cover_image_id is not None
    assert db.add.call_count == 2
    assert (upload_root / "seed/programme-covers/ict" / concept.filename).exists()


@pytest.mark.asyncio
async def test_import_programme_covers_is_idempotent_for_existing_media_and_link(tmp_path: Path) -> None:
    concept = ICT_PROGRAMME_COVER_CONCEPTS[0]
    source_dir = tmp_path / "approved"
    source_dir.mkdir()
    _write_webp(source_dir / concept.filename)

    programme = SimpleNamespace(id=uuid.uuid4(), slug=concept.slug, cover_image_id=None)
    media = SimpleNamespace(id=uuid.uuid4())
    link = SimpleNamespace(id=uuid.uuid4())
    db = SimpleNamespace(
        execute=AsyncMock(side_effect=[_Result(programme), _Result(media), _Result(link)]),
        add=Mock(),
        flush=AsyncMock(),
    )

    summary = await import_programme_covers(db, source_dir, (concept,), upload_root=tmp_path / "uploads")

    assert summary.imported == 0
    assert summary.updated == 1
    assert programme.cover_image_id == media.id
    db.add.assert_not_called()


class _Result:
    def __init__(self, value: object) -> None:
        self.value = value

    def scalar_one_or_none(self) -> object:
        return self.value
