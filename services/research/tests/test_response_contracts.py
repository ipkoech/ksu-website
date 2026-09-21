from __future__ import annotations

from app.schemas.base import JsonObject, SuccessEnvelope


def test_legacy_json_envelope_accepts_nested_relationship_snapshots() -> None:
    response = SuccessEnvelope[list[JsonObject]].model_validate(
        {
            "status": "success",
            "data": [
                {
                    "id": "project-1",
                    "relationships": {
                        "media": [{"id": "media-1", "url": "https://example.edu/a.jpg"}],
                        "team": [{"person": {"id": "person-1", "name": "Researcher"}}],
                    },
                }
            ],
        }
    )

    assert response.data is not None
    assert (
        response.data[0]["relationships"]["team"][0]["person"]["name"]
        == "Researcher"
    )
