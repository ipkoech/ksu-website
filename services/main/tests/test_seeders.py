import unittest
from collections import Counter

from app.seeders._shared import ADMIN_DEPARTMENTS
from app.seeders.seed_admin_departments import ADMIN_SERVICE_SPECS
from app.seeders.seed_public_records import CONTACT_SPECS, DOWNLOAD_SPECS, FAQ_SPECS


def duplicates(values):
    return sorted(value for value, count in Counter(values).items() if count > 1)


class SeederDataTests(unittest.TestCase):
    def test_admin_department_specs_are_unique(self):
        self.assertEqual([], duplicates(spec["code"] for spec in ADMIN_DEPARTMENTS))
        self.assertEqual([], duplicates(spec["name"] for spec in ADMIN_DEPARTMENTS))

    def test_admin_service_specs_are_unique_per_department(self):
        department_codes = {spec["code"] for spec in ADMIN_DEPARTMENTS}
        service_keys = [(spec["department_code"], spec["slug"]) for spec in ADMIN_SERVICE_SPECS]

        self.assertEqual([], duplicates(service_keys))
        self.assertEqual(
            set(),
            {spec["department_code"] for spec in ADMIN_SERVICE_SPECS} - department_codes,
        )

    def test_public_record_specs_are_unique(self):
        self.assertEqual([], duplicates(spec["slug"] for spec in DOWNLOAD_SPECS))
        self.assertEqual([], duplicates(spec["url"] for spec in DOWNLOAD_SPECS))
        self.assertEqual([], duplicates(spec["question"] for spec in FAQ_SPECS))
        self.assertEqual([], duplicates(spec["name"] for spec in CONTACT_SPECS))


if __name__ == "__main__":
    unittest.main()
