"""Portal domain scoping must bind domain-only callers server-side.

These guard the Research Portal's separation between the farm and
sustainability workspaces. Both domains are carved out of *shared* tables, so
the filters below are the only thing preventing a farm manager from reaching
every project, partner, and story in the service.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest
from fastapi import HTTPException

_MODULE_PATH = (
    Path(__file__).resolve().parents[1] / "app" / "services" / "research_domains.py"
)


def _load_research_domains():
    """Import the module directly.

    ``app.services.__init__`` eagerly imports modules that construct Settings
    (and therefore demand JWT env vars), which this pure-logic module does not
    need.
    """
    spec = importlib.util.spec_from_file_location("research_domains", _MODULE_PATH)
    module = importlib.util.module_from_spec(spec)
    sys.modules["research_domains"] = module
    spec.loader.exec_module(module)
    return module


rd = _load_research_domains()

from ksu_common.auth import TokenPayload  # noqa: E402  (after sys.modules setup)


def _user(*permissions: str) -> TokenPayload:
    return TokenPayload(
        sub="00000000-0000-0000-0000-000000000001",
        jti="jti",
        roles=[],
        raw={"permissions": list(permissions)},
    )


FARM = _user("farm.view", "farm.manage", "farm.submit", "research.view")
SUSTAINABILITY = _user(
    "sustainability.view", "sustainability.manage", "research.view"
)
ADMIN = _user(
    "research.manage_projects",
    "research.review",
    "research.publish",
    "farm.view",
    "sustainability.view",
)


class _Payload:
    """Stand-in for a create/update schema instance."""

    def __init__(self, **values):
        self.__dict__.update(values)


def test_domain_membership_is_derived_from_the_permission_namespace():
    assert rd.caller_domains(FARM) == ["farm"]
    assert rd.caller_domains(SUSTAINABILITY) == ["sustainability"]
    assert not rd.has_global_research_authority(FARM)
    assert rd.has_global_research_authority(ADMIN)


def test_shared_tables_are_narrowed_for_domain_only_callers():
    assert rd.resolve_domain_filters(FARM, "projects") == {"project_type": "action"}
    assert rd.resolve_domain_filters(FARM, "partners") == {"partner_type": "community"}
    assert rd.resolve_domain_filters(SUSTAINABILITY, "partners") == {
        "partner_type": "sustainability"
    }


def test_domain_owned_tables_need_no_discriminator():
    assert rd.resolve_domain_filters(FARM, "farms") == {}
    assert rd.resolve_domain_filters(SUSTAINABILITY, "sustainability") == {}


def test_global_research_authority_is_never_narrowed():
    assert rd.resolve_domain_filters(ADMIN, "projects") == {}
    assert rd.resolve_domain_filters(ADMIN, "partners") == {}


@pytest.mark.parametrize(
    ("caller", "resource"),
    [
        (FARM, "sustainability"),
        (FARM, "grants"),
        (SUSTAINABILITY, "farms"),
        (SUSTAINABILITY, "grants"),
    ],
)
def test_resources_outside_the_domain_are_refused(caller, resource):
    with pytest.raises(HTTPException) as excinfo:
        rd.resolve_domain_filters(caller, resource)
    assert excinfo.value.status_code == 403


def test_a_write_cannot_move_a_record_out_of_its_domain():
    with pytest.raises(HTTPException) as excinfo:
        rd.assert_record_in_domain(FARM, "projects", _Payload(project_type="applied"))
    assert excinfo.value.status_code == 403


def test_a_write_that_keeps_the_discriminator_is_allowed():
    rd.assert_record_in_domain(FARM, "projects", _Payload(project_type="action"))


def test_a_partial_patch_that_omits_the_discriminator_is_allowed():
    rd.assert_record_in_domain(FARM, "projects", _Payload(title="Season 2 trial"))


def test_admins_may_write_any_type():
    rd.assert_record_in_domain(ADMIN, "projects", _Payload(project_type="applied"))


def test_create_payloads_are_stamped_so_new_records_stay_visible():
    payload = _Payload(project_type=None, title="New farm trial")
    rd.stamp_domain_defaults(FARM, "projects", payload)
    assert payload.project_type == "action"


def test_stamping_never_overrides_an_explicit_matching_value():
    payload = _Payload(project_type="action", title="Explicit")
    rd.stamp_domain_defaults(FARM, "projects", payload)
    assert payload.project_type == "action"


STAFF = _user("farm.view", "sustainability.view", "research.view", "research.submit")


def test_a_multi_domain_caller_is_still_narrowed_by_the_owning_domain():
    """Research staff read both workspaces but must not see the whole table."""
    assert rd.caller_domains(STAFF) == ["farm", "sustainability"]
    assert not rd.has_global_research_authority(STAFF)
    # 'projects' belongs to the farm domain only, so the farm filter applies.
    assert rd.resolve_domain_filters(STAFF, "projects") == {"project_type": "action"}


def test_a_multi_domain_caller_is_refused_resources_no_domain_owns():
    with pytest.raises(HTTPException) as excinfo:
        rd.resolve_domain_filters(STAFF, "grants")
    assert excinfo.value.status_code == 403


def test_contested_resources_fall_back_to_agreed_filters_only():
    """Both domains claim 'partners' with different types.

    Applying either one would hide the other domain's records from a caller
    entitled to see both, so only filters the domains agree on survive.
    """
    assert rd.resolve_domain_filters(STAFF, "partners") == {}


def test_portal_filters_match_the_public_site_contract():
    """The portal and the public research site must agree.

    ``apps/research/src/lib/research-public-data.ts`` filters ``/farm`` on
    these same values; if they drift, a manager's record is filed under a
    domain the public page will never show.
    """
    farm = rd.DOMAIN_DEFINITIONS[rd.FARM_DOMAIN].resource_filters
    assert farm["projects"] == {"project_type": "action"}
    assert farm["partners"] == {"partner_type": "community"}
    assert farm["events"] == {"event_type": "workshop"}
