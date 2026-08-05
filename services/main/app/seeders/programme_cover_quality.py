"""Deterministic quality checks for programme cover review batches."""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter
from dataclasses import asdict, dataclass
from pathlib import Path

from .programme_cover_concepts import ProgrammeCoverConcept
from .programme_cover_review import ReviewStatus, SchoolReviewManifest


@dataclass(frozen=True, slots=True)
class ImageProbe:
    codec_name: str
    width: int
    height: int


@dataclass(frozen=True, slots=True)
class SimilarityMatch:
    left_slug: str
    right_slug: str
    distance: int


@dataclass(frozen=True, slots=True)
class QualityReport:
    school_code: str
    phase: str
    checked_files: int
    errors: tuple[str, ...]
    similarities: tuple[SimilarityMatch, ...]
    report_path: Path

    @property
    def passed(self) -> bool:
        return not self.errors


def _run_media_command(command: list[str], *, operation: str) -> bytes:
    try:
        result = subprocess.run(command, check=True, capture_output=True)
    except FileNotFoundError as exc:
        raise ValueError(f"Cannot {operation}: {command[0]} is not installed") from exc
    except subprocess.CalledProcessError as exc:
        detail = exc.stderr.decode("utf-8", errors="replace").strip()
        suffix = f": {detail}" if detail else ""
        raise ValueError(f"Cannot {operation}{suffix}") from exc
    return result.stdout


def probe_image(path: Path) -> ImageProbe:
    """Read the first video stream's codec and dimensions through ffprobe."""

    path = Path(path)
    output = _run_media_command(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=codec_name,width,height",
            "-of",
            "json",
            str(path),
        ],
        operation=f"probe image {path}",
    )
    try:
        streams = json.loads(output)["streams"]
        stream = streams[0]
        return ImageProbe(
            codec_name=str(stream["codec_name"]),
            width=int(stream["width"]),
            height=int(stream["height"]),
        )
    except (IndexError, KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        raise ValueError(f"Cannot probe image {path}: ffprobe returned incomplete JSON") from exc


def difference_hash(path: Path) -> int:
    """Return the 64-bit adjacent-pixel difference hash for an image."""

    path = Path(path)
    pixels = _run_media_command(
        [
            "ffmpeg",
            "-v",
            "error",
            "-i",
            str(path),
            "-vf",
            "scale=9:8,format=gray",
            "-frames:v",
            "1",
            "-f",
            "rawvideo",
            "-",
        ],
        operation=f"hash image {path}",
    )
    if len(pixels) != 72:
        raise ValueError(
            f"Cannot hash image {path}: ffmpeg returned {len(pixels)} grayscale bytes, expected 72"
        )
    value = 0
    for row in range(8):
        offset = row * 9
        for column in range(8):
            value = (value << 1) | int(pixels[offset + column] > pixels[offset + column + 1])
    return value


def hamming_distance(left: int, right: int) -> int:
    """Count differing bits in two non-negative perceptual hashes."""

    if left < 0 or right < 0:
        raise ValueError("Perceptual hashes must be non-negative integers")
    return (left ^ right).bit_count()


def _has_webp_signature(path: Path) -> bool:
    signature = path.read_bytes()[:12]
    return len(signature) == 12 and signature[:4] == b"RIFF" and signature[8:] == b"WEBP"


def _metadata_errors(
    manifest: SchoolReviewManifest,
    concepts: tuple[ProgrammeCoverConcept, ...],
) -> list[str]:
    errors: list[str] = []
    concept_slugs = [concept.slug for concept in concepts]
    duplicates = sorted(slug for slug, count in Counter(concept_slugs).items() if count > 1)
    if duplicates:
        errors.append(f"Duplicate concept slugs: {duplicates}")
    expected = set(concept_slugs)
    actual = set(manifest.items)
    if missing := sorted(expected - actual):
        errors.append(f"Manifest is missing programmes: {missing}")
    if unexpected := sorted(actual - expected):
        errors.append(f"Manifest has unexpected programmes: {unexpected}")

    for concept in concepts:
        values = {
            "programme name": concept.programme_name,
            "department": concept.department_code,
            "visual family": concept.visual_family,
            "subject": concept.subject,
            "alternative text": concept.alt_text,
            "distinctiveness": concept.distinctiveness,
        }
        missing_fields = sorted(name for name, value in values.items() if not value.strip())
        if missing_fields:
            errors.append(f"{concept.slug} has incomplete concept metadata: {missing_fields}")
        item = manifest.items.get(concept.slug)
        if item is None:
            continue
        if item.programme_slug != concept.slug or item.programme_name != concept.programme_name:
            errors.append(f"{concept.slug} manifest metadata disagrees with its concept")
        if item.department_code != concept.department_code:
            errors.append(f"{concept.slug} department metadata disagrees with its concept")
        if not item.candidate_path or not item.sha256 or item.attempt < 1:
            errors.append(f"{concept.slug} has incomplete candidate metadata")
        if not item.candidate_attempts:
            errors.append(f"{concept.slug} has incomplete candidate attempt metadata")
        elif (
            item.candidate_attempts[-1].attempt != item.attempt
            or item.candidate_attempts[-1].sha256 != item.sha256
        ):
            errors.append(f"{concept.slug} current metadata disagrees with its candidate attempt history")
        if item.status is ReviewStatus.PLANNED:
            errors.append(f"{concept.slug} is unresolved with status planned")
    return errors


def validate_school_review(
    workspace: Path,
    manifest: SchoolReviewManifest,
    concepts: tuple[ProgrammeCoverConcept, ...],
    *,
    phase: str = "review",
    similarity_threshold: int = 8,
    report_path: Path | None = None,
) -> QualityReport:
    """Validate one phase as an exact school batch and persist its JSON report."""

    if phase not in {"review", "approved"}:
        raise ValueError("Quality phase must be 'review' or 'approved'")
    if similarity_threshold < 1:
        raise ValueError("Similarity threshold must be positive")
    workspace = Path(workspace)
    asset_dir = workspace / phase
    errors = _metadata_errors(manifest, concepts)
    expected_names = {concept.filename for concept in concepts}
    actual_names = {entry.name for entry in asset_dir.iterdir()} if asset_dir.is_dir() else set()
    if missing := sorted(expected_names - actual_names):
        errors.append(f"{phase} files missing: {missing}")
    if unexpected := sorted(actual_names - expected_names):
        errors.append(f"{phase} contains unexpected files: {unexpected}")

    hashes_by_slug: dict[str, str] = {}
    perceptual_hashes: dict[str, int] = {}
    for concept in concepts:
        path = asset_dir / concept.filename
        if not path.is_file():
            continue
        if not _has_webp_signature(path):
            errors.append(f"{concept.slug} has an invalid WebP signature")
            continue
        try:
            probe = probe_image(path)
        except ValueError as exc:
            errors.append(str(exc))
            continue
        if probe.codec_name != "webp":
            errors.append(f"{concept.slug} codec is {probe.codec_name}, expected webp")
        if (probe.width, probe.height) != (1200, 675):
            errors.append(
                f"{concept.slug} dimensions are {probe.width}x{probe.height}, expected 1200x675"
            )
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        hashes_by_slug[concept.slug] = digest
        item = manifest.items.get(concept.slug)
        if item is not None and item.sha256 and item.sha256 != digest:
            errors.append(f"{concept.slug} SHA-256 does not match manifest metadata")
        try:
            perceptual_hashes[concept.slug] = difference_hash(path)
        except ValueError as exc:
            errors.append(str(exc))

    digest_groups: dict[str, list[str]] = {}
    for slug, digest in hashes_by_slug.items():
        digest_groups.setdefault(digest, []).append(slug)
    for slugs in digest_groups.values():
        if len(slugs) > 1:
            errors.append(f"duplicate SHA-256 shared by programmes: {sorted(slugs)}")

    similarities: list[SimilarityMatch] = []
    slugs = sorted(perceptual_hashes)
    for left_index, left_slug in enumerate(slugs):
        for right_slug in slugs[left_index + 1 :]:
            distance = hamming_distance(
                perceptual_hashes[left_slug], perceptual_hashes[right_slug]
            )
            if distance < similarity_threshold:
                similarities.append(SimilarityMatch(left_slug, right_slug, distance))
                errors.append(
                    f"Perceptual distance {distance} below {similarity_threshold}: "
                    f"{left_slug} and {right_slug}"
                )

    output_path = Path(report_path) if report_path else workspace / "reports" / f"{phase}-quality.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    report = QualityReport(
        school_code=manifest.school_code,
        phase=phase,
        checked_files=len(hashes_by_slug),
        errors=tuple(errors),
        similarities=tuple(similarities),
        report_path=output_path,
    )
    payload = {
        "school_code": report.school_code,
        "phase": report.phase,
        "passed": report.passed,
        "checked_files": report.checked_files,
        "error_count": len(report.errors),
        "errors": list(report.errors),
        "similarities": [asdict(match) for match in report.similarities],
    }
    output_path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return report
