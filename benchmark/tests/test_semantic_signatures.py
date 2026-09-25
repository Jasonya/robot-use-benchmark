import unittest
from robot_use_runtime.semantics import declaration,goal_signature,authored_task_spec_id,DeclarationError


def example(objects,goal,language=""):
    return f"(define (problem sample) (:domain example) (:objects {objects}) (:language {language}) (:init) (:goal {goal}))"


class SemanticSignatureTest(unittest.TestCase):
    def test_typed_roles_and_commutative_order(self):
        a=declaration(example("cup_7 - cup box_2 - box","(and (inside cup_7 box_2) (clean cup_7))"))
        b=declaration(example("box_90 - box cup_3 - cup","(AND (clean cup_3) (inside cup_3 box_90))"))
        self.assertEqual(goal_signature(a)["declared_goal_fingerprint"],goal_signature(b)["declared_goal_fingerprint"])

    def test_quantifier_renaming_but_not_quantifier_kind(self):
        a=declaration(example("box - box","(forall (?x - cup) (inside ?x box))"))
        b=declaration(example("b - box","(forall (?y - cup) (inside ?y b))"))
        c=declaration(example("b - box","(exists (?y - cup) (inside ?y b))"))
        self.assertEqual(goal_signature(a)["declared_goal_fingerprint"],goal_signature(b)["declared_goal_fingerprint"])
        self.assertNotEqual(goal_signature(a)["declared_goal_fingerprint"],goal_signature(c)["declared_goal_fingerprint"])

    def test_goal_hash_does_not_certify_reference_equivalence(self):
        a=goal_signature(declaration(example("c - cup b - box","(inside c b)","choose the left cup")))
        b=goal_signature(declaration(example("c - cup b - box","(inside c b)","choose the remembered cup")))
        self.assertEqual(a["declared_goal_fingerprint"],b["declared_goal_fingerprint"])
        self.assertFalse(a["is_canonical_g2_identity"])
        base={"task_kind":"robot_control","roles":{"target":"cup"},"goal_program":["inside","target","box"],
              "reference_program":["select_left"],"required_process":[],"required_mechanisms":["K01"],
              "completion_semantics":{"release_required":True}}
        other={**base,"reference_program":["select_from_previous_session"]}
        self.assertNotEqual(authored_task_spec_id(base),authored_task_spec_id(other))
        self.assertEqual(authored_task_spec_id(base),authored_task_spec_id({**base,"camera":"new_camera","seed":123}))

    def test_incomplete_task_is_rejected(self):
        with self.assertRaises(DeclarationError):
            authored_task_spec_id({"task_kind":"robot_control"})

    def test_comments_and_quoted_text(self):
        item=declaration('(define (problem x) ; (not parsed)\n(:domain example) (:objects c - cup) (:language "a; b") (:goal (clean c)))')
        self.assertEqual(item["language_tokens"],['"a; b"'])


if __name__=="__main__":
    unittest.main()
