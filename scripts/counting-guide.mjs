export const indexUnitLabels={
  activity_definition_directory:'活動定義目錄',
  native_task_id:'原作任務ID',
  native_task_class:'原作任務類別',
  native_task_registration:'原作任務註冊',
  native_task_module:'原作任務模組',
  demo_entrypoint:'示範程式入口',
  task_scene_entrypoint:'任務場景入口',
  native_task_schema:'任務schema',
  generator_configuration:'生成器設定',
  integration_registration_group:'框架註冊組',
  evaluation_protocol:'評測協定',
  video_task_schema:'影片／任務題型',
  human_sim_task_mapping:'人類／模擬任務對應',
  native_task_template:'任務模板',
  instructional_activity_definition:'人類活動定義',
  native_task_definition:'原作任務定義',
  information_task_schema:'資訊題型定義'
};

export function renderCountingOverview(locale,stats,helpers,{route,breakdown=true}){
  const {t,routeLink}=helpers;
  const others=stats.total_source_records-stats.native_robot_task_candidates-stats.human_activity_definitions;
  const link=anchor=>routeLink(route,'counting.html'+anchor,locale);
  return `<section class="counting-overview" data-counting-overview aria-label="${t('來源、索引、環境與資料量分開計數',locale)}">
    <div class="counting-metrics">
      <a href="${link('#source-entry')}" class="counting-metric" data-counting-metric="sources"><strong>${stats.benchmark_or_eval_resource_records}</strong><b>${t('已登記評測來源',locale)}</b><span>${t('名錄條目，含資料資源與版本',locale)}</span></a>
      <a href="${link('#source-index')}" class="counting-metric" data-counting-metric="indices"><strong>${stats.total_source_records.toLocaleString('en-US')}</strong><b>${t('已提取定義／設定索引',locale)}</b><span>${t('任務、活動、模板、註冊與協定',locale)}</span></a>
      <a href="${link('#task-environment')}" class="counting-metric pending" data-counting-metric="environments" data-count-state="unknown"><strong>${t('待整理',locale)}</strong><b>${t('任務環境定義總數',locale)}</b><span>${t('完整規格與來源關係對齊後統計',locale)}</span></a>
      <a href="${link('#sample')}" class="counting-metric pending" data-counting-metric="samples" data-count-state="unknown"><strong>${t('未統計',locale)}</strong><b>${t('完整來源的樣本總量',locale)}</b><span>${t('影片、QA、episode與軌跡分項列出',locale)}</span></a>
    </div>
    <p class="counting-progress" data-extraction-progress>${t(`來源提取進度：${stats.benchmark_or_eval_resource_records}條名錄中，${stats.benchmark_source_records_with_task_inventory}條已有部分索引可查，${stats.benchmark_source_records_awaiting_task_inventory}條仍待補原生清單。已有索引的來源，也需繼續核對清單完整性。`,locale)}</p>
    <p class="counting-note">${t('「待整理／未統計」表示全庫統計尚未完成，不是已知為0；既有可執行子集另有實驗紀錄。',locale)}</p>
    ${breakdown?`<div class="index-breakdown" data-index-breakdown data-total="${stats.total_source_records}"><p><b>${t(`${stats.total_source_records.toLocaleString('en-US')}條索引裡包含：`,locale)}</b></p><div class="index-subsets"><div data-index-bucket="robot" data-count="${stats.native_robot_task_candidates}"><strong>${stats.native_robot_task_candidates.toLocaleString('en-US')}</strong><span>${t('原作robot任務條目',locale)}</span><small>${t('待統一規格與對齊；原欄位稱「候選」',locale)}</small></div><div data-index-bucket="human" data-count="${stats.human_activity_definitions}"><strong>${stats.human_activity_definitions}</strong><span>${t('人類活動／流程定義',locale)}</span><small>${t('COIN與CrossTask的活動類別',locale)}</small></div><div data-index-bucket="other" data-count="${others}"><strong>${others.toLocaleString('en-US')}</strong><span>${t('其他定義與設定索引',locale)}</span><small>${t('框架註冊、協定、配對與示範入口',locale)}</small></div></div><p class="counting-note">${t(`以上已包含在${stats.total_source_records.toLocaleString('en-US')}索引總數裡；原始樣本與題目定義另外計數。其他索引也包含本版新增的資訊題型。`,locale)}</p></div>`:''}
${route!=='counting.html'?`<p><a class="section-link" href="${link('')}">${t('來源、環境、場景、測例到底怎麼算？',locale)} →</a></p>`:''}
  </section>`;
}

export function renderEnvironmentNote(locale,helpers,route){
  const {t,routeLink}=helpers;
  return `<div class="counting-definition-note" data-environment-definition-note><b>${t('整合單位：任務環境定義',locale)}</b><p>${t('每份規格明訂場景／物件與機器人、觀測／動作介面、初態與狀態變化，以及任務目標、限制和判分。可先依原作收集定義，載入、執行和驗證進度另外記錄。',locale)}</p><a href="${routeLink(route,'counting.html#task-environment',locale)}">${t('看完整定義與計數例子',locale)} →</a></div>`;
}

export function renderCountingPage(locale,stats,contract,helpers){
  const {t,escape,relative,routeLink,head,shell}=helpers;
  const route='counting.html';
  const dl=relative(`${locale}/${route}`,'downloads/counting/');
  const examples=contract.examples.map(e=>`<tr data-count-example="${e.id}"><th><a href="${escape(e.source_url)}" target="_blank" rel="noopener noreferrer">${escape(e.name)} ↗</a></th><td><strong>${e.indexed_records}</strong> ${t(e.index_unit,locale)}</td><td>${t(e.reported_scale,locale)}</td><td>${t(e.acquisition_note,locale)}</td></tr>`).join('');
  const demo=contract.hypothetical_example;
  const definitions=contract.definitions.map(d=>`<article class="count-definition" id="${d.id}"><h3>${t(d.name,locale)}</h3><p>${t(d.definition,locale)}</p><p class="counting-note">${t(d.counting_rule,locale)}</p></article>`).join('');
  const body=`<main class="wrap counting-main" id="main-content">
    ${head(`${stats.total_source_records.toLocaleString('en-US')}是來源索引；本頁為計數細節附錄。`,'把來源名錄、原作索引、任務環境定義、場景、測例與一次執行分成不同層級；G／T代號的完整定義也集中在本頁。',route,locale,`<div class="page-meta"><span>${t('計數說明：2026-10-01',locale)}</span><span>${t('G／T速查：2026-10-02',locale)}</span><span>${t(`來源清單快照：${stats.date}`,locale)}</span></div>`)}
    <div class="coverage-reader-note"><b>${t('這一頁現在作為計數細節附錄',locale)}</b><p>${t('新版主表只保留領域、環境、任務、題數與評估方式。「環境」主欄統一列場景／layout；下方任務環境定義是連接場景與任務的完整技術規格。',locale)}</p><a href="${routeLink(route,'coverage.html',locale)}">${t('先看五欄Coverage總覽',locale)} →</a></div>
    <nav class="symbol-guide-links counting-jump-links" aria-label="${t('計數與代號快速導覽',locale)}"><a href="#symbols-g">${t('G0–G5：計數層級',locale)}</a><a href="#symbols-t">${t('T1–T8：評測模組',locale)}</a><a href="#task-environment">${t('任務環境定義',locale)}</a><a href="#real-source-examples">${t('索引與樣本實例',locale)}</a></nav>
    ${renderCountingOverview(locale,stats,helpers,{route})}
    <section class="counting-section" id="real-source-examples"><h2>${t('同一個來源，索引數與樣本數可以差很多',locale)}</h2>
      <div class="table-scroll"><table id="counting-source-examples"><thead><tr><th>${t('原作',locale)}</th><th>${t('本庫索引中登記的內容',locale)}</th><th>${t('原作公布的規模',locale)}</th><th>${t('本庫取得／整理狀態',locale)}</th></tr></thead><tbody>${examples}</tbody></table></div>
      <p>${t('例如PARTNR的6條是生成器設定索引，不是原作只有6個任務。右欄的原作規模也不代表我們已下載或整合全部樣本；完整前作任務聯集仍在整理。',locale)}</p>
      <p><a href="${routeLink(route,'survey-union.html',locale)}#union-catalogue">${t('回到來源總表核對原作單位與提取進度',locale)} →</a></p>
    </section>
    <section class="counting-section" id="count-definitions"><h2>${t('這幾個名詞，各自定義什麼',locale)}</h2><div class="count-definition-grid">${definitions}</div></section>
    ${renderSymbolGuide(locale,helpers.symbolGuide,helpers.tracks,{t,escape,relative,routeLink})}
    <section class="counting-section" id="environment-spec"><h2>${t('什麼時候能登記為任務環境定義',locale)}</h2>
      <p>${t('這是本計畫採用的整理約定。可以把原作任務及其可交互世界封裝成task environment，並保留下面四組規格：',locale)}</p>
      <ol class="environment-components"><li><b>${t('世界與機體',locale)}</b>：${t('场景／layout、物件、材料與機器人，或可追溯的原作定義。',locale)}</li><li><b>${t('觀測與動作',locale)}</b>：${t('模型能看什麼、能操作什麼，以及介面與控制約定。',locale)}</li><li><b>${t('狀態規則',locale)}</b>：${t('如何初始化、有效初態範圍、動作造成哪些狀態變化。',locale)}</li><li><b>${t('任務與判分',locale)}</b>：${t('目標、必要過程、限制、完成條件與評分。',locale)}</li></ol>
      <p>${t('原作已提供這些內容時，可以先收集和對齊規格；未取得的部分標待補。影片、活動名称或生成器設定仍保留在來源索引，另外建立它們到環境規格的對應。離線QA／預測保留其評測型別。',locale)}</p>
      <div class="count-status-columns"><div><h3>${t('定義整理狀態',locale)}</h3><p>${t('已有索引 → 來源已連結 → 規格完整 → 身份／別名已對齊',locale)}</p></div><div><h3>${t('執行驗證狀態',locale)}</h3><p>${t('未測試 → 載入已核對 → 軌跡已核對 → 判分已核對',locale)}</p></div></div>
      <p class="counting-note">${t('兩組狀態分開保存。本機尚未跑過，不會把來源或環境定義從目錄刪掉；同時，已有定義也不直接標成已驗證可執行。',locale)}</p>
    </section>
    <section class="counting-section" id="counting-example" data-counting-demo data-scene-count="${demo.scene_layouts}" data-definition-count="${demo.task_environment_definitions}">
      <span class="pill status">${t('假設算例 · 非已建資料或實驗結果',locale)}</span><h2>${t('一間廚房，可以有多個任務環境',locale)}</h2>
      <p>${t('假設使用同一間廚房，分別定義「收杯子」「開櫃門」「倒出指定水量」三個任務環境。它們共用場景，但目標與判分規則不同。',locale)}</p>
      <div class="case-count-control js-only"><label for="counting-cases-per-definition">${t('假設每個任務環境已建立的有效測例數',locale)}</label><select id="counting-cases-per-definition">${demo.valid_cases_per_definition_options.map(n=>`<option value="${n}"${n===demo.default_valid_cases_per_definition?' selected':''}>${n}</option>`).join('')}</select></div>
      <div class="count-example-grid"><div><strong data-example-count="scenes">1</strong><span>${t('場景／layout',locale)}</span></div><div><strong data-example-count="definitions">3</strong><span>${t('任務環境定義',locale)}</span></div><div><strong data-example-count="cases-per-definition">100</strong><span>${t('每個定義的有效測例',locale)}</span></div><div><strong data-example-count="cases">300</strong><span>${t('總測例數',locale)}</span></div></div>
      <p id="counting-formula" aria-live="polite">3 × 100 = 300</p>
      <p class="counting-note">${t('改變有效測例數，會增加測試量；場景仍是1個、任務環境定義仍是3份。規則或互動系統有實質改變時，另建立版本／綁定並審核其差異。這個算例不增加本庫實際計數。',locale)}</p>
    </section>
    <section class="counting-section" id="counting-downloads"><h2>${t('比較前作時，這些欄位一起保留',locale)}</h2>
      <p>${t('來源數、原生任務／模板數、共同task、規則變體、任務環境定義、場景數、測例數、原作樣本量、已取得／已整合量與方法執行量分欄。不同名稱或註冊ID不直接當成新的環境，同源版本與資料重疊繼續追溯。',locale)}</p>
      <div class="reader-actions"><a class="text-button" href="${dl}/COUNTING_GUIDE.md" download>${t('下載白話計數說明',locale)}</a><a class="text-button" href="${dl}/counting_contract.json" download>${t('下載計數定義JSON',locale)}</a><a class="text-button" href="${routeLink(route,'design.html',locale)}">${t('回到來源聯集主設計',locale)}</a></div>
      <p class="source-note">${t('環境介面的背景可參考',locale)} ${contract.references.map(r=>`<a href="${escape(r.url)}" target="_blank" rel="noopener noreferrer">${t(r.name,locale)}</a>`).join(' · ')}。${t('本頁的資料分層與計數規則是本計畫的明訂約定。',locale)}</p>
    </section>
  </main><script defer src="${relative(`${locale}/${route}`,'assets/counting.js')}"></script>`;
  return shell({route,locale,title:'計數與代號：G0–G5、T1–T8與任務環境',description:`G／T舊代號與環境計數細節。${stats.total_source_records.toLocaleString('en-US')}索引與本版目標／清單實數分開，主入口見Coverage量化表。`,body,kind:'counting'});
}
import {renderSymbolGuide} from './symbol-guide.mjs';
