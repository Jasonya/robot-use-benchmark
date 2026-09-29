"""A two-part dispatch workcell built on the native Sawyer/MuJoCo controller.

Object states may be initialized before the episode. During execution only
Cartesian/gripper commands advance MuJoCo; object poses are never teleported.
The state-bearing methods are evaluator-only and are not registered as tools.
"""
from __future__ import annotations

from pathlib import Path
import hashlib
import inspect
import itertools
import xml.etree.ElementTree as ET

import metaworld
from metaworld.asset_path_utils import full_V3_path_for
from metaworld.envs.sawyer_push_v3 import SawyerPushEnvV3
import mujoco
import numpy as np

from ..common import digest, plain

CATALOG = {
    "SKU-P": {"name": "magenta part", "color": "magenta", "rgba": [0.9, 0.08, 0.72, 1.0], "body": "obj", "joint": "objjoint", "geom": "objGeom"},
    "SKU-G": {"name": "green part", "color": "green", "rgba": [0.08, 0.88, 0.18, 1.0], "body": "dispatch_part_g", "joint": "dispatch_part_g_joint", "geom": "dispatch_part_g_geom"},
}
BAYS = {
    "BAY-L": {"center_xy": [-0.16, 0.84], "half_size_xy": [0.072, 0.065]},
    "BAY-R": {"center_xy": [0.16, 0.84], "half_size_xy": [0.072, 0.065]},
}
PARK_TCP = np.array([0.0, 0.46, 0.19], dtype=np.float64)
BOX_HALF_SIZE = np.array([0.025, 0.025, 0.02], dtype=np.float64)
FRAME_WIDTH, FRAME_HEIGHT = 640, 480


def build_scene(cache: Path) -> tuple[Path, dict]:
    """Make a local dependency view, retaining upstream assets as dependencies."""
    source = Path(full_V3_path_for("sawyer_xyz/sawyer_push_v3.xml"))
    asset_root = source.parent.parent
    mirror = (cache / "scene_dependencies").resolve()
    own_xml_folder = mirror / "sawyer_xyz"
    own_xml_folder.mkdir(parents=True, exist_ok=True)
    for item in asset_root.iterdir():
        if item.name == "sawyer_xyz":
            continue
        link = mirror / item.name
        if not link.exists():
            link.symlink_to(item, target_is_directory=item.is_dir())
    root = ET.fromstring(source.read_text())
    world = root.find("worldbody")
    assert world is not None
    original = world.find("./body[@name='obj']")
    assert original is not None
    original.remove(original.find("inertial"))
    # The inherited scene disables inertia-from-geometry; use the box's analytic
    # diagonal inertia rather than relying on geom.mass inference.
    ET.SubElement(original,"inertial",{
        "pos":"0 0 0","mass":"0.08",
        "diaginertia":"0.0000273333333333 0.0000273333333333 0.0000333333333333",
    })
    geom = original.find("geom")
    assert geom is not None
    geom.attrib.pop("material", None)
    geom.set("type", "box")
    geom.set("size", "0.025 0.025 0.02")
    geom.set("mass", "0.08")
    geom.set("friction", "0.65 0.03 0.002")
    geom.set("rgba", " ".join(map(str, CATALOG["SKU-P"]["rgba"])))
    other = ET.fromstring(ET.tostring(original, encoding="unicode"))
    other.set("name", CATALOG["SKU-G"]["body"])
    other.set("pos", "0.12 0.62 0.025")
    other.find("joint").set("name", CATALOG["SKU-G"]["joint"])
    other.find("geom").set("name", CATALOG["SKU-G"]["geom"])
    other.find("geom").set("rgba", " ".join(map(str, CATALOG["SKU-G"]["rgba"])))
    world.append(other)
    goal = world.find("./site[@name='goal']")
    assert goal is not None
    goal.set("rgba", "0 0 0 0")
    ET.SubElement(world, "camera", {
        "name": "dispatch_top", "pos": "0 0.68 1.15", "quat": "1 0 0 0",
        "fovy": "45", "mode": "fixed",
    })
    for bay_id, bay in BAYS.items():
        x, y = bay["center_xy"]; hx, hy = bay["half_size_xy"]
        ET.SubElement(world, "geom", {
            "name": f"{bay_id}_visual_zone", "type": "box",
            "pos": f"{x} {y} 0.0004", "size": f"{hx} {hy} 0.0003",
            "rgba": "0.68 0.72 0.75 1", "contype": "0", "conaffinity": "0",
        })
        # White outline has no collision; it denotes the geometric goal region.
        for dx, dy, sx, sy in [(hx,0,.002,hy),(-hx,0,.002,hy),(0,hy,hx,.002),(0,-hy,hx,.002)]:
            ET.SubElement(world, "geom", {
                "type": "box", "pos": f"{x+dx} {y+dy} 0.001",
                "size": f"{sx} {sy} 0.0005", "rgba": "0.95 0.95 0.95 1",
                "contype": "0", "conaffinity": "0",
            })
    xml = ET.tostring(root, encoding="unicode")
    target = own_xml_folder / "joint_dispatch.xml"
    if not target.exists() or target.read_text() != xml:
        target.write_text(xml)
    return target, {
        "recipe_id": "two_colored_box_dispatch_0.1",
        "source_dependency": "metaworld==3.1.1",
        "source_model": "assets/sawyer_xyz/sawyer_push_v3.xml",
        "source_xml_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "derived_xml_sha256": hashlib.sha256(xml.encode()).hexdigest(),
        "new_authored_workflow_candidates": 1,
        "new_canonical_g2_claim": False,
        "changes": "Two free rigid boxes, overhead RGB camera, non-colliding dispatch-region markers; inherited Sawyer model/controller and scene assets.",
        "material": "rigid boxes only", "object_mass_kg": 0.08,
        "object_half_size_m": BOX_HALF_SIZE.tolist(),
    }


class _DispatchNativeEnv(SawyerPushEnvV3):
    def __init__(self, model_path: Path, seed: int):
        self._dispatch_xml = str(model_path)
        super().__init__(render_mode=None, width=FRAME_WIDTH, height=FRAME_HEIGHT)
        self._freeze_rand_vec = False
        self._set_task_called = True
        self._partially_observable = False
        self.seed(seed)
        self.reset()

    @property
    def model_name(self) -> str:
        return self._dispatch_xml


class DispatchWorld:
    def __init__(self, seed: int, cache: Path, *,reset_contract="canonical_1e10"):
        self.seed = int(seed)
        if reset_contract not in {"canonical_1e10","native_warmup"}:raise ValueError("Unknown reset contract")
        self.reset_contract=reset_contract
        xml, self.recipe = build_scene(cache)
        self.env = _DispatchNativeEnv(xml, seed)
        self.model = self.env.model
        self.data = self.env.data
        self.renderer = None
        self.steps = 0
        rng = np.random.default_rng(seed)
        slots = np.array([[-0.12, 0.60], [0.12, 0.60]]) + rng.uniform([-0.025,-0.035],[0.025,0.035],size=(2,2))
        assignment = rng.permutation(2)
        for sku, slot in zip(CATALOG, slots[assignment]):
            joint = self.model.joint(CATALOG[sku]["joint"])
            address = int(joint.qposadr[0])
            self.data.qpos[address:address+3] = [slot[0],slot[1],0.026]
            self.data.qpos[address+3:address+7] = [1,0,0,0]
            dof = int(joint.dofadr[0])
            self.data.qvel[dof:dof+6] = 0
        mujoco.mj_forward(self.model,self.data)
        # Initialization may manipulate object state; the episode has not begun.
        self._initializing = True
        self._initialize_park()
        self.pre_episode_warmup_time=float(self.data.time)
        if reset_contract=="canonical_1e10":
            # Fix the actual initial state, not merely its digest. Warmup can
            # leave ~1e-15 numerical variation across otherwise equal resets.
            for name in ["qpos","qvel","act","ctrl","mocap_pos","mocap_quat"]:
                array=getattr(self.data,name)
                array[:]=np.round(array,10)
                array[array==0]=0.0  # normalize signed zeros as well
            mujoco.mj_normalizeQuat(self.model,self.data.qpos)
            self.data.qacc_warmstart[:]=0
            self.data.qfrc_applied[:]=0
            self.data.xfrc_applied[:]=0
            self.data.time=0.0
            mujoco.mj_forward(self.model,self.data)
        self._initializing = False
        self.steps = 0
        self.initial_state = self.evaluator_state()
        self.initial_state_hash = digest({k:v for k,v in self.initial_state.items() if k!="seed"})
        self.initial_positions = self.evaluator_positions()
        self.actions: list[np.ndarray] = []
        self.qpos_trace = [self.data.qpos.copy()]
        self.qvel_trace = [self.data.qvel.copy()]
        self.time_trace = [float(self.data.time)]
        self.tcp_trace = [self.proprioception()]
        self.warning_start = np.array([w.number for w in self.data.warning], dtype=int)

    def _initialize_park(self):
        for _ in range(180):
            error = PARK_TCP - self.proprioception()
            self._integrate(np.r_[np.clip(12*error,-1,1),0.8])
        for _ in range(80):
            self._integrate(np.array([0,0,0,0.8]))
        mujoco.mj_forward(self.model,self.data)

    def _integrate(self, action: np.ndarray):
        action = np.asarray(action,dtype=np.float32)
        self.env.set_xyz_action(action[:3])
        self.env.do_simulation([float(action[3]),float(-action[3])], self.env.frame_skip)
        mujoco.mj_forward(self.model,self.data)
        if self.env._did_see_sim_exception or not np.isfinite(self.data.qpos).all() or not np.isfinite(self.data.qvel).all():
            raise FloatingPointError("Invalid simulator state")

    def step(self, action: np.ndarray):
        action = np.asarray(action,dtype=np.float64)
        if action.shape != (4,) or not np.isfinite(action).all():
            raise ValueError("Action must be a finite 4-vector")
        bounded = np.clip(action,-1,1).astype(np.float32)
        self._integrate(bounded)
        self.steps += 1
        self.actions.append(bounded.copy())
        self.qpos_trace.append(self.data.qpos.copy())
        self.qvel_trace.append(self.data.qvel.copy())
        self.time_trace.append(float(self.data.time))
        self.tcp_trace.append(self.proprioception())
        return self.proprioception()

    def proprioception(self) -> np.ndarray:
        """Robot TCP position only; no object poses, goal or native 39-D obs."""
        return np.asarray(self.env.tcp_center,dtype=np.float64).copy()

    def rgb(self) -> np.ndarray:
        if self.renderer is None:
            self.renderer=mujoco.Renderer(self.model,height=FRAME_HEIGHT,width=FRAME_WIDTH)
        self.renderer.update_scene(self.data,camera="dispatch_top")
        return self.renderer.render().copy()

    def camera_calibration(self) -> dict:
        camera = self.model.camera("dispatch_top")
        cid=int(camera.id)
        return {
            "width":FRAME_WIDTH,"height":FRAME_HEIGHT,
            "fovy_degrees":float(self.model.cam_fovy[cid]),
            "position_world":self.data.cam_xpos[cid].tolist(),
            "rotation_camera_to_world":self.data.cam_xmat[cid].reshape(3,3).tolist(),
            "visible_top_plane_z":0.04,
            "assumption":"Known nominal box top-plane height; fixed calibrated overhead pinhole camera.",
        }

    def evaluator_positions(self) -> dict:
        return {sku:self.data.body(spec["body"]).xpos.copy() for sku,spec in CATALOG.items()}

    def evaluator_state(self) -> dict:
        result={"seed":self.seed,"qpos":self.data.qpos.tolist(),"qvel":self.data.qvel.tolist(),
                "act":self.data.act.tolist(),"ctrl":self.data.ctrl.tolist(),
                "mocap_pos":self.data.mocap_pos.tolist(),"mocap_quat":self.data.mocap_quat.tolist(),
                "time":float(self.data.time),"recipe":self.recipe}
        if self.reset_contract!="native_warmup":result["reset_contract"]=self.reset_contract
        return result

    def evaluator_box_vertices(self, sku: str) -> np.ndarray:
        geom=self.model.geom(CATALOG[sku]["geom"])
        gid=int(geom.id)
        rotation=self.data.geom_xmat[gid].reshape(3,3)
        offsets=np.array(list(itertools.product([-1.,1.],repeat=3)))*self.model.geom_size[gid]
        return offsets@rotation.T+self.data.geom_xpos[gid]

    def evaluator_goal(self, target_sku: str, bay_id: str, stable_window: int=40) -> dict:
        bay=BAYS[bay_id];center=np.asarray(bay["center_xy"]);half=np.asarray(bay["half_size_xy"])
        vertices=self.evaluator_box_vertices(target_sku)
        inside=bool(np.all(np.abs(vertices[:,:2]-center)<=half+1e-9))
        # Explicit geometric support-height proxy, not a contact-force claim.
        # Bounding only max height would incorrectly admit a near-table hover.
        on_table=bool(-0.006<=vertices[:,2].min()<=0.006 and vertices[:,2].max()<=0.065)
        other=next(s for s in CATALOG if s!=target_sku)
        positions=self.evaluator_positions()
        drift=float(np.linalg.norm(positions[other]-self.initial_positions[other]))
        jid=self.model.joint(CATALOG[target_sku]["joint"])
        dof=int(jid.dofadr[0])
        velocities=np.array(self.qvel_trace[-stable_window:])[:,dof:dof+3]
        stationary=bool(len(velocities)>=stable_window and np.max(np.linalg.norm(velocities,axis=1))<0.04)
        return {"inside_requested_bay":inside,"supported_on_table":on_table,
                "non_target_displacement_m":drift,"non_target_preserved":drift<=0.02,
                "stationary_last_steps":stationary,"stable_window_steps":stable_window,
                "physical_success":inside and on_table and drift<=0.02 and stationary}

    def close(self):
        if self.renderer is not None:self.renderer.close()
        self.env.close()
