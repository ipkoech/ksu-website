from __future__ import annotations

import uuid

import httpx
import pytest
from pydantic import ValidationError

from app.schemas.vice_chancellor import (
    VcHubPlacementCreate,
    VcHubUpdate,
    VcSpeechCreate,
    VcVideoCreate,
)
from app.services.vice_chancellor_youtube import (
    YouTubeMetadataUnavailable,
    fetch_youtube_oembed,
    normalize_youtube_url,
)
import app.services.vice_chancellor_youtube as youtube_service


YOUTUBE_ID = "dQw4w9WgXcQ"


@pytest.mark.parametrize(
    "url",
    [
        f"https://www.youtube.com/watch?v={YOUTUBE_ID}",
        f"https://youtu.be/{YOUTUBE_ID}?t=4",
        f"https://www.youtube.com/shorts/{YOUTUBE_ID}",
        f"https://www.youtube.com/live/{YOUTUBE_ID}?feature=share",
        f"https://www.youtube.com/embed/{YOUTUBE_ID}",
    ],
)
def test_supported_youtube_urls_normalize_to_privacy_embed(url):
    result = normalize_youtube_url(url)

    assert result.video_id == YOUTUBE_ID
    assert result.canonical_url == f"https://www.youtube.com/watch?v={YOUTUBE_ID}"
    assert result.embed_url == f"https://www.youtube-nocookie.com/embed/{YOUTUBE_ID}"
    assert result.thumbnail_url == f"https://i.ytimg.com/vi/{YOUTUBE_ID}/hqdefault.jpg"


@pytest.mark.parametrize(
    "url",
    [
        "https://example.com/watch?v=dQw4w9WgXcQ",
        "https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ",
        "https://user:pass@youtube.com/watch?v=dQw4w9WgXcQ",
        "https://youtube.com/watch?v=too-short",
        "javascript:alert(1)",
    ],
)
def test_youtube_normalizer_rejects_untrusted_or_invalid_urls(url):
    with pytest.raises(ValueError, match="YouTube"):
        normalize_youtube_url(url)


@pytest.mark.asyncio
async def test_oembed_uses_fixed_endpoint_and_returns_typed_metadata(monkeypatch):
    reference = normalize_youtube_url(f"https://youtu.be/{YOUTUBE_ID}")

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.host == "www.youtube.com"
        assert request.url.path == "/oembed"
        assert request.url.params["url"] == reference.canonical_url
        return httpx.Response(
            200,
            json={
                "title": "VC welcome",
                "author_name": "Kisii University",
                "thumbnail_url": "https://i.ytimg.com/example.jpg",
            },
        )

    class Pool:
        async def request(self, _integration, _base_url, _method, _path, *, params):
            request = httpx.Request("GET", "https://www.youtube.com/oembed", params=params)
            response = handler(request)
            response.request = request
            return response

    monkeypatch.setattr(youtube_service, "get_integration_pool", lambda: Pool())
    metadata = await fetch_youtube_oembed(reference)

    assert metadata.title == "VC welcome"
    assert metadata.author_name == "Kisii University"
    assert metadata.thumbnail_url == "https://i.ytimg.com/example.jpg"


@pytest.mark.asyncio
async def test_oembed_failure_is_exposed_as_non_domain_failure(monkeypatch):
    reference = normalize_youtube_url(f"https://youtu.be/{YOUTUBE_ID}")

    class Pool:
        async def request(self, *_args, **_kwargs):
            return httpx.Response(503, request=httpx.Request("GET", "https://www.youtube.com/oembed"))

    monkeypatch.setattr(youtube_service, "get_integration_pool", lambda: Pool())
    with pytest.raises(YouTubeMetadataUnavailable, match="metadata"):
        await fetch_youtube_oembed(reference)


def test_video_create_requires_the_source_for_its_provider():
    with pytest.raises(ValidationError, match="source_url"):
        VcVideoCreate(
            title="Welcome",
            slug="welcome",
            provider="youtube",
        )

    with pytest.raises(ValidationError, match="uploaded_media_id"):
        VcVideoCreate(
            title="Welcome",
            slug="welcome",
            provider="uploaded",
        )


def test_hub_update_rejects_duplicate_or_unknown_sections():
    with pytest.raises(ValidationError, match="section_order"):
        VcHubUpdate(section_order=["story", "story"])

    with pytest.raises(ValidationError, match="section_order"):
        VcHubUpdate(section_order=["story", "unknown"])


def test_placement_requires_exactly_one_source_matching_the_section():
    news_id = uuid.uuid4()
    speech_id = uuid.uuid4()

    with pytest.raises(ValidationError, match="source"):
        VcHubPlacementCreate(section="activities")

    with pytest.raises(ValidationError, match="section"):
        VcHubPlacementCreate(section="speeches", news_id=news_id)

    with pytest.raises(ValidationError, match="one source"):
        VcHubPlacementCreate(
            section="activities",
            news_id=news_id,
            speech_id=speech_id,
        )

    placement = VcHubPlacementCreate(section="speeches", speech_id=speech_id)
    assert placement.speech_id == speech_id


def test_speech_create_rejects_lifecycle_and_unknown_fields():
    with pytest.raises(ValidationError):
        VcSpeechCreate(
            title="Graduation address",
            slug="graduation-address",
            workflow_status="published",
        )

    with pytest.raises(ValidationError):
        VcSpeechCreate(
            title="Graduation address",
            slug="graduation-address",
            unexpected="value",
        )
