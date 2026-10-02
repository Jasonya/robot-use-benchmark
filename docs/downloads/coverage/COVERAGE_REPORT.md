# Coverage 統整：五個欄位、兩張主表

版本 coverage-0.8；整理 2026-10-02；來源庫快照 2026-09-29。

全面收集前作，整理任務聯集，再擴充任務與規則。主要閱讀入口統一呈現領域、環境、任務、題數和評估方式。

## 全庫總覽

| 項目 | 目前確認 | 完整聯集狀態 |
|---|---|---|
| 領域 | 12個現有分類；其中10個有前作概述明確標記 | 75筆來源尚未做共同域映射；逐任務分布待補 |
| 環境 | 13/143筆來源已有某種環境數量摘錄 | 可交互場景與錄製環境分項；全庫去重總量未定 |
| 任務 | 2,062筆原作robot任務條目；另263筆人類活動 | 來源重疊、共同規格與規則增量待對齊 |
| 題數 | 21/143筆來源已有原作評測單位／episode數量 | QA、控制和預測分項；全庫整合題數未定 |
| 評估方式 | 4類判分方式；92筆來源有概述分類 | 具體metric與判分程式另核 |

143筆為已登記來源／版本，並非互不重疊的獨立資料集。本次重新核對28個原始概述，新增35筆帶單位數量摘錄；没有新增robot執行。

## 五欄的定義

### 領域：涵蓋哪些生活或工作用途？

用同一份應用領域分類整理前作。保留原作者的分類名称；能力、機體或題型不直接當作應用領域。

計算有來源支持的不同應用領域；另顯示尚未對齊的來源。現有12類是整理框架，可以依前作擴充。

### 環境：在哪些場景、房屋或工作站做？

主表的環境欄指物理或模擬的場景／layout；標明模擬或實體，以及原作的單位。影片錄製地點另標為觀測來源。

對齊場景資產、版本及衍生關係後，分別統計可交互場景與影片錄製環境。同一場景支援多個任務時不重算；生成配置不等於獨立layout。

### 任務：機器人或模型要完成什麼？

原作任務、活動、任務模板和問答／預測題型保留各自名稱與單位。整合時對齊目標、指涉、必要過程、限制及完成條件。

主要規模報告共同任務聯集；機器人工作與資訊任務分項列出。現有2,062筆robot任務條目和263筆人類活動是收集進度，跨来源去重尚未完成。

### 題數：實際有多少道可用來評測的題目？

有明確輸入、條件和判分的測例。控制episode、QA、預測樣本分項列出，保留train／validation／test範圍。

按測例ID及來源重疊統計各型別的整合題數。影片、示範、標註池和模型執行次數另列，不直接相加成考題總數。

### 評估方式：怎麼判斷答得對、做得好？

以四類判分方式整理，保留每個來源的具體metric和判分依據；同一benchmark可以採多種方式。

目前統整為4類判分方式。這是報告的分類，不表示全庫四類判分器都已實作。

## 四類評估方式

| 方式 | 適用例子 | 證據 |
|---|---|---|
| 標準答案比對 | 選擇題、動作類別、步驟標籤、物件或錯誤類型。 | 人工或來源提供的標準答案、可接受答案集合。 |
| 數值誤差與相似度 | 位置／姿態／軌跡、接觸時間、形狀、影像或影片品質。 | 幾何／時間標註、真實未來、參考影像或分布。 |
| 環境狀態與過程檢查 | 任務成功、完整收納、穩定釋放、必要順序、約束、恢復與協作。 | 場景狀態、接觸／事件／軌跡、原作成功條件或過程檢查器。 |
| 人工或模型評審 | 開放式回答、主觀品質、偏好比較、自然語言說明。 | 評審指引、評分紀錄、裁判模型與抽樣人工複核。 |

以已收錄的原文評測描述做工作分類；新增來源參照本次原始摘要。此分類是本計畫整理判斷，不代表逐個判分器程式已核驗。

## 領域分布

此表是68項既有來源概述標註的分布；不是已對齊的任務數或已執行覆蓋。其餘75筆來源映射仍待補。

| 領域 | 明確來源標記 | 部分／相鄰 | 尚無明確標記 |
|---|---:|---:|---:|
| 居家生活空間 | 19 | 12 | 112 |
| 餐飲服務場所 | 2 | 4 | 137 |
| 零售門店 | 4 | 0 | 139 |
| 倉儲與配送場所 | 1 | 0 | 142 |
| 辦公與行政空間 | 1 | 0 | 142 |
| 工坊、製造與維修場所 | 7 | 8 | 128 |
| 實驗室例行物件操作 | 9 | 0 | 134 |
| 旅宿與洗衣服務 | 1 | 5 | 137 |
| 建築設施維護服務 | 0 | 1 | 142 |
| 園藝與戶外作業場域 | 2 | 0 | 141 |
| 輔助生活服務場域 | 0 | 3 | 140 |
| 公共場館與活動場域 | 1 | 0 | 142 |

## 工作順序與完成條件

1. **先補齊前作五欄**：所有已登記來源都有數量、單位、版本、split及出處；缺項列在同一表。 完成條件：逐來源能回答環境、任務、題數與怎麼評；確實未公布者註明已查範圍。

2. **再產生全庫任務聯集**：領域對應、場景重用、共同任務與規則變體清單；共有與新增範圍可查。 完成條件：能輸出各領域的不同任務數與全庫去重數，沒有以設計標籤冒充覆蓋。

3. **最後整理題目與評分**：分型別的測例庫、判分介面與可執行子集，回填全庫總覽。 完成條件：每題可追到來源、任務、輸入、split和判分；結果只涵蓋實際評測子集。

全庫目標是來源的完整任務聯集加上規則擴充；來源清單持續擴充，不以目前143筆為收集上限。來源重疊和題目清單尚未核完前，不另承諾一個缺乏依據的環境／任務／題數總量。

不把領域×家族×規則×觀測×種子乘成已完成規模。擴充後以實際任務聯集和有效測例清單計數；不以現有12領域、48家族或180草案封頂。

## 前作比較總表

下列數字只描述所註明的原作版本／範圍。題數欄保留原生QA、episodes等單位，來源資料另列。待查不表示0。

| Benchmark | 領域 | 環境 | 任務 | 題數／評測記錄 | 原始資料 | 判分分類 |
|---|---|---|---|---|---|---|
| [BEHAVIOR-1K](https://arxiv.org/abs/2403.09227) | 8 種原生場景類別：住宅、帶花園住宅、旅館、辦公室、雜貨店、大廳、餐廳、學校；學校含實驗室 | 50 interactive scenes（原作全集） | 1,000 everyday activities（原作全集） | 活動／場景可實例化；不把 50 個場景當成測例數 | 待查／未整理 | 環境狀態與過程檢查 |
| [RoboCasa365](https://arxiv.org/abs/2603.04356) | 廚房活動；60 種原生活動分組 | 2,500 pretraining kitchen configurations（訓練）；50 pretraining layouts（訓練）；10 target kitchens（原作評測子集） | 365 tasks（原作全集）；50 target tasks（原作評測子集） | 測例依 task、場景與初態生成；全庫固定測例總數未在本輪歸一 | ≥ 500,000 demonstrations（原作全集） | 環境狀態與過程檢查 |
| [PARTNR](https://arxiv.org/abs/2411.00081) | 多 agent 家庭活動；4 類約束／能力分組 | 60 houses（原作全集） | 4 task constraint types（原作全集） | 100,000 training episodes（訓練）；1,000 validation episodes（驗證）；1,000 test episodes（測試） | 待查／未整理 | 環境狀態與過程檢查 |
| [CALVIN](https://arxiv.org/abs/2112.03227) | 語言條件桌面操作與技能串接 | 4 environments（原作全集） | 34 subtasks（原作全集） | 1,000 instruction chains（測試） | 約 24 play data hours（訓練）；約 20,000 language directives（訓練） | 環境狀態與過程檢查 |
| [LIBERO](https://arxiv.org/abs/2306.03310) | 物件／空間／目標與長流程的日常桌面操作 | 程序生成的 tabletop／kitchen 等場景；資產場景總数本輪未核 | 130 native task IDs（原作全集） | 測例／初態依 task 與 protocol；長流程 subset 10 tasks | 待查／未整理 | 環境狀態與過程檢查 |
| [RLBench](https://arxiv.org/abs/1909.12271) | 多樣桌面／設備操作；任務題材不等於完整部署場域 | 固定程式含 106 個 .ttm 任務場景檔；非 106 個應用領域 | 100 tasks in paper（原作全集） | 各 task 有 variations；case 總量依生成設定 | 待查／未整理 | 環境狀態與過程檢查 |
| [Meta-World](https://arxiv.org/abs/1910.10897) | 多任務／meta-RL 操作技能 | 桌面技能環境；非城市或家居場景庫 | 50 manipulation tasks（原作全集） | 位置／goal variations；不另算任務種類 | 待查／未整理 | 環境狀態與過程檢查 |
| [ManiSkill2](https://arxiv.org/abs/2302.04659) | 20 個 manipulation task families；含固定／移動與單／雙臂 | 物件、拓撲、幾何與初態變化；不以 2,000 物件當場景 | 20 task families（原作全集） | 實例／case 依資產與 protocol | ≥ 4,000,000 demonstration frames（原作全集） | 環境狀態與過程檢查 |
| [RoboTwin 2.0](https://arxiv.org/abs/2506.18088) | 多樣雙臂操作；五種 randomization 軸非五應用領域 | 任務場景加 clutter／lighting／background／table height 等隨機化 | 50 dual-arm tasks（原作全集） | 依任務與隨機化設定生成，無單一固定 case 總數 | 待查／未整理 | 環境狀態與過程檢查 |
| [GarmentLab](https://arxiv.org/abs/2411.01200) | 衣物、布料及穿戴／收納相關操作 | 衣物、物件、fluid、avatar 互動場景；獨立場景資產總數未歸一 | 20 tasks（原作全集） | 資產與操作配置形成實例；全庫測例總數未核 | 待查／未整理 | 環境狀態與過程檢查 |
| [ALFRED](https://arxiv.org/abs/1912.01734) | 家庭室內；7 種任務類型 | 120 scenes（原作全集） | 7 task types（原作全集） | 固定評測題目與split總數待補；專家示範量在下方另列。 | 8,055 expert demonstrations（原作全集）；25,743 language directives（原作全集） | 環境狀態與過程檢查 |
| [TEACh](https://arxiv.org/abs/2110.00534) | 對話協作式家庭工作 | AI2-THOR 室內場景；實際場景聯集本輪未核 | 12 task types represented in sessions（原作全集） | EDH／TFD各自的固定題數待補；原始對話遊戲session另列。 | 3,047 successful gameplay sessions（原作全集） | 環境狀態與過程檢查 |
| [WatchAct](https://arxiv.org/abs/2606.26443) | 家庭／輔助操作題材；4 個 cognitive domains | 真實人類影片與 executable LIBERO task 配對 | 14 cognitive task schemas（原作全集） | 3,000 video–task instances（原作全集）；3,045 public HF evaluation rows（已取得版本） | 609 public HF original examples（已取得版本）；1,827 public HF referenced external-view videos（已取得版本） | 標準答案比對／環境狀態與過程檢查 |
| [VIMA](https://arxiv.org/abs/2210.03094) | 一般桌面操作；多模態指令、約束、模仿、記憶與推理 | 原作場景總數待查 | 17 原生task模板（已取得版本） | 固定題目／split總數待查 | ≥ 600,000 專家軌跡（原作全集） | 環境狀態與過程檢查 |
| [ARNOLD](https://arxiv.org/abs/2304.04321) | 室內物件的連續狀態操作 | 原作場景總數待查 | 8 語言條件任務（原作全集） | 固定題目／split總數待查 | 待查／未整理 | 數值誤差與相似度／環境狀態與過程檢查 |
| [COIN](https://arxiv.org/abs/1903.02874) | 12個原生應用領域，包括車輛、工具、家務與餐飲等；不是本計畫12類的直接對應 | 影片觀測來源；錄製環境總數待整理。 | 180 人類程序活動（原作全集） | 固定評測題目與split數量待補；11,827是影片資料量。 | 11,827 影片（原作全集） | 標準答案比對／數值誤差與相似度 |
| [CrossTask](https://arxiv.org/abs/1903.08225) | 烹飪、居家DIY、車輛維護等人類程序 | 影片觀測來源；錄製環境總數待整理。 | 83 人類活動定義（18 primary＋65 related）（已取得版本） | 固定題目／split總數待查 | 待查／未整理 | 標準答案比對／數值誤差與相似度 |
| [OpenEQA](https://openaccess.thecvf.com/content/CVPR2024/html/Majumdar_OpenEQA_Embodied_Question_Answering_in_the_Era_of_Foundation_Models_CVPR_2024_paper.html) | 室內環境的記憶與主動探索問答 | > 180 問答來源的真實環境（原作全集） | 原作任務總數待查 | > 1,600 人工產生問題（原作全集） | 待查／未整理 | 人工或模型評審 |
| [RoboArena](https://arxiv.org/abs/2506.18123) | 通用實體機器人操作；跨機構分散評估 | 原作場景總數待查 | 原作任務總數待查 | 沒有固定、去重題庫總量；成對政策評估紀錄在下方另列。 | > 600 成對實體評估episodes（原作評測子集） | 人工或模型評審 |
| [EgoPlan-Bench2](https://arxiv.org/abs/2412.04447) | 4 原生大域：Work／Daily life／Hobbies／Recreation；24 細類，含 lab、blacksmith、mechanic、farmer | 24 是應用 scenario categories；不是 24 個可執行 3D 場景 | 規劃 QA 題型；不提供相同口徑的 robot G2 | 1,321 multiple-choice QA（原作全集） | 1,113 videos（原作全集） | 標準答案比對 |
| [EgoSchema](https://arxiv.org/abs/2308.09126) | 廣泛自然人類活動；來自 Ego4D subset | 3 分鐘影片片段；非 simulator scenes | 影片理解／推理問題；非操作任務庫 | ≥ 5,000 multiple-choice QA（原作全集） | ≥ 250 video hours（原作全集） | 標準答案比對 |
| [Ego4D](https://arxiv.org/abs/2110.07058) | 數百種日常情境：household、outdoor、workplace、leisure；原作未用我們12類 | 74 recording locations（原作全集） | 多個理解、記憶與預測 benchmark；不合成單一 robot 任務數 | 各 benchmark 的標註／split 分開計數，未混加 | 3,670 video hours（原作全集） | 標準答案比對／數值誤差與相似度 |
| [Ego-Exo4D](https://arxiv.org/abs/2311.18259) | skilled activity：運動、音樂、舞蹈、修車等 | 123 natural scene contexts（原作全集） | 技能理解、熟練度、跨視角、3D pose 等 benchmark | 各 benchmark 分割／題數另計 | 1,286 video hours（原作全集） | 標準答案比對／數值誤差與相似度 |
| [EPIC-KITCHENS-100](https://arxiv.org/abs/2006.13256) | 廚房日常互動 | 45 recording environments（原作全集） | 6 個 challenge endpoints；不是 6 種物理工作 | 各challenge與split的固定題數待補；動作標註全集另列。 | 100 video hours（原作全集）；700 videos（原作全集）；約 90,000 annotated actions（原作全集） | 標準答案比對／數值誤差與相似度 |
| [ARB4WM](https://arxiv.org/abs/2606.16605) | 原文摘要未足以對齊部署場域；保留其原生用途 | 摘要沒有可獨立歸一的場景／layout總數 | 20 inherited tasks（原作評測子集） | 4個Dreamer-style agents；5白箱loss objectives | 待查／未整理 | 環境狀態與過程檢查 |
| [Assembly101](https://arxiv.org/abs/2203.14712) | 玩具機械裝配、拆卸與程序錯誤 | 影片觀測來源；錄製環境總數待整理。 | 3 辨識／預測／時間分割端點（原作全集） | 固定題目／split總數待查 | 4,321 影片（原作全集） | 標準答案比對 |
| [AssemblyGrid](https://arxiv.org/abs/2609.16075) | 彈性生產、物料路由、資源分配與暫時合作 | 摘要沒有可獨立歸一的場景／layout總數 | 3 workload families（原作全集） | 受測case／episode總數未由摘要確定 | 待查／未整理 | 環境狀態與過程檢查 |
| [Assistax](https://arxiv.org/abs/2507.21638) | 輔助機器人與多agent控制 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [AutoBio](https://arxiv.org/abs/2505.14030) | biology laboratory 的儀器與實驗程序操作 | 實驗室儀器數位化場景；獨立場景總數未核 | 16 tasks（原作全集）；9 evaluated tasks（原作評測子集） | 論文選 9 tasks 做主實驗；每任務示範量另列 | 100 demonstrations per evaluated task（訓練） | 環境狀態與過程檢查 |
| [Bench2Dex](https://arxiv.org/abs/2609.15726) | 工具、關節與多階段雙手操作；部署場域仍需逐題綁定 | 摘要沒有可獨立歸一的場景／layout總數 | 26 bimanual tasks（原作全集） | 受測case／episode總數未由摘要確定 | 約 1,300 teleoperated demonstrations（原作全集） | 環境狀態與過程檢查 |
| [Breakfast](https://openaccess.thecvf.com/content_cvpr_2014/html/Kuehne_The_Language_of_2014_CVPR_paper.html) | 早餐準備與烹飪程序 | 影片觀測來源；錄製環境總數待整理。 | 10 烹飪活動（原作全集） | 固定題目／split總數待查 | > 77 錄影時數（原作全集） | 標準答案比對 |
| [CAP / EgoGym](https://arxiv.org/abs/2602.09017) | 基本接觸操作與人類觀察轉移 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [CapMem](https://arxiv.org/abs/2609.17688) | 原文摘要未足以對齊部署場域；保留其原生用途 | 摘要沒有可獨立歸一的場景／layout總數 | caption-based episodic memory | 1,000 multiple-choice QA（原作全集） | 75 videos（原作全集）；33.7 video hours（原作全集） | 標準答案比對 |
| [CaptainCook4D](https://arxiv.org/abs/2312.14556) | 烹飪程序與操作錯誤 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [Charades-Ego](https://arxiv.org/abs/1804.09626) | 居家人類活動；第一／第三視角配對 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 68,536 活動標註實例（原作全集）；68.8 第一／第三視角錄影時數（原作全集） | 標準答案比對／數值誤差與相似度 |
| [COIN（interactive）](https://arxiv.org/abs/2604.16886) | 日常部分可觀測的因果互動 | 摘要沒有可獨立歸一的場景／layout總數 | 50 COIN-50 interactive tasks（原作全集） | 受測case／episode總數未由摘要確定 | 1,000 primitive demonstrations（訓練）；50 demonstrations PER primitive task（訓練） | 環境狀態與過程檢查 |
| [COLOSSEUM](https://arxiv.org/abs/2402.08191) | 機器人操作的系統性擾動 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [Deform360](https://arxiv.org/abs/2607.05390) | 日常柔性物動態 | 摘要沒有可獨立歸一的場景／layout總數 | 2D影片／3D粒子預測端點；物件不是task | 1,980 interaction sequences（原作全集） | ≥ 215 observation hours（原作全集） | 數值誤差與相似度 |
| [DeformableRavens](https://arxiv.org/abs/2012.03385) | 柔性物的桌面空間操作 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [DexArt](https://arxiv.org/abs/2305.05706) | 關節物件的靈巧操作 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [DexGarmentLab](https://arxiv.org/abs/2505.11032) | 靈巧衣物操作 | 衣物幾何、形變、操作情境與大規模 3D assets | 15 task scenarios（原作全集） | 多衣物實例與初始形變；測例總數本輪未核 | 待查／未整理 | 環境狀態與過程檢查 |
| [DexH2R](https://arxiv.org/abs/2506.23152) | 人類到機器人的動態靈巧交接 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [DLO-Lab](https://arxiv.org/abs/2606.04206) | 繩、線、橡皮帶等DLO操作 | 摘要沒有可獨立歸一的場景／layout總數 | 原文摘要未明訂可比的任務種類總數 | 受測case／episode總數未由摘要確定 | 待查／未整理 | 環境狀態與過程檢查 |
| [DYAD](https://arxiv.org/abs/2609.09023) | 齒輪箱裝配協助 | 摘要沒有可獨立歸一的場景／layout總數 | 3 reference evaluation tasks（原作全集） | 829 eligible mode events（原作評測子集） | 20 recording sessions（原作全集）；851 assistance records（原作全集） | 標準答案比對／數值誤差與相似度 |
| [Ego-ExoLearn](https://arxiv.org/abs/2403.16182) | 人類程序的第一／第三視角轉移；應用領域續分 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EgoBody](https://arxiv.org/abs/2112.07642) | 人際肢體互動與穿戴視角 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EgoCoT-Bench](https://arxiv.org/abs/2605.19559) | 原文摘要未足以對齊部署場域；保留其原生用途 | 摘要沒有可獨立歸一的場景／layout總數 | 4 task groups（原作全集）；12 subtask groups（原作全集） | 3,172 verifiable QA（原作全集） | 351 videos（原作全集） | 標準答案比對 |
| [EgoCross](https://arxiv.org/abs/2508.10729) | 手術、工業、極限運動與動物視角；離線理解 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EgoDex](https://arxiv.org/abs/2505.11709) | 人類手部／手指操作示範與軌跡預測 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EgoHOS](https://arxiv.org/abs/2208.03826) | 人類手部及操作物件分割 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EgoHumans](https://arxiv.org/abs/2305.16487) | 多人活動及共享空間的3D感知 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EgoLife](https://arxiv.org/abs/2503.03803) | 共同生活、購物、做飯、討論、社交與娛樂 | 6 人共同生活一週；不是六個應用場域 | 生活助理／記憶 QA；非 robot task bank | 3,000 full EgoLifeQA questions（原作全集）；500 Jake subset questions（原作評測子集） | 300 video hours（原作全集） | 標準答案比對 |
| [EgoMonth](https://arxiv.org/abs/2608.13113) | 日常生活的跨天／跨月記憶 | 摘要沒有可獨立歸一的場景／layout總數 | 14 cognitive task schemas（原作全集） | 1,443 multiple-choice QA（原作全集） | ≥ 300 recording hours（原作全集） | 標準答案比對 |
| [EgoOops](https://arxiv.org/abs/2410.05343) | 跨領域人類程序的錯誤偵測 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EgoPAT3Dv2](https://arxiv.org/abs/2403.05046) | 人機互動中的3D動作目標預測 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EgoPCA](https://arxiv.org/abs/2309.02423) | 第一視角手物互動感知 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EgoPet](https://arxiv.org/abs/2404.09991) | 動物第一視角的運動與互動觀測 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EgoPlan-Bench](https://arxiv.org/abs/2312.06722) | 第一視角程序的下一步規劃 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EgoProceL](https://arxiv.org/abs/2207.10883) | 第一視角程序學習；應用領域續分 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EgoSAT](https://arxiv.org/abs/2606.24422) | 原文摘要未足以對齊部署場域；保留其原生用途 | 摘要沒有可獨立歸一的場景／layout總數 | 過去／現在／未來的streaming interaction理解 | 約 4,800 QA pairs（原作全集） | 1,997 unique videos（原作全集）；165 video hours（原作全集） | 標準答案比對／數值誤差與相似度 |
| [EgoSim / MultiEgoView](https://arxiv.org/abs/2502.18373) | 人体運動／活動與佩戴位置研究 | 4 virtual environments（原作全集） | 姿態估計等感知端點，非robot工作種類 | 受測case／episode總數未由摘要確定 | 119 synthetic video hours（原作全集）；5 real video hours（原作全集） | 數值誤差與相似度 |
| [EGOSTREAM](https://arxiv.org/abs/2605.31557) | 原文摘要未足以對齊部署場域；保留其原生用途 | 摘要沒有可獨立歸一的場景／layout總數 | 7 cognitive dimensions | 2,250 curated questions（原作全集）；8,528 recall-conditioned evaluations（原作全集） | 待查／未整理 | 標準答案比對 |
| [EgoTaskQA](https://arxiv.org/abs/2210.03929) | 室內 goal-oriented 活動與 multi-agent collaboration；LEMMA 來源 | Ego video clips；非可執行 robot 場景庫 | 4 類 reasoning question types，非 4 個物理工作 | 40,000 balanced QA（原作全集） | 368,000 candidate QA before balancing（原作全集）；2,000 egocentric videos（原作全集） | 標準答案比對 |
| [EgoThink](https://arxiv.org/abs/2311.15596) | 第一人稱日常理解與推理；應用領域續分 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 人工或模型評審 |
| [EGTEA Gaze+](https://openaccess.thecvf.com/content_ECCV_2018/html/Yin_Li_In_the_Eye_ECCV_2018_paper.html) | 廚房烹飪、凝視與動作 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 標準答案比對／數值誤差與相似度 |
| [Embodied Agent Interface](https://arxiv.org/abs/2410.07166) | BEHAVIOR 與 VirtualHome 的家庭活動；4 個決策模組 | 重用兩個原生環境；不是新建場景庫 | 100 BEHAVIOR task names（原作全集）；26 VirtualHome task names（原作全集） | 338 VirtualHome instructions/trajectories（原作全集）；100 BEHAVIOR instructions/trajectories（原作全集） | 待查／未整理 | 標準答案比對／環境狀態與過程檢查 |
| [EmbodiedMemory-Bench](https://arxiv.org/abs/2609.28236) | 原文摘要未足以對齊部署場域；保留其原生用途 | 摘要沒有可獨立歸一的場景／layout總數 | 4 memory task families（原作全集） | 2,554 interactive episodes（原作全集） | 待查／未整理 | 標準答案比對／環境狀態與過程檢查 |
| [EPIC Fields](https://arxiv.org/abs/2306.08731) | 廚房影片的相機軌跡與空間結構 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EPIC-KITCHENS](https://arxiv.org/abs/1804.02748) | 廚房日常人類物件互動 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [EPIC-KITCHENS VISOR](https://arxiv.org/abs/2209.13064) | 廚房手物互動與像素分割；沿用EPIC影片 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [FMB](https://arxiv.org/abs/2401.08553) | 一般功能性操作；具體應用領域待核 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [Follow-Bench](https://arxiv.org/abs/2509.10796) | 考慮社交互動的人員跟隨 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [H2R-Bench](https://arxiv.org/abs/2608.13049) | 人類到機器人的跨機體操作影片生成 | 原作場景總數待查 | 6 影片生成操作家族（原作全集） | 固定題目／split總數待查 | 待查／未整理 | 數值誤差與相似度 |
| [H2RBench（human transfer）](https://arxiv.org/abs/2609.24778) | 原文摘要未足以對齊部署場域；保留其原生用途 | 真實人類示範與模擬robot環境配對 | 4 manipulation tasks（原作全集） | 受測case／episode總數未由摘要確定 | 待查／未整理 | 環境狀態與過程檢查 |
| [Habitat 2.0](https://arxiv.org/abs/2106.14405) | 室內物件重排與移動操作 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [Habitat 3.0](https://arxiv.org/abs/2310.13724) | 共享室內環境中的人機合作 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [HD-EPIC](https://arxiv.org/abs/2502.04144) | 廚房活動的細粒度多模態觀測 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [HOI4D](https://arxiv.org/abs/2203.01577) | 室內人類手物互動與3D感知 | 610 資料收集的室內房間（原作全集） | 3 4D HOI評測端點（原作全集） | 固定題目／split總數待查 | 4,000 RGB-D序列（原作全集）；2,400,000 RGB-D影格（原作全集） | 標準答案比對／數值誤差與相似度 |
| [HoloAssist](https://arxiv.org/abs/2309.17024) | 人類協作的物件操作與程序指導 | 原作場景總數待查 | 3 錯誤／介入預測／手部預測端點（原作全集） | 固定題目／split總數待查 | 166 多模態錄製時數（原作全集） | 標準答案比對／數值誤差與相似度 |
| [HomeRobot](https://arxiv.org/abs/2306.11565) | 居家開放詞彙搜尋、抓取與放置 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 環境狀態與過程檢查 |
| [HOT3D](https://arxiv.org/abs/2411.19167) | 廚房、辦公與客廳的手物互動觀測 | 影片觀測來源；錄製環境總數待整理。 | 3 3D手／物件評測端點（原作全集） | 固定題目／split總數待查 | > 833 錄影分鐘（原作全集）；≥ 3,700,000 多視角影像（原作全集） | 數值誤差與相似度 |
| [HRIBench](https://arxiv.org/abs/2607.13056) | 指導、合作與干擾角色的機器人互動 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [HRIBench (perception, 2025)](https://arxiv.org/abs/2506.20566) | 人類感知問答與延遲；不等同互動控制版HRIBench | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [HUI360](https://arxiv.org/abs/2608.11051) | 自然人機互動；多環境細節另核 | 摘要沒有可獨立歸一的場景／layout總數 | 互動發生前的預測；不等同robot完成協作 | 受測case／episode總數未由摘要確定 | 1,000,000 HUI360 annotations（原作全集）；6,000,000 SSUP-HRI derived annotations（原作全集） | 標準答案比對／數值誤差與相似度 |
| [ICRA cloth competition](https://arxiv.org/abs/2508.16749) | 實體衣物展開與抓點選擇競賽 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [IKEA ASM](https://arxiv.org/abs/2007.00394) | 家具組裝與多視角觀測 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 3,000,000 多視角影格（原作全集） | 標準答案比對／數值誤差與相似度 |
| [Interact with me](https://arxiv.org/abs/2412.16698) | 互動意圖、態度與社交行為預測 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [KinDER](https://arxiv.org/abs/2604.25788) | 運動學與動力學推理；應用領域依任務 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [LabDex](https://arxiv.org/abs/2608.18618) | 化學實驗室 | 摘要沒有可獨立歸一的場景／layout總數 | 原子技能／組合技能／長流程實驗三層；摘要未明訂總數 | 受測case／episode總數未由摘要確定 | 待查／未整理 | 環境狀態與過程檢查 |
| [Labimus](https://arxiv.org/abs/2606.31037) | 有機化學實驗室 | 摘要沒有可獨立歸一的場景／layout總數 | 6 atomic operations（原作全集） | 受測case／episode總數未由摘要確定 | 待查／未整理 | 數值誤差與相似度／環境狀態與過程檢查 |
| [LabUtopia](https://arxiv.org/abs/2505.22634) | 科學實驗室 | LabScene程序生成；200+為場景／儀器混合資產，不是200房間 | 30 tasks（原作全集） | 受測case／episode總數未由摘要確定 | 待查／未整理 | 環境狀態與過程檢查 |
| [LIBERO-Plus](https://arxiv.org/abs/2510.13626) | LIBERO桌面操作的受控擾動 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [LIBERO-Recover](https://arxiv.org/abs/2609.05178) | LIBERO 衍生操作與失敗狀態 | 由模型實際失敗形成的恢復情境 | 沿用 LIBERO 操作；4 個 recovery levels 不是新增 G2 類數 | ≥ 1,000 failure scenarios（原作全集） | 待查／未整理 | 環境狀態與過程檢查 |
| [ManipBench](https://arxiv.org/abs/2505.09698) | 低階機器人操作決策；應用領域待核 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [ManiSkill](https://arxiv.org/abs/2107.14483) | 一般物件操作與資產泛化 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [ManiSkill3](https://arxiv.org/abs/2410.00425) | 原作稱 12 domains，例子含移動、humanoid、dexterous；屬能力／機體分組 | artist scenes 與 digital twins；獨立場景總數本輪未核 | 固定版本 65 task registrations；原文 12 domains 不是 12 個部署場域 | 依選用環境、資產與初態生成 | 待查／未整理 | 環境狀態與過程檢查 |
| [MetaWorld+](https://arxiv.org/abs/2505.11289) | Meta-World桌面技能修訂 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [MoDeSuite](https://arxiv.org/abs/2507.21796) | 移動操作與柔性／彈性物件 | 8 項應用啟發的操作情境；背景資產數未核 | 8 mobile manipulation tasks（原作全集） | 各任務實例／rollouts 依 protocol | 待查／未整理 | 環境狀態與過程檢查 |
| [MotionForge](https://arxiv.org/abs/2609.25689) | 動態物件操作；11種motion patterns不是11個應用領域 | 摘要沒有可獨立歸一的場景／layout總數 | 40 dynamic tasks（原作全集）；17 long-horizon tasks（原作評測子集） | 受測case／episode總數未由摘要確定 | 待查／未整理 | 環境狀態與過程檢查 |
| [NavVerse](https://arxiv.org/abs/2607.19695) | 室內到戶外的連續導航 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [NIABench](https://arxiv.org/abs/2605.01368) | 何時及如何提供非侵入式協助 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [OopsieVerse](https://arxiv.org/abs/2606.31993) | 考慮物件損壞的物理操作 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [OpenEgo](https://arxiv.org/abs/2509.05513) | 原作290人類操作activities；600+ recording environments | ≥ 600 recording environments（原作全集） | 290 human manipulation tasks（原作全集） | 受測case／episode總數未由摘要確定 | 1,107 aggregated recording hours（原作全集） | 數值誤差與相似度 |
| [Phys-Liquid](https://arxiv.org/abs/2511.11077) | 實驗室液體的形狀／體積估計 | 摘要沒有可獨立歸一的場景／layout總數 | 液體分割／3D重建／體積估計；非完整倒液控制 | 受測case／episode總數未由摘要確定 | 97,200 simulation images（原作全集） | 數值誤差與相似度 |
| [Pipette](https://arxiv.org/abs/2606.12936) | wet-lab：樣本、培養器皿、設備與精密放置 | 摘要沒有可獨立歸一的場景／layout總數 | 12 tasks（原作全集） | 受測case／episode總數未由摘要確定 | 30 demonstrations PER task（訓練） | 環境狀態與過程檢查 |
| [R2R / VLN](https://arxiv.org/abs/1711.07280) | 室內建築中的語言導航 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 數值誤差與相似度／環境狀態與過程檢查 |
| [Ravens / Transporter Networks](https://arxiv.org/abs/2010.14406) | 結構化桌面空間操作 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [REBOOT](https://arxiv.org/abs/2609.22591) | 精密裝配；工業題材 | 摘要沒有可獨立歸一的場景／layout總數 | 18 precision assembly tasks（原作全集） | 五共同phase；各phase失敗及專家恢復 | 2,160 demonstrations（原作全集） | 環境狀態與過程檢查 |
| [REFLECT / RoboFail](https://arxiv.org/abs/2306.15724) | 機器人操作失敗的說明與修復 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [REPAIR-Bench](https://arxiv.org/abs/2606.29937) | 人類對機器人失敗與恢復的偏好 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [RGBench](https://arxiv.org/abs/2511.06434) | 衣物與robot garment manipulation | 摘要沒有可獨立歸一的場景／layout總數 | 摘要未提供可比操作任務總數 | 受測case／episode總數未由摘要確定 | 待查／未整理 | 數值誤差與相似度 |
| [RH20T](https://arxiv.org/abs/2307.00595) | 真實機器人的多模態技能示範 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | > 110,000 接觸操作序列（原作全集） | 待核 |
| [RoboBench](https://arxiv.org/abs/2510.17801) | 機器人感知與推理；應用領域待核 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [RoboCasa](https://arxiv.org/abs/2406.02523) | 廚房日常操作 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [RoboDojo](https://arxiv.org/abs/2607.04434) | 操作能力；5 個 simulation capability dimensions，非 5 個應用領域 | simulation task scenes＋標準化 real evaluation setups | 42 simulation tasks（原作全集）；18 real tasks（原作全集） | 模型×任務×場景實驗量依 protocol | 待查／未整理 | 環境狀態與過程檢查 |
| [RoboFolDeX](https://arxiv.org/abs/2609.10243) | 以衣物摺疊為主要評測工作；資料另含多類操作 | 摘要沒有可獨立歸一的場景／layout總數 | ≥ 20 tasks in data resource（原作全集） | 受測case／episode總數未由摘要確定 | ≥ 2,000 real-robot data hours（原作全集） | 環境狀態與過程檢查 |
| [RoboMME-Interference](https://arxiv.org/abs/2606.22338) | 機器人記憶干擾；具體应用領域待核 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [RoboRecover](https://arxiv.org/abs/2609.28952) | 原文摘要未足以對齊部署場域；保留其原生用途 | 以實際動作前綴重播重建中途偏離狀態 | 沿用原操作任務；不是新增2,000個G2 | 2,000 deviation scenarios（原作全集）；1,000 scenarios PER platform（原作全集）；800 train scenarios PER platform（訓練）；200 test scenarios PER platform（測試） | 待查／未整理 | 環境狀態與過程檢查 |
| [RoboReel](https://arxiv.org/abs/2609.08209) | Learning from Observation 操作任務 | human demonstration videos 與 simulation task environments | 10 manipulation tasks（原作全集） | 各 suite 的 case／rollout 總數本輪未核 | 待查／未整理 | 環境狀態與過程檢查 |
| [RoboReward](https://arxiv.org/abs/2601.00675) | 機器人影片的獎勵與完成判斷 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [RoboSpatial](https://arxiv.org/abs/2411.16537) | 室內與桌面的空間理解 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 1,000,000 影像（原作全集）；5,000 3D掃描（原作全集）；3,000,000 空間關係標註（原作全集） | 標準答案比對／數值誤差與相似度 |
| [robosuite](https://arxiv.org/abs/2009.12293) | 模組化機器人操作平台；應用領域依任務 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [RobotArena infinity](https://arxiv.org/abs/2510.23571) | 真實到模擬的通用操作評測 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [RoboTwin](https://arxiv.org/abs/2409.02920) | 雙臂操作與數位分身 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [RoboVerse](https://arxiv.org/abs/2504.18904) | 整合既有操作 benchmark；276 個 task categories 非應用領域數 | 來源環境、assets 與 domain randomization；場景資產總數未歸一 | 276 task categories（原作全集） | 測例依選用 suite／protocol；跨作 G2 未完成去重 | 510,500 trajectories（原作全集） | 環境狀態與過程檢查 |
| [RoboVQA](https://arxiv.org/abs/2311.00899) | 辦公場域中的機器人／人類工作 | 3 辦公大樓（原作全集） | 原作任務總數待查 | 固定題目／split總數待查 | 29,520 不同文字指令（原作全集）；829,502 影片—文字配對（原作全集） | 標準答案比對／環境狀態與過程檢查 |
| [RoboWM-Bench](https://arxiv.org/abs/2604.19092) | 操作世界模型的物理可執行性 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 數值誤差與相似度／環境狀態與過程檢查 |
| [RoCo Challenge](https://arxiv.org/abs/2603.15469) | 工業齒輪箱裝配 | 摘要沒有可獨立歸一的場景／layout總數 | 核心行星齒輪箱完整裝配工作；多phase不直接算新G2 | 受測case／episode總數未由摘要確定 | 待查／未整理 | 環境狀態與過程檢查 |
| [RxR](https://arxiv.org/abs/2010.07954) | 多語言室內導航與路徑指涉 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 數值誤差與相似度／環境狀態與過程檢查 |
| [S-EMBER](https://arxiv.org/abs/2607.02689) | 原文摘要未足以對齊部署場域；保留其原生用途 | 摘要沒有可獨立歸一的場景／layout總數 | grounded streaming episodic retrieval | 9,448 QA pairs（原作全集） | 3,141 videos（原作全集）；388 video hours（原作全集） | 標準答案比對／數值誤差與相似度 |
| [SABER](https://arxiv.org/abs/2605.09613) | retail grocery店內活動 | 摘要沒有可獨立歸一的場景／layout總數 | 10 evaluated retail tasks（原作評測子集） | 受測case／episode總數未由摘要確定 | ≥ 100 natural recording hours（原作全集）；44,800 multi-stream training samples（訓練） | 環境狀態與過程檢查 |
| [SafeManip](https://arxiv.org/abs/2605.12386) | 家務RoboCasa365子集 | 摘要沒有可獨立歸一的場景／layout總數 | 50 inherited evaluated tasks（原作評測子集） | 6 VLA policies；全庫rollout數摘要未歸一 | 待查／未整理 | 環境狀態與過程檢查 |
| [SafeVLA-Bench](https://arxiv.org/abs/2606.00773) | LIBERO tabletop 與 RoboCasa365 kitchen | 重用既有 benchmark 場景 | 沿用原任務；不新增獨立任務種類總數 | 9 個 policy–benchmark entries；不是 9 題 | 待查／未整理 | 環境狀態與過程檢查 |
| [SIMPLER](https://arxiv.org/abs/2405.05941) | 一般操作的模擬／實體評測對應 | 原作場景總數待查 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 待核 |
| [SoftGym](https://arxiv.org/abs/2011.07215) | 布料、繩與水的技能評測；部署場域未作核心分類 | 材料技能場景與隨機初態 | 固定程式 12 registrations，含變體；不可視為已去重 G2 | 依材料、配置與 seed 生成 | 待查／未整理 | 環境狀態與過程檢查 |
| [SoftVTBench](https://arxiv.org/abs/2608.18701) | 原文摘要未足以對齊部署場域；保留其原生用途 | 摘要沒有可獨立歸一的場景／layout總數 | 總task種類未由摘要確定；12個ID實驗config不是12種任務 | 受測case／episode總數未由摘要確定 | 4,000 expert demonstrations（原作全集） | 數值誤差與相似度／環境狀態與過程檢查 |
| [TACO](https://arxiv.org/abs/2401.08399) | 日常雙手工具操作 | 摘要沒有可獨立歸一的場景／layout總數 | 3 HOI evaluation endpoints（原作全集） | 約 2,500 motion sequences（原作全集） | 待查／未整理 | 標準答案比對／數值誤差與相似度 |
| [The Imitator Game](https://arxiv.org/abs/2608.22301) | 6 原生領域：Household、Supermarket、Restaurant、Logistics、Hospital、Laboratory | 跨六領域的 human–robot 對齊情境；獨立場景資產總數未核 | ≥ 50 base tasks（原作全集）；53 listed per-domain base tasks（原作全集） | paired episodes 是資料資源，不是每個模型都跑過的 test cases | ≥ 20,000 paired episodes（原作全集）；約 11,700 real paired episodes（原作全集）；約 10,000 simulation paired episodes（原作全集） | 環境狀態與過程檢查／人工或模型評審 |
| [VLABench](https://arxiv.org/abs/2412.18194) | 日常操作、知識／常識與隱含意圖；100 是任務分類，不是領域數 | 隨機化操作情境；独立環境資產總數本輪未核 | 100 task categories（原作全集） | 每類可隨機化；固定全庫 case 數未核 | 待查／未整理 | 環境狀態與過程檢查 |
| [VLOG](https://arxiv.org/abs/1712.02310) | 居家日常互動與生活VLOG | 影片觀測來源；錄製環境總數待整理。 | 2 影片／影格接觸判斷端點（原作全集） | 固定題目／split總數待查 | 待查／未整理 | 標準答案比對 |
| [WireCraft](https://arxiv.org/abs/2606.18097) | 工業線材裝配 | 摘要沒有可獨立歸一的場景／layout總數 | 3 task families（原作全集） | 受測case／episode總數未由摘要確定 | 待查／未整理 | 環境狀態與過程檢查 |
| [X2Real](https://arxiv.org/abs/2609.27449) | 10項能力維度；非10個部署場域 | 摘要沒有可獨立歸一的場景／layout總數 | 44 hierarchical tasks（原作全集） | 受測case／episode總數未由摘要確定 | 約 300 annotated simulation hours（原作全集） | 環境狀態與過程檢查 |
| [YouCook2](https://arxiv.org/abs/1703.09788) | 烹飪教學與程序分割 | 影片觀測來源；錄製環境總數待整理。 | 原作任務總數待查 | 固定題目／split總數待查 | 待查／未整理 | 標準答案比對／數值誤差與相似度 |

完整CSV／JSON逐筆保留版本、split、出處和查核狀態。G／T、家族、規則和執行次數為詳細資料，不再作主要閱讀門檻。
