"""Resolve an uncertain command without replaying its lost request payload.

A terminal 'not executed' reservation fences off late delivery by the same
native uniqueness constraint used by Research's idempotency wrapper. A committed
command wins the race unchanged. Nothing here undoes a business transaction.
"""
from __future__ import annotations

import hashlib
import re

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from ..models.idempotency import CommandIdempotency
from .admin_workspace import resource_spec
from .admin_workspace_receipts import receipt_summary

_OPERATION_ROOT = "/api/v1/research-portal/operations/{resource}/{item_id}"
_ASSOCIATION = "/relationships/{target}/{target_id}"
_CHILD = "/children/{collection}"
_WORKFLOW = "/api/v1/research-workflow/{resource_key}/{item_id}/"


def validate_command_name(command: str) -> str:
    """Only command templates emitted by this workspace are reconcilable."""
    fixed = {
        *(f"POST {_WORKFLOW}{action}" for action in ("submit", "approve", "reject", "unpublish")),
        f"PUT {_OPERATION_ROOT}{_ASSOCIATION}", f"DELETE {_OPERATION_ROOT}{_ASSOCIATION}",
        f"POST {_OPERATION_ROOT}{_CHILD}",
        f"PATCH {_OPERATION_ROOT}{_CHILD}/{{child_id}}",
        f"DELETE {_OPERATION_ROOT}{_CHILD}/{{child_id}}",
    }
    if command in fixed:
        return command
    match = re.fullmatch(r"(POST|PATCH|DELETE) /api/v1/(research/)?([a-z][a-z0-9-]*)(/id/\{item_id\})?(/([a-z-]+))?", command)
    if not match:
        raise HTTPException(422, "Unsupported command receipt template")
    method, namespace, resource, identity, _, action = match.groups()
    resource_spec(resource)
    if bool(namespace) != (resource == "stories"):
        raise HTTPException(422, "Invalid command namespace")
    if action:
        specialized = {"startups": {"stage"}, "incubation-records": {"stage", "assign-mentors"},
                       "competition-entries": {"entry-status"}, "technology-transfer-cases": {"transfer-status"}}
        common = {"approve", "publish", "unpublish", "archive", "feature", "unfeature"}
        if method != "POST" or not identity or resource not in specialized or action not in common | specialized[resource]:
            raise HTTPException(422, "Unsupported pathway receipt")
    elif (method == "POST") == bool(identity):
        raise HTTPException(422, "Invalid CRUD command receipt")
    return command


async def reconcile_command(db, user, key: str, command: str):
    validate_command_name(command)
    # Deliberately differs from every ordinary request fingerprint. If a
    # request reaches the native handler after the fence commits, its wrapper
    # rejects key reuse before executing any business code.
    fingerprint = hashlib.sha256(b"ksu:cancel-undelivered-command:v1").hexdigest()
    model = CommandIdempotency
    scope = f"user:{user.sub}"
    statement = insert(model).values(
        command_name=command, scope=scope, idempotency_key=key,
        request_fingerprint=fingerprint, state="failed", status_code=409,
        response_body={"kind": "json", "status_code": 409, "body": {
            "detail": "This command was cancelled before execution. Reload before creating a new command.",
            "code": "COMMAND_CANCELLED_BEFORE_EXECUTION",
        }},
    ).on_conflict_do_nothing(index_elements=[model.command_name, model.scope, model.idempotency_key]).returning(model)
    created = (await db.execute(statement)).scalar_one_or_none()
    record = created or await db.scalar(select(model).where(model.command_name == command,
        model.scope == scope, model.idempotency_key == key).with_for_update())
    if record is None:
        raise HTTPException(503, "The command receipt could not be resolved")
    result = receipt_summary(record)
    result["cancelled_before_execution"] = record.request_fingerprint == fingerprint
    return result
