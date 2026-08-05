from __future__ import annotations

from app.api.v1 import register_routes
from app.models import PublicSitePage
from app.schemas import PublicSitePageRead
from app.services import PublicSitePageService


def test_public_site_page_backend_exports_are_available():
    assert PublicSitePage.__tablename__ == "public_site_pages"
    assert PublicSitePageRead.model_fields["source_url"]
    assert PublicSitePageService.model is PublicSitePage


def test_public_site_pages_route_is_registered():
    class FakeApp:
        def __init__(self):
            self.prefixes: list[str] = []
            self.routes = []

        def include_router(self, _router, *, prefix: str, tags: list[str]):
            del tags
            self.prefixes.append(prefix)

        def add_middleware(self, *_args, **_kwargs):
            return None

    app = FakeApp()
    register_routes(app)  # type: ignore[arg-type]

    assert "/api/v1/public-pages" in app.prefixes
