# 還有哪些沒完善：設計與證據審查

審查日期：2026-09-25。設計 v0.4；比較表快照 2026-09-22；原文獻快照 2026-09-21。本次檢查既有專案資料，沒有重新宣稱完成新一輪文獻搜尋，也沒有執行機器人實驗。

**主要缺口是：比較證據尚未核完、正式任務與覆蓋計數尚未定稿、可執行與評測證據尚未建立。** 大規模與廣覆蓋仍是共同目標；這份審查把達標前的工作拆成可交付清單。

## 1. 這次查到的數字

| 項目 | 目前紀錄 | 能說明什麼 |
|---|---|---|
| 前作領域矩陣 | 330／396 格待核，83.3% | 我們的整理尚未完成，不是前作沒有這些領域 |
| 前作能力矩陣 | 200／297 格待核，67.3% | 同樣不能把未知當成能力缺席 |
| 文獻快照 | 168 篇；55 篇標示完整摘要審阅 | 摘要審閱不等於完整全文審計；不是窮盡所有工作 |
| 比較原文查核 | 33 項前作、39 份摘要／指定章節文件 | 與原書目重疊，不另加成更多獨立論文 |
| 來源盤點 | 5,020 筆異質原生紀錄 | 不等於正式 G2 任務数 |
| G2、相對任務／廣度分母 | 全部仍待確認 | 2,000–3,000 與 2× 是研發目標 |
| 實際驗證 | G3／G4／simulator trials／human pairs 均未建立 | 網站與資料檢查不是 robot 能力證據 |

矩陣中的「有」也需要看證據層：來源場景、影片題材、明確任務和實際評測支撐並不相同。現在是文獻層映射；正式 coverage cell 還要求 task／instance／reset／expert／evaluator 證據。

## 2. 待完成項目與驗收

| ID | 優先序 | 類型 | 缺口 | 下一份交付物 | 狀態 |
|---|---|---|---|---|---|
| GAP-01 | P0 | 整理與證據 | 正式任務表、去重結果與 2× 分母尚未完成 | source native ID → canonical G2 對照表、合併／拆分理由、版本／scope 分層的數量表，以及最大可比參照集。 | 待完成 |
| GAP-02 | P0 | 整理與證據 | 比較矩陣待核格子多，逐格證據仍不完整 | 逐格 evidence ledger：來源版本、定位、代表 task IDs、task／asset／video／evaluation 支撐類型、審閱者與分歧處理；另將複合文字數量拆成 typed count records。 | 待完成 |
| GAP-03 | P0 | 設計需定案 | 共同 F／K 分類與交叉覆蓋還缺可執行的標註手冊 | 版本化 D／F／K codebook、納入與排除正反例、主要 family 規則、必需機制判定、跨作獨立覆核與粗／細粒度敏感性分析。 | 待完成 |
| GAP-04 | P0 | 設計需定案 | 獨立場景、layout 與資產的規模目標尚未訂 | scene asset／layout／style／object asset／G3 state 分層台帳；訂出要主張的尺度、相容來源和有效綁定目標。 | 待完成 |
| GAP-05 | P0 | 整理與證據 | 哪些任務是復用、修改或新增，尚無逐項增量表 | 對照前作聯集的增量 ledger：原任務、修改內容、新目標／必要流程、使用理由、所補覆蓋格子與判分要求。 | 待完成 |
| GAP-06 | P0 | 實作與實驗 | Backend × 材料 × 機體的可行性與實際 adapters 未建立 | 相容性矩陣、固定版本／controller／sensors、reset／step／trace adapter，以及跨主要物理與機體條件的 6–8 個初始閉環。 | 待完成 |
| GAP-07 | P0 | 實作與實驗 | 可解性、判分器與恢復協定尚缺實際驗收證據 | 按 family／material 建立 evaluator、獨立成功與失敗樣本、量測有效性標記、reset／介入紀錄與 reviewer 審核。 | 待完成 |
| GAP-08 | P1 | 實作與實驗 | Ego、身體相機與 VLOG 尚未形成實際影片—任務配對庫 | 來源影片與 session 清單、相機／剪輯／時間 metadata、goal pairing、資訊充分性與 A/B 目標審核，按來源類型列實際適用任務數。 | 待完成 |
| GAP-09 | P1 | 設計需定案 | 基線名單、相容集合與排名權重尚未凍結 | 每個 execution track 的固定 baseline panel、完整相容集合、域內 family／task 權重、缺測／超時／崩潰處理與配對分析規則。 | 待完成 |
| GAP-10 | P1 | 實作與實驗 | 來源 lineage、資料切分和可取得資源仍只有規則／示例 | 全庫來源依賴圖、train／validation／test ID manifests、衍生資產／腳本／影片群組、明確 held-out 軸，以及各資源取得／發布條件紀錄。 | 待完成 |
| GAP-11 | P1 | 實作與實驗 | 難度只有定義與提案，尚無校準結果 | 固定方法群與 contract 的重複結果、可解性檢查、難度與鑑別力分析、校準集邊界和版本敏感性。 | 待完成 |
| GAP-12 | P1 | 設計需定案 | 人力、吞吐、移植成本與可交付時程尚未量測 | 按 backend／material 的單位成本與成功移植率、儲存／標註／執行需求、實際負責人及每批驗收排程。 | 待完成 |
| GAP-13 | P1 | 整理與證據 | 文獻是 scoped inventory，尚未完成可稱全面的檢索與深讀 | 檢索截止日、資料庫／query、納入排除條件、前後向引用追查、全文審閱優先集，以及統一 bibliography／version lineage。 | 待完成 |
| GAP-14 | P2 | 文件與版本 | 單一最新版完整 PDF 尚未整合 v0.4 與比較矩陣 | 帶版本導讀的最新整合 PDF，或清楚分層的 current bundle：新版主文、比較表、待完成事項與明確標為歷史的附錄。 | 待完成 |
| GAP-15 | P1 | 文件與版本 | 入口版本與網站公開狀態曾互相矛盾 | 本次修正 root README、PROJECT_STATUS、handbook 導讀，建立版本索引、S0–S6 CSV 和公開待完成事項頁；舊入口保留快照。 | 本次文件修正 |

## 3. 哪些原則已經清楚，接下來要落地

G0–G5、來源／任務／實例／測例、跨場域與機體不重複增加 G2、T5／T6 主線、合法 packets、來源優先切分、恢復分母和難度依 contract／agent panel 定義，已有文件。缺的是共同代碼表、實際 manifests、可解實例、評分程式和結果，而不是再次寫相同的原則。

兩個仍需定案的細節：

- 每域至少 8 families 與 3 mechanisms，不自動等於 24 個有效交叉格子。要保存真正被任務支持的 D×F×K 聯集，不能乘標籤數。
- 2× 覆蓋門檻需要共同分類的參照分母與可達範圍。若共同分類粒度改變，所有比較工作都要重新映射；不能只拆細我們的分類。

## 4. 接下來最值得先交付什麼

先完成三份能直接推進實作的產物：

1. **共同任務與增量表**：來源 ID → G2、合併／拆分理由、復用／修改／新增，以及補足的場域／機制。
2. **主要前作的逐格查核表**：頁码／表格／task IDs、證據層與未確定範圍，優先完成影響規模分母的對照。
3. **Backend × 材料 × 機體閉環與成本表**：先按 S2 做 6–8 個代表 anchors，取得真實可解性、判分和製作成本，再向 250／500／1,000 與正式全庫批次擴展。

這三份產物決定後續新增多少任務、哪些場景真能復用，以及大規模主實驗需要多少資源。原本的 2,000–3,000 初始目標和共同廣度要求保持不變，必要時依共同參照上調。

## 5. 本次直接修正的整理問題

- Root README 與 PROJECT_STATUS 指向 v0.4、比較表和本審查，區分已公開的研究網站與尚未完成的正式評測服務。
- 257 頁 PDF 的導讀明確標為 v0.2 歷史快照；完整最新單一 PDF 尚未合併，保留在 GAP-14。
- 新增 S0–S6 的結構化 milestones CSV，舊 M0–M7／100–140 預算標成歷史方案。
- 比較頁直接顯示全 33 項前作的待核比例，並連到待完成事項；沒有把 unknown 自動補為「有」或「沒有」。

## 6. 逐項依據與驗收條件

### GAP-01｜正式任務表、去重結果與 2× 分母尚未完成

目前：有 5,020 筆異質來源紀錄與 G2 定義原則；本計畫和前作的共同 G2 數仍為 null，兩個相對門檻的分母也未定。

影響：不能由来源筆數推出已有 2,000–3,000 種任務，也不能證明任務規模領先。

交付物：source native ID → canonical G2 對照表、合併／拆分理由、版本／scope 分層的數量表，以及最大可比參照集。

驗收：每個被計數的 task spec 有 typed goal、必要過程、指涉與角色／機制條件；共同規則同樣用於前作，分歧經覆核。場域與機體綁定不增加全球 G2。

階段：S1；實例與判分證據續接 S2–S4

專案依據：`planning/overall_design/overall_design_plan.json`、`planning/scale_first/inventory_statistics.json`、`planning/granularity/scale_schema.json`

### GAP-02｜比較矩陣待核格子多，逐格證據仍不完整

目前：33 項前作的領域／能力矩陣有大量 unknown；目前主要提供每列原文，未逐格連到頁碼、表格、task IDs 和支撐範圍。有些正例是場景用途或題材映射。

影響：矩陣可作查核入口，尚不能用來證明前作欠缺某領域，或計算已驗證的覆蓋倍數。

交付物：逐格 evidence ledger：來源版本、定位、代表 task IDs、task／asset／video／evaluation 支撐類型、審閱者與分歧處理；另將複合文字數量拆成 typed count records。

驗收：優先完成主要規模參照的相關格子；未知保持未知。原作報告、題材推測、實例支持與本計畫重跑證據分開，不因缺公開資料把分母當成 0。

階段：S1

專案依據：`planning/comparison/benchmark_matrix.json`、`planning/comparison/source_verification.json`、`planning/comparison/build_comparison.py`

### GAP-03｜共同 F／K 分類與交叉覆蓋還缺可執行的標註手冊

目前：有 12 場域、48 個作者家族，以及文字中的 K01–K09 提案；K 尚未作為定版欄位進入 taxonomy.json，跨作共同 family mapping 也未完成。

影響：不同人可能採不同粒度；增加標籤會改變 coverage cells，尚不能把它當客觀完整量尺。

交付物：版本化 D／F／K codebook、納入與排除正反例、主要 family 規則、必需機制判定、跨作獨立覆核與粗／細粒度敏感性分析。

驗收：同一規則適用全部比較工作；每格可回查有效任務和實例。每域 8 個家族與 3 類機制只保證各軸數量，不自動保證 8×3 個有效交叉格。

階段：S1

專案依據：`taxonomy.json`、`task_families.json`、`planning/overall_design/OVERALL_DESIGN_V0_4.md`

### GAP-04｜獨立場景、layout 與資產的規模目標尚未訂

目前：有 30,000 G3 的條件式預算示例，但沒有獨立場景資產或 layout 的正式目標、來源清單與去重規則。

影響：不能用初態實例數宣稱場景資產比前作多；大規模主張仍缺這個尺度。

交付物：scene asset／layout／style／object asset／G3 state 分層台帳；訂出要主張的尺度、相容來源和有效綁定目標。

驗收：layout 或 style 組合、物件版本與新初態分開計數；每個宣稱支持的場域由任務相關環境條件支持。

階段：S1 計數定案；S2–S4 建置

專案依據：`planning/comparison/benchmark_matrix.json`、`planning/overall_design/overall_design_plan.json`

### GAP-05｜哪些任務是復用、修改或新增，尚無逐項增量表

目前：設計已提出三種來源途徑，但尚未得到去重後的 reused／modified／new 任務集合及其覆蓋增量。

影響：目前能說明研發方向，還不能以數據區分重新包裝與新 benchmark 貢獻。

交付物：對照前作聯集的增量 ledger：原任務、修改內容、新目標／必要流程、使用理由、所補覆蓋格子與判分要求。

驗收：新增 ID、改色、背景、camera、seed 或不必要的步驟不自動算新任務；修改版仍需依共同語義規則判斷是否是新的 G2。

階段：S1–S4

專案依據：`planning/overall_design/OVERALL_DESIGN_V0_4.md`、`planning/scale_first/SCALE_FIRST_SPEC_V0_3.md`

### GAP-06｜Backend × 材料 × 機體的可行性與實際 adapters 未建立

目前：有候選平台、profile 與接口草案；已登記的有效實例、simulator trials 和正式 adapters 仍未完成。

影響：無法確認廣度配額能在哪些環境與控制條件下落地，也無法估計移植成功率。

交付物：相容性矩陣、固定版本／controller／sensors、reset／step／trace adapter，以及跨主要物理與機體條件的 6–8 個初始閉環。

驗收：每個 anchor 有實際 assets、可追蹤初態、同介面專家執行和有效 trace；平台狀態機、視覺動畫與材料物理各自標明支撐範圍。

階段：S2；其後逐批擴到 S3–S4 的全庫

專案依據：`IMPLEMENTATION_PLAN.md`、`episode_template.json`、`planning/overall_design/overall_design_plan.json`

### GAP-07｜可解性、判分器與恢復協定尚缺實際驗收證據

目前：成功／合規成功、合法替代、近失敗與恢復分母的原則已寫；量測容差、判分程式及實際正反例未校準。

影響：不能確定成功率代表完成任務，也不能把所有模型失敗直接解讀成高難度。

交付物：按 family／material 建立 evaluator、獨立成功與失敗樣本、量測有效性標記、reset／介入紀錄與 reviewer 審核。

驗收：接受合法替代並拒絕假成功；GoalSuccess／CompliantSuccess 分開；完整 episode、介入施加率、条件恢复和固定快照診斷分開。

階段：S2，持續至每批 S3–S4

專案依據：`EVALUATION_PROTOCOL.md`、`metrics_catalogue.json`、`scenario_specs/SC-H15.json`

### GAP-08｜Ego、身體相機與 VLOG 尚未形成實際影片—任務配對庫

目前：有觀測分類、配對層級和 300–500 G2 目標；本計畫收集／接入的人類影片 pairs 為 0。

影響：還不能主張支援各種影片來源的執行評測，或確定影片提供了必要且足夠的目標資訊。

交付物：來源影片與 session 清單、相機／剪輯／時間 metadata、goal pairing、資訊充分性與 A/B 目標審核，按來源類型列實際適用任務數。

驗收：人類影片和 robot 合成影片分開；same-goal pairing 不宣稱幾何對齊；剪輯或遮擋改變可推斷性時同步修訂合法答案／測例。

階段：S1 資源確認，S2–S4 配對驗收

專案依據：`DATA_AND_SPLITS.md`、`goal_pair_templates.json`、`planning/overall_design/overall_design_plan.json`

### GAP-09｜基線名單、相容集合與排名權重尚未凍結

目前：已有分榜、相同 contract、macro／micro 與 oracle 原則；仍缺具名 checkpoint、action／sensor 約定、數據／推理預算與完整 eligible manifest。

影響：尚不能保證不同模型的成績可比；8 個完整相容方法只是預算假設。

交付物：每個 execution track 的固定 baseline panel、完整相容集合、域內 family／task 權重、缺測／超時／崩潰處理與配對分析規則。

驗收：模型不得自選擅長測例；不同資訊／機體／學習設定分層。同 G2 跨域或同來源 clips 的依賴，須保留在聚合與不確定性估計中。

階段：S3 校準；S5 正式凍結

專案依據：`EVALUATION_PROTOCOL.md`、`planning/overall_design/OVERALL_DESIGN_V0_4.md`、`episode_template.json`

### GAP-10｜來源 lineage、資料切分和可取得資源仍只有規則／示例

目前：已有來源優先切分、asset／session 關係與預訓練未知的處理原則，但沒有建立全庫實際 split manifest 和重疊查核。

影響：泛化結果尚無資料隔離證據；不同名稱的資料集或移植任務可能共享來源。

交付物：全庫來源依賴圖、train／validation／test ID manifests、衍生資產／腳本／影片群組、明確 held-out 軸，以及各資源取得／發布條件紀錄。

驗收：先切來源群組，再生成 clips、QA、plans 或 pairs；每個泛化主張有對應的重疊報告。無法審核的模型預訓練保持未知。

階段：S1–S4；S5 前凍結

專案依據：`DATA_AND_SPLITS.md`、`source_lineage_examples.csv`、`planning/scale_first/pinned_sources.json`

### GAP-11｜難度只有定義與提案，尚無校準結果

目前：有十維設計描述與固定 agent panel 下的經驗難度公式；尚無 method×case 結果矩陣、信賴區間或校準分級。

影響：不能替來源紀錄或前作填通用難度分數，也不能把步數、影片長度或實作階段當難度。

交付物：固定方法群與 contract 的重複結果、可解性檢查、難度與鑑別力分析、校準集邊界和版本敏感性。

驗收：先排除壞題／錯判分；保留不確定性並測試換模型群的影響。分類邊界在正式 test 前凍結，難度不單由任務名稱決定。

階段：S3 校準；S5 分層主實驗

專案依據：`METRICS_AND_DIFFICULTY.md`、`planning/overall_design/OVERALL_DESIGN_V0_4.md`

### GAP-12｜人力、吞吐、移植成本與可交付時程尚未量測

目前：資源僅描述為充足；2.88M 主執行量是條件式算術，沒有對應的每 task 製作成本、失敗率、episode 耗時和硬體排程。

影響：尚不能把大型全庫目標換算成交付日期或硬體預算。

交付物：按 backend／material 的單位成本與成功移植率、儲存／標註／執行需求、實際負責人及每批驗收排程。

驗收：用 S2／S3 真實吞吐估算成本與容量，保留失敗重做、資料收集和消融成本；不能把舊 24 週示例當新版承諾。

階段：S2 量測，S3 每批更新

專案依據：`release_plan.json`、`planning/overall_design/overall_design_plan.json`、`planning/paper_milestones.csv`

### GAP-13｜文獻是 scoped inventory，尚未完成可稱全面的檢索與深讀

目前：原快照有 168 篇，其中 55 篇標示完整摘要審閱；比較頁另外核對 33 項前作的 39 份來源文件。這些集合重疊，不能相加。AutoBio 尚未納入原書目快照。

影響：不能說已找齊全部 robot-use／Ego prediction 研究，或用篇數分布直接決定任務配額。

交付物：檢索截止日、資料庫／query、納入排除條件、前後向引用追查、全文審閱優先集，以及統一 bibliography／version lineage。

驗收：對 simulation、human-video-to-robot、Ego forecasting、柔性物、協作與評測各線記錄檢索覆蓋；新來源更新書目與對照表，同作版本不重複算獨立工作。

階段：S1，投稿前再次更新

專案依據：`literature_snapshot.json`、`planning/comparison/benchmark_matrix.json`、`planning/comparison/source_verification.json`

### GAP-14｜單一最新版完整 PDF 尚未整合 v0.4 與比較矩陣

目前：257 頁完整 PDF 是 v0.2 歷史快照；v0.4 設計、35 列比較表與本次審查分在新文件／網站。

影響：只讀舊 PDF 的讀者會漏掉新版規模目標與比較證據，尚未達成只讀一份最新完整檔案就掌握全部的目標。

交付物：帶版本導讀的最新整合 PDF，或清楚分層的 current bundle：新版主文、比較表、待完成事項與明確標為歷史的附錄。

驗收：PDF／網站／CSV 指向一致的版本與計数，目錄和連結核驗；舊方案不得仍被當作当前預算。

階段：文件發布批次

專案依據：`handbook/README.md`、`handbook/ROBOT_USE_BENCHMARK_MASTER_REPORT.pdf`、`web/site.config.json`

### GAP-15｜入口版本與網站公開狀態曾互相矛盾

目前：審查前 root README 仍寫 v0.3 為最新，PROJECT_STATUS 和部分導讀仍寫未公開；舊 M0–M7 CSV 未與 S0–S6 並列清楚。

影響：同一專案讀不同入口，容易把舊 100–140 預算、歷史 PDF 和當前設計混在一起。

交付物：本次修正 root README、PROJECT_STATUS、handbook 導讀，建立版本索引、S0–S6 CSV 和公開待完成事項頁；舊入口保留快照。

驗收：當前入口指向 v0.4 與比較表；公開研究網站與未建置的 benchmark execution service 分開。歷史檔案保留其原版本。

階段：本次文件修正

專案依據：`README.md`、`PROJECT_STATUS.md`、`handbook/README.md`、`archive/frontmatter_before_2026_09_25/manifest.json`
