from __future__ import annotations

from dataclasses import dataclass
from uuid import uuid4


class SocialProviderError(RuntimeError):
    pass


@dataclass(frozen=True)
class ProviderResult:
    external_post_id: str
    status: str = "published"


class MockSocialProvider:
    supported = {"facebook", "instagram", "x"}

    async def publish(self, platform: str, caption: str, media_urls: list[str]) -> ProviderResult:
        del caption, media_urls
        if platform not in self.supported:
            raise SocialProviderError(f"Unsupported social platform: {platform}")
        return ProviderResult(external_post_id=f"mock-{uuid4()}")
