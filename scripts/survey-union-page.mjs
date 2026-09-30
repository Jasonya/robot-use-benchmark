export function renderSurveyUnionPage(locale,stats,registry,sources,extensions,helpers){
  const {t,escape,relative,routeLink,head,shell}=helpers;
  const route='survey-union.html';
  const dl=relative(`${locale}/${route}`,'downloads/survey-union/');
  const roleLabels={
    benchmark_or_evaluation_resource:'已登記benchmark／評測資源',
    survey_or_evaluation_method:'Survey／評測方法',
    data_or_method_resource:'資料／方法相關工作',
    role_review_pending:'資源角色待核'
  };
  const cell=(value,fallback='尚待取得原生欄位')=>t(value||fallback,locale);
  const rows=registry.map(row=>`<tr data-union-row data-paper="${row.paper_id}" data-category="${row.category}" data-pool="${row.benchmark_source_registered?'registered':row.role==='role_review_pending'?'pending':'related'}" data-inventory="${row.source_records?'available':'pending'}" data-search="${t([row.paper_id,row.name,row.title,row.category_name,row.scope_note,row.declared_domains,row.native_tasks].join(' '),locale)}">
    <th scope="row"><a href="${routeLink(route,'library.html',locale)}#${row.paper_id}">${t(row.name,locale)}</a><small>${row.paper_id} · ${row.year}</small><a class="union-original" href="${escape(row.source_url)}" target="_blank" rel="noopener noreferrer">${t('原始來源',locale)} ↗</a></th>
    <td>${t(row.category_name,locale)}<small>${t(roleLabels[row.role],locale)}</small></td>
    <td title="${t(row.scope_note,locale)}">${cell(row.declared_domains,row.scope_note)}</td>
    <td>${cell(row.native_tasks)}</td>
    <td>${cell(row.scenes)}</td>
    <td>${cell(row.cases)}</td>
    <td>${row.source_records?`<strong>${row.source_records.toLocaleString('en-US')}</strong><small>${t('條固定來源紀錄；單位另列',locale)}</small>${row.source_ids.map(id=>`<a href="${routeLink(route,'native-tasks.html',locale)}?source=${escape(id)}">${escape(id)}</a>`).join(' · ')}`:t('原生清單待收集',locale)}</td>
    <td>${row.detailed_comparison_id?`<a href="${routeLink(route,'compare.html',locale)}#benchmark-${escape(row.detailed_comparison_id)}">${t('原詳細比較',locale)} →</a>`:t('新增總目錄連結；詳細欄位續補',locale)}<small>${t(row.evidence_depth,locale)}</small></td>
  </tr>`).join('');
  const taxonomy=`<div class="table-scroll"><table id="union-taxonomy-table"><thead><tr><th>${t('Survey主分支',locale)}</th><th>${t('全部書目',locale)}</th><th>${t('已登記評測來源',locale)}</th><th>${t('原詳細比較',locale)}</th></tr></thead><tbody>${stats.categories.map(c=>`<tr><th><a href="?category=${c.id}#union-catalogue">${t(c.name,locale)}</a></th><td>${c.all_paper_records}</td><td>${c.benchmark_or_eval_resource_records}</td><td>${c.detailed_comparison_records}</td></tr>`).join('')}</tbody></table></div>`;
  const sourceTable=`<div class="table-scroll"><table id="union-sources-table"><thead><tr><th>${t('官方來源',locale)}</th><th>${t('原生條目',locale)}</th><th>${t('單位／scope',locale)}</th><th>${t('盤點日期',locale)}</th></tr></thead><tbody>${sources.map(s=>`<tr><th><a href="${routeLink(route,'native-tasks.html',locale)}?source=${escape(s.source_id)}">${t(s.name,locale)}</a></th><td>${s.records.toLocaleString('en-US')}</td><td>${Object.entries(s.native_units).map(([k,v])=>`${escape(k)}: ${v}`).join('<br>')}</td><td>${s.source_snapshot}</td></tr>`).join('')}</tbody></table></div>`;
  const body=`<main class="wrap union-main" id="main-content">
    ${head('收齊前作，建立更大、更廣的任務聯集。','先像survey一樣整理各benchmark的領域、任務與規則；整合互補範圍，再擴充目標、流程與限制。任務目錄和本機可執行子集分開管理。',route,locale,`<div class="page-meta"><span>2026-09-29 · v0.7</span><span class="pill green">${t('目前研究主線',locale)}</span></div>`)}
    <div class="union-metrics"><div><strong>${stats.benchmark_or_eval_resource_records}</strong><span>${t('已登記評測來源條目；含版本與資料資源',locale)}</span></div><div><strong>${stats.total_source_records.toLocaleString('en-US')}</strong><span>${t('可追溯來源條目；按原生單位分欄',locale)}</span></div><div><strong>${stats.native_robot_task_candidates.toLocaleString('en-US')}</strong><span>${t('原生robot任務候選；共同映射持續',locale)}</span></div><div><strong>${stats.human_activity_definitions}</strong><span>${t('新接入的人類程序活動定義',locale)}</span></div></div>
    <div class="scope-notice"><b>${t('主設計已重新對齊',locale)}</b><p>${t('以既有benchmark的完整聯集累積規模與廣度，再擴充任務和規則。某來源尚不能在Mac執行，仍可先納入任務目錄。120測例的小型試作保留於工程附錄。',locale)}</p><a href="${routeLink(route,'design.html',locale)}#union-first-design">${t('讀目前完整主設計',locale)} →</a></div>
    <div class="cta-row"><a class="button" href="#union-catalogue">${t('查全部benchmark／評測來源',locale)} ↓</a><a class="button secondary" href="${routeLink(route,'native-tasks.html',locale)}">${t('查5,308條任務與來源定義',locale)} →</a><a class="button secondary" href="${dl}/survey_registry.csv" download>${t('下載總表CSV',locale)}</a></div>
    <section class="union-section" id="union-taxonomy"><h2>${t('Survey分布：來源先分清楚',locale)}</h2>
      <p>${t(`原250篇書目全部保留。143條已登記為benchmark或含評測資源，包含原68項詳細比較與75條先前漏接的來源；其餘文獻仍可在下表切換，其中${stats.resource_role_review_pending}篇資源角色待核。`,locale)}</p>
      ${taxonomy}<p class="source-note">${t('每篇只有一個主分類，因此「主要分類為預測」的數量不是全部支援預測的benchmark數。次要用途、原生領域、任務家族和觀測軸繼續展開；來源版本或衍生資料也不當成互相獨立的資料庫。',locale)}</p>
    </section>
    <section class="union-section" id="union-catalogue"><h2>${t('每列一個來源，每欄一個比較軸',locale)}</h2>
      <p>${t('目前總表接起全部250篇，預設顯示143條已登記評測來源。缺少的原生欄位直接顯示待收集；「已提取來源」可進入task ID與固定原文。',locale)}</p>
      <div class="union-controls js-only" data-union-controls>
        <label>${t('搜尋名稱／領域／任務',locale)}<input id="union-q" type="search" placeholder="${t('例如 VIMA、fold、影片、ARNOLD',locale)}"></label>
        <label>${t('Survey分支',locale)}<select id="union-category"><option value="">${t('全部分支',locale)}</option>${stats.categories.map(c=>`<option value="${c.id}">${t(c.name,locale)}</option>`).join('')}</select></label>
        <label>${t('來源範圍',locale)}<select id="union-pool"><option value="registered">${t('已登記評測來源',locale)}</option><option value="all">${t('全部250篇',locale)}</option><option value="pending">${t('資源角色待核',locale)}</option><option value="related">${t('其他相關工作',locale)}</option></select></label>
        <label>${t('原生task清單',locale)}<select id="union-inventory"><option value="">${t('所有進度',locale)}</option><option value="available">${t('已有固定來源',locale)}</option><option value="pending">${t('原生清單待收集',locale)}</option></select></label>
      </div>
      <p id="union-count" aria-live="polite">${t('未啟用腳本時顯示全部250篇',locale)}</p>
      <div class="table-scroll union-table-scroll" tabindex="0"><table id="union-registry-table"><thead><tr><th>${t('Benchmark／來源',locale)}</th><th>${t('分類／角色',locale)}</th><th>${t('領域／用途',locale)}</th><th>${t('任務種類／原作單位',locale)}</th><th>${t('場景',locale)}</th><th>${t('測例／資料量',locale)}</th><th>${t('已提取來源',locale)}</th><th>${t('詳細比較／证據',locale)}</th></tr></thead><tbody>${rows}</tbody></table></div>
    </section>
    <section class="union-section" id="union-source-lists"><h2>${t('真正接入的原生任務與程序清單',locale)}</h2>
      <p>${t('原5,020條完整保留。本次從官方固定版本補入VIMA17個模板、ARNOLD8個任務類別、COIN180個人類活動、CrossTask83個程序定義，共288條。',locale)}</p>
      ${sourceTable}
      <details class="explainer"><summary>${t('看COIN作者的12個原生領域與180個活動分布',locale)}</summary><div class="table-scroll"><table id="union-coin-domains"><thead><tr><th>${t('來源原生domain',locale)}</th><th>${t('活動數',locale)}</th></tr></thead><tbody>${Object.entries(stats.coin_native_domain_counts).map(([name,n])=>`<tr><td>${escape(name)}</td><td>${n}</td></tr>`).join('')}</tbody></table></div><p>${t('這是作者的分類，與本計畫舊12域分開。它提供活動與觀測範圍，尚未自動成為機器人控制題。',locale)}</p></details>
      <p class="source-note">${t('5,308是包含原生任務、活動、schema、整合註冊與協定的來源總量。2,062個robot任務候選與263個人類活動分開，跨來源共同任務數則由後续對齊表給出。',locale)}</p>
    </section>
    <section class="union-section" id="union-extension-rules"><h2>${t('任務與規則可以繼續擴充',locale)}</h2><p>${t('下面12個規格例子都連到實際來源ID，說清楚保留哪些父任務、增加什麼條件。它們是作者規格；與前作是否等價、執行可解性和正式測例數分別記錄。',locale)}</p>
      <div class="union-example-grid">${extensions.map(e=>`<details id="union-${e.id.toLowerCase()}" class="explainer"><summary>${e.id} · ${t(e.name,locale)}</summary><p>${t(e.extended_definition,locale)}</p><p class="source-note">${t(e.distinguishing_example,locale)}</p><p><b>${t('父來源：',locale)}</b>${e.parent_source_ids.map((id,i)=>`<a href="${escape(e.parent_sources[i])}" target="_blank" rel="noopener noreferrer">${escape(id)}</a>`).join(' · ')}</p><p><small>${t('計數層：',locale)}${escape(e.count_level)}</small></p></details>`).join('')}</div>
    </section>
    <section class="union-section" id="union-backlog"><h2>${t('下一步按總庫補齊，不由小樣本決定範圍',locale)}</h2>
      <p>${t(`143條已登記評測來源中，${stats.benchmark_source_records_with_task_inventory}條已有固定task來源可連結，${stats.benchmark_source_records_awaiting_task_inventory}條仍待取得原生清單。已收清單的版本／subset與共同分類繼續核對；完整搜尋仍在進行。`,locale)}</p>
      <ol><li>${t('U0–U1：全面来源盤點，逐benchmark取得原生任務、規則與資產入口。',locale)}</li><li>${t('U2–U3：完成共同分類、聯集／重疊表與任務規則擴充。',locale)}</li><li>${t('U4–U6：按backend建立可執行子集，進行分層評測並發布。',locale)}</li></ol>
      <div class="reader-actions">${[['UNION_FIRST_DESIGN_V0_7.md','目前主設計'],['UNION_CATALOGUE_REPORT.md','分類與來源報告'],['survey_registry.csv','250篇來源總表'],['task_source_bridge.csv','5,308條來源CSV'],['extension_examples.csv','規則擴充CSV'],['extension_grammar.json','擴充語法JSON'],['source_receipts.json','官方來源版本與hash']].map(([file,label])=>`<a class="text-button" href="${dl}/${file}" download>${t(label,locale)}</a>`).join('')}</div>
    </section>
    <details class="explainer" id="union-engineering-appendix"><summary>${t('工程附錄：既有adapter、原生實驗與小型資料鏈',locale)}</summary><p>${t('這些元件支援後續整合。任務總庫與規則設計的研究主線在上方。',locale)}</p><a href="${routeLink(route,'execution.html',locale)}">${t('Meta-World原生執行',locale)} →</a> · <a href="${routeLink(route,'joint-pilot.html',locale)}">${t('合成聯合流程試作',locale)} →</a></details>
  </main><script defer src="${relative(`${locale}/${route}`,'assets/survey-union.js')}"></script>`;
  return shell({route,locale,title:'Benchmark總庫：Survey分類、來源任務聯集與規則擴充',description:'143條已登記評測來源、250篇書目、5,308條原生來源與12個擴充規格例。主線是全面收集、分類、聯集與任務規則擴充。',body,kind:'survey-union'});
}
