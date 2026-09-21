"""Administrative synchronization endpoints for external Digital Kisii data."""

from fastapi import APIRouter, Depends, Header, HTTPException, status
from ksu_common.assurance import require_recent_mfa
from ksu_common.auth import TokenPayload
from ksu_contracts.rbac import AuthorizationScope, authorize_permission

from ...core.config import get_settings
from ...deps import CurrentToken, DbSession, require_scope as require_permission
from ksu_common.schemas.responses import SuccessResponse, success
from ...services.digital_lecturers import DigitalLecturerSyncService
from ...services.integration_jobs import create_job, read_job, job_payload
from ...schemas.public_api import SyncEnvelope, SyncJobPayload

router = APIRouter()


def require_scope(permission: str):
    """Legacy endpoints operate globally; school grants cannot authorize them."""
    def check(actor: TokenPayload = Depends(require_permission(permission))):
        if not authorize_permission(actor, permission, AuthorizationScope("global")).allowed:
            raise HTTPException(403, "Institution-wide integration authority required")
        require_recent_mfa(actor)
        return actor
    return check


@router.post("/lecturers/preview", response_model=SyncEnvelope, response_model_exclude_unset=True, dependencies=[Depends(require_scope("staff.manage_profiles"))])
async def preview_lecturers_sync(db: DbSession):
    return success(data=await DigitalLecturerSyncService.sync(db, url=get_settings().DIGITAL_LECTURERS_URL, dry_run=True))


@router.post("/lecturers", response_model=SyncEnvelope, response_model_exclude_unset=True, dependencies=[Depends(require_scope("staff.manage_profiles"))])
async def synchronize_lecturers(db: DbSession):
    return success(data=await DigitalLecturerSyncService.sync(db, url=get_settings().DIGITAL_LECTURERS_URL))


@router.get("/lecturers/profile-completeness", response_model=SyncEnvelope, response_model_exclude_unset=True, dependencies=[Depends(require_scope("staff.manage_profiles"))])
async def lecturer_profile_completeness(db: DbSession):
    return success(data=await DigitalLecturerSyncService.completeness(db, url=get_settings().DIGITAL_LECTURERS_URL))


@router.get("/lecturers/department-stats", response_model=SyncEnvelope, response_model_exclude_unset=True, dependencies=[Depends(require_scope("staff.manage_profiles"))])
async def lecturer_department_stats(db: DbSession):
    return success(data=await DigitalLecturerSyncService.department_stats(db, url=get_settings().DIGITAL_LECTURERS_URL))


@router.post("/lecturers/trigger", status_code=status.HTTP_202_ACCEPTED, response_model=SuccessResponse[SyncJobPayload], response_model_exclude_unset=True, dependencies=[Depends(require_scope("staff.manage_profiles"))])
async def trigger_lecturer_sync(db: DbSession, actor: CurrentToken,
                               idempotency_key: str | None = Header(default=None, alias="Idempotency-Key", min_length=1, max_length=128),
                               request_id: str | None = Header(default=None, alias="X-Request-ID", min_length=1, max_length=128)):
    job = await create_job(db, actor, "lecturers", idempotency_key=idempotency_key, request_id=request_id)
    return success(data=job_payload(job), message="Lecturer synchronization queued")


@router.get("/lecturers/jobs/{job_id}", response_model=SuccessResponse[SyncJobPayload], response_model_exclude_unset=True, dependencies=[Depends(require_scope("staff.manage_profiles"))])
async def lecturer_sync_job(job_id: str, db: DbSession, actor: CurrentToken):
    return success(data=job_payload(await read_job(db, actor, "lecturers", job_id)))


@router.get("/programmes/preview", response_model=SyncEnvelope, response_model_exclude_unset=True, dependencies=[Depends(require_scope("academic.manage_programmes"))])
async def programme_preview(db: DbSession):
    return success(data=await DigitalLecturerSyncService.programme_preview(db, url=get_settings().DIGITAL_PROGRAMMES_URL))


@router.post("/programmes/trigger", status_code=status.HTTP_202_ACCEPTED, response_model=SuccessResponse[SyncJobPayload], response_model_exclude_unset=True, dependencies=[Depends(require_scope("academic.manage_programmes"))])
async def trigger_programme_sync(db: DbSession, actor: CurrentToken,
                                idempotency_key: str | None = Header(default=None, alias="Idempotency-Key", min_length=1, max_length=128),
                                request_id: str | None = Header(default=None, alias="X-Request-ID", min_length=1, max_length=128)):
    job = await create_job(db, actor, "programmes", idempotency_key=idempotency_key, request_id=request_id)
    return success(data=job_payload(job), message="Programme synchronization queued")


@router.get("/programmes/jobs/{job_id}", response_model=SuccessResponse[SyncJobPayload], response_model_exclude_unset=True, dependencies=[Depends(require_scope("academic.manage_programmes"))])
async def programme_sync_job(job_id: str, db: DbSession, actor: CurrentToken):
    return success(data=job_payload(await read_job(db, actor, "programmes", job_id)))
