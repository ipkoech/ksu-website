"""Helpers for exposing browser-loadable person media URLs."""

from __future__ import annotations

from typing import Any

from ...helpers.storage import get_public_url


def _append_person_photo_url(data: dict[str, Any], source: Any) -> dict[str, Any]:
    media = data.get("photo")
    photo_url = None
    if media is not None:
        if isinstance(media, dict):
            photo_url = media.get("url") or media.get("cdn_url") or media.get("public_url") or media.get("storage_path")
        else:
            photo_url = getattr(media, "url", None)

    photo_url = data.get("photo_url") or photo_url or getattr(source, "photo_url", None)
    data["photo_url"] = get_public_url(photo_url) if photo_url else None
    return data


def with_person_photo_urls(data: Any, source: Any = None) -> Any:
    """Add resolved ``photo_url`` to Person-shaped payloads, including nested assignment.person."""
    if isinstance(data, list):
        sources = source or []
        return [
            with_person_photo_urls(item, sources[index] if index < len(sources) else None)
            for index, item in enumerate(data)
        ]

    if not isinstance(data, dict):
        return data

    result = dict(data)
    nested_person_source = getattr(source, "person", None)
    if isinstance(result.get("person"), dict):
        result["person"] = with_person_photo_urls(result["person"], nested_person_source)

    if source is not None and hasattr(source, "photo_url"):
        return _append_person_photo_url(result, source)

    return result
