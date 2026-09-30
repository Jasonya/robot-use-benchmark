# Robot-use Benchmark：前作總庫與任務規則擴充

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
