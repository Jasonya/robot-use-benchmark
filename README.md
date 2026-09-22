# Robot-use Benchmark · Research Atlas

公開網站：https://jasonya.github.io/robot-use-benchmark/

這個網站提供可分層閱讀的繁體／簡體研究設計。**v0.3 以規模與覆蓋優勢為主線**：完整任務庫初始目標為 2,000–3,000 個正規化 G2，並要求在共同口徑下至少達最大可比基準 2 倍。這些是研發驗收目標，尚未達成。

首頁的「規模與比較」說明新目標與 milestones；「來源任務庫」提供 5,020 筆可追溯原生紀錄，來自 20 個官方程式庫、21 個固定版本來源。紀錄包含不同原生單位及待去重項目，不能當作已完成的獨立任務數。

14 個章節仍提供摘要與完整內容；情境、家族、Ego 題型、指標與文獻各有搜尋和篩選。原 180 個情境是設計種子，原 100–140 的預算只保留為 v0.2 深入標註示例，不再是全庫目標。

內容包括：

- 168 篇註釋文獻，附原始來源、中文用途及證據深度。
- 48 個作者定義家族、180 個情境藍圖、24 個額外 Ego 題型與 40 個候選指標。
- 完整分類軸、規模比較、資料規則、難度設計、工程與 milestones。
- 257 頁原始統整 PDF。
- v0.3 規模計畫、21 個版本來源的盤點報告及完整原生 CSV／JSON。

原文獻與設計快照為 2026-09-21，規模主線和來源盤點更新於 2026-09-22。網站共 56 個內容頁，另有根入口與 404 頁。這是**研究設計文件網站**；正式 G2 尚未完成跨作正規化，驗證測例和已執行模擬均為 0。

## 閱讀功能

繁／簡各自有固定網址，切換時保留章節、查詢與 anchor。搜尋可使用繁體、簡體、英文或 ID；每個情境和文獻可直接分享。全文已預先生成，即使停用 JavaScript 仍可閱讀完整內容。

網站支援手機版、章節導覽、頁內目錄、搜尋對話框、列印、PDF 下載與無需登入的公開閱讀。桌面搜尋快捷鍵為 `/` 或 `⌘/Ctrl K`。

## 修改與建置

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run verify
npm run serve
```

預覽路徑包含 `/robot-use-benchmark/`，用來檢查 GitHub Pages 專案網站的相對路徑。如果預設連接埠被佔用：

```sh
ROBOT_SITE_PORT=8791 npm run serve
```

- `scripts/build.mjs`：網站生成器與導讀內容。
- `content/`：可獨立建置的公開研究快照。
- `content/scale_first/`：規模計畫、盤點結果、固定來源與提取證據。
- `audit/`：原生來源重建腳本；公開 catalogue 已固定 commit，沒有放入原始程式 cache。
- `static/assets/`：CSS、JavaScript、圖表與分享圖片。
- `docs/`：產生的繁／簡網站及 PDF。
- `site.config.json`：repository、網址與研究版本。
- `verification/`：建置與靜態檢查結果。

本地原研究資料夾仍在時，建置器會同步最新的統整報告與 registry。獨立 checkout 時則使用此 repository 的 `content/` 快照。繁簡轉換採 OpenCC，原始論文標題、ID、URL 與程式欄位保持可追蹤。

來源庫使用較精簡的靜態索引，在瀏覽器中搜尋和分頁；完整 CSV／JSON 可以下載。已標示的 2,587 個 RoboVerse 純配置衍生 class 可單獨隱藏，這個操作不代表完成全庫語義去重。原章節與設計種子可停用 JavaScript 閱讀；來源庫的互動搜尋需要 JavaScript，另提供完整 CSV。

## 發布

`.github/workflows/pages.yml` 在 push 到 `main` 後，重新建置、檢查並發布 `docs/`。GitHub Pages 的來源使用 **GitHub Actions**。

更新基礎研究或計數口徑時，應同步來源、導讀、兩種語言與 PDF 的版本說明；不要將新增網頁誤算為新增實驗或 benchmark 覆蓋。

## 來源

本 repository 提供本計畫整理的研究說明、設計與註釋，論文連結回各原始來源。原始研究的完整論文、資料集、影片與機器人資產並未因這個網站而被重新發布或授權。

建置工具參考：

- OpenCC：https://github.com/BYVoid/OpenCC
- OpenCC.js：https://github.com/nk2028/opencc-js
- Cheerio：https://cheerio.js.org/
- GitHub Pages workflows：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
