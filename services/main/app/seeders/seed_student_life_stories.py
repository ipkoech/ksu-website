"""Seed student life stories from the official Student Life editorial collection.

Story bodies come verbatim from the Corporate Communication documents
(assets/student_life_stories.json); cover and gallery images live under
uploads/seed/student-life/<slug>/.
"""

from __future__ import annotations

import hashlib
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Media, Story

from ._shared import SeedContext


SEED_OWNER = "student-life-stories-v1"
# 2: bodies carry the source documents' headings and lists, not flat paragraphs.
SEED_VERSION = 2

_ASSET_FILE = Path(__file__).parent / "assets" / "student_life_stories.json"
_UPLOADS_ROOT = Path(__file__).resolve().parents[2] / "uploads"

# slug -> (category, story_type, cover storage path, homepage_priority)
STUDENT_LIFE_STORY_SPECS: dict[str, dict[str, Any]] = {
    "empowering-student-life": {
        "category": "Student Life",
        "story_type": "student",
        "cover": "seed/student-life/empowering-student-life/image1.jpg",
        "priority": 50,
    },
    "cultural-festival-11th": {
        "category": "Art & Culture",
        "story_type": "culture",
        "cover": "seed/student-life/cultural-festival-11th/image1.jpg",
        "priority": 60,
    },
    "career-guidance": {
        "category": "Careers",
        "story_type": "student",
        "cover": "seed/student-life/career-guidance/image1.jpg",
        "priority": 70,
    },
    "hr-students-summit": {
        "category": "Careers",
        "story_type": "student",
        "cover": "seed/student-life/hr-students-summit/image2.jpg",
        "priority": 80,
    },
    "st-john-lifesavers": {
        "category": "Student Health",
        "story_type": "community",
        "cover": "seed/student-life/st-john-95th-parade/image2.jpg",
        "priority": 90,
    },
    "st-john-95th-parade": {
        "category": "Leadership",
        "story_type": "community",
        "cover": "seed/student-life/st-john-95th-parade/image1.jpg",
        "priority": 100,
    },
    "top-achievers-dinner": {
        "category": "Leadership",
        "story_type": "student",
        "cover": "seed/student-life/top-achievers-dinner/image2.jpg",
        "priority": 110,
    },
    "innovation-week": {
        "category": "Research & Innovation",
        "story_type": "innovation",
        "cover": "seed/student-life/innovation-week/image1.jpg",
        "priority": 120,
    },
    "best-tax-club-award": {
        "category": "Clubs & Societies",
        "story_type": "student",
        "cover": "seed/student-life/best-tax-club-award/image1.jpg",
        "priority": 130,
    },
    "tax-society-recognition": {
        "category": "Clubs & Societies",
        "story_type": "student",
        "cover": "seed/student-life/best-tax-club-award/image1.jpg",
        "priority": 140,
    },
}


def _load_story_texts() -> dict[str, dict[str, Any]]:
    return json.loads(_ASSET_FILE.read_text(encoding="utf-8"))


def _blocks(record: dict[str, Any]) -> list[dict[str, str]]:
    """Typed blocks for a story, tolerating the older text-only asset shape."""
    blocks = record.get("blocks")
    if isinstance(blocks, list) and blocks:
        return [
            {"type": str(b.get("type") or "paragraph"), "text": str(b.get("text") or "")}
            for b in blocks
            if str(b.get("text") or "").strip()
        ]
    return [{"type": "paragraph", "text": str(p)} for p in record.get("paragraphs", [])]


def _split_byline(
    blocks: list[dict[str, str]],
) -> tuple[str | None, list[dict[str, str]]]:
    if blocks and blocks[0]["text"].strip().lower().startswith("by:"):
        return blocks[0]["text"].split(":", 1)[1].strip(), blocks[1:]
    return None, blocks


def _escape(text: str) -> str:
    return (
        text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    )


def _rich_text(blocks: list[dict[str, str]]) -> str:
    """Render the document's own structure, not one flat run of paragraphs.

    Section headings and bulleted lists are how these documents are written; a
    version that wraps every block in <p> publishes the words but loses the
    shape the author gave them. Consecutive list items are gathered into one
    <ul> so a list reads as a list.
    """
    parts: list[str] = []
    index = 0
    while index < len(blocks):
        block = blocks[index]
        kind = block["type"]
        text = _escape(block["text"])

        if kind == "list_item":
            items: list[str] = []
            while index < len(blocks) and blocks[index]["type"] == "list_item":
                items.append(f"<li>{_escape(blocks[index]['text'])}</li>")
                index += 1
            parts.append(f"<ul>{''.join(items)}</ul>")
            continue

        if kind == "heading":
            parts.append(f"<h2>{text}</h2>")
        else:
            parts.append(f"<p>{text}</p>")
        index += 1
    return "".join(parts)


def _is_seed_owned(structured_content: Any) -> bool:
    if not isinstance(structured_content, dict):
        return False
    seed = structured_content.get("seed")
    return isinstance(seed, dict) and seed.get("owner") == SEED_OWNER


async def _upsert_cover_media(db: AsyncSession, storage_path: str, title: str) -> Media | None:
    file_path = _UPLOADS_ROOT / storage_path
    if not file_path.exists():
        return None

    content = file_path.read_bytes()
    media = (
        await db.execute(select(Media).where(Media.storage_path == storage_path))
    ).scalar_one_or_none()
    payload = {
        "filename": file_path.name,
        "original_filename": file_path.name,
        "mime_type": "image/jpeg",
        "file_size": len(content),
        "file_hash": hashlib.sha256(content).hexdigest(),
        "storage_provider": "local",
        "storage_path": storage_path,
        "public_url": f"/uploads/{storage_path}",
        "thumbnail_url": f"/uploads/{storage_path}",
        "title": title,
        "alt_text": title,
        "description": f"Official Kisii University student life photo: {title}.",
        "tags": ["kisii-university", "student-life", "story-cover"],
        "credit": "Kisii University Corporate Communication",
        "media_type": "image",
        "is_public": True,
        "is_processed": True,
        "extra_metadata": {"seed_asset": True, "seeded_by": SEED_OWNER},
    }
    if media is None:
        media = Media(id=uuid.uuid4(), **payload)
        db.add(media)
    else:
        for field_name, value in payload.items():
            setattr(media, field_name, value)
    await db.flush()
    return media


async def seed_student_life_stories(db: AsyncSession, ctx: SeedContext) -> None:
    """Create seed-owned student life stories with verbatim editorial text."""
    del ctx
    now = datetime.now(timezone.utc)
    texts = _load_story_texts()

    for slug, spec in STUDENT_LIFE_STORY_SPECS.items():
        record = texts.get(slug)
        if record is None:
            continue

        byline, blocks = _split_byline(_blocks(record))
        if not blocks:
            continue
        title = str(record["title"]).strip()
        paragraphs = [b["text"] for b in blocks]
        # The standfirst comes from the first body paragraph, never a heading:
        # a section title makes no sense as a story's opening line.
        summary = next(
            (b["text"] for b in blocks if b["type"] == "paragraph"),
            paragraphs[0],
        )
        words = sum(len(p.split()) for p in paragraphs)

        cover = await _upsert_cover_media(db, str(spec["cover"]), title)

        story = (
            await db.execute(select(Story).where(Story.slug == slug))
        ).scalar_one_or_none()
        if story is not None and not _is_seed_owned(story.structured_content):
            continue
        if story is None:
            story = Story(title=title, slug=slug)
            db.add(story)

        story.title = title
        story.summary = summary[:497] + "…" if len(summary) > 500 else summary
        story.plain_text = "\n\n".join(paragraphs)
        story.rich_text = _rich_text(blocks)
        story.structured_content = {
            "seed": {"owner": SEED_OWNER, "version": SEED_VERSION},
            "source_type": "student_life_editorial",
            "campus_life_category": spec["category"],
            # The document's own structure, so a reader can set headings and
            # lists without re-parsing the flattened plain text.
            "blocks": blocks,
        }
        story.featured_media_id = cover.id if cover is not None else None
        story.story_type = str(spec["story_type"])
        story.category = str(spec["category"])
        story.source_type = "editorial"
        story.contributor_name_snapshot = byline or "Kisii University"
        story.show_contributor_name = True
        story.consent_to_publish = True
        story.is_featured = False
        story.featured_until = None
        story.homepage_priority = int(spec["priority"])
        story.reading_minutes = max(1, round(words / 200))
        story.meta_title = title
        story.meta_description = story.summary
        story.scope_type = "university"
        story.scope_id = None
        story.is_main = True
        story.is_public = True
        story.is_published = True
        story.status = "published"
        story.workflow_status = "published"
        story.owner_portal = "cocms"
        story.published_at = story.published_at or now
        story.valid_from = story.valid_from or now
        story.valid_to = None
        story.approved_at = story.approved_at or now
        story.revision_notes = "Seeded from the official Student Life editorial collection."
        await db.flush()


__all__ = ["STUDENT_LIFE_STORY_SPECS", "seed_student_life_stories"]
