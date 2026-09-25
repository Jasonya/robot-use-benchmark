export function renderResearchPage(locale,stats,papers,additions,lineage,helpers){
  const {t,escape,relative,routeLink,breadcrumb,chapterNav,shell}=helpers;
  const route='research.html',nav=chapterNav(route,locale);
  const dl=relative(`${locale}/${route}`,'downloads/literature-refresh/');
  const categories=[...new Map(papers.map(p=>[p.primary_category_code,p.primary_category_zh])).entries()];
  const categoriesTable=`<div class="table-scroll"><table id="research-category-table"><thead><tr><th>${t('文獻主分類',locale)}</th><th>${t('篇數',locale)}</th><th>${t('本庫比例',locale)}</th></tr></thead><tbody>${categories.map(([code,name])=>`<tr><td><a href="${routeLink(route,'library.html',locale)}?category=${code}">${t(name,locale)}</a></td><td>${stats.primary_categories[code]}</td><td>${(100*stats.primary_categories[code]/stats.combined_paper_records).toFixed(1)}%</td></tr>`).join('')}</tbody></table></div>`;
  const targets={
    action_label:'下一動作標籤',action_sequence:'長期動作序列',dense_action_timeline:'密集動作時間線',
    next_object:'下一互動物件',time_to_contact:'接觸發生時間',hand_trajectory:'手部路徑',hand_pose:'手部關節姿態',
    contact_location:'接觸位置／hotspot',contact_state:'接觸／分離狀態',head_motion:'頭部運動',body_motion:'全身運動',
    wearer_trajectory:'相機佩戴者移動路徑',gaze_visual_span:'凝視／3D視覺範圍',intention:'意圖',outcome:'活動結果',
    summary:'未來活動摘要',early_recognition:'已開始動作的早期辨識',uncertainty:'不確定性／信心',
    hand_object_motion:'手物聯合運動',interaction_mode:'協助／互動模式',interaction_onset:'互動即將發生'
  };
  const forecastTable=`<div class="table-scroll"><table id="research-forecast-table"><thead><tr><th>${t('預測目標',locale)}</th><th>${t('新增文獻標籤次數',locale)}</th></tr></thead><tbody>${Object.entries(stats.new_forecasting_target_counts_nonexclusive).map(([key,n])=>`<tr><td>${t(targets[key]||key,locale)}</td><td>${n}</td></tr>`).join('')}</tbody></table></div>`;
  const newest=additions.map(p=>`<tr><td><a href="${routeLink(route,'library.html',locale)}#${p.id}">${p.id} · ${t(p.short_name,locale)}</a></td><td>${p.year}</td><td>${t(p.primary_category_zh,locale)}</td><td>${t(p.scope_note,locale)}</td></tr>`).join('');
  const body=`<div class="reader-layout"><aside class="chapter-sidebar">${nav}</aside><main class="reader" id="main-content"><details class="mobile-chapter-nav"><summary>${t('章節與資料庫',locale)}</summary>${nav}</details>${breadcrumb('文獻更新與分類',route,locale)}
    <div class="eyebrow">LITERATURE · TAXONOMY · EVIDENCE</div><h1>${t('250篇文獻，逐步連到可用的評測。',locale)}</h1>
    <p class="lede">${t('在原168篇上補入82篇原始書目与完整摘要審閱。這裡說明怎麼找、怎麼分、對benchmark設計有何影響，以及哪些範圍還沒查完。',locale)}</p>
    <div class="page-meta"><span>${stats.cutoff_date}</span><span class="pill status">${t('有範圍界線的文獻整理',locale)}</span></div>
    <div class="scale-target-grid"><div><strong>${stats.combined_paper_records}</strong><span>${t('正式收錄書目紀錄',locale)}</span></div><div><strong>${stats.combined_complete_abstract_review_flags}</strong><span>${t('有完整摘要審閱紀錄；不是全文審计',locale)}</span></div><div><strong>${stats.literature_primary_prediction_records}</strong><span>${t('主要分類為預測的文獻',locale)}</span></div><div><strong>${stats.unique_discovery_candidates}</strong><span>${t('搜尋候選，未全部納入或審閱',locale)}</span></div></div>
    <div class="prose">
      <h2 id="research-method">${t('怎麼搜索，還有哪些界線',locale)}</h2>
      <p>${t('20組arXiv查詢涵蓋robot benchmark、人類影片轉移、Ego預測、身體相機、柔性物、導航、協作、恢復、世界模型、記憶與實驗室。每組最多前50筆，合計853次命中、700個不同ID；分頁與其他資料庫仍待補齊。',locale)}</p>
      <p>${t('700候選中，24筆原已收錄，82筆新納入且讀過完整摘要；5筆排除、1筆較早關聯版本另連結，588筆尚未完成納入審閱。每篇保留來源日期、回應hash和本計畫撰寫的用途筆記。',locale)}</p>
      <p>${t('沒有將700搜尋命中算成700篇已讀研究，也沒有宣稱找到所有相關論文。VLOG組合查詢沒有回傳；原VLOG、HowTo100M、COIN等來源仍保留，不能因此推斷這個方向沒有研究。',locale)}</p>
      <h2 id="research-distribution">${t('這批文獻的分類分布',locale)}</h2>${categoriesTable}
      <p>${t('每篇只有一個主要分類，次要標籤可以重疊。分布描述此書目，不代表整個研究領域，也不能按篇數比例配置任務。來源資料、任務定義、可執行環境與評測方法各有不同貢獻。',locale)}</p>
      <h2 id="research-forecasting">${t('Ego prediction再拆得具體一些',locale)}</h2>
      <p>${t('先分清誰在觀察：人類佩戴、機器人相機或外部視角；再記錄時間前綴、預測horizon、輸入state／語言及答案型態。早期辨識是動作已開始，anticipation是預測尚未發生的部分；T3實際未來與T4應做的計畫不同。',locale)}</p>${forecastTable}
      <p>${t('上表只計新增82篇的次標籤，允許同篇重疊；尚未重新標註原168篇的全部次標籤，不能當作完整250篇的多標籤分布。分類、edit distance、ADE／FDE／MPJPE、物件定位、TTC、接觸和影像／latent品質也不能混成一個robot成功率。',locale)}</p>
      <h2 id="research-design">${t('新前作帶來的設計修正',locale)}</h2>
      <ul><li>${t('X2Real、Bench2Dex、MotionForge已涵蓋多能力、跨手型和動態長流程；我們需要可驗證的任務與情境增量。',locale)}</li><li>${t('RoboRecover已有2,000個恢復情境；REBOOT、SafeManip、SoftVTBench分別要求階段、時序與物理互動量測。',locale)}</li><li>${t('LabUtopia、LabDex、Labimus、Pipette都直接測實驗室。專業場域需要真正的程序、量測、工具與物理支撐。',locale)}</li><li>${t('EgoSim補上身體不同佩戴位置；HUI360是robot視角；OpenEgo是多來源整合。它們不能都換名叫人類Ego資料。',locale)}</li><li>${t('EgoSAT、EGOSTREAM、S-EMBER、EgoMonth已有串流與長期歷史；我們要檢查這些資訊是否充分决定可執行目標。',locale)}</li></ul>
      <p><a href="${routeLink(route,'compare.html',locale)}">${t('查看68項前作的逐列比較與原文',locale)} →</a></p>
      <h2 id="research-lineage">${t('同名、版本與來源相依',locale)}</h2>
      <p>${t('COIN教學影片和COIN因果互動是不同工作；H2RBench人類轉移和H2R-Bench世界模型評測也不同。AFF-ttention與STAformer++屬同方法家族；SoftVTBench的較早preprint保留關聯。Ego4D／Ego-Exo4D的衍生資料與OpenEgo的整合時數不能再次獨立累加。',locale)}</p>
      <h2 id="research-additions">${t('新增82篇：用途與界線',locale)}</h2><div class="table-scroll"><table id="research-additions-table"><thead><tr><th>${t('文獻／原文入口',locale)}</th><th>${t('年',locale)}</th><th>${t('主分類',locale)}</th><th>${t('為何收錄與怎樣使用',locale)}</th></tr></thead><tbody>${newest}</tbody></table></div>
    </div>
    <div class="reader-actions"><a class="text-button" href="${dl}/unified_literature.csv" download>${t('250篇統一CSV',locale)}</a><a class="text-button" href="${dl}/LITERATURE_REFRESH.md" download>${t('完整更新報告',locale)}</a><a class="text-button" href="${dl}/search_receipts.json" download>${t('查詢與來源紀錄',locale)}</a><a class="text-button" href="${dl}/discovery_ledger.json" download>${t('700候選狀態',locale)}</a><a class="text-button" href="${dl}/literature_lineage.json" download>${t('版本與來源關係',locale)}</a></div>
    </main><aside class="on-this-page"><div class="sidebar-label">${t('本頁內容',locale)}</div>${[['research-method','檢索與範圍'],['research-distribution','分類分布'],['research-forecasting','Ego預測分類'],['research-design','對設計的影響'],['research-lineage','來源相依'],['research-additions','新增82篇']].map(([id,label])=>`<a href="#${id}">${t(label,locale)}</a>`).join('')}</aside></div>`;
  return shell({route,locale,title:'文獻更新：250篇、分類分布與Ego預測',description:'新增82篇完整摘要審阅；700候選的篩選狀態、250篇書目分布、Ego預測分類與benchmark設計影響。',body,kind:'research'});
}
