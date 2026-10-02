# v0.9：可重算的數量清單

這個目錄收集來源定義和題目元資料，不執行機器人／模型，也不把來源素材已下載或已跑分當作前提。

數字的唯一規劃契約在 `content/quantified/numbers_contract.json`，實數來自 `inventory_summary.json` 和各ID清單。來源文件固定commit／資料版本及SHA256。官方場景頁與API用於發現清單，其必要名稱、檔案清單與commit另存`frozen_discovery_fields.json`，不以會變動的Hub下載次數重算本版。原始發現回應的SHA仍保留在receipt；實际task、scene及case檔案必須符合固定來源hash。

```sh
python3 audit/quantified/fetch_pinned_inputs.py
python3 audit/quantified/build_numeric_inventory.py
npm run build
npm run verify
```

原始輸入下載至gitignored的 `audit/.cache/quantified-v0_9/`。只有來源ID、位置、單位、hash及必要引用進公開清單；完整問題、答案、指令和原始3D／影像資產不重新發布。PARTNR與HSSD原資料的CC-BY-NC條款、OpenEQA及其他來源條款仍由原作保留，請由原作入口取得素材。

環境實數為284份原作命名定義：BEHAVIOR50、RoboCasa60、ALFRED／AI2-THOR120、CALVIN4、HSSD-partnr50。沒有把style、D_eval、另一個adapter或攝影歷史ID當作新layout。

任務實數為2,096條機器人來源定義＋7個OpenEQA資訊題型＝2,103條來源條目，尚未完成共同任務正規化。原263個人類程序活動另列。

題目實數為PARTNR train111652＋val1000＋OpenEQA1636＝114288個原生ID。PARTNR的mini、2k、ci與未驗證池不再相加；其公開固定版本沒有test檔。OpenEQA的同一question_id不按多種評測模式倍增。原生split保存，不先改成本計畫80／10／10的規劃split。

結構查核包括ID唯一、必要輸入／答案／目標程序欄位、場景引用、predicate名稱和constraint index範圍。這些查核不是物理可解性、素材完整性或模型成績。所有新題目記錄的`complete_local_inputs`與`runtime_verified`均為false。
