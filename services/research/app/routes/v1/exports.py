"""Research data export endpoints."""

from __future__ import annotations

import json
from typing import Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.schemas.responses import success

from ...core.auth import require_scope
from ...core.database import get_db
from ...services.exports import ResearchExportService

router = APIRouter(tags=["Research Exports"], dependencies=[Depends(require_scope("research:write"))])


@router.get("/exports/{resource_key}")
async def export_research_resource(
    resource_key: str,
    format: str = Query("csv", pattern="^(csv|json)$"),
    search: str | None = None,
    status: str | None = None,
    is_active: bool | None = None,
    is_featured: bool | None = None,
    is_public: bool | None = None,
    is_open_access: bool | None = None,
    category: str | None = None,
    grant_type: str | None = None,
    project_type: str | None = None,
    publication_type: str | None = None,
    partner_type: str | None = None,
    consultancy_type: str | None = None,
    fund_type: str | None = None,
    output_type: str | None = None,
    program_type: str | None = None,
    delivery_mode: str | None = None,
    scholarship_type: str | None = None,
    initiative_type: str | None = None,
    center_id: uuid.UUID | None = None,
    program_id: uuid.UUID | None = None,
    project_id: uuid.UUID | None = None,
    partner_id: uuid.UUID | None = None,
    pi_id: uuid.UUID | None = None,
    journal_id: uuid.UUID | None = None,
    grant_id: uuid.UUID | None = None,
    farm_id: uuid.UUID | None = None,
    has_grant: bool | None = None,
    missing_pi: bool | None = None,
    start_date_from: str | None = None,
    end_date_to: str | None = None,
    report_type: str | None = None,
    funder_type: str | None = None,
    is_required: bool | None = None,
    is_accepting_contributions: bool | None = None,
    year: int | None = Query(default=None, ge=1900, le=2200),
    sort: str | None = Query(default=None, max_length=64),
    order: str | None = Query(default="desc", pattern="^(asc|desc)$"),
    limit: int = Query(default=5000, ge=1, le=10000),
    db: AsyncSession = Depends(get_db),
):
    config = ResearchExportService.get_config(resource_key)
    if config is None:
        raise HTTPException(status_code=404, detail="Research export resource not found")

    rows = await ResearchExportService.rows(
        db,
        config,
        search=search,
        filters=_compact_filters(
            {
                "status": status,
                "is_active": is_active,
                "is_featured": is_featured,
                "is_public": is_public,
                "is_open_access": is_open_access,
                "category": category,
                "grant_type": grant_type,
                "project_type": project_type,
                "publication_type": publication_type,
                "partner_type": partner_type,
                "consultancy_type": consultancy_type,
                "fund_type": fund_type,
                "output_type": output_type,
                "program_type": program_type,
                "delivery_mode": delivery_mode,
                "scholarship_type": scholarship_type,
                "initiative_type": initiative_type,
                "center_id": center_id,
                "program_id": program_id,
                "project_id": project_id,
                "partner_id": partner_id,
                "pi_id": pi_id,
                "journal_id": journal_id,
                "grant_id": grant_id,
                "farm_id": farm_id,
                "has_grant": has_grant,
                "missing_pi": missing_pi,
                "start_date_from": start_date_from,
                "end_date_to": end_date_to,
                "report_type": report_type,
                "funder_type": funder_type,
                "is_required": is_required,
                "is_accepting_contributions": is_accepting_contributions,
            }
        ),
        year=year,
        sort=sort,
        order=order,
        limit=limit,
    )

    if format == "json":
        return success(data=rows, meta={"resource": config.key, "total": len(rows)})

    return Response(
        content=ResearchExportService.to_csv(config, rows),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{config.filename}.csv"'},
    )


def _compact_filters(filters: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in filters.items() if value is not None}
