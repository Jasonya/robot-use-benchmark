"""Second set of manually authored primary-section reviews."""
import json
from authored_additions import ROOT, rows, note

rows.clear()

note("P120",[1,3,4,6,7],"人類示範與技能轉移",
     ["居家生活","工業製造","零售與購物","辦公活動","衣物與紡織","實驗室操作"],
     "作者報9,869scenes的人類影片；語義場所/影片scene定義及與其他corpora交集待核。",
     "人類6,015task labels、對齊midtraining344tabletop tasks；主實機只5dexterous goals。",
     "報告20,854hpretraining，並使用EgoDex829h（不另外相加）；midtrain50hhuman/4hrobot；下游每task100robotdemos，shirt20。",
     [("environment",9869,"作者報告human scene labels",[3]),("task",6015,"human pretraining task labels",[3]),("task",344,"aligned midtraining tabletop tasks",[4]),("task",5,"real-robot evaluation tasks",[6,7]),("data",20854,"human pretraining hours",[3])],
     ["whole-task SR、fine-grained completion；兩trainingseeds、通常每checkpoint/task10trials。"],["環境狀態與過程檢查"],
     "分大規模人類pretrain、配對midtrain、下游posttrain；非zero-robot-data。",
     "EgoDex與in-house資料；場景/task/object統計與DreamDojo相同數字，不能假定是獨立新增corpus。",
     ["protocol稱TaskIII每bottle16trials，但tasklist瓶蓋是TaskIV，需manifest釐清。"],
     "人類資料規模的必要對照；要分6,015訓練標籤、344對齊任務與5實測目標。")

note("P132",[1,4,5,7,8,9],"通用策略的原作任務評測",
     ["餐飲與料理","居家生活"],
     "三evalenvironments：robotclassroom與兩個realofficekitchens；13robots不是13獨立場景。",
     "Table1有744language instructions，依verb分skill；不等同744工作家族。",
     "約130Kdemonstrations；主seen>200instructions、unseen21、robustness30/22、long15；全研究>3,000trials。",
     [("environment",3,"evaluation environments",[8]),("task",744,"language instructions",[7]),("task",21,"held-out novel instructions",[8]),("task",15,"long-horizon instructions",[9]),("data",3000,"全研究real trials（>3000）",[8])],
     ["task SR與SayCan長流程成功；architectures在相同RT1資料重訓。"],["環境狀態與過程檢查"],
     "novelinstructions保持object/skill可在別的training組合看過；OOD場景另列。",
     "自收Google/EverydayRobot資料，後被OXE/其他策略重用。",
     [">3,000是跨method/condition執行次數；不能當3,000獨立test cases。"],
     "說明前作也能有數百instructiontasks；比較規模必須對齊語義粒度。")

note("P150",[1,2,4,5,8,9,10],"世界模型與影片生成評測",
     ["居家生活","工業製造","零售與購物","辦公活動","交通與移動","工藝與修繕"],
     "Table1的1.135M scenes與正文9,869unique scenes不一致；暫不取其中任一為去重環境總量。",
     "6,015skills/tasks由GPT對globalcaptions估計；6個generation evalsets非6生活domains。",
     "DreamDojo-HV43,827h，加入in-lab55h/EgoDex829h後44,711h；多數eval100samples，兩個image-edited sets各25。",
     [("data",43827,"DreamDojo-HV video hours",[5]),("data",44711,"three-source mixture hours",[5]),("task",6015,"GPT-estimated skill/task labels",[5]),("case",25,"samples per edited-background eval set",[10])],
     ["PSNR/SSIM/LPIPS；editedsets無配對futureGT，12volunteers做physics/action-following偏好比較。"],["數值誤差與相似度","人類或模型判讀"],
     "humanpretrain後robotposttrain，GR1是主要驗證平台；counterfactual與backgroundedit分項。",
     "EgoDex＋in-house；和EgoScale的scene/task/object統計一致是待核同源線索，非已證實完全相同。",
     ["1.135M scene與9,869scene粒度矛盾；表中其他前作hours也不可代替原始論文校核。"],
     "規模非常大的world-model資料來源；不能把44K人類影片小時或生成視覺評分当作可執行task庫。")

note("P213",[1,2,3,4,5,6],"專業場域規劃benchmark",
     ["園藝與戶外","多機器人協作"],
     "Fuji apple及citrus orchard RGB-D資料；citrus父庫432images，实际held-outscene數未報。",
     "multi-armCartesian fruit harvesting的offlineallocation/waypointplanning；apple/citrus兩作物設定。",
     "每crop共用同一held-outimage集合；未報可核固定題數，不能將父庫432全填成eval cases。",
     [("asset",2,"crop types，非兩種生活domain",[5])],
     ["detection/harvested ratio、arm-order violation、pathdistance/token成本；harvested其實是waypoint距離門檻0.25/0.5/1m。"],["數值誤差與相似度","環境狀態與過程檢查"],
     "zeroshot同prompt；沒有在線replanning或真的摘果控制。",
     "既有果園資料＋新plan/verifier；collision指order違反，非完整動力學碰撞檢查。",
     ["exactevalsceneIDs未報；高harvestedratio不可當物理摘取成功。"],
     "補農業用途與多臂分配，但轉成執行benchmark仍需assets、接觸和摘取驗收。")

note("P216",[1,2,5,6],"動作與軌跡預測",["桌面物件操作","人體動作與身體感知"],
     "Bottle12RGB-Drecordingsessions，clutter/reach變化；camera估計作headmotionproxy。",
     "預測6DoFheadmotion；EgoPAT3Dv2父benchmark另列。",
     "Bottle382clips，sessions10train/1val/1test；單一testsession不是廣泛場地泛化證明。",
     [("data",382,"Bottle clips",[5]),("data",12,"recording sessions",[5]),("case",1,"held-out test session",[5])],
     ["translationADE/FDE(mm)、rotationADE/FDE(degrees)；DA3/ORB3感知backend敏感性另測。"],["數值誤差與相似度"],
     "sessiondisjoint；各模型同window/horizon/smoothedpose。",
     "新Bottlecapture＋EgoPAT3D、pseudo3Dheadtargets。",
     ["camera pose proxy不等於獨立mocapGT；dataset完整releaseID待核。"],
     "補視角移動/遮擋規則與activeperception預測，而非只評手部。")

note("P217",[1,2,6,7],"穩健性與分布外評測",["餐飲與料理"],
     "EGTEA/EPIC原資料；破壞TSNfeaturetokens，不是重新收集真實sensorfailures。",
     "actionanticipation下六maincorruptions；額外standaloneblur是severitytransfer。",
     "EGTEA processed split10,321clips；EK100自訂trainingvideos90/10切，不可和官方leaderboard直接比。",
     [("task",6,"main temporal corruption conditions",[7])],
     ["jointverb+nounTop1、平均corruptedaccuracy及RelativeRobustness=AvgC/clean。"],["答案或標籤比對"],
     "compatibilitygraph只trainlabels、λEGTEAval選；EKpipeline125verbs/352nouns不同官方97/300。",
     "既有影片加新corruptionprotocol，不新增生活domains或原始action庫。",
     ["本文自訂indexspace與officialsplit不同；clean低時RR可能誤導，須同報absoluteaccuracy。"],
     "可以新增robustness規則cases並保持原task引用，清楚標記feature-level擾動。")

note("P222",[1,9,10],"動作與軌跡預測",["桌面物件操作"],
     "新CABH頭戴RGB-D與HAT固定ALOHAcamera；既有五publicdatasets另列。",
     "CABH3humanHOItasks；HAT5robottransfertasks，5個不是所有publicdatasetssemanticunion。",
     "CABH1,200videos；HAT2,800handvideos（400/400/400/800/800），每task10physicaltrials。",
     [("task",3,"CABH interaction tasks",[9]),("task",5,"HAT robot tasks",[10]),("data",1200,"CABH videos",[9]),("case",50,"HAT physical trials，5×10",[10])],
     ["hand/headtrajectory與contactstate預測；HAT按完整predictedtrajectory執行。"],["數值誤差與相似度","環境狀態與過程檢查"],
     "HAT只取第一幀產生完整motion，是look-then-move而非同等closed-loop視覺policy。",
     "CABH/HAT新資料；EgoPAT3D/H2O/HOT3D/Ego4D/EPIC重用。",
     ["CABH精確split與全部frameID仍需manifest；依據單幀的open-looptransfer不可當通用在線成功率。"],
     "補humanmotion到robotinterface，但必須標明executionmode與觀測限制。")

note("P224",[1,2,4,5,6],"動作與軌跡預測",["桌面物件操作"],
     "EgoDex原recordings，沒有新增111獨立物理場景。",
     "111tasklabels下bimanual5秒motionforecast＋explicitplans；原作194只保留subset。",
     "650,910trainwindows、6,836testwindows；non-overlapping5swindows，parentepisodes先分。",
     [("task",111,"retained source task labels",[4]),("data",650910,"training windows",[4]),("case",6836,"held-out test windows",[4,6])],
     ["best-of8按MPJPE選trajectory再算wrist/fingerrelative；不是單次控制policy。"],["數值誤差與相似度"],
     "原EgoDexofficialsplit；85unseentasks僅Part1ablations，fulltrain111tasks都seen。",
     "EgoDex→EMPIRE650K，Qwencaption/plan＋MANOfitting；100caseaudit84%usable，未全部人工審核。",
     ["difficulty按baselineMPJPE分43/49/19，僅模型相對难度；不得當通用easy/medium/hard真值。"],
     "可借規劃介面與預測粒度，同時保留生成標籤品質及best-ofK預算。")

note("P225",[1,2,5,6],"動作與軌跡預測",["組裝與拆解","跨域人類活動"],
     "AssemblyHands/EgoExo4D/EgoMe原場景，exovideo供訓練supervision。",
     "vision-language3Dhandposeforecast；EgoMe-pose為新增derivedbenchmark。",
     "AssemblyHands6120/355/355；EgoExo10869/1540/1540；EgoMe6067/1344/2648 train/val/test episodes。",
     [("case",355,"AssemblyHands test episodes",[5]),("case",1540,"EgoExo4D test episodes",[5]),("case",2648,"EgoMe-pose test episodes",[6])],
     ["root-alignedMPJPE/MPJVE(mm)，不同source15/30fps。"],["數值誤差與相似度"],
     "EgoMe只保留correctimitation，>95%frames有效；generatedpose和depth不是全部mocapGT。",
     "Assembly101→AssemblyHands及EgoMe新pose標註；父場景不能再加。",
     ["root-alignederror不檢驗世界坐標全局定位；episode數不可代替獨立sourceclip數。"],
     "補exo示範監督與finefingerprediction，但不混成robotphysicalexecution。")

note("P226",[1,2,3,4,5,6,7],"動作與軌跡預測",["交通與移動","戶外活動"],
     "7outdoorwaypoints/21origin-destinationpairs；waypoint和route不等於21獨立地理環境。",
     "wearer6DoFtrajectoryprediction，gaze/sceneannotations作modalities。",
     "75participants各1session，10.7h/1.15Mframes；38,606annotatedframes非相同數量testcases。",
     [("data",75,"participants and recording sessions",[4,5]),("data",10.7,"recording hours",[5]),("environment",7,"navigation landmarks",[4])],
     ["ADE/FDE與headrotationL1error；route多樣性另用DTW。"],["數值誤差與相似度"],
     "held-outsessions；地理場域和路徑可能重用，不等於unseencitygeneralization。",
     "新QuestProcapture；VLMsemanticlabels與真實trajectory/pose區分。",
     ["exactheld-outwindowcount和完整protocol需要release核；不將1.15Mframes當predictionquestions。"],
     "擴到戶外行走的預測用途；屬人類導航資料，不是機器人互動模擬房屋。")

note("P228",[1,2,3,4,5,6],"動作與軌跡預測",["跨域人類活動","桌面物件操作"],
     "Ego4D→EgoHOD/EgoVid衍生影片；worldcoordinates由估計camera/hand取得。",
     "streaming3Dhandstateforecast（type/box/pose/globaltrajectory）；Kitchen/Adroit只做下游representationtransfer。",
     "247K三秒clips＝242Ktrain/5Ktest，3.95Mhandannotations；不是3.95M独立taskcases。",
     [("data",247000,"3-second clips（約數）",[5]),("case",5000,"test clips（約數）",[5]),("data",3950000,"hand annotations（約數）",[5])],
     ["ADE/FDE、wristalignedJPE/PA-JPE、2Dboxrecall/FPS；SFHand*使用GTstate oracle另列。"],["數值誤差與相似度","答案或標籤比對"],
     "test時間autoregression吃前一步預測；普通SFHand不可和oracle58.8FPS/accuracy混成同設定。",
     "Ego4D/EgoHOD/EgoVid共同影片，再用HaMeR生成pose。",
     ["paper『4M Ego4D videos』實為衍生片段層級，不能當4M原始長影片；scene/video-disjoint split需核。"],
     "補streaming預測規則及teacher-forcing/oracle邊界，sourceclip/traininglabel分開。")

note("P229",[1,2,3,4,5],"動作與軌跡預測",["餐飲與料理","運動與身體技能","音樂與表演"],
     "EgoExo4D原takes，新增pseudoSMPL-X重建。",
     "reconstruction、forecasting、generation三不同觀測條件；同資料重用。",
     "EE4D-Motion110+h；143Ktrain8sclips（每2s抽）、4,400valclips（每20s抽）。",
     [("task",3,"motion endpoints",[3]),("data",143000,"training clips（約數）",[5]),("case",4400,"validation clips",[5])],
     ["MPJPE/PA/handerror、headpose、footcontact/sliding、semantic/FID；不同endpoint分項。"],["數值誤差與相似度"],
     "officialtake-levelsplit；forecast看2s預測6s，generation只看一幀，reconstruction可看全input。",
     "EgoExo4Dmulti-viewoptimization生成新motionlabels；非110h新獨立capture。",
     ["三端點accuracy/inputs不同，不能用同一個難度或成功率比較；best-ofK需最終protocol固定。"],
     "補全身與scene-awareforecast，但應防止把reconstruction偷看未來當forecast。")

note("P230",[1,2,5,6],"動作與軌跡預測",["跨域人類活動","人體動作與身體感知"],
     "EgoExo4Dbody/handannotations合併，原場景重用。",
     "in-view/out-of-viewhandtrajectory/poseforecast，body作constraint。",
     "156Ktrain/34Ktest是按hand-side的sequencecounts；同片左右手不可當獨立scene。",
     [("data",156000,"hand-side training sequences（約數）",[5]),("case",34000,"hand-side test sequences（約數）",[5])],
     ["ADE/FDE、MPJPE/lastframeMPJPE，單一generatedsample，沒有best-ofK放大。"],["數值誤差與相似度"],
     "officialtrain/valastrain/test，2sobs→1sforecast10fps；GT2Dhands作input，autobody只train。",
     "EgoExo4Dbody與handsubset；metric對不同validjoints適用分母不同。",
     ["要核hand-side數轉uniqueclip的關係；不能將156K+34K稱190K獨立humanactivities。"],
     "加入遮擋/視野外預測的規則對照，並標明ground-truth感知input優勢。")

note("P233",[1,4,5,6],"動作與軌跡預測",["餐飲與料理"],
     "EPIC55/100及EGTEA原影片，EK100擴充EK55。",
     "handtrajectory與objectcontacthotspot聯合預測。",
     "EK55train8523/evaltrajectory1894/hotspot241；EK10024148/3513/401；EGTEA1880/442/69。三種數字分别是訓練、軌跡評測與hotspot評測。",
     [("case",1894,"EK55 evaluation hand trajectories",[5]),("case",3513,"EK100 evaluation hand trajectories",[5]),("case",442,"EGTEA evaluation hand trajectories",[5]),("case",69,"EGTEA evaluation hotspots",[5])],
     ["trajectory取20samples最小error；contactpoints全部轉heatmap評，不是20次獨立case。"],["數值誤差與相似度"],
     "評原validation，正式actiontest不用於此derivedtask；hotspot只人工審核challengingsubset。",
     "autoannotations＋人工filteredhotspots，後被多篇forecast論文重用。",
     ["不同target只覆蓋各自subset，1894不能全視為1894jointlabelcases。"],
     "是hand/hotspot聯合規則的基礎來源；保留每個target的可用label分母。")

note("P241",[1,3,10,11],"動作與軌跡預測",["餐飲與料理"],
     "EPIC-Kitchens新增STAannotations；Ego4D v1/v2原場景。",
     "next-activeobject box/noun/verb/time-to-contact聯合預測。",
     "新增EPIC-STA驗證集；已讀原文mainsections未給精確casecount，待annotationmanifest。",
     [("task",1,"STA joint prediction formulation",[10])],
     ["N、N+V、N+TTC、All Top5mAP；不是四個互不相干task庫。"],["答案或標籤比對","數值誤差與相似度"],
     "Ego4Dv1/v2訓練量和test榜分列，v2含v1；EPICval自建benchmark。",
     "EPIC父標註→STA、OCT-stylehotspots；STAformer++是後續方法版本。",
     ["精確newannotationID與共同scene/task映射待code核，未知不填0。"],
     "論文名字像方法但附帶新benchmark，應納入來源總庫並連回EPIC。")

note("P246",[1,2,3,4,5],"評測方法與不確定性",["餐飲與料理","人機協作"],
     "EGTEA/EPIC100既有影片。",
     "partial-prefixactionprediction下correctness/calibration/selectiveutility/confidencegeometry四種診斷。",
     "預設K10候選、M5stochasticsamples/input；原作精確evalsegmentIDs未報。",
     [("data",5,"stochastic model calls per input",[5])],
     ["Top1/Recall@K、Top1/SetECE、accuracy-coverage、entropy；不是physicalsafety驗證。"],["答案或標籤比對","數值誤差與相似度"],
     "稱用officialtest，singleGemini2.5Flash-lite；K/M改變結果及成本，不能算多出5倍題。",
     "對既有benchmarks加uncertaintyprotocol；有助規則/拒答評測。",
     ["Set-ECE用TopK平均confidence對setcorrectness，是作者定義，需另外驗證適用性。"],
     "我們可加入拒答/澄清閾值與accuracy-coverage曲線，但要有相應標籤和同模型預算。")

note("P247",[1,5,7,8],"動作與軌跡預測",["居家生活","餐飲與料理","醫療支援","交通工具與維修","運動與身體技能","音樂與表演"],
     "AEA的143recordings/7.3h與EgoExo4D五活動子集；排除soccer/basketball/dance。",
     "3Dvisualspanforecast，多個視角範圍是同target不同granularity。",
     "FoVS-Aria約23.2Ksample（19.3K/1.9K/2.1K）；FoVS-EgoExo341.4K（274.7K/29.6K/37K），概述364.6K。",
     [("case",2100,"FoVS-Aria test windows（約數）",[7]),("case",37000,"FoVS-EgoExo test windows（約數）",[8]),("data",364600,"combined forecast windows（約數）",[1,7,8])],
     ["3DIoU/F1、fovealregiondistance；16格/3.2m＝20cmcell resolution，不當精確gaze接觸。"],["數值誤差與相似度"],
     "AEA location4heldout；look2spredict2s，EgoExo預測4s；split約數四捨五入不精確加總。",
     "AEA/EgoExo4DSLAM+gaze衍生volume；windowoverlap與sourcecaptures要追蹤。",
     ["visualspan≠robotactiveperceptionpolicy；也未覆蓋所有EgoExo8activities。"],
     "補注視/可見區域預測，讓世界觀測能力不只侷限於問答或手軌跡。")

note("P250",[1,2,3,4,5,6],"動作與軌跡預測",["居家生活","餐飲與料理","交通工具與維修"],
     "EgoExo4D/Nymeria以1014pretrain/498finetune/78testscene標籤分開；HOT3D testonly。",
     "interactionstage-aware6DoFwristforecast；semantic/spatial/motionQA三訓練類別。",
     "EgoMAN-Bench2844unseen+990HOT3DOOD＝3834trajectories；3MQA為生成supervision概述，非3Mtestquestions。",
     [("case",2844,"EgoMAN-Unseen trajectory cases",[4]),("case",990,"HOT3D-OOD trajectory cases",[4]),("data",3000000,"structured QA supervision（概要約數）",[1,2])],
     ["ADE/FDE/rotation/DTW，best-ofK1/5/10；waypointcontact/traj-distance另報。"],["數值誤差與相似度"],
     "sceneheldout及datasetOOD；up-to5sforecast，GTduration/masks用於判分。",
     "EgoExo4D/Nymeria/HOT3D重用，再生成interaction/QAlabels；可與OpenEgo、UniHand有父素材重疊。",
     ["219K/220K+trajectory概要與74K+17Ktrain分項不是同一層；待release對hand/clip單位核。"],
     "是端點/規則擴充產生大QA量的對照；主benchmark應以3834testtrajectory分母比較。")

if __name__ == "__main__":
    (ROOT / "content/fulltext_review/batch19.json").write_text(json.dumps(rows,ensure_ascii=False,indent=2)+"\n")
    print(f"Serialized {len(rows)} authored additional-source reviews.")
