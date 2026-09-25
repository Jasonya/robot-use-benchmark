"""Meta-World V3 adapter; native task names are not cross-benchmark semantic counts."""
from __future__ import annotations

import importlib.metadata
import hashlib
import inspect
from pathlib import Path

import metaworld.env_dict
import metaworld.policies
import mujoco
import numpy as np

from .common import digest, file_hash, plain

ENVIRONMENTS = metaworld.env_dict.ALL_V3_ENVIRONMENTS_GOAL_OBSERVABLE
PACKAGE_ROOT = Path(inspect.getfile(metaworld.env_dict)).parent
POLICY_OVERRIDES = {
    "peg-insert-side-v3": "SawyerPegInsertionSideV3Policy",
}


def available_tasks() -> list[str]:
    return sorted(name.removesuffix("-goal-observable") for name in ENVIRONMENTS)


def reference_policy_name(task_id: str) -> str:
    if task_id in POLICY_OVERRIDES:
        return POLICY_OVERRIDES[task_id]
    return "Sawyer" + "".join(word.capitalize() for word in task_id.removesuffix("-v3").split("-")) + "V3Policy"


def make_reference_policy(task_id: str):
    return getattr(metaworld.policies, reference_policy_name(task_id))()


def versions() -> dict[str, str]:
    return {package: importlib.metadata.version(package) for package in ["metaworld", "mujoco", "gymnasium", "numpy"]}


class MetaWorldAdapter:
    """Policy receives only the declared 39-value state/goal observation.

    Simulator state and goal internals are exported solely as evaluator evidence.
    The explicit goal in the native public observation is allowed in this track.
    """

    def __init__(self, task_id: str, reset_seed: int, render_mode: str | None = None,
                 reset_mode: str = "forward_consistent"):
        key = task_id + "-goal-observable"
        if key not in ENVIRONMENTS:
            raise ValueError(f"Unknown native environment: {task_id}")
        self.task_id = task_id
        self.reset_seed = reset_seed
        if reset_mode not in {"native", "forward_consistent"}:
            raise ValueError("Unknown reset mode")
        self.reset_mode = reset_mode
        self.env = ENVIRONMENTS[key](seed=reset_seed, render_mode=render_mode)
        self.observation, self.reset_info = self.env.reset(seed=reset_seed)
        _, before = self.env.evaluate_state(self.observation, np.zeros(4, dtype=np.float32))
        self.raw_native_reset_success_query = bool(before["success"])
        self.reset_forward_audit = None
        self.compiled_model_sha256 = None
        if reset_mode == "forward_consistent":
            qpos, qvel = self.env.data.qpos.copy(), self.env.data.qvel.copy()
            initial_time = float(self.env.data.time)
            raw_observation = self.observation.copy()
            mujoco.mj_forward(self.env.model, self.env.data)
            current = self.env._get_curr_obs_combined_no_goal()
            # Reset both frames, as the native reset intends, after synchronizing
            # kinematics. No simulation step, goal change or state teleport occurs.
            self.env._prev_obs = current.copy()
            self.observation = self.env._get_obs().astype(np.float64)
            _, after = self.env.evaluate_state(self.observation, np.zeros(4, dtype=np.float32))
            self.reset_forward_audit = {
                "raw_native_success_query": bool(before["success"]),
                "synchronized_success_query": bool(after["success"]),
                "current_frame_max_abs_change": float(np.max(np.abs(raw_observation[:18] - current))),
                "qpos_unchanged": bool(np.array_equal(qpos, self.env.data.qpos)),
                "qvel_unchanged": bool(np.array_equal(qvel, self.env.data.qvel)),
                "simulation_time_unchanged": initial_time == float(self.env.data.time),
                "frame_history_reinitialized_from_synchronized_state": True,
            }
            if not all(self.reset_forward_audit[key] for key in ["qpos_unchanged", "qvel_unchanged", "simulation_time_unchanged"]):
                raise RuntimeError("Forward synchronization unexpectedly changed physical state or time")
            buffer = np.empty(mujoco.mj_sizeModel(self.env.model), dtype=np.uint8)
            mujoco.mj_saveModel(self.env.model, buffer=buffer)
            self.compiled_model_sha256 = hashlib.sha256(buffer).hexdigest()
        self.initial_simulator_time = float(self.env.data.time)
        self.initial_state = self.evaluator_state()
        self.initial_state_hash = digest(self.initial_state)
        self.initial_observation_hash = digest(self.observation)
        initial_info = before if reset_mode == "native" else after
        self.initial_native_success = bool(initial_info["success"])
        self.model_path = Path(self.env.model_name)
        try:
            self.relative_model_path = str(self.model_path.relative_to(PACKAGE_ROOT))
        except ValueError:
            self.relative_model_path = self.model_path.name
        self.model_file_hash = file_hash(self.model_path)
        self.reference_source_file = Path(inspect.getfile(type(make_reference_policy(task_id))))

    @property
    def contract(self) -> dict:
        return {
            "contract_id": "metaworld-v3-state-goal-forward-consistent-0.2" if self.reset_mode == "forward_consistent" else "metaworld-v3-state-goal-native-control-0.1",
            "reset_mode": self.reset_mode,
            "reset_seed_binding": "native goal-observable constructor(seed); native reset(seed) itself ignores the argument",
            "versions": versions(),
            "robot": "native Sawyer manipulation arm and gripper",
            "observation": {
                "kind": "native_state_plus_explicit_goal",
                "shape": list(self.observation.shape),
                "goal_observable": True,
                "human_video": False,
                "image_input": False,
                "private_evaluator_state_is_policy_input": False,
            },
            "action": {
                "kind": "native Cartesian delta and gripper effort",
                "shape": list(self.env.action_space.shape),
                "low": plain(self.env.action_space.low),
                "high": plain(self.env.action_space.high),
                "adapter_clips_to_native_bounds": True,
                "clipping_is_logged": True,
            },
            "physics_timestep_seconds": float(self.env.model.opt.timestep),
            "frame_skip": int(self.env.frame_skip),
            "control_period_seconds": float(self.env.model.opt.timestep * self.env.frame_skip),
            "scoring": {
                "primary": "native_success_ever",
                "additional": ["native_success_final", "native_success_last_10_steps"],
                "new_process_compliance_claim": False,
                "goal_already_satisfied_at_reset_is_flagged": True,
            },
            "scope": "development validation of inherited native manipulation tasks; not the universal release or a VLA leaderboard",
        }

    def evaluator_state(self) -> dict:
        data = self.env.data
        result = {
            "qpos": plain(data.qpos),
            "qvel": plain(data.qvel),
            "act": plain(data.act),
            "ctrl": plain(data.ctrl),
            "mocap_pos": plain(data.mocap_pos),
            "mocap_quat": plain(data.mocap_quat),
            "target_position_private": plain(self.env._target_pos),
            "reset_random_vector_private": plain(self.env._last_rand_vec),
            "time": float(data.time),
        }
        if self.reset_mode == "forward_consistent":
            result["compiled_model_sha256"] = self.compiled_model_sha256
            result["model_parameters"] = {
                name: plain(getattr(self.env.model, name))
                for name in ["body_pos", "body_quat", "geom_pos", "geom_quat", "geom_size",
                             "site_pos", "site_quat", "eq_data", "geom_friction", "body_mass", "body_inertia"]
            }
        return result

    def step(self, raw_action: np.ndarray):
        raw_action = np.asarray(raw_action, dtype=np.float64)
        if raw_action.shape != self.env.action_space.shape or not np.isfinite(raw_action).all():
            raise ValueError("Non-finite or incorrectly shaped policy action")
        action = np.clip(raw_action, self.env.action_space.low, self.env.action_space.high).astype(np.float32)
        self.observation, reward, terminated, truncated, info = self.env.step(action)
        valid = np.isfinite(self.observation).all() and np.isfinite(self.env.data.qpos).all() and np.isfinite(self.env.data.qvel).all()
        if not valid or not np.isfinite(float(reward)) or not np.isfinite(float(info["success"])):
            raise FloatingPointError("Simulator or evaluator produced non-finite required values")
        return self.observation.copy(), float(reward), bool(terminated), bool(truncated), plain(info), action

    def independent_geometry_success(self) -> bool | None:
        """Separate geometry for two reach and two sliding-window environments.

        Uses MuJoCo site positions, not info['success'] or the native reward.
        This reproduces a stated native threshold; it is not an independent
        scientific validation of that threshold or a general-purpose evaluator.
        """
        if self.task_id in {"window-close-v3", "window-open-v3"}:
            name = "handleCloseStart" if self.task_id == "window-close-v3" else "handleOpenStart"
            site = mujoco.mj_name2id(self.env.model, mujoco.mjtObj.mjOBJ_SITE, name)
            if site < 0:
                raise RuntimeError("Missing window-handle site")
            return abs(float(self.env.data.site_xpos[site, 0]) - float(self.env._target_pos[0])) <= 0.05
        if self.task_id not in {"reach-v3", "reach-wall-v3"}:
            return None
        right_id = mujoco.mj_name2id(self.env.model, mujoco.mjtObj.mjOBJ_SITE, "rightEndEffector")
        left_id = mujoco.mj_name2id(self.env.model, mujoco.mjtObj.mjOBJ_SITE, "leftEndEffector")
        if min(right_id, left_id) < 0:
            raise RuntimeError("Missing native fingertip sites for the geometric check")
        tcp = (self.env.data.site_xpos[right_id] + self.env.data.site_xpos[left_id]) / 2
        distance = float(np.sqrt(np.sum((tcp - np.asarray(self.env._target_pos)) ** 2)))
        return distance <= 0.05

    def close(self) -> None:
        self.env.close()
