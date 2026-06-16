from types import SimpleNamespace

from ksu_common.cache import _build_function_cache_key


async def sample_public_detail(slug, db=None, fields=None, include=None):
    return {"slug": slug, "fields": fields, "include": include}


def test_function_cache_key_varies_on_explicit_detail_parameters():
    base_key = _build_function_cache_key(
        "public",
        sample_public_detail,
        ("computer-science",),
        {"fields": "id,title", "include": "school:id,name"},
        ("slug", "fields", "include"),
    )
    changed_include_key = _build_function_cache_key(
        "public",
        sample_public_detail,
        ("computer-science",),
        {"fields": "id,title", "include": "department:id,name"},
        ("slug", "fields", "include"),
    )
    changed_slug_key = _build_function_cache_key(
        "public",
        sample_public_detail,
        ("software-engineering",),
        {"fields": "id,title", "include": "school:id,name"},
        ("slug", "fields", "include"),
    )

    assert base_key != changed_include_key
    assert base_key != changed_slug_key


def test_function_cache_key_ignores_infrastructure_arguments():
    db = SimpleNamespace(name="session")

    without_db = _build_function_cache_key(
        "public",
        sample_public_detail,
        ("computer-science",),
        {"fields": "id,title", "include": "school:id,name"},
        ("slug", "fields", "include"),
    )
    with_db = _build_function_cache_key(
        "public",
        sample_public_detail,
        ("computer-science",),
        {"db": db, "fields": "id,title", "include": "school:id,name"},
        ("slug", "fields", "include"),
    )

    assert without_db == with_db
