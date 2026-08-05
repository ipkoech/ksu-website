"""Per-resource CSV exports reusing each domain's admin listing path."""

from __future__ import annotations

import csv
import inspect
import io
import json
import uuid
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Awaitable, Callable, Iterator

from fastapi import APIRouter, HTTPException, Request, params as fastapi_params, status
from fastapi.responses import StreamingResponse

from ...deps import CurrentUser, DbSession, user_has_scope
from ._fields import MainFieldsQuery
from .announcements import list_admin_announcements
from .blogs import list_admin_blogs
from .contacts import list_admin_contacts
from .documents import list_admin_documents
from .events import list_admin_events
from .faqs import list_admin_faqs
from .news import list_admin_news
from .newsletters import NEWSLETTER_ADMIN_SCOPE, list_newsletter_subscribers
from .policies import list_admin_policies
from .stories import list_admin_stories
from .testimonials import list_admin_testimonials

router = APIRouter()

EXPORT_PAGE_SIZE = 100
MAX_EXPORT_ROWS = 10_000
LIFECYCLE_COLUMNS = ("status", "workflow_status", "published_at", "updated_at", "created_at")

_UUID_PARAMS = {"scope_id", "owner_scope_id", "contributor_user_id", "school_id", "division_id", "department_id", "programme_id"}
_BOOL_PARAMS = {"is_main", "is_published", "is_public", "is_active", "featured_only", "is_featured"}
_DATETIME_PARAMS = {"scheduled_from", "scheduled_to"}
_RESERVED_PARAMS = {"db", "user", "_", "page", "per_page", "fields", "include"}
_RECORD_STATES = {"active", "archived", "deleted"}

ListEndpoint = Callable[..., Awaitable[dict[str, Any]]]


@dataclass(frozen=True)
class ExportSource:
    """How one resource's rows are fetched and shaped for CSV export."""

    list_endpoint: ListEndpoint
    columns: tuple[str, ...]
    takes_user: bool = True
    required_scopes: tuple[str, ...] = ()

    @property
    def filter_params(self) -> frozenset[str]:
        return frozenset(
            name
            for name in inspect.signature(self.list_endpoint).parameters
            if name not in _RESERVED_PARAMS
        )

    def base_kwargs(self) -> dict[str, Any]:
        """Real defaults for filter params, unwrapping FastAPI Query() sentinels.

        Calling a route function directly skips FastAPI's dependency layer, so
        parameters declared as ``Query(default=...)`` would otherwise receive
        the ``Query`` object itself.
        """
        defaults: dict[str, Any] = {}
        for name, parameter in inspect.signature(self.list_endpoint).parameters.items():
            if name not in self.filter_params or parameter.default is inspect.Parameter.empty:
                continue
            default = parameter.default
            if isinstance(default, fastapi_params.Param):
                default = default.default
            defaults[name] = default
        return defaults


EXPORT_SOURCES: dict[str, ExportSource] = {
    "news": ExportSource(
        list_admin_news,
        ("id", "title", "slug", "scope_type", "scope_id", "owner_portal", "is_published"),
    ),
    "announcements": ExportSource(
        list_admin_announcements,
        ("id", "title", "scope_type", "scope_id", "owner_portal", "is_published"),
    ),
    "events": ExportSource(
        list_admin_events,
        ("id", "title", "slug", "start_date", "end_date", "location", "scope_type", "scope_id", "is_published"),
    ),
    "blogs": ExportSource(
        list_admin_blogs,
        ("id", "title", "slug", "scope_type", "scope_id", "owner_portal", "is_published"),
        required_scopes=("content.manage_news",),
    ),
    "stories": ExportSource(
        list_admin_stories,
        ("id", "title", "slug", "story_type", "category", "is_published"),
        required_scopes=("content.manage_stories",),
    ),
    "contacts": ExportSource(
        list_admin_contacts,
        ("id", "name", "contact_type", "email", "phone", "scope_type", "scope_id", "is_public"),
    ),
    "faqs": ExportSource(
        list_admin_faqs,
        ("id", "question", "answer", "category", "scope_type", "scope_id", "is_public"),
    ),
    "testimonials": ExportSource(
        list_admin_testimonials,
        ("id", "name", "role", "testimonial_type", "quote", "is_featured"),
    ),
    "newsletter-subscribers": ExportSource(
        list_newsletter_subscribers,
        ("id", "email", "name", "frequency", "is_verified", "subscribed_at", "unsubscribed_at"),
        takes_user=False,
        required_scopes=(NEWSLETTER_ADMIN_SCOPE,),
    ),
    "documents": ExportSource(
        list_admin_documents,
        ("id", "title", "document_type", "category", "scope_type", "scope_id"),
    ),
    "policies": ExportSource(
        list_admin_policies,
        ("id", "title", "code", "category", "division_id", "department_id", "version", "effective_date", "is_public"),
    ),
}


def _coerce_param(name: str, raw: str) -> Any:
    if name in _UUID_PARAMS:
        try:
            return uuid.UUID(raw)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid UUID for {name}") from exc
    if name in _BOOL_PARAMS:
        lowered = raw.strip().lower()
        if lowered in {"true", "1", "yes"}:
            return True
        if lowered in {"false", "0", "no"}:
            return False
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid boolean for {name}")
    if name in _DATETIME_PARAMS:
        try:
            return datetime.fromisoformat(raw)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid datetime for {name}") from exc
    if name == "record_state" and raw not in _RECORD_STATES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid record_state")
    return raw


def _export_filters(source: ExportSource, request: Request) -> dict[str, Any]:
    """Pass the caller's query params through to the admin list endpoint."""
    allowed = source.filter_params
    return {
        name: _coerce_param(name, raw)
        for name, raw in request.query_params.items()
        if name in allowed and raw != ""
    }


async def _fetch_all(source: ExportSource, db: DbSession, user: CurrentUser, filters: dict[str, Any]) -> list[Any]:
    items: list[Any] = []
    filters = {**source.base_kwargs(), **filters}
    page = 1
    while len(items) < MAX_EXPORT_ROWS:
        args: list[Any] = [db]
        if source.takes_user:
            args.append(user)
        envelope = await source.list_endpoint(
            *args,
            page=page,
            per_page=EXPORT_PAGE_SIZE,
            fields=MainFieldsQuery(),
            **filters,
        )
        batch = list(envelope["data"])
        items.extend(batch)
        if len(batch) < EXPORT_PAGE_SIZE:
            break
        page += 1
    return items[:MAX_EXPORT_ROWS]


def _cell(value: Any) -> Any:
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, (dict, list)):
        return json.dumps(value, default=str)
    return value


def _csv_rows(columns: tuple[str, ...], items: list[Any]) -> Iterator[str]:
    buffer = io.StringIO()
    writer = csv.writer(buffer)

    def flush() -> str:
        rendered = buffer.getvalue()
        buffer.seek(0)
        buffer.truncate(0)
        return rendered

    writer.writerow(columns)
    yield flush()
    for item in items:
        writer.writerow(_cell(_value(item, column)) for column in columns)
        yield flush()


def _value(item: Any, column: str) -> Any:
    if isinstance(item, dict):
        return item.get(column)
    return getattr(item, column, None)


@router.get("/{resource}.csv")
async def export_resource_csv(resource: str, request: Request, db: DbSession, user: CurrentUser):
    """Export a resource's admin listing (honoring the caller's filters) as CSV."""
    source = EXPORT_SOURCES.get(resource)
    if source is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unknown export resource")
    if source.required_scopes and not any(user_has_scope(user, scope) for scope in source.required_scopes):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")

    filters = _export_filters(source, request)
    items = await _fetch_all(source, db, user, filters)
    columns = source.columns + tuple(name for name in LIFECYCLE_COLUMNS if name not in source.columns)
    return StreamingResponse(
        _csv_rows(columns, items),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{resource}.csv"'},
    )
