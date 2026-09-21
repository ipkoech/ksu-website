import json
from types import SimpleNamespace

import pytest

from app.schemas.person import PersonSnapshot
from app.seeders.seed_agenda_cods import FIXTURE, resolve_person


def test_roster_contains_only_reviewed_cod_rows():
    entries = json.loads(FIXTURE.read_text())['entries']
    assert {e['row'] for e in entries} == set(range(22, 63)) | {65, 67, 69}
    assert len({e['department_code'] for e in entries}) == 44
    assert {e['person_name'] for e in entries if e['allow_create']} == {
        'Edwin M. Kimathi', 'Benjamin Ndimbile', 'Jimmy Ongori',
        'Dr.  Muchonjo John Karanja',
    }


def test_reviewed_email_selects_existing_identity_among_duplicates():
    correct = SimpleNamespace(full_name='Dr. Test Person', email='verified@example.org')
    other = SimpleNamespace(full_name='Test Person', email='other@example.org')
    entry = dict(person_name='Dr. Test Person', person_email=correct.email, allow_create=False)
    assert resolve_person([other, correct], entry) is correct


def test_ambiguous_name_does_not_create_duplicate():
    entry = dict(person_name='Test Person', person_email=None, allow_create=True)
    with pytest.raises(ValueError, match='Ambiguous'):
        resolve_person([SimpleNamespace(full_name='Test Person'), SimpleNamespace(full_name='Dr. Test Person')], entry)


def test_missing_existing_identity_is_not_recreated():
    with pytest.raises(ValueError, match='directory first'):
        resolve_person([], dict(person_name='Test Person', person_email=None, allow_create=False))


def test_public_profile_can_have_no_email():
    assert PersonSnapshot.model_validate({'full_name':'Jimmy Ongori', 'email':None}).email is None
