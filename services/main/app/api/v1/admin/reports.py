"""Admin analytics report endpoints."""

from __future__ import annotations

import csv
import io
from typing import Any

from fastapi import APIRouter, Depends, Query, Response

from ksu_common.schemas.responses import success

from ....deps import CurrentUser, DbSession, require_scope
from ....services import AnalyticsService

router = APIRouter(dependencies=[Depends(require_scope("analytics.view"))])


def _csv_response(filename: str, rows: list[dict[str, Any]]) -> Response:
    buffer = io.StringIO()
    fieldnames = sorted({key for row in rows for key in row.keys()}) if rows else ["label", "value"]
    writer = csv.DictWriter(buffer, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
    return Response(
        content=buffer.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/overview")
async def overview(db: DbSession, _: CurrentUser, days: int = Query(30, ge=1, le=366)):
    return success(data=await AnalyticsService.overview(db, days=days))


@router.get("/traffic")
async def traffic(db: DbSession, _: CurrentUser, days: int = Query(30, ge=1, le=366)):
    return success(data=await AnalyticsService.traffic(db, days=days))


@router.get("/content")
async def content(db: DbSession, _: CurrentUser, days: int = Query(30, ge=1, le=366)):
    return success(data=await AnalyticsService.content(db, days=days))


@router.get("/admin-activity")
async def admin_activity(db: DbSession, _: CurrentUser, days: int = Query(30, ge=1, le=366)):
    return success(data=await AnalyticsService.admin_activity(db, days=days))


@router.get("/exports/{report_name}")
async def export_report(
    report_name: str,
    db: DbSession,
    _: CurrentUser,
    days: int = Query(30, ge=1, le=366),
    format: str = Query("csv", pattern="^(csv|json)$"),
):
    reports = {
        "overview": await AnalyticsService.overview(db, days=days),
        "traffic": await AnalyticsService.traffic(db, days=days),
        "content": await AnalyticsService.content(db, days=days),
        "admin-activity": await AnalyticsService.admin_activity(db, days=days),
    }
    data = reports.get(report_name)
    if data is None:
        return success(data={"error": "Unknown report"}, meta={"available": list(reports)})

    if format == "json":
        return success(data=data)

    rows: list[dict[str, Any]] = []
    for key, value in data.items():
        if isinstance(value, list):
            rows.extend({"section": key, **item} for item in value if isinstance(item, dict))
        else:
            rows.append({"section": "summary", "label": key, "value": value})
    return _csv_response(f"{report_name}-{days}d.csv", rows)
