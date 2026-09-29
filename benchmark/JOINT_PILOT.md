# Synthetic joint-workflow pilot

The `robot_use_runtime.joint` package connects rendered RGB, a local SQLite order/inventory fixture, typed tool calls and articulated Sawyer contact-physics rollouts. Contract: `joint-dispatch-pilot-0.3`. It is one controlled synthetic workflow, not a general-purpose VLM/VLA benchmark.

The released experiment has 40 development packets and 80 new-initial-state test packets, generated from 15 physical worlds. Six fixed programs/diagnostic controls produce 720 trials. Two additional privileged feasibility annotations supply missing completion witnesses without changing the original test scores.

```sh
python -m pip install -e '.[joint]'
python -m robot_use_runtime.joint.run \
  --output runs/my-joint-run --seeds 801 802 803 \
  --workers 2 --phase development
python -m robot_use_runtime.joint.validate runs/my-joint-run --workers 2
```

The full RGB program uses pixel-derived marker locations and queried order state. The shared motion controller uses robot TCP proprioception. Its normal tool port does not return simulator object positions. The explicitly privileged pose-reference method is a diagnostic; the other ablations deliberately remove information or use faulty retry behavior.

Every trial records initial/final RGB, object and camera evidence, actual SQLite states, tool events, actions, qpos/qvel/time, and joint evaluation. Replay checks compare physics, RGB, detector outputs and digital state. The data release also includes complete high-level tool-chain replay checks and source hashes.

Object state is assigned only during initialization; episode motion comes from the inherited native Cartesian/gripper controller and MuJoCo integration. Geometric support-height, translational settling and final non-target position are measured; this is not a contact-force safety certificate or real-world deployment test.

The `[joint]` dependencies pin the versions used on Python3.11/macOS ARM64. Original Meta-World assets remain dependencies and retain their licenses. No real business records, human video, external MCP service or paid model API is used by this pilot.
