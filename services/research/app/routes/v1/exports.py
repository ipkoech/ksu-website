"""Research data export endpoints."""

import json
from pathlib import Path
from typing import Any
import uuid

from celery.result import AsyncResult
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.response_validation import allow_response_model_exemption
from ksu_common.schemas.responses import success

from ...core.auth import require_scope
from ...core.database import get_db
from ...schemas.exports import (
    ResearchExportJobRead,
    ResearchExportJobSuccessResponse,
    ResearchExportJSONResponse,
)
from ...services.exports import ResearchExportService
from ...tasks.celery_app import celery_app

RESEARCH_WRITE_SCOPE = require_scope("research:write")

router = APIRouter(tags=["Research Exports"], dependencies=[Depends(RESEARCH_WRITE_SCOPE)])


@router.post(
    "/exports/{resource_key}/jobs",
    status_code=202,
    response_model=ResearchExportJobSuccessResponse,
)
async def queue_research_export(
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
):
    config = ResearchExportService.get_config(resource_key)
    if config is None:
        raise HTTPException(status_code=404, detail="Research export resource not found")

    task = celery_app.send_task(
        "research.exports.generate",
        kwargs={
            "resource_key": resource_key,
            "options": _export_options(
                format=format,
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
            ),
        },
    )
    return success(
        data=ResearchExportJobRead(
            job_id=task.id,
            status="PENDING",
            resource=config.key,
        ).model_dump(mode="json"),
        message="Export queued",
    )


@router.get("/exports/jobs/{job_id}", response_model=ResearchExportJobSuccessResponse)
async def get_research_export_job(job_id: str):
    result = AsyncResult(job_id, app=celery_app)
    result_data = result.result if result.successful() else {}
    error = str(result.result) if result.failed() else None

    return success(
        data=ResearchExportJobRead(
            job_id=job_id,
            status=result.status,
            resource=result_data.get("resource") if isinstance(result_data, dict) else None,
            download_url=f"/api/v1/exports/jobs/{job_id}/download" if result.successful() else None,
            filename=result_data.get("filename") if isinstance(result_data, dict) else None,
            format=result_data.get("format") if isinstance(result_data, dict) else None,
            total_rows=result_data.get("total_rows") if isinstance(result_data, dict) else None,
            error=error,
        ).model_dump(mode="json")
    )


@router.get("/exports/jobs/{job_id}/download", response_class=FileResponse)
@allow_response_model_exemption("file", path="/api/v1/exports/jobs/{job_id}/download")
async def download_research_export_job(job_id: str):
    result = AsyncResult(job_id, app=celery_app)
    if not result.successful():
        raise HTTPException(status_code=409, detail="Export is not ready")
    result_data = result.result
    if not isinstance(result_data, dict) or not result_data.get("file_path"):
        raise HTTPException(status_code=404, detail="Export file not found")

    file_path = Path(result_data["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Export file not found")

    filename = result_data.get("filename") or file_path.name
    media_type = result_data.get("media_type") or "application/octet-stream"
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename,
    )


@router.get(
    "/exports/{resource_key}",
    response_class=StreamingResponse,
    responses={
        200: {
            "description": "JSON export rows when format=json, or CSV file contents when format=csv.",
            "content": {
                "application/json": {
                    "schema": ResearchExportJSONResponse.model_json_schema(),
                },
                "text/csv": {
                    "schema": {
                        "type": "string",
                        "format": "binary",
                    }
                },
            },
        }
    },
)
@allow_response_model_exemption("stream", path="/api/v1/exports/{resource_key}")
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
        payload = success(data=rows, meta={"resource": config.key, "total": len(rows)})
        return StreamingResponse(
            iter((json.dumps(payload, separators=(",", ":"), default=str),)),
            media_type="application/json",
        )

    return StreamingResponse(
        iter((ResearchExportService.to_csv(config, rows),)),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{config.filename}.csv"'},
    )


def _compact_filters(filters: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in filters.items() if value is not None}


def _export_options(
    *,
    format: str,
    search: str | None,
    filters: dict[str, Any],
    year: int | None,
    sort: str | None,
    order: str | None,
    limit: int,
) -> dict[str, Any]:
    return {
        "format": format,
        "search": search,
        "filters": {key: _json_safe(value) for key, value in filters.items()},
        "year": year,
        "sort": sort,
        "order": order,
        "limit": limit,
    }


def _json_safe(value: Any) -> Any:
    if isinstance(value, uuid.UUID):
        return str(value)
    return value
