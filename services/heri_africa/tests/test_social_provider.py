from __future__ import annotations

import asyncio

import pytest

from app.services.social import MockSocialProvider, SocialProviderError


def test_mock_social_provider_returns_external_id() -> None:
    result = asyncio.run(MockSocialProvider().publish("facebook", "hello", []))
    assert result.external_post_id.startswith("mock-")


def test_unknown_social_platform_is_rejected() -> None:
    with pytest.raises(SocialProviderError):
        asyncio.run(MockSocialProvider().publish("unknown", "hello", []))
