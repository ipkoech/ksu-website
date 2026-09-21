from __future__ import annotations

from fastapi import APIRouter, status

from ksu_common.response_validation import collect_response_model_coverage


def test_explicit_no_content_routes_are_covered_without_a_body_model() -> None:
    router = APIRouter()

    @router.delete("/resource/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def delete_resource(resource_id: str):
        return None

    @router.get("/resource/{resource_id}")
    async def get_resource(resource_id: str):
        return {"id": resource_id}

    coverage = collect_response_model_coverage(router.routes)
    assert coverage.missing == ("GET /resource/{resource_id}",)
    assert coverage.nonconcrete == ()
