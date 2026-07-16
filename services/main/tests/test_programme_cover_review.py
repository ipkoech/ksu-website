import json
from datetime import datetime
from pathlib import Path

import pytest

from app.seeders.programme_cover_concepts import load_programme_cover_concepts
from app.seeders.programme_cover_review import (
    ReviewStatus,
    SchoolReviewManifest,
    create_manifest,
    load_manifest,
    record_failed_candidate,
    review_workspace,
    save_manifest_atomic,
    transition_item,
)
from app.seeders.programme_cover_schools import SCHOOL_COVER_SCOPES


@pytest.fixture
def manifest() -> SchoolReviewManifest:
    return create_manifest(SCHOOL_COVER_SCOPES["SOL"], load_programme_cover_concepts("SOL"))


def _generated_item(manifest: SchoolReviewManifest):
    return transition_item(
        manifest.items["bachelor-of-laws"],
        ReviewStatus.GENERATED,
        note="initial candidate",
        candidate_path="generated/bachelor-of-laws/attempt-1.webp",
        sha256="a" * 64,
        attempt=1,
    )


def test_create_manifest_contains_every_school_concept(manifest: SchoolReviewManifest) -> None:
    assert manifest.version == 1
    assert manifest.school_code == "SOL"
    assert manifest.school_slug == SCHOOL_COVER_SCOPES["SOL"].slug
    assert set(manifest.items) == {"bachelor-of-laws", "diploma-in-laws"}
    assert {item.status for item in manifest.items.values()} == {ReviewStatus.PLANNED}
    assert {item.programme_name for item in manifest.items.values()} == {
        "Bachelor of Laws",
        "Diploma in Laws",
    }


def test_review_workspace_is_isolated_by_canonical_school_slug(tmp_path: Path) -> None:
    assert review_workspace(tmp_path, "sol") == tmp_path / "school-of-law"


def test_legal_review_path_appends_immutable_event_history(manifest: SchoolReviewManifest) -> None:
    item = _generated_item(manifest)
    original_events = item.events
    item = transition_item(item, ReviewStatus.ORCHESTRATOR_REVIEW, note="quality checks passed")
    item = transition_item(item, ReviewStatus.HUMAN_APPROVED, note="approved by reviewer")
    item = transition_item(item, ReviewStatus.PUBLISHED, note="school batch imported")

    assert item.status is ReviewStatus.PUBLISHED
    assert [event.to_status for event in item.events] == [
        ReviewStatus.GENERATED,
        ReviewStatus.ORCHESTRATOR_REVIEW,
        ReviewStatus.HUMAN_APPROVED,
        ReviewStatus.PUBLISHED,
    ]
    assert len(original_events) == 1
    assert item.review_notes == (
        "initial candidate",
        "quality checks passed",
        "approved by reviewer",
        "school batch imported",
    )
    for event in item.events:
        assert datetime.fromisoformat(event.timestamp).utcoffset().total_seconds() == 0


def test_generated_candidate_metadata_is_relative_and_complete(manifest: SchoolReviewManifest) -> None:
    item = _generated_item(manifest)

    assert item.candidate_path == "generated/bachelor-of-laws/attempt-1.webp"
    assert item.sha256 == "a" * 64
    assert item.attempt == 1

    with pytest.raises(ValueError, match="relative"):
        transition_item(
            manifest.items["diploma-in-laws"],
            ReviewStatus.GENERATED,
            candidate_path="/tmp/attempt-1.webp",
            sha256="b" * 64,
            attempt=1,
        )


def test_illegal_transition_from_generated_to_published_is_rejected(
    manifest: SchoolReviewManifest,
) -> None:
    with pytest.raises(ValueError, match="generated.*published"):
        transition_item(_generated_item(manifest), ReviewStatus.PUBLISHED)


def test_third_failed_candidate_requires_manual_review(manifest: SchoolReviewManifest) -> None:
    item = _generated_item(manifest)
    item = record_failed_candidate(item, note="composition", automatic=True)
    item = record_failed_candidate(item, note="accidental text", automatic=True)
    item = record_failed_candidate(item, note="malformed scales", automatic=True)

    assert item.status is ReviewStatus.NEEDS_MANUAL_REVIEW
    assert item.automatic_regenerations == 2
    assert item.review_notes[-3:] == ("composition", "accidental text", "malformed scales")

    with pytest.raises(ValueError, match="manual review"):
        record_failed_candidate(item, note="another automatic attempt", automatic=True)


def test_manual_review_cannot_be_approved_directly(manifest: SchoolReviewManifest) -> None:
    item = _generated_item(manifest)
    item = record_failed_candidate(item, note="composition", automatic=True)
    item = record_failed_candidate(item, note="accidental text", automatic=True)
    item = record_failed_candidate(item, note="malformed scales", automatic=True)

    with pytest.raises(ValueError, match="needs_manual_review.*human_approved"):
        transition_item(item, ReviewStatus.HUMAN_APPROVED)


def test_atomic_save_and_restart_preserve_manifest_state(
    tmp_path: Path,
    manifest: SchoolReviewManifest,
) -> None:
    path = tmp_path / "school-of-law" / "manifest.json"
    first_item = _generated_item(manifest)
    manifest.items[first_item.programme_slug] = first_item
    save_manifest_atomic(path, manifest)

    raw_manifest = json.loads(path.read_text(encoding="utf-8"))
    assert raw_manifest["items"]["bachelor-of-laws"]["status"] == "generated"
    assert not list(path.parent.glob("*.tmp"))

    restarted = load_manifest(path)
    restarted_item = transition_item(
        restarted.items["bachelor-of-laws"],
        ReviewStatus.ORCHESTRATOR_REVIEW,
        note="continued after restart",
    )
    restarted.items[restarted_item.programme_slug] = restarted_item
    save_manifest_atomic(path, restarted)

    reloaded = load_manifest(path)
    assert reloaded.items["bachelor-of-laws"].status is ReviewStatus.ORCHESTRATOR_REVIEW
    assert len(reloaded.items["bachelor-of-laws"].events) == 2


def test_load_manifest_rejects_unknown_versions(tmp_path: Path) -> None:
    path = tmp_path / "manifest.json"
    path.write_text('{"version": 999}', encoding="utf-8")

    with pytest.raises(ValueError, match="manifest version 999"):
        load_manifest(path)
