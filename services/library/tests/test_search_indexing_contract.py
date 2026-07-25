from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class LibrarySearchIndexingContractTests(unittest.TestCase):
    def test_library_search_migration_adds_trigram_indexes(self):
        migration = ROOT / "migrations/versions/20260630_0004_add_library_search_indexes.py"
        text = migration.read_text()

        self.assertIn("CREATE EXTENSION IF NOT EXISTS pg_trgm", text)
        self.assertIn("ix_library_resources_search_trgm", text)
        self.assertIn("ix_library_electronic_resources_search_trgm", text)
        self.assertIn("ix_library_guides_search_trgm", text)
        self.assertIn("gin_trgm_ops", text)


if __name__ == "__main__":
    unittest.main()
