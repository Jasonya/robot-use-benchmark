import json
from pathlib import Path
import unittest
from jsonschema import Draft202012Validator

SCHEMAS=Path(__file__).resolve().parents[1]/"schemas"


class ReleaseGuardTest(unittest.TestCase):
    def test_authored_template_cannot_claim_official_results(self):
        schema=json.loads((SCHEMAS/"task_spec.schema.json").read_text())
        spec={"schema_version":"task-spec-0.1","task_kind":"external_work",
              "roles":{"object":{"functional_type":"rigid_object","binding_scope":"instance_parameter"}},
              "goal_program":{"language":"relation-v1","expression":["at","object","destination"]},
              "reference_program":{"kind":"given_binding"},"required_process":[],
              "required_mechanisms":["K01"],"completion_semantics":{"success_definition":"at destination","termination_rule":"stable release"},
              "primary_family":"CF01","status":"authored","source_provenance":[],"official_scoring_allowed":False}
        validator=Draft202012Validator(schema);self.assertEqual(list(validator.iter_errors(spec)),[])
        self.assertTrue(list(validator.iter_errors({**spec,"official_scoring_allowed":True})))

    def test_unknown_count_cannot_be_written_as_zero(self):
        schema=json.loads((SCHEMAS/"count_record.schema.json").read_text())
        row={"work_id":"example","source_version":"v1","native_term":"tasks","unit":"canonical_g2","granularity":"G2-canonical",
             "scope":"whole_resource","setting":"simulation","count_context":"globally deduplicated specifications","value_kind":"unknown","value":None,
             "evidence":[{"source":"source.json","locator":"canonical field","basis":"not_obtained"}]}
        validator=Draft202012Validator(schema);self.assertEqual(list(validator.iter_errors(row)),[])
        self.assertTrue(list(validator.iter_errors({**row,"value":0})))

    def test_reviewed_unknown_is_legal_but_not_validated_coverage(self):
        schema=json.loads((SCHEMAS/"evidence_cell.schema.json").read_text())
        cell={"work_id":"example","axis":"application_context","axis_value":"D07",
              "review_state":"reviewed_primary_overview","support_state":"not_determined_from_reviewed_scope",
              "scope_checked":"abstract and task overview","evidence_statement":"No task/context binding established by the reviewed material.",
              "sources":[{"url":"https://example.org/paper","version_or_snapshot":"v1","locator":"task overview"}],
              "review_method":"single_model_assisted_review","limitations":["Not an exhaustive absence claim."],
              "counts_as_validated_coverage_cell":False}
        validator=Draft202012Validator(schema);self.assertEqual(list(validator.iter_errors(cell)),[])
        self.assertTrue(list(validator.iter_errors({**cell,"counts_as_validated_coverage_cell":True})))


if __name__=="__main__":
    unittest.main()
