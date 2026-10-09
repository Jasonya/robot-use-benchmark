# 用兩個案例走完標準化蒐集流程

案例導讀 0.1 · 2026-10-09

以 CALVIN 開抽屜和 OpenEQA 物件辨識題，追蹤同一筆資料如何經過八步。這是已有紀錄與後續待辦的導讀，不是新增的模擬或模型評測結果。

## CALVIN：機器人把抽屜拉開

把「開抽屜」這個原作任務收進總庫，最後讓機器人能接受相同條件的評測。

這八步追蹤同一個 open_drawer 任務；後面的測例建置與實測仍是待辦。

本庫目前：已有原作任務、場景與 checker 引用；尚未由本次匯入建立可評測測例。

### 1. 找來源：先找到「開抽屜」是誰定義的

進度：本例來源已審閱

拿到什麼：CALVIN 論文、官方程式庫，以及其中的開抽屜任務。

這一步做什麼：確認原作收了什麼任務、怎麼提供場景、如何判斷完成。

留下什麼：一筆 CALVIN 來源紀錄 P065，連到原作及任務清單。

為什麼：先把來源找對，後面每個目標、參數和判分條件才有依據。

來源：https://raw.githubusercontent.com/mees/calvin/fa03f01f19c65920e18cf37398a9ce859274af76/calvin_models/conf/callbacks/rollout/tasks/new_playtable_tasks.yaml · line 22 · SHA-256 6e905de3ca05118efdd8a51f8a7756ec6e61ffdb2b9b6a2843f0b7e0e9e51dcf

### 2. 固定版本：把這一版原作固定下來

進度：相關來源檔案已固定

拿到什麼：官方任務 YAML，以及 calvin_env 的成功檢查程式。

這一步做什麼：保存各自的版本與檔案 hash。任務設定和環境程式可能來自不同 commit。

留下什麼：可重找的任務檔、checker 檔及版本紀錄。

為什麼：日後原作更新成功門檻，舊結果仍能對回當時用的規則。

來源：https://raw.githubusercontent.com/mees/calvin/fa03f01f19c65920e18cf37398a9ce859274af76/calvin_models/conf/callbacks/rollout/tasks/new_playtable_tasks.yaml · line 22 · SHA-256 6e905de3ca05118efdd8a51f8a7756ec6e61ffdb2b9b6a2843f0b7e0e9e51dcf

來源：https://raw.githubusercontent.com/mees/calvin_env/1431a46bd36bde5903fb6345e68b5ccc30def666/calvin_env/envs/tasks.py · lines 245–255 · SHA-256 bca84af6249b2fd2404d1bd17318c7f3cf640acc329d3a26306b29149fc00e1a

### 3. 擷取原作：讀出「拉開多少才算完成」

進度：本輪已核對原作條件；未跑模擬

拿到什麼：open_drawer 這一行設定，以及 move_door_rel 的程式內容。

這一步做什麼：核對抽屜關節 base__drawer 和門檻 0.12；實作檢查的是終值減初值，必須大於門檻。

留下什麼：帶有原作位置的任務條件筆記：目標關節、checker、0.12 與嚴格大於的關係。

為什麼：「看起來打開」太模糊；這一步讓任務有可檢查的完成條件。0.12 保留原作關節座標單位。

來源：https://raw.githubusercontent.com/mees/calvin/fa03f01f19c65920e18cf37398a9ce859274af76/calvin_models/conf/callbacks/rollout/tasks/new_playtable_tasks.yaml · line 22 · SHA-256 6e905de3ca05118efdd8a51f8a7756ec6e61ffdb2b9b6a2843f0b7e0e9e51dcf

來源：https://raw.githubusercontent.com/mees/calvin_env/1431a46bd36bde5903fb6345e68b5ccc30def666/calvin_env/envs/tasks.py · lines 245–255 · SHA-256 bca84af6249b2fd2404d1bd17318c7f3cf640acc329d3a26306b29149fc00e1a

### 4. 統一欄位：把這條任務放進共同目錄

進度：標準目錄已有這條紀錄

拿到什麼：原生任務 ID、名稱、來源、checker 引用和剛才的固定版本。

這一步做什麼：保存成一條 task 紀錄，保留 native 原始欄位與 provenance 出處。

留下什麼：一條標準化的 open_drawer 任務紀錄，原生 ID 仍可查。

為什麼：這樣可以和其他來源一起搜尋、比對；格式轉換本身不增加任務數，也不等於能執行。

```json
{
  "entity_type": "task",
  "namespace": "calvin",
  "native_id": "open_drawer",
  "release_tier": "catalog",
  "canonical_task_id": null,
  "domain_refs": []
}
```

### 5. 語義對齊：再判斷它跟其他「開抽屜」是否相同

進度：共同任務與逐任務用途對應待完成

拿到什麼：這條 CALVIN 任務，以及其他 benchmark 的開抽屜定義。

這一步做什麼：比較對象、起終狀態、必要過程和成功容差；再寫入逐任務用途與等價／衍生關係。

留下什麼：後續應產生：有依據的任務對照表，並保留規則差異。

為什麼：來源層級已能歸納居家用途；逐任務的用途綁定和跨來源合併仍需明確記錄，不能只靠名稱。

### 6. 建立測例：把「任務定義」做成一個具體考題

進度：場景／初態／素材／評測約定待整合

拿到什麼：open_drawer 任務、可用場景清單及 checker 引用。

這一步做什麼：選定相容場景，取得資產，設定抽屜初態、機器人觀測、控制方式及動作預算。

留下什麼：後續應產生：一份可重建同樣條件的開抽屜 case。

為什麼：同一個任務可有不同初態；每題都要有合法且可重現的設定，不能把任務數與場景數直接相乘。

### 7. 驗證評測：檢查判分器是否真的分得出完成與未完成

進度：完整環境與執行驗證尚未完成

拿到什麼：上一個步驟的具體測例、原作 checker，以及應通過和不應通過的狀態。

這一步做什麼：先核對邊界，再用實際執行留下的狀態／軌跡驗證，並檢查跨 split 重用。

留下什麼：後續應產生：判分驗證報告、執行證據與固定的評測協定。

為什麼：有一段 checker 程式，還需要證明它在我們接好的環境與資料上運作正確。

以下只是原作條件的手算示意，使用假設關節座標；不是機器人實測成績。

| 初值 | 終值 | 原作條件 |
|---|---|---|
| 0 | 0.05 | 不符合 |
| 0 | 0.12 | 不符合 |
| 0 | 0.15 | 符合 |

### 8. 發布更新：最後分開發布「目錄」與「可評測題」

進度：目錄已發布；本次沒有新增可評測題

拿到什麼：目前已有的任務紀錄，以及未來通過驗證的 case 和 evaluator。

這一步做什麼：目錄可先收錄原作定義；可評測版等素材、協定及判分驗證完成後再納入。

留下什麼：現在：可查 open_drawer 的來源與標準紀錄。之後：再發布已驗證的開抽屜測例。

為什麼：讀者因此能分清「收錄了這個任務」與「已經可以拿來測模型」。

## OpenEQA：辨認電視上方的物體

看房間的觀測紀錄，回答「電視上方、牆上那個白色物體是什麼？」；來源參考答案是「冷氣機」。

這八步追蹤同一個 question_id。本例採「看觀測紀錄回答」的路徑；題幹依原作改寫，答案來自來源標註。

本庫目前：題目與參考答案已核對，題目元資料已入庫；對應觀測素材與模型評測仍待整合。

### 1. 找來源：先找到這道題的原作

進度：來源與題目身份已核對

拿到什麼：OpenEQA 論文與官方題目檔中的一題物件辨識問答。

這一步做什麼：確認這是依房間觀測回答問題的 benchmark，並保存原作身份。

留下什麼：一筆 OpenEQA 來源紀錄 P038，能追到題目檔和評測程式。

為什麼：同樣放進 Robot-use 總庫，這題要求輸出答案；它的資料與判分需求會沿著自己的型別處理。

來源：https://raw.githubusercontent.com/facebookresearch/open-eqa/cfa3fce4595c1622bb2f8a38ae2ca9aae9eb685b/data/open-eqa-v0.json · /0 · SHA-256 a64dd101133213fa3b5ca31e5af8216662471aa34894b443d803f497757557ee

### 2. 固定版本：固定題目檔與評測程式的版本

進度：來源檔案已固定；裁判執行設定未凍結

拿到什麼：官方 open-eqa-v0.json，以及使用 LLM-match 的評測入口。

這一步做什麼：保存版本、檔案 hash 和題目位置；後續裁判模型與設定也需要固定。

留下什麼：可重找的題目定義與判分程式引用。

為什麼：日後題幹、答案或裁判改版，才不會把不同規則下的分數混在一起。

來源：https://raw.githubusercontent.com/facebookresearch/open-eqa/cfa3fce4595c1622bb2f8a38ae2ca9aae9eb685b/data/open-eqa-v0.json · /0 · SHA-256 a64dd101133213fa3b5ca31e5af8216662471aa34894b443d803f497757557ee

來源：https://raw.githubusercontent.com/facebookresearch/open-eqa/cfa3fce4595c1622bb2f8a38ae2ca9aae9eb685b/evaluate-predictions.py · get_llm_match_score call, lines 105–110 · SHA-256 7d8376653ae15e758184a67d5f7fb9e6d42cc8356bd7193ae68ff41cd8cb64a2

### 3. 擷取原作：把「問題、答案、觀測」三者連起來

進度：題目與答案已核對；觀測尚未完整整合

拿到什麼：題目問電視上方的白色物體；來源參考答案是冷氣機。

這一步做什麼：保留 question_id、物件辨識題型、episode_history 觀測引用，以及問題與答案的來源位置。

留下什麼：一條能指出「哪道問題、對應哪段觀測、依哪個答案評分」的題目紀錄。

為什麼：只有答案文字還不夠，模型必須看到該題允許的觀測。參考答案是從來源標註取得，並非本次模型辨識結果。

來源：https://raw.githubusercontent.com/facebookresearch/open-eqa/cfa3fce4595c1622bb2f8a38ae2ca9aae9eb685b/data/open-eqa-v0.json · /0 · SHA-256 a64dd101133213fa3b5ca31e5af8216662471aa34894b443d803f497757557ee

### 4. 統一欄位：存成共同格式中的一道 QA 元資料

進度：標準目錄已有這題元資料

拿到什麼：原生 question_id、觀測引用、題型、來源及 evaluator 引用。

這一步做什麼：保存成 case_kind=qa；保留原作未分 split 的狀態，並將參考答案與模型輸入分開。

留下什麼：一條標準 QA 元資料，連到原生物件辨識題型和判分器索引。

為什麼：episode_history 是觀測引用；目前沒有互動場景綁定，所以不把它計成新的可操作環境。

```json
{
  "case_kind": "qa",
  "native_id": "f2e82760-5c3c-41b1-88b6-85921b9e7b32",
  "native_split": "native_benchmark_unsplit",
  "observation_ref": "hm3d-v0/000-hm3d-BFRyYbPCCPE",
  "environment_ref": null,
  "task_link_kind": "information_task_type",
  "evaluation_release_eligible": false
}
```

### 5. 語義對齊：核對題型與同源重複

進度：原生題型已接；跨來源對齊與去重待完成

拿到什麼：這題的 object recognition 題型，以及可能重用同一觀測的其他問題。

這一步做什麼：保留已有的原生題型關聯，再檢查跨來源是否重複收錄，並區分同觀測中的不同問題。

留下什麼：目前已有原生題型引用；後續還要補共同分類與同源關係的審核紀錄。

為什麼：同一段觀測可以有多道不同問題；同一道題換了來源名稱，也不能因此當成全新的題目。

### 6. 建立測例：準備模型真的會收到的輸入

進度：觀測素材與評測約定待整合

拿到什麼：這道題，以及 episode_history 指向的觀測資料。

這一步做什麼：取得對應影像／觀測，固定模型可讀的內容與預算；問題送給模型，參考答案留給評分端。

留下什麼：後續應產生：輸入素材完整、評測約定固定的 QA case。

為什麼：這條問答路徑不必先跑機器人，但仍要有完整的觀測與判分依據，才能正式評測。

### 7. 驗證評測：檢查開放式答案怎麼判分

進度：裁判與模型評測尚未執行

拿到什麼：模型回答、來源參考答案，以及原作的 LLM-match 評分入口。

這一步做什麼：固定裁判模型與設定，檢查同義表達和明顯錯答，再核對題目／觀測是否跨 split 重用。

留下什麼：後續應產生：實際裁判分數、評審設定、抽查與切分紀錄。

為什麼：例如「冷氣機」與「壁掛空調」是需要檢查的同義表達情況。此處列出驗證項目，沒有呼叫裁判或產生分數。

來源：https://raw.githubusercontent.com/facebookresearch/open-eqa/cfa3fce4595c1622bb2f8a38ae2ca9aae9eb685b/evaluate-predictions.py · get_llm_match_score call, lines 105–110 · SHA-256 7d8376653ae15e758184a67d5f7fb9e6d42cc8356bd7193ae68ff41cd8cb64a2

### 8. 發布更新：發布時把題目元資料和可評版本分清楚

進度：目錄已發布；本例仍未成為本庫可評測題

拿到什麼：目前已有的題目元資料，以及未來通過驗證的完整輸入與判分約定。

這一步做什麼：目錄先保留同一個 question_id；完整評測版另外列出素材、版本及適用的評分器。

留下什麼：現在：能查到這題的來源與觀測引用。之後：才能按固定條件比較模型答案。

為什麼：這題原作身份仍只計一次；不同評測設定與重跑結果各自記錄，不能混進來源題數。
