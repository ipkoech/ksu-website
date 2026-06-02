import unittest
from collections import Counter

from app.seeders._shared import ADMIN_DEPARTMENTS
from app.seeders._shared import SCHOOL_SPECS
from app.seeders.seed_admin_departments import ADMIN_SERVICE_SPECS, MOVED_ADMIN_SERVICE_SLUGS
from app.seeders.programme_catalogue import BROCHURE_PROGRAMMES
from app.seeders.seed_programmes import programme_code
from app.seeders.seed_public_records import CONTACT_SPECS, DOWNLOAD_SPECS, FAQ_SPECS
from app.schemas.base import slugify


def duplicates(values):
    return sorted(value for value, count in Counter(values).items() if count > 1)


class SeederDataTests(unittest.TestCase):
    def test_admin_department_specs_are_unique(self):
        self.assertEqual([], duplicates(spec["code"] for spec in ADMIN_DEPARTMENTS))
        self.assertEqual([], duplicates(spec["name"] for spec in ADMIN_DEPARTMENTS))

    def test_official_administration_departments_are_seeded(self):
        official_department_names = {
            "Internal Audit",
            "Procurement and Supplies",
            "Salaries",
            "Student Career Services",
            "Dean of Students",
            "Games and Sports Services",
            "Medical Services",
            "Security",
            "Information Communication and Technology (ICT)",
            "Planning",
            "Central Services",
            "Finance",
            "Registrar Administration",
            "E-Learning Directorate",
            "Town Annexes",
            "Board of Post Graduate Studies",
            "Corporate Communication",
            "Legal Department",
            "Registrar Academic Affairs",
        }
        seeded_by_name = {spec["name"]: spec for spec in ADMIN_DEPARTMENTS}

        self.assertEqual(set(), official_department_names - set(seeded_by_name))
        for department_name in official_department_names:
            self.assertIn("https://kisiiuniversity.ac.ke/dpt/", seeded_by_name[department_name]["source_url"])

    def test_school_and_academic_department_specs_are_unique(self):
        school_codes = [spec["code"] for spec in SCHOOL_SPECS]
        school_names = [spec["name"] for spec in SCHOOL_SPECS]
        department_codes = [
            department["code"]
            for school in SCHOOL_SPECS
            for department in school["departments"]
        ]
        department_names = [
            department["name"]
            for school in SCHOOL_SPECS
            for department in school["departments"]
        ]

        self.assertEqual([], duplicates(school_codes))
        self.assertEqual([], duplicates(school_names))
        self.assertEqual([], duplicates(department_codes))
        self.assertEqual([], duplicates(department_names))

    def test_programme_specs_link_to_existing_departments(self):
        department_codes = {
            department["code"]
            for school in SCHOOL_SPECS
            for department in school["departments"]
        }
        programme_department_codes = {
            str(spec["department_code"])
            for spec in BROCHURE_PROGRAMMES
        }

        self.assertEqual(set(), programme_department_codes - department_codes)

    def test_programme_specs_have_unique_generated_identifiers(self):
        programme_slugs = [slugify(str(spec["name"])) for spec in BROCHURE_PROGRAMMES]
        programme_codes = [
            programme_code(str(spec["name"]), str(spec["level"]))
            for spec in BROCHURE_PROGRAMMES
        ]

        self.assertEqual([], duplicates(programme_slugs))
        self.assertEqual([], duplicates(programme_codes))

    def test_live_site_programme_department_relationship_overrides(self):
        expected_department_codes = {
            "Bachelor of Business and Management": "ACCFIN",
            "Bachelor of Education (Arts)": "EDFAPE",
            "Bachelor of Education (Primary Option)": "CIM",
            "Bachelor of Education (Special Needs Education)": "CIM",
            "Diploma in Agricultural Economics": "AGEDX",
            "Diploma in Education Arts": "ECDESNEEPSC",
            "Master of Business Administration": "ACCFIN",
            "PhD in Educational Management": "ECDESNEEPSC",
        }
        programmes_by_name = {str(spec["name"]): spec for spec in BROCHURE_PROGRAMMES}

        for programme_name, department_code in expected_department_codes.items():
            self.assertEqual(department_code, programmes_by_name[programme_name]["department_code"])

    def test_admin_service_specs_are_unique_per_department(self):
        department_codes = {spec["code"] for spec in ADMIN_DEPARTMENTS}
        service_keys = [(spec["department_code"], spec["slug"]) for spec in ADMIN_SERVICE_SPECS]

        self.assertEqual([], duplicates(service_keys))
        self.assertEqual(
            set(),
            {spec["department_code"] for spec in ADMIN_SERVICE_SPECS} - department_codes,
        )

    def test_moved_admin_services_are_not_reseeded_on_old_departments(self):
        service_keys = {(spec["department_code"], spec["slug"]) for spec in ADMIN_SERVICE_SPECS}

        for department_code, service_slugs in MOVED_ADMIN_SERVICE_SLUGS.items():
            for service_slug in service_slugs:
                self.assertNotIn((department_code, service_slug), service_keys)

    def test_public_record_specs_are_unique(self):
        self.assertEqual([], duplicates(spec["slug"] for spec in DOWNLOAD_SPECS))
        self.assertEqual([], duplicates(spec["url"] for spec in DOWNLOAD_SPECS))
        self.assertEqual([], duplicates(spec["question"] for spec in FAQ_SPECS))
        self.assertEqual([], duplicates(spec["name"] for spec in CONTACT_SPECS))


if __name__ == "__main__":
    unittest.main()
