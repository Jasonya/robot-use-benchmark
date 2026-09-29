import hashlib
from pathlib import Path
import tempfile
import unittest

import mujoco
import numpy as np

from robot_use_runtime.joint.world import DispatchWorld,BAYS,CATALOG
from robot_use_runtime.joint.vision import detect_colored_parts
from robot_use_runtime.joint.ledger import DispatchLedger,evaluate_digital_state
from robot_use_runtime.joint.tools import ToolService
from robot_use_runtime.joint.agents import run_agent
from robot_use_runtime.joint.run import make_cases


class JointContractTest(unittest.TestCase):
    def test_split_identifiers_are_disjoint_and_batch_independent(self):
        dev=make_cases([501,502],["clean","reply_lost_after_commit"])
        test=make_cases([701,702],["clean","reply_lost_after_commit"])
        self.assertTrue({r["order"]["order_id"] for r in dev}.isdisjoint({r["order"]["order_id"] for r in test}))
        alone=make_cases([502],["clean","reply_lost_after_commit"])
        self.assertEqual({r["case_id"] for r in alone},{r["case_id"] for r in dev if r["world_seed"]==502})
        self.assertEqual(len({r["order"]["order_id"] for r in alone}),4)

    def test_fresh_resets_share_actual_state_and_pixels(self):
        with tempfile.TemporaryDirectory() as tmp:
            cache=Path(tmp)/"assets"
            a=DispatchWorld(501,cache)
            try:
                state=a.initial_state_hash
                qpos=a.data.qpos.copy()
                rgb=hashlib.sha256(a.rgb().tobytes()).hexdigest()
            finally:a.close()
            b=DispatchWorld(501,cache)
            try:
                self.assertEqual(state,b.initial_state_hash)
                np.testing.assert_array_equal(qpos,b.data.qpos)
                self.assertEqual(rgb,hashlib.sha256(b.rgb().tobytes()).hexdigest())
            finally:b.close()

    def test_pixel_estimates_follow_changed_pixels(self):
        with tempfile.TemporaryDirectory() as tmp:
            world=DispatchWorld(501,Path(tmp))
            try:
                image=world.rgb();cal=world.camera_calibration()
                detections={d["visual_identity"]:d for d in detect_colored_parts(image,cal)}
                truth=world.evaluator_positions()
                for sku,spec in CATALOG.items():
                    self.assertLess(np.linalg.norm(np.array(detections[spec["color"]]["estimated_center_xy"])-truth[sku][:2]),.007)
                flipped={d["visual_identity"]:d for d in detect_colored_parts(image[:,::-1,:].copy(),cal)}
                for color in detections:
                    self.assertAlmostEqual(flipped[color]["estimated_center_xy"][0],-detections[color]["estimated_center_xy"][0],delta=.003)
                self.assertEqual(detect_colored_parts(np.zeros_like(image),cal),[])
            finally:world.close()

    def test_digital_completion_alone_has_no_physical_witness(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);world=DispatchWorld(501,root/"assets")
            order={"order_id":"test-order","sku":"SKU-P","bay_id":"BAY-L","quantity":1}
            ledger=DispatchLedger(root/"ledger.sqlite",order)
            try:
                service=ToolService(world,ledger,root,order)
                result=run_agent("digital_only",order["order_id"],service.call)
                self.assertEqual(result["agent_status"],"reported_completed")
                self.assertTrue(evaluate_digital_state(ledger.snapshot(),order)["digital_success"])
                self.assertEqual(world.steps,0)
                self.assertFalse(world.evaluator_goal("SKU-P","BAY-L")["physical_success"])
                self.assertFalse(service.private_commit_evidence[0]["physical_state_at_call"]["physical_success"])
                self.assertFalse(service.call("diagnostics.pose_oracle")["ok"])
            finally:ledger.close();world.close()

    def test_commit_response_loss_and_idempotency(self):
        with tempfile.TemporaryDirectory() as tmp:
            order={"order_id":"test-order","sku":"SKU-P","bay_id":"BAY-L","quantity":1}
            ledger=DispatchLedger(Path(tmp)/"ledger.sqlite",order,lose_first_commit_response=True)
            try:
                args={"order_id":order["order_id"],"sku":order["sku"],"bay_id":order["bay_id"],
                      "idempotency_key":"stable-request","control_step":500}
                self.assertEqual(ledger.record_dispatch(**args)["error"],"transport_reply_lost")
                self.assertEqual(ledger.connection.execute("SELECT COUNT(*) FROM dispatch_events").fetchone()[0],1)
                self.assertTrue(ledger.record_dispatch(**args)["deduplicated"])
                self.assertEqual(ledger.connection.execute("SELECT COUNT(*) FROM dispatch_events").fetchone()[0],1)
                self.assertTrue(evaluate_digital_state(ledger.snapshot(),order)["digital_success"])
                args["idempotency_key"]="new-request"
                ledger.record_dispatch(**args)
                self.assertEqual(ledger.connection.execute("SELECT available FROM inventory WHERE sku='SKU-P'").fetchone()[0],-1)
                self.assertFalse(evaluate_digital_state(ledger.snapshot(),order)["digital_success"])
            finally:ledger.close()

    def test_goal_rejects_overhang_and_floating_counterexamples(self):
        # Hand-constructed evaluator challenge states, not manipulation rollouts.
        with tempfile.TemporaryDirectory() as tmp:
            world=DispatchWorld(501,Path(tmp))
            try:
                address=int(world.model.joint("objjoint").qposadr[0])
                center=BAYS["BAY-L"]["center_xy"];half=BAYS["BAY-L"]["half_size_xy"]
                world.data.qpos[address:address+3]=[center[0]+half[0]-.0125,center[1],.02]
                world.data.qpos[address+3:address+7]=[1,0,0,0]
                mujoco.mj_forward(world.model,world.data)
                self.assertFalse(world.evaluator_goal("SKU-P","BAY-L")["inside_requested_bay"])
                world.data.qpos[address:address+3]=[center[0],center[1],.25]
                mujoco.mj_forward(world.model,world.data)
                result=world.evaluator_goal("SKU-P","BAY-L")
                self.assertTrue(result["inside_requested_bay"])
                self.assertFalse(result["supported_on_table"])
                # Near-table hovering must also fail, even though the entire
                # box is lower than the upper-face height bound.
                world.data.qpos[address:address+3]=[center[0],center[1],.03]
                mujoco.mj_forward(world.model,world.data)
                self.assertFalse(world.evaluator_goal("SKU-P","BAY-L")["supported_on_table"])
            finally:world.close()


if __name__=="__main__":unittest.main()
