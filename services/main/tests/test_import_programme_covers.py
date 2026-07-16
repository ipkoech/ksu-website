from __future__ import annotations

import uuid
from dataclasses import replace
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest

from app.seeders import import_programme_covers as importer
from app.seeders.import_programme_covers import (
    CoverApprovalError,
    CoverAssetValidationError,
    import_programme_covers,
    validate_cover_assets,
)
from app.seeders.programme_cover_concepts import ICT_PROGRAMME_COVER_CONCEPTS
from app.seeders.programme_cover_review import ReviewStatus, create_manifest
from app.seeders.programme_cover_schools import SCHOOL_COVER_SCOPES


SCOPE = SCHOOL_COVER_SCOPES["SIST"]


def _write_webp(path: Path) -> None:
    path.write_bytes(b"RIFF\x10\x00\x00\x00WEBPVP8 " + b"\x00" * 16)


def _approved_manifest(concepts=ICT_PROGRAMME_COVER_CONCEPTS):
    manifest = create_manifest(SCOPE, tuple(concepts))
    manifest.items = {
        slug: replace(item, status=ReviewStatus.HUMAN_APPROVED)
        for slug, item in manifest.items.items()
    }
    return manifest


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
async def test_import_uses_school_storage_tags_and_metadata(tmp_path: Path) -> None:
    concept = ICT_PROGRAMME_COVER_CONCEPTS[0]
    source_dir = tmp_path / "approved"
    upload_root = tmp_path / "uploads"
    source_dir.mkdir()
    _write_webp(source_dir / concept.filename)

    programme = SimpleNamespace(id=uuid.uuid4(), slug=concept.slug, cover_image_id=None)
    db = SimpleNamespace(
        execute=AsyncMock(side_effect=[_Result(programme), _Result(None), _Result(None)]),
        add=Mock(),
        flush=AsyncMock(),
    )

    summary = await import_programme_covers(
        db,
        source_dir,
        (concept,),
        school_scope=SCOPE,
        manifest=_approved_manifest((concept,)),
        upload_root=upload_root,
    )

    assert summary.imported == 1
    assert summary.updated == 0
    assert programme.cover_image_id is not None
    assert db.add.call_count == 2
    media = db.add.call_args_list[0].args[0]
    assert media.storage_path == f"seed/programme-covers/{SCOPE.slug}/{concept.filename}"
    assert {"programme-cover", SCOPE.code, SCOPE.slug} <= set(media.tags)
    assert media.extra_metadata["school_code"] == SCOPE.code
    assert media.extra_metadata["school_slug"] == SCOPE.slug
    assert (upload_root / media.storage_path).exists()


@pytest.mark.asyncio
async def test_import_rejects_unapproved_manifest_before_any_mutation(tmp_path: Path) -> None:
    concept = ICT_PROGRAMME_COVER_CONCEPTS[0]
    source_dir = tmp_path / "approved"
    upload_root = tmp_path / "uploads"
    source_dir.mkdir()
    _write_webp(source_dir / concept.filename)
    manifest = _approved_manifest((concept,))
    manifest.items[concept.slug] = replace(
        manifest.items[concept.slug], status=ReviewStatus.NEEDS_MANUAL_REVIEW
    )
    db = SimpleNamespace(execute=AsyncMock(), add=Mock(), flush=AsyncMock())

    with pytest.raises(CoverApprovalError, match=concept.slug):
        await import_programme_covers(
            db,
            source_dir,
            (concept,),
            school_scope=SCOPE,
            manifest=manifest,
            upload_root=upload_root,
        )

    db.execute.assert_not_awaited()
    db.add.assert_not_called()
    assert not upload_root.exists()


@pytest.mark.asyncio
async def test_import_rejects_incomplete_manifest_before_any_mutation(tmp_path: Path) -> None:
    first, second = ICT_PROGRAMME_COVER_CONCEPTS[:2]
    source_dir = tmp_path / "approved"
    upload_root = tmp_path / "uploads"
    source_dir.mkdir()
    _write_webp(source_dir / first.filename)
    _write_webp(source_dir / second.filename)
    manifest = _approved_manifest((first,))
    db = SimpleNamespace(execute=AsyncMock(), add=Mock(), flush=AsyncMock())

    with pytest.raises(CoverApprovalError, match=second.slug):
        await import_programme_covers(
            db,
            source_dir,
            (first, second),
            school_scope=SCOPE,
            manifest=manifest,
            upload_root=upload_root,
        )

    db.execute.assert_not_awaited()
    db.add.assert_not_called()
    assert not upload_root.exists()


@pytest.mark.asyncio
async def test_missing_programme_propagates_without_importer_transaction_control(tmp_path: Path) -> None:
    concept = ICT_PROGRAMME_COVER_CONCEPTS[0]
    source_dir = tmp_path / "approved"
    source_dir.mkdir()
    _write_webp(source_dir / concept.filename)
    db = SimpleNamespace(
        execute=AsyncMock(return_value=_Result(None)),
        add=Mock(),
        flush=AsyncMock(),
        commit=AsyncMock(),
        rollback=AsyncMock(),
    )

    with pytest.raises(LookupError, match=concept.slug):
        await import_programme_covers(
            db,
            source_dir,
            (concept,),
            school_scope=SCOPE,
            manifest=_approved_manifest((concept,)),
            upload_root=tmp_path / "uploads",
        )

    db.add.assert_not_called()
    db.commit.assert_not_awaited()
    db.rollback.assert_not_awaited()


@pytest.mark.asyncio
async def test_cli_rolls_back_when_a_programme_is_missing(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    concept = ICT_PROGRAMME_COVER_CONCEPTS[0]
    source_dir = tmp_path / "approved"
    source_dir.mkdir()
    _write_webp(source_dir / concept.filename)
    manifest = _approved_manifest((concept,))
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
    monkeypatch.setattr(importer, "load_programme_cover_concepts", lambda code: (concept,))
    monkeypatch.setattr(importer, "load_manifest", lambda path: manifest)

    with pytest.raises(LookupError, match=concept.slug):
        await importer._run_cli(source_dir, SCOPE.code, tmp_path / "manifest.json")

    db.commit.assert_not_awaited()
    db.rollback.assert_awaited_once_with()


def test_cli_requires_manifest_and_exposes_exact_school_choices() -> None:
    parser = importer._parser()
    actions = {action.dest: action for action in parser._actions}

    assert actions["school"].choices == tuple(sorted(SCHOOL_COVER_SCOPES))
    assert actions["school"].required is True
    assert actions["manifest"].required is True
    with pytest.raises(SystemExit):
        parser.parse_args(["--school", "sist", "--source", "approved"])


@pytest.mark.asyncio
async def test_import_rerun_updates_existing_media_and_link_without_duplicates(
    tmp_path: Path,
) -> None:
    concept = ICT_PROGRAMME_COVER_CONCEPTS[0]
    source_dir = tmp_path / "approved"
    source_dir.mkdir()
    _write_webp(source_dir / concept.filename)

    programme = SimpleNamespace(id=uuid.uuid4(), slug=concept.slug, cover_image_id=None)
    media = SimpleNamespace(id=uuid.uuid4(), title="old", tags=[])
    link = SimpleNamespace(
        id=uuid.uuid4(),
        is_public=False,
        is_published=False,
        status="draft",
        display_order=99,
    )
    db = SimpleNamespace(
        execute=AsyncMock(side_effect=[_Result(programme), _Result(media), _Result(link)]),
        add=Mock(),
        flush=AsyncMock(),
    )

    summary = await import_programme_covers(
        db,
        source_dir,
        (concept,),
        school_scope=SCOPE,
        manifest=_approved_manifest((concept,)),
        upload_root=tmp_path / "uploads",
    )

    assert summary == importer.ImportSummary(imported=0, updated=1)
    assert programme.cover_image_id == media.id
    assert media.title == f"{concept.programme_name} programme illustration"
    assert {"programme-cover", SCOPE.code, SCOPE.slug} <= set(media.tags)
    assert (link.is_public, link.is_published, link.status, link.display_order) == (
        True,
        True,
        "published",
        1,
    )
    db.add.assert_not_called()


class _Result:
    def __init__(self, value: object) -> None:
        self.value = value

    def scalar_one_or_none(self) -> object:
        return self.value
