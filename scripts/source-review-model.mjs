import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const methodMap = {
  '標準答案比對':'answer','答案或標籤比對':'answer',
  '數值誤差與相似度':'distance','数值誤差與相似度':'distance',
  '環境狀態與過程檢查':'state_process',
  '人工或模型評審':'judge','人類或模型判讀':'judge'
};
const fieldNames={domain:'領域',environment:'環境',task:'任務',case:'題數',evaluation:'評估方式'};
export async function loadSourceReview(root, bibliography) {
  const dir=path.join(root,'content/fulltext_review');
  const names=(await fs.readdir(dir)).filter(n=>/^batch\d+\.json$/.test(n)).sort();
  const [batches,codebook,screening,receipts]=await Promise.all([
    Promise.all(names.map(n=>fs.readFile(path.join(dir,n),'utf8').then(JSON.parse))),
    fs.readFile(path.join(dir,'codebook.json'),'utf8').then(JSON.parse),
    fs.readFile(path.join(dir,'screening.json'),'utf8').then(JSON.parse),
    fs.readFile(path.join(dir,'acquisition_receipts.json'),'utf8').then(JSON.parse)
  ]);
  const papers=new Map(bibliography.map(p=>[p.id,p]));
  const receiptMap=new Map(receipts.map(r=>[r.paper_id,r]));
  for(const s of screening)assert.equal(s.reviewed_pdf_sha256,receiptMap.get(s.paper_id)?.pdf_sha256,`Screened source changed: ${s.paper_id}`);
  const reviews=batches.flat();
  assert.equal(new Set(reviews.map(r=>r.paper_id)).size,reviews.length,'Duplicate reviewed source');
  assert.equal(new Set(screening.map(r=>r.paper_id)).size,bibliography.length,'Incomplete screening');
  const knownTypes=new Map(bibliography.map(p=>[p.primary_category_code,p.primary_category_zh]));
  const rows=reviews.map(r=>{
    const p=papers.get(r.paper_id), receipt=receiptMap.get(r.paper_id);
    assert.ok(p&&receipt,`Missing source ${r.paper_id}`);
    assert.equal(r.reviewed_pdf_sha256,receipt.pdf_sha256,`Source changed since review: ${r.paper_id}`);
    for(const key of ['identity_note','scope_read','environment','tasks','cases','lineage','reuse'])
      assert.ok(typeof r[key]==='string'&&r[key].length,`${r.paper_id}: ${key}`);
    for(const page of [...r.pages_read,...r.evidence.flatMap(e=>e.pages),...r.native_counts.flatMap(c=>c.pages)])
      assert.ok(Number.isInteger(page)&&page>0&&page<=receipt.pages,`${r.paper_id}: invalid PDF page ${page}`);
    assert.ok(r.evidence.length&&r.evaluation.length&&r.pages_read.length,`Incomplete review ${r.paper_id}`);
    const evaluation_methods=[...new Set(r.evaluation_types.map(label=>{
      assert.ok(methodMap[label],`Unmapped scoring type ${label}`);return methodMap[label];
    }))];
    const domain_ids=codebook.domains.filter(d=>d.tags.some(tag=>r.domains.includes(tag))).map(d=>d.id);
    const primary_type=codebook.primary_type_overrides[r.paper_id]||p.primary_category_code;
    return {...r,name:p.short_name,year:p.year,title:p.title,source_url:p.source_url,
      primary_type,category_name:knownTypes.get(primary_type),domain_ids,
      domain_names:codebook.domains.filter(d=>domain_ids.includes(d.id)).map(d=>d.name),
      domain_status:domain_ids.length?'source_level_coded':'cross_domain_or_unspecified',
      evaluation_methods,receipt,
      counts:r.native_counts.map((c,i)=>{
        assert.ok(Number.isFinite(c.value)&&c.value>=0&&c.unit&&c.pages.length,`Invalid count ${r.paper_id}`);
        return {...c,record_id:`review10:${r.paper_id}:${i+1}`,paper_id:r.paper_id,benchmark:p.short_name,
          native_term:c.unit,value_kind:'native_text',scope:'paper_reported_see_qualifier',
          source_version:receipt.reviewed_version||receipt.pdf_sha256,
          eligible_for_global_sum:false,
          evidence:[{source:receipt.reviewed_pdf_url||receipt.pdf_url,locator:`PDF pp. ${c.pages.join(', ')}`,basis:'authored_primary_section_review'}]};
      })
    };
  });
  const domains=codebook.domains.map(d=>({...d,
    paper_ids:rows.filter(r=>r.domain_ids.includes(d.id)).map(r=>r.paper_id),
    source_count:rows.filter(r=>r.domain_ids.includes(d.id)).length,mapped_task_count:null
  }));
  const categories=[...knownTypes].map(([id,name])=>({id,name,
    reviewed_sources:rows.filter(r=>r.primary_type===id).length,
    bibliography_records:bibliography.filter(p=>(codebook.primary_type_overrides[p.id]||p.primary_category_code)===id).length
  }));
  const stats={
    bibliography_screened:screening.length,detailed_sources:rows.length,
    originally_registered_reviewed:143,added_detailed_sources:rows.length-143,
    other_references:screening.filter(r=>r.decision!=='detailed_source_review').length,
    domains:domains.filter(d=>d.source_count>0).length,
    cross_domain_or_unspecified:rows.filter(r=>!r.domain_ids.length).length,
    count_records:rows.reduce((n,r)=>n+r.counts.length,0),
    sources_with_count:Object.fromEntries(['domain','environment','task','case','data','asset'].map(f=>[f,rows.filter(r=>r.counts.some(c=>c.field===f)).length])),
    evaluation_source_counts:Object.fromEntries(['answer','distance','state_process','judge'].map(id=>[id,rows.filter(r=>r.evaluation_methods.includes(id)).length]))
  };
  const references=screening.filter(s=>s.decision!=='detailed_source_review').map(s=>({...papers.get(s.paper_id),...s,receipt:receiptMap.get(s.paper_id)}));
  assert.equal(rows.length+references.length,screening.length);
  assert.equal(categories.reduce((n,c)=>n+c.reviewed_sources,0),rows.length);
  assert.equal(stats.domains,codebook.domains.length,'Unsubstantiated domain category');
  return {version:codebook.version,date:codebook.date,scope:codebook.scope,codebook,statistics:stats,rows,domains,categories,references,screening};
}

export function applyFulltextReview(model,review,registry,unionStats) {
  const previous=new Map(model.rows.map(r=>[r.paper_id,r]));
  const registryMap=new Map(registry.map(r=>[r.paper_id,r]));
  for(const r of review.rows){
    const registered=registryMap.get(r.paper_id);
    assert.ok(registered);
    Object.assign(registered,{
      benchmark_source_registered:true,role:'reviewed_benchmark_data_or_evaluation_source',
      role_basis:'authored_primary_sections_review_2026_10_02',
      evidence_depth:'原作關鍵章節已審閱；逐頁範圍與限制见Coverage。',
      fulltext_review_status:r.status,fulltext_review_pages:r.pages_read,
      fulltext_review_url:`coverage.html#source-${r.paper_id.toLowerCase()}`,
      native_tasks:r.tasks,scenes:r.environment,cases:r.cases,
      declared_domains:r.domain_names.join('、')||'跨域／用途未指定',
      category:r.primary_type,category_name:r.category_name
    });
  }
  unionStats.benchmark_or_eval_resource_records=review.rows.length;
  unionStats.other_reference_records=review.references.length;
  unionStats.related_paper_records_separate=review.references.length;
  unionStats.resource_role_review_pending=0;
  unionStats.registered_sources_previously_outside_comparison=review.rows.length-68;
  unionStats.original_registered_source_records=143;
  unionStats.independence='183 reviewed paper/source records include versions and derived resources; this is not a disjoint dataset count.';
  unionStats.classification_scope=review.codebook.type_scope;
  for(const ref of review.references){
    const row=registryMap.get(ref.paper_id);
    row.role=ref.decision==='survey'||ref.decision==='evaluation_method'?'survey_or_evaluation_method':'data_or_method_resource';
    row.role_basis=ref.reason;
    row.evidence_depth=ref.screening_basis;
  }
  unionStats.benchmark_source_records_with_task_inventory=registry.filter(r=>r.benchmark_source_registered&&r.source_records>0).length;
  unionStats.benchmark_source_records_awaiting_task_inventory=review.rows.length-unionStats.benchmark_source_records_with_task_inventory;
  unionStats.reviewed_source_count=review.rows.length;
  unionStats.version='survey-union-0.10';
  unionStats.categories=review.categories.map(c=>({
    id:c.id,name:c.name,all_paper_records:c.bibliography_records,
    benchmark_or_eval_resource_records:c.reviewed_sources,
    detailed_comparison_records:registry.filter(r=>r.category===c.id&&r.detailed_comparison_id).length,
    task_source_paper_records:registry.filter(r=>r.category===c.id&&r.source_records>0).length
  }));
  model.legacy_count_ledger=model.rows.flatMap(r=>r.counts);
  model.rows=review.rows.map(r=>{
    const p=previous.get(r.paper_id), reg=registryMap.get(r.paper_id);
    return {...p,...r,
      detailed_comparison_id:reg.detailed_comparison_id,
      source_count:reg.source_records,source_ids:reg.source_ids||[],
      has_task_list:reg.source_records>0,task_list_complete:reg.task_list_complete_for_whole_work===true,
      domains:r.domain_names.length?r.domain_names.join('、'):'跨域／用途未指定',
      environments:r.environment,native_evaluation:r.evaluation.join(' '),
      counts:r.counts,
      missing_count_fields:['environment','task','case'].filter(f=>!r.counts.some(c=>c.field===f)),
      review:{type:'原作關鍵章節審閱',date:review.date,evidence_depth:r.scope_read,
        task_list:reg.source_records?'另有來源ID清單（範圍見原作索引）':'逐ID清單待補',
        scoring:'已讀原作判分協定；不等於全部評分程式已整合',
        local_execution:'本轮文獻整理未新增模型執行'}
    };
  });
  const priorities=['P100','P082','P071','P125','P126','P132','P063','P062','P064','P068','P074','P143','P199','P002','P119','P150','P120','P181','P213'];
  const rank=id=>priorities.includes(id)?priorities.indexOf(id):1000;
  model.rows.sort((a,b)=>rank(a.paper_id)-rank(b.paper_id)||a.paper_id.localeCompare(b.paper_id));
  model.fulltext=review;
  model.version='0.10';model.date=review.date;model.scope=review.scope;
  model.domains=review.domains;
  model.statistics={...model.statistics,
    registered_sources:review.rows.length,reviewed_primary_sources_this_pass:review.rows.length,
    count_records:review.statistics.count_records,
    additional_count_records:review.rows.filter(r=>!previous.has(r.paper_id)).flatMap(r=>r.counts).length,
    sources_with_any_scale_count:review.rows.filter(r=>r.counts.some(c=>['environment','task','case'].includes(c.field))).length,
    sources_with_environment_count:review.statistics.sources_with_count.environment,
    sources_with_task_count:review.statistics.sources_with_count.task,
    sources_with_case_count:review.statistics.sources_with_count.case,
    sources_with_data_count:review.statistics.sources_with_count.data,
    sources_with_all_three_scale_fields:review.rows.filter(r=>['environment','task','case'].every(f=>r.counts.some(c=>c.field===f))).length,
    sources_with_task_list:unionStats.benchmark_source_records_with_task_inventory,
    sources_awaiting_task_list:unionStats.benchmark_source_records_awaiting_task_inventory,
    sources_with_scoring_classification:review.rows.length,domain_labels:review.statistics.domains,
    domain_labels_with_explicit_source_overview:review.statistics.domains,
    domain_mapped_sources:review.rows.filter(r=>r.domain_ids.length).length,
    domain_unmapped_sources:review.statistics.cross_domain_or_unspecified,
    source_review:review.statistics
  };
  model.notes.source_domain_scope=review.codebook.domain_scope;
  model.notes.scoring_interpretation='按本輪原作關鍵章節的metric/判分協定分類；不等於所有評分程式已整合或逐題複核。';
  model.plan.milestones=review.codebook.milestones;
  return model;
}

export function wholeReviewRows(model) {
  const r=model.fulltext,s=r.statistics,n=model.numbers.inventory;
  return [
    {id:'domain',label:'領域',current:s.domains,unit:'來源用途類別',detail:`183篇按用途編碼；${s.cross_domain_or_unspecified}篇標記跨域／用途未指定。這是來源分布，尚非逐任務的可執行覆蓋。`,plan:'以全部已核用途為起點，逐任務對應；新來源可擴充分類。'},
    {id:'environment',label:'環境',current:n.source_named_environment_definitions,unit:'已取得命名場景條目',detail:`${s.sources_with_count.environment}個已讀來源有某種環境量；284條僅是已取ID子集，未完成跨庫幾何去重。`,plan:'整理各來源scene/layout/location及重用關係後，計全庫聯集；不再先配1,000。'},
    {id:'task',label:'任務',current:n.robot_task_source_definitions,unit:'已取得robot任務條目',detail:'另有7資訊題型、263人類活動。原作task/skill/instruction的差異已逐篇記錄，尚未全部正規化去重。',plan:'先取原作任務聯集，再加有差異證据的新目標／規則；不再先配5,000。'},
    {id:'case',label:'題數',current:n.case_definition_records,unit:'已取得題目定義元資料',detail:'111,652 PARTNR train＋1,000 val＋1,636 OpenEQA；含訓練資料，素材未全齊，不是114,288道已整合測試題。',plan:'依task、split、合法輸入及判分建立case manifest後定量；原作量、已取得量、可評量分列。'},
    {id:'evaluation',label:'評估方式',current:4,unit:'共同判分大類',detail:`183份來源均有判分方式與原文依據；具體metrics及評分器仍各自保留，尚未全數掛接。`,plan:'答案、誤差、狀態／過程、人工／模型評審各報；不以4類代表4個完成的通用評分器。'}
  ];
}

export function sourceReviewCSV(review) {
  const keys=['paper_id','benchmark','year','research_type','domains','environment','tasks','cases','evaluation','review_scope','pdf_pages','lineage','unresolved','source_url','reviewed_pdf_url','pdf_sha256'];
  const cell=v=>`"${String(v??'').replaceAll('"','""')}"`;
  return '\uFEFF'+[keys.join(','),...review.rows.map(r=>{
    const values={...r,benchmark:r.name,research_type:r.category_name,domains:r.domain_names.join('；')||'跨域／用途未指定',
      evaluation:r.evaluation.join('；'),review_scope:r.scope_read,pdf_pages:r.pages_read.join(';'),
      unresolved:r.unresolved.join('；'),reviewed_pdf_url:r.receipt.reviewed_pdf_url,pdf_sha256:r.receipt.pdf_sha256};
    return keys.map(k=>cell(values[k])).join(',');
  })].join('\n')+'\n';
}

export function sourceReviewMarkdown(model) {
  const r=model.fulltext,c=r.codebook,s=r.statistics;
  const clean=x=>String(x??'').replaceAll('|','／').replace(/\s+/g,' ').trim();
  return [
    '# Robot-use Benchmark：逐篇來源審閱與整合設計','',`版本v0.10；${r.date}。`,'',c.scope,'',c.reading_claim,'',
    '## 本輪數字與目標','',
    '| 項目 | 目前確認 | 下一階段規劃口徑 |','|---|---|---|',
    ...wholeReviewRows(model).map(f=>`| ${f.label} | ${f.current.toLocaleString('en-US')} ${f.unit}。${clean(f.detail)} | ${clean(f.plan)} |`),'',
    'v0.9的12領域／1,000場景／5,000任務／100萬題配額已撤回。4種判分方式仍作分類，不作完成量。實際清單仍保留，未知的全庫聯集不填0。','',
    '## 阅读後的主要發現','',...c.findings.flatMap(f=>[`### ${f.title}`,'',f.text,`依據：${f.paper_ids.join('、')}，詳見逐篇紀錄。`,'']),
    '## Survey分布','',c.type_scope,'',
    '| 研究類型 | 已詳細審閱來源 | 全部書目 |','|---|---:|---:|',
    ...r.categories.map(x=>`| ${x.name} | ${x.reviewed_sources} | ${x.bibliography_records} |`),'',
    c.domain_scope,'','| 生活／工作用途 | 來源數（可重複標記） | 來源支持 |','|---|---:|---|',
    ...r.domains.map(x=>`| ${x.name} | ${x.source_count} | ${x.paper_ids.join('、')} |`),'',
    `跨域／用途未指定：${s.cross_domain_or_unspecified}來源。${c.unassigned_tags_policy}`,'',
    '## 如何把大而廣變成可發表的benchmark','',
    '先完成來源聯集，再擴充任務和規則。集合的上限不能由論文數推定，異質數字不相加。要證明比前作更廣、更大，須在相同任務粒度下報去重後任務數，並列各前作未覆蓋而本庫真正可評的用途、任務與規則。RoboVerse、OXE、OpenEgo等整合型前作必須直接比較。','',
    '環境、示範和評分器可以重用；新增目標、過程約束和介入條件要留下父任務與差異。每個case需要明確輸入、答案或goal predicate、split、版本及預算。不同機體或感測條件下使用分組榜單；問答、預測、規劃和物理控制的證據分開。','',
    '本輪是來源審閱與設計依據的完成，尚非通用benchmark全庫的實驗完成。接下來的論文證據應来自共同任務清單、有效case、可重現判分器與baseline結果。','',
    '## 難度量化','',...c.difficulty_plan.map((x,i)=>`${i+1}. ${x}`),'',
    '## Milestones','',...c.milestones.flatMap(x=>[`### ${x.name}`,'',x.deliverable,`驗收：${x.acceptance}`,`狀態：${x.status}`,'']),
    '## 逐篇來源紀錄','',
    ...model.rows.flatMap(x=>[
      `### ${x.paper_id}　${x.name}（${x.year}）`,'',
      `原作：${x.source_url}`,`本次PDF：${x.receipt.reviewed_pdf_url||x.receipt.pdf_url}`,
      `PDF SHA256：${x.receipt.pdf_sha256}`,
      `閱讀頁：${x.pages_read.join('、')}。${x.scope_read}`,'',
      `- 研究類型：${x.category_name}；${x.role}`,
      `- 領域：${x.domains}`,
      `- 環境：${x.environment}`,
      `- 任務：${x.tasks}`,
      `- 題數／資料：${x.cases}`,
      `- 評估方式：${x.evaluation.join('；')}`,
      `- Split／資訊條件：${x.split}`,
      `- 來源關係：${x.lineage}`,
      `- 可復用：${x.reuse}`,
      `- 待核／限制：${x.unresolved.join('；')}`,''
    ]),
    '## 67篇方法／背景參考的篩查','',
    ...r.references.map(x=>`- ${x.paper_id} ${x.short_name}：${x.reason}（PDF ${x.pages_read.join(', ')}；${x.screening_basis}） ${x.source_url}`),'',
    '## 擴查清單（未計入183已核來源）','',
    ...c.expansion_queue.map(x=>`- ${x.name}：${x.reason}`),'',
    '本次公開自己的閱讀摘要、頁碼、數字及來源指紋；不重新散布原作PDF。'
  ].join('\n');
}
