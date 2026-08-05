from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class ResearchSearchIndexingContractTests(unittest.TestCase):
    def test_research_search_migration_adds_trigram_indexes(self):
        migration = ROOT / "migrations/versions/20260630_0003_add_research_search_indexes.py"
        text = migration.read_text()

        self.assertIn("CREATE EXTENSION IF NOT EXISTS pg_trgm", text)
        self.assertIn("ix_research_projects_search_trgm", text)
        self.assertIn("ix_research_publications_search_trgm", text)
        self.assertIn("ix_research_grants_search_trgm", text)
        self.assertIn("gin_trgm_ops", text)


if __name__ == "__main__":
    unittest.main()
