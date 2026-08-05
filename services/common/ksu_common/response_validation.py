"""Strict response-model enforcement for public FastAPI routes."""

from __future__ import annotations

import inspect
import logging
from collections.abc import Callable, Iterable
from functools import wraps
from typing import Any, Literal

from fastapi.exceptions import ResponseValidationError
from fastapi.routing import APIRoute
from starlette.responses import Response

ResponseModelExemption = Literal["health", "metrics", "internal"]

_EXEMPTION_ATTRIBUTE = "__response_model_exemption__"
_ALLOWED_EXEMPTIONS = frozenset({"health", "metrics", "internal"})
_logger = logging.getLogger(__name__)


class ResponseModelCoverageError(ValueError):
    """Raised when a production public route has no response model."""


def allow_response_model_exemption(
    route_type: ResponseModelExemption,
) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """Explicitly exempt a health, metrics, or internal route from a model.

    The route path is checked when the application is assembled, so marking an
    ordinary public endpoint is rejected instead of becoming a broad bypass.
    """

    if route_type not in _ALLOWED_EXEMPTIONS:
        allowed = ", ".join(sorted(_ALLOWED_EXEMPTIONS))
        raise ValueError(f"response-model exemption must be one of: {allowed}")

    def decorator(endpoint: Callable[..., Any]) -> Callable[..., Any]:
        setattr(endpoint, _EXEMPTION_ATTRIBUTE, route_type)
        return endpoint

    return decorator


def _route_exemption(endpoint: Callable[..., Any]) -> str | None:
    current: Any = endpoint
    while current is not None:
        exemption = getattr(current, _EXEMPTION_ATTRIBUTE, None)
        if exemption is not None:
            return exemption
        current = getattr(current, "__wrapped__", None)
    return None


def _is_valid_exemption(route: APIRoute, exemption: str) -> bool:
    segments = {segment.lower() for segment in route.path.split("/") if segment}
    if exemption == "health":
        return any(segment.startswith("health") for segment in segments)
    return exemption in segments


def _route_label(route: APIRoute) -> str:
    methods = ",".join(sorted(route.methods or ()))
    return f"{methods} {route.path}"


def collect_response_model_coverage(
    routes: Iterable[object],
) -> tuple[list[str], list[str]]:
    """Return missing-model routes and invalid exemption messages."""

    missing: list[str] = []
    invalid_exemptions: list[str] = []
    for route in routes:
        if not isinstance(route, APIRoute) or route.response_model is not None:
            continue

        label = _route_label(route)
        exemption = _route_exemption(route.endpoint)
        if exemption is None:
            missing.append(label)
        elif exemption not in _ALLOWED_EXEMPTIONS or not _is_valid_exemption(route, exemption):
            invalid_exemptions.append(
                f"invalid response-model exemption {exemption!r} for {label}; "
                "only health, metrics, and internal routes may opt out"
            )

    return missing, invalid_exemptions


def enforce_response_model_coverage(
    routes: Iterable[object],
    *,
    production: bool,
) -> list[str]:
    """Record response-model coverage and reject gaps in production."""

    missing, invalid_exemptions = collect_response_model_coverage(routes)
    violations = [*invalid_exemptions, *missing]
    if not violations:
        return missing

    message = "Public routes missing response models: " + "; ".join(violations)
    if production:
        _logger.error(message)
        raise ResponseModelCoverageError(message)
    _logger.warning(message)
    return missing


class StrictResponseValidationRoute(APIRoute):
    """Validate endpoint output before FastAPI performs its authoritative render."""

    def get_route_handler(self) -> Callable[..., Any]:
        """Wrap FastAPI's dependency call while leaving ``route.endpoint`` intact."""

        endpoint = self.dependant.call
        if endpoint is not None and not hasattr(self, "_response_validating_endpoint"):
            if inspect.iscoroutinefunction(endpoint):

                @wraps(endpoint)
                async def validating_endpoint(*args: Any, **endpoint_kwargs: Any) -> Any:
                    value = await endpoint(*args, **endpoint_kwargs)
                    self._validate_response_value(value)
                    return value

            else:

                @wraps(endpoint)
                def validating_endpoint(*args: Any, **endpoint_kwargs: Any) -> Any:
                    value = endpoint(*args, **endpoint_kwargs)
                    self._validate_response_value(value)
                    return value

            self._response_validating_endpoint = validating_endpoint
            self.dependant.call = validating_endpoint
        return super().get_route_handler()

    def _validate_response_value(self, value: Any) -> None:
        """Use FastAPI's response field without changing its rendering behavior."""

        field = self.response_field
        if field is None:
            return
        if isinstance(value, Response):
            raise ResponseValidationError(
                errors=[
                    {
                        "type": "response_model_bypassed",
                        "loc": ("response",),
                        "msg": "response_model routes must return data, not a raw Response",
                        "input": value,
                    }
                ],
                body=value,
            )

        _validated, errors = field.validate(value, {}, loc=("response",))
        if errors:
            raise ResponseValidationError(errors=errors, body=value)


__all__ = [
    "ResponseModelCoverageError",
    "StrictResponseValidationRoute",
    "allow_response_model_exemption",
    "collect_response_model_coverage",
    "enforce_response_model_coverage",
]
