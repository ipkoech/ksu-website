"""OAuth 1.0a user-context support in the X adapter."""

import pytest

from app.helpers.social import SocialAdapterError, XAdapter, build_oauth1_header
from app.models import SocialPlatformAccount

def _account(credentials: dict) -> SocialPlatformAccount:
    return SocialPlatformAccount(
        provider="x",
        name="KSU X",
        account_ref="kisiiuniversity",
        credentials=credentials,
        is_active=True,
    )


OAUTH1_CREDENTIALS = {
    "consumer_key": "ck",
    "consumer_secret": "cs",
    "access_token": "at",
    "access_token_secret": "ats",
}


def test_signature_matches_twitter_documented_example():
    # The canonical worked example from Twitter's "Creating a signature"
    # developer documentation.
    header = build_oauth1_header(
        method="POST",
        url="https://api.twitter.com/1.1/statuses/update.json",
        consumer_key="xvz1evFS4wEEPTGEFPHBog",
        consumer_secret="kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw",
        token="370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb",
        token_secret="LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE",
        query_params={
            "status": "Hello Ladies + Gentlemen, a signed OAuth request!",
            "include_entities": "true",
        },
        nonce="kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg",
        timestamp="1318622958",
    )
    assert 'oauth_signature="hCtSmYh%2BiHYCEqBWrE7C7hYmtUk%3D"' in header
    assert header.startswith("OAuth ")
    assert 'oauth_signature_method="HMAC-SHA1"' in header


def test_oauth1_mode_detected_only_with_all_four_keys():
    adapter = XAdapter()
    assert adapter._oauth1_credentials(_account(OAUTH1_CREDENTIALS)) == (
        "ck",
        "cs",
        "at",
        "ats",
    )
    for missing in OAUTH1_CREDENTIALS:
        partial = {k: v for k, v in OAUTH1_CREDENTIALS.items() if k != missing}
        assert adapter._oauth1_credentials(_account(partial)) is None


@pytest.mark.asyncio
async def test_publish_uses_oauth1_header_and_skips_scope_check(monkeypatch):
    adapter = XAdapter()
    captured = {}

    async def fake_request_json(client, method, url, **kwargs):
        captured["method"] = method
        captured["url"] = url
        # publish() sets the Authorization header on the client; validate()
        # passes it per-request — accept either. httpx lowercases header
        # names, so normalize keys before asserting.
        merged = dict(client.headers)
        merged.update(kwargs.get("headers") or {})
        captured["headers"] = {key.lower(): value for key, value in merged.items()}
        captured["json_data"] = kwargs.get("json_data")
        return {"data": {"id": "12345"}}

    monkeypatch.setattr(adapter, "_request_json", fake_request_json)
    # No "scopes" key in credentials: the OAuth2 path would raise
    # missing_scope, so success proves the 1.0a branch was taken.
    result = await adapter.publish(
        account=_account(OAUTH1_CREDENTIALS),
        content="Hello from KSU",
        title=None,
        media=[],
    )
    assert result.success is True
    assert result.provider_post_id == "12345"
    assert captured["json_data"] == {"text": "Hello from KSU"}
    auth = (captured["headers"] or {}).get("authorization", "")
    assert auth.startswith("OAuth ")
    assert 'oauth_consumer_key="ck"' in auth
    assert 'oauth_token="at"' in auth


@pytest.mark.asyncio
async def test_validate_uses_oauth1_header(monkeypatch):
    adapter = XAdapter()
    captured = {}

    async def fake_request_json(client, method, url, **kwargs):
        captured["headers"] = kwargs.get("headers")
        return {"data": {"id": "1", "username": "kisiiuniversity"}}

    monkeypatch.setattr(adapter, "_request_json", fake_request_json)
    ok, error = await adapter.validate_credentials(_account(OAUTH1_CREDENTIALS))
    assert ok is True and error is None
    assert (captured["headers"] or {}).get("Authorization", "").startswith("OAuth ")


@pytest.mark.asyncio
async def test_oauth2_path_unchanged_without_oauth1_keys():
    adapter = XAdapter()
    with pytest.raises(SocialAdapterError) as exc_info:
        await adapter.publish(
            account=_account({"access_token": "bearer-only"}),
            content="Hi",
            title=None,
            media=[],
        )
    assert exc_info.value.code == "missing_scope"
