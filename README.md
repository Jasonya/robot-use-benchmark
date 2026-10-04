# Robot-use Benchmark：逐篇來源審閱與任務聯集

目前版本 **v0.11（用途歸納更新2026-10-04）**：先閱讀原作，再分類與比較，最後建立任務聯集及規則擴充。

- 現有250篇書目完成初篩；原143來源加40個補入來源，共183份有關鍵章節閱讀紀錄。其餘67篇方法／原作實驗／survey參考保留篩查理由。
- 672筆數量摘錄附原文單位、PDF頁碼、版本與SHA256；每份來源都有領域、環境、任務、題數、判分、split、重用關係和限制。
- 183/183份來源均已歸類，原22份缺口已補齊；共有21類用途、431筆來源—用途對應。依任務、對象、場景與目標判定，附逐篇理由與頁碼。新增通用作業、協助交接、穿戴互動三類；分類與實際執行仍分別記錄。
- 既有ID清單仍為284場景條目、2,096robot任務條目、另7資訊題型及263人類活動、114,288筆題目元資料（含train）。不同單位不能相加成已去重的全庫規模。

v0.9先訂的1,000場景／5,000任務／100萬題配額已撤回；目標欄為null，未把未知值填0。來源審閱不等於逐題複核、全資產取得或模型執行；尚未窮盡全球相關文獻。

入口為 `zh-hant/coverage.html`、`zh-hans/coverage.html`；全文為 `source-report.html`。本輪繁／簡PDF與Markdown、JSON、CSV在 `downloads/source-review/`，原始PDF只保存在忽略的本機cache，不重新發布。

審閱輸入：`content/fulltext_review/batch*.json`、`screening.json`、`codebook.json`、`domain_assignments.json`。`scripts/source-review-model.mjs`驗證身份、頁碼、183份用途判定及每個標籤的任務證據，以及數量單位，建立網站与下載表。取得PDF或自動命中關鍵字不會自動標成讀過。

```sh
npm ci
npm run build
npm run verify
npm run serve
```

`docs/`為GitHub Pages發布目錄；push main後自動建置、驗證、發布。瀏覽器檢查：`ROBOT_TEST_URL=http://127.0.0.1:8798/robot-use-benchmark/ node scripts/browser-check.mjs`（需Chrome）。

用途歸納方法和原22份對照表在 `coverage.html#domain-method` 與 `coverage.html#domain-reclassifications`。舊 `domain=unspecified` 連結會顯示這22份已完成歸類的來源。v0.10的18類／22未歸類快照及109頁PDF已移至歷史檔案。

<details>
<summary>歷史版本紀錄：以下配額和「當時有效」說明已退役</summary>

# Robot-use Benchmark：本版規劃目標與目前清單實數

**目前有效版本 v0.9（2026-10-02）**。同一份 `content/quantified/numbers_contract.json` 產生首頁、Coverage、設計和下載報告的目標；實數来自逐筆ID清單及 `inventory_summary.json`。

| 項目 | 本版規劃目標 | 目前清單實數 |
|---|---:|---:|
| 領域 | 12 | 12條定義 |
| 場景／layout | 1,000 | 284份原作命名定義 |
| 任務規格 | 5,000（2,000基本＋3,000規則擴充） | 2,103條來源任務／題型（2,096robot＋7資訊） |
| 題數 | 1,000,000（控制50萬／QA30萬／預測20萬） | 114,288筆題目定義元資料 |
| 判分方式 | 4 | 4個分類定義 |

**目前實數不是模型實測完成量。** 新增題目清單保留PARTNR111652 train＋1000 val，以及OpenEQA1636；素材與通用評分器整合仍待完成。mini／2k／未驗證池沒有重加。原生source索引現在是5,349條，與任務規格、場景或題數不同。

場景、任務、題目ID與來源hash可從 `downloads/quantified/`下載；完整題目索引以CSV.gz／JSONL.gz提供。重算腳本見 `audit/quantified/README.md`。舊目標及原稿已明確標歷史並折疊；原始來源、實驗和403頁歷史PDF保持原檔。以下記錄先前版本，不能當作目前數量或目標。

---

2026-10-02 v0.8：入口統一為**領域、環境、任務、題數、評估方式**。`coverage.html`把143筆前作比較與全庫狀態放在同一頁；首頁顯示五項統計，詳細家族、G／T代號和歷史配額移到附錄。原作量、已收集量與整合後可評量保留不同範圍。

本次核對28個原始概述，新增35筆有單位、範圍與出處的數量紀錄。原有68項比較、143筆來源、5,308條索引、實驗和歷史PDF保留。判分方式以四類工作分類整理，不宣稱全庫評分器或來源任務聯集已完成。

- `coverage.html`：主要入口；全庫總覽、143筆前作、領域分布、四類判分與三步完成條件。
- `downloads/coverage/benchmark_summary.csv`：每benchmark一列的比較表。
- `downloads/coverage/count_ledger.csv`：每筆數量的單位、scope、版本和出處。
- `downloads/coverage/COVERAGE_REPORT.md`、`coverage_snapshot.json`：完整統整報告及可再處理資料。
- `content/coverage/`保存口徑及人工整理輸入，`scripts/coverage-model.mjs`在建置時從原資料推導總表。

以下保留先前版本說明，原v0.7來源聯集仍是研究方法基礎。

2026-10-02 v0.7.2：新增G0–G5／T1–T8集中速查，第二章加上就近說明，14章中的代號可直接點到定義。G是計數粒度、T是評測模組；編號為本計畫約定。

計數說明更新（2026-10-01，v0.7.1）加入 `counting.html`：把來源名錄、定義／設定索引、任務環境定義、場景、測例與原始樣本分開。5,308保留為索引數；全庫環境定義和樣本總量明示待整理／未統計。原v0.7 PDF保留9/29快照，計數澄清另有Markdown／JSON下載。

主設計v0.7：全面收集既有benchmark，像survey一樣整理其領域、任務和規則，建立完整來源聯集，再擴充任務定義。公開網址：https://jasonya.github.io/robot-use-benchmark/ 。

- `survey-union.html`：143條已登記評測來源、全部250篇書目、Survey分布、原生來源清單與12個規則擴充例。
- `native-tasks.html`：5,308條來源；包括原5,020條與VIMA17／ARNOLD8／COIN180／CrossTask83新定義。
- `design.html`：目前v0.7主設計；目錄收集與可執行子集分開，歷史容量模型另可展開。
- `compare.html`：原68項詳細前作比較與本計畫目標／進度，連回完整143來源總庫。
- `research.html`、`library.html`：250篇原書目、原始分類與搜尋紀錄。
- `execution.html`、`joint-pilot.html`：工程附錄，保留已完成的原生與小型聯合實驗。

最新單一PDF403頁：目前主線20頁＋原完整報告376頁＋工程試作7頁。來源數、base task、規則變體、資料／測例與執行各自記錄；完整搜集、共同映射及全庫執行尚未完成。原始人類影片未重新發布。

```sh
npm ci
npm run build
npm run verify
npm run serve
```

建置使用repo內的內容快照與PDF，可獨立checkout。`scripts/browser-check.mjs`使用Chrome檢查繁簡、搜尋、表格、來源篩選、影片、手機和無JavaScript閱讀。`ROBOT_TEST_URL`可指定本機或公開網址。

固定版本來源的收集／總庫重建程式在[audit/survey_union/](audit/survey_union/README.md)。機器人runtime及其歷史驗證在[benchmark/](benchmark/README.md)。`docs/`是Pages發布目錄；push main後自動建置、驗證與發布。

</details>
