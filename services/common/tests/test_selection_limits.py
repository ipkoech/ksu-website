import pytest

from ksu_common.field_selection import parse_field_selection


@pytest.mark.parametrize("syntax", ["parentheses", "dotted", "mixed"])
def test_relationship_depth_is_bounded_for_all_parser_syntaxes(syntax):
    def selection(depth):
        if syntax == "parentheses":
            return parse_field_selection(fields="child(" * depth + "id" + ")" * depth)
        if syntax == "dotted":
            return parse_field_selection(include=".".join(["child"] * depth) + ":id")
        return parse_field_selection(fields="child(" + ".".join(["child"] * (depth - 1)) + ":id)")

    assert selection(8)
    with pytest.raises(ValueError, match="maximum relationship depth"):
        selection(9)


def test_combined_repeated_fields_and_includes_share_length_budget():
    assert parse_field_selection(fields="x" * 16384)
    with pytest.raises(ValueError, match="maximum length"):
        parse_field_selection(fields=["x" * 8192], include=["y" * 8193])
    with pytest.raises(ValueError, match="maximum relationship depth"):
        parse_field_selection(fields="child(" * 1000 + "id" + ")" * 1000)


def test_excessive_http_selection_returns_compatible_input_error():
    from fastapi.testclient import TestClient
    from ksu_common.runtime import CorsConfig, ServiceAppConfig, create_service_app

    def register(app):
        @app.get("/items", response_model=int)
        async def items(fields: str):
            parse_field_selection(fields=fields)
            return 1

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=()), register_routes=register,
    )
    with TestClient(app) as client:
        assert client.get("/items", params={"fields": "id,author(id,name)"}).status_code == 200
        response = client.get("/items", params={"fields": "child(" * 9 + "id" + ")" * 9})
        assert response.status_code == 400
        assert "maximum relationship depth" in response.json()["message"]
