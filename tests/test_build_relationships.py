import unittest

from tools.build_relationships import normalize_relationships


class RelationshipNormalizationTests(unittest.TestCase):
    def test_rejects_self_reference(self):
        with self.assertRaisesRegex(ValueError, "cannot target itself"):
            normalize_relationships("project:jarvis", [{"type": "related_to", "target": "project:jarvis"}])

    def test_deduplicates_identical_edges(self):
        relation = {"type": "related_to", "target": "note:quality-is-designed"}
        self.assertEqual(normalize_relationships("project:jarvis", [relation, relation.copy()]), [relation])

    def test_preserves_distinct_relationship_meanings(self):
        relationships = [
            {"type": "documents", "target": "project:jarvis"},
            {"type": "shares_theme", "target": "project:jarvis"},
        ]
        self.assertEqual(normalize_relationships("article:architecture", relationships), relationships)


if __name__ == "__main__":
    unittest.main()
