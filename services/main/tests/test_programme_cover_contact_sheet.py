import hashlib
import subprocess
from pathlib import Path

import pytest

from app.seeders.programme_cover_contact_sheet import render_contact_sheets
from app.seeders.programme_cover_review import (
    ReviewItem,
    ReviewStatus,
    create_manifest,
    load_manifest,
    save_manifest_atomic,
    transition_item,
)
from app.seeders.programme_cover_review_cli import main
from app.seeders.programme_cover_schools import SCHOOL_COVER_SCOPES


def _solid_webp(path: Path, color: str = "blue", size: str = "1200x675") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg",
            "-loglevel",
            "error",
            "-f",
            "lavfi",
            "-i",
            f"color=c={color}:s={size}",
            "-frames:v",
            "1",
            "-y",
            str(path),
        ],
        check=True,
    )


def _webp(path: Path, source: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg", "-loglevel", "error", "-f", "lavfi", "-i",
            f"{source}=s=1200x675", "-frames:v", "1", "-y", str(path),
        ],
        check=True,
    )


def _item(index: int) -> ReviewItem:
    return ReviewItem(
        programme_slug=f"programme-{index:02d}",
        programme_name=f"Programme <{index}>",
        department_code=f'DEP&{index}',
        status=ReviewStatus.ORCHESTRATOR_REVIEW,
        candidate_path=f'generated/programme-{index:02d}/attempt-1.webp',
        sha256="a" * 64,
        attempt=1,
        review_notes=('failure <script>alert("x")</script>',),
    )


def test_contact_sheets_paginate_at_24_and_escape_manifest_text(tmp_path: Path) -> None:
    manifest = create_manifest(SCHOOL_COVER_SCOPES["SOL"], ())
    manifest.school_name = "Law & <Policy>"
    manifest.items = {item.programme_slug: item for item in (_item(i) for i in range(25))}

    paths = render_contact_sheets(tmp_path, manifest)

    assert [path.name for path in paths] == ["contact-sheet-001.html", "contact-sheet-002.html"]
    first = paths[0].read_text(encoding="utf-8")
    second = paths[1].read_text(encoding="utf-8")
    assert first.count('class="card"') == 24
    assert second.count('class="card"') == 1
    assert "Law &amp; &lt;Policy&gt;" in first
    assert "Programme &lt;0&gt;" in first
    assert "DEP&amp;0" in first
    assert "<script>" not in first
    assert "failure &lt;script&gt;" in first
    assert "#001" in first and "#025" in second
    assert "programme-00.webp" in first


def _saved_review(tmp_path: Path, *, unresolved: bool = False) -> tuple[Path, str]:
    from app.seeders.programme_cover_concepts import load_programme_cover_concepts

    concepts = load_programme_cover_concepts("SOL")
    workspace = tmp_path / SCHOOL_COVER_SCOPES["SOL"].slug
    manifest = create_manifest(SCHOOL_COVER_SCOPES["SOL"], concepts)
    for index, concept in enumerate(concepts):
        path = workspace / "review" / concept.filename
        _webp(path, ("testsrc", "gradients")[index])
        item = transition_item(
            manifest.items[concept.slug],
            ReviewStatus.GENERATED,
            candidate_path=f"generated/{concept.slug}/attempt-1.webp",
            sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
            attempt=1,
        )
        if not (unresolved and index == 1):
            item = transition_item(item, ReviewStatus.ORCHESTRATOR_REVIEW)
        manifest.items[concept.slug] = item
    save_manifest_atomic(workspace / "manifest.json", manifest)
    return workspace, concepts[0].slug


def test_cli_help_lists_six_review_commands(capsys: pytest.CaptureFixture[str]) -> None:
    with pytest.raises(SystemExit) as raised:
        main(["--help"])

    assert raised.value.code == 0
    output = capsys.readouterr().out
    assert all(command in output for command in (
        "init", "validate", "contact-sheet", "approve", "reject", "status"
    ))


def test_all_passing_approval_refuses_unresolved_items(tmp_path: Path) -> None:
    workspace, _ = _saved_review(tmp_path, unresolved=True)

    with pytest.raises(ValueError, match="unresolved"):
        main(["approve", "--root", str(tmp_path), "--school", "SOL", "--all-passing"])

    manifest = load_manifest(workspace / "manifest.json")
    assert ReviewStatus.HUMAN_APPROVED not in {item.status for item in manifest.items.values()}


def test_slug_approval_transitions_one_passing_item_and_copies_asset(tmp_path: Path) -> None:
    workspace, slug = _saved_review(tmp_path)

    assert main([
        "approve", "--root", str(tmp_path), "--school", "SOL", "--slug", slug
    ]) == 0

    manifest = load_manifest(workspace / "manifest.json")
    assert manifest.items[slug].status is ReviewStatus.HUMAN_APPROVED
    assert sum(item.status is ReviewStatus.HUMAN_APPROVED for item in manifest.items.values()) == 1
    assert (workspace / "approved" / f"{slug}.webp").is_file()
