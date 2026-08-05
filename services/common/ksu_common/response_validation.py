"""Strict response validation and response-model coverage observation."""

from __future__ import annotations

import inspect
import logging
from collections.abc import Callable, Iterable, Iterator, Mapping, Sequence
from dataclasses import dataclass
from functools import wraps
from types import UnionType
from typing import Annotated, Any, Literal, Union, get_args, get_origin

from fastapi.exceptions import ResponseValidationError
from fastapi.routing import APIRoute
from starlette.responses import FileResponse, Response, StreamingResponse
from starlette.routing import request_response

ResponseModelExemption = Literal["file", "health", "internal", "metrics", "stream"]

PUBLIC_RESPONSE_MODEL_MISSING_BASELINE = 907
_EXEMPTION_ATTRIBUTE = "__response_model_exemption__"
_ALLOWED_EXEMPTIONS = frozenset({"file", "health", "internal", "metrics", "stream"})
_logger = logging.getLogger(__name__)


class ResponseModelCoverageError(ValueError):
    """Retained for callers that need to raise on a separately audited report."""


@dataclass(frozen=True)
class _ResponseModelExemption:
    route_type: ResponseModelExemption
    path: str
    internal_auth: Callable[..., Any] | None = None


@dataclass(frozen=True)
class ResponseModelCoverage:
    """A bounded startup snapshot used to track response-schema rollout."""

    missing: tuple[str, ...]
    nonconcrete: tuple[str, ...]
    invalid_exemptions: tuple[str, ...]
    baseline_missing: int = PUBLIC_RESPONSE_MODEL_MISSING_BASELINE

    @property
    def uncovered_count(self) -> int:
        return len(self.missing) + len(self.nonconcrete)

    @property
    def baseline_delta(self) -> int:
        return self.uncovered_count - self.baseline_missing


@dataclass(frozen=True)
class _RouteInspection:
    route: APIRoute
    path: str
    dependencies: Sequence[object]
    response_class: object


def allow_response_model_exemption(
    route_type: ResponseModelExemption,
    *,
    path: str,
    internal_auth: Callable[..., Any] | None = None,
) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """Mark one exact non-public response shape as intentionally model-free.

    ``internal`` exemptions bind to the exact authentication dependency that
    protects the route. File and stream exemptions additionally require their
    corresponding response class at application assembly time.
    """

    if route_type not in _ALLOWED_EXEMPTIONS:
        allowed = ", ".join(sorted(_ALLOWED_EXEMPTIONS))
        raise ValueError(f"response-model exemption must be one of: {allowed}")
    if not path.startswith("/") or (path != "/" and path.endswith("/")):
        raise ValueError("response-model exemption path must be an exact absolute route path")
    if route_type == "internal" and internal_auth is None:
        raise ValueError("internal response-model exemptions require an auth dependency")
    if route_type != "internal" and internal_auth is not None:
        raise ValueError("only internal response-model exemptions accept an auth dependency")

    marker = _ResponseModelExemption(route_type, path, internal_auth)

    def decorator(endpoint: Callable[..., Any]) -> Callable[..., Any]:
        setattr(endpoint, _EXEMPTION_ATTRIBUTE, marker)
        return endpoint

    return decorator


def _route_exemption(endpoint: Callable[..., Any]) -> _ResponseModelExemption | None:
    current: Any = endpoint
    while current is not None:
        exemption = getattr(current, _EXEMPTION_ATTRIBUTE, None)
        if isinstance(exemption, _ResponseModelExemption):
            return exemption
        current = getattr(current, "__wrapped__", None)
    return None


def _route_label(route: APIRoute, path: str) -> str:
    methods = ",".join(sorted(route.methods or ()))
    return f"{methods} {path}"


def _iter_route_inspections(routes: Iterable[object]) -> Iterator[_RouteInspection]:
    """Yield direct routes and FastAPI included-router routes with full paths."""

    for candidate in routes:
        if isinstance(candidate, APIRoute):
            yield _RouteInspection(
                route=candidate,
                path=candidate.path,
                dependencies=candidate.dependencies,
                response_class=candidate.response_class,
            )
            continue

        effective_routes = getattr(candidate, "effective_route_contexts", None)
        if callable(effective_routes):
            for context in effective_routes():
                route = getattr(context, "original_route", None)
                if isinstance(route, APIRoute):
                    yield _RouteInspection(
                        route=route,
                        path=context.path,
                        dependencies=context.dependencies,
                        response_class=context.response_class,
                    )
            continue

        nested_routes = getattr(candidate, "routes", None)
        if nested_routes is not None:
            yield from _iter_route_inspections(nested_routes)


def _is_concrete_response_model(model: object) -> bool:
    """Reject schemas that leave a public response unconstrained."""

    if model in (None, Any, object, type(None), list, dict, set, tuple, frozenset, Mapping, Sequence):
        return False

    origin = get_origin(model)
    args = get_args(model)
    if origin is None:
        return True
    if origin is Annotated:
        return bool(args) and _is_concrete_response_model(args[0])
    if origin is Literal:
        return bool(args)
    if origin in (Union, UnionType):
        return bool(args) and all(_is_concrete_response_model(argument) for argument in args)
    return bool(args) and all(
        argument is Ellipsis or _is_concrete_response_model(argument) for argument in args
    )


def _dependency_calls(dependencies: Sequence[object]) -> Iterator[Callable[..., Any]]:
    for dependency in dependencies:
        call = getattr(dependency, "dependency", None)
        if callable(call):
            yield call


def _is_valid_exemption(inspection: _RouteInspection, exemption: _ResponseModelExemption) -> bool:
    if inspection.path != exemption.path:
        return False
    if exemption.route_type == "internal":
        return exemption.internal_auth in set(_dependency_calls(inspection.dependencies))
    if exemption.route_type == "file":
        return _is_response_class(inspection.response_class, FileResponse)
    if exemption.route_type == "stream":
        return _is_response_class(inspection.response_class, StreamingResponse)
    return True


def _is_response_class(value: object, expected: type[Response]) -> bool:
    return isinstance(value, type) and issubclass(value, expected)


def collect_response_model_coverage(routes: Iterable[object]) -> ResponseModelCoverage:
    """Collect all missing, permissive, and invalid public response schemas."""

    missing: list[str] = []
    nonconcrete: list[str] = []
    invalid_exemptions: list[str] = []
    for inspection in _iter_route_inspections(routes):
        route = inspection.route
        label = _route_label(route, inspection.path)
        if route.response_model is not None and _is_concrete_response_model(route.response_model):
            continue

        exemption = _route_exemption(route.endpoint)
        if exemption is not None:
            if not _is_valid_exemption(inspection, exemption):
                invalid_exemptions.append(
                    f"invalid response-model exemption {exemption.route_type!r} for {label}"
                )
            continue
        if route.response_model is None:
            missing.append(label)
        else:
            nonconcrete.append(label)

    return ResponseModelCoverage(
        missing=tuple(missing),
        nonconcrete=tuple(nonconcrete),
        invalid_exemptions=tuple(invalid_exemptions),
    )


def enforce_response_model_coverage(
    routes: Iterable[object],
    *,
    production: bool,
) -> ResponseModelCoverage:
    """Validate response-model coverage, failing closed in production."""

    coverage = collect_response_model_coverage(routes)
    if coverage.missing or coverage.nonconcrete or coverage.invalid_exemptions:
        level = logging.ERROR if production else logging.WARNING
        _logger.log(
            level,
            "response-model coverage observed: missing=%d nonconcrete=%d invalid_exemptions=%d baseline=%d",
            len(coverage.missing),
            len(coverage.nonconcrete),
            len(coverage.invalid_exemptions),
            coverage.baseline_missing,
        )
        if production:
            raise ResponseModelCoverageError(
                "production response-model coverage is incomplete: "
                f"missing={len(coverage.missing)} "
                f"nonconcrete={len(coverage.nonconcrete)} "
                f"invalid_exemptions={len(coverage.invalid_exemptions)}"
            )
    return coverage


def install_strict_response_validation(routes: Iterable[object]) -> None:
    """Install the raw-response guard on direct and nested included API routes."""

    route_tree = tuple(routes)
    installed: set[int] = set()
    for inspection in _iter_route_inspections(route_tree):
        route = inspection.route
        if id(route) in installed:
            continue
        installed.add(id(route))
        if not isinstance(route, StrictResponseValidationRoute):
            route.__class__ = StrictResponseValidationRoute
            route.app = request_response(route.get_route_handler())
        route._sync_response_bypass_endpoint()
    _mark_included_router_routes_changed(route_tree)


def _mark_included_router_routes_changed(routes: Iterable[object]) -> None:
    """Discard FastAPI's cached included-router contexts after endpoint wrapping."""

    for candidate in routes:
        router = getattr(candidate, "original_router", None)
        mark_changed = getattr(router, "_mark_routes_changed", None)
        if callable(mark_changed):
            mark_changed()
        nested_routes = getattr(router, "routes", None)
        if nested_routes is not None:
            _mark_included_router_routes_changed(nested_routes)


class StrictResponseValidationRoute(APIRoute):
    """Reject raw ``Response`` bypasses while FastAPI remains the sole validator."""

    def get_route_handler(self) -> Callable[..., Any]:
        endpoint = self.dependant.call
        if endpoint is not None and not hasattr(self, "_response_bypass_guard"):
            from .rate_limit import RateLimiter

            audit_limiter = next(
                (
                    cell.cell_contents
                    for cell in endpoint.__closure__ or ()
                    if isinstance(cell.cell_contents, RateLimiter)
                ),
                None,
            )
            if inspect.iscoroutinefunction(endpoint):

                @wraps(endpoint)
                async def guarded_endpoint(*args: Any, **endpoint_kwargs: Any) -> Any:
                    if audit_limiter is not None:
                        _ = audit_limiter
                    value = await endpoint(*args, **endpoint_kwargs)
                    self._reject_raw_response_bypass(value)
                    return value

            else:

                @wraps(endpoint)
                def guarded_endpoint(*args: Any, **endpoint_kwargs: Any) -> Any:
                    if audit_limiter is not None:
                        _ = audit_limiter
                    value = endpoint(*args, **endpoint_kwargs)
                    self._reject_raw_response_bypass(value)
                    return value

            # ``wraps`` normally exposes ``__wrapped__`` so introspection can
            # follow decorator chains.  A bare endpoint would therefore look
            # decorated after the response guard is installed, which makes
            # route-level cache/rate-limit audits report false positives. Keep
            # the original signature for FastAPI, but preserve the marker only
            # when the endpoint already had a decorator chain of its own.
            if not hasattr(endpoint, "__wrapped__"):
                guarded_endpoint.__dict__.pop("__wrapped__", None)
                guarded_endpoint.__signature__ = inspect.signature(endpoint)

            self._response_bypass_original_endpoint = endpoint
            self._response_bypass_guard = guarded_endpoint
            self.dependant.call = guarded_endpoint
            # Included routers build their effective dependency graph from
            # ``route.endpoint``. Keeping this in sync makes the same guard
            # apply whether a route is registered directly or through any
            # number of APIRouter inclusions.
            self.endpoint = guarded_endpoint
        return super().get_route_handler()

    def _sync_response_bypass_endpoint(self) -> None:
        """Keep endpoint metadata used by middleware after application assembly."""

        guarded_endpoint = getattr(self, "_response_bypass_guard", None)
        if guarded_endpoint is None:
            return
        original_endpoint = getattr(
            guarded_endpoint,
            "__wrapped__",
            getattr(self, "_response_bypass_original_endpoint", None),
        )
        if original_endpoint is not None:
            guarded_endpoint.__dict__.update(getattr(original_endpoint, "__dict__", {}))
        self.endpoint = guarded_endpoint

    def _reject_raw_response_bypass(self, value: Any) -> None:
        if not _is_concrete_response_model(self.response_model) or not isinstance(value, Response):
            return
        raise ResponseValidationError(
            errors=[
                {
                    "type": "response_model_bypassed",
                    "loc": ("response",),
                    "msg": "response-model routes must return data, not a raw Response",
                    "input": value,
                }
            ],
            body=value,
        )


__all__ = [
    "PUBLIC_RESPONSE_MODEL_MISSING_BASELINE",
    "ResponseModelCoverage",
    "ResponseModelCoverageError",
    "StrictResponseValidationRoute",
    "allow_response_model_exemption",
    "collect_response_model_coverage",
    "enforce_response_model_coverage",
    "install_strict_response_validation",
]
