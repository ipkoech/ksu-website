"""School integration commands over canonical programme synchronization."""

from fastapi import APIRouter, Header, HTTPException
from ksu_common.schemas.responses import SuccessResponse, success
from ksu_contracts.rbac import AuthorizationScope, authorize_permission

from ....core.config import get_settings
from ....deps import CurrentToken, DbSession
from ....schemas.public_api import SyncEnvelope, SyncJobPayload
from ....services.digital_lecturers import DigitalLecturerSyncService
from ....services.integration_jobs import create_job, job_payload, read_job
from ....services.school_portal_context import CurrentSchoolContext

router = APIRouter(prefix="/integrations/{integration}")


@router.get("/preview", response_model=SyncEnvelope)
async def preview(integration: str, db: DbSession, context: CurrentSchoolContext, actor: CurrentToken):
    if integration not in {"programmes", "lecturers"}:
        raise HTTPException(404, "Integration not found")
    if not authorize_permission(actor, f"school.integrations.{integration}.preview",
                                AuthorizationScope("school", context.school.id)).allowed:
        raise HTTPException(403, "School integration preview authority required")
    # Preview is a read-only projection.  The actual synchronization trigger
    # remains MFA-protected in ``integration_jobs``; requiring recent MFA here
    # made the school portal show "statistics unavailable" for every ordinary
    # signed-in school administrator.
    if integration == "lecturers":
        return success(data=await DigitalLecturerSyncService.sync(
            db, url=get_settings().DIGITAL_LECTURERS_URL, dry_run=True, school_id=context.school.id))
    return success(data=await DigitalLecturerSyncService.programme_preview(
        db, url=get_settings().DIGITAL_PROGRAMMES_URL, school_id=context.school.id))


@router.post("/trigger", status_code=202, response_model=SuccessResponse[SyncJobPayload])
async def trigger(integration: str, db: DbSession, context: CurrentSchoolContext, actor: CurrentToken,
                  idempotency_key: str | None = Header(default=None, alias="Idempotency-Key", min_length=1, max_length=128),
                  request_id: str | None = Header(default=None, alias="X-Request-ID", min_length=1, max_length=128)):
    job = await create_job(db, actor, integration, scope_type="school", scope_id=context.school.id,
                           idempotency_key=idempotency_key, request_id=request_id)
    return success(data=job_payload(job), message="School synchronization queued")


@router.get("/jobs/{job_id}", response_model=SuccessResponse[SyncJobPayload])
async def job_status(integration: str, job_id: str, db: DbSession, context: CurrentSchoolContext, actor: CurrentToken):
    job = await read_job(db, actor, integration, job_id)
    if job.scope_type != "school" or job.scope_id != context.school.id:
        raise HTTPException(403, "Integration job belongs to a different scope")
    return success(data=job_payload(job))
