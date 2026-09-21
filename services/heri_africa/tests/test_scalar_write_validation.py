from datetime import datetime, timezone
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.models.content import NewsArticle, PageSection
from app.services.admin_resources import validated_values


def test_partner_projection_identity_and_source_fields_are_not_locally_rewritten():
    from app.models.partners import Partner
    from app.services.admin_resources import require_local_fields
    remote = Partner(research_partner_id=uuid4(), name="Research name")
    assert validated_values(Partner, {
        "research_partner_id": str(uuid4()), "research_center_id": str(uuid4()),
        "research_center_slug": "forged",
    }) == {}
    with pytest.raises(HTTPException) as denied:
        require_local_fields(remote, {"name": "Local replacement"})
    assert denied.value.status_code == 422
    require_local_fields(remote, {"name": "Research name", "relationship_notes": "Local note", "display_order": 1})
    require_local_fields(Partner(research_partner_id=None), {"name": "Locally authored partner"})


@pytest.mark.parametrize("model,payload", [
    (NewsArticle, {"title": None}),
    (NewsArticle, {"title": 123}),
    (NewsArticle, {"title": "x" * 1000}),
    (NewsArticle, {"scheduled_at": "invalid"}),
    (NewsArticle, {"scheduled_at": "2099-01-01T00:00:00"}),
    (PageSection, {"page_id": "not-a-uuid"}),
    (PageSection, {"position": True}),
    (PageSection, {"is_visible": "false"}),
])
def test_invalid_scalar_writes_return_client_error(model, payload):
    with pytest.raises(HTTPException) as invalid:
        validated_values(model, payload)
    assert invalid.value.status_code == 422


def test_restore_wire_values_parse_without_exposing_protected_fields():
    page = uuid4()
    assert validated_values(PageSection, {"page_id": str(page), "position": 2}) == {"page_id": page, "position": 2}
    result = validated_values(NewsArticle, {
        "scheduled_at": "2099-01-01T00:00:00Z", "excerpt": None,
        "status": "published", "id": str(uuid4()), "deleted_at": "2099-01-01T00:00:00Z",
    })
    assert result == {"scheduled_at": datetime(2099, 1, 1, tzinfo=timezone.utc), "excerpt": None}


def test_route_boundary_rejects_protected_fields_while_parser_stays_compatible():
    from app.services.admin_resources import reject_protected_fields
    with pytest.raises(HTTPException, match="Protected fields"):
        reject_protected_fields(NewsArticle, {"id": str(uuid4()), "title": "x"})
