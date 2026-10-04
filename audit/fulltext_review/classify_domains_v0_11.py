"""Serialize the task-based domain coding reviewed on 2026-10-04.

The 22 corrections below are authored from the pinned papers, not inferred by
matching paper titles. Previous positive assignments are retained explicitly.
The website consumes domain_assignments.json and never fills missing rows.
"""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
CONTENT=ROOT/"content/fulltext_review"
reviews={r["paper_id"]:r for f in sorted(CONTENT.glob("batch*.json")) for r in json.loads(f.read_text())}
receipts={r["paper_id"]:r for r in json.loads((CONTENT/"acquisition_receipts.json").read_text())}
old=json.loads((CONTENT/"domain_snapshot_v0_10.json").read_text())
prior={r["paper_id"]:r for r in old["sources"]}
corrections={}


def evidence(pid, domains, pages, examples, reasoning, locator="原作任務／資料／應用段落", basis="task_goal_induction"):
    return {
        "paper_id":pid, "domain_ids":domains, "pages":pages, "locator":locator,
        "observed_tasks":examples, "reasoning":reasoning, "basis":basis,
        "source_pdf_sha256":receipts[pid]["pdf_sha256"]
    }


def assign(pid, summary, items):
    corrections[pid]={"paper_id":pid,"summary":summary,"evidence":items,
                     "domain_ids":list(dict.fromkeys(d for e in items for d in e["domain_ids"]))}


assign("P058","預測人手將接觸的位置，讓共享工作區的機器人提前配合；同時是頭戴裝置的動作意圖介面。",[
    evidence("P058",["assistance","wearable"],[1],["人戴頭盔操作物件；UR10E接近預測的3D目標","從第一人稱影片預測手部動作意圖"],
             "從合作目標與穿戴輸入歸納為交互協助及動作介面，無須把場景硬命名成工廠或廚房。","摘要、Fig.1、Introduction")
])
meta_groups=[
    (["home"],["開關門窗／抽屜、水龍頭、掃除與上架"],"任務目標對應家居設備使用與整理。"),
    (["food"],["咖啡機按鈕、杯子移入／移出咖啡機、餐盤取放"],"餐飲器具的使用與準備可由具體任務歸納。"),
    (["craft","industry"],["鎚打螺絲、螺帽裝卸、插栓與拔栓"],"分別支援修繕與装配用途。"),
    (["leisure"],["籃球入框、足球入門的簡化任務"],"歸入球類操作用途；原作仍是桌面簡化任務。"),
    (["general"],["伸手至座標、推／拉puck、繞障取放"],"這些基礎作業直接以幾何目標定義，屬跨場域技能測試。")
]
assign("P063","50個任務已有明確的用途線索：家居設備、餐飲、修繕／裝配、球類操作，以及通用取放。",[
    evidence("P063",ds,[18],ex,why,"Appendix A, Table 2：50項任務定義") for ds,ex,why in meta_groups
])
assign("P065","開抽屜、控制燈與把物件收好屬居家整理；方塊轉動、推移與堆疊則保留為通用作業。",[
    evidence("P065",["home"],[3],["開關抽屜和滑門","按按鈕或開關控制燈","收納物件"],"即使場景是一張模擬桌，任務用途仍可判斷。","§III.A CALVIN Environment／Tasks"),
    evidence("P065",["general"],[3],["方塊抓放、轉動、堆疊與多步語言指令"],"抽象方塊與通用控制部分獨立歸類，不取代已能辨認的家居用途。","§III.A；34任務與環境設計")
])
assign("P073","從杯子擺放、蘋果收納、掃除、鎚擊與人際互動資料歸納，保留每種用途所對應的任務範圍。",[
    evidence("P073",["home","food"],[8],["Empty Cup Place","Apple Cabinet Storage","Block Sweep"],"對應餐具準備、食品收納和表面整理。","Table 1、資料設計與實驗段落"),
    evidence("P073",["craft"],[5,8],["Block Hammer Beat","依鎚子功能部位生成姿態"],"有具體工具作業目標，可歸納為工藝／修繕基礎作業。","工具生成流程、Table 1"),
    evidence("P073",["assistance"],[8],["17項資料任務中作者明列5項人際互動"],"協作用途由作者的資料範圍支持；不把全部6項DP3實驗都說成人機交接。","資料設計段落", "stated_application")
])
assign("P103","跟隨指定人是陪伴服務；原作亦明列照護、巡邏、導覽與物流的應用方向。",[
    evidence("P103",["assistance"],[1,6],["持續跟隨指定人","在人群與轉角維持距離、重新找回目標"],"由要服務的人與持續陪伴目標歸類。","摘要、§III Follow-Bench"),
    evidence("P103",["care","public","logistics"],[1],["eldercare","security patrols／guided tours","logistics"],"這些是原文明列的應用方向；實測範圍仍以跟隨情境與物理指標記錄。","Abstract／Note to Practitioners／Introduction","stated_application")
])
assign("P105","LIBERO-Plus改變觀測與初態條件，未改掉原任務的餐具擺放、廚房設備及收納用途。",[
    evidence("P105",["home","food"],[2],["沿用LIBERO的目標，改變相機、語言、燈光、材質與物件布局"],"衍生評測先查被重用的任務，擾動因素本身不另當生活用途。","§2 Perturbation Factors","inherited_task_scope"),
    evidence("P064",["home","food"],[3,4],["廚房／桌面物件取放、餐具與收納目標"],"用途繼承以原作選用的操作目標為依據，不根據『camera/noise』等字面詞決定。","LIBERO任務與場景設計","inherited_task_scope")
])
assign("P106","MetaWorld+保留原50項任務並修正版本和評測協定，因此沿用具體任務支持的用途。",[
    evidence("P106",["home","food","craft","industry","leisure","general"],[4],["原50項Sawyer任務","door／drawer／coffee／assembly／pick-place"],"先確認任務集合沿用，再對照原作完整任務表。","§4 Meta-World","inherited_task_scope"),
    *[evidence("P063",ds,[18],ex,why,"Appendix A, Table 2","inherited_task_scope") for ds,ex,why in meta_groups]
])
assign("P115","依示範選物、搬方塊、重畫路徑與插栓，歸入通用作業復現與装配基礎作業。",[
    evidence("P115",["general"],[2,3],["VideoRepick／VideoPlaceOrder／VideoUnmask","MoveCube／PatternLock／RouteStick"],"把記憶測驗還原成要完成的選物、搬運、路徑與操作步驟。","§3、Table 1"),
    evidence("P115",["industry"],[3],["InsertPeg：記住哪個插栓及如何插入"],"插栓目標提供装配用途的直接任務例子。","Table 1")
])
assign("P146","核心就是把人手中的物件交給機器人，歸入協助與交接用途。",[
    evidence("P146",["assistance"],[1,3],["human-to-robot handover","動態接近、接收抓握與姿態對齊"],"動態抓握是技術，接收人的物品是可歸納的服務用途。","摘要、Fig.1、handover定義")
])
assign("P147","按人的指令、時機和動作完成協作，涵蓋交接、同步、讓行及受干預後續作。",[
    evidence("P147",["assistance"],[3,4],["Instructor／Collaborator／Intruder角色","handover timing、shared-object synchronization、yielding、recovery"],"以明確的人際協作目標歸類，並保留13項任務的角色差異。","§3 Benchmark Design／Scope and Task Relevance")
])
assign("P182","歸納為易損物取放的通用作業；烘焙品形狀物件的放置情境另標餐飲處理方向。",[
    evidence("P182",["general"],[5,6],["40個物件／位置變化的pick-and-place設定","完成搬放且形變受限"],"觸覺與FEM是技術，取放且避免壓壞物件才是作業用途。","§3.1、Table 2"),
    evidence("P182",["food"],[5],["naturalistic bakery-style objects的搬放"],"由具體食品形狀物件及放置任務歸納餐飲處理方向；不擴稱為完整烹飪流程。","§3.1 Tasks, Objects, and Scenes")
])
assign("P197","身體攝影機用來恢復使用者動作及支援互動輸入，歸入穿戴互動與動作介面。",[
    evidence("P197",["wearable"],[1,5],["頭、腰、手腕、膝部六視角","全身3D姿態與相機定位","immersive Mixed Reality／手部動作輸入"],"原文明列穿戴和混合實境需求，能歸納應用，不必只留下『人體感知』技術標籤。","Introduction、§4 MultiEgoView")
])
assign("P198","用原作工具—動作—物件組合歸納：倒液與攪拌屬餐飲，清潔器具屬居家，手物動作建模亦服務AR／VR介面。",[
    evidence("P198",["food","home"],[2,5],["以spatula在pan攪拌","水壺向碗倒液","刷、刮、除塵等器具處理"],"由Fig.3–5的實際動作與器具判斷，沒有把『工具使用』留作未分類。","Introduction；Fig.3–5（含圖像核讀）"),
    evidence("P198",["wearable"],[2],["VR／AR的雙手—物件互動建模"],"原文應用說明支持動作介面用途。","Introduction","stated_application")
])
assign("P212","同時涵蓋物件操作與行走／平衡控制，歸入通用作業；門窗與咖啡／餐盤任務另標對應用途。",[
    evidence("P212",["general"],[8],["reacher、walker、hopper、cartpole、finger","reach、handle-press、plate-slide"],"主體是跨任務控制及擾動下的可靠作業，涵蓋移動與平衡。","§5.1 Evaluation Environments"),
    evidence("P212",["home","food"],[8],["window-open／window-close","coffee-pull與plate-slide"],"依已選取的10項Meta-World任務補具體用途，不整包繼承50項父庫。","§5.1選用任務清單","inherited_task_scope")
])
assign("P214","開櫃、找書、操作微波爐都有可辨認用途；純互動推理與幾何控制題保留在通用作業。",[
    evidence("P214",["home","food"],[20,23],["Open-Drawer／Open-Cabinet","Open-Microwave／Close-Microwave","FindBook-FromShelf"],"收納取物、設備使用及餐飲器具操作可從task ID與goal直接歸納。","Appendix H.2任務表"),
    evidence("P214",["general"],[4,17],["根據互動取得隱藏資訊，再調整操作","object-centric／robot-centric／compositional reasoning"],"抽象的物件／本體控制題有明確作業目標，歸入跨場域基礎作業。","§3.2、Appendix H.2")
])
assign("P128","核心目標是把未知物件推或抓放到指定位置，歸入跨場域物件搬移作業。",[
    evidence("P128",["general"],[3,5],["object relocation：pushing 或 grasping-and-placing","跨機器人、物件、場景與視角復用"],"場景未綁特定行業不妨礙歸納明確作業用途。","§3 Problem statement、§5.1")
])
assign("P193","產生穩定抓握並預測物件受力，歸入通用抓取與易損物處理作業。",[
    evidence("P193",["general"],[4,5,6],["單／雙手穩定抓取","穿透與接觸距離檢查","杯碗等可變形物的應力預測"],"不憑『研究在實驗室做』改稱濕實驗室用途；依抓取與保護物件的目標歸納。","Grasp Validation、Dataset Quality、Stress Force Prediction")
])
assign("P216","預測頭部轉向以看到被遮擋的操作目標，歸入穿戴觀察與動作介面。",[
    evidence("P216",["wearable"],[1,5],["目標被遮擋時預測適當head reorientation","頭手協同的6DoF頭部動作預測"],"由使用者的視線取得與頭戴相機動作需求歸納。","Fig.1、Introduction、Bottle資料")
])
assign("P222","把手部預測連到互動介面與機器人示教；杯墊擺杯、蘋果入盤和盒子上架另提供餐飲／整理用途。",[
    evidence("P222",["wearable","general"],[9,10],["人手動作與contact state預測","HAT把預測軌跡與開合訊號轉成robot end-effector作業"],"預測端是動作介面，執行端是通用取放／示教；分項保留原作評估方式。","§4.1 CABH／HAT"),
    evidence("P222",["home","food"],[9,10],["cup on coaster","apple on plate","box on shelf"],"這三個具體任務支持餐具準備、食品放置及收納用途。","Fig.9與CABH定義")
])
assign("P224","預測雙手未來動作並產生操作計畫，歸入穿戴互動與動作介面。",[
    evidence("P224",["wearable"],[1,4],["雙手五秒動作預測","每隻手的操作計畫","原文明列VR／AR、robot learning、human-robot collaboration"],"依動作輸出和交互應用歸納；不因使用EgoDex就假設111項保留任務涵蓋父庫所有用途。","Introduction、EMPIRE-651K資料")
])
assign("P228","即時語言引導手部預測歸入動作介面；其Kitchen與Adroit下游評測另外歸納家居／餐飲與通用作業。",[
    evidence("P228",["wearable"],[1,5],["real-time AR／assistive robotics的hand-state forecasting"],"原文明列即時交互用途。","Abstract／Introduction","stated_application"),
    evidence("P228",["home","food","general"],[5],["開燈、開門／微波爐、轉爐具旋鈕","重定向筆與搬球"],"只依實際列出的下游task歸納，沒有把全部Ego4D用途自動搬入。","Fig.3與§5.1")
])
assign("P230","包含視野外雙手的姿態與動作預測，歸入AR／VR等穿戴動作介面。",[
    evidence("P230",["wearable"],[1,2],["in-view／out-of-view手部軌跡與關節預測","AR／VR、HRI與assistive technology"],"由目標輸出與原作應用動機歸納，視野外只是評測條件，不是用途缺失。","Introduction、task formulation")
])

# Apply the same new-category criteria to already-classified sources.
# Each entry is supported by that source's existing task-section review.
additional = {
    "general":{
        "P062":"共享桌面上100種獨立操作task，作為跨任務控制底座。",
        "P067":"取放、精密插入、關節操作及避障等基礎task families。",
        "P068":"經典控制、locomotion、桌面與移動操作的通用任務平台。",
        "P069":"Lift、Stack、PickPlace等通用作業與装配／清潔並存。",
        "P075":"依視覺提示搬移物件、匹配目標、模仿與避開限制。",
        "P076":"幾何插入、Hanoi、對齊等通用題與packing／palletizing並存。",
        "P077":"語言條件下物件取放、組合與視覺屬性泛化。",
        "P081":"以數量化目標控制位置、方向、關節及水量。",
        "P082":"多來源操作／導航／人形技能的跨機體通用作業整合。",
        "P083":"42個模擬task含記憶、長流程、精度與泛化作業。",
        "P084":"工具、幾何、動力與多物件控制的代表性問題。",
        "P107":"20個基本操作task上的物件／場景擾動。",
        "P123":"物件操作中的示範模仿、反向執行、記憶與條件流程。",
        "P125":"多機體、技能與物件的通用robot作業資料整合。",
        "P129":"包含RLBench、Meta-World及自定義的147項操作。",
        "P151":"剛體、機構、插入等通用作業效果的影片生成評測。",
        "P152":"人手與機器人操作條件下的通用動作效果預測。",
        "P169":"桌面／移動等44項基礎操作與能力維度。",
        "P171":"多手型下26種任務—機體操作設定。",
        "P177":"杯碗處理之外，另有donut插入、方塊順序裝盒的通用作業。"
    },
    "assistance":{
        "P061":"人機接觸情境中的意圖、態度與動作辨識。",
        "P097":"Commander／Follower對話協作完成家務。",
        "P113":"互動失敗後辨識使用者偏好的恢復策略。",
        "P141":"真人執行者與遠端指導者的協助／介入流程。",
        "P142":"找人、跟人及兩代理社交整理。",
        "P143":"人類與機器人的互補限制及協作家務。",
        "P145":"配合人正在進行的活動，提供不中斷對方的協助。",
        "P148":"餵食、刷牙、擦身與手臂協助等服務。",
        "P168":"非語言／語言意圖、人機物關係及社交導航。",
        "P208":"同場協助者的口頭與身體介入，以及接收者需求。",
        "P209":"預測人將對服務平台取放或接觸，支援合時互動。",
        "P210":"從人交付的部分裝配狀態續作和錯誤修復。"
    },
    "wearable":{
        "P013":"第一人稱手物狀態、人體互動與未來動作等交互訊號。",
        "P014":"Ego／Exo對應、3D手／身體姿態等動作介面資料。",
        "P018":"頭戴觀察中的手姿態、物件姿態與手中物分割。",
        "P019":"穿戴視角下互動對象的3D人體形狀與姿態。",
        "P020":"動態人群的3D追蹤、姿態與mesh表示。",
        "P051":"第一人稱3D手部軌跡預測。",
        "P053":"依明示或隱含語言需求預測手部軌跡。",
        "P057":"手部motor attention與接觸位置預測。",
        "P060":"3D互動位置與全身姿態的聯合預測。",
        "P119":"Apple Vision Pro手部示範、未來軌跡與inverse dynamics。",
        "P199":"多個ego來源的統一手部關節與語言動作介面。",
        "P225":"Ego／Exo示範支持的語言引導3D手姿態預測。",
        "P226":"眼鏡／頭盔使用者的6DoF移動與凝視訊號。",
        "P229":"第一人稱全身動作重建、預測與生成。",
        "P233":"手部軌跡及與物件接觸位置的聯合預測。",
        "P247":"使用者未來3D視覺範圍與凝視預測。",
        "P250":"動作意圖與手腕6DoF軌跡連接的交互介面。"
    }
}

if __name__=="__main__":
    missing={p for p,r in prior.items() if not r["domain_ids"]}
    assert missing==set(corrections), "All and only the original 22 require explicit corrections"
    assignments=[]
    for pid,r in reviews.items():
        if pid in corrections:
            a=corrections[pid]
        else:
            ids=prior[pid]["domain_ids"]
            a={
                "paper_id":pid,"domain_ids":list(ids),
                "summary":"依已核讀的任務、活動或場景保留用途歸納；原作任務細節與分類依據一起提供。",
                "evidence":[evidence(pid,ids,r["pages_read"],[r["tasks"],r["environment"]],
                    "保留前輪已具來源支持的正向用途編碼；本版改存逐篇判定，不由網站在建置時比對字詞。",
                    "2026-10-02原作任務／場景審閱範圍","retained_task_review")]
            }
            for domain,rows in additional.items():
                if pid in rows:
                    a["domain_ids"].append(domain)
                    a["evidence"].append(evidence(pid,[domain],r["pages_read"],[rows[pid]],
                        "將相同用途定義套用到全庫中符合條件的既有來源。","已核讀任務／端點定義"))
        a.update({
            "version":"domains-0.11","classified_on":"2026-10-04",
            "source_pdf_sha256":receipts[pid]["pdf_sha256"],
            "previous_domain_ids":prior[pid]["domain_ids"],
            "resolved_from_v0_10":pid in missing
        })
        assert len(a["domain_ids"])==len(set(a["domain_ids"])) and a["domain_ids"]
        assignments.append(a)
    (CONTENT/"domain_assignments.json").write_text(json.dumps({
        "version":"domains-0.11","date":"2026-10-04","source_scope":183,
        "method":"task_object_scene_to_application",
        "original_unassigned_paper_ids":sorted(missing),
        "assignments":sorted(assignments,key=lambda a:a["paper_id"])
    },ensure_ascii=False,indent=2)+"\n")
    print(f"Authored assignments: {len(assignments)}; resolved original gaps: {len(missing)}")
