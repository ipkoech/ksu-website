from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "app" / "api" / "v1" / "public_research_context.py").read_text()
ROUTES = (ROOT / "app" / "api" / "v1" / "__init__.py").read_text()


def test_public_research_context_endpoint_merges_public_wing_and_hidden_department_content():
    assert "get_public_research_context" in SOURCE
    assert '"/api/v1/public/research/context"' in ROUTES
    assert "Research, Extension, Innovation and Resource Mobilization" in SOURCE
    assert 'Department.code == "REIRM"' in SOURCE
    assert "Department.school_id.is_(None)" in SOURCE
    assert "Department.department_type == RESEARCH_DEPARTMENT_TYPE" in SOURCE
    assert "RESEARCH_DEPARTMENT_BLOCKED_RELATIONS" in SOURCE
    assert "Department.is_public" not in SOURCE
    assert "merge_research_entity_payload" in SOURCE


def test_public_research_context_uses_field_selectors_for_relations_and_returns_team():
    assert "build_selector(Division" in SOURCE
    assert "build_selector(Wing" in SOURCE
    assert "build_selector(Department" in SOURCE
    assert "fields.get_nested" in SOURCE
    assert '"team"' in SOURCE
    assert '"leadership"' in SOURCE
    assert '"mission"' in SOURCE
    assert '"vision"' in SOURCE


def test_public_research_context_has_authenticated_edit_endpoint():
    assert "@router.patch" in SOURCE
    assert "ResearchContextUpdate" in SOURCE
    assert "CurrentUser" in SOURCE
    assert "can_access_scope" in SOURCE
    assert "WingService.update" in SOURCE
    assert "DepartmentService.update" in SOURCE
    assert "Research context updated" in SOURCE
