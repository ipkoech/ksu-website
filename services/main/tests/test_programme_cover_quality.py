import hashlib
import json
import subprocess
from dataclasses import replace
from pathlib import Path

import pytest

from app.seeders.programme_cover_concepts import ProgrammeCoverConcept, load_programme_cover_concepts
from app.seeders.programme_cover_quality import (
    difference_hash,
    hamming_distance,
    probe_image,
    validate_school_review,
)
from app.seeders.programme_cover_review import (
    ReviewStatus,
    create_manifest,
    transition_item,
)
from app.seeders.programme_cover_schools import SCHOOL_COVER_SCOPES


def _webp(path: Path, source: str, size: str = "1200x675") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg",
            "-loglevel",
            "error",
            "-f",
            "lavfi",
            "-i",
            f"{source}=s={size}",
            "-frames:v",
            "1",
            "-y",
            str(path),
        ],
        check=True,
    )


def _solid_webp(path: Path, color: str, size: str = "1200x675") -> None:
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


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _passing_workspace(tmp_path: Path):
    concepts = load_programme_cover_concepts("SOL")
    manifest = create_manifest(SCHOOL_COVER_SCOPES["SOL"], concepts)
    sources = ("testsrc", "gradients")
    for concept, source in zip(concepts, sources, strict=True):
        path = tmp_path / "review" / concept.filename
        _webp(path, source)
        manifest.items[concept.slug] = transition_item(
            manifest.items[concept.slug],
            ReviewStatus.GENERATED,
            candidate_path=f"generated/{concept.slug}/attempt-1.webp",
            sha256=_sha256(path),
            attempt=1,
        )
    return manifest, concepts


def test_probe_and_hash_report_expected_webp_properties(tmp_path: Path) -> None:
    path = tmp_path / "cover.webp"
    _webp(path, "testsrc")

    probe = probe_image(path)

    assert (probe.codec_name, probe.width, probe.height) == ("webp", 1200, 675)
    assert 0 <= difference_hash(path) < 2**64
    assert hamming_distance(0b1010, 0b0011) == 2


@pytest.mark.parametrize(
    ("mutation", "message"),
    [
        ("wrong_dimensions", "1200x675"),
        ("corrupt_signature", "WebP signature"),
        ("missing_file", "missing"),
        ("unexpected_file", "unexpected"),
        ("incomplete_metadata", "metadata"),
    ],
)
def test_validation_rejects_deterministic_batch_errors(
    tmp_path: Path,
    mutation: str,
    message: str,
) -> None:
    manifest, concepts = _passing_workspace(tmp_path)
    first = concepts[0]
    first_path = tmp_path / "review" / first.filename
    if mutation == "wrong_dimensions":
        _webp(first_path, "testsrc", "800x450")
    elif mutation == "corrupt_signature":
        first_path.write_bytes(b"not-a-webp")
    elif mutation == "missing_file":
        first_path.unlink()
    elif mutation == "unexpected_file":
        _webp(tmp_path / "review" / "unexpected.webp", "testsrc")
    elif mutation == "incomplete_metadata":
        manifest.items[first.slug] = replace(manifest.items[first.slug], sha256=None)

    report = validate_school_review(tmp_path, manifest, concepts)

    assert not report.passed
    assert message.lower() in "\n".join(report.errors).lower()


def test_validation_reports_duplicate_sha256_and_all_near_duplicate_pairs(tmp_path: Path) -> None:
    manifest, concepts = _passing_workspace(tmp_path)
    first_path = tmp_path / "review" / concepts[0].filename
    second_path = tmp_path / "review" / concepts[1].filename
    second_path.write_bytes(first_path.read_bytes())
    manifest.items[concepts[1].slug] = replace(
        manifest.items[concepts[1].slug],
        sha256=_sha256(second_path),
    )

    report = validate_school_review(tmp_path, manifest, concepts)

    assert any("duplicate SHA-256" in error for error in report.errors)
    assert len(report.similarities) == 1
    assert report.similarities[0].distance == 0


def test_validation_reports_perceptual_distance_below_eight(tmp_path: Path) -> None:
    manifest, concepts = _passing_workspace(tmp_path)
    for concept, color in zip(concepts, ("black", "navy"), strict=True):
        path = tmp_path / "review" / concept.filename
        _solid_webp(path, color)
        manifest.items[concept.slug] = replace(
            manifest.items[concept.slug],
            sha256=_sha256(path),
        )

    report = validate_school_review(tmp_path, manifest, concepts)

    assert report.similarities
    assert report.similarities[0].distance < 8
    assert any("perceptual" in error.lower() for error in report.errors)


def test_validation_reports_every_pair_among_three_similar_candidates_without_deleting(
    tmp_path: Path,
) -> None:
    concepts = tuple(
        ProgrammeCoverConcept(
            school_code="SOL",
            programme_name=f"Similar Programme {index}",
            department_code="LAW",
            visual_family="legal research",
            subject=f"Distinct valid subject {index}",
            alt_text=f"Academic legal illustration {index}",
            distinctiveness=f"Distinct arrangement {index}",
        )
        for index in range(1, 4)
    )
    manifest = create_manifest(SCHOOL_COVER_SCOPES["SOL"], concepts)
    paths: list[Path] = []
    for concept in concepts:
        path = tmp_path / "review" / concept.filename
        _webp(path, "testsrc")
        paths.append(path)
        manifest.items[concept.slug] = transition_item(
            manifest.items[concept.slug],
            ReviewStatus.GENERATED,
            candidate_path=f"generated/{concept.slug}/attempt-1.webp",
            sha256=_sha256(path),
            attempt=1,
        )

    report = validate_school_review(tmp_path, manifest, concepts)

    assert {
        frozenset((match.left_slug, match.right_slug)) for match in report.similarities
    } == {
        frozenset((concepts[0].slug, concepts[1].slug)),
        frozenset((concepts[0].slug, concepts[2].slug)),
        frozenset((concepts[1].slug, concepts[2].slug)),
    }
    assert all(path.is_file() for path in paths)


def test_passing_batch_writes_json_report_with_zero_errors(tmp_path: Path) -> None:
    manifest, concepts = _passing_workspace(tmp_path)

    report = validate_school_review(tmp_path, manifest, concepts)

    assert report.passed
    assert report.errors == ()
    data = json.loads(report.report_path.read_text(encoding="utf-8"))
    assert data["passed"] is True
    assert data["error_count"] == 0
    assert data["errors"] == []
