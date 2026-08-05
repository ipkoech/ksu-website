"""Command-line review workflow for programme cover batches."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path
from tempfile import NamedTemporaryFile

from .programme_cover_concepts import load_programme_cover_concepts
from .programme_cover_contact_sheet import render_contact_sheets
from .programme_cover_quality import probe_image, validate_school_review
from .programme_cover_review import (
    ReviewStatus,
    create_manifest,
    load_manifest,
    review_workspace,
    save_manifest_atomic,
    transition_item,
)
from .programme_cover_schools import SCHOOL_COVER_SCOPES


DEFAULT_ROOT = Path("tmp/programme-covers")
WORKSPACE_DIRS = ("generated", "review", "approved", "rejected", "contact-sheets", "reports")


def _workspace(args: argparse.Namespace) -> Path:
    return review_workspace(Path(args.root), args.school)


def _load(args: argparse.Namespace):
    workspace = _workspace(args)
    return workspace, load_manifest(workspace / "manifest.json")


def _copy_atomic(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary_path: Path | None = None
    try:
        with NamedTemporaryFile(dir=destination.parent, prefix=f".{destination.name}.", delete=False) as temporary:
            temporary_path = Path(temporary.name)
            with source.open("rb") as source_file:
                shutil.copyfileobj(source_file, temporary)
        temporary_path.replace(destination)
    finally:
        if temporary_path is not None and temporary_path.exists():
            temporary_path.unlink()


def _assert_passing_item(workspace: Path, manifest, slug: str) -> Path:
    try:
        item = manifest.items[slug]
    except KeyError as exc:
        raise ValueError(f"Unknown programme slug: {slug}") from exc
    if item.status is not ReviewStatus.ORCHESTRATOR_REVIEW:
        raise ValueError(f"{slug} is not a passing orchestrator_review item")
    path = workspace / "review" / f"{slug}.webp"
    if not path.is_file():
        raise ValueError(f"Passing review asset is missing for {slug}")
    signature = path.read_bytes()[:12]
    if len(signature) != 12 or signature[:4] != b"RIFF" or signature[8:] != b"WEBP":
        raise ValueError(f"Passing review asset has an invalid WebP signature for {slug}")
    probe = probe_image(path)
    if (probe.codec_name, probe.width, probe.height) != ("webp", 1200, 675):
        raise ValueError(f"Passing review asset has invalid media properties for {slug}")
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if item.sha256 != digest:
        raise ValueError(f"Passing review asset SHA-256 disagrees with metadata for {slug}")
    return path


def _init(args: argparse.Namespace) -> int:
    code = args.school.upper()
    scope = SCHOOL_COVER_SCOPES[code]
    workspace = _workspace(args)
    manifest_path = workspace / "manifest.json"
    if manifest_path.exists():
        raise ValueError(f"Review manifest already exists: {manifest_path}")
    for directory in WORKSPACE_DIRS:
        (workspace / directory).mkdir(parents=True, exist_ok=True)
    save_manifest_atomic(manifest_path, create_manifest(scope, load_programme_cover_concepts(code)))
    print(manifest_path)
    return 0


def _validate(args: argparse.Namespace) -> int:
    workspace, manifest = _load(args)
    report = validate_school_review(
        workspace,
        manifest,
        load_programme_cover_concepts(args.school),
        phase=args.phase,
    )
    print(report.report_path)
    if not report.passed:
        raise ValueError(f"Validation failed with {len(report.errors)} error(s)")
    return 0


def _contact_sheet(args: argparse.Namespace) -> int:
    workspace, manifest = _load(args)
    for path in render_contact_sheets(workspace, manifest):
        print(path)
    return 0


def _approve(args: argparse.Namespace) -> int:
    workspace, manifest = _load(args)
    if args.all_passing:
        unresolved = sorted(
            slug
            for slug, item in manifest.items.items()
            if item.status is not ReviewStatus.ORCHESTRATOR_REVIEW
        )
        if unresolved:
            raise ValueError(f"Cannot approve school with unresolved or rejected items: {unresolved}")
        report = validate_school_review(
            workspace,
            manifest,
            load_programme_cover_concepts(args.school),
        )
        if not report.passed:
            raise ValueError(f"Cannot approve school: validation has {len(report.errors)} error(s)")
        slugs = list(manifest.items)
    else:
        slugs = [args.slug]

    sources = {slug: _assert_passing_item(workspace, manifest, slug) for slug in slugs}
    for slug, source in sources.items():
        _copy_atomic(source, workspace / "approved" / f"{slug}.webp")
        manifest.items[slug] = transition_item(
            manifest.items[slug],
            ReviewStatus.HUMAN_APPROVED,
            note="approved through programme cover review CLI",
        )
    save_manifest_atomic(workspace / "manifest.json", manifest)
    print(f"Approved {len(slugs)} programme cover(s)")
    return 0


def _reject(args: argparse.Namespace) -> int:
    if not args.note.strip():
        raise ValueError("Rejection requires a non-empty note")
    workspace, manifest = _load(args)
    source = _assert_passing_item(workspace, manifest, args.slug)
    _copy_atomic(source, workspace / "rejected" / f"{args.slug}.webp")
    manifest.items[args.slug] = transition_item(
        manifest.items[args.slug], ReviewStatus.HUMAN_REJECTED, note=args.note
    )
    save_manifest_atomic(workspace / "manifest.json", manifest)
    print(f"Rejected {args.slug}")
    return 0


def _status(args: argparse.Namespace) -> int:
    _, manifest = _load(args)
    counts: dict[str, int] = {}
    for item in manifest.items.values():
        counts[item.status.value] = counts.get(item.status.value, 0) + 1
    print(json.dumps({"school": manifest.school_code, "statuses": counts}, sort_keys=True))
    return 0


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    def command(name: str, handler):
        child = subparsers.add_parser(name)
        child.add_argument("--root", type=Path, default=DEFAULT_ROOT)
        child.add_argument("--school", required=True, choices=sorted(SCHOOL_COVER_SCOPES))
        child.set_defaults(handler=handler)
        return child

    command("init", _init)
    validate = command("validate", _validate)
    validate.add_argument("--phase", choices=("review", "approved"), default="review")
    command("contact-sheet", _contact_sheet)
    approve = command("approve", _approve)
    approval = approve.add_mutually_exclusive_group(required=True)
    approval.add_argument("--slug")
    approval.add_argument("--all-passing", action="store_true")
    reject = command("reject", _reject)
    reject.add_argument("--slug", required=True)
    reject.add_argument("--note", required=True)
    command("status", _status)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    return args.handler(args)


if __name__ == "__main__":
    raise SystemExit(main())
