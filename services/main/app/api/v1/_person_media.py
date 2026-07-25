"""Helpers for exposing browser-loadable person media URLs."""

from __future__ import annotations

from typing import Any

from ...helpers.storage import get_media_public_url


def _append_person_photo_url(data: dict[str, Any], source: Any) -> dict[str, Any]:
    media = data.get("photo")
    photo_url = data.get("photo_url") or get_media_public_url(media)
    if not photo_url:
        source_media = getattr(source, "photo", None)
        photo_url = get_media_public_url(source_media) or getattr(source, "photo_url", None)
    data["photo_url"] = photo_url
    return data


def _append_person_cv_url(data: dict[str, Any], source: Any) -> dict[str, Any]:
    media = data.get("cv_file")
    cv_file_url = data.get("cv_file_url") or get_media_public_url(media)
    if not cv_file_url:
        cv_file_url = get_media_public_url(getattr(source, "__dict__", {}).get("cv_file"))
    data["cv_file_url"] = cv_file_url
    return data


def with_person_photo_urls(data: Any, source: Any = None) -> Any:
    """Add resolved person media URLs, including nested assignment.person payloads."""
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

    if source is not None:
        if hasattr(source, "photo_url"):
            _append_person_photo_url(result, source)
        if "cv_file_id" in result or "cv_file" in result or getattr(source, "__dict__", {}).get("cv_file") is not None:
            _append_person_cv_url(result, source)

    return result
