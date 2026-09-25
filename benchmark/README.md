# Native execution runtime

This is an executable development component of Robot-use Benchmark. It preserves upstream native task IDs, simulator state, action traces, reset seeds and endpoint evidence. Running 50 native environments does not establish 50 cross-benchmark canonical G2 specifications or new tasks.

The adapter uses Meta-World 3.1.1 with MuJoCo 3.3.0 and Gymnasium 1.3.0. Contract 0.2 exposes the same native 39-value state and explicit goal to every method. Its action space is the native four-dimensional Cartesian/gripper control. The published development test has 50 native tasks × 5 new initial states × 5 methods = 1,250 trials. It is a state-based development track.

```sh
python -m pip install -e '.[training]'
robot-use-run --output runs/mw-reference-train \
  --tasks all --seeds 101 102 103 104 105 106 107 108 109 110 \
  --methods scripted_reference uniform_random zero_action \
  --horizon 500 --workers 3
robot-use-validate runs/mw-reference-train --replay-per-task 2
robot-use-train-bc --source-run runs/mw-reference-train --output models/state-bc
robot-use-run --output runs/mw-new-initial-states \
  --tasks all --seeds 201 202 203 204 205 \
  --methods scripted_reference uniform_random zero_action bc_linear bc_extra_trees \
  --policy-bundle models/state-bc --horizon 500 --workers 3
robot-use-validate runs/mw-new-initial-states --replay-per-task 2
```

Every run first writes an immutable protocol, trial manifest and a copy of its runtime Python sources. A fresh output directory is required; errors remain in the manifest. Saved artifacts include states, observations, raw and clipped actions, native information, rewards, success flags, package versions and source hashes. The validator checks file integrity, finite states, identical paired resets and action replay. Reach and window endpoints additionally receive a separate geometric check from MuJoCo site positions.

In the pinned package combination, an initial `window-close` success query used stale kinematics. Contract 0.2 calls `mj_forward` and synchronizes current/previous observations without changing qpos, qvel or time. Contract 0.1 results remain archived and can be replayed with the native reset mode. Do not combine results from different reset contracts without labeling them.

Both BC baselines are actual, separately trained models for each native task: standardized ridge regression and Extra Trees. Training uses non-presolved successful reference prefixes. Future evaluation seeds and initial-state hashes must not overlap training. Models use NumPy arrays without pickle deserialization. The public execution page includes the approximately 9 MB model archive, its SHA256, all 1,250 compact trial records and per-task results.

`requirements-macos-development.txt` records the full Python 3.11 ARM64 development environment, including reporting tools. Fresh platform runs record their own versions and replay tolerance; a successful local replay is not a claim of bitwise equality across hardware.

Native success at any time, at the final step and during the last ten steps are reported separately. Initially solved cases, method/engine failures and reset disagreements are explicit. These checks do not validate all native predicates, establish new process-compliance metrics, calibrate a universal difficulty scale or finish the intended large benchmark.

The schemas distinguish authored task specs, typed counts and source/evidence cells. Goal fingerprints are overlap candidates, not certified canonical G2 identities. A descriptive two-BC difficulty proxy is published separately from any formal calibrated difficulty level.

Source dependencies:

- Meta-World: `https://github.com/Farama-Foundation/Metaworld`
- MuJoCo: `https://github.com/google-deepmind/mujoco`
- Gymnasium: `https://github.com/Farama-Foundation/Gymnasium`

Upstream assets and policies remain dependencies with their original provenance. Raw local runs are excluded from the website source repository; selected trace and summary exports are published separately after validation.
