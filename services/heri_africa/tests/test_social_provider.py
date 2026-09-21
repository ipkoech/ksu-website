import pytest

from app.services.social import MockSocialProvider, SocialProviderError


@pytest.mark.asyncio
async def test_mock_social_provider_returns_external_id() -> None:
    result = await MockSocialProvider().publish("facebook", "hello", [])

    assert result.status == "published"
    assert result.external_post_id.startswith("mock-")


@pytest.mark.asyncio
async def test_mock_social_provider_rejects_unknown_platform() -> None:
    with pytest.raises(SocialProviderError, match="Unsupported social platform"):
        await MockSocialProvider().publish("unknown", "hello", [])
