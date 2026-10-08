"""Checks for scientifically consequential catalog corruption, using real inputs."""
import copy
import json
from pathlib import Path
import sqlite3
import unittest

from jsonschema import Draft202012Validator, ValidationError

from run_snapshot import (
    HERE, Inputs, insert_record, iter_records, make_database, stable_id,
    validate_record,
)


class CatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.validator = Draft202012Validator(json.loads((HERE / "catalog_record.schema.json").read_text()))
        cls.records = []
        for row in iter_records(Inputs(HERE.parents[1])):
            cls.records.append(row)
            if row["entity_type"] == "case":
                break
        cls.task = next(r for r in cls.records if r["entity_type"] == "task")
        cls.case = cls.records[-1]

    def test_preserved_source_records_pass(self):
        for row in self.records:
            validate_record(row, self.validator)

    def test_modified_native_payload_is_rejected(self):
        row = copy.deepcopy(self.task)
        row["native"]["title"] = "a different goal"
        with self.assertRaisesRegex(ValueError, "Native payload"):
            validate_record(row, self.validator)

    def test_metadata_cannot_be_promoted_to_evaluable(self):
        row = copy.deepcopy(self.case)
        row["evaluation_release_eligible"] = True
        with self.assertRaises(ValidationError):
            validate_record(row, self.validator)

    def test_source_domains_are_not_automatically_inherited_by_tasks(self):
        row = copy.deepcopy(self.task)
        row["data"]["domain_refs"] = [next(r["id"] for r in self.records if r["entity_type"] == "domain")]
        with self.assertRaises(ValidationError):
            validate_record(row, self.validator)

    def test_goal_program_pointer_is_not_a_canonical_task(self):
        row = copy.deepcopy(self.case)
        row["data"]["task_ref"] = self.task["id"]
        with self.assertRaisesRegex(ValueError, "canonical task"):
            validate_record(row, self.validator)

    def test_version_and_split_participate_in_identity(self):
        identity = copy.deepcopy(self.case["identity"])
        first = stable_id("case", identity)
        identity["partition"] = "another-split"
        self.assertNotEqual(first, stable_id("case", identity))
        identity = copy.deepcopy(self.case["identity"])
        identity["revision"] = "another-pinned-revision"
        self.assertNotEqual(first, stable_id("case", identity))

    def test_changed_identity_cannot_keep_old_id(self):
        row = copy.deepcopy(self.task)
        row["identity"]["revision"] = "new-revision"
        with self.assertRaisesRegex(ValueError, "Identity digest"):
            validate_record(row, self.validator)

    def test_missing_reference_is_rejected(self):
        connection = sqlite3.connect(":memory:")
        make_database(connection)
        with self.assertRaises(sqlite3.IntegrityError):
            insert_record(connection, self.task)
        connection.close()

    def test_duplicate_identity_is_rejected(self):
        connection = sqlite3.connect(":memory:")
        make_database(connection)
        domain = next(r for r in self.records if r["entity_type"] == "domain")
        insert_record(connection, domain)
        with self.assertRaises(sqlite3.IntegrityError):
            insert_record(connection, domain)
        connection.close()

    def test_shared_yaml_hash_does_not_merge_distinct_tasks(self):
        tasks = [r for r in self.records if r["entity_type"] == "task"
                 and r["identity"]["namespace"] == "calvin"]
        self.assertEqual(len(tasks), 34)
        self.assertEqual(len({r["native"]["definition_sha256"] for r in tasks}), 1)
        self.assertEqual(len({r["id"] for r in tasks}), 34)


if __name__ == "__main__":
    unittest.main()
