"""Validated public Page CMS source reads from the Research service."""

from __future__ import annotations

import ipaddress
import math
import uuid
from datetime import date
from typing import Any
from urllib.parse import urlparse

import httpx

from ..core.config import get_settings
from .page_cms_source_errors import PageCmsSourceProviderError

settings = get_settings()

SUPPORTED_RESEARCH_CONTENT_SOURCE_TYPES = frozenset({"research_project", "publication"})
MAX_RESEARCH_CONTENT_PAGE = 100
MAX_RESEARCH_CONTENT_PER_PAGE = 50
MAX_RESEARCH_CONTENT_IDS = 100
RESEARCH_CONTENT_STATUSES = {
    "research_project": frozenset({"approved", "ongoing", "completed"}),
    "publication": frozenset({"published"}),
}
RESEARCH_CONTENT_METADATA_KEYS = {
    "research_project": frozenset({"project_type", "progress_percentage"}),
    "publication": frozenset({"publication_type", "journal_name", "year", "is_open_access"}),
}
FORBIDDEN_RESEARCH_CONTENT_METADATA_KEYS = frozenset({"storage_path", "provider", "public_url", "cdn_url"})


class ResearchContentSourcesProxyService:
    """Use the Research public source contract without leaking provider payloads."""

    @classmethod
    async def search(
        cls,
        source_type: str,
        *,
        page: int = 1,
        per_page: int = 20,
        search: str | None = None,
        center_id: uuid.UUID | None = None,
    ) -> dict[str, Any]:
        cls._validate_source_type(source_type)
        params: dict[str, Any] = {
            "page": max(1, min(page, MAX_RESEARCH_CONTENT_PAGE)),
            "per_page": max(1, min(per_page, MAX_RESEARCH_CONTENT_PER_PAGE)),
        }
        if search:
            params["search"] = search
        if center_id is not None:
            params["center_id"] = str(center_id)
        payload = await cls._request(
            "get",
            f"/api/v1/page-cms-sources/{source_type}",
            params=params,
        )
        return cls._validate_page_payload(source_type, payload)

    @classmethod
    async def resolve_many(
        cls,
        source_type: str,
        ids: list[uuid.UUID],
        *,
        center_id: uuid.UUID | None = None,
    ) -> list[dict[str, Any]]:
        cls._validate_source_type(source_type)
        if len(ids) > MAX_RESEARCH_CONTENT_IDS:
            raise PageCmsSourceProviderError(f"Research content resolution accepts at most {MAX_RESEARCH_CONTENT_IDS} ids")
        payload = await cls._request(
            "post",
            f"/api/v1/page-cms-sources/{source_type}/resolve",
            json={"ids": [str(item_id) for item_id in ids], "center_id": str(center_id) if center_id else None},
        )
        data = payload.get("data") if isinstance(payload, dict) and payload.get("status") == "success" else None
        if not isinstance(data, list):
            raise PageCmsSourceProviderError("Research content provider returned an invalid resolution payload")
        return [cls._validate_summary(source_type, item) for item in data]

    @staticmethod
    def _validate_source_type(source_type: str) -> None:
        if source_type not in SUPPORTED_RESEARCH_CONTENT_SOURCE_TYPES:
            raise PageCmsSourceProviderError(f"Unsupported research content source type: {source_type}")

    @staticmethod
    async def _request(method: str, path: str, **kwargs) -> dict[str, Any]:
        try:
            async with httpx.AsyncClient(
                base_url=settings.RESEARCH_SERVICE_URL.rstrip("/"),
                timeout=httpx.Timeout(20.0, connect=5.0),
                headers={"X-KSU-Proxy": "main-page-cms-sources"},
            ) as client:
                response = await getattr(client, method)(path, **kwargs)
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise PageCmsSourceProviderError("Research content provider is unavailable") from exc
        if not isinstance(payload, dict):
            raise PageCmsSourceProviderError("Research content provider returned an invalid payload")
        return payload

    @classmethod
    def _validate_page_payload(cls, source_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        data = payload.get("data") if payload.get("status") == "success" else None
        meta = payload.get("meta")
        if not isinstance(data, list) or not isinstance(meta, dict):
            raise PageCmsSourceProviderError("Research content provider returned an invalid page payload")
        for key in ("page", "per_page", "total", "pages"):
            value = meta.get(key)
            if not isinstance(value, int) or isinstance(value, bool) or value < 0:
                raise PageCmsSourceProviderError("Research content provider returned invalid pagination metadata")
        page = meta["page"]
        per_page = meta["per_page"]
        total = meta["total"]
        pages = meta["pages"]
        if not 1 <= page <= MAX_RESEARCH_CONTENT_PAGE or not 1 <= per_page <= MAX_RESEARCH_CONTENT_PER_PAGE:
            raise PageCmsSourceProviderError("Research content provider returned invalid pagination metadata")
        expected_pages = math.ceil(total / per_page) if total else 0
        if pages != expected_pages:
            raise PageCmsSourceProviderError("Research content provider returned inconsistent pagination metadata")
        if page > pages and data:
            raise PageCmsSourceProviderError("Research content provider returned invalid pagination metadata")
        remaining_items = max(total - ((page - 1) * per_page), 0)
        if len(data) > per_page or len(data) > remaining_items:
            raise PageCmsSourceProviderError("Research content provider returned invalid pagination item count")
        return {"data": [cls._validate_summary(source_type, item) for item in data], "meta": meta}

    @staticmethod
    def _validate_summary(source_type: str, item: Any) -> dict[str, Any]:
        if not isinstance(item, dict):
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        required_keys = {
            "id", "source_type", "label", "secondary_label", "status", "published_at", "thumbnail_url", "metadata",
            "selectable",
        }
        if set(item) != required_keys or item.get("source_type") != source_type:
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        try:
            if not isinstance(item["id"], str):
                raise ValueError("id must be a UUID string")
            uuid.UUID(item["id"])
        except (TypeError, ValueError) as exc:
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary") from exc
        if (
            not isinstance(item["label"], str)
            or not item["label"].strip()
            or not isinstance(item["status"], str)
            or item["status"] not in RESEARCH_CONTENT_STATUSES[source_type]
        ):
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        if item["secondary_label"] is not None and (
            not isinstance(item["secondary_label"], str) or not item["secondary_label"].strip()
        ):
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        if item["published_at"] is not None and not _is_iso_date(item["published_at"]):
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        if item["thumbnail_url"] is not None and not _is_safe_public_url(item["thumbnail_url"]):
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        if not isinstance(item["selectable"], bool):
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        metadata = item["metadata"]
        if not isinstance(metadata, dict):
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        metadata_keys = set(metadata)
        if (
            metadata_keys & FORBIDDEN_RESEARCH_CONTENT_METADATA_KEYS
            or not metadata_keys <= RESEARCH_CONTENT_METADATA_KEYS[source_type]
            or any(not _is_safe_metadata_value(value) for value in metadata.values())
        ):
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        return item


def _is_iso_date(value: Any) -> bool:
    if not isinstance(value, str):
        return False
    try:
        return date.fromisoformat(value).isoformat() == value
    except ValueError:
        return False


def _is_numeric_hostname_candidate(hostname: str) -> bool:
    return all(
        component.isdecimal()
        or (
            component.startswith("0x")
            and len(component) > 2
            and all(character in "0123456789abcdef" for character in component[2:])
        )
        for component in hostname.split(".")
    )


def _has_unsafe_authority(value: str) -> bool:
    scheme, separator, remainder = value.partition(":")
    if not separator or scheme.lower() not in {"http", "https"} or not remainder.startswith("//"):
        return False
    authority = remainder[2:]
    for delimiter in "/?#":
        authority = authority.split(delimiter, 1)[0]
    return any(
        character in {"%", "\\"}
        or ord(character) < 32
        or 127 <= ord(character) <= 159
        or ord(character) > 127
        for character in authority
    )


def _is_safe_public_url(value: Any) -> bool:
    if not isinstance(value, str) or not value or value != value.strip() or _has_unsafe_authority(value):
        return False
    try:
        parsed = urlparse(value)
    except ValueError:
        return False
    if parsed.scheme in {"http", "https"}:
        if not parsed.netloc or parsed.username is not None or parsed.password is not None:
            return False
        try:
            hostname = parsed.hostname
            parsed.port
        except ValueError:
            return False
        if hostname is None:
            return False
        hostname = hostname.rstrip(".").lower()
        if hostname == "localhost" or hostname.endswith((".localhost", ".local", ".internal")):
            return False
        try:
            address = ipaddress.ip_address(hostname)
        except ValueError:
            if _is_numeric_hostname_candidate(hostname):
                return False
            return True
        return address.is_global and not any(
            (
                address.is_loopback,
                address.is_private,
                address.is_link_local,
                address.is_multicast,
                address.is_reserved,
                address.is_unspecified,
            )
        )
    return value.startswith("/") and not value.startswith("//") and not parsed.scheme and not parsed.netloc


def _is_safe_metadata_value(value: Any) -> bool:
    allowed_primitive_types = (str, int, bool)
    if value is None or isinstance(value, allowed_primitive_types):
        return True
    return isinstance(value, list) and all(
        item is None or isinstance(item, allowed_primitive_types) for item in value
    )


__all__ = [
    "MAX_RESEARCH_CONTENT_IDS",
    "MAX_RESEARCH_CONTENT_PAGE",
    "MAX_RESEARCH_CONTENT_PER_PAGE",
    "ResearchContentSourcesProxyService",
    "SUPPORTED_RESEARCH_CONTENT_SOURCE_TYPES",
]
