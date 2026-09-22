# Benchmark × 領域／場景／題數比較表

更新：2026-09-22。33 項重點前作＋本計畫目標與實績兩列。原文摘要／指定章節與固定程式來源已核對；共同 G2 去重和有效覆蓋比尚未完成。

## 規模總表

| Benchmark | 類型／範圍 | 領域 | 場景 | 任務種類（原作單位） | 實例／題數 | 資料量 |
|---|---|---|---|---|---|---|
| 我們 v0.4｜規劃目標 | 僅模擬；人類影片配對另有 track | 12 個共同應用場域；每域 ≥100 適用 G2、≥8 families、≥3 mechanisms | 獨立場景資產／layout 數尚未訂；每有效 coverage cell 至少 3 個有效 G3 | 2,000–3,000 個去重 G2 初始目標；至少最大可比基準 2×，必要時上調 | 純示例：2,400 G2 → 3,000 execution bindings → 30,000 G3 → 120,000 G4 | human-observation track 300–500 G2／≥8 場域；影片 pair 總量未訂 |
| 我們 v0.4｜目前實績 | 僅模擬；人類影片配對另有 track | 12 類設計標籤；0 個已驗證場域覆蓋格子 | 0 個已綁定驗證的 simulator instances；資產／layout 聯集尚未建立 | 正式去重 G2：TBD；180 authored blueprints 另列 | 0 已驗證 G3／G4；0 simulator trials | 5,020 原生來源紀錄、20 repos／21 snapshots；本計畫 human pairs 0 |
| BEHAVIOR-1K | 模擬；論文另有實體實驗 | 8 種原生場景類別：住宅、帶花園住宅、旅館、辦公室、雜貨店、大廳、餐廳、學校；學校含實驗室 | 50 個互動場景資源 | 1,000 個 everyday activities | 活動／場景可實例化；不把 50 個場景當成測例數 | 9,000+ 物件模型 |
| RoboCasa365 | 模擬 | 廚房活動；60 種原生活動分組 | 2,500 個 pretraining 廚房（50 layouts × 50 styles）；另有 10 個 target 廚房 | 365 個 tasks；正式 target 評測子集 50 | 測例依 task、場景與初態生成；全庫固定測例總數未在本輪歸一 | 500k+ 示範；人類遙控及合成來源分開 |
| VLABench | 模擬 | 日常操作、知識／常識與隱含意圖；100 是任務分類，不是領域數 | 隨機化操作情境；独立環境資產總數本輪未核 | 100 個 task categories | 每類可隨機化；固定全庫 case 數未核 | 2,000+ 物件；自動生成訓練示範 |
| RLBench | 模擬 | 多樣桌面／設備操作；任務題材不等於完整部署場域 | 固定程式含 106 個 .ttm 任務場景檔；非 106 個應用領域 | 論文 100 tasks；固定程式 106 Task classes | 各 task 有 variations；case 總量依生成設定 | waypoint／motion-planner 示範可生成；不寫成實際無限筆 |
| Meta-World | 模擬 | 多任務／meta-RL 操作技能 | 桌面技能環境；非城市或家居場景庫 | 50 個 manipulation tasks | 位置／goal variations；不另算任務種類 | 示範與 rollout 依使用者實驗產生 |
| LIBERO | 模擬 | 物件／空間／目標與長流程的日常桌面操作 | 程序生成的 tabletop／kitchen 等場景；資產場景總数本輪未核 | 130 個 native task IDs；論文四類 suite；程式分為五個清單 | 測例／初態依 task 與 protocol；長流程 subset 10 tasks | 人類遙控 robot 示範 |
| CALVIN | 模擬 | 語言條件桌面操作與技能串接 | 4 個環境 A–D | 34 個 subtask／skill 目標 | 1,000 條評測 instruction chains，每條 5 個子任務 | 約 24 小時 play data；約 20k 語言標註 directives |
| ManiSkill2 | 模擬 | 20 個 manipulation task families；含固定／移動與單／雙臂 | 物件、拓撲、幾何與初態變化；不以 2,000 物件當場景 | 20 個 task families；v0.5.3 程式 21 registrations | 實例／case 依資產與 protocol | 2,000+ 物件；4M+ 示範 frames |
| ManiSkill3 | GPU 模擬平台與任務環境 | 原作稱 12 domains，例子含移動、humanoid、dexterous；屬能力／機體分組 | artist scenes 與 digital twins；獨立場景總數本輪未核 | 固定版本 65 task registrations；原文 12 domains 不是 12 個部署場域 | 依選用環境、資產與初態生成 | millions of demonstration frames |
| RoboTwin 2.0 | 模擬；sim-to-real 實驗 | 多樣雙臂操作；五種 randomization 軸非五應用領域 | 任務場景加 clutter／lighting／background／table height 等隨機化 | 50 個 dual-arm tasks | 依任務與隨機化設定生成，無單一固定 case 總數 | 731 個物件實例、147 類；自動生成示範 |
| GarmentLab | 模擬；實體 benchmark／轉移 | 衣物、布料及穿戴／收納相關操作 | 衣物、物件、fluid、avatar 互動場景；獨立場景資產總數未歸一 | 20 個 tasks，分 5 個互動類別 | 資產與操作配置形成實例；全庫測例總數未核 | 多類衣物、機器人、操控器與示範 |
| DexGarmentLab | 模擬；實體轉移實驗 | 靈巧衣物操作 | 衣物幾何、形變、操作情境與大規模 3D assets | 15 個 task scenarios | 多衣物實例與初始形變；測例總數本輪未核 | 由單一 expert demonstration 擴展多樣 trajectories |
| SoftGym | 模擬 | 布料、繩與水的技能評測；部署場域未作核心分類 | 材料技能場景與隨機初態 | 固定程式 12 registrations，含變體；不可視為已去重 G2 | 依材料、配置與 seed 生成 | 環境／policy rollouts；統一資料庫筆數未核 |
| MoDeSuite | 模擬；Spot 實體轉移 | 移動操作與柔性／彈性物件 | 8 項應用啟發的操作情境；背景資產數未核 | 8 個 mobile manipulation tasks | 各任務實例／rollouts 依 protocol | RL／IL 實驗資料，總量本輪未核 |
| AutoBio | 模擬 | biology laboratory 的儀器與實驗程序操作 | 實驗室儀器數位化場景；獨立場景總數未核 | 16 個 tasks；3 個設計難度層 | 論文選 9 tasks 做主實驗；每任務示範量另列 | 受測任務各 100 demonstration trajectories（訓練用途） |
| ALFRED | AI2-THOR 模擬 | 家庭室內；7 種任務類型 | 120 個 indoor scenes | 7 個 parameterized task types | 8,055 expert demonstration episodes；25,743 language directives | 428,322 image–action pairs（論文資源） |
| TEACh | AI2-THOR 模擬 | 對話協作式家庭工作 | AI2-THOR 室內場景；實際場景聯集本輪未核 | 12 種 task types（論文資料）；程式 25 schemas 另列 | 3,047 successful human–human gameplay sessions | 對話＋狀態／action traces；三個 benchmark protocols |
| PARTNR | Habitat 模擬 | 多 agent 家庭活動；4 類約束／能力分組 | 60 個房屋：37 train、13 validation、10 test | 4 個 task types；具體語義任務種類尚需正規化 | 100,000 train episodes＋1,000 validation＋1,000 test；原文概述 100k tasks | 5,819 個 unique objects；每 episode 有 instruction／evaluation |
| WatchAct | 模擬；FR3 實體實驗 | 家庭／輔助操作題材；4 個 cognitive domains | 真實人類影片與 executable LIBERO task 配對 | 14 個原生認知 task schemas；操作 G2 種類待共同審核 | 3,000 個 long-horizon video–task instances | 人類行為影片＋goal／oracle plan／執行資料 |
| RoboReel | 人類真實影片＋模擬執行 | Learning from Observation 操作任務 | human demonstration videos 與 simulation task environments | 10 個 manipulation tasks；4 個 test suites | 各 suite 的 case／rollout 總數本輪未核 | 人類影片＋simulated robot trajectories |
| The Imitator Game | 模擬＋實體；分開計數 | 6 原生領域：Household、Supermarket、Restaurant、Logistics、Hospital、Laboratory | 跨六領域的 human–robot 對齊情境；獨立場景資產總數未核 | 50+ base tasks；各域列數共 53；200+ L0–L3 variants | paired episodes 是資料資源，不是每個模型都跑過的 test cases | 20,000+ pairs；原文細分 11.7k real pairs＋10k simulation pairs |
| RoboDojo | 模擬＋實體；分開計數 | 操作能力；5 個 simulation capability dimensions，非 5 個應用領域 | simulation task scenes＋標準化 real evaluation setups | 42 sim tasks／18 real tasks；不合併宣稱 60 個獨立 G2 | 模型×任務×場景實驗量依 protocol | 整合 30 policies（方法數，不是任務數） |
| LIBERO-Recover | 模擬 | LIBERO 衍生操作與失敗狀態 | 由模型實際失敗形成的恢復情境 | 沿用 LIBERO 操作；4 個 recovery levels 不是新增 G2 類數 | 1,000+ failure scenarios | 失敗狀態／恢復評測資料 |
| SafeVLA-Bench | 模擬軌跡的事後評測 | LIBERO tabletop 與 RoboCasa365 kitchen | 重用既有 benchmark 場景 | 沿用原任務；不新增獨立任務種類總數 | 9 個 policy–benchmark entries；不是 9 題 | 受測 rollout traces；總量本輪未核 |
| RoboVerse | 多 simulator／機體與資料平台 | 整合既有操作 benchmark；276 個 task categories 非應用領域數 | 來源環境、assets 與 domain randomization；場景資產總數未歸一 | 論文 276 個 task categories；固定程式 2,897 registration groups | 測例依選用 suite／protocol；跨作 G2 未完成去重 | 510.5k trajectories、約 5.5k assets；超過 50M transitions |
| Embodied Agent Interface | 符號／模擬 decision-making | BEHAVIOR 與 VirtualHome 的家庭活動；4 個決策模組 | 重用兩個原生環境；不是新建場景庫 | BEHAVIOR 100 task names；VirtualHome 26 task names（分開保留） | BEHAVIOR 100 instructions／trajectories；VirtualHome 338 | 目標、subgoals、action sequences、transition model 標註 |
| EgoPlan-Bench2 | 離線影片規劃 QA | 4 原生大域：Work／Daily life／Hobbies／Recreation；24 細類，含 lab、blacksmith、mechanic、farmer | 24 是應用 scenario categories；不是 24 個可執行 3D 場景 | 規劃 QA 題型；不提供相同口徑的 robot G2 | 1,321 multiple-choice QA pairs | 1,113 videos |
| EgoSchema | 離線長影片 QA | 廣泛自然人類活動；來自 Ego4D subset | 3 分鐘影片片段；非 simulator scenes | 影片理解／推理問題；非操作任務庫 | 5,000+ multiple-choice QA pairs（v1 原文） | 250+ 小時影片 |
| EgoTaskQA | 離線人類任務 QA | 室內 goal-oriented 活動與 multi-agent collaboration；LEMMA 來源 | Ego video clips；非可執行 robot 場景庫 | 4 類 reasoning question types，非 4 個物理工作 | 40,000 balanced QA（由 368k 候選抽樣） | 2,000 個 egocentric videos |
| EgoLife / EgoLifeQA | 生活影片＋離線長記憶 QA | 共同生活、購物、做飯、討論、社交與娛樂 | 6 人共同生活一週；不是六個應用場域 | 生活助理／記憶 QA；非 robot task bank | 3,000 QA 全集；該版主評测只用 Jake 的 500 QA | 300 小時 EgoLife 影片；QA對應長歷史資源另列 |
| Ego4D | 真實影片資料＋多項離線 benchmark | 數百種日常情境：household、outdoor、workplace、leisure；原作未用我們12類 | 74 個收集 locations／9 國；不是 74 個 simulator scenes | 多個理解、記憶與預測 benchmark；不合成單一 robot 任務數 | 各 benchmark 的標註／split 分開計數，未混加 | 3,670 小時；931 camera wearers（引用論文版本） |
| Ego-Exo4D | 同步人類影片＋離線 benchmark | skilled activity：運動、音樂、舞蹈、修車等 | 123 個 natural scene contexts；13 城市 | 技能理解、熟練度、跨視角、3D pose 等 benchmark | 各 benchmark 分割／題數另計 | 1,286 小時；740 participants（引用論文快照） |
| EPIC-KITCHENS-100 | 真實 Ego 影片＋離線 benchmark | 廚房日常互動 | 45 個 environments | 6 個 challenge endpoints；不是 6 種物理工作 | 約 90k annotated actions；非 90k robot tasks | 100 小時、700 videos、20M frames |

## 材料、機體、觀測與評測

| Benchmark | 材料 | 機體 | 觀測 | 評測 | 與本計畫的差異 |
|---|---|---|---|---|---|
| 我們 v0.4｜規劃目標 | 6 類物理模型；5 類非剛體各先提出 ≥20 適用 G2／≥3 families | 單臂、雙臂／靈巧、移動操作三組，各 ≥100 適用 G2；R6 擴展 | 文字、頭戴／身體、VLOG／剪輯、外部、多視角、robot 示範與歷史 | T5 執行＋T6恢復為主；T1–T8按合法資料條件啟用；macro＋micro＋分層難度 | 目標是較大的去重任務聯集、較廣有效覆蓋與统一執行證據；尚未證明領先。 |
| 我們 v0.4｜目前實績 | 6 類設計模型；已驗證支撐為 0 | 6 個候選 profiles；正式 adapters／可測集合未建 | 觀測規格與來源盤點；實際人類影片配對 0 | 研究文件、來源提取與網站；尚無 robot 實驗結果 | 目前交付是設計與來源證據；正式規模、廣度和效能優勢都待實作驗證。 |
| BEHAVIOR-1K | 剛體、關節、布料、流體等；含狀態／物質抽象 | 移動操作等；依活動與機體配置 | robot 觀測＋活動目標；人類需求調查不是影片條件 | 日常活動完成、長流程、物件狀態 | 已有廣泛日常活動與多類場域；我們須證明共同分類下新增了哪些任務／有效格子。 |
| RoboCasa365 | 廚房剛體、關節與設備／物料狀態；各物理效果按任務核對 | 操作／移動機體依配置 | robot 視覺＋語言；human demonstrations 指遙控資料，非等同觀察人做事的影片 | 操作、語義、長流程與記憶；50 task target protocol | 我們擬擴大應用場域與任務聯集；場景資產數目前尚無超越其 2,500 的證據。 |
| VLABench | 以物件與機構操作為主；材料支撐逐題另核 | 操作機器人 | 語言、視覺及可用狀態；隱含意圖指令 | 知識轉移、多步推理、action policy 與語言模型 | 已有超出簡單指令取放的推理任務；我們需增加有效任務、場域與跨材料覆蓋。 |
| RLBench | 物件、關節與精密接觸；材料種類依 task | 預設操作臂；觀測與動作模式可配置 | 本體狀態、RGB、depth、segmentation、外部／手眼相機 | 多任務、模仿學習、few-shot、較長操作序列 | 我們擬從多技能操作擴到有場域條件、資料條件與恢復協作的全庫。 |
| Meta-World | 剛體、關節與接觸 | 單臂操作 | 狀態／視覺依設定 | multi-task、meta-learning、held-out task 泛化 | 我們擬加入完整工作、更多場域與跨材料／資訊條件；技能泛化仍是重要對照。 |
| LIBERO | 剛體與關節等 | 操作臂 | 語言＋robot 視覺；遙控示範不等於 human-video input | lifelong transfer、空間／物件／目標知識、長流程 | 是完整庫可復用來源；我們需要共同去重與跨場域增量，而非把移植版再加一次。 |
| CALVIN | 剛體、抽屜／滑門／按鈕等機構 | 單臂；感測器可配置 | 語言、外部／gripper camera、可選觸覺 | 長流程串接、跨環境／語言／物件泛化 | 已有大量組合鏈；我們的獨立任務數、場域覆蓋與測例量要分欄比。 |
| ManiSkill2 | 剛體與 soft-body；具多種材料任務 | 固定／移動、單／雙臂 | RGBD／point cloud 等，controller 可配置 | 操作泛化、2D／3D輸入、統一接口與評測 | 多機體、柔性物、統一接口已存在；我們的增量要由任務與場域交叉覆蓋支持。 |
| ManiSkill3 | 接觸操作；物理材料支援依具體環境 | 多機體，含移動、靈巧與 humanoid | state／visual，point clouds、voxels 等 | GPU 平行操作學習、RL／IL 與多類任務環境 | 已具廣泛機體與任務接口；不能以我們也有 12 個標籤宣稱領域更廣。 |
| RoboTwin 2.0 | 雙臂物件與接觸操作；材料分布另核 | 5 種機體 | 視覺＋語言；合成 robot demonstrations | 雙臂、跨機體、domain randomization、sim-to-real | 我們需增加雙臂任務與其他場域的有效聯集；多機體／自動生成本身已有先例。 |
| GarmentLab | 布料＋剛體／關節／fluid／human-body 互動；FEM／PBD | 多機器人、夾爪／手等操控器 | robot 視覺／狀態，依 task | 衣物與跨物理介質互動、泛化、sim-to-real | 柔性物與跨物理互動已有專門 benchmark；我們的貢獻需要聯集之外的覆蓋。 |
| DexGarmentLab | 布料／衣物與接觸 | 雙臂靈巧手 | 視覺／狀態；結構對應與 affordance | 靈巧雙臂、衣物形狀／形變泛化 | 我們的衣物 track 須對照其具體任務，不能只以「含摺衣」作新穎性。 |
| SoftGym | 布料、繩索、流體 | 抽象 picker／容器控制等；不等同全機器人 | state／image，部分可觀測 | 柔性物 RL 與觀測／狀態設計 | 提供材料與判分候選；需加入真實機體約定與完整工作才能納入我們的執行庫。 |
| MoDeSuite | 彈性與柔性物；逐題材料模型另核 | 移動底座＋操作臂；含 Spot | robot 感測與動作控制 | 底座／手臂協調、利用形變、sim-to-real | 移動＋柔性物已有直接先例；我們擬擴充任務和部署場域的有效組合。 |
| AutoBio | 器皿、設備機構、透明材料；流體效應須依實作另核 | 實驗室操作機器人 | 語言、視覺、proprioception／儀器介面 | 精密操作、視覺推理、指令與程序 | 專業實驗室已存在專門基準；我們需比較真正的新程序和場域聯集。 |
| ALFRED | 剛體與離散物件／設備狀態；不宣稱相應熱學／清洗物理 | 導航 agent＋離散 object interactions | 高／低階語言指令、egocentric robot 視覺 | 導航、長流程、不可逆狀態變化、語言落地 | 已有大量實例級題目；我們要在任務種類和物理操控層另作比較。 |
| TEACh | 剛體與離散狀態交互 | Commander／Follower；導航與物件交互 | 對話、歷史、egocentric agent 視覺 | 對話理解、指令澄清、任務執行；EDH／TFD 等 | 對話與協作已有先例；我們需擴大相容實例和連續物理操作。 |
| PARTNR | 物件、空間與狀態交互 | 模擬 human／robot agents；高低階 action 設定 | 語言任務＋agent 觀測；分散／集中控制 | 規劃、推理、時空／異質能力約束、協作 | 是必須納入的大型 episode 級對照；我們的 2,000–3,000 G2 不能直接與 100k 比大小。 |
| WatchAct | 配對操作以原生環境物件為準 | 模擬操作臂；Franka Research 3 實驗 | 人類影片，變化 camera viewpoint、角色與歷史條件 | 事件、程序、意圖、episodic memory；reasoning／oracle-plan／full pipeline | 已把觀察人類、推理與執行串起來；我們的增量在更大且更廣的任務／場景聯集。 |
| RoboReel | 操作物件／接觸；完整材料分布另核 | 模擬操作機器人 | human videos 用於學習 policy；不同表示與資料條件 | LfO、視覺干擾、長流程、低容差操作 | 人類影片學習已是正式 benchmark；我們擬擴到更多場域與材料，並保持學習設定可比。 |
| The Imitator Game | 含衣物、容器、包裝等；各物理模型／sim-real 適用性另核 | 多視角 human–robot 配對；sim／real機體各有約定 | 人類示範；L0–L3 情境／物件／affordance mismatch | 模仿能力階梯、執行與 human A/B preference | 已同時跨六個應用領域且含布品／物流／實驗室；是我們的人類觀測 track 的重要直接對照。 |
| RoboDojo | 操作接觸與精度；逐題材料另核 | simulation 與標準化 real hardware | 語言、視覺、記憶條件 | 泛化、記憶、精度、長流程、open vocabulary；remote real eval | 統一 sim／real 平台與多維能力診斷已有先例；我們先在 simulation 擴展任務與場域。 |
| LIBERO-Recover | 原生物件與場景狀態；含結構／拓撲推理 | 相容操作機器人 | robot 狀態／觀測＋任務資訊 | retry、adaptation、object-state recovery、environmental recovery | 恢復已有專門千級情境；我們擬建立跨任務／材料的恢復 protocol 與全 episode 報告。 |
| SafeVLA-Bench | 接觸、物件擾動、持物穩定與 self-contact 量測 | 原生平台機器人 | 任務相關 STL 條件＋完整軌跡 | native success、Succ-But-Unsafe、Violation Severity Index | 成功與過程約束分開評測已有直接先例；我們需提供更大適用集合和可核驗規則。 |
| RoboVerse | 物理支援依 backend／任務 | 多 simulator 與多機體 | 共通表示／接口；sim 資料與 policy | 跨 simulator／機體、資料生成、模仿／RL 與泛化 | All-in-one 接口與來源整合已有大型先例；我們要證明去重後的增量任務、覆蓋和評測。 |
| Embodied Agent Interface | 依原環境狀態與符號抽象 | 原生 embodied agents；非一種共通連續控制機體 | 自然語言＋形式化目標／狀態／动作 | goal interpretation、subgoal decomposition、action sequencing、transition modeling | 多模組與統一表示已有先例；我們擬連到大規模實際操控與多種觀測條件。 |
| EgoPlan-Bench2 | 影片中物件，不宣稱具可用物理模型 | 人類活動影片；無 robot execution endpoint | Ego task-progress video＋目標／選項 | 下一步規劃、情境與多步推理 | 影片領域本身已廣；我們的差異應在可執行配對與物理完成，不能只拿 12 對 4。 |
| EgoSchema | 影片觀測，不宣稱物理模擬 | 人類 Ego 影片 | 3 分鐘影片＋五選一問題 | 長時段理解、temporal certificate | 提供長時間證據需求的對照；QA 正確率與機器人完成率要分開。 |
| EgoTaskQA | 物件狀態／關係標註；非 simulation materials | 人類 actor／helper | Ego影片、物件狀態、意圖與他人信念 | 描述、預測、解釋、反事實；時空／因果與協作理解 | 因果與協作理解已可用大量 QA 測試；我們擬增加物理可執行的共同任务配對。 |
| EgoLife / EgoLifeQA | 影片／聲音資料；非材料物理模型 | AI glasses 的人類 wearer；同步第三人稱視角 | 長時段 Ego、多模態、多視角與人際歷史 | 記憶檢索、identity、生活情境問答 | 已有跨多天歷史與人際資訊；我們需把所需歷史連到可驗證實體目標。 |
| Ego4D | 真實活動影片；部分有環境 mesh 等資料 | 穿戴式第一人稱攝影；各片段安裝／sensor 另查 | Ego RGB；部分 audio、3D、gaze、stereo、多wearer 同步 | episodic memory、hand-object、社交、forecasting | 影片活動覆蓋可能比操作庫廣；我們的增量是執行配對，不能宣稱比全部 Ego4D 活動更廣。 |
| Ego-Exo4D | 真實影片與 point clouds，不等於可操控材料模型 | 人類 performer；同步 ego／exo cameras | 影片、audio、gaze、camera pose、IMU、語言／expert commentary | 細粒度活動、proficiency、cross-view、3D hand/body pose | 跨視角與技能觀測資料已豐富；我們需建立合法的 robot 目標與控制配對。 |
| EPIC-KITCHENS-100 | 真實廚房物件影片；非物理模型 | 人類 head-mounted camera | Ego影片＋動作／語言標註 | recognition、detection、anticipation、retrieval、domain adaptation | 可用作 Ego 預測／觀測來源；我們需增加執行與跨場域配對。 |

## 讀表後對本計畫的含義

1. BEHAVIOR-1K 已含多類部署場景；12 對 8 的標籤數不能證明我們廣兩倍。
2. PARTNR 已有 100k 級 episodes；CALVIN 已有 1,000 條五子任務鏈。要先對齐粒度，再比較任務種類和測例規模。
3. RoboCasa365 的 2,500 個廚房是場景資源；本計畫的 30,000 G3 是條件式初態實例預算。目前尚無獨立場景資產規模優勢。
4. The Imitator Game 已跨六領域並含衣物／物流／實驗室；WatchAct 和 RoboReel 已連結人類影片與執行。新增要由共同任務與配對證據支持。
5. ManiSkill2／3、GarmentLab、MoDeSuite、RoboVerse 與 EAI 已涵蓋部分多機體、多材料或統一接口；all-in-one 本身不構成已證明的新穎性。
6. 新計畫的可檢驗貢獻是：去重後較大的有效任務聯集、超出前作聯集的新任務／必要機制、有充分實例支持的新增覆蓋，以及統一條件下的全庫執行證據。當前均待實作。

## 欄位與證據界線

Retain native units and split scope. No single numeric task-count ranking across schemas, episodes, QA, assets or demonstrations. Cross-work canonical G2 and validated coverage ratios remain unresolved.

有：原文明確的應用／場景用途；部分：相關題材但部署場域綁定未完整核驗；待核：未知，非沒有；目標：本計畫提案；0 已驗證：本計畫實績。

有：引用版本直接涉及該評測；部分：特定子集、抽象控制或相鄰評測；資料：觀測／標註而非對 robot 控制的評測；非端點：離線影片任務不提供該 robot endpoint；待核：本輪證據不足。

## 逐列原文、版本與計數注意事項

### 我們 v0.4｜規劃目標

上述都是目標／條件式示例；12 labels、120k G4、3k bindings 不得改報成獨立任務數。模擬場景資產數仍無規模優勢主張。

預計以固定 agent panel、相同 contract 的成功率與不確定性校準；目前沒有實測難度分數。

- 本計畫 v0.4 設計：https://jasonya.github.io/robot-use-benchmark/zh-hant/design.html（研發目標與已完成項分開）

### 我們 v0.4｜目前實績

程式／網站測試不是 robot benchmark 驗證。5,020 異質來源紀錄不當成我們已完成的任務。

未執行模擬，沒有可報告的經驗難度。

- 本計畫 v0.4 設計：https://jasonya.github.io/robot-use-benchmark/zh-hant/design.html（研發目標與已完成項分開）

### BEHAVIOR-1K

八類是原生場景分類，不能與我們 12 應用類直接作倍數比較；固定程式盤點 1,016 活動目錄另列。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/html/2403.09227v1（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：1016 records；StanfordVL/BEHAVIOR-1K @ 4b0f43dfb7f7f759e5e9f575e8d72f56492eab5f。異質紀錄，非共同 G2。

### RoboCasa365

2,500 是 layout/style 場景資源，與 G3 初態實例不同；365 全庫、317 資料 registry、50 評測子集各有 scope。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/html/2603.04356v1（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：365 records；robocasa/robocasa @ 4f8a2980def75a55dff96b990745b83540425f09。異質紀錄，非共同 G2。

### VLABench

論文 100 類與固定程式 96 registrations 分別保留，不任意取較小者。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2412.18194v1（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：96 records；OpenMOSS/VLABench @ cf588fe60c0c7282174fe979f5913170cfe69017。異質紀錄，非共同 G2。

### RLBench

場景檔數、task classes 和 variations 不是同一單位；桌面道具不可自動標成工廠／門店。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/1909.12271（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：106 records；stepjam/RLBench @ 02720bba4c73fe02eb75df946b8791b806028a9d。異質紀錄，非共同 G2。

### Meta-World

不可把 50 tasks 說成 50 個應用場域，也不把每個位置 seed 加成新 G2。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/1910.10897（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：50 records；Farama-Foundation/Metaworld @ 59fc34d7768af9785e4688c3e1db671424f4a6c3。異質紀錄，非共同 G2。

### LIBERO

130 是原生 ID，不代表共同 G2 已審核；LIBERO-90／10 的 90+10 與另外三組 10 都保留。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2306.03310（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：130 records；Lifelong-Robot-Learning/LIBERO @ 8f1084e3132a39270c3a13ebe37270a43ece2a01。異質紀錄，非共同 G2。

### CALVIN

34 子任務與 1,000 條五步鏈都重要，但不能當成同粒度的 1,034 個 G2。

按 1–5 個順序子任務的完成率評估；串接長度不是跨 benchmark 校準難度。

- 原作／原文：https://arxiv.org/abs/2112.03227（abstract or selected count/scope sections; not full task/evaluator audit）
- 原作／原文：https://arxiv.org/html/2112.03227（selected task/count/scene sections only）

### ManiSkill2

20 families、21 IDs、4M frames 分屬不同層級。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2302.04659（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：21 records；mani-skill/ManiSkill @ 493be36121a9dd06071a57172274babe617b789f。異質紀錄，非共同 G2。

### ManiSkill3

12 domains、65 registrations 和部署場域均不等價；沿用固定程式快照。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2410.00425（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：65 records；mani-skill/ManiSkill @ 62ff3a5896b4d5b4cf0ac4c8d79afe600c9404a3。異質紀錄，非共同 G2。

### RoboTwin 2.0

物件類、物件實例、五個隨機化軸、五種機體不與 task 數混加。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2506.18088（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：50 records；RoboTwin-Platform/RoboTwin @ 6dde57155eafa3e4ebf6ad1f93a7cf7d5d41a755。異質紀錄，非共同 G2。

### GarmentLab

本地來源盤點的 10 個 demo entrypoints 不取代論文 20 tasks；5 組是互動類，不是部署場域。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2411.01200（abstract or selected count/scope sections; not full task/evaluator audit）
- 原作／原文：https://arxiv.org/html/2411.01200（selected task/count/scene sections only）
- 固定程式盤點：10 records；GarmentLab/GarmentLab @ 6ee0620fddb8083d5eab554fa343cdc966c61d5f。異質紀錄，非共同 G2。

### DexGarmentLab

15 task scenarios 不是 15 個場域；本地亦提取 15 個場景入口。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2505.11032（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：15 records；wayrise/DexGarmentLab @ e4e298e696bae5d866ded3b31e0ae27becea5376。異質紀錄，非共同 G2。

### SoftGym

同名操作在 picker 與完整機體下的控制條件不同；不直接比較成功率。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2011.07215（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：12 records；Xingyu-Lin/softgym @ bb383f64cd488062587714abbae38f27ed9f2457。異質紀錄，非共同 G2。

### MoDeSuite

底座和手臂協調不等於多 agent／人機協作。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2507.21796（abstract or selected count/scope sections; not full task/evaluator audit）

### AutoBio

16 全庫、9 實驗 subset、每題 100 demonstrations 分開；3 難度層不是跨 benchmark 校準量尺。

原作分 3 個設計難度層；主實驗每層取 3 tasks。層級僅在該基準內解讀。

- 原作／原文：https://arxiv.org/abs/2505.14030（abstract or selected count/scope sections; not full task/evaluator audit）
- 原作／原文：https://arxiv.org/html/2505.14030（selected task/count/scene sections only）

### ALFRED

同一 demonstration 可有多份語言標註；25,743 directives 不等於這麼多獨立任務種類。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/1912.01734（abstract or selected count/scope sections; not full task/evaluator audit）
- 原作／原文：https://arxiv.org/html/1912.01734（selected task/count/scene sections only）
- 固定程式盤點：7 records；askforalfred/alfred @ f91f4c0c96c7a29f33d0557f86b0a21035379b3b。異質紀錄，非共同 G2。

### TEACh

3,047 sessions 不等於 EDH case 數；12 task types 與程式 25 schemas 是不同 scope。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2110.00534（abstract or selected count/scope sections; not full task/evaluator audit）
- 原作／原文：https://arxiv.org/html/2110.00534（selected task/count/scene sections only）
- 固定程式盤點：25 records；alexa/teach @ 903191e256da866a603d1bbfb21db34e0874392d。異質紀錄，非共同 G2。

### PARTNR

100k 是指令與環境綁定的 episodes；不能降成『只有 4 題』，也不能直接認定 100k 個獨立 G2。程式六個生成 configs 更不是任務種類。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/html/2411.00081（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：6 records；facebookresearch/partnr-planner @ ddfff19f4b6c098a31edea4d19e7b75db72433c2。異質紀錄，非共同 G2。

### WatchAct

14 是認知型任務 schema，4 是認知域；都不能當成 14 種物理工作或 4 個部署領域。

認知題型、oracle plan 長度與 camera viewpoint 等分層；未作跨基準難度校準。

- 原作／原文：https://arxiv.org/html/2606.26443v1（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：14 records；Baiqi-Li/WatchAct @ 7036927a94a160e7d420e3f7156cd5b2e9e8f3e6。異質紀錄，非共同 G2。

### RoboReel

4 suites 不是 4 應用領域；訓練影片到 policy 與推論時看示範必須分開。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2609.08209v2（abstract or selected count/scope sections; not full task/evaluator audit）

### The Imitator Game

53 mappings、200+ variants、20k+ pairs 不得相加。Hospital 不自動等同我們的非臨床 D11。

L0–L3 模仿情境／物件／affordance mismatch；不是與其他 benchmark 共用的難度分數。

- 原作／原文：https://arxiv.org/html/2608.22301v1（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：53 records；imitator-game/The-Imitator-Game @ d6d16ec511bc389e0a207692730c137bc022ef14。異質紀錄，非共同 G2。

### RoboDojo

本計畫現在沒有實體平台，不能在 sim＋real 覆蓋上宣稱超越。54 程式 task/config entries 另列。

5 個能力維度，含記憶、精度與長流程；不當成 5 個通用難度級別。

- 原作／原文：https://arxiv.org/abs/2607.04434v3（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：54 records；RoboDojo-Benchmark/RoboDojo @ 726e9aabfaa642203722eb126f5eaf0f37f3e1ad。異質紀錄，非共同 G2。

### LIBERO-Recover

failure scenarios 屬 instance／case 層，不能比較為 1,000 個新工作種類。

4 類恢復層級：retry、adaptation、object-state、environmental recovery；按原定義解讀。

- 原作／原文：https://arxiv.org/abs/2609.05178v2（abstract or selected count/scope sections; not full task/evaluator audit）

### SafeVLA-Bench

這是評測層而非新增 task bank；不將框架 wrappers 重複算成任務。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2606.00773v1（abstract or selected count/scope sections; not full task/evaluator audit）

### RoboVerse

2,897 是程式註冊群組；其中已辨識 2,587 純配置衍生 class。不可與原作 LIBERO／RLBench 等重複相加，也不能推論只剩兩個任務。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/html/2504.18904v1（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：2897 records；RoboVerseOrg/RoboVerse @ 5f3ec0185d2d3bcb59d53b0bd1f5b0f8a6f2ce14。異質紀錄，非共同 G2。

### Embodied Agent Interface

此處使用原作 BEHAVIOR subset，不把整套 BEHAVIOR-1K 1,000 活動自動計入；100+26 也未作跨作去重。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/html/2410.07166v2（abstract or selected count/scope sections; not full task/evaluator audit）
- 固定程式盤點：3 records；embodied-agent-interface/embodied-agent-interface @ 531c62f8df2cb392bdf1907923c76da41cad4fe6。異質紀錄，非共同 G2。

### EgoPlan-Bench2

其 Work 可跨我們工坊、實驗室、園藝等多欄；24 scenarios 不當場景資產數。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/html/2412.04447v2（abstract or selected count/scope sections; not full task/evaluator audit）

### EgoSchema

不能直接繼承 Ego4D 全部場域到這個被挑選的 subset。

temporal certificate 衡量必要時間證據；不等同 robot 控制難度。

- 原作／原文：https://arxiv.org/abs/2308.09126v1（abstract or selected count/scope sections; not full task/evaluator audit）

### EgoTaskQA

40k 是 QA bank，不是 40k 種 robot task；理解協作不等於控制兩個 agents。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/html/2210.03929v1（abstract or selected count/scope sections; not full task/evaluator audit）

### EgoLife / EgoLifeQA

3,000 全QA與500受測subset分开；300h影片不是300h robot rollout。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2503.03803（abstract or selected count/scope sections; not full task/evaluator audit）
- 原作／原文：https://arxiv.org/html/2503.03803（selected task/count/scene sections only）

### Ego4D

資料母集與其 QA／forecasting 衍生集共享 lineage，不能當作獨立資料量相加。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2110.07058（abstract or selected count/scope sections; not full task/evaluator audit）

### Ego-Exo4D

123 是人類活動錄製情境，與房屋場景資產或 G3 初態不同。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2311.18259（abstract or selected count/scope sections; not full task/evaluator audit）

### EPIC-KITCHENS-100

action segment、challenge endpoint、video 和 robot task 不互換；不從攝影位置推定 robot 視角。

保留原作任務／泛化條件；本輪未建立跨 benchmark 共用的實測難度量尺。

- 原作／原文：https://arxiv.org/abs/2006.13256（abstract or selected count/scope sections; not full task/evaluator audit）
