import {formatCount, countScopeLabels} from './coverage-model.mjs';
import {quantityRows} from './quantified-model.mjs';

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

const number=v=>Number(v).toLocaleString('en-US');

function numberTable(locale,model,{t},id='coverage-whole-table'){
  return `<div class="table-scroll"><table id="${id}" class="number-contract-table"><thead><tr><th>${t('項目',locale)}</th><th>${t('本版規劃目標',locale)}</th><th>${t('目前清單實數',locale)}</th><th>${t('實數代表什麼',locale)}</th></tr></thead><tbody>${quantityRows(model.numbers).map(f=>`<tr data-number-field="${f.id}"${id==='coverage-whole-table'?` id="${['domain','evaluation'].includes(f.id)?`coverage-${f.id}-summary`:`coverage-${f.id}`}"`:''}><th scope="row">${t(f.label,locale)}</th><td data-number-role="target" data-number-value="${f.target}"><b>${number(f.target)}</b> ${t(f.target_unit,locale)}</td><td data-number-role="current" data-number-value="${f.current}"><b>${number(f.current)}</b> ${t(f.current_unit,locale)}</td><td>${t(f.current_limit,locale)}</td></tr>`).join('')}</tbody></table></div>`;
}

function quantityBreakdown(locale,model,{t,relative},route){
  const n=model.numbers;const dl=relative(`${locale}/${route}`,'downloads/quantified/');
  const labels={behavior:'BEHAVIOR-1K',robocasa:'RoboCasa365',ai2thor_alfred:'ALFRED／AI2-THOR',calvin:'CALVIN',hssd_partnr:'PARTNR／HSSD'};
  return `<section id="numbers-breakdown" class="section"><h2>${t('實數如何重算：每個數字都有清單',locale)}</h2>
    <div class="number-evidence-grid"><article><h3>${t(`${number(n.inventory.source_named_environment_definitions)}個場景定義`,locale)}</h3><div class="table-scroll"><table id="number-environment-breakdown"><thead><tr><th>${t('來源',locale)}</th><th>${t('場景定義',locale)}</th></tr></thead><tbody>${Object.entries(n.inventory.environment_counts).map(([id,count])=>`<tr><td>${t(labels[id],locale)}</td><td>${number(count)}</td></tr>`).join('')}</tbody></table></div><p>${t('按原作命名場景ID計數，沒有把樣式或D_eval變體另加。全資產載入與幾何等價審核仍需完成。',locale)}</p><a href="${dl}/environment_registry.csv" download>${t('下載完整場景ID與來源',locale)} ↓</a></article>
    <article><h3>${t(`${number(n.inventory.source_task_and_information_records)}筆來源任務／題型`,locale)}</h3><p>${t(`${number(n.inventory.previous_robot_task_source_definitions)}條既有robot定義＋CALVIN${n.inventory.new_calvin_task_definitions}條＝${number(n.inventory.robot_task_source_definitions)}；另有OpenEQA${n.inventory.openeqa_information_categories_separate}個資訊題型。它們是來源條目，還不是共同去重後的任務規格。`,locale)}</p><p>${t(`${n.inventory.human_activity_definitions_separate}個人類程序活動仍另列，沒有混入此數。每條任務均保留來源及未定／跨域標記。`,locale)}</p><p><a href="${dl}/task_registry.csv" download>${t('機器人任務清單',locale)} ↓</a> · <a href="${dl}/information_task_types.json" download>${t('資訊題型清單',locale)} ↓</a></p></article></div>
    <h3>${t(`${number(n.inventory.case_definition_records)}筆題目定義：保留原生split`,locale)}</h3><div class="table-scroll"><table id="number-case-breakdown"><thead><tr><th>${t('來源',locale)}</th><th>${t('原生split',locale)}</th><th>${t('題目型別',locale)}</th><th>${t('定義數',locale)}</th></tr></thead><tbody>${n.inventory.case_definitions_by_source_split.map(r=>`<tr><td>${r.source_id==='partnr'?'PARTNR':'OpenEQA'}</td><td>${t(r.native_split==='native_benchmark_unsplit'?'原作benchmark未細分':r.native_split,locale)}</td><td>${t(r.case_kind==='robot_episode'?'交互episode定義':'QA問題與答案',locale)}</td><td>${number(r.count)}</td></tr>`).join('')}</tbody></table></div>
    <p>${t('所有列均通過ID、必要欄位、環境／觀測引用及判分程序引用的結構檢查。原始3D資產與歷史影像未全部取得，本次新增模型試驗為0；這裡不把元資料稱為已跑完的評測。',locale)}</p>
    <p><a href="${dl}/case_registry.csv.gz" download>${t('全部題目ID、split、來源與hash（CSV.gz）',locale)} ↓</a> · <a href="${dl}/case_registry.jsonl.gz" download>JSONL.gz ↓</a> · <a href="${dl}/inventory_summary.json">${t('重算摘要',locale)}</a></p></section>`;
}

function numberBudgets(locale,model,{t},route){
  const c=model.numbers.contract;
  return `<section class="section" id="numbers-budget"><h2>${t('目標如何拆分：以下都是規劃配額',locale)}</h2><p>${t('5,000份任務規格＝2,000個來源基本任務＋3,000份有效規則擴充。規則必須改變目標、必要過程或限制，單純換顏色、視角、初態或同義句不計新規格。',locale)}</p>
    <div class="table-scroll"><table id="number-case-budget"><thead><tr><th>${t('題目預算',locale)}</th><th>${t('訓練／開發',locale)}</th><th>${t('驗證',locale)}</th><th>${t('測試',locale)}</th><th>${t('合計',locale)}</th></tr></thead><tbody>${c.case_target_components.map(r=>`<tr><th>${t(r.name,locale)}</th><td>${number(r.train)}</td><td>${number(r.validation)}</td><td>${number(r.test)}</td><td>${number(r.total)}</td></tr>`).join('')}</tbody></table></div><p class="source-note">${t(c.split_policy,locale)}</p>
    <details class="coverage-appendix" id="number-domain-budget"><summary>${t('展開12領域的場景、任務與題目配額',locale)}</summary><p>${t(c.quota_policy,locale)}</p><div class="table-scroll"><table><thead><tr>${['領域','場景','來源基本任務','規則規格','任務合計','題目預算'].map(x=>`<th>${t(x,locale)}</th>`).join('')}</tr></thead><tbody>${c.domain_quotas.map(r=>`<tr><th>${t(r.name,locale)}</th><td>${number(r.environments)}</td><td>${number(r.base_tasks)}</td><td>${number(r.rule_specs)}</td><td>${number(r.task_specs)}</td><td>${number(r.case_budget)}</td></tr>`).join('')}</tbody></table></div></details></section>`;
}

function numberVersions(locale,model,{t}){
  return `<details class="coverage-appendix number-versions" id="numbers-versions"><summary>${t('舊版數字已退役或換了範圍：逐項對照',locale)}</summary><p>${t(model.numbers.contract.old_version_policy,locale)}</p><div class="table-scroll"><table id="number-version-crosswalk"><thead><tr><th>${t('舊數字',locale)}</th><th>${t('原範圍',locale)}</th><th>${t('本版怎麼處理',locale)}</th></tr></thead><tbody>${model.numbers.contract.version_crosswalk.map(r=>`<tr><td>${t(r.old,locale)}</td><td>${t(r.old_scope,locale)}</td><td>${t(r.current,locale)}</td></tr>`).join('')}</tbody></table></div></details>`;
}

export function renderCoverageOverview(locale,model,helpers,{route='coverage.html',compact=false}={}){
  const {t,routeLink}=helpers;
  return `<section class="coverage-overview" aria-label="${t('全庫五項統計',locale)}">
    <p class="number-version-label">${t(model.numbers.contract.version.replace('numbers-','v')+' 唯一有效目標 · 規劃目標／目前清單實數',locale)}</p>
    <div class="coverage-cards">${quantityRows(model.numbers).map(f=>`<a class="coverage-card number-card" data-coverage-metric="${f.id}" href="${routeLink(route,`coverage.html#coverage-${f.id}`,locale)}"><span>${t(f.label,locale)}</span><small>${t('規劃目標',locale)}</small><strong data-target-count="${f.target}">${number(f.target)}</strong><small>${t(f.target_unit,locale)}</small><div class="number-current"><span>${t('目前清單',locale)}</span><b data-current-count="${f.current}">${number(f.current)}</b><small>${t(f.current_unit,locale)}</small></div></a>`).join('')}</div>
    <p class="coverage-scope">${t('目標是待建規模；實數是已取得的定義／元資料。它們的完成階段不同，不直接當成完成百分比。素材取得、共同去重與模型實測另外驗收。',locale)}${compact?` <a href="${routeLink(route,'coverage.html#numbers-breakdown',locale)}">${t('看清單、拆分及舊版對照',locale)} →</a>`:''}</p>
  </section>`;
}

export function renderCoverageNotice(locale,route,helpers){
  const {t,routeLink}=helpers;
  return `<div class="coverage-reader-note"><b>${t('目前數量以v0.9量化表為準',locale)}</b><p>${t('新版把本版規劃目標與目前清單實數分開。此處的原始分類、代號和歷史預算保留查閱，不與新版目標混加。',locale)}</p><a href="${routeLink(route,'coverage.html#whole',locale)}">${t('開啟唯一有效目標及目前實數',locale)} →</a></div>`;
}

export function renderCoverageDesign(locale,model,helpers,route='design.html'){
  const {t,routeLink}=helpers;
  return `<section id="coverage-design">
    <h2>${t('研究只用五個主欄位交代規模與覆蓋',locale)}</h2>
    <p>${t(model.plan.purpose,locale)}</p>
    ${numberTable(locale,model,{t},'design-number-table')}
    <div class="table-scroll"><table class="coverage-definition-table"><thead><tr><th>${t('欄位',locale)}</th><th>${t('要回答的問題',locale)}</th><th>${t('整理完成的條件',locale)}</th></tr></thead><tbody>${model.plan.fields.map(f=>`<tr><th>${t(f.name,locale)}</th><td>${t(f.question,locale)}</td><td>${t(f.completion,locale)}</td></tr>`).join('')}</tbody></table></div>
    <p>${t('主要成果只有兩張表：一張逐一列前作；一張報全庫聯集。任務家族、規則、材料、機體、觀測及執行次數留在各筆詳細資料，不要求讀者先學多組代號。',locale)}</p>
    <p>${t(model.plan.target_rule,locale)}</p>
    ${numberBudgets(locale,model,{t},route)}
    ${numberVersions(locale,model,{t})}
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
    ${head('本版目標與目前實數：五項都有數字','規劃目標與已取得清單分欄。每個實數可查到ID、來源版本和驗證紀錄；舊配額與不同單位不混入本版總量。',route,locale,`<p class="page-meta"><span class="pill green">${t(model.numbers.contract.version.replace('numbers-','v')+' 有效目標',locale)}</span><span>${t('清單截止 '+model.numbers.contract.effective_on,locale)}</span><span>${t(`${s.registered_sources}筆已登記來源`,locale)}</span></p>`)}
    <nav class="coverage-jump" aria-label="${t('本頁閱讀入口',locale)}"><a href="#whole">${t('目標／實數',locale)}</a><a href="#numbers-breakdown">${t('實數清單',locale)}</a><a href="#numbers-budget">${t('目標拆分',locale)}</a><a href="#benchmarks">${t('前作比較',locale)}</a><a href="#numbers-versions">${t('舊版對照',locale)}</a></nav>
    ${renderCoverageOverview(locale,model,helpers,{route})}
    <section class="section" id="whole"><h2>${t('唯一有效量化表：目標和实數分開看',locale)}</h2><p>${t('本版目标是一组明确的建设预算；右栏为现有清单实数，附实际单位与完成阶段。两者不可直接换算完成百分比。',locale)}</p>
    ${numberTable(locale,model,helpers)}
    <p class="source-note">${t(`${s.registered_sources}筆是來源名錄，含版本與衍生資源。${s.sources_with_task_list}筆已有原生清單索引，${s.sources_awaiting_task_list}筆仍待取得；資料收錄可以先進行，不受本機是否能模擬限制。`,locale)}</p></section>
    ${quantityBreakdown(locale,model,helpers,route)}
    ${numberBudgets(locale,model,helpers,route)}
    <section class="section" id="benchmarks"><h2>${t('每個 benchmark 的環境、任務、題數與評估方式',locale)}</h2><p>${t('每列保留原作單位與範圍。已核到新資料檔的来源使用固定版本實數，舊概述收在「來源與口徑」；全集、訓練、測試和mini子集不重複相加。其他來源尚未取得的數值保持待查。',locale)}</p>
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
    ${numberVersions(locale,model,helpers)}
    <details class="coverage-appendix"><summary>${t('詳細口徑、原生分類與舊代號',locale)}</summary><div class="table-scroll"><table><thead><tr><th>${t('主欄位',locale)}</th><th>${t('定義與細節',locale)}</th></tr></thead><tbody>${model.plan.fields.map(f=>`<tr><th>${t(f.name,locale)}</th><td>${t(f.definition+' '+f.detail,locale)}</td></tr>`).join('')}</tbody></table></div><p>${t('既有48家族、180情境和G／T定義保留作詳細參考；它們沒有被當作全庫已完成量。',locale)}</p><p><a href="${routeLink(route,'counting.html',locale)}">${t('計數及代號附錄',locale)}</a> · <a href="${routeLink(route,'survey-union.html',locale)}">${t('完整來源名錄與原生清單',locale)}</a> · <a href="${routeLink(route,'compare.html',locale)}">${t('68項原詳細比較',locale)}</a></p></details>
    <div class="reader-actions"><a href="${relative(`${locale}/${route}`,'downloads/quantified/NUMBERS_REPORT.md')}" download>${t('下載本版數字與舊版對照',locale)}</a><a href="${downloads}/COVERAGE_REPORT.md" download>${t('完整前作報告',locale)}</a><a href="${downloads}/count_ledger.csv" download>${t('數量出處 CSV',locale)}</a><a href="${downloads}/coverage_snapshot.json" download>${t('全庫 JSON',locale)}</a><button class="text-button print-page">${t('列印本頁',locale)}</button></div>
    <script defer src="${relative(`${locale}/${route}`,'assets/coverage.js')}?v=${helpers.assetRevision||model.date}"></script>
  </main>`;
  return shell({route,locale,title:'Coverage總覽：領域、環境、任務、題數與評估方式',description:'用五個主欄位、兩張主表比較143筆前作來源，呈現整體收集與任務聯集狀態；保留原作單位和查核證據。',body,kind:'coverage'});
}
