"""Shared Cartesian feedback controller; reads robot proprioception only.

The caller supplies estimates of the source and destination. Neither the
controller nor its stopping rule reads simulator object positions or goals.
"""
from __future__ import annotations
from collections.abc import Callable
import numpy as np

PARK_TCP=np.array([0.,.46,.19])


def move_tcp(target, read_tcp: Callable, apply_action: Callable, *, max_steps=180,
             tolerance=.004, gripper=.8) -> dict:
    target=np.asarray(target,dtype=float)
    if target.shape!=(3,) or not np.isfinite(target).all():
        raise ValueError("TCP target must be a finite XYZ")
    if not(-.36<=target[0]<=.36 and .425<=target[1]<=.95 and .014<=target[2]<=.28):
        raise ValueError("TCP target is outside the declared workcell envelope")
    reached=False
    for step in range(max_steps):
        error=target-np.asarray(read_tcp())
        if np.linalg.norm(error)<tolerance:
            reached=True;break
        action=np.r_[np.clip(12*error,-1,1),gripper]
        apply_action(action)
    else:step=max_steps
    return {"tcp_target_reached":reached,"control_steps":step,
            "final_tcp_error_m":float(np.linalg.norm(target-np.asarray(read_tcp())))}


def park(read_tcp,apply_action):
    position=np.asarray(read_tcp())
    lift=move_tcp([position[0],position[1],.20],read_tcp,apply_action)
    back=move_tcp(PARK_TCP,read_tcp,apply_action)
    for _ in range(45):apply_action(np.array([0,0,0,.8]))
    return {"lift":lift,"park":back}


def push_estimated_xy(source_xy,destination_xy,read_tcp,apply_action):
    source=np.asarray(source_xy,dtype=float);goal=np.asarray(destination_xy,dtype=float)
    if source.shape!=(2,) or goal.shape!=(2,) or not np.isfinite(np.r_[source,goal]).all():
        raise ValueError("Push arguments must be finite XY coordinates")
    distance=np.linalg.norm(goal-source)
    if distance<.018:
        return {"motion_skipped":"estimate already near destination","tcp_phases":[]}
    direction=(goal-source)/distance
    behind=source-.065*direction
    endpoint=goal-.032*direction
    phases=[]
    current=np.asarray(read_tcp())
    phases.append(move_tcp([current[0],current[1],.20],read_tcp,apply_action))
    phases.append(move_tcp([behind[0],behind[1],.20],read_tcp,apply_action))
    phases.append(move_tcp([behind[0],behind[1],.024],read_tcp,apply_action))
    phases.append(move_tcp([endpoint[0],endpoint[1],.024],read_tcp,apply_action,max_steps=240,tolerance=.004))
    phases.append(park(read_tcp,apply_action))
    return {"tcp_phases":phases,"object_success_is_not_inferred_from_tcp_motion":True}
