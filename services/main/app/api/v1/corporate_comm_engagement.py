"""Corporate Communication portal settings and engagement stats.

Additive module: complements ``stats.py``'s corporate dashboard and the
corporate portal routes without modifying either. Exposes:

- ``GET/PUT  /api/v1/corporate-communication-portal/settings`` — the comms
  office's own channels and the public social media links, stored in the
  existing key/value ``settings`` table under the
  ``corporate_communication.*`` namespace.
- ``GET /api/v1/corporate-communication-portal/settings/team`` — read-only
  roster of users holding Corporate Communication roles.
- ``GET /api/v1/stats/portal/corporate-communication/engagement`` — website
  page-view aggregates (first-party analytics events) plus social delivery
  outcomes per platform. Platform impressions/reach are NOT available: that
  requires per-platform insights API adapters that do not exist yet, so the
  payload carries ``social_insights_available: false`` and an explanatory
  note. Frontends must label social numbers as deliveries, not impressions.
"""

from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, select

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, user_has_scope
from ...models import (
    AnalyticsEvent,
    Permission,
    Role,
    RolePermission,
    SocialMediaDelivery,
    User,
    UserRole,
)
from ...services import SettingService
from .stats import PORTAL_STAT_SCOPES, _user_has_portal_stats_access

settings_router = APIRouter()
engagement_router = APIRouter()

SETTINGS_CATEGORY = "corporate_communication"
OFFICE_CHANNELS_KEY = "corporate_communication.office_channels"
SOCIAL_LINKS_KEY = "corporate_communication.social_links"

#: Scopes that may edit the portal settings (admin:* passes via wildcard).
SETTINGS_MANAGE_SCOPES = ("homepage.manage", "content.manage")

#: Permissions that mark a user as part of the Corporate Communication team.
TEAM_SIGNATURE_PERMISSIONS = (
    "content.manage",
    "content.manage_news",
    "content.publish",
    "content.review",
    "homepage.manage",
    "marketing.manage_social",
)

SOCIAL_INSIGHTS_NOTE = (
    "Social figures are delivery outcomes recorded by this portal (posts "
    "successfully published or failed per platform), not platform impressions "
    "or reach. Impression and reach metrics require insights-API integrations "
    "with each platform, which are not connected yet."
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class OfficeChannels(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str | None = Field(default=None, max_length=320)
    phone: str | None = Field(default=None, max_length=64)
    physical_office: str | None = Field(default=None, max_length=255)
    service_hours: str | None = Field(default=None, max_length=255)
    escalation_contact: str | None = Field(default=None, max_length=255)


class SocialLinks(BaseModel):
    model_config = ConfigDict(extra="forbid")

    facebook: str | None = Field(default=None, max_length=1024)
    twitter: str | None = Field(default=None, max_length=1024)
    instagram: str | None = Field(default=None, max_length=1024)
    linkedin: str | None = Field(default=None, max_length=1024)
    youtube: str | None = Field(default=None, max_length=1024)


class CorporateCommSettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    office_channels: OfficeChannels | None = None
    social_links: SocialLinks | None = None


# ---------------------------------------------------------------------------
# Authorization helpers
# ---------------------------------------------------------------------------


def _require_portal_access(user) -> None:
    required = PORTAL_STAT_SCOPES["corporate-communication"]
    if not _user_has_portal_stats_access(user, "corporate-communication", required):
        raise HTTPException(status_code=403, detail="Insufficient privileges")


def _require_settings_manage(user) -> None:
    if not any(user_has_scope(user, scope) for scope in SETTINGS_MANAGE_SCOPES):
        raise HTTPException(status_code=403, detail="Insufficient privileges")


# ---------------------------------------------------------------------------
# Settings endpoints
# ---------------------------------------------------------------------------


def _model_or_none(model_cls, raw) -> dict | None:
    if not isinstance(raw, dict):
        return None
    try:
        return model_cls.model_validate(raw).model_dump()
    except Exception:
        return None


@settings_router.get("")
async def get_corporate_comm_settings(db: DbSession, user: CurrentUser):
    _require_portal_access(user)
    office = await SettingService.get_by_key(db, OFFICE_CHANNELS_KEY)
    social = await SettingService.get_by_key(db, SOCIAL_LINKS_KEY)
    return success(
        data={
            "office_channels": _model_or_none(
                OfficeChannels, office.value if office else None
            ),
            "social_links": _model_or_none(
                SocialLinks, social.value if social else None
            ),
            "can_manage": any(
                user_has_scope(user, scope) for scope in SETTINGS_MANAGE_SCOPES
            ),
        }
    )


async def _upsert_setting(db, user, *, key: str, value: dict, description: str):
    existing = await SettingService.get_by_key(db, key)
    if existing is None:
        return await SettingService.create(
            db,
            updated_by_id=user.id,
            key=key,
            value=value,
            value_type="json",
            category=SETTINGS_CATEGORY,
            description=description,
            is_public=True,
        )
    return await SettingService.update(db, existing, updated_by_id=user.id, value=value)


@settings_router.put("")
async def update_corporate_comm_settings(
    payload: CorporateCommSettingsUpdate,
    db: DbSession,
    user: CurrentUser,
):
    _require_portal_access(user)
    _require_settings_manage(user)
    if payload.office_channels is None and payload.social_links is None:
        raise HTTPException(status_code=422, detail="No settings provided")
    if payload.office_channels is not None:
        await _upsert_setting(
            db,
            user,
            key=OFFICE_CHANNELS_KEY,
            value=payload.office_channels.model_dump(),
            description="Corporate Communication office contact channels",
        )
    if payload.social_links is not None:
        await _upsert_setting(
            db,
            user,
            key=SOCIAL_LINKS_KEY,
            value=payload.social_links.model_dump(),
            description="Public social media page URLs",
        )
    office = await SettingService.get_by_key(db, OFFICE_CHANNELS_KEY)
    social = await SettingService.get_by_key(db, SOCIAL_LINKS_KEY)
    return success(
        data={
            "office_channels": _model_or_none(
                OfficeChannels, office.value if office else None
            ),
            "social_links": _model_or_none(
                SocialLinks, social.value if social else None
            ),
            "can_manage": True,
        },
        message="Corporate Communication settings saved",
    )


@settings_router.get("/team")
async def list_corporate_comm_team(db: DbSession, user: CurrentUser):
    """Read-only roster of users holding Corporate Communication roles.

    A user belongs to the roster when one of their active roles grants a
    signature Corporate Communication permission. Management deep-links to the
    admin users screen; this endpoint intentionally exposes no user CRUD.
    """
    _require_portal_access(user)
    rows = (
        await db.execute(
            select(
                User.id,
                User.full_name,
                User.email,
                User.last_login_at,
                Role.name,
                Role.display_name,
            )
            .join(UserRole, UserRole.user_id == User.id)
            .join(Role, Role.id == UserRole.role_id)
            .join(RolePermission, RolePermission.role_id == Role.id)
            .join(Permission, Permission.id == RolePermission.permission_id)
            .where(
                Permission.name.in_(TEAM_SIGNATURE_PERMISSIONS),
                Permission.is_active.is_(True),
                Role.is_active.is_(True),
                UserRole.is_active.is_(True),
                UserRole.deleted_at.is_(None),
                User.is_active.is_(True),
                User.deleted_at.is_(None),
            )
            .distinct()
            .order_by(User.full_name.asc())
        )
    ).all()
    members: dict[str, dict] = {}
    for user_id, full_name, email, last_login_at, role_name, display_name in rows:
        entry = members.setdefault(
            str(user_id),
            {
                "id": str(user_id),
                "full_name": full_name,
                "email": email,
                "last_login_at": (
                    last_login_at.isoformat() if last_login_at else None
                ),
                "roles": [],
            },
        )
        label = display_name or role_name
        if label not in entry["roles"]:
            entry["roles"].append(label)
    return success(data={"members": list(members.values())})


# ---------------------------------------------------------------------------
# Engagement stats
# ---------------------------------------------------------------------------


def _engagement_window(date_from: date | None, date_to: date | None):
    resolved_to = date_to or date.today()
    resolved_from = date_from or (resolved_to - timedelta(days=29))
    days = (resolved_to - resolved_from).days + 1
    if days < 1:
        raise HTTPException(status_code=422, detail="date_from must not be after date_to")
    if days > 366:
        raise HTTPException(status_code=422, detail="Date range cannot exceed 366 days")
    start = datetime.combine(resolved_from, time.min, tzinfo=timezone.utc)
    end = datetime.combine(resolved_to + timedelta(days=1), time.min, tzinfo=timezone.utc)
    return resolved_from, resolved_to, start, end


def _page_view_filters(start: datetime, end: datetime):
    return (
        AnalyticsEvent.deleted_at.is_(None),
        AnalyticsEvent.event_type == "page_view",
        AnalyticsEvent.occurred_at >= start,
        AnalyticsEvent.occurred_at < end,
    )


DeliveryBucket = Literal["posted", "failed", "pending"]


def _delivery_bucket(status: str | None) -> DeliveryBucket:
    if status == "posted":
        return "posted"
    if status == "failed":
        return "failed"
    return "pending"


@engagement_router.get("/engagement")
async def get_corporate_communication_engagement(
    db: DbSession,
    user: CurrentUser,
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    top_limit: int = Query(10, ge=1, le=50),
):
    """Website page-view and social delivery aggregates for the comms portal.

    Website numbers come from the same first-party ``analytics_events`` table
    the school portal dashboard reads, scoped to the main public site. Social
    numbers are delivery outcomes only — see ``social_insights_available``.
    """
    _require_portal_access(user)
    resolved_from, resolved_to, start, end = _engagement_window(date_from, date_to)
    filters = _page_view_filters(start, end)

    total_views, unique_visitors = (
        await db.execute(
            select(
                func.count(AnalyticsEvent.id),
                func.count(func.distinct(AnalyticsEvent.session_hash)),
            ).where(*filters)
        )
    ).one()

    type_rows = (
        await db.execute(
            select(
                func.coalesce(AnalyticsEvent.entity_type, "page"),
                func.count(AnalyticsEvent.id),
            )
            .where(*filters)
            .group_by(func.coalesce(AnalyticsEvent.entity_type, "page"))
            .order_by(func.count(AnalyticsEvent.id).desc())
        )
    ).all()

    top_rows = (
        await db.execute(
            select(
                AnalyticsEvent.entity_type,
                AnalyticsEvent.entity_id,
                func.max(AnalyticsEvent.entity_title),
                func.max(AnalyticsEvent.entity_slug),
                func.max(AnalyticsEvent.path),
                func.count(AnalyticsEvent.id),
                func.count(func.distinct(AnalyticsEvent.session_hash)),
            )
            .where(*filters, AnalyticsEvent.entity_id.is_not(None))
            .group_by(AnalyticsEvent.entity_type, AnalyticsEvent.entity_id)
            .order_by(func.count(AnalyticsEvent.id).desc())
            .limit(top_limit)
        )
    ).all()

    bucket = func.date_trunc("day", AnalyticsEvent.occurred_at)
    trend_rows = (
        await db.execute(
            select(
                bucket.label("bucket"),
                func.count(AnalyticsEvent.id),
                func.count(func.distinct(AnalyticsEvent.session_hash)),
            )
            .where(*filters)
            .group_by(bucket)
            .order_by(bucket)
        )
    ).all()

    delivery_rows = (
        await db.execute(
            select(
                SocialMediaDelivery.platform,
                SocialMediaDelivery.status,
                func.count(SocialMediaDelivery.id),
            )
            .where(
                SocialMediaDelivery.deleted_at.is_(None),
                SocialMediaDelivery.created_at >= start,
                SocialMediaDelivery.created_at < end,
            )
            .group_by(SocialMediaDelivery.platform, SocialMediaDelivery.status)
        )
    ).all()

    by_platform: dict[str, dict[str, int]] = {}
    totals = {"posted": 0, "failed": 0, "pending": 0}
    for platform, status, count in delivery_rows:
        entry = by_platform.setdefault(
            str(platform), {"posted": 0, "failed": 0, "pending": 0}
        )
        bucket_key = _delivery_bucket(status)
        entry[bucket_key] += int(count or 0)
        totals[bucket_key] += int(count or 0)

    return success(
        data={
            "period": {
                "date_from": resolved_from.isoformat(),
                "date_to": resolved_to.isoformat(),
            },
            "website": {
                "page_views": int(total_views or 0),
                "unique_visitors": int(unique_visitors or 0),
                "views_by_type": [
                    {
                        "key": str(key),
                        "label": str(key).replace("_", " ").title(),
                        "views": int(count or 0),
                    }
                    for key, count in type_rows
                ],
                "top_content": [
                    {
                        "entity_type": entity_type,
                        "entity_id": str(entity_id),
                        "title": title,
                        "slug": slug,
                        "path": path,
                        "views": int(views or 0),
                        "visitors": int(visitors or 0),
                    }
                    for entity_type, entity_id, title, slug, path, views, visitors in top_rows
                ],
                "trend": [
                    {
                        "bucket": (
                            row[0].isoformat()
                            if hasattr(row[0], "isoformat")
                            else str(row[0])
                        ),
                        "views": int(row[1] or 0),
                        "visitors": int(row[2] or 0),
                    }
                    for row in trend_rows
                ],
            },
            "social": {
                "totals": {**totals, "total": sum(totals.values())},
                "by_platform": [
                    {
                        "platform": platform,
                        **counts,
                        "total": sum(counts.values()),
                    }
                    for platform, counts in sorted(by_platform.items())
                ],
                "social_insights_available": False,
                "note": SOCIAL_INSIGHTS_NOTE,
            },
            "social_insights_available": False,
            "note": SOCIAL_INSIGHTS_NOTE,
        }
    )


__all__ = [
    "OFFICE_CHANNELS_KEY",
    "SETTINGS_CATEGORY",
    "SETTINGS_MANAGE_SCOPES",
    "SOCIAL_INSIGHTS_NOTE",
    "SOCIAL_LINKS_KEY",
    "TEAM_SIGNATURE_PERMISSIONS",
    "engagement_router",
    "settings_router",
]
