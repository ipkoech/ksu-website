"""Research export response schemas."""

from __future__ import annotations

from ksu_common.schemas.responses import SuccessResponse

from .base import JsonScalar, StrictSchema


class ResearchExportJobRead(StrictSchema):
    job_id: str
    status: str
    resource: str | None = None
    download_url: str | None = None
    filename: str | None = None
    format: str | None = None
    total_rows: int | None = None
    error: str | None = None


class ResearchExportJobSuccessResponse(SuccessResponse[ResearchExportJobRead]):
    """Concrete success envelope for queued and completed export jobs."""


class ResearchExportMeta(StrictSchema):
    resource: str | None = None
    total: int | None = None


class ResearchExportJSONResponse(StrictSchema):
    """Documented JSON envelope for mixed export responses."""

    status: str = "success"
    message: str = "ok"
    data: list[dict[str, JsonScalar]] | None = None
    meta: ResearchExportMeta | None = None
