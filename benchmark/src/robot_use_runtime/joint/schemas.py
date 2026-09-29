"""Public JSON tool definitions and the authored workflow-candidate contract."""
STRING={"type":"string","minLength":1,"maxLength":160}
XY={"type":"array","items":{"type":"number"},"minItems":2,"maxItems":2}


def tool(name,description,properties=None):
    properties=properties or {}
    return {"name":name,"description":description,"input_schema":{
        "type":"object","properties":properties,"required":list(properties),"additionalProperties":False}}


TOOL_SCHEMAS=[
    tool("camera.capture","Capture the current fixed-overhead RGB image. Returns an image attachment and public camera calibration; no object-state labels."),
    tool("vision.locate_parts","Locate the two known colored part markers from a delivered RGB frame. Returns pixel evidence and calibrated estimated XY coordinates, not simulator object positions.",{"frame_id":STRING}),
    tool("catalog.list","Read the synthetic part catalog and visual marker identities. No physical locations are stored here."),
    tool("orders.get","Retrieve the indicated order's part SKU, destination bay, quantity and status.",{"order_id":STRING}),
    tool("inventory.list","Read available counts and DECLARED locations from the local SQLite fixture; these are not measured physical locations."),
    tool("workcell.bays","Read fixed dispatch-region centers and dimensions in the robot/workcell coordinate frame."),
    tool("robot.push_xy","Use the inherited articulated Sawyer controller to push from the supplied estimated source XY toward the supplied destination. The motion controller reads robot TCP proprioception only; its reply does not certify object success.",{"source_xy":XY,"destination_xy":XY}),
    tool("robot.park","Raise and park the gripper and let the workcell settle."),
    tool("dispatch.record","Append one claimed dispatch and update the synthetic inventory. The same idempotency key plus identical payload is deduplicated. A reply may be lost after commit. A new key creates another event; the API does not observe physics.",{
        "order_id":STRING,"sku":{"type":"string","enum":["SKU-P","SKU-G"]},
        "bay_id":{"type":"string","enum":["BAY-L","BAY-R"]},"idempotency_key":STRING}),
]

WORKFLOW_CANDIDATE={
    "id":"joint-dispatch-workflow-candidate-v1",
    "status":"authored_execution_workflow_candidate_not_global_G2_adjudicated",
    "task_kind":"robot_control_with_digital_tool_state",
    "roles":["ordered_part","non_target_part","requested_dispatch_region","order_record","inventory","dispatch_ledger"],
    "reference_program":"Resolve the part SKU and bay via the specified order; ground the SKU's visual marker in current RGB.",
    "goal_program":"The whole ordered rigid part is in the requested dispatch region and supported on the table; the other part's position is preserved; one matching dispatch is recorded and inventory/order state agrees.",
    "required_process":["Record a mutating dispatch only after physical completion.","Do not record the same shipment twice."],
    "completion_semantics":{
        "joint":"physical_success AND digital_success AND all_mutating_commits_after_physical_completion",
        "physical":"All eight box vertices inside the XY region; lower-face z within +/-0.006m of table and upper face at most0.065m (geometric proxy); last40 control-step translational speed below0.04m/s; other-part center displacement at most0.02m.",
        "digital":"Exactly one correct dispatch row, matching completed order, target availability0 at requested bay, other availability1 in buffer.",
        "not_measured":["General object semantics","Human demonstration understanding","Natural language understanding by the packaged rule programs","Real-world transfer","Contact-force support certification, full angular stability or general physical safety"],
    },
    "instance_parameters":["Initial part positions","Assignment of visual markers to left/right positions","Order SKU","Requested bay"],
    "case_conditions":["Clean transport","First commit response lost after the database mutation"],
    "do_not_count_as_new_tasks":["Reset seeds","SKU or bay parameter values","Fault conditions","Methods or repeated rollouts"],
    "material":"Rigid boxes only","robot":"One Sawyer arm","camera":"Fixed overhead synthetic robot-workcell RGB; no human video",
    "formal_canonical_g2_count":None,"formal_validated_domain_coverage_claim":False,
}
