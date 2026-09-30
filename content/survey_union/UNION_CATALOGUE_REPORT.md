# 來源聯集：目前分類、任務清單與補齊進度

日期：2026-09-29。來源目錄與執行子集分開；本輪沒有新增模擬或下載人類影片。

完整250篇書目已接到同一總目錄。其中143條為既有標記／比較表支持的benchmark或含評測資源；68條有原詳細比較，75條先前未進該表。其餘107篇保留為相關文獻或角色待核來源，其中45篇仍待判定資源角色，不當作已確定沒有benchmark。這是paper-level來源條目，含版本和衍生關係。

原5,020條來源保留，新增VIMA17、ARNOLD8、COIN180、CrossTask83，共5,308條。當中2,062條是原生機器人任務候選、263條是人類程序活動定義；其他整合註冊／協定／配對另列。

## Survey分布

| 分支 | 全部書目 | Benchmark／評測資源 | 原詳細比較 | 有task來源的書目 |
|---|---:|---:|---:|---:|
| 人類影片與動作資料 | 31 | 30 | 7 | 2 |
| 理解、推理與規劃 | 26 | 20 | 11 | 0 |
| 未來動作／互動預測 | 51 | 2 | 0 | 0 |
| 一般操作 benchmark | 31 | 29 | 19 | 14 |
| 布料／柔性物操作 | 26 | 13 | 11 | 4 |
| 導航與家務執行 | 12 | 11 | 5 | 4 |
| 穩健性、失敗與評測品質 | 18 | 17 | 5 | 0 |
| 人類觀測到機器人轉移 | 11 | 6 | 4 | 2 |
| 機器人資料與通用策略 | 16 | 1 | 0 | 0 |
| 輔助與協作 | 11 | 11 | 5 | 1 |
| 世界模型與預測表示 | 8 | 3 | 1 | 0 |
| Survey／評測方法 | 9 | 0 | 0 | 0 |

分布描述本目錄；不同名稱或版本不保證資料彼此獨立。

## 原生任務來源

| 來源 | 定義／條目數 | 原生單位 | Snapshot |
|---|---:|---|---|
| ALFRED | 7 | native_task_schema: 7 | 2026-09-22/25 |
| ARNOLD | 8 | native_task_class: 8 | 2026-09-29 |
| BEHAVIOR-1K | 1016 | activity_definition_directory: 1016 | 2026-09-22/25 |
| COIN | 180 | instructional_activity_definition: 180 | 2026-09-29 |
| CrossTask | 83 | instructional_activity_definition: 83 | 2026-09-29 |
| DeformableRavens | 25 | native_task_id: 25 | 2026-09-22/25 |
| DexGarmentLab | 15 | task_scene_entrypoint: 15 | 2026-09-22/25 |
| Embodied Agent Interface | 3 | evaluation_protocol: 3 | 2026-09-22/25 |
| GarmentLab | 10 | demo_entrypoint: 10 | 2026-09-22/25 |
| The Imitator Game | 53 | human_sim_task_mapping: 53 | 2026-09-22/25 |
| LIBERO | 130 | native_task_id: 130 | 2026-09-22/25 |
| ManiSkill3 | 65 | native_task_registration: 65 | 2026-09-22/25 |
| ManiSkill2 | 21 | native_task_registration: 21 | 2026-09-22/25 |
| Meta-World | 50 | native_task_id: 50 | 2026-09-22/25 |
| PARTNR | 6 | generator_configuration: 6 | 2026-09-22/25 |
| RLBench | 106 | native_task_class: 106 | 2026-09-22/25 |
| RoboCasa / RoboCasa365 | 365 | native_task_id: 365 | 2026-09-22/25 |
| RoboDojo | 54 | native_task_module: 54 | 2026-09-22/25 |
| RoboTwin / RoboTwin 2.0 | 50 | native_task_module: 50 | 2026-09-22/25 |
| RoboVerse | 2897 | integration_registration_group: 2897 | 2026-09-22/25 |
| SoftGym | 12 | native_task_id: 12 | 2026-09-22/25 |
| TEACh | 25 | native_task_schema: 25 | 2026-09-22/25 |
| VIMA | 17 | native_task_template: 17 | 2026-09-29 |
| VLABench | 96 | native_task_registration: 96 | 2026-09-22/25 |
| WatchAct | 14 | video_task_schema: 14 | 2026-09-22/25 |

## COIN作者原生領域

| 原生domain | 活動數 |
|---|---:|
| Dish | 16 |
| Drink and Snack | 13 |
| Electrical Appliance | 20 |
| Furniture and Decoration | 14 |
| Gadgets | 21 |
| Housework | 15 |
| Leisure and Performance | 17 |
| Nursing and Care | 14 |
| Pets and Fruit | 7 |
| Science and Craft | 15 |
| Sport | 10 |
| Vehicle | 18 |

此表完整保留COIN原生12域。它與本計畫舊12域不是同一套分類，也不代表這些人類活動已移植為機器人任務。

## 尚待補齊

- 143條評測來源中，27條已有可連結的固定task來源；116條尚待取得原生清單。已取得者的版本／subset仍須按原作核對。
- 既有700個搜尋候選中588個尚待納入審閱；完整分頁、跨資料庫與引用追查繼續進行。
- 全庫共同task／規則映射與跨來源重疊尚未完成。來源定義可以先收錄，執行與可解性另列。
- 本輪四個新增來源只核驗靜態定義，不把影片、樣式、goal參數或重跑次數當成新增任務家族。

完整條目、各欄來源、原生task IDs與缺失狀態可由CSV／JSON查回。
