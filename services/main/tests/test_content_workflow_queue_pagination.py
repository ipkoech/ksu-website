import unittest

from app.api.v1.content_workflow import paginate_queue_items


def _item(title: str, status: str = "submitted") -> dict:
    return {"title": title, "status": status}


class QueuePaginationTests(unittest.TestCase):
    def test_without_per_page_the_full_list_and_counts_are_returned(self):
        items = [_item("A"), _item("B", "approved"), _item("C", "in_review")]

        visible, meta = paginate_queue_items(items)

        self.assertEqual(items, visible)
        self.assertEqual(3, meta["total"])
        self.assertEqual(
            {"submitted": 1, "approved": 1, "in_review": 1}, meta["status_counts"]
        )
        self.assertNotIn("page", meta)
        self.assertNotIn("pages", meta)

    def test_pagination_slices_but_counts_describe_the_whole_queue(self):
        items = [_item(f"Item {index}", "submitted" if index % 2 else "approved") for index in range(5)]

        visible, meta = paginate_queue_items(items, page=2, per_page=2)

        self.assertEqual(items[2:4], visible)
        self.assertEqual(5, meta["total"])
        self.assertEqual(2, meta["page"])
        self.assertEqual(2, meta["per_page"])
        self.assertEqual(3, meta["pages"])
        self.assertEqual({"submitted": 2, "approved": 3}, meta["status_counts"])

    def test_page_past_the_end_returns_an_empty_slice_not_an_error(self):
        visible, meta = paginate_queue_items([_item("Only one")], page=9, per_page=10)

        self.assertEqual([], visible)
        self.assertEqual(1, meta["total"])
        self.assertEqual(1, meta["pages"])

    def test_search_matches_titles_case_insensitively_before_counting(self):
        items = [
            _item("Graduation ceremony", "submitted"),
            _item("Campus news", "approved"),
            _item("GRADUATION gallery", "approved"),
        ]

        visible, meta = paginate_queue_items(items, q="graduation", page=1, per_page=10)

        self.assertEqual(["Graduation ceremony", "GRADUATION gallery"], [item["title"] for item in visible])
        self.assertEqual(2, meta["total"])
        self.assertEqual({"submitted": 1, "approved": 1}, meta["status_counts"])

    def test_blank_search_is_ignored(self):
        items = [_item("A"), _item("B")]

        visible, meta = paginate_queue_items(items, q="   ")

        self.assertEqual(2, len(visible))
        self.assertEqual(2, meta["total"])


if __name__ == "__main__":
    unittest.main()
