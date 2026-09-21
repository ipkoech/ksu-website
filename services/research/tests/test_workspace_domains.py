from types import SimpleNamespace

import pytest
import sqlalchemy as sa
from fastapi import HTTPException
from ksu_common.auth import TokenPayload

from app.models import Partner
from app.services._crud import build_simple_service
from app.services.research_domains import assert_record_in_domain, resolve_domain_filters


def actor(*permissions):
    return TokenPayload("user", "session", raw={"scope_grants": [
        {"scope_type": "global", "permissions": list(permissions)},
    ]})


def test_combined_domains_are_a_sql_union_not_unrestricted():
    user = actor("farm.view", "sustainability.view")
    filters = resolve_domain_filters(user, "partners")
    service = build_simple_service(Partner, "name")
    query = service._apply_filters(sa.select(Partner.id), filters)
    sql = str(query.compile(compile_kwargs={"literal_binds": True}))
    assert "partners.partner_type = 'community' OR research.partners.partner_type = 'sustainability'" in sql
    for kind in ("community", "sustainability"):
        assert_record_in_domain(user, "partners", SimpleNamespace(partner_type=kind))
    with pytest.raises(HTTPException):
        assert_record_in_domain(user, "partners", SimpleNamespace(partner_type="commercial"))


@pytest.mark.parametrize("extra", ["research.review", "research.manage_centers", "funding.manage"])
def test_unrelated_permissions_do_not_remove_domain_restrictions(extra):
    assert resolve_domain_filters(actor("farm.view", extra), "partners") == {"partner_type": "community"}


def test_empty_authority_denies_and_explicit_oversight_allows():
    with pytest.raises(HTTPException):
        resolve_domain_filters(actor(), "partners")
    assert resolve_domain_filters(actor("research.oversight"), "partners") == {}


def test_innovation_cannot_unlock_funding():
    user = actor("innovation.manage_startups")
    assert resolve_domain_filters(user, "startups") == {}
    with pytest.raises(HTTPException):
        resolve_domain_filters(user, "grants")
