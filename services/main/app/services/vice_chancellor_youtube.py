"""Safe YouTube URL normalization and metadata lookup for VC videos."""

from __future__ import annotations

import re
from dataclasses import dataclass
from urllib.parse import parse_qs, urlparse

import httpx
from ksu_common.internal_client import create_outbound_client

YOUTUBE_OEMBED_URL = "https://www.youtube.com/oembed"
_YOUTUBE_HOSTS = {"youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"}
_VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")


@dataclass(frozen=True, slots=True)
class YouTubeReference:
    video_id: str
    canonical_url: str
    embed_url: str
    thumbnail_url: str


@dataclass(frozen=True, slots=True)
class YouTubeMetadata:
    title: str
    author_name: str | None
    thumbnail_url: str | None


class YouTubeMetadataUnavailable(RuntimeError):
    """Raised when YouTube metadata cannot be obtained without blocking creation."""


def normalize_youtube_url(value: str) -> YouTubeReference:
    """Validate a supported YouTube URL and return canonical safe URLs."""
    try:
        parsed = urlparse(value)
        port = parsed.port
    except ValueError as exc:
        raise ValueError("Invalid YouTube URL") from exc

    host = (parsed.hostname or "").lower()
    if (
        parsed.scheme != "https"
        or host not in _YOUTUBE_HOSTS
        or parsed.username is not None
        or parsed.password is not None
        or port is not None
    ):
        raise ValueError("Invalid or untrusted YouTube URL")

    parts = [part for part in parsed.path.split("/") if part]
    video_id: str | None = None
    if host == "youtu.be":
        video_id = parts[0] if len(parts) == 1 else None
    elif parsed.path == "/watch":
        candidates = parse_qs(parsed.query).get("v", [])
        video_id = candidates[0] if len(candidates) == 1 else None
    elif len(parts) == 2 and parts[0] in {"shorts", "live", "embed"}:
        video_id = parts[1]

    if not video_id or not _VIDEO_ID.fullmatch(video_id):
        raise ValueError("Unsupported or invalid YouTube video URL")

    return YouTubeReference(
        video_id=video_id,
        canonical_url=f"https://www.youtube.com/watch?v={video_id}",
        embed_url=f"https://www.youtube-nocookie.com/embed/{video_id}",
        thumbnail_url=f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
    )


async def fetch_youtube_oembed(
    reference: YouTubeReference,
    *,
    client: httpx.AsyncClient | None = None,
) -> YouTubeMetadata:
    """Fetch optional metadata from YouTube's fixed oEmbed endpoint."""
    owns_client = client is None
    if client is None:
        client = create_outbound_client(timeout=5.0, follow_redirects=False)
    try:
        response = await client.get(
            YOUTUBE_OEMBED_URL,
            params={"url": reference.canonical_url, "format": "json"},
        )
        response.raise_for_status()
        payload = response.json()
        title = payload.get("title")
        if not isinstance(title, str) or not title.strip():
            raise ValueError("missing title")
        return YouTubeMetadata(
            title=title.strip(),
            author_name=payload.get("author_name") if isinstance(payload.get("author_name"), str) else None,
            thumbnail_url=payload.get("thumbnail_url") if isinstance(payload.get("thumbnail_url"), str) else None,
        )
    except (httpx.HTTPError, ValueError, TypeError) as exc:
        raise YouTubeMetadataUnavailable("YouTube metadata is temporarily unavailable") from exc
    finally:
        if owns_client:
            await client.aclose()
