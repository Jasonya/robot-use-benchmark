import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const preview=path.join(root,'.preview');
const screenshots=path.join(root,'verification/screenshots');
await fs.mkdir(preview,{recursive:true});
await fs.mkdir(screenshots,{recursive:true});
const BASE=process.env.ROBOT_TEST_URL||'http://127.0.0.1:8768/robot-use-benchmark/';
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile=path.join(preview,`chrome-${Date.now()}`);
const child=spawn(chrome,['--headless=new','--disable-gpu','--disable-background-networking','--disable-component-update','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe'],detached:true});
let browserURL;
const checks=[];
const errors=[];
class CDP{
  constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map();this.ready=new Promise((resolve,reject)=>{this.ws.addEventListener('open',resolve,{once:true});this.ws.addEventListener('error',reject,{once:true});});this.ws.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const item=this.pending.get(message.id);if(item){this.pending.delete(message.id);clearTimeout(item.timer);message.error?item.reject(new Error(JSON.stringify(message.error))):item.resolve(message.result);}}else if(message.method==='Runtime.exceptionThrown'){errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);}});}
  async send(method,params={}){await this.ready;const id=++this.id;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error(`CDP timeout: ${method}`));},20000);this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify({id,method,params}));});}
  close(){this.ws.close();}
}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let cdp;
try{
  browserURL=await new Promise((resolve,reject)=>{
    let buffer='';const timer=setTimeout(()=>reject(new Error('Chrome startup timeout')),18000);
    child.stderr.on('data',chunk=>{buffer+=chunk;const match=buffer.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1]);}});
    child.on('error',reject);
  });
  const port=new URL(browserURL).port;
  const targets=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target=targets.find(item=>item.type==='page');
  cdp=new CDP(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  const evaluate=async expression=>{
    const result=await cdp.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
    return result.result?.value;
  };
  async function waitFor(expression,timeout=30000){
    const until=Date.now()+timeout;
    while(Date.now()<until){if(await evaluate(expression))return;await sleep(80);}
    throw new Error('Timed out waiting for '+expression);
  }
  async function viewport(width,height,mobile=false){
    await cdp.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
  }
  async function go(route){
    const url=new URL(route,BASE).href;
    await cdp.send('Page.navigate',{url});
    await waitFor(`location.pathname===${JSON.stringify(new URL(url).pathname)}&&document.readyState==='complete'&&!!window.ROBOT_SITE`);
    await evaluate('document.fonts.ready.then(()=>true)');
    await sleep(100);
  }
  async function snapshot(name){
    const image=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await fs.writeFile(path.join(screenshots,name+'.png'),Buffer.from(image.data,'base64'));
  }
  function pass(name,detail){checks.push({name,status:'passed',detail});console.log('PASS',name);}
  const setValue=async(selector,value)=>evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.value=${JSON.stringify(value)};e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));return true;})()`);
  const visibleCount=()=>evaluate(`Array.from(document.querySelectorAll('[data-entry]')).filter(e=>!e.hidden).length`);
  const noOverflow=()=>evaluate('document.documentElement.scrollWidth<=innerWidth+1');

  await viewport(1440,1100);
  await go('zh-hant/index.html');
  assert.equal(await evaluate("document.documentElement.lang"),'zh-Hant');
  assert.ok(await noOverflow());
  assert.equal(await evaluate("typeof window.SEARCH_INDEX"),'undefined','Ordinary reading should not download the full search index.');
  await snapshot('home-traditional-desktop');
  assert.equal(await evaluate("document.querySelector('.primary-nav a').getAttribute('href')"),'survey-union.html');
  assert.equal(await evaluate("document.querySelector('#main-content').textContent.includes('92.5%')"),false);
  await evaluate("document.getElementById('home-engineering-appendix').open=true;document.getElementById('home-legacy-demo').open=true");
  await evaluate("document.querySelector('[data-demo-goal=\"b\"]').click()");
  assert.equal(await evaluate("document.querySelector('#towel-fold-b').getAttribute('visibility')"),'visible');
  assert.equal(await evaluate("document.querySelector('#fold-pairs').textContent"),'B → A · C → D');
  pass('Research-first homepage and preserved example','Homepage leads with survey and task union; the earlier goal demonstration is preserved inside the engineering appendix.');

  await evaluate("document.querySelector('.search-trigger').click()");
  await setValue('#global-search-input','记忆');
  await waitFor("document.querySelectorAll('#global-search-results .search-result').length>0",45000);
  assert.ok(await evaluate("document.querySelectorAll('#global-search-results .search-result').length>0"));
  assert.equal(await evaluate('document.activeElement.id'),'global-search-input');
  await evaluate("document.querySelector('#close-search').click()");
  assert.equal(await evaluate("document.querySelector('#global-search').open"),false);
  pass('Global cross-script search','Simplified query finds Traditional content; dialog focus and close work.');

  await go('zh-hant/explore/tasks.html');
  assert.equal(await visibleCount(),12);
  await setValue('#filter-domain','D08');
  await setValue('#filter-material','cloth');
  assert.equal(await visibleCount(),12);
  assert.ok((await evaluate("document.querySelector('#result-count').textContent")).includes('/ 12'));
  await snapshot('tasks-filtered-desktop');
  await evaluate("document.querySelector('.language-switch a[data-locale=\"zh-hans\"]').click()");
  await waitFor("location.pathname.includes('/zh-hans/')&&document.readyState==='complete'&&window.ROBOT_SITE.locale==='zh-hans'");
  assert.equal(await evaluate('document.documentElement.lang'),'zh-Hans');
  assert.equal(await evaluate("new URLSearchParams(location.search).get('domain')"),'D08');
  assert.equal(await evaluate("document.querySelector('#filter-material').value"),'cloth');
  assert.equal(await visibleCount(),12);
  pass('Filters and language state','D08 + cloth yields 12 blueprints and survives the Traditional → Simplified switch.');

  await setValue('#filter-q','zz-unmatched-blueprint');
  assert.equal(await visibleCount(),0);
  assert.equal(await evaluate("document.querySelector('#no-results').hidden"),false);
  await evaluate("document.querySelector('#reset-filters').click()");
  assert.equal(await visibleCount(),12);
  await evaluate("document.querySelector('#next-page').click()");
  assert.equal(await evaluate("Array.from(document.querySelectorAll('[data-entry]')).find(e=>!e.hidden).id"),'SC-H13');
  await evaluate("document.querySelector('#show-all').click()");
  assert.equal(await visibleCount(),180);
  await evaluate("document.querySelector('#show-all').click()");
  assert.equal(await visibleCount(),12);
  pass('Empty results, reset and pagination','No-match state, clear filters, next page and show-all restore consistent counts.');

  await go('zh-hant/explore/tasks.html#SC-H15');
  assert.equal(await evaluate("document.getElementById('SC-H15').hidden"),false);
  assert.equal(await evaluate("document.querySelector('#SC-H15 details').open"),true);
  assert.ok(await evaluate("document.getElementById('SC-H15').getBoundingClientRect().top>=60&&document.getElementById('SC-H15').getBoundingClientRect().top<200"));
  pass('Shareable deep links','A direct SC-H15 URL reveals its page and opens the detailed record.');

  await go('zh-hans/library.html');
  await setValue('#filter-q','Ego4D');
  assert.ok(await evaluate("Array.from(document.querySelectorAll('[data-entry]')).some(e=>!e.hidden&&e.id==='P013')"));
  await setValue('#filter-q','');
  await setValue('#filter-evidence','E2');
  assert.ok((await evaluate("document.querySelector('#result-count').textContent")).includes('/ 137'));
  await setValue('#filter-evidence','');
  await setValue('#filter-q','Bench2Dex');
  assert.equal(await visibleCount(),1);
  pass('Literature filters','Original and added sources are discoverable; 137 complete-abstract records remain separate from metadata-only records.');

  await go('zh-hant/chapters/03.html');
  assert.ok(await evaluate("document.querySelector('h1').textContent.includes('granularity')"));
  assert.ok(await evaluate("document.querySelectorAll('.chapter-summary li').length===3"));
  assert.ok(await noOverflow());
  await snapshot('chapter-desktop');
  pass('Full chapter reading','Chapter summary, source content, sticky navigation and wide-table containment render.');

  await go('zh-hans/search.html?q=SC-H15');
  await waitFor("document.querySelectorAll('#site-search-results .search-result').length>0",45000);
  assert.ok(await evaluate("document.querySelectorAll('#site-search-results .search-result').length>0"));
  pass('Standalone search','Search URLs are directly shareable and searchable by stable IDs.');

  await go('zh-hant/design.html');
  assert.ok(await evaluate("document.querySelector('#union-first-design').textContent.includes('目錄')"));
  assert.equal(await evaluate("document.getElementById('historical-design-plans').open"),false);
  assert.ok(await evaluate("document.querySelector('#design-section-3').textContent.includes('共同門檻')"));
  assert.ok(await evaluate("document.querySelector('#overall-design-spec').textContent.includes('100 個不同 G2')"));
  assert.ok(await noOverflow());
  await snapshot('overall-design-desktop');
  await evaluate("document.getElementById('historical-design-plans').open=true");
  await evaluate("document.getElementById('capacity-explorer').scrollIntoView({behavior:'instant',block:'center'})");
  assert.equal(await evaluate("document.querySelector('[data-capacity-output=\"total\"]').textContent"),'2,880,000');
  await setValue('#capacity-instances','20');
  assert.equal(await evaluate("document.querySelector('[data-capacity-output=\"instances\"]').textContent"),'60,000');
  assert.equal(await evaluate("document.querySelector('[data-capacity-output=\"total\"]').textContent"),'5,760,000');
  assert.ok(await evaluate("document.querySelector('#capacity-explorer').textContent.includes('固定 2,400')"));
  await setValue('#capacity-conditions','1');
  await setValue('#capacity-repeats','1');
  await setValue('#capacity-methods','1');
  assert.equal(await evaluate("document.querySelector('[data-capacity-output=\"total\"]').textContent"),'60,000');
  await snapshot('capacity-planner-desktop');
  pass('Current design and historical planning units','Source collection, taxonomy, task union and rule extension lead the design; earlier capacity examples remain usable in the historical appendix.');

  await go('zh-hant/survey-union.html');
  assert.equal(await evaluate("document.getElementById('union-count').dataset.visibleCount"),'143');
  assert.equal(await evaluate("document.querySelectorAll('#union-taxonomy-table tbody tr').length"),12);
  assert.equal(await evaluate("document.querySelectorAll('#union-sources-table tbody tr').length"),25);
  assert.ok(await noOverflow());
  await snapshot('survey-union-desktop');
  await setValue('#union-q','VIMA');
  assert.equal(await evaluate("document.getElementById('union-count').dataset.visibleCount"),'1');
  await setValue('#union-category','M');
  await evaluate("document.querySelector('.language-switch a[data-locale=\"zh-hans\"]').click()");
  await waitFor("location.pathname.includes('/zh-hans/')&&document.readyState==='complete'&&!!document.getElementById('union-count').dataset.visibleCount");
  assert.equal(await evaluate("document.getElementById('union-q').value"),'VIMA');
  assert.equal(await evaluate("document.getElementById('union-category').value"),'M');
  assert.equal(await evaluate("document.getElementById('union-count').dataset.visibleCount"),'1');
  await setValue('#union-q','');
  await setValue('#union-category','');
  await setValue('#union-pool','all');
  assert.equal(await evaluate("document.getElementById('union-count').dataset.visibleCount"),'250');
  await setValue('#union-q','zz-unmatched-source');
  assert.equal(await evaluate("document.getElementById('union-count').dataset.visibleCount"),'0');
  pass('Survey source registry and language filters','All250 papers remain available;143 registered evaluation sources are the default, with source/category filters and shareable Traditional/Simplified state.');

  await go('zh-hant/counting.html');
  assert.ok(await noOverflow());
  assert.equal(await evaluate("document.querySelector('[data-counting-metric=\"indices\"] strong').textContent"),'5,308');
  assert.equal(await evaluate("document.querySelector('[data-counting-metric=\"environments\"]').dataset.countState"),'unknown');
  assert.equal(await evaluate("document.querySelector('[data-counting-metric=\"samples\"]').dataset.countState"),'unknown');
  assert.equal(await evaluate("Array.from(document.querySelectorAll('[data-index-bucket]')).reduce((n,e)=>n+Number(e.dataset.count),0)"),5308);
  await snapshot('counting-desktop');
  await evaluate("document.getElementById('counting-example').scrollIntoView({behavior:'instant',block:'start'})");
  assert.equal(await evaluate("document.querySelector('[data-example-count=\"cases\"]').textContent"),'300');
  await setValue('#counting-cases-per-definition','1000');
  assert.equal(await evaluate("document.querySelector('[data-example-count=\"cases\"]').textContent"),'3,000');
  assert.equal(await evaluate("document.querySelector('[data-example-count=\"scenes\"]').textContent"),'1');
  assert.equal(await evaluate("document.querySelector('[data-example-count=\"definitions\"]').textContent"),'3');
  assert.equal(await evaluate("document.querySelector('[data-counting-metric=\"indices\"] strong').textContent"),'5,308');
  await snapshot('counting-hypothetical-example-desktop');
  await evaluate("document.querySelector('.language-switch a[data-locale=\"zh-hans\"]').click()");
  await waitFor("location.pathname.includes('/zh-hans/')&&document.readyState==='complete'&&!!document.getElementById('counting-cases-per-definition')");
  assert.equal(await evaluate("document.getElementById('counting-cases-per-definition').value"),'1000');
  assert.equal(await evaluate("document.querySelector('[data-example-count=\"cases\"]').textContent"),'3,000');
  assert.equal(await evaluate("document.querySelector('[data-counting-metric=\"environments\"]').dataset.countState"),'unknown');
  pass('Counting units and task-environment example','Source143/index5308 and unknown environment/sample totals remain separate; the hypothetical case calculator changes only example cases and preserves language state.');

  await go('zh-hant/native-tasks.html?source=vima');
  assert.ok(await evaluate("document.getElementById('native-count').textContent.includes('/ 17 ')"));
  await setValue('#native-source','arnold');
  assert.ok(await evaluate("document.getElementById('native-count').textContent.includes('/ 8 ')"));
  await setValue('#native-source','coin_video');
  assert.ok(await evaluate("document.getElementById('native-count').textContent.includes('/ 180 ')"));
  await setValue('#native-source','crosstask');
  assert.ok(await evaluate("document.getElementById('native-count').textContent.includes('/ 83 ')"));
  assert.ok(await evaluate("document.querySelector('#native-records .section-link').href.endsWith('crosstask_release.zip')"));
  await setValue('#native-source','');
  await setValue('#native-bucket','human_activity_definitions');
  assert.ok(await evaluate("document.getElementById('native-count').textContent.includes('/ 263 ')"));
  pass('Additional official task inventories','VIMA17, ARNOLD8, COIN180 and CrossTask83 appear in the shared source browser, with correct native types and definition links.');

  await go('zh-hant/readiness.html');
  assert.equal(await evaluate("document.querySelectorAll('[data-audit-gap]').length"),15);
  assert.equal(await evaluate("document.querySelector('[data-audit-stat=\"domain-unknown\"]').textContent"),'90.2%');
  assert.equal(await evaluate("document.querySelector('[data-audit-stat=\"feature-unknown\"]').textContent"),'69.6%');
  assert.ok(await noOverflow());
  await snapshot('readiness-audit-desktop');
  await go('zh-hant/readiness.html#gap-14');
  assert.equal(await evaluate("document.getElementById('gap-14').open"),true);
  await evaluate("document.querySelector('.language-switch a[data-locale=\"zh-hans\"]').click()");
  await waitFor("location.pathname.includes('/zh-hans/')&&document.readyState==='complete'&&window.ROBOT_SITE.locale==='zh-hans'");
  assert.equal(await evaluate("document.getElementById('gap-14').open"),true);
  assert.equal(await evaluate("location.hash"),'#gap-14');
  pass('Readiness audit and evidence gaps','Metadata backlog percentages are separate from benchmark coverage; 15 gap records, source links and Traditional/Simplified deep links render.');

  await go('zh-hant/execution.html');
  assert.equal(await evaluate("document.querySelectorAll('#execution-method-summary tbody tr').length"),5);
  assert.equal(await evaluate("document.querySelectorAll('#execution-native-task-table tbody tr').length"),50);
  assert.ok(await evaluate("document.querySelector('#execution-method-summary').textContent.includes('65.6%')"));
  assert.ok(await evaluate("document.querySelector('#main-content').textContent.includes('1,250')"));
  assert.ok(await noOverflow());
  await snapshot('execution-desktop');
  await evaluate("document.querySelector('video').load()");
  await waitFor("document.querySelector('video').readyState>=1",45000);
  assert.equal(await evaluate("document.querySelector('video').error"),null);
  assert.ok(await evaluate("document.querySelector('video').videoWidth>0"));
  pass('Native execution and actual video','All 50 tasks and five methods render; the saved-action replay video decodes successfully.');

  await go('zh-hant/joint-pilot.html');
  await waitFor("!!document.querySelector('[data-joint-viewer]').dataset.selectedTrial");
  assert.equal(await evaluate("document.querySelectorAll('#joint-method-table tbody tr').length"),6);
  assert.ok(await noOverflow());
  const initialImage=await evaluate("document.getElementById('joint-initial-image').src");
  const leftFinal=await evaluate("document.getElementById('joint-final-image').src");
  await setValue('#joint-bay','BAY-R');
  assert.equal(await evaluate("document.getElementById('joint-initial-image').src"),initialImage);
  assert.notEqual(await evaluate("document.getElementById('joint-final-image').src"),leftFinal);
  await setValue('#joint-method','digital_only');
  assert.equal(await evaluate("document.getElementById('joint-physical').dataset.passed"),'false');
  assert.equal(await evaluate("document.getElementById('joint-digital').dataset.passed"),'true');
  assert.equal(await evaluate("document.getElementById('joint-success').dataset.passed"),'false');
  await setValue('#joint-method','rgb_tools_new_key_retry');
  assert.equal(await evaluate("document.getElementById('joint-dispatch-count').textContent"),'2');
  assert.equal(await evaluate("document.getElementById('joint-physical').dataset.passed"),'true');
  assert.equal(await evaluate("document.getElementById('joint-digital').dataset.passed"),'false');
  await evaluate("document.getElementById('joint-case-viewer').scrollIntoView({behavior:'instant',block:'start'})");
  await waitFor("Array.from(document.querySelectorAll('#joint-case-viewer img')).every(i=>i.complete&&i.naturalWidth===640)");
  await snapshot('joint-pilot-diagnostic-desktop');
  const selectedTrial=await evaluate("document.querySelector('[data-joint-viewer]').dataset.selectedTrial");
  await evaluate("document.querySelector('.language-switch a[data-locale=\"zh-hans\"]').click()");
  await waitFor("location.pathname.includes('/zh-hans/')&&document.readyState==='complete'&&!!window.JOINT_PILOT_DEMOS");
  assert.equal(await evaluate("document.querySelector('[data-joint-viewer]').dataset.selectedTrial"),selectedTrial);
  assert.equal(await evaluate("document.getElementById('joint-bay').value"),'BAY-R');
  assert.equal(await evaluate("document.getElementById('joint-method').value"),'rgb_tools_new_key_retry');
  pass('Joint data and diagnostic controls','Shared RGB stays identical across goals; saved outcomes show physical/digital disagreement and duplicate commits; selected trial survives the language switch.');
  await evaluate("document.querySelector('video').load()");
  await waitFor("document.querySelector('video').readyState>=1",45000);
  assert.equal(await evaluate("document.querySelector('video').error"),null);
  assert.ok(await evaluate("document.querySelector('video').videoWidth>0"));
  pass('Joint saved-action replay video','The actual RGB/tool/robot replay video decodes, with the complete original outcomes linked separately.');

  await go('zh-hans/research.html');
  assert.equal(await evaluate("document.querySelectorAll('#research-category-table tbody tr').length"),12);
  assert.equal(await evaluate("document.querySelectorAll('#research-additions-table tbody tr').length"),82);
  assert.ok(await evaluate("document.querySelector('#main-content').textContent.includes('588')"));
  assert.ok(await noOverflow());
  await snapshot('research-desktop');
  pass('Research update and scope','250-record corpus, 82 additions, category distribution and unreviewed-candidate limits are displayed separately.');

  await go('zh-hant/compare.html');
  assert.ok(await evaluate("document.getElementById('comparison-review-status').textContent.includes('736／816')"));
  const comparedRows=()=>evaluate("Array.from(document.querySelectorAll('#comparison-scale tbody tr')).filter(row=>!row.hidden).length");
  assert.equal(await comparedRows(),70);
  assert.equal(await evaluate("typeof window.SEARCH_INDEX"),'undefined');
  assert.ok(await noOverflow());
  await snapshot('benchmark-comparison-desktop');
  await setValue('#comparison-query','PARTNR');
  assert.equal(await comparedRows(),3);
  assert.ok(await evaluate("document.querySelector('#comparison-scale [data-comparison-row=\"partnr\"]').textContent.includes('100,000')"));
  await setValue('#comparison-query','');
  await setValue('#comparison-group','human_transfer');
  assert.equal(await comparedRows(),7);
  await evaluate("document.getElementById('comparison-view-domains').click()");
  assert.equal(await evaluate("document.getElementById('comparison-panel-domains').hidden"),false);
  assert.equal(await evaluate("document.querySelectorAll('#comparison-domains thead th').length"),13);
  await snapshot('benchmark-domains-desktop');
  await evaluate("document.querySelector('.language-switch a[data-locale=\"zh-hans\"]').click()");
  await waitFor("location.pathname.includes('/zh-hans/')&&document.readyState==='complete'&&window.ROBOT_SITE.locale==='zh-hans'");
  assert.equal(await evaluate("document.getElementById('comparison-group').value"),'human_transfer');
  assert.equal(await evaluate("document.getElementById('comparison-panel-domains').hidden"),false);
  assert.equal(await comparedRows(),7);
  await evaluate("document.getElementById('comparison-pin').click()");
  assert.equal(await comparedRows(),5);
  await setValue('#comparison-query','zz-no-comparison');
  assert.equal(await comparedRows(),0);
  assert.equal(await evaluate("document.getElementById('comparison-empty').hidden"),false);
  await go('zh-hant/compare.html?group=human_transfer#benchmark-behavior');
  assert.equal(await evaluate("document.getElementById('benchmark-behavior').open"),true);
  assert.equal(await evaluate("document.getElementById('benchmark-behavior').hidden"),false);
  pass('Benchmark comparison matrices','70 rows, separate native units, 12 domain columns, research filters, pinned plan/current rows, cross-language state, empty results and source deep links work.');

  await go('zh-hant/scale-plan.html');
  assert.ok(await evaluate("document.querySelector('#main-content').textContent.includes('2,000–3,000')"));
  assert.ok(await noOverflow());
  await snapshot('scale-plan-desktop');
  await go('zh-hant/native-tasks.html');
  assert.equal(await evaluate('window.NATIVE_SOURCE_DATA.records.length'),5308);
  assert.equal(await evaluate("document.querySelectorAll('[data-native-record]').length"),24);
  await setValue('#native-source','roboverse');
  assert.ok(await evaluate("document.querySelector('#native-count').textContent.includes('2,897')"));
  await evaluate("document.getElementById('native-hide-config').click()");
  assert.ok(await evaluate("document.querySelector('#native-count').textContent.includes('310')"));
  await snapshot('native-source-filtered-desktop');
  await evaluate("document.querySelector('.language-switch a[data-locale=\"zh-hans\"]').click()");
  await waitFor("location.pathname.includes('/zh-hans/')&&document.readyState==='complete'&&!!window.NATIVE_SOURCE_DATA");
  assert.equal(await evaluate("document.getElementById('native-source').value"),'roboverse');
  assert.equal(await evaluate("document.getElementById('native-hide-config').checked"),true);
  assert.ok(await evaluate("document.querySelector('#native-count').textContent.includes('310')"));
  pass('Native source browser and conservative variant filter','5,308 source records; original RoboVerse counts remain2,897/310 and only the2,587 tagged config derivations are hidden.');
  const nativeAnchor=await evaluate("window.NATIVE_SOURCE_DATA.records.find(record=>record.s==='behavior').id");
  await go('zh-hant/native-tasks.html#'+nativeAnchor);
  assert.equal(await evaluate(`document.getElementById(${JSON.stringify(nativeAnchor)}).querySelector('details').open`),true);
  await go('zh-hant/chapters/11.html');
  assert.ok(await evaluate("document.querySelector('#c11').textContent.includes('2,000–3,000')"));
  assert.equal(await evaluate("document.querySelector('details.legacy-content').open"),false);
  assert.ok(await evaluate("document.querySelector('#c11').textContent.includes('B_execution')"));
  pass('New scope and source deep links','The v0.4 budget separates global tasks from execution bindings; the v0.2 budget is archived, and native records have shareable anchors.');

  await viewport(390,1000,true);
  await go('zh-hant/index.html');
  assert.ok(await noOverflow());
  await snapshot('home-traditional-mobile');
  await evaluate("document.querySelector('.menu-button').click()");
  assert.equal(await evaluate("document.querySelector('.menu-button').getAttribute('aria-expanded')"),'true');
  assert.ok(await evaluate("getComputedStyle(document.querySelector('.primary-nav')).display!=='none'"));
  await evaluate("document.querySelector('.menu-button').click()");
  await go('zh-hans/chapters/08.html');
  assert.ok(await noOverflow());
  await snapshot('chapter-simplified-mobile');
  await go('zh-hans/explore/tasks.html#SC-H15');
  assert.ok(await noOverflow());
  await snapshot('task-simplified-mobile');
  await go('zh-hans/native-tasks.html?source=robocasa');
  assert.ok(await noOverflow());
  await snapshot('native-source-mobile');
  await go('zh-hans/scale-plan.html');
  assert.ok(await noOverflow());
  await snapshot('scale-plan-mobile');
  await go('zh-hans/design.html');
  assert.ok(await noOverflow());
  await snapshot('overall-design-mobile');
  await evaluate("document.getElementById('historical-design-plans').open=true");
  await evaluate("document.getElementById('capacity-explorer').scrollIntoView({behavior:'instant',block:'center'})");
  assert.ok(await noOverflow());
  await snapshot('capacity-planner-mobile');
  await go('zh-hans/readiness.html');
  assert.ok(await noOverflow());
  await snapshot('readiness-audit-mobile');
  await go('zh-hans/joint-pilot.html?sku=SKU-G&bay=BAY-R&fault=clean&method=digital_only');
  assert.ok(await noOverflow());
  assert.equal(await evaluate("document.getElementById('joint-success').dataset.passed"),'false');
  await snapshot('joint-pilot-mobile');
  await evaluate("document.getElementById('joint-case-viewer').scrollIntoView({behavior:'instant',block:'start'})");
  await snapshot('joint-pilot-viewer-mobile');
  await go('zh-hans/survey-union.html?category=D');
  assert.ok(await noOverflow());
  await snapshot('survey-union-mobile');
  await go('zh-hans/counting.html');
  assert.ok(await noOverflow());
  await snapshot('counting-mobile');
  await evaluate("document.getElementById('counting-example').scrollIntoView({behavior:'instant',block:'start'})");
  assert.ok(await noOverflow());
  await snapshot('counting-example-mobile');
  await go('zh-hant/compare.html?group=human_transfer');
  assert.ok(await noOverflow());
  await evaluate("document.getElementById('comparison-panel-scale').scrollIntoView({behavior:'instant',block:'start'})");
  await snapshot('benchmark-comparison-mobile');
  await evaluate("document.getElementById('comparison-view-features').click()");
  assert.ok(await noOverflow());
  pass('Mobile layout and menu','390px homepage, chapter and task pages have no document-level horizontal overflow.');

  await viewport(320,900,true);
  await go('zh-hans/index.html');
  assert.ok(await noOverflow());
  await go('zh-hans/scale-plan.html');
  assert.ok(await noOverflow());
  await go('zh-hans/design.html');
  assert.ok(await noOverflow());
  await go('zh-hans/compare.html');
  assert.ok(await noOverflow());
  await go('zh-hans/readiness.html');
  assert.ok(await noOverflow());
  await go('zh-hans/joint-pilot.html');
  assert.ok(await noOverflow());
  await go('zh-hans/survey-union.html');
  assert.ok(await noOverflow());
  await go('zh-hans/counting.html');
  assert.ok(await noOverflow());
  await viewport(1024,900);
  await go('zh-hant/design.html');
  assert.ok(await noOverflow());
  pass('Small-screen layout','Homepage stays within a 320px viewport.');

  await viewport(1440,1000);
  await cdp.send('Emulation.setScriptExecutionDisabled',{value:true});
  await cdp.send('Page.navigate',{url:new URL('zh-hant/explore/tasks.html',BASE).href});
  await waitFor("document.readyState==='complete'&&document.querySelectorAll('[data-entry]').length===180");
  assert.equal(await evaluate("Array.from(document.querySelectorAll('[data-entry]')).filter(e=>getComputedStyle(e).display!=='none').length"),180);
  assert.ok(await evaluate("document.querySelector('[data-catalogue]').getBoundingClientRect().width>800"),'No-JavaScript reading should use the available content width.');
  await cdp.send('Page.navigate',{url:new URL('zh-hant/compare.html',BASE).href});
  await waitFor("document.readyState==='complete'&&document.querySelectorAll('#comparison-scale tbody tr').length===70");
  assert.equal(await evaluate("Array.from(document.querySelectorAll('[data-comparison-panel]')).filter(panel=>getComputedStyle(panel).display!=='none').length"),4);
  await cdp.send('Page.navigate',{url:new URL('zh-hant/joint-pilot.html',BASE).href});
  await waitFor("document.readyState==='complete'&&document.querySelectorAll('#joint-method-table tbody tr').length===6");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.joint-controls')).display"),'none');
  assert.ok(await evaluate("document.querySelector('#joint-initial-image').complete&&document.querySelector('#joint-initial-image').naturalWidth>0"));
  assert.equal(await evaluate("document.getElementById('joint-dispatch-count').textContent"),'1');
  assert.ok(await noOverflow());
  await cdp.send('Page.navigate',{url:new URL('zh-hant/survey-union.html',BASE).href});
  await waitFor("document.readyState==='complete'&&document.querySelectorAll('[data-union-row]').length===250");
  assert.equal(await evaluate("Array.from(document.querySelectorAll('[data-union-row]')).filter(r=>getComputedStyle(r).display!=='none').length"),250);
  await cdp.send('Page.navigate',{url:new URL('zh-hant/counting.html',BASE).href});
  await waitFor("document.readyState==='complete'&&!!document.querySelector('[data-counting-demo]')");
  assert.equal(await evaluate("document.querySelector('[data-example-count=\"cases\"]').textContent"),'300');
  assert.equal(await evaluate("document.querySelector('[data-counting-metric=\"environments\"]').dataset.countState"),'unknown');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.case-count-control')).display"),'none');
  await cdp.send('Emulation.setScriptExecutionDisabled',{value:false});
  pass('Reading without JavaScript','All 180 task cards, four 70-row comparison tables and the joint pilot default case/results remain readable without scripts.');

  assert.deepEqual(errors,[],'Unexpected browser runtime errors');
  const report={status:'passed',baseURL:BASE,checks,consoleErrors:errors,screenshots:await fs.readdir(screenshots)};
  await fs.writeFile(path.join(root,'verification/browser-checks.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({status:'passed',checks:checks.length,screenshots:report.screenshots},null,2));
}catch(error){
  await fs.writeFile(path.join(root,'verification/browser-checks.json'),JSON.stringify({status:'failed',baseURL:BASE,checks,errors,failure:error.stack},null,2));
  throw error;
}finally{
  cdp?.close();
  try{process.kill(-child.pid,'SIGTERM');}catch{}
  await sleep(400);
  try{process.kill(-child.pid,'SIGKILL');}catch{}
}
