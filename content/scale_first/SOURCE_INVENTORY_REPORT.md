# 完整來源任務庫：首輪靜態盤點

查核日期：2026-09-22。所有來源皆固定 commit，沒有執行上游程式或下載場景資產。

目前提取 **5,020 筆原生紀錄**，來自 **20 個官方 repository、21 個版本化來源**。ManiSkill 的目前版與較早版本分別保留，因為不能假設新版完整包含所有舊任務。

**這是來源盤點進度，不是本計畫已完成的 G2 任務數。** 活動目錄、task ID、class、schema、場景入口、整合註冊和生成配置的單位不同；跨工作去重、可解性及判分驗證尚未完成。

## 1. 先按紀錄型態分開

| 類別 | 原生紀錄數 |
|---|---:|
| 原生任務候選紀錄（仍含不同粒度與跨來源重複） | 2,037 |
| 示範程式入口 | 10 |
| 整合框架／協定／生成配置紀錄 | 2,906 |
| 人類影片配對／認知任務 schema | 67 |

其中 106 筆有原生場景檔案引用，均來自 RLBench 的 `.ttm` 對應；只確認引用存在，沒有下載或驗證其內容。

## 2. 各來源的完整提取結果

| 來源 | 本次提取 | 原生單位 | 固定版本 |
|---|---:|---|---|
| BEHAVIOR-1K | 1,016 | 活動定義目錄 1016 | [4b0f43dfb7](https://github.com/StanfordVL/BEHAVIOR-1K/tree/4b0f43dfb7f7f759e5e9f575e8d72f56492eab5f) |
| LIBERO | 130 | 原生任務 ID 130 | [8f1084e313](https://github.com/Lifelong-Robot-Learning/LIBERO/tree/8f1084e3132a39270c3a13ebe37270a43ece2a01) |
| RoboCasa / RoboCasa365 | 365 | 原生任務 ID 365 | [4f8a2980de](https://github.com/robocasa/robocasa/tree/4f8a2980def75a55dff96b990745b83540425f09) |
| RLBench | 106 | 任務類別實作 106 | [02720bba4c](https://github.com/stepjam/RLBench/tree/02720bba4c73fe02eb75df946b8791b806028a9d) |
| Meta-World | 50 | 原生任務 ID 50 | [59fc34d776](https://github.com/Farama-Foundation/Metaworld/tree/59fc34d7768af9785e4688c3e1db671424f4a6c3) |
| ManiSkill current | 65 | 任務註冊項 65 | [62ff3a5896](https://github.com/mani-skill/ManiSkill/tree/62ff3a5896b4d5b4cf0ac4c8d79afe600c9404a3) |
| ManiSkill2 v0.5.3 | 21 | 任務註冊項 21 | [493be36121](https://github.com/mani-skill/ManiSkill/tree/493be36121a9dd06071a57172274babe617b789f) |
| VLABench | 96 | 任務註冊項 96 | [cf588fe60c](https://github.com/OpenMOSS/VLABench/tree/cf588fe60c0c7282174fe979f5913170cfe69017) |
| RoboTwin | 50 | 任務模組 50 | [6dde57155e](https://github.com/RoboTwin-Platform/RoboTwin/tree/6dde57155eafa3e4ebf6ad1f93a7cf7d5d41a755) |
| SoftGym | 12 | 原生任務 ID 12 | [bb383f64cd](https://github.com/Xingyu-Lin/softgym/tree/bb383f64cd488062587714abbae38f27ed9f2457) |
| DeformableRavens | 25 | 原生任務 ID 25 | [73982748bd](https://github.com/DanielTakeshi/deformable-ravens/tree/73982748bdfe756e04553e28698948facccecb41) |
| GarmentLab | 10 | 示範程式入口 10 | [6ee0620fdd](https://github.com/GarmentLab/GarmentLab/tree/6ee0620fddb8083d5eab554fa343cdc966c61d5f) |
| DexGarmentLab | 15 | 任務場景入口 15 | [e4e298e696](https://github.com/wayrise/DexGarmentLab/tree/e4e298e696bae5d866ded3b31e0ae27becea5376) |
| ALFRED | 7 | 任務 schema 7 | [f91f4c0c96](https://github.com/askforalfred/alfred/tree/f91f4c0c96c7a29f33d0557f86b0a21035379b3b) |
| TEACh | 25 | 任務 schema 25 | [903191e256](https://github.com/alexa/teach/tree/903191e256da866a603d1bbfb21db34e0874392d) |
| PARTNR | 6 | 生成／協作設定 6 | [ddfff19f4b](https://github.com/facebookresearch/partnr-planner/tree/ddfff19f4b6c098a31edea4d19e7b75db72433c2) |
| RoboVerse | 2,897 | 整合框架註冊組 2897 | [5f3ec0185d](https://github.com/RoboVerseOrg/RoboVerse/tree/5f3ec0185d2d3bcb59d53b0bd1f5b0f8a6f2ce14) |
| Embodied Agent Interface | 3 | 評測協定入口 3 | [531c62f8df](https://github.com/embodied-agent-interface/embodied-agent-interface/tree/531c62f8df2cb392bdf1907923c76da41cad4fe6) |
| WatchAct | 14 | 影片任務 schema 14 | [7036927a94](https://github.com/Baiqi-Li/WatchAct/tree/7036927a94a160e7d420e3f7156cd5b2e9e8f3e6) |
| The Imitator Game | 53 | 人類／模擬任務映射 53 | [d6d16ec511](https://github.com/imitator-game/The-Imitator-Game/tree/d6d16ec511bc389e0a207692730c137bc022ef14) |
| RoboDojo | 54 | 任務模組 54 | [726e9aabfa](https://github.com/RoboDojo-Benchmark/RoboDojo/tree/726e9aabfaa642203722eb126f5eaf0f37f3e1ad) |

## 3. 會改變規模比較的查核結果

**RoboCasa：完整任務目錄與有資料的子集不同。** 固定版本的官方 task catalogue 有 365 個名稱，dataset registry 只有 317 個對應名稱。此次保留全部 365，另外記錄是否出現在 dataset registry，避免把資料子集誤當完整 benchmark。

**RoboVerse：註冊名不等於獨立任務。** 本次讀到 2,897 組 literal task registrations；同一註冊呼叫的別名保存在同一紀錄。兩個 ManiSkill 整合檔案合計 2,589 組，其中 2,587 個衍生 class 只賦值 `scenario` 和／或 `traj_filepath`、没有自己的方法覆寫；另有 2 個基類。這是可查核的配置展開現象，不是整個 RoboVerse 被正式歸一成兩個任務。

這兩個檔案的基類還明示了與原 ManiSkill checker 或幾何設定的差異。因此，跨框架的 task 名相似也不能直接宣告完整語義等價。

**WatchAct：14 個原生『tasks』是認知評測 schema。** 官方表包含 imitation、reversal、count、state change 等類型。不能直接把它們視為 14 個唯一的機器人操作 G2；完整物理任務數需連外部 JSONL／BDDL 與目標定義一起審核。

**The Imitator Game：保留 base mapping 與 levels。** 此次提取 53 個人類／模擬任務映射，L0–L3 和其他原生 IDs 保留為對應欄位，沒有將每個 level 都自動多算一個 base task。

**舊 repo／版本要另外確認。** 舊 BDDL URL 會導向 100 活動版本；BEHAVIOR-1K 應讀目前官方 monorepo 的 bddl3 subtree。ManiSkill2 的舊 repo 是轉址指引，實際較早 task bank 改由官方保留的 v0.5.3 commit 盤點。

## 4. 已完成與未完成

- 已完成：固定版本、樹未截斷檢查、原生 ID／class／schema 提取、別名保留、部分來源關係、型態分列及計數一致性驗證。
- 尚未完成：全庫 G2 正規化、跨來源語義去重、資產下載、實例化、專家可解性、evaluator 與模型實驗。
- 所有正式 instance／case／rollout 數仍為 0；正式 G2 數為 TBD。

## 5. 下一步如何服務規模目標

以這份可追溯盤點作為 2,000–3,000 個 G2 研發目標的輸入。先確定去重、可復用且可驗證的任務聯集，再用新目標結構、必要流程與互動機制補足缺口。不能用這裡的 5,020 直接宣稱已超過既有 benchmark。

每個比較工作要同時保留原生計數、正規化任務數、可取得資產範圍和實際評測集合。整合框架不可被忽略，也不可與它引入的上游任務重複加總。

## 6. 檔案與重建

- `native_source_inventory.csv/json`：所有原生紀錄、固定來源、型態、別名與證據界線。
- `source_extraction_report.json`：各來源的提取規則、計數與未解決問題。
- `pinned_sources.json`：官方 repo、commit、原生來源範圍。
- `source_catalogue.json`、`fetch_sources.py`、`extract_inventory.py`：可重建的來源盤點入口。

原始程式僅存於本機研究 cache，不放入網站輸出；公開輸出主要是 task IDs、路徑、來源鏈、metadata 與本計畫的分析。
