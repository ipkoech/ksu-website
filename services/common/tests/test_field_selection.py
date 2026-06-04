from ksu_common.field_selection import apply_field_selection, parse_field_selection


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


def test_apply_field_selection_preserves_null_nested_relationship():
    class DepartmentRecord:
        id = "department-1"
        school = None
        wing = {"id": "wing-1", "name": "ICT Wing", "code": "ICT"}

    selection = parse_field_selection(
        fields="id",
        include="school:id,name;wing:id,name",
    )

    assert apply_field_selection(DepartmentRecord(), selection) == {
        "id": "department-1",
        "school": None,
        "wing": {"id": "wing-1", "name": "ICT Wing"},
    }


def test_apply_field_selection_uses_id_only_for_bare_dict_include():
    record = {
        "id": "department-1",
        "name": "Computing Science",
        "school": {
            "id": "school-1",
            "name": "School of Information Science and Technology",
            "slug": "school-of-information-science-technology",
        },
        "programmes": [
            {"id": "programme-1", "title": "BSc Computer Science", "duration": "4 years"},
            {"id": "programme-2", "title": "MSc Computer Science", "duration": "2 years"},
        ],
    }

    selection = parse_field_selection(fields="id,name", include="school;programmes")

    assert apply_field_selection(record, selection) == {
        "id": "department-1",
        "name": "Computing Science",
        "school": {"id": "school-1"},
        "programmes": [
            {"id": "programme-1"},
            {"id": "programme-2"},
        ],
    }


def test_apply_field_selection_uses_id_only_for_bare_object_include():
    class MediaRecord:
        id = "media-1"
        title = "Cover image"
        public_url = "https://example.test/cover.jpg"

    class SchoolRecord:
        id = "school-1"
        name = "School of Information Science and Technology"
        cover_image = MediaRecord()

    selection = parse_field_selection(fields="id,name", include="cover_image")

    assert apply_field_selection(SchoolRecord(), selection) == {
        "id": "school-1",
        "name": "School of Information Science and Technology",
        "cover_image": {"id": "media-1"},
    }


def test_apply_field_selection_expands_requested_nested_relationship_fields():
    record = {
        "id": "school-1",
        "cover_image": {
            "id": "media-1",
            "title": "Cover image",
            "public_url": "https://example.test/cover.jpg",
            "size": 12345,
        },
    }

    selection = parse_field_selection(
        fields="id",
        include="cover_image(id,title,public_url)",
    )

    assert apply_field_selection(record, selection) == {
        "id": "school-1",
        "cover_image": {
            "id": "media-1",
            "title": "Cover image",
            "public_url": "https://example.test/cover.jpg",
        },
    }
