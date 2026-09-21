"""Source catalog shared by Main-owned media/editorial and Research seeders."""

from functools import lru_cache
import json
from pathlib import Path
from uuid import NAMESPACE_URL, uuid5


@lru_cache(maxsize=1)
def research_source_catalog() -> dict:
    return json.loads(
        Path(__file__)
        .with_name("research_source_catalog.json")
        .read_text(encoding="utf-8")
    )


def research_media_id(key: str):
    return uuid5(NAMESPACE_URL, f"ksu:research-source-media:{key}")


def research_about_text() -> str:
    """Keep the annual-events table in its original position in the overview."""
    blocks = research_source_catalog()["source_documents"][
        "ABOUT RESEARCH AT KISII UNIVERSITY-1.docx"
    ]
    paragraphs = []
    for block in blocks[1:]:
        if "text" in block:
            paragraphs.append(block["text"])
        elif "table" in block:
            for event, description, timing in block["table"][1:]:
                paragraphs.append(f"{event} ({timing}): {description}")
    return "\n\n".join(paragraphs)
