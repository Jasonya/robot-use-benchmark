export function renderExecutionPage(locale, model, progress, helpers) {
  const {t,escape,relative,routeLink,breadcrumb,chapterNav,shell}=helpers;
  const route='execution.html';
  const dl=relative(`${locale}/${route}`,'downloads/execution/');
  const asset=name=>relative(`${locale}/${route}`,`assets/execution/${name}`);
  const labels={scripted_reference:'原生腳本參考',bc_extra_trees:'Extra Trees BC（分任務）',bc_linear:'線性 BC（分任務）',uniform_random:'均勻隨機',zero_action:'零動作'};
  const methods=['scripted_reference','bc_extra_trees','bc_linear','uniform_random','zero_action'];
  const summaries=Object.fromEntries(model.summary.map(r=>[r.method_id,r]));
  const tasks=[...new Set(model.task_results.map(r=>r.native_task_id))].sort();
  const lookup=Object.fromEntries(model.task_results.map(r=>[r.native_task_id+'::'+r.method_id,r]));
  const percent=x=>(100*x).toFixed(1)+'%';
  const summaryTable=`<div class="table-scroll"><table id="execution-method-summary"><thead><tr><th>${t('方法',locale)}</th><th>${t('曾達原生成功',locale)}</th><th>${t('結束時成功',locale)}</th><th>${t('最後10步成功',locale)}</th></tr></thead><tbody>${methods.map(id=>{const r=summaries[id];return `<tr><th scope="row">${t(labels[id],locale)}</th><td>${percent(r.native_success_ever)}</td><td>${percent(r.native_success_final)}</td><td>${percent(r.native_success_last_10_steps)}</td></tr>`;}).join('')}</tbody></table></div>`;
  const taskTable=`<div class="table-scroll execution-task-table"><table id="execution-native-task-table"><thead><tr><th>${t('原生任務',locale)}</th>${methods.map(id=>`<th>${t(labels[id],locale)}</th>`).join('')}</tr></thead><tbody>${tasks.map(task=>`<tr id="mw-${escape(task)}"><th scope="row">${escape(task)}</th>${methods.map(method=>`<td>${percent(lookup[task+'::'+method].native_success_ever_all_requested)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const nav=chapterNav(route,locale);
  const body=`<div class="reader-layout"><aside class="chapter-sidebar">${nav}</aside><main class="reader" id="main-content">
    <details class="mobile-chapter-nav"><summary>${t('章節與資料庫',locale)}</summary>${nav}</details>${breadcrumb('實際開發執行',route,locale)}
    <div class="eyebrow">NATIVE EXECUTION EVIDENCE</div><h1>${t('從規格，進到真正的模擬與驗證。',locale)}</h1>
    <p class="lede">${t('在本機執行 Meta-World／MuJoCo，保存初態、動作、結果與重播證據。這裡列出完整原生測試集合的結果，以及清楚的適用範圍。',locale)}</p>
    <div class="page-meta"><span>${model.date}</span><span class="pill green">${t('原生開發執行已驗證',locale)}</span><span class="pill status">${t('通用完整基準仍在建置',locale)}</span></div>
    <div class="scale-target-grid"><div><strong>${model.native_task_ids_executed}</strong><span>${t('實際執行的 Meta-World 原生任務 ID',locale)}</span></div><div><strong>${model.held_out_initial_cases}</strong><span>${t('本次新初態測試 cases',locale)}</span></div><div><strong>${model.held_out_method_trials.toLocaleString('en-US')}</strong><span>${t('本次五方法測試執行紀錄',locale)}</span></div><div><strong>${model.recorded_trial_history_total.toLocaleString('en-US')}</strong><span>${t('累計開發執行，含早期接口／reset 診斷',locale)}</span></div></div>
    <div class="scope-notice"><b>${t('計數與能力範圍',locale)}</b><p>${t('50 是既有來源的原生任務 ID，不是新造或跨作去重後的 G2。輸入是 39 維 state＋明示目標，機體是單 Sawyer 手臂；沒有把這次結果當成人類影片、雙臂、柔性物、12 場域或完整 VLA 的驗證。',locale)}</p><a href="${routeLink(route,'readiness.html',locale)}">${t('查看其餘待完成範圍',locale)} →</a></div>
    <div class="prose">
      <h2 id="execution-results">${t('新初態上的五方法比較',locale)}</h2>
      <p>${t('訓練使用初態 seed 101–110；测试使用全新的 201–205，每個原生任務都有五個測試初態。兩種 BC 使用成功參考軌跡訓練為任務專用模型，超參數先固定；沒有宣稱跨任務或跨物件泛化。',locale)}</p>
      ${summaryTable}
      <figure><img src="${asset('heldout-native-success.png')}" alt="${t('五方法原生成功率與終態成功率',locale)}" loading="lazy"><figcaption>${t('主指標為任一時刻達到原生成功。final 與最後10步指標不同，不直接等同完整過程合規。區間是固定50任務下，以五個共享seed區塊做的成對bootstrap描述；退化為全相同結果的區間不作零寬信賴保證。',locale)}</figcaption></figure>
      <h2 id="execution-video">${t('一段實際動作重播',locale)}</h2>
      <video class="execution-video" controls preload="metadata" aria-label="${t('Extra Trees BC 在原生裝配任務的實際重播',locale)}"><source src="${asset('bc-assembly-native-replay.mp4')}" type="video/mp4"></video>
      <p class="source-note">${t('這是已記錄動作在相同模擬初態的渲染重播；不是人類影片。它是說明用的一個成功例，所有成敗仍完整列入上方表格和下載紀錄。',locale)}</p>
      <h2 id="execution-checks">${t('具體驗證了哪些事情',locale)}</h2>
      <ul><li>${t('所有請求的測試都有紀錄；沒有遺漏、執行錯誤、非有限狀態或跨方法 reset 不一致。',locale)}</li><li>${t('100 次測試動作重播與原記錄一致，觀測比較容差為 1e-8。',locale)}</li><li>${t(`reach/window 的 ${model.validation.independent_geometry_steps.toLocaleString('en-US')} 個步驟，透過 MuJoCo site 幾何獨立比對成功條件，沒有分歧。其他任务仍需進一步判分器審核。`,locale)}</li><li>${t(`${model.validation.learned_action_steps_recomputed.toLocaleString('en-US')} 個學習模型動作從保存權重重算，與紀錄完全相同；訓練與測試初態 hash 不重疊。`,locale)}</li></ul>
      <h3>${t('實作中發現並修正的 reset 問題',locale)}</h3>
      <p>${t('在固定套件版本組合，window-close 的 reset 會留下過期 kinematics／初始觀測，讓初態成功查詢與實際 joint state 不一致。適配層加入 mj_forward，再同步當前與歷史觀測；沒有改 qpos、qvel 或推進模擬時間。修正作為新的 reset contract 保存，舊實驗亦保留。',locale)}</p>
      <h2 id="execution-all-tasks">${t('完整50個原生任務結果',locale)}</h2>
      <p>${t('每格為五個新初態的 native-ever success。沒有以挑選成功案例替代完整結果。這些不是跨作正規化 G2 計數或完整的應用領域覆蓋。',locale)}</p>${taskTable}
      <h2 id="execution-progress">${t('同時完成的資料工程與尚待驗證範圍',locale)}</h2>
      <p>${t(`已解析 ${progress.source_index.declared_goal_files_parsed.toLocaleString('en-US')} 個宣告目標，索引 ${progress.source_index.records_with_direct_checker_methods} 筆明訂 success 評估／條件註冊來源；42組goal-only重疊保留待語義判斷。另有${progress.typed_count_records}筆typed counts、${progress.comparison_evidence.cell_records}格來源索引，以及12場域／16粗家族／9機制的開發codebook。`,locale)}</p>
      <p>${t('完整 G2 去重與 2× 分母、多材料／多機體／多場域實例、人類影片到執行、過程／恢復評測及最終基線仍未完成。原有 2,000–3,000 G2 初始目標和廣覆蓋要求維持。',locale)}</p>
      <p>${t('另提供D_BC＝1−兩個BC成功率平均的逐任務難度代理值，及成對初態bootstrap描述。這只反映兩個state專用方法，沒有據此把任務定成通用easy／medium／hard。',locale)}</p>
    </div>
    <div class="reader-actions"><a class="text-button" href="${dl}/EXECUTION_EVIDENCE.md" download>${t('開發執行報告',locale)}</a><a class="text-button" href="${dl}/native_results.csv" download>${t('完整任務結果 CSV',locale)}</a><a class="text-button" href="${dl}/heldout_trial_ledger.json" download>${t('1,250 次逐筆紀錄',locale)}</a><a class="text-button" href="${dl}/difficulty_diagnostic.csv" download>${t('方法相對難度 CSV',locale)}</a><a class="text-button" href="${asset('state-bc-models.zip')}" download>${t('两個BC模型權重 · 約9MB',locale)}</a><a class="text-button" href="${dl}/execution_report.json" download>${t('統計與驗證 JSON',locale)}</a><a class="text-button" href="${dl}/protocol.json" download>${t('測試協定',locale)}</a><button class="text-button print-page">${t('列印本頁',locale)}</button></div>
    </main><aside class="on-this-page"><div class="sidebar-label">${t('本頁內容',locale)}</div>${[['execution-results','五方法結果'],['execution-video','實際重播'],['execution-checks','驗證與reset修正'],['execution-all-tasks','完整50任務'],['execution-progress','進度與限制']].map(([id,name])=>`<a href="#${id}">${t(name,locale)}</a>`).join('')}</aside></div>`;
  return shell({route,locale,title:'實際開發執行：原生任務、模型與驗證',description:'Meta-World/MuJoCo原生任務的真實本機試驗、兩種BC、新初態測試、動作重播和完整逐任務結果；與通用G2規模目標分開報告。',body,kind:'execution'});
}
