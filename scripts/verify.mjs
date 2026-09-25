import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'docs');
const config=JSON.parse(await fs.readFile(path.join(root,'site.config.json'),'utf8'));
const manifest=JSON.parse(await fs.readFile(path.join(root,'verification/build-manifest.json'),'utf8'));
const pages=new Map();
const issues=[];
const allFiles=[];
async function walk(folder){
  for(const item of await fs.readdir(folder,{withFileTypes:true})){
    const file=path.join(folder,item.name);
    if(item.isDirectory())await walk(file);else allFiles.push(file);
  }
}
await walk(out);
for(const file of allFiles.filter(file=>file.endsWith('.html'))){
  const html=await fs.readFile(file,'utf8');
  const $=cheerio.load(html);
  const ids=$('[id]').toArray().map(n=>$(n).attr('id'));
  const duplicate=ids.filter((id,index)=>ids.indexOf(id)!==index);
  if(duplicate.length)issues.push({file:path.relative(out,file),duplicate});
  if(!$('h1').length)issues.push({file:path.relative(out,file),error:'Missing h1'});
  if(/\/Users\/wchj|github_pat_|ghp_[A-Za-z0-9]{20,}/.test(html))issues.push({file:path.relative(out,file),error:'Unexpected private filesystem path or credential pattern'});
  if(/\[\[[A-Z_]+\]\]/.test(html))issues.push({file:path.relative(out,file),error:'Unexpanded template'});
  pages.set(file,{html,$,ids:new Set(ids)});
}
let checked=0;
for(const[file,{$,ids}]of pages){
  for(const node of $('a[href],script[src],link[href],img[src],source[src],video[poster]').toArray()){
    const raw=$(node).attr('href')||$(node).attr('src')||$(node).attr('poster');
    if(!raw||/^(data:|mailto:|javascript:)/.test(raw))continue;
    if(raw.startsWith('http')&&!raw.startsWith(config.siteUrl+'/'))continue;
    let target;
    try{target=new URL(raw,`https://verification.invalid/${path.relative(out,file)}`);}catch{issues.push({file,raw,error:'Invalid URL'});continue;}
    let rel=target.pathname.replace(/^\/+/,'');
    if(raw.startsWith(config.siteUrl))rel=target.pathname.slice(new URL(config.siteUrl).pathname.length).replace(/^\/+/,'');
    rel=decodeURIComponent(rel);
    if(!rel||rel.endsWith('/'))rel+='index.html';
    const full=path.resolve(out,rel);
    if(!full.startsWith(out+path.sep)){issues.push({file,raw,error:'Path outside publish directory'});continue;}
    if(!allFiles.includes(full)){issues.push({file:path.relative(out,file),raw,error:'Missing local destination',target:rel});continue;}
    if(target.hash&&pages.has(full)){
      let hash=decodeURIComponent(target.hash.slice(1));
      if(!pages.get(full).ids.has(hash))issues.push({file:path.relative(out,file),raw,error:'Missing anchor',target:rel,hash});
    }
    checked++;
  }
}
const expected={
  'explore/tasks.html':180,'explore/families.html':48,'explore/probes.html':24,
  'explore/metrics.html':40,'library.html':250
};
for(const locale of ['zh-hant','zh-hans']){
  for(const[route,count]of Object.entries(expected)){
    const{$}=pages.get(path.join(out,locale,route));
    assert.equal($('[data-entry]').length,count,`${locale}/${route} count`);
  }
  for(let i=1;i<=14;i++)assert.ok(pages.has(path.join(out,locale,`chapters/${String(i).padStart(2,'0')}.html`)));
  const{html,$}=pages.get(path.join(out,locale,'index.html'));
  assert.equal($('html').attr('lang'),locale==='zh-hant'?'zh-Hant':'zh-Hans');
  assert.ok(html.includes(locale==='zh-hant'?'機器人':'机器人'));
  assert.equal($('.language-switch a').length,2);
}
const usedSections=new Set();
for(const[,{ids}]of pages)for(const id of ids)usedSections.add(id);
// Collection source-section wrappers become filters; all individual records and
// manuscript/reference sections must remain represented.
const requiredSectionIds=manifest.sourceSectionIds.filter(id=>!(/^(familypage-|catalogue-|probes-|metrics-|bib-)/.test(id)));
const missingSections=requiredSectionIds.filter(id=>!usedSections.has(id));
assert.deepEqual(missingSections,[]);
assert.ok((await fs.stat(path.join(out,manifest.pdf))).size>1000000,'PDF missing');
assert.equal(crypto.createHash('sha256').update(await fs.readFile(path.join(out,manifest.pdf))).digest('hex'),manifest.pdfSha256);
assert.equal(crypto.createHash('sha256').update(await fs.readFile(path.join(out,manifest.historicalPdf))).digest('hex'),'417f943867035bb296d23e29629707198db11ae7901d353714c9093546432f54');
const nativeScript=await fs.readFile(path.join(out,'assets/native-source-data.js'),'utf8');
const nativeData=JSON.parse(nativeScript.replace(/^window\.NATIVE_SOURCE_DATA=/,'').replace(/;$/,''));
assert.equal(nativeData.records.length,manifest.counts.nativeSourceRecords);
assert.equal(new Set(nativeData.records.map(record=>record.id)).size,nativeData.records.length);
assert.equal(nativeData.records.filter(record=>record.s==='robocasa').length,365);
assert.equal(nativeData.records.filter(record=>record.s==='robocasa'&&record.ds===true).length,317);
assert.equal(nativeData.records.filter(record=>record.v).length,2587);
const design=JSON.parse(await fs.readFile(path.join(out,'downloads/overall-design/overall_design_plan.json'),'utf8'));
const capacity=design.capacity_example;
assert.equal(design.version,config.designVersion);
assert.equal(design.breadth_gate.core_context_ids.length,12);
assert.equal(design.current_evidence.canonical_g2_count,null);
assert.equal(design.current_evidence.validated_cases,0);
assert.equal(design.current_evidence.scale_gate_passed,false);
assert.equal(design.current_evidence.breadth_gate_passed,false);
assert.equal(capacity.execution_bindings*capacity.g3_per_execution_binding,capacity.planned_g3_assignments);
assert.equal(capacity.planned_g3_assignments*capacity.information_conditions*capacity.intervention_conditions,capacity.planned_g4_assignments);
assert.equal(capacity.planned_g4_assignments*capacity.policy_repeats_per_fixed_case*capacity.example_fully_compatible_models,capacity.planned_main_rollouts);
assert.ok(capacity.global_g2_tasks<capacity.task_context_bindings&&capacity.task_context_bindings<capacity.execution_bindings);
const comparisonData=JSON.parse(await fs.readFile(path.join(out,'downloads/benchmark-comparison/benchmark_matrix.json'),'utf8'));
assert.equal(comparisonData.rows.length,70);
assert.equal(comparisonData.rows.filter(row=>row.group!=='ours').length,68);
assert.ok(comparisonData.rows.every(row=>row.canonical_g2===null));
assert.ok(comparisonData.rows.find(row=>row.id==='partnr').cases.includes('100,000 train'));
assert.ok(comparisonData.rows.find(row=>row.id==='watchact').tasks.includes('schemas'));
assert.equal(comparisonData.rows.find(row=>row.id==='ours-current').domain_map.D01,'zero');
assert.equal(comparisonData.rows.find(row=>row.id==='ours-target').domain_map.D01,'planned');
assert.equal(comparisonData.rows.find(row=>row.id==='ours-current').features.execution,'development');
assert.ok(comparisonData.rows.find(row=>row.id==='ours-current').cases.includes('1,250'));
assert.ok(comparisonData.rows.find(row=>row.id==='ours-target').scenes.includes('6,000'));
assert.ok(comparisonData.rows.find(row=>row.id==='roborecover').cases.includes('2,000'));
const readiness=JSON.parse(await fs.readFile(path.join(out,'downloads/readiness/readiness_audit.json'),'utf8'));
// The original audit remains a 33-work historical snapshot.
const priorComparisons=comparisonData.rows.filter(row=>row.group!=='ours'&&!row.review_scope_all_axes);
for(const [field,statKey] of [['domain_map','domain_matrix'],['features','feature_matrix']]){
  const values=priorComparisons.flatMap(row=>Object.values(row[field]));
  assert.equal(readiness.statistics[statKey].total_cells,values.length);
  assert.equal(readiness.statistics[statKey].unknown_cells,values.filter(value=>value==='unknown').length);
}
assert.equal(readiness.audit_date,config.auditDate);
assert.equal(readiness.statistics.new_literature_search_performed,false);
assert.equal(readiness.statistics.canonical_g2_count,null);
assert.equal(readiness.statistics.simulator_trials,0);
assert.equal(readiness.issues.filter(issue=>issue.status==='open').length,14);
assert.equal(readiness.issues.find(issue=>issue.id==='GAP-14').status,'open');
assert.equal(readiness.issues.find(issue=>issue.id==='GAP-15').status,'documentation_fixed');
const progress=JSON.parse(await fs.readFile(path.join(out,'downloads/implementation/implementation_progress.json'),'utf8'));
const execution=JSON.parse(await fs.readFile(path.join(out,'downloads/execution/execution_report.json'),'utf8'));
const ledger=JSON.parse(await fs.readFile(path.join(out,'downloads/execution/heldout_trial_ledger.json'),'utf8'));
const research=JSON.parse(await fs.readFile(path.join(out,'downloads/literature-refresh/literature_refresh_statistics.json'),'utf8'));
assert.equal(progress.issues.find(issue=>issue.id==='GAP-14').status,'documentation_complete');
assert.equal(progress.objective_status,'in_progress_not_complete');
assert.equal(progress.comparison_evidence.cell_records,68*21);
assert.equal(progress.typed_count_records,279);
assert.equal(research.combined_paper_records,250);
assert.equal(research.new_abstract_reviewed_records,82);
assert.equal(research.combined_complete_abstract_review_flags,137);
assert.equal(execution.held_out_method_trials,1250);
assert.equal(execution.recorded_trial_history_total,4286);
assert.equal(execution.new_universal_task_count,0);
assert.equal(execution.global_canonical_g2_count,null);
assert.equal(ledger.length,1250);
assert.equal(new Set(ledger.map(r=>r.case_id)).size,250);
assert.equal(new Set(ledger.map(r=>r.trial_id)).size,1250);
for(const method of execution.summary){
  const trials=ledger.filter(r=>r.method_id===method.method_id);
  assert.equal(trials.length,250);
  assert.equal(trials.reduce((n,r)=>n+Number(r.native_success_ever),0)/250,method.native_success_ever);
}
const modelDownload=JSON.parse(await fs.readFile(path.join(out,'downloads/execution/model_download.json'),'utf8'));
assert.equal(crypto.createHash('sha256').update(await fs.readFile(path.join(out,modelDownload.archive))).digest('hex'),modelDownload.sha256);
for(const locale of ['zh-hant','zh-hans']){
  const auditPage=pages.get(path.join(out,locale,'readiness.html'));
  assert.ok(auditPage);
  assert.equal(auditPage.$('[data-audit-gap]').length,readiness.issues.length);
  assert.equal(auditPage.$('#audit-gap-table tbody tr').length,readiness.issues.length);
  assert.equal(auditPage.$('[data-audit-stat="domain-unknown"]').text(),'90.2%');
  assert.equal(auditPage.$('[data-audit-stat="feature-unknown"]').text(),'69.6%');
  const comparisonPage=pages.get(path.join(out,locale,'compare.html'));
  assert.ok(comparisonPage);
  assert.equal(comparisonPage.$('[data-comparison-panel]').length,4);
  for(const view of ['scale','domains','materials','features'])assert.equal(comparisonPage.$(`#comparison-${view} tbody tr`).length,70);
  assert.equal(comparisonPage.$('#comparison-domains thead th').length,13);
  assert.equal(comparisonPage.$('#comparison-features thead th').length,10);
  assert.equal(comparisonPage.$('[data-comparison-evidence]').length,70);
  assert.ok(comparisonPage.$('#comparison-review-status').text().includes('736／816'));
  const executionPage=pages.get(path.join(out,locale,'execution.html'));
  assert.equal(executionPage.$('#execution-method-summary tbody tr').length,5);
  assert.equal(executionPage.$('#execution-native-task-table tbody tr').length,50);
  assert.equal(executionPage.$('video source').length,1);
  const researchPage=pages.get(path.join(out,locale,'research.html'));
  assert.equal(researchPage.$('#research-category-table tbody tr').length,12);
  assert.equal(researchPage.$('#research-additions-table tbody tr').length,82);
  const overall=pages.get(path.join(out,locale,'design.html'));
  assert.ok(overall);
  assert.equal(overall.$('#overall-design-spec h2').length,12);
  assert.ok(overall.$('#design-section-3').length);
  assert.ok(overall.$('#design-section-9').length);
  assert.equal(overall.$('#current-design-update h2').length,10);
  assert.ok(overall.$('#iteration-section-4').text().includes('場景')||overall.$('#iteration-section-4').text().includes('场景'));
  assert.equal(overall.$('[data-capacity-output="total"]').text(),'2,880,000');
  assert.equal(overall.$('.primary-nav a').first().attr('href'),'design.html');
  const search=await fs.readFile(path.join(out,`assets/search-${locale}.js`),'utf8');
  assert.ok(search.includes('"path":"design.html"'));
  assert.ok(pages.has(path.join(out,locale,'scale-plan.html')));
  assert.ok(pages.has(path.join(out,locale,'native-tasks.html')));
  const budget=pages.get(path.join(out,locale,'chapters/11.html')).$;
  assert.ok(budget('#c11').text().includes('2,000–3,000'));
  assert.equal(budget('details.legacy-content').length,1);
  const comparison=pages.get(path.join(out,locale,'chapters/05.html')).$.text();
  assert.ok(comparison.includes('v0.4')&&comparison.includes('2,000–3,000'));
}
await fs.mkdir(path.join(root,'verification'),{recursive:true});
const report={status:issues.length?'failed':'passed',htmlPages:pages.size,localizedPages:manifest.pages.length,linksAndAssetsChecked:checked,recordCounts:expected,nativeSourceRecords:nativeData.records.length,sourceSectionsPreserved:requiredSectionIds.length,scopeVersion:config.iterationVersion,designScope:'Research and design website, plus linked native execution evidence. Website validation is separate from native-run validation and formal universal-release gates.',issues};
await fs.writeFile(path.join(root,'verification/static-checks.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,issues:issues.slice(0,20)},null,2));
assert.equal(issues.length,0,`${issues.length} static site issues`);
