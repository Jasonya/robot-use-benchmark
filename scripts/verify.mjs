import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
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
  for(const node of $('a[href],script[src],link[href],img[src]').toArray()){
    const raw=$(node).attr('href')||$(node).attr('src');
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
  'explore/metrics.html':40,'library.html':168
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
for(const locale of ['zh-hant','zh-hans']){
  const overall=pages.get(path.join(out,locale,'design.html'));
  assert.ok(overall);
  assert.equal(overall.$('#overall-design-spec h2').length,12);
  assert.ok(overall.$('#design-section-3').length);
  assert.ok(overall.$('#design-section-9').length);
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
const report={status:issues.length?'failed':'passed',htmlPages:pages.size,localizedPages:manifest.pages.length,linksAndAssetsChecked:checked,recordCounts:expected,nativeSourceRecords:nativeData.records.length,sourceSectionsPreserved:requiredSectionIds.length,scopeVersion:config.designVersion,designScope:'Documentation and planning arithmetic only; no robot experiments.',issues};
await fs.writeFile(path.join(root,'verification/static-checks.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,issues:issues.slice(0,20)},null,2));
assert.equal(issues.length,0,`${issues.length} static site issues`);
