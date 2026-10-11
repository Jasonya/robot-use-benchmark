# 從原作 GitHub 到我們的 Benchmark

結構規格草案 0.2 · 2026-10-11。0.2是接口規格版本，不是題庫發布版號。這份文件根據逐篇核讀整理共同接口；每篇的倉庫、版本與程式證據另見 GitHub 核讀表。原生任務索引、已取得素材和可評測題目仍分項計數。

## 先看最簡單的結構

我們只維護三層：**原作快照 → 共同目錄 → 可評測子集**。首頁仍只回答領域、環境、任務、題數、評估方式。

| 層 | 保存什麼 | 何時算完成 |
|---|---|---|
| 原作快照 | 論文、GitHub commit、子模組、任務／資料／判分原檔引用與hash | 身份和版本可回查；下載與閱讀各有紀錄 |
| 共同目錄 | 來源、用途、環境、任務、題目、判分器及它們的關係 | 欄位、ID、引用和原生單位通過檢查；語義未決保持未決 |
| 可評測子集 | 完整輸入、初態、可見資訊、動作／輸出、預算與判分 | 素材、協定、判分正反例、切分及執行範圍逐項驗證 |

一本論文可以有多個倉庫，同一個倉庫也可以支持多篇論文。原作、倉庫、版本、原生task、case和trial各有自己的ID，不能共用一個「資料量」數字。

## 用兩個例子走完

| 步驟 | CALVIN：操作機器人 | OpenEQA：看環境後回答 |
|---|---|---|
| 固定原作 | CALVIN主倉庫和它指定的calvin_env子模組 | OpenEQA固定版本與open-eqa-v0.json |
| 認識環境 | A–D四個原生場景；D_eval沿用D的layout | episode_history是觀測歷史引用，不能直接當作可操作環境 |
| 認識任務 | 34個原作子任務定義，例如開抽屜 | 7個資訊題型，例如物件位置；不是7個機器人工作 |
| 找到一題 | 需綁定實際初態、指令鏈、觀測與動作協定 | 一個question_id連到問題、歷史輸入、答案與判分協定 |
| 真正判分 | 由具體goal checker與整條指令鏈的完成結果判分 | 依原作開放式回答評審；裁判、prompt與版本一併固定 |
| 目前可計什麼 | 已取得34條任務定義；不能把文中1,000條鏈當成本案已取得 | 已取得1,636條問題／答案元資料；完整歷史影像另行取得 |
| 進入共同格式 | source→environment→task→case→evaluator，保留原生動作尺度 | source→history resource→information task→case→evaluator，保留影像可見範圍 |

兩個例子共用身份、來源和評測紀錄格式，但輸入、輸出與判分各自保存。對它們新增「指令被打斷後恢復」或「不得讀取某段歷史」時，要寫出父任務、變更規則、答案如何產生及新增的評測版本。

## 目錄怎麼放

以下為目標目錄結構；現有catalog importer保留其0.1版本，不以這張示意冒充全部adapter已實作。

```text
benchmark/
  sources/                  每份來源一張卡：身份、版本、原作入口
  catalog/
    domains.jsonl           用途分類與定義
    environments.jsonl      有身份的場景／layout
    tasks.jsonl             原生任務與共同規格、規則版本
    cases.jsonl             一題的輸入／初態／split／判分引用
    evaluators.jsonl        原生與共同判分契約
  adapters/                 按來源或資料形態讀取、轉換、驗證
  protocols/                模型可見資訊、預算、輸出及切分規則
  releases/                 固定的catalog／evaluation發布清單
```

影片、HDF5、NPZ、3D資產與大型模型存放在資料儲存區。目錄保存引用、內容hash和依賴關係；網站直接從同一份目錄產生表格和下載。

## 一篇 GitHub 怎麼讀

依這個順序走一遍，每一步留實際檔名、commit、行號和閱讀結論。

| 順序 | 讀什麼 | 要回答的問題 |
|---|---|---|
| 1. 身份與版本 | 論文／作者頁 → README → tag／submodule | 這是否該篇的作者程式？是原作版、移植版、新版或只是網站？ |
| 2. 任務入口 | registry、task class、goal DSL、題型或活動表 | 原作的一個task究竟是什麼？目標、參數、變體怎麼分？ |
| 3. 資料入口 | manifest、dataset reader、紀錄器、split設定 | 一筆樣本包含什麼？時間、單位、座標、label和來源如何對齊？ |
| 4. 真正判分 | 執行入口 → wrapper → 具體checker／metric | 程式實際如何判分？分母、失敗排除、候選預算與聚合是什麼？ |
| 5. 整理與映射 | 來源卡、欄位對照與驗證紀錄 | 哪些原樣保存、哪些要轉換、哪些仍不足以形成合法評測？ |

README中的指令只是入口。要沿實際呼叫鏈讀到資料與判分。例如LIBERO的基底`_check_success`是佔位，真正goal檢查在具體problem子類；只讀基底會得到錯誤結論。

## 每份來源只填一張卡

| 欄位 | 最少要有什麼 |
|---|---|
| 來源身份 | paper ID、repo及角色、官方性依據、固定版本、讀過的檔案 |
| 領域 | 原作任務／用途支持的分類；逐任務映射與來源層級標籤分開 |
| 環境 | 原生scene／workspace／asset或生成規則；影片觀測脈絡另存 |
| 任務 | native ID、原生單位、目標／規則／必要過程、參數或變體 |
| 題數與資料 | 原生split、case/sample單位、輸入／標註引用、已取得範圍 |
| 評估方式 | 實際checker／metric檔案、版本、所需證據、聚合與預算 |
| 標準化結論 | 可復用、需要轉換、仍缺少什麼；目前是目錄或可評測 |

欄位不明時用null和原因。未找到官方GitHub不表示原作沒有資料；只有README或網站的倉庫，也不表示評測程式已公開。

## 統一哪些東西

**統一身份、欄位意思、資料關係及評測接口。** 原生表示保留，轉換由adapter完成。

| 共同項目 | 必須保留的原作細節 |
|---|---|
| 身份 | source、repo、commit、native ID、split、父資料與衍生關係 |
| 時間 | 原片秒數、frame index、特徵時間格、控制頻率、預測截止點與horizon |
| 空間 | 座標frame、世界／相機方向、quaternion順序、單位與變換參數 |
| 動作 | embodiment、controller、位置／速度／力矩／增量、維數、縮放與夾爪約定 |
| 觀測與答案 | 資料裡有什麼，以及此評測允許模型看什麼；參考狀態／未來／答案分開 |
| 成功與誤差 | 原生predicate／metric、閾值、時間持續、invalid規則及分母 |
| 發布 | schema／adapter／evaluator／protocol版本與全部依賴的固定清單 |

相同形狀的tensor可能有不同物理意思；不同形狀也可以走相同的adapter接口。控制、問答、定位、預測與世界模型保留各自輸出型別與native metric。

## 從已讀程式看到的具體原因

| 原作 | 已核對的程式事實 | 我們要怎麼處理 |
|---|---|---|
| Meta-World現行版 | 基礎obs由當前18維、前一觀測18維、goal3維組成；部分說明仍寫9D | 由固定程式與資料驗證schema，記下stack與goal可見性，不只抄文字說明 |
| Meta-World vs CALVIN | Meta-World原生4維控制另乘action_scale；CALVIN有兩種7維動作，relative另有位置／角度縮放 | 保存原生ActionSpec及轉換，不強制把所有資料視為同一個7維向量 |
| CALVIN | 主倉庫pin的calvin_env不是該倉庫的目前main；scene_obs存在資料裡但原作政策不使用 | 固定依賴閉合版本，並把儲存欄位和政策可見欄位分開 |
| ManiSkill1/2/3 | 原作2021在Legacy，ManiSkill2在v0.5.3，現行main為ManiSkill3 | 不用同一個main代表三篇；版本與對映各自有證據 |
| ManiSkill2 | recorder保存T+1個觀測與T個transition；depth以uint16並乘2^10寫入 | 保存時間對齊和深度尺度；dtype本身不足以解釋資料 |
| ManiSkill3 | training loader裁去最後obs；device分支另對success/fail賦值為terminated/truncated | 原始儲存和training view分開；保留原label，匯入adapter需做回讀一致性檢查 |
| RLBench | condition可以表示關節、抓握、偵測、順序或OR；variation還會換目標部位 | 完成條件與必要過程一起保存，不從任務名稱推定 |
| CrossTask | 18 primary與65 related標註資格不同；時間轉到1Hz特徵格會floor/ceil | 資料子集、時間格與原始秒數分開；沒有GT的活動不自動變成可評題 |
| LIBERO-Plus（P105） | 分類檔有10,030個擾動條目，許多共用底層任務與初態 | 保存base task→variant→case關係；原生level與共同難度分開 |
| EgoDex（P119） | ARKit世界座標可能每episode不同；best-of-K只計指定位置點 | 連結episode座標與原片；保存K、padding、所評joint及被略過的旋轉分量 |
| WatchAct（P123） | Plan SR、完整終態一致與LIBERO物理成功不同；progress還可能扣初態 | 同題可建不同protocol，分別保留原metric與新增規則 |
| Open X（P125） | 示例可以把tensor形狀對齊，原action卻可能是位置、速度或增量 | 容器/schema和物理ActionSpec分開驗證，保留每個子資料來源 |
| AHA（P110） | 名稱為F1的Yes/No腳本實際計算accuracy；模型裁判另有無效輸出分母 | 記下原名稱與真正公式，保存invalid數與預期題目全集 |
| ALOHA/ACT（P130） | 兩個sim有具體reward規則；real接口的0 reward只是佔位 | 原實機評分需另有rubric或checker，不能直接沿用通用rollout日誌欄位 |
| EggHand／EgoH4（P227／P230） | 相同父影片被切成不同窗口；target是否含當前幀、缺失關節mask與MPJPE對齊不同 | 父take與時間交集去重，逐協定固定歷史／未來與有效分母 |
| SFHand（P228） | 誤差只評匹配、IoU及手別正確的子集合；串流仍取得新影像 | 同時報評分覆蓋率與條件誤差，標明online observation |
| OCT／Diff-IP2D（P233／P232） | 檔案可相同，實際caller卻不同；OCT wrapper的名稱對調不等於Diff-IP2D主路徑也如此 | 必須沿入口查到真正呼叫，保留native名稱、公式和修訂版 |
| EgoCast（P249） | 預設分支與forecasting分支不同；預測輸入路徑有GT變數覆寫問題 | 固定兩個commit；獨立GT、窗口與判分驗證通過後才能發布成績 |
| EgoMAN（P250） | 程式已公開，但processed data與模型權重未發布；best-of-K還有特定選樣規則 | 分開程式可讀、素材取得與可評測；不把文件中的219K／3M當作已下載 |

這些是固定來源的靜態核讀發現，並非本次跑出的模型成績。逐篇表提供具體code/hash/行號；涉及可執行行為的問題仍需相應測試。

## Adapter只做四件事

```text
read_native(source_snapshot)
    讀原作，保留native欄位與來源身份

map_catalog(native_record, mapping_version)
    輸出共同目錄；未知、未決和不適用分開

build_case(record_ids, protocol)
    綁定相容環境／觀測、初態、輸入、預算與evaluator

evaluate(prediction_or_trajectory, case)
    保留原生指標，輸出分項證據與明確分母
```

這是共同接口規格，不是宣稱所有來源已實作這四個函式。資料來源沒有原生成功條件時，只能先收目錄與示範；新增robot task需要另寫goal、規則、可解性和判分。

## 每次匯入留下哪些交付物

| 交付物 | 用途 | 本次已有什麼 |
|---|---|---|
| 來源卡與閱讀證據 | 說明讀了哪個版本、哪些內容、哪些仍缺少 | 逐篇JSON、固定commit、行段／JSON pointer與內容hash |
| 欄位對照表 | native欄位→共同含義→轉換→不能推定的內容 | 每篇「可重用／需要轉換／仍需補齊」及共同規格 |
| 原生數量紀錄 | 保留task、layout、sample、frame、trial原單位 | 原文數量摘錄、固定ID清單；全庫語義聯集尚未完成 |
| 匯入與驗證紀錄 | 記錄成功、失敗、缺漏、來源及schema版本 | 現有catalog importer 0.1；不包含所有來源的runtime adapter |
| 發布清單 | 固定要比較的任務、case、資產、協定和評分器 | 來源審閱與目錄下載；新增可執行子集另行驗收 |

GitHub commit只能固定程式。Hugging Face資料revision、下載壓縮檔hash、子模組commit、影片／資產授權和裁判版本仍要各自記錄。原作刪除或暫停發布的內容保留處理結果；不以同名倉庫補位。

## 廣度、規模和難度怎麼報

| 要證明什麼 | 可用的數字 | 比較條件 |
|---|---|---|
| 用途更廣 | 有任務支援的用途數、用途交集與新增用途 | 同一分類表與納入範圍；來源級與任務級覆蓋分開 |
| 任務更多 | 去重後語義任務數、保留前作數、新增規則數 | 相同粒度；換初態／顏色不當成新的語義任務 |
| 環境更多 | 有版本身份的場景／layout聯集 | 共用資產、別名、style組合與程序生成規則分開 |
| 題目更多 | 實際case manifest數量及其中可評測數 | native split、素材與判分資格清楚；train不冒充test |
| 覆蓋有效 | 按來源／用途／任務分組的模型結果與缺漏率 | 缺失預測仍留在expected-case清單，不只報成功讀到的交集 |
| 難度可量化 | 同協定內的baseline反應分佈與不確定性 | 真正跑過模型後才校準；不從文獻篇數推定難度 |

難度先記可觀測條件：步驟／依賴、容許誤差、遮擋、幹擾物、材料、歷史長度、恢復需求和資訊預算。取得模型×case結果後，再於相容的判分協定內校準成功率／誤差分級，依task／scene群聚估計信賴區間。IRT需要足夠的反應矩陣與擬合檢查，不能借用另一領域的100題設定就宣稱機器人難度已校準。

規則擴充要留下「父任務→差異→新判分」：例如同樣把物件放入抽屜，新增關門、指定順序、不可碰倒另一物件或中途滑脫後恢復，分別寫出是否改變語義任務，還是隻新增評測條件。每個新增規則都要有合法完成與近失敗的可核對例子；參數排列數不直接當完成題數。

## 限速與可續作

先讀快取，再抓必要的小型來源檔；所有程序共用請求排程。GitHub搜尋至少間隔6.5秒，一般API至少0.85秒，raw檔與各網站至少1秒。收到429或rate-limit 403時依Retry-After／reset暫緩，保留deferred狀態，不立即重試。這能降低觸發限制的機率，不能保證服務端永遠不限制。

代理同樣採一次一個短批次、完成即保存；遇模型服務429就停止新增代理請求，繼續本機整理。來源已完成、待查核和暫緩都有獨立紀錄，續作不需要把整批重新抓取。

## 發布前的最小驗收

- 身份與版本：來源、task、scene、case、evaluator能回到原作；子模組／資產版本沒有偷換。
- 資料保留：原始紀錄與共同紀錄可以回查；時間、單位、座標、T/T+1及label不因loader而丟失。
- 合法輸入：模型看到的欄位符合protocol，參考答案／未來／特權狀態按約定管理。
- 判分正確：接受合法完成、拒絕相關近失敗，missing/invalid和聚合分母明確。
- 比較公平：native split保留；新split有血緣核對，候選數、時間／動作／適應預算固定。
- 計數可重算：論文、倉庫、task、環境、case、trial不混加；已取得與已可評分欄。

本研究的規模優勢應來自有出處的任務與環境聯集，以及清楚定義的新規則。程式倉庫數、資料檔案數或參數乘積，不能代替這些證據。
