import uuid

import pytest
from pydantic import TypeAdapter

from app.api.v1.governance import router


@pytest.mark.parametrize('path', ['/boards/{slug}/members', '/boards/id/{board_id}/members'])
def test_member_response_preserves_selected_person_and_reporting_fields(path):
    route = next(route for route in router.routes if route.path == path and 'GET' in route.methods)
    person_id = str(uuid.uuid4())
    member = {
        'id': str(uuid.uuid4()), 'person_id': person_id,
        'role': 'member', 'title': 'Deputy Vice Chancellor (ARSA)',
        'hierarchy_level': 3, 'display_order': 2, 'is_acting': False,
        'person': {'id': person_id, 'full_name': 'Test Member', 'title': 'Prof.',
                   'photo_url': 'https://example.org/portrait.jpg'},
    }
    adapter = TypeAdapter(route.response_model)
    parsed = adapter.validate_python({'status': 'success', 'message': 'ok', 'data': [member]})
    assert adapter.dump_python(parsed, mode='json', exclude_unset=True)['data'] == [member]
