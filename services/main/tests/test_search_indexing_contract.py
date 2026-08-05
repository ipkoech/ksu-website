from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class MainSearchIndexingContractTests(unittest.TestCase):
    def test_global_search_migration_adds_trigram_indexes(self):
        migration = ROOT / "migrations/versions/20260630_0003_add_global_search_indexes.py"
        text = migration.read_text()

        self.assertIn("CREATE EXTENSION IF NOT EXISTS pg_trgm", text)
        self.assertIn("ix_news_search_trgm", text)
        self.assertIn("ix_events_search_trgm", text)
        self.assertIn("ix_persons_search_trgm", text)
        self.assertIn("gin_trgm_ops", text)


if __name__ == "__main__":
    unittest.main()
