"""Persistent review state for programme cover generation."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, replace
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path, PurePath
from tempfile import NamedTemporaryFile

from .programme_cover_concepts import ProgrammeCoverConcept
from .programme_cover_schools import SCHOOL_COVER_SCOPES, SchoolCoverScope


MANIFEST_VERSION = 1


class ReviewStatus(str, Enum):
    PLANNED = "planned"
    GENERATED = "generated"
    ORCHESTRATOR_REVIEW = "orchestrator_review"
    NEEDS_REGENERATION = "needs_regeneration"
    NEEDS_MANUAL_REVIEW = "needs_manual_review"
    HUMAN_REJECTED = "human_rejected"
    HUMAN_APPROVED = "human_approved"
    PUBLISHED = "published"


ALLOWED_TRANSITIONS = {
    ReviewStatus.PLANNED: {ReviewStatus.GENERATED},
    ReviewStatus.GENERATED: {
        ReviewStatus.ORCHESTRATOR_REVIEW,
        ReviewStatus.NEEDS_REGENERATION,
    },
    ReviewStatus.ORCHESTRATOR_REVIEW: {
        ReviewStatus.HUMAN_APPROVED,
        ReviewStatus.HUMAN_REJECTED,
        ReviewStatus.NEEDS_REGENERATION,
    },
    ReviewStatus.NEEDS_REGENERATION: {
        ReviewStatus.GENERATED,
        ReviewStatus.NEEDS_MANUAL_REVIEW,
    },
    ReviewStatus.NEEDS_MANUAL_REVIEW: {ReviewStatus.GENERATED},
    ReviewStatus.HUMAN_REJECTED: {ReviewStatus.GENERATED},
    ReviewStatus.HUMAN_APPROVED: {ReviewStatus.PUBLISHED},
    ReviewStatus.PUBLISHED: set(),
}


@dataclass(frozen=True, slots=True)
class ReviewEvent:
    from_status: ReviewStatus
    to_status: ReviewStatus
    timestamp: str
    note: str = ""


@dataclass(frozen=True, slots=True)
class ReviewItem:
    programme_slug: str
    programme_name: str
    department_code: str
    status: ReviewStatus = ReviewStatus.PLANNED
    candidate_path: str | None = None
    sha256: str | None = None
    attempt: int = 0
    automatic_regenerations: int = 0
    review_notes: tuple[str, ...] = ()
    events: tuple[ReviewEvent, ...] = ()


@dataclass(slots=True)
class SchoolReviewManifest:
    version: int
    school_code: str
    school_slug: str
    school_name: str
    created_at: str
    updated_at: str
    items: dict[str, ReviewItem]


def _utc_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def review_workspace(root: Path, school_code: str) -> Path:
    """Return the isolated workspace path for one canonical school."""

    return Path(root) / SCHOOL_COVER_SCOPES[school_code.upper()].slug


def create_manifest(
    school_scope: SchoolCoverScope,
    concepts: tuple[ProgrammeCoverConcept, ...],
) -> SchoolReviewManifest:
    """Create a planned review item for every concept in a school registry."""

    items: dict[str, ReviewItem] = {}
    for concept in concepts:
        if concept.school_code != school_scope.code:
            raise ValueError(
                f"Concept {concept.slug} belongs to {concept.school_code}, not {school_scope.code}"
            )
        if concept.slug in items:
            raise ValueError(f"Duplicate programme cover concept: {concept.slug}")
        items[concept.slug] = ReviewItem(
            programme_slug=concept.slug,
            programme_name=concept.programme_name,
            department_code=concept.department_code,
        )

    timestamp = _utc_timestamp()
    return SchoolReviewManifest(
        version=MANIFEST_VERSION,
        school_code=school_scope.code,
        school_slug=school_scope.slug,
        school_name=school_scope.name,
        created_at=timestamp,
        updated_at=timestamp,
        items=items,
    )


def _validate_candidate_metadata(candidate_path: str, sha256: str, attempt: int) -> None:
    path = PurePath(candidate_path)
    if path.is_absolute() or ".." in path.parts:
        raise ValueError("Candidate paths must be relative to the school workspace")
    if not candidate_path or candidate_path.endswith("/"):
        raise ValueError("Candidate path must identify a file relative to the school workspace")
    if len(sha256) != 64 or any(character not in "0123456789abcdef" for character in sha256.lower()):
        raise ValueError("Candidate SHA-256 must be a 64-character hexadecimal digest")
    if attempt < 1:
        raise ValueError("Candidate attempt must be a positive integer")


def _append_event(
    item: ReviewItem,
    to_status: ReviewStatus,
    *,
    note: str,
    candidate_path: str | None = None,
    sha256: str | None = None,
    attempt: int | None = None,
) -> ReviewItem:
    event = ReviewEvent(
        from_status=item.status,
        to_status=to_status,
        timestamp=_utc_timestamp(),
        note=note,
    )
    notes = item.review_notes + ((note,) if note else ())
    return replace(
        item,
        status=to_status,
        candidate_path=item.candidate_path if candidate_path is None else candidate_path,
        sha256=item.sha256 if sha256 is None else sha256,
        attempt=item.attempt if attempt is None else attempt,
        review_notes=notes,
        events=item.events + (event,),
    )


def transition_item(
    item: ReviewItem,
    to_status: ReviewStatus,
    *,
    note: str = "",
    candidate_path: str | None = None,
    sha256: str | None = None,
    attempt: int | None = None,
) -> ReviewItem:
    """Return an item advanced through one legal review-state transition."""

    if to_status not in ALLOWED_TRANSITIONS[item.status]:
        raise ValueError(f"Illegal review transition: {item.status.value} -> {to_status.value}")

    metadata = (candidate_path, sha256, attempt)
    if to_status is ReviewStatus.GENERATED:
        if any(value is None for value in metadata):
            raise ValueError("Generated candidates require a path, SHA-256, and attempt number")
        assert candidate_path is not None
        assert sha256 is not None
        assert attempt is not None
        _validate_candidate_metadata(candidate_path, sha256, attempt)
        if attempt <= item.attempt:
            raise ValueError("Generated candidate attempts must increase")
    elif any(value is not None for value in metadata):
        raise ValueError("Candidate metadata can only be recorded when entering generated")

    return _append_event(
        item,
        to_status,
        note=note,
        candidate_path=candidate_path,
        sha256=sha256,
        attempt=attempt,
    )


def record_failed_candidate(
    item: ReviewItem,
    *,
    note: str,
    automatic: bool,
) -> ReviewItem:
    """Record a failed candidate while enforcing the two-regeneration limit."""

    if not note.strip():
        raise ValueError("A failed candidate requires a review note")
    if item.status is ReviewStatus.NEEDS_MANUAL_REVIEW:
        raise ValueError("Candidate is awaiting manual review and cannot be mutated automatically")
    if item.status not in {
        ReviewStatus.GENERATED,
        ReviewStatus.ORCHESTRATOR_REVIEW,
        ReviewStatus.NEEDS_REGENERATION,
    }:
        raise ValueError(f"Cannot record a failed candidate from {item.status.value}")

    if not automatic or item.automatic_regenerations >= 2:
        failed = item
        if failed.status is not ReviewStatus.NEEDS_REGENERATION:
            failed = _append_event(
                failed,
                ReviewStatus.NEEDS_REGENERATION,
                note="",
            )
        return _append_event(
            failed,
            ReviewStatus.NEEDS_MANUAL_REVIEW,
            note=note,
        )

    failed = _append_event(
        item,
        ReviewStatus.NEEDS_REGENERATION,
        note=note,
    )
    return replace(
        failed,
        automatic_regenerations=item.automatic_regenerations + 1,
    )


def _event_to_dict(event: ReviewEvent) -> dict[str, object]:
    return {
        "from_status": event.from_status.value,
        "to_status": event.to_status.value,
        "timestamp": event.timestamp,
        "note": event.note,
    }


def _item_to_dict(item: ReviewItem) -> dict[str, object]:
    return {
        "programme_slug": item.programme_slug,
        "programme_name": item.programme_name,
        "department_code": item.department_code,
        "status": item.status.value,
        "candidate_path": item.candidate_path,
        "sha256": item.sha256,
        "attempt": item.attempt,
        "automatic_regenerations": item.automatic_regenerations,
        "review_notes": list(item.review_notes),
        "events": [_event_to_dict(event) for event in item.events],
    }


def _manifest_to_dict(manifest: SchoolReviewManifest) -> dict[str, object]:
    return {
        "version": manifest.version,
        "school_code": manifest.school_code,
        "school_slug": manifest.school_slug,
        "school_name": manifest.school_name,
        "created_at": manifest.created_at,
        "updated_at": manifest.updated_at,
        "items": {slug: _item_to_dict(item) for slug, item in manifest.items.items()},
    }


def save_manifest_atomic(path: Path, manifest: SchoolReviewManifest) -> None:
    """Persist a manifest by replacing it with a complete same-directory file."""

    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    manifest.updated_at = _utc_timestamp()
    temporary_path: Path | None = None
    try:
        with NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=path.parent,
            prefix=f".{path.name}.",
            suffix=".tmp",
            delete=False,
        ) as temporary:
            temporary_path = Path(temporary.name)
            json.dump(_manifest_to_dict(manifest), temporary, indent=2, sort_keys=True)
            temporary.write("\n")
            temporary.flush()
            os.fsync(temporary.fileno())
        temporary_path.replace(path)
    finally:
        if temporary_path is not None and temporary_path.exists():
            temporary_path.unlink()


def _event_from_dict(data: dict[str, object]) -> ReviewEvent:
    return ReviewEvent(
        from_status=ReviewStatus(str(data["from_status"])),
        to_status=ReviewStatus(str(data["to_status"])),
        timestamp=str(data["timestamp"]),
        note=str(data.get("note", "")),
    )


def _item_from_dict(data: dict[str, object]) -> ReviewItem:
    raw_events = data.get("events", [])
    if not isinstance(raw_events, list):
        raise ValueError("Manifest item events must be a list")
    raw_notes = data.get("review_notes", [])
    if not isinstance(raw_notes, list):
        raise ValueError("Manifest item review notes must be a list")
    return ReviewItem(
        programme_slug=str(data["programme_slug"]),
        programme_name=str(data["programme_name"]),
        department_code=str(data["department_code"]),
        status=ReviewStatus(str(data["status"])),
        candidate_path=None if data.get("candidate_path") is None else str(data["candidate_path"]),
        sha256=None if data.get("sha256") is None else str(data["sha256"]),
        attempt=int(data.get("attempt", 0)),
        automatic_regenerations=int(data.get("automatic_regenerations", 0)),
        review_notes=tuple(str(note) for note in raw_notes),
        events=tuple(_event_from_dict(event) for event in raw_events if isinstance(event, dict)),
    )


def load_manifest(path: Path) -> SchoolReviewManifest:
    """Load a supported review manifest from disk."""

    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("Programme cover manifest must contain a JSON object")
    version = data.get("version")
    if version != MANIFEST_VERSION:
        raise ValueError(f"Unsupported programme cover manifest version {version}")
    raw_items = data.get("items")
    if not isinstance(raw_items, dict):
        raise ValueError("Programme cover manifest items must be an object")

    return SchoolReviewManifest(
        version=MANIFEST_VERSION,
        school_code=str(data["school_code"]),
        school_slug=str(data["school_slug"]),
        school_name=str(data["school_name"]),
        created_at=str(data["created_at"]),
        updated_at=str(data["updated_at"]),
        items={
            str(slug): _item_from_dict(item)
            for slug, item in raw_items.items()
            if isinstance(item, dict)
        },
    )
