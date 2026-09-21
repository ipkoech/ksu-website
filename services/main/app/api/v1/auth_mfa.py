"""Account authenticator enrollment and current-session step-up."""

from datetime import datetime, timezone

from fastapi import APIRouter, Response
from pydantic import BaseModel, Field

from ksu_common.schemas.responses import SuccessResponse, success

from ...deps import CurrentToken, CurrentUser, DbSession
from ...services import mfa

router = APIRouter(prefix="/mfa")


class EnrollmentRequest(BaseModel):
    password: str = Field(min_length=8, max_length=255, repr=False)


class FactorRequest(BaseModel):
    mfa_code: str = Field(min_length=6, max_length=64, repr=False)


class StepUpRequest(EnrollmentRequest, FactorRequest):
    pass


class EnrollmentResponse(BaseModel):
    secret: str
    otpauth_uri: str


class RecoveryResponse(BaseModel):
    recovery_codes: list[str]


class AssuranceResponse(BaseModel):
    verified_at: datetime


class MfaStatusResponse(BaseModel):
    enabled: bool
    verified_at: datetime | None
    recovery_codes_remaining: int


@router.get("/status", response_model=SuccessResponse[MfaStatusResponse])
async def mfa_status(user: CurrentUser, token: CurrentToken, response: Response):
    response.headers["Cache-Control"] = "no-store"
    timestamp = token.raw.get("mfa_verified_at")
    return success(data=MfaStatusResponse(
        enabled=user.mfa_enabled is True,
        verified_at=datetime.fromtimestamp(timestamp, timezone.utc) if timestamp is not None else None,
        recovery_codes_remaining=len(user.mfa_recovery_hashes or []),
    ))


@router.post("/enroll", response_model=SuccessResponse[EnrollmentResponse])
async def enroll(data: EnrollmentRequest, user: CurrentUser, db: DbSession, response: Response):
    response.headers["Cache-Control"] = "no-store"
    result = await mfa.begin_enrollment(db, user.id, data.password)
    return success(data=EnrollmentResponse(**result))


@router.post("/confirm", response_model=SuccessResponse[RecoveryResponse])
async def confirm(data: FactorRequest, user: CurrentUser, token: CurrentToken, db: DbSession, response: Response):
    response.headers["Cache-Control"] = "no-store"
    codes = await mfa.confirm_session_enrollment(db, user.id, token.jti, data.mfa_code)
    return success(data=RecoveryResponse(recovery_codes=codes))


@router.post("/step-up", response_model=SuccessResponse[AssuranceResponse])
async def step_up(data: StepUpRequest, user: CurrentUser, token: CurrentToken, db: DbSession, response: Response):
    response.headers["Cache-Control"] = "no-store"
    verified = await mfa.step_up_session(db, user.id, token.jti, data.password, data.mfa_code)
    return success(data=AssuranceResponse(verified_at=verified))


@router.post("/replace", response_model=SuccessResponse[EnrollmentResponse])
async def replace(data: StepUpRequest, user: CurrentUser, db: DbSession, response: Response):
    response.headers["Cache-Control"] = "no-store"
    result = await mfa.begin_enrollment(db, user.id, data.password, current_code=data.mfa_code)
    return success(data=EnrollmentResponse(**result))
