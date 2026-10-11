"""Integrity checks for selected-entry evidence; no remote requests."""
import unittest

from compile_reviews import select_json_pointer


class JsonPointerTests(unittest.TestCase):
    def test_selected_array_entry_does_not_require_full_file_range(self):
        document = [{"case": "first"}, {"case": "second"}]
        self.assertEqual(select_json_pointer(document, "/0"), {"case": "first"})
        self.assertEqual(select_json_pointer(document, "/1/case"), "second")

    def test_escaped_keys_and_root(self):
        document = {"a/b": {"~key": 3}, "": 4}
        self.assertEqual(select_json_pointer(document, "/a~1b/~0key"), 3)
        self.assertEqual(select_json_pointer(document, "/"), 4)
        self.assertIs(select_json_pointer(document, ""), document)

    def test_missing_malformed_and_out_of_bounds_locators_fail(self):
        document = {"list": [10], "scalar": None}
        for pointer in ["list/0", "/missing", "/list/1", "/list/01", "/list/-", "/list/٠", "/scalar/x", "/~2"]:
            with self.subTest(pointer=pointer), self.assertRaises(ValueError):
                select_json_pointer(document, pointer)

    def test_numeric_object_keys_are_not_array_indices(self):
        self.assertEqual(select_json_pointer({"01": "value"}, "/01"), "value")


if __name__ == "__main__":
    unittest.main()
