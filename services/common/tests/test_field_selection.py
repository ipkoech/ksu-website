from ksu_common.field_selection import parse_field_selection


def test_include_supports_parenthesis_notation():
    selection = parse_field_selection(
        include="role_assignments(role(id,name,display_name))"
    )

    assert "role_assignments" in selection.nested
    assert "role" in selection.nested["role_assignments"].nested
    assert set(selection.nested["role_assignments"].nested["role"].fields) == {
        "id",
        "name",
        "display_name",
    }


def test_include_supports_mixed_parenthesis_and_simple_segments():
    selection = parse_field_selection(
        fields="id,email",
        include="role_assignments(role(id,name)),sessions:id;person(full_name)",
    )

    assert set(selection.fields) == {"id", "email"}
    assert "role_assignments" in selection.nested
    assert "sessions" in selection.nested
    assert selection.nested["sessions"].fields == ("id",)
    assert "person" in selection.nested
    assert set(selection.nested["person"].fields) == {"full_name"}


def test_include_supports_nested_dot_path_with_multiple_fields():
    selection = parse_field_selection(
        include="role_assignments.role:id,name,display_name"
    )

    assert "role_assignments" in selection.nested
    assert "role" in selection.nested["role_assignments"].nested
    assert set(selection.nested["role_assignments"].nested["role"].fields) == {
        "id",
        "name",
        "display_name",
    }


def test_include_supports_multiple_nested_relationships_with_fields():
    selection = parse_field_selection(
        include="role_assignments.role:id,name,display_name;sessions:id,last_used_at"
    )

    assert set(selection.nested["role_assignments"].nested["role"].fields) == {
        "id",
        "name",
        "display_name",
    }
    assert selection.nested["sessions"].fields == ("id", "last_used_at")
