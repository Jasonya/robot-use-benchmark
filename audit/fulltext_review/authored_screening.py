"""Editorial inclusion decisions after primary abstract/setup screening."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
# Pages are PDF pages. These are screening scopes, not full-section review claims.
decisions = {
 "P035":([1,5,6],"method","EgoVLPv2使用EgoClip/EgoMCQ及既有下游資料；模型融合改進不另計一份新影片庫。"),
 "P036":([1,2,5],"method","EgoT2在Ego4D的7既有任務做task translation，保留作跨任務模型參考。"),
 "P043":([1,2,5],"method","Embodied VideoAgent用Ego4D-VQ3D、OpenEQA、EnvQA；新增memory/tool方法，不把下游來源再加總。"),
 "P044":([1,2,6],"method","HiERO在EgoMCQ/EgoNLQ/EgoProceL/Goal-Step驗證hierarchical features，未另計父資料規模。"),
 "P046":([1,4],"method","RULSTM是EPIC/EGTEA的anticipation方法與challenge參考，原生題庫歸父來源。"),
 "P047":([1,2,6],"method","AVT使用EK55/EK100/EGTEA/50Salads，四個評測集合不能當四份新資料。"),
 "P048":([1,3,6],"method","EGO-TOPO從EPIC/EGTEA建環境affordance圖，保留拓撲表示與forecasts設計參考。"),
 "P049":([1,3],"method","AntGPT研究goal inference與actionsequenceforecast，LTA定義歸Ego4D等父benchmark。"),
 "P050":([1,4,8],"method","PALM用caption/認別/LLM預測既有LTA標籤；多次prompt不增加基礎題數。"),
 "P052":([1],"method","StillFast針對既有short-term object interaction anticipation，屬方法；初篩僅摘要/任務定義。"),
 "P055":([1,2,5],"method","FUTR在Breakfast與50Salads測長期預測，保留horizon/分割方式參考。"),
 "P056":([1,2,8],"method","未来手/物體位置預測在公開第一人稱及street資料驗證；本輪未另登記獨立新資料資源。"),
 "P059":([1,4,8],"method","EMAG在Ego4D/EPIC55研究ego-motion及跨庫泛化，非新capture來源。"),
 "P078":([1,3],"experiment","PerAct有18RLBench tasks/249variations及7real tasks/18variations；保留方法實驗，RLBench子集不重算整庫。"),
 "P117":([1,6,7],"experiment","UMI四個實機task驗證工具/介面；可借cuporientation等規則，未納成本輪獨立benchmark總數。"),
 "P118":([1,5,10],"experiment","EgoMimic三個real long-horizon tasks研究human-robot對齊；保留任務擴充參考。"),
 "P121":([1,2,5],"experiment","EgoZero七個real tasks驗證smart-glasses到robot技能；是方法實驗而非七種新生活領域。"),
 "P122":([1,2,6],"experiment","EgoBridge的PushT對照與三realtasks用於OT adaptation；背景和初態規則可借用。"),
 "P130":([1,8],"experiment","ALOHA/ACT六個real tasks與兩simtasks，主要介面/策略研究；demo數和task數分開。"),
 "P131":([1,7],"experiment","MobileALOHA延伸mobilebimanual操作，50demos/task；完整custom實驗清單可續做task-level抽取。"),
 "P133":([1,4,7],"experiment","RT2約6000跨方法/條件rollouts；沿用robotdata並研究新語義能力，非6000unique tasks。"),
 "P134":([1,2,7],"experiment","OpenVLA重用OXE970Kdemonstrations；29evaltasks與7finetunetasks是方法實驗範圍。"),
 "P135":([1,2,3],"method","Octo800Ktrainingtrajectories來自OXE；多平台policyadaptation不建立800Ktest題。"),
 "P136":([1,3,6],"experiment","π0包含約10000h資料與摺衣/清潔/盒子組裝實驗；保留通用策略與自收資料參考，完整manifest未由初篩驗證。"),
 "P137":([1,3,10],"experiment","π0.5驗證未見房屋與長流程；高低層cotrain是方法，不能把所有提及用途當完整task庫。"),
 "P138":([1,2,10],"method","DiffusionPolicy在既有四benchmark的15tasks評測；保留控制介面/資料預算參考。"),
 "P139":([1,6,8],"experiment","R3M用Ego4Dpretrain、三sim來源與五realtasks；來源重用需連父庫。"),
 "P140":([1,7,8],"experiment","VIP研究reward/representation；四realtasks及既有simcases留作評測方法參考。"),
 "P149":([1,5,11],"method","V-JEPA2有大規模internetpretrain與DROIDadaptation；保留worldmodel/closed-loop對照，不把22Mvideos算robot題。"),
 "P153":([1,6],"method","EgoExo-Gen在EgoExo4D作cross-viewmask/video預測；可借新輸入條件，素材仍屬父來源。"),
 "P154":([1,4,5],"method","Hand-conditioned predictive model使用Ego4D/BridgeData/RLBench，predictionquality與控制success分開。"),
 "P155":([1,2,6],"method","EgoExo-WM把HowTo/CrossTask等exo轉ego並結合Nymeria；新增合成表示，不視為全新獨立行為。"),
 "P156":([1],"survey","Egocentric survey按subject/object/environment/hybrid整理；用於taxonomy與引文擴查。"),
 "P157":([1],"survey","Human-video robotlearning survey區分task/observation/action pathways；背景綜述非新題庫。"),
 "P158":([1,2],"survey","VLA資料/benchmark/dataengine survey；可用於遺漏來源檢查，不沿用二手規模替代原作。"),
 "P159":([1,4,6],"evaluation_method","tinyBenchmarks提供IRT/子集估計方法，研究對象是LLM；不能直接假設robot難度模型有效。"),
 "P160":([1,2,6],"evaluation_method","Rliable提供分層bootstrap/IQM與performanceprofiles；統計方法，不是robot環境資料來源。"),
 "P161":([1],"survey","第一人稱未來預測survey，涵行為/位置/手物互動；背景與追引文來源。"),
 "P162":([1],"survey","手部egocentric survey區分localization/interpretation/application；無新robot題库。"),
 "P163":([1],"survey","Ego-exo survey以跨視角transfer/jointlearning整理，可支援示範來源分類。"),
 "P187":([1,2],"experiment","SSFold報六foldtasks及human demonstrations；留方法實驗參考，初篩尚不宣稱已核所有trial協定。"),
 "P189":([1,5,7],"experiment","GPT-Fabric重用smoothing/folding範式，real10/12rollouts；sim粒子距離和real人工檢視不可混分。"),
 "P190":([1,3,6],"experiment","UniGarmentManip三garment類/三task：unfold/fold/hang；重用資產/對應學習，不當三新datasets。"),
 "P194":([1,2],"experiment","clothgripperinterface八個cornerfold cases驗證kinematicgrasp；省略摩擦contact，不能當完整physicsbenchmark。"),
 "P195":([1,3,7],"experiment","worldmodelforunfolding在Unity/RFUniverse及realcloth驗證；保留模擬與policy方法參考。"),
 "P215":([1,4],"survey","worldmodelevaluation survey列160benchmarks；作引文追查線索，其二手數字不直接併入已核來源。"),
 "P218":([1,7],"method","TrajPilot重用EgoExo4D/GoalStep/EgoPER，重點是trajectoryconditioning及horizon，不另算全部label為新task。"),
 "P219":([1,3],"method","FROST-STA是Ego4D2026challenge submission；query/GT由父challenge定義。"),
 "P220":([1,3,4],"method","VISTA-STA合併train+部分val訓練、只報officialtest；不是新增dataset。"),
 "P221":([1,2],"method","STAformer++是AFF-ttention後續架構，EPIC-STA新增資源已連到P241，避免重列兩次。"),
 "P223":([1,2,5],"method","INSIGHT在Ego4D/EPIC55/EGTEA測意圖推理與預測，原生題庫歸父來源。"),
 "P227":([1,2,5],"method","EggHand處理EgoExo4Dhandposeforecast，保留motion/frame定義與模型baseline參考。"),
 "P231":([1,6,9],"method","MADiff用五publicdatasets與新增interaction-pointdiagnostics；標註/metrics從父資料衍生，非新capture。"),
 "P232":([1,11],"evaluation_method","Diff-IP2D新增jointpredictionmetrics、沿用EPIC/EgoPAT；並揭示USST的FDE erratum，保留評分版本參考。"),
 "P234":([1,2,7],"method","I-CVAE在Ego4DLTA預測20futureactions；oracleintent/GTactionablation應另列。"),
 "P235":([1,2,6],"method","TransFusion把contextsummary加入既有STA；GTcontext與推估context不可等同。"),
 "P236":([1,2,6],"method","ActFusion統一segmentation/anticipation於Breakfast/Salads/GTEA；兩endpoint共用影片。"),
 "P237":([1,2,9],"method","GatedTemporalDiffusion在Breakfast/Assembly101/Salads做stochasticLTA；新模型不增加父庫活動數。"),
 "P238":([1,6],"method","object-centricLTA用Ego4D/50Salads/EGTEA；objectprompt數非獨立task數。"),
 "P239":([1,2,7],"method","MVP研究多尺度video pretraining與既有LTA/summaryforecast；保留觀測horizon參考。"),
 "P240":([1,9,10],"method","ANTICIPATR在四existingdatasets做futureinstance預測；重用原split。"),
 "P242":([1,7],"method","NAOGAT用Ego4DSTA及EK；noun/verb/box/TTCjointmatch是判分組合，非四倍題。"),
 "P243":([1,9,10],"method","FactCheck的Observe-Plan-Verify是預測流程內迭代，EPIC/EGTEA未執行robot物理環境。"),
 "P244":([1],"method","BiAnt在Ego4DLTA研究forward/backwardactionsequencelearning；初篩未新增獨立題庫。"),
 "P245":([1,2],"method","ICVL在Ego4D/EPIC55/EGTEA研究vision-intentionfusion；保留方法與prompt參考。"),
 "P248":([1,2],"method","HOIMotion使用ADT/MoGaze及humanstudy；sceneobjectboxes是forecastinputs，不是新控制環境。"),
 "P249":([1,3,4],"method","EgoCast使用EgoExo4D/ADT，提出較長horizon/估計而非GTpastpose；保留taskprotocol擴充參考。")
}

if __name__ == "__main__":
    bibliography=json.loads((ROOT/"content/literature_refresh/unified_literature.json").read_text())
    detailed=[r for f in (ROOT/"content/fulltext_review").glob("batch*.json") for r in json.loads(f.read_text())]
    by_id={r["paper_id"]:r for r in detailed}
    assert len(by_id)==len(detailed)
    assert set(by_id).isdisjoint(decisions)
    assert set(by_id)|set(decisions)=={p["id"] for p in bibliography}
    results=[]
    for paper in bibliography:
        pid=paper["id"]
        if pid in by_id:
            r=by_id[pid]
            results.append({"paper_id":pid,"decision":"detailed_source_review","pages_read":r["pages_read"],
                            "screening_basis":"原作關鍵章節審閱紀錄","reason":r["role"]+"；數字、任務、判分與來源關係見逐篇表。"})
        else:
            pages,kind,reason=decisions[pid]
            results.append({"paper_id":pid,"decision":kind,"pages_read":pages,
                            "screening_basis":"原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核",
                            "reason":reason})
    receipts={r["paper_id"]:r for r in json.loads((ROOT/"content/fulltext_review/acquisition_receipts.json").read_text())}
    for result in results:
        result["reviewed_pdf_sha256"]=receipts[result["paper_id"]]["pdf_sha256"]
    (ROOT/"content/fulltext_review/screening.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n")
    print(f"Screened {len(results)} papers: {len(by_id)} detailed, {len(decisions)} references.")
