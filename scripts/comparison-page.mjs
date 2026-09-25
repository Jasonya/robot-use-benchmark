export function renderComparisonPage(locale, model, helpers) {
  const {t, escape, translate, relative, routeLink, head, shell, auditStatistics} = helpers;
  const route = 'compare.html';
  const downloads = relative(`${locale}/${route}`, 'downloads/benchmark-comparison/');
  const sourceLink = ref => {
    const local = {'@design':'design.html','@execution':'execution.html'}[ref.url];
    const href = local ? routeLink(route,local,locale) : escape(ref.url);
    const extra = local ? '' : ' target="_blank" rel="noopener noreferrer"';
    const locator = local ? (ref.url==='@design'?'v0.4':'2026-09-25') : ref.url.replace('https://arxiv.org/','arXiv / ');
    return `<li><a href="${href}"${extra}>${t(ref.label,locale)}${local?'':' ↗'}</a> <span>${escape(locator)}</span></li>`;
  };
  const short = value => value.length > 108 ? value.slice(0, 106) + '…' : value;
  const label = row => `<a class="benchmark-name" href="#benchmark-${escape(row.id)}">${t(row.name,locale)}</a><small>${t(row.group_label,locale)} · ${row.year}</small>${row.status==='planned'?`<span class="matrix-badge planned">${t('目標，未達成',locale)}</span>`:row.status==='current'?`<span class="matrix-badge zero">${t('目前實績',locale)}</span>`:''}`;
  const search = row => Object.values(row).filter(value=>typeof value==='string').join(' ');
  const attrs = row => `data-comparison-row="${escape(row.id)}" data-comparison-group="${row.group}" data-comparison-search="${escape(translate(search(row),'zh-hant')+' '+translate(search(row),'zh-hans'))}" class="benchmark-row ${row.group==='ours'?'our-benchmark-row':''}"`;
  const cell = value => `<td title="${t(value,locale)}">${t(short(value),locale)}</td>`;
  const badge = value => `<span class="matrix-badge ${value}">${t(model.states[value],locale)}</span>`;
  const textTable = (id, title, cols) => `<div class="comparison-table-scroll" tabindex="0" role="region" aria-label="${t(title,locale)}"><table class="comparison-table ${id==='scale'?'scale-comparison-table':'material-comparison-table'}" id="comparison-${id}"><caption class="sr-only">${t(title,locale)}</caption><colgroup><col class="benchmark-col">${cols.map(([key])=>`<col class="matrix-col-${key}">`).join('')}</colgroup><thead><tr><th scope="col">Benchmark</th>${cols.map(([,name])=>`<th scope="col">${t(name,locale)}</th>`).join('')}</tr></thead><tbody>${model.rows.map(row=>`<tr ${attrs(row)}><th scope="row">${label(row)}</th>${cols.map(([key])=>cell(row[key])).join('')}</tr>`).join('')}</tbody></table></div>`;
  const statusTable = (id, title, axes, field) => `<div class="comparison-table-scroll" tabindex="0" role="region" aria-label="${t(title,locale)}"><table class="comparison-table status-comparison-table" id="comparison-${id}"><caption class="sr-only">${t(title,locale)}</caption><colgroup><col class="benchmark-col">${Object.keys(axes).map(()=>'<col class="matrix-status-col">').join('')}</colgroup><thead><tr><th scope="col">Benchmark</th>${Object.entries(axes).map(([key,name])=>`<th scope="col">${id==='domains'?`<small>${escape(key)}</small>`:''}${t(name,locale)}</th>`).join('')}</tr></thead><tbody>${model.rows.map(row=>`<tr ${attrs(row)}><th scope="row">${label(row)}</th>${Object.keys(axes).map(key=>`<td data-matrix-axis="${escape(key)}" data-evidence-state="${row[field][key]}">${badge(row[field][key])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const panels = [
    ['scale','規模總表','領域、場景資源、原作任務單位、實例／題數和資料量並排比較。不要跨單位直接做數值排名。',textTable('scale','Benchmark × 領域、場景、任務種類、題數、資料量',[
      ['domain','領域／任務範圍'],['scenes','場景／環境資源'],['tasks','任務種類（原作單位）'],['cases','實例／題數／評測 subset'],['data','影片／示範／資料量'],['scope','模擬／實體／離線']
    ])],
    ['domains','12 領域矩陣','這是文獻與來源用途的共同映射；「有」尚不等於通過我們的 coverage cell 驗證。「待核」代表未知，不代表沒有。',statusTable('domains','Benchmark × 12 個共同應用場域',model.domains,'domain_map')],
    ['materials','材料與觀測','物理材料、機體、觀測來源、評測端點和與本計畫的差異分開呈現。每個格子的完整文字在下方逐列說明。',textTable('materials','Benchmark × 材料、機體、觀測、評測與差異',[
      ['materials','物件／材料／物理'],['embodiment','機體／agent'],['observation','文字／影片／感測'],['evaluation','評測能力／端點'],['difficulty_note','難度／泛化設定'],['difference','與我們設計的差異']
    ])],
    ['features','能力矩陣','「資料」表示有影片／標註，「部分」表示子集或相鄰端點；都不同於完整 robot 執行能力。「非端點」表示該離線評測不提供此 robot endpoint。',statusTable('features','Benchmark × 評測能力',model.features,'features')]
  ];
  const details = model.rows.map(row=>`<details class="benchmark-evidence" id="benchmark-${escape(row.id)}" data-comparison-evidence="${escape(row.id)}"><summary><b>${t(row.name,locale)}</b><span>${t('原文、版本與完整欄位',locale)}</span></summary><div class="benchmark-evidence-content"><p>${t(row.version_note,locale)} · ${t(row.evidence_status,locale)}</p><dl>${[
    ['類型／範圍','scope'],['領域','domain'],['場景','scenes'],['任務種類','tasks'],['實例／題數','cases'],['資料量','data'],['材料／物理','materials'],['機體','embodiment'],['觀測','observation'],['評測','evaluation'],['難度／泛化','difficulty_note'],['與本計畫的差異','difference'],['計數注意','note']
  ].map(([title,key])=>`<div><dt>${t(title,locale)}</dt><dd>${t(row[key],locale)}</dd></div>`).join('')}</dl>${row.outside_common_domains?`<p class="source-note">${t(row.outside_common_domains,locale)}</p>`:''}<ul class="benchmark-sources">${row.references.map(sourceLink).join('')}${row.inventory?`<li><a href="${routeLink(route,'native-tasks.html',locale)}?source=${escape(row.inventory.source_id)}">${t('查看固定程式來源紀錄',locale)} →</a><span>${row.inventory.records.toLocaleString('en-US')} records · commit ${escape(row.inventory.commit.slice(0,12))}</span></li>`:''}</ul></div></details>`).join('');
  const body=`<main id="main-content" class="comparison-main"><div class="wrap comparison-wrap">
    ${head('Benchmark 橫向比較','每列一個 benchmark，每欄一個分類：直接對照領域、場景、任務種類、實例／題數、材料、機體、影片與評測能力。',route,locale,`<div class="page-meta"><span class="pill green">${model.prior_works} ${t('項前作',locale)} + 2 ${t('列本計畫',locale)}</span><span>${model.as_of}</span><span>${t('原作單位保留；共同 G2 尚未完成',locale)}</span></div>`)}
    <div class="comparison-guide"><p><b>${t('先看規模總表，再切換領域與能力。',locale)}</b> ${t('我們的目標與實績分成兩列；前作的資料缺項標成「待核」。表格可以橫向捲動，點 benchmark 名稱可展開該列原文與完整說明。',locale)}</p><a href="#comparison-implications">${t('這張表對我們的設計意味著什麼',locale)} ↓</a></div>
    <p class="source-note">${t('目前實績更新至2026-09-25：50個原生任務、1,250次新初態測試。原33項前作保留2026-09-22快照，新增35項於2026-09-25核對摘要。WatchAct另列固定HF版本3,045個評測列，避免版本、原例與視角數混加。',locale)} <a href="${routeLink(route,'execution.html',locale)}">${t('查看實際執行證據',locale)} →</a></p>
    <div class="source-note" id="comparison-review-status"><b>${t(`全 ${auditStatistics.comparison_prior_works} 項前作的整理待核量：`,locale)}</b> ${t(`領域 ${auditStatistics.domain_matrix.unknown_cells}／${auditStatistics.domain_matrix.total_cells} 格（${auditStatistics.domain_matrix.unknown_percent}%）；能力 ${auditStatistics.feature_matrix.unknown_cells}／${auditStatistics.feature_matrix.total_cells} 格（${auditStatistics.feature_matrix.unknown_percent}%）。這是我們的查核缺口，不是前作缺少該能力；此數量涵蓋全表，不隨下方篩選改變。`,locale)} <a href="${routeLink(route,'readiness.html',locale)}">${t('查看全部待完善事項',locale)} →</a></div>
    <section class="comparison-controls js-only" aria-label="${t('比較表篩選',locale)}">
      <label for="comparison-query">${t('找 benchmark、領域或關鍵字',locale)}<input id="comparison-query" type="search" placeholder="${t('例如 PARTNR、布料、實驗室、Ego',locale)}"></label>
      <label for="comparison-group">${t('研究類型',locale)}<select id="comparison-group"><option value="">${t('所有類型',locale)}</option>${Object.entries(model.groups).map(([id,name])=>`<option value="${id}">${t(name,locale)}</option>`).join('')}</select></label>
      <label class="comparison-pin"><input id="comparison-pin" type="checkbox" checked>${t('固定顯示我們的兩列',locale)}</label>
      <button class="button secondary small" id="comparison-reset">${t('清除篩選',locale)}</button>
    </section>
    <div class="comparison-toolbar"><div class="comparison-view-buttons js-only" role="group" aria-label="${t('比較表欄位',locale)}">${panels.map(([id,title],i)=>`<button id="comparison-view-${id}" data-comparison-view="${id}" aria-controls="comparison-panel-${id}" aria-pressed="${i===0}">${t(title,locale)}</button>`).join('')}</div><span id="comparison-count" aria-live="polite">${model.rows.length} / ${model.rows.length} ${t('列',locale)}</span></div>
    <p class="comparison-empty" id="comparison-empty" hidden>${t('沒有符合的前作。可縮短關鍵字，或清除篩選。',locale)}</p>
    ${panels.map(([id,title,description,table])=>`<section class="comparison-panel" data-comparison-panel="${id}" id="comparison-panel-${id}" aria-labelledby="comparison-heading-${id}"><h2 id="comparison-heading-${id}">${t(title,locale)}</h2><p>${t(description,locale)}</p>${table}</section>`).join('')}
    <div class="comparison-downloads"><a class="button small" href="${downloads}/benchmark_matrix.csv" download>${t('下載完整比較 CSV',locale)} ↓</a><a href="${downloads}/benchmark_domains_matrix.csv" download>${t('12 領域 CSV',locale)}</a><a href="${downloads}/benchmark_features_matrix.csv" download>${t('能力 CSV',locale)}</a><a href="${downloads}/typed_count_records.json" download>${t('分單位數量紀錄',locale)}</a><a href="${downloads}/cell_evidence_index.json" download>${t('逐格來源索引',locale)}</a><a href="${downloads}/benchmark_matrix.json" download>JSON</a><a href="${downloads}/BENCHMARK_COMPARISON.md" download>${t('完整文字與來源',locale)}</a><button class="text-button print-page">${t('列印目前表格',locale)}</button></div>
    <section id="comparison-implications" class="comparison-implications"><h2>${t('目前能看到的差異，與還缺的證據',locale)}</h2><div class="card-grid">
      <article class="overview-card"><h3>${t('任務種類與題數，都有大型對照',locale)}</h3><p>${t('BEHAVIOR-1K 是 1,000 活動；PARTNR 有 100k 級 episodes；CALVIN 有 1,000 條五子任務鏈。先對齊單位，再檢查我們在哪一層有增量。',locale)}</p><a class="bottom-link" href="#benchmark-partnr">${t('看 PARTNR 的完整計數',locale)} →</a></article>
      <article class="overview-card"><h3>${t('領域和場景仍需補足證據',locale)}</h3><p>${t('BEHAVIOR-1K已有八類場景，Imitator Game已跨六領域。RoboCasa365有2,500個廚房配置；本計畫新訂240個layout／6,000有效配置的製作預算，均尚待建立與驗收。',locale)}</p><a class="bottom-link" href="#benchmark-robocasa365">${t('看 RoboCasa365 的場景單位',locale)} →</a></article>
      <article class="overview-card"><h3>${t('要做出更大的有效任務聯集',locale)}</h3><p>${t('人類影片、柔性物、多機體、恢復與統一接口都有前作。新設計的增量，要落在去重後的任務、新的有效覆蓋，以及全庫相同條件的評測證據。',locale)}</p><a class="bottom-link" href="${routeLink(route,'design.html',locale)}">${t('回到完整設計與驗收條件',locale)} →</a></article>
    </div></section>
    <section class="benchmark-evidence-section" id="comparison-evidence"><h2>${t('逐列原文、版本與完整欄位',locale)}</h2><p>${t('原33項對照保留指定章節／摘要與固定程式盤點；新增35項逐篇核對完整摘要。合計74份原始文件快照，領域與能力映射仍為來源層整理。未知不代表前作沒有該能力；AutoBio等新增來源也已納入250篇統一書目。',locale)}</p>${details}</section>
    <div class="comparison-links"><a href="${routeLink(route,'scale-plan.html',locale)}">${t('規模方案與來源盤點方法',locale)} →</a><a href="${routeLink(route,'appendices/comparison.html',locale)}">${t('舊版原生數量／版本查核',locale)} →</a></div>
  </div></main>`;
  return shell({route,locale,title:'Benchmark × 領域、場景、題數比較表',description:`${model.prior_works}項前作與本計畫目標／實績並排比較：原生任務、場景、episodes、QA、材料、機體、影片與評測能力，附逐列來源及CSV。`,body,kind:'comparison'});
}
