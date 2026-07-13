from types import SimpleNamespace
import uuid

import pytest

from app.api.v1.page_cms import list_page_cms_definitions
from app.models import PAGE_SECTION_LAYOUT_VARIANTS, SECTION_ITEM_TYPES
from app.schemas.page_cms import SectionDefinitionRead
from app.services.page_cms_definitions import SECTION_DEFINITIONS, serialize_section_definitions


def test_every_model_variant_has_one_admin_definition():
    assert set(PAGE_SECTION_LAYOUT_VARIANTS) == set(SECTION_DEFINITIONS)


def test_hero_definition_requires_desktop_and_mobile_media():
    hero = SECTION_DEFINITIONS["hero_admissions"]

    assert hero.media_roles["hero_image"].required is True
    assert hero.media_roles["mobile_image"].required is True
    assert hero.max_items == 3


def test_definitions_only_advertise_current_section_item_types():
    advertised_item_types = {
        item_type
        for definition in SECTION_DEFINITIONS.values()
        for item_type in definition.allowed_item_types
    }

    assert advertised_item_types <= set(SECTION_ITEM_TYPES)


def test_serialized_definitions_match_the_read_schema_in_label_order():
    definitions = serialize_section_definitions()

    assert [definition["label"] for definition in definitions] == sorted(
        definition["label"] for definition in definitions
    )
    assert [
        SectionDefinitionRead.model_validate(definition).model_dump()
        for definition in definitions
    ] == definitions


def _user_with_permission(permission: str):
    return SimpleNamespace(
        id=uuid.uuid4(),
        is_active=True,
        deleted_at=None,
        role_assignments=[
            SimpleNamespace(
                is_active=True,
                scope_type=None,
                scope_id=None,
                role=SimpleNamespace(
                    is_active=True,
                    role_permissions=[
                        SimpleNamespace(permission=SimpleNamespace(name=permission, is_active=True))
                    ],
                ),
            )
        ],
    )


@pytest.mark.asyncio
async def test_definition_endpoint_returns_the_stably_sorted_registry():
    response = await list_page_cms_definitions(_user_with_permission("page_sections.view"))

    assert response["data"] == serialize_section_definitions()
