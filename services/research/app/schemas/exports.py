"""Research export response schemas."""

from __future__ import annotations

from ksu_common.schemas.responses import SuccessResponse
from pydantic import BaseModel


class ResearchExportJobRead(BaseModel):
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
