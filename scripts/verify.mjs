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
assert.equal(registry.length,250);
assert.equal(registry.filter(r=>r.benchmark_source_registered).length,143);
assert.equal(bridge.length,5308);
assert.equal(new Set(bridge.map(r=>r.record_id)).size,5308);
assert.equal(union.newly_extracted_source_records,288);
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
for(const [source,count]of Object.entries({vima:17,arnold:8,coin_video:180,crosstask:83})){
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
  assert.equal(overall.$('.primary-nav a').first().attr('href'),'survey-union.html');
  const unionPage=pages.get(path.join(out,locale,'survey-union.html'));
  assert.equal(unionPage.$('#union-registry-table tbody tr').length,250);
  assert.equal(unionPage.$('#union-taxonomy-table tbody tr').length,12);
  assert.equal(unionPage.$('#union-sources-table tbody tr').length,25);
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
  for(const route of ['index.html','survey-union.html','counting.html']){
    const page=pages.get(path.join(out,locale,route));
    assert.equal(page.$('[data-counting-metric="sources"] strong').text(),'143');
    assert.equal(page.$('[data-counting-metric="indices"] strong').text(),'5,308');
    assert.equal(page.$('[data-counting-metric="environments"]').attr('data-count-state'),'unknown');
    assert.equal(page.$('[data-counting-metric="samples"]').attr('data-count-state'),'unknown');
    const subtotals=page.$('[data-index-bucket]').toArray().map(n=>Number(page.$(n).attr('data-count')));
    assert.equal(subtotals.reduce((a,b)=>a+b,0),union.total_source_records);
    assert.deepEqual(subtotals,[2062,263,2983]);
  }
  assert.equal(countingPage.$('[data-example-count="cases"]').text(),'300');
  assert.equal(countingPage.$('[data-count-example="partnr"] td strong').first().text(),'6');
  assert.ok(countingPage.$('[data-count-example="partnr"] td').first().text().includes('生成器'));
  assert.ok(unionPage.$('#union-registry-table thead').text().includes(locale==='zh-hant'?'本庫已提取索引':'本库已提取索引'));
  const home=pages.get(path.join(out,locale,'index.html'));
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
  const comparison=pages.get(path.join(out,locale,'chapters/05.html')).$.text();
  assert.ok(comparison.includes('v0.4')&&comparison.includes('2,000–3,000'));
}
await fs.mkdir(path.join(root,'verification'),{recursive:true});
const report={status:issues.length?'failed':'passed',htmlPages:pages.size,localizedPages:manifest.pages.length,linksAndAssetsChecked:checked,recordCounts:expected,nativeSourceRecords:nativeData.records.length,sourceSectionsPreserved:requiredSectionIds.length,surveyUnion:{registeredSources:143,papers:250,sourceRecords:5308,addedDefinitions:288,ruleExamples:12,catalogueRequiresLocalExecution:false},counting:{contract:counting.version,sourceIndices:5308,taskEnvironmentDefinitions:null,rawSampleTotals:null,exampleIsHypothetical:true},jointPilot:{role:'engineering_appendix',cases:jointCases.length,programTrials:jointTrials.length,supplementalAnnotations:joint.supplemental_annotation_trials},scopeVersion:config.iterationVersion,designScope:'Main research: prior benchmark survey, task union and task/rule extensions. Catalogue collection and executable subsets are separate. Earlier native and joint experiments remain engineering appendices.',issues};
await fs.writeFile(path.join(root,'verification/static-checks.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,issues:issues.slice(0,20)},null,2));
assert.equal(issues.length,0,`${issues.length} static site issues`);
