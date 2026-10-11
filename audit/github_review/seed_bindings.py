"""Authored repository choices from paper links, author pages and prior pins.

These choices identify what to inspect. They are not completed code reviews.
"""
from pathlib import Path
import json
from network import CACHE, ROOT

# Each semicolon-separated item is a code/data repository to inspect.
# Website templates and unrelated baseline dependencies were removed after
# inspecting the paper/project candidate table.
CHOICES = """
P002 antoine77340/howto100m
P003 coin-dataset/annotations;coin-dataset/code;coin-dataset/annotation-tool
P004 DmZhukov/CrossTask
P010 epic-kitchens/epic-kitchens-100-annotations;epic-kitchens/epic-kitchens-100-narrator
P011 epic-kitchens/VISOR-VOS;epic-kitchens/VISOR-HOS;epic-kitchens/VISOR-WDTCF
P013 EGO4D/episodic-memory;EGO4D/hands-and-objects;EGO4D/social-interactions;EGO4D/audio-visual;EGO4D/forecasting
P015 assembly-101/assembly101-download-scripts;assembly-101/assembly101-annotations;assembly-101/assembly101-mistake-detection;assembly-101/assembly101-temporal-action-segmentation;assembly-101/assembly101-action-anticipation;assembly-101/assembly101-action-recognition
P016 IkeaASM/ikea_asm_dataset
P018 facebookresearch/hot3d
P019 sanweiliti/EgoBody
P020 rawalkhirodkar/egohumans
P021 OpenGVLab/EgoExoLearn
P023 Sid2697/EgoProceL-egocentric-procedure-learning
P025 DannyTran123/egopet
P026 owenzlz/EgoHOS
P028 egoschema/EgoSchema
P029 AdaCheng/EgoThink
P030 ChenYi99/EgoPlan
P031 qiulu66/EgoPlan-Bench2
P033 EvolvingLMMs-Lab/EgoLife
P034 showlab/EgoVLP
P035 facebookresearch/EgoVLPv2
P036 facebookresearch/EgoT2
P037 facebookresearch/ego-env
P038 facebookresearch/open-eqa
P039 google-deepmind/robovqa
P040 yulin-luo/RoboBench
P041 MyUniverse0726/EgoCross
P043 Embodied-VideoAgent/embodied-videoagent
P044 sapeirone/HiERO
P045 slurm-lab-usc/ManipBench-Real-Robot-question;slurm-lab-usc/ManipBench-Fabric-Manipulation-Code;slurm-lab-usc/ManipBench-Sim-Robot-question
P047 facebookresearch/AVT
P048 facebookresearch/ego-topo
P049 brown-palm/AntGPT
P052 fpv-iplab/stillfast
P054 JeffWang987/EgoVid
P055 gongda0e/FUTR
P057 2020aptx4869lm/Forecasting-Human-Object-Interaction-in-FPV
P058 ai4ce/EgoPAT3Dv2
P059 masashi-hatano/EMAG
P060 CorrineQiu/from-where-to-how
P061 biantongfei/SocialEgoNet
P062 stepjam/RLBench
P063 rlworkgroup/metaworld
P064 Lifelong-Robot-Learning/LIBERO
P065 mees/calvin;mees/calvin_env
P066 haosulab/ManiSkill
P067 haosulab/ManiSkill2;haosulab/ManiSkill2-Learn
P068 mani-skill/ManiSkill
P069 ARISE-Initiative/robosuite;ARISE-Initiative/robosuite-benchmark
P070 robocasa/robocasa
P071 robocasa/robocasa
P072 OpenMOSS/VLABench
P073 RoboTwin-Platform/RoboTwin
P074 RoboTwin-Platform/RoboTwin
P075 vimalabs/VIMABench;vimalabs/VIMA
P076 google-research/ravens
P079 rail-berkeley/fmb
P081 arnold-benchmark/arnold
P082 RoboVerseOrg/RoboVerse
P083 RoboDojo-Benchmark/RoboDojo;XPolicyLab/XPolicyLab
P084 Princeton-Robot-Planning-and-Learning/kindergarden;Princeton-Robot-Planning-and-Learning/kinder-baselines
P085 Xingyu-Lin/softgym
P086 DanielTakeshi/deformable-ravens;DanielTakeshi/gctn_physical
P087 GarmentLab/GarmentLab
P088 columbia-robovision/flingbot
P089 pantor/speedfolding
P090 columbia-ai-robotics/cloth-funnels
P091 xiaoxiaoxh/UniFolding
P092 Victorlouisdg/cloth-competition
P093 carolzyy/MoDeSuite
P094 peteanderson80/Matterport3DSimulator
P095 google-research-datasets/RxR
P096 askforalfred/alfred
P097 alexa/teach
P098 facebookresearch/habitat-lab;facebookresearch/habitat-sim
P099 facebookresearch/home-robot
P100 StanfordVL/BEHAVIOR-1K
P101 embodied-agent-eval/embodied-agent-eval
P104 simpler-env/SimplerEnv
P105 sylvestf/LIBERO-plus
P106 Farama-Foundation/Metaworld
P107 robot-colosseum/robot-colosseum
P109 columbia-ai-robotics/reflect
P110 NVlabs/AHA
P112 Y-Haneji/EgoOops-annotations
P114 offjangir/RobotArena
P115 SoumilRathi/robomme-interference
P116 UT-Austin-RobIn/oopsieverse
P117 real-stanford/universal_manipulation_interface
P118 SimarKareer/EgoMimic;SimarKareer/EgoMimic-Eve
P119 apple/ml-egodex
P121 vliu15/egozero
P123 Baiqi-Li/WatchAct
P125 google-deepmind/open_x_embodiment
P126 droid-dataset/droid;droid-dataset/droid_policy_learning
P127 rail-berkeley/bridge_data_v2
P128 SudeepDasari/RoboNet
P130 tonyzhaozh/aloha;tonyzhaozh/act
P131 MarkFzp/mobile-aloha;MarkFzp/act-plus-plus
P132 google-research/robotics_transformer
P134 openvla/openvla
P135 octo-models/octo
P139 facebookresearch/r3m
P140 facebookresearch/vip
P141 taeinkwon/PyHoloAssist;Ember-HoloAssist/holoassist-release
P142 facebookresearch/habitat-lab;facebookresearch/habitat-sim
P143 facebookresearch/partnr-planner
P144 jeffacce/cap-policy
P145 Cognition2Action-Lab/NIABench
P146 4DVLab/DexH2R
P148 assistive-autonomy/assistax
P149 facebookresearch/vjepa2
P150 NVIDIA/DreamDojo
P151 Rongdingyi/H2R-Bench
P152 fffstrong/RoboWM-Bench
P154 showlab/Ego-PM
P157 IRMVLab/awesome-robot-learning-from-human-videos
P158 ziyaow1010/vla-datasets-benchmarks
P159 felipemaiapolo/tinyBenchmarks;felipemaiapolo/efficbench
P160 google-research/rliable
P163 ayiyayi/Awesome-Egocentric-and-Exocentric-Vision
P164 imitator-game/The-Imitator-Game
P167 wayrise/DexGarmentLab
P168 interaction-lab/HRIBench
P169 X-Square-Robot/x2real
P171 Bench2Dex/Bench2Dex
P172 Rui-li023/LabUtopia
P173 Zhipeng-Tang/LabDex
P175 hbhuiyou/Pipette
P176 autobio-bench/AutoBio
P177 xiaochy/H2RBench
P178 RUCKBReasoning/RoboRecover
P179 anon-robo-account/REBOOT
P180 chengyuehuang511/SafeManip
P182 TuojingAI/SoftVTBench
P184 UMass-Embodied-AGI/DLO-Lab
P185 hwk0809/RGBench
P186 Barbany/bifold
P187 zcswdt/SSFold-main
P188 halid1020/softgym-deepcloth;halid1020/robot_control_cloth;halid1020/agent-arena-v0
P189 slurm-lab-usc/GPT-fabric-folding;slurm-lab-usc/GPT-Fabric-Smoothing;slurm-lab-usc/gpt-fabric-physical-experiments
P190 luhr2003/UniGarmentManip
P192 dualtransparency/Phys-Liquid-AAAI
P193 BeLl0o/GRIP_Dataset
P196 lhy0807/deform360
P197 eth-siplab/EgoSim
P198 leolyliu/TACO-Instructions
P201 leiyj23/EgoSAT
P204 facebookresearch/S-EMBER
P209 hucebot/HUI360-Baselines;RaphaelLorenzo/Interact360
P211 Fouad-Bahrpeyma/AssemblyGrid_v1
P212 zaoanguai/ARB4WM
P216 HAP-ego/HAP
P220 CorrineQiu/VISTA
P221 lmur98/AFFttention
P222 IRMVLab/UniHand;IRMVLab/MMTwin
P223 CorrineQiu/INSIGHT
P224 wangwen-banban/EMPIRE
P225 ZhaofengSHI/Exo2EgoPose
P226 yehiahmad/EgoTraj
P228 ut-vision/SFHand
P229 chaitanya100100/UniEgoMotion
P230 masashi-hatano/EgoH4
P231 IRMVLab/MADiff
P232 IRMVLab/Diff-IP2D
P233 stevenlsw/hoi-forecast
P235 algvr/transfusion
P237 olga-zats/GTDA
P238 brown-palm/ObjectPrompt
P240 Nmegha2601/anticipatr
P241 lmur98/AFFttention
P247 hs-yn/GazeBeyondFrame
P249 BCV-Uniandes/EgoCast
P250 facebookresearch/egoman
""".strip()


def evidence_for(repo, paper, discovered):
    result = []
    key = repo.lower()
    for item in discovered["candidates"]:
        if (item.get("repo") or "").lower().rstrip("'\"}") == key:
            result.append({"kind": "paper_link", "url": item["url"], "pdf_page": item["page"],
                           "pdf_sha256": discovered["pdf_sha256"], "basis": item["basis"]})
    for project in paper["projects"]:
        for item in project["repository_links"]:
            if item["repo"].lower().rstrip("'\"}") == key:
                result.append({"kind": "author_project_link", "url": item["url"], "link_label": item["label"],
                               "project_url": project["paper_link_url"], "page_sha256": project["receipt"].get("sha256")})
    for item in discovered["previous_repositories"]:
        if item["repo"].lower() == key:
            result.append({"kind": "previous_inventory", **item})
    return result


def main():
    choices = {line.split(" ", 1)[0]: line.split(" ", 1)[1].split(";") for line in CHOICES.splitlines()}
    papers = json.loads((CACHE / "project_candidates.json").read_text())
    bindings = []
    for paper in papers:
        pid = paper["paper_id"]
        discovered = json.loads((CACHE / f"{pid}-discovery.json").read_text())
        repos = [{"requested_repo": name, "link_evidence": evidence_for(name, paper, discovered),
                  "selection_status": "selected_for_identity_and_code_review"}
                 for name in choices.get(pid, [])]
        bindings.append({"paper_id": pid, "name": paper["name"], "scope": paper["scope"],
                         "repositories": repos, "review_status": "pending",
                         "discovery_status": "candidate_selected" if repos else "further_search_needed"})
    out = ROOT / "content/github_review/repository_bindings.json"
    out.write_text(json.dumps(bindings, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"papers": len(bindings), "with_candidates": sum(bool(r["repositories"]) for r in bindings),
                     "unique_requested_repos": len({s["requested_repo"].lower() for r in bindings for s in r["repositories"]}),
                     "unsupported_candidate_links_to_check": [(r["paper_id"], s["requested_repo"]) for r in bindings for s in r["repositories"] if not s["link_evidence"]]}, indent=2))


if __name__ == "__main__":
    main()
