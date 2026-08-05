from __future__ import annotations

import httpx
import pytest
from app.services import electronic


class _Pool:
    def __init__(self, response: httpx.Response) -> None:
        self.response = response
        self.calls: list[tuple[tuple[object, ...], dict[str, object]]] = []

    async def request(self, *args: object, **kwargs: object) -> httpx.Response:
        self.calls.append((args, kwargs))
        return self.response


@pytest.mark.asyncio
async def test_crossref_search_uses_shared_pool_for_read(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    response = httpx.Response(
        200,
        json={
            "message": {
                "items": [
                    {
                        "DOI": "10.1000/example",
                        "title": ["Pooled search"],
                        "author": [{"given": "Ada", "family": "Lovelace"}],
                        "container-title": ["Journal"],
                        "published": {"date-parts": [[2025]]},
                        "URL": "https://doi.org/10.1000/example",
                    }
                ]
            }
        },
        request=httpx.Request("GET", "https://api.crossref.org/works"),
    )
    pool = _Pool(response)
    monkeypatch.setattr(electronic, "get_integration_pool", lambda: pool)

    results = await electronic._search_crossref("climate", "Ada", 2025, 2, 10)

    assert results[0].title == "Pooled search"
    args, kwargs = pool.calls[0]
    assert args == ("crossref", "https://api.crossref.org", "GET", "/works")
    assert kwargs["params"] == {
        "query": "climate",
        "rows": 10,
        "offset": 10,
        "query.author": "Ada",
        "filter": "from-pub-date:2025,until-pub-date:2025",
    }
