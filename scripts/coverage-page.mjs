import {formatCount, countScopeLabels} from './coverage-model.mjs';

const nativeCountNames={
  'everyday activities':'日常活動','interactive scenes':'互動場景','tasks':'任務',
  'target tasks':'正式評測任務','pretraining kitchen configurations':'預訓練廚房配置',
  'pretraining layouts':'預訓練layout','target kitchens':'目標廚房','tasks in paper':'論文所列任務',
  'manipulation tasks':'操作任務','native task IDs':'原作任務ID','environments':'環境',
  'subtasks':'子任務','instruction chains':'評測指令鏈','task families':'任務家族',
  'dual-arm tasks':'雙臂任務','task scenarios':'任務情境','mobile manipulation tasks':'移動操作任務',
  'task types':'任務類型','scenes':'場景','expert demonstrations':'專家示範',
  'task types represented in sessions':'對話資料涵蓋的任務類型',
  'successful gameplay sessions':'成功的對話遊戲session','houses':'房屋',
  'training episodes':'訓練episodes','validation episodes':'驗證episodes','test episodes':'測試episodes',
  'task constraint types':'任務約束類型','cognitive task schemas':'認知任務模板',
  'video–task instances':'影片—任務實例','public HF evaluation rows':'公開HF版本的評測列',
  'public HF original examples':'公開HF版本的原始例子','base tasks':'基礎任務',
  'task variants':'任務變體','sim tasks':'模擬任務','real tasks':'實體任務',
  'failure scenarios':'失敗情境','task categories':'任務類別',
  'multiple-choice QA':'選擇題','balanced QA':'平衡後QA',
  'candidate QA before balancing':'平衡前QA候選池','full EgoLifeQA questions':'EgoLifeQA全集問題',
  'Jake subset questions':'Jake評測子集問題','recording locations':'錄製地點',
  'natural scene contexts':'自然錄製情境','recording environments':'錄製環境',
  'annotated actions':'動作標註','video hours':'影片時數','videos':'影片',
  'demonstrations':'示範軌跡','language directives':'語言指令','demonstration frames':'示範影格',
  'task schemas':'任務模板','QA pairs':'QA','questions':'問題','interactive episodes':'互動episodes'
};
const readable=value=>String(value??'')
  .replace(/\bG2\b/g,'共同任務規格')
  .replace(/\bG3\b/g,'具體初態實例')
  .replace(/\bG4\b/g,'測例')
  .replace(/\bG5\b/g,'執行紀錄');

function overviewRows(model) {
  const s=model.statistics;
  return [
    ['domain','領域',`${s.domain_labels} 類`,`現有應用領域分類；${s.domain_labels_with_explicit_source_overview}類有前作概述明確標記。`,`${s.domain_unmapped_sources}筆來源尚未做共同域映射；逐任務分布續補。`],
    ['environment','環境','待整合',`${s.sources_with_environment_count}筆來源已有場景／錄製環境數量摘錄。`,'先分清可交互場景與觀測來源，再處理資產重用和版本。'],
    ['task','任務',`${s.native_robot_task_records.toLocaleString('en-US')} 條`,`已收集的原作robot任務條目；另${s.human_activity_records}條人類活動。`,'跨來源任務聯集及規則變體尚待對齊；這不是去重總量。'],
    ['case','題數','待整合',`${s.sources_with_case_count}筆來源已有題目／episode等原生數量。`,'QA、控制、預測分項計數；原始影片、示範和重跑次數另列。'],
    ['evaluation','評估方式',`${s.evaluation_method_groups} 類`,`${s.sources_with_scoring_classification}筆來源已按評測概述整理判分方式。`,'保留每項原作metric；分類完成不表示全庫判分器已實作。']
  ];
}

export function renderCoverageOverview(locale,model,helpers,{route='coverage.html',compact=false}={}){
  const {t,routeLink}=helpers;
  return `<section class="coverage-overview" aria-label="${t('全庫五項統計',locale)}">
    <div class="coverage-cards">${overviewRows(model).map(([id,name,value,note])=>`<a class="coverage-card" data-coverage-metric="${id}" href="${routeLink(route,`coverage.html#coverage-${id}`,locale)}"><span>${t(name,locale)}</span><strong>${t(value,locale)}</strong><small>${t(note,locale)}</small></a>`).join('')}</div>
    <p class="coverage-scope">${t('上方是我們已整理的狀態；下方前作表列原作者公布或已取得版本的規模。尚未完成整合的總數直接標示待整合。',locale)}${compact?` <a href="${routeLink(route,'coverage.html#benchmarks',locale)}">${t('看全部前作的環境、任務與題數',locale)} →</a>`:''}</p>
  </section>`;
}

export function renderCoverageNotice(locale,route,helpers){
  const {t,routeLink}=helpers;
  return `<div class="coverage-reader-note"><b>${t('最新閱讀入口：五個欄位看完整體coverage',locale)}</b><p>${t('領域、環境、任務、題數、評估方式集中在同一頁。這裡保留原始分類、代號或歷史細節，供深入查閱。',locale)}</p><a href="${routeLink(route,'coverage.html',locale)}">${t('開啟全庫總覽與前作比較',locale)} →</a></div>`;
}

export function renderCoverageDesign(locale,model,helpers,route='design.html'){
  const {t,routeLink}=helpers;
  return `<section id="coverage-design">
    <h2>${t('研究只用五個主欄位交代規模與覆蓋',locale)}</h2>
    <p>${t(model.plan.purpose,locale)}</p>
    <div class="table-scroll"><table class="coverage-definition-table"><thead><tr><th>${t('欄位',locale)}</th><th>${t('要回答的問題',locale)}</th><th>${t('整理完成的條件',locale)}</th></tr></thead><tbody>${model.plan.fields.map(f=>`<tr><th>${t(f.name,locale)}</th><td>${t(f.question,locale)}</td><td>${t(f.completion,locale)}</td></tr>`).join('')}</tbody></table></div>
    <p>${t('主要成果只有兩張表：一張逐一列前作；一張報全庫聯集。任務家族、規則、材料、機體、觀測及執行次數留在各筆詳細資料，不要求讀者先學多組代號。',locale)}</p>
    <p>${t(model.plan.target_rule,locale)}</p>
    <ol class="coverage-milestones">${model.plan.milestones.map(m=>`<li><b>${t(m.name,locale)}</b><p>${t(m.deliverable,locale)}</p><p class="source-note">${t('完成條件：'+m.acceptance,locale)}</p></li>`).join('')}</ol>
    <p><a class="button" href="${routeLink(route,'coverage.html#benchmarks',locale)}">${t('看前作比較和目前確認數量',locale)} →</a></p>
  </section>`;
}

export function renderCoveragePage(locale,model,helpers){
  const {t,escape,translate,relative,routeLink,head,shell}=helpers;
  const route='coverage.html';
  const s=model.statistics;
  const methodNames=Object.fromEntries(model.plan.evaluation_methods.map(m=>[m.id,m.name]));
  const downloads=relative(`${locale}/${route}`,'downloads/coverage/');
  const countList=(row,field)=>{
    const items=row.counts.filter(c=>c.field===field);
    if(!items.length){
      const text={environment:row.environments,task:row.tasks,case:row.cases}[field];
      return `<p class="coverage-unresolved">${t(readable(text)||'本輪未取得數量',locale)}</p>`;
    }
    return `<ul class="coverage-count-list">${items.map(c=>`<li><b>${escape(formatCount(c))}</b> ${t(nativeCountNames[c.native_term]||c.native_term,locale)}<small>${t(countScopeLabels[c.scope]||c.scope,locale)}</small></li>`).join('')}</ul>`;
  };
  const dataList=row=>{
    const items=row.counts.filter(c=>c.field==='data');
    if(!items.length)return '';
    return `<details class="coverage-data"><summary>${t('另有原始資料量',locale)}</summary><p>${t('以下是資料資源量；不能直接改名為固定測試題數。',locale)}</p>${countList(row,'data')}</details>`;
  };
  const audit=row=>{
    const countSources=[...new Set(row.counts.flatMap(c=>c.evidence.map(e=>e.source)))];
    const refs=[...new Set([row.source_url,...countSources])].filter(url=>/^https?:\/\//.test(url));
    return `<span class="coverage-audit-label">${t(row.review.type,locale)}</span><small>${t(row.review.task_list,locale)}</small><details class="coverage-audit"><summary>${t('來源與口徑',locale)}</summary><p>${t(row.review.evidence_depth,locale)}</p><p>${t('任務清單：'+row.task_list_scope,locale)}</p><p>${t('判分：'+row.review.scoring,locale)}</p><p>${t('執行：'+row.review.local_execution,locale)}</p>${row.source_count?`<p>${t(`本庫另有${row.source_count.toLocaleString('en-US')}筆此來源索引；索引量與原作總量分開。`,locale)}</p>`:''}<p>${t('原作說明：'+row.environments+'；'+row.tasks+'；'+row.cases,locale)}</p>${row.counts.length?`<details><summary>${t('逐筆原文單位、版本與限制',locale)}</summary><ul>${row.counts.map(c=>`<li><b>${escape(formatCount(c))}</b> ${t(c.native_term,locale)} · ${t(countScopeLabels[c.scope]||c.scope,locale)}<small>${t(c.source_version,locale)}</small>${c.notes?`<p>${t(c.notes,locale)}</p>`:''}</li>`).join('')}</ul></details>`:''}<ul>${refs.map((url,i)=>`<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${t(i===0?'原始來源':`數量依據 ${i}`,locale)} ↗</a></li>`).join('')}</ul><p><a href="${routeLink(route,`survey-union.html#union-${row.paper_id}`,locale)}">${t('來源名錄',locale)}</a>${row.detailed_comparison_id?` · <a href="${routeLink(route,`compare.html#benchmark-${row.detailed_comparison_id}`,locale)}">${t('原詳細比較',locale)}</a>`:''}</p></details>`;
  };
  const sourceRows=model.rows.map(row=>{
    const search=[row.paper_id,row.name,row.title,row.domains,row.tasks,row.native_evaluation,row.category_name,...row.evaluation_methods.map(id=>methodNames[id]),...row.counts.map(c=>c.native_term)].join(' ');
    return `<tr id="source-${row.paper_id.toLowerCase()}" data-coverage-source="${escape(row.paper_id)}" data-search="${escape(translate(search,'zh-hant')+' '+translate(search,'zh-hans'))}" data-methods="${row.evaluation_methods.join(' ')}" data-missing="${row.missing_count_fields.length>0}">
      <th scope="row"><a href="${escape(row.source_url)}" target="_blank" rel="noopener noreferrer">${t(row.name,locale)} ↗</a><small>${row.year} · ${t(row.category_name,locale)}</small></th>
      <td><p>${t(readable(row.domains),locale)}</p></td>
      <td>${countList(row,'environment')}</td>
      <td>${countList(row,'task')}</td>
      <td>${countList(row,'case')}${dataList(row)}</td>
      <td><div class="coverage-method-tags">${row.evaluation_methods.length?row.evaluation_methods.map(id=>`<span>${t(methodNames[id],locale)}</span>`).join(''):`<span class="pending">${t('判分方式待核',locale)}</span>`}</div><details><summary>${t('原作評測內容',locale)}</summary><p>${t(row.native_evaluation,locale)}</p></details></td>
      <td>${audit(row)}</td>
    </tr>`;
  }).join('');
  const domainRows=model.domains.map(d=>{
    const examples=model.rows.filter(r=>r.domain_map?.[d.id]==='direct').slice(0,3);
    return `<tr><th scope="row">${t(d.name,locale)}</th><td>${d.source_overview_direct}</td><td>${d.source_overview_partial}</td><td>${examples.length?examples.map(r=>`<a href="#source-${r.paper_id.toLowerCase()}">${t(r.name,locale)}</a>`).join('、'):t('目前沒有明確來源標記，續補',locale)}</td></tr>`;
  }).join('');
  const body=`<main class="wrap coverage-page" id="main-content">
    ${head('Coverage 總覽：前作有多少，整合後有多少','只用領域、環境、任務、題數、評估方式五個欄位。先讀全庫狀態，再逐一查前作；詳細分類和代號留在附錄。',route,locale,`<p class="page-meta"><span>${t('統整更新 '+model.date,locale)}</span><span>${t(`${s.registered_sources}筆已登記前作／評測來源`,locale)}</span><span>${t(`${s.reviewed_primary_sources_this_pass}個原始概述本次重新核對`,locale)}</span></p>`)}
    <nav class="coverage-jump" aria-label="${t('本頁閱讀入口',locale)}"><a href="#whole">${t('全庫總覽',locale)}</a><a href="#benchmarks">${t('前作比較表',locale)}</a><a href="#coverage-domain">${t('領域分布',locale)}</a><a href="#coverage-evaluation">${t('四種判分方式',locale)}</a><a href="#coverage-work">${t('接下來完成什麼',locale)}</a></nav>
    ${renderCoverageOverview(locale,model,helpers,{route})}
    <section class="section" id="whole"><h2>${t('整體現在到哪裡',locale)}</h2><p>${t('「原作公布多少」、「本庫收集多少」和「整合後能評多少」在同一表中說清楚；不拿早期規劃配額代替已完成量。',locale)}</p>
    <div class="table-scroll"><table id="coverage-whole-table"><thead><tr><th>${t('統計項目',locale)}</th><th>${t('目前確認',locale)}</th><th>${t('完整聯集還缺什麼',locale)}</th></tr></thead><tbody>${overviewRows(model).map(([id,name,value,note,remaining])=>`<tr id="${['domain','evaluation'].includes(id)?`coverage-${id}-summary`:`coverage-${id}`}"><th scope="row">${t(name,locale)}</th><td><b>${t(value,locale)}</b> · ${t(note,locale)}</td><td>${t(remaining,locale)}</td></tr>`).join('')}</tbody></table></div>
    <p class="source-note">${t(`${s.registered_sources}筆是來源名錄，含版本與衍生資源。${s.sources_with_task_list}筆已有原生清單索引，${s.sources_awaiting_task_list}筆仍待取得；資料收錄可以先進行，不受本機是否能模擬限制。`,locale)}</p></section>
    <section class="section" id="benchmarks"><h2>${t('每個 benchmark 的環境、任務、題數與評估方式',locale)}</h2><p>${t('每列保留原作單位與範圍。全集、訓練、測試、已取得版本互不混加；沒有數量依據的項目保留待查。影片或示範量可在「另有原始資料量」展開。',locale)}</p>
    <div class="coverage-controls js-only"><label for="coverage-q">${t('搜尋benchmark、領域或工作',locale)}<input type="search" id="coverage-q" placeholder="${t('例如 BEHAVIOR、Ego、裝配、问答',locale)}"></label><label for="coverage-method">${t('判分方式',locale)}<select id="coverage-method"><option value="">${t('全部方式',locale)}</option>${model.plan.evaluation_methods.map(m=>`<option value="${m.id}">${t(m.name,locale)}</option>`).join('')}<option value="pending">${t('待核',locale)}</option></select></label><button class="button secondary" id="coverage-reset">${t('清除篩選',locale)}</button></div>
    <div class="result-bar"><p id="coverage-count" role="status" aria-live="polite">${t(`${s.registered_sources}筆來源`,locale)}</p><a href="${downloads}/benchmark_summary.csv" download>${t('下載前作總表 CSV',locale)} ↓</a></div>
    <div class="table-scroll coverage-table-scroll" tabindex="0" role="region" aria-label="${t('前作比較表，可左右捲動',locale)}"><table id="coverage-benchmarks"><caption>${t('原作公布／固定版本的規模；不是我們已整合完成的總量',locale)}</caption><thead><tr>${['Benchmark','領域','環境／場景','任務／原生類型','題數與資料','評估方式','查核'].map(x=>`<th scope="col">${t(x,locale)}</th>`).join('')}</tr></thead><tbody>${sourceRows}</tbody></table></div>
    <p id="coverage-empty" hidden>${t('沒有符合的來源，請調整關鍵字或清除篩選。',locale)}</p>
    <div class="pagination js-only"><button id="coverage-prev">${t('上一頁',locale)}</button><span id="coverage-page-status"></span><button id="coverage-next">${t('下一頁',locale)}</button><button id="coverage-all">${t('顯示全部',locale)}</button></div>
    <p class="source-note">${t(model.notes.scoring_interpretation,locale)}</p></section>
    <section class="section" id="coverage-domain"><h2>${t('領域：先用同一份分類看來源分布',locale)}</h2><p>${t(`目前沿用${s.domain_labels}個應用領域。這張表統計來源概述中的領域標記；沒有把180個設計草案當成已收集的前作任務。`,locale)}</p>
    <div class="table-scroll"><table id="coverage-domain-table"><thead><tr><th>${t('領域',locale)}</th><th>${t('明確來源標記',locale)}</th><th>${t('部分／相鄰來源',locale)}</th><th>${t('可查回的前作例子',locale)}</th></tr></thead><tbody>${domainRows}</tbody></table></div>
    <p class="source-note">${t(model.notes.source_domain_scope,locale)} ${t('來源可以跨領域，各列不能相加當作不同benchmark數。原作超出現有12類的用途，保留原生描述，之後補入分類。',locale)}</p></section>
    <section class="section" id="coverage-evaluation"><h2>${t('評估方式：統整為四種怎麼判分的方法',locale)}</h2><p>${t('理解、記憶、預測、規劃或實際操作，都能回到下列判分方式。同一來源可用多種方式，具體metric仍各自報告。',locale)}</p><div class="coverage-evaluation-grid">${model.plan.evaluation_methods.map(m=>`<article><h3>${t(m.name,locale)}</h3><p>${t(m.examples,locale)}</p><p><b>${t('判分依據：',locale)}</b>${t(m.evidence,locale)}</p><small>${t(m.metrics,locale)}</small><p><a href="?method=${m.id}#benchmarks">${t('看使用此方式的來源分類',locale)} →</a></p></article>`).join('')}</div><p class="source-note">${t('四類是這次統整的報告口徑；人工與模型裁判分別留紀錄。它不表示全庫所有評分器都已完成。',locale)}</p></section>
    <section class="section" id="coverage-work"><h2>${t('接下來只沿這三步補齊',locale)}</h2><ol class="coverage-milestones">${model.plan.milestones.map(m=>`<li><b>${t(m.name,locale)}</b><p>${t(m.deliverable,locale)}</p><p class="source-note">${t('完成條件：'+m.acceptance,locale)}</p></li>`).join('')}</ol><p>${t(model.plan.target_rule,locale)}</p><p>${t(model.plan.scale_rule,locale)}</p></section>
    <details class="coverage-appendix"><summary>${t('詳細口徑、原生分類與舊代號',locale)}</summary><div class="table-scroll"><table><thead><tr><th>${t('主欄位',locale)}</th><th>${t('定義與細節',locale)}</th></tr></thead><tbody>${model.plan.fields.map(f=>`<tr><th>${t(f.name,locale)}</th><td>${t(f.definition+' '+f.detail,locale)}</td></tr>`).join('')}</tbody></table></div><p>${t('既有48家族、180情境和G／T定義保留作詳細參考；它們沒有被當作全庫已完成量。',locale)}</p><p><a href="${routeLink(route,'counting.html',locale)}">${t('計數及代號附錄',locale)}</a> · <a href="${routeLink(route,'survey-union.html',locale)}">${t('完整來源名錄與原生清單',locale)}</a> · <a href="${routeLink(route,'compare.html',locale)}">${t('68項原詳細比較',locale)}</a></p></details>
    <div class="reader-actions"><a href="${downloads}/COVERAGE_REPORT.md" download>${t('下載完整整理報告',locale)}</a><a href="${downloads}/count_ledger.csv" download>${t('逐筆數量與出處 CSV',locale)}</a><a href="${downloads}/coverage_snapshot.json" download>${t('全庫 JSON',locale)}</a><button class="text-button print-page">${t('列印本頁',locale)}</button></div>
    <script defer src="${relative(`${locale}/${route}`,'assets/coverage.js')}?v=${helpers.assetRevision||model.date}"></script>
  </main>`;
  return shell({route,locale,title:'Coverage總覽：領域、環境、任務、題數與評估方式',description:'用五個主欄位、兩張主表比較143筆前作來源，呈現整體收集與任務聯集狀態；保留原作單位和查核證據。',body,kind:'coverage'});
}
