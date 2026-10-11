# 逐篇來源核讀與標準化

本輪處理固定250篇書目。183份benchmark／資料／評測主來源與67篇方法／綜述分開；每篇均保留具體處理結果，不把沒有公開程式的作品刪掉，也不把下載快照自動標成讀過。

人工原稿在`content/github_review/reviews/Pxxx.json`。每篇需要身份／版本、實際閱讀順序、環境、任務、資料、判分，以及可重用、需轉換、待補內容。`reading_order`只列真的讀過的固定commit檔案行段或JSON pointer；原始來源內容留在忽略的`audit/.cache/`。

查核分為核心程式／標註片段、文件／網站，以及未確認或無法取得實作。這些是來源核讀狀態，不是模型成功率或全資產取得比例。語義任務去重及正式可執行子集另外驗收。

```sh
# 只抓指定小型來源；先使用cache，沒有自動執行程式。
python3 audit/github_review/snapshot_repositories.py --repos OWNER/REPO
python3 audit/github_review/fetch_more.py OWNER/REPO path/to/reader.py path/to/evaluator.py

# 寫完人工紀錄後，在持有原始來源快取的本機核驗。
python3 audit/github_review/compile_reviews.py --require-complete
python3 audit/github_review/reconcile_bindings.py
python3 audit/github_review/compile_reviews.py --require-complete

npm run build
ROBOT_SITE_PORT=8808 npm run serve
```

在另一個shell產生當前報告：

```sh
ROBOT_TEST_URL=http://127.0.0.1:8808/robot-use-benchmark/ python3 audit/github_review/print_report.py
npm run build
npm run verify
npm run verify:github
ROBOT_TEST_URL=http://127.0.0.1:8808/robot-use-benchmark/ node scripts/browser-check.mjs
```

PDF需要本機Chrome與Poppler。它由同一份已驗證原稿和網站產生，保留250篇內容、整體數字與實例，並把跨頁連結改成公開網站網址。修改報告輸入後必須重印；`report_assets.json`記錄依賴hash，CI會拒絕過期PDF。

`compile_reviews.py`檢查私有快取中的實際bytes、固定版本、行段／JSON pointer。`verify-github-review.mjs`只使用repo內公開檔案，檢查原稿和匯出一致、來源位置、倉庫／外部資料庫計數、候選理由與PDF指紋；不聲稱第二位人類的獨立語義複核。

GitHub repo、Hugging Face dataset revision、資料壓縮檔、子模組與模型／裁判版本各自固定。`repository_aliases`只能把有原始證據的舊網址連到已核讀倉庫；後續世代不可作同版別名。`repository_candidate_dispositions`保存不可取得或不適用的入口及原因。相似名稱的無關專案列`excluded_repositories`，不補位原作。

所有HTTP程序共用cache與限速：GitHub搜尋6.5秒、API0.85秒、raw與各網站1秒。429／rate-limit 403依Retry-After／reset暫緩，不立即重試；其他403／404保持原狀態。代理一次處理一個短批次，完成即保存。不要重跑`seed_bindings.py`覆蓋已核對關係。

網站說明與案例在[共同結構規格](../../benchmark/collection/REPO_TO_STANDARD.md)。本輪只發布我們的整理、引用、來源hash與格式；原始影片、模型、3D資產和第三方程式仍走原作入口。
