"""Typed tool boundary for the synthetic workcell.

Registered agent responses contain camera observations, pixel-derived estimates,
robot proprioception and queried digital state. Private physics and the requested
joint evaluator are retained only in harness evidence.
"""
from __future__ import annotations
from pathlib import Path
import copy
import hashlib
import io
import os
import time

import numpy as np
from PIL import Image

from ..common import plain
from .world import DispatchWorld,CATALOG,BAYS
from .vision import detect_colored_parts
from .motion import push_estimated_xy,park
from .ledger import DispatchLedger

TOOL_ARGUMENTS={
    "camera.capture":set(),
    "vision.locate_parts":{"frame_id"},
    "catalog.list":set(),
    "orders.get":{"order_id"},
    "inventory.list":set(),
    "workcell.bays":set(),
    "robot.push_xy":{"source_xy","destination_xy"},
    "robot.park":set(),
    "dispatch.record":{"order_id","sku","bay_id","idempotency_key"},
}


class ToolService:
    def __init__(self,world:DispatchWorld,ledger:DispatchLedger,folder:Path,private_order:dict,
                 *,image_store_root:Path|None=None,allow_oracle=False,deny_camera=False,deny_order_lookup=False,max_control_steps=4000):
        self._world=world
        self._ledger=ledger
        self._folder=folder
        self._image_root=image_store_root or folder
        (self._image_root/"images").mkdir(parents=True,exist_ok=True)
        self._private_order=private_order
        self._allow_oracle=allow_oracle
        self._deny_camera=deny_camera
        self._deny_order_lookup=deny_order_lookup
        self._max_control_steps=max_control_steps
        self._frames={}
        self.events=[]
        self.private_commit_evidence=[]
        self.private_perception_evidence=[]
        self.frame_receipts=[]

    def _apply_action(self,action):
        if self._world.steps>=self._max_control_steps:raise TimeoutError("Control-step budget exhausted")
        self._world.step(action)

    def _capture(self):
        rgb=self._world.rgb()
        pixel_hash=hashlib.sha256(rgb.tobytes()).hexdigest()
        frame_id=f"image-{len(self.frame_receipts):04d}-{pixel_hash[:14]}"
        relative=f"images/{pixel_hash}.png"
        destination=self._image_root/relative
        encoded=io.BytesIO();Image.fromarray(rgb).save(encoded,format="PNG")
        png_bytes=encoded.getvalue()
        if not destination.exists():
            temporary=destination.with_suffix(f".tmp-{os.getpid()}")
            temporary.write_bytes(png_bytes)
            os.replace(temporary,destination)
        self._frames[frame_id]=rgb
        receipt={"frame_id":frame_id,"file":relative,"pixel_sha256":pixel_hash,
                 "png_sha256":hashlib.sha256(png_bytes).hexdigest(),
                 "control_step":self._world.steps,"simulator_time":float(self._world.data.time),
                 "agent_origin":"robot","camera_mount":"virtual_fixed_overhead","human_video":False}
        self.frame_receipts.append(receipt)
        return {"ok":True,"frame_id":frame_id,"image_attachment":relative,
                "pixel_sha256":pixel_hash,"calibration":self._world.camera_calibration(),
                "robot_tcp_proprioception":self._world.proprioception().tolist()}

    def call(self,name:str,arguments:dict|None=None):
        args={} if arguments is None else copy.deepcopy(arguments)
        started=time.perf_counter()
        before=self._world.steps
        event={"event_id":len(self.events),"name":name,"arguments":args,"control_step_before":before}
        try:
            if name=="diagnostics.pose_oracle":
                if not self._allow_oracle:raise PermissionError("Oracle tool is not available in this method contract")
                if args:raise ValueError("Unexpected oracle arguments")
                response={"ok":True,"parts":[{"visual_identity":CATALOG[s]["color"],"estimated_center_xy":p[:2].tolist(),
                                            "estimation_source":"PRIVILEGED evaluator object pose"} for s,p in self._world.evaluator_positions().items()]}
            else:
                if name not in TOOL_ARGUMENTS:raise ValueError("Unregistered tool")
                if not isinstance(args,dict) or set(args)!=TOOL_ARGUMENTS[name]:
                    raise ValueError("Arguments do not match the fixed tool schema")
                if name in {"camera.capture","vision.locate_parts"} and self._deny_camera:
                    raise PermissionError("Image modality disabled in this diagnostic condition")
                if name=="orders.get" and self._deny_order_lookup:
                    raise PermissionError("Order retrieval disabled in this diagnostic condition")
                if name=="camera.capture":
                    response=self._capture()
                elif name=="vision.locate_parts":
                    image=self._frames.get(args["frame_id"])
                    if image is None:raise ValueError("Frame was not delivered by this tool session")
                    detections=detect_colored_parts(image,self._world.camera_calibration())
                    response={"ok":True,"frame_id":args["frame_id"],"parts":detections,
                              "perception_method":"deterministic RGB component detector; not a VLM"}
                    # Independent error checks never enter the response.
                    truth=self._world.evaluator_positions()
                    for det in detections:
                        sku=next(s for s in CATALOG if CATALOG[s]["color"]==det["visual_identity"])
                        self.private_perception_evidence.append({
                            "frame_id":args["frame_id"],"sku":sku,
                            "estimated_xy":det["estimated_center_xy"],"true_xy":truth[sku][:2].tolist(),
                            "error_m":float(np.linalg.norm(np.asarray(det["estimated_center_xy"])-truth[sku][:2])),
                            "source_pixel_sha256":hashlib.sha256(image.tobytes()).hexdigest(),
                        })
                elif name=="catalog.list":
                    response={"ok":True,"catalog":self._ledger.catalog()}
                elif name=="orders.get":
                    response=self._ledger.get_order(args["order_id"])
                elif name=="inventory.list":
                    response={"ok":True,"inventory":self._ledger.inventory()}
                elif name=="workcell.bays":
                    response={"ok":True,"bays":copy.deepcopy(BAYS),"pose_source":"public fixed workcell calibration"}
                elif name=="robot.push_xy":
                    motion=push_estimated_xy(args["source_xy"],args["destination_xy"],self._world.proprioception,self._apply_action)
                    response={"ok":True,"motion":motion,"robot_tcp_proprioception":self._world.proprioception().tolist()}
                elif name=="robot.park":
                    response={"ok":True,"motion":park(self._world.proprioception,self._apply_action)}
                elif name=="dispatch.record":
                    proof=self._world.evaluator_goal(self._private_order["sku"],self._private_order["bay_id"])
                    self._ledger.last_internal_commit=None
                    response=self._ledger.record_dispatch(**args,control_step=self._world.steps)
                    internal=self._ledger.last_internal_commit
                    self.private_commit_evidence.append({
                        "event_id":event["event_id"],"control_step":self._world.steps,
                        "physical_state_at_call":proof,"ledger_effect":copy.deepcopy(internal),
                        "response_lost":response.get("error")=="transport_reply_lost",
                    })
            response=plain(response)
        except Exception as exc:
            response={"ok":False,"error_type":type(exc).__name__,"error":str(exc)}
        event.update(response=response,control_step_after=self._world.steps,wall_seconds=time.perf_counter()-started)
        self.events.append(event)
        return copy.deepcopy(response)
