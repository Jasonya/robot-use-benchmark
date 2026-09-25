"""Safe NumPy inference for locally trained state-based development baselines."""
from pathlib import Path
import json
import numpy as np

from .common import file_hash


def extra_trees_predict_one(obs, arrays):
    obs=np.asarray(obs,dtype=np.float32)
    features,thresholds,left,right,values=(arrays[key] for key in ["features","thresholds","children_left","children_right","values"])
    indices=np.arange(features.shape[0])
    nodes=np.zeros(features.shape[0],dtype=np.int32)
    for _ in range(int(arrays["max_depth"])+2):
        split=features[indices,nodes]
        active=split>=0
        if not active.any():
            break
        go_left=obs[np.maximum(split,0)]<=thresholds[indices,nodes]
        next_nodes=np.where(go_left,left[indices,nodes],right[indices,nodes])
        nodes=np.where(active,next_nodes,nodes)
    if (features[indices,nodes]>=0).any():
        raise ValueError("Incomplete/cyclic tree export")
    return values[indices,nodes].mean(axis=0)


class LearnedPolicy:
    def __init__(self, bundle_path, task_id, method):
        base=Path(bundle_path).resolve()
        manifest=json.loads((base/"bundle.json").read_text())
        item=manifest["methods"][method]["models"][task_id]
        model=(base/item["file"]).resolve()
        if base not in model.parents:
            raise ValueError("Model path leaves its bundle")
        if file_hash(model)!=item["sha256"]:
            raise ValueError("Model checksum mismatch")
        with np.load(model,allow_pickle=False) as data:
            self.arrays={key:data[key].copy() for key in data.files}
        self.method=method
        self.model_sha256=item["sha256"]
        self.bundle_sha256=file_hash(base/"bundle.json")
        self.training_case_ids=set(manifest["training_case_ids"])
        self.training_reset_seeds=set(manifest["training_reset_seeds"])
        self.training_initial_state_hashes=set(manifest["training_initial_state_hashes"])

    def get_action(self, obs):
        obs=np.asarray(obs,dtype=np.float64)
        if self.method=="bc_linear":
            x=(obs-self.arrays["mean"])/self.arrays["scale"]
            return np.r_[x,1.0]@self.arrays["weights"]
        if self.method=="bc_extra_trees":
            return extra_trees_predict_one(obs,self.arrays)
        raise ValueError("Unknown learned policy")
