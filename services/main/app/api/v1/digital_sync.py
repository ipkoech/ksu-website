"""Administrative synchronization endpoints for external Digital Kisii data."""

from fastapi import APIRouter, Depends, status
from celery.result import AsyncResult

from ...core.config import get_settings
from ...deps import DbSession, require_scope
from ksu_common.schemas.responses import success
from ...services.digital_lecturers import DigitalLecturerSyncService
from ...tasks.celery_app import celery_app

router = APIRouter()


@router.post("/lecturers/preview", dependencies=[Depends(require_scope("staff.manage_profiles"))])
async def preview_lecturers_sync(db: DbSession):
    return success(data=await DigitalLecturerSyncService.sync(db, url=get_settings().DIGITAL_LECTURERS_URL, dry_run=True))


@router.post("/lecturers", dependencies=[Depends(require_scope("staff.manage_profiles"))])
async def synchronize_lecturers(db: DbSession):
    return success(data=await DigitalLecturerSyncService.sync(db, url=get_settings().DIGITAL_LECTURERS_URL))


@router.get("/lecturers/profile-completeness", dependencies=[Depends(require_scope("staff.manage_profiles"))])
async def lecturer_profile_completeness(db: DbSession):
    return success(data=await DigitalLecturerSyncService.completeness(db, url=get_settings().DIGITAL_LECTURERS_URL))


@router.get("/lecturers/department-stats", dependencies=[Depends(require_scope("staff.manage_profiles"))])
async def lecturer_department_stats(db: DbSession):
    return success(data=await DigitalLecturerSyncService.department_stats(db, url=get_settings().DIGITAL_LECTURERS_URL))


@router.post("/lecturers/trigger", status_code=status.HTTP_202_ACCEPTED, dependencies=[Depends(require_scope("staff.manage_profiles"))])
async def trigger_lecturer_sync():
    task = celery_app.send_task("main.digital_sync.lecturers")
    return success(data={"job_id": task.id, "status": "PENDING"}, message="Lecturer synchronization queued")


@router.get("/lecturers/jobs/{job_id}", dependencies=[Depends(require_scope("staff.manage_profiles"))])
async def lecturer_sync_job(job_id: str):
    result = AsyncResult(job_id, app=celery_app)
    return success(data={"job_id": job_id, "status": result.status, "result": result.result if result.successful() else None, "error": str(result.result) if result.failed() else None})


@router.get("/programmes/preview", dependencies=[Depends(require_scope("academic.manage_programmes"))])
async def programme_preview(db: DbSession):
    return success(data=await DigitalLecturerSyncService.programme_preview(db, url=get_settings().DIGITAL_PROGRAMMES_URL))


@router.post("/programmes/trigger", status_code=status.HTTP_202_ACCEPTED, dependencies=[Depends(require_scope("academic.manage_programmes"))])
async def trigger_programme_sync():
    task = celery_app.send_task("main.digital_sync.programmes")
    return success(data={"job_id": task.id, "status": "PENDING"}, message="Programme synchronization queued")


@router.get("/programmes/jobs/{job_id}", dependencies=[Depends(require_scope("academic.manage_programmes"))])
async def programme_sync_job(job_id: str):
    result = AsyncResult(job_id, app=celery_app)
    return success(data={"job_id": job_id, "status": result.status, "result": result.result if result.successful() else None, "error": str(result.result) if result.failed() else None})
