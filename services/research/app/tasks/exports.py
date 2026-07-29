"""Celery tasks for research data exports."""

from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import Any
from uuid import UUID

from ..core.config import get_settings
from ..core.database import AsyncSessionLocal
from ..services.exports import ResearchExportService
from .celery_app import celery_app


@celery_app.task(name="research.exports.generate", bind=True)
def generate_export(self, resource_key: str, options: dict[str, Any]) -> dict[str, Any]:
    return asyncio.run(_generate_export(self.request.id, resource_key, options))


async def _generate_export(job_id: str, resource_key: str, options: dict[str, Any]) -> dict[str, Any]:
    config = ResearchExportService.get_config(resource_key)
    if config is None:
        raise ValueError("Research export resource not found")

    export_format = options.get("format") or "csv"
    if export_format not in {"csv", "json"}:
        raise ValueError("Unsupported export format")

    filters = _coerce_filters(options.get("filters") or {})
    async with AsyncSessionLocal() as db:
        rows = await ResearchExportService.rows(
            db,
            config,
            search=options.get("search"),
            filters=filters,
            year=options.get("year"),
            sort=options.get("sort"),
            order=options.get("order"),
            limit=options.get("limit") or 5000,
        )

    settings = get_settings()
    export_dir = Path(settings.EXPORT_DIR)
    export_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{config.filename}-{job_id}.{export_format}"
    file_path = export_dir / filename

    if export_format == "json":
        file_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
        media_type = "application/json"
    else:
        file_path.write_text(ResearchExportService.to_csv(config, rows), encoding="utf-8")
        media_type = "text/csv"

    return {
        "resource": config.key,
        "filename": filename,
        "file_path": str(file_path),
        "format": export_format,
        "media_type": media_type,
        "total_rows": len(rows),
    }


def _coerce_filters(filters: dict[str, Any]) -> dict[str, Any]:
    coerced: dict[str, Any] = {}
    for key, value in filters.items():
        if value is None:
            continue
        if key.endswith("_id") and isinstance(value, str):
            coerced[key] = UUID(value)
            continue
        coerced[key] = value
    return coerced
