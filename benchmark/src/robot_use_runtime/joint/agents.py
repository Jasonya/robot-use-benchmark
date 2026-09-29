"""Predeclared programs/diagnostic controls, not learned VLM or VLA baselines."""
from __future__ import annotations
import numpy as np

METHODS={
    "rgb_tools_closed_loop":{"group":"public_rgb_program_baseline","oracle":False,"no_image":False,"no_order":False,"retry":"same_key","move":True},
    "pose_oracle_reference":{"group":"privileged_solvability_diagnostic","oracle":True,"no_image":False,"no_order":False,"retry":"same_key","move":True},
    "rgb_tools_new_key_retry":{"group":"fault_handling_diagnostic","oracle":False,"no_image":False,"no_order":False,"retry":"new_key","move":True},
    "digital_only":{"group":"evaluator_negative_control","oracle":False,"no_image":False,"no_order":False,"retry":"same_key","move":False},
    "orders_without_image":{"group":"restricted_information_diagnostic","oracle":False,"no_image":True,"no_order":False,"retry":"same_key","move":True},
    "image_without_orders":{"group":"restricted_information_diagnostic","oracle":False,"no_image":False,"no_order":True,"retry":"same_key","move":True},
}


def _required(result):
    if not result.get("ok"):raise RuntimeError(result.get("error","tool failed"))
    return result


def run_agent(method_id,order_id,call):
    """The program receives only a public order identifier and the tool port."""
    config=METHODS[method_id]
    catalog=_required(call("catalog.list"))["catalog"]
    bays=_required(call("workcell.bays"))["bays"]
    if config["no_order"]:
        # A deliberately fixed guess, identical across matched-image orders.
        # These cases become ambiguous without the missing order information.
        order={"order_id":order_id,"sku":"SKU-P","bay_id":"BAY-L","quantity":1}
    else:
        order=_required(call("orders.get",{"order_id":order_id}))["order"]
    _required(call("inventory.list"))
    color=next(r["visual_identity"] for r in catalog if r["sku"]==order["sku"])
    target=np.asarray(bays[order["bay_id"]]["center_xy"],dtype=float)
    attempts=0
    last_estimate=None
    observed_near_goal=False
    if config["move"]:
        for attempt in range(6):
            if config["oracle"]:
                detections=_required(call("diagnostics.pose_oracle"))["parts"]
            elif config["no_image"]:
                # Nominal locations known before the seed-specific worlds are
                # generated. No hidden position or color assignment is read.
                source=[-.12,.60] if order["sku"]=="SKU-P" else [.12,.60]
                detections=[{"visual_identity":color,"estimated_center_xy":source}]
                if attempt>0:break
            else:
                frame=_required(call("camera.capture"))
                detections=_required(call("vision.locate_parts",{"frame_id":frame["frame_id"]}))["parts"]
            matched=[r for r in detections if r["visual_identity"]==color]
            if not matched:return {"agent_status":"target_not_visible","motion_attempts":attempts}
            position=np.asarray(matched[0]["estimated_center_xy"],dtype=float)
            last_estimate=position.tolist()
            if np.linalg.norm(position-target)<.018:
                observed_near_goal=True
                break
            if attempt==5:break
            _required(call("robot.push_xy",{"source_xy":position.tolist(),"destination_xy":target.tolist()}))
            attempts+=1
        if not config["no_image"] and not observed_near_goal:
            # Do not declare dispatch merely from successful TCP commands.
            return {"agent_status":"physical_estimate_not_converged","motion_attempts":attempts,"last_visual_estimate":last_estimate}
    payload={"order_id":order_id,"sku":order["sku"],"bay_id":order["bay_id"],
             "idempotency_key":"dispatch-"+order_id}
    result=call("dispatch.record",payload)
    if result.get("error")=="transport_reply_lost":
        if config["retry"]=="new_key":payload["idempotency_key"]+="-retry"
        result=call("dispatch.record",payload)
    return {"agent_status":"reported_completed" if result.get("ok") else "record_failed",
            "motion_attempts":attempts,"last_visual_estimate":last_estimate,
            "observed_near_goal":observed_near_goal,"record_response":result}
