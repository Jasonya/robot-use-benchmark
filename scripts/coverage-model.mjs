const environmentUnits = new Set(['native_scene', 'layout']);
const taskUnits = new Set(['native_activity', 'native_task', 'native_task_category', 'native_task_schema']);
const caseUnits = new Set(['evaluation_case', 'episode', 'task_instance']);
const dataUnits = new Set(['demonstration_trajectory', 'video_hour', 'language_directive', 'frame', 'video', 'demonstration_pair', 'recording_session', 'annotation', 'training_sample']);
const countRoleOverrides = {
  'alfred:039': 'data',
  'teach:042': 'data',
  'epic100:095': 'data',
  'egotaskqa:083': 'data',
  'watchact:053': 'data'
};
const caseTextOverrides = {
  alfred: '固定評測題目與split總數待補；專家示範量在下方另列。',
  teach: 'EDH／TFD各自的固定題數待補；原始對話遊戲session另列。',
  epic100: '各challenge與split的固定題數待補；動作標註全集另列。',
  P003: '固定評測題目與split數量待補；11,827是影片資料量。',
  P108: '沒有固定、去重題庫總量；成對政策評估紀錄在下方另列。'
};
export const countScopeLabels = {
  whole_resource: '原作全集',
  evaluated_subset: '原作評測子集',
  training: '訓練',
  test: '測試',
  validation: '驗證',
  available_source_snapshot: '已取得版本'
};
const fieldFor = record => {
  if (countRoleOverrides[record.record_id]) return countRoleOverrides[record.record_id];
  if (record.field) return record.field;
  if (environmentUnits.has(record.unit)) return 'environment';
  if (taskUnits.has(record.unit)) return 'task';
  if (caseUnits.has(record.unit)) return 'case';
  if (dataUnits.has(record.unit)) return 'data';
  if (record.unit === 'native_domain_category') return 'domain';
  return 'detail';
};
export function formatCount(record) {
  const prefix = {at_least: '≥ ', more_than: '> ', approximate: '約 '}[record.value_kind] || '';
  return prefix + Number(record.value).toLocaleString('en-US');
}
export function buildCoverageModel({plan, registry, comparison, typed, supplement, scoring, reviews, displayNotes, unionStats, taxonomy, tasks, families,numbers}) {
  const registered = registry.filter(r => r.benchmark_source_registered);
  const byComparison = Object.fromEntries(comparison.rows.filter(r => r.group !== 'ours').map(r => [r.id, r]));
  const recordIds = new Set();
  const rows = registered.map(source => {
    const previous = byComparison[source.detailed_comparison_id];
    const counts = [
      ...typed.rows.filter(r => r.work_id === source.detailed_comparison_id && r.value != null && r.unit !== 'canonical_g2'),
      ...supplement.filter(r => r.paper_id === source.paper_id)
    ].map(r => ({
      ...r,
      paper_id: source.paper_id,
      benchmark: source.name,
      field: numbers&&recordIsHistoricalForCurrentInventory(r)?'history':fieldFor(r),
      record_status: numbers&&recordIsHistoricalForCurrentInventory(r)?'historical_source_scope':'active_source_fact',
      eligible_for_global_sum: false
    }));
    for (const count of counts) {
      if (recordIds.has(count.record_id)) throw new Error(`Duplicate coverage count ${count.record_id}`);
      recordIds.add(count.record_id);
      if (!Number.isFinite(count.value) || !count.evidence?.length) throw new Error(`Unproven count ${count.record_id}`);
    }
    const evaluationMethods = Object.entries(scoring.groups).filter(([, ids]) => ids.includes(source.paper_id) || ids.includes(source.detailed_comparison_id)).map(([id]) => id);
    const currentReview = reviews.find(r => r.paper_id === source.paper_id);
    const measured = counts.filter(r => ['environment', 'task', 'case'].includes(r.field));
    return {
      paper_id: source.paper_id,
      name: source.name,
      year: source.year,
      title: source.title,
      source_url: source.source_url,
      detailed_comparison_id: source.detailed_comparison_id,
      source_ids: source.source_ids,
      category_name: source.category_name,
      source_count: source.source_records,
      has_task_list: source.task_list_status === 'fixed_source_records_available',
      task_list_complete: source.task_list_complete_for_whole_work === true,
      task_list_scope: source.source_scope_note,
      domains: previous?.domain || displayNotes?.domains[source.paper_id] || source.declared_domains || source.scope_note || '領域待對齊',
      environments: (numbers&&['P143','P038'].includes(source.paper_id)?source.scenes:null) || previous?.scenes || source.scenes || (source.category==='V'?'影片觀測來源；錄製環境總數待整理。':'原作場景總數待查'),
      tasks: previous?.tasks || source.native_tasks || '原作任務總數待查',
      cases: (numbers&&['P143','P038'].includes(source.paper_id)?source.cases:null) || caseTextOverrides[source.detailed_comparison_id] || caseTextOverrides[source.paper_id] || previous?.cases || source.cases || '固定題目／split總數待查',
      native_evaluation: scoring.source_notes[source.paper_id] || previous?.evaluation || '判分方式待核；目前保留來源研究用途。',
      evaluation_methods: evaluationMethods,
      evaluation_classification_status: evaluationMethods.length ? 'source_overview_interpretation' : 'pending',
      domain_map: previous?.domain_map || null,
      counts,
      has_scale_count: measured.length > 0,
      missing_count_fields: ['environment', 'task', 'case'].filter(field => !counts.some(c => c.field === field)),
      review: {
        type: currentReview ? '本次原始概述核對' : previous ? '既有原文／數量摘錄' : '來源名錄／摘要線索',
        date: currentReview ? plan.date : previous ? comparison.prior_work_review_as_of : null,
        evidence_depth: source.evidence_depth,
        numeric_count_records: measured.length,
        task_list: source.task_list_status === 'fixed_source_records_available' ? (source.task_list_complete_for_whole_work === true ? '原生清單已取得（限所列版本／單位）' : '原生清單已有部分索引') : '原生清單待取得',
        scoring: evaluationMethods.length ? '已按評測概述分類；具體metric／程式另核' : '判分依據待核',
        local_execution: source.detailed_comparison_id === 'metaworld' ? '另有50任務的本機工程子集紀錄' : '本次coverage整理未新增執行',
        primary_review: currentReview || null
      },
      references: previous?.references || [{label: '原始來源', url: source.source_url, scope: source.evidence_depth}]
    };
  });
  const priority = ['behavior','robocasa365','partnr','calvin','libero','rlbench','metaworld','maniskill2','robotwin2','garmentlab','alfred','teach','watchact','P075','P081','P003','P004','P038','P108','egoplan2','egoschema','ego4d','egoexo4d','epic100'];
  const rank = row => {
    const i = priority.indexOf(row.detailed_comparison_id || row.paper_id);
    return i < 0 ? 1000 : i;
  };
  rows.sort((a,b) => rank(a)-rank(b) || a.name.localeCompare(b.name, 'en'));
  const domains = Object.entries(taxonomy.application_contexts).map(([id, domain]) => {
    const subset = tasks.filter(r => r.application_context_id === id);
    return {
      id, name: domain.name,
      source_overview_direct: rows.filter(r => r.domain_map?.[id] === 'direct').length,
      source_overview_partial: rows.filter(r => r.domain_map?.[id] === 'partial').length,
      source_overview_unknown: rows.filter(r => !r.domain_map || r.domain_map[id] === 'unknown').length,
      mapped_task_count: null,
      legacy_blueprints: subset.length,
      legacy_families: new Set(subset.map(r => r.task_family_id)).size
    };
  });
  const sourceCount = field => rows.filter(r => r.counts.some(c => c.field === field)).length;
  return {
    version: plan.version,
    date: plan.date,
    source_snapshot: unionStats.date,
    primary_review_date: plan.date,
    scope: '143 registered evaluation-source records; coverage report reorganized with retained native units and split scopes, not a completed task union.',
    plan,
    numbers,
    statistics: {
      registered_sources: rows.length,
      earlier_detailed_sources: Object.keys(byComparison).length,
      reviewed_primary_sources_this_pass: reviews.length,
      count_records: rows.flatMap(r=>r.counts).length,
      additional_count_records: supplement.length,
      sources_with_any_scale_count: rows.filter(r => r.has_scale_count).length,
      sources_with_environment_count: sourceCount('environment'),
      sources_with_task_count: sourceCount('task'),
      sources_with_case_count: sourceCount('case'),
      sources_with_data_count: sourceCount('data'),
      sources_with_all_three_scale_fields: rows.filter(r => !r.missing_count_fields.length).length,
      sources_with_task_list: rows.filter(r => r.has_task_list).length,
      sources_awaiting_task_list: rows.filter(r => !r.has_task_list).length,
      sources_with_scoring_classification: rows.filter(r => r.evaluation_methods.length).length,
      domain_labels: domains.length,
      domain_labels_with_explicit_source_overview: domains.filter(d => d.source_overview_direct > 0).length,
      domain_mapped_sources: rows.filter(r => r.domain_map).length,
      domain_unmapped_sources: rows.filter(r => !r.domain_map).length,
      native_robot_task_records: unionStats.native_robot_task_candidates,
      human_activity_records: unionStats.human_activity_definitions,
      common_task_union: null,
      canonical_environment_union: null,
      integrated_cases_by_type: null,
      evaluation_method_groups: plan.evaluation_methods.length,
      legacy_family_labels: families.length,
      legacy_blueprints: tasks.length
    },
    domains,
    rows,
    notes: {
      no_mixed_total: '全庫環境、共同任務與題數尚未完成對齊；不相加異質單位、父／衍生資料或全集與子集。',
      scoring_interpretation: scoring.method,
      source_domain_scope: '沿用68項比較的來源概述標註，其餘75項共同域映射待補。來源域標註不是逐任務或執行覆蓋。',
      native_count_scope: '每筆數字保留原作單位、scope及出處；欄位有數字不表示該來源完整任務清單或判分程式已核完。'
    }
  };
}

export function coverageCSV(rows) {
  const keys = ['benchmark','paper_id','field','value','value_kind','native_term','unit','scope','source_version','source','locator','notes'];
  const escapeCSV = value => `"${String(value ?? '').replaceAll('"','""')}"`;
  const records = rows.flatMap(row => row.counts.map(c => ({
    ...c,
    source: c.evidence.map(e=>e.source).join(' | '),
    locator: c.evidence.map(e=>e.locator).join(' | ')
  })));
  return '\uFEFF' + [keys.join(','), ...records.map(r=>keys.map(k=>escapeCSV(r[k])).join(','))].join('\n') + '\n';
}

export function coverageRowsCSV(model) {
  const names=Object.fromEntries(model.plan.evaluation_methods.map(m=>[m.id,m.name]));
  const keys=['benchmark','paper_id','year','domain','environments','tasks','cases','source_data','evaluation_methods','audit_type','task_list_status','source_url'];
  const csv=value=>`"${String(value??'').replaceAll('"','""')}"`;
  const field=(row,kind,fallback)=>row.counts.filter(c=>c.field===kind).map(c=>`${formatCount(c)} ${c.native_term}（${countScopeLabels[c.scope]||c.scope}）${c.notes?'；'+c.notes:''}`).join(' | ') || fallback;
  const rows=model.rows.map(r=>({
    benchmark:r.name,paper_id:r.paper_id,year:r.year,domain:r.domains,
    environments:field(r,'environment',r.environments),tasks:field(r,'task',r.tasks),
    cases:field(r,'case',r.cases),source_data:field(r,'data','原始資料量待查'),
    evaluation_methods:r.evaluation_methods.map(id=>names[id]).join(' | ')||'待核',
    audit_type:r.review.type,task_list_status:r.review.task_list,source_url:r.source_url
  }));
  return '\uFEFF'+[keys.join(','),...rows.map(r=>keys.map(k=>csv(r[k])).join(','))].join('\n')+'\n';
}

export function coverageMarkdown(model) {
  const s = model.statistics;
  const clean = value => String(value ?? '').replaceAll('|','／').replace(/\s+/g,' ').trim();
  const field = (row, kind) => row.counts.filter(c=>c.field===kind).map(c=>`${formatCount(c)} ${c.native_term}（${countScopeLabels[c.scope] || c.scope}）`).join('；') || ({environment:row.environments,task:row.tasks,case:row.cases}[kind] || '待查／未整理');
  const methodNames = Object.fromEntries(model.plan.evaluation_methods.map(m=>[m.id,m.name]));
  if(model.numbers)return quantityReportMarkdown(model.numbers)+'\n## 全部前作比較：各自來源版本及單位\n\n| Benchmark | 領域 | 環境 | 任務 | 題數／評測記錄 | 原始資料 | 判分分類 |\n|---|---|---|---|---|---|---|\n'+model.rows.map(r=>`| [${clean(r.name)}](${r.source_url}) | ${clean(r.domains)} | ${clean(field(r,'environment'))} | ${clean(field(r,'task'))} | ${clean(field(r,'case'))} | ${clean(field(r,'data'))} | ${r.evaluation_methods.map(id=>methodNames[id]).join('／') || '待核'} |`).join('\n')+'\n';
  return [
    '# Coverage 統整：五個欄位、兩張主表','',`版本 ${model.version}；整理 ${model.date}；來源庫快照 ${model.source_snapshot}。`,'',
    model.plan.purpose,'',
    '## 全庫總覽','',
    '| 項目 | 目前確認 | 完整聯集狀態 |','|---|---|---|',
    `| 領域 | ${s.domain_labels}個現有分類；其中${s.domain_labels_with_explicit_source_overview}個有前作概述明確標記 | ${s.domain_unmapped_sources}筆來源尚未做共同域映射；逐任務分布待補 |`,
    `| 環境 | ${s.sources_with_environment_count}/${s.registered_sources}筆來源已有某種環境數量摘錄 | 可交互場景與錄製環境分項；全庫去重總量未定 |`,
    `| 任務 | ${s.native_robot_task_records.toLocaleString('en-US')}筆原作robot任務條目；另${s.human_activity_records}筆人類活動 | 來源重疊、共同規格與規則增量待對齊 |`,
    `| 題數 | ${s.sources_with_case_count}/${s.registered_sources}筆來源已有原作評測單位／episode數量 | QA、控制和預測分項；全庫整合題數未定 |`,
    `| 評估方式 | ${s.evaluation_method_groups}類判分方式；${s.sources_with_scoring_classification}筆來源有概述分類 | 具體metric與判分程式另核 |`,'',
    `${s.registered_sources}筆為已登記來源／版本，並非互不重疊的獨立資料集。本次重新核對${s.reviewed_primary_sources_this_pass}個原始概述，新增${s.additional_count_records}筆帶單位數量摘錄；没有新增robot執行。`,'',
    '## 五欄的定義','',
    ...model.plan.fields.flatMap(f=>[`### ${f.name}：${f.question}`,'',f.definition,'',f.whole_count_rule,'']),
    '## 四類評估方式','',
    '| 方式 | 適用例子 | 證據 |','|---|---|---|',
    ...model.plan.evaluation_methods.map(m=>`| ${m.name} | ${m.examples} | ${m.evidence} |`),'',
    model.notes.scoring_interpretation,'',
    '## 領域分布','',
    '此表是68項既有來源概述標註的分布；不是已對齊的任務數或已執行覆蓋。其餘75筆來源映射仍待補。','',
    '| 領域 | 明確來源標記 | 部分／相鄰 | 尚無明確標記 |','|---|---:|---:|---:|',
    ...model.domains.map(d=>`| ${d.name} | ${d.source_overview_direct} | ${d.source_overview_partial} | ${d.source_overview_unknown} |`),'',
    '## 工作順序與完成條件','',
    ...model.plan.milestones.flatMap((m,i)=>[`${i+1}. **${m.name}**：${m.deliverable} 完成條件：${m.acceptance}`,'']),
    model.plan.target_rule,'',model.plan.scale_rule,'',
    '## 前作比較總表','',
    '下列數字只描述所註明的原作版本／範圍。題數欄保留原生QA、episodes等單位，來源資料另列。待查不表示0。','',
    '| Benchmark | 領域 | 環境 | 任務 | 題數／評測記錄 | 原始資料 | 判分分類 |','|---|---|---|---|---|---|---|',
    ...model.rows.map(r=>`| [${clean(r.name)}](${r.source_url}) | ${clean(r.domains)} | ${clean(field(r,'environment'))} | ${clean(field(r,'task'))} | ${clean(field(r,'case'))} | ${clean(field(r,'data'))} | ${r.evaluation_methods.map(id=>methodNames[id]).join('／') || '待核'} |`),'',
    '完整CSV／JSON逐筆保留版本、split、出處和查核狀態。G／T、家族、規則和執行次數為詳細資料，不再作主要閱讀門檻。',''
  ].join('\n');
}
import {recordIsHistoricalForCurrentInventory,quantityReportMarkdown} from './quantified-model.mjs';
