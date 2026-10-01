import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import * as OpenCC from 'opencc-js';
import {renderComparisonPage} from './comparison-page.mjs';
import {renderReadinessPage} from './readiness-page.mjs';
import {renderExecutionPage} from './execution-page.mjs';
import {renderResearchPage} from './research-page.mjs';
import {renderJointPilotPage} from './joint-pilot-page.mjs';
import {renderSurveyUnionPage} from './survey-union-page.mjs';
import {indexUnitLabels,renderCountingOverview,renderEnvironmentNote,renderCountingPage} from './counting-guide.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = path.dirname(ROOT);
const OUT = path.join(ROOT, 'docs');
const CONTENT = path.join(ROOT, 'content');
const config = JSON.parse(await fs.readFile(path.join(ROOT, 'site.config.json'), 'utf8'));
const tc = OpenCC.Converter({ from: 'cn', to: 'twp' });
const sc = OpenCC.Converter({ from: 'twp', to: 'cn' });
const LOCALES = ['zh-hant', 'zh-hans'];
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const jsonSafe = value => JSON.stringify(value).replace(/</g, '\\u003c');
const plain = html => cheerio.load(html).text().replace(/\s+/g, ' ').trim();
const translate = (value, locale) => locale === 'zh-hans' ? sc(tc(String(value))) : tc(String(value));
const relative = (from, target) => path.posix.relative(path.posix.dirname(from), target) || path.posix.basename(target);
const exists = file => fs.access(file).then(() => true, () => false);
const generated = [];
await fs.mkdir(CONTENT, { recursive: true });
await fs.mkdir(OUT, { recursive: true });

async function write(file, content) {
  const target = path.join(OUT, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
  generated.push(file);
}

// Refresh from the local handbook if available. The repository keeps the public
// snapshot, so it can also build independently after checkout on GitHub.
const sourceBook = path.join(PROJECT, 'handbook/ROBOT_USE_BENCHMARK_MASTER_REPORT.html');
if (await exists(sourceBook)) {
  const $ = cheerio.load(await fs.readFile(sourceBook, 'utf8'));
  const sections = [];
  for (const node of $('body > section.chapter').toArray()) {
    const section = $(node).clone();
    const id = section.attr('id');
    if (id === 'reading-guide') continue;
    const heading = section.find('h1').first().text();
    const title = heading.split('｜').slice(1).join('｜') || heading;
    section.find('> .eyebrow, > h1').remove();
    for (const image of section.find('img').toArray()) {
      const img = $(image);
      const src = img.attr('src') || '';
      if (src.startsWith('data:image/png;base64,')) {
        const buffer = Buffer.from(src.split(',')[1], 'base64');
        const name = `figure-${crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 12)}.png`;
        await fs.mkdir(path.join(ROOT, 'static/assets/figures'), { recursive: true });
        await fs.writeFile(path.join(ROOT, 'static/assets/figures', name), buffer);
        img.attr('src', `@assets/figures/${name}`);
      }
    }
    sections.push({ id, title, html: section.html() });
  }
  await fs.writeFile(path.join(CONTENT, 'handbook.json'), JSON.stringify(sections));
  for (const filename of ['taxonomy.json', 'task_registry.json', 'task_families.json', 'ego_observation_probes.json', 'metrics_catalogue.json', 'literature_snapshot.json', 'design_statistics.json']) {
    await fs.copyFile(path.join(PROJECT, filename), path.join(CONTENT, filename));
  }
  await fs.mkdir(path.join(OUT, 'downloads'), { recursive: true });
  await fs.copyFile(path.join(PROJECT, 'handbook/ROBOT_USE_BENCHMARK_MASTER_REPORT.pdf'), path.join(OUT, 'downloads/full-report-zh-hant.pdf'));
  const newestPdf=path.join(PROJECT,'handbook/current/ROBOT_USE_BENCHMARK_CURRENT_REPORT_V0_7.pdf');
  const currentPdf=await exists(newestPdf)?newestPdf:path.join(PROJECT,'handbook/current/ROBOT_USE_BENCHMARK_CURRENT_REPORT_V0_5.pdf');
  if(await exists(currentPdf))await fs.copyFile(currentPdf,path.join(OUT,'downloads/current-report-zh-hant.pdf'));
}

const readJSON = async file => JSON.parse(await fs.readFile(path.join(CONTENT, file), 'utf8'));
const [sections, taxonomy, tasks, families, probes, metrics, originalPapers, statistics] = await Promise.all([
  'handbook.json', 'taxonomy.json', 'task_registry.json', 'task_families.json',
  'ego_observation_probes.json', 'metrics_catalogue.json', 'literature_snapshot.json', 'design_statistics.json'
].map(readJSON));
const RESEARCH_DIR=path.join(CONTENT,'literature_refresh');
const [literatureAdditions,researchStats,literatureLineage]=await Promise.all(
  ['literature_additions.json','literature_refresh_statistics.json','literature_lineage.json']
    .map(async name=>JSON.parse(await fs.readFile(path.join(RESEARCH_DIR,name),'utf8'))));
const papers=[...originalPapers,...literatureAdditions];
const SCALE_DIR = path.join(CONTENT, 'scale_first');
const [scalePlan, sourceRecords, sourceReports, sourceStats] = await Promise.all([
  'scale_first_plan.json', 'native_source_inventory.json', 'source_extraction_report.json', 'inventory_statistics.json'
].map(async name => JSON.parse(await fs.readFile(path.join(SCALE_DIR, name), 'utf8'))));
const scaleSpecHTML = await fs.readFile(path.join(SCALE_DIR, 'SCALE_FIRST_SPEC_V0_3.html'), 'utf8');
const scaleAuditHTML = await fs.readFile(path.join(SCALE_DIR, 'SOURCE_INVENTORY_REPORT.html'), 'utf8');
const DESIGN_DIR = path.join(CONTENT, 'overall_design');
const [overallPlan, overallSpecHTML] = await Promise.all([
  fs.readFile(path.join(DESIGN_DIR, 'overall_design_plan.json'), 'utf8').then(JSON.parse),
  fs.readFile(path.join(DESIGN_DIR, 'OVERALL_DESIGN_V0_4.html'), 'utf8')
]);
const COMPARISON_DIR = path.join(CONTENT, 'benchmark_comparison');
const comparisonModel = JSON.parse(await fs.readFile(path.join(COMPARISON_DIR, 'benchmark_matrix.json'), 'utf8'));
const READINESS_DIR = path.join(CONTENT, 'readiness');
const readinessModel = JSON.parse(await fs.readFile(path.join(READINESS_DIR, 'readiness_audit.json'), 'utf8'));
const EXECUTION_DIR = path.join(CONTENT, 'execution');
const executionModel = JSON.parse(await fs.readFile(path.join(EXECUTION_DIR, 'execution_report.json'), 'utf8'));
const implementationModel = JSON.parse(await fs.readFile(path.join(CONTENT, 'implementation/implementation_progress.json'), 'utf8'));
const comparisonStats={...readinessModel.statistics,
  comparison_prior_works:implementationModel.comparison_evidence.prior_works,
  domain_matrix:implementationModel.comparison_evidence.domain_matrix,
  feature_matrix:implementationModel.comparison_evidence.feature_matrix};
const iterationHTML=await fs.readFile(path.join(CONTENT,'implementation/DESIGN_ITERATION_V0_5.html'),'utf8');
const currentPDF=JSON.parse(await fs.readFile(path.join(CONTENT,'implementation/current_report.json'),'utf8'));
const JOINT_DIR=path.join(CONTENT,'joint_pilot');
const [jointReport,jointDemos,jointDownload]=await Promise.all(
  ['pilot_report.json','demo_cases.json','download_info.json'].map(async n=>JSON.parse(await fs.readFile(path.join(JOINT_DIR,n),'utf8'))));
const UNION_DIR=path.join(CONTENT,'survey_union');
const [unionStats,unionRegistry,unionSources,unionAdditions,unionExtensions]=await Promise.all(
  ['union_statistics.json','survey_registry.json','source_summaries.json','source_additions.json','extension_examples.json']
    .map(async n=>JSON.parse(await fs.readFile(path.join(UNION_DIR,n),'utf8'))));
const unionSpecHTML=await fs.readFile(path.join(UNION_DIR,'UNION_FIRST_DESIGN_V0_7.html'),'utf8');
const COUNTING_DIR=path.join(CONTENT,'counting');
const countingContract=JSON.parse(await fs.readFile(path.join(COUNTING_DIR,'counting_contract.json'),'utf8'));
const browseSources=[...sourceReports,...unionSources.filter(s=>['vima','arnold','coin_video','crosstask'].includes(s.source_id)).map(s=>({
  id:s.source_id,work:s.name,resolved_repo:s.repositories[0],commit:s.commits[0],role:'additional_task_source',
  record_count:s.records,counts_by_unit:s.native_units
}))];
const newUnitLabels={native_task_template:'原生任務模板',native_task_class:'原生任務類別',instructional_activity_definition:'人類程序活動定義'};
const browseRecords=[...sourceRecords,...unionAdditions.map(r=>({
  ...r,anchor_id:'native-'+crypto.createHash('sha256').update(r.record_id).digest('hex').slice(0,16),
  source_work:unionSources.find(s=>s.source_id===r.source_id).name,
  native_unit_zh:newUnitLabels[r.native_unit]||r.native_unit,
  native_aliases_or_variants:[],asset_reference_paths:[],native_metadata:{registration_line:r.definition_line},
  additional_search:[r.native_domain,r.native_family].filter(Boolean).join(' ')
}))];
const sourceInfoById = Object.fromEntries(sourceReports.map(source => [source.id, source]));
const assetHasher=crypto.createHash('sha256');
assetHasher.update(JSON.stringify({config,scalePlan,overallPlan,overallSpecHTML,comparisonModel,readinessModel,executionModel,implementationModel,researchStats,iterationHTML,currentPDF,jointReport,jointDemos,jointDownload,unionStats,unionRegistry,unionSources,unionExtensions,unionSpecHTML,sourceStats,sourceReports,sections,tasks,papers}));
assetHasher.update(JSON.stringify(countingContract));
for(const name of ['scripts/build.mjs','scripts/comparison-page.mjs','scripts/readiness-page.mjs','scripts/execution-page.mjs','scripts/research-page.mjs','scripts/joint-pilot-page.mjs','static/assets/joint-pilot.js','static/assets/site.css','static/assets/site.js','static/assets/native-browser.js','static/assets/comparison.js','static/assets/comparison.css']){
  assetHasher.update(await fs.readFile(path.join(ROOT,name)));
}
for(const name of ['scripts/survey-union-page.mjs','static/assets/survey-union.js','static/assets/survey-union.css'])assetHasher.update(await fs.readFile(path.join(ROOT,name)));
for(const name of ['scripts/counting-guide.mjs','static/assets/counting.js','static/assets/counting.css'])assetHasher.update(await fs.readFile(path.join(ROOT,name)));
const assetRevision=assetHasher.digest('hex').slice(0,12);
const sectionById = Object.fromEntries(sections.map(section => [section.id, section]));
const taskById = Object.fromEntries(tasks.map(record => [record.scenario_id, record]));
const familyById = Object.fromEntries(families.map(record => [record.family_id, record]));
const probeById = Object.fromEntries(probes.map(record => [record.probe_id, record]));
const metricById = Object.fromEntries(metrics.map(record => [record.metric_id, record]));
const paperById = Object.fromEntries(papers.map(record => [record.id, record]));
const chapters = sections.filter(section => /^c\d{2}$/.test(section.id));
const groups = {
  families: sections.filter(s => s.id === 'appA' || s.id.startsWith('familypage-')),
  tasks: sections.filter(s => s.id === 'appB' || s.id.startsWith('catalogue-')),
  probes: sections.filter(s => s.id === 'appC' || s.id.startsWith('probes-')),
  metrics: sections.filter(s => s.id === 'appD' || s.id.startsWith('metrics-')),
  axes: sections.filter(s => s.id === 'appE' || s.id.startsWith('axes-') || s.id.startsWith('coverage-') || s.id === 'physics-dictionary'),
  comparison: sections.filter(s => ['appF','libero-audit','comparison-versions'].includes(s.id)),
  literature: sections.filter(s => s.id === 'appG' || s.id.startsWith('bib-')),
  methods: sections.filter(s => ['appH','search-record','corpus-extra','legacy-examples','data-dictionary','planning-schema','document-provenance'].includes(s.id))
};
const groupRoutes = {
  families:'explore/families.html', tasks:'explore/tasks.html', probes:'explore/probes.html',
  metrics:'explore/metrics.html', axes:'appendices/axes.html', comparison:'appendices/comparison.html',
  literature:'library.html', methods:'appendices/methods.html'
};
const summaries = {
  c01:['全面收集以前相關benchmark，整理其領域、任務與規則。','像Survey一樣分類並建立完整來源任務聯集，再擴充任務和規則。','來源目錄與可執行子集分開；目前主線為v0.7，工程試作保留附錄。'],
  c02:['文獻分類回答「研究測什麼」，任務規格回答「機器人要做什麼」。','以摺毛巾走過家族、任務、實例、測例與一次執行。','問答、預測、規劃和物理完成需要不同證據。'],
  c03:['Domain、family、task spec、instance、case、trial 分六層報告。','v0.4 新增 task–context 與 execution bindings，分開估計覆蓋和工程量。','同一任務跨場域、換機體或重跑，不會自動增加全球 G2 數量。'],
  c04:[`${papers.length} 篇來源分成十二個主分類；本次新增82篇完整摘要審閱。`,'文獻篇數比例不能直接當作領域缺口或出題比例。','書目、摘要閱讀、全文查核和程式重現的證據深度分開。'],
  c05:['先保留原作者單位，再對齊 domain、task、case 和資料量。','既有任務、資產和評分器可復用，但要重新審核相容性。','影片到動作、摺衣、恢復都有先例，新貢獻需要實驗支持。'],
  c06:['v0.4 為 12 個核心場域各提出至少 100 個有效任務綁定、8 個家族、3 類機制的支撐目標。','共同 coverage cell 使用場域 × 家族 × 必需機制；每格需要實際任務與實例證據。','材料、觀測、機體、學習設定各自記錄；原 180 個藍圖是設計種子。'],
  c07:['先以原始活動或錄製 session 分組，再產生 clips 與 QA。','示範與 robot 的配對可能只有共同目標，不能假設幾何一致。','資訊不足的題目應補線索或允許詢問，不能當成難題。'],
  c08:['終態成功、完整合規成功、配對目標成功分開報告。','恢復要同時列全 episode、擾動施加率與條件式成功。','模型在相同資訊、控制、資料和預算下比較。'],
  c09:['六個具體案例展示目標、證據、近失敗和資料前提。','涵蓋摺毛巾、記憶取物、配送、協作、流體和數位工具。','案例中的尺寸、容差與接口仍是設計，尚未校準。'],
  c10:['難度屬於某個實例加上完整評測條件，不屬於論文名稱。','十維人工向量是設計註記；經驗難度需要固定 agent panel。','全模型失敗時，先排除不可解任務和錯誤評分器。'],
  c11:['v0.4 同時驗收任務數與有效覆蓋；2,000–3,000 個 G2 是初始目標，並非上限。','全球任務數、場域綁定與執行綁定各有數量；後兩者增加不等於新增任務。','預算從執行綁定、有效初態、合法條件和 policy repeats 計算；原 100–140 預算屬歷史方案。'],
  c12:['先建立 registry、instance builder、adapter、evaluator 與結果紀錄。','共同 API 不代表不同模擬器有相同動力學。','本網站提供公開研究文件；正式評測和平台代跑仍待實作。'],
  c13:['v0.4 先固定共同分類、參照集與廣度配額，再驗證跨 backend 閉環。','每批 250／500／1,000 都同時檢查數量、場域、家族、機制、材料與機體支撐。','規模與廣度共同達標後凍結主實驗；原 24 週示例不作本版承諾。'],
  c14:['所有數量統一區分文獻、設計、規劃與實際驗證。','48 類是作者分組，180 個是藍圖，24 個 Ego 題型另列。','正式 backend、資料與測例仍需按 milestones 建立。']
};
const descriptions = {
  c01:'計畫的研究問題、已完成內容、當前狀態與第一個實作目標。',
  c02:'用摺毛巾把 taxonomy、ontology 和評測流程講清楚。',
  c03:'讓任務數、題數、資料量與執行量能公平比較。',
  c04:'從 VLOG、Ego 與預測，讀到操作和世界模型的文獻地圖。',
  c05:'比較最近 benchmark，釐清可復用資源與新的研究價值。',
  c06:'場域、任務家族、物理材料和八個評測模組的完整設計。',
  c07:'人類示範如何配對、標註、切分，避免不合理的測例。',
  c08:'成功、恢復、基線、對照實驗與不確定性怎麼計算。',
  c09:'六張詳細案例，說清楚目標、資料與判分證據。',
  c10:'從十維設計向量，到固定模型群下的經驗難度。',
  c11:'領域、情境、測例與算力預算，使用不同粒度分開估算。',
  c12:'把設計變成可執行、可評分與可重現的系統。',
  c13:'從 S0 來源盘點到 S6 發布，任務規模與有效廣度共同驗收。',
  c14:'整理版本差異、計數更正與尚待實作期決定的項目。'
};
const timeFor = section => Math.max(3, Math.ceil(plain(section.html).length / 600));
const chapterRoute = section => `chapters/${section.id.slice(1)}.html`;
const anchors = {};
function register(section, route) {
  anchors[section.id] = `${route}#${section.id}`;
  const $ = cheerio.load(section.html);
  $('[id]').each((_, node) => { anchors[$(node).attr('id')] = `${route}#${$(node).attr('id')}`; });
}
chapters.forEach(section => register(section, chapterRoute(section)));
for (const [key, items] of Object.entries(groups)) items.forEach(section => register(section, groupRoutes[key]));
for (const cid of Object.keys(taxonomy.application_contexts)) anchors[`catalogue-${cid}`] = `explore/tasks.html?domain=${cid}`;
for (const xid of Object.keys(taxonomy.observation_diagnostic_strata)) anchors[`probes-${xid}`] = `explore/probes.html?stratum=${xid}`;
for (const tid of Object.keys(taxonomy.tracks)) anchors[`metrics-${tid}`] = `explore/metrics.html?track=${tid}`;
for (const code of [...new Set(papers.map(p => p.primary_category_code))]) anchors[`bib-${code}`] = `library.html?category=${code}`;

const docRewrites = [
  ['使用者明確要求', '研究主目標'],
  ['使用者表示資源充足並希望推進上線，但沒有確認人數、GPU 數、模擬器、機體、控制介面、人類影片取得方式或 hosting。',
   '人數、GPU 數、模擬器、機體、控制介面與人類影片取得方式尚未定案；研究文件由 GitHub Pages 公開提供。'],
  ['離線網站與文件已備；公開部署／正式排行榜未完成', '研究網站與文件公開提供；正式評測服務與排行榜未完成'],
  ['已有本機離線預覽，尚未公開部署', '研究文件已提供網站閱讀；正式評測服務尚未推出'],
  ['正式排行榜或公開部署', '正式評測排行榜或平台代跑服務'],
  ['正式排行榜和公開部署', '正式評測排行榜和平台代跑服務'],
  ['使用者已確認目前只有模擬', '目前研究範圍只有模擬'],
  ['使用者確認先做模擬benchmark', '本計畫先做模擬 benchmark'],
  ['使用者原先的「eco-predix」', '原始研究需求中的「eco-predix」'],
  ['本次整理 PDF 所需的確認', '閱讀本網站所需的前提'],
  ['使用者表示資源充足', '資源規劃仍需量化'],
  ['使用者已確認', '目前已確認'],
  ['這份 PDF', '完整報告'], ['本 PDF', '完整報告'], ['本冊', '本報告'],
  ['相邻 build_manifest.json', '原始整理版的 build_manifest.json']
];
function publicText(value) {
  let output = value;
  for (const [from, to] of docRewrites) output = output.replaceAll(from, to);
  return output;
}
function convertDOM($, locale) {
  function visit(node) {
    if (node.type === 'text') node.data = translate(publicText(node.data), locale);
    if (node.type === 'tag' && !['script','style'].includes(node.name)) {
      for (const key of ['alt','title','aria-label','placeholder']) if (node.attribs[key]) node.attribs[key] = translate(node.attribs[key], locale);
    }
    if (!['script','style'].includes(node.name)) node.children?.forEach(visit);
  }
  $.root().contents().each((_, node) => visit(node));
}
function transform(html, locale, route, prefix='section') {
  const current = `${locale}/${route}`;
  const $ = cheerio.load(html, {}, false);
  $('a[href]').each((_, node) => {
    const link = $(node);
    const href = link.attr('href');
    if (href.startsWith('#')) {
      const id = href.slice(1);
      if (anchors[id]) {
        const target = anchors[id];
        const [targetRoute, suffix=''] = target.split(/(?=[?#])/s);
        // Keep queries and hashes intact; route resolution only applies to the pathname.
        const mark = target.search(/[?#]/);
        const pathname = mark < 0 ? target : target.slice(0, mark);
        const tail = mark < 0 ? '' : target.slice(mark);
        link.attr('href', relative(current, `${locale}/${pathname}`) + tail);
      }
    } else if (/^https?:/.test(href)) {
      link.attr('target', '_blank').attr('rel', 'noopener noreferrer');
    }
  });
  $('img[src]').each((_, node) => {
    const image = $(node);
    if (image.attr('src').startsWith('@assets/')) image.attr('src', relative(current, image.attr('src').slice(1)));
    image.attr('loading','lazy').attr('decoding','async');
  });
  $('table').each((_, node) => {
    $(node).wrap('<div class="table-scroll" tabindex="0" role="region" aria-label="資料表，可水平捲動"></div>');
  });
  let count = 0;
  $('h2,h3').each((_, node) => { if (!$(node).attr('id')) $(node).attr('id', `${prefix}-${++count}`); });
  convertDOM($, locale);
  return $.html();
}

function icon(name) {
  const paths = {
    brand:'<path d="M4 6h5v5H4zM15 6h5v5h-5zM4 17h5v5H4zM15 17h5v5h-5z"/><path d="M9 8.5h6M6.5 11v6M17.5 11v6M9 19.5h6" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  };
  return `<svg viewBox="0 0 24 26" aria-hidden="true" fill="currentColor">${paths[name] || paths.search}</svg>`;
}
const t = (value, locale) => escape(translate(value, locale));
function routeLink(route, target, locale) { return relative(`${locale}/${route}`, `${locale}/${target}`); }
const chapterLink = (id, route, locale) => routeLink(route, `chapters/${id}.html`, locale);
const pdfHref = (route, locale) => relative(`${locale}/${route}`, 'downloads/current-report-zh-hant.pdf');
const historicalPdfHref = (route, locale) => relative(`${locale}/${route}`, 'downloads/full-report-zh-hant.pdf');
function navHTML(route, locale) {
  const links = [
    ['survey-union.html','Benchmark 總庫',route==='survey-union.html'],
    ['design.html','整體設計',route==='design.html'],
    ['compare.html','詳細比較',route==='compare.html'||route==='scale-plan.html'],
    ['native-tasks.html','原作索引',route==='native-tasks.html'],
    ['counting.html','計數與環境',route==='counting.html'],
    ['library.html','文獻地圖',route==='library.html'],
  ];
  return `<header class="site-header"><div class="wrap header-inner">
  <a class="brand" href="${routeLink(route,'index.html',locale)}"><span class="brand-mark">${icon('brand')}</span><span>Robot-use Benchmark<small>RESEARCH ATLAS</small></span></a>
  <nav class="primary-nav" id="primary-nav" aria-label="${t('主要導覽',locale)}">${links.map(([target,label,active])=>`<a href="${routeLink(route,target,locale)}"${active?' class="active" aria-current="page"':''}>${t(label,locale)}</a>`).join('')}<a class="mobile-search" href="${routeLink(route,'search.html',locale)}">${t('全文搜尋',locale)}</a></nav>
  <div class="header-tools"><button class="search-trigger js-only" aria-label="${t('搜尋整個網站',locale)}" aria-haspopup="dialog">${icon('search')}<kbd>/</kbd></button>
  <div class="language-switch" aria-label="${t('語言',locale)}">${LOCALES.map(lang=>`<a href="${relative(`${locale}/${route}`,`${lang}/${route}`)}" data-locale="${lang}" hreflang="${lang==='zh-hant'?'zh-Hant':'zh-Hans'}"${lang===locale?' aria-current="true"':''}>${lang==='zh-hant'?'繁體':'简体'}</a>`).join('')}</div>
  <button class="menu-button" aria-controls="primary-nav" aria-expanded="false">${t('選單',locale)}</button></div></div></header>`;
}
function footerHTML(route, locale) {
  return `<footer class="site-footer"><div class="wrap"><div class="footer-top"><div><strong>Robot-use Benchmark</strong><br>${t('前作總庫 → Survey分類 → 任務聯集 → 任務與規則擴充。',locale)}</div>
  <div class="footer-links"><a href="${routeLink(route,'survey-union.html',locale)}">${t('Benchmark總庫',locale)}</a><a href="${routeLink(route,'design.html',locale)}">${t('目前主設計',locale)}</a><a href="${routeLink(route,'research.html',locale)}">${t('文獻與分類',locale)}</a><a href="${routeLink(route,'counting.html',locale)}">${t('計數與環境定義',locale)}</a><a href="${pdfHref(route,locale)}">${t('完整報告 PDF · v0.7快照',locale)}</a><a href="${historicalPdfHref(route,locale)}">${t('歷史 PDF · v0.2',locale)}</a><a href="https://github.com/${config.repository}" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></div>
  <p class="footer-note">${t(`主設計v0.7 · ${unionStats.paper_records}篇書目、${unionStats.benchmark_or_eval_resource_records}條已登記評測來源、${unionStats.total_source_records.toLocaleString('en-US')}條原作索引。任務環境與樣本總量待整理；完整搜集、共同分類與任務清單持續補齊；目錄收錄與模擬執行分開。原生與小型聯合試作保留為工程附錄。`,locale)}</p></div></footer>`;
}
const strings = {
  copied:'已複製連結',copyFallback:'請複製瀏覽器網址列的連結',searchMatches:'符合的結果：',
  searchLoading:'正在載入搜尋索引…',searchLoadFailed:'搜尋索引暫時未能載入，請稍後再試；章節與資料庫仍可直接閱讀。',
  searchHint:'可搜尋章節、物件、論文名称或 ID，例如「摺衣」「记忆」「SC-H15」「Ego4D」。',
  noSearch:'沒有找到結果，試試較短的關鍵字或 ID。',showing:'顯示',records:'筆',allShown:'已顯示全部',
  paginate:'分頁顯示',showAll:'顯示全部',shareResults:'複製目前篩選的連結',continueReading:'繼續上次閱讀',
  demoA:'相同毛巾，目標 A 沿長軸摺疊。核對邊緣配對、層次、形狀與穩定釋放。',
  demoB:'更換示範，目標 B 沿短軸摺疊。場景不變，行為必須跟隨新的目標。',
  kinds:{chapter:'章節',task:'情境藍圖',family:'任務家族',paper:'文獻',probe:'Ego 觀測題型',metric:'評測指標',reference:'參考資料',native:'原生來源紀錄'}
};
function translateObject(value, locale) {
  if (typeof value==='string') return translate(value,locale);
  if (Array.isArray(value)) return value.map(item=>translateObject(item,locale));
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,translateObject(item,locale)]));
}
const allPageRecords = [];
function shell({route,locale,title,description,body,kind='page'}) {
  const current = `${locale}/${route}`;
  const canonical = `${config.siteUrl}/${current}`;
  const jsConfig={locale,route,title:translate(title,locale),kind,localeRoot:relative(current,`${locale}/index.html`).replace(/index\.html$/,''),searchIndexURL:relative(current,`assets/search-${locale}.js`)+`?v=${assetRevision}`,text:translateObject(strings,locale)};
  allPageRecords.push({route,locale,title:translate(title,locale),file:current});
  return `<!doctype html><html lang="${locale==='zh-hant'?'zh-Hant':'zh-Hans'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t(title,locale)} · Robot-use Benchmark</title>
  <meta name="description" content="${t(description,locale)}"><meta name="theme-color" content="#146e5b"><link rel="canonical" href="${canonical}">
  ${LOCALES.map(lang=>`<link rel="alternate" hreflang="${lang==='zh-hant'?'zh-Hant':'zh-Hans'}" href="${config.siteUrl}/${lang}/${route}">`).join('')}
  <meta property="og:type" content="website"><meta property="og:title" content="${t(title,locale)} · Robot-use Benchmark"><meta property="og:description" content="${t(description,locale)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${config.siteUrl}/assets/social-card.png"><meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${relative(current,'assets/favicon.svg')}" type="image/svg+xml"><link rel="stylesheet" href="${relative(current,'assets/site.css')}?v=${assetRevision}">
  <link rel="stylesheet" href="${relative(current,'assets/survey-union.css')}?v=${assetRevision}">
  <link rel="stylesheet" href="${relative(current,'assets/counting.css')}?v=${assetRevision}">
${route==='compare.html'?`<link rel="stylesheet" href="${relative(current,'assets/comparison.css')}?v=${assetRevision}"><script defer src="${relative(current,'assets/comparison.js')}?v=${assetRevision}"></script>`:''}
  <script>document.documentElement.classList.add('js');</script><script>window.ROBOT_SITE=${jsonSafe(jsConfig)};</script>
  ${route==='native-tasks.html'?`<script defer src="${relative(current,'assets/native-source-data.js')}?v=${assetRevision}"></script><script defer src="${relative(current,'assets/native-browser.js')}?v=${assetRevision}"></script>`:''}<script defer src="${relative(current,'assets/site.js')}?v=${assetRevision}"></script></head>
  <body><a class="skip-link" href="#main-content">${t('跳至主要內容',locale)}</a>${navHTML(route,locale)}${body}${footerHTML(route,locale)}
  <dialog class="search-dialog" id="global-search" aria-label="${t('搜尋整個網站',locale)}"><div class="dialog-search-head">${icon('search')}<input id="global-search-input" type="search" autocomplete="off" placeholder="${t('搜尋章節、任務或文獻…',locale)}" aria-label="${t('關鍵字',locale)}" aria-describedby="global-search-help"><button id="close-search" aria-label="${t('關閉搜尋',locale)}">Esc</button></div><p class="search-help" id="global-search-help" aria-live="polite"></p><div class="search-results" id="global-search-results"></div></dialog>
  <div id="toast" class="toast" role="status" hidden></div></body></html>`;
}
const breadcrumb = (label,route,locale) => `<div class="breadcrumb"><a href="${routeLink(route,'index.html',locale)}">${t('首頁',locale)}</a><span>/</span><span>${t(label,locale)}</span></div>`;
function head(title,description,route,locale,extra='') {
  return `<div class="page-head">${breadcrumb(title,route,locale)}<div class="eyebrow">RESEARCH ATLAS</div><h1>${t(title,locale)}</h1><p class="lede">${t(description,locale)}</p>${extra}</div>`;
}
function scopeNotice(route,locale){
  return `<div class="scope-notice"><b>${t('目前主線：前作聯集與任務／規則擴充',locale)}</b><p>${t(`完整來源先收集、分類與連接。現有${unionStats.benchmark_or_eval_resource_records}條已登記評測來源、${unionStats.total_source_records.toLocaleString('en-US')}條原作索引；任務環境規格另行對齊，目錄收錄不以本機先跑通為條件。舊2,000–3,000任務和配額作容量參考，完整聯集與擴充規格決定實際規模。`,locale)}</p><a href="${routeLink(route,'survey-union.html',locale)}">${t('查看總庫、分布、任務清單與規則',locale)} →</a> · <a href="${routeLink(route,'design.html',locale)}#union-first-design">${t('閱讀v0.7主設計',locale)} →</a></div>`;
}
function currentExecutionNote(route,locale){
  return `<section class="current-execution-note"><h2 id="current-native-execution">${t('目前研究與整合進度',locale)}</h2><p>${t(`總目錄已接起250篇書目、143條已登記評測來源及5,308條原作索引。新增VIMA17個模板、ARNOLD8個任務類別、COIN180和CrossTask83個人類程序定義，下一步逐來源补齐原生清單、共同分類與規則。`,locale)}</p><p>${t('50個Meta-World任務和小型RGB／工具／robot試作保留作工程附錄，支援後续執行整合。目錄範圍由前作與擴充規格決定。',locale)}</p><p><a href="${routeLink(route,'survey-union.html',locale)}">${t('完整來源與任務聯集',locale)} →</a> · <a href="${routeLink(route,'execution.html',locale)}">${t('工程附錄：原生執行',locale)} →</a></p></section>`;
}
function designSections(numbers,locale,route,prefix){
  const $=cheerio.load(overallSpecHTML,{},false);const result=[];
  let keep=false;
  $.root().contents().each((_,node)=>{
    if(node.type==='tag'&&node.name==='h2'){
      const n=Number(($(node).text().match(/^(\d+)\./)||[])[1]);
      keep=numbers.includes(n);
    }
    if(keep)result.push($.html(node));
  });
  return transform(result.join(''),locale,route,prefix);
}
function capacityExplorer(locale){
  const c=overallPlan.capacity_example;
  const controls=[
    ['instances','每執行綁定的有效初態',[1,3,5,10,20],c.g3_per_execution_binding],
    ['conditions','每實例的合法條件組合',[1,2,4],c.information_conditions*c.intervention_conditions],
    ['repeats','每固定測例的執行次數',[1,3,5],c.policy_repeats_per_fixed_case],
    ['methods','完整相容的方法數',[1,4,8],c.example_fully_compatible_models]
  ];
  const outputs=[
    ['instances','G3 實例配置',c.planned_g3_assignments],
    ['cases','G4 合法測例配置',c.planned_g4_assignments],
    ['per-method','每個方法的執行量',c.planned_rollouts_per_fully_compatible_model],
    ['total','所有方法的總執行量',c.planned_main_rollouts]
  ];
  return `<section class="capacity-explorer" id="capacity-explorer" data-capacity-bindings="${c.execution_bindings}">
    <h2>${t('互動估算：做廣之後，需要跑多少？',locale)}</h2>
    <p>${t('純規劃示例：固定 2,400 種獨立任務、2,800 個場域綁定、3,000 個執行綁定。調整下列條件，獨立任務數仍是 2,400。',locale)}</p>
    <div class="capacity-controls js-only">${controls.map(([id,label,values,value])=>`<label for="capacity-${id}">${t(label,locale)}<select id="capacity-${id}" data-capacity-input="${id}">${values.map(v=>`<option value="${v}"${v===value?' selected':''}>${v}</option>`).join('')}</select></label>`).join('')}</div>
    <div class="capacity-results" aria-live="polite" aria-atomic="true">${outputs.map(([id,label,value])=>`<div><strong data-capacity-output="${id}">${value.toLocaleString('en-US')}</strong><span>${t(label,locale)}</span></div>`).join('')}</div>
    <p class="capacity-note">${t('4 種條件可代表 2 種資訊 × 2 種介入；只有合法且適用時才能相乘。假設所有方法能執行全部綁定。這些是預算，不是已完成的實驗；實際成本由 pilot 量測。',locale)}</p>
  </section>`;
}
function overallDesignPage(locale){
  const route='design.html';
  const spec=cheerio.load(overallSpecHTML,{},false);spec('h1').remove();
  spec('h2').each((_,node)=>{const num=(spec(node).text().match(/^(\d+)\./)||[])[1];if(num)spec(node).attr('id',`design-section-${num}`);});
  const content=transform(`<section id="overall-design-spec">${spec.html()}</section>`,locale,route,'overall');
  const latest=cheerio.load(iterationHTML,{},false);latest('h1').remove();latest('h2').each((i,node)=>latest(node).attr('id',`iteration-section-${i+1}`));
  const latestContent=transform(`<section id="current-design-update">${latest.html()}</section>`,locale,route,'iteration');
  const current=cheerio.load(unionSpecHTML,{},false);current('h1').remove();current('h2').each((i,node)=>current(node).attr('id',`union-design-${i+1}`));
  const unionContent=transform(`<section id="union-first-design">${current.html()}</section>`,locale,route,'union-design');
  const parsed=cheerio.load(unionContent);const headings=parsed('h2').toArray().map(n=>({id:parsed(n).attr('id'),title:parsed(n).text()}));
  const nav=chapterNav(route,locale);const dl=relative(`${locale}/${route}`,'downloads/survey-union/');
  const steps=[['01','全面來源','前作、版本、原生領域和task清單'],['02','Survey與聯集','共同分類、來源連結與多粒度規模'],['03','任務／規則擴充','目標、約束、程序和工作組合'],['04','分層整合與評測','目錄保持完整，執行子集另列']];
  const body=`<div class="reading-progress" aria-hidden="true"></div><div class="reader-layout"><aside class="chapter-sidebar">${nav}</aside><main class="reader" id="main-content"><details class="mobile-chapter-nav"><summary>${t('章節與資料庫',locale)}</summary>${nav}</details>${breadcrumb('目前主設計',route,locale)}
  <div class="eyebrow">SURVEY → TASK UNION → EXTENSIONS · v0.7</div><h1>${t('完整前作聯集，加上可擴充的任務與規則。',locale)}</h1><p class="lede">${t('先全面收集既有benchmark，再像survey一樣整理領域、任務和規則。整合互補來源，擴充新的目標與流程；可執行子集是後續整合工作的進度。',locale)}</p>
  <div class="page-meta"><span>2026-09-29</span><span class="pill green">${t('目前主設計 v0.7',locale)}</span><span>${t('來源含模擬、實體與人類影片；執行以模擬為主',locale)}</span></div>
  <div class="chapter-summary"><div class="label">${t('研究主線',locale)}</div><ul><li>${t('完整蒐集前作，保留各benchmark的原生領域、任務定義、規則與版本。',locale)}</li><li>${t('以Survey分類與任務聯集取得更大、更廣的覆蓋，再逐層量化增量。',locale)}</li><li>${t('允許擴充任務目標、規則、程序與組合；目錄收錄不以本機先跑通為條件。',locale)}</li></ul></div>
  <ol class="design-flow">${steps.map(([id,title,text])=>`<li><small>${id}</small><b>${t(title,locale)}</b><span>${t(text,locale)}</span></li>`).join('')}</ol>
  <div class="cta-row"><a class="button" href="${routeLink(route,'survey-union.html',locale)}">${t('看Benchmark總庫與分類',locale)} →</a><a class="button secondary" href="#union-design-6">${t('任務與規則如何擴充',locale)} ↓</a></div>
  ${renderEnvironmentNote(locale,{t,routeLink},route)}
  <p class="counting-reference-note">${t('2026-10-01補充：來源索引、任務環境定義、場景與樣本各自計數；全庫環境數和原始樣本總量待整理。下方保留v0.7的來源聯集主設計。',locale)}</p>
  <div class="prose">${unionContent}</div>
  <div class="reader-actions"><a class="text-button" href="${dl}/UNION_FIRST_DESIGN_V0_7.md" download>${t('下载目前主設計',locale)}</a><a class="text-button" href="${dl}/extension_grammar.json" download>${t('任務規則語法',locale)}</a><a class="text-button" href="${pdfHref(route,locale)}">${t(`${currentPDF.pages}頁完整PDF`,locale)}</a><button class="text-button print-page">${t('列印本頁',locale)}</button></div>
  <details class="union-legacy" id="historical-design-plans"><summary>${t('歷史設計與容量模型：v0.4／v0.5（保留原引用）',locale)}</summary><p class="source-note">${t('以下保留舊預算、配額和當時的工程順序，供查閱與比較；目前主線以上方v0.7為準。',locale)}</p><div class="prose">${latestContent}${content}</div>${capacityExplorer(locale)}</details>
  </main><aside class="on-this-page"><div class="sidebar-label">${t('本頁內容',locale)}</div>${headings.map(h=>`<a href="#${escape(h.id)}">${escape(h.title)}</a>`).join('')}<a href="#historical-design-plans">${t('歷史設計與容量模型',locale)}</a></aside></div>`;
  return shell({route,locale,title:'主設計v0.7：前作聯集、Survey分類與任務規則擴充',description:'以全面來源收集、任務分類、聯集和可擴充規則建立大而廣的benchmark；來源目錄與可執行子集分開。',body,kind:'design'});
}
function scalePlanPage(locale){
  const route='scale-plan.html';
  const spec=cheerio.load(scaleSpecHTML,{},false);spec('h1').remove();
  const audit=cheerio.load(scaleAuditHTML,{},false);audit('h1').remove();
  const content=transform(`<section id="scale-plan-spec">${spec.html()}</section><section id="source-audit"><h2>來源盤點：已做到哪裡</h2>${audit.html()}</section>`,locale,route,'scale');
  const $=cheerio.load(content);
  const headings=$('h2').toArray().map(node=>({id:$(node).attr('id'),title:$(node).text()}));
  const downloads=relative(`${locale}/${route}`,'downloads/scale-first/');
  const nav=chapterNav(route,locale);
  const body=`<div class="reader-layout"><aside class="chapter-sidebar" aria-label="${t('章節導覽',locale)}">${nav}</aside><main class="reader" id="main-content">
  <details class="mobile-chapter-nav"><summary>${t('章節與資料庫',locale)}</summary>${nav}</details>${breadcrumb('規模與比較',route,locale)}<div class="eyebrow">SCALE &amp; SOURCE EVIDENCE</div><h1>${t('規模比較、完整來源與查核證據。',locale)}</h1>
  <p class="lede">${t('這裡保留 v0.3 規模方案和來源盤點證據。v0.4 已把廣度配額、執行綁定與整體架構統整成新版設計。',locale)}</p>${scopeNotice(route,locale)}
  <div class="scale-target-grid"><div><strong>2,000–3,000</strong><span>${t('正規化 G2 任務：初始研發目標',locale)}</span></div><div><strong>≥ 2×</strong><span>${t('最大可比基準：相對驗收門檻',locale)}</span></div><div><strong>${sourceStats.source_records.toLocaleString('en-US')}</strong><span>${t('原生來源紀錄：未完成跨作去重',locale)}</span></div><div><strong>${executionModel.recorded_trial_history_total.toLocaleString('en-US')}</strong><span>${t('已記錄原生開發執行；非新G2或通用正式結果',locale)}</span></div></div>
  <p class="source-note">${t('目前是規模優先的設計與來源盤點，尚未證明領先。2× 的分母要在共同 ontology、task kind、scope 和版本下正規化；若對照規模更大，目標也上調。',locale)}</p>
  <div class="cta-row"><a class="button" href="${routeLink(route,'compare.html',locale)}">${t('Benchmark × 領域／場景／題數總表',locale)} →</a><a class="button secondary" href="${routeLink(route,'appendices/comparison.html',locale)}">${t('原生規模查核附錄',locale)}</a><a class="button secondary" href="${routeLink(route,'native-tasks.html',locale)}">${t('探索完整來源紀錄',locale)}</a><a class="button secondary" href="${downloads}/native_source_inventory.csv" download>${t('下載來源 CSV',locale)}</a></div>
  <div class="prose">${content}</div><div class="reader-actions"><button class="text-button copy-link">${t('複製本頁連結',locale)}</button><button class="text-button print-page">${t('列印本頁',locale)}</button><a class="text-button" href="${downloads}/SCALE_FIRST_SPEC_V0_3.md">${t('下載設計原稿',locale)}</a></div>
  </main><aside class="on-this-page" aria-label="${t('本頁內容',locale)}"><div class="sidebar-label">${t('本頁內容',locale)}</div>${headings.map(h=>`<a href="#${escape(h.id)}">${escape(h.title)}</a>`).join('')}</aside></div>`;
  return shell({route,locale,title:'規模比較與來源查核',description:'保留 v0.3 規模提案與完整來源盤點，並連結 v0.4 的數量／廣度共同驗收設計。',body});
}
const nativeUnitLabels={...Object.fromEntries(browseRecords.map(r=>[r.native_unit,r.native_unit_zh])),...indexUnitLabels};
const nativeBucketLabels={
  native_task_candidates:'原作robot任務條目（待對齊）',
  integration_or_protocol:'整合框架／協定／生成配置',
  video_pairing:'影片配對／認知 schema',
  documented_examples:'示範程式入口',
  human_activity_definitions:'人類活動／流程定義（影片來源）'
};
strings.native={
  source:'來源',unit:'原生單位',definition:'定義路徑',aliases:'原生別名／層級對應',assets:'場景檔案引用',
  viewSource:'查看固定版本的原作定義／設定',staticOnly:'本卡記錄來源索引；任務環境規格的對齊和執行驗證分別記錄。',
  configOnly:'已標示：僅場景／軌跡配置衍生 class',datasetYes:'有 dataset registry 對應',
  datasetNo:'任務目錄項；未出現在該 dataset registry',details:'索引出處與對應細節',empty:'沒有符合的索引條目',
  showing:'顯示',records:'筆索引條目',units:nativeUnitLabels,buckets:nativeBucketLabels,
  recordMeaning:'索引型態',
  meaningByBucket:{
    native_task_candidates:'原作者列出的robot任務條目；在本庫等待共同規格與來源對齊。',
    human_activity_definitions:'人類活動類別與流程來源，可對應多部影片；任務環境另建對應。',
    integration_or_protocol:'框架註冊、協定或生成設定，可指向多個任務／樣本；一條索引不等於一個環境。',
    video_pairing:'影片題型或人類／模擬任務對應；觀測資料與物理環境規格分開。',
    documented_examples:'示範程式入口；可作定義與實作線索，尚不直接代表獨立環境。'
  }
};
function nativeSearchHints(record){
  const value=(record.native_id+' '+record.title).toLowerCase();
  const rules=[[/fold/,'摺疊 折叠 摺衣'],[/cloth|garment|shirt|trousers/,'布料 衣物 柔性物'],[/drawer/,'抽屜 抽屉'],[/cabinet/,'櫃子 柜子'],[/door/,'門 门'],[/stack|tower/,'堆疊 堆叠'],[/clean|wash/,'清潔 清洁 清洗'],[/pour|water/,'倒水 液體 液体'],[/rope|cable/,'繩索 绳索 線纜 线缆'],[/insert|peg|assembly/,'插入 裝配 装配'],[/pick|place/,'取放 抓取 放置'],[/handover|hand_over/,'交接 協作 协作'],[/memory|history|previous/,'記憶 记忆 歷史 历史']];
  return rules.filter(([pattern])=>pattern.test(value)).map(([,words])=>words).join(' ');
}
function nativePage(locale){
  const route='native-tasks.html';
  const download=relative(`${locale}/${route}`,'downloads/survey-union/task_source_bridge.csv');
  const sourceRows=browseSources.map(source=>{
    const units=Object.entries(source.counts_by_unit).map(([key,n])=>`${translate(nativeUnitLabels[key]||key,locale)} ${n.toLocaleString('en-US')}`).join('；');
    return `<tr><td><a href="?source=${source.id}">${t(source.work,locale)}</a></td><td>${source.record_count.toLocaleString('en-US')}</td><td>${escape(units)}</td><td><a href="https://github.com/${source.resolved_repo}/tree/${source.commit}" target="_blank" rel="noopener noreferrer"><code>${source.commit.slice(0,10)}</code></a></td></tr>`;
  }).join('');
  const options=(values)=>values.map(([value,label])=>`<option value="${escape(value)}">${t(label,locale)}</option>`).join('');
  const body=`<main class="wrap" id="main-content">${head('原作任務、活動與設定索引','每張卡片是一筆從原作提取的索引，可追到任務、活動、模板或設定。5,308是這些索引的總數；任務環境數、原始樣本量及執行進度分開統計。',route,locale,
  `<div class="page-meta"><span class="pill green">${unionStats.total_source_records.toLocaleString('en-US')} ${t('條已提取索引',locale)}</span><span>${unionStats.source_repositories} ${t('個官方程式庫',locale)} / ${unionStats.source_snapshots} ${t('個固定版本來源',locale)}</span><span>${config.sourceInventoryDate}</span><span class="pill status">${t('來源收錄與執行進度分開',locale)}</span></div>`)}
  <div class="counting-definition-note"><b>${t('這裡統計原作索引，完整環境與樣本數另外整理',locale)}</b><p>${t('5,308條索引中包含2,062條原作robot任務、263條人類活動，以及2,983條框架註冊、設定、協定等條目。「候選」是舊欄位名稱，表示本庫仍待共同對齊；原作任務本身可以已經正式發布。',locale)}</p><p>${t('例如PARTNR在這裡是6個生成器設定，原文的任務規模是10萬；COIN在這裡是180個活動定義，原作有11,827部影片。',locale)}</p><a href="${routeLink(route,'counting.html',locale)}">${t('看來源、任務環境、場景與樣本的完整定義',locale)} →</a></div>
  <details class="explainer" id="source-summary"><summary>${t('查看來源、索引數與固定版本',locale)}</summary><div class="table-scroll"><table><thead><tr><th>${t('來源',locale)}</th><th>${t('索引數',locale)}</th><th>${t('索引單位',locale)}</th><th>${t('固定 commit',locale)}</th></tr></thead><tbody>${sourceRows}</tbody></table></div></details>
  <div class="catalogue-layout native-layout"><aside class="filter-panel js-only" aria-label="${t('來源篩選',locale)}"><h2>${t('查找原作任務與設定',locale)}</h2><div class="filter-fields">
  <div class="filter-field"><label for="native-q">${t('關鍵字／原作 ID',locale)}</label><input id="native-q" data-native-filter="q" type="search" placeholder="${t('例如 fold、抽屜、PegInsertion',locale)}"></div>
  <div class="filter-field"><label for="native-source">${t('來源版本',locale)}</label><select id="native-source" data-native-filter="source"><option value="">${t('全部來源',locale)}</option>${options(browseSources.map(s=>[s.id,s.work]))}</select></div>
  <div class="filter-field"><label for="native-unit">${t('索引單位',locale)}</label><select id="native-unit" data-native-filter="unit"><option value="">${t('全部單位',locale)}</option>${options(Object.entries(nativeUnitLabels))}</select></div>
  <div class="filter-field"><label for="native-bucket">${t('來源型態',locale)}</label><select id="native-bucket" data-native-filter="bucket"><option value="">${t('全部型態',locale)}</option>${options(Object.entries(nativeBucketLabels))}</select></div>
  </div><label class="checkbox-label"><input type="checkbox" id="native-hide-config" data-native-filter="hide_config"> <span>${t('隱藏已標示的純配置衍生 class',locale)}</span></label><button class="button secondary small" id="native-reset">${t('清除篩選',locale)}</button>
  <p class="filter-note">${t('此勾選只移除兩個已審核檔案中的 2,587 筆純場景／軌跡配置衍生 class，不是全庫語義去重。中文搜尋提示只用於檢索，不作 ontology 覆蓋標註。',locale)}</p></aside>
  <section class="native-browser" data-native-browser aria-label="${t('原作索引',locale)}"><div class="result-bar"><div id="native-count" role="status" aria-live="polite">${t('載入原作索引…',locale)}</div><a class="section-link" href="${download}" download>${t('完整 CSV',locale)} ↓</a></div>
  <noscript><p class="no-js-note">${t('互動篩選需要 JavaScript。上方來源表仍可閱讀，完整索引可下載 CSV；每列附固定原始定義連結。',locale)}</p></noscript>
  <div id="native-empty" class="empty-state" hidden><h3>${t('沒有符合的索引條目',locale)}</h3><p>${t('試試簡短關鍵字或清除部分篩選。',locale)}</p></div><div class="record-grid" id="native-records"></div>
  <div class="pagination js-only"><button id="native-prev">${t('上一頁',locale)}</button><span id="native-page"></span><button id="native-next">${t('下一頁',locale)}</button></div>
  <p class="source-note">${t('這裡合併9/22與9/29的固定來源定義；卡片的收錄不依賴本機模擬。RoboCasa的365個目錄項與317個dataset項分開，WatchAct14項為認知schema；COIN／CrossTask是人類程序。執行證據由獨立附錄提供。',locale)} <a href="${routeLink(route,'execution.html',locale)}">${t('查看最新執行證據',locale)} →</a></p></section></div></main>`;
  return shell({route,locale,title:'原作任務、活動與設定索引',description:`${unionStats.total_source_records.toLocaleString('en-US')} 條可追溯原作索引；依來源、索引單位和設定類型篩選。環境數與原始樣本數分開統計。`,body,kind:'native'});
}
function chapterNav(route,locale) {
  const chapterLinks=chapters.map(s=>`<a href="${routeLink(route,chapterRoute(s),locale)}"${route===chapterRoute(s)?' class="active" aria-current="page"':''}><span>${s.id.slice(1)}</span>${t(s.title,locale)}</a>`).join('');
  const extras=[['counting.html','來源、環境與樣本怎麼算'],['survey-union.html','Benchmark總庫與任務規則'],['joint-pilot.html','工程附錄：聯合流程試作'],['explore/families.html','48 個任務家族'],['explore/tasks.html','180 個情境藍圖'],['explore/probes.html','24 個 Ego 題型'],['explore/metrics.html','40 個指標'],['appendices/axes.html','完整分類軸'],['appendices/comparison.html','原生規模比較'],['research.html','文獻更新與分類'],['library.html',`${papers.length} 篇文獻`],['appendices/methods.html','來源與資料字典']];
  return `<div class="sidebar-label">${t('研究主線與來源總庫',locale)}</div><a href="${routeLink(route,'design.html',locale)}"${route==='design.html'?' class="active" aria-current="page"':''}>${t('整體設計、廣度與目標',locale)}</a><a href="${routeLink(route,'execution.html',locale)}"${route==='execution.html'?' class="active" aria-current="page"':''}>${t('工程附錄：原生模型與驗證',locale)}</a><a href="${routeLink(route,'readiness.html',locale)}"${route==='readiness.html'?' class="active" aria-current="page"':''}>${t('待完善事項與驗收',locale)}</a><a href="${routeLink(route,'compare.html',locale)}">${t('Benchmark × 領域／場景／題數',locale)}</a><a href="${routeLink(route,'scale-plan.html',locale)}"${route==='scale-plan.html'?' class="active"':''}>${t('規模方案與來源查核',locale)}</a><a href="${routeLink(route,'native-tasks.html',locale)}"${route==='native-tasks.html'?' class="active"':''}>${t('原作任務與設定索引',locale)}</a><div class="sidebar-divider"></div><div class="sidebar-label">${t('研究與設計章節',locale)}</div>${chapterLinks}<div class="sidebar-divider"></div><div class="sidebar-label">${t('深入資料庫',locale)}</div>${extras.map(([target,label])=>`<a href="${routeLink(route,target,locale)}"${route===target?' class="active" aria-current="page"':''}>${t(label,locale)}</a>`).join('')}`;
}
function readingPage(section,locale) {
  const route=chapterRoute(section);
  let sourceHTML=section.html;
  if(section.id==='c05'){
    const draft=cheerio.load(sourceHTML,{},false);
    draft('tr').each((_,row)=>{
      const cells=draft(row).children('td');const first=cells.first().text();
      if(first.includes('我們：核心預算')){
        cells.eq(0).text('我們：v0.4 規模與廣度目標');
        cells.eq(1).text('2,000–3,000 個 G2；任務數與有效覆蓋各至少最大可比基準 2 倍');
        cells.eq(2).text('正規化任務的研發目標');
        cells.eq(3).text('尚未達成；以共同 ontology、scope、來源去重與驗證後的實績比較');
      }
      if(first.includes('我們：完整設計'))cells.eq(0).text('我們：v0.2 情境種子');
    });sourceHTML=draft.html();
  }
  let content=transform(`<section id="${section.id}">${sourceHTML}</section>`,locale,route);
  const currentNote=scopeNotice(route,locale);
  if(['c03','c05','c06','c12','c14'].includes(section.id))content=currentNote+content;
  if(section.id==='c01'){
    const legacy=content.replace('id="c01"','id="legacy-c01"');
    content=`<section id="c01">${currentNote}${currentExecutionNote(route,locale)}<details class="legacy-content"><summary>${t('初版提案與當時狀態（v0.2 歷史）',locale)}</summary>${legacy}</details></section>`;
  }
  if(section.id==='c04')content=`<div class="scope-notice"><b>${t('最新文獻與分布已更新',locale)}</b><p>${t('統一書目250篇，其中137篇有完整摘要審閱紀錄。下方原168篇分析保留為歷史快照。',locale)}</p><a href="${routeLink(route,'research.html',locale)}">${t('看新檢索、分類分布與82篇補充',locale)} →</a></div>`+content;
  if(section.id==='c05')content=`<div class="scope-notice"><b>${t('直接看每個 benchmark 的差別',locale)}</b><p>${t(`新版比較總表以benchmark為列，領域、場景、任務種類、題數、材料、機體和影片為欄；${comparisonModel.prior_works}項前作與我們的目標／實績並排。`,locale)}</p><a href="${routeLink(route,'compare.html',locale)}">${t('開啟橫向比較矩陣',locale)} →</a></div>`+content;
  if(['c11','c13'].includes(section.id)){
    const current=section.id==='c11'?designSections([3,9],locale,route,'updated-budget'):designSections([10,11],locale,route,'updated-milestones')+currentExecutionNote(route,locale);
    const legacy=content.replace(`id="${section.id}"`,`id="legacy-${section.id}"`);
    content=`<section id="${section.id}">${currentNote}${current}<details class="legacy-content"><summary>${t('查看 v0.2 原始預算／排程（歷史方案）',locale)}</summary>${legacy}</details></section>`;
  }
  const $=cheerio.load(content);
  const headings=$('h2,h3').toArray().map(n=>({id:$(n).attr('id'),title:$(n).text()}));
  const index=chapters.indexOf(section);
  const navigation=chapterNav(route,locale);
  const nextPrev=[chapters[index-1],chapters[index+1]].map((s,i)=>s?`<a href="${routeLink(route,chapterRoute(s),locale)}"><small>${t(i===0?'← 上一章':'下一章 →',locale)}</small>${s.id.slice(1)} · ${t(s.title,locale)}</a>`:'<span></span>').join('');
  const body=`<div class="reading-progress" aria-hidden="true"></div><div class="reader-layout"><aside class="chapter-sidebar" aria-label="${t('章節導覽',locale)}">${navigation}</aside>
  <main class="reader" id="main-content"><details class="mobile-chapter-nav"><summary>${t('章節目錄與附錄',locale)}</summary>${navigation}</details>
  ${breadcrumb('章節閱讀',route,locale)}<div class="eyebrow">CHAPTER ${section.id.slice(1)} / 14</div><h1>${t(section.title,locale)}</h1>
  <div class="page-meta"><span>${t(`約 ${timeFor(section)} 分鐘`,locale)}</span><span>·</span><span>${t(`資料快照 ${config.researchDate}`,locale)}</span><span class="pill status">${t('設計階段 Q0',locale)}</span></div>
  <div class="chapter-summary"><div class="label">${t('先掌握這三件事',locale)}</div><ul>${summaries[section.id].map(line=>`<li>${t(line,locale)}</li>`).join('')}</ul></div>
  <div class="prose">${content}</div><div class="reader-actions"><button class="text-button copy-link">${t('複製本章連結',locale)}</button><button class="text-button print-page">${t('列印本章',locale)}</button><a class="text-button" href="${pdfHref(route,locale)}">${t('完整報告 PDF · 9/29快照',locale)} ↗</a></div>
  <nav class="prev-next" aria-label="${t('前後章節',locale)}">${nextPrev}</nav></main>
  <aside class="on-this-page" aria-label="${t('本章內容',locale)}"><div class="sidebar-label">${t('本章內容',locale)}</div>${headings.map(h=>`<a href="#${escape(h.id)}">${escape(h.title)}</a>`).join('')}</aside></div>`;
  return shell({route,locale,title:section.title,description:descriptions[section.id],body,kind:'chapter'});
}

function chapterTiles(route,locale) {
  return chapters.map(s=>`<a class="chapter-tile" href="${routeLink(route,chapterRoute(s),locale)}"><span class="chapter-number">${s.id.slice(1)}</span><span><h3>${t(s.title,locale)}</h3><p>${t(descriptions[s.id],locale)}</p><span class="time">${t(`約 ${timeFor(s)} 分鐘`,locale)}</span></span></a>`).join('');
}
function chaptersPage(locale) {
  const route='chapters/index.html';
  const cards=[
    ['01','第一次接觸這個計畫','先看研究目標與摺毛巾例子，再認識「題數」的不同層級。','chapters/01.html'],
    ['04','我要評估研究新穎性','從文獻地圖、最近 benchmark 和公平比較開始。','chapters/04.html'],
    ['09','我要開始做 benchmark','先看詳細案例，再讀規模、工程與 milestones。','chapters/09.html']
  ];
  const body=`<main class="wrap" id="main-content">${head('完整章節閱讀','每一章先給重點，再展開完整設計。可按顺序閱讀，也能選擇最適合你的入口。',route,locale)}
  <div class="reading-routes">${cards.map(([number,title,description,target])=>`<a class="overview-card" href="${routeLink(route,target,locale)}"><span class="card-icon">${number}</span><h3>${t(title,locale)}</h3><p>${t(description,locale)}</p><span class="bottom-link">${t('由這裡開始',locale)} →</span></a>`).join('')}</div>
  <div class="section-head"><div><div class="eyebrow">THE COMPLETE REPORT</div><h2>${t('14 個章節，從問題走到實作',locale)}</h2></div><a class="section-link" id="resume-reading" hidden></a></div>
  <div class="chapter-grid">${chapterTiles(route,locale)}</div></main>`;
  return shell({route,locale,title:'完整章節閱讀',description:'14 章完整研究設計，附重點、術語、來源與實作路線。',body});
}

const collectionInfo={
  tasks:{title:'探索 180 個情境藍圖',description:'從居家到工坊，把「機器人要做什麼」寫成具體情境。先看初態與目標，再展開判分、擾動和來源。',group:'tasks',selector:'.scenario-card',key:'scenario_id',kind:'task',badge:'情境藍圖 · Q0',intro:'appB',data:tasks},
  families:{title:'48 個任務家族',description:'依共同語義整理任務，而不是每換一個物件就增加一類。47 個執行家族和 1 個主動資訊家族分開記錄。',group:'families',selector:'.family-card',key:'family_id',kind:'family',badge:'作者定義家族',intro:'appA',data:families},
  probes:{title:'24 個 Ego 觀測題型',description:'用技能、程序、戶外、專門工作、生活與非人類視角測理解和預測。這些是題型藍圖，還不是已收集的 QA。',group:'probes',selector:'.probe-card',key:'probe_id',kind:'probe',badge:'觀測題型 · Q0',intro:'appC',data:probes},
  metrics:{title:'40 個評測指標',description:'每個指標都附單位、分母、資料前提與解讀界線。依有效資料選用，不把它們任意加成一個總分。',group:'metrics',selector:'.metric-card',key:'metric_id',kind:'metric',badge:'候選指標定義',intro:'appD',data:metrics},
  literature:{title:`${papers.length} 篇文獻地圖`,description:'影片、Ego、預測、操作、柔性物、協作與世界模型的研究脈絡。每篇都附中文用途、證據深度與原始來源。',group:'literature',selector:'.bibliography-card',key:'id',kind:'paper',badge:'文獻來源',intro:'appG',data:papers}
};
const extractedCards={};
for(const [key,info] of Object.entries(collectionInfo)){
  const $=cheerio.load(groups[info.group].map(s=>s.html).join('\n'));
  extractedCards[key]=$(info.selector).toArray().map(node=>({id:$(node).attr('id'),html:$.html(node)}));
  if(key==='literature')for(const p of literatureAdditions){
    extractedCards[key].push({id:p.id,html:`<article class="bibliography-card" id="${p.id}"><h3>${p.id} · ${escape(p.short_name)} <span>(${p.year})</span></h3><p class="paper-title"><a href="${escape(p.source_url)}">${escape(p.title)}</a></p><p class="paper-authors">${escape(p.authors)}</p><p><b>用途與界線</b> ${escape(p.scope_note)}</p><p class="meta"><b>證據</b> E2：原始書目與完整摘要已核對；沒有宣稱全文審計。</p><p class="paper-dates">首次提交：${escape(p.first_arxiv_submission)}；版本更新：${escape(p.latest_arxiv_update)}；審閱：2026-09-25 · <a href="${escape(p.source_url)}">原始論文</a></p><p class="meta">分類：${escape(p.primary_category_zh)}；${escape(p.classification_note)}</p></article>`});
  }
  if(extractedCards[key].length!==info.data.length)throw new Error(`Missing ${key} cards`);
}
function filterDefinitions(key){
  const domains=Object.entries(taxonomy.application_contexts).map(([id,v])=>[id,v.name]);
  const tracks=Object.entries(taxonomy.tracks).map(([id,v])=>[id,`${id} ${v.name}`]);
  const common=[{key:'q',label:'關鍵字',placeholder:'搜尋名稱、物件或 ID'}];
  const stages={key:'stage',label:'實作分組',options:[['A','A · 優先原型'],['B','B · 進階原型'],['C','C · 專項物理']]};
  if(key==='tasks')return [...common,{key:'domain',label:'應用場域',options:domains},{key:'material',label:'材料模型',options:[['rigid','剛體'],['cloth','布料'],['rope','繩索'],['granular','顆粒'],['fluid','流體'],['soft_solid','其他柔順固體']]},stages,{key:'family',label:'任務家族',options:families.map(f=>[f.family_id,`${f.family_id} ${f.family_name}`])}];
  if(key==='families')return [...common,stages];
  if(key==='probes')return [...common,{key:'stratum',label:'診斷來源',options:Object.entries(taxonomy.observation_diagnostic_strata)},{key:'track',label:'評測模組',options:tracks}];
  if(key==='metrics')return [...common,{key:'track',label:'評測模組',options:tracks}];
  const categories=[...new Map(papers.map(p=>[p.primary_category_code,p.primary_category_zh])).entries()];
  return [...common,{key:'category',label:'研究主分類',options:categories},{key:'evidence',label:'閱讀紀錄',options:[['E2','已核對書目與完整摘要'],['E1','書目／來源核對']]},{key:'year',label:'版本年份',options:[...new Set(papers.map(p=>p.year))].sort((a,b)=>b-a).map(year=>[String(year),String(year)])}];
}
function filterAttrs(key,record){
  if(key==='tasks')return {domain:record.application_context_id,material:record.active_material,stage:record.implementation_stage,family:record.task_family_id};
  if(key==='families')return {stage:record.implementation_stage};
  if(key==='probes')return {stratum:record.stratum_id,track:record.track};
  if(key==='metrics')return {track:record.track};
  return {category:record.primary_category_code,year:String(record.year),evidence:record.snapshot_membership!=='baseline_163'||record.evidence_depth.includes('complete abstract reviewed')?'E2':'E1'};
}
function cardHTML(card,key,locale,route){
  const info=collectionInfo[key];
  const record=info.data.find(r=>r[info.key]===card.id);
  const $=cheerio.load(card.html,{},false);
  const article=$('article');
  article.addClass('record-card').attr('data-entry','').attr('data-kind',info.kind);
  const searchText=plain(card.html)+' '+Object.values(filterAttrs(key,record)).join(' ')+' '+(record.display_name||record.scenario_name||record.family_name||'');
  article.attr('data-search',tc(searchText)+' '+sc(tc(searchText)));
  for(const [name,value] of Object.entries(filterAttrs(key,record)))article.attr(`data-${name}`,value);
  const paragraphs=article.children('p').toArray();
  const visible=new Set();
  if(key==='literature'){
    for(const p of paragraphs)if($(p).hasClass('paper-title')||$(p).text().startsWith('用途與界線'))visible.add(p);
  }else if(key==='tasks'){
    paragraphs.slice(0,3).forEach(p=>visible.add(p));
  }else if(key==='families'){
    paragraphs.slice(0,2).forEach(p=>visible.add(p));
  }else paragraphs.slice(0,3).forEach(p=>visible.add(p));
  const details=$('<details><summary>完整資料與來源</summary><div class="detail-content"></div></details>');
  paragraphs.filter(p=>!visible.has(p)).forEach(p=>details.find('.detail-content').append($(p)));
  article.append(details);
  article.prepend(`<span class="entry-badge">${escape(info.badge)}</span>`);
  return transform($.html(),locale,route,`card-${card.id}`);
}
function collectionPage(key,locale){
  const info=collectionInfo[key];const route=groupRoutes[info.group];
  const filters=filterDefinitions(key);
  const filterHTML=filters.map(f=>`<div class="filter-field"><label for="filter-${f.key}">${t(f.label,locale)}</label>${f.options?`<select id="filter-${f.key}" data-filter="${f.key}"><option value="">${t('全部',locale)}</option>${f.options.map(([value,label])=>`<option value="${escape(value)}">${t(label,locale)}</option>`).join('')}</select>`:`<input type="search" id="filter-${f.key}" data-filter="${f.key}" placeholder="${t(f.placeholder,locale)}">`}</div>`).join('');
  const intro$=cheerio.load(sectionById[info.intro].html,{},false);
  if(key!=='literature')intro$('table,.table-scroll,h2').remove();
  const intro=transform(intro$.html(),locale,route);
  let chart='';
  if(key==='literature'){
    const categories=[...new Map(papers.map(p=>[p.primary_category_code,p.primary_category_zh])).entries()];
    const maxCount=Math.max(...categories.map(([code])=>papers.filter(p=>p.primary_category_code===code).length));
    chart=`<div class="scope-notice"><b>${t('原168篇＋新增82篇，統一查找。',locale)}</b><p>${t('本庫250篇，其中137篇有完整摘要審閱紀錄；其餘保持書目／來源層標記。新增檢索截止日2026-09-25，沒有宣稱已找齊全部文獻。',locale)}</p><a href="${routeLink(route,'research.html',locale)}">${t('檢索方法、Ego分類與新增工作',locale)} →</a></div><div class="library-chart" aria-label="${t('文獻主分類分布',locale)}">${categories.map(([code,name])=>{const count=papers.filter(p=>p.primary_category_code===code).length;return `<a class="bar-row" href="?category=${code}"><span class="bar-title"><span>${t(name,locale)}</span><b>${count}</b></span><span class="bar-track"><span style="width:${count/maxCount*100}%"></span></span></a>`;}).join('')}</div><p class="note-inline">${t('條長相對於本庫最多的主分類；數字只描述本次收錄，不代表整個領域的研究比例，也不決定任務配額。',locale)}</p>`;
  }
  const body=`<main class="wrap" id="main-content">${head(info.title,info.description,route,locale,`<div class="page-meta"><span class="pill green">${info.data.length} ${t(key==='literature'?'篇註釋文獻':'筆設計紀錄',locale)}</span><span>${t(`快照 ${key==='literature'?researchStats.cutoff_date:config.researchDate}`,locale)}</span>${key!=='literature'?`<span class="pill status">${t('此藍圖集正式驗證 0',locale)}</span>`:''}</div>`)}${chart}
  <details class="explainer" id="${info.intro}"><summary>${t(key==='literature'?'原168篇快照的方法與計數（歷史）':'如何閱讀這個資料庫與計數',locale)}</summary><div class="prose">${intro}</div></details>
  <noscript><p class="no-js-note">${t('目前顯示全部內容。啟用 JavaScript 可使用搜尋、篩選與分頁。',locale)}</p></noscript>
  <div class="catalogue-layout"><aside class="filter-panel js-only" aria-label="${t('篩選條件',locale)}"><h2>${t('找到你關心的內容',locale)}</h2><div class="filter-fields">${filterHTML}</div><button class="button secondary small" id="reset-filters">${t('清除篩選',locale)}</button><p class="filter-note">${t('繁體、簡體、英文名稱與 ID 都能搜尋。篩選條件會保留在網址中，方便分享。',locale)}</p></aside>
  <section data-catalogue="${key}" data-page-size="12" aria-label="${t(info.title,locale)}"><div class="result-bar"><div id="result-count" role="status" aria-live="polite">${info.data.length} ${t('筆',locale)}</div><button class="text-button js-only" id="share-results">${t('分享篩選',locale)} ↗</button></div><div class="empty-state" id="no-results" hidden><h3>${t('沒有符合的結果',locale)}</h3><p>${t('試試較短的關鍵字，或清除部分篩選條件。',locale)}</p></div>
  <div class="record-grid">${extractedCards[key].map(card=>cardHTML(card,key,locale,route)).join('')}</div>
  <div class="pagination js-only"><button id="previous-page">${t('上一頁',locale)}</button><span id="page-status"></span><button id="next-page">${t('下一頁',locale)}</button><button id="show-all">${t('顯示全部',locale)}</button></div></section></div></main>`;
  return shell({route,locale,title:info.title,description:info.description,body,kind:'collection'});
}

function towelSVG(){
  return `<svg viewBox="0 0 410 190" role="img" aria-label="同一條毛巾，兩個摺疊目標的幾何示意">
  <rect x="82" y="30" width="246" height="126" rx="5" fill="#f7faf1" stroke="#aec9a4" stroke-dasharray="4 4"/>
  <g fill="#6b8d66" font-size="11" font-family="sans-serif"><text x="67" y="169">A</text><text x="335" y="169">B</text><text x="335" y="25">C</text><text x="67" y="25">D</text></g>
  <g id="towel-fold-a"><rect x="83" y="94" width="244" height="61" rx="5" fill="#a5c899" stroke="#648c5c"/><path d="M84 92h242" stroke="#567e4e" stroke-dasharray="5 5"/><path d="M124 42v27m-5-5 5 6 5-6M286 42v27m-5-5 5 6 5-6" fill="none" stroke="#6d9871" stroke-width="2"/><path d="M88 144h232" stroke="#d5e9c6" stroke-width="2"/></g>
  <g id="towel-fold-b" visibility="hidden"><rect x="83" y="31" width="121" height="124" rx="5" fill="#a5c899" stroke="#648c5c"/><path d="M205 33v120" stroke="#567e4e" stroke-dasharray="5 5"/><path d="M302 62h-44m5-5-6 5 6 5M302 124h-44m5-5-6 5 6 5" fill="none" stroke="#6d9871" stroke-width="2"/><path d="M95 38v110" stroke="#d5e9c6" stroke-width="2"/></g>
  <text x="205" y="184" text-anchor="middle" fill="#8aa181" font-size="9" font-family="monospace">SC-H15 · GOAL-CONDITIONED DESIGN</text></svg>`;
}
function homePage(locale){
  const route='index.html';
  const diagram=`<svg class="union-flow-svg" viewBox="0 0 480 330" role="img" aria-label="${t('多個benchmark經分類形成任務聯集，再擴充任務與規則',locale)}"><defs><marker id="union-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="#44846b"/></marker></defs><g fill="#fff" stroke="#c4d9c7"><rect x="12" y="22" width="142" height="56" rx="12"/><rect x="169" y="22" width="142" height="56" rx="12"/><rect x="326" y="22" width="142" height="56" rx="12"/><rect x="59" y="133" width="362" height="64" rx="12"/><rect x="59" y="249" width="362" height="64" rx="12"/></g><g font-family="sans-serif" font-size="14" fill="#215a46" text-anchor="middle"><text x="83" y="47">${t('操作／材料',locale)}</text><text x="83" y="66">${t('既有任務',locale)}</text><text x="240" y="47">${t('導航／協作',locale)}</text><text x="240" y="66">${t('既有規則',locale)}</text><text x="397" y="47">${t('Ego／影片',locale)}</text><text x="397" y="66">${t('理解與預測',locale)}</text><text x="240" y="158">${t('Survey分類 → 完整任務聯集',locale)}</text><text x="240" y="181" font-size="12">${t('保留來源、領域、任務與多粒度數量',locale)}</text><text x="240" y="275">${t('擴充目標、規則、流程與組合',locale)}</text><text x="240" y="298" font-size="12">${t('綜合任務庫 ＋ 分層評測',locale)}</text></g><g fill="none" stroke="#44846b" stroke-width="1.8" marker-end="url(#union-arrow)"><path d="M83 79L160 132"/><path d="M240 79V132"/><path d="M397 79L320 132"/><path d="M240 198V247"/></g></svg>`;
  const cards=[['01','全面收集前作','benchmark、含評測資料、task suite、官方清單和版本，都接到同一來源表。','survey-union.html','查看來源總庫'],['02','分類後建立任務聯集','像survey一樣整理領域、任務家族、材料、觀測和規則，保留互補的來源範圍。','survey-union.html#union-taxonomy','看分類與分布'],['03','擴充任務與規則','在父任務上增加目標、約束、必要順序、條件分支及組合工作，逐層報增量。','survey-union.html#union-extension-rules','看具體擴充例子']];
  const body=`<main id="main-content"><div class="wrap"><section class="hero"><div><div class="eyebrow">SURVEY → TASK UNION → EXTENSIONS · v0.7</div><h1>${t('把前作收齊，',locale)}<br><em>${t('建立大而廣的任務庫。',locale)}</em></h1><p class="lede">${t('全面收集既有機器人與Ego相關benchmark，整理它們的領域、任務和規則。以完整聯集保留互補能力，再擴充任務定義，放進同一套分層評測。',locale)}</p><div class="cta-row"><a class="button" href="${routeLink(route,'survey-union.html',locale)}">${t('進入Benchmark總庫',locale)} →</a><a class="button secondary" href="${routeLink(route,'design.html',locale)}">${t('閱讀目前主設計',locale)}</a></div><p class="note">${t('來源目錄按研究範圍收集；目前能在Mac執行哪些子集，另列工程進度。',locale)}</p></div><div class="hero-visual"><div class="visual-top"><span>COLLECT · CLASSIFY · UNIFY · EXTEND</span></div>${diagram}<p class="demo-message">${t('大與廣來自前作聯集和任務／規則擴充；每個來源、原生任務與修改都保留出處。',locale)}</p></div></section>
  ${renderCountingOverview(locale,unionStats,{t,routeLink},{route})}
  <section class="section" id="quick-start"><div class="section-head"><div><div class="eyebrow">THE MAIN RESEARCH</div><h2>${t('三個重點，就是這份研究的主線。',locale)}</h2><p>${t('完整來源總庫、Survey分類與任務聯集，再加上可擴充的任務和規則。',locale)}</p></div></div><div class="card-grid">${cards.map(([n,title,text,url,label])=>`<a class="overview-card" href="${routeLink(route,url,locale)}"><span class="card-icon">${n}</span><h3>${t(title,locale)}</h3><p>${t(text,locale)}</p><span class="bottom-link">${t(label,locale)} →</span></a>`).join('')}</div></section>
  <section class="section"><div class="section-head"><div><div class="eyebrow">SOURCE COVERAGE &amp; TASK RULES</div><h2>${t('看前作覆蓋什麼，再看我們增加什麼。',locale)}</h2><p>${t('總庫提供benchmark×領域／任務／場景欄位；原68項詳細比較繼續保留，75條先前漏接來源已回到總目錄。',locale)}</p></div><a class="section-link" href="${routeLink(route,'compare.html',locale)}">${t('原68項詳細比較',locale)} →</a></div><div class="roadmap-preview">${[['U0','完整來源','保留版本、原文與待查清單。'],['U1','原生任務','逐來源取得task、activity、schema與規則。'],['U2','分類與聯集','共同分類、多粒度數量、互補與重疊。'],['U3','規格擴充','擴充目標、流程、約束和組合。']].map(([id,title,text])=>`<div class="roadmap-step"><small>${id}</small><h3>${t(title,locale)}</h3><p>${t(text,locale)}</p></div>`).join('')}</div></section>
  <div class="download-band"><div><h2>${t('一份PDF，讀懂目前設計與全部資料。',locale)}</h2><p>${t(`${currentPDF.pages}頁v0.7報告保留9/29來源聯集、分類與規則擴充；10/1新增的計數與環境定義見網頁說明。`,locale)}</p></div><a class="button" href="${pdfHref(route,locale)}">${t('完整報告 PDF · 9/29快照',locale)} ↓</a></div>
  <details class="explainer" id="home-engineering-appendix"><summary>${t('工程附錄與歷史設計種子',locale)}</summary><p>${t('原生執行器、小型聯合資料與180個情境種子，保留支援後續整合。',locale)}</p><p><a href="${routeLink(route,'execution.html',locale)}">${t('Meta-World原生執行',locale)}</a> · <a href="${routeLink(route,'joint-pilot.html',locale)}">${t('小型聯合流程試作',locale)}</a> · <a href="${routeLink(route,'explore/tasks.html',locale)}">${t('180個情境種子',locale)}</a></p><details id="home-legacy-demo"><summary>${t('歷史概念例：同一條毛巾的兩個目標',locale)}</summary><div class="goal-switch"><button data-demo-goal="a" aria-pressed="true">${t('目標 A · 沿長軸摺',locale)}</button><button data-demo-goal="b" aria-pressed="false">${t('目標 B · 沿短軸摺',locale)}</button></div><div class="towel-scene">${translate(towelSVG(),locale)}</div><p id="fold-pairs">D → A · C → B</p><p id="demo-message">${t(strings.demoA,locale)}</p></details></details>
  </div></main>`;
  return shell({route,locale,title:'全面前作聯集，擴充任務與規則',description:'全面收集機器人與Ego相關benchmark，像survey一樣分類，再以來源任務聯集與規則擴充建立大而廣的綜合benchmark。',body,kind:'home'});
}
function referencePage(group,locale){
  const route=groupRoutes[group];
  const meta={
    axes:['完整分類軸與覆蓋','34 個能力、12 個變化軸、觀測、機體、學習設定與全部候選覆蓋矩陣。'],
    comparison:['原生規模與版本查核','逐筆保留原作者的數量、單位、scope 和版本，並完整展開 LIBERO 的部分 goal 查核。'],
    methods:['來源、方法與資料字典','檢索紀錄、未解決線索、資料欄位、規劃器與原始文件對照，集中在這裡。']
  }[group];
  const content=groups[group].map((section,index)=>`<section id="${section.id}">${index?`<h2>${escape(section.title)}</h2>`:''}${section.html}</section>`).join('\n');
  const html=transform(content,locale,route,`ref-${group}`);
  const $=cheerio.load(html);
  const headings=$('h2').toArray().map(n=>({id:$(n).attr('id'),title:$(n).text()}));
  const nav=chapterNav(route,locale);
  const body=`<div class="reader-layout"><aside class="chapter-sidebar" aria-label="${t('章節導覽',locale)}">${nav}</aside><main class="reader" id="main-content"><details class="mobile-chapter-nav"><summary>${t('章節與附錄目錄',locale)}</summary>${nav}</details>${breadcrumb(meta[0],route,locale)}<div class="eyebrow">REFERENCE</div><h1>${t(meta[0],locale)}</h1><p class="lede">${t(meta[1],locale)}</p>${group==='comparison'||group==='axes'?scopeNotice(route,locale):''}<div class="source-note">${t('完整保留原始整理版的定義和證據界線；目前仍無正式模擬評測結果。寬表格可以水平捲動。',locale)}</div><div class="prose">${html}</div><div class="reader-actions"><button class="text-button copy-link">${t('複製連結',locale)}</button><button class="text-button print-page">${t('列印此頁',locale)}</button></div></main><aside class="on-this-page" aria-label="${t('本頁內容',locale)}"><div class="sidebar-label">${t('本頁內容',locale)}</div>${headings.map(h=>`<a href="#${escape(h.id)}">${escape(h.title)}</a>`).join('')}</aside></div>`;
  return shell({route,locale,title:meta[0],description:meta[1],body});
}
const glossary=[
  ['source-entry','來源名錄條目','登記一個benchmark、評測資料資源或其版本；一條名錄可連到多個任務或設定索引。','counting.html#source-entry'],
  ['source-index','原作定義／設定索引','從原作清單或程式提取的一筆任務、活動、模板、註冊或協定。5,308是這一層的數量。','counting.html#source-index'],
  ['task-environment','任務環境定義','把世界／機體、觀測／動作、狀態規則、任務目標及判分連成完整規格。定義可以先收錄，執行另驗證。','counting.html#task-environment'],
  ['scene','場景／layout','房間或工作站的空間與幾何配置。同一場景可以支援多個不同任務環境。','counting.html#scene'],
  ['sample','原始資料樣本','影片、QA、episode或軌跡等原作資料單位，按型別與split分項統計。原作量、已取得量、已整合量分開。','counting.html#sample'],
  ['benchmark','評測基準','一組有明確輸入、任務、條件與評分規則的共同測試，用來比較不同方法。','chapters/01.html'],
  ['taxonomy','文獻分類','整理研究在測什麼，例如影片理解、預測、操作、協作；不直接決定考題配額。','chapters/02.html'],
  ['ontology','任務概念結構','定義場域、家族、物件、目標、過程與證據之間的關係，讓出題規格一致。','chapters/02.html'],
  ['domain','應用場域（G0）','任務發生的應用背景，例如住家或工坊。同一個摺疊家族可在多個場域出現。','chapters/03.html'],
  ['family','任務家族（G1）','按共通語義結構分組，例如「開啟、存入並關閉」。換個抽屜不一定是新家族。','explore/families.html'],
  ['blueprint','情境藍圖（B0）','尚未實作的具體出題構想，包含初態、目標與驗收條件。本計畫目前有 180 個。','explore/tasks.html'],
  ['spec','正式任務規格（G2）','明訂目標邏輯、指涉、必要過程與機構要求。共同去重後的數量目前仍待定。','chapters/03.html'],
  ['instance','任務實例（G3）','把任務綁定到實際資產、物件、物理參數與初始狀態。文件中有名稱不代表已有實例。','chapters/03.html'],
  ['case','測例（G4）','一個有合法輸入、條件、答案與評分器的測試題。QA 與機器人控制必須標示不同型態。','chapters/03.html'],
  ['trial','一次執行（G5）','某個模型在一個固定測例上跑一次。重跑會增加執行量，不自動增加任務種類。','chapters/11.html'],
  ['ego','第一人稱觀測','從行動者附近的視角觀察活動；要另記頭戴、胸前、robot camera 等相機位置。','chapters/04.html'],
  ['contract','共同評測約定','模型能看什麼、能做哪些動作、允許多少資料與時間，以及如何判成功。','chapters/08.html'],
  ['evaluator','判分器','根據狀態和軌跡判斷是否完成任務。它需要接受合法解，也能拒絕近失敗。','chapters/08.html'],
  ['oracle','診斷上界','提供正確目標、計畫或特權狀態的對照，用來定位瓶頸，與一般模型排名分開。','chapters/08.html'],
  ['split','資料切分','定義訓練與測試的邊界；先按來源 session 分組，避免同源片段洩漏到兩邊。','chapters/07.html'],
  ['readiness','驗證階段 Q0–Q4','Q0 是語義設計，接著才是實例、專家可解性、判分器審核和基線重現。','appendices/axes.html#axes-readiness']
];
function glossaryPage(locale){
  const route='glossary.html';
  const body=`<main class="wrap" id="main-content">${head('名詞小辭典','從一般讀者的角度，快速理解網站裡常見的研究用語。',route,locale)}<div class="glossary-grid">${glossary.map(([id,title,description,target])=>`<article class="glossary-card" id="${id}"><small>${id.toUpperCase()}</small><h2>${t(title,locale)}</h2><p>${t(description,locale)}</p><a class="section-link" href="${routeLink(route,target,locale)}">${t('深入閱讀',locale)} →</a></article>`).join('')}</div></main>`;
  return shell({route,locale,title:'名詞小辭典',description:'用白話理解 benchmark、taxonomy、ontology、instance、case、trial 與評測術語。',body});
}
function searchPage(locale){
  const route='search.html';
  const body=`<main class="wrap" id="main-content">${head('搜尋整個研究網站','搜尋章節、情境、家族、論文、Ego 題型或指標；繁體、簡體和英文都能用。',route,locale)}<div class="standalone-search"><label for="site-search-input">${t('關鍵字或 ID',locale)}</label><input type="search" id="site-search-input" placeholder="${t('例如：摺衣、记忆、SC-H15、Ego4D',locale)}" aria-describedby="site-search-help"><p class="search-help" id="site-search-help" aria-live="polite"></p><div class="search-results" id="site-search-results"></div><noscript><p class="no-js-note">${t('全文搜尋需要 JavaScript；仍可從章節目錄和各資料庫閱讀完整內容。',locale)}</p></noscript></div></main>`;
  return shell({route,locale,title:'搜尋整個研究網站',description:`搜尋全部章節、${papers.length}篇文獻和完整情境、家族與指標。`,body});
}
function searchData(locale){
  const result=[];
  result.push({kind:'reference',title:translate('來源、任務環境、場景、測例與樣本：計數說明',locale),path:'counting.html',summary:translate('143是名錄、5308是索引；全庫環境定義和样本總量待整理。附COIN/PARTNR對照與1場景3任務環境算例。',locale),search:'counting environment source record dataset sample 來源 来源 紀錄 记录 索引 候選 候选 環境 环境 場景 场景 測例 测例 樣本 样本 數據 数据 5308 143 11827 100000'});
  result.push({kind:'reference',title:translate('Benchmark總庫：Survey分類、任務聯集與規則擴充',locale),path:'survey-union.html',summary:translate('143條已登記評測來源、250篇書目、5308條定義／設定索引與12個擴充例；環境／樣本總數待整理。',locale),search:'survey taxonomy benchmark union task grammar 規則 规则 聯集 联集 分類 分类 全部 143 5308 VIMA ARNOLD COIN CrossTask'});
  result.push({kind:'reference',title:translate('工程附錄：120測例與RGB工具執行',locale),path:'joint-pilot.html',summary:translate('合成影像、SQLite、機器人接觸操作與完整共同驗收。720次程式執行、80測例新初態結果及可下載資料。',locale),search:'joint multimodal tool use synthetic 自建 合成 多模態 多模态 工具 120 720 92.5 SQLite RGB data 資料 数据'});
  result.push({kind:'reference',title:translate('實際開發執行：50原生任務與五方法結果',locale),path:'execution.html',summary:translate('MuJoCo／Meta-World實際執行、新初態BC測試、reset修正、重播與完整結果。',locale),search:'execution simulation 實際 执行 執行 模擬 模拟 原生 1250 4286 Meta-World BC baseline 基線 基线 結果 结果'});
  result.push({kind:'reference',title:translate('文獻更新：250篇與Ego預測分類',locale),path:'research.html',summary:translate('新增82篇、68項前作比較、700搜尋候選的狀態、完整分類和Ego預測目標。',locale),search:'research literature 文獻 文献 分類 分类 prediction forecasting ego taxonomy 250 82 700'});
  for(const issue of readinessModel.issues){
    const content=[issue.id,issue.title,issue.current,issue.deliverable,issue.acceptance].join(' ');
    result.push({kind:'reference',title:translate('待完善｜'+issue.title,locale),path:`readiness.html#${issue.id.toLowerCase()}`,summary:translate(issue.priority+' · '+issue.deliverable,locale),search:tc(content)+' '+sc(tc(content))+' readiness audit 缺口 待完善'});
  }
  for(const row of comparisonModel.rows){
    const content=[row.name,row.domain,row.scenes,row.tasks,row.cases,row.materials,row.observation,row.difference].join(' ');
    result.push({kind:'reference',title:translate('比較｜'+row.name,locale),path:`compare.html#benchmark-${row.id}`,summary:translate(row.tasks+'；'+row.scenes,locale),search:tc(content)+' '+sc(tc(content))+' benchmark comparison 比較 比较'});
  }
  for(const chapter of chapters){
    result.push({kind:'chapter',title:translate(`${chapter.id.slice(1)} · ${chapter.title}`,locale),path:chapterRoute(chapter),summary:translate(descriptions[chapter.id],locale),search:tc(chapter.title+' '+plain(chapter.html))+' '+sc(tc(chapter.title+' '+plain(chapter.html)))});
  }
  for(const [key,info] of Object.entries(collectionInfo)){
    for(const card of extractedCards[key]){
      const $=cheerio.load(card.html);
      const title=$('h3').first().text();
      const textContent=plain(card.html);
      let description;
      if(key==='literature') description=$('p').toArray().map(p=>$(p).text()).find(value=>value.startsWith('用途與界線')) || textContent;
      else if(key==='tasks')description=$('p').toArray().slice(1,3).map(p=>$(p).text()).join(' ');
      else description=$('p').toArray().slice(0,2).map(p=>$(p).text()).join(' ');
      result.push({kind:info.kind,title:translate(title,locale),path:`${groupRoutes[info.group]}#${card.id}`,summary:translate(description.slice(0,180),locale),search:tc(textContent)+' '+sc(tc(textContent))});
    }
  }
  for(const group of ['axes','comparison','methods']){
    const section=groups[group][0];
    const content=groups[group].map(s=>s.title+' '+plain(s.html)).join(' ');
    result.push({kind:'reference',title:translate(section.title,locale),path:groupRoutes[group],summary:translate(plain(section.html).slice(0,120),locale),search:tc(content)+' '+sc(tc(content))});
  }
  result.push({kind:'reference',title:translate('主設計v0.7：前作聯集、Survey分類與任務規則擴充',locale),path:'design.html',summary:translate('全面收集benchmark及其領域／任務，建立來源聯集，再擴充任務定義、規則與流程。目錄與執行子集分開。',locale),search:tc(plain(unionSpecHTML))+' '+sc(tc(plain(unionSpecHTML)))+' overall design survey task union rule grammar v0.7'});
  result.push({kind:'reference',title:translate('規模比較與來源查核',locale),path:'scale-plan.html',summary:translate('v0.3 規模提案與全來源盤點證據；整體設計已更新至 v0.4。',locale),search:'scale all in one 规模 規模 比較 比较 2000 3000 2x 來源 联合库'});
  for(const record of browseRecords){
    const summary=`${record.source_work} · ${record.native_unit_zh} · 靜態紀錄，未完成 G2 去重`;
    result.push({kind:'native',title:record.native_id,path:`native-tasks.html#${record.anchor_id}`,summary:translate(summary,locale),search:`${record.native_id} ${record.title} ${record.source_work} ${record.native_aliases_or_variants.join(' ')} ${nativeSearchHints(record)}`});
  }
  return result;
}

async function copyStatic(dir,relativeDir=''){
  for(const entry of await fs.readdir(dir,{withFileTypes:true})){
    const name=path.posix.join(relativeDir,entry.name);
    if(entry.isDirectory())await copyStatic(path.join(dir,entry.name),name);
    else await write(name,await fs.readFile(path.join(dir,entry.name)));
  }
}
await copyStatic(path.join(ROOT,'static'));
await write('assets/favicon.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#146e5b"/><g fill="#e7f1d6"><rect x="15" y="16" width="13" height="13" rx="2"/><rect x="36" y="16" width="13" height="13" rx="2"/><rect x="15" y="37" width="13" height="13" rx="2"/><rect x="36" y="37" width="13" height="13" rx="2"/></g><path d="M28 22h8M22 29v8M42 29v8M28 43h8" stroke="#e7f1d6" stroke-width="3"/></svg>`);
for(const locale of LOCALES){
  await write(`${locale}/index.html`,homePage(locale));
  await write(`${locale}/chapters/index.html`,chaptersPage(locale));
  for(const chapter of chapters)await write(`${locale}/${chapterRoute(chapter)}`,readingPage(chapter,locale));
  for(const key of Object.keys(collectionInfo))await write(`${locale}/${groupRoutes[collectionInfo[key].group]}`,collectionPage(key,locale));
  for(const group of ['axes','comparison','methods'])await write(`${locale}/${groupRoutes[group]}`,referencePage(group,locale));
  await write(`${locale}/glossary.html`,glossaryPage(locale));
  await write(`${locale}/search.html`,searchPage(locale));
  await write(`${locale}/design.html`,overallDesignPage(locale));
  await write(`${locale}/compare.html`,renderComparisonPage(locale,comparisonModel,{t,escape,translate,relative,routeLink,head,shell,auditStatistics:comparisonStats}));
  await write(`${locale}/readiness.html`,renderReadinessPage(locale,readinessModel,{t,escape,relative,routeLink,breadcrumb,chapterNav,shell,implementation:implementationModel}));
  await write(`${locale}/execution.html`,renderExecutionPage(locale,executionModel,implementationModel,{t,escape,relative,routeLink,breadcrumb,chapterNav,shell}));
  await write(`${locale}/research.html`,renderResearchPage(locale,researchStats,papers,literatureAdditions,literatureLineage,{t,escape,relative,routeLink,breadcrumb,chapterNav,shell}));
  await write(`${locale}/joint-pilot.html`,renderJointPilotPage(locale,jointReport,jointDemos,jointDownload,{t,escape,relative,routeLink,head,shell}));
  await write(`${locale}/survey-union.html`,renderSurveyUnionPage(locale,unionStats,unionRegistry,unionSources,unionExtensions,{t,escape,relative,routeLink,head,shell}));
  await write(`${locale}/counting.html`,renderCountingPage(locale,unionStats,countingContract,{t,escape,relative,routeLink,head,shell}));
  await write(`${locale}/scale-plan.html`,scalePlanPage(locale));
  await write(`${locale}/native-tasks.html`,nativePage(locale));
  const data=searchData(locale);
  await write(`assets/search-${locale}.js`,`window.SEARCH_INDEX=${jsonSafe(data)};`);
}
const nativePayload={
  sources:Object.fromEntries(browseSources.map(source=>[source.id,{work:source.work,repo:source.resolved_repo,commit:source.commit,role:source.role,count:source.record_count}])),
  records:browseRecords.map(record=>({
    id:record.anchor_id,s:record.source_id,n:record.native_id,t:record.title,u:record.native_unit,b:record.inventory_bucket,p:record.definition_path,
    a:record.native_aliases_or_variants,ar:record.asset_reference_paths,
    v:record.native_metadata.configuration_only_derived_class===true,
    ds:record.native_metadata.dataset_registry_present,
    line:record.native_metadata.registration_line,
    h:nativeSearchHints(record)+' '+(record.additional_search||''),
    url:record.source_url
  }))
};
await write('assets/native-source-data.js',`window.NATIVE_SOURCE_DATA=${jsonSafe(nativePayload)};`);
for(const filename of ['SCALE_FIRST_SPEC_V0_3.md','SOURCE_INVENTORY_REPORT.md','native_source_inventory.csv','native_source_inventory.json','scale_first_plan.json','source_extraction_report.json','pinned_sources.json','inventory_statistics.json']){
  await write(`downloads/scale-first/${filename}`,await fs.readFile(path.join(SCALE_DIR,filename)));
}
for(const filename of ['OVERALL_DESIGN_V0_4.md','overall_design_plan.json','breadth_quota_template.csv','design_validation.json']){
  await write(`downloads/overall-design/${filename}`,await fs.readFile(path.join(DESIGN_DIR,filename)));
}
for(const filename of ['benchmark_matrix.json','benchmark_matrix.csv','benchmark_domains_matrix.csv','benchmark_features_matrix.csv','BENCHMARK_COMPARISON.md','source_verification.json','supplemental_source_verification.json','matrix_validation.json']){
  await write(`downloads/benchmark-comparison/${filename}`,await fs.readFile(path.join(COMPARISON_DIR,filename)));
}
for(const filename of ['gap_register.json','gap_register.csv','audit_statistics.json','milestones_v0_4.csv','version_index.json','READINESS_AUDIT_2026_09_25.md','readiness_audit.json']){
  await write(`downloads/readiness/${filename}`,await fs.readFile(path.join(READINESS_DIR,filename)));
}
for(const filename of ['execution_report.json','native_results.csv','method_summary.csv','protocol.json','provenance.json','learned_model_validation.json','heldout_trial_ledger.json','EXECUTION_EVIDENCE.md','model_download.json','difficulty_diagnostic.json','difficulty_diagnostic.csv']){
  await write(`downloads/execution/${filename}`,await fs.readFile(path.join(EXECUTION_DIR,filename)));
}
for(const filename of ['implementation_progress.json','implementation_gap_status.csv','IMPLEMENTATION_PROGRESS.md','DESIGN_ITERATION_V0_5.md','current_report.json','scene_source_ledger.json','scene_source_ledger.csv','watchact_pixel_sample_audit.json','milestones_v0_5.csv','release_targets_v0_5.json']){
  await write(`downloads/implementation/${filename}`,await fs.readFile(path.join(CONTENT,'implementation',filename)));
}
for(const filename of ['codebook.json','workflow_pattern_crosswalk.csv','CODEBOOK_V1.md']){
  await write(`downloads/ontology/${filename}`,await fs.readFile(path.join(CONTENT,'ontology',filename)));
}
for(const filename of ['typed_count_records.json','typed_count_records.csv','cell_evidence_index.json','cell_evidence_index.csv','cell_evidence_statistics.json']){
  await write(`downloads/benchmark-comparison/${filename}`,await fs.readFile(path.join(COMPARISON_DIR,filename)));
}
for(const filename of ['literature_additions.json','unified_literature.json','unified_literature.csv','literature_refresh_statistics.json','search_receipts.json','discovery_ledger.json','literature_lineage.json','LITERATURE_REFRESH.md']){
  await write(`downloads/literature-refresh/${filename}`,await fs.readFile(path.join(RESEARCH_DIR,filename)));
}
for(const filename of ['README_ZH.md','pilot_report.json','method_results.csv','condition_results.csv','case_ledger.csv','case_ledger.json','trial_ledger.csv','trial_ledger.json','entity_alignment.json','tool_schemas.json','workflow_candidate.json','database_schema.sql','archive_receipt.json','download_info.json','publication_receipt.json','pilot-report-zh-hant.pdf']){
  await write(`downloads/joint-pilot/${filename}`,await fs.readFile(path.join(JOINT_DIR,filename)));
}
await write('assets/joint-pilot-data.js',`window.JOINT_PILOT_DEMOS=${jsonSafe(jointDemos)};`);
for(const filename of await fs.readdir(UNION_DIR)){
  if(/\.(json|csv|md|pdf)$/.test(filename))await write(`downloads/survey-union/${filename}`,await fs.readFile(path.join(UNION_DIR,filename)));
}
for(const filename of ['COUNTING_GUIDE.md','counting_contract.json'])await write(`downloads/counting/${filename}`,await fs.readFile(path.join(COUNTING_DIR,filename)));
const rootHtml=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Robot-use Benchmark · 公開研究網站</title><meta name="description" content="繁體與簡體中文的機器人評測研究網站，從重點導讀到完整文獻、情境和章節。"><link rel="stylesheet" href="assets/site.css"><link rel="icon" href="assets/favicon.svg"><link rel="alternate" hreflang="zh-Hant" href="${config.siteUrl}/zh-hant/"><link rel="alternate" hreflang="zh-Hans" href="${config.siteUrl}/zh-hans/"><script>(()=>{let saved;try{saved=localStorage.getItem('robot-use-language')}catch{}const lang=['zh-hant','zh-hans'].includes(saved)?saved:/zh-(cn|sg|hans)/i.test(navigator.language)?'zh-hans':'zh-hant';location.replace(lang+'/index.html'+location.search+location.hash)})();</script></head><body><main class="wrap narrow" style="padding:80px 0"><div class="eyebrow">ROBOT-USE BENCHMARK</div><h1>從看懂示範，到可靠完成任務。</h1><p>公開研究設計、168 篇文獻與 180 個情境藍圖。<br>公开研究设计、168 篇文献与 180 个情境蓝图。</p><div class="cta-row"><a class="button" href="zh-hant/index.html" lang="zh-Hant">繁體中文 →</a><a class="button secondary" href="zh-hans/index.html" lang="zh-Hans">简体中文 →</a></div></main></body></html>`;
const scaleRoot=rootHtml
  .replace('從看懂示範，到可靠完成任務。','更多獨立任務，更廣評測覆蓋。')
  .replace('公開研究設計、168 篇文獻與 180 個情境藍圖。<br>公开研究设计、168 篇文献与 180 个情境蓝图。','主設計 v0.7：全面收集、Survey分類、任務聯集與規則擴充。<br>主设计 v0.7：全面收集、Survey分类、任务联集与规则扩充。<br>143條已登記評測來源、250篇書目、5,308條來源定義；完整收集與共同映射持續進行。')
  .replace('從重點導讀到完整文獻、情境和章節。','以規模與覆蓋優勢為主軸，附完整來源任務庫、文獻與章節。');
await write('index.html',scaleRoot.replace('</head>',`<link rel="canonical" href="${config.siteUrl}/"><meta property="og:type" content="website"><meta property="og:title" content="Robot-use Benchmark · 主設計 v0.7"><meta property="og:description" content="全面前作盤點、Survey分類與任務聯集，再擴充目標、規則和流程；目錄與執行子集分開。"><meta property="og:url" content="${config.siteUrl}/"><meta property="og:image" content="${config.siteUrl}/assets/social-card.png"><meta name="twitter:card" content="summary_large_image"></head>`));
await write('404.html',`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>找不到頁面 · Robot-use Benchmark</title><link rel="stylesheet" href="${config.siteUrl}/assets/site.css"></head><body><main class="wrap narrow" style="padding:90px 0"><div class="eyebrow">404</div><h1>這個頁面找不到了。<br>这个页面找不到了。</h1><p>可以回到首頁，從章節、情境或文獻重新找到內容。</p><div class="cta-row"><a class="button" href="${config.siteUrl}/zh-hant/">繁體首頁</a><a class="button secondary" href="${config.siteUrl}/zh-hans/">简体首页</a></div></main></body></html>`);
await write('.nojekyll','');
await write('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
await write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${allPageRecords.map(p=>`<url><loc>${escape(config.siteUrl+'/'+p.file)}</loc><lastmod>${config.publicationDate||config.auditDate}</lastmod></url>`).join('')}</urlset>`);
const manifest={
  siteUrl:config.siteUrl,repository:config.repository,languages:LOCALES,researchDate:config.researchDate,designDate:config.designDate,designVersion:config.designVersion,auditDate:config.auditDate,
  iterationVersion:config.iterationVersion,literatureRefreshDate:researchStats.cutoff_date,
  pages:allPageRecords,counts:{chapters:chapters.length,papers:papers.length,tasks:tasks.length,families:families.length,probes:probes.length,metrics:metrics.length,comparisonPriorWorks:comparisonModel.prior_works,comparisonRows:comparisonModel.rows.length,nativeSourceRecords:browseRecords.length,sourceRepositories:unionStats.source_repositories,sourceSnapshots:unionStats.source_snapshots,validatedCases:0,simulatorRuns:executionModel.recorded_trial_history_total,nativeHeldoutTestCases:executionModel.held_out_initial_cases,nativeHeldoutMethodTrials:executionModel.held_out_method_trials},
  sourceSections:sections.length,sourceSectionIds:sections.map(s=>s.id),assets:generated.filter(file=>!file.endsWith('.html')),
  pdf:'downloads/current-report-zh-hant.pdf',historicalPdf:'downloads/full-report-zh-hant.pdf',pdfPages:currentPDF.pages,pdfSha256:currentPDF.sha256,
  jointPilot:{workflowCandidates:1,cases:jointReport.total_cases,testCases:jointReport.test_cases,programTrials:jointReport.total_frozen_program_trials,supplementalAnnotations:jointReport.supplemental_annotation_trials,canonicalG2:null},
  surveyUnion:{sourceRecords:unionStats.total_source_records,registeredEvaluationSources:unionStats.benchmark_or_eval_resource_records,taskSourceSnapshots:unionStats.source_snapshots,robotTaskCandidates:unionStats.native_robot_task_candidates,humanActivityDefinitions:unionStats.human_activity_definitions,extensionExamples:unionExtensions.length,completeSearch:false},
  counting:{version:countingContract.version,taskEnvironmentDefinitions:null,sceneLayouts:null,sourceSampleTotals:null,extractedSourceIndices:unionStats.total_source_records,definitionsRequireLocalExecution:false},
  note:'Main research: comprehensive source survey, taxonomy, task union and task/rule extensions. Runtime pilots are engineering appendices; collection and execution have separate counts.'
};
await fs.mkdir(path.join(ROOT,'verification'),{recursive:true});
await fs.writeFile(path.join(ROOT,'verification/build-manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({generatedPages:allPageRecords.length,languages:LOCALES,counts:manifest.counts,sourceSections:sections.length,output:OUT},null,2));
