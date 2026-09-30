export function renderJointPilotPage(locale,report,demos,download,helpers){
  const {t,escape,relative,routeLink,head,shell}=helpers;
  const route='joint-pilot.html';
  const asset=relative(`${locale}/${route}`,'assets/joint-pilot/');
  const dl=relative(`${locale}/${route}`,'downloads/joint-pilot/');
  const defaults={method:'rgb_tools_closed_loop',sku:'SKU-P',bay:'BAY-L',fault:'reply_lost_after_commit'};
  const example=demos.find(r=>r.method_id===defaults.method&&r.sku===defaults.sku&&r.bay_id===defaults.bay&&r.fault_mode===defaults.fault);
  const percentage=v=>(100*v).toFixed(2)+'%';
  const methods=report.method_results;
  const table=`<div class="table-scroll"><table id="joint-method-table"><thead><tr><th>${t('程式／診斷控制',locale)}</th><th>${t('物理成功',locale)}</th><th>${t('數位正確',locale)}</th><th>${t('聯合成功',locale)}</th><th>${t('程式例外',locale)}</th></tr></thead><tbody>${methods.map(m=>`<tr><th scope="row">${t(m.name,locale)}</th><td>${percentage(m.physical_success)}</td><td>${percentage(m.digital_success)}</td><td><strong>${percentage(m.joint_success)}</strong></td><td>${m.program_exceptions} / ${m.trials}</td></tr>`).join('')}</tbody></table></div>`;
  const viewer=`<section class="joint-viewer" id="joint-case-viewer" data-joint-viewer data-image-base="${asset}/" data-pass="${t('通過',locale)}" data-fail="${t('未通過',locale)}" data-available="${t('可用數',locale)}" data-location="${t('申報位置',locale)}">
    <h2>${t('同一張初態影像，換訂單與處理方式會怎樣',locale)}</h2>
    <p>${t(`展示預先指定的第一個驗證初態（seed ${report.demonstration_world_seed}）。其四種目標、兩種故障条件和六個程式結果全部可切換；全80測例另有完整下載。`,locale)}</p>
    <div class="joint-controls js-only">
      <label>${t('訂單料件',locale)}<select id="joint-sku"><option value="SKU-P">${t('SKU-P · 洋紅料件',locale)}</option><option value="SKU-G">${t('SKU-G · 綠色料件',locale)}</option></select></label>
      <label>${t('指定出貨區',locale)}<select id="joint-bay"><option value="BAY-L">${t('左側 BAY-L',locale)}</option><option value="BAY-R">${t('右側 BAY-R',locale)}</option></select></label>
      <label>${t('API條件',locale)}<select id="joint-fault"><option value="reply_lost_after_commit">${t('commit後回應遺失',locale)}</option><option value="clean">${t('正常回應',locale)}</option></select></label>
      <label>${t('程式／控制',locale)}<select id="joint-method">${methods.map(m=>`<option value="${m.method_id}">${t(m.name,locale)}</option>`).join('')}</select></label>
    </div>
    <div class="joint-frame-grid">
      <figure><img id="joint-initial-image" src="${asset}/${example.initial_image_ref}" alt="${t('此驗證世界的初始RGB影像',locale)}" width="640" height="480"><figcaption>${t('初態：目標由訂單決定，影像本身不標答案。',locale)}</figcaption></figure>
      <figure><img id="joint-final-image" src="${asset}/${example.final_image_ref}" alt="${t('選定程式的實際模擬終態',locale)}" width="640" height="480"><figcaption>${t('終態：來自保存的執行結果，沒有在瀏覽器重新模擬。',locale)}</figcaption></figure>
    </div>
    <div class="joint-outcomes" aria-live="polite">
      <div><b>${t('物理完成',locale)}</b><strong id="joint-physical">${t(example.physical_success?'通過':'未通過',locale)}</strong></div>
      <div><b>${t('數位狀態',locale)}</b><strong id="joint-digital">${t(example.digital_success?'通過':'未通過',locale)}</strong></div>
      <div><b>${t('聯合完成',locale)}</b><strong id="joint-success">${t(example.joint_success?'通過':'未通過',locale)}</strong></div>
      <div><b>${t('實際出貨紀錄數',locale)}</b><strong id="joint-dispatch-count">${example.dispatch_events}</strong></div>
    </div>
    <p id="joint-inventory" class="source-note"></p><p class="joint-record-meta"><span id="joint-case-id">${escape(example.case_id)}</span> · <span id="joint-trial-id">${escape(example.trial_id)}</span> · <span id="joint-agent-status">${escape(example.agent_status)}</span></p>
    <p class="source-note">${t('可以選「只更新資料庫」看數位成功但物理失敗；選回應遺失與「改key重試」，可看到料件送達但資料重複。這些是刻意設計的診斷控制，不是學習模型排名。',locale)}</p>
  </section>`;
  const body=`<main class="wrap joint-main" id="main-content">
    <div class="union-intent-note" data-engineering-appendix><b>${t('工程附錄：合成資料鏈試作',locale)}</b><p>${t('目前主設計是全面收集前作、survey分類、任務聯集與任務／規則擴充。本頁保留已完成的小型工程實驗。',locale)}</p><a href="${routeLink(route,'survey-union.html',locale)}">${t('回到Benchmark總庫與研究主線',locale)} →</a></div>
    ${head('資料已接起來：影像、工具與機器人一起驗收','這是一批實際生成、執行和重播的合成資料。從訂單找料件、用RGB定位、推到指定區，再檢查SQLite與物理終態是否一致。',route,locale,`<div class="page-meta"><span>${report.date}</span><span class="pill green">${t('自建資料與重播已驗證',locale)}</span><span class="pill status">${t('固定程式試作 · 非VLM/VLA排名',locale)}</span></div>`)}
    <div class="joint-overview"><div><strong>${report.total_cases}</strong><span>${t('測例：40開發＋80新初態驗證',locale)}</span></div><div><strong>${report.total_initial_worlds}</strong><span>${t('實際初態；共用1個工作流／layout',locale)}</span></div><div><strong>${report.total_frozen_program_trials}</strong><span>${t('原定程式執行，成功與失敗都保留',locale)}</span></div><div><strong>${report.cases_with_completion_witness}</strong><span>${t('都有成功操作證據；含2次事後可解性補充',locale)}</span></div></div>
    <div class="scope-notice"><b>${t('這批數據證明了什麼',locale)}</b><p>${t('在只有本機Mac的條件下，已造出可重現的RGB—entity—資料庫—控制—判分完整鏈。資料是合成訂單和模擬料件，物理動作與SQL寫入確實執行過。場景只有兩種顏色的剛性方塊、固定相機和一隻Sawyer臂；没有真人影片或學習型agent成績。',locale)}</p><p>${t('120是測例數，不是120種新G2。大規模、廣覆蓋與2×目標仍待完成。',locale)}</p></div>
    <div class="cta-row"><a class="button" href="${escape(download.url)}">${t('下載完整資料與程式 ZIP',locale)} <small>${(download.bytes/1048576).toFixed(1)} MiB</small></a><a class="button secondary" href="${dl}/pilot-report-zh-hant.pdf">${t('自建資料完整報告 PDF',locale)}</a><a class="button secondary" href="#joint-case-viewer">${t('切換實際案例',locale)} ↓</a></div>
    ${viewer}
    <section class="joint-section" id="joint-results"><h2>${t('80個新初態測例的原始程式結果',locale)}</h2><p>${t('六個程式均使用同一組80測例。偵測器、動作控制器與原定程式在驗證前凍結，程式例外也沒有刪除。真值位置參考不是效能上界；兩組缺資訊控制刻意猜測，不能作公平的模型能力比較。',locale)}</p>${table}
      <figure><img src="${asset}/program-results.png" alt="${t('六種程式的物理、數位與聯合成功率',locale)}" loading="lazy"><figcaption>${t('誤差線按10個共享世界區塊做描述性bootstrap；條件於這一個工作流、固定工具和控制器，不代表一般機器人能力。',locale)}</figcaption></figure>
    </section>
    <section class="joint-section" id="joint-replay"><h2>${t('實際動作重播與交易恢復',locale)}</h2>
      <video controls preload="metadata" class="execution-video"><source src="${asset}/rgb-tools-replay.mp4" type="video/mp4"></video>
      <p class="source-note">${t('影片由保存動作重播，右欄依實際工具事件顯示SQL寫入。最後停格供閱讀，不增加任何測例或執行。這是標示清楚的一個成功例；全體失敗仍在上表與下載內。',locale)}</p>
    </section>
    <section class="joint-section" id="joint-evidence"><h2>${t('逐項證據與資料邊界',locale)}</h2>
      <ul><li>${t(`原定${report.validation.raw_physics_replayed_trials}條軌跡、${report.validation.raw_rgb_frames_replayed.toLocaleString('en-US')}個影格均完成重播；動作、狀態與RGB誤差為0。`,locale)}</li><li>${t(`完整重執行${report.validation.full_tool_chains_replayed}條工具鏈／${report.validation.full_tool_calls_reexecuted.toLocaleString('en-US')}次呼叫，產生相同的動作、物理軌跡和SQLite終態。`,locale)}</li><li>${t(`30個不重複初態物件對齊點，RGB位置估計平均誤差${(1000*report.validation.initial_pixel_pose_error_mean_m).toFixed(2)}mm，最大${(1000*report.validation.initial_pixel_pose_error_max_m).toFixed(2)}mm；只限已知彩色標記與相機校準。`,locale)}</li><li>${t('開發／驗證的world、order ID及初始物理hash不重疊；同世界的配對目標／故障使用相同初態和影像。',locale)}</li></ul>
      <p>${t('原定程式先為驗證集78／80個測例提供成功witness。剩下2例另以有特權位置的分段推動參考證明可解，並重播全部工具鏈；這是事後annotation，沒有把92.5%的原始成績改為100%。',locale)}</p>
      <p>${t('物理判分檢查整個方塊、台面高度範圍、最後40步平移速度與另一料件的終態位移；不是接觸承重力或完整安全認證。故障僅為本機SQLite commit後的回應遺失，沒有實際外部MCP或商業系統。',locale)}</p>
    </section>
    <section class="joint-section" id="joint-downloads"><h2>${t('資料、程式、驗證與完整紀錄',locale)}</h2>
      <p>${t('資料包包含初始／終態、RGB、相機與物件對齊、SQL schema與資料庫、工具事件、逐步動作、世界state、成功／失敗判分、凍結紀錄與重建程式。private後綴代表供研究者查核的ground truth，不是一般agent輸入。',locale)}</p>
      <div class="reader-actions">${[['README_ZH.md','資料說明'],['pilot_report.json','完整統計JSON'],['method_results.csv','程式結果CSV'],['condition_results.csv','故障條件CSV'],['case_ledger.csv','120測例清單'],['trial_ledger.csv','720執行清單'],['entity_alignment.json','物件對齊'],['tool_schemas.json','9個工具規格'],['archive_receipt.json','資料包SHA256']].map(([file,label])=>`<a class="text-button" href="${dl}/${file}" download>${t(label,locale)}</a>`).join('')}</div>
      <p><a href="${routeLink(route,'design.html',locale)}">${t('回到大型／廣覆蓋整體設計',locale)} →</a> · <a href="${routeLink(route,'execution.html',locale)}">${t('原50任務的獨立原生track',locale)} →</a></p>
    </section>
    </main><script defer src="${relative(`${locale}/${route}`,'assets/joint-pilot-data.js')}"></script><script defer src="${relative(`${locale}/${route}`,'assets/joint-pilot.js')}"></script>`;
  return shell({route,locale,title:'自建聯合資料：120測例、RGB工具與物理執行',description:'一個合成工作流、15初態、120測例、720次程式執行與2次可解性補充；完整RGB、SQLite、動作與聯合判分重播。',body,kind:'joint-pilot'});
}
