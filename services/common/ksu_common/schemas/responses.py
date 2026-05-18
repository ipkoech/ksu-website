"""Pydantic response envelope models — replaces Flask jsonify helpers."""

from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class SuccessResponse(BaseModel, Generic[T]):
    status: str = "success"
    message: str = "ok"
    data: T | None = None
    meta: dict[str, Any] | None = None


class ErrorDetail(BaseModel):
    field: str | None = None
    message: str


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    code: str = "error"
    details: list[ErrorDetail] | dict[str, Any] | None = None


def success(data: Any = None, *, meta: dict | None = None, message: str = "ok") -> dict:
    """Return a serializable success envelope dict."""
    payload: dict[str, Any] = {"status": "success", "message": message, "data": data}
    if meta:
        payload["meta"] = meta
    return payload


def error(message: str, *, code: str = "error", details: Any = None) -> dict:
    """Return a serializable error envelope dict."""
    payload: dict[str, Any] = {"status": "error", "message": message, "code": code}
    if details is not None:
        payload["details"] = details
    return payload
