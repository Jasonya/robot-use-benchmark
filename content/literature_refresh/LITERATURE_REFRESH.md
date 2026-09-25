# 文獻更新、分類分布與檢索界線

截止日：2026-09-25。原168篇快照保留；新增82篇原始來源書目與完整摘要審閱，合計250篇書目紀錄。這不是已找齊全部文獻或逐篇完整全文深讀的聲明。

## 檢索與篩選

20組arXiv查詢涵蓋一般操作、人類影片轉移、Ego預測、身體相機、柔性物、導航、協作、恢復、世界模型、記憶與專業實驗室。每查詢最多讀前50筆，合計853次命中、700個不同arXiv ID；未完成所有分頁。VLOG組合查詢無回傳，原VLOG／教學影片文獻仍由原書目保存，不能解讀為該領域沒有研究。

在700候選中，24筆原已收錄；82筆新納入並讀過完整摘要；5筆明確排除、1筆較早關聯版本另連結，其餘588筆尚未完成納入審阅。前後向引用與非arXiv資料庫尚待補齊，故不使用PRISMA完整系統性回顧或『所有論文』的說法。

書目欄位以原始abs頁核對，保存回應hash及日期；公開提供標題、作者、來源和本計畫撰寫的用途／界線筆記，不以搜尋命中自動升成已審阅文獻。

## 此書目中的主要類別分布

| 類別 | 篇數 | 比例 |
|---|---:|---:|
| 人類影片與動作資料 | 31 | 12.4% |
| 理解、推理與規劃 | 26 | 10.4% |
| 未來動作／互動預測 | 51 | 20.4% |
| 一般操作 benchmark | 31 | 12.4% |
| 布料／柔性物操作 | 26 | 10.4% |
| 導航與家務執行 | 12 | 4.8% |
| 穩健性、失敗與評測品質 | 18 | 7.2% |
| 人類觀測到機器人轉移 | 11 | 4.4% |
| 機器人資料與通用策略 | 16 | 6.4% |
| 輔助與協作 | 11 | 4.4% |
| 世界模型與預測表示 | 8 | 3.2% |
| Survey／評測方法 | 9 | 3.6% |

每篇只有一個主要文獻分類以便描述分布，次要標籤可以重疊。這些比例不是領域需求、資料獨立性或任務配額；例如預測論文51篇，不代表已有51種可執行工作。

## Ego／未來預測進一步拆分

先區分人類相機 wearer、robot camera 和外部影片；再區分已發生動作的早期辨識、下一動作、長期動作序列、密集時間線、下一物件／接觸時間、手姿／軌跡／接觸點、全身／頭部／移動／凝視，以及未來影像／latent與任務結果。預測人的實際未來（T3）與提出應該做的計畫（T4）保持分開。

報告每組的觀測前綴、預測時間、輸入資訊、答案型態和評測量：classification或edit distance、定位／TTC、ADE／FDE／MPJPE、接觸／分布誤差、影像或latent品質。不能把這些分数平均成同一個robot成功率。

新增文獻的forecast_target是非互斥標籤，目前未重新逐篇標註原168篇的所有次標籤，不能把此表誤認全250篇的完整多標籤分布。

| 新增紀錄的預測目標 | 篇數（可重疊） |
|---|---:|
| action_label | 2 |
| action_sequence | 8 |
| body_motion | 3 |
| contact_location | 2 |
| contact_state | 1 |
| dense_action_timeline | 3 |
| early_recognition | 1 |
| gaze_visual_span | 1 |
| hand_object_motion | 1 |
| hand_pose | 7 |
| hand_trajectory | 8 |
| head_motion | 2 |
| intention | 3 |
| interaction_mode | 1 |
| interaction_onset | 1 |
| next_object | 6 |
| outcome | 1 |
| summary | 1 |
| time_to_contact | 6 |
| uncertainty | 1 |
| wearer_trajectory | 1 |

## 會改變benchmark設計的發現

- X2Real、Bench2Dex與MotionForge已提供多能力、跨靈巧手及動態長流程評測；統一接口或列出更多能力標籤不是足够的增量。
- RoboRecover已有2,000個跨來源恢復情境；REBOOT、SafeManip與SoftVTBench要求階段、時序或物理互動量測。恢復情境數和原任務數應分欄。
- LabUtopia、LabDex、Labimus與Pipette顯示專業實驗室已有多個直接對照；新增場域需由真正的程序、量測和必要物理支撑。
- EgoSim補上身體不同佩戴位置；HUI360是機器人360視角；OpenEgo是既有來源整合。人類／robot、相機位置、剪輯方式和來源聯集必須分欄。
- EgoSAT、EGOSTREAM、S-EMBER和EgoMonth已有串流、答案有效時間與長期歷史；我們須證明相關資訊如何改變可執行目標及動作結果。
- 手部／頭部／全身預測已與下游操作逐步結合；人類姿態精確並不自動保證robot控制有效。需要相同資料與控制約定下的轉移和執行消融。

## 版本與來源相依

- STAformer / AFF-ttention：Two paper records, one related method family; no claim of independent data corpora.
- SoftVTBench：Only the later dataset/benchmark record is newly included; the early preprint remains a linked discovery.
- Ego4D / EgoSchema / FROST-STA / VISTA / I-CVAE / BiAnt：Benchmarks/methods share source footage; their paper counts and question counts do not imply disjoint human data.
- Ego-Exo4D / UniEgoMotion / EgoH4 / EggHand / EgoCast：Derived motion/prediction labels remain linked to the original recording sessions.
- OpenEgo / six source datasets：1,107 hours is a harmonized resource, not an additional independent union beyond its parents.
- COIN instructional-video dataset / COIN interactive reasoning benchmark：Different works and endpoints; keep URLs, years and names.
- H2R-Bench world-model evaluation / H2RBench human-to-robot transfer：Different papers and protocols; neither is an alias for the other.

## 新增82篇逐筆筆記與原始來源

### P169 · X2Real（2026）

X2Real: an eXtensive simulation benchmark for real-world generalist policies

44個長流程操作任務、10能力維度及sim-to-real評測；能力維度不是應用場域，手臂與訓練資訊約定須分層。

分類：一般操作 benchmark。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.27449](https://arxiv.org/abs/2609.27449)

### P170 · MotionForge（2026）

MotionForge: A Data Generation Pipeline and Large-Scale Benchmark for Long-Horizon Manipulation of Dynamic Objects with Domain Shifts

40個動態互動任務，含17個長流程任務；環境隨推論時間持續演化，提示我們須量測延遲而非暫停世界等答案。

分類：一般操作 benchmark。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.25689](https://arxiv.org/abs/2609.25689)

### P171 · Bench2Dex（2026）

Bench2Dex: Benchmarking Visuo-Tactile Bimanual Dexterous Manipulation Across Dexterous Hands

26項雙手操作跨12種靈巧手，提供共用接觸影像介面；模擬觸覺不等同特定實體感測器。

分類：一般操作 benchmark。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.15726](https://arxiv.org/abs/2609.15726)

### P172 · LabUtopia（2025）

LabUtopia: High-Fidelity Simulation and Hierarchical Benchmark for Scientific Embodied Agents

30項科學實驗室任務，含五層複雜度與200多項場景／儀器資產；化學或多物理主張要再核對具體實作。

分類：一般操作 benchmark。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2505.22634](https://arxiv.org/abs/2505.22634)

### P173 · LabDex（2026）

LabDex: A Hierarchical Benchmark for Dexterous Manipulation in Laboratories

把實驗室靈巧操作分為原子技能、組合技能、完整實驗；真實與模擬共用框架，摘要沒有可歸一的總題數。

分類：一般操作 benchmark。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2608.18618](https://arxiv.org/abs/2608.18618)

### P174 · Labimus（2026）

Labimus: A Simulation and Benchmark for Humanoid Dexterous Manipulation in Chemical Laboratory

人形靈巧實驗室操作，六項原子操作及七步秤重流程；顆粒、儀器讀值與量測誤差不能只用終態成功替代。

分類：一般操作 benchmark。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2606.31037](https://arxiv.org/abs/2606.31037)

### P175 · Pipette（2026）

Pipette: An Embodied Simulation Platform, Benchmark, and Data-Efficient Augmentation Framework for Wet-Lab Robotics

12項wet-lab任務、三種手臂及100多件可編輯資產；示範增強產物與新的任務種類分開計數。

分類：一般操作 benchmark。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2606.12936](https://arxiv.org/abs/2606.12936)

### P176 · AutoBio（2025）

AutoBio: A Simulation and Benchmark for Robotic Automation in Digital Biology Laboratory

生物實驗室的精密、視覺和程序操作；原比較表已有16項全庫與9項受測子集，本次補入統一書目。

分類：一般操作 benchmark。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2505.14030](https://arxiv.org/abs/2505.14030)

### P177 · H2RBench（human transfer）（2026）

H2RBench: A Real-to-Sim Benchmark for Evaluating Human-to-Robot Transfer

四項Real2Sim人類到機器人轉移任務，控制人類示範量与robot監督；與世界模型文獻H2R-Bench為不同工作。

分類：人類觀測到機器人轉移。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.24778](https://arxiv.org/abs/2609.24778)

### P178 · RoboRecover（2026）

RoboRecover: Benchmarking Robot Policy Recovery under Execution Deviations

RoboTwin與LIBERO各1,000個恢復情境，各用800／200切分；動作前綴重播重建偏離狀態，不是2,000種新工作。

分類：穩健性、失敗與評測品質。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.28952](https://arxiv.org/abs/2609.28952)

### P179 · REBOOT（2026）

REBOOT: From Failure to Recovery - A Dataset and Benchmark for Precision Assembly

18項精密装配及2,160份示範，把取件／運送／裝入分成五階段；成敗與專家恢復軌跡均保留，示範不當題型。

分類：穩健性、失敗與評測品質。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.22591](https://arxiv.org/abs/2609.22591)

### P180 · SafeManip（2026）

SafeManip: A Property-Driven Benchmark for Temporal Safety Evaluation in Robotic Manipulation

在50項RoboCasa365任務上用八類LTLf性質檢查完整過程；這是可重用評測層，不新增50個獨立任務。

分類：穩健性、失敗與評測品質。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2605.12386](https://arxiv.org/abs/2605.12386)

### P181 · RoboFolDeX（2026）

RoboFolDeX: A Physical-World Benchmark for Long-Horizon Robotic Manipulation of Deformable Objects

以真實衣物摺疊為主，報告2,000多小時、20多項任務與10多種機體；資料全庫與外部提交的實際評測集合分開。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.10243](https://arxiv.org/abs/2609.10243)

### P182 · SoftVTBench（2026）

SoftVTBench: A Deformation-Aware Visuo-Tactile Dataset and Benchmark for Deformable-Object Manipulation

4,000專家示範、50多件柔性與剛性對照資產，分開公開觸覺和evaluator-only FEM狀態；以形變限制後的成功評測。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2608.18701](https://arxiv.org/abs/2608.18701)

### P183 · WireCraft（2026）

WireCraft: A Simulation Benchmark for Industrial DLO Manipulation

工業線材的接頭插入、卡扣佈線與槽內安置三家族；關節鏈與連續柔性模型分開，原文說明程式待接受後釋出。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2606.18097](https://arxiv.org/abs/2606.18097)

### P184 · DLO-Lab（2026）

DLO-Lab: Benchmarking Deformable Linear Object Manipulations with Differentiable Physics

可微線材模擬涵蓋伸長、彈性、彎曲塑性與拓撲困難；可借鑑抓點／材料設計，摘要不足以確定總任務數。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2606.04206](https://arxiv.org/abs/2606.04206)

### P185 · RGBench（2025）

Real Garment Benchmark (RGBench): A Comprehensive Benchmark for Robotic Garment Manipulation featuring a High-Fidelity Scalable Simulator

6,000多衣物mesh與真實衣物動態的模擬品質評測；資產規模與完成操作的任務數是不同軸。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2511.06434](https://arxiv.org/abs/2511.06434)

### P186 · BiFold（2025）

BiFold: Bimanual Cloth Folding with Language Guidance

用文字條件產生雙手摺衣動作，另提供語言與動作配對資料；指令、衣物與環境泛化要各自切分。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2501.16458](https://arxiv.org/abs/2501.16458)

### P187 · SSFold（2024）

SSFold: Learning to Fold Arbitrary Crumpled Cloth Using Graph Dynamics from Human Demonstration

從皺褶布料到四種目標摺形，結合可見圖結構與人類示範；將整理和摺疊一起驗證，而非只從平布開始。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2411.02608](https://arxiv.org/abs/2411.02608)

### P188 · DRAPER（2024）

DRAPER: Towards a Robust Robot Deployment and Reliable Evaluation for Quasi-Static Pick-and-Place Cloth-Shaping Neural Controllers

比較布料控制器時處理誤抓與多層抓取，控制實體設定及感知差異；提供判分與跨平台可比性的直接設計依據。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2409.15159](https://arxiv.org/abs/2409.15159)

### P189 · GPT-Fabric（2024）

GPT-Fabric: Smoothing and Folding Fabric by Leveraging Pre-Trained Foundation Models

以既有模型決定抓取與拉動來整平／摺布，另做少量實體rollout；rollout數不可當新任務種類。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2406.09640](https://arxiv.org/abs/2406.09640)

### P190 · UniGarmentManip（2024）

UniGarmentManip: A Unified Framework for Category-Level Garment Manipulation via Dense Visual Correspondence

用類別內密集對應支援展開、摺疊、懸掛，涵蓋三類衣物和三代表任務；對應與控制成功需分項評估。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2405.06903](https://arxiv.org/abs/2405.06903)

### P191 · ClothesNet（2023）

ClothesNet: An Information-Rich 3D Garment Model Repository with Simulated Clothes Environment

約4,400衣物模型、11類與邊界／關鍵點標註，另提供整理、摺疊、懸掛和穿戴環境；mesh數不能等同操作題數。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2308.09987](https://arxiv.org/abs/2308.09987)

### P192 · Phys-Liquid（2025）

Phys-Liquid: A Physics-Informed Dataset for Estimating 3D Geometry and Volume of Transparent Deformable Liquids

97,200模擬影像和3D液體mesh用於形狀／體積估計；主要評測是感知，不能據此宣稱完整倒液控制。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2511.11077](https://arxiv.org/abs/2511.11077)

### P193 · GRIP（2025）

GRIP: A General Robotic Incremental Potential Contact Simulation Dataset for Unified Deformable-Rigid Coupled Grasping

1,200物件與100,000抓取姿態的軟硬耦合IPC資料；抓姿、物件與完整工作任務分別計數。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2503.05020](https://arxiv.org/abs/2503.05020)

### P194 · Cloth gripper interface（2026）

A Simple Gripper Interface for Simulator-Agnostic Cloth Manipulation

以位置約束近似布料抓取，可跨模擬器實作；省略夾爪摩擦接觸，適合作為有明確保真邊界的接口對照。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.29340](https://arxiv.org/abs/2609.29340)

### P195 · World models for unfolding（2026）

Learning to unfold cloth: Scaling up world models to deformable object manipulation

修改DreamerV2並使用表面法線做空中展布，含模擬與實體轉移；世界模型價值應透過真實操作結果檢驗。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2602.16675](https://arxiv.org/abs/2602.16675)

### P196 · Deform360（2026）

Deform360: A Massive Multi-view Visuotactile Dataset for Deformable World Models

198物件、1,980互動序列、41相機及雙手觸覺觀測，用於2D／3D動態模型比較；資料時數不直接當控制題數。

分類：布料／柔性物操作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2607.05390](https://arxiv.org/abs/2607.05390)

### P197 · EgoSim / MultiEgoView（2025）

EgoSim: An Egocentric Multi-view Simulator and Real Dataset for Body-worn Cameras during Motion and Activity

六個身體佩戴位置的相機，119小時合成與5小時真實資料；人體／相機合成影片不能標成真人原始錄製。

分類：人類影片與動作資料。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2502.18373](https://arxiv.org/abs/2502.18373)

### P198 · TACO（2024）

TACO: Benchmarking Generalizable Bimanual Tool-ACtion-Object Understanding

約2,500雙手工具—動作—物件序列，含ego/exo與3D標註；識別、動作預測及合作抓取生成不等於機器人完成率。

分類：人類影片與動作資料。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2401.08399](https://arxiv.org/abs/2401.08399)

### P199 · OpenEgo（2025）

OpenEgo: A Large-Scale Multimodal Egocentric Dataset for Dexterous Manipulation

整合六個既有來源，報告1,107小時與290種人類操作活動；其來源相依、姿態及語言標準化需保留，不能重複累加原集。

分類：人類影片與動作資料。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2509.05513](https://arxiv.org/abs/2509.05513)

### P200 · SABER（2026）

SABER: A Scalable Action-Based Embodied Dataset for Real-World VLA Adaptation

商店頭戴與外部360影片形成三種動作表示，共44.8K訓練樣本；同一錄製的不同表示不是獨立人類經驗。

分類：人類影片與動作資料。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2605.09613](https://arxiv.org/abs/2605.09613)

### P201 · EgoSAT（2026）

EgoSAT: A Comprehensive Benchmark of Egocentric Streaming Interaction Understanding

以串流方式整合過去、現在與未來QA，約4,800題／1,997影片；只允許已觀測前綴並區分可回答性。

分類：理解、推理與規劃。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2606.24422](https://arxiv.org/abs/2606.24422)

### P202 · EgoMonth（2026）

EgoMonth: A Month-Level Egocentric Video Benchmark for Long-Term Spatiotemporal Memory

20位參與者跨20–120天，300多小時與1,443題；14種認知題型不是14種可執行物理工作。

分類：理解、推理與規劃。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2608.13113](https://arxiv.org/abs/2608.13113)

### P203 · EGOSTREAM（2026）

EGOSTREAM: A Diagnostic Benchmark for Streaming Episodic Memory in Egocentric Vision

2,250問題展成8,528個不同召回時間評測；答案有效時間窗把模型遺忘與世界本身變化分開。

分類：理解、推理與規劃。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2605.31557](https://arxiv.org/abs/2605.31557)

### P204 · S-EMBER（2026）

S-EMBER: A Large-Scale Benchmark for Streaming Egocentric Memory Retrieval

388小時、3,141個智慧眼鏡影片與9,448個具時間證據QA；因果串流檢索與離線任意看未來不同。

分類：理解、推理與規劃。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2607.02689](https://arxiv.org/abs/2607.02689)

### P205 · CapMem（2026）

CapMem: A Benchmark for Caption-Based Episodic Memory in Egocentric Video

75影片、33.7小時與1,000題，檢查文字caption記憶；比較時須對齊影格預算和實際影片涵蓋量。

分類：理解、推理與規劃。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.17688](https://arxiv.org/abs/2609.17688)

### P206 · EmbodiedMemory-Bench（2026）

EmbodiedMemory-Bench: Benchmarking Embodied Memory for Long-Horizon Embodied Tasks

2,554互動episodes、四記憶家族，先互動建立記憶再用行動完成後續任務；摘要不足以推定連續機器人控制保真度。

分類：理解、推理與規劃。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.28236](https://arxiv.org/abs/2609.28236)

### P207 · EgoCoT-Bench（2026）

EgoCoT-Bench: Benchmarking Grounded and Verifiable Operation-Centric Chain of Thought Reasoning for MLLMs

351影片及3,172個可核對QA，檢查答案與時空證據一致性；對應我們的可公開理由／證據，不要求模型私有思考。

分類：理解、推理與規劃。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2605.19559](https://arxiv.org/abs/2605.19559)

### P208 · DYAD（2026）

DYAD: A Multimodal Dataset of Co-Located Human Assistance

20個齒輪箱裝配合作session，連結請求、介入、動作階段與結果；人類協助資料不等於已控制機器人完成合作。

分類：輔助與協作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.09023](https://arxiv.org/abs/2609.09023)

### P209 · HUI360（2026）

HUI360: A 360{\deg} Egocentric Dataset and Baselines for Human-Robot Interaction Anticipation

移動機器人視角的360互動預測與百萬級標註；這是robot-egocentric，不能歸成人類頭戴資料。

分類：輔助與協作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2608.11051](https://arxiv.org/abs/2608.11051)

### P210 · RoCo Challenge（2026）

RoCo Challenge at AAAI 2026: Benchmarking Robotic Collaborative Manipulation for Assembly Towards Industrial Automation

行星齒輪箱裝配的模擬／實體雙臂挑戰與分階段評分；組件數和參賽隊數不當作任務種類。

分類：輔助與協作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2603.15469](https://arxiv.org/abs/2603.15469)

### P211 · AssemblyGrid（2026）

AssemblyGrid v1: A Benchmark for Multi-Robot Production with Temporary Coalitions, Local Information, and Geometric Constraints

生產流程、短期多robot合作、局部資訊和幾何可行性，三工作負載家族各三情境層；屬任務級抽象，不預設連續接觸物理。

分類：輔助與協作。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.16075](https://arxiv.org/abs/2609.16075)

### P212 · ARB4WM（2026）

ARB4WM: An Adversarial Robustness Benchmark for World Models in Continuous Control

四個Dreamer類agent、20個既有控制任務，比較不同世界模型內部與時間位置的視覺擾動；不是新建20個任務。

分類：世界模型與預測表示。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2606.16605](https://arxiv.org/abs/2606.16605)

### P213 · Vision to Harvest（2026）

From Vision to Harvest: Benchmarking Vision-Language Models for Multi-Arm Robotic Fruit Harvesting

真實果園影像上的多臂採收次序／waypoint與碰撞驗證；規劃可行不等同實際採果的物理完成。

分類：導航與家務執行。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.13606](https://arxiv.org/abs/2609.13606)

### P214 · COIN（interactive）（2026）

Chain Of Interaction Benchmark (COIN): When Reasoning meets Embodied Interaction

50個因果互動任務，另列primitive和composition集合；與教學影片COIN資料集是同名不同作。

分類：導航與家務執行。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2604.16886](https://arxiv.org/abs/2604.16886)

### P215 · World-model evaluation survey（2026）

Do World Models Make Better Robots? A Survey of Evaluation Benchmarks for Predictive Embodied Intelligence

整理策略、embodied agent、世界模型及prediction-to-action的評測關係；其160項自報盤點作引用追查入口，不直接合併本庫。

分類：Survey／評測方法。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.29669](https://arxiv.org/abs/2609.29669)

### P216 · HAP（2026）

HAP: A Hand-Driven Active Perception Framework for Egocentric Head Motion Prediction

根據手部、頭部歷史與遮擋關係預測未來6DoF頭部運動，另引入Bottle資料；預測人的視角與控制機器人主動看是不同端點。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.18548](https://arxiv.org/abs/2609.18548)

### P217 · TRS + RVG（2026）

Reliable Egocentric Action Anticipation via Temporal Reliability Suppression and Compositional Graph Decoding

在缺幀、遮罩與感測雜訊下做動作預測，以時序可靠度及verb–noun圖解碼；需保留訓練擾動與真正未見擾動邊界。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2609.13293](https://arxiv.org/abs/2609.13293)

### P218 · TrajPilot（2026）

How You Move Tells What You'll Do: Trajectory-Conditioned Egocentric Prediction

用候選未來相機路徑輔助動作與程序預測；已知未來路徑是oracle條件，必須與測試時自行預測路徑分層。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2605.20388](https://arxiv.org/abs/2605.20388)

### P219 · FROST-STA（2026）

FROST-STA: Frozen Dense Features for the Ego4D Short-Term Object Interaction Anticipation

預測下一互動的物件框、noun、verb、接觸時間與信心，使用固定V-JEPA特徵；是Ego4D挑戰方法，不新增獨立來源資料庫。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2606.00694](https://arxiv.org/abs/2606.00694)

### P220 · VISTA（Ego4D STA）（2026）

VISTA: Technical Report for the Ego4D Short-Term Object Interaction Anticipation at EgoVis 2026

融合單張物件定位與短影片特徵，輸出下一物件、動作與接觸時間；與StillFast／Ego4D保留來源相依。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2605.20901](https://arxiv.org/abs/2605.20901)

### P221 · STAformer++（2026）

Integrating Affordances and Attention models for Short-Term Object Interaction Anticipation

結合環境affordance記憶及手物hotspot做短期互動預測；與2024 AFF-ttention同方法家族，不能當獨立資料來源。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2602.14837](https://arxiv.org/abs/2602.14837)

### P222 · Uni-Hand（2025）

Uni-Hand: Universal Hand Motion Forecasting in Egocentric Views

同時處理2D／3D手部、頭部及接觸狀態預測，並驗證下游robot轉移；人體表示和robot動作約定仍須明列。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2511.12878](https://arxiv.org/abs/2511.12878)

### P223 · INSIGHT（2025）

Intention-Guided Cognitive Reasoning for Egocentric Long-Term Action Anticipation

手物互動與verb–noun結構支援意圖條件的長期動作預測；意圖推斷準確率和真正未来序列誤差分開。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2508.01742](https://arxiv.org/abs/2508.01742)

### P224 · EMPIRE（2026）

EMPIRE: Explicit Manipulation Planning as a Learnable Intermediate Representation for Egocentric Hand-Motion Forecasting

把操作計畫作為中介表徵，再預測雙手動作；650,910訓練視窗和111項原生活動不可混為同一粒度。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2608.22449](https://arxiv.org/abs/2608.22449)

### P225 · Exo2EgoPose（2026）

Exo2EgoPose: Leveraging Exocentric Demonstrations for Vision-Language guided Egocentric 3D Hand Pose Forecasting

用配對外部影片監督Ego手姿預測，並檢查CALVIN下游轉移；訓練時有exo與推論時有exo要分清。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2607.15890](https://arxiv.org/abs/2607.15890)

### P226 · EgoTraj（2026）

EgoTraj: Real-World Egocentric Human Trajectory Dataset for Multimodal Prediction

75段城市穿行序列含頭部6DoF、凝視與場景；評估人的移動軌跡，不等於robot自主導航benchmark。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2605.19004](https://arxiv.org/abs/2605.19004)

### P227 · EggHand（2026）

EggHand: A Multimodal Foundation Model for Egocentric Hand Pose Forecasting

以視覺語言及動作解碼器預測未來3D手姿，測ego-motion與文字控制；不能將準確的人手預測自動當robot成功。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2605.07642](https://arxiv.org/abs/2605.07642)

### P228 · SFHand / EgoHaFL（2025）

SFHand: Learning Embodied Manipulation by Streaming Egocentric 3D Hand Forecasting

串流文字條件下預測手別、框、3D姿态和軌跡，另測下游操作表示；串流前綴、延遲和memory budget需固定。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2511.18127](https://arxiv.org/abs/2511.18127)

### P229 · UniEgoMotion（2025）

UniEgoMotion: A Unified Model for Egocentric Motion Reconstruction, Forecasting, and Generation

同一模型做人體重建、預測與生成；EgoExo4D衍生3D標註是pseudo ground truth，三種端點分開。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2508.01126](https://arxiv.org/abs/2508.01126)

### P230 · EgoH4（2025）

The Invisible EgoHand: 3D Hand Forecasting through EgoBody Pose Estimation

預測可見與視野外雙手的3D軌跡和姿態，利用全身限制；需分可見性、真值人體姿態與自行估計条件。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2504.08654](https://arxiv.org/abs/2504.08654)

### P231 · MADiff（2024）

MADiff: Motion-Aware Mamba Diffusion Models for Hand Trajectory Prediction on Egocentric Videos

用相機運動條件的Mamba diffusion預測手部路徑；包含延遲和不同資料集評測，手路徑不是完整操作計畫。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2409.02638](https://arxiv.org/abs/2409.02638)

### P232 · Diff-IP2D（2024）

Diff-IP2D: Diffusion-Based Hand-Object Interaction Prediction on Egocentric Videos

聯合生成未來2D手路徑和物件affordance，考慮相機動態；2D預測不自動具有3D可執行性。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2405.04370](https://arxiv.org/abs/2405.04370)

### P233 · OCT / HOI forecasting（2022）

Joint Hand Motion and Interaction Hotspots Prediction from Egocentric Videos

聯合預測手軌跡和下一物件的接觸hotspot，使用分布表示多種未來；資料來自既有Ego影片。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2204.01696](https://arxiv.org/abs/2204.01696)

### P234 · I-CVAE（2022）

Intention-Conditioned Long-Term Human Egocentric Action Forecasting

意圖條件的階層式預測生成20個未來動作序列；此序列長度不是20種新增任務或通用難度級別。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2207.12080](https://arxiv.org/abs/2207.12080)

### P235 · TransFusion（2023）

Summarize the Past to Predict the Future: Natural Language Descriptions of Context Boost Multimodal Object Interaction Anticipation

以過去影格的語言摘要作動作情境，再預測下一物件互動；過去摘要與未来資訊必須在切分上分開。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2301.09209](https://arxiv.org/abs/2301.09209)

### P236 · ActFusion（2024）

ActFusion: a Unified Diffusion Model for Action Segmentation and Anticipation

聯合動作分段与長期預測，使用遮罩未來視窗；混合第一／第三人稱來源，不能把全庫都標成Ego。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2412.04353](https://arxiv.org/abs/2412.04353)

### P237 · Gated Temporal Diffusion（2024）

Gated Temporal Diffusion for Stochastic Long-Term Dense Anticipation

同時模型化觀測與未来不確定性，做隨機長期密集動作預測；Breakfast／Assembly101／50Salads並非全為第一人稱。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2407.11954](https://arxiv.org/abs/2407.11954)

### P238 · Object-centric LTA（2023）

Object-centric Video Representation for Long-term Action Anticipation

以物件prompt及影片表徵預測不同時間尺度的動作；含Ego和非Ego資料，保留物件監督和預訓練差異。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2311.00180](https://arxiv.org/abs/2311.00180)

### P239 · MVP（2023）

Multiscale Video Pretraining for Long-Term Activity Forecasting

自監督多時間尺度影片預訓練用於動作及摘要預測；未來latent訓練目標不等同測試時已知未来影格。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2307.12854](https://arxiv.org/abs/2307.12854)

### P240 · ANTICIPATR（2022）

Rethinking Learning Approaches for Long-Term Action Anticipation

結合片段及整段影片表徵，直接預測指定時間內的動作集合；與固定長度verb–noun序列分項比較。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2210.11566](https://arxiv.org/abs/2210.11566)

### P241 · AFF-ttention（2024）

AFF-ttention! Affordances and Attention models for Short-Term Object Interaction Anticipation

STAformer結合場景affordance與hotspot，預測下一物件／動作／接觸時間；與後續STAformer++保留方法家族關係。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2406.01194](https://arxiv.org/abs/2406.01194)

### P242 · NAOGAT（2023）

Leveraging Next-Active Objects for Context-Aware Anticipation in Egocentric Videos

用下一活躍物件和物件動態輔助短期互動預測；同時評測定位、動作與接觸時間。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2308.08303](https://arxiv.org/abs/2308.08303)

### P243 · FactCheck（LTA）（2026）

FactCheck: Feasibility-aware Long-term Action Anticipation with Multi-agent Collaboration

觀察—提案—驗證框架用歷史狀態檢查動作可行性；其多agent是推理角色，不能當成控制多台robot協作。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2606.14778](https://arxiv.org/abs/2606.14778)

### P244 · BiAnt（2025）

Bidirectional Action Sequence Learning for Long-term Action Anticipation with Large Language Models

雙向動作序列學習改善長期預測，Ego4D以編輯距離評估；生成序列的合理性與觀測到的真實未来仍分開。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2508.00374](https://arxiv.org/abs/2508.00374)

### P245 · ICVL（2025）

Vision and Intention Boost Large Language Model in Long-Term Action Anticipation

將推斷意圖融合視覺表示，再作語言模型長期預測；in-context例子來源與測試影片隔離。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2505.01713](https://arxiv.org/abs/2505.01713)

### P246 · Decision-aware uncertainty（2026）

Decision-Aware Uncertainty Evaluation of Vision-Language Model-Based Early Action Anticipation for Human-Robot Interaction

依影片前綴做早期動作辨識／預測與信心校準；early recognition和真正尚未發生的anticipation要標明。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2603.10061](https://arxiv.org/abs/2603.10061)

### P247 · EgoSpanLift（2025）

Gaze Beyond the Frame: Forecasting Egocentric 3D Visual Span

把未来注視範圍從2D提升到3D，提供364.6K樣本；注視／感知範圍不是手部或機器人行動。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2511.18470](https://arxiv.org/abs/2511.18470)

### P248 · HOIMotion（2024）

HOIMotion: Forecasting Human Motion During Human-Object Interactions Using Egocentric 3D Object Bounding Boxes

以過去人體姿態和Ego物件3D框預測全身動作；state感測前提與純RGB方法分層。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2407.02633](https://arxiv.org/abs/2407.02633)

### P249 · EgoCast（2024）

EgoCast: Forecasting Egocentric Human Pose in the Wild

第一人稱影像與本體資訊支持人體姿態預測，以自行估計姿態代替測試時過去真值；重建和預測的時間邊界分開。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2412.02903](https://arxiv.org/abs/2412.02903)

### P250 · EgoMAN（2025）

Flowing from Reasoning to Motion: Learning 3D Hand Trajectory Prediction from Egocentric Human Interaction Videos

219K軌跡與3M QA連結階段理解和3D手路徑預測；QA與軌跡共享來源，不能相加成独立錄製。

分類：未來動作／互動預測。證據：完整摘要＋書目；非全文審計。
原始來源：[https://arxiv.org/abs/2512.16907](https://arxiv.org/abs/2512.16907)
