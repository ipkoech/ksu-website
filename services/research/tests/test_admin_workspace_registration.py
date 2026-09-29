"""Run with the normal Research service test environment and its real imports."""
import pytest
from app.routes.v1 import router
from app.services.admin_workspace import field_specs, filter_fields_for, native_commands
from app.services.admin_workspace_registry import (
    EDITORIAL_RESOURCES,
    GROUPS,
    PATHWAY_RESOURCES,
    RESOURCES,
)
from app.services.research_workflow import adapter_for

EXPECTED = {key for group in GROUPS.values() for key in group}


def route_methods():
    """Read registered routes structurally so custom FastAPI route classes count."""
    return {
        (route.path, method)
        for route in router.routes
        for method in (getattr(route, "methods", None) or ())
        if hasattr(route, "path")
    }


def test_all_reviewed_native_areas_are_registered():
    assert len(EXPECTED) == 41
    assert EXPECTED <= RESOURCES.keys()


@pytest.mark.parametrize('key', sorted(EXPECTED))
def test_catalog_fields_are_native_stored_columns_with_explicit_readonly_flags(key):
    spec = RESOURCES[key]
    fields = field_specs(spec)
    columns = {column.key for column in spec.service.model.__table__.columns}
    create = set(spec.create_schema.model_fields)
    update = set(spec.update_schema.model_fields)
    forbidden = {'id', 'created_at', 'updated_at', 'deleted_at', 'editorial_state'}
    if key in EDITORIAL_RESOURCES:
        adapter = adapter_for(key)
        forbidden |= {adapter.boolean_field, adapter.status_field}
    editable = ((create | update) & columns) - forbidden
    actual_editable = {field['key'] for field in fields if field['create'] or field['update']}
    assert actual_editable == editable
    assert {field['key'] for field in fields} <= columns
    assert len({field['key'] for field in fields}) == len(fields)
    for field in fields:
        if field['key'] in editable:
            assert field['create'] == (field['key'] in create)
            assert field['update'] == (field['key'] in update)
        else:
            assert field['create'] is field['update'] is False
        assert field['kind'] in {'string','text','uuid','uri','email','date','date-time','integer','number','boolean','decimal','json'}


@pytest.mark.parametrize('key', sorted(EXPECTED))
def test_native_write_routes_exist_for_every_catalog_area(key):
    routes = route_methods()
    path = f'/research/{key}' if key == 'stories' else f'/{key}'
    assert (path, 'POST') in routes
    assert (f'{path}/id/{{item_id}}', 'PATCH') in routes
    assert (f'{path}/id/{{item_id}}', 'DELETE') in routes


@pytest.mark.parametrize('key', sorted(EXPECTED))
def test_filters_are_columns_not_arbitrary_orm_relationships(key):
    spec = RESOURCES[key]
    assert set(filter_fields_for(spec)) <= {column.key for column in spec.service.model.__table__.columns}


@pytest.mark.parametrize('key', sorted(PATHWAY_RESOURCES))
def test_specialized_commands_resolve_real_schemas_and_routes(key):
    routes = route_methods()
    commands = native_commands(key)
    assert commands
    for command in commands:
        assert (f'/{key}/id/{{item_id}}/{command["key"]}', 'POST') in routes
        # The native handlers do not persist these optional notes.
        assert 'note' not in {field['key'] for field in command['fields']}


def test_all_association_adapters_resolve_native_tables_and_services():
    from app.services.admin_workspace_operations import (
        ASSOCIATIONS,
        native_service,
        relationship_attribute,
    )
    assert len(ASSOCIATIONS) == 16
    for association in ASSOCIATIONS:
        relationship_attribute(association)
        service = native_service(association.service)
        assert callable(getattr(service, f"add_{association.action}"))
        assert callable(getattr(service, f"remove_{association.action}"))


def test_child_collections_resolve_native_parent_fields():
    from app.services.admin_workspace_operations import (
        CHILDREN,
        native_schema,
        native_service,
    )
    assert len(CHILDREN) == 4
    for collection in CHILDREN:
        service = native_service(collection.service)
        assert collection.parent_field in service.model.__table__.columns
        assert collection.parent_field in native_schema(collection.create_schema).model_fields
        assert callable(service.create) and callable(service.update) and callable(service.soft_delete)


def test_institutional_handoffs_only_preserve_native_authorized_navigation():
    from app.services.admin_workspace_registry import (
        INSTITUTIONAL_NAVIGATION,
        workspace_navigation,
    )
    from app.services.research_portal_context import RESEARCH_PORTAL_NAVIGATION
    native_keys = {key for key, _ in RESEARCH_PORTAL_NAVIGATION}
    assert INSTITUTIONAL_NAVIGATION <= native_keys
    assert workspace_navigation(["projects"], ["content-news", "content-news", "users"]) == ["projects", "content-news"]
    assert workspace_navigation([], []) == []
