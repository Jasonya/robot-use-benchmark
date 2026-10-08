import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import {createReadStream} from 'node:fs';
import {createGunzip} from 'node:zlib';
import {createInterface} from 'node:readline';
import {validateNumbers,quantityRows} from './quantified-model.mjs';
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
const pipelineRoot=path.join(root,'benchmark/collection');
const pipelineDownloads=path.join(out,'downloads/collection-pipeline');
const pipelineReport=JSON.parse(await fs.readFile(path.join(pipelineDownloads,'import-report.json'),'utf8'));
const pipelineInputs=JSON.parse(await fs.readFile(path.join(pipelineDownloads,'input_manifest.json'),'utf8'));
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
assert.equal(pipelineReport.adapter_sha256,sha(await fs.readFile(path.join(pipelineRoot,'run_snapshot.py'))));
assert.equal(pipelineReport.schema_sha256,sha(await fs.readFile(path.join(pipelineRoot,'catalog_record.schema.json'))));
for(const input of pipelineInputs)assert.equal(sha(await fs.readFile(path.join(root,input.path))),input.sha256,`Stale pipeline input: ${input.path}`);
for(const[name,record]of Object.entries(pipelineReport.outputs))
  assert.equal(sha(await fs.readFile(path.join(pipelineDownloads,name))),record.sha256,`Changed pipeline export: ${name}`);
for(const name of ['PIPELINE_SPEC.md','catalog_record.schema.json','run_snapshot.py','test_catalog.py','references.json','requirements.txt'])
  assert.deepEqual(await fs.readFile(path.join(pipelineDownloads,name)),await fs.readFile(path.join(pipelineRoot,name)),`Stale pipeline download: ${name}`);
assert.deepEqual(pipelineReport.counts,{domain:21,source:183,environment:284,task:2366,evaluator:3,case:114288});
assert.deepEqual(pipelineReport.task_kinds,{robot_task_definition:2096,information_task_type:7,human_activity_definition:263});
assert.equal(pipelineReport.evaluation_release_eligible_cases_in_this_import,0);
assert.equal(pipelineReport.canonical_task_union_count,null);
assert.equal(pipelineReport.validation.schema_valid_records,117145);
for(const locale of ['zh-hant','zh-hans']){
  const pipelinePage=pages.get(path.join(out,locale,'collection-pipeline.html'));
  assert.ok(pipelinePage);
  assert.equal(pipelinePage.$('#pipeline-counts tbody tr').length,8);
  assert.deepEqual(pipelinePage.$('[data-import-count]').toArray().map(n=>Number(pipelinePage.$(n).attr('data-import-count'))),[183,21,284,2096,7,263,114288,3]);
  assert.equal(pipelinePage.$('.pipeline-flow a').length,8);
  assert.ok(pipelinePage.$('.primary-nav a[href="collection-pipeline.html"]').length);
  assert.ok(pipelinePage.$('#pipeline-06').length);
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
assert.equal(design.version,config.legacyDesignVersion);
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
assert.ok(comparisonData.rows.find(row=>row.id==='ours-target').tasks.includes('規則'));
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
const joint=JSON.parse(await fs.readFile(path.join(out,'downloads/joint-pilot/pilot_report.json'),'utf8'));
const union=JSON.parse(await fs.readFile(path.join(out,'downloads/survey-union/union_statistics.json'),'utf8'));
const registry=JSON.parse(await fs.readFile(path.join(out,'downloads/survey-union/survey_registry.json'),'utf8'));
const bridge=JSON.parse(await fs.readFile(path.join(out,'downloads/survey-union/task_source_bridge.json'),'utf8'));
const extensions=JSON.parse(await fs.readFile(path.join(out,'downloads/survey-union/extension_examples.json'),'utf8'));
const coverage=JSON.parse(await fs.readFile(path.join(out,'downloads/coverage/coverage_snapshot.json'),'utf8'));
const inventory=JSON.parse(await fs.readFile(path.join(out,'downloads/quantified/inventory_summary.json'),'utf8'));
const numberContract=JSON.parse(await fs.readFile(path.join(out,'downloads/quantified/numbers_contract.json'),'utf8'));
const numeric=validateNumbers(numberContract,inventory);
assert.deepEqual(quantityRows(numeric).map(r=>r.current),[12,284,2103,114288,4]);
const envRegistry=JSON.parse(await fs.readFile(path.join(out,'downloads/quantified/environment_registry.json'),'utf8'));
const taskRegistry=JSON.parse(await fs.readFile(path.join(out,'downloads/quantified/task_registry.json'),'utf8'));
const infoTasks=JSON.parse(await fs.readFile(path.join(out,'downloads/quantified/information_task_types.json'),'utf8'));
assert.equal(envRegistry.length,284);
const environmentIds=new Set(envRegistry.map(r=>r.environment_id));
assert.equal(environmentIds.size,284);
assert.ok(envRegistry.every(r=>r.source_url&&r.source_version&&r.definition_sha256.length===64));
assert.ok(![...environmentIds].some(id=>/D_eval|style|openeqa/.test(id)));
assert.equal(taskRegistry.length,2096);
assert.equal(new Set(taskRegistry.map(r=>r.record_id)).size,2096);
assert.ok(taskRegistry.every(r=>r.domain_assignment.status&&r.paper_ids.length&&r.source_url));
assert.equal(infoTasks.length,7);
const infoTaskIds=new Set(infoTasks.map(r=>r.record_id));
const caseIds=new Set();const caseBreakdown={};const caseScenes=new Set();
for(const [filename,record]of Object.entries(inventory.files)){
  const bytes=await fs.readFile(path.join(out,'downloads/quantified',filename));
  assert.equal(bytes.length,record.bytes);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.sha256);
}
for await(const line of createInterface({input:createReadStream(path.join(out,'downloads/quantified/case_registry.jsonl.gz')).pipe(createGunzip()),crlfDelay:Infinity})){
  const r=JSON.parse(line);
  assert.ok(r.case_id&&!caseIds.has(r.case_id));
  caseIds.add(r.case_id);
  const key=r.source_id+'::'+r.native_split;
  caseBreakdown[key]=(caseBreakdown[key]||0)+1;
  assert.ok(r.source_version&&r.native_locator&&r.task_ref&&r.evaluator_ref);
  assert.ok(/^[a-f0-9]{64}$/.test(r.input_sha256)&&/^[a-f0-9]{64}$/.test(r.label_sha256));
  assert.equal(r.definition_check,'passed');
  assert.equal(r.complete_local_inputs,false);
  assert.equal(r.runtime_verified,false);
  assert.ok(!('question'in r)&&!('answer'in r)&&!('instruction'in r),'Public index contains references/hashes, not full source text');
  if(r.case_kind==='robot_episode'){assert.ok(environmentIds.has(r.environment_id));caseScenes.add(r.environment_id);}
  else{assert.equal(r.case_kind,'qa');assert.ok(infoTaskIds.has(r.task_ref));assert.equal(r.environment_id,'');}
}
assert.equal(caseIds.size,114288);
assert.deepEqual(caseBreakdown,{'partnr::train':111652,'partnr::val':1000,'openeqa::native_benchmark_unsplit':1636});
assert.equal(caseScenes.size,49);
assert.equal(inventory.new_case_complete_local_input_count,0);
assert.equal(inventory.new_case_runtime_trials,0);
assert.equal(inventory.predicate_names_resolve_to_source,true);
const priorBridge=JSON.parse(await fs.readFile(path.join(out,'downloads/archive/survey-union-2026-09-29/task_source_bridge.json'),'utf8'));
assert.equal(priorBridge.length,5308);
assert.ok(priorBridge.every(r=>bridge.some(n=>n.record_id===r.record_id)));
const originalCounts=JSON.parse(await fs.readFile(path.join(out,'downloads/benchmark-comparison/typed_count_records.json'),'utf8')).rows;
assert.deepEqual(new Set(coverage.rows.map(r=>r.paper_id)),new Set(registry.filter(r=>r.benchmark_source_registered).map(r=>r.paper_id)));
assert.equal(coverage.rows.length,183);
assert.equal(coverage.plan.fields.length,5);
assert.equal(coverage.plan.evaluation_methods.length,4);
assert.equal(coverage.statistics.native_robot_task_records,2096);
assert.equal(coverage.statistics.human_activity_records,263);
assert.equal(coverage.statistics.common_task_union,null);
assert.equal(coverage.statistics.canonical_environment_union,null);
assert.equal(coverage.statistics.integrated_cases_by_type,null);
const coverageCounts=coverage.rows.flatMap(r=>r.counts);
assert.equal(new Set(coverageCounts.map(c=>c.record_id)).size,coverageCounts.length);
assert.ok(coverageCounts.every(c=>Number.isFinite(c.value)&&c.evidence.length>0&&c.eligible_for_global_sum===false));
for(const original of originalCounts.filter(r=>r.value!==null&&r.unit!=='canonical_g2')){
  const current=coverage.legacy_count_ledger.find(c=>c.record_id===original.record_id);
  assert.ok(current,`Lost source number ${original.record_id}`);
  for(const key of ['value','value_kind','unit','scope','source_version'])assert.equal(current[key],original[key]);
}
const coverageRow=id=>coverage.rows.find(r=>r.paper_id===id||r.detailed_comparison_id===id);
assert.ok(coverageRow('P003').counts.some(c=>c.field==='data'&&c.value===11827));
assert.ok(coverageRow('P003').counts.some(c=>c.field==='case'&&c.value===2797),'COIN test-video subset remains distinct from all 11,827 videos');
assert.ok(coverageRow('P075').counts.some(c=>c.field==='data'&&c.value===600000),'VIMA expert trajectories remain training data');
assert.equal(coverageRow('P075').counts.filter(c=>c.field==='case').length,0);
assert.ok(coverageRow('P042').counts.some(c=>c.value===4916&&c.unit.includes('scan')),'Retain RoboSpatial scan scope explicitly');
assert.ok(coverageRow('P017').counts.some(c=>c.field==='environment'&&c.value===610));
assert.ok(coverageRow('P108').counts.some(c=>c.field==='data'&&c.value===4284),'RoboArena rollouts are not new semantic tasks');
assert.ok(!coverageRow('P108').counts.some(c=>c.field==='environment'),'Institutions are not environments');
assert.ok(coverageRow('alfred').counts.some(c=>c.field==='data'&&c.value===8055));
assert.ok(coverageRow('partnr').counts.some(c=>c.field==='case'&&c.value===100000),'Paper claims remain distinct from the pinned 111652-train inventory');
assert.deepEqual(coverageRow('P038').counts.filter(c=>c.field==='case').map(c=>c.value),[1636,557],'A-EQA is a reused subset, not an addition to the 1636 questions');
const review=JSON.parse(await fs.readFile(path.join(out,'downloads/source-review/review_snapshot.json'),'utf8'));
assert.equal(review.statistics.bibliography_screened,250);
assert.equal(review.statistics.detailed_sources,183);
assert.equal(review.references.length,67);
assert.equal(review.statistics.added_detailed_sources,40);
assert.equal(review.statistics.count_records,672);
assert.equal(review.statistics.classified_sources,183);
assert.equal(review.statistics.unassigned_sources,0);
assert.equal(review.statistics.reclassified_sources,22);
assert.equal(review.statistics.multi_domain_sources,120);
assert.equal(review.statistics.domain_label_assignments,431);
assert.equal(review.domains.length,21);
assert.equal(review.categories.reduce((n,c)=>n+c.reviewed_sources,0),183);
assert.equal(review.categories.reduce((n,c)=>n+c.bibliography_records,0),250);
assert.deepEqual(review.statistics.evaluation_source_counts,{answer:64,distance:103,state_process:95,judge:21});
assert.ok(review.rows.every(r=>/^[a-f0-9]{64}$/.test(r.receipt.pdf_sha256)&&r.scope_read&&r.evidence.length));
for(const r of review.rows)for(const page of [...r.pages_read,...r.counts.flatMap(c=>c.pages)])assert.ok(page>0&&page<=r.receipt.pages);
const oldSources=JSON.parse(await fs.readFile(path.join(root,'content/survey_union/survey_registry.json'),'utf8')).filter(r=>r.benchmark_source_registered);
assert.equal(oldSources.length,143);
assert.ok(oldSources.every(r=>review.rows.some(n=>n.paper_id===r.paper_id)),'Every previously registered source must be reviewed');
assert.ok(coverageRow('P125').counts.some(c=>c.value===527&&c.field==='task'));
assert.ok(coverageRow('P002').counts.some(c=>c.value===23611&&c.field==='task'));
assert.ok(quantityRows(numeric).every(r=>r.target===null),'Withdrawn targets stay null, never zero');
assert.ok(numberContract.version_crosswalk.every(r=>!r.current.includes('本版主目標為')&&!r.current.includes('目標取代')),'Version crosswalk must not reactivate retired quotas');
const domainCoding=JSON.parse(await fs.readFile(path.join(out,'downloads/source-review/domain_assignments.json'),'utf8'));
assert.equal(domainCoding.assignments.length,183);
assert.equal(new Set(domainCoding.assignments.map(a=>a.paper_id)).size,183);
const previousDomains=JSON.parse(await fs.readFile(path.join(out,'downloads/archive/source-domains-v0.10.json'),'utf8'));
const oldUnassigned=previousDomains.sources.filter(r=>!r.domain_ids.length).map(r=>r.paper_id);
assert.equal(oldUnassigned.length,22);
assert.deepEqual(new Set(review.rows.filter(r=>r.domain_reclassified).map(r=>r.paper_id)),new Set(oldUnassigned));
assert.ok(review.rows.every(r=>r.domain_status==='task_grounded_coded'&&r.domain_ids.length));
assert.ok(review.rows.every(r=>r.domain_ids.every(id=>r.domain_assignment.evidence.some(e=>e.domain_ids.includes(id)&&e.pages.length&&e.observed_tasks.length))));
assert.equal(review.domains.reduce((n,d)=>n+d.source_count,0),431);
assert.ok(coverageRow('P065').domain_ids.includes('home'),'CALVIN appliance/storage tasks support home use');
assert.deepEqual(coverageRow('P128').domain_ids,['general'],'Object relocation has a formal general-operation use');
assert.deepEqual(coverageRow('P193').domain_ids,['general'],'A grasp simulator is not automatically a wet-lab domain');
assert.deepEqual(coverageRow('P197').domain_ids,['wearable'],'Body-camera motion interface must not be left unclassified');
assert.deepEqual(coverageRow('P146').domain_ids,['assistance']);
assert.deepEqual(coverageRow('P105').domain_ids,['home','food']);
assert.ok(coverageRow('P105').domain_assignment.evidence.some(e=>e.paper_id==='P064'),'Derived source must cite the parent task scope');
assert.deepEqual(coverageRow('P106').domain_ids,coverageRow('P063').domain_ids);
assert.ok(coverageRow('P063').domain_assignment.evidence.some(e=>e.pages.includes(18)),'Meta-World purpose coding uses the actual task list');
assert.ok((await fs.readFile(path.join(out,'downloads/source-review/domain_classification.csv'),'utf8')).includes('RoboNet'));
const reportAssets=JSON.parse(await fs.readFile(path.join(out,'downloads/source-review/report_assets.json'),'utf8'));
const reportMD=await fs.readFile(path.join(out,'downloads/source-review/SOURCE_REVIEW.md'));
assert.equal(reportAssets.version,review.version);
const reportMDHash=crypto.createHash('sha256').update(reportMD).digest('hex');
assert.deepEqual(reportAssets.assets.map(a=>a.locale),['zh-hant','zh-hans']);
for(const a of reportAssets.assets){
  const pdf=await fs.readFile(path.join(out,'downloads/source-review',a.file));
  assert.ok(pdf.subarray(0,5).toString()==='%PDF-');
  assert.equal(pdf.length,a.bytes);
  assert.equal(crypto.createHash('sha256').update(pdf).digest('hex'),a.sha256);
  assert.equal(a.source_markdown_sha256,reportMDHash,'Source report changed: regenerate the PDF');
  assert.ok(a.pages>50&&a.all_250_paper_ids_present);
}
assert.ok(coverageRow('P038').evaluation_methods.includes('judge'));
assert.ok(coverageRow('P151').evaluation_methods.every(id=>id!=='state_process'),'Video goal appearance is not robot execution');
assert.ok(coverage.domains.every(d=>d.mapped_task_count===null));
assert.ok((await fs.readFile(path.join(out,'downloads/coverage/benchmark_summary.csv'),'utf8')).includes('BEHAVIOR-1K'));
assert.equal(registry.length,250);
assert.equal(registry.filter(r=>r.benchmark_source_registered).length,183);
assert.equal(bridge.length,5349);
assert.equal(new Set(bridge.map(r=>r.record_id)).size,5349);
assert.equal(union.newly_extracted_source_records,41);
assert.equal(union.information_task_definitions,7);
assert.equal(union.benchmark_source_records_with_task_inventory,registry.filter(r=>r.benchmark_source_registered&&r.source_records>0).length);
assert.equal(union.catalogue_requires_local_simulation,false);
assert.equal(union.pilot_role,'engineering_appendix_only');
assert.equal(union.complete_search_claimed,false);
const sourceIds=new Set(bridge.map(r=>r.record_id));
assert.equal(extensions.length,12);
assert.ok(extensions.every(r=>r.parent_source_ids.every(id=>sourceIds.has(id))));
assert.ok(extensions.every(r=>r.status==='authored_extension_specification_not_executed'));
const counting=JSON.parse(await fs.readFile(path.join(out,'downloads/counting/counting_contract.json'),'utf8'));
const symbols=JSON.parse(await fs.readFile(path.join(out,'downloads/counting/symbol_definitions.json'),'utf8'));
const sourceTaxonomy=JSON.parse(await fs.readFile(path.join(root,'content/taxonomy.json'),'utf8'));
assert.deepEqual(symbols.granularity_levels.map(g=>g.id),['G0','G1','G2','G3','G4','G5']);
assert.deepEqual(symbols.tracks,sourceTaxonomy.tracks);
assert.equal(symbols.g_is_difficulty_or_progress,false);
assert.equal(symbols.t_is_required_execution_order,false);
assert.equal(counting.unknown_totals.task_environment_definitions,null);
assert.equal(counting.unknown_totals.distinct_scene_layouts,null);
assert.ok(Object.values(counting.unknown_totals.source_sample_totals_by_type).every(n=>n===null));
assert.equal(counting.catalogue_requires_local_execution,false);
assert.equal(counting.source_indices_relabelled_as_environments,false);
assert.equal(counting.hypothetical_example.measured_result,false);
assert.equal(counting.hypothetical_example.scene_layouts,1);
assert.equal(counting.hypothetical_example.task_environment_definitions,3);
for(const example of counting.examples){
  const source=registry.find(r=>r.paper_id===example.paper_id);
  assert.ok(source);
  assert.equal(source.source_records,example.indexed_records);
}
for(const [source,count]of Object.entries({vima:17,arnold:8,coin_video:180,crosstask:83,calvin:34,openeqa:7})){
  assert.equal(bridge.filter(r=>r.source_id===source).length,count);
  assert.equal(nativeData.records.filter(r=>r.s===source).length,count);
}
const jointCases=JSON.parse(await fs.readFile(path.join(out,'downloads/joint-pilot/case_ledger.json'),'utf8'));
const jointTrials=JSON.parse(await fs.readFile(path.join(out,'downloads/joint-pilot/trial_ledger.json'),'utf8'));
const jointDownload=JSON.parse(await fs.readFile(path.join(out,'downloads/joint-pilot/download_info.json'),'utf8'));
const jointPublication=JSON.parse(await fs.readFile(path.join(out,'downloads/joint-pilot/publication_receipt.json'),'utf8'));
const demoScript=await fs.readFile(path.join(out,'assets/joint-pilot-data.js'),'utf8');
const jointDemos=JSON.parse(demoScript.replace(/^window\.JOINT_PILOT_DEMOS=/,'').replace(/;$/,''));
assert.equal(joint.workflow_candidates,1);
assert.equal(joint.canonical_g2_count,null);
assert.equal(joint.baseline_is_learned_vlm,false);
assert.equal(jointCases.length,120);
assert.equal(new Set(jointCases.map(r=>r.case_id)).size,120);
assert.equal(new Set(jointCases.map(r=>r.world_seed)).size,15);
assert.equal(jointCases.filter(r=>r.split==='test').length,80);
assert.ok(jointCases.every(r=>r.completion_witness_available));
assert.equal(jointTrials.length,720);
assert.equal(new Set(jointTrials.map(r=>r.trial_id)).size,720);
assert.equal(joint.supplemental_annotation_trials,2);
assert.equal(jointDemos.length,48);
assert.equal(new Set(jointDemos.map(r=>r.initial_image_ref)).size,1);
assert.equal(jointDownload.publication_status,'published_and_public_downloads_hash_verified');
assert.equal(jointPublication.assets.find(a=>a.file===jointDownload.file).url,jointDownload.url);
assert.equal(jointDownload.sha256,'93b5ddde3fc7e05507e0470c60e22c9561edae13f0e1fff5c0d3361516866f92');
for(const method of joint.method_results){
  const trials=jointTrials.filter(r=>r.split==='test'&&r.method_id===method.method_id);
  assert.equal(trials.length,80);
  for(const metric of ['physical_success','digital_success','joint_success']){
    assert.equal(trials.reduce((n,r)=>n+Number(r[metric]),0)/80,method[metric]);
  }
}
for(const record of jointDemos){
  const trial=jointTrials.find(r=>r.trial_id===record.trial_id);
  assert.ok(trial&&trial.split==='test');
  for(const metric of ['case_id','physical_success','digital_success','joint_success','dispatch_events']){
    assert.equal(record[metric],trial[metric]);
  }
  for(const ref of [record.initial_image_ref,record.final_image_ref]){
    assert.ok(allFiles.includes(path.join(out,'assets/joint-pilot',ref)));
  }
}
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
  const jointPage=pages.get(path.join(out,locale,'joint-pilot.html'));
  assert.equal(jointPage.$('[data-engineering-appendix]').length,1);
  assert.equal(jointPage.$('#joint-method-table tbody tr').length,6);
  assert.equal(jointPage.$('[data-joint-viewer] select').length,4);
  assert.equal(jointPage.$('video source').length,1);
  assert.ok(jointPage.$('#joint-evidence').text().includes('92.5%'));
  assert.ok(jointPage.$(`a[href="${jointDownload.url}"]`).length);
  const researchPage=pages.get(path.join(out,locale,'research.html'));
  assert.equal(researchPage.$('#research-category-table tbody tr').length,12);
  assert.equal(researchPage.$('#research-additions-table tbody tr').length,82);
  const overall=pages.get(path.join(out,locale,'design.html'));
  assert.ok(overall);
  assert.equal(overall.$('#overall-design-spec h2').length,12);
  assert.ok(overall.$('#design-section-3').length);
  assert.ok(overall.$('#design-section-9').length);
  assert.equal(overall.$('#current-design-update h2').length,10);
  assert.equal(overall.$('#union-first-design h2').length,10);
  assert.equal(overall.$('#historical-design-plans').attr('open'),undefined);
  assert.ok(overall.$('#iteration-section-4').text().includes('場景')||overall.$('#iteration-section-4').text().includes('场景'));
  assert.equal(overall.$('[data-capacity-output="total"]').text(),'2,880,000');
  assert.equal(overall.$('.primary-nav a').first().attr('href'),'coverage.html');
  assert.ok(overall.$('#coverage-design').length);
  assert.equal(overall.$('#previous-union-design').attr('open'),undefined);
  const unionPage=pages.get(path.join(out,locale,'survey-union.html'));
  assert.equal(unionPage.$('#union-registry-table tbody tr').length,250);
  assert.equal(unionPage.$('#union-taxonomy-table tbody tr').length,12);
  assert.equal(unionPage.$('#union-sources-table tbody tr').length,27);
  assert.equal(unionPage.$('#union-coin-domains tbody tr').length,12);
  assert.equal(unionPage.$('#union-extension-rules details').length,12);
  const countingPage=pages.get(path.join(out,locale,'counting.html'));
  assert.ok(countingPage);
  assert.equal(countingPage.$('[data-g-definition]').length,6);
  assert.equal(countingPage.$('[data-t-definition]').length,8);
  for(const code of ['G0','G1','G2','G3','G4','G5','T1','T2','T3','T4','T5','T6','T7','T8']){
    assert.ok(countingPage.$('#'+code.toLowerCase()).length);
  }
  const chapterTwo=pages.get(path.join(out,locale,'chapters/02.html'));
  assert.equal(chapterTwo.$('[data-symbol-reader-note]').length,1);
  for(const code of ['G0','G1','G2','G3','G4','G5','T3','T5','T6']){
    const links=chapterTwo.$(`[data-definition-symbol="${code}"]`);
    assert.ok(links.length);
    assert.ok(links.toArray().every(n=>chapterTwo.$(n).attr('href')===`../counting.html#${code.toLowerCase()}`));
  }
  for(let i=1;i<=14;i++){
    const page=pages.get(path.join(out,locale,`chapters/${String(i).padStart(2,'0')}.html`));
    assert.equal(page.$('code .definition-symbol,pre .definition-symbol,a .definition-symbol').length,0);
  }
  assert.equal(countingPage.$('#count-definitions article').length,counting.definitions.length);
  for(const route of ['survey-union.html','counting.html']){
    const page=pages.get(path.join(out,locale,route));
    assert.equal(page.$('[data-counting-metric="sources"] strong').text(),'183');
    assert.equal(page.$('[data-counting-metric="indices"] strong').text(),'5,349');
    assert.equal(page.$('[data-counting-metric="environments"]').attr('data-count-state'),'unknown');
    assert.equal(page.$('[data-counting-metric="samples"]').attr('data-count-state'),'unknown');
    const subtotals=page.$('[data-index-bucket]').toArray().map(n=>Number(page.$(n).attr('data-count')));
    assert.equal(subtotals.reduce((a,b)=>a+b,0),union.total_source_records);
    assert.deepEqual(subtotals,[2096,263,2990]);
  }
  assert.equal(countingPage.$('[data-example-count="cases"]').text(),'300');
  assert.equal(countingPage.$('[data-count-example="partnr"] td strong').first().text(),'6');
  assert.ok(countingPage.$('[data-count-example="partnr"] td').first().text().includes('生成器'));
  assert.ok(unionPage.$('#union-registry-table thead').text().includes(locale==='zh-hant'?'本庫已提取索引':'本库已提取索引'));
  const home=pages.get(path.join(out,locale,'index.html'));
  assert.equal(home.$('[data-coverage-metric]').length,5);
  assert.equal(home.$('[data-counting-metric]').length,0,'Detailed counting axes no longer lead the homepage');
  const coveragePage=pages.get(path.join(out,locale,'coverage.html'));
  assert.ok(coveragePage);
  assert.equal(coveragePage.$('#coverage-whole-table tbody tr').length,5);
  assert.equal(coveragePage.$('#coverage-benchmarks tbody tr').length,183);
  assert.equal(coveragePage.$('#coverage-domain-table tbody tr').length,21);
  assert.equal(coveragePage.$('#domain-reclassification-table tbody tr').length,22);
  assert.equal(coveragePage.$('#domain-coverage-summary').attr('data-classified'),'183');
  assert.equal(coveragePage.$('#domain-coverage-summary').attr('data-unassigned'),'0');
  assert.equal(coveragePage.$('.domain-evidence').length,183);
  assert.equal(coveragePage.$('#coverage-domain-filter option[value="unspecified"]').length,0);
  assert.equal(coveragePage.$('.domain-definition-grid article').length,3);
  assert.equal(coveragePage.$('.coverage-evaluation-grid article').length,4);
  for(const [route,selector]of [['coverage.html','#coverage-whole-table'],['design.html','#design-number-table']]){
    const p=pages.get(path.join(out,locale,route)).$;
    assert.equal(p(`${selector} [data-number-role="target"][data-target-status="not_set"]`).length,5);
    assert.deepEqual(p(`${selector} [data-number-role="current"]`).toArray().map(n=>Number(p(n).attr('data-number-value'))),[21,284,2096,114288,4]);
  }
  assert.equal(home.$('[data-target-count]').length,0);
  assert.deepEqual(home.$('[data-current-count]').toArray().map(n=>Number(home.$(n).attr('data-current-count'))),[21,284,2096,114288,4]);
  assert.equal(coveragePage.$('#number-environment-breakdown tbody tr').length,5);
  assert.equal(coveragePage.$('#number-case-breakdown tbody tr').length,3);
  assert.equal(coveragePage.$('#number-version-crosswalk tbody tr').length,numberContract.version_crosswalk.length);
  assert.ok(coveragePage.$('a[href="../downloads/coverage/benchmark_summary.csv"]').length);
  assert.ok(home.$('.hero').text().includes('Survey')||home.$('.hero').text().includes('SURVEY'));
  assert.ok(!home.$('#main-content').text().includes('92.5%'));
  assert.equal(home.$('a[href="joint-pilot.html"]').closest('#home-engineering-appendix').length,1);
  const search=await fs.readFile(path.join(out,`assets/search-${locale}.js`),'utf8');
  assert.ok(search.includes('"path":"design.html"'));
  assert.ok(pages.has(path.join(out,locale,'scale-plan.html')));
  assert.ok(pages.has(path.join(out,locale,'native-tasks.html')));
  const budget=pages.get(path.join(out,locale,'chapters/11.html')).$;
  assert.ok(budget('#c11').text().includes('2,000–3,000'));
  assert.equal(budget('details.legacy-content').length,1);
  assert.equal(budget('#archive-c11').attr('open'),undefined);
  assert.equal(budget('[data-active-numbers]').length,1);
  const comparison=pages.get(path.join(out,locale,'chapters/05.html')).$.text();
  assert.ok(comparison.includes('v0.4')&&comparison.includes('2,000–3,000'));
}
await fs.mkdir(path.join(root,'verification'),{recursive:true});
const report={status:issues.length?'failed':'passed',htmlPages:pages.size,localizedPages:manifest.pages.length,linksAndAssetsChecked:checked,recordCounts:expected,nativeSourceRecords:nativeData.records.length,sourceSectionsPreserved:requiredSectionIds.length,sourceReview:review.statistics,surveyUnion:{registeredSources:183,papers:250,sourceRecords:bridge.length,addedDefinitions:union.newly_extracted_source_records,ruleExamples:12,catalogueRequiresLocalExecution:false},counting:{contract:counting.version,sourceIndices:bridge.length,taskEnvironmentDefinitions:null,rawSampleTotals:null,exampleIsHypothetical:true},quantified:{version:numberContract.version,targets:quantityRows(numeric).map(r=>r.target),current:quantityRows(numeric).map(r=>r.current),checkedCaseDefinitions:caseIds.size,caseDefinitionIssues:0,newModelTrials:0},jointPilot:{role:'engineering_appendix',cases:jointCases.length,programTrials:jointTrials.length,supplementalAnnotations:joint.supplemental_annotation_trials},scopeVersion:config.iterationVersion,designScope:'Main research: prior benchmark survey, task union and task/rule extensions. Catalogue collection and executable subsets are separate. Earlier native and joint experiments remain engineering appendices.',issues};
await fs.writeFile(path.join(root,'verification/static-checks.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,issues:issues.slice(0,20)},null,2));
assert.equal(issues.length,0,`${issues.length} static site issues`);
