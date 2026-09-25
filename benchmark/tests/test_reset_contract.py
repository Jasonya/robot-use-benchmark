"""Checks for the observed reset-cache defect, with actual MuJoCo environments."""
import unittest

import numpy as np

from robot_use_runtime.metaworld_adapter import MetaWorldAdapter


class ResetContractTest(unittest.TestCase):
    def test_forward_sync_fixes_observation_without_moving_window(self):
        native = MetaWorldAdapter("window-close-v3",101,reset_mode="native")
        synced = MetaWorldAdapter("window-close-v3",101,reset_mode="forward_consistent")
        try:
            np.testing.assert_array_equal(native.env.data.qpos,synced.env.data.qpos)
            np.testing.assert_array_equal(native.env.data.qvel,synced.env.data.qvel)
            self.assertEqual(native.env.data.time,synced.env.data.time)
            self.assertTrue(native.initial_native_success)
            self.assertFalse(synced.initial_native_success)
            self.assertFalse(synced.independent_geometry_success())
            self.assertAlmostEqual(synced.reset_forward_audit["current_frame_max_abs_change"],0.2)
            np.testing.assert_array_equal(synced.observation[:18],synced.observation[18:36])
        finally:
            native.close()
            synced.close()

    def test_paired_state_and_compiled_asset_identity_reproduce(self):
        a = MetaWorldAdapter("drawer-open-v3",102)
        b = MetaWorldAdapter("drawer-open-v3",102)
        try:
            self.assertEqual(a.compiled_model_sha256,b.compiled_model_sha256)
            self.assertEqual(a.initial_state_hash,b.initial_state_hash)
            for _ in range(15):
                oa,ra,_,_,ia,_=a.step(np.array([0.1,-0.2,0.05,0],dtype=np.float32))
                ob,rb,_,_,ib,_=b.step(np.array([0.1,-0.2,0.05,0],dtype=np.float32))
                np.testing.assert_allclose(oa,ob,atol=1e-8,rtol=0)
                self.assertEqual(ia["success"],ib["success"])
                self.assertAlmostEqual(ra,rb)
        finally:
            a.close()
            b.close()


if __name__ == "__main__":
    unittest.main()
