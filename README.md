# Robot-use Benchmark：繁體／簡體研究網站

公開於 https://jasonya.github.io/robot-use-benchmark/ 。整合更新v0.6提供68個繁簡內容頁，另有根入口與404頁。實際發布commit及線上核驗以本機`.deploy-state.json`為準。

- `design.html`：大型／廣覆蓋設計、場景預算、多粒度計數和S0–S6。
- `compare.html`：68項前作＋目標／實績兩列；領域、場景、題數、資料、機體、材料、觀測和端點四種表。
- `research.html`、`library.html`：250篇書目、137篇完整摘要紀錄、82篇補充與700候選狀態；文獻分布不當任務配額。
- `joint-pilot.html`：1個自建RGB／SQLite／robot工作流、120測例、720次固定程式試驗＋2次事後可解性annotation；實際影像、影片、結果及約191MiB完整資料包。
- `execution.html`：50個原生任務、本次1,250次新初態五方法測試、完整結果、實際重播、兩BC權重與相對難度。
- `readiness.html`：逐項成果、未完成驗收、支撐與審閱狀態；正式G2及通用release仍待完成。
- 383頁最新單一PDF、279筆分單位計數、1,428格來源索引、trial ledger與CSV／JSON可下載。

原14章、180藍圖、48工作流、24 Ego題型和40指標保留；原257頁PDF在新版中逐頁標歷史，也保留獨立原檔。原168篇底稿不覆寫，新增82篇於建置時合併並保留穩定ID。

原生track為單Sawyer臂、39維state＋明示目標、剛體／關節；另有RGB＋數位工具的合成聯合track，只有一個桌面工作流。120測例不等於120種新任務，也未測學習型VLM／VLA。4,286次歷史執行不當成新G2；完整2,000–3,000 G2、跨材料／機體、human-video-to-robot及2×門檻尚未通過。

在本目錄執行：

```sh
npm ci
npm run build
npm run verify
npm run serve
```

`scripts/browser-check.mjs`使用本機Chrome檢查互動、繁簡、搜尋、表格、影片、手機與無JavaScript閱讀；`ROBOT_TEST_URL`可指定本機或公開網址。搜尋索引依需求載入。

Python元件位於[benchmark/](benchmark/README.md)，包含reset約定、trace、兩個BC、重播、模型驗證與schemas。原生本機traces、來源全文cache和人類媒體沒有放進網站；聯合試作的完整合成traces透過GitHub prerelease另提供，公開URL與hash列於`content/joint_pilot/download_info.json`。公開模型使用NumPy格式，保留hash和訓練／測試隔離證據。

`docs/`是發布目錄。Push到本repository的`main`後，GitHub Actions建置、驗證並發布Pages。程式、內容快照、PDF及圖像支援獨立checkout建置。
