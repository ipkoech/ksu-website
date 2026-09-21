"""Canonical HERI partner projection synchronization in the caller transaction."""

import asyncio
from typing import Any
from uuid import UUID

import httpx
from fastapi import HTTPException, status
from ksu_common.internal_client import get_integration_pool, internal_headers
from sqlalchemy import select, text, update
from sqlalchemy.exc import DBAPIError

from ..core.auth import authorize_permission
from ..core.config import get_settings
from ..models.content import SiteSettings
from ..models.partners import Partner
from .audit import record_audit


def _merge_center_links(target, incoming):
    for partner_id, link in incoming.items():
        if partner_id in target and target[partner_id][0] != link[0]:
            raise ValueError("Partner has multiple centers; explicit projection reconciliation is required")
        target[partner_id] = link


async def _resolve_partner_center_links(
    pool: Any,
    base_url: str,
    api_key: str,
    centers: list[dict[str, object]],
) -> dict[str, tuple[str, str]]:
    """Resolve center relationships with one bounded request per sync."""
    center_by_partner: dict[str, tuple[str, str]] = {}
    center_ids = [
        str(center["id"])
        for center in centers
        if isinstance(center, dict) and center.get("id")
    ]
    center_slugs = {
        str(center["id"]): str(center.get("slug") or "")
        for center in centers
        if isinstance(center, dict) and center.get("id")
}
    def add_links(links: object, *, default_center_id: str | None = None) -> None:
        if not isinstance(links, list):
            return
        for partner in links:
            if not isinstance(partner, dict) or not partner.get("id"):
                continue
            center_id = str(partner.get("center_id") or default_center_id or "")
            if center_id:
                _merge_center_links(center_by_partner, {str(partner["id"]): (
                    center_id,
                    str(partner.get("center_slug") or center_slugs.get(center_id) or ""),
                )})

    if not center_ids:
        return center_by_partner

    # New Research deployments resolve all center relationships in one
    # bounded query. During a rolling upgrade, retain the old per-center
    # adapter until the batch endpoint is available everywhere.
    batch_response = await pool.request_internal(
        "research-heri-partner-sync",
        base_url,
        "POST",
        "/api/v1/internal/center-partners",
        api_key=api_key,
        timeout=15.0,
        json={"center_ids": center_ids[:100]},
    )
    if batch_response.is_success:
        batch_payload = batch_response.json()
        add_links(_snapshot_records(batch_payload, max_records=10000))
        return center_by_partner

    if batch_response.status_code not in {404, 405}:
        batch_response.raise_for_status()

    for center_id in center_ids[:100]:
        links_response = await pool.request_internal(
            "research-heri-partner-sync",
            base_url,
            "GET",
            f"/api/v1/internal/centers/{center_id}/partners",
            api_key=api_key,
            timeout=15.0,
        )
        links_response.raise_for_status()
        links_payload = links_response.json()
        add_links(
            _snapshot_records(links_payload, max_records=10000),
            default_center_id=center_id,
        )
    return center_by_partner


SYNC_FETCH_DEADLINE_SECONDS = 30


def _snapshot_records(payload, *, max_records=100):
    records = payload.get("data") if isinstance(payload, dict) else payload
    if not isinstance(records, list) or len(records) > max_records or any(not isinstance(record, dict) for record in records):
        raise ValueError("Malformed Research snapshot")
    return records


async def _fetch_snapshot_pages(pool, settings, path):
    records = []
    seen = set()
    expected_total = None
    for page in range(1, 101):
        response = await pool.request_internal(
            "research-heri-partner-sync", settings.RESEARCH_SERVICE_URL.rstrip("/"),
            "GET", path, api_key=settings.RESEARCH_SERVICE_API_KEY, timeout=15.0,
            params={"page": page, "per_page": 100},
        )
        response.raise_for_status()
        payload = response.json()
        batch = _snapshot_records(payload)
        for record in batch:
            identifier = record.get("id")
            if not isinstance(identifier, str) or not identifier or identifier in seen:
                raise ValueError("Invalid or repeated Research snapshot identity")
            seen.add(identifier)
        records.extend(batch)
        meta = payload.get("meta") if isinstance(payload, dict) else None
        pages = meta.get("pages") if isinstance(meta, dict) else None
        if isinstance(meta, dict) and "total" in meta:
            total = meta["total"]
            if type(total) is not int or total < 0 or (expected_total is not None and expected_total != total):
                raise ValueError("Research snapshot totals changed during pagination")
            expected_total = total
        if isinstance(meta, dict) and "page" in meta and meta["page"] != page:
            raise ValueError("Research returned an unexpected page")
        if pages is not None:
            if type(pages) is not int or pages < 0 or pages > 100:
                raise ValueError("Invalid or oversized Research snapshot pagination")
            if page >= pages:
                if expected_total is not None and len(records) != expected_total:
                    raise ValueError("Incomplete Research snapshot total")
                return records
            if not batch:
                raise ValueError("Incomplete Research snapshot pagination")
        elif len(batch) < 100:
            if expected_total is not None and len(records) != expected_total:
                raise ValueError("Incomplete Research snapshot total")
            return records
    raise ValueError("Research snapshot exceeds bounded synchronous capacity")


async def _fetch_partner_snapshot(settings):
    pool = get_integration_pool()
    source_records = await _fetch_snapshot_pages(pool, settings, "/api/v1/internal/partners")
    centers = await _fetch_snapshot_pages(pool, settings, "/api/v1/internal/centers")
    center_by_partner = {}
    for offset in range(0, len(centers), 100):
        _merge_center_links(center_by_partner, await _resolve_partner_center_links(
            pool, settings.RESEARCH_SERVICE_URL.rstrip("/"), settings.RESEARCH_SERVICE_API_KEY,
            centers[offset:offset + 100],
        ))
    return source_records, center_by_partner


def _require_sync_actor(actor):
    if not authorize_permission(actor, "heri.integrations.sync").allowed:
        raise HTTPException(403, "Insufficient privileges for HERI synchronization")


async def sync_partners(db, *, actor, ip_address=None):
    """Refresh HERI partner projections from the canonical Research Service."""
    _require_sync_actor(actor)
    settings = get_settings()
    try:
        internal_headers(settings.RESEARCH_SERVICE_API_KEY)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Research integration is not configured",
        ) from exc
    try:
        async with asyncio.timeout(SYNC_FETCH_DEADLINE_SECONDS):
            source_records, center_by_partner = await _fetch_partner_snapshot(settings)
    except TimeoutError as exc:
        raise HTTPException(504, "Research synchronization fetch timed out") from exc
    except (httpx.HTTPError, ValueError, TypeError) as exc:
        raise HTTPException(502, "Research synchronization snapshot unavailable") from exc
    try:
        source_ids = [UUID(source["id"]) for source in source_records]
        if len(set(source_ids)) != len(source_ids):
            raise ValueError("Duplicate canonical identities")
    except (ValueError, TypeError, KeyError) as exc:
        raise HTTPException(502, "Research synchronization snapshot has invalid identities") from exc
    _require_sync_actor(actor)
    # The existing synchronous command serializes its apply phase. All generic
    # writers protect Research IDs, so concurrent syncs cannot create duplicates.
    try:
        await db.execute(text("SET LOCAL lock_timeout = '5s'"))
        await db.execute(text("SELECT pg_advisory_xact_lock(1263752521)"))
    except DBAPIError as exc:
        if getattr(exc.orig, "sqlstate", None) == "55P03":
            raise HTTPException(503, "Partner synchronization is busy", headers={"Retry-After": "5"}) from exc
        raise
    _require_sync_actor(actor)
    existing = (await db.scalars(select(Partner).where(Partner.research_partner_id.in_(source_ids))
                                .order_by(Partner.id).with_for_update()
                                .execution_options(populate_existing=True))).all()
    by_source = {record.research_partner_id: record for record in existing}
    if len(by_source) != len(existing):
        raise HTTPException(409, "Duplicate local partner projections require reconciliation")
    center_slugs = {slug for _, slug in center_by_partner.values() if slug}
    if len(center_slugs) == 1:
        settings_record = (await db.execute(select(SiteSettings).order_by(SiteSettings.created_at.asc()))).scalars().first()
        if settings_record is not None and not settings_record.research_center_slug:
            settings_record.research_center_slug = next(iter(center_slugs))
    created = updated = 0
    for source_id, source in zip(source_ids, source_records):
        record = by_source.get(source_id)
        values = {
            "research_partner_id": source_id,
            "slug": source.get("slug") or f"partner-{str(source_id)[:8]}",
            "name": source.get("name") or "Unnamed partner",
            "description": source.get("about") or source.get("description") or "",
            "about": source.get("about"),
            "logo_url": source.get("logo_url") or source.get("logo_image_url"),
            "website_url": source.get("website") or source.get("website_url"),
            "country": source.get("country"),
            "partner_type": source.get("partner_type"),
            "partnership_level": source.get("partnership_level"),
            "relationship_status": source.get("status") or "active",
            "research_center_id": (center_by_partner.get(str(source_id)) or (None, None))[0],
            "research_center_slug": (center_by_partner.get(str(source_id)) or (None, None))[1],
            "is_active": source.get("is_active", True),
            "is_featured": source.get("is_featured", False),
        }
        if record is None:
            db.add(Partner(**values))
            created += 1
        else:
            for key, value in values.items():
                setattr(record, key, value)
            updated += 1
    # An omitted Research projection is no longer in the complete public source
    # snapshot. Hide it without deleting local notes or independently authored
    # partners. A later source reappearance can reactivate the same projection.
    retired = await db.execute(update(Partner).where(
        Partner.research_partner_id.is_not(None), Partner.research_partner_id.not_in(source_ids),
        Partner.deleted_at.is_(None), Partner.is_active.is_(True),
    ).values(is_active=False).execution_options(synchronize_session=False))
    deactivated = retired.rowcount
    await record_audit(db, action="sync", entity_type="partners", entity_id="bulk", actor_id=str(actor.sub), new_value={"created": created, "updated": updated, "deactivated": deactivated}, ip_address=ip_address)
    return {"created": created, "updated": updated, "total": created + updated, "deactivated": deactivated}
