"""Merge manually selected search/project follow-ups without erasing reviews."""
import json
from network import CACHE, ROOT

ADDITIONS = {
    "P005": ["LuoweiZhou/ProcNets-YouCook2"],
    "P007": ["gsig/charades-algorithms"],
    "P009": ["epic-kitchens/annotations", "epic-kitchens/download-scripts", "epic-kitchens/starter-kit-action-recognition"],
    "P011": ["epic-kitchens/VISOR-VIS", "epic-kitchens/VISOR-FrameExtraction"],
    "P012": ["hd-epic/hd-epic-annotations", "hd-epic/hd-epic-downloader", "hd-epic/hd-epic-vqa-eval"],
    "P014": ["EGO4D/Ego-Exo4D-docs", "EGO4D/ego-exo4d-egopose", "EGO4D/ego-exo4d-keystep", "EGO4D/ego-exo4d-relation"],
    "P017": ["leolyliu/HOI4D-Instructions", "hoi4d/HOI4D_SemSeg", "hoi4d/HOI4D_ActionSeg"],
    "P022": ["CaptainCook4D/CaptainCook4D"],
    "P027": ["silicx/EgoPCA"],
    "P032": ["Buzz-Beater/EgoTaskQA"],
    "P042": ["NVlabs/RoboSpatial", "chanhee-luke/RoboSpatial-Eval"],
    "P046": ["fpv-iplab/rulstm"],
    "P051": ["oppo-us-research/USST"],
    "P053": ["Kami-code/HandsOnVLM-release"],
    "P077": ["cliport/cliport"],
    "P078": ["peract/peract"],
    "P080": ["Kami-code/dexart-release"],
    "P102": ["UMich-CURLY/NavVerse-Benchmark"],
    "P103": ["MedlarTea/follow-bench"],
    "P108": ["robo-arena/roboarena", "pranavatreya/roboarena_evaluator"],
    "P129": ["rh20t/rh20t_api"],
    "P136": ["Physical-Intelligence/openpi"],
    "P137": ["Physical-Intelligence/openpi"],
    "P138": ["real-stanford/diffusion_policy"],
    "P165": ["liulin815/libero-recover", "liulin815/LIBERO-Recovery"],
    "P170": ["mayalhc/motionforge"],
    "P202": ["susu801/EgoMonth"],
    "P210": ["rocochallenge/RoCo_TaskBoardAssembly", "rocochallenge/RoCo_BrickAssembly"],
    "P218": ["farsightlab/TrajPilot"],
    "P227": ["JYOUN9/EggHand_Code", "ISL-Lab/EggHand"],
    "P234": ["Evm7/ego4dlta-icvae"],
    "P236": ["gongda0e/ActFusion"],
    "P248": ["CraneHzm/HOIMotion"],
}


def main():
    path = ROOT / "content/github_review/repository_bindings.json"
    bindings = json.loads(path.read_text())
    by_id = {r["paper_id"]: r for r in bindings}
    projects = json.loads((CACHE / "enriched_projects.json").read_text())
    for pid, names in ADDITIONS.items():
        row = by_id[pid]
        existing = {r["requested_repo"].lower() for r in row["repositories"]}
        search_path = CACHE / "search" / f"{pid}.json"
        search = json.loads(search_path.read_text()) if search_path.exists() else None
        for name in names:
            if name.lower() in existing:
                continue
            evidence = []
            for project in projects:
                if pid in project["paper_ids"]:
                    for link in project["repository_links"]:
                        if link["repo"].lower().rstrip("'\"}") == name.lower():
                            evidence.append({"kind": "author_project_followup", "project_url": project["paper_link_url"],
                                             "page_sha256": project["receipt"].get("sha256"),
                                             "url": link["url"], "link_label": link["label"]})
            if search and any(r["full_name"].lower() == name.lower() for r in search["results"]):
                evidence.append({"kind": "repository_search_candidate", "query": search["query"],
                                 "search_receipt_sha256": search["receipt"].get("sha256"),
                                 "url": f"https://github.com/{name}", "officiality": "requires_source_identity_review"})
            row["repositories"].append({"requested_repo": name, "link_evidence": evidence,
                                        "selection_status": "selected_for_identity_and_code_review"})
        row["discovery_status"] = "candidate_selected"
    path.write_text(json.dumps(bindings, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"papers_with_repo_candidates": sum(bool(r["repositories"]) for r in bindings),
                     "unique_requested_repos": len({x["requested_repo"].lower() for r in bindings for x in r["repositories"]}),
                     "remaining_without": [{"id": r["paper_id"], "name": r["name"]} for r in bindings if not r["repositories"]]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
