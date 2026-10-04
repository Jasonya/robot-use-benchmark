# Robot-use Benchmark：逐篇來源審閱與整合設計

版本v0.11；用途歸納更新2026-10-04，原作審閱2026-10-02。

250篇現有書目全部初篩；143個原登記來源加40個補入來源，共183篇已讀資料／benchmark／評測相關章節。其餘67篇保留方法、原作實驗、survey或統計方法索引。不宣稱窮盡全球文獻。

『已審閱』指核對原作身份並閱讀所列PDF頁的任務、資料與評測段落；不表示全文逐字精讀、原始標註逐題人工複核或程式已重現。

## 本輪數字與目標

| 項目 | 目前確認 | 下一階段規劃口徑 |
|---|---|---|
| 領域 | 21 已歸納用途類別。183/183份來源均有歸類；原22份已補齊。每個用途有任務／場景理由；同一來源可涵蓋多用途。 | 按任務、對象與目標歸納，再逐任務建立聯集；新用途可擴充分類。 |
| 環境 | 284 已取得命名場景條目。64個已讀來源有某種環境量；284條僅是已取ID子集，未完成跨庫幾何去重。 | 整理各來源scene/layout/location及重用關係後，計全庫聯集；不再先配1,000。 |
| 任務 | 2,096 已取得robot任務條目。另有7資訊題型、263人類活動。原作task/skill/instruction的差異已逐篇記錄，尚未全部正規化去重。 | 先取原作任務聯集，再加有差異證据的新目標／規則；不再先配5,000。 |
| 題數 | 114,288 已取得題目定義元資料。111,652 PARTNR train＋1,000 val＋1,636 OpenEQA；含訓練資料，素材未全齊，不是114,288道已整合測試題。 | 依task、split、合法輸入及判分建立case manifest後定量；原作量、已取得量、可評量分列。 |
| 評估方式 | 4 共同判分大類。183份來源均有判分方式與原文依據；具體metrics及評分器仍各自保留，尚未全數掛接。 | 答案、誤差、狀態／過程、人工／模型評審各報；不以4類代表4個完成的通用評分器。 |

v0.9的12領域／1,000場景／5,000任務／100萬題配額已撤回。4種判分方式仍作分類，不作完成量。實際清單仍保留，未知的全庫聯集不填0。

## 阅读後的主要發現

### 有任務就能進一步歸納用途，不必等待同名domain標籤

CALVIN的抽屜／燈光、Meta-World的咖啡機／裝配、TACO的攪拌／倒液均提供明確用途。RoboNet、GRIP與穿戴動作研究則以正式跨場域用途歸類；原22份皆有逐筆證據。
依據：P065、P063、P198、P128、P193、P197，詳見逐篇紀錄。

### 大量題目不一定是大量不同任務

Meta-World的50種task與參數instances、RoboRecover的400test recovery scenarios、EGOSTREAM的2,250問題→8,528recall測例，分別增加不同層級。每個數字保留它自己的單位。
依據：P063、P178、P203，詳見逐篇紀錄。

### 影片與通用資料整合前作已經很大

HowTo100M的23,611人類活動標籤、OXE的527skills與160,266作者報告tasks、OpenEgo的290來源task labels都要比較。它們不是同一種正規化機器人任務。
依據：P002、P125、P199，詳見逐篇紀錄。

### 環境數最容易混入配置與影片標籤

RoboCasa365的layout×style配置、DROID的564workspaces、S-EMBER的2,090scenario labels層級不同。DreamDojo自己的table與正文scene量也不一致，已明列待核。
依據：P071、P126、P204、P150，詳見逐篇紀錄。

### 主張範圍通常大於實際實驗子集

BEHAVIOR-1K的活動定義與原始baseline子集、AutoBio的16定義/9實測、Labimus的完整流程設計與v0已驗證部分均應分欄。
依據：P100、P176、P174，詳見逐篇紀錄。

### 同源的資料與資產需要保留關係

Ego4D衍生多個QA/預測集合；EgoDex又出現在OpenEgo與EMPIRE；HSSD支援HomeRobot、Habitat3和PARTNR。來源聯集不能直接相加這些原作數字。
依據：P013、P119、P199、P224、P099、P142、P143，詳見逐篇紀錄。

### 答案、代理量和物理完成有不同證據

摘果waypoint接近、衣物外形IoU、world-model影片品質、人工偏好和實際robot success不能等同。不同predicate、失敗排除、oracle資訊和best-of-K預算均留在逐篇紀錄。
依據：P213、P089、P191、P150、P250，詳見逐篇紀錄。

### 現在的難度只能在共同協定下校準

EMPIRE按baseline error分級、LIBERO-Plus按擾動設定分級、RoboRecover按referencepolicy可恢復率篩選，都依賴各自模型和協定。不能取一篇的easy/hard直接替另一篇定級。
依據：P224、P105、P178，詳見逐篇紀錄。

## Survey分布

研究類型沿用書目的12類並按本輪阅读修正所列來源。每篇一個主類，用於survey分布；細部角色和多種判分方式另保留。研究類型不是生活用途，兩者不能用篇數配額互相換算。

| 研究類型 | 已詳細審閱來源 | 全部書目 |
|---|---:|---:|
| 人類影片與動作資料 | 32 | 32 |
| 理解、推理與規劃 | 21 | 25 |
| 未來動作／互動預測 | 18 | 48 |
| 一般操作 benchmark | 31 | 32 |
| 布料／柔性物操作 | 21 | 26 |
| 導航與家務執行 | 11 | 11 |
| 穩健性、失敗與評測品質 | 19 | 19 |
| 人類觀測到機器人轉移 | 7 | 11 |
| 機器人資料與通用策略 | 6 | 16 |
| 輔助與協作 | 11 | 11 |
| 世界模型與預測表示 | 5 | 9 |
| Survey／評測方法 | 1 | 10 |

用途按原作的任務目標、操作對象、互動關係及場景歸納，包含生活／工作用途及跨場域應用。183份來源均至少歸入一類，共21類；同一來源可以有多個用途。類別名稱是本庫的survey編碼，不要求原文先給出相同domain標籤。

| 生活／工作用途 | 來源數（可重複標記） | 來源支持 |
|---|---:|---|
| 居家整理與清潔 | 104 | P001、P003、P007、P009、P010、P011、P012、P013、P016、P017、P018、P024、P026、P027、P028、P029、P030、P031、P032、P033、P038、P039、P040、P042、P062、P063、P064、P065、P066、P067、P068、P069、P070、P071、P072、P073、P074、P075、P076、P080、P081、P082、P083、P084、P087、P093、P094、P095、P096、P097、P098、P099、P100、P101、P104、P105、P106、P107、P108、P109、P111、P114、P116、P119、P123、P124、P129、P142、P143、P144、P145、P164、P165、P166、P169、P178、P180、P181、P198、P199、P201、P202、P203、P204、P205、P206、P207、P212、P214、P034、P037、P051、P054、P110、P125、P126、P127、P120、P132、P150、P222、P228、P247、P250 |
| 餐飲與烹飪 | 70 | P003、P004、P005、P006、P008、P009、P010、P011、P012、P013、P014、P018、P021、P022、P023、P024、P026、P027、P028、P029、P030、P031、P032、P033、P039、P063、P070、P071、P072、P073、P096、P097、P098、P100、P101、P105、P106、P108、P109、P116、P141、P143、P145、P152、P164、P166、P182、P198、P202、P204、P207、P212、P214、P002、P053、P057、P060、P125、P126、P127、P132、P217、P222、P228、P229、P233、P241、P246、P247、P250 |
| 衣物與洗護 | 25 | P045、P082、P083、P085、P086、P087、P092、P093、P100、P119、P151、P152、P167、P181、P185、P196、P088、P089、P090、P091、P127、P186、P188、P191、P120 |
| 辦公與教育 | 18 | P018、P038、P039、P042、P072、P094、P095、P100、P101、P141、P144、P145、P202、P002、P054、P126、P120、P150 |
| 工藝與修繕 | 17 | P003、P004、P013、P023、P028、P029、P031、P041、P063、P073、P106、P112、P141、P002、P034、P054、P150 |
| 裝配與生產作業 | 30 | P015、P016、P023、P063、P067、P068、P069、P076、P079、P082、P083、P106、P112、P115、P119、P129、P141、P170、P171、P177、P179、P183、P184、P207、P208、P210、P211、P120、P150、P225 |
| 包裝、倉儲與物流 | 8 | P076、P084、P086、P103、P164、P170、P200、P077 |
| 零售與購物 | 9 | P013、P031、P100、P164、P200、P202、P204、P120、P150 |
| 實驗室操作 | 12 | P021、P031、P072、P112、P164、P172、P173、P174、P175、P176、P192、P120 |
| 醫療與手術支援 | 5 | P041、P113、P164、P060、P247 |
| 個人照護 | 8 | P003、P014、P031、P087、P103、P148、P167、P002 |
| 交通移動與車輛維修 | 12 | P003、P004、P013、P014、P031、P202、P002、P060、P150、P226、P247、P250 |
| 農業與園藝 | 7 | P013、P023、P028、P031、P100、P002、P213 |
| 休閒與運動 | 16 | P003、P013、P014、P019、P020、P031、P033、P041、P063、P072、P106、P202、P002、P054、P229、P247 |
| 公共場館與服務 | 3 | P102、P103、P209 |
| 寵物照護與動物活動 | 4 | P025、P041、P205、P002 |
| 音樂與表演 | 3 | P014、P229、P247 |
| 社交與溝通 | 7 | P013、P019、P020、P032、P033、P061、P168 |
| 通用物件與機動作業 | 31 | P062、P063、P065、P067、P068、P069、P075、P076、P081、P082、P083、P084、P106、P107、P115、P123、P129、P151、P152、P169、P171、P177、P182、P212、P214、P077、P125、P128、P193、P222、P228 |
| 協助、交接與陪伴 | 17 | P058、P061、P073、P097、P103、P113、P141、P142、P143、P145、P146、P147、P148、P168、P208、P209、P210 |
| 穿戴互動與動作介面 | 25 | P013、P014、P018、P019、P020、P058、P119、P197、P198、P199、P051、P053、P057、P060、P216、P222、P224、P225、P226、P228、P229、P230、P233、P247、P250 |

用途歸納完成：183/183；未歸類：0。120份涉及多用途，共431筆用途對應；來源仍只有183份。

## 用途歸納方法

先從具體任務歸納用途：例如開抽屜／收納歸居家、咖啡機／餐具歸餐飲、插栓／螺帽歸装配。原作以基礎物件或運動目標為主時，歸通用作業；以協助人或交接為目標時，歸協作服務；以穿戴視角的人體動作訊號為目標時，歸動作介面。跨用途是正常的多重歸類，並不等於未分類。每個用途判定保存任務例子、歸納理由與原文頁碼。

1. **先找任務、對象與目標**：把原文還原成「誰對什麼做什麼、完成什麼目標」。研究在模擬桌上進行，仍可由抽屜、餐具或装配目標判斷用途。
2. **把任務歸到用途**：先歸納可辨認的生活／工作用途；若原作本來就是跨場域的基礎作業、陪伴交接或動作介面，使用有明確範圍的正式用途類別。
3. **按实际子集繼承**：LIBERO-Plus、MetaWorld+等先核對保留了哪些父任務，再繼承相應用途；不把父庫所有領域都搬給只用其中一小部分的工作。
4. **每筆保留理由並檢查完整性**：每個用途標籤都附任務／場景證據及頁碼。建置時檢查183份來源皆有歸類、所有類別皆有來源，新增來源缺判定時要求補完。

### 三類正式跨場域用途

- 通用物件與機動作業：以搬移、抓握、對齊、作業復現、行走或平衡等目標構成的跨場域基礎作業與技能測試。 納入條件：原作具有明確的基礎作業目標，或其選用子集刻意測跨物件／機體的通用技能。 範圍：不因使用機器人或內含抓取動作就自動加入；單一用途的料理／實驗室流程仍以其目的歸類。
- 協助、交接與陪伴：以人或協作者的需求、接收物品、共同時序、不中斷對方及持續陪伴為目標的服務。 納入條件：合作對象／需求／交接或陪伴關係是任務定義的一部分。 範圍：雙手或多個機器人本身不足以判定；依實際的互動服務目標歸納。
- 穿戴互動與動作介面：利用穿戴視角的手部、人體、視線及移動訊號，支援動作輸入、AR／VR、操作意圖與人類到機器人的動作介面。 納入條件：輸出或主要資料直接描述姿態、動作、接觸、視線或交互動作訊號。 範圍：不因有ego視角就把所有影片QA一律歸入；仍須看具體輸出與用途。

## 原22份來源如何完成歸納

| 來源 | 本版用途 | 任務與歸納理由 | 原文依據 |
|---|---|---|---|
| P058 EgoPAT3Dv2 | 協助、交接與陪伴、穿戴互動與動作介面 | 預測人手將接觸的位置，讓共享工作區的機器人提前配合；同時是頭戴裝置的動作意圖介面。 | P058 PDF 1 |
| P063 Meta-World | 居家整理與清潔、餐飲與烹飪、工藝與修繕、裝配與生產作業、休閒與運動、通用物件與機動作業 | 50個任務已有明確的用途線索：家居設備、餐飲、修繕／裝配、球類操作，以及通用取放。 | P063 PDF 18；P063 PDF 18；P063 PDF 18；P063 PDF 18；P063 PDF 18 |
| P065 CALVIN | 居家整理與清潔、通用物件與機動作業 | 開抽屜、控制燈與把物件收好屬居家整理；方塊轉動、推移與堆疊則保留為通用作業。 | P065 PDF 3；P065 PDF 3 |
| P073 RoboTwin | 居家整理與清潔、餐飲與烹飪、工藝與修繕、協助、交接與陪伴 | 從杯子擺放、蘋果收納、掃除、鎚擊與人際互動資料歸納，保留每種用途所對應的任務範圍。 | P073 PDF 8；P073 PDF 5,8；P073 PDF 8 |
| P103 Follow-Bench | 包裝、倉儲與物流、個人照護、公共場館與服務、協助、交接與陪伴 | 跟隨指定人是陪伴服務；原作亦明列照護、巡邏、導覽與物流的應用方向。 | P103 PDF 1,6；P103 PDF 1 |
| P105 LIBERO-Plus | 居家整理與清潔、餐飲與烹飪 | LIBERO-Plus改變觀測與初態條件，未改掉原任務的餐具擺放、廚房設備及收納用途。 | P105 PDF 2；P064 PDF 3,4 |
| P106 MetaWorld+ | 居家整理與清潔、餐飲與烹飪、工藝與修繕、裝配與生產作業、休閒與運動、通用物件與機動作業 | MetaWorld+保留原50項任務並修正版本和評測協定，因此沿用具體任務支持的用途。 | P106 PDF 4；P063 PDF 18；P063 PDF 18；P063 PDF 18；P063 PDF 18；P063 PDF 18 |
| P115 RoboMME-Interference | 裝配與生產作業、通用物件與機動作業 | 依示範選物、搬方塊、重畫路徑與插栓，歸入通用作業復現與装配基礎作業。 | P115 PDF 2,3；P115 PDF 3 |
| P146 DexH2R | 協助、交接與陪伴 | 核心就是把人手中的物件交給機器人，歸入協助與交接用途。 | P146 PDF 1,3 |
| P147 HRIBench | 協助、交接與陪伴 | 按人的指令、時機和動作完成協作，涵蓋交接、同步、讓行及受干預後續作。 | P147 PDF 3,4 |
| P182 SoftVTBench | 餐飲與烹飪、通用物件與機動作業 | 歸納為易損物取放的通用作業；烘焙品形狀物件的放置情境另標餐飲處理方向。 | P182 PDF 5,6；P182 PDF 5 |
| P197 EgoSim / MultiEgoView | 穿戴互動與動作介面 | 身體攝影機用來恢復使用者動作及支援互動輸入，歸入穿戴互動與動作介面。 | P197 PDF 1,5 |
| P198 TACO | 居家整理與清潔、餐飲與烹飪、穿戴互動與動作介面 | 用原作工具—動作—物件組合歸納：倒液與攪拌屬餐飲，清潔器具屬居家，手物動作建模亦服務AR／VR介面。 | P198 PDF 2,5；P198 PDF 2 |
| P212 ARB4WM | 居家整理與清潔、餐飲與烹飪、通用物件與機動作業 | 同時涵蓋物件操作與行走／平衡控制，歸入通用作業；門窗與咖啡／餐盤任務另標對應用途。 | P212 PDF 8；P212 PDF 8 |
| P214 COIN（interactive） | 居家整理與清潔、餐飲與烹飪、通用物件與機動作業 | 開櫃、找書、操作微波爐都有可辨認用途；純互動推理與幾何控制題保留在通用作業。 | P214 PDF 20,23；P214 PDF 4,17 |
| P128 RoboNet | 通用物件與機動作業 | 核心目標是把未知物件推或抓放到指定位置，歸入跨場域物件搬移作業。 | P128 PDF 3,5 |
| P193 GRIP | 通用物件與機動作業 | 產生穩定抓握並預測物件受力，歸入通用抓取與易損物處理作業。 | P193 PDF 4,5,6 |
| P216 HAP | 穿戴互動與動作介面 | 預測頭部轉向以看到被遮擋的操作目標，歸入穿戴觀察與動作介面。 | P216 PDF 1,5 |
| P222 Uni-Hand | 居家整理與清潔、餐飲與烹飪、通用物件與機動作業、穿戴互動與動作介面 | 把手部預測連到互動介面與機器人示教；杯墊擺杯、蘋果入盤和盒子上架另提供餐飲／整理用途。 | P222 PDF 9,10；P222 PDF 9,10 |
| P224 EMPIRE | 穿戴互動與動作介面 | 預測雙手未來動作並產生操作計畫，歸入穿戴互動與動作介面。 | P224 PDF 1,4 |
| P228 SFHand / EgoHaFL | 居家整理與清潔、餐飲與烹飪、通用物件與機動作業、穿戴互動與動作介面 | 即時語言引導手部預測歸入動作介面；其Kitchen與Adroit下游評測另外歸納家居／餐飲與通用作業。 | P228 PDF 1,5；P228 PDF 5 |
| P230 EgoH4 | 穿戴互動與動作介面 | 包含視野外雙手的姿態與動作預測，歸入AR／VR等穿戴動作介面。 | P230 PDF 1,2 |

## 如何把大而廣變成可發表的benchmark

先完成來源聯集，再擴充任務和規則。集合的上限不能由論文數推定，異質數字不相加。要證明比前作更廣、更大，須在相同任務粒度下報去重後任務數，並列各前作未覆蓋而本庫真正可評的用途、任務與規則。RoboVerse、OXE、OpenEgo等整合型前作必須直接比較。

環境、示範和評分器可以重用；新增目標、過程約束和介入條件要留下父任務與差異。每個case需要明確輸入、答案或goal predicate、split、版本及預算。不同機體或感測條件下使用分組榜單；問答、預測、規劃和物理控制的證據分開。

本輪是來源審閱與設計依據的完成，尚非通用benchmark全庫的實驗完成。接下來的論文證據應来自共同任務清單、有效case、可重現判分器與baseline結果。

## 難度量化

1. 先記可觀測條件：步驟/依賴數、物件干擾、容許誤差、材料、遮擋、歷史長度、恢復和資訊預算。這些是條件，不預先加成一個任意難度分數。
2. 同一case固定split、observation/action與budget，選涵蓋不同能力的baseline，記逐case成功/誤差和重跑。用task/source/scene群聚bootstrap估計不確定性。
3. 在同輸出/判分協定內，以baseline成功率或相對誤差校準難度，報分布與模型依賴。QA和物理控制不共用一條未驗證的分數尺。
4. 有足夠模型×題目矩陣後才試IRT或辨識度，檢查擬合、單調性和source依賴；用新模型驗證分級是否穩定。

## Milestones

### M1　來源閱讀與共同比較

本版250篇篩查、183份逐篇審閱、原文頁碼/單位/重用紀錄和五欄比較表。
驗收：所有原143來源有記錄，補入40來源；可重算分類分布，未知與衝突公開。
狀態：本輪已完成，限現有書目範圍

### M2　逐ID整理環境與任務聯集

取得各來源任務清單，保留source ID、version、split、資產引用；標示equivalent/derived/unresolved。
驗收：來源覆蓋率按183來源計；每筆任務有父來源和判分定義，不能僅比名稱。
狀態：已有部分清單；全庫去重尚未完成

### M3　擴充任務與規則

針對已核來源新增必要過程、精度、安全、恢復、記憶與協作規則；逐條記錄相對父任務新增了什麼。
驗收：新增語義目標與新增測例條件分开計數；每個合法變體有可解性與evaluator驗證。
狀態：設計可據來源展開；未承諾固定題數

### M4　建立可執行評測與論文證據

分問答、預測、規劃、控制輸出報分；固定觀測/動作/時間/抽樣預算，做來源與任務群聚切分。
驗收：公開case manifest與判分器，報subset實測及不確定性；以去重後覆蓋和新增任務證明規模優勢。
狀態：全庫尚未完成；既有小型實驗為工程附錄

## 逐篇來源紀錄

### P100　BEHAVIOR-1K（2024）

原作：https://arxiv.org/abs/2403.09227
本次PDF：https://arxiv.org/pdf/2403.09227v1
PDF SHA256：ab4033f3e8a8187ad2cfdf11f1979d33996ecce1e81fa3d62af33a92bbb17a2b
閱讀頁：1、2、3、4、6、7、20、24。人類需求survey、1K activity來源、scene/object表、BDDL與Transition Machine、baseline範圍。

- 研究類型：導航與家務執行；室內長流程操作
- 領域：居家整理與清潔、餐飲與烹飪、衣物與洗護、辦公與教育、零售與購物、農業與園藝
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：50scenes／373rooms／8scene types；包含house、garden、restaurant、office等；不能把rooms和scenes相加。
- 任務：1,000 BDDL activities＝人類需求排序選909＋沿用BEHAVIOR100的91項；2,090是survey候選池，不是已實作任務。
- 題數／資料：程序生成滿足initial predicates的配置；原文baseline只實測CollectTrash、StoreDecoration、CleanTable三活動，非1,000活動全模型成績。
- 評估方式：success、goal score Q、時間、導航距離、擾動物件量。；低階RL與assistive grasp/teleport primitive分開；高分primitive不能代稱低階policy已解題。
- Split／資訊條件：原文3活動實驗；初態生成規格與實驗seed／rollout需另外記錄。
- 來源關係：BEHAVIOR100的延伸；ATUS等time-use survey及WikiHow為活動來源。OmniGibson混用物理與temperature/烘焙等heuristic transition，非所有現象都是精密物理。
- 可復用：全庫廣度與生活活動規格的核心比較基準；新庫要提出超過其已有activity和規則的具體聯集。
- 待核／限制：全1K activities的去重semantic goal、可用資產及可解性應逐規格核，不用1K宣稱1K模型可評結果。

### P082　RoboVerse（2025）

原作：https://arxiv.org/abs/2504.18904
本次PDF：https://arxiv.org/pdf/2504.18904v1
PDF SHA256：8c0cb543ef3f0c9a033f06cbbd73a86f2f1177029751e72e86a54d366c355008
閱讀頁：1、2、3、5、6、7、8、9、10、34。MetaSim架構、來源遷移全表、操作/導航/人形資料、4級泛化與實驗子集。

- 研究類型：一般操作 benchmark；跨資料集整合與評测方法
- 領域：居家整理與清潔、衣物與洗護、裝配與生產作業、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：操作多底座遷移；導航重用90個Matterport3D scenes；59camera候選不是59環境。
- 任務：表I遷移276 manipulation task categories，另導航／人形。RLBench取80、CALVIN7、LIBERO10等為其遷移子集，不是全源benchmark相加。
- 題數／資料：510.5K manipulation trajectories、約5.5K assets；navigation另R2R10K、RxR20K episodes。主要IL表只評6個代表task。
- 評估方式：統一success checker／success rate；L0 task-space、L1場景、L2camera、L3光照反射。；不同simulator的migration成功不保證完全等價物理；需固定backend。
- Split／資訊條件：原作90/10；主IL取10train設定＋10validation設定，3seeds；OpenVLA另限制20test scenarios。
- 來源關係：直接整合ManiSkill、RLBench、CALVIN、MetaWorld、Robosuite/MimicGen、GAPartNet、Open6DOR、ARNOLD、LIBERO、SIMPLER、RLAfford、GraspNet、GarmentLab、UniDoorManip、GAPartManip；導航R2R/RxR、人形HumanoidBench等。
- 可復用：本研究最重要的整合型比較對象之一；『把前作放一起』已有實作，新增貢獻要在coverage、規則、來源聯集與評估完整度。
- 待核／限制：276類是否存在跨源語義等價未在本文提供完整去重證據；需追MetaConfig IDs。

### P071　RoboCasa365（2026）

原作：https://arxiv.org/abs/2603.04356
本次PDF：https://arxiv.org/pdf/2603.04356v1
PDF SHA256：f3e6877b8de3dd471afb6951c1e067729e2a57c53fcb3d6daaa0f4af5080206b
閱讀頁：1、2、3、4、5、6、7、22。新舊資產、pretrain/target場景、365task組成、資料與eval。

- 研究類型：一般操作 benchmark；模擬操作benchmark
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：50新layouts×50styles＝2,500 pretrain scenes；另10 target layouts各配一style＝10 target scenes。2,500不是2,500 floor plans。
- 任務：365＝65 atomic＋300 composite；60活動歸6家族；220任務需mobile、145不需。主要target評測50任務＝18 atomic＋16 seen composite＋16 unseen composite。
- 題數／資料：30K human pretrain＋25K human target；60atomic各生成10K（600K synthetic）。target eval每task30trials；demo量不算test題。
- 評估方式：task-specific binary success，per-task horizon；跨task平均。
- Split／資訊條件：pretrain300task；target50含16個pretraining未見composite；场景／style也分離。
- 來源關係：直接擴充RoboCasa；本文引述旧composite83是另一版本，不能覆蓋2024原文75。
- 可復用：是大規模廚房benchmark必要主比較；跨生活用途更廣與域內更大是兩項不同主張。
- 待核／限制：365全任務與本文pretrain/target資料實際涵蓋聯集需manifest核對；不能從『cover all』概述推論每task都有同量demo。

### P125　Open X-Embodiment（2023）

原作：https://arxiv.org/abs/2310.08864
本次PDF：https://arxiv.org/pdf/2310.08864v9
PDF SHA256：13f16aff5afdee583dc25b3c570e9bb0cf6baefb59b539928d919588cd8d9246
閱讀頁：1、2、3、4、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：機器人資料與通用策略；跨資料集整合與評測方法
- 領域：居家整理與清潔、餐飲與烹飪、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：60來源datasets、22embodiments；場所數由各dataset metadata而來，非60新環境。
- 任務：結論報527skills／160,266tasks；方法用語言抽取skills，不能直接當160,266正規化goal definitions。
- 題數／資料：1M+robottrajectories；主RT-X混合只選9manipulators，非全22都等量實測。
- 評估方式：跨robot實機tasksuccess、OOD／emergent skills與移除Bridge對照。
- Split／資訊條件：不同experiment的hosttask/robot子集不同；dataset-wide規模與policy實測範圍分開。
- 來源關係：整合既有datasets到RLDS；不統一所有action坐標，absolute/relative/velocity仍可能不同。
- 可復用：all-in-one最重要對照之一：我們不能以合併資料夾或粗7Dactionformat宣稱首次通用benchmark。
- 待核／限制：160,266的逐task IDs與同義/粒度規則未在已讀段完備；21institutions／34labs的口徑也需保留。

### P126　DROID（2024）

原作：https://arxiv.org/abs/2403.12945
本次PDF：https://arxiv.org/pdf/2403.12945v2
PDF SHA256：9e40a9c934ce78ea315d2c05593d60f9e18edf6dcd3785cd66439518965c3b07
閱讀頁：1、2、3、7。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：機器人資料與通用策略；真實操作benchmark
- 領域：居家整理與清潔、餐飲與烹飪、辦公與教育
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：564workspace scenes分52buildings；換物件擺位不增加scene。
- 任務：86是unique verb/task口徑；下游主實驗6tasks/4locations，不是全86實測。
- 題數／資料：76Kdemonstrations/350h；6task各50–150in-domain demos，混合DROID訓練。
- 評估方式：ID/OOD task success；nativepolicyrollouts分母需appendix/manifest另核。
- Split／資訊條件：主task各有distractor/novelobject/cameravariation；不是564場所全部held-out驗證。
- 來源關係：新distributedcapture；DROID表I與RH20T用unique multi-view trajectory重算，不能代替RH20T原作報告數。
- 可復用：提供workspaces與objectrandomization的清楚環境定義；大資料與小評測子集須並列。
- 待核／限制：18researchlabs/13institutions/18robots是不同口徑；主規模不能稱86完整獨立工作流程。

### P132　RT-1（2022）

原作：https://arxiv.org/abs/2212.06817
本次PDF：https://arxiv.org/pdf/2212.06817v2
PDF SHA256：81efe669c8fa50ffc7097886dc78a442fa7a8f7f2451684b93069cb9fbeda767
閱讀頁：1、4、5、7、8、9。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：機器人資料與通用策略；通用策略的原作任務評測
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：三evalenvironments：robotclassroom與兩個realofficekitchens；13robots不是13獨立場景。
- 任務：Table1有744language instructions，依verb分skill；不等同744工作家族。
- 題數／資料：約130Kdemonstrations；主seen>200instructions、unseen21、robustness30/22、long15；全研究>3,000trials。
- 評估方式：task SR與SayCan長流程成功；architectures在相同RT1資料重訓。
- Split／資訊條件：novelinstructions保持object/skill可在別的training組合看過；OOD場景另列。
- 來源關係：自收Google/EverydayRobot資料，後被OXE/其他策略重用。
- 可復用：說明前作也能有數百instructiontasks；比較規模必須對齊語義粒度。
- 待核／限制：>3,000是跨method/condition執行次數；不能當3,000獨立test cases。

### P063　Meta-World（2019）

原作：https://arxiv.org/abs/1910.10897
本次PDF：https://arxiv.org/pdf/1910.10897v2
PDF SHA256：8ea4fd9e7a2f7a2cfc475ae7e7021e7a6c03b99ae3932b455def9197ff1197e8
閱讀頁：1、4、5、6、7、12。50任務定義、觀測／動作／reward及MT／ML協定。

- 研究類型：一般操作 benchmark；模擬操作benchmark
- 領域：居家整理與清潔、餐飲與烹飪、工藝與修繕、裝配與生產作業、休閒與運動、通用物件與機動作業
- 用途歸納：50個任務已有明確的用途線索：家居設備、餐飲、修繕／裝配、球類操作，以及通用取放。
- 環境：50個task environment配置，共用Sawyer桌面；不能解讀為50種生活場域。
- 任務：50個非參數性操作類型；原文又把位置／goal參數化實例稱task，需保留兩種含義。
- 題數／資料：MT10含10環境×50參數配置＝500；MT50為50×50＝2,500訓練task instances。這不是500／2,500個新語義任務，也不是正式test QA。
- 評估方式：各task成功predicate／目標距離門檻，success與dense reward分開。
- Split／資訊條件：MT同已見任務學習；ML10／ML45各有5保留task適應；ML1只在同一task變換50train／50test goal。
- 來源關係：MuJoCo、Multiworld及Gym介面；後續MetaWorld+等為其擴充，不可把上游再次全加。
- 可復用：提供桌面操作任務底座；位置擴樣容易，生活用途拓寬有限。
- 待核／限制：不同v1／v2／後續release成功predicate細節與本地歷史pilot須以commit分開。

### P062　RLBench（2019）

原作：https://arxiv.org/abs/1909.12271
本次PDF：https://arxiv.org/pdf/1909.12271v1
PDF SHA256：fbb04509bea7bf6aa9b97b07c46d95e5c1a900987599693b3fae3fd84377db76
閱讀頁：1、3、4、5、6、7。原生task／variation／episode定義、scene、成功條件與few-shot協定。

- 研究類型：一般操作 benchmark；模擬操作benchmark
- 領域：居家整理與清潔、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：共用1個Panda桌面scene，載入各task資產；API的TaskEnvironment不等於獨立房間。
- 任務：原文100手寫task，每task多variation（如目標色彩／物件），每variation再抽初態episode。
- 題數／資料：episode／demo可隨機生成，原文沒有固定全庫題數；few-shot原版10%任務meta-test，1／5／20 demonstrations是每任務支援樣本預算。
- 評估方式：task-specific success conditions，完成才給+1 sparse reward；few-shot在新episode報success。；demo生成器通過驗證不代表學習策略已成功。
- Split／資訊條件：原版90% tasks train、10% unseen tasks test；每次測試不能先知未見task規則。
- 來源關係：V-REP／PyRep／OMPL；大量後續benchmark重用其task、資產和成功predicate。
- 可復用：可直接作任務來源與擴充規則底座；task、variation、episode原作已有清楚先例。
- 待核／限制：後續版本的task總量與常用18-task子集要另附commit，不能用來改寫2019原文。

### P064　LIBERO（2023）

原作：https://arxiv.org/abs/2306.03310
本次PDF：https://arxiv.org/pdf/2306.03310v2
PDF SHA256：ff7d943e2eb37760df684f3ae2931a5a35ef8ea465bd387e62afe49507b8e414
閱讀頁：1、2、3、4、5、6、9、10。任務生成、PDDL goals、4 suites、lifelong指標及pretraining切分。

- 研究類型：一般操作 benchmark；模擬操作benchmark
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Robosuite場景配置；layout／objects由PDDL定義，本文已讀段落未報去重layout總數。
- 任務：130＝Spatial10＋Object10＋Goal10＋LIBERO100；LIBERO100內90短程預訓練＋10長程。LIBERO-Long不是再額外增加10。
- 題數／資料：各task有human demos与隨機初態評估；可生成不代表固定無限題庫已发布。
- 評估方式：全部goal predicates為真才成功；以success計forward transfer、negative backward transfer、AUC。
- Split／資訊條件：lifelong順序學task，過往資料限制；90→Long10预训练與Spatial/Object/Goal控制變因是不同協定。
- 來源關係：明確由Ego4D語言behavior templates生成task instructions，實作建於Robosuite；已是人類程序到robot benchmark的先例。
- 可復用：與本研究來源聯集主線高度相關；新貢獻需超過同類模板生成與桌面範圍。
- 待核／限制：各發布demo／init-state精確ID數需對照版本，不從別篇約5K反推。

### P068　ManiSkill3（2024）

原作：https://arxiv.org/abs/2410.00425
本次PDF：https://arxiv.org/pdf/2410.00425v2
PDF SHA256：0482cef460af5ca0dd09d2b1d0f499b996287d9dadec31b13ca60377a49ee80c
閱讀頁：1、3、4、6、7、8、21、22、28。12種類型、平台與task生成、性能和learning評测段落。

- 研究類型：一般操作 benchmark；模擬平台與任務套件
- 領域：居家整理與清潔、裝配與生產作業、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：GPU異質並行模擬；1024平行instances／cameras是運行規模，非1024不同生活場景。
- 任務：原作12 task categories包含tabletop/mobile、room-scale、locomotion、bimanual、multi-agent、drawing/cleaning、dexterous、tactile、classic control、digital twins、soft-body；這12類不是12生活domain。
- 題數／資料：擴展中的環境註冊表與demo來源，無單一固定全庫test題數；例如SIMPLER轉接4種環境。
- 評估方式：task success／return、sample efficiency與wall-clock分開；渲染FPS／VRAM是系統性能，非任務成功率。；本文GPU rasterization與IsaacLab ray tracing比較非完全同畫質，原作有明示。
- Split／資訊條件：不同RL／IL／VLA／sim2real設定各有來源；應固定demo數、生成方式與控制器。
- 來源關係：ManiSkill2平台與任務延伸，另接SIMPLER等；不能把platform release當完全獨立benchmark family。
- 可復用：可作執行底座；廣泛技術支援不等同每種生活用途已有完整任務與cases。
- 待核／限制：目前API註冊task總量隨版本變動，需固定commit再盤點；本文不提供永續固定總數。

### P074　RoboTwin 2.0（2025）

原作：https://arxiv.org/abs/2506.18088
本次PDF：https://arxiv.org/pdf/2506.18088v2
PDF SHA256：316ae82a97968e1a2d88540665401645a190d2699d7d8652e8fc0053ba609bda
閱讀頁：1、2、3、6、10、11、19。MLLM產生器、物件庫、50task benchmark、Easy/Hard及real驗證。

- 研究類型：一般操作 benchmark；模擬與真實操作benchmark
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：雙臂桌面程序配置；Easy/Hard為clutter／光照／texture／高度分布，不是兩個生活domain。
- 任務：50 benchmark tasks；另外真實實驗4task×4conditions；RoboTwin-OD 147類731物件。
- 題數／資料：每task50 clean train demos，測試100rollouts於Easy/Hard條件；真實測試training另10real+1,000synthetic。
- 評估方式：simulation／real task success；Easy和Hard分開。；MLLM observer的failure detection／localization是產生器輔助診斷，不能替代所有物理success checker。
- Split／資訊條件：single-task training，Easy到Hard分布外；DP3在模擬可得完美point clouds／clean segmentation，跨方法需標明。
- 來源關係：RoboTwin延伸，Rodin資產、skill API和sim-in-loop expert生成。
- 可復用：可借雙臂流程與有物理回饋的產題；50task不因兩種難度變成100語義task。
- 待核／限制：100rollouts的公開seed列表與兩條件是否完全對應需eval script核。

### P143　PARTNR（2024）

原作：https://arxiv.org/abs/2411.00081
本次PDF：https://arxiv.org/pdf/2411.00081v1
PDF SHA256：7da62f6f2b031d78908d6f063d44b6eaeb491bb31d03536218f6ee61dd300efd
閱讀頁：1、2、3、4、5、6、7、8、24、40。生成與評分完整章、原生100K口徑、types、split、generation audit及agent資訊條件。

- 研究類型：輔助與協作；对话協作與任務完成
- 領域：居家整理與清潔、餐飲與烹飪、協助、交接與陪伴
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：60HSSD houses（37train/13val/10test），5,819OVMM objects；與其他HSSD來源重用。
- 任務：4非互斥特性：constraint-free/spatial/temporal/heterogeneous；原作task以unique scene-goal pair計，100K不是100K語義family。
- 題數／資料：本文100,000train＋1,000val＋1,000test；全val/test及2Ktrain人工審核。固定公開HF檔案本庫實數111,652train＋1,000val是另一版本，不能覆蓋本文或補造test。
- 評估方式：完整state sequence檢查propositions、dependencies、temporal/same-argument/terminal constraints；PC、success、failure explanation。；中央/分散、partial/full、oracle/learned skills、privileged/perceived graph分開評。
- Split／資訊條件：source houses互斥；支援human-only技能差異；生成時會排除不能做的摺衣。
- 來源關係：Habitat3/HSSD/OVMM底座；1K人工seed衍生100K。原文generation audit約90%instruction、92%evaluator、83%joint，與本庫舊92.5%小試作無關。
- 可復用：為十萬級rule-conditioned episodes及共同協作評測的關鍵前作；數量比較須用scene-goal案例粒度。
- 待核／限制：本文某處稱全tasks HITL，統計處實際描述val/test+2Ktrain審核，應按具體audit範圍理解。；HF公開版本無test素材；111,652只是該快照metadata實數。

### P199　OpenEgo（2025）

原作：https://arxiv.org/abs/2509.05513
本次PDF：https://arxiv.org/pdf/2509.05513v1
PDF SHA256：84068f8b5d7e8add70826aacda59a02d425f56125bcf3f1c450fe966db7f7e65
閱讀頁：1、2、3、4。六來源表、hand/primitive統一、實際0.1%子集實驗和held-out metric。

- 研究類型：人類影片與動作資料；整合型人類影片資料與預測benchmark
- 領域：居家整理與清潔、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：作者列10kitchens與610indoor rooms／600+environments；是多來源合併，未證明全庫去重。
- 任務：290 source task labels＝六來源原生task數相加；不等於290正規化機器人目標。
- 題數／資料：1,107h、344.5Krecordings、119.6Mframes；實驗只train在0.1%子集，10%demonstrations held-out，精確eval IDs/分母需核。
- 評估方式：AED/FED/DTW只算可見hand joints；8/16/32/64frames horizons。未測robot physical task success。
- Split／資訊條件：作者稱demonstration-level holdout10%，但0.1%子集與holdout母集合關係需ID核。
- 來源關係：CaptainCook4D、HOI4D、HoloAssist、EgoDex、HOT3D、HO-Cap；語言多自動生成且部分人工核，新增的是統一label/format。
- 可復用：最直接的整合資料前作之一；我們必須清楚提出超出統一格式的task聯集與評測規則。
- 待核／限制：跨來源環境/task去重未完成；data aggregation不可與父來源再次加總。

### P002　HowTo100M（2019）

原作：https://arxiv.org/abs/1906.03327
本次PDF：https://arxiv.org/pdf/1906.03327v2
PDF SHA256：f55dbcb6598acecdedd0178243457eed6daf14626744e9bc50b0622cdbf58894
閱讀頁：1、2、3、4、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：人類影片與動作資料；人類程序影片與步驟定位
- 領域：餐飲與烹飪、辦公與教育、工藝與修繕、個人照護、交通移動與車輛維修、農業與園藝、休閒與運動、寵物照護與動物活動
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：YouTube instructional/vlog等影片；12 WikiHow用途類別，不是12個物理場景。
- 任務：23,611 visual tasks是WikiHow搜尋活動標籤，未正規化成robot goals。
- 題數／資料：1.22M影片／136.6M弱配對clip-caption；本庫主要供pretraining，下游評CrossTask等既有benchmark。
- 評估方式：下游step recall、retrieval R@K/median rank；非136.6M人工驗證評測題。
- Split／資訊條件：移除CrossTask test與YouCook2 val重複video IDs；仍可能有重上傳內容。
- 來源關係：WikiHow活動×YouTube搜尋；片段共享長影片，後續world-model/ego conversion又會重用。
- 可復用：是擴大生活/工作用途的重要來源；活動標籤、可觀測步驟及robot可執行目標需逐層轉換。
- 待核／限制：原作抽400pairs僅51%至少一項提及與畫面吻合；不能直接將全部字幕當程序ground truth。

### P119　EgoDex（2025）

原作：https://arxiv.org/abs/2505.11709
本次PDF：https://arxiv.org/pdf/2505.11709v3
PDF SHA256：7ea269e5885392e65a7e206c2d6b5792022ec499367a070c2c269cbcf187e2b8
閱讀頁：1、2、3、4、5、6、7、8。194tasks資料、reset類別、48D action表示、兩benchmark、1%split與best-of-K。

- 研究類型：人類觀測到機器人轉移；人類示範與技能轉移
- 領域：居家整理與清潔、衣物與洗護、裝配與生產作業、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：tabletop錄製；原文明示場景多樣性不是重點，沒有獨立layout總數。
- 任務：194human manipulation tasks；3種reset類型；正式兩端點為未來手軌跡及給future goal圖的inverse dynamics。
- 題數／資料：338,000episodes、829小時、約90Mframes；每task抽1%為held-out，不把90Mframes等同90Mtest題。
- 評估方式：12個wrist/fingertip keypoints的平均／終點Euclidean error，best-of-K（1/5/10），分H=1/2/3秒。；人手預測誤差不是robot任務完成率；給future image的inverse dynamics資訊更強。
- Split／資訊條件：主test為每task1%同分布；未見task另附錄，不可把主結果稱OOD。
- 來源關係：新Apple headset錄製；部分task来自FurnitureBench等類型，但非同robot轨跡。
- 可復用：大量靈巧行為、工具與衣物候選；轉成robot benchmark需具體goal/初態與evaluator對應。
- 待核／限制：精確split episodes及同session相依關係需manifest；ARKit confidence為追蹤品質非真物理成功。

### P150　DreamDojo（2026）

原作：https://arxiv.org/abs/2602.06949
本次PDF：https://arxiv.org/pdf/2602.06949v1
PDF SHA256：c8f02e22c8fbe98e0b50215e10e1f6baf2f589b1987e5c6dc07175bfe6fe8587
閱讀頁：1、2、4、5、8、9、10。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：世界模型與預測表示；世界模型與影片生成評測
- 領域：居家整理與清潔、辦公與教育、工藝與修繕、裝配與生產作業、零售與購物、交通移動與車輛維修
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Table1的1.135M scenes與正文9,869unique scenes不一致；暫不取其中任一為去重環境總量。
- 任務：6,015skills/tasks由GPT對globalcaptions估計；6個generation evalsets非6生活domains。
- 題數／資料：DreamDojo-HV43,827h，加入in-lab55h/EgoDex829h後44,711h；多數eval100samples，兩個image-edited sets各25。
- 評估方式：PSNR/SSIM/LPIPS；editedsets無配對futureGT，12volunteers做physics/action-following偏好比較。
- Split／資訊條件：humanpretrain後robotposttrain，GR1是主要驗證平台；counterfactual與backgroundedit分項。
- 來源關係：EgoDex＋in-house；和EgoScale的scene/task/object統計一致是待核同源線索，非已證實完全相同。
- 可復用：規模非常大的world-model資料來源；不能把44K人類影片小時或生成視覺評分当作可執行task庫。
- 待核／限制：1.135M scene與9,869scene粒度矛盾；表中其他前作hours也不可代替原始論文校核。

### P120　EgoScale（2026）

原作：https://arxiv.org/abs/2602.16710
本次PDF：https://arxiv.org/pdf/2602.16710v1
PDF SHA256：39c691baf374a154e26ffc0098b97037875909495013d4017d97761716ff2735
閱讀頁：1、3、4、6、7。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：人類觀測到機器人轉移；人類示範與技能轉移
- 領域：居家整理與清潔、衣物與洗護、辦公與教育、裝配與生產作業、零售與購物、實驗室操作
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：作者報9,869scenes的人類影片；語義場所/影片scene定義及與其他corpora交集待核。
- 任務：人類6,015task labels、對齊midtraining344tabletop tasks；主實機只5dexterous goals。
- 題數／資料：報告20,854hpretraining，並使用EgoDex829h（不另外相加）；midtrain50hhuman/4hrobot；下游每task100robotdemos，shirt20。
- 評估方式：whole-task SR、fine-grained completion；兩trainingseeds、通常每checkpoint/task10trials。
- Split／資訊條件：分大規模人類pretrain、配對midtrain、下游posttrain；非zero-robot-data。
- 來源關係：EgoDex與in-house資料；場景/task/object統計與DreamDojo相同數字，不能假定是獨立新增corpus。
- 可復用：人類資料規模的必要對照；要分6,015訓練標籤、344對齊任務與5實測目標。
- 待核／限制：protocol稱TaskIII每bottle16trials，但tasklist瓶蓋是TaskIV，需manifest釐清。

### P181　RoboFolDeX（2026）

原作：https://arxiv.org/abs/2609.10243
本次PDF：https://arxiv.org/pdf/2609.10243v2
PDF SHA256：b7760baa843b43e164d224d5132fc13f534cb5e4bd834d7276340ee3f7d65553
閱讀頁：1、3、4、5、6、7。資料來源、四track、完整摺疊流程、30實機回合及FoldScore。

- 研究類型：布料／柔性物操作；柔性物操作benchmark
- 領域：居家整理與清潔、衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：多個真實robot平台/場景，10+embodiments；精確獨立工作站數未報。
- 任務：資料20+tasks；主摺疊評測4類衣物Shirt/Skirt/Pants/Towel，涵蓋取出、翻整、攤平、摺疊和堆疊。
- 題數／資料：2,000+hours實機資料；主評測每衣物類別30trials，完整workflow須無人工介入。
- 評估方式：SR、成功回合時間、0–5neatness由至少2評者一致評分。FoldScore組合品質35%、可靠性35%、速度30%。
- Split／資訊條件：recovery、cross-task、cross-scene、cross-embodiment四tracks；場景泛化不能只用主4類成績代表。
- 來源關係：多robot原始收集與統一格式；長workflow可切subtasks，切片不能再視為獨立長示範。
- 可復用：提供完整衣物處理流程、人工外觀品質與自動成功率並列的設計。
- 待核／限制：2,000+hours對應的unique episode IDs及工作站去重需要資料manifest；複合分數權重不是通用難度尺。

### P213　Vision to Harvest（2026）

原作：https://arxiv.org/abs/2609.13606
本次PDF：https://arxiv.org/pdf/2609.13606v1
PDF SHA256：b3ee03d5d25e728c85d714de947fb09d06f56e94067923961d75c365281c22eb
閱讀頁：1、2、3、4、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：一般操作 benchmark；專業場域規劃benchmark
- 領域：農業與園藝
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Fuji apple及citrus orchard RGB-D資料；citrus父庫432images，实际held-outscene數未報。
- 任務：multi-armCartesian fruit harvesting的offlineallocation/waypointplanning；apple/citrus兩作物設定。
- 題數／資料：每crop共用同一held-outimage集合；未報可核固定題數，不能將父庫432全填成eval cases。
- 評估方式：detection/harvested ratio、arm-order violation、pathdistance/token成本；harvested其實是waypoint距離門檻0.25/0.5/1m。
- Split／資訊條件：zeroshot同prompt；沒有在線replanning或真的摘果控制。
- 來源關係：既有果園資料＋新plan/verifier；collision指order違反，非完整動力學碰撞檢查。
- 可復用：補農業用途與多臂分配，但轉成執行benchmark仍需assets、接觸和摘取驗收。
- 待核／限制：exactevalsceneIDs未報；高harvestedratio不可當物理摘取成功。

### P001　VLOG（2017）

原作：https://arxiv.org/abs/1712.02310
本次PDF：https://arxiv.org/pdf/1712.02310v1
PDF SHA256：914ea812883827c588beaafa23c52688332eff8824bb54128a2a9ec92331d3ac
閱讀頁：1、3、4、5、6、7、8。正文資料蒐集、標註、benchmark 與探索實驗章節；未逐行審閱模型訓練附錄。

- 研究類型：人類影片與動作資料；影片資料與感知評測
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：網路生活影片中的自然場景；沒有可直接計數的模擬 layout 清單。365 是外部場景分類器類別，不能當環境數。
- 任務：30 個物件接觸二元分類；8 類手部／人物狀態分類及未來狀態預測。這些是感知標籤與評測問題，不是30個機器人操作任務。
- 題數／資料：114K 影片、219K 抽樣影格的手部狀態標註；原作分 uploader 做50/25/25切分。156K 影格另用於未來手位置探索實驗。
- 評估方式：物件接觸：逐類 AP／mAP。；手狀態：分類 accuracy，現在及未來6／12／30／60影格分開。；未來手位置的156K影格探索實驗不等於正式的獨立機器人 benchmark。
- Split／資訊條件：依 YouTube uploader 分50% train／25% validation／25% test，避免同一上傳者跨 split。
- 來源關係：影片自行蒐集自 YouTube；與 COCO、Charades 的類別交集不表示共用全部資料。
- 可復用：可提供生活操作與接觸／預測題型；轉成機器人控制題仍需資產、狀態及成功條件。
- 待核／限制：影片可下載現況、精確公開split檔案數尚未逐檔核對。

### P003　COIN（2019）

原作：https://arxiv.org/abs/1903.02874
本次PDF：https://arxiv.org/pdf/1903.02874v1
PDF SHA256：4625e83e6d9eaecd1acdfb5c39fa7132bbe4c4c6a58e541473c24c9f738f6762
閱讀頁：1、3、4、5、7。資料定義、階層分類、標註規模、切分與評測章節。

- 研究類型：人類影片與動作資料；人類程序影片與步驟定位
- 領域：居家整理與清潔、餐飲與烹飪、工藝與修繕、個人照護、交通移動與車輛維修、休閒與運動
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：YouTube 教學影片；原作12 domains是活動分類，未提供12個物理環境。
- 任務：原作階層為12 domains、180人類程序任務、778步驟定義。180個活動可作任務候選，不能直接當已實作的robot task。
- 題數／資料：11,827影片、46,354步驟片段、476小時；影片split為9,030 train及2,797 test。
- 評估方式：步驟時段定位，以 temporal IoU 0.1–0.5 的 mAP／mAR 衡量。
- Split／資訊條件：9,030 train／2,797 test；不可把46,354步驟片段全稱為test題。
- 來源關係：YouTube 影片與人類程序階層；與其他網路教學資料可能影片重疊，尚無逐video ID跨庫去重。
- 可復用：可引入來源有據的180項程序及778步驟；需另審機器人可行性與每一步的判分。
- 待核／限制：完整12個原作domain到共同領域的逐條映射需保留原生label清單。；跨資料集YouTube ID重疊未核。

### P004　CrossTask（2019）

原作：https://arxiv.org/abs/1903.08225
本次PDF：https://arxiv.org/pdf/1903.08225v2
PDF SHA256：1613d28f8d75e86ceedd8b6f2a9c2a4bbf29e5ee8485026bfc7be29826ae7632
閱讀頁：1、2、5、6、14。資料建立、主要／相關任務定義、原作主評測，追讀附錄評分。

- 研究類型：人類影片與動作資料；人類程序影片與步驟定位
- 領域：餐飲與烹飪、工藝與修繕、交通移動與車輛維修
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：wikiHow程序及YouTube影片；沒有原生物理場景ID總數。
- 任務：83個程序＝18個主要評測任務＋65個相關支援任務；主實驗不能寫成83個同地位測試任務。
- 題數／資料：約4.7K影片；正文列主要任務212小時、相關任務161小時。每輪主要任務test為1,850影片。
- 評估方式：主指標step recall：每步只預測一個位置，落在GT時間段才正確。；20次隨機切分的平均；附錄另報mAP，不能把附錄指標冒充唯一主指標。
- Split／資訊條件：每個主要任務每輪30訓練影片；固定每任務20驗證影片不進train/test；其餘1,850影片測試；重複20次。
- 來源關係：wikiHow中篩選程序，YouTube蒐集影片；相關任務篩除以影片重疊判定的近重複。
- 可復用：18個評測程序與65個支援程序分開引入；程序步驟可以映射機器人規格，但影片切分不能直接沿用作實體控制題。
- 待核／限制：前文376小時與正文212＋161小時口徑不完全一致，暫保留原文各自約數。；4.7K總量尚未以發布清單精確重算。

### P005　YouCook2（2017）

原作：https://arxiv.org/abs/1703.09788
本次PDF：https://arxiv.org/pdf/1703.09788v3
PDF SHA256：4ef636404bea37184e1fa056fa2a71a92705a1b3bc4ee58917a11806de17fbe3
閱讀頁：1、2、3、4、7、8。YouCook2資料、標註、split、程序分段與proposal評測。

- 研究類型：人類影片與動作資料；人類程序影片與步驟定位
- 領域：餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：自然料理影片；非4個物理場景。Africa／Americas／Asia／Europe是料理來源分類。
- 任務：89道食譜；benchmark要求定位程序步驟及描述。食譜、步驟、影片為不同層次。
- 題數／資料：2,000影片、176小時；每道食譜按67／23／10%分train／val／test。
- 評估方式：程序分段：Jaccard及mean IoU。；proposal：IoU 0.5下precision／recall／F1，與整體程序分段分開。
- Split／資訊條件：每食譜67／23／10%；本文百分比不自行換算成精確發布ID數。
- 來源關係：YouTube教學影片；与其他料理影片庫的原始video重疊需逐ID核對。
- 可復用：可提供料理程序與步驟語言；不能直接把2,000影片列為2,000robot任務。
- 待核／限制：發布版本精確split ID數及素材可得性尚未逐檔核。

### P006　Breakfast（2014）

原作：https://openaccess.thecvf.com/content_cvpr_2014/html/Kuehne_The_Language_of_2014_CVPR_paper.html
本次PDF：https://openaccess.thecvf.com/content_cvpr_2014/papers/Kuehne_The_Language_of_2014_CVPR_paper.pdf
PDF SHA256：79ea90c0870d5e1e29b880a953555fe8d9dbd2b825f0f46e13d28d51c33e138f
閱讀頁：1、3、5、6。Breakfast資料、動作階層、資料切分及語法式識別實驗。

- 研究類型：人類影片與動作資料；人類程序影片與步驟定位
- 領域：餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：18個真實廚房；每處3–5台相機，視角不增加廚房數。
- 任務：10個料理活動、48個coarse action units；活動與動作單元分開。
- 題數／資料：52參與者、約77小時、超過400萬影格；11,267個action-unit samples包含約3,600個silence samples。
- 評估方式：動作序列unit accuracy及逐frame recognition accuracy；grammar解析與flat grammar比較。
- Split／資訊條件：4組參與者輪替訓練與測試；不能把多視角同次活動當獨立受試者。
- 來源關係：自行錄製；文中ADL等外部對照數字不是Breakfast規模。
- 可復用：可引入早餐程序及分層步驟；18廚房是影片錄製環境，非可下載互動layout。
- 待核／限制：後續常用發布版本的影片／片段數與本文單位可能不同，不能直接混寫。

### P007　Charades-Ego（2018）

原作：https://arxiv.org/abs/1804.09626
本次PDF：https://arxiv.org/pdf/1804.09626v2
PDF SHA256：138cfb582bdf3ab17fb6aa3ad7f3dd09505f4410e6c31fd486f2aaf1c35beaf1
閱讀頁：1、2、3。短文3頁全文，聚焦配對蒐集、來源重疊及評測。

- 研究類型：人類影片與動作資料；影片資料與感知評測
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：112個家、112位演員；第一／第三人稱依相同腳本重演，非同步錄製的精確配準視角。
- 任務：157個activity classes；監督及zero-shot第一人稱動作識別。
- 題數／資料：6,167 train影片＋1,693 test影片＝7,860視角影片；兩種視角各34.4小時；68,536動作標註。
- 評估方式：video-level mAP；監督與zero-shot設定分別報告。
- Split／資訊條件：參與者不跨train/test；視角影片數不直接改稱獨立活動episode。
- 來源關係：78.7%腳本取自Charades train，另增1,000腳本；與Charades有明確腳本來源關係。
- 可復用：適合跨視角語義轉移；不能把配對當作同步3D重建或robot軌跡監督。
- 待核／限制：逐配對ID與上游Charades腳本ID尚未在本庫去重。

### P008　EGTEA Gaze+（2018）

原作：https://openaccess.thecvf.com/content_ECCV_2018/html/Yin_Li_In_the_Eye_ECCV_2018_paper.html
本次PDF：https://openaccess.thecvf.com/content_ECCV_2018/papers/Yin_Li_In_the_Eye_ECCV_2018_paper.pdf
PDF SHA256：aa3d3ec1981ea4b1b430c3712e3f56d851ac8173cfc5a9db797478cf4d4e3454
閱讀頁：1、9、10、11。資料與benchmark章、凝視與動作識別評測。

- 研究類型：人類影片與動作資料；影片資料與感知評測
- 領域：餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：自然廚房料理錄製；本文未在已讀段落提供獨立廚房總ID數。
- 任務：7個meal preparation tasks、106個action classes；凝視估計和動作識別為兩個端點。
- 題數／資料：本文報29小時、86 sessions、32人、10,321動作樣本；首split為8,299 train／2,022 test。
- 評估方式：凝視估計：precision／recall／F1，忽略無追蹤與saccade影格。；動作识別：mean class accuracy，clip與video層次分開。
- Split／資訊條件：首split 8,299／2,022；評分時fixation採8影格聚合，保留原協定。
- 來源關係：EGTEA相關後續版本常報28小時或10,325片段；本筆不以別篇的數字覆蓋所讀PDF。
- 可復用：適合視線、動作與料理先後關係題；sessions不是互動環境數。
- 待核／限制：公開資產版本與後續10,325片段口徑需另核對。

### P009　EPIC-KITCHENS（2018）

原作：https://arxiv.org/abs/1804.02748
本次PDF：https://arxiv.org/pdf/1804.02748v2
PDF SHA256：2b7fe522827a041638ef2d3b27c9508ace434bd504e22c3e3d43894ea144b7a7
閱讀頁：1、3、10、11、12、13、14、15。資料蒐集與詞彙、split、物件偵測、動作識別及anticipation完整評測章節。

- 研究類型：人類影片與動作資料；影片資料與感知評測
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：32位參與者／32個廚房；S2保留4位參與者的未見廚房。
- 任務：3個端點：active-object detection、action recognition、action anticipation；§3.4詞彙125 verbs／331 nouns，詞彙數不是機器人任務數。
- 題數／資料：55小時、39,596動作片段、454,255物件框；同一片段可支援不同端點，不能把三種端點直接乘成獨立題。
- 評估方式：偵測：mAP，IoU 0.05／0.5／0.75。；識別與anticipation：verb／noun／action各報top-1、top-5及per-class precision／recall。；anticipation觀測1秒，截止於動作開始前1秒；與看到整段動作的recognition分開。
- Split／資訊條件：S1已見廚房按完整sequence約80/20切分；S2保留4位參與者／廚房。各端點可評類別又有最少訓練樣本門檻。
- 來源關係：為EPIC-KITCHENS-100、VISOR、EPIC Fields等後續來源的上游家族；不得把共用影片／廚房重複相加。
- 可復用：可引入物件、操作與短期預測題型；原生語言動作類別需另對齊正式robot goal與判分。
- 待核／限制：各原生split精確可下載ID數未以本版manifest重算。；表中與正文不同聚合詞彙口徑應保留版本，不能混加。

### P010　EPIC-KITCHENS-100（2020）

原作：https://arxiv.org/abs/2006.13256
本次PDF：https://arxiv.org/pdf/2006.13256v4
PDF SHA256：2ad975f70d5b074a2b2616960bb53410a6d66ce973346284574e7b49684ab629
閱讀頁：1、2、4、5、6、7、9、10、11、12、13。資料延伸與表1、六個challenge的定義及評測段落。

- 研究類型：人類影片與動作資料；影片資料與感知評測
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：45個錄製環境；包含2018影片與新錄影片，不能和EPIC 2018廚房量直接相加。
- 任務：6個challenge：全監督／弱監督動作識別、偵測、anticipation、跨年無監督適應、跨模態檢索。97 verbs、300 nouns、4,053 action classes不是4,053個實體操作goal。
- 題數／資料：700影片、89,977動作段；train／val／test動作段67,217／9,668／13,092；檢索採公開val，另有專用UDA切分。
- 評估方式：識別top-1／top-5 accuracy；偵測mAP於temporal IoU 0.1–0.5。；anticipation以動作開始前1秒為截止，class-mean top-5 recall。；檢索用mAP及nDCG；UDA保留2018→2020的來源／目標域設定。
- Split／資訊條件：主影片495／138／67；test皆新錄影片。主split、UDA、retrieval評測集合不可混為一個test量。
- 來源關係：2018上游影片重新標註，89,977為新版本總量；其約66M masks及手／物框多為自動產生，非同量人工評測題。
- 可復用：可復用同一生活影片家族的多端点评測；必須以共用影片與split lineage控制洩漏。
- 待核／限制：公開manifest与此PDF版本的精確ID差異尚未逐檔重算。

### P011　EPIC-KITCHENS VISOR（2022）

原作：https://arxiv.org/abs/2209.13064
本次PDF：https://arxiv.org/pdf/2209.13064v1
PDF SHA256：912638891fd5608d681de38f6e902f5caa0b4a1925c4b22ffb564b92d69701c9
閱讀頁：1、3、4、6、7、8、9、10、25。資料／split表與3個benchmark定義、主要metric；附錄標註品質段落。

- 研究類型：人類影片與動作資料；影片資料與感知評測
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：42個EPIC廚房；為上游環境子集，不是新增42個互動場景。
- 任務：3個challenge：VOS、手物關係分割、Where Did This Come From。最後一項有15種來源容器，非15個生活domain。
- 題數／資料：179 untrimmed影片、50,729人工標註影格、271,584人工mask；9.9M為篩過的插值mask。WDTCF另有222測試query，取自92影片。
- 評估方式：VOS用Jaccard J及boundary F；只追第一影格已指定物件。；HOS用COCO mask AP，手側別、接觸與active object分開。；WDTCF用來源分類accuracy、證據影格及mask IoU；錯誤證據影格使IoU為0。
- Split／資訊條件：train／val／test影片115／43／21，影格32,857／7,747／10,125；保留未見廚房子集。WDTCF為222題test-only taster。
- 來源關係：直接標註EPIC-KITCHENS-100影片；自動插值從14.5M過濾為9.9M，不能當9.9M獨立人工標籤。
- 可復用：補充物件變形、接觸及來源追溯題；同一影片不能重算為新增環境。
- 待核／限制：各VOS subsequence發布ID與影片父ID的完整映射尚未匯入。

### P012　HD-EPIC（2025）

原作：https://arxiv.org/abs/2502.04144
本次PDF：https://arxiv.org/pdf/2502.04144v2
PDF SHA256：d3648a8692d038cad2027290facf25c9f5d8ff12b65f912f4dc6d99b99118092
閱讀頁：1、5、6、7、28。資料與數位廚房、VQA建立／評測、recognition、長期VOS附錄。

- 研究類型：人類影片與動作資料；影片問答與推理
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：9個新錄廚房，413個fixture數位模型；fixture不是413個環境。
- 任務：69食譜；VQA以7類註記建立30種問題prototype，另有動作／声音識別和長期VOS。
- 題數／資料：正式VQA為26,650道五選一題；100,000是作者估計可生成上限，不是發布題數。VOS另為1,000序列／20,548標註影格；41.3小時為原始影片長度。
- 評估方式：VQA報各prototype accuracy後分群平均，5選1；包含blind language基線。；VOS用J／F／J&F；recognition沿用EPIC100訓練權重，在新影片評估。
- Split／資訊條件：定位為新資料上的validation／zero-shot benchmark；沒有依一般80/10/10重新分配。人類基線只抽600題。
- 來源關係：與EPIC系列研究相承但此批影片新錄；使用EPIC100模型訓練來源。數位副本不自動具備機器人物理／判分介面。
- 可復用：提供比粗動作標籤更細的食譜、營養、3D、物件動態、視線問答；是可借鑑的多端點設計。
- 待核／限制：原生數位副本的互動物理完整性、本庫素材取得與逐題manifest尚未核對。

### P013　Ego4D（2021）

原作：https://arxiv.org/abs/2110.07058
本次PDF：https://arxiv.org/pdf/2110.07058v3
PDF SHA256：d33d9e7a1d4a93ab8e9137e62966b3e2b7d631f4c5b98e481f6fc2220739c2fc
閱讀頁：1、6、7、8、9、24、29、30、48、49、70、71、72、73、75、77、79。正文五大benchmark全段；附錄資料split、episodic memory規模、short／long anticipation協定與統計。

- 研究類型：人類影片與動作資料；綜合第一人稱資料與評測
- 領域：居家整理與清潔、餐飲與烹飪、工藝與修繕、零售與購物、交通移動與車輛維修、農業與園藝、休閒與運動、社交與溝通、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：74個全球location／9國；location不是去重後可載入場景ID。VQ3D專用子集另只使用4個掃描。
- 任務：5大benchmark：episodic memory、手物狀態變化、影音說話者、社交互動、forecasting。MQ有110活動類別，NLQ有13模板；都不是整個Ego4D的domain／任務總量。
- 題數／資料：3,670小時、931佩戴者為資料規模。NLQ約19.2K query（test約4K）；VQ 22,602 query；MQ 22.2K活動實例；short anticipation 64,798樣本（test 19,780）。各端點母影片重疊，不能相加為獨立episode。
- 評估方式：NLQ用recall@k／tIoU；MQ用mAP與recall；VQ用時空AP及搜索效率。；PNR用秒級絕對時間誤差、狀態分類accuracy、物件偵測AP。；說話者追蹤／diarization／轉錄用MOT、speaker error、DER、WER；社交LAM／TTM用mAP、accuracy。；forecasting：軌跡／手部位置誤差；short anticipation top-5 mAP；long anticipation以20步序列edit distance等設定報告。
- Split／資訊條件：同family內一致（forecasting與hands共用；memory內共用），不同family不保證同一切分。NLQ約60/20/20；forecasting原協定40/30/30，另有locomotion切分。test標註及相交narrations不公開。
- 來源關係：上游多機構錄製資料；EgoSchema／EgoPlan等後續題庫常重用它。主表與附錄部分過濾前後數字不同，保留端點與版本。
- 可復用：是跨日常場域及過去／現在／未來題型的重要上游；覆蓋廣度和正式robot控制任務量需分開。
- 待核／限制：不同端點的跨family影片洩漏需逐ID審核。；本文內MQ表3與過濾後表8、forecasting110.5／120小時等口徑不能靜默合併。

### P014　Ego-Exo4D（2023）

原作：https://arxiv.org/abs/2311.18259
本次PDF：https://arxiv.org/pdf/2311.18259v4
PDF SHA256：15e31586e111eb32fe54131840b7733b095fb3b20bebb14be9610d11967e26a8
閱讀頁：2、4、6、10、19、24、25、28、30、36、38、39、41、42、44、69、73、74。資料、8場域、benchmark總表、關係／keystep／procedure／熟練度／pose評分及切分附錄。

- 研究類型：人類影片與動作資料；綜合第一人稱資料與評測
- 領域：餐飲與烹飪、個人照護、交通移動與車輛維修、休閒與運動、音樂與表演、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：123個自然scene、13城市；多台ego／exo相機同步錄同take，視角不增加場景或活動次數。
- 任務：8原生domains、43活動、689 keysteps為整體概述；keystep標註子集17活動／664標籤，正式識別過濾後278葉節點。4大benchmark family內含跨視角關係、程序、熟練度、3D姿態等端點。
- 題數／資料：整體1,286小時、5,035 takes（概述）；附錄切分列5,045 takes，須查版本差異。keystep識別130,979視角片段，test 33,001，其中ego 6,373。不能用全部14M自動／人工姿態影格替代題數。
- 評估方式：跨視角mask用visibility accuracy／IoU／位置誤差；生成視角另有生成metric。；keystep recognition top-1 accuracy；程序前置／可選／錯誤／缺步／後續步用calibrated AP。；熟練程度用top-1；指導／正確執行時刻用L1時間門檻mAP。；人體用MPJPE、MPJVE；手部用MPJPE及PA-MPJPE；人工GT與自動GT分開。
- Split／資訊條件：以take及participant保持互斥，衍生片段繼承父take；附錄列3,082 train／842 val／1,121 test。procedure測試graph及標籤不公開。
- 來源關係：獨立同步多視角蒐集；同take的多視角和多端點共用來源。本文提醒v1過時，不能混用v1／v2數字。
- 可復用：可擴展維修、照護、運動、音樂與熟練度；多數為人類技能觀測，轉成robot執行規格須另定機體與成功條件。
- 待核／限制：概述5,035与附錄5,045 takes相差10，待manifest核對。；整体689与keystep子集664不能視為同口徑。

### P015　Assembly101（2022）

原作：https://arxiv.org/abs/2203.14712
本次PDF：https://arxiv.org/pdf/2203.14712
PDF SHA256：f115520e2f1cb8ec65ecf3e197be18dd91e8f34b1ee58fcb36d18e1346d24c1e
閱讀頁：1、3、4、5、6、7、8、15。蒐集、粗細動作統計、split及四端點實驗。

- 研究類型：人類影片與動作資料；人類程序影片與步驟定位
- 領域：裝配與生產作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：固定多視角錄製配置；8外部＋4ego相機不是12個環境。
- 任務：101種take-apart玩具，15玩具類別；202粗動作、1,380細動作標籤；4端點為識別、預測、分段、錯誤偵測。
- 題數／資料：362次拆裝sequence，產生4,321視角影片、513視角小時；1,013,523細片段及104,759粗片段含多視角重複。
- 評估方式：識別top-1；提前1秒預測用class-mean top-5 recall。；分段MoF／edit／F1@10,25,50；錯誤／corrective分類precision與recall，early模式只看半段。
- Split／資訊條件：60/15/25%；有seen／unseen玩具，25玩具跨split；視角與片段應繼承原sequence。
- 來源關係：自行蒐集；多視角是同次拆裝，不能用4,321宣稱同量獨立任務。其細標籤與3D手pose專用表又有不同子集。
- 可復用：可引入裝配依赖、順序變化、犯錯與糾正；應保留玩具、步驟、觀測端點三層單位。
- 待核／限制：資料表中姿態專用1,456標籤與一般1,380標籤的完整映射待manifest核對。

### P016　IKEA ASM（2020）

原作：https://arxiv.org/abs/2007.00394
本次PDF：https://arxiv.org/pdf/2007.00394v2
PDF SHA256：5869f1542aa7372df85b6b4006127599aba58b0364d546d963dff8a3876080af
閱讀頁：1、3、4、5、6、8。資料與split、動作／分割／追蹤／姿態評分段落。

- 研究類型：人類影片與動作資料；人類程序影片與步驟定位
- 領域：居家整理與清潔、裝配與生產作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：5個真實環境，桌上／地上共10相機配置；3台同步RGB相機。
- 任務：4種家具（side table、coffee table、TV bench、drawer）與原子装配動作；不是1,113個任務。
- 題數／資料：371次assembly，1,113 RGB視角影片及371 depth影片；本文16,764動作標註；254 train／117 test assembly scans。
- 評估方式：動作frame accuracy、macro-recall、mAP。；零件分割與MOT分開；追蹤MOTA、IDF1、IDs等。；3D姿態用MPJPE／PA-MPJPE、PCK@150mm。
- Split／資訊條件：按環境保留family room與office測試；作者明示此主split不保證subject同時互斥，另提供其他切分腳本。
- 來源關係：自行錄製；空間標註僅1%影格人工，餘下有pseudo-GT；不可把全部影格稱人工標註。
- 可復用：家具裝配與部件追蹤來源；環境泛化與受試者泛化要分開報。
- 待核／限制：原子動作label完整清單与不同年份發布版本尚未逐ID對齊。

### P017　HOI4D（2022）

原作：https://arxiv.org/abs/2203.01577
本次PDF：https://arxiv.org/pdf/2203.01577v4
PDF SHA256：82c5f0bf505f59eed426c1efa03f12a4155a5e18416ff03477d9e25c301be74f
閱讀頁：1、2、7、8。資料概述與三個benchmark完整定義／主要評分。

- 研究類型：人類影片與動作資料；影片資料與感知評測
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：610個室內rooms（錄製環境）；4個參與者，不是610個已接入互動模擬器。
- 任務：16物件類別、800實例；3端點：category-level pose tracking、4D segmentation、action segmentation。pose實驗只取4剛體＋1關節類別。
- 題數／資料：4,000 sequences、2.4M RGB-D影格；4D分割專用376影片／14語義類別，不能把全資料量當每個端點實測量。
- 評估方式：pose：5°5cm accuracy、旋轉／平移誤差；以擾動GT pose初始化。；4D分割mIoU；動作分段Acc、edit、F1@10/25/50。
- Split／資訊條件：4D sequence隨機7:3 train/test；不等同未見房間或受試者切分。
- 來源關係：自行蒐集RGB-D及模型；NOCS／H2O／GTEA是外部對照，不屬本庫量。
- 可復用：補充物件／材質／房間變化和3D感知；原文明示未覆蓋雙手操作。
- 待核／限制：610 rooms的逐ID清單與可用重建品質未匯入。

### P018　HOT3D（2024）

原作：https://arxiv.org/abs/2411.19167
本次PDF：https://arxiv.org/pdf/2411.19167v2
PDF SHA256：cbe0c55d8c952c673dbff8633b5f23eb87963f7cf09429416eb2f1ac58236232
閱讀頁：1、3、4、5、6、7。資料、有效標註與subject切分、手／物追蹤、分割與3D lifting。

- 研究類型：人類影片與動作資料；影片資料與感知評測
- 領域：居家整理與清潔、餐飲與烹飪、辦公與教育、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：同一mocap lab中的4種情境佈置：inspection、kitchen、office、living room；不是4處獨立真實住宅。
- 任務：33剛體物件；手pose、物件6DoF pose、in-hand分割、3D位置lifting。
- 題數／資料：833分鐘、1.5M多視角timestamps／3.7M images；其中1.16M timestamps有效完整。HOT3D-Clips為3,832 clips＝2,804 train＋1,028 test。
- 評估方式：手部MKPE毫米誤差；物件pose以對稱性處理後平移／旋轉門檻recall。；in-hand mask mIoU；lifting用位置門檻recall。物件pose實驗提供GT mask，並非端到端自由偵測。
- Split／資訊條件：13名受試者train、6名test，test GT走伺服器；部分評測每30影格取一。
- 來源關係：新錄Aria／Quest3資料。EgoHOS與UmeTrack為跨資料對照；部分baseline的400K Aria訓練圖是私有資料，不可算HOT3D公開題。
- 可復用：提供可靠3D接觸／姿態參考；可控場景多樣性與感測視角多樣性應分開。
- 待核／限制：正文425 recordings與198 Aria＋226 Quest3相差1，需manifest釐清。

### P019　EgoBody（2021）

原作：https://arxiv.org/abs/2112.07642
本次PDF：https://arxiv.org/pdf/2112.07642v3
PDF SHA256：2e3713a6294f2f6db2fb815fc25f0ce080ce1fec87b663ccac54ff669c7de501
閱讀頁：1、2、4、6、7、8、9、10、11、12。互動分類、capture、資料與split、3DHPS metric。

- 研究類型：人類影片與動作資料；人體與互動感知評測
- 領域：休閒與運動、社交與溝通、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：15個室內scene，有掃描mesh；每次兩人互動，一人佩戴HoloLens2。
- 任務：5種社會互動分類用於蒐集；主benchmark為interactee的3D人體形狀／姿態估計，不是5個機器人任務。
- 題數／資料：125 sequences／36人；219,731多視角timestamps、199,111 ego影格；可見interactee子集175,611影格，其中62,155 test。
- 評估方式：MPJPE、vertex-to-vertex error；pelvis translation alignment與Procrustes alignment分开。
- Split／資訊條件：subject不重疊；interactee train／val／test＝90,124／23,332／62,155。
- 來源關係：自行蒐集；同時有MVSet、EgoSet、可見interactee三個相依子集，不能相加。
- 可復用：補社交互動、遮擋與人體觀測；不提供完成生活工作的robot action evaluator。
- 待核／限制：掃描資產是否可直接用於互動模擬未驗證。

### P020　EgoHumans（2023）

原作：https://arxiv.org/abs/2305.16487
本次PDF：https://arxiv.org/pdf/2305.16487v2
PDF SHA256：7d7f42b85231561ddb1a646fefbdec9fe97bc1e02455d7603006aa7ceac3de30
閱讀頁：1、2、6。資料統計、test切分、tracking評測與主端點定義。

- 研究類型：人類影片與動作資料；人體與互動感知評測
- 領域：休閒與運動、社交與溝通、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：6個地點＝3室內＋3室外；7個活動sequence，20人，多人同時戴Aria。
- 任務：籃球、擊劍、羽球、網球、排球、追逐、搭城堡；主要3D多人追蹤，並提供2D/3D姿態與mesh。
- 題數／資料：125K ego RGB、250K灰階、446K外部圖像；正式ego train77,260／test47,740 images。
- 評估方式：CLEAR追蹤指標（MOTA、FP、FN、IDs）、IDF1、HOTA；因主要使用off-the-shelf detector，以IDF1作主要tracking指標。
- Split／資訊條件：train/test地點不重疊；同步多人的多視角不能視為獨立活動。
- 來源關係：新蒐集多視角；COCO用於模型訓練對照，不算本benchmark題數。
- 可復用：拓展戶外多人互動感知；不能直接宣稱涵蓋同量可執行robot工作任務。
- 待核／限制：各附加pose／mesh端點是否有獨立正式leaderboard與有效ID需另查。

### P021　Ego-ExoLearn（2024）

原作：https://arxiv.org/abs/2403.16182
本次PDF：https://arxiv.org/pdf/2403.16182v3
PDF SHA256：bca30af05c678a221e17c8ff0fa92006870fc0b46f569e824b52c98aefc8a15b
閱讀頁：1、2、3、4、5、6、7、8、11、12、14、16。資料／來源、四大benchmark、association、anticipation／planning、skill，及專用split附錄。

- 研究類型：人類影片與動作資料；跨視角程序學習
- 領域：餐飲與烹飪、實驗室操作
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：4個廚房＋3個lab；ego示範跟做與exo教程非同步、非同一環境。
- 任務：8程序＝5日常＋3實驗室；4大benchmark含association、action understanding、skill ranking、captioning；39粗步驟，planning取27類；anticipation取19 verbs／31 nouns。
- 題數／資料：432 ego影片96.5小時＋315 exo影片23.5小時；34,239有效skill比較對，從40,191候選對篩選。ego anticipation test約17.3K片段。
- 評估方式：association：20候選top-1；anticipation：1秒前class-mean top-5 recall。；planning：8步ED@K、5條預測序列；skill：pairwise ranking accuracy；supervised recognition：macro mAP。
- Split／資訊條件：端點採專用過濾集；保留ego→exo、exo→ego、UDA、distillation、co-training不同資訊條件。
- 來源關係：日常exo取網路影片，lab exo由資深人員錄製；動詞／名詞taxonomy借Ego4D再擴充，不表示影片皆來自Ego4D。
- 可復用：對示範到robot的跨視角程序轉移很相關；實驗室程序補生活操作庫缺域。
- 待核／限制：captioning及segmentation專用metric／完整case ID仍需資料端核對。；附錄planning兩組split重複寫egocentric，保留原文歧義，未擅改。

### P022　CaptainCook4D（2023）

原作：https://arxiv.org/abs/2312.14556
本次PDF：https://arxiv.org/pdf/2312.14556v4
PDF SHA256：03be2a06a5c5cc778808214ae9232f3156dfd3ba60c07140d93d1a20222cc0ae
閱讀頁：1、2、3、4、5、6、7、8、9、38。採集、錯誤taxonomy、三大benchmark定義及評測。

- 研究類型：人類影片與動作資料；錯誤辨識與程序恢復
- 領域：餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：10個真實廚房，8名參與者；Hololens2與GoPro同步。
- 任務：24個WikiHow食譜、7種錯誤：準備、測量、技術、時間、溫度、缺步、順序；錯誤類別不另算7生活domain。
- 題數／資料：384 recordings、94.5小時、5.3K步驟標註及10K細動作標註；細動作只在約20%資料標註。錯誤有刻意誘發及自然發生。
- 評估方式：錯誤辨識accuracy／precision／recall／F1／AUC；step與recording split分開。；multi-step localization及RobustMSL用mAP、R@K、temporal IoU；只正常資料訓練、正常／錯誤資料測試分列。；procedure learning沿EgoProceL採步驟precision／recall／IoU。
- Split／資訊條件：error recognition有step／recording split；MSL有不同泛化split，不能把step split成績當跨錄影泛化。
- 來源關係：新錄影片，程序取WikiHow；procedure基線與評分沿EgoProceL，不是重用其全部素材。
- 可復用：可具體借用規則違反與near-failure定義；觀測到错误不等於機器人已能執行恢復。
- 待核／限制：各原生split精確ID數尚未匯入；錯誤組合空間只被部分採樣。

### P023　EgoProceL（2022）

原作：https://arxiv.org/abs/2207.10883
本次PDF：https://arxiv.org/pdf/2207.10883v1
PDF SHA256：533531617781659b6d42cbb81529f76f79277cb3cf1d05dad3504547b4ecdf9a
閱讀頁：1、3、4、5、6、8、9、10。資料選取與聯集、procedure問題、key-step排序、评測協定。

- 研究類型：人類影片與動作資料；人類程序影片與步驟定位
- 領域：餐飲與烹飪、工藝與修繕、裝配與生產作業、農業與園藝
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：來源資料場景混合；沒有共同去重的獨立環境總數。
- 任務：16個程序，平均8.7 key-steps；含料理、玩具機車、搭帳篷、PC組裝／拆解。
- 題數／資料：62小時、130人；原作本文未在已讀統計表給單一可評test題總數。
- 評估方式：Hungarian matching後按每個key-step計frame precision／recall／F1／IoU再平均，避免背景與長步驟壟斷分數。
- Split／資訊條件：採task-specific self-supervised procedure learning設定；K是模型key-step數超參數，不是資料集總任務量。
- 來源關係：明確重用CMU-MMAC、EGTEA Gaze+、MECCANO、EPIC-Tents，再增自錄PC裝拆；不是全新獨立62小時。
- 可復用：是從既有程序資料聯集再補缺域的直接先例；我們須說明新增任務／規則，不能把聯集本身當全部新貢獻。
- 待核／限制：所有影片ID、跨上游重複量和各task可評片段數需manifest核對。

### P024　EPIC Fields（2023）

原作：https://arxiv.org/abs/2306.08731
本次PDF：https://arxiv.org/pdf/2306.08731v2
PDF SHA256：c7c08e1c9614782d2dcddaeeec95b253c5d9f756ff2c4d30b712bcac6a90eebd
閱讀頁：1、2、3、5、6、7、8、22。重建覆蓋、三個benchmark、難度與frame切分。

- 研究類型：人類影片與動作資料；3D場景與世界建模
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：EPIC100的45個廚房；671影片成功重建，沒有新增671個獨立layout。
- 任務：D-NVS新視角合成、UDOS動態／半靜態物件分割、VOS；不是671個操作任務。
- 題數／資料：18,790,333已註冊camera-pose影格；D-NVS只取50影片（14.7小時、2.86M註冊影格）。
- 評估方式：D-NVS：PSNR，前景／背景分列；UDOS：segmentation mAP；VOS沿VISOR。；難度依in-action/out-of-action及與train frame的時間距離；hard、medium排除附近1秒train frame。
- Split／資訊條件：每影片val/test交替抽樣；UDOS無監督可看全影片，不是D-NVS同一可見輸入。
- 來源關係：EPIC100＋VISOR的相機與幾何擴充，來源影片／mask共用。
- 可復用：提供3D／視角／動態物件評測；重建相機軌跡不是robot action軌跡。
- 待核／限制：50個benchmark video-scenes與原廚房一對多關係待逐ID匯入。

### P025　EgoPet（2024）

原作：https://arxiv.org/abs/2404.09991
本次PDF：https://arxiv.org/pdf/2404.09991v1
PDF SHA256：8be645841806230228c292995eb6538540f9be6d228b916b37e53fefeeca59ca
閱讀頁：1、2、4、5、6、7、8、9、10。資料、3種預測端點、各自標註與指標。

- 研究類型：人類影片與動作資料；動作與軌跡預測
- 領域：寵物照護與動物活動
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：動物網路影片無去重場景總量；VPP額外robot測試有office、park、beach三處。
- 任務：VIP互動辨識／17種互動對象；LP預測未來4秒40個位置；VPP預測terrain latent的過去／未來。
- 題數／資料：6,646片段、84小時；VIP 1,449標註片段＝754train+695test；LP 6,126train／249val；VPP另20分鐘robot測試。
- 評估方式：VIP：accuracy／AUROC及object top-1/top-3；LP：ATE／RPE的RMSE；VPP：latent MSE。
- Split／資訊條件：三端點分開train/test或val；LP為SLAM pseudo-GT且有人工篩選，非mocap真值。
- 來源關係：TikTok／YouTube新整理；VPP訓練另用既有robot資料，不能把動物影片數算為robot控制題。
- 可復用：補充低視角移動與人以外的具身感知；與操作benchmark應分層比較。
- 待核／限制：正文819原影片與482＋338的平台分量不一致，待manifest釐清。

### P026　EgoHOS（2022）

原作：https://arxiv.org/abs/2208.03826
本次PDF：https://arxiv.org/pdf/2208.03826v1
PDF SHA256：94b61333b3477ef582a94281cc28852c750d6fbe096ddfe90c9434ca39101f07
閱讀頁：1、2、4、5、6、9、10、12。來源、手物標籤定義、OOD測試與主要分割評估。

- 研究類型：人類影片與動作資料；影片資料與感知評測
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Ego4D、EPIC、THU-READ及自錄GoPro多來源；無共同scene ID總數。
- 任務：左／右手、左／右／雙手接觸物分割；直接／間接接觸有標註，但本文主要評估直接接觸。
- 題數／資料：原作總量11,243影像；OOD另500影格來自30個YouTube影片，主分割實驗預設在此測試。
- 評估方式：mIoU；binary hand、left/right hand、hand+arm、held-object等標籤定義分開比較。
- Split／資訊條件：以原作validation選checkpoint，500-image OOD為另列測試；不能把源影片數當測試題數。
- 來源關係：直接重用Ego4D、EPIC影格；跨庫去重需frame時間戳。
- 可復用：可作接觸判定與視覺狀態監督；11,243不是11,243項可執行操作。
- 待核／限制：正文来源分量7,458+2,121+806+350未加總為11,243；subjects/activity的表格與敘述亦互換，暫不採這兩項總数。

### P027　EgoPCA（2023）

原作：https://arxiv.org/abs/2309.02423
本次PDF：https://arxiv.org/pdf/2309.02423v1
PDF SHA256：b1562d6e36e0c788642711c6bcd038ed83e381ad8f9ae62cc5e341ee516c0a39
閱讀頁：1、2、4、5、6、8、14。One4All來源統一、採樣、表2與原生識別評測；附錄類別合併。

- 研究類型：人類影片與動作資料；跨資料集整合與評测方法
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：來源影片混合，不提供新的可計數互動環境。
- 任務：EPIC100、EGTEA、Ego4D-AR、Something-Else合併語義；pretrain394類、test204類，聯集401類含zero-shot。
- 題數／資料：表2列pretrain20K／30K／50K；test3K／5K／10K為巢狀子集，不能相加成18K獨立題。
- 評估方式：top-1 verb/action accuracy；另用語義、手／物位置、手姿、camera motion、模糊程度分析分布。
- Split／資訊條件：上游train與val/test分開抽；不同規模套件彼此包含。
- 來源關係：本身就是多來源語義合併與平衡採樣先例；沒有將所有源任務轉成robot控制。
- 可復用：對任務聯集、分布分析、平衡採樣直接相關；須辨識此類前作，不能只與單域benchmark比規模。
- 待核／限制：§3.4提5K／10K／20K但表2及附錄為3K／5K／10K；採表2口徑並保留衝突。

### P028　EgoSchema（2023）

原作：https://arxiv.org/abs/2308.09126
本次PDF：https://arxiv.org/pdf/2308.09126v1
PDF SHA256：4ae865287c1d40b806c5f51e4b5101fe90f7d246a201668f14bbb9cab00b442f
閱讀頁：1、2、3、5、6、7、9、14。資料生成與人工過濾、temporal certificate定義、評测與datasheet精確量。

- 研究類型：理解、推理與規劃；影片問答與推理
- 領域：居家整理與清潔、餐飲與烹飪、工藝與修繕、農業與園藝
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Ego4D影片子集，未另外提供去重後環境數。
- 任務：長影片五選一QA；temporal certificate量必要證據時長，不能把3分鐘輸入長度直接當難度。
- 題數／資料：5,063題，每題一段3分鐘影片；約250小時為衍生片段量。
- 評估方式：選項accuracy；人類時間／影格受限條件另列。；QA人工過濾要求至少30秒certificate，與完整3分鐘影片長度區分。
- Split／資訊條件：本文定位zero-shot診斷評測；公開標籤子集與完整隱藏評測需依發布版本另外核對。
- 來源關係：Ego4D非重疊3分鐘片段產題，與其他Ego4D衍生QA仍可能共用上游影片。
- 可復用：可借certificate、人類驗證和blind基線衡量時間推理難度；不評機器人實際完成。
- 待核／限制：本庫未逐ID對齊所有Ego4D衍生benchmark。

### P029　EgoThink（2023）

原作：https://arxiv.org/abs/2311.15596
本次PDF：https://arxiv.org/pdf/2311.15596v2
PDF SHA256：f52b14647c715c4187f0f53bb90bde9e7d6f2f5d10eefc5da2a39b714076e040
閱讀頁：1、2、3、4、5、6、13、14。人工QA蒐集、700題統計、六能力十二維度、judge協定。

- 研究類型：理解、推理與規劃；影片問答與推理
- 領域：居家整理與清潔、餐飲與烹飪、工藝與修繕
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：595個Ego4D母影片；scene統計是語義場景如kitchen，不能當相同數量的獨立物理房間。
- 任務：6能力／12細分維度：物件、活動、定位、推理、forecasting、planning；輸入為單張影像。
- 題數／資料：700影像QA，無重複選圖；每維度至少50題，activity與forecasting各100。
- 評估方式：GPT-4依問題、答案、reference打0／0.5／1分；是模型評審分數，不是精確答案匹配accuracy。
- Split／資訊條件：zero-shot評測；無一般train/val/test訓練配額。人工審核QA與後續模型judge分開。
- 來源關係：抽Ego4D影格，最多同video兩張；能力分類不等同生活domain分類。
- 可復用：可借主觀／開放答案rubric；planning問答不能當作控制成功證據。
- 待核／限制：跨庫母影片重疊及judge版本穩定性需實作端固定。

### P030　EgoPlan-Bench（2023）

原作：https://arxiv.org/abs/2312.06722
本次PDF：https://arxiv.org/pdf/2312.06722v3
PDF SHA256：c15ca6dd2823dc0af2a6f55ce15cae49463268b814075cc9260e0d79ba751373
閱讀頁：1、2、3、5、6、7、14。資料來源、goal到QA、統計、選項評分、instruction-tuning資料區別。

- 研究類型：理解、推理與規劃；影片問答與推理
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：原作報419 scenes（影片觀測場景），非419個已建模robot layouts。
- 任務：下一步planning QA；表2合計3,269 task goals與3,185候選action plans，兩者不等同題數。
- 題數／資料：4,939評測QA＝3,355 val＋1,584 test；50K EgoPlan-IT是另外訓練集，非50K測試題。
- 評估方式：MC accuracy；部分開放模型以候選答案條件likelihood排序，需保留不同推論介面。；觀測只可到下一動作開始前；歷史狀態不能洩漏GT下一步。
- Split／資訊條件：EgoPlan-Val／EgoPlan-Test；EgoPlan-IT僅用EPIC來源，以Ego4D子集查跨資料泛化。
- 來源關係：EPIC-KITCHENS與Ego4D的衍生QA；不可與上游影片或EgoPlan2直接加成獨立新活動。
- 可復用：提供goal／歷史／當前觀測→下一步的可用題型；不同goal文字仍須做語義等價審核。
- 待核／限制：正文3,296 goals與表2的3,269相差27；採表2數字且保留差異。；419 scenes的跨影片物理等價關係未核。

### P031　EgoPlan-Bench2（2024）

原作：https://arxiv.org/abs/2412.04447
本次PDF：https://arxiv.org/pdf/2412.04447v2
PDF SHA256：86d13b4d204df0eee1eec14c5a5dde9f3cdc465b7e5b96009d4d8b7f4c48f353
閱讀頁：1、2、3、4、5、6、7。4 domains／24 scenarios清單、goal過濾、觀測選取、MC評分。

- 研究類型：理解、推理與規劃；影片問答與推理
- 領域：居家整理與清潔、餐飲與烹飪、工藝與修繕、零售與購物、實驗室操作、個人照護、交通移動與車輛維修、農業與園藝、休閒與運動
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：24個語義scenario類別，非24個物理scene；來源1,113個Ego4D影片。
- 任務：4原生domains（Work／Daily life／Hobbies／Recreation）；保留4–20步的goal；284 goal verbs不是284個正式任務。
- 題數／資料：1,321道四選一QA；比第一版題少但原作場域更廣，兩種尺度要分開。
- 評估方式：直接匹配A/B/C/D計accuracy；原作不引入第三方LLM judge。
- Split／資訊條件：評測用QA；原作觀測篩選以排除單張即可答與已洩漏動作的影格。
- 來源關係：Ego4D更新版衍生；與第一版方法相承，但不是在同一題集上直接擴成更大數量。
- 可復用：其24 scenario清單是廣度候選的重要依據；不能拿少量QA即宣稱域內所有任務已覆蓋。
- 待核／限制：task-goal語義去重與跨EgoPlan版本同源query重疊未逐ID核。

### P032　EgoTaskQA（2022）

原作：https://arxiv.org/abs/2210.03929
本次PDF：https://arxiv.org/pdf/2210.03929v1
PDF SHA256：9a06fc9a9cfb5e7102f62ff34137fd261251eb9bd7c19ec19b07d4b8f36b5e87
閱讀頁：1、2、4、5、6、7、8、10。LEMMA狀態／因果標註、QA生成、兩種split與metric。

- 研究類型：理解、推理與規劃；影片問答與推理
- 領域：居家整理與清潔、餐飲與烹飪、社交與溝通
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：LEMMA多代理家務影片；沒有新的獨立場景全集。
- 任務：3個scope（world／intent／multi-agent）×4問法（描述／預測／解釋／反事實）；屬QA taxonomy，不是12個生活工作。
- 題數／資料：從368K程式生成候選挑出40K balanced QA，基於約2K ego clips及30K状態／人物註記blocks。
- 評估方式：在answer vocabulary上分類，報accuracy；按scope／type／semantic與open/binary分列。
- Split／資訊條件：normal以QA按3:1:1分train/val/test；indirect以多步間接指涉作泛化測試，不可當場景互斥split。
- 來源關係：直接擴充LEMMA標註；因果trace由前／後置條件規則生成，belief標註由多數人工票決。
- 可復用：提供規則、前置條件、因果與多代理信念的具體擴充；反事實QA不等於模擬器已驗證反事實軌跡。
- 待核／限制：40K題的video父ID與上游LEMMA環境重用未匯入。

### P033　EgoLife（2025）

原作：https://arxiv.org/abs/2503.03803
本次PDF：https://arxiv.org/pdf/2503.03803v3
PDF SHA256：62089719b6879f1f7f10401989959c9a7e0531aa411284d10c9a713f0634c49a
閱讀頁：1、3、4、5、6、7。蒐集、QA流程、正式題庫與當版跑分範圍。

- 研究類型：理解、推理與規劃；長期記憶與生活助理
- 領域：居家整理與清潔、餐飲與烹飪、休閒與運動、社交與溝通
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：1個自建EgoHouse、6人共同生活7天；15台外部相機不是15個環境。
- 任務：5題型：EntityLog、EventRecall、HabitInsight、RelationMap、TaskMaster。
- 題數／資料：約300小時原始／266小時保留影片；正式EgoLifeQA 3,000題（每人500）。本版§5快速實驗只用Jake的500題；EgoIT-99K為訓練資料。
- 評估方式：multiple-choice accuracy；依certificate長度、題型、audio／identity設定分析。；比較captioner時，最終QA由共同GPT-4o回答；這與將GPT當評分judge不同。
- Split／資訊條件：來源為連续一週個人經歷；99K／D1模型訓練與QA證據时间應另外追蹤。
- 來源關係：新錄EgoHouse；EgoIT-99K含其他ego來源，不能把訓練集99K稱本benchmark新增test量。
- 可復用：補多日記憶、習慣與人際關係；需要保留個人／共同事件重疊而非把6人同步影片全當獨立時長。
- 待核／限制：完整3,000題是否有同設定的發布成績，須另查後續版本。

### P034　EgoVLP（2022）

原作：https://arxiv.org/abs/2206.01670
本次PDF：https://arxiv.org/pdf/2206.01670v2
PDF SHA256：cd7cf25aa25da8a2a88d0875ec2f0a5cf56f99a045eb7c11957a6e27784f584f
閱讀頁：1、3、4、5、6、7。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：人類影片與動作資料；影片資料與感知評測
- 領域：居家整理與清潔、工藝與修繕
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Ego4D的129scenario labels；來源環境重用。
- 任務：EgoMCQ包含inter-video/intra-video兩種五選一video-text配對；EgoClip是訓練庫。
- 題數／資料：EgoClip約3.85M narrations/2,927h；EgoMCQ約39K題＝24K inter+15K intra。
- 評估方式：EgoMCQ accuracy；下游retrieval、NLQ、recognition分開。
- Split／資訊條件：EgoClip排除Ego4D val/test；EgoMCQ再人工移除和pretraining共用multi-view的影片。
- 來源關係：Ego4D→EgoClip/EgoMCQ；兩位narrators不代表兩份獨立行為。
- 可復用：原先只列成方法會漏掉真正新增的EgoMCQ；應把論文與其多個資源分開登記。
- 待核／限制：39K是概述約數；最終題ID與選項去重需原始manifest。

### P037　EgoEnv（2022）

原作：https://arxiv.org/abs/2207.11365
本次PDF：https://arxiv.org/pdf/2207.11365v3
PDF SHA256：30fca03c8d8d57b800a30c4d921db35c49f8d6339b1679c30268654e7783ba47
閱讀頁：1、6、7、8。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：理解、推理與規劃；空間理解與affordance
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：pretraining 900 HM3D scenes；HouseTours選886houses，MP3D90scenes；各自保留source單位。
- 任務：room prediction與NLQ兩端點；21real room classes，MP3D9classes不是新的生活domain。
- 題數／資料：約15K合成walkthroughs×512steps；HouseTours約32h、MP3D146walkthroughs；QA精確總量未核。
- 評估方式：room分類、NLQ temporal localization；local-state AP另測。
- Split／資訊條件：HouseTours按house切，Ego4D/MP3D用原split；video memory可讀query附近全片，非嚴格在線。
- 來源關係：新增HouseTours labels、Ego4D NLQ沿用，HM3D/MP3D資產重用。
- 可復用：補house-tour與室內環境理解；source錄影場所與sim資產必須分開。
- 待核／限制：Ego4D段落稱1,259scenes，需核是video/session或實體place；不納跨來源環境總和。

### P038　OpenEQA（2024）

原作：https://openaccess.thecvf.com/content/CVPR2024/html/Majumdar_OpenEQA_Embodied_Question_Answering_in_the_Era_of_Foundation_Models_CVPR_2024_paper.html
本次PDF：https://openaccess.thecvf.com/content/CVPR2024/papers/Majumdar_OpenEQA_Embodied_Question_Answering_in_the_Era_of_Foundation_Models_CVPR_2024_paper.pdf
PDF SHA256：d2c714b7cfdcee8fe6cde607296c15689ecff298b752611c913458fd3964ca48
閱讀頁：1、2、3、4、7。EM／Active定義、資料來源與生成、題數及LLM-Match協定。

- 研究類型：理解、推理與規劃；具身問答與探索
- 領域：居家整理與清潔、辦公與教育
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：蒐集階段100個ScanNet scenes＋87個HM3D scans；這是生成候選history範圍，非已验证題目引用的152個history IDs。
- 任務：7問答類別；兩種設定EM-EQA／A-EQA。Active只允許導航探索，未包括開櫃等操作。
- 題數／資料：正式1,636題＝1,079 ScanNet＋557 HM3D；A-EQA重用這557題，不能加成2,193獨立QA。
- 評估方式：LLM-Match給1–5分再正規化；不是字串match或MC accuracy。；Active另按路徑長度折算效率；object localization有多個合理reference答案。
- Split／資訊條件：來源ScanNet val/test、HM3D val場景；相同QA跨EM與Active，只改可用資訊／探索權限。
- 來源關係：ScanNet／HM3D＋Habitat。與本庫固定manifest的152 history IDs口徑不同，187候選不等於187已取得互動環境。
- 可復用：是同一問題在記憶與可探索環境兩種設定的明確先例；應以共享query而非雙倍題數表示。
- 待核／限制：Active公開資產／執行入口和本文可評557題的可重現範圍需另核；已取得QA metadata不代表所有素材到位。

### P039　RoboVQA（2023）

原作：https://arxiv.org/abs/2311.00899
本次PDF：https://arxiv.org/pdf/2311.00899v1
PDF SHA256：0d6f31eb8631105b7abfd15b617c7477404b7e7694955c0a3108fcff05d658bf
閱讀頁：1、2、3、4、5、6、10。資料蒐集、10種QA擴充、VQA人工判分與三種planning介入評測。

- 研究類型：理解、推理與規劃；具身問答與探索
- 領域：居家整理與清潔、餐飲與烹飪、辦公與教育
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：3棟辦公樓，robot／人手／人持夾具3種embodiment。
- 任務：2,722 unique長指令、26,798 unique中程指令；字串去重不是共同語義任務去重。10種QA包含規劃、完成檢測、affordance、過去描述／未來預測。
- 題數／資料：5,246長程episodes、92,948中程episodes、238小時；VQA val/test各約1,000筆，來自各50 episodes。另100個離線planning episodes／854步、10個live teleop任務及1個自主5步任務。
- 評估方式：VQA先查已人工判定的答案快取，未見答案交人工判correct/incorrect。；planning分cognitive／physical intervention rate；人類救援使所有任務完成，不能把完成率當自主成功率。
- Split／資訊條件：episodes互斥但scenes可重疊；robot-only與human+robot測試分開。
- 來源關係：自身多機體蒐集；SayCan固定60任務是外部baseline範圍，不是RoboVQA任務總量。
- 可復用：是大廣度robot／human資料與高低階分離評測的直接比較對象；數萬指令已大於先前任意5,000配額。
- 待核／限制：完整release QA精確行數與文字語義去重量尚未重算。

### P040　RoboBench（2025）

原作：https://arxiv.org/abs/2510.17801
本次PDF：https://arxiv.org/pdf/2510.17801v2
PDF SHA256：b34e12bf6f096b03930eb63d6e6580345d4fc1330c8c54c7f9660c501b7ff204
閱讀頁：1、2、4、5、6、7、8、9、10、18、22。5維度／25端點、資料表、人機標註、Q1–Q3評分及下游控制驗證。

- 研究類型：理解、推理與規劃；綜合具身認知評測
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：多來源robot影片與自錄配置；未報可相加的去重物理layout總量。
- 任務：5維度、14能力群、25評測端點；不同於25個生活工作任務。
- 題數／資料：6,092 questions／4,336 unique items；含1,895 MC與Q1/Q2/Q3各1,973／842／1,192，加190navigation。相同item衍生多種問題。
- 評估方式：感知／affordance／failure用MC accuracy；Q3 binary accuracy。；Q1用MLLM評node correctness與milestone completion；Q2用MLLM評skill/object/parameter。所稱world-simulator是模型判斷，不是剛體物理模擬執行。；另以CALVIN／LIBERO控制結果查關聯，屬下游驗證子集。
- Split／資訊條件：QA與下游CALVIN ABC→D、LIBERO-Long10任務／各50trials分開；模型全對題會被篩掉，難度帶有選模依赖。
- 來源關係：多robot來源及RoboMIND失敗軌跡；planning failure有人工注入，execution failure來自真rollouts，證據不能混。
- 可復用：最直接的all-in-one具身認知比較對象之一；我們需清楚提出場域／任務聯集與可驗證規則的新增部分。
- 待核／限制：來源unique item跨上游重用尚未逐ID去重；v1 unique items為4,333，不套用到v2。

### P041　EgoCross（2025）

原作：https://arxiv.org/abs/2508.10729
本次PDF：https://arxiv.org/pdf/2508.10729v2
PDF SHA256：f4c3606509844a990b9b1c2fc3df05bdab0cff9a08af8fa5446cc9080f49e743
閱讀頁：1、3、4、7、10。domain選擇、五個上游資料、QA數、Close/Open評分與finetuning split。

- 研究類型：理解、推理與規劃；影片問答與推理
- 領域：工藝與修繕、醫療與手術支援、休閒與運動、寵物照護與動物活動
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：4個domain來自5資料集，不是4個環境；含內視鏡工具視角，不全是人類頭戴相機。
- 任務：identification／localization／prediction／counting四類，15細分題型。
- 題數／資料：957 QA、798 clips；OpenQA與CloseQA為同一問題兩種格式，不是1,914個獨立題。
- 評估方式：CloseQA：4選1 accuracy；OpenQA：Qwen-Max檢查语義正確與reference。
- Split／資訊條件：主zero-shot全題；SFT／RL pilot將原QA再70:30分train/test，其分數不能與全題zero-shot當相同測集。
- 來源關係：EgoSurgery、CholecTrack20、ENIGMA-51、ExtremeSportFPV、EgoPet的衍生QA。
- 可復用：直接提示家務之外的缺域；跨domain來源聯集已有前例，要把多樣性貢獻做得可量化。
- 待核／限制：上述五個上游是否全部在現有書目中獨立登記需補查。

### P042　RoboSpatial（2024）

原作：https://arxiv.org/abs/2411.16537
本次PDF：https://arxiv.org/pdf/2411.16537v5
PDF SHA256：58a5b655a8d69265586b817547ebe08770c6d88ea05ea17d50c2fb56ead76c22
閱讀頁：1、2、3、4、5、6。關係與frame定義、生成規則、表2、Val/Home評測。

- 研究類型：理解、推理與規劃；空間理解與affordance
- 領域：居家整理與清潔、辦公與教育
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：訓練4,916 indoor scans＋190 tabletop scenes；validation40 scans＋77 scenes；來源重用而非新掃描5K個robot場景。
- 任務：context／compatibility／configuration三類空間關係，ego／world／object三種reference frame。
- 題數／資料：約3M是生成訓練QA/relations；正式Val 6,000題，每關係2,000；新錄Home另350人工題。
- 評估方式：yes/no accuracy；座標預測以3D點是否落在reference convex hull判正確。；compatibility以bbox放置無重疊且各軸10cm餘量的幾何規則構造，不等於真實可操作性。
- Split／資訊條件：Val scans完全未在training中；另有indoor↔tabletop泛化与OOD Home。
- 來源關係：ScanNet、Matterport3D、3RScan經EmbodiedScan取幾何；桌面用HOPE、GraspNet-1B；BLINK／SpatialBench是外部eval。
- 可復用：是規則自動擴題與多reference-frame評測的直接先例；可擴大題量，但需保留train與eval區別。
- 待核／限制：源scan之跨庫重建重複量及bbox規則邊界誤差需原生ID／幾何審核。

### P045　ManipBench（2025）

原作：https://arxiv.org/abs/2505.09698
本次PDF：https://arxiv.org/pdf/2505.09698v2
PDF SHA256：7cd33f53355500d085efdd4c1c80dd05509e3d3b24c6ec7232519a9481e53d53
閱讀頁：1、3、4、5、6、27。三種資料来源、五種操作類別、MCQ建立及實體驗證。

- 研究類型：理解、推理與規劃；空間理解與affordance
- 領域：衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：DROID／Bridge原始場景、自錄布料工作站、SIMPLER／RLBench／SoftGym與新增IsaacSim ball場景。
- 任務：pick-place、articulated、deformable、tool、dynamic五種操作類別；布料10理解維度；另外7個真實機器人驗證任務。
- 題數／資料：12,617 MCQ＝9,180公共robot資料題＋2,662布料題＋其餘simulation題；公共資料Q1 6,120、Q2 3,060，來自同episode的augmentation不算新任務。
- 評估方式：MC accuracy；Q2要pick與place兩子題都對才算joint correct，第二題提供GT pick。；MCQ所稱pick-place success不等於實際robot rollout success；另列UR5物理驗證。
- Split／資訊條件：MCQ benchmark與7真機任務分開；新組合未在MCQ中共現，並非保證所有物件個別都未見。
- 來源關係：多既有資料／simulation衍生＋自錄布料；有question augmentation共享母episode。
- 可復用：直接對應多來源robot操作→多模態題庫；需比它更廣的工作用途與更完整規則，而非只加QA格式。
- 待核／限制：各simulation來源精確母episode數與跨題同源關係需manifest匯入。

### P051　USST / EgoPAT3D trajectories（2023）

原作：https://arxiv.org/abs/2307.08243
本次PDF：https://arxiv.org/pdf/2307.08243v2
PDF SHA256：592b977dc3d758aa321266c4f5e7588d29c8fd207b4630fa191021a49d73b634
閱讀頁：1、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：居家整理與清潔、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：EgoPAT3D-DT 14scenes＝11seen+3unseen；H2O重用原capture。
- 任務：3D hand-centroid trajectory forecasting；2D projection另報，不是完整手指控制。
- 題數／資料：H2O 8,203/1,735/3,715 train/val/test windows；EgoPAT3D-DT 6,356/846/1,605 seen test+2,334 unseen test。
- 評估方式：ADE/FDE，3D以米、2D以frame size正規化；3D模型投影和2D直接模型分開。
- Split／資訊條件：H2O64frame windows步長15，窗口重疊；EgoPAT3D有held-out scenes。
- 來源關係：H2O→PT/DT、EgoPAT3D→DT是新增標註；不把父原片重複計。
- 可復用：可新增trajectory模組；相近窗口須依原影片群聚切分與估計。
- 待核／限制：後續Diff-IP2D提及原repo的FDE erratum；比較成績需固定修正版本。

### P053　HandsOnVLM（2024）

原作：https://arxiv.org/abs/2412.13187
本次PDF：https://arxiv.org/pdf/2412.13187v2
PDF SHA256：9ad31595678bd06e9139e118c6a693354034f7c08a91f74988de80f3e5836948
閱讀頁：1、5、6、7。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：餐飲與烹飪、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：EPIC/H2O/FPHA/Ego4D原影片環境，無新增可執行robot scenes。
- 任務：VHP顯式動作指令與RBHP隱式意圖兩預測任務；10observed→4future frames，4fps。
- 題數／資料：RBHP生成7.5K EPIC與8K Ego4D QA-prediction pairs；24K/epoch是抽樣預算而非獨立題庫。
- 評估方式：ADE/FDE/WDE，不是語言答對率或robot完成率。
- Split／資訊條件：EPIC validation及H2O/FPHA zero-shot；†版本混合五個額外QA訓練來源。
- 來源關係：OCT-style手軌跡標註＋GPT生成implicit instructions；父影片和explicit/implicit變體共享。
- 可復用：是擴充任務規則的來源：同軌跡在明示/隱式需求下重測，保留對照關係。
- 待核／限制：生成指令的精確train/test manifest與ground-truth歧義需核；不是每次生成都新語義task。

### P054　EgoVid-5M / EgoDreamer（2024）

原作：https://arxiv.org/abs/2411.08380
本次PDF：https://arxiv.org/pdf/2411.08380v1
PDF SHA256：c878ace0c6d18cf230b26b97a809cdaeda44659ed1cdf693245c44b6681b7f9d
閱讀頁：1、4、5、6、7、8。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：世界模型與預測表示；世界模型與影片生成評測
- 領域：居家整理與清潔、辦公與教育、工藝與修繕、休閒與運動
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：重用Ego4D來源，場景總數未報。
- 任務：文字與camera kinematics條件下video generation；kinematic label不是robot action。
- 題數／資料：名義5Mclips；正文4.9Mtrain、1.2Kval，只有65K具可用IMU的kinematic subset。
- 評估方式：CD-FVD、semantic/action alignment、clarity、motion smoothness/strength及pose errors。
- Split／資訊條件：val按品質/多樣性選，已讀段未明示source-video-disjoint；三個1Mcleaning subsets不是新增資料。
- 來源關係：Ego4D→EgoVid，VIO/MLLM重標；generation評測沿用AIGCBench/VBench部分metrics。
- 可復用：補ego世界模型，但評測視覺品質和實際可控物理成功需另驗證。
- 待核／限制：5M不能全部叫action-conditioned examples；4.9M與5M概述差異保留。

### P057　Motor attention and action forecasting（2019）

原作：https://arxiv.org/abs/1911.10967
本次PDF：https://arxiv.org/pdf/1911.10967v2
PDF SHA256：91f5c905b44c16ebb6de7ac8c6523846a0254a218889c9afb2fc8305e061fc33
閱讀頁：1、7、8、9、11。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：餐飲與烹飪、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：EGTEA與EPIC-Kitchens原capture。
- 任務：action anticipation、motor attention、interaction hotspot三端點。
- 題數／資料：EGTEA10,321action instances；EPIC39,596是父資料，全量hotspot僅EGTEA，EPIC只many-shot noun subset。
- 評估方式：Top1/5、mean-class accuracy、hotspot F1/KLD、trajectory ADE/FDE。
- Split／資訊條件：EGTEA split1/0.5秒anticipation，EPIC既有train/val及1秒anticipation。
- 來源關係：增加manualhotspots；EPIC motor attention用fingertip→hotspot線性插值近似，非完整真實追蹤。
- 可復用：補早期joint HOI預測及標籤品質差異，保留真實/推估label來源。
- 待核／限制：新增hotspot/trajectory標註精確ID數未報，不能把39,596全當新增標註題。

### P058　EgoPAT3Dv2（2024）

原作：https://arxiv.org/abs/2403.05046
本次PDF：https://arxiv.org/pdf/2403.05046v1
PDF SHA256：7496f4c315189a824e5c490ba688d26788d161a66d4cbc6f93caf2d64665979c
閱讀頁：1、2、4、5、6。原版／新增資料、seen/unseen切分、10段進度評分及HRI定位。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：協助、交接與陪伴、穿戴互動與動作介面
- 用途歸納：預測人手將接觸的位置，讓共享工作區的機器人提前配合；同時是頭戴裝置的動作意圖介面。
- 環境：原版5 seen＋6 unseen scenes；新增9 seen＋2 unseen，合計22場景（由原文分量推算）。
- 任務：從RGB预测人手3D action target；cobot接近／避讓是應用展示，非22個操作goal。
- 題數／資料：本輪已讀原作未取得精確clip總量；各test clip按進度10等份評測，不能乘10當獨立軌跡。
- 評估方式：厘米級target prediction error，early／late分列；3個訓練seed取平均。
- Split／資訊條件：保留T1/T2訓練與D1/D2測試來源、seen/unseen；train clips最多25frames，test不限制。
- 來源關係：EgoPAT3D擴充並修正部分GT；原baseline也因此改進，需固定版本後比較。
- 可復用：可加入人類手部目標提前量／距離誤差軸，不能拿10個觀測比例冒充10種任務。
- 待核／限制：新增與原版各split精確clip ID總量仍須發布資料核對。

### P060　Continuous 4D interaction forecasting（2026）

原作：https://arxiv.org/abs/2609.08636
本次PDF：https://arxiv.org/pdf/2609.08636v1
PDF SHA256：831ddd738803ba93751f328695856f63519cd1327b28140774d76cb95ae0ba35
閱讀頁：1、2、4、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：餐飲與烹飪、醫療與手術支援、交通移動與車輛維修、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Ego-Exo4D的787takes，不等於787獨立場地。
- 任務：3D interaction location＋full-body pose聯合預測；Cooking/Health/BikeRepair三用途。
- 題數／資料：233,828windows＝193,598train+20,484val+19,746test；1,594,186是有效future targets。
- 評估方式：continuous location errors與MPJPE/PA-MPJPE；兩種target和validity mask分開。
- Split／資訊條件：take-level split；三域horizon為10/5/4interaction steps，不是固定秒數。
- 來源關係：Ego-Exo4D＋FIction式事件＋WHAM重建；exoviews僅供offline labels。
- 可復用：擴展where-to-how預測；source-domain與camera/pose時間對應都可入共同規格。
- 待核／限制：take-level不自動證明不同take沒有共用實體環境；作者scene-disjoint說法需place IDs核。

### P061　Interact with me（2024）

原作：https://arxiv.org/abs/2412.16698
本次PDF：https://arxiv.org/pdf/2412.16698v3
PDF SHA256：35eabf84ae2cfa183887ab3924f91d9f15fa53aac29576e56407b4eee8da3642
閱讀頁：1、2、3、4、5。JPL擴充、3組標籤、訓練augmentation、主要實驗。

- 研究類型：未來動作／互動預測；人體與互動感知評測
- 領域：社交與溝通、協助、交接與陪伴
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：沿用JPL人機互動影片；未報新增scene總數。
- 任務：intent 3類、attitude 2類、action 10類；attitude是依action規則產生的標籤，不是獨立量測心理狀態。
- 題數／資料：200母影片→290 person-level tracks；crop/flip/keypoint noise擴增只增加訓練樣本，不增加290個來源個案。
- 評估方式：三任務各報accuracy及F1；主表觀測首1秒30frames，另變更窗口；模型latency另列。
- Split／資訊條件：本輪已讀段落未取得正式train/test track ID分配；不得把290直接稱test題。
- 來源關係：JPL video-level標註擴成人物track；同影片多個人共享情境。
- 可復用：補互動意圖與社交預測；需註明人設標籤規則及與動作標籤的依赖。
- 待核／限制：同母影片track是否跨split及split數須源code核對。

### P065　CALVIN（2021）

原作：https://arxiv.org/abs/2112.03227
本次PDF：https://arxiv.org/pdf/2112.03227v4
PDF SHA256：c8ad4741782fa8fb773377fbf61b8772b86574f255599a229d3f6ad4d878c60e
閱讀頁：1、2、3、4、5、7。4環境、34task與全部success criteria、play資料及MTLC／長鏈評測。

- 研究類型：一般操作 benchmark；模擬操作benchmark
- 領域：居家整理與清潔、通用物件與機動作業
- 用途歸納：開抽屜、控制燈與把物件收好屬居家整理；方塊轉動、推移與堆疊則保留為通用作業。
- 環境：A/B/C/D四個配置；共用桌面、robot及camera位置，但滑門／抽屜／開關位置與材質不同。
- 任務：34原子任務，包括方塊轉動／推移／抬起、收納、堆疊、開關門與燈。
- 題數／資料：24小時play、約2.4M steps／40M可重標窗口是資料潛量；正式long-horizon 1,000條5步鏈；單步每task10個rollouts。
- 評估方式：task completion依起終状態变化，不只終點距離；長鏈只成功才轉下一subgoal，報鏈長／成功情況。
- Split／資訊條件：single／multi／zero-shot multi環境；ABC→D為未見配置但語義任務已在train出現，語句另保留未見表達。
- 來源關係：PyBullet自建play環境；多後續VLA評測重用同1,000 chains，不能算各自新增題庫。
- 可復用：可借序列可行性、過程状态與長鏈測試；34原子任務和5,000子步次數不能混算。
- 待核／限制：模型成績比較必須固定語言／初態鏈版本及可用sensor。

### P066　ManiSkill（2021）

原作：https://arxiv.org/abs/2107.14483
本次PDF：https://arxiv.org/pdf/2107.14483v5
PDF SHA256：90472755c9779e6088c8a94faaed0a4de3b9743d2d994c421973b0e7c402b374
閱讀頁：1、3、4、5、6、7。原生task／environment定義、4 skills、物件split、demo及評分。

- 研究類型：一般操作 benchmark；模擬操作benchmark
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：原作environment以一個物件資產為單位；表1為52門櫃、35抽屜櫃、36椅、39桶，櫃體可能含多door/drawer，不能當162獨立房間。
- 任務：4 skills：OpenCabinetDoor、OpenCabinetDrawer、PushChair、MoveBucket；涵蓋單／雙臂mobile manipulation。
- 題數／資料：約36K成功demonstrations、1.5M frames；測試物件每skill10個，cabinet target有多門／多抽屜。
- 評估方式：預定test environment instances的mean success；task-specific終態／穩定性判定；training restrictions分track。
- Split／資訊條件：同物件category下train/test object互斥；單個scene參數變化另為environment instance。
- 來源關係：SAPIEN＋PartNet-Mobility類資產；ManiSkill2繼承這4項，不可視作全部新任務。
- 可復用：資產拓撲泛化與物件級environment是重要細節；需轉譯成共同欄位但不抹平原生定義。
- 待核／限制：門櫃／抽屜櫃底層asset ID是否重疊需manifest核。

### P067　ManiSkill2（2023）

原作：https://arxiv.org/abs/2302.04659
本次PDF：https://arxiv.org/pdf/2302.04659v1
PDF SHA256：89fb794345d860ee696ca2f4d7a75059b15352b615794eeadb0e6075426136f0
閱讀頁：1、2、3、4、5、6、7、8、19、22。20families內容、精密裝配規則、rigid-soft平台、評測與部分task-specific附錄。

- 研究類型：一般操作 benchmark；模擬操作benchmark
- 領域：居家整理與清潔、裝配與生產作業、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：SAPIEN／MPM配置及2,000+ object models；object assets非同量房屋。
- 任務：20 families：6 soft、3精密插入、5 pick-place、5關節／mobile、1 AvoidObstacles；繼承ManiSkill1的4項。
- 題數／資料：4M+ demonstration frames為訓練資料。test依task不同：如PickSingleYCB每物件5/10 episodes、cabinet兩階段各250等，不能指定所有task同一題數。
- 評估方式：task-specific真物理成功；插入必須實際進孔，非靠近goal pose。；原文同AssemblingKits基線在pose accuracy可99%、真插入成功只18%，說明難度高度依賴規則。
- Split／資訊條件：按物件train/test及challenge stage，控制器可轉換但要保留其action約定。
- 來源關係：繼承ManiSkill1；任務靈感來自MetaWorld／RLBench／Ravens，但更改孔洞幾何與成功判準，屬有實質規則差異的衍生。
- 可復用：直接支持『同名任務可擴充規則』主張；更严格成功條件必须以獨立規則版本記錄。
- 待核／限制：全20家族不同階段test episodes總量要從eval manifest按版本重算。

### P069　robosuite（2020）

原作：https://arxiv.org/abs/2009.12293
本次PDF：https://arxiv.org/pdf/2009.12293v3
PDF SHA256：3da1cc7ba84ee487a90d7013325dd6045eea7c2920bc50cdb8ff37db67426fd4
閱讀頁：1、7、10、11、12、13、14、15、16、17。平台、robots/controllers、全部9 benchmark descriptions與標準評測。

- 研究類型：一般操作 benchmark；模擬平台與任務套件
- 領域：居家整理與清潔、裝配與生產作業、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：9標準task環境，共用可配置arena／robot；10robot模型不是10場域。
- 任務：Lift、Stack、PickPlace、NutAssembly、Door、Wipe、TwoArmLift、TwoArmPegInHole、TwoArmHandover。
- 題數／資料：程序隨機初始化，未固定全庫題量；基線9環境×robot/controller組合，5 seeds是訓練重複，不增加task。
- 評估方式：標準SAC實驗報normalized episode return，500step horizon；task success條件依具體任務，不能把return當百分比成功率。
- Split／資訊條件：原作比較Panda/Sawyer與OSC/joint velocity，建議固定Panda OSC；未提出全域held-out task split。
- 來源關係：MuJoCo模組平台；LIBERO、RoboCasa、MimicGen等重用，平台與下游bench不可當完全独立環境源。
- 可復用：提供共通模擬／控制器／task介面；平台功能與benchmark實績分開。
- 待核／限制：repo v1.5可用的其餘task是否超過本文9個標準評測需分清，不以註冊class數覆蓋論文結果。

### P070　RoboCasa（2024）

原作：https://arxiv.org/abs/2406.02523
本次PDF：https://arxiv.org/pdf/2406.02523v1
PDF SHA256：7aca93ca3f157e32a46e02d675b3b2c24e3073a7807c038f7f566b73db87bde3
閱讀頁：1、2、3、4、5、6、8。場景、資產、100tasks組成、MimicGen數據與正式eval子集。

- 研究類型：一般操作 benchmark；模擬操作benchmark
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：10 floor plans×12 styles＝120 scenes；只能把10稱平面layout數。額外AI textures不新增layout。
- 任務：100＝25 atomic（8skills）＋75 composite（20料理活動標籤下生成並實作）。
- 題數／資料：atomic有1,250 human demos；生成實驗72K（24tasks，排除navigation）另28K組成100K發布集。主要eval每task50 trials，分5個固定場景。
- 評估方式：物理task success；按skill、資料規模、未見物件／style分列。
- Split／資訊條件：eval只用未見物件實例；5場景中2種style未見。MimicGen有成功rejection sampling，訓練資料成功不代表policy成功。
- 來源關係：Robosuite底座、Objaverse／Luma資產、MimicGen擴樣；後續RoboCasa365是同家族延伸。
- 可復用：支持生活工作组合擴充；域仍主要在廚房，須報真實layout與style層次。
- 待核／限制：本庫先前收集的60個來源場景條目來自不同repo版本，不能與此PDF120 scenes混寫，更不能叫60獨立layouts。

### P072　VLABench（2024）

原作：https://arxiv.org/abs/2412.18194
本次PDF：https://arxiv.org/pdf/2412.18194v1
PDF SHA256：9dc4aa5cfa6dcb86a30099eda2482bf45814285a8d6662df624ed79f2382788b
閱讀頁：1、2、4、5、6、7、8、19。100任務、10skills、資產、VLA/流程/VLM三種評測與PS。

- 研究類型：一般操作 benchmark；模擬操作benchmark
- 領域：居家整理與清潔、餐飲與烹飪、辦公與教育、實驗室操作、休閒與運動
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：MuJoCo/dm_control程序配置；未提供可直接與住宅數比較的獨立scene總量。
- 任務：100＝60 primitive＋40 composite，10操作skills；包含整理桌面、料理、化學示範、紙牌規則等。
- 題數／資料：2,164資產／163類；VLA主微調只取16類各100trajs＝1,600訓練軌跡，非全100task的test量。
- 評估方式：Success與Progress Score分開：PS預設0.2正確物件選取＋0.8已完成子步比例。；VLM非互動模式輸出DSL，轉DAG比skill/parameter recall與exact matching；不能把此分數當物理成功率。
- Split／資訊條件：seen/unseen object是整個category的差異；與ManiSkill同category新instance不相同。VLA／workflow／VLM資訊條件各異。
- 來源關係：部分RoboCasa assets＋Objaverse、生成資產；技能API和標註先驗要列清。
- 可復用：已涵蓋多種日常語義和物理／知識規則；是本研究擴規則與multimodal tool use的近鄰。
- 待核／限制：各task eval episode數、無互動VLM題庫精確量需源manifest核。

### P073　RoboTwin（2024）

原作：https://arxiv.org/abs/2409.02920
本次PDF：https://arxiv.org/pdf/2409.02920v3
PDF SHA256：2c289e8ac5352f42de2908b166176fe6d01f045fbb4fb7214134a63e7c432c4f
閱讀頁：1、2、4、5、7、8、9。digital twin資料流程、17真實資料任務与6個DP3 benchmark子集。

- 研究類型：一般操作 benchmark；模擬與真實操作benchmark
- 領域：居家整理與清潔、餐飲與烹飪、工藝與修繕、協助、交接與陪伴
- 用途歸納：從杯子擺放、蘋果收納、掃除、鎚擊與人際互動資料歸納，保留每種用途所對應的任務範圍。
- 環境：COBOT Magic工作站與其合成digital twins；未報多房屋總數。
- 任務：資料設計17任務（9tool、5人際、6雙臂，標籤可重疊）；本文DP3跑6任務。
- 題數／資料：真實資料每task30trajs（17×30＝510）；6任務實驗比較10/20/50 expert demos。test rollouts精確數本段未報。
- 評估方式：各task completion success rate；示範數是訓練條件，不是評測題数。
- Split／資訊條件：real收集範圍與synthetic expert評測6task分開；9+5+6不能加為20個不重疊task。
- 來源關係：AIGC由圖到3D，MLLM寫expert code；RoboTwin2為後續擴充。
- 可復用：雙臂、工具、人機互動與digital twin產題可借；版本應明確分層。
- 待核／限制：原文引用A.3而此PDF附錄資訊有限，完整17task manifest與test rollout數仍待code核。

### P075　VIMA（2022）

原作：https://arxiv.org/abs/2210.03094
本次PDF：https://arxiv.org/pdf/2210.03094v2
PDF SHA256：cf849f80368749b0310b43117519ce0abff3e8ae49744e78c4a29b9d17f0695f
閱讀頁：1、2、3、5、6、8、34、37。VIMA-Bench多模態prompt、17templates、4級泛化、訓練與eval。

- 研究類型：一般操作 benchmark；多模態指令操作
- 領域：居家整理與清潔、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Ravens桌面平台，物件／材質／位置程序變化；未報多房屋環境數。
- 任務：17task templates歸6非互斥類：物件操作、視覺goal、新概念、示範模仿、視覺約束、推理／記憶。
- 題數／資料：600K+ expert訓練trajectories；程序產生的instances與17templates分開，不能把訓練軌跡稱600K測試題。
- 評估方式：模擬互動task success；L1位置、L2新組合、L3新物件、L4新task分開。
- Split／資訊條件：offline BC；held-out validation選模型、simulator evaluation。原生動作為參數化pick-place／wipe primitive，非相同低階控制難度。
- 來源關係：Ravens延伸；多模態prompt內圖片、語言、示範本來就在單一介面，不能把這點當本研究首次貢獻。
- 可復用：多模態指令統一入口的重要前作；可擴大生活用途與規則，但需承認其既有統一介面。
- 待核／限制：各泛化級的確切公開eval seeds／case數需發布設定核對。

### P076　Ravens / Transporter Networks（2020）

原作：https://arxiv.org/abs/2010.14406
本次PDF：https://arxiv.org/pdf/2010.14406v3
PDF SHA256：3a5e78b5c8881863845c46bda0bf8c9071aa79a59a6f9a9f4d8732690482b228
閱讀頁：1、5、6、7、8。全部10simulation task清單、動作／觀測、訓練量、test與真機驗證。

- 研究類型：一般操作 benchmark；模擬操作benchmark
- 領域：居家整理與清潔、裝配與生產作業、包裝、倉儲與物流、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：UR5e＋0.5×1m桌面，3 RGB-D視角；real kit assembly／sweeping為額外實驗。
- 任務：10task：block insertion、red-in-green、Hanoi、align corner、pyramid、palletizing、kits、packing、rope、sweeping。
- 題數／資料：每task訓練1/10/100/1,000 demonstrations；每task100 unseen test runs＝一方法設定1,000runs。
- 評估方式：0–100 performance，多步task給partial credit；非所有表中的分數都是binary success percentage。
- Split／資訊條件：物件／goal位置朝向train/test隨機，3task含未見objects；two-pose動作primitive及suction降低控制負担。
- 來源關係：PyBullet桌面，自帶script oracle；VIMA、DeformableRavens等衍生共享task與介面。
- 可復用：包裝、堆疊、繩索、清掃可作source tasks；需標記primitive與成功判準。
- 待核／限制：task各自partial credit及物理predicate嚴格程度需具體code映射，不以同名插入直接對比ManiSkill2。

### P077　CLIPort（2021）

原作：https://arxiv.org/abs/2109.12098
本次PDF：https://arxiv.org/pdf/2109.12098v1
PDF SHA256：3cc19664beabda203cb1a1ad86659f75f60a099189820d92d59d20067c9ab003
閱讀頁：1、2、4、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：一般操作 benchmark；模擬與真實操作benchmark
- 領域：包裝、倉儲與物流、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：PyBullet Ravens UR5e桌面；3noiseless cameras融合RGB-D。
- 任務：10language-conditioned tasks；8有seen/unseen semantic variants。
- 題數／資料：每模型/設定100evaluation runs，train 1/10/100/1000demos是規模對照。
- 評估方式：Ravens 0–100partial-credit task score，不能全叫binary success rate。
- Split／資訊條件：held-out colors/object categories；56GoogleScannedObjects分37seen/19unseen。
- 來源關係：Ravens task復用並加語言；nominal SE(2) pick-place和通用6DoF policy難度不同。
- 可復用：補語言語義的操作規格；count10tasks，不把每demo和attribute組合當新task。
- 待核／限制：真實補充任務及完整source-task對應另需原生code；本列定量限已讀sim protocol。

### P079　FMB（2024）

原作：https://arxiv.org/abs/2401.08553
本次PDF：https://arxiv.org/pdf/2401.08553v3
PDF SHA256：c0d7c39378cfc46b87289276d517c5e9ef6aa5932fece6c5d2b0b4a4f120f9e8
閱讀頁：1、3、4、5、7、8、10、12。資產、三大skill／六種primitive、長流程、表1及evaluation。

- 研究類型：一般操作 benchmark；真實操作benchmark
- 領域：裝配與生產作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：可重製Franka工作站，物件與board初態依規定區域和姿態；不是66個環境。
- 任務：functional grasp／reposition／insert三大能力；single-object與multi-object兩類流程，3套multi-object互鎖裝配。表1有6個primitive。
- 題數／資料：66訓練物件＋5新測試物件；表1精確22,550 primitive trajectories由完整流程分割，不能都叫獨立22,550長程任務。
- 評估方式：依skill／長流程success；grasp實驗5 seen＋5unseen物件各5次＝50trials；完整流程另有10次設定。
- Split／資訊條件：物件shape/size/color与初態泛化；board插入間隙1–2mm；可模組評估也可end-to-end，兩者分開。
- 來源關係：自製3D printable objects與human demos；長流程和primitive數據共享母軌跡。
- 可復用：精密contact、功能性抓取、重抓與順序依赖；只有模擬仍可收錄規格，不能稱已重現其real實驗。
- 待核／限制：摘要22,500與表1精確22,550為約數差異；未取得完整真機eval。

### P080　DexArt（2023）

原作：https://arxiv.org/abs/2305.05706
本次PDF：https://arxiv.org/pdf/2305.05706v1
PDF SHA256：44354c0496a14f9ef90e19cd93f1521075adb6daff5f0a882cc045a649fbff7e
閱讀頁：1、2、3、4、5、6。4task、seen/unseen表、22DoF介面、success與視角泛化。

- 研究類型：一般操作 benchmark；靈巧手操作benchmark
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：SAPIEN中XArm6＋16DoF Allegro；物件資產不同，非多house layout。
- 任務：Faucet、Bucket、Laptop、Toilet四task；資產18／19／17／28，共82。
- 題數／資料：seen物件11+11+11+17＝50，unseen7+8+6+11＝32；3訓練seeds；6K point clouds/object為視覺預訓練資料。
- 評估方式：success依關節角／抬升高度；episodic return另列；測seen/unseen物件和新camera pose。
- Split／資訊條件：同category未見instance；4接觸／進度reward不等於4獨立benchmark。
- 來源關係：PartNet-Mobility資產；額外PMM46類是pretraining，不是DexArt46個任務。
- 可復用：補靈巧手與拓撲泛化；DoF增加代表控制要求，不能直接給跨benchmark單一難度等級。
- 待核／限制：完整test episodes per object與seed ID需eval code核。

### P081　ARNOLD（2023）

原作：https://arxiv.org/abs/2304.04321
本次PDF：https://arxiv.org/pdf/2304.04321v2
PDF SHA256：5a2b6c0126bde99772c888036524fd071cf3890034be184e26c437bd42f50fdb
閱讀頁：1、3、4、5、6、8。scene/objects、8tasks各continuous goal、表2/3、泛化切分與2秒success。

- 研究類型：一般操作 benchmark；模擬操作benchmark
- 領域：居家整理與清潔、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：20個scene、40物件；Isaac Sim／PhysX5、固定Panda base。
- 任務：8task×各4個數量goal（保留1個novel state）；抬物、重定向、開關drawer/cabinet、pour／transfer water。
- 題數／資料：表3共10,080 demonstrations/configurations：train3571、val771、IIDtest773、novel object1078、scene1114、state2000、any-state773。
- 評估方式：完成最終stage後在goal tolerance內保持2秒；transfer水另限≤10%spill；報success rate。
- Split／資訊條件：Normal約70/15/15；novel object／scene／state每次只變一因素；Any State是連續range抽樣，非同樣extrapolation難度。
- 來源關係：既有室內synthetic scenes＋外部object assets；可接Roboverse但需保留新success規則。
- 可復用：量化精度、穩定維持與spill限制是規則擴充的好依據；同task多目標與新語義task分開。
- 待核／限制：本庫尚未逐ID匯入全部scene/state/test組合。

### P083　RoboDojo（2026）

原作：https://arxiv.org/abs/2607.04434
本次PDF：https://arxiv.org/pdf/2607.04434v3
PDF SHA256：e07c215f30169dde6a792c34b046b1f54818d09331763988732dcf9ead89a9d4
閱讀頁：1、2、3、4、5、6、7、8、9、16、28、45。42sim/18real、五能力清單、train/eval數量、評分與hidden-layout驗證。

- 研究類型：一般操作 benchmark；模擬與真實操作benchmark
- 領域：居家整理與清潔、衣物與洗護、裝配與生產作業、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Isaac Sim雙臂工作站和3類真機平台；各task有公共reset layouts和hidden驗證布局。
- 任務：42simulation tasks（12 generalization、6 memory、8 long、8 precision、8 open）＋18real tasks；同名/同goal的sim/real不能先假定60語義去重任務。
- 題數／資料：simulation每task50episodes＝2,100；real每task10trials＝180。sim train34tasks＋DLC共35目錄3,500trajs，real1,800trajs。
- 評估方式：sim binary success＋partial-progress score，五能力宏平均；real三人雙盲評分後平均。
- Split／資訊條件：Open8task不在train；generalization每task25標準＋25隨機；正式榜另3seeds及hidden layouts，不加作新task。
- 來源關係：参考RoboTwin、RMBench等，使用新規則及共同sim-real介面；公開表與hidden驗證不同地位。
- 可復用：綜合能力與可復現實測的近鄰；我們simulation-only版本需以同等成功／partial score證據比較。
- 待核／限制：sim/real相同任務之去重關係與hidden驗證量未完整公開。

### P084　KinDER（2026）

原作：https://arxiv.org/abs/2604.25788
本次PDF：https://arxiv.org/pdf/2604.25788v2
PDF SHA256：39d1283a971b7b903edb7885cabdc9dea9c412bd3cfcc8431f0c39154ba44900
閱讀頁：1、3、4、5、6、7、14。五大physical-reasoning要求、25環境、4種物理抽象、8實驗環境及metrics。

- 研究類型：一般操作 benchmark；物理推理與規劃benchmark
- 領域：居家整理與清潔、包裝、倉儲與物流、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：25 procedural task-environments：6 Kinematic2D＋4 Dynamic2D＋5 Kinematic3D＋10 Dynamic3D；不是25生活场域。
- 任務：工具、nonprehensile、多物體、幾何、動力約束；KinDERBench主實驗只取8代表環境，13baselines。
- 題數／資料：10環境各≥100precollected demos；eval每seed50episodes×5seeds，8環境合計2,000runs／baseline（含重複seed運行）。
- 評估方式：success rate；只在成功episodes比較累積步數cost（每步-1），另報inference time。
- Split／資訊條件：不同物體數量OOD；state／RGB與提供skills/PDDL的資訊差異需明示。Kinematic版本碰撞回退、rigid attachment，不等同dynamic真抓取。
- 來源關係：PyMunk／PyBullet／MuJoCo不同backend；借RoboCasa/MimicLabs資產及BDDL設計。
- 可復用：支持明確規則／物理抽象的比較；不得將kinematic、dynamic的成功直接合成無條件難度分數。
- 待核／限制：程序分布無固定題庫上限；僅8環境有主baseline結果，不能聲稱全25已同程度驗證。

### P085　SoftGym（2020）

原作：https://arxiv.org/abs/2011.07215
本次PDF：https://arxiv.org/pdf/2011.07215v2
PDF SHA256：0e0bd8b74b7d8b3aa1a203694debf47d425adbfe2eab8bf4555b198525e89903
閱讀頁：1、3、4、5、6、7、8、14。6 Medium／4 Hard任務、action抽象、oracle資訊及eval切分。

- 研究類型：布料／柔性物操作；柔性物操作benchmark
- 領域：衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：FleX程序物理環境；主Medium/Hard直接控制picker或杯子，非完整手臂；SoftGym-Robot另列。
- 任務：10任務＝6 Medium（transport/pour water、straighten rope、spread/fold/drop cloth）＋4 Hard（pour amount、fold crumpled、drop-fold、rope configuration）。
- 題數／資料：主實驗每task預抽1,000 variations＝800train＋200eval；CEM只抽10個eval variations，不能稱所有方法測同量。
- 評估方式：按task用覆蓋面積、粒子距離、水量／spill等；以do-nothing與upper bound正規化，可能小於0。；5 seeds報median／四分位，不是binary success rate。
- Split／資訊條件：初態variations800/200；DynamicsOracle／StateOracle／RGB資訊權限不同，不能混為同難度。
- 來源關係：FleX與抽象pickers；後續布料task和數據生成器大量重用。
- 可復用：柔性物task與連續指標來源；加上機體、抓持及穩定性規則才適合與robot控制任務比較。
- 待核／限制：SoftGym-Robot在本文註明待NVIDIA許可發布；目前取得狀態須另核，不能由API假定可用。

### P086　DeformableRavens（2020）

原作：https://arxiv.org/abs/2012.03385
本次PDF：https://arxiv.org/pdf/2012.03385v4
PDF SHA256：7227984ec317cff8190a29c2f53794d0e399fbbb7ed78c8ee21c7b27f78d65f8
閱讀頁：1、3、4、5、6、7、13、14。12任務全表、deformable primitive、資料與checkpoint選擇、真機cable實驗。

- 研究類型：布料／柔性物操作；柔性物操作benchmark
- 領域：衣物與洗護、包裝、倉儲與物流
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：共用UR5桌面，PyBullet繩索／布料／袋子；理想nearest-vertex抓持。
- 任務：12＝5 cable、3 fabric、4 bag；有goal image和無goal圖兩種設定，bag含打開→裝物→搬運。
- 題數／資料：每task1,000成功demo；每checkpoint20eval episodes、通常3訓練runs，bag-color僅1run。表格選10checkpoints最大值。
- 評估方式：cable位置／凸包面積、cloth coverage、bag containment/transport依task分開。；真機cable另10episodes、最多10actions、mask IoU>0.25判成功。
- Split／資訊條件：held-out random seeds；依eval最大checkpoint報分有選擇效應，不能當獨立test後只評一次。
- 來源關係：Ravens延伸；成功demo經過濾，script成功率與policy測試不是同一分母。
- 可復用：拓展袋子、繩索與布料多階段規則；要額外防止袋外掛物等達標漏洞。
- 待核／限制：各task指標中連續coverage與binary success混合，跨任務總分需保留原生定義。

### P087　GarmentLab（2024）

原作：https://arxiv.org/abs/2411.01200
本次PDF：https://arxiv.org/pdf/2411.01200v3
PDF SHA256：8b0cea58cae1f425754a11a328f6082eafc8066dd93300c8255ba4ae17ffa999
閱讀頁：1、2、3、4、5、6、7、8、9、16、17、20。資產與5種物理互動、20task、實驗子集、split及5秒success。

- 研究類型：布料／柔性物操作；柔性物操作benchmark
- 領域：居家整理與清潔、衣物與洗護、個人照護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：20scene與9,000+object models資產庫；PhysX多物理方法，scene/asset數不等於實評數。
- 任務：20tasks歸5interaction groups：garment-garment/fluid/FEM/rigid/avatar；含摺、展、掛、吹乾、洗、收納、穿衣。
- 題數／資料：不同task初態／garment取樣；正文baseline以大件fold/unfold/hang、小件place/hang及若干RL子集為主，沒有统一全20task題數。
- 評估方式：達task-specific判準後維持至少5秒；fold用IoU、unfold用coverage，其他物理互動有專用容差。
- Split／資訊條件：objects70/15/15；另novel state／scene；主實驗並非全部20task同程度跑分。
- 來源關係：ClothesNet、ShapeNet、PartNet/YCB、PartNet-Mobility、Omniverse/actorcore等資產；RoboVerse遷移其子集。
- 可復用：柔性物與日常服務廣度的重要來源；應保留materials與state/evaluator可用程度。
- 待核／限制：摺衣輪廓IoU無法單獨檢查層次／拓撲正確；需更細規則。；完整20task有效case數待manifest。

### P088　FlingBot（2021）

原作：https://arxiv.org/abs/2105.03655
本次PDF：https://arxiv.org/pdf/2105.03655v3
PDF SHA256：ad6e502825c044a1ce13911164ae7817e00628ba7ac3e46358cc277c9d25dc8e
閱讀頁：1、6、7。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：布料／柔性物操作；柔性物操作benchmark
- 領域：衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：simulation cloths與dualUR5真實工作站；NormalRect/LargeRect/Shirt三object regimes。
- 任務：主要1個unfolding目標；三clothtypes是材料/形狀泛化設定。
- 題數／資料：2,000trainingcloth settings，600sim test cases各類200；real各類10cases，150realadapt episodes不算test。
- 評估方式：normalized final/delta coverage及actions，允許coverage>1的正規化情形不裁成success。
- Split／資訊條件：CLOTH3D test shirts；mesh/material/init分離，10step budget或預測抓地板終止。
- 來源關係：CLOTH3D與既有clothphysics，dataset task實為具體cloth+material+initialization。
- 可復用：示範同一目標可以有大量物理cases，而未增加語義task數。
- 待核／限制：coverage並不保證可直接摺衣；real細節與sim material參數只能作相應範圍推論。

### P089　SpeedFolding（2022）

原作：https://arxiv.org/abs/2208.10552
本次PDF：https://arxiv.org/pdf/2208.10552v2
PDF SHA256：2421f14228d394a1a2f683d8156f4ff953dee3dd1deefef64ce0037854b86be1
閱讀頁：1、5、6、7。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：布料／柔性物操作；柔性物操作benchmark
- 領域：衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：ABB YuMi工作站；known shirt、unseen shirt、towel。
- 任務：smoothing→folding，instruction/2-second/Fling-to-fold三策略並非三個生活domain。
- 題數／資料：4,300action records包含1,500複製重標；每experiment15trials。
- 評估方式：fold由3reviewers多數決；horizon10；time成功回合平均，FPH/cycle包括失敗。
- Split／資訊條件：train單shirt；towel泛化前加20smoothimages再訓練，不是完全zero-shot。
- 來源關係：前作FlingBot比較有不同hardware；1500重標非獨立physical actions。
- 可復用：補摺衣全流程與吞吐量，不能只報93%而略過任務、排除規則和15次分母。
- 待核／限制：排除motion-planning early failures會影響整體systemsuccess解讀；須在共同protocol保留此差異。

### P090　Cloth Funnels（2022）

原作：https://arxiv.org/abs/2210.09347
本次PDF：https://arxiv.org/pdf/2210.09347v1
PDF SHA256：06417ac85cf98e06ede6fd96b746e6e1ce3ad99ca09fcd9f61789122d0ecfcdb
閱讀頁：1、2、4、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：布料／柔性物操作；柔性物操作benchmark
- 領域：衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：CLOTH3D simulation與真實衣物工作站，5garment categories。
- 任務：canonicalized alignment，另支援folding/ironing；highcoverage不保證對齊。
- 題數／資料：每garment category2,000train/400test settings；hard/easy train75/25、test50/50。
- 評估方式：IoU/coverage及分離rigid-alignment和deformable errors；fold success為qualitatively選的error門檻。
- Split／資訊條件：mesh-disjoint，easy/hard是不同初態生成；eachgarmentcategory獨立policy。
- 來源關係：CLOTH3D／FlingBot資料生成構想；downstreamfoldheuristic非新end-to-end模型。
- 可復用：把攤平、對齊和指定摺法拆成可驗收目標，適合作為擴充規則依據。
- 待核／限制：real全部trajectory分母未在已讀段報出；不可套用sim400為realcase數。

### P091　UniFolding（2023）

原作：https://arxiv.org/abs/2311.01267
本次PDF：https://arxiv.org/pdf/2311.01267v1
PDF SHA256：b51de4cbad0c9715a18e88ce74af68a21192ad10e130a1b956715c87706d8049
閱讀頁：1、2、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：布料／柔性物操作；柔性物操作benchmark
- 領域：衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：RFUniverse/ClothDynamics及雙Flexiv工作站；2garment categories。
- 任務：兩類衣物的unfold+fold流程；60realgarments的train/test40/20。
- 題數／資料：VR1,218+1,575＝2,793videos，real2,432samples；20heldoutgarments各10trial＝200realtrials。
- 評估方式：IoU、normalizedcoverage，wholeflow10steps內按rules摺好。
- Split／資訊條件：realgarments2:1，simCLOTH3D9:1；onlinehumanpreference作訓練，不當test免介入證據。
- 來源關係：CLOTH3D、ClothFunnels目的函數及VR-human demonstrations。
- 可復用：可取shirt具體fold規則和材料差異，human annotations與robotepisodes分开。
- 待核／限制：機器人reach/grasp自動recovery和policyactionbudget的共同計數需要adapter明定。

### P092　ICRA cloth competition（2025）

原作：https://arxiv.org/abs/2508.16749
本次PDF：https://arxiv.org/pdf/2508.16749v2
PDF SHA256：c44a1dff77f6fe471123e7e70b03b6735ed494e18190396a44c5c4232962b274
閱讀頁：1、2、5、6、7、8、11。固定unfold primitive、硬體／grasp execution、coverage metric、資料及比賽規模。

- 研究類型：布料／柔性物操作；真實操作benchmark
- 領域：衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：雙UR5e＋單stereo camera標準工作站；訓練在lab、比賽在會場，cloth初態無法精確複製。
- 任務：1個核心任務：懸掛布料選grasp後stretch展開；34garment items不是34task。
- 題數／資料：679episodes＝503訓練嘗試＋176競賽trial；11隊各16次（8衣物×2），同題型由不同方法執行。
- 評估方式：主metric projected coverage／最大面積；另grasp success及成功抓取條件下coverage。；30秒grasp計算上限為建議，非由679樣本推導的固定速度門檻。
- Split／資訊條件：503與176來源／用途分開；訓練也含失敗抓取；176是實驗運行，不是176獨立任務。
- 來源關係：部分毛巾來自Household Cloth Object Set，與其它cloth benchmarks資產可能重用。
- 可復用：可借真實garment多樣性與grasp/coverage分離；不宜把單次展開當完整摺衣／收納任務。
- 待核／限制：場地與初態差異無法完全消除；本庫無法只靠既有影片重跑physical grasp。

### P093　MoDeSuite（2025）

原作：https://arxiv.org/abs/2507.21796
本次PDF：https://arxiv.org/pdf/2507.21796v1
PDF SHA256：7487d599b51f5e6b76f91382e89b71c431f6314db66766625b35dda08d345dca
閱讀頁：1、3、4、5、6。兩種mobile robot、8task逐項定義、source繼承及learning評測。

- 研究類型：布料／柔性物操作；柔性物操作benchmark
- 領域：居家整理與清潔、衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：IsaacSim／PhysX；Ridgeback-Franka與Spot arm，走廊／桌面配置。
- 任務：8＝新5elastic（Place/Bend/Transport/Drag/Lift）＋3既有cloth-like（Cover/Uncover/Curtain）；需base與arm協同。
- 題數／資料：RL5獨立runs，success在20eval trials計算；非每task20個語義新任務。
- 評估方式：依task幾何位置、跨越／覆蓋與無碰撞條件報success；episode return和stability penalty另列。
- Split／資訊條件：不同機體／state/RGB輸入分開；本文無單一全庫train/test IDs總量。
- 來源關係：3cloth tasks從前作擴充mobile base control；FEM與PBD為不同材料物理，不是新生活domain。
- 可復用：可補『移動時攜帶／拖拉柔性物』而非純桌面摺布；規則包含通過障礙與穩定。
- 待核／限制：原3task來源與精確scene/config IDs需從引用30及code進一步對齊。

### P094　R2R / VLN（2017）

原作：https://arxiv.org/abs/1711.07280
本次PDF：https://arxiv.org/pdf/1711.07280v3
PDF SHA256：b7589865ee573d4753ee9e25bdc494cbbb199e6ec17d0a349091aed0fd86c420
閱讀頁：1、2、4、5、6、7。navigation graph、路徑／指令蒐集、scene split與stop成功定義。

- 研究類型：導航與家務執行；導航benchmark
- 領域：居家整理與清潔、辦公與教育
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：90個Matterport3D建築scene；panorama graph離散移動，非真輪式動力學。
- 任務：1個指令導航task family；7,189 route goals、21,567語言指令（通常每path3條）。
- 題數／資料：train14,025／val-seen1,020／val-unseen2,349／test4,173 instructions。
- 評估方式：navigation error；主success要求stop後距goal<3m；oracle stop另列。原文不要求全程遵循原path。
- Split／資訊條件：61train scenes／11val-unseen／18test；不能把全部21,567叫test。
- 來源關係：Matterport3D上游；RxR、RoboVerse、VLN-CE等重用同scene，場景數不可加總。
- 可復用：可引入route-following與語言多樣性；路徑數和導航task family是不同粒度。
- 待核／限制：下游continuous變體的可導航幾何／case過濾需要另版本。

### P095　RxR（2020）

原作：https://arxiv.org/abs/2010.07954
本次PDF：https://arxiv.org/pdf/2010.07954v1
PDF SHA256：8a964d95106ff267f934acf705a6b0be304a193f84745fe0ad55f51133d61bd8
閱讀頁：1、2、3、4、5、6、9。path採樣、90scene重用、多語註記、split與path-adherence metrics。

- 研究類型：導航與家務執行；導航benchmark
- 領域：居家整理與清潔、辦公與教育
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：同Matterport3D90個室內場景；不是比R2R又新增90。
- 任務：16,522 paths；English/Hindi/Telugu三語，同一path有多語／多描述與guide/follower traces。
- 題數／資料：126,069 instructions；path split11,089train／1,232val-seen／1,517val-unseen／2,684test。這些是path數，不能當同數instruction。
- 評估方式：PL、NE、SR、SPL、NDTW、SDTW；原作主重NDTW/SDTW以獎勵遵循指定路徑，與R2R只到終點不同。
- Split／資訊條件：沿R2R／Matterport場景split；test-standard/test-challenge隱藏；3語每語約14K paths有交集。
- 來源關係：原始scene共用R2R，path另採樣；與R2R多任務訓練的追加資料不能再算新test。
- 可復用：證明同導航family可以擴語言與過程規則；規則差異應明確保留。
- 待核／限制：各language及test子split指令ID量需manifest核。

### P096　ALFRED（2019）

原作：https://arxiv.org/abs/1912.01734
本次PDF：https://arxiv.org/pdf/1912.01734v2
PDF SHA256：84b314c06de82f5a1ff853676d391e05394a2e517986b03faadcbca325c9ee0b
閱讀頁：1、2、3、4、7、8。7task types、參數／demo／directive層級、scene及split表、success與partial goal評測。

- 研究類型：導航與家務執行；室內長流程操作
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：AI2-THOR120 rooms＝kitchen/bathroom/bedroom/living各30；不是120房屋。
- 任務：7types：pick-place、stack-place、pick-two、clean-place、heat-place、cool-place、examine-in-light；2,685 task parameter combinations。
- 題數／資料：8,055 expert episodes、概述25,743 directives；表2split為21,023／820／821／1,533／1,529（合25,726），原文存在17差異。
- 評估方式：全部goal condition成功／部分goal-condition比例；另以action length折算效率。；subgoal評測可先強制走expert歷史，不能與end-to-end成功混同。
- Split／資訊條件：108train rooms，4val-unseen，8test-unseen；seen folds是train場景子集。
- 來源關係：AI2-THOR2.0＋PDDL planner；TEACh沿同floorplans/splits，兩者場景不可重加。
- 可復用：提供家务状态变更／工具切割／熱冷清潔程序；符號動作語義不等於低階接觸控制。
- 待核／限制：25,743概述與表2合計25,726需release IDs釐清，不靜默選方便的數字。

### P097　TEACh（2021）

原作：https://arxiv.org/abs/2110.00534
本次PDF：https://arxiv.org/pdf/2110.00534v3
PDF SHA256：512d9ea49367fc5ec3559ab9b866c1aaafb015585dd2363bc7e918b20e42e40a
閱讀頁：1、2、3、4、5、6、7、9、21。TDL與12task、session→EDH、三種benchmark、全部split與success。

- 研究類型：導航與家務執行；對話協作與任務完成
- 領域：居家整理與清潔、餐飲與烹飪、協助、交接與陪伴
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：AI2-THOR；表2成功收集池覆蓋109 rooms，重用ALFRED場景與unseen split。
- 任務：12task types、438參數variants（收集池）；3端點EDH／TfD／TATC，最後一種要同時建模Commander/Follower。
- 題數／資料：正文3,047可replay sessions；表3分量合3,045。EDH表3總11,176＝5475train+608val-seen+2157val-unseen+666test-seen+2270test-unseen。
- 評估方式：EDH完成全部expected state changes為success，GC給部分分；trajectory length weighting另列。；TATC與TfD重用session母資料，不是三倍獨立任務量。
- Split／資訊條件：seen/unseen場景；train/val/test按session；舊版EDH因只保留推進任務的state changes而縮減。
- 來源關係：同AI2-THOR與ALFRED场景，語言／session新human-human收集；TDL支持量詞、階層與共享object約束。
- 可復用：對話工具、澄清、任務階層與量詞規則有可復用形式；收集成功與可重播數需分開。
- 待核／限制：本文3,047與split3,045差2；表1還留早期3,215，必須以版本manifest查明。

### P098　Habitat 2.0（2021）

原作：https://arxiv.org/abs/2106.14405
本次PDF：https://arxiv.org/pdf/2106.14405v2
PDF SHA256：92f9c30479fe4203f656c218fa228c7e5fd71f23a9821b3afa47e06dbe5ab317
閱讀頁：1、2、4、5、6、7、9、10、11、29。ReplicaCAD構造、Pick基本任務、3種HAB任務與評估假設。

- 研究類型：導航與家務執行；室內長流程操作
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：ReplicaCAD111 layouts建立於單一apartment backdrop；正文105新layout variations與原始配置分量需分清，非111獨立住宅。
- 任務：HAB3families：TidyHouse、PrepareGroceries、SetTable；另Pick基礎實驗。任務goal為object起終3D位置，不是自然語言理解。
- 題數／資料：程序clutter/goal episodes；Pick有500 unseen-layout eval樣本；技能附錄另100eval episodes，不能混作HAB全庫題數。
- 評估方式：goal成功與分階段成功；操作次數用作難度proxy；模擬速度SPS另列。
- Split／資訊條件：未見layout/object配置；抽象抓持與kinematic base控制，並非完整wheel/contact dynamics。
- 來源關係：Replica FRL apartment→ReplicaCAD、YCB clutter；Habitat3/後續rearrangement套件會重用。
- 可復用：可借home-scale長流程與open/close前後置條件；環境分量與感測先驗需精確報。
- 待核／限制：HAB每family全套eval episode IDs與111layout正式manifest仍待匯入。

### P099　HomeRobot（2023）

原作：https://arxiv.org/abs/2306.11565
本次PDF：https://arxiv.org/pdf/2306.11565v2
PDF SHA256：518b6ba6f64a2c51a1bda3b92902e6ad0d2cbf5567d6d07e93207a28155d61e3
閱讀頁：1、2、4、5、6、7、17、18、19、20、24、27。HSSD實際子集、OVMM四stage、scene/objects切分、sim/real成功定義。

- 研究類型：導航與家務執行；室內長流程操作
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：HSSD原庫200+，本文實驗只用60scenes＝38train/12val/10test；real為1個3-room apartment。
- 任務：1個OVMM family：find object→pick→find receptacle→place；129物件類別與21receptacle類，不是129/21個新任務。
- 題數／資料：2,535物件模型；sim程序產生object/start/goal cases，已讀段未給單一全庫題量。real兩baseline各20experiments。
- 評估方式：四stage全過為success、partial success作tie-break；sim Place需靜穩50steps。；sim Pick是0.8m內magic snap，real Pick要實抓；兩者判準不同。
- Split／資訊條件：未見scene及未見object instances，另seen/unseen categories；sim1250step、real300step budget。
- 來源關係：HSSD＋AI2-THOR/ABO/GSO objects，與PARTNR HSSD衍生共享環境家族。
- 可復用：可提供open-vocabulary尋物與搬運；需在共同庫標記抓持抽象層級。
- 待核／限制：HSSD不同專案的branch/scene ID對照需查；不能把HomeRobot60與PARTNR60直接算120houses。

### P101　Embodied Agent Interface（2024）

原作：https://arxiv.org/abs/2410.07166
本次PDF：https://arxiv.org/pdf/2410.07166v3
PDF SHA256：d10c7fee3594c88ff9f6a061a68b64a380a82d36c6652f3b08c42179044e2a9f
閱讀頁：1、4、5、6、7、21、89、90、102、103。4 modules完整I/O与metric、表2、BEHAVIOR100／VirtualHome標註與符號實作。

- 研究類型：導航與家務執行；符號規劃與評測介面
- 領域：居家整理與清潔、餐飲與烹飪、辦公與教育
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：VirtualHome與EvalGibson兩後端；EvalGibson為BEHAVIOR100建立的符號transition simulator，不是BEHAVIOR1K全物理執行。
- 任務：4 modules：goal interpretation、subgoal decomposition、action sequencing、transition modeling。VirtualHome表2為26task names／338instructions；BEHAVIOR100為100。
- 題數／資料：338＋100＝438 instruction instances；801/673 goals是組成標籤，平均4,164.4 goal options不是4,164題。
- 評估方式：goal／transition以logic F1；trajectory feasibility、goal satisfaction、partial goal success；PDDL planner成功另列。；模組評測其餘部分用GT／BFS／planner補齊，非端到端全系統分數；只實作LTL部分語法，globally/until尚未實作。
- Split／資訊條件：zero-shot接口評估；固定單module與pipeline分析分開。
- 來源關係：BEHAVIOR100 VR demos、RobotHow/VirtualHome；重新標註抽象／具體goal以避免無關終態污染。
- 可復用：是統一任務語言、規則及模組評測的直接前作；應避免重造G/T軸而不交代與此接口差異。
- 待核／限制：附錄稱VirtualHome30categories而表2為26names，待label清單對齊。

### P102　NavVerse（2026）

原作：https://arxiv.org/abs/2607.19695
本次PDF：https://arxiv.org/pdf/2607.19695v1
PDF SHA256：9e578a0112fb1c6b3969bc02b262c7f35fa90e3321692f5dfa0ad033fef1fc68
閱讀頁：1、2、3、4、5、6、8、12、13。200scene構造、3task、10K episodes、物理導航與metric／難度。

- 研究類型：導航與家務執行；導航benchmark
- 領域：公共場館與服務
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：100 indoor GRScenes＋50 outdoor城市＋50 indoor-outdoor組合；混合scene重用前兩組幾何，不是200獨立底層環境。
- 任務：ObjNav／PlaceNav／VLN三類；PlaceNav沒有純室內split，不能機械做3×3完整coverage。
- 題數／資料：4,027 ObjNav＋2,973 PlaceNav＋3,000VLN＝10,000episodes（全生成benchmark）；與evaluation subset量分開。
- 評估方式：SR、SPL、coverage efficiency、collision rate、obstacle distance、navigable surface ratio；Spot goal tolerance1.6m。；難度按各task自身path length的1/3、2/3分位，不是跨benchmark通用難度。
- Split／資訊條件：indoor90/10、outdoor40/10，mixed沿outdoor split；共享PID waypoint follower。
- 來源關係：GRUtopia/GRScenes＋Virtual Community城市、Google tiles、Objaverse；mixed環境需追父scene。
- 可復用：補室內到戶外的連續導航與工作用途；可用組合環境擴題，但須報重用關係。
- 待核／限制：各task evaluation split的精確case ID量與mixed scene父ID需要manifest匯入。

### P103　Follow-Bench（2025）

原作：https://arxiv.org/abs/2509.10796
本次PDF：https://arxiv.org/pdf/2509.10796v4
PDF SHA256：d0c3862a5ceea33af287b35df24c711ee5e923e829b298b2688ed9c280e18ace
閱讀頁：1、6、7、8、9、10、20。16scenario、配置表、8planners、100trials與安全/舒適metric。

- 研究類型：導航與家務執行；社交導航benchmark
- 領域：包裝、倉儲與物流、個人照護、公共場館與服務、協助、交接與陪伴
- 用途歸納：跟隨指定人是陪伴服務；原作亦明列照護、巡邏、導覽與物流的應用方向。
- 環境：CPU 2D simulator；16scenario types分target trajectories、4crowd模式、4layouts；非16個真實場所。
- 任務：1核心family＝跟隨指定人，變更跟隨角／距離、密度、狹窄通道及遮擋。
- 題數／資料：各configuration100個隨機trial；表V包含多種人數／寬度／距離，不能簡化為16×100而漏掉配置。
- 評估方式：無碰撞且重新找到target才成功；TVR、目標personal-zone時間、侵入他人空間、jerk、路徑等。；10Hz同步sim clock計jerk，wall-clock planner耗時另外量。
- Split／資訊條件：motion-planning測試假設可見人位置完美；真人主觀偏好另經real interviews，不冒充sim幾何metric。
- 來源關係：既有2D人群simulator／ORCA/SFM扩充；不是端到端camera跟人辨識benchmark。
- 可復用：補持續陪伴與社交距離規則；任務完成、安全與舒適分開比。
- 待核／限制：全部配置去重後的trial總量需按發布config列舉。

### P104　SIMPLER（2024）

原作：https://arxiv.org/abs/2405.05941
本次PDF：https://arxiv.org/pdf/2405.05941v1
PDF SHA256：6a9481f3c0fc43fa6736e5f5fc8ddb72ebf05aad7dbd0ff31721e4d6bffec9e5
閱讀頁：1、3、4、5、6、7、8、18、20。real-to-sim目標、MMRV/Pearson、兩機體場景、visual matching與主比較。

- 研究類型：穩健性、失敗與評測品質；轉移與評測有效性
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：2個real robot setups：Google Robot與WidowX/Bridge；4 robot texture版本是視覺補償，不是4個新環境。
- 任務：Google圖6四組（pick、move-near、open/close drawer、open+place）；WidowX圖7四組放置／堆疊，含grasp子項。原作按group而非唯一語義task計。
- 題數／資料：各task有專用real/sim trial安排；Octo多3policy seeds、Google4texture variants，用來降低評估方差，不作新題總量。
- 評估方式：task success；比較sim/real policy排名用Mean Maximum Rank Violation與Pearson r。；validated subset的相關性不保證所有新domain也有相同sim-real關係。
- Split／資訊條件：train on real、evaluate in sim；visual matching與variant aggregation是不同評測策略。
- 來源關係：Google/Bridge真實資料＋SAPIEN，另IsaacSim驗證；ManiSkill3等重用SIMPLER子集。
- 可復用：為模擬benchmark有效性提供比較方法；沒有真機資源時只能先做sim範圍，不能宣稱完成sim-real驗證。
- 待核／限制：每task原生trial manifest未完全匯入，不虛構統一全庫題量。

### P105　LIBERO-Plus（2025）

原作：https://arxiv.org/abs/2510.13626
本次PDF：https://arxiv.org/pdf/2510.13626v3
PDF SHA256：661de08e0ed1bb4bb4774177cac9fafa94f06b5385fa2f4107a1927b9a4aada7
閱讀頁：1、2、3、4、8、9、10、16。7擾動因素、10,030生成設定、難度分級、額外train資料與評分。

- 研究類型：穩健性、失敗與評測品質；穩健性與分布外評測
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：LIBERO-Plus改變觀測與初態條件，未改掉原任務的餐具擺放、廚房設備及收納用途。
- 環境：LIBERO场景擾動：layout、camera、robot初態、語言、light、texture、noise；不是10K新生活場景。
- 任務：7factors／21components；原作稱10,030tasks，多為原LIBERO語義任務的擾動配置。
- 題數／資料：10,030benchmark settings；額外>20K成功訓練trajectories分開。
- 評估方式：物理success／success drop，依factor平均；5級難度由4個参考模型實測accuracy分層。
- Split／資訊條件：原LIBERO訓練到擾動測試，另外有泛化資料post-training；難度依賴校準模型，不能當永久內在難度。
- 來源關係：直接衍生LIBERO；10,030不等於10,030互異goal family。
- 可復用：已有萬級評測設定的規模先例；我們若比task數必須先使用共同語義粒度。
- 待核／限制：10,030各父task、擾動config和split的逐條去重仍待manifest。

### P106　MetaWorld+（2025）

原作：https://arxiv.org/abs/2505.11289
本次PDF：https://arxiv.org/pdf/2505.11289v2
PDF SHA256：60d7c336669aaab9834d2e8a6156b410b5cfa28c0c7fe3da0b1da6881af9fc33
閱讀頁：1、3、4、5、7、16。50task原庫、reward版本修正、MT25/ML25、eval統計協定。

- 研究類型：穩健性、失敗與評測品質；穩健性與分布外評測
- 領域：居家整理與清潔、餐飲與烹飪、工藝與修繕、裝配與生產作業、休閒與運動、通用物件與機動作業
- 用途歸納：MetaWorld+保留原50項任務並修正版本和評測協定，因此沿用具體任務支持的用途。
- 環境：沿用Meta-World Sawyer task environments，非新增50不同環境。
- 任務：50原生task types；新增MT25/ML25中等規模suite及custom task sets。
- 題數／資料：multi-task每task50goal episodes；meta每goal適應10episodes後測3episodes；10訓練seed不當新task。
- 評估方式：mean success的IQM、95%CI，10seeds；v1/v2 dense reward尺度與設計不同，原文指出歷史成績不可直接混比。
- Split／資訊條件：保留MT/ML角色區別；MT25/ML25自原50選，非另外增加25語義任務。
- 來源關係：Meta-World版本整理與標準化；最應避免把同benchmark歷史版本當獨立資料源。
- 可復用：提供版本治理與可比較統計方法；對避免舊網頁數字混淆尤其重要。
- 待核／限制：本庫歷史pilot的Meta-World commit及reward版本須維持標記，不套用新版baseline成績。

### P107　COLOSSEUM（2024）

原作：https://arxiv.org/abs/2402.08191
本次PDF：https://arxiv.org/pdf/2402.08191v2
PDF SHA256：ae71956329278bc299039eaa133876b4b132772081418a26c733c4810169edf2
閱讀頁：1、4、5、6、7、9、18。20task選取、14擾動、適用性、235test sets及real鏡像。

- 研究類型：穩健性、失敗與評測品質；穩健性與分布外評測
- 領域：居家整理與清潔、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：RLBench/PyRep場景，外觀、camera、質量與friction擾動；不是20,371獨立房屋。
- 任務：20基本操作tasks、14perturbation factors；原文20,371 unique task instances為生成配置規模。
- 題數／資料：正式235test sets×25episodes＝5,875episodes／model；train20tasks×100demos＝2,000。real另4task鏡像。
- 評估方式：task-averaged success與相對無擾動success drop；不適用某factor的task不進該factor分母。
- Split／資訊條件：train不加擾動但保留RLBench原variation；eval固定variation再隨機pose；主結果1train seed+1eval seed。
- 來源關係：RLBench子集擴充，YCB distractors；20×14全笛卡兒積不合法（無receiver／compound shape等限制）。
- 可復用：強調只有適用且可執行的擾動才計為case；支持擴規則但不能盲乘。
- 待核／限制：20,371生成配置與235固定test set之逐ID對應需manifest匯入。

### P108　RoboArena（2025）

原作：https://arxiv.org/abs/2506.18123
本次PDF：https://arxiv.org/pdf/2506.18123v2
PDF SHA256：0f793633ba5767b6e93f01056dcd5c3357dabcaf70844cd0a157a364fa843698
閱讀頁：1、4、5、6、7、8。分散式A/B協定、偏好排名模型、DROID平台與完整實驗分母。

- 研究類型：穩健性、失敗與評測品質；分散式真實評測
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：7個學術機構使用DROID平台，evaluators自行選scene/task；沒有固定封閉的環境總數。
- 任務：開放指令集合，涵蓋數百task instructions；不是固定17task，17是外部窄基準比較。
- 題數／資料：超過600次pairwise評估；為建立oracle ranking，額外跑其餘5policies，全計4,284 policy rollouts。不能稱4,284獨立題。
- 評估方式：双盲pairwise preference＋progress；擴充Bradley–Terry估計policy排名與task effects，另產生有影片證據的質性報告。
- Split／資訊條件：連續累積開放評測；沒有一般train/test固定題庫；同一次A/B需相同task條件。
- 來源關係：DROID共同硬體/資料；RoboReward重用其真實成功／失敗rollouts。與RobotArena∞是不同工作。
- 可復用：可作開放題庫／偏好排名的評測方法參考；規模必須標明是rollouts還是task。
- 待核／限制：精確去重scene與語義task總量需要evaluation database，不從hundreds推成確定數。

### P109　REFLECT / RoboFail（2023）

原作：https://arxiv.org/abs/2306.15724
本次PDF：https://arxiv.org/pdf/2306.15724v4
PDF SHA256：6018e97d117acefc2b31a0df616b29eb479b95035bf47ea2fd5882a6631ae6c3
閱讀頁：1、2、4、5、6、7。資料規模與錯誤taxonomy、說明／定位／修正三種評測及GT資訊。

- 研究類型：穩健性、失敗與評測品質；錯誤辨識與程序恢復
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：AI2-THOR simulation與UR5e toy kitchen；sim用GT物件／狀態辨識，real靠感知。
- 任務：10simulation tasks、11real tasks；規劃失敗與執行失敗兩大群。
- 題數／資料：100sim failure cases（每task10）＋30real failure demonstrations；沒有把正常train影片混入失敗case總量。
- 評估方式：Exp：人工判說明正確且有用；Loc：時間落在標註區間；Co-plan：执行修正後goal state成功。；real結果表主要報Exp/Loc，不能把sim約80% Co-plan當real自主恢復率。
- Split／資訊條件：方法zero-shot failure reasoning；GT perception與action primitives降低sim難度。
- 來源關係：sim手動注入failures，real由teleop模擬失敗政策；並非全為自主機器人自然犯錯。
- 可復用：可借規劃與執行失敗taxonomy，明確分『指出錯誤』『提出修正』『真的恢復』。
- 待核／限制：sim/real語義task重疊未去重；完整raw failure時間／場景ID仍待匯入。

### P110　AHA（2024）

原作：https://arxiv.org/abs/2410.00371
本次PDF：https://arxiv.org/pdf/2410.00371v1
PDF SHA256：d647c7bff1ccb2d0ae805bab761177aba8cd50d81d0418ca174e9ae97054791b
閱讀頁：1、2、4、5、6、7、8。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：穩健性、失敗與評測品質；錯誤辨識與程序恢復
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：RLBench、ManiSkill與realRoboFail；非新增三套物理環境。
- 任務：7failure modes的Yes/No判斷＋原因解釋；識別失敗不等同真正恢復。
- 題數／資料：49KtrainingfailureQA；test11K（10未見RLBench tasks），ManiSkill-Fail130pairs（4tasks），realRoboFail7tasks。
- 評估方式：binary success labelaccuracy、ROUGE-L、cosinesimilarity、LLM fuzzy match。
- Split／資訊條件：RLBench train/test taskdisjoint，跨sim與real另測；額外VQA/LVIS訓練資料不可算failurecases。
- 來源關係：FailGen改keyframes/gripper動作合成失敗；RoboFail重用。
- 可復用：可大量增加失敗規則cases，同時用跨來源/真實子集驗證而不冒稱新增語義工作。
- 待核／限制：keyframe產生failurelabels是生成機制標籤，和視覺可觀測真因未必完全相同。

### P111　RoboReward（2026）

原作：https://arxiv.org/abs/2601.00675
本次PDF：https://arxiv.org/pdf/2601.00675v2
PDF SHA256：601200a96f8e30137cd3166d6d330ff9ff2ceb0de6a4c43949d808e6e9c0d29a
閱讀頁：1、2、3、6、7、8、9、22、27。OXE/RoboArena來源、counterfactual/clipping生成、5級rubric、完整split與人工驗證附錄。

- 研究類型：穩健性、失敗與評測品質；獎勵與完成度評測
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：多OXE來源與RoboArena實拍；14embodiments是機體種類，非14生活環境。
- 任務：給task description＋rollout video預測1–5progress；反事實重寫指令和截短影片擴增負例，不自動新增實體失敗任務。
- 題數／資料：45,072train／6,232val／2,831人類驗證test；合54,135 episode-reward pairs。RoboArena test子集1,000。
- 評估方式：主metric progress label MAE，總體採group-wise平均；不同子資料來源分列，另以RL下游驗證。
- Split／資訊條件：按original task description分組互斥；同一影片的counterfactual/clips需跟父episode分組，字串互斥不證明語義互斥。
- 來源關係：OXE成功demo及RoboArena自然成功／失敗；生成標籤是弱監督，test另人工逐例確認。
- 可復用：是有效擴充任務／評分規則的重要來源；應區分重標問題與新物理軌跡。
- 待核／限制：跨OXE子集的母episode重複與semantic task去重仍需ID核。

### P112　EgoOops（2024）

原作：https://arxiv.org/abs/2410.05343
本次PDF：https://arxiv.org/pdf/2410.05343v3
PDF SHA256：fcf3b48c7dea45c46f41391de07a874453ef74d8762655f4104e34d8dfa9bb23
閱讀頁：1、3、4、6、7、15。5程序完整清單、6種執行錯誤、50影片、cross-validation與三端點。

- 研究類型：穩健性、失敗與評測品質；錯誤辨識與程序恢復
- 領域：工藝與修繕、裝配與生產作業、實驗室操作
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：固定坐姿工作站，原物件／工具／程序文字位置固定；4名學生佩戴ego camera。
- 任務：5task：電路、混色、離子反應、積木、紙板工藝；6執行錯誤類型，未涵蓋所有順序／漏步錯誤。
- 題數／資料：50videos、538segments、95execution mistakes；每fold30train/10val/10test，5-fold。
- 評估方式：端到端step alignment＋mistake/correction mAP@tIoU0.1/0.2/0.3；GT segments分類是oracle子問題。；alignment另F1/precision/recall/MoF。
- Split／資訊條件：每fold各task一正常一错误test影片；作者稱group-kfold控制worker，精確ID仍需查。
- 來源關係：自錄多領域程序；一半刻意錯、一半盡量正常但也有自然失誤。
- 可復用：補料理以外程序錯誤；規則由文字指定，不能僅憑視覺常識判定。
- 待核／限制：4名参与者與5-fold worker grouping的精確分配需manifest查。

### P113　REPAIR-Bench（2026）

原作：https://arxiv.org/abs/2606.29937
本次PDF：https://arxiv.org/pdf/2606.29937v1
PDF SHA256：c63b11a21f43bad4c9a0709836fb1f9ca225602ea2192d55be74dd59ea385cfd
閱讀頁：1、2、3、4、5、6。RFM-HRI來源、排除樣本、3端點、各split、時間與偏好評分。

- 研究類型：穩健性、失敗與評測品質；錯誤辨識與程序恢復
- 領域：醫療與手術支援、協助、交接與陪伴
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：lab與hospital的crash-cart guidance互動；不是完整醫療操作或手術任務。
- 任務：3端點：失敗時刻、失敗類型、使用者偏好恢復策略；4誘發failure conditions＋success。
- 題數／資料：來源214trials/41人；排30後正式analysis184trials/38人。不能將214全部寫成已用評測樣本。
- 評估方式：視覺failure classification F1等；localization秒級absolute error與tIoU F1。；recovery用Hit/precision/recall/F1@k，GT是人的偏好，未證明機器人執行恢復成功。
- Split／資訊條件：visual tasks約75/25 participant分組；recovery文本60/20/20隨機split，不能宣稱三端點都participant-disjoint。visual任务刻意不給語音。
- 來源關係：RFM-HRI舊資料新增標註与preference；failure offset以機器人錯誤回應結束作標記，不是物理抓取失敗時刻。
- 可復用：補user-centered interaction recovery；必須和物理任務恢復及其成功證據分開。
- 待核／限制：前處理階數/cutoff不同段落敘述不一，重現需code確認；source214與41×5亦不完全一致。

### P114　RobotArena infinity（2025）

原作：https://arxiv.org/abs/2510.23571
本次PDF：https://arxiv.org/pdf/2510.23571v3
PDF SHA256：d08b1e9db69b3e2efbb9e51be4044370272927d0d53c97807368bfdb42892ba9
閱讀頁：1、3、5、6、7、8、9、25。real-to-sim來源、VLM評分與human BT ranking、BridgeSim規模及real驗證範圍。

- 研究類型：穩健性、失敗與評測品質；轉移與評測有效性
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：BridgeSim70環境；另DROIDSim、RH20TSim。總量僅概述hundreds，不能用70代稱三套全庫。
- 任務：由真實demo生成task＋digital twin，再擾動初態/texture；未給共同語義task類別總數。
- 題數／資料：BridgeSim上8,749pairwise comparisons；是對policy影片的偏好標註，不是8,749不同task。
- 評估方式：Gemini結合video＋privileged sim states評progress，取最後30%frames平均；human pairwise BT ranking另列。；real/sim相關驗證只展示1個carrot-to-plate任務的3policy，不能外推全庫已校準。
- Split／資訊條件：Bridge/DROID/RH20T來源與policy訓練來源分in/out；同場景pairwise保持相同初態。
- 來源關係：真實Bridge、DROID、RH20T衍生；不同於RoboArena在真機直接分散評估。
- 可復用：提供多來源real-to-sim與偏好評分途徑；要區分生成場景、物理成功checker和VLM judge。
- 待核／限制：DROIDSim／RH20TSim精確場景ID量與跨來源等價未匯入。

### P115　RoboMME-Interference（2026）

原作：https://arxiv.org/abs/2606.22338
本次PDF：https://arxiv.org/pdf/2606.22338v3
PDF SHA256：95baa91cdd2a1d6c0791a31627a8daee1d9e9ff70d58d60e76f53e4e3d142c40
閱讀頁：1、2、3、4。9/16task選擇、history干擾規則、完整系統網格與50episode評測。

- 研究類型：穩健性、失敗與評測品質；長期記憶與生活助理
- 領域：裝配與生產作業、通用物件與機動作業
- 用途歸納：依示範選物、搬方塊、重畫路徑與插栓，歸入通用作業復現與装配基礎作業。
- 環境：沿RoboMME配置，新增跨session history；不是新物理環境。
- 任務：16原task中選9個有可分離demo的families：4程序、3object、2spatial memory；其餘7不適用。
- 題數／資料：9×50＝450基底test episodes；history條件no-history及k=0/1/3/7；11memory systems＋無memory baseline造成25,200核心rollouts，非同量獨立題。
- 評估方式：成功率與Wilson95%CI；隨干擾增加的退化曲線；retrieval改進另列。
- Split／資訊條件：不重訓released checkpoint，僅變history；每distractor32stored frames且來自不同family，避免混入相互矛盾資訊。
- 來源關係：RoboMME的9-family子集加history規則；非全新9task。
- 可復用：展示規則擴充可增加可評条件而不改語義task數；記憶干擾可做本庫共通延伸。
- 待核／限制：原始RoboMME benchmark須獨立登記檢查；跨history條件query IDs應保留父關係。

### P116　OopsieVerse（2026）

原作：https://arxiv.org/abs/2606.31993
本次PDF：https://arxiv.org/pdf/2606.31993v1
PDF SHA256：cbef5a184d84ac4490de9dbbfde077c3b9a7905c1d6bc581e739540b078af3d2
閱讀頁：1、2、4、5、6、7。DamageSim三類傷害、32實作/21task設計、demo及safe-success評分。

- 研究類型：穩健性、失敗與評測品質；安全與約束評測
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：OmniGibson與RoboCasa/Robosuite兩後端；熱／流體傷害只在支援相應物理的後端可用。
- 任務：32task instantiations對應21unique task designs；不是32不同語義任務。
- 題數／資料：5示範task共90demonstrations，health feedback有/無各半；IL每task30rollouts。
- 評估方式：task completion與safe completion分開；後者需goal成功且所有tracked object health維持>95。；damage由力、溫度、液體接觸的參數模型計算，不能等同已校準的真實損害機率。
- Split／資訊條件：不同collection/curation/RL/VLA設定分開；5task IL子集不代表全32皆同程度實驗。
- 來源關係：BEHAVIOR1K與RoboCasa任務加damage觀測／reward／termination；共享goal與backend instantiations。
- 可復用：為同一goal增加保護物件／低破壞條件的直接先例，規則差異應獨立可查。
- 待核／限制：damage threshold跨材料／跨後端的物理標定程度須另驗證。

### P123　WatchAct（2026）

原作：https://arxiv.org/abs/2606.26443
本次PDF：https://arxiv.org/pdf/2606.26443v1
PDF SHA256：42a137d5b56c9e1dd7d421cba16f8f06fe42cace6418e7338136400df3e7954c
閱讀頁：1、2、3、4、5、6、8、14、15。14task完整taxonomy、3K個案、video-sim配對、4項驗證與plan/physical/end-to-end協定。

- 研究類型：人類觀測到機器人轉移；人類示範與技能轉移
- 領域：居家整理與清潔、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：LIBERO配對真實桌面影片；11桌面regions＋6container regions只是命名區域，非17個環境。
- 任務：14task scenarios歸4認知domains；event、procedure、implicit intent、episodic，含模仿、反轉、恢復舊位置、續作、修錯、條件分支。
- 題數／資料：3,000 video-language-simulator bundles；policy實驗每task10trials，與全部3K的plan reasoning範圍分開。
- 評估方式：Plan SR在symbolic executor；Task SR在物理simulation；PR完成子goal比例。；順序唯一task直接比oracle，允多解的task比symbolic終態；oracle-plan execution與integrated pipeline分開。
- Split／資訊條件：LIBERO-finetuned policies轉到paired tasks；新物件/指令in/out-domain另列，固定每command300steps。
- 來源關係：LIBERO擴新物件／predicate；LLM先產spec再照spec拍人類video，不是從任意網路video全自動轉robot。
- 可復用：最接近『影片→任務規格→可執行場景』的前作；還受限於Pick/Place/Open/Close，排除pour/wipe/cut/stir。
- 待核／限制：physical評測每task10trials中task指類型或instance的manifest需核，不先乘成3萬或宣稱3K全測。

### P124　RoboReel（2026）

原作：https://arxiv.org/abs/2609.08209
本次PDF：https://arxiv.org/pdf/2609.08209v2
PDF SHA256：4f0b2629e1e663390e169e7ae24496406246958dbec7bb20f3973de31a9e34ff
閱讀頁：1、2、3、4、5、6、7、9、21、24、25、27、29。10task、4suites、配對蒐集、附錄完整統計、success predicate和eval banks。

- 研究類型：人類觀測到機器人轉移；人類示範與技能轉移
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：1個實際桌面rig與ManiSkill3/SAPIEN配對場景，4人類camera views；calibration與distractors另分setting。
- 任務：10task（推/抓方塊、抽屜、鍋蓋、烤麵包機、碗盤、籃子、玩具收納、堆杯）；4suites ND/WD/ED/PD，不是40語義task。
- 題數／資料：正文2,000ND/WD human demos；附錄含PD共3,000human demos＝12,000視角mp4，另2,000robot trajectories。每結果cell3runs×20＝60rollouts。
- 評估方式：simulation goal predicates；比如drawer只需關至少一半、toaster80%行程，不能與更嚴格同名task直接比。；表格報3runs mean/SEM；SeeDo僅5項支援task，N/A不是0。
- Split／資訊條件：每task-condition100 human demos取80train/20eval；oracle-filtered initial-state banks固定初態。
- 來源關係：PartNet-Mobility＋SAM3D real twin；explicit/latent/keypoint三種LfO代表比較，借不同既有policy。正文稱接受後發布，素材取得待核。
- 可復用：可借真實human→sim配對及同條件多方法對比；不應把camera/views檔案量作新增題量。
- 待核／限制：100seed與每bank300entry在同段並列，需原生manifest釐清最終bank量；發布可得性尚未驗證。

### P127　BridgeData V2（2023）

原作：https://arxiv.org/abs/2308.12952
本次PDF：https://arxiv.org/pdf/2308.12952v3
PDF SHA256：aa5fdac48bf9122b22f88150d45575cb0685f2a2f761ca6fc570be743022819b
閱讀頁：1、3、4、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：機器人資料與通用策略；真實操作benchmark
- 領域：居家整理與清潔、餐飲與烹飪、衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：24environments，含7toy kitchens及tabletops/sinks/laundrysetups，4環境類別。
- 任務：13skills；同skill換object可成不同原作task，未報全庫正規化task總數。
- 題數／資料：60,096trajectories＝50,365expert+9,731scripted；主task每method10trials。
- 評估方式：tasksuccess；goalimage與languageconditions分別比較。
- Split／資訊條件：seen/unseenobject/environment/otherinstitution；RT1input解析度與history較大須註記。
- 來源關係：BridgeData原版擴充，後被OXE/OpenVLA/Octo重用。
- 可復用：補家電、表面、衣物與顆粒工具操作；保留human/scripteddemo品質類型。
- 待核／限制：13skill不是13全部task；不同原作method觀測預算未完全一致。

### P128　RoboNet（2019）

原作：https://arxiv.org/abs/1910.11215
本次PDF：https://arxiv.org/pdf/1910.11215v2
PDF SHA256：01a03705dfb76192445b8c09fa3e85d67a1d9165b2c00df3672cfd10cc66052a
閱讀頁：1、3、4、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：機器人資料與通用策略；跨資料集整合與評測方法
- 領域：通用物件與機動作業
- 用途歸納：核心目標是把未知物件推或抓放到指定位置，歸入跨場域物件搬移作業。
- 環境：4lab environments、113camera configurations、7arenatypes等不同環境層級。
- 任務：主要objectrelocation，可用推或抓放；manyrobots不增加相同數量goal families。
- 題數／資料：15Mframes、約162Ktrajectories；7platforms，Table1caption稱6arms有文字差異。
- 評估方式：endgoal distance與operator判斷是否覆蓋goal；作者明言不同experiments不可直接比難度。
- Split／資訊條件：held-out robot或view再fine-tune300–400targettrajectories；不叫完全zero-shotrobottransfer。
- 來源關係：多institution資料與existingrobotcorpora整合；同物理trajectory可能多view。
- 可復用：重要早期整合前作；以哪種目標、哪種資訊與哪個分母比較，比合併大小更關鍵。
- 待核／限制：release-version軌跡精確數及scene去重待manifest；不從15Mframes推testcases。

### P129　RH20T（2023）

原作：https://arxiv.org/abs/2307.00595
本次PDF：https://arxiv.org/pdf/2307.00595
PDF SHA256：6156500a1340a2e976681f0f8deea8ce493fb4af227d8a5b2696cb3c384bb755
閱讀頁：1、2、3、4、5、6。147task來源、7硬體配置、pairing階層、110K數據与實際few-shot實驗。

- 研究類型：機器人資料與通用策略；人類示範與技能轉移
- 領域：居家整理與清潔、裝配與生產作業、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：7robot configurations、>50table covers；covers不是不同場景layout。
- 任務：147tasks＝48選自RLBench＋29MetaWorld＋70自定義；42verbs是skill標籤，不是147完全獨立新設計。
- 題數／資料：>110K robot sequences與等量human sequences；hierarchy可配出數百萬pairs但不是同量獨立影片。本文ACT主實驗只在1個block-to-weight任務，每configuration20trials。
- 評估方式：人類收集時0–9quality、成功/失敗約10:1；ACT實驗分reach/grasp/place success，60秒上限。
- Split／資訊條件：新環境含新camera/tablecover/robot；pretrain335同task＋195相近task，fine-tune75demo起，再縮小資料。
- 來源關係：RLBench與MetaWorld任務規格被實拍移植；新實拍数据是新素材，但goal定義有上游來源。
- 可復用：是從前作選task再擴新task、兼有人類影片與robot軌跡的重要前例。
- 待核／限制：paired影片之精確實例對應與跨機體可比性需原生metadata匯入。；DROID原作表I將RH20T依unique multi-view trajectories記為約13K，與RH20T原作110K口徑不同；保留兩種出處，未完成原始manifest去重。

### P141　HoloAssist（2023）

原作：https://arxiv.org/abs/2309.17024
本次PDF：https://arxiv.org/pdf/2309.17024v1
PDF SHA256：af4fda7dcdcc0e5c9e4e4649f19bea3da6b3afe52e7a83d1adc8e7a79c011421
閱讀頁：1、3、4、5、6、7、8、9。20task來源、sessions/標籤、mistake/intervention/forecasting、split與指標。

- 研究類型：輔助與協作；對話協作與任務完成
- 領域：餐飲與烹飪、辦公與教育、工藝與修繕、裝配與生產作業、協助、交接與陪伴
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：HoloLens2 wearer＋遠端instructor；16物件種類，非16場景。
- 任務：20程序；414coarse action classes；mistake detection、intervention type、3D手預測及action recognition。
- 題數／資料：2,221sessions、166小時、222人／350pairs；1,545train、213val、463test。錯誤/介入表只評10%全資料子集。
- 評估方式：動作top-1/5；錯誤F-score與precision/recall；3種intervention分類。；手軌跡看過去3秒、預測0.5/1/1.5秒，用MPJPE厘米；只保留正確action。
- Split／資訊條件：每task按session70/10/20，並非保證參與者或instructor/performer pair全互斥。
- 來源關係：新錄human-human互動；字幕／動作／介入共用session，非多個獨立資料庫。
- 可復用：提供人類教學、介入時機、程序錯誤與短期手預測；是協作型多模態來源。
- 待核／限制：fine action label總數和各endpoint精確可評IDs仍需manifest；不從coarse414推整套任務數。

### P142　Habitat 3.0（2023）

原作：https://arxiv.org/abs/2310.13724
本次PDF：https://arxiv.org/pdf/2310.13724v1
PDF SHA256：6383018901acbf7677050585da9a30707437cf7119def797be500f33a68021af
閱讀頁：1、2、5、6、7、8、20、25、26。avatar/HITL、2任務、59scene split、合作人口與metrics。

- 研究類型：輔助與協作；對話協作與任務完成
- 領域：居家整理與清潔、協助、交接與陪伴
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：HSSD211源scene中的59實驗scene＝37train/12val/10test；12base avatars不是12場景。
- 任務：2families：social navigation找/跟人；social rearrangement兩代理搬2物件。
- 題數／資料：附錄按scene抽train1000、val100、test15；即37Ktrain、1,200val、150test基底episodes，協作partners另作條件。
- 評估方式：導航Finding Success/SPS/Following Rate/Collision Rate；rearrangement SR與relative efficiency對human-alone比較。
- Split／資訊條件：未見scene＋new partner population；oracle/learned low-level skills分開。導航主設定有持續humanoid GPS，不是只憑RGB找人。
- 來源關係：HSSD、AMASS、SMPL-X、Habitat底座；human avatar使用kinematic attach等簡化，與real人類動力不同。
- 可復用：是可比較human/robot角色與partner泛化的重要底座，不能再當全新場景資產。
- 待核／限制：全來源211scenes和59實验子集不能合併計數；不同HSSD版本與HomeRobot/PARTNR需scene ID對齐。

### P144　CAP / EgoGym（2026）

原作：https://arxiv.org/abs/2602.09017
本次PDF：https://arxiv.org/pdf/2602.09017v1
PDF SHA256：b0428cf26ad882127851059de2fafebb3ae164e38f631b9d941ca8ac0ebbeda4
閱讀頁：1、2、4、5、6、7、8、11。資料、接觸prompt、EgoGym設計、3task真實與跨機體eval、tool chaining。

- 研究類型：人類觀測到機器人轉移；模擬平台與任務套件
- 領域：居家整理與清潔、辦公與教育
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：資料報424environments＝Pick289/Open87/Close48，為作者收集配置口徑；EgoGym是程序生成MuJoCo套件。
- 任務：3utility task families：Pick、Open、Close；不因接觸座標不同自動變新語義任務。
- 題數／資料：20,365human-tool demonstrations、23.1小時；real Pick250trials，Open/Close每checkpoint100trials；EgoGym有915Objaverse object pool。
- 評估方式：task success；oracle human contact prompt、VLM contact prompt、retry設定分開。
- Split／資訊條件：real新scene/object zero-shot；sim用作training loop model selection，不能當獨立未見test。
- 來源關係：Objaverse assets＋iPhone手持工具資料；CAP可作高階模型tool calls的低階utility。
- 可復用：支持multimodal tool use與robot skills組合，但示範用contact anchors、主eval有oracle條件，應明列。
- 待核／限制：424是否跨Pick/Open/Close具有同址重用需ID核；EgoGym完整eval bank量待code。

### P145　NIABench（2026）

原作：https://arxiv.org/abs/2605.01368
本次PDF：https://arxiv.org/pdf/2605.01368v1
PDF SHA256：add5ffdd033bc8c450f79b317f31c0df3735d7a4789a9e8f833e3dbcab4f5b12
閱讀頁：1、2、3、4、5、6。2K來源、7test tasks、非中斷規則、text-only狀態與3指標。

- 研究類型：輔助與協作；對話協作與任務完成
- 領域：居家整理與清潔、餐飲與烹飪、辦公與教育、協助、交接與陪伴
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：AI2-THOR四room categories；4是類型，非精確四個scene IDs。主model採文字state，沒有raw visual perception。
- 任務：7test tasks：cut tomato、toast bread、watch TV、work、sleep、study、shower；2,000訓練script episodes，human主程序不允許被中断。
- 題數／資料：2K corpus再分train/val；7個代表evaluation episodes；75%一個oracle assistance、20%兩個、5%無需協助。
- 評估方式：SelectionAcc比oracle step-action pair；HumanStepSaved減少的人類primitive steps；SuccessAcc查最終sim state。
- Split／資訊條件：2K按scene/oracle數分train/val，7held-out另設；real只2小型驗證任務。
- 來源關係：AI2-THOR高階動作adapter；800atomic actions是候選動作詞彙，不是800已實作工作任務。
- 可復用：可加不打斷人類、適時協助與no-op合法答案等規則；不能宣稱2K都為held-out test。
- 待核／限制：7代表情境內是否另有多個隨機initial seeds及確切case量需code核。

### P146　DexH2R（2025）

原作：https://arxiv.org/abs/2506.23152
本次PDF：https://arxiv.org/pdf/2506.23152v3
PDF SHA256：c48a1c58f5201ee324223c711cba95a429ea7446bc43e4d59f452e829eda1709
閱讀頁：1、2、3、4、5、6、7。data/rig、handover動態定義、完整split、pose與trajectory指標。

- 研究類型：輔助與協作；靈巧手操作benchmark
- 領域：協助、交接與陪伴
- 用途歸納：核心就是把人手中的物件交給機器人，歸入協助與交接用途。
- 環境：UR10e＋ShadowHand固定capture setup，18視角（含2wrist ego），不是18環境。
- 任務：1核心human→robot handover family；56物件／39人，包含動態接近與終態抓握。
- 題數／資料：4,282trials、456Kframes、79,911成功grasp poses；2,888train／591val／803test trajectories。
- 評估方式：grasp succ1/succ6外力穩定、penetration、diversity；approach success、trajectory length、inference frames、safety率。
- Split／資訊條件：test含新object/newsubject、newobject/seensubject、seenobject/newsubject三群；不是803獨立任務語義。
- 來源關係：真實teleoperation human-object-robot互動，grasp模型另用DexGraspNet預訓練。
- 可復用：補人機交接、動態手型／接觸安全，區分pose、trajectory及物理handover完成。
- 待核／限制：每test子群細分ID與final pose對母trajectory的多對一關係待manifest。

### P147　HRIBench（2026）

原作：https://arxiv.org/abs/2607.13056
本次PDF：https://arxiv.org/pdf/2607.13056v1
PDF SHA256：d779bea84ddd0cbca254797e628b09dbf95118efa086cfe333dd6156a4a2ded2
閱讀頁：1、3、4、5、6、7。role scripts、13tasks、786過濾池、50/10真實split与coordination metrics。

- 研究類型：輔助與協作；對話協作與任務完成
- 領域：協助、交接與陪伴
- 用途歸納：按人的指令、時機和動作完成協作，涵蓋交接、同步、讓行及受干預後續作。
- 環境：Franka simulation結合合成人類骨架/trajectory；候選由2K生成並篩。
- 任務：13 role-conditioned tasks；Instructor／Collaborator／Intruder三角色。
- 題數／資料：2,000候選中786通過；正文實驗每task50adaptation+10held-out，因此650adaptation／130held-out。摘要『>650 evaluation episodes』不等於主實測test量。
- 評估方式：CSR/time/idle、temporal sync/latency/order、collision/contact/contradiction/disruption；partial安全summary需按適用component。
- Split／資訊條件：固定policy無關Intruder擾動時序；real3task各10trials，只是adaptation驗證。
- 來源關係：生成scripts/human motion並sim驗證；兩個同名HRIBench不得合成同一來源或版本。
- 可復用：加入等待、同步、角色及干預恢復規則；数据候選通過不等於全部是test。
- 待核／限制：786與13×60=780剩6條用途未明，需manifest；摘要650eval與正文130held-out須分列。

### P148　Assistax（2025）

原作：https://arxiv.org/abs/2507.21638
本次PDF：https://arxiv.org/pdf/2507.21638v3
PDF SHA256：53953a170eca350244258f44b0b043e960f2bcece29e1074e805ab251bc95547
閱讀頁：1、3、4、5、6、7、8、9。5assistive tasks、robot/human控制、preferences、630partner池與MARL/AHT評測。

- 研究類型：輔助與協作；協作控制benchmark
- 領域：個人照護、協助、交接與陪伴
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：MJX/JAX五種assistive配置，使用簡化rigid geometry；不是臨床或柔性皮膚物理驗證。
- 任務：Scratch、Tooth Brushing、Feeding、Bed Bathing、Arm Assist；force/speed/contact偏好另外參數化。
- 題數／資料：每task630pretrained humanoids；AHT以5train/625unseen partners；MARL每曲線16seeds與64eval episodes。
- 評估方式：task/preference return分開，跨任務min-max normalized mean、bootstrap95%CI；新partner泛化。
- Split／資訊條件：partner-disjoint；挑5個高speed preference為train是刻意困難設定；精確episode/context數不等於625新task。
- 來源關係：Assistive Gym inspired任務，Brax humanoid與MJX；原始Assistive Gym需補為上游來源。
- 可復用：補個人照護、人類偏好及協作適應；沒有固定統一題庫上限。
- 待核／限制：不同partner/preferences的物理對應與真实使用者有效性未等同验证。

### P151　H2R-Bench（2026）

原作：https://arxiv.org/abs/2608.13049
本次PDF：https://arxiv.org/pdf/2608.13049v1
PDF SHA256：ec3fb6258fea92eda2ba4240561afd8f307606a133031b63ad12d666306af015
閱讀頁：1、2、3、4、5、6、11、14。source-relative定義、120→240cases、6家族、native interface與五metric。

- 研究類型：世界模型與預測表示；世界模型與影片生成評測
- 領域：衣物與洗護、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：EgoDex test來源影片，沒有配對可執行robot simulator環境。
- 任務：6物理變化families：rigid、mechanism、insertion、deformable、bulk、surface；目標2種embodiment。
- 題數／資料：120段5秒source clips×2embodiments＝240transfer cases；每family20source。11generators的輸出影片數不是新題數。
- 評估方式：M1goal/M2events/M3contact/M4embodiment由3個MLLM按0–4rubric評；M5為video quality。；每metric25sampled frames；H2RCore加權contact與embodiment共60%，屬影片證據評分，非實際控制成功。
- Split／資訊條件：EgoDex test衍生；video-conditioned與frame-conditioned介面分組，不能不控制輸入資訊比較。
- 來源關係：EgoDex來源；與H2RBench human-transfer及RoboWM-Bench不同任務，不能因名稱相似合併。
- 可復用：可加入human→robot影片轉移端點；應作世界模型章，與可執行操作題數分開。
- 待核／限制：contact的影片可見正確不能保證力／深度／可達性，仍缺物理execution證據。

### P152　RoboWM-Bench（2026）

原作：https://arxiv.org/abs/2604.19092
本次PDF：https://arxiv.org/pdf/2604.19092v2
PDF SHA256：4450ceffa72850511da6c91b3ce6f73bc070d372104dc8f60ce6fbf8f84ed566
閱讀頁：1、3、4、5、6、7、14、15。video→action兩路、task suite、主表與sim附錄、10初態與execution成功。

- 研究類型：世界模型與預測表示；世界模型與影片生成評測
- 領域：餐飲與烹飪、衣物與洗護、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：LeHome/IsaacSim原生與real-to-sim桌面；固定camera、隨機物件初態。
- 任務：主表8human-hand及8robot-task條件，附錄另6simulation-native條件；含同名重用，不直接加成22語義task。
- 題數／資料：每task10個共同initial configurations；Cosmos-finetune每task50trajectories是額外訓練。bimanual附錄又為另條件。
- 評估方式：generated video經HaMeR retargeting或IDM轉action，再進simulation；key nodes全通過且達goal才Task SR，另Step SR。
- Split／資訊條件：固定初態／種子跨model；human與robot影片使用不同action extraction pipeline，pipeline誤差須分開分析。
- 來源關係：LeHome底座與real reconstruction，PAI-Bench作同影片視覺分數對照。
- 可復用：提供生成影片到物理可執行性的橋梁，但需把影片模型和action extractor責任拆解。
- 待核／限制：全部task條件與語義去重清單需release manifest；retargeting/IDM失誤會影響world model分數。

### P164　The Imitator Game（2026）

原作：https://arxiv.org/abs/2608.22301
本次PDF：https://arxiv.org/pdf/2608.22301v1
PDF SHA256：f38c19c22603063351fd35a218cc5a1477609c973c0a79cbe972a2bb78f01e1b
閱讀頁：1、4、5、6、7、8、20。L0–L3保留/變更條件、IG-10K規模、六domains、sim/real及Arena協定。

- 研究類型：人類觀測到機器人轉移；人類示範與技能轉移
- 領域：居家整理與清潔、餐飲與烹飪、包裝、倉儲與物流、零售與購物、實驗室操作、醫療與手術支援
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：200+ paired task-scene variants；同human clip可對多level robot場景，非全新independent demonstration。
- 任務：50+base tasks，6生活/工作domains（分量12+7+17+4+6+7=53）；實驗10tasks（5seen+5unseen）×4levels。
- 題數／資料：11,720real paired episodes＋10Ksim pairs（sim重用human clip）；每task-level sim10trials、real5trials。15/30/45task訓練套件相互包含。
- 評估方式：sim SR與ordered subgoal SR；人類SUCCESS/PARTIAL/FAIL、0–10imitation quality、pairwise preference。；L0動作近似、L1布局改變、L2物件替代、L3功能替代；level是demo-execution pair屬性，不是task固定難度。
- Split／資訊條件：sim/real分開訓練與比較；same domain/setting/task/level/episode才做A/B，少數task不定義L3。
- 來源關係：ManiSkill3、手工waypoints、VR真機pairs；與RH20T等比較，但多level共用源human clip。
- 可復用：是意圖／功能替代及多域human-robot資料近鄰；我們須納入其6用途群與可替代規則。
- 待核／限制：53分域與表2『50 tasks』的版本口徑須manifest確認；不可把4levels機械乘所有task。

### P165　LIBERO-Recover（2026）

原作：https://arxiv.org/abs/2609.05178
本次PDF：https://arxiv.org/pdf/2609.05178v3
PDF SHA256：ee23bf31934cc0e262b4b30458be149df135ec3695c866939c482c0b55fe414a
閱讀頁：1、2、3、4、5、6、9。failure對normal variation的區分、2178scenario生成、恢復資料與RSR/RD/RC。

- 研究類型：穩健性、失敗與評測品質；錯誤辨識與程序恢復
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：LIBERO自然rollout失敗的state snapshots；不是2178不同room layouts。
- 任務：130上游tasks、4recovery levels；LIBERO100再拆90/10報告，不能另加兩suite。
- 題數／資料：2,178recovery scenarios；413training failure scenes有3,184human recovery trajectories，訓練使用場景排出最終eval。
- 評估方式：Recovery Success Rate完成原goal；Recovery Degradation比較failure前後；RC=1−task-level success率標準差。；RC公式實際是跨task變異，不完全等同文中所說同task不同failure的穩定性。
- Split／資訊條件：六policy產failure，Qwen定位/分類；自然failure分布不平衡。eval每task10trials、520step，需固定scenario/perturbation解讀。
- 來源關係：LIBERO延伸；失敗條件要execution-induced且需改plan但仍可恢復，不能把任何位置變化都叫failure。
- 可復用：可引入真實policy失敗狀態而非純人工擾動；恢復題需要前史與可恢復證據。
- 待核／限制：recoverability對每scenario的完整驗證證據、2178與training排除先後、eval task詞義需manifest查。

### P166　SafeVLA-Bench（2026）

原作：https://arxiv.org/abs/2606.00773
本次PDF：https://arxiv.org/pdf/2606.00773v2
PDF SHA256：ecb59f541415c25bcb45263b2c7058d15a124829c8dab6d7b5eac681f36c1f4a
閱讀頁：1、3、4、5、6、34、46。STL庫、8scored families、適用性registry、58tasks/27entries及指標定義。

- 研究類型：穩健性、失敗與評測品質；安全與約束評測
- 領域：居家整理與清潔、餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：LIBERO＋RoboCasa365兩host，事後instrumentation保留原生觀測/動作/初態/success。
- 任務：58tasks＝LIBERO四10-task suites＋RoboCasa365 atomic-seen18tasks；8safety families歸scene/object/robot三group。
- 題數／資料：LIBERO每model-suite200episodes（10×20），RC每task50；24distinct policies、27policy-host entries不是27benchmarks。
- 評估方式：native SR、Safety、Success-but-Unsafe、Violation Severity Index；VSI是spec-normalized worst violation depth。；有意義且signals可用才套STL，額外diagnostics不影響Safety；代理threshold不是物理安全認證。
- Split／資訊條件：固定seeds配對；RC policies有兩個独立seed groups，跨組unpaired；不跨host直接排總榜。
- 來源關係：對既有LIBERO/RC trajectories加规则評分；不是新生成58個目標任務。
- 可復用：本庫規則擴充應借其適用性registry與success/safety分離，而不是每task強乘所有評估方式。
- 待核／限制：缺人類近距離、實際spill/thermal等signals；composite全程排除某clause可能漏掉部分phase。

### P167　DexGarmentLab（2025）

原作：https://arxiv.org/abs/2505.11032
本次PDF：https://arxiv.org/pdf/2505.11032v3
PDF SHA256：447ce546d76be47536883a64aac1e9fc7ea1f214433bc6915d9acce2eab57f65
閱讀頁：1、2、4、5、6、7、8、9、10、18、20、32。15task場景、物理抓持修正、14實測task、100demo/50episode、real驗證。

- 研究類型：布料／柔性物操作；柔性物操作benchmark
- 領域：衣物與洗護、個人照護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：雙UR10e＋ShadowHand，15task scene設定；>2500garments/8類不是2500不同task。
- 任務：15定義含fling/fold/hang/wear/store；主simulation實驗14task（wear glove未在主表），不能報全15同程度測完。
- 題數／資料：每實測task100generated demonstrations；每task50episodes與3seeds；real4task各3garments×5初態＝15trials。
- 評估方式：task-specific成功與mean/std；demo生成成功率和policy成功率分開。；以friction/adhesion取代GarmentLab attach blocks，兩者同名摺衣控制難度並不相同。
- Split／資訊條件：garment形狀/初態/位置變化；文中2%test training data是模型離線切分，不等於50episode物理eval。
- 來源關係：ClothesNet與UniGarmentManip/GarmentLab相關資產和方法；更改抓持物理具實質差異。
- 可復用：靈巧雙手與穿衣／收納廣度的重要來源；應追實際物理規則差異。
- 待核／限制：各task成功predicate與garment ID split仍需完整config清單，不能只以模型shape庫算coverage。

### P168　HRIBench (perception, 2025)（2025）

原作：https://arxiv.org/abs/2506.20566
本次PDF：https://arxiv.org/pdf/2506.20566v1
PDF SHA256：7148bb0244bccd22b8b8050d609fa6304f05059d5224f76470c5b87616428af7
閱讀頁：1、2、3、4、5。5domain來源、1000VQA、非語言線索、自錄/復用與accuracy-latency表。

- 研究類型：理解、推理與規劃；人體與互動感知評測
- 領域：社交與溝通、協助、交接與陪伴
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Kuri/Quori自錄非語言互動＋既有公開資料；5domains是能力群，非5物理環境。
- 任務：nonverbal、verbal intent、human-robot-object relation、social navigation、person identification五種。
- 題數／資料：每domain200VQA，總1000；overall accuracy/latency排除person identification，因此總體比較用其餘800題範圍。
- 評估方式：逐題accuracy與latency秒；unsupported/refused identity標N/A，不能填0後和其他模型無條件平均。
- Split／資訊條件：主為VLM zero-shot評測；各domain人類baseline由不同expert完成。
- 來源關係：HandMeThat加視覺、CoMaD、MuSoHu、YouTube影片與自錄gestures；不是2026interaction-centric HRIBench。
- 可復用：提供HRI感知與即時性題型；選合宜導航路徑的VQA不等於實體導航執行。
- 待核／限制：不同question形式random accuracy不同，不能全統一25%random；上游素材和case IDs未匯入。

### P169　X2Real（2026）

原作：https://arxiv.org/abs/2609.27449
本次PDF：https://arxiv.org/pdf/2609.27449v1
PDF SHA256：5cff92f0d0a008824b9299b9e8f9259404e6177fd54a55c4d4eede0aff18f521
閱讀頁：1、3、4、5、6、13、14、23、24、27、28、29。44task架構、training/eval分離、資產/DSL、DAG metrics、desktop/mobile與sim-real驗證。

- 研究類型：一般操作 benchmark；模擬操作benchmark
- 領域：居家整理與清潔、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Mana/IsaacLab場景；多embodiments与green-booth訓練配置，appearance/task/embodiment分別擾動。
- 任務：44simulation tasks／10能力維度；含3mobile tasks與3challenge tasks，能力數不是生活domain數。
- 題數／資料：近300小時訓練軌跡；desktop各300demo、mobile各1,000、3challenging總>20K trajectories；mobile eval每task每ID/OOD40episodes。
- 評估方式：DAG依赖達成、無failure且sink nodes完成才success；latched node進度加權10分；層級macro平均避免大類壟斷。；sim-real本文overall r為success0.74/progress0.84，精密task更弱，不用一般task子集高r外推全部。
- Split／資訊條件：green-booth demonstrations與OOD背景/task/robot配置分離；模型不取得frame-level subtask標籤。
- 來源關係：Mana基於IsaacLab/Arena，資產來自多3D庫與AIG3D；不等同建立完整新生活任務ontology。
- 可復用：統一runtime、DAG過程與收集/評測分離可借；主張泛化應按能力與實測subset支持。
- 待核／限制：desktop完整eval case IDs與3challenge是否納同一overall分母需release設定核。

### P170　MotionForge（2026）

原作：https://arxiv.org/abs/2609.25689
本次PDF：https://arxiv.org/pdf/2609.25689v1
PDF SHA256：26bf90c839b269529d60ec9d7b97df9c98670c0297089faf96f14d7e2bfc8c1a
閱讀頁：1、2、3、4、5、6、7。40semantic families、motion taxonomy、實時協定、生成validation及ID/OOD50seeds。

- 研究類型：一般操作 benchmark；動態操作benchmark
- 領域：裝配與生產作業、包裝、倉儲與物流
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：4scene families：Factory Conveyor、Circular Motion、Home Tabletop、Embodied Interaction；5K背景variation非5Klayouts。
- 任務：40semantic tasks、11motion patterns；17long/23short，僅改速度的variants合併為同family。
- 題數／資料：約20K產生demo中選每task50＝2Ktrain；每task每ID/OOD condition50固定seeds，7policies另算rollouts。
- 評估方式：macro task success；policy推論時環境仍以120Hz進行，latency對成功有實際影響。；LH依8秒+2skills或20秒門檻定義，作者明示長不一定更難。
- Split／資訊條件：object/background/light/speed單factor與joint OOD；保留不支援最高speed的task例外。
- 來源關係：generated scenes＋共用oracle skills；task質檢要求oracle>50%為生成合格條件，不是learning-policy成績。
- 可復用：補傳送帶、拋接與動態速度規則；可區分場景生成量與語義task量。
- 待核／限制：不同硬體的native inference latency不可無條件比較，需固定evaluation hardware/runtime。

### P171　Bench2Dex（2026）

原作：https://arxiv.org/abs/2609.15726
本次PDF：https://arxiv.org/pdf/2609.15726v1
PDF SHA256：f70ca3ecb4dd8fc9a1acc6410a0bd4e370203ca65331b3fcc76209996fb8ed03
閱讀頁：1、2、3、4、5、6、7、8、10。12hands、26task-embodiment settings、tactile界面、stable success及4channel協定。

- 研究類型：一般操作 benchmark；靈巧手操作benchmark
- 領域：裝配與生產作業、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：IsaacLab bimanual配置；12hand morphologies、6views，無獨立房屋總數。
- 任務：26task-embodiment settings，不能先乘12手型為312已完成tasks。
- 題數／資料：約1.3Kteleop demonstrations；4policy×26settings×4channels×50rollouts＝20,800evaluation executions。每policy每channel1,300。
- 評估方式：terminal predicate需穩持預設0.5s；LSCR記錄依賴合法的階段；success time只在成功episode量。；baseline只用RGB/關節，觸覺資料支援不等於已證實tactile policy收益；觸覺為幾何depth proxy。
- Split／資訊條件：None/Equi/Inv對齊anchor，Full獨立抽樣，不假定逐case困難單調。
- 來源關係：已有hand meshes＋統一tactile registry；未對齊真實觸覺hardware。
- 可復用：可借跨手型／觸覺訊號規格與穩定判分；不要把支援的感測軸當實評完成量。
- 待核／限制：26設定的unique semantic task去重與tactile-conditioned baseline尚不等同完成。

### P172　LabUtopia（2025）

原作：https://arxiv.org/abs/2505.22634
本次PDF：https://arxiv.org/pdf/2505.22634v2
PDF SHA256：b0b27a506f9ec028871b09e93a5a3aead74e382739b65fa5092af90ab062e862
閱讀頁：1、3、4、5、6、7、8、9、10。LabSim/LabScene、scene與儀器來源、5levels、success協定及實驗範圍。

- 研究類型：一般操作 benchmark；專業場域操作benchmark
- 領域：實驗室操作
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：約100expert-reviewed lab scene assets，另程序填入儀器；物件類別/scene數不得相加。
- 任務：摘要30distinct tasks、結論>30，§4另稱>50；5levels從atomic到mobile，但level3主要是generalization條件，並非全是新語義task。
- 題數／資料：各level有demo/rollout實驗，本文已讀段未報统一case總量；表2列10atomic及6短流程，long流程另3例。
- 評估方式：task完成後goal tolerance需維持2秒；success rate與long流程stage分開。；chemical engine由知識庫＋LLM推state變化，不等同第一原理化學物理。
- Split／資訊條件：novel shape/material/layout設定；全在simulation，real transfer留未來。
- 來源關係：designer scene assets、PubChem資料與IsaacSim；procedure模板需逐task核，不從約100场景×50tasks直接乘題量。
- 可復用：補實驗室用途與流程；其階層是設計/泛化混合，需用共同task粒度對齊。
- 待核／限制：最終task registry究竟30或>50，以及scene/instrument各精確IDs，需code版本確認。

### P173　LabDex（2026）

原作：https://arxiv.org/abs/2608.18618
本次PDF：https://arxiv.org/pdf/2608.18618v1
PDF SHA256：0d4be91ff766826af94f01245c225e27a15cfb88fae60183c9393f1af17ee41c
閱讀頁：1、3、4、5、6、7、11、12、13。層級資料、real/sim平台、atomic/composite/workflow完整表及success。

- 研究類型：一般操作 benchmark；專業場域操作benchmark
- 領域：實驗室操作
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：FR3/XHand實際工作站與配對simulation；3camera views非3場景。
- 任務：概述7atomic categories、30+atomic、10+composite、1workflow；實驗明列26atomic、表3九composite、1七步workflow。附錄定義composite10項。
- 題數／資料：概述8K+demo/1M+steps；real預設每task200train、sim50；每task每model50eval trials。
- 評估方式：goal穩定2秒；atomic SR，composite/workflow全成功、各atomic成功與平均已完成步數。
- Split／資訊條件：初態在訓練範圍內隨機；novel objects/distractors另實驗，非主eval全部OOD。
- 來源關係：real teleop關鍵姿態映射sim，長流程可切atomic；不能把完整軌跡與各段全部當独立新樣本。
- 可復用：是同SOP分不同粒度與執行平台的例子；原子step、composite、workflow必須保留父子關係。
- 待核／限制：30+/10+概要與26/10完整清單之差異需最終manifest確認；real/sim資料量需分開。

### P174　Labimus（2026）

原作：https://arxiv.org/abs/2606.31037
本次PDF：https://arxiv.org/pdf/2606.31037v2
PDF SHA256：103d1eb5ee800d0306734bab26f9242f067cff584fb84c9929cd3ea3869e7e3a
閱讀頁：1、2、5、6、9、10、11、12、14。SOP→DSL、6atomic/7步流程、3評分tier、4conditions與v0驗證邊界。

- 研究類型：一般操作 benchmark；專業場域操作benchmark
- 領域：實驗室操作
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Tianyi humanoid於fume-hood工作站；digital twin與procedural layouts，>30functional assets。
- 任務：6atomic operations＋1個7step solid-weighing workflow；Tier2重評原task精度，不能算兩個新操作。
- 題數／資料：v0只實測4atomic＋1precision條件；每task-condition50episodes×3seeds＝150trials；其餘與整個Tier3仍未實驗。
- 評估方式：success、precision pass、conditional precision among successes、weighted step progress；S−P量成功與精度差距。；SOP的mass/position門檻是這個模擬規格，不代表已完成真實實驗室有效性驗證。
- Split／資訊條件：100teleop demos/task，標準test布局已有分布移動，另light/texture/combined；3×4是設計矩陣，不是v0全部實測。
- 來源關係：ArtVIP資產＋IsaacSim；SOP解析會排除無physical effect的純觀察/記錄步，故完整科學程序仍有缺口。
- 可復用：可借SOP權重、數量精度及conditional metric；要如實標示設計完整度與實驗完成度。
- 待核／限制：未完成tool pickup/scoop-weigh/Tier3驗證；real-world validation明列未來。

### P175　Pipette（2026）

原作：https://arxiv.org/abs/2606.12936
本次PDF：https://arxiv.org/pdf/2606.12936v3
PDF SHA256：72ad55814d9958242cd534f45f540f9bcd86bcd2bfbf21beaa2278e6c2bb93a3
閱讀頁：1、2、3、4、5、6、7、11、12、17。12tasks全表、資產庫、structured task註冊、augmentation验证與100episode協定。

- 研究類型：一般操作 benchmark；專業場域操作benchmark
- 領域：實驗室操作
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：IsaacSim/IsaacLab場景；3robots、12tools、26equipment、55consumables、9instruments為資產分量。
- 任務：12wet-lab tasks＝4sample/culture、4lid/hatch、4placement；pipette-to-petri positioning不等同已量測真正移液量。
- 題數／資料：每task30human train demos＋成功篩選augmented；每model每task100eval episodes，即單資料設定1,200。
- 評估方式：依task pose/joint/geometric thresholds及持續時間判success；macro task SR。；語言parser只草擬配置，prim/threshold/evaluator仍需人驗證；success-verified augmentation不是新task。
- Split／資訊條件：3models×raw/augmented條件，Panda為主但flask-shaker用AgileX；同task內固定機體比較。
- 來源關係：existing/generated USD assets、Hunyuan；replay重新渲染並同步state/action，不只是改像素。
- 可復用：可補biomedical wet-lab器材用途與scene/task登記；須區分設備操作與完成真正生物實驗。
- 待核／限制：all-asset唯一ID與各task primitives的實際精度需原生配置；某lid為virtual button觸發，不能當直接靈巧開蓋。

### P176　AutoBio（2025）

原作：https://arxiv.org/abs/2505.14030
本次PDF：https://arxiv.org/pdf/2505.14030v3
PDF SHA256：987d557fe26642e96a1d4c9b3021c3d373717d4a5bc3f9eae48b5bc9de84df91
閱讀頁：1、4、5、6、7、8。特殊儀器physics/render、16task與9實測subset、100episode與mixed metric。

- 研究類型：一般操作 benchmark；專業場域操作benchmark
- 領域：實驗室操作
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：MuJoCo/Blender，single/dual-arm工作站；Aloha及UR5e不同end-effectors。
- 任務：16定義分3difficulty levels；實驗每level3項，共9tasks，非全部16。
- 題數／資料：9tasks各100demo＝900train、792K+frames；每task100eval episodes、3runs。
- 評估方式：大多binary success；thermal mixer panel用relative progress，平均表不全是success percentage。
- Split／資訊條件：20/100demo資料規模比較；held-out初態參數泛化；render兩版本共享軌跡。
- 來源關係：實驗室asset digitization；quasi-static liquid不模擬波/倒水，DexHand主要只控制thumb作簡化gripper。
- 可復用：補螺紋、旋鈕、顯示面板與精度規則；光學外觀逼真不能替代完整材料動力學。
- 待核／限制：16task的全部IDs与模型可用support需最終code核；不要把9task成績外推全16。

### P177　H2RBench（human transfer）（2026）

原作：https://arxiv.org/abs/2609.24778
本次PDF：https://arxiv.org/pdf/2609.24778v2
PDF SHA256：dd841fb3a72307c335d2c7268ac813f8209a448dd2242d6e49db90da7a0169d1
閱讀頁：1、4、5、6、7、17。4task全表、fixed robot/human scaling、real-to-sim、90rollout及transfer metrics。

- 研究類型：人類觀測到機器人轉移；人類示範與技能轉移
- 領域：裝配與生產作業、通用物件與機動作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：4個real-to-sim task環境，PolaRiS/Marble/IsaacLab，real human由第三人稱multi-view錄製。
- 任務：4families：mug-to-plate、bowl stacking、donut insertion、sequential blocks-to-box。
- 題數／資料：robot demo budgets40/100/100/100；human上限100/300/300/300；每method/task90randomized rollouts across3seeds。
- 評估方式：final/mean-stage SR；human增益用Δlogit；sim/real分別訓練policy，再以r/ρ/MMRV比排名。
- Split／資訊條件：fixed robot data、只增加human demos；sim與real是不同pipeline驗證，不是同一policy直接sim2real。
- 來源關係：PolaRiS、TRELLIS、GELLO、四種既有H2R方法；與human-only預訓練資料庫不同。
- 可復用：提供人類資料規模增益的受控比較，無需靠多拿robot data製造規模優勢。
- 待核／限制：各human/robot pair是否一對一不應由demo預算推定；完整IDs需原生release。

### P178　RoboRecover（2026）

原作：https://arxiv.org/abs/2609.28952
本次PDF：https://arxiv.org/pdf/2609.28952v1
PDF SHA256：63986a4660ca344bb479e10ce0aa378f0c5b8a2ce86623d7725c5474f9a51faf
閱讀頁：1、3、4、5、6、13。scenario構造、replay驗證、filter、train/test及RSR；未逐行重現程式。

- 研究類型：穩健性、失敗與評測品質；失敗與恢復benchmark
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：RoboTwin和LIBERO兩個既有模擬後端，透過action prefix重播取得失敗狀態。
- 任務：原任務上的恢復情境；4階段×4偏差類型只有9個有資料的測試組，不能算16個完整任務家族。
- 題數／資料：2,000 recovery scenarios；兩個後端各800train/200test，合計1,600/400。訓練與測試task names有重疊。
- 評估方式：Overall RSR以scenario平均；9組macro另報。reference policies×5回合形成20次篩選，只留10–90%可恢復率，難度依篩選模型而定。；重播驗證位置差<2mm、末5幀SSIM>0.99；策略從恢復點初始化，不能讀取前綴歷史。
- Split／資訊條件：每後端800/200；同task不同scenario可跨split，不宣稱語義task完全未見。
- 來源關係：RoboTwin與LIBERO原任務；natural、action-perturbed與human-constructed三種失敗構造。
- 可復用：可擴充既有task的恢復規則，但增加的是恢復cases；不自動增加生活domain或原始目標數。
- 待核／限制：每個被測policy對每scenario的重複次數需核最終執行manifest；篩選成功率不可當新policy成績。

### P179　REBOOT（2026）

原作：https://arxiv.org/abs/2609.22591
本次PDF：https://arxiv.org/pdf/2609.22591v1
PDF SHA256：1f5401dfe2a8209a83cb96780a43fbfa0938f8a743eb8285be793fbdd60cf6f5
閱讀頁：1、3、4、5、6、7、8。assembly清單、精度層級、expert/recovery資料、初態與實驗協定。

- 研究類型：穩健性、失敗與評測品質；精密組裝與恢復benchmark
- 領域：裝配與生產作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：真實雙臂WidowX/Trossen工作站；NIST Assembly Task Board #1。
- 任務：表2為9物件×安裝/移除＝18tasks；精度、對稱性及5操作phase是task屬性。
- 題數／資料：18×(60 expert+60 recovery)＝2,160 demonstrations。§protocol寫每task/policy20rollouts，主分析卻用15×18×3＝810，保留差異。
- 評估方式：逐task物理完成率，另按clearance、symmetry、phase及failure分析；初始物件3–6cm範圍變化，goal board固定。
- Split／資訊條件：expert/recovery及模型設定受控比較；recovery demonstrations刻意重現先前觀察到的policy失敗。
- 來源關係：沿用標準assembly board；9物件不是9獨立工作環境。
- 可復用：補精密插接、對稱性與failure phase；組裝和拆解可保留相反目標關係。
- 待核／限制：p7的10 connector types與表2的9物件、20與15rollouts需要release核對；failure清單是否含slip也有版本差異。

### P180　SafeManip（2026）

原作：https://arxiv.org/abs/2605.12386
本次PDF：https://arxiv.org/pdf/2605.12386v3
PDF SHA256：561f1135594da0aca29135e76d5abec42f8cac6a946d0f92c6380b1c213488fc
閱讀頁：1、4、5、6、14、15。8類/10模板、ManipVerse、事件監測、90host tasks及各policy協定。

- 研究類型：穩健性、失敗與評測品質；安全與過程規則benchmark
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：RoboCasa365及LIBERO；主RoboCasa多task實驗在pretraining scenes，target-scene實驗另列。
- 任務：50 RoboCasa+40 LIBERO＝90 host task entries；8 safety categories、10 LTLf templates，只綁定適用task。
- 題數／資料：每policy/task50episodes，RoboCasa單設定2,500、LIBERO單設定2,000；不同訓練variant不是新題。
- 評估方式：native SR；每trigger violation V/N與unsafe exposure U/N，分母是觸發事件，非episode數。恢復後monitor可重新啟動。；LIBERO只有部分規則適用；支援10模板不代表每task實測10種違規。
- Split／資訊條件：不同host/checkpoint/target設定分開，不能把pretrain-scene與target-scene結果直接比。
- 來源關係：重用RoboCasa365/LIBERO並增加ManipVerse predicate與DFA監測；和SafeVLA是不同評測規則。
- 可復用：任務聯集之外，另存task可適用的規則；安全規則數和語義task數各有自己的分母。
- 待核／限制：資料hours與原RoboCasa365文章版本有差異；需固定release，不能反改原作數值。

### P182　SoftVTBench（2026）

原作：https://arxiv.org/abs/2608.18701
本次PDF：https://arxiv.org/pdf/2608.18701v1
PDF SHA256：1f353c40268ba3a98d5a2f51892e92c042f89ea87c7ccbe49c10c3ce956fe827
閱讀頁：1、3、5、6、7、8、9、13。40setting、rigid twins、ID/OOD抽樣、FEM evaluator與DSR。

- 研究類型：布料／柔性物操作；柔性物與觸覺操作benchmark
- 領域：餐飲與烹飪、通用物件與機動作業
- 用途歸納：歸納為易損物取放的通用作業；烘焙品形狀物件的放置情境另標餐飲處理方向。
- 環境：IsaacSim/IsaacLab/TacEx；10軟物件＋10對應rigid twins，>50props是assets。
- 任務：4suites各10task settings＝40；主要skill固定pick-and-place，物件/位置變化不等於40個獨立動作家族。
- 題數／資料：4,000 expert demonstrations；ID每suite500＝2,000episodes。OOD每soft suite/config900，兩suite共1,800；9個單factor條件不是完整交叉乘積。
- 評估方式：Task SR另報；DSR要求完成task且全程peak deformation≤τ，τ由穩定抓持90th percentile預先校準。FEM states僅給evaluator。
- Split／資訊條件：held-out初態；OOD light/mass/Young modulus各3級、單factor控制。以同seed/初態作對照。
- 來源關係：LIBERO風格spatial layouts與matchedrigid assets；touch rendering是模擬訊號。
- 可復用：同task加入材料保護規則的清楚範例；不能用不動來獲取低形變高分。
- 待核／限制：τ是benchmark容忍度而非材料真實損壞點；continuous/binary gripper設定要控制。

### P183　WireCraft（2026）

原作：https://arxiv.org/abs/2606.18097
本次PDF：https://arxiv.org/pdf/2606.18097v1
PDF SHA256：7f2bbb231c2ff416c001d7c06e6efc0d68691404f48ed4e22afde76e1ff48e9a
閱讀頁：1、2、3、4、5、6、7、23、25。三類DLO tasks、兩種physics、robot/data流程、success與real對照。

- 研究類型：布料／柔性物操作；線材操作benchmark
- 領域：裝配與生產作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：IsaacLab/IsaacSim；chain或FEM wire、UR5/Franka/Trossen三robot；可生成配置，無固定環境總數。
- 任務：3families：connector insertion、clip routing、channel seating；insertion選4connector shapes，其他代表場景仍有限。
- 題數／資料：script、RL、sim teleop、real資料；已讀協定未報全庫固定cases。real Ethernet每metric/setting10rollouts。
- 評估方式：reach為held plug距socket≤2cm，insert另要求真正插入；channel>80%wire length入槽。；最佳checkpoint依eval reach挑選，屬best-observed成績；不可假稱獨立validation selection。
- Split／資訊條件：7種real/sim資料mixtures以同40K checkpoint比較；額外65K結果不納主公平比較。
- 來源關係：同一3family經不同physics/embodiment重現；不可把backend數相乘當新語義task。
- 可復用：補線材穿引、插接與保持槽內的幾何判分，標示物理近似與場景覆蓋邊界。
- 待核／限制：文章寫接受後release，未據此宣稱目前資產已取得；全庫demo/case manifest待查。

### P184　DLO-Lab（2026）

原作：https://arxiv.org/abs/2606.04206
本次PDF：https://arxiv.org/pdf/2606.04206v1
PDF SHA256：91128b16d310632077dd23caa908483ba75b8851a77808b98368fbce1dcea0b0
閱讀頁：1、2、3、4、5、6、7、18、19。10tasks、differentiable physics、演算法資訊條件、success appendix。

- 研究類型：布料／柔性物操作；線材操作與物理benchmark
- 領域：裝配與生產作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Taichi/Genesis的rod與rigid/MPM coupling；近點kinematic抓持簡化，不是完整摩擦抓持。
- 任務：10tasks：8固定horizon與2長流程Letter Art/Wiring Ring；主要實驗state-based，不全是視覺策略。
- 題數／資料：main optimization/RL比較3seeds、預算內最高return。附錄RL每task15trajectories，GD單一optimized，CMA-ES選best checkpoint的top15。
- 評估方式：return與goal success；RL/GD/CMA-ES的資訊、樣本挑選與動力學梯度存取不同，不能視為統一closed-loop protocol。
- Split／資訊條件：主比較沒有一套統一held-out visual split；VLM長流程與SmolVLA4task子集另列。
- 來源關係：物理模組及task設計；letter/rope shapes是幾何目標，非完整日常領域。
- 可復用：可借線材task定義，但做all-in-one比較需要先統一觀測、重置、預算與selection。
- 待核／限制：需release IDs才能建立所有randomized cases；不同algorithm native evaluation不可直接相加。

### P185　RGBench（2025）

原作：https://arxiv.org/abs/2511.06434
本次PDF：https://arxiv.org/pdf/2511.06434v2
PDF SHA256：abc60e4860b3f9e166eeb0391fbf21186ec162cf7ffa413ed321ba8851b61970
閱讀頁：1、2、3、4、5、6、13、15。garment來源、三primitive、real/sim pair、distance及performance benchmarking。

- 研究類型：布料／柔性物操作；柔性物模擬器評測
- 領域：衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：配對真實dual-Piper/Jaka工作站與garment simulation；direct-vertex與robot-URDF modes分開。
- 任務：3manipulation primitives：Grasp/Fling/Fold；9garment types的real GT比較，主表是其中子集。
- 題數／資料：6,000+garment assets＝4,000+industry＋2,000+ClothesNet；非6,000eval tasks。已讀段落未報全部paired trajectory數。
- 評估方式：真實/模擬點雲的Chamfer與Hausdorff L1，r2s/s2r分開；runtime/memory/mesh vertices另測simulation engine。
- Split／資訊條件：人工配對動作及材料/形狀參數；主要評測simulation fidelity，不是policy完成率。
- 來源關係：ClothesNet重用；BCM外部驗證不是新獨立資料源。
- 可復用：補benchmark的模擬有效性檢驗；這個評分層與policy task success有不同目的。
- 待核／限制：全部paired trajectory IDs及industry assets再分發範圍需release核；不要用mesh數充題數。

### P186　BiFold（2025）

原作：https://arxiv.org/abs/2501.16458
本次PDF：https://arxiv.org/pdf/2501.16458v2
PDF SHA256：f80ff8748e8d36c77c1f3decfdff8b86e43da9909071a194e963c876c3ce56f3
閱讀頁：1、3、4。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：布料／柔性物操作；柔性物操作benchmark
- 領域：衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：VR-Folding/CLOTH3D重渲染，SoftGym；真實RGB-D衣物觀測。
- 任務：language-guided single/bimanual folding；新方向/位置規則与instructionparaphrase分開。
- 題數／資料：近4KVRdemos分成約7Kactions、>1Kunique prompts；90/10sample split。
- 評估方式：singlearm以meanvertexerror<0.0125m判success；bimanual另用image metrics，不默認相同判分。
- Split／資訊條件：先flattenedcloth；H=3history支援指令歧義，未證明所有sample分割已按parenttrajectory群聚。
- 來源關係：VR-Folding既有demos＋CLOTH3Dtextures、新增語言與actionparsing；不是全部新physical demonstrations。
- 可復用：補指定摺法、手別與歷史依賴；語言改寫不自動算新task。
- 待核／限制：部分只有真實影像推action展示，完整realautonomous成績分母需原始實驗核。

### P188　DRAPER（2024）

原作：https://arxiv.org/abs/2409.15159
本次PDF：https://arxiv.org/pdf/2409.15159v2
PDF SHA256：82f9a63cec8b5a6595ee60eff3f5f7d00bfb25d91cfd2fbe557897633d230632
閱讀頁：1、4、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：布料／柔性物操作；柔性物操作benchmark
- 領域：衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：RealAdapt Towels改SoftGym grasp近似；Franka與UR3e對照，camera/gripper差異顯式處理。
- 任務：flattening及3種foldpatterns：allcornersinward、corners-edgeinward、diagonal-cross。
- 題數／資料：flatteningtrain2Ktrajectories，foldtrain1K；UR3eablation每setting10trials。
- 評估方式：realflattening NC>95%且20steps內；simulation>99%/30steps；fold用IoU/proxy並承認自遮擋限制。
- Split／資訊條件：materials/size/camera/platform泛化；各policy保持相近trainingbudget，非直接沿用原bestscore。
- 來源關係：既有四controller在共同deploymentframework；RealAdapt是grasping/physics規則衍生環境。
- 可復用：這類工作正是all-in-one需借鑑的共同執行/判分控制，而非只搬tasknames。
- 待核／限制：real與sim門檻不同不能混算同一SR；多層抓取和tweezerhardware要入taskinterface。

### P191　ClothesNet（2023）

原作：https://arxiv.org/abs/2308.09987
本次PDF：https://arxiv.org/pdf/2308.09987v1
PDF SHA256：bdbcb57fbe8831c335e596f96e984f928bbd504a8bdd7e0be8ec0bcb191f02c9
閱讀頁：1、2、4、6、7、8。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：布料／柔性物操作；柔性物資料與感知評測
- 領域：衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：約4,400garment meshes/11categories；ClothesNetM3,051可用subset，mesh不是環境。
- 任務：分類、boundarysegmentation、keypoints三感知端點；simfold直接控制vertices，dressing/hanging多為可支援用途。
- 題數／資料：3Dclassification1,984train/496testmeshes；2D2,455meshes渲染9,820images再80/20。
- 評估方式：classificationaccuracy、segmentationmIoU、keypoint品質；simfoldnegativevertexdistance，非完整robotgraspcontrol。
- Split／資訊條件：2D按images切80/20，未在已讀段保證same-mesh views不跨split；3D子集量和3051全集不同。
- 來源關係：CGTrader等mesh整理，後被RGBench/GarmentLab等重用。
- 可復用：補garment資產/語义標籤，清楚區分perceptionvalidation與可交互環境。
- 待核／限制：資產種類不等於全部執行任務已驗證；不能把4400meshes稱4400robotcases。

### P192　Phys-Liquid（2025）

原作：https://arxiv.org/abs/2511.11077
本次PDF：https://arxiv.org/pdf/2511.11077v1
PDF SHA256：827b09bcc3b8968cc32b21f332b5b31286c3784578fc04a00435cb0dd6b6700b
閱讀頁：1、2、3、4、5、6、11。渲染組成、100sequences、90/10切分、reconstruction與real驗證。

- 研究類型：布料／柔性物操作；液體感知benchmark
- 領域：實驗室操作
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Blender/Mantaflow的5lab scenes、20containers、8lights、5colors、6orthographic views。
- 任務：單/多視角液體形狀與體積重建，未直接評robot pouring控制。
- 題數／資料：100simulation sequences×81timesteps＝8,100液體meshes；97,200images含RGB和mask兩種，不能全叫獨立RGB題。90/10sequence split。
- 評估方式：2D IoU、3D CD/Volume IoU/F-score、dimension RMSE、scale MAPE；部分baseline只比50張random test images。
- Split／資訊條件：以整條temporal sequence切90/10，避免相鄰frames跨split；real 10containers驗證不等於10固定interaction tasks。
- 來源關係：simulation-generated感知資料；不同視角與mask共享同一物理狀態。
- 可復用：可作液體觀測模組與量測參考；仍需另建可執行倒液任務及物理終態判分。
- 待核／限制：p4文字Three scenes與Lab1–Lab5衝突，以Table1和資料組成5為據；完整real case IDs未報。

### P193　GRIP（2025）

原作：https://arxiv.org/abs/2503.05020
本次PDF：https://arxiv.org/pdf/2503.05020v2
PDF SHA256：04cf205cc12587bbc6680049d1eaa00b17736f5efde4581b6e2043a79bd684a5
閱讀頁：1、3、4、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：布料／柔性物操作；柔性物與抓取benchmark
- 領域：通用物件與機動作業
- 用途歸納：產生穩定抓握並預測物件受力，歸入通用抓取與易損物處理作業。
- 環境：IPC平行physics；UMIsoftgripper/LEAHand；800singleobjects，800bimanual含400重用，union1200。
- 任務：grasp synthesis/validation與stressprediction；single/bimanual不同graspconditions。
- 題數／資料：100,000grasp poses（概要）；stresssubset8bowls+8mugs，每類6train/2test；非100K不同tasks。
- 評估方式：sixdirectiongravity穩定抓持、penetration/absolutecontactdistance、stressrelativeMAE/KL；simulationfidelityrealcheck只4objects。
- Split／資訊條件：DexGraspNet/PartNetassets重用；stress按object切，graspwholepool分割另需release核。
- 來源關係：固定物件union和多gripper/material/randomizedpose；全量物件與real2sim4個子集分開。
- 可復用：可補接觸穩定性與材料保護規則；candidatepose生成和有效評測case分開。
- 待核／限制：50N停止closure和gravity0.1秒/方向是本protocol，不能當通用安全標準。

### P196　Deform360（2026）

原作：https://arxiv.org/abs/2607.05390
本次PDF：https://arxiv.org/pdf/2607.05390v1
PDF SHA256：3f23966cb31f3614a8b27aba9ae558ef4684e812dd86ef6cd072d1788c6faf95
閱讀頁：1、4、5、6、8、9、10、11、12、13、27。198objects、capture/重建、1980episodes、多層generalization及2D/3D metrics。

- 研究類型：布料／柔性物操作；柔性物資料與世界模型benchmark
- 領域：衣物與洗護
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：一套41camera環繞capture rig；41視角不是41環境。人類持UMI tactile grippers操作。
- 任務：3D重建/重模擬、future prediction、episode及object generalization；198objects不是198語義task。
- 題數／資料：198物件＝28線材+98片材+72體積柔性物；每物件5single+5bimanual，共1,980episodes。清理後74,850videos、23.3M多視角frames。
- 評估方式：3D Chamfer/track MSE；2D PSNR/SSIM/LPIPS；接觸accuracy/F1使用36個同步過濾視角。
- Split／資訊條件：分episode內future frames、同物件未見episodes、未見objects三種；不同方法適用不同設定，不能共用一個排行分母。
- 來源關係：3DGS＋tracking＋normal-pressure tactile重建；收集刻意避免slip，未提供完整shear/slip涵蓋。
- 可復用：補材料與動力學覆蓋，亦示範為何要將episode、view影片、frame和hours各自計數。
- 待核／限制：各generalization split的精確train/test ID數需release protocol；未宣稱所有198物件已完成real-robot closed-loop task驗證。

### P197　EgoSim / MultiEgoView（2025）

原作：https://arxiv.org/abs/2502.18373
本次PDF：https://arxiv.org/pdf/2502.18373v1
PDF SHA256：db15f931833027b80e416c0bdb47bd3c7695ef3cce6733988110484295f4f7d2
閱讀頁：1、2、5、6、7。資料構成、四場景、body-camera位置、35活動、切分與body pose metrics。

- 研究類型：人類影片與動作資料；身體攝影機資料與感知benchmark
- 領域：穿戴互動與動作介面
- 用途歸納：身體攝影機用來恢復使用者動作及支援互動輸入，歸入穿戴互動與動作介面。
- 環境：24locations分布於4virtual scenes；real資料在其中一個掃描courtyard收集。6個body cameras是視角。
- 任務：主要實驗為全身3D pose estimation；real演出35種BABEL活動，非35robot執行目標。
- 題數／資料：synthetic 119.4行為hours/77.4M六視角images；real約5h、13participants。5秒segments數未報。
- 評估方式：global/PA MPJPE、translation/rotation/joint-angle error、jerk。
- Split／資訊條件：synthetic依BABEL60/20/20；real random80/20與cross-participant10/3另列。
- 來源關係：AMASS/BABEL/BEDLAM motion/labels/assets；同一motion多bodyviews與多場景重渲染，非獨立動作資料。
- 可復用：支援頭、腰、手腕、膝攝影機的感知來源；加入視角泛化，不能當物理task completion。
- 待核／限制：精確train/test片段IDs、重渲染motion去重需manifest；動作辨識/定位雖可支援，主實驗未全評。

### P198　TACO（2024）

原作：https://arxiv.org/abs/2401.08399
本次PDF：https://arxiv.org/pdf/2401.08399v2
PDF SHA256：2cd9fef96e133851d367c485aad1578b4979baef4d9b57037a1a246476735efd
閱讀頁：1、2、3、4、5、6、7、8。capture/annotation、131triplets、資料與generalization splits、三benchmark與metrics。

- 研究類型：人類影片與動作資料；雙手工具互動理解與預測benchmark
- 領域：居家整理與清潔、餐飲與烹飪、穿戴互動與動作介面
- 用途歸納：用原作工具—動作—物件組合歸納：倒液與攪拌屬餐飲，清潔器具屬居家，手物動作建模亦服務AR／VR介面。
- 環境：12third-person+1ego相機的capture工作站；作者明列缺乏scene diversity。
- 任務：3研究端點：compositional action recognition、motion forecasting、cooperative grasp synthesis；15actions、131tool-action-object triplets。
- 題數／資料：約2.5K motion sequences、5.2M多視角frames；196物件meshes/20categories/14participants。不是5.2M獨立互動題。
- 評估方式：recognition Top1/5；forecast10frames→10frames的joint/translation/rotation error；grasp penetration/contact/collision/FID，非執行成功率。
- Split／資訊條件：train:S1:S2:S3:S4＝4:1:1:1.5:2.5，分已見、geometry、interaction、compound；另60/40sequence的annotation驗證不可混成主split。
- 來源關係：自己的multi-view capture；DexYCB交叉資料驗證；marker removal使用inpainting。
- 可復用：把動作、物件組合和研究端點分層記錄，支援工具互動的組合泛化設計。
- 待核／限制：完整各split精確sequence數需manifest；不含articulated objects，不能外推完整工具環境。

### P200　SABER（2026）

原作：https://arxiv.org/abs/2605.09613
本次PDF：https://arxiv.org/pdf/2605.09613v1
PDF SHA256：e4556b7aadaed076ac2792ec2c15b91853acad3f5eac7403898badc1396e8f98
閱讀頁：1、2、3、5、6、9、10、11、12、13。零售資料三streams、native/retarget区别、訓練mixtures、RoboBenchMart10tasks與100rollouts。

- 研究類型：人類影片與動作資料；零售示範資料與技能轉移
- 領域：包裝、倉儲與物流、零售與購物
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：多真實超市的頭戴/360°影片；camera capture無robot。精確店面數未報；下游是RoboBenchMart模擬。
- 任務：影片列12核心retail活動；下游10tasks＝fridge2、board-to-board3、floor2、basket3，主要搬放與開關。
- 題數／資料：100+h影片導出44.8Ksupervision samples＝25Klatent+18.6Khand+1.2Kbody，streams共享capture。每task100eval rollouts。
- 評估方式：success同時要求joint velocity<0.2、target到位、未擾動非target；非fridge tasks另報0/1⁄3/2⁄3/1進度。
- Split／資訊條件：下游訓練含2.5Ktask-aligned RoboBenchMart demos＋4.8Krobot anchor；不是human-only零樣本轉移。
- 來源關係：三stream由相同人類capture生成，RoboBenchMart為下游父benchmark；不要重新計一次新10task。
- 可復用：補商店補貨/拿取/購物用途；可轉移資料與可执行環境需要分別取得。
- 待核／限制：不同stream的episode交集及各超市scene IDs未報；checkpoint選擇與held-out sampling需code核。

### P201　EgoSAT（2026）

原作：https://arxiv.org/abs/2606.24422
本次PDF：https://arxiv.org/pdf/2606.24422v1
PDF SHA256：3cdd4d6866e119e6133a58a10ad4eff1ec3dd77fc61f49704b61835d9c312199
閱讀頁：1、3、9、10、11、12、13、14、22、28。interaction curation、stream prefix、六題型、QA數及confidence/answerability分析。

- 研究類型：理解、推理與規劃；串流理解與預測benchmark
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Ego4D的56scenario labels；不是56有資產的機器人環境。
- 任務：present narration/state switch、short/multi-step anticipation、short/multi-step retrieval，共6題型。
- 題數／資料：1,997video sessions、約165h、約4,800QA；同一query的MC與open-ended版本不算獨立證據。
- 評估方式：MCQ accuracy、interaction precision/recall、state switch兩端都正確；confidence slope與predictable/unpredictable分組。
- Split／資訊條件：每query嚴格截到當下prefix；online cache方法與每題prefix重處理成本不同；SFT cross-scenario另比較。
- 來源關係：Ego4D原影片/interaction labels加新queries；不重新計成獨立165h影片。
- 可復用：預測題需記可預測性與合法觀測截止時間，不能讓未來frame洩漏。
- 待核／限制：約4,800的精確query及SFT/evaluation split IDs待release核；future answer多解性不能當單純模型錯誤。

### P202　EgoMonth（2026）

原作：https://arxiv.org/abs/2608.13113
本次PDF：https://arxiv.org/pdf/2608.13113v1
PDF SHA256：6747ddc4c6f9303ea3e7ed2e427b1e8707235e60cd4cf05e45abfd4d13cdffc1
閱讀頁：1、4、5、6、7、19。收集/篩選、14題型全表、738clips/301h、人工QA、macro/micro與sampling。

- 研究類型：理解、推理與規劃；長期記憶影片benchmark
- 領域：居家整理與清潔、餐飲與烹飪、辦公與教育、零售與購物、交通移動與車輛維修、休閒與運動
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：20participants各20–120天生活紀錄；室內外場景無可去重實體場所總數。
- 任務：14QA types、3認知層級；6activity用途類別。層級是作者設計，不是已校準的機器人難度。
- 題數／資料：738clips、18,072minutes≈301h、1,443四選一人工QA；原始30人400+h篩到20人300+h。
- 評估方式：14類macro平均與全部QA micro；直接答案比對，無LLM judge。人類評測3annotators，κ0.78。
- Split／資訊條件：benchmark zero-shot evaluation，非training dataset；固定sampling但model frame上限不同。
- 來源關係：新收集長期生活影片，與EgoLife是不同capture來源；一人多日仍屬群聚資料。
- 可復用：擴到長期生活記憶與跨日狀態，預算應固定並用participant群聚估計不確定性。
- 待核／限制：跨日task所需實際視覺覆蓋與每model frame cap要並列；人格推論題不等於客觀人格ground truth。

### P203　EGOSTREAM（2026）

原作：https://arxiv.org/abs/2605.31557
本次PDF：https://arxiv.org/pdf/2605.31557v2
PDF SHA256：2b7fad2f7b3b003fe66a26ce10fe8f4c0b2950ae9a0a072a3f9215790a59ef17
閱讀頁：1、3、4、5、6、8。五父來源、人工filter、AVW與7recall regimes、8528擴充和stream protocol。

- 研究類型：理解、推理與規劃；串流記憶benchmark
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Ego4D VQA、EgoLife、EgoTempo、Multi-Hop EgoQA、HD-EPIC五來源；無新增可執行場景。
- 任務：7記憶題型：detail/spatial/temporal/event/social/causal/prospective；7recall時間區間另是條件。
- 題數／資料：2,634candidate→2,335human-verified→2,250final QA；依Answer Validity Window擴成8,528question-recall evaluations。
- 評估方式：4-way accuracy，依語義/recall報；每frame processing time及受限memory，固定backbone比較不同memory managers。
- Split／資訊條件：query到時才揭露；memory construction須query-agnostic，不能無界保存原frames再重讀；不是所有題都可乘7。
- 來源關係：五來源QA與evidence重用/改寫；baseQA與多recall conditions有父子關係。
- 可復用：示範正當擴題：保留base question，新增不同合法歷史條件，並明示擴充規則和依賴。
- 待核／限制：無global scene union；同一QA的多recall測例需群聚统计，不能算8528獨立語義問題。

### P204　S-EMBER（2026）

原作：https://arxiv.org/abs/2607.02689
本次PDF：https://arxiv.org/pdf/2607.02689v2
PDF SHA256：a19dd911977b7b7ad2651673df90d5ea20fbd44471297b335afdb6e3a0884e04
閱讀頁：1、3、4、5、6、7、8、14。新capture、2090scenario labels/33活動、9448QA、多長度答案、joint grounding與judge驗證。

- 研究類型：理解、推理與規劃；串流記憶與證據定位benchmark
- 領域：居家整理與清潔、餐飲與烹飪、零售與購物
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：613使用者Ray-Ban Meta capture；2,090fine-grained scenario labels合併33activity categories，非2090實體scene資產。
- 任務：8memory QA categories；answer generation與temporal grounding兩endpoint。
- 題數／資料：3,141videos、388h、9,448QA；每題三種verbosity參考答案，不把答案條數當三倍题數。另5-way MC版本。
- 評估方式：free-form overall/clean accuracy用judge；MC exact match；temporal mIoU/Recall@1；GQ@τ要求答對且定位正確。judge另600正負pair驗證。
- Split／資訊條件：visual-only且prefix cutoff；open models固定128frames、closed native limits另列，非完全同觀測預算。
- 來源關係：新生活capture；questions由當下trigger往回問；影片scenario標籤不提供可執行robot state。
- 可復用：我們可採用答案與證據的聯合判分，但不能讓多verbosity或MC改寫虛增獨立題。
- 待核／限制：全部實體場所數未報；GQ判分可靠性取決judge與grounding，需保留分項成績。

### P205　CapMem（2026）

原作：https://arxiv.org/abs/2609.17688
本次PDF：https://arxiv.org/pdf/2609.17688v1
PDF SHA256：f65b30af25bbaa68d3825316d901fac09df58f2fe57b133428750addc1aeec4e
閱讀頁：1、3、4、5、8、16、18、22。75videos七來源、4用途/16scenario、QA filter、CleanQA、frame-aligned controls與部分API評測。

- 研究類型：理解、推理與規劃；caption記憶benchmark
- 領域：居家整理與清潔、寵物照護與動物活動
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：4application domains、16scenario labels、75公共ego videos；無實體scene union。
- 任務：CleanQA/DirectVideoQA/CaptionQA是同題三種資訊條件；50question templates與5diagnostic分析維度不等於50task goals。
- 題數／資料：2,109candidate→1,000final MCQs、33.7h；Ego4D佔56videos/742QA。Gemini VideoQA只跑786題，其他主設定1,000。
- 評估方式：MC accuracy、token/runtime成本、visual tags/evidence位置/影片長度分項；CleanQA 15–35%gate是方法篩選規則。
- Split／資訊條件：無額外train；full-caption1fps看全片而direct有frame cap，另6Qwen frame-aligned及cross-captioner受控實驗。
- 來源關係：Ego4D/EgoLife/EgoPet/EPIC/HoloAssist/ENIGMA-51/CASTLE2024；只release annotations/metadata，不重發原影片。
- 可復用：可借相同問題在不同記憶表示下的受控比較；先對齊看過的frames再比較caption收益。
- 待核／限制：作者標明只涵部分wearable用途；blindgate低於/高於門檻的解釋需謹慎，不能直接證明污染。

### P206　EmbodiedMemory-Bench（2026）

原作：https://arxiv.org/abs/2609.28236
本次PDF：https://arxiv.org/pdf/2609.28236v1
PDF SHA256：14adce97c24c0e4080ec7f707206f2dcc6ff9155bacf63b0d6cf84287eba4580
閱讀頁：1、3、4、5、6、15、18、27。四family、AI2THOR/ProcTHOR場景生成、2554驗證episodes、sim success及source/split設計。

- 研究類型：理解、推理與規劃；可執行具身記憶benchmark
- 領域：居家整理與清潔
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：1,118source scenes；AI2-THOR單房間組成virtualhome并保存狀態、ProcTHOR multi-room篩選。不是1118全部新建獨立house。
- 任務：4families：Passive Observation、Dynamic Tracking、Interaction Failure、Experience Generalization；125visible object types/83target/33receptacle是資產類別。
- 題數／資料：2,554episodes＝1,036+1,052+263+203；143候選被排除。四history介入條件同用800episodes而非新增3200unique basecases。
- 評估方式：執行action到sim目標終態的SR，四family等權macro避免1036/1052大類壟斷；另history介入成對比較。
- Split／資訊條件：訓練與eval scenes/trajectories分離，parent trajectories先split再展開turns；target task在history之後才給。
- 來源關係：AI2-THOR/ProcTHOR、PDDL distractor、LLM生成experience後必須ground與重播驗證；這是episode而非2554獨立語義families。
- 可復用：和我們『既有環境＋新任務/規則』非常接近；差异要用更廣用途與來源聯集證明，不能只比episode數。
- 待核／限制：scene IDs跨host重用與完整episode manifest需原生release核；同history多condition需保留pair ID。

### P207　EgoCoT-Bench（2026）

原作：https://arxiv.org/abs/2605.19559
本次PDF：https://arxiv.org/pdf/2605.19559v1
PDF SHA256：98ac34ca6c5e5e85367bbc76844e70d30939b29b4c58188ffdbe431af5e9b237
閱讀頁：1、3、4、5、6。來源/scene graph審核、12subtasks全表、3172QA、SCR與judge驗證。

- 研究類型：理解、推理與規劃；影片推理與證據benchmark
- 領域：居家整理與清潔、餐飲與烹飪、裝配與生產作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：Ego4D、EPIC、MECCANO、Charades-Ego、HD-EPIC及自錄；351clips不是351獨立環境。
- 任務：4研究groups/12subtasks，從object grounding到state回顧、預測、progress與goal tracking。
- 題數／資料：3,172四選一QA、351video clips；參考reasoning與時空證據同屬一題。
- 評估方式：答案exact match；Qwen-Max judge給reasoning0–5。SCR＝答對但reasoning≤2的比例，分母僅答對題。；judge與人類在2,800responses比較QWK/一致率；它衡量輸出解釋與證據一致，不證明模型內部思考忠實。
- Split／資訊條件：主文是benchmark evaluation；精確train/dev manifest未列。MCQ、rationale與evidence非不同題庫。
- 來源關係：父影片及新增人工修訂STSG；五公共父庫與自錄不代表六份互不重疊世界經驗。
- 可復用：可加入答案與證據一致性的評測；不要把rationale judge直接叫物理成功驗證。
- 待核／限制：Table1寫Open/Close而metrics說全部四選一；以主實驗協定為準並保留差異。

### P208　DYAD（2026）

原作：https://arxiv.org/abs/2609.09023
本次PDF：https://arxiv.org/pdf/2609.09023v1
PDF SHA256：698811f9c48df7ba4dfef3eab17ed4c8336186b171cbc82e4ea597e06349fdf0
閱讀頁：1、2、3、4、5、6。單helper政策、三reference tasks、原始/有效/eligible counts、participant splits與oracle限制。

- 研究類型：輔助與協作；協作與協助預測benchmark
- 領域：裝配與生產作業、協助、交接與陪伴
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：同一gearbox組裝工作站、20performers與同一trainedhelper；6pilot sessions不納正式20。
- 任務：3endpoint：causal8步辨識、介入前verbal/physical mode預測、oracle context下回應生成；不是完整robot助手。
- 題數／資料：20sessions/5h58m、528step intervals、611requests、851有效assistance events；mode eligible829，response376＝120dev+256test。
- 評估方式：mode macro-F1/AUPRC，participant bootstrap；step segmentF1/edit/mAP/MoF；response rubric judge+BERTScore。
- Split／資訊條件：mode participant五fold每fold12/4/4、3秒觀測到onset前0.5秒；step5val/15test；response120/256。當次trigger禁止入model。
- 來源關係：human-human assistance demonstration；851events中有效outcome極不平衡，作者不測outcome prediction。
- 可復用：可加協作規則，但需另外建need detection negatives及可執行robot feasibility。
- 待核／限制：沒有non-intervention negatives，不能宣稱會判斷何時需要幫忙；mode是一位helper政策不是普世最佳協助。

### P209　HUI360（2026）

原作：https://arxiv.org/abs/2608.11051
本次PDF：https://arxiv.org/pdf/2608.11051v1
PDF SHA256：9b4575648e06d38fb681f06af41179b35afb217270d1526216532130f6c3026f
閱讀頁：1、3、4、5、6、8。9場所/30setup、原始與裁切時數、SSUP重標、physical interaction定義及anticipation協定。

- 研究類型：輔助與協作；人機互動預測benchmark
- 領域：公共場館與服務、協助、交接與陪伴
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：HUI360有9真實場所、30robot placements/setups；SSUP-A兩public-space field sessions另列。
- 任務：預測是否將發生與平台的物理interaction；不是廣義社交意圖。不同anticipation horizons重評同tracks。
- 題數／資料：HUI360 68recordings/71.3h原始→1,937episodes/11.3h有效人像片段，4,310tracks含375interaction。SSUP-A 27,698tracks為重標舊資料。
- 評估方式：AUROC主、F1/AP另報；跨location、跨dataset、0.33–2秒horizons及input-frequency robustness。
- Split／資訊條件：HUI360 locations1–7train、8–9test；SSUP第一/二場次train/test。近onset窗口排除，negative以最近距離proxy挑選。
- 來源關係：新HUI360＋既有SSUP-HRI重標；1Mannotations不是1M獨立interaction。
- 可復用：擴到公共空間互動預測，場地與擺位可獨立記錄；自動contact proxy應保留人工修正。
- 待核／限制：本文normalization用全HUI360均值/標準差，若嚴格train-only協定需修正；最終eligible test窗口量需manifest。

### P210　RoCo Challenge（2026）

原作：https://arxiv.org/abs/2603.15469
本次PDF：https://arxiv.org/pdf/2603.15469v1
PDF SHA256：1b91dade9b97b3cbbde4f382166932d5d38a29b4038328808755568fc5b47c29
閱讀頁：1、3、4、5、6、12。三scenario、sim/real差異、兩種demo、single model與weighted score。

- 研究類型：輔助與協作；協作組裝benchmark
- 領域：裝配與生產作業、協助、交接與陪伴
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：IsaacSim工作站與Galaxea R1 Lite實機；simulation人類參與由初始化partial state模擬。
- 任務：1gearbox workflow的3scenario：從零組裝、partial state續作、error recovery。real只3planet gears，sim含sun/ring更多parts。
- 題數／資料：sim>300automatically generated demos，real另>300teleop demos；精確官方eval回合數在已讀protocol未報。
- 評估方式：single model需處理三scenario；assembled-parts/recovery分數以0.4/0.2/0.4加權。
- Split／資訊條件：私有工作站上統一random lighting/texture/colors；real track任務規格有縮減，不能視為完全同題sim-real transfer。
- 來源關係：同gearbox assembly的起始狀態/恢復規則擴充；與人類實時協作要分開。
- 可復用：可借從零/續作/修復三類規則；不同backend的task目標改動要版本化。
- 待核／限制：完整task/case IDs及官方評測分母待competition config；結論的300+泛稱不能覆蓋兩份不同demo。

### P211　AssemblyGrid（2026）

原作：https://arxiv.org/abs/2609.16075
本次PDF：https://arxiv.org/pdf/2609.16075v1
PDF SHA256：8661b2c5550168645f05f00d371e18fbdb54c431355ebf45b56a117ba5934f2d
閱讀頁：1、10、11、12、13、14、15、16、17、18、19、20、21、22、54、56。decentralized資訊、9scenario全表、instance/seed區分、production metrics及held-out protocol；未逐式讀57頁全部附錄。

- 研究類型：輔助與協作；多機器人生產調度benchmark
- 領域：裝配與生產作業
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：抽象grid生產模擬，geometry/reach/workspace限制；不模擬robot-specific接觸physics。
- 任務：Flow/Coalition/Concurrency三workload families×easy/medium/hard＝9official scenarios，程度為family內配置，不保證每policy單調。
- 題數／資料：每scenario50held-out instances；3algorithms×9scenarios×10trainingseeds＝270training runs，每個final checkpoint同50test instances。
- 評估方式：主要delivered products/throughput，admitted completion與offered-demand fulfilment分母不同；候選admission/coalition/blocking為diagnostics。；finite-batch timeout的makespan未定，不把未完成當正常完成時間；RL與nonlearning的不確定性分別按trainingseeds與instances。
- Split／資訊條件：train/val/finaltest generationseeds分離，主測unseen realizations而非新topology；finalcheckpoint，無事後best選擇。
- 來源關係：local support-fraction cue為合法interface；centralized privileged reference與decentralizedpolicy分組。
- 可復用：補生產規劃與協作資源約束；可借明確區分instance、executionseed、trainingseed的計數方式。
- 待核／限制：robot-specificphysics、newtopology、failure/communication interventions明列未納v1實驗；不要稱完整工廠機器人控制。

### P212　ARB4WM（2026）

原作：https://arxiv.org/abs/2606.16605
本次PDF：https://arxiv.org/pdf/2606.16605v1
PDF SHA256：7164d9a676e577b14d43e71e8cc37115faf37eba06430b824a84b05822e11b4b
閱讀頁：1、2、8、9、12。20tasks完整列表、5objectives、20eval runs、nAUC真實分母與defense metrics。

- 研究類型：世界模型與預測表示；世界模型與魯棒性benchmark
- 領域：居家整理與清潔、餐飲與烹飪、通用物件與機動作業
- 用途歸納：同時涵蓋物件操作與行走／平衡控制，歸入通用作業；門窗與咖啡／餐盤任務另標對應用途。
- 環境：10MetaWorld＋10DMC任務，作者稱industrial proxy；未提供真實industrial scene。
- 任務：20host tasks在5white-box objectives、各optimizer/temporal exposure下重評。
- 題數／資料：每setting20evaluation runs，seed20–39；4Dreamer-family agents，不能把agent數乘入獨立題庫。
- 評估方式：MetaWorld SR、DMC return；nAUC公式除benchmark常數1或1000，不是各policy clean score，雖文中稱clean-normalized。defense recovery另用clean−attack分母。
- Split／資訊條件：只在eval perturb pixels，不改dynamics/reward/parameters；cross-model transfer只是另subsetDMC Reacher Easy。
- 來源關係：MetaWorld/DMC task復用加新攻擊protocol；hosttask和規則variants分開。
- 可復用：可擴充感測失真規則，固定合法attacker access和預算；不要把視覺攻擊當材料或安全有效性驗證。
- 待核／限制：all-setting unique episode IDs未報；攻擊強度不是可跨任務直接相加的難度刻度。

### P214　COIN（interactive）（2026）

原作：https://arxiv.org/abs/2604.16886
本次PDF：https://arxiv.org/pdf/2604.16886v1
PDF SHA256：0e8f4586f184eb25ae2bd4bc596b3385b4e27319784a61dfa8c67bd98ba07f3c
閱讀頁：1、4、5、6、7、15。90tasks分層、ManiSkill3規格、1000demo、六metrics、10trials及不同model inputs。

- 研究類型：導航與家務執行；互動推理與操作benchmark
- 領域：居家整理與清潔、餐飲與烹飪、通用物件與機動作業
- 用途歸納：開櫃、找書、操作微波爐都有可辨認用途；純互動推理與幾何控制題保留在通用作業。
- 環境：ManiSkill3桌面Panda，PartNet/Sketchfab等assets；3reasoning domains是能力類別，不是生活用途。
- 任務：20Primitive＋20Composition＋50interactive reasoning＝90task definitions；含partialobservability下互動取得資訊。
- 題數／資料：Primitive每task50demo＝1,000trajectories、5views；主SR平均10trials，views不把traj變五倍。
- 評估方式：SR/類別SR、VQA、trajectory/gripper穩定、Composition/Primitive success ratio；六metrics分母不同。
- Split／資訊條件：VLA在Primitive fine-tune、validationSR選checkpoint；model用1/3views不同，Voxposer有GTobjectlist，需保留資訊條件。
- 來源關係：ManiSkill3資產與task擴充；expertVQA看示範不等於執行時在線推理成績。
- 可復用：可借Primitive→composition→interactivegoal的父子關係；我們的規模優勢需超出這種單桌面推理範圍。
- 待核／限制：人類只10task代表subset、3people×2trials；不可把40%sim/100%real當全50task人類上限。

### P216　HAP（2026）

原作：https://arxiv.org/abs/2609.18548
本次PDF：https://arxiv.org/pdf/2609.18548v1
PDF SHA256：0cbfc4268916f842b362862865080ed9f76fbefdab51c290d6e567b9e03abf8a
閱讀頁：1、2、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：穿戴互動與動作介面
- 用途歸納：預測頭部轉向以看到被遮擋的操作目標，歸入穿戴觀察與動作介面。
- 環境：Bottle12RGB-Drecordingsessions，clutter/reach變化；camera估計作headmotionproxy。
- 任務：預測6DoFheadmotion；EgoPAT3Dv2父benchmark另列。
- 題數／資料：Bottle382clips，sessions10train/1val/1test；單一testsession不是廣泛場地泛化證明。
- 評估方式：translationADE/FDE(mm)、rotationADE/FDE(degrees)；DA3/ORB3感知backend敏感性另測。
- Split／資訊條件：sessiondisjoint；各模型同window/horizon/smoothedpose。
- 來源關係：新Bottlecapture＋EgoPAT3D、pseudo3Dheadtargets。
- 可復用：補視角移動/遮擋規則與activeperception預測，而非只評手部。
- 待核／限制：camera pose proxy不等於獨立mocapGT；dataset完整releaseID待核。

### P217　TRS + RVG（2026）

原作：https://arxiv.org/abs/2609.13293
本次PDF：https://arxiv.org/pdf/2609.13293v1
PDF SHA256：13aaaf69bfbfa5c99ef154700c56eb0f34385c23b6bb5503a53965250a5e7e6a
閱讀頁：1、2、6、7。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：穩健性、失敗與評測品質；穩健性與分布外評測
- 領域：餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：EGTEA/EPIC原資料；破壞TSNfeaturetokens，不是重新收集真實sensorfailures。
- 任務：actionanticipation下六maincorruptions；額外standaloneblur是severitytransfer。
- 題數／資料：EGTEA processed split10,321clips；EK100自訂trainingvideos90/10切，不可和官方leaderboard直接比。
- 評估方式：jointverb+nounTop1、平均corruptedaccuracy及RelativeRobustness=AvgC/clean。
- Split／資訊條件：compatibilitygraph只trainlabels、λEGTEAval選；EKpipeline125verbs/352nouns不同官方97/300。
- 來源關係：既有影片加新corruptionprotocol，不新增生活domains或原始action庫。
- 可復用：可以新增robustness規則cases並保持原task引用，清楚標記feature-level擾動。
- 待核／限制：本文自訂indexspace與officialsplit不同；clean低時RR可能誤導，須同報absoluteaccuracy。

### P222　Uni-Hand（2025）

原作：https://arxiv.org/abs/2511.12878
本次PDF：https://arxiv.org/pdf/2511.12878v4
PDF SHA256：f71d9925369c1a5feb6fe1ecf4b409c2c11ae40edf1f0c8c7d568d12a00417ca
閱讀頁：1、9、10。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：居家整理與清潔、餐飲與烹飪、通用物件與機動作業、穿戴互動與動作介面
- 用途歸納：把手部預測連到互動介面與機器人示教；杯墊擺杯、蘋果入盤和盒子上架另提供餐飲／整理用途。
- 環境：新CABH頭戴RGB-D與HAT固定ALOHAcamera；既有五publicdatasets另列。
- 任務：CABH3humanHOItasks；HAT5robottransfertasks，5個不是所有publicdatasetssemanticunion。
- 題數／資料：CABH1,200videos；HAT2,800handvideos（400/400/400/800/800），每task10physicaltrials。
- 評估方式：hand/headtrajectory與contactstate預測；HAT按完整predictedtrajectory執行。
- Split／資訊條件：HAT只取第一幀產生完整motion，是look-then-move而非同等closed-loop視覺policy。
- 來源關係：CABH/HAT新資料；EgoPAT3D/H2O/HOT3D/Ego4D/EPIC重用。
- 可復用：補humanmotion到robotinterface，但必須標明executionmode與觀測限制。
- 待核／限制：CABH精確split與全部frameID仍需manifest；依據單幀的open-looptransfer不可當通用在線成功率。

### P224　EMPIRE（2026）

原作：https://arxiv.org/abs/2608.22449
本次PDF：https://arxiv.org/pdf/2608.22449v1
PDF SHA256：e49c2bea71f4e0913128fd930c8536111ea26aa22782f634ac9ce7497f14aa03
閱讀頁：1、2、4、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：穿戴互動與動作介面
- 用途歸納：預測雙手未來動作並產生操作計畫，歸入穿戴互動與動作介面。
- 環境：EgoDex原recordings，沒有新增111獨立物理場景。
- 任務：111tasklabels下bimanual5秒motionforecast＋explicitplans；原作194只保留subset。
- 題數／資料：650,910trainwindows、6,836testwindows；non-overlapping5swindows，parentepisodes先分。
- 評估方式：best-of8按MPJPE選trajectory再算wrist/fingerrelative；不是單次控制policy。
- Split／資訊條件：原EgoDexofficialsplit；85unseentasks僅Part1ablations，fulltrain111tasks都seen。
- 來源關係：EgoDex→EMPIRE650K，Qwencaption/plan＋MANOfitting；100caseaudit84%usable，未全部人工審核。
- 可復用：可借規劃介面與預測粒度，同時保留生成標籤品質及best-ofK預算。
- 待核／限制：difficulty按baselineMPJPE分43/49/19，僅模型相對难度；不得當通用easy/medium/hard真值。

### P225　Exo2EgoPose（2026）

原作：https://arxiv.org/abs/2607.15890
本次PDF：https://arxiv.org/pdf/2607.15890v2
PDF SHA256：de7fddd04e06fecbb6bf89e299b81ad55b49b90cbbb5d57ec0856fd8cd1a5c43
閱讀頁：1、2、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：裝配與生產作業、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：AssemblyHands/EgoExo4D/EgoMe原場景，exovideo供訓練supervision。
- 任務：vision-language3Dhandposeforecast；EgoMe-pose為新增derivedbenchmark。
- 題數／資料：AssemblyHands6120/355/355；EgoExo10869/1540/1540；EgoMe6067/1344/2648 train/val/test episodes。
- 評估方式：root-alignedMPJPE/MPJVE(mm)，不同source15/30fps。
- Split／資訊條件：EgoMe只保留correctimitation，>95%frames有效；generatedpose和depth不是全部mocapGT。
- 來源關係：Assembly101→AssemblyHands及EgoMe新pose標註；父場景不能再加。
- 可復用：補exo示範監督與finefingerprediction，但不混成robotphysicalexecution。
- 待核／限制：root-alignederror不檢驗世界坐標全局定位；episode數不可代替獨立sourceclip數。

### P226　EgoTraj（2026）

原作：https://arxiv.org/abs/2605.19004
本次PDF：https://arxiv.org/pdf/2605.19004v1
PDF SHA256：c6789c21ac3754c8b4f240cc614ab7712284681a8b02fa63e9ec08d9dbcfea82
閱讀頁：1、2、3、4、5、6、7。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：交通移動與車輛維修、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：7outdoorwaypoints/21origin-destinationpairs；waypoint和route不等於21獨立地理環境。
- 任務：wearer6DoFtrajectoryprediction，gaze/sceneannotations作modalities。
- 題數／資料：75participants各1session，10.7h/1.15Mframes；38,606annotatedframes非相同數量testcases。
- 評估方式：ADE/FDE與headrotationL1error；route多樣性另用DTW。
- Split／資訊條件：held-outsessions；地理場域和路徑可能重用，不等於unseencitygeneralization。
- 來源關係：新QuestProcapture；VLMsemanticlabels與真實trajectory/pose區分。
- 可復用：擴到戶外行走的預測用途；屬人類導航資料，不是機器人互動模擬房屋。
- 待核／限制：exactheld-outwindowcount和完整protocol需要release核；不將1.15Mframes當predictionquestions。

### P228　SFHand / EgoHaFL（2025）

原作：https://arxiv.org/abs/2511.18127
本次PDF：https://arxiv.org/pdf/2511.18127v2
PDF SHA256：523777e21488e904c826eaab83130b80cffb36f33c1de90506f75949869bee9d
閱讀頁：1、2、3、4、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：居家整理與清潔、餐飲與烹飪、通用物件與機動作業、穿戴互動與動作介面
- 用途歸納：即時語言引導手部預測歸入動作介面；其Kitchen與Adroit下游評測另外歸納家居／餐飲與通用作業。
- 環境：Ego4D→EgoHOD/EgoVid衍生影片；worldcoordinates由估計camera/hand取得。
- 任務：streaming3Dhandstateforecast（type/box/pose/globaltrajectory）；Kitchen/Adroit只做下游representationtransfer。
- 題數／資料：247K三秒clips＝242Ktrain/5Ktest，3.95Mhandannotations；不是3.95M独立taskcases。
- 評估方式：ADE/FDE、wristalignedJPE/PA-JPE、2Dboxrecall/FPS；SFHand*使用GTstate oracle另列。
- Split／資訊條件：test時間autoregression吃前一步預測；普通SFHand不可和oracle58.8FPS/accuracy混成同設定。
- 來源關係：Ego4D/EgoHOD/EgoVid共同影片，再用HaMeR生成pose。
- 可復用：補streaming預測規則及teacher-forcing/oracle邊界，sourceclip/traininglabel分開。
- 待核／限制：paper『4M Ego4D videos』實為衍生片段層級，不能當4M原始長影片；scene/video-disjoint split需核。

### P229　UniEgoMotion（2025）

原作：https://arxiv.org/abs/2508.01126
本次PDF：https://arxiv.org/pdf/2508.01126v2
PDF SHA256：841c3f6b142a703b951a3bbf3b4b85d7ce9d771d5fcebda569b703a3c857baa7
閱讀頁：1、2、3、4、5。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：餐飲與烹飪、休閒與運動、音樂與表演、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：EgoExo4D原takes，新增pseudoSMPL-X重建。
- 任務：reconstruction、forecasting、generation三不同觀測條件；同資料重用。
- 題數／資料：EE4D-Motion110+h；143Ktrain8sclips（每2s抽）、4,400valclips（每20s抽）。
- 評估方式：MPJPE/PA/handerror、headpose、footcontact/sliding、semantic/FID；不同endpoint分項。
- Split／資訊條件：officialtake-levelsplit；forecast看2s預測6s，generation只看一幀，reconstruction可看全input。
- 來源關係：EgoExo4Dmulti-viewoptimization生成新motionlabels；非110h新獨立capture。
- 可復用：補全身與scene-awareforecast，但應防止把reconstruction偷看未來當forecast。
- 待核／限制：三端點accuracy/inputs不同，不能用同一個難度或成功率比較；best-ofK需最終protocol固定。

### P230　EgoH4（2025）

原作：https://arxiv.org/abs/2504.08654
本次PDF：https://arxiv.org/pdf/2504.08654v1
PDF SHA256：16c00d83861cf54090431f84a857bd58983670d1635fa09e3cb8a8b6fc048006
閱讀頁：1、2、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：穿戴互動與動作介面
- 用途歸納：包含視野外雙手的姿態與動作預測，歸入AR／VR等穿戴動作介面。
- 環境：EgoExo4Dbody/handannotations合併，原場景重用。
- 任務：in-view/out-of-viewhandtrajectory/poseforecast，body作constraint。
- 題數／資料：156Ktrain/34Ktest是按hand-side的sequencecounts；同片左右手不可當獨立scene。
- 評估方式：ADE/FDE、MPJPE/lastframeMPJPE，單一generatedsample，沒有best-ofK放大。
- Split／資訊條件：officialtrain/valastrain/test，2sobs→1sforecast10fps；GT2Dhands作input，autobody只train。
- 來源關係：EgoExo4Dbody與handsubset；metric對不同validjoints適用分母不同。
- 可復用：加入遮擋/視野外預測的規則對照，並標明ground-truth感知input優勢。
- 待核／限制：要核hand-side數轉uniqueclip的關係；不能將156K+34K稱190K獨立humanactivities。

### P233　OCT / HOI forecasting（2022）

原作：https://arxiv.org/abs/2204.01696
本次PDF：https://arxiv.org/pdf/2204.01696
PDF SHA256：c866b4f79af2ef6de72a2ee55996af607cd4a69c977889bb3c3f67b0242fad17
閱讀頁：1、4、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：餐飲與烹飪、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：EPIC55/100及EGTEA原影片，EK100擴充EK55。
- 任務：handtrajectory與objectcontacthotspot聯合預測。
- 題數／資料：EK55train8523/evaltrajectory1894/hotspot241；EK10024148/3513/401；EGTEA1880/442/69。三種數字分别是訓練、軌跡評測與hotspot評測。
- 評估方式：trajectory取20samples最小error；contactpoints全部轉heatmap評，不是20次獨立case。
- Split／資訊條件：評原validation，正式actiontest不用於此derivedtask；hotspot只人工審核challengingsubset。
- 來源關係：autoannotations＋人工filteredhotspots，後被多篇forecast論文重用。
- 可復用：是hand/hotspot聯合規則的基礎來源；保留每個target的可用label分母。
- 待核／限制：不同target只覆蓋各自subset，1894不能全視為1894jointlabelcases。

### P241　AFF-ttention（2024）

原作：https://arxiv.org/abs/2406.01194
本次PDF：https://arxiv.org/pdf/2406.01194v2
PDF SHA256：5bc6b87af40d139d6f59d0cb6bd989130ccd236b866623dc409b6fe248d789a5
閱讀頁：1、3、10、11。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：EPIC-Kitchens新增STAannotations；Ego4D v1/v2原場景。
- 任務：next-activeobject box/noun/verb/time-to-contact聯合預測。
- 題數／資料：新增EPIC-STA驗證集；已讀原文mainsections未給精確casecount，待annotationmanifest。
- 評估方式：N、N+V、N+TTC、All Top5mAP；不是四個互不相干task庫。
- Split／資訊條件：Ego4Dv1/v2訓練量和test榜分列，v2含v1；EPICval自建benchmark。
- 來源關係：EPIC父標註→STA、OCT-stylehotspots；STAformer++是後續方法版本。
- 可復用：論文名字像方法但附帶新benchmark，應納入來源總庫並連回EPIC。
- 待核／限制：精確newannotationID與共同scene/task映射待code核，未知不填0。

### P246　Decision-aware uncertainty（2026）

原作：https://arxiv.org/abs/2603.10061
本次PDF：https://arxiv.org/pdf/2603.10061v2
PDF SHA256：4efc1650b0634e90b675a99e738d4660ad1c454cbd8b1023bc814cafbc53992c
閱讀頁：1、2、3、4、5。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：Survey／評測方法；評測方法與不確定性
- 領域：餐飲與烹飪
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：EGTEA/EPIC100既有影片。
- 任務：partial-prefixactionprediction下correctness/calibration/selectiveutility/confidencegeometry四種診斷。
- 題數／資料：預設K10候選、M5stochasticsamples/input；原作精確evalsegmentIDs未報。
- 評估方式：Top1/Recall@K、Top1/SetECE、accuracy-coverage、entropy；不是physicalsafety驗證。
- Split／資訊條件：稱用officialtest，singleGemini2.5Flash-lite；K/M改變結果及成本，不能算多出5倍題。
- 來源關係：對既有benchmarks加uncertaintyprotocol；有助規則/拒答評測。
- 可復用：我們可加入拒答/澄清閾值與accuracy-coverage曲線，但要有相應標籤和同模型預算。
- 待核／限制：Set-ECE用TopK平均confidence對setcorrectness，是作者定義，需另外驗證適用性。

### P247　EgoSpanLift（2025）

原作：https://arxiv.org/abs/2511.18470
本次PDF：https://arxiv.org/pdf/2511.18470v1
PDF SHA256：b2ea7307cbe26217da35558970ceadb9f521d3f0841c60ff431031d39a98003f
閱讀頁：1、5、7、8。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：居家整理與清潔、餐飲與烹飪、醫療與手術支援、交通移動與車輛維修、休閒與運動、音樂與表演、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：AEA的143recordings/7.3h與EgoExo4D五活動子集；排除soccer/basketball/dance。
- 任務：3Dvisualspanforecast，多個視角範圍是同target不同granularity。
- 題數／資料：FoVS-Aria約23.2Ksample（19.3K/1.9K/2.1K）；FoVS-EgoExo341.4K（274.7K/29.6K/37K），概述364.6K。
- 評估方式：3DIoU/F1、fovealregiondistance；16格/3.2m＝20cmcell resolution，不當精確gaze接觸。
- Split／資訊條件：AEA location4heldout；look2spredict2s，EgoExo預測4s；split約數四捨五入不精確加總。
- 來源關係：AEA/EgoExo4DSLAM+gaze衍生volume；windowoverlap與sourcecaptures要追蹤。
- 可復用：補注視/可見區域預測，讓世界觀測能力不只侷限於問答或手軌跡。
- 待核／限制：visualspan≠robotactiveperceptionpolicy；也未覆蓋所有EgoExo8activities。

### P250　EgoMAN（2025）

原作：https://arxiv.org/abs/2512.16907
本次PDF：https://arxiv.org/pdf/2512.16907v2
PDF SHA256：3edd340c61e8cb14c7aee576baa1f86ace5b4367000ec8ea612f039df07d7c24
閱讀頁：1、2、3、4、5、6。原作資料構成、任務定義與實驗協定相關段落；閱讀範圍限所列PDF頁，非全文逐字或程式重現。

- 研究類型：未來動作／互動預測；動作與軌跡預測
- 領域：居家整理與清潔、餐飲與烹飪、交通移動與車輛維修、穿戴互動與動作介面
- 用途歸納：依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。
- 環境：EgoExo4D/Nymeria以1014pretrain/498finetune/78testscene標籤分開；HOT3D testonly。
- 任務：interactionstage-aware6DoFwristforecast；semantic/spatial/motionQA三訓練類別。
- 題數／資料：EgoMAN-Bench2844unseen+990HOT3DOOD＝3834trajectories；3MQA為生成supervision概述，非3Mtestquestions。
- 評估方式：ADE/FDE/rotation/DTW，best-ofK1/5/10；waypointcontact/traj-distance另報。
- Split／資訊條件：sceneheldout及datasetOOD；up-to5sforecast，GTduration/masks用於判分。
- 來源關係：EgoExo4D/Nymeria/HOT3D重用，再生成interaction/QAlabels；可與OpenEgo、UniHand有父素材重疊。
- 可復用：是端點/規則擴充產生大QA量的對照；主benchmark應以3834testtrajectory分母比較。
- 待核／限制：219K/220K+trajectory概要與74K+17Ktrain分項不是同一層；待release對hand/clip單位核。

## 67篇方法／背景參考的篩查

- P035 EgoVLPv2：EgoVLPv2使用EgoClip/EgoMCQ及既有下游資料；模型融合改進不另計一份新影片庫。（PDF 1, 5, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2307.05463
- P036 EgoT2：EgoT2在Ego4D的7既有任務做task translation，保留作跨任務模型參考。（PDF 1, 2, 5；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2212.06301
- P043 Embodied VideoAgent：Embodied VideoAgent用Ego4D-VQ3D、OpenEQA、EnvQA；新增memory/tool方法，不把下游來源再加總。（PDF 1, 2, 5；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2501.00358
- P044 HiERO：HiERO在EgoMCQ/EgoNLQ/EgoProceL/Goal-Step驗證hierarchical features，未另計父資料規模。（PDF 1, 2, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2505.12911
- P046 RULSTM：RULSTM是EPIC/EGTEA的anticipation方法與challenge參考，原生題庫歸父來源。（PDF 1, 4；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/1905.09035
- P047 AVT：AVT使用EK55/EK100/EGTEA/50Salads，四個評測集合不能當四份新資料。（PDF 1, 2, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2106.02036
- P048 EGO-TOPO：EGO-TOPO從EPIC/EGTEA建環境affordance圖，保留拓撲表示與forecasts設計參考。（PDF 1, 3, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2001.04583
- P049 AntGPT：AntGPT研究goal inference與actionsequenceforecast，LTA定義歸Ego4D等父benchmark。（PDF 1, 3；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2307.16368
- P050 PALM：PALM用caption/認別/LLM預測既有LTA標籤；多次prompt不增加基礎題數。（PDF 1, 4, 8；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2311.17944
- P052 StillFast：StillFast針對既有short-term object interaction anticipation，屬方法；初篩僅摘要/任務定義。（PDF 1；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2304.03959
- P055 FUTR：FUTR在Breakfast與50Salads測長期預測，保留horizon/分割方式參考。（PDF 1, 2, 5；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2205.14022
- P056 Forecasting hands and objects：未来手/物體位置預測在公開第一人稱及street資料驗證；本輪未另登記獨立新資料資源。（PDF 1, 2, 8；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/1705.07328
- P059 EMAG：EMAG在Ego4D/EPIC55研究ego-motion及跨庫泛化，非新capture來源。（PDF 1, 4, 8；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2405.20030
- P078 PerAct：PerAct有18RLBench tasks/249variations及7real tasks/18variations；保留方法實驗，RLBench子集不重算整庫。（PDF 1, 3；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2209.05451
- P117 UMI：UMI四個實機task驗證工具/介面；可借cuporientation等規則，未納成本輪獨立benchmark總數。（PDF 1, 6, 7；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2402.10329
- P118 EgoMimic：EgoMimic三個real long-horizon tasks研究human-robot對齊；保留任務擴充參考。（PDF 1, 5, 10；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2410.24221
- P121 EgoZero：EgoZero七個real tasks驗證smart-glasses到robot技能；是方法實驗而非七種新生活領域。（PDF 1, 2, 5；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2505.20290
- P122 EgoBridge：EgoBridge的PushT對照與三realtasks用於OT adaptation；背景和初態規則可借用。（PDF 1, 2, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2509.19626
- P130 ALOHA / ACT：ALOHA/ACT六個real tasks與兩simtasks，主要介面/策略研究；demo數和task數分開。（PDF 1, 8；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2304.13705
- P131 Mobile ALOHA：MobileALOHA延伸mobilebimanual操作，50demos/task；完整custom實驗清單可續做task-level抽取。（PDF 1, 7；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2401.02117
- P133 RT-2：RT2約6000跨方法/條件rollouts；沿用robotdata並研究新語義能力，非6000unique tasks。（PDF 1, 4, 7；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2307.15818
- P134 OpenVLA：OpenVLA重用OXE970Kdemonstrations；29evaltasks與7finetunetasks是方法實驗範圍。（PDF 1, 2, 7；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2406.09246
- P135 Octo：Octo800Ktrainingtrajectories來自OXE；多平台policyadaptation不建立800Ktest題。（PDF 1, 2, 3；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2405.12213
- P136 pi0：π0包含約10000h資料與摺衣/清潔/盒子組裝實驗；保留通用策略與自收資料參考，完整manifest未由初篩驗證。（PDF 1, 3, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2410.24164
- P137 pi0.5：π0.5驗證未見房屋與長流程；高低層cotrain是方法，不能把所有提及用途當完整task庫。（PDF 1, 3, 10；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2504.16054
- P138 Diffusion Policy：DiffusionPolicy在既有四benchmark的15tasks評測；保留控制介面/資料預算參考。（PDF 1, 2, 10；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2303.04137
- P139 R3M：R3M用Ego4Dpretrain、三sim來源與五realtasks；來源重用需連父庫。（PDF 1, 6, 8；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2203.12601
- P140 VIP：VIP研究reward/representation；四realtasks及既有simcases留作評測方法參考。（PDF 1, 7, 8；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2210.00030
- P149 V-JEPA 2：V-JEPA2有大規模internetpretrain與DROIDadaptation；保留worldmodel/closed-loop對照，不把22Mvideos算robot題。（PDF 1, 5, 11；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2506.09985
- P153 EgoExo-Gen：EgoExo-Gen在EgoExo4D作cross-viewmask/video預測；可借新輸入條件，素材仍屬父來源。（PDF 1, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2504.11732
- P154 Hand-conditioned ego predictive model：Hand-conditioned predictive model使用Ego4D/BridgeData/RLBench，predictionquality與控制success分開。（PDF 1, 4, 5；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2508.19852
- P155 EgoExo-WM：EgoExo-WM把HowTo/CrossTask等exo轉ego並結合Nymeria；新增合成表示，不視為全新獨立行為。（PDF 1, 2, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2605.15477
- P156 Egocentric survey：Egocentric survey按subject/object/environment/hybrid整理；用於taxonomy與引文擴查。（PDF 1；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2503.15275
- P157 Human-video robot learning survey：Human-video robotlearning survey區分task/observation/action pathways；背景綜述非新題庫。（PDF 1；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2604.27621
- P158 VLA benchmark survey：VLA資料/benchmark/dataengine survey；可用於遺漏來源檢查，不沿用二手規模替代原作。（PDF 1, 2；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2604.23001
- P159 tinyBenchmarks：tinyBenchmarks提供IRT/子集估計方法，研究對象是LLM；不能直接假設robot難度模型有效。（PDF 1, 4, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2402.14992
- P160 Rliable：Rliable提供分層bootstrap/IQM與performanceprofiles；統計方法，不是robot環境資料來源。（PDF 1, 2, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2108.13264
- P161 First-person prediction survey：第一人稱未來預測survey，涵行為/位置/手物互動；背景與追引文來源。（PDF 1；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2107.13411
- P162 Egocentric hands survey：手部egocentric survey區分localization/interpretation/application；無新robot題库。（PDF 1；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/1912.10867
- P163 Ego-exo collaboration survey：Ego-exo survey以跨視角transfer/jointlearning整理，可支援示範來源分類。（PDF 1；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2506.06253
- P187 SSFold：SSFold報六foldtasks及human demonstrations；留方法實驗參考，初篩尚不宣稱已核所有trial協定。（PDF 1, 2；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2411.02608
- P189 GPT-Fabric：GPT-Fabric重用smoothing/folding範式，real10/12rollouts；sim粒子距離和real人工檢視不可混分。（PDF 1, 5, 7；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2406.09640
- P190 UniGarmentManip：UniGarmentManip三garment類/三task：unfold/fold/hang；重用資產/對應學習，不當三新datasets。（PDF 1, 3, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2405.06903
- P194 Cloth gripper interface：clothgripperinterface八個cornerfold cases驗證kinematicgrasp；省略摩擦contact，不能當完整physicsbenchmark。（PDF 1, 2；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2609.29340
- P195 World models for unfolding：worldmodelforunfolding在Unity/RFUniverse及realcloth驗證；保留模擬與policy方法參考。（PDF 1, 3, 7；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2602.16675
- P215 World-model evaluation survey：worldmodelevaluation survey列160benchmarks；作引文追查線索，其二手數字不直接併入已核來源。（PDF 1, 4；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2609.29669
- P218 TrajPilot：TrajPilot重用EgoExo4D/GoalStep/EgoPER，重點是trajectoryconditioning及horizon，不另算全部label為新task。（PDF 1, 7；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2605.20388
- P219 FROST-STA：FROST-STA是Ego4D2026challenge submission；query/GT由父challenge定義。（PDF 1, 3；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2606.00694
- P220 VISTA（Ego4D STA）：VISTA-STA合併train+部分val訓練、只報officialtest；不是新增dataset。（PDF 1, 3, 4；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2605.20901
- P221 STAformer++：STAformer++是AFF-ttention後續架構，EPIC-STA新增資源已連到P241，避免重列兩次。（PDF 1, 2；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2602.14837
- P223 INSIGHT：INSIGHT在Ego4D/EPIC55/EGTEA測意圖推理與預測，原生題庫歸父來源。（PDF 1, 2, 5；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2508.01742
- P227 EggHand：EggHand處理EgoExo4Dhandposeforecast，保留motion/frame定義與模型baseline參考。（PDF 1, 2, 5；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2605.07642
- P231 MADiff：MADiff用五publicdatasets與新增interaction-pointdiagnostics；標註/metrics從父資料衍生，非新capture。（PDF 1, 6, 9；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2409.02638
- P232 Diff-IP2D：Diff-IP2D新增jointpredictionmetrics、沿用EPIC/EgoPAT；並揭示USST的FDE erratum，保留評分版本參考。（PDF 1, 11；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2405.04370
- P234 I-CVAE：I-CVAE在Ego4DLTA預測20futureactions；oracleintent/GTactionablation應另列。（PDF 1, 2, 7；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2207.12080
- P235 TransFusion：TransFusion把contextsummary加入既有STA；GTcontext與推估context不可等同。（PDF 1, 2, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2301.09209
- P236 ActFusion：ActFusion統一segmentation/anticipation於Breakfast/Salads/GTEA；兩endpoint共用影片。（PDF 1, 2, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2412.04353
- P237 Gated Temporal Diffusion：GatedTemporalDiffusion在Breakfast/Assembly101/Salads做stochasticLTA；新模型不增加父庫活動數。（PDF 1, 2, 9；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2407.11954
- P238 Object-centric LTA：object-centricLTA用Ego4D/50Salads/EGTEA；objectprompt數非獨立task數。（PDF 1, 6；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2311.00180
- P239 MVP：MVP研究多尺度video pretraining與既有LTA/summaryforecast；保留觀測horizon參考。（PDF 1, 2, 7；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2307.12854
- P240 ANTICIPATR：ANTICIPATR在四existingdatasets做futureinstance預測；重用原split。（PDF 1, 9, 10；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2210.11566
- P242 NAOGAT：NAOGAT用Ego4DSTA及EK；noun/verb/box/TTCjointmatch是判分組合，非四倍題。（PDF 1, 7；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2308.08303
- P243 FactCheck（LTA）：FactCheck的Observe-Plan-Verify是預測流程內迭代，EPIC/EGTEA未執行robot物理環境。（PDF 1, 9, 10；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2606.14778
- P244 BiAnt：BiAnt在Ego4DLTA研究forward/backwardactionsequencelearning；初篩未新增獨立題庫。（PDF 1；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2508.00374
- P245 ICVL：ICVL在Ego4D/EPIC55/EGTEA研究vision-intentionfusion；保留方法與prompt參考。（PDF 1, 2；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2505.01713
- P248 HOIMotion：HOIMotion使用ADT/MoGaze及humanstudy；sceneobjectboxes是forecastinputs，不是新控制環境。（PDF 1, 2；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2407.02633
- P249 EgoCast：EgoCast使用EgoExo4D/ADT，提出較長horizon/估計而非GTpastpose；保留taskprotocol擴充參考。（PDF 1, 3, 4；原作摘要／貢獻與實驗摘錄初篩；非全文逐字或完整benchmark協定審核） https://arxiv.org/abs/2412.02903

## 擴查清單（未計入183已核來源）

- BEHAVIOR-100原作：需和BEHAVIOR-1K及EAI的B100 symbolic評測分開；現有書目未獨立登記。
- Assistive Gym與照護／穿衣任務來源：補照護場域，不能只以廚房/衣物替代身體接觸與可及性；需擴查原作。
- RoboMME及具身記憶相關原作：新記憶來源引用多個未獨立收錄的父benchmark；需逐個分清重用/新生成。
- ENIGMA-51、CASTLE2024、HO-Cap：已核來源的父素材未全獨立登記；依CapMem/OpenEgo原文追查。
- RoboBenchMart、SariBench：SABER的零售環境/下游task父來源需補獨立原作與manifest。
- Fold/cloth方法的完整原作清單：SSFold、GPT-Fabric、UniGarmentManip等67篇參考組中的custom實驗，可在逐task抽取時補規則/實例；本輪初篩不假稱已核所有程式。
- survey與引用鏈的新增來源：世界模型survey等提供更多候選。候選未審閱前不加進183已核來源，不以二手表格宣稱完整蒐集。

本次公開自己的閱讀摘要、頁碼、數字及來源指紋；不重新散布原作PDF。