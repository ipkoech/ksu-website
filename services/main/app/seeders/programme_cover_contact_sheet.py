"""Paginated HTML contact sheets for programme cover review."""

from __future__ import annotations

from html import escape
from pathlib import Path

from .programme_cover_review import SchoolReviewManifest


def render_contact_sheets(
    workspace: Path,
    manifest: SchoolReviewManifest,
    *,
    cards_per_page: int = 24,
) -> tuple[Path, ...]:
    """Render stable, numbered HTML pages with at most 24 candidates each."""

    if not 1 <= cards_per_page <= 24:
        raise ValueError("Contact sheets must contain between 1 and 24 cards per page")
    workspace = Path(workspace)
    output_dir = workspace / "contact-sheets"
    output_dir.mkdir(parents=True, exist_ok=True)
    for stale_page in output_dir.glob("contact-sheet-*.html"):
        stale_page.unlink()
    items = list(manifest.items.values())
    paths: list[Path] = []
    for page_index, offset in enumerate(range(0, len(items), cards_per_page), start=1):
        cards: list[str] = []
        for sequence, item in enumerate(items[offset : offset + cards_per_page], start=offset + 1):
            note = item.review_notes[-1] if item.review_notes else ""
            image_source = f"../review/{item.programme_slug}.webp"
            cards.append(
                '<article class="card">'
                f'<img src="{escape(image_source, quote=True)}" alt="">'
                '<div class="details">'
                f'<strong>#{sequence:03d} {escape(item.programme_name)}</strong>'
                f'<span>Department: {escape(item.department_code)}</span>'
                f'<span>Status: {escape(item.status.value)}</span>'
                f'<span class="note">Failure note: {escape(note)}</span>'
                "</div></article>"
            )
        path = output_dir / f"contact-sheet-{page_index:03d}.html"
        path.write_text(
            "<!doctype html><html><head><meta charset=\"utf-8\">"
            f"<title>{escape(manifest.school_name)} programme covers</title>"
            "<style>body{font-family:sans-serif;margin:24px}"
            ".grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}"
            ".card{border:1px solid #bbb;padding:10px;break-inside:avoid}"
            ".card img{display:block;width:100%;aspect-ratio:16/9;object-fit:contain}"
            ".details{display:grid;gap:4px;margin-top:8px}.details span{font-size:13px}"
            "</style></head><body>"
            f"<h1>{escape(manifest.school_name)}</h1>"
            f'<main class="grid">{"".join(cards)}</main>'
            "</body></html>\n",
            encoding="utf-8",
        )
        paths.append(path)
    return tuple(paths)
