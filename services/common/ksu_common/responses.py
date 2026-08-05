"""Canonical compatibility exports for API response envelopes."""

from .schemas.responses import ErrorDetail, ErrorResponse, SuccessResponse, error, success

__all__ = [
    "ErrorDetail",
    "ErrorResponse",
    "SuccessResponse",
    "error",
    "success",
]
