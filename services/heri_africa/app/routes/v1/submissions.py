import hashlib
import json
from dataclasses import dataclass
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from ksu_common.rate_limit import RateLimiter, rate_limit
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...models.submissions import CommandIdempotency, Submission
from ...schemas.submissions import (
    ContactSubmission,
    NewsletterSubmission,
    NetworkSubmission,
    PartnershipSubmission,
)
from ...models.content import Event
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(tags=["HERI Submissions"])

_SUBMISSION_EMAIL_LIMITERS = {
    "contact": RateLimiter(requests=10, window=3600, prefix="heri:contact:email"),
    "partnership": RateLimiter(requests=10, window=3600, prefix="heri:partnership:email"),
    "network": RateLimiter(requests=10, window=3600, prefix="heri:network:email"),
    "newsletter": RateLimiter(requests=5, window=3600, prefix="heri:newsletter:email"),
    "event_registration": RateLimiter(
        requests=10,
        window=3600,
        prefix="heri:event-registration:email",
    ),
}


class EventRegistration(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    organisation: str | None = Field(default=None, max_length=255)
    country: str | None = Field(default=None, max_length=120)
    accessibility_requirements: str | None = Field(default=None, max_length=2000)
    consent: bool


SubmissionCommandClaimKind = Literal["started", "replay", "in_progress"]


class SubmissionIdempotencyKeyReuseError(ValueError):
    """Raised when a key is reused for a different submission payload."""


@dataclass(frozen=True)
class SubmissionCommandClaim:
    kind: SubmissionCommandClaimKind
    record: CommandIdempotency


def _require_submission_idempotency_key(request: Request) -> str:
    supplied = request.headers.get("Idempotency-Key", "").strip()
    if not supplied:
        raise HTTPException(status_code=400, detail="Idempotency-Key header is required")
    if len(supplied) > 255:
        raise HTTPException(status_code=400, detail="Idempotency-Key is too long")
    return supplied


def _submission_request_fingerprint(payload: Any) -> str:
    canonical = json.dumps(payload, allow_nan=False, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _submission_command_name(kind: str) -> str:
    return f"heri.submission.{kind}"


def _submission_scope(*, email: str, authenticated_scope: str | None = None) -> str:
    if authenticated_scope:
        return authenticated_scope
    return f"email:{email}"


def _set_submission_terminal_response(
    record: CommandIdempotency,
    *,
    state: Literal["completed", "failed"],
    status_code: int,
    response_body: dict[str, Any],
) -> None:
    if record.state not in (None, "pending"):
        raise ValueError("only pending idempotency records may be completed or failed")
    if not 100 <= status_code <= 599:
        raise ValueError("status_code must be between 100 and 599")
    if not isinstance(response_body, dict):
        raise TypeError("response_body must be an object")
    _submission_request_fingerprint(response_body)
    record.state = state
    record.status_code = status_code
    record.response_body = response_body


def _complete_submission_command(
    record: CommandIdempotency,
    *,
    status_code: int,
    response_body: dict[str, Any],
) -> JSONResponse:
    body = jsonable_encoder(response_body)
    _set_submission_terminal_response(
        record,
        state="completed",
        status_code=status_code,
        response_body=body,
    )
    return JSONResponse(status_code=status_code, content=body)


def _fail_submission_command(
    record: CommandIdempotency,
    *,
    status_code: int,
    response_body: dict[str, Any],
) -> JSONResponse:
    body = jsonable_encoder(response_body)
    _set_submission_terminal_response(
        record,
        state="failed",
        status_code=status_code,
        response_body=body,
    )
    return JSONResponse(status_code=status_code, content=body)


def _require_non_empty(name: str, value: str, *, max_length: int) -> None:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} must not be empty")
    if len(value) > max_length:
        raise ValueError(f"{name} must not exceed {max_length} characters")


async def _acquire_submission_command(
    db: AsyncSession,
    *,
    command_name: str,
    scope: str,
    idempotency_key: str,
    request_payload: Any,
) -> SubmissionCommandClaim:
    _require_non_empty("command_name", command_name, max_length=128)
    _require_non_empty("scope", scope, max_length=255)
    _require_non_empty("idempotency_key", idempotency_key, max_length=255)
    fingerprint = _submission_request_fingerprint(request_payload)
    create = (
        insert(CommandIdempotency)
        .values(
            command_name=command_name,
            scope=scope,
            idempotency_key=idempotency_key,
            request_fingerprint=fingerprint,
        )
        .on_conflict_do_nothing(
            index_elements=[
                CommandIdempotency.command_name,
                CommandIdempotency.scope,
                CommandIdempotency.idempotency_key,
            ]
        )
        .returning(CommandIdempotency)
    )
    created = (await db.execute(create)).scalar_one_or_none()
    if created is not None:
        return SubmissionCommandClaim(kind="started", record=created)

    existing = (
        await db.execute(
            select(CommandIdempotency)
            .where(
                CommandIdempotency.command_name == command_name,
                CommandIdempotency.scope == scope,
                CommandIdempotency.idempotency_key == idempotency_key,
            )
            .with_for_update()
        )
    ).scalar_one_or_none()
    if existing is None:
        raise RuntimeError("Submission idempotency record disappeared after uniqueness conflict")
    if existing.request_fingerprint != fingerprint:
        raise SubmissionIdempotencyKeyReuseError("Idempotency key was already used with a different request payload")
    if existing.state == "pending":
        return SubmissionCommandClaim(kind="in_progress", record=existing)
    return SubmissionCommandClaim(kind="replay", record=existing)


async def _acquire_json_submission_command(
    db: AsyncSession,
    *,
    command_name: str,
    scope: str,
    idempotency_key: str,
    request_payload: Any,
    in_progress_body: dict[str, Any],
    key_reuse_body: dict[str, Any],
    retry_after: int | str = 1,
) -> SubmissionCommandClaim | JSONResponse:
    try:
        claim = await _acquire_submission_command(
            db,
            command_name=command_name,
            scope=scope,
            idempotency_key=idempotency_key,
            request_payload=request_payload,
        )
    except SubmissionIdempotencyKeyReuseError:
        return JSONResponse(status_code=409, content=jsonable_encoder(key_reuse_body))

    if claim.kind == "replay":
        return JSONResponse(
            status_code=claim.record.status_code,
            content=jsonable_encoder(claim.record.response_body),
        )
    if claim.kind == "in_progress":
        return JSONResponse(
            status_code=409,
            content=jsonable_encoder(in_progress_body),
            headers={"Retry-After": str(retry_after)},
        )
    return claim


async def _save_submission(
    kind: str,
    payload: object,
    db: AsyncSession,
    request: Request,
    *,
    event_id: str | None = None,
) -> JSONResponse:
    data = payload.model_dump(mode="json")
    idempotency_key = _require_submission_idempotency_key(request)
    email = str(data["email"]).strip().lower()
    await _SUBMISSION_EMAIL_LIMITERS[kind].check(email, f"POST:/heri/submissions/{kind}/email")
    claim_or_response = await _acquire_json_submission_command(
        db,
        command_name=_submission_command_name(kind),
        scope=_submission_scope(email=email),
        idempotency_key=idempotency_key,
        request_payload={
            "kind": kind,
            "event_id": event_id,
            "payload": data,
        },
        in_progress_body={
            "status": "error",
            "message": "A submission with this idempotency key is already being processed.",
            "code": "idempotency_in_progress",
        },
        key_reuse_body={
            "status": "error",
            "message": "This idempotency key was already used for a different submission payload.",
            "code": "idempotency_key_reused",
        },
    )
    if isinstance(claim_or_response, JSONResponse):
        return claim_or_response

    claim = claim_or_response
    if not data.pop("consent", False):
        return _fail_submission_command(
            claim.record,
            status_code=status.HTTP_400_BAD_REQUEST,
            response_body={"detail": "Consent is required"},
        )
    if event_id is not None and await db.get(Event, event_id) is None:
        return _fail_submission_command(
            claim.record,
            status_code=status.HTTP_404_NOT_FOUND,
            response_body={"detail": "Event not found"},
        )

    name = data.get("name") or data.get("contact_person") or data.get("email", "subscriber")
    if event_id is not None:
        data["event_id"] = event_id
    db.add(
        Submission(
            kind=kind,
            name=name,
            email=email,
            organisation=data.get("organisation"),
            country=data.get("country"),
            message=data.get("message") or data.get("proposed_collaboration") or "",
            payload={
                **data,
                "idempotency_key": idempotency_key,
                "source_ip": request.client.host if request.client else None,
            },
        )
    )
    return _complete_submission_command(
        claim.record,
        status_code=status.HTTP_202_ACCEPTED,
        response_body={
            "status": "received",
            "message": "Thank you. The HERI Africa team will respond soon.",
        },
    )


@router.post("/contact", status_code=status.HTTP_202_ACCEPTED)
@rate_limit(requests=5, window=300, prefix="heri:contact:ip", max_body_bytes=32 * 1024)
async def contact(payload: ContactSubmission, request: Request, db: AsyncSession = Depends(get_db)):
    return await _save_submission("contact", payload, db, request)


@router.post("/partnership-applications", status_code=status.HTTP_202_ACCEPTED)
@rate_limit(
    requests=5,
    window=3600,
    prefix="heri:partnership:ip",
    max_body_bytes=32 * 1024,
)
async def partnership(payload: PartnershipSubmission, request: Request, db: AsyncSession = Depends(get_db)):
    return await _save_submission("partnership", payload, db, request)


@router.post("/network-applications", status_code=status.HTTP_202_ACCEPTED)
@rate_limit(requests=5, window=3600, prefix="heri:network:ip", max_body_bytes=32 * 1024)
async def network(payload: NetworkSubmission, request: Request, db: AsyncSession = Depends(get_db)):
    return await _save_submission("network", payload, db, request)


@router.post("/newsletter/subscribe", status_code=status.HTTP_202_ACCEPTED)
@rate_limit(
    requests=3,
    window=3600,
    prefix="heri:newsletter:ip",
    max_body_bytes=8 * 1024,
)
async def newsletter(payload: NewsletterSubmission, request: Request, db: AsyncSession = Depends(get_db)):
    return await _save_submission("newsletter", payload, db, request)


@router.post("/events/{event_id}/register", status_code=status.HTTP_202_ACCEPTED)
@rate_limit(
    requests=5,
    window=3600,
    prefix="heri:event-registration:ip",
    max_body_bytes=16 * 1024,
)
async def register_event(event_id: str, payload: EventRegistration, request: Request, db: AsyncSession = Depends(get_db)):
    return await _save_submission("event_registration", payload, db, request, event_id=event_id)
