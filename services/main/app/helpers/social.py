"""Social media provider adapters and media validation helpers."""

from __future__ import annotations

import json
from base64 import b64encode
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Protocol

import httpx

from ..core.config import get_settings
from ..models import Media, SocialPlatformAccount

settings = get_settings()

SUPPORTED_SOCIAL_PLATFORMS = {"x", "facebook", "instagram", "linkedin"}

PLATFORM_CONSTRAINTS = {
    "x": {
        "max_text_length": 280,
        "max_media_count": 4,
        "allowed_media_types": {"image", "video", "gif"},
        "requires_public_media_url": False,
    },
    "facebook": {
        "max_text_length": 63206,
        "max_media_count": 10,
        "allowed_media_types": {"image", "video", "document", "link"},
        "requires_public_media_url": False,
    },
    "instagram": {
        "max_text_length": 2200,
        "max_media_count": 10,
        "allowed_media_types": {"image", "video"},
        "requires_public_media_url": True,
    },
    "linkedin": {
        "max_text_length": 3000,
        "max_media_count": 9,
        "allowed_media_types": {"image", "video", "document", "link"},
        "requires_public_media_url": False,
    },
}


@dataclass
class ValidationIssue:
    code: str
    message: str

    def as_dict(self) -> dict:
        return {"code": self.code, "message": self.message}


@dataclass
class PublishResult:
    success: bool
    provider_post_id: str | None = None
    posted_at: datetime | None = None
    error_code: str | None = None
    error_message: str | None = None
    raw_response: dict | None = None


class SocialProviderAdapter(Protocol):
    provider: str

    async def validate_credentials(self, account: SocialPlatformAccount) -> tuple[bool, str | None]: ...

    async def publish(
        self,
        *,
        account: SocialPlatformAccount,
        content: str,
        title: str | None,
        media: list[Media],
        dry_run: bool = False,
    ) -> PublishResult: ...


class SocialAdapterError(Exception):
    """Raised when a provider adapter cannot complete a request."""

    def __init__(self, code: str, message: str, *, payload: dict | None = None) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.payload = payload


class BaseSocialAdapter:
    provider = "unknown"

    def _credentials(self, account: SocialPlatformAccount) -> dict[str, Any]:
        return dict(account.credentials or {})

    def _settings(self, account: SocialPlatformAccount) -> dict[str, Any]:
        return dict(account.settings or {})

    def _token(self, account: SocialPlatformAccount) -> str:
        token = self._credentials(account).get("access_token") or self._credentials(account).get("token")
        if not token:
            raise SocialAdapterError("missing_token", "Missing access token")
        return token

    def _scopes(self, account: SocialPlatformAccount) -> set[str]:
        credentials = self._credentials(account)
        raw = credentials.get("scopes") or credentials.get("scope") or []
        if isinstance(raw, str):
            return {item.strip() for item in raw.replace(",", " ").split() if item.strip()}
        return {str(item).strip() for item in raw if str(item).strip()}

    def _require_scopes(self, account: SocialPlatformAccount, *scopes: str) -> None:
        existing = self._scopes(account)
        missing = [scope for scope in scopes if scope not in existing]
        if missing:
            raise SocialAdapterError(
                "missing_scope",
                f"Missing required scopes for {self.provider}: {', '.join(missing)}",
                payload={"required": list(scopes), "current": sorted(existing)},
            )

    def _expires_at(self, account: SocialPlatformAccount) -> datetime | None:
        raw = self._credentials(account).get("expires_at")
        if not raw:
            return None
        if isinstance(raw, datetime):
            return raw if raw.tzinfo else raw.replace(tzinfo=timezone.utc)
        if isinstance(raw, (int, float)):
            return datetime.fromtimestamp(raw, tz=timezone.utc)
        if isinstance(raw, str):
            try:
                value = datetime.fromisoformat(raw.replace("Z", "+00:00"))
            except ValueError:
                return None
            return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
        return None

    def _is_expired(self, account: SocialPlatformAccount, *, skew_seconds: int = 60) -> bool:
        expires_at = self._expires_at(account)
        if expires_at is None:
            return False
        return expires_at <= datetime.now(timezone.utc) + timedelta(seconds=skew_seconds)

    def _update_credentials(self, account: SocialPlatformAccount, **updates: Any) -> None:
        credentials = self._credentials(account)
        credentials.update({key: value for key, value in updates.items() if value is not None})
        account.credentials = credentials

    def _client_auth(self, client_id: str, client_secret: str) -> str:
        token = b64encode(f"{client_id}:{client_secret}".encode("utf-8")).decode("ascii")
        return f"Basic {token}"

    def _public_url(self, media: Media) -> str:
        url = media.cdn_url or media.public_url
        if not url:
            raise SocialAdapterError(
                "missing_public_url",
                f"Provider {self.provider} requires a public URL for {media.filename}",
            )
        return url

    def _client(self, *, headers: dict[str, str] | None = None, base_url: str | None = None) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            headers=headers,
            base_url=base_url,
            timeout=httpx.Timeout(60.0, connect=20.0),
        )

    async def _request_json(
        self,
        client: httpx.AsyncClient,
        method: str,
        url: str,
        *,
        params: dict[str, Any] | None = None,
        data: dict[str, Any] | None = None,
        json_data: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> dict:
        response = await client.request(
            method,
            url,
            params=params,
            data=data,
            json=json_data,
            headers=headers,
        )
        if response.status_code >= 400:
            try:
                payload = response.json()
            except Exception:
                payload = {"body": response.text}
            raise SocialAdapterError(
                "provider_request_failed",
                f"{self.provider} API request failed with status {response.status_code}",
                payload=payload,
            )
        if not response.content:
            return {}
        return response.json()

    async def validate_credentials(self, account: SocialPlatformAccount) -> tuple[bool, str | None]:
        self._token(account)
        return True, None

    async def ensure_access_token(self, account: SocialPlatformAccount) -> str:
        return self._token(account)

    async def publish(
        self,
        *,
        account: SocialPlatformAccount,
        content: str,
        title: str | None,
        media: list[Media],
        dry_run: bool = False,
    ) -> PublishResult:
        if dry_run:
            return PublishResult(
                success=True,
                provider_post_id=f"dry-run:{self.provider}:{account.account_ref}",
                posted_at=datetime.now(timezone.utc),
                raw_response={"mode": "dry_run"},
            )
        raise SocialAdapterError("provider_not_implemented", f"{self.provider} adapter is not implemented")

    async def _safe_publish(
        self,
        *,
        account: SocialPlatformAccount,
        content: str,
        title: str | None,
        media: list[Media],
        dry_run: bool = False,
    ) -> PublishResult:
        try:
            return await self.publish(
                account=account,
                content=content,
                title=title,
                media=media,
                dry_run=dry_run,
            )
        except SocialAdapterError as exc:
            return PublishResult(
                success=False,
                error_code=exc.code,
                error_message=exc.message,
                raw_response=exc.payload,
            )
        except Exception as exc:
            return PublishResult(
                success=False,
                error_code="unexpected_error",
                error_message=str(exc),
            )


class XAdapter(BaseSocialAdapter):
    provider = "x"

    async def ensure_access_token(self, account: SocialPlatformAccount) -> str:
        if not self._is_expired(account):
            return self._token(account)
        refresh_token = self._credentials(account).get("refresh_token")
        client_id = self._credentials(account).get("client_id") or settings.TWITTER_CLIENT_ID
        client_secret = self._credentials(account).get("client_secret") or settings.TWITTER_CLIENT_SECRET
        if not refresh_token or not client_id:
            raise SocialAdapterError("token_expired", "X access token expired and no refresh token/client_id is available")

        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
            "client_id": client_id,
        }
        auth_header: dict[str, str] | None = None
        if client_secret:
            auth_header = {"Authorization": self._client_auth(client_id, client_secret)}
        async with self._client(headers=headers, base_url=settings.X_API_BASE_URL) as client:
            payload = await self._request_json(
                client,
                "POST",
                "/2/oauth2/token",
                data=data,
                headers=auth_header,
            )
        expires_in = int(payload.get("expires_in", 0) or 0)
        self._update_credentials(
            account,
            access_token=payload.get("access_token"),
            refresh_token=payload.get("refresh_token") or refresh_token,
            token_type=payload.get("token_type"),
            scope=payload.get("scope"),
            scopes=payload.get("scope", "").split(),
            expires_at=(datetime.now(timezone.utc) + timedelta(seconds=expires_in)) if expires_in else None,
        )
        return self._token(account)

    async def validate_credentials(self, account: SocialPlatformAccount) -> tuple[bool, str | None]:
        try:
            self._require_scopes(account, "tweet.write", "users.read")
            token = await self.ensure_access_token(account)
        except SocialAdapterError as exc:
            return False, exc.message
        headers = {"Authorization": f"Bearer {token}"}
        async with self._client(headers=headers, base_url=settings.X_API_BASE_URL) as client:
            try:
                await self._request_json(client, "GET", "/2/users/me")
            except SocialAdapterError as exc:
                return False, exc.message
        return True, None

    async def publish(
        self,
        *,
        account: SocialPlatformAccount,
        content: str,
        title: str | None,
        media: list[Media],
        dry_run: bool = False,
    ) -> PublishResult:
        if dry_run:
            return await super().publish(account=account, content=content, title=title, media=media, dry_run=dry_run)
        if media:
            raise SocialAdapterError(
                "media_not_supported",
                "X publishing currently supports text-only posts in this integration",
            )
        self._require_scopes(account, "tweet.write")
        token = await self.ensure_access_token(account)
        headers = {"Authorization": f"Bearer {token}"}
        async with self._client(headers=headers, base_url=settings.X_API_BASE_URL) as client:
            payload = {"text": content}
            data = await self._request_json(client, "POST", "/2/tweets", json_data=payload)
        post_id = ((data.get("data") or {}).get("id"))
        return PublishResult(
            success=True,
            provider_post_id=post_id,
            posted_at=datetime.now(timezone.utc),
            raw_response=data,
        )


class FacebookAdapter(BaseSocialAdapter):
    provider = "facebook"

    def _graph_path(self, resource: str) -> str:
        return f"/{settings.FACEBOOK_GRAPH_API_VERSION}/{resource}"

    def _app_access_token(self, account: SocialPlatformAccount) -> str:
        credentials = self._credentials(account)
        app_id = credentials.get("app_id") or settings.FACEBOOK_APP_ID
        app_secret = credentials.get("app_secret") or settings.FACEBOOK_APP_SECRET
        if not app_id or not app_secret:
            raise SocialAdapterError("missing_app_credentials", "Facebook app id/secret is required for token verification")
        return f"{app_id}|{app_secret}"

    async def _debug_token(self, client: httpx.AsyncClient, account: SocialPlatformAccount, input_token: str) -> dict:
        return await self._request_json(
            client,
            "GET",
            self._graph_path("debug_token"),
            params={"input_token": input_token, "access_token": self._app_access_token(account)},
        )

    async def _resolve_page_token(self, client: httpx.AsyncClient, account: SocialPlatformAccount) -> str:
        credentials = self._credentials(account)
        page_token = credentials.get("page_access_token")
        if page_token:
            return page_token
        user_token = credentials.get("access_token") or credentials.get("token")
        if not user_token:
            raise SocialAdapterError("missing_token", "Missing Facebook access token")
        data = await self._request_json(
            client,
            "GET",
            self._graph_path("me/accounts"),
            params={"access_token": user_token},
        )
        for page in data.get("data", []):
            if str(page.get("id")) == str(account.account_ref):
                token = page.get("access_token")
                if token:
                    self._update_credentials(account, page_access_token=token)
                    return token
        raise SocialAdapterError("page_not_accessible", f"Configured Facebook page {account.account_ref} was not returned by /me/accounts")

    async def validate_credentials(self, account: SocialPlatformAccount) -> tuple[bool, str | None]:
        token = self._token(account)
        async with self._client(base_url=settings.FACEBOOK_GRAPH_API_BASE_URL) as client:
            try:
                debug = await self._debug_token(client, account, token)
                token_data = debug.get("data") or {}
                if not token_data.get("is_valid"):
                    return False, "Facebook token is invalid"
                page_token = await self._resolve_page_token(client, account)
                await self._request_json(
                    client,
                    "GET",
                    self._graph_path(account.account_ref),
                    params={"access_token": page_token, "fields": "id,name"},
                )
            except SocialAdapterError as exc:
                return False, exc.message
        return True, None

    async def _publish_images(self, client: httpx.AsyncClient, page_id: str, token: str, message: str, media: list[Media]) -> dict:
        attachments: list[dict[str, str]] = []
        for item in media:
            if not item.is_image:
                raise SocialAdapterError(
                    "unsupported_media_type",
                    "Facebook integration currently supports images only for media posts",
                )
            data = await self._request_json(
                client,
                "POST",
                self._graph_path(f"{page_id}/photos"),
                data={
                    "url": self._public_url(item),
                    "published": "false",
                    "access_token": token,
                },
            )
            attachments.append({"media_fbid": data["id"]})
        payload: dict[str, Any] = {
            "message": message,
            "access_token": token,
        }
        for index, attachment in enumerate(attachments):
            payload[f"attached_media[{index}]"] = json.dumps(attachment)
        return await self._request_json(
            client,
            "POST",
            self._graph_path(f"{page_id}/feed"),
            data=payload,
        )

    async def publish(
        self,
        *,
        account: SocialPlatformAccount,
        content: str,
        title: str | None,
        media: list[Media],
        dry_run: bool = False,
    ) -> PublishResult:
        if dry_run:
            return await super().publish(account=account, content=content, title=title, media=media, dry_run=dry_run)
        page_id = account.account_ref
        message = f"{title}\n\n{content}".strip() if title else content
        async with self._client(base_url=settings.FACEBOOK_GRAPH_API_BASE_URL) as client:
            token = await self._resolve_page_token(client, account)
            if media:
                data = await self._publish_images(client, page_id, token, message, media)
            else:
                data = await self._request_json(
                    client,
                    "POST",
                    self._graph_path(f"{page_id}/feed"),
                    data={"message": message, "access_token": token},
                )
        post_id = data.get("post_id") or data.get("id")
        return PublishResult(
            success=True,
            provider_post_id=post_id,
            posted_at=datetime.now(timezone.utc),
            raw_response=data,
        )


class InstagramAdapter(BaseSocialAdapter):
    provider = "instagram"

    def _graph_path(self, resource: str) -> str:
        return f"/{settings.INSTAGRAM_GRAPH_API_VERSION}/{resource}"

    async def _debug_token(self, client: httpx.AsyncClient, account: SocialPlatformAccount, input_token: str) -> dict:
        app_id = self._credentials(account).get("app_id") or settings.FACEBOOK_APP_ID
        app_secret = self._credentials(account).get("app_secret") or settings.FACEBOOK_APP_SECRET
        if not app_id or not app_secret:
            raise SocialAdapterError("missing_app_credentials", "Meta app id/secret is required for Instagram token verification")
        return await self._request_json(
            client,
            "GET",
            self._graph_path("debug_token"),
            params={"input_token": input_token, "access_token": f"{app_id}|{app_secret}"},
        )

    async def validate_credentials(self, account: SocialPlatformAccount) -> tuple[bool, str | None]:
        token = self._token(account)
        async with self._client(base_url=settings.FACEBOOK_GRAPH_API_BASE_URL) as client:
            try:
                debug = await self._debug_token(client, account, token)
                token_data = debug.get("data") or {}
                if not token_data.get("is_valid"):
                    return False, "Instagram/Meta token is invalid"
                await self._request_json(
                    client,
                    "GET",
                    self._graph_path(account.account_ref),
                    params={"fields": "id,username", "access_token": token},
                )
                page_id = self._settings(account).get("facebook_page_id")
                if page_id:
                    page = await self._request_json(
                        client,
                        "GET",
                        self._graph_path(page_id),
                        params={"fields": "instagram_business_account{id}", "access_token": token},
                    )
                    ig_id = (((page.get("instagram_business_account") or {}).get("id")))
                    if ig_id and str(ig_id) != str(account.account_ref):
                        return False, "Configured Instagram user does not match the linked Facebook page"
            except SocialAdapterError as exc:
                return False, exc.message
        return True, None

    async def publish(
        self,
        *,
        account: SocialPlatformAccount,
        content: str,
        title: str | None,
        media: list[Media],
        dry_run: bool = False,
    ) -> PublishResult:
        if dry_run:
            return await super().publish(account=account, content=content, title=title, media=media, dry_run=dry_run)
        if not media:
            raise SocialAdapterError("media_required", "Instagram publishing requires at least one media item")
        if len(media) != 1:
            raise SocialAdapterError(
                "single_media_only",
                "Instagram integration currently supports a single image or video per post",
            )
        item = media[0]
        if not (item.is_image or item.is_video):
            raise SocialAdapterError(
                "unsupported_media_type",
                "Instagram integration currently supports only images or videos",
            )
        token = self._token(account)
        ig_user_id = account.account_ref
        caption = f"{title}\n\n{content}".strip() if title else content
        container_payload: dict[str, Any] = {
            "caption": caption,
            "access_token": token,
        }
        if item.is_image:
            container_payload["image_url"] = self._public_url(item)
        else:
            container_payload["video_url"] = self._public_url(item)
            container_payload["media_type"] = "REELS" if item.duration and item.duration <= 900 else "VIDEO"
        async with self._client(base_url=settings.FACEBOOK_GRAPH_API_BASE_URL) as client:
            container = await self._request_json(
                client,
                "POST",
                self._graph_path(f"{ig_user_id}/media"),
                data=container_payload,
            )
            creation_id = container.get("id")
            if not creation_id:
                raise SocialAdapterError("missing_creation_id", "Instagram did not return a media creation id", payload=container)
            data = await self._request_json(
                client,
                "POST",
                self._graph_path(f"{ig_user_id}/media_publish"),
                data={"creation_id": creation_id, "access_token": token},
            )
        return PublishResult(
            success=True,
            provider_post_id=data.get("id"),
            posted_at=datetime.now(timezone.utc),
            raw_response={"container": container, "publish": data},
        )


class LinkedInAdapter(BaseSocialAdapter):
    provider = "linkedin"

    async def ensure_access_token(self, account: SocialPlatformAccount) -> str:
        if not self._is_expired(account):
            return self._token(account)
        refresh_token = self._credentials(account).get("refresh_token")
        client_id = self._credentials(account).get("client_id") or settings.LINKEDIN_CLIENT_ID
        client_secret = self._credentials(account).get("client_secret") or settings.LINKEDIN_CLIENT_SECRET
        if not refresh_token or not client_id or not client_secret:
            raise SocialAdapterError("token_expired", "LinkedIn access token expired and refresh credentials are incomplete")
        async with self._client(base_url=settings.LINKEDIN_API_BASE_URL) as client:
            payload = await self._request_json(
                client,
                "POST",
                "/oauth/v2/accessToken",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                    "client_id": client_id,
                    "client_secret": client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
        expires_in = int(payload.get("expires_in", 0) or 0)
        self._update_credentials(
            account,
            access_token=payload.get("access_token"),
            expires_at=(datetime.now(timezone.utc) + timedelta(seconds=expires_in)) if expires_in else None,
        )
        return self._token(account)

    def _linkedin_headers(self, token: str) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "LinkedIn-Version": settings.LINKEDIN_VERSION,
        }

    def _author_urn(self, account: SocialPlatformAccount) -> str:
        return str((self._settings(account).get("author_urn") or account.account_ref)).strip()

    def _validate_author_scope(self, account: SocialPlatformAccount, author_urn: str) -> None:
        if author_urn.startswith("urn:li:organization:"):
            self._require_scopes(account, "w_organization_social")
        elif author_urn.startswith("urn:li:person:") or author_urn.startswith("urn:li:member:"):
            self._require_scopes(account, "w_member_social")
        else:
            raise SocialAdapterError("invalid_author", "LinkedIn author_urn must be a member or organization URN")

    async def validate_credentials(self, account: SocialPlatformAccount) -> tuple[bool, str | None]:
        try:
            token = await self.ensure_access_token(account)
            author_urn = self._author_urn(account)
            self._validate_author_scope(account, author_urn)
        except SocialAdapterError as exc:
            return False, exc.message
        headers = self._linkedin_headers(token)
        async with self._client(headers=headers, base_url=settings.LINKEDIN_API_BASE_URL) as client:
            try:
                if author_urn.startswith("urn:li:organization:"):
                    org_id = author_urn.split(":")[-1]
                    await self._request_json(client, "GET", f"/rest/organizations/{org_id}")
                else:
                    await self._request_json(client, "GET", "/v2/me")
            except SocialAdapterError as exc:
                return False, exc.message
        return True, None

    async def publish(
        self,
        *,
        account: SocialPlatformAccount,
        content: str,
        title: str | None,
        media: list[Media],
        dry_run: bool = False,
    ) -> PublishResult:
        if dry_run:
            return await super().publish(account=account, content=content, title=title, media=media, dry_run=dry_run)
        if media:
            raise SocialAdapterError(
                "media_not_supported",
                "LinkedIn integration currently supports text-only posts; asset upload is not yet implemented",
            )
        token = await self.ensure_access_token(account)
        author_urn = self._author_urn(account)
        self._validate_author_scope(account, author_urn)
        headers = self._linkedin_headers(token)
        payload = {
            "author": author_urn,
            "commentary": f"{title}\n\n{content}".strip() if title else content,
            "visibility": "PUBLIC",
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": [],
            },
            "lifecycleState": "PUBLISHED",
            "isReshareDisabledByAuthor": False,
        }
        async with self._client(headers=headers, base_url=settings.LINKEDIN_API_BASE_URL) as client:
            response = await client.request("POST", "/rest/posts", json=payload)
            if response.status_code >= 400:
                try:
                    payload_data = response.json()
                except Exception:
                    payload_data = {"body": response.text}
                raise SocialAdapterError(
                    "provider_request_failed",
                    f"{self.provider} API request failed with status {response.status_code}",
                    payload=payload_data,
                )
            data = response.json() if response.content else {}
            post_id = response.headers.get("x-restli-id") or data.get("id") or data.get("entity")
        return PublishResult(
            success=True,
            provider_post_id=post_id,
            posted_at=datetime.now(timezone.utc),
            raw_response=data,
        )


ADAPTERS: dict[str, SocialProviderAdapter] = {
    "x": XAdapter(),
    "facebook": FacebookAdapter(),
    "instagram": InstagramAdapter(),
    "linkedin": LinkedInAdapter(),
}


def get_social_adapter(provider: str) -> SocialProviderAdapter:
    normalized = provider.strip().lower()
    if normalized not in ADAPTERS:
        raise ValueError(f"Unsupported social platform: {provider}")
    return ADAPTERS[normalized]


def normalize_platforms(platforms: list[str]) -> list[str]:
    normalized: list[str] = []
    seen: set[str] = set()
    for platform in platforms:
        item = platform.strip().lower()
        if not item:
            continue
        if item not in SUPPORTED_SOCIAL_PLATFORMS:
            raise ValueError(f"Unsupported social platform: {platform}")
        if item not in seen:
            seen.add(item)
            normalized.append(item)
    if not normalized:
        raise ValueError("At least one supported social platform is required")
    return normalized


def media_platform_type(media: Media) -> str:
    if media.is_image:
        return "image"
    if media.is_video:
        return "video"
    if media.mime_type == "image/gif":
        return "gif"
    if media.is_document:
        return "document"
    return media.media_type or "file"


def validate_social_payload(platform: str, *, content: str, media: list[Media]) -> list[ValidationIssue]:
    rules = PLATFORM_CONSTRAINTS[platform]
    issues: list[ValidationIssue] = []
    if len(content) > rules["max_text_length"]:
        issues.append(
            ValidationIssue(
                code="text_too_long",
                message=f"{platform} allows at most {rules['max_text_length']} characters",
            )
        )
    if len(media) > rules["max_media_count"]:
        issues.append(
            ValidationIssue(
                code="too_many_media",
                message=f"{platform} allows at most {rules['max_media_count']} media items",
            )
        )
    for item in media:
        media_type = media_platform_type(item)
        if media_type not in rules["allowed_media_types"]:
            issues.append(
                ValidationIssue(
                    code="unsupported_media_type",
                    message=f"{platform} does not support media type '{media_type}' for {item.filename}",
                )
            )
        if rules["requires_public_media_url"] and not (item.public_url or item.cdn_url):
            issues.append(
                ValidationIssue(
                    code="public_url_required",
                    message=f"{platform} requires publicly accessible media URLs for {item.filename}",
                )
            )
    return issues


def build_validation_summary(platforms: list[str], *, content: str, media: list[Media]) -> dict:
    summary: dict[str, list[dict]] = {}
    for platform in platforms:
        summary[platform] = [issue.as_dict() for issue in validate_social_payload(platform, content=content, media=media)]
    return summary


__all__ = [
    "SUPPORTED_SOCIAL_PLATFORMS",
    "PLATFORM_CONSTRAINTS",
    "PublishResult",
    "ValidationIssue",
    "build_validation_summary",
    "get_social_adapter",
    "normalize_platforms",
    "validate_social_payload",
]
