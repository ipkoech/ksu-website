#!/usr/bin/env python3
"""Re-extract the student life stories from the source Word documents.

The originals live outside the repository (the Corporate Communication folder);
this script turns them into ``services/main/app/seeders/assets/student_life_stories.json``.

The earlier extraction kept only the text of each paragraph, so a section
heading and a body paragraph arrived indistinguishable and the published pages
rendered a document's structure as one flat run of prose. This version records
what each block *is* — heading, list item or paragraph — so the pages can be set
the way the documents are written.

Usage:
    python3 scripts/extract_student_life_stories.py [SOURCE_DIR]

Nothing is invented here: every block's text is carried through verbatim.
"""

from __future__ import annotations

import html
import json
import re
import sys
import unicodedata
import zipfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
ASSET_PATH = (
    REPO_ROOT / "services" / "main" / "app" / "seeders" / "assets" / "student_life_stories.json"
)
DEFAULT_SOURCE = Path("/home/egric/WP/student-life")
# Where the seeder looks for each story's photography. The documents carry their
# own images; these are written out so the published pages can use them instead
# of falling back to a handful of shared stock shots.
UPLOADS_ROOT = REPO_ROOT / "services" / "main" / "uploads" / "seed" / "student-life"
# Word keeps inline icons and rules in the same folder as photographs; anything
# this small is furniture, not a picture of anything.
MIN_IMAGE_BYTES = 40_000

# Source document filename (without suffix) -> story slug. The slugs are the
# published URLs and are already referenced by STUDENT_LIFE_STORY_SPECS, so they
# are matched explicitly rather than derived from the filenames, which vary.
DOCUMENT_SLUGS: dict[str, str] = {
    "Celebrating Culture, Unity and Identity at the 11th Kisii University Cultural Festival": "cultural-festival-11th",
    "Celebrating Excellence Beyond the Classroom Kisii University Honors Its Top Achievers": "top-achievers-dinner",
    "Empowering Student Life Kisii University’s Vibrant Semester of Growth and Achievement": "empowering-student-life",
    "From Students to Lifesavers How St. John Ambulance Kisii University Division is Transforming Lives Through Service": "st-john-lifesavers",
    "Honouring Service and Leadership Kisii University Joins the 95th St. John Ambulance Annual Parade Inspection": "st-john-95th-parade",
    "KISII UNIVERSITY’S INNAUGURAL INNOVATION WEEK CO-CREATING A SUSTAINABLE FUTURE": "innovation-week",
    "Kisii University Crowned Best University Tax Club in National Recognition": "best-tax-club-award",
    "Kisii University Human Resources Students": "hr-students-summit",
    "Kisii University Tax Society Wins National Recognition for Advancing Tax Literacy and Civic Responsibility": "tax-society-recognition",
    "Shaping Futures How Kisii University is Empowering Students Through Career Guidance and Professional Development": "career-guidance",
}

_PARAGRAPH_RE = re.compile(r"<w:p[ >].*?</w:p>", re.S)
_TEXT_RE = re.compile(r"<w:t[^>]*>(.*?)</w:t>", re.S)
_STYLE_RE = re.compile(r'<w:pStyle w:val="([^"]+)"')


def _block_text(paragraph_xml: str) -> str:
    """The visible text of one ``w:p``, with tabs and breaks as spaces."""
    text = html.unescape("".join(_TEXT_RE.findall(paragraph_xml)))
    text = text.replace(" ", " ")
    return " ".join(text.split())


def _looks_like_heading(text: str, style: str, is_bold: bool) -> bool:
    """Whether a block is a section heading rather than body prose.

    Word's own heading styles are authoritative. Where an author instead set a
    short bold line with no closing punctuation — which is how most of these
    documents mark their sections — that is treated as a heading too.
    """
    if style.lower().startswith("heading") or style in {"Title", "Subtitle"}:
        return True
    if not is_bold or len(text) > 90:
        return False
    # Body sentences end in punctuation; headings generally do not.
    return not text.endswith((".", "!", "?", ":", ";", ","))


def _extract_images(archive: zipfile.ZipFile, slug: str) -> list[str]:
    """Write a document's embedded photographs out for the seeder.

    Word stores them in ``word/media`` in document order, which is the order the
    author placed them, so ``image1`` is the one that belongs at the top of the
    story. Files are written only when missing or changed, so re-running the
    script does not churn the upload directory.
    """
    names = sorted(
        (n for n in archive.namelist() if n.startswith("word/media/")),
        key=lambda n: (len(n), n),
    )
    written: list[str] = []
    target_dir = UPLOADS_ROOT / slug
    index = 0
    for name in names:
        info = archive.getinfo(name)
        if info.file_size < MIN_IMAGE_BYTES:
            continue
        suffix = Path(name).suffix.lower()
        if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        index += 1
        out_name = f"image{index}{'.jpg' if suffix == '.jpeg' else suffix}"
        out_path = target_dir / out_name
        payload = archive.read(name)
        if not out_path.exists() or out_path.read_bytes() != payload:
            target_dir.mkdir(parents=True, exist_ok=True)
            out_path.write_bytes(payload)
        written.append(f"seed/student-life/{slug}/{out_name}")
    return written


def extract(path: Path, slug: str) -> dict[str, object]:
    archive = zipfile.ZipFile(path)
    xml = archive.read("word/document.xml").decode("utf-8", "replace")
    images = _extract_images(archive, slug)

    blocks: list[dict[str, str]] = []
    for match in _PARAGRAPH_RE.finditer(xml):
        chunk = match.group(0)
        text = _block_text(chunk)
        if not text:
            continue
        style_match = _STYLE_RE.search(chunk)
        style = style_match.group(1) if style_match else ""
        # A run-level <w:b/> anywhere in the paragraph marks it bold enough to
        # be a heading candidate; Word emits it per run, not per paragraph.
        is_bold = "<w:b/>" in chunk or "<w:b " in chunk
        is_list = "<w:numPr>" in chunk

        if is_list:
            kind = "list_item"
        elif _looks_like_heading(text, style, is_bold):
            kind = "heading"
        else:
            kind = "paragraph"
        blocks.append({"type": kind, "text": text})

    if not blocks:
        raise ValueError(f"No text found in {path.name}")

    # The first block is the document's own title line.
    title = _title_case(blocks[0]["text"])
    body = blocks[1:]

    # A leading heading that merely repeats the title adds nothing on a page
    # that already prints the title in its header.
    if body and body[0]["type"] == "heading" and _same_text(body[0]["text"], title):
        body = body[1:]

    return {
        "title": title,
        "blocks": body,
        # Storage paths for the document's own photographs, in document order.
        "images": images,
        # Retained so anything still reading the old shape keeps working.
        "paragraphs": [b["text"] for b in body],
        "words": sum(len(b["text"].split()) for b in body),
    }


# Words that keep their capitals when an all-caps headline is recased.
_KEEP_UPPER = {"ksu", "kusa", "ksusa", "st", "hr", "ai", "iot", "kenia", "aicad"}
# Small words that stay lowercase inside a title.
_MINOR = {"a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or",
          "the", "to", "with"}


def _title_case(text: str) -> str:
    """Recase a headline that was typed in all capitals.

    One of the source documents sets its title in caps, which reads as shouting
    at display size. Mixed-case titles are left exactly as the author wrote
    them; only a fully upper-case line is touched.
    """
    if text != text.upper() or len(text) < 12:
        return text

    words = text.split(" ")
    out: list[str] = []
    for index, word in enumerate(words):
        bare = re.sub(r"[^A-Za-z]", "", word).lower()
        if bare in _KEEP_UPPER:
            out.append(word)
        elif index > 0 and bare in _MINOR and not words[index - 1].endswith(":"):
            out.append(word.lower())
        else:
            # Capitalise the first letter of each hyphen- or apostrophe-joined
            # part, so "CO-CREATING" reads "Co-Creating" and "UNIVERSITY’S"
            # keeps its lowercase possessive.
            lowered = word.lower()
            out.append(
                re.sub(
                    r"(^|[-])([a-z])",
                    lambda m: m.group(1) + m.group(2).upper(),
                    lowered,
                )
            )
    return " ".join(out)


def _same_text(first: str, second: str) -> bool:
    def norm(value: str) -> str:
        value = unicodedata.normalize("NFKD", value).casefold()
        return re.sub(r"[^a-z0-9]+", "", value)

    return norm(first) == norm(second)


def main() -> int:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SOURCE
    if not source.is_dir():
        print(f"Source directory not found: {source}", file=sys.stderr)
        return 1

    stories: dict[str, object] = {}
    missing: list[str] = []
    for stem, slug in DOCUMENT_SLUGS.items():
        path = source / f"{stem}.docx"
        if not path.exists():
            missing.append(path.name)
            continue
        stories[slug] = extract(path, slug)

    if missing:
        print("Missing source documents:", file=sys.stderr)
        for name in missing:
            print(f"  {name}", file=sys.stderr)
        return 1

    ASSET_PATH.write_text(
        json.dumps(stories, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    for slug, record in stories.items():
        blocks = record["blocks"]  # type: ignore[index]
        kinds = {"heading": 0, "list_item": 0, "paragraph": 0}
        for block in blocks:  # type: ignore[union-attr]
            kinds[block["type"]] += 1
        print(
            f"{slug:28} blocks={len(blocks):4}"  # type: ignore[arg-type]
            f"  headings={kinds['heading']:3}"
            f"  lists={kinds['list_item']:3}"
            f"  paragraphs={kinds['paragraph']:4}"
            f"  images={len(record['images']):3}"  # type: ignore[arg-type]
            f"  words={record['words']}"  # type: ignore[index]
        )
    print(f"\nWrote {ASSET_PATH.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
