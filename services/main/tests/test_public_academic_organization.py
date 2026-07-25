import unittest
import uuid
from types import SimpleNamespace

from app.api.v1.public_team import _academic_organization_payload


def _person(name: str, *, title: str | None = None, photo_url: str | None = None):
    person = SimpleNamespace(
        id=uuid.uuid4(),
        slug=str(uuid.uuid4()),
        title=title,
        full_name=name,
        photo_id=None,
        photo=SimpleNamespace(public_url=photo_url) if photo_url else None,
    )
    return person


def _assignment(person, *, role: str, title: str, entity_type: str, entity_id: uuid.UUID, level: int, order: int):
    return SimpleNamespace(
        id=uuid.uuid4(),
        person_id=person.id,
        person=person,
        role=role,
        title=title,
        public_role_label=None,
        official_designation=None,
        entity_type=entity_type,
        entity_id=entity_id,
        hierarchy_level=level,
        display_order=order,
    )


class AcademicOrganizationPayloadTests(unittest.TestCase):
    def test_builds_dvc_registrar_dean_tiers_in_hierarchy_order(self):
        division = SimpleNamespace(id=uuid.uuid4(), name="Division of Academic, Research & Student Affairs", code="ARSA", slug="division-of-academic-research-student-affairs")
        wing = SimpleNamespace(id=uuid.uuid4(), name="Academic Affairs", code="RAA", slug="academic-affairs")
        school = SimpleNamespace(id=uuid.uuid4(), name="School of Information Science & Technology", code="SIST", slug="school-of-information-science-technology")

        dvc = _assignment(
            _person("Fredrick O. Wanyama", title="Prof.", photo_url="https://example.test/dvc.jpg"),
            role="dvc",
            title="Deputy Vice Chancellor, Academic, Research & Student Affairs",
            entity_type="division",
            entity_id=division.id,
            level=3,
            order=1,
        )
        registrar = _assignment(
            _person("Kennedy Getange", title="Prof."),
            role="registrar",
            title="Ag. Registrar AA",
            entity_type="wing",
            entity_id=wing.id,
            level=4,
            order=1,
        )
        dean = _assignment(
            _person("Jane Cherono Maina"),
            role="dean",
            title="Dean, School of Information Science & Technology",
            entity_type="school",
            entity_id=school.id,
            level=5,
            order=10,
        )

        payload = _academic_organization_payload(
            division=division,
            registrar_wing=wing,
            dvc_assignments=[dvc],
            registrar_assignments=[registrar],
            dean_assignments=[dean],
            schools_by_id={school.id: school},
        )

        self.assertEqual("academic_organization", payload["key"])
        self.assertEqual(["dvc", "registrar", "deans"], [tier["key"] for tier in payload["tiers"]])
        self.assertEqual("Prof. Fredrick O. Wanyama", payload["tiers"][0]["members"][0]["name"])
        self.assertEqual("Ag. Registrar AA", payload["tiers"][1]["members"][0]["position"])
        self.assertEqual("SIST", payload["tiers"][2]["members"][0]["entity"]["code"])
        self.assertEqual(
            ["Deputy Vice Chancellor", "Registrar", "Deans"],
            [level["label"] for level in payload["hierarchy"]],
        )
        self.assertEqual({"tiers": 3, "members": 3, "deans": 1}, payload["counts"])


if __name__ == "__main__":
    unittest.main()
