from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import FileResponse, StreamingResponse
from ksu_common.response_validation import _iter_route_inspections
from ksu_common.runtime import CorsConfig, ServiceAppConfig, create_service_app


def _configure_research_env(monkeypatch, tmp_path) -> None:
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://user:pass@postgres:5432/ksu")
    monkeypatch.setenv("JWT_SECRET_KEY", "j" * 32)
    monkeypatch.setenv("MAIN_SERVICE_API_KEY", "m" * 32)
    monkeypatch.setenv("INTERNAL_API_KEY", "r" * 32)
    monkeypatch.setenv("LOG_DIR", str(tmp_path))
    monkeypatch.setenv("EXPORT_DIR", str(tmp_path / "exports"))
    monkeypatch.setenv("APP_ENV", "test")

    from app.core.config import get_settings

    get_settings.cache_clear()


def _selected_routes_app() -> FastAPI:
    from app.routes.v1.analytics import router as analytics_router
    from app.routes.v1.ask_ai import router as ask_ai_router
    from app.routes.v1.exports import router as exports_router
    from app.routes.v1.search import router as search_router

    def register_routes(app: FastAPI) -> None:
        app.include_router(analytics_router, prefix="/api/v1")
        app.include_router(ask_ai_router, prefix="/api/v1")
        app.include_router(search_router, prefix="/api/v1")
        app.include_router(exports_router, prefix="/api/v1")

    return create_service_app(
        ServiceAppConfig(
            service_name="research-response-slice",
            title="Research Response Slice",
            version="1.0.0",
            environment="production",
        ),
        cors=CorsConfig(origins=("https://example.test",)),
        register_routes=register_routes,
    )


def _inspected_routes(app: FastAPI):
    return {inspection.path: inspection for inspection in _iter_route_inspections(app.routes)}


def test_selected_public_routes_reduce_coverage_to_only_dynamic_export_json(
    monkeypatch, tmp_path
) -> None:
    _configure_research_env(monkeypatch, tmp_path)

    app = _selected_routes_app()
    coverage = app.state.response_model_coverage

    assert coverage.missing == ("GET /api/v1/exports/{resource_key}",)
    assert coverage.nonconcrete == ()
    assert coverage.invalid_exemptions == ()


def test_selected_public_routes_declare_concrete_models_or_real_stream_file_responses(
    monkeypatch, tmp_path
) -> None:
    _configure_research_env(monkeypatch, tmp_path)

    app = _selected_routes_app()
    routes = _inspected_routes(app)

    concrete_json_paths = (
        "/api/v1/analytics/dashboard",
        "/api/v1/ask-ai",
        "/api/v1/ask-ai/conversations",
        "/api/v1/ask-ai/conversations/{conversation_id}/messages",
        "/api/v1/search",
        "/api/v1/exports/{resource_key}/jobs",
        "/api/v1/exports/jobs/{job_id}",
    )
    for path in concrete_json_paths:
        assert routes[path].route.response_model is not None, path

    assert routes["/api/v1/ask-ai/stream"].response_class is StreamingResponse
    assert routes["/api/v1/exports/jobs/{job_id}/download"].response_class is FileResponse
    assert routes["/api/v1/exports/{resource_key}"].route.response_model is None
