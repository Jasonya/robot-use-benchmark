"""Manually authored notes after reading primary-paper sections.

This file serializes editorial notes; it does not infer review status from text.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
rows = []


def note(pid, pages, role, domains, environment, tasks, cases, counts, evaluation,
         types, split, lineage, unresolved, reuse):
    receipt = json.loads((ROOT / "audit/.cache/fulltext_review" / pid / "receipt.json").read_text())
    rows.append({
        "paper_id": pid, "status": "benchmark_sections_reviewed",
        "reviewed_pdf_sha256": receipt["pdf_sha256"], "reviewed_on": "2026-10-02",
        "identity_note": receipt["expected_title"] + "；以本次PDF指紋固定來源。",
        "scope_read": "原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。",
        "pages_read": pages, "role": role, "domains": domains,
        "environment": environment, "tasks": tasks, "cases": cases,
        "native_counts": [{"field": f, "value": v, "unit": u, "pages": p} for f, v, u, p in counts],
        "evaluation": evaluation, "evaluation_types": types, "split": split,
        "lineage": lineage, "evidence": [{
            "pages": pages, "locator": "原作Dataset / Task / Evaluation段落及表格，詳見閱讀範圍",
            "supports": "本列環境、任務、資料／題數、判分及重用關係；未報值不推估"
        }],
        "unresolved": unresolved, "reuse": reuse
    })


note("P002",[1,2,3,4,5,6],"人類程序影片與步驟定位",
     ["餐飲與料理","工藝與修繕","園藝與戶外","照護與個人活動","交通工具與維修","寵物照護","運動與身體技能","辦公活動"],
     "YouTube instructional/vlog等影片；12 WikiHow用途類別，不是12個物理場景。",
     "23,611 visual tasks是WikiHow搜尋活動標籤，未正規化成robot goals。",
     "1.22M影片／136.6M弱配對clip-caption；本庫主要供pretraining，下游評CrossTask等既有benchmark。",
     [("domain",12,"WikiHow來源用途類別",[3,4]),("task",23611,"human visual-task query labels",[3]),("data",136600000,"weak clip-caption pairs（約數）",[4])],
     ["下游step recall、retrieval R@K/median rank；非136.6M人工驗證評測題。"],["答案或標籤比對"],
     "移除CrossTask test與YouCook2 val重複video IDs；仍可能有重上傳內容。",
     "WikiHow活動×YouTube搜尋；片段共享長影片，後續world-model/ego conversion又會重用。",
     ["原作抽400pairs僅51%至少一項提及與畫面吻合；不能直接將全部字幕當程序ground truth。"],
     "是擴大生活/工作用途的重要來源；活動標籤、可觀測步驟及robot可執行目標需逐層轉換。")

note("P034",[1,3,4,5,6,7],"影片資料與感知評測",["跨域人類活動","居家生活","工藝與修繕"],
     "Ego4D的129scenario labels；來源環境重用。",
     "EgoMCQ包含inter-video/intra-video兩種五選一video-text配對；EgoClip是訓練庫。",
     "EgoClip約3.85M narrations/2,927h；EgoMCQ約39K題＝24K inter+15K intra。",
     [("case",39000,"EgoMCQ development questions（約數）",[6]),("data",3850000,"EgoClip narrations（約數）",[3]),("environment",129,"source scenario labels",[3])],
     ["EgoMCQ accuracy；下游retrieval、NLQ、recognition分開。"],["答案或標籤比對"],
     "EgoClip排除Ego4D val/test；EgoMCQ再人工移除和pretraining共用multi-view的影片。",
     "Ego4D→EgoClip/EgoMCQ；兩位narrators不代表兩份獨立行為。",
     ["39K是概述約數；最終題ID與選項去重需原始manifest。"],
     "原先只列成方法會漏掉真正新增的EgoMCQ；應把論文與其多個資源分開登記。")

note("P037",[1,6,7,8],"空間理解與affordance",["居家生活","室內導航"],
     "pretraining 900 HM3D scenes；HouseTours選886houses，MP3D90scenes；各自保留source單位。",
     "room prediction與NLQ兩端點；21real room classes，MP3D9classes不是新的生活domain。",
     "約15K合成walkthroughs×512steps；HouseTours約32h、MP3D146walkthroughs；QA精確總量未核。",
     [("environment",900,"HM3D pretraining scenes",[7]),("environment",886,"選用HouseTours houses",[7]),("task",2,"environment understanding endpoints",[6]),("data",146,"MP3D video walkthroughs",[7])],
     ["room分類、NLQ temporal localization；local-state AP另測。"],["答案或標籤比對","數值誤差與相似度"],
     "HouseTours按house切，Ego4D/MP3D用原split；video memory可讀query附近全片，非嚴格在線。",
     "新增HouseTours labels、Ego4D NLQ沿用，HM3D/MP3D資產重用。",
     ["Ego4D段落稱1,259scenes，需核是video/session或實體place；不納跨來源環境總和。"],
     "補house-tour與室內環境理解；source錄影場所與sim資產必須分開。")

note("P051",[1,5,6],"動作與軌跡預測",["居家生活","桌面物件操作"],
     "EgoPAT3D-DT 14scenes＝11seen+3unseen；H2O重用原capture。",
     "3D hand-centroid trajectory forecasting；2D projection另報，不是完整手指控制。",
     "H2O 8,203/1,735/3,715 train/val/test windows；EgoPAT3D-DT 6,356/846/1,605 seen test+2,334 unseen test。",
     [("environment",14,"EgoPAT3D-DT scenes",[6]),("case",3715,"H2O-PT test windows",[6]),("case",1605,"EgoPAT3D-DT seen-test windows",[6]),("case",2334,"EgoPAT3D-DT unseen-test windows",[6])],
     ["ADE/FDE，3D以米、2D以frame size正規化；3D模型投影和2D直接模型分開。"],["數值誤差與相似度"],
     "H2O64frame windows步長15，窗口重疊；EgoPAT3D有held-out scenes。",
     "H2O→PT/DT、EgoPAT3D→DT是新增標註；不把父原片重複計。",
     ["後續Diff-IP2D提及原repo的FDE erratum；比較成績需固定修正版本。"],
     "可新增trajectory模組；相近窗口須依原影片群聚切分與估計。")

note("P053",[1,5,6,7],"動作與軌跡預測",["餐飲與料理","桌面物件操作"],
     "EPIC/H2O/FPHA/Ego4D原影片環境，無新增可執行robot scenes。",
     "VHP顯式動作指令與RBHP隱式意圖兩預測任務；10observed→4future frames，4fps。",
     "RBHP生成7.5K EPIC與8K Ego4D QA-prediction pairs；24K/epoch是抽樣預算而非獨立題庫。",
     [("task",2,"hand-prediction task formulations",[5]),("case",8000,"Ego4D zero-shot generated query pairs（約數）",[6]),("data",7500,"EPIC generated query pairs（約數）",[6])],
     ["ADE/FDE/WDE，不是語言答對率或robot完成率。"],["數值誤差與相似度"],
     "EPIC validation及H2O/FPHA zero-shot；†版本混合五個額外QA訓練來源。",
     "OCT-style手軌跡標註＋GPT生成implicit instructions；父影片和explicit/implicit變體共享。",
     ["生成指令的精確train/test manifest與ground-truth歧義需核；不是每次生成都新語義task。"],
     "是擴充任務規則的來源：同軌跡在明示/隱式需求下重測，保留對照關係。")

note("P054",[1,4,5,6,7,8],"世界模型與影片生成評測",["居家生活","辦公活動","運動與身體技能","工藝與修繕","戶外活動"],
     "重用Ego4D來源，場景總數未報。",
     "文字與camera kinematics條件下video generation；kinematic label不是robot action。",
     "名義5Mclips；正文4.9Mtrain、1.2Kval，只有65K具可用IMU的kinematic subset。",
     [("data",5000000,"EgoVid clips（名義約數）",[4]),("case",1200,"EgoVid-val samples（約數）",[7]),("data",65000,"kinematic-annotated subset（約數）",[7])],
     ["CD-FVD、semantic/action alignment、clarity、motion smoothness/strength及pose errors。"],["數值誤差與相似度"],
     "val按品質/多樣性選，已讀段未明示source-video-disjoint；三個1Mcleaning subsets不是新增資料。",
     "Ego4D→EgoVid，VIO/MLLM重標；generation評測沿用AIGCBench/VBench部分metrics。",
     ["5M不能全部叫action-conditioned examples；4.9M與5M概述差異保留。"],
     "補ego世界模型，但評測視覺品質和實際可控物理成功需另驗證。")

note("P057",[1,7,8,9,11],"動作與軌跡預測",["餐飲與料理"],
     "EGTEA與EPIC-Kitchens原capture。",
     "action anticipation、motor attention、interaction hotspot三端點。",
     "EGTEA10,321action instances；EPIC39,596是父資料，全量hotspot僅EGTEA，EPIC只many-shot noun subset。",
     [("task",3,"joint forecasting endpoints",[11])],
     ["Top1/5、mean-class accuracy、hotspot F1/KLD、trajectory ADE/FDE。"],["答案或標籤比對","數值誤差與相似度"],
     "EGTEA split1/0.5秒anticipation，EPIC既有train/val及1秒anticipation。",
     "增加manualhotspots；EPIC motor attention用fingertip→hotspot線性插值近似，非完整真實追蹤。",
     ["新增hotspot/trajectory標註精確ID數未報，不能把39,596全當新增標註題。"],
     "補早期joint HOI預測及標籤品質差異，保留真實/推估label來源。")

note("P060",[1,2,4,5,6],"動作與軌跡預測",["餐飲與料理","醫療支援","交通工具與維修"],
     "Ego-Exo4D的787takes，不等於787獨立場地。",
     "3D interaction location＋full-body pose聯合預測；Cooking/Health/BikeRepair三用途。",
     "233,828windows＝193,598train+20,484val+19,746test；1,594,186是有效future targets。",
     [("domain",3,"source procedural domains",[5]),("case",19746,"test forecast samples",[5]),("data",233828,"all forecast samples",[5])],
     ["continuous location errors與MPJPE/PA-MPJPE；兩種target和validity mask分開。"],["數值誤差與相似度"],
     "take-level split；三域horizon為10/5/4interaction steps，不是固定秒數。",
     "Ego-Exo4D＋FIction式事件＋WHAM重建；exoviews僅供offline labels。",
     ["take-level不自動證明不同take沒有共用實體環境；作者scene-disjoint說法需place IDs核。"],
     "擴展where-to-how預測；source-domain與camera/pose時間對應都可入共同規格。")

note("P077",[1,2,4,5,6],"模擬與真實操作benchmark",["桌面物件操作","包裝與倉儲"],
     "PyBullet Ravens UR5e桌面；3noiseless cameras融合RGB-D。",
     "10language-conditioned tasks；8有seen/unseen semantic variants。",
     "每模型/設定100evaluation runs，train 1/10/100/1000demos是規模對照。",
     [("task",10,"language-conditioned Ravens task types",[6]),("case",100,"evaluation runs per setting",[6])],
     ["Ravens 0–100partial-credit task score，不能全叫binary success rate。"],["環境狀態與過程檢查"],
     "held-out colors/object categories；56GoogleScannedObjects分37seen/19unseen。",
     "Ravens task復用並加語言；nominal SE(2) pick-place和通用6DoF policy難度不同。",
     ["真實補充任務及完整source-task對應另需原生code；本列定量限已讀sim protocol。"],
     "補語言語義的操作規格；count10tasks，不把每demo和attribute組合當新task。")

note("P088",[1,6,7],"柔性物操作benchmark",["衣物與紡織"],
     "simulation cloths與dualUR5真實工作站；NormalRect/LargeRect/Shirt三object regimes。",
     "主要1個unfolding目標；三clothtypes是材料/形狀泛化設定。",
     "2,000trainingcloth settings，600sim test cases各類200；real各類10cases，150realadapt episodes不算test。",
     [("task",1,"cloth-unfolding goal family",[6]),("case",600,"simulation test initializations",[7]),("case",30,"real test cases，3types×10",[7])],
     ["normalized final/delta coverage及actions，允許coverage>1的正規化情形不裁成success。"],["數值誤差與相似度"],
     "CLOTH3D test shirts；mesh/material/init分離，10step budget或預測抓地板終止。",
     "CLOTH3D與既有clothphysics，dataset task實為具體cloth+material+initialization。",
     ["coverage並不保證可直接摺衣；real細節與sim material參數只能作相應範圍推論。"],
     "示範同一目標可以有大量物理cases，而未增加語義task數。")

note("P089",[1,5,6,7],"柔性物操作benchmark",["衣物與紡織","洗衣服務"],
     "ABB YuMi工作站；known shirt、unseen shirt、towel。",
     "smoothing→folding，instruction/2-second/Fling-to-fold三策略並非三個生活domain。",
     "4,300action records包含1,500複製重標；每experiment15trials。",
     [("data",4300,"training action records，含重標",[6]),("case",15,"trials per experiment",[6,7])],
     ["fold由3reviewers多數決；horizon10；time成功回合平均，FPH/cycle包括失敗。"],["環境狀態與過程檢查","人類或模型判讀","數值誤差與相似度"],
     "train單shirt；towel泛化前加20smoothimages再訓練，不是完全zero-shot。",
     "前作FlingBot比較有不同hardware；1500重標非獨立physical actions。",
     ["排除motion-planning early failures會影響整體systemsuccess解讀；須在共同protocol保留此差異。"],
     "補摺衣全流程與吞吐量，不能只報93%而略過任務、排除規則和15次分母。")

note("P090",[1,2,4,5,6],"柔性物操作benchmark",["衣物與紡織","洗衣服務"],
     "CLOTH3D simulation與真實衣物工作站，5garment categories。",
     "canonicalized alignment，另支援folding/ironing；highcoverage不保證對齊。",
     "每garment category2,000train/400test settings；hard/easy train75/25、test50/50。",
     [("asset",5,"garment categories",[5]),("case",400,"unseen-mesh test settings per category",[5])],
     ["IoU/coverage及分離rigid-alignment和deformable errors；fold success為qualitatively選的error門檻。"],["數值誤差與相似度","環境狀態與過程檢查"],
     "mesh-disjoint，easy/hard是不同初態生成；eachgarmentcategory獨立policy。",
     "CLOTH3D／FlingBot資料生成構想；downstreamfoldheuristic非新end-to-end模型。",
     ["real全部trajectory分母未在已讀段報出；不可套用sim400為realcase數。"],
     "把攤平、對齊和指定摺法拆成可驗收目標，適合作為擴充規則依據。")

note("P091",[1,2,5,6],"柔性物操作benchmark",["衣物與紡織","洗衣服務"],
     "RFUniverse/ClothDynamics及雙Flexiv工作站；2garment categories。",
     "兩類衣物的unfold+fold流程；60realgarments的train/test40/20。",
     "VR1,218+1,575＝2,793videos，real2,432samples；20heldoutgarments各10trial＝200realtrials。",
     [("asset",20,"held-out real garments",[6]),("case",200,"real trials，20garments×10",[6]),("data",2793,"VR manipulation videos",[5])],
     ["IoU、normalizedcoverage，wholeflow10steps內按rules摺好。"],["數值誤差與相似度","環境狀態與過程檢查"],
     "realgarments2:1，simCLOTH3D9:1；onlinehumanpreference作訓練，不當test免介入證據。",
     "CLOTH3D、ClothFunnels目的函數及VR-human demonstrations。",
     ["機器人reach/grasp自動recovery和policyactionbudget的共同計數需要adapter明定。"],
     "可取shirt具體fold規則和材料差異，human annotations與robotepisodes分开。")

note("P110",[1,2,4,5,6,7,8],"錯誤辨識與程序恢復",["桌面物件操作","居家生活"],
     "RLBench、ManiSkill與realRoboFail；非新增三套物理環境。",
     "7failure modes的Yes/No判斷＋原因解釋；識別失敗不等同真正恢復。",
     "49KtrainingfailureQA；test11K（10未見RLBench tasks），ManiSkill-Fail130pairs（4tasks），realRoboFail7tasks。",
     [("task",7,"failure modes",[5]),("case",11000,"held-out RLBench failure QA（約數）",[8]),("case",130,"ManiSkill-Fail pairs",[8]),("data",49000,"failure training pairs（約數）",[5])],
     ["binary success labelaccuracy、ROUGE-L、cosinesimilarity、LLM fuzzy match。"],["答案或標籤比對","數值誤差與相似度","人類或模型判讀"],
     "RLBench train/test taskdisjoint，跨sim與real另測；額外VQA/LVIS訓練資料不可算failurecases。",
     "FailGen改keyframes/gripper動作合成失敗；RoboFail重用。",
     ["keyframe產生failurelabels是生成機制標籤，和視覺可觀測真因未必完全相同。"],
     "可大量增加失敗規則cases，同時用跨來源/真實子集驗證而不冒稱新增語義工作。")

note("P125",[1,2,3,4,6],"跨資料集整合與評測方法",["居家生活","餐飲與料理","工具使用","桌面物件操作"],
     "60來源datasets、22embodiments；場所數由各dataset metadata而來，非60新環境。",
     "結論報527skills／160,266tasks；方法用語言抽取skills，不能直接當160,266正規化goal definitions。",
     "1M+robottrajectories；主RT-X混合只選9manipulators，非全22都等量實測。",
     [("data",60,"pooled source datasets（本PDF版本）",[3]),("asset",22,"robot embodiments",[3]),("task",527,"作者報告skills",[6]),("task",160266,"作者報告tasks，語言語義去重待核",[6])],
     ["跨robot實機tasksuccess、OOD／emergent skills與移除Bridge對照。"],["環境狀態與過程檢查"],
     "不同experiment的hosttask/robot子集不同；dataset-wide規模與policy實測範圍分開。",
     "整合既有datasets到RLDS；不統一所有action坐標，absolute/relative/velocity仍可能不同。",
     ["160,266的逐task IDs與同義/粒度規則未在已讀段完備；21institutions／34labs的口徑也需保留。"],
     "all-in-one最重要對照之一：我們不能以合併資料夾或粗7Dactionformat宣稱首次通用benchmark。")

note("P126",[1,2,3,7],"真實操作benchmark",["居家生活","餐飲與料理","辦公活動"],
     "564workspace scenes分52buildings；換物件擺位不增加scene。",
     "86是unique verb/task口徑；下游主實驗6tasks/4locations，不是全86實測。",
     "76Kdemonstrations/350h；6task各50–150in-domain demos，混合DROID訓練。",
     [("environment",564,"unique robot workspaces",[3]),("environment",52,"buildings",[3]),("task",86,"verb-based task labels",[3]),("task",6,"downstream evaluation tasks",[7]),("data",76000,"robot demonstration trajectories（約數）",[3])],
     ["ID/OOD task success；nativepolicyrollouts分母需appendix/manifest另核。"],["環境狀態與過程檢查"],
     "主task各有distractor/novelobject/cameravariation；不是564場所全部held-out驗證。",
     "新distributedcapture；DROID表I與RH20T用unique multi-view trajectory重算，不能代替RH20T原作報告數。",
     ["18researchlabs/13institutions/18robots是不同口徑；主規模不能稱86完整獨立工作流程。"],
     "提供workspaces與objectrandomization的清楚環境定義；大資料與小評測子集須並列。")

note("P127",[1,3,4,5,6],"真實操作benchmark",["居家生活","餐飲與料理","衣物與紡織","表面清潔"],
     "24environments，含7toy kitchens及tabletops/sinks/laundrysetups，4環境類別。",
     "13skills；同skill換object可成不同原作task，未報全庫正規化task總數。",
     "60,096trajectories＝50,365expert+9,731scripted；主task每method10trials。",
     [("environment",24,"source environments",[5]),("task",13,"skills",[5]),("data",60096,"expert+scripted trajectories",[5]),("case",10,"real trials per method/task",[6])],
     ["tasksuccess；goalimage與languageconditions分別比較。"],["環境狀態與過程檢查"],
     "seen/unseenobject/environment/otherinstitution；RT1input解析度與history較大須註記。",
     "BridgeData原版擴充，後被OXE/OpenVLA/Octo重用。",
     ["13skill不是13全部task；不同原作method觀測預算未完全一致。"],
     "補家電、表面、衣物與顆粒工具操作；保留human/scripteddemo品質類型。")

note("P128",[1,3,4,5,6],"跨資料集整合與評測方法",["桌面物件操作"],
     "4lab environments、113camera configurations、7arenatypes等不同環境層級。",
     "主要objectrelocation，可用推或抓放；manyrobots不增加相同數量goal families。",
     "15Mframes、約162Ktrajectories；7platforms，Table1caption稱6arms有文字差異。",
     [("environment",4,"lab environments",[5]),("environment",113,"camera configurations",[5]),("data",15000000,"video frames（約數）",[1])],
     ["endgoal distance與operator判斷是否覆蓋goal；作者明言不同experiments不可直接比難度。"],["數值誤差與相似度","人類或模型判讀"],
     "held-out robot或view再fine-tune300–400targettrajectories；不叫完全zero-shotrobottransfer。",
     "多institution資料與existingrobotcorpora整合；同物理trajectory可能多view。",
     ["release-version軌跡精確數及scene去重待manifest；不從15Mframes推testcases。"],
     "重要早期整合前作；以哪種目標、哪種資訊與哪個分母比較，比合併大小更關鍵。")

note("P186",[1,3,4],"柔性物操作benchmark",["衣物與紡織"],
     "VR-Folding/CLOTH3D重渲染，SoftGym；真實RGB-D衣物觀測。",
     "language-guided single/bimanual folding；新方向/位置規則与instructionparaphrase分開。",
     "近4KVRdemos分成約7Kactions、>1Kunique prompts；90/10sample split。",
     [("data",7000,"parsed bimanual folding actions（約數）",[3]),("data",1000,"unique prompts（>1K）",[3])],
     ["singlearm以meanvertexerror<0.0125m判success；bimanual另用image metrics，不默認相同判分。"],["數值誤差與相似度","環境狀態與過程檢查"],
     "先flattenedcloth；H=3history支援指令歧義，未證明所有sample分割已按parenttrajectory群聚。",
     "VR-Folding既有demos＋CLOTH3Dtextures、新增語言與actionparsing；不是全部新physical demonstrations。",
     ["部分只有真實影像推action展示，完整realautonomous成績分母需原始實驗核。"],
     "補指定摺法、手別與歷史依賴；語言改寫不自動算新task。")

note("P188",[1,4,5,6],"柔性物操作benchmark",["衣物與紡織"],
     "RealAdapt Towels改SoftGym grasp近似；Franka與UR3e對照，camera/gripper差異顯式處理。",
     "flattening及3種foldpatterns：allcornersinward、corners-edgeinward、diagonal-cross。",
     "flatteningtrain2Ktrajectories，foldtrain1K；UR3eablation每setting10trials。",
     [("task",3,"fold pattern definitions",[5,6]),("case",10,"UR3e ablation trials per setting",[6])],
     ["realflattening NC>95%且20steps內；simulation>99%/30steps；fold用IoU/proxy並承認自遮擋限制。"],["數值誤差與相似度","環境狀態與過程檢查"],
     "materials/size/camera/platform泛化；各policy保持相近trainingbudget，非直接沿用原bestscore。",
     "既有四controller在共同deploymentframework；RealAdapt是grasping/physics規則衍生環境。",
     ["real與sim門檻不同不能混算同一SR；多層抓取和tweezerhardware要入taskinterface。"],
     "這類工作正是all-in-one需借鑑的共同執行/判分控制，而非只搬tasknames。")

note("P191",[1,2,4,6,7,8],"柔性物資料與感知評測",["衣物與紡織"],
     "約4,400garment meshes/11categories；ClothesNetM3,051可用subset，mesh不是環境。",
     "分類、boundarysegmentation、keypoints三感知端點；simfold直接控制vertices，dressing/hanging多為可支援用途。",
     "3Dclassification1,984train/496testmeshes；2D2,455meshes渲染9,820images再80/20。",
     [("asset",4400,"garment meshes（約數）",[4]),("asset",3051,"ClothesNetM meshes",[4]),("case",496,"3D classification test meshes",[6]),("task",3,"clothes-understanding endpoints",[6])],
     ["classificationaccuracy、segmentationmIoU、keypoint品質；simfoldnegativevertexdistance，非完整robotgraspcontrol。"],["答案或標籤比對","數值誤差與相似度"],
     "2D按images切80/20，未在已讀段保證same-mesh views不跨split；3D子集量和3051全集不同。",
     "CGTrader等mesh整理，後被RGBench/GarmentLab等重用。",
     ["資產種類不等於全部執行任務已驗證；不能把4400meshes稱4400robotcases。"],
     "補garment資產/語义標籤，清楚區分perceptionvalidation與可交互環境。")

note("P193",[1,3,4,5,6],"柔性物與抓取benchmark",["桌面物件操作","易損物品處理"],
     "IPC平行physics；UMIsoftgripper/LEAHand；800singleobjects，800bimanual含400重用，union1200。",
     "grasp synthesis/validation與stressprediction；single/bimanual不同graspconditions。",
     "100,000grasp poses（概要）；stresssubset8bowls+8mugs，每類6train/2test；非100K不同tasks。",
     [("asset",1200,"unique selected objects，800+800−400",[1,4]),("data",100000,"grasp poses（概要數）",[1]),("case",4,"stressprediction held-out objects",[6])],
     ["sixdirectiongravity穩定抓持、penetration/absolutecontactdistance、stressrelativeMAE/KL；simulationfidelityrealcheck只4objects。"],["環境狀態與過程檢查","數值誤差與相似度"],
     "DexGraspNet/PartNetassets重用；stress按object切，graspwholepool分割另需release核。",
     "固定物件union和多gripper/material/randomizedpose；全量物件與real2sim4個子集分開。",
     ["50N停止closure和gravity0.1秒/方向是本protocol，不能當通用安全標準。"],
     "可補接觸穩定性與材料保護規則；candidatepose生成和有效評測case分開。")


if __name__ == "__main__":
    (ROOT / "content/fulltext_review/batch18.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2) + "\n")
    print(f"Serialized {len(rows)} authored additional-source reviews.")
