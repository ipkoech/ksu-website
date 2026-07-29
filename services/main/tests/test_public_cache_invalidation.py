from types import SimpleNamespace

from app.cache_invalidation import should_invalidate_public_cache


def _request(method: str, path: str):
    return SimpleNamespace(method=method, url=SimpleNamespace(path=path))


def test_successful_workflow_and_public_edits_invalidate_public_cache():
    assert should_invalidate_public_cache(
        _request("POST", "/api/v1/content-workflow/news/record-id/publish"),
        200,
    )
    assert should_invalidate_public_cache(
        _request("PATCH", "/api/v1/page-sections/record-id"),
        200,
    )
    assert should_invalidate_public_cache(
        _request("POST", "/api/v1/page-sections/record-id/unpublish"),
        200,
    )


def test_reads_failed_writes_and_auth_writes_do_not_invalidate_public_cache():
    assert not should_invalidate_public_cache(_request("GET", "/api/v1/news"), 200)
    assert not should_invalidate_public_cache(_request("PATCH", "/api/v1/news/id"), 400)
    assert not should_invalidate_public_cache(_request("POST", "/api/v1/auth/login"), 200)
