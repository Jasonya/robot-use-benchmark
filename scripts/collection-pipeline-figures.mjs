import fs from 'node:fs/promises';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';

export async function loadPipelineWalkthrough(downloads) {
  const read=async kind=>gunzipSync(await fs.readFile(path.join(downloads,`${kind}s.jsonl.gz`)))
    .toString('utf8').trim().split('\n').map(JSON.parse);
  const [tasks,environments,evaluators,sources]=await Promise.all(['task','environment','evaluator','source'].map(read));
  const calvinTasks=tasks.filter(row=>row.identity.namespace==='calvin');
  const task=calvinTasks.find(row=>row.identity.native_id==='open_drawer');
  const scenes=environments.filter(row=>row.identity.namespace==='calvin');
  const source=sources.find(row=>row.data.paper_id==='P065');
  const evaluator=evaluators.find(row=>row.identity.namespace==='calvin');
  assert.ok(task&&source&&evaluator&&scenes.length);
  assert.ok(task.source_refs.includes(source.id));
  assert.equal(task.data.canonical_task_id,null);
  assert.deepEqual(task.data.domain_refs,[]);
  assert.equal(task.evaluation_release_eligible,false);
  return {
    version:'pipeline-figures-0.1',example_kind:'actual_catalog_record',
    task,source,evaluator,
    other_collected_definitions:{
      task_count:calvinTasks.length,scene_ids:scenes.map(row=>row.identity.native_id),
      task_scene_bindings:'not_asserted_by_this_illustration',
    },
    scope:'Source-level purposes are coded. Per-task domain bindings, canonical equivalence and executable cases are still pending.',
  };
}

const number=value=>Number(value).toLocaleString('en-US');

function drawing(key,locale,mobile,title,description,width,height,helpers) {
  const {translate,escape}=helpers;
  const label=value=>escape(translate(String(value),locale));
  const id=`${key}-${locale}-${mobile?'mobile':'wide'}`;
  const pieces=[];
  const text=(x,y,value,{size=18,weight=400,fill='#36564c',anchor='start',mono=false}={})=>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${mono?' class="code"':''}>${mono?escape(value):label(value)}</text>`;
  const node=({x,y,w,h=142,title,kicker,lines=[],kind='known',mono=false})=>{
    const colors={
      known:{fill:'#edf7f1',stroke:'#398063',ink:'#1b654b'},
      pending:{fill:'#fff8e9',stroke:'#a87b2d',ink:'#78581f'},
      concept:{fill:'#f1f5f8',stroke:'#718a99',ink:'#334f60'},
    }[kind];
    pieces.push(`<g class="diagram-node" data-node-kind="${kind}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"${kind==='pending'?' stroke-dasharray="7 5"':''}/>
      ${text(x+18,y+24,kicker,{size:14,weight:650,fill:colors.ink})}
      ${text(x+18,y+53,title,{size:mobile?21:22,weight:700,fill:'#173c32'})}
      ${lines.map((line,index)=>text(x+18,y+84+index*24,line,{size:mono?16:18,mono})).join('')}
    </g>`);
  };
  const arrow=(d,{pending=false,both=false,color}={})=>{
    const kind=color==='concept'?'concept':pending?'pending':'known';
    pieces.push(`<path d="${d}" fill="none" stroke="${{known:'#398063',pending:'#9a742c',concept:'#688391'}[kind]}" stroke-width="2.6"${pending?' stroke-dasharray="7 6"':''} marker-end="url(#${id}-${kind})"${both?` marker-start="url(#${id}-${kind})"`:''}/>`);
  };
  const note=(x,y,value,options)=>pieces.push(text(x,y,value,options));
  const legend=(y,concept=false)=>{
    if(concept) {
      if(mobile) {
        note(26,y,'方框：紀錄類型',{size:15});
        arrow(`M 28 ${y+27} H 78`,{both:true,color:'concept'});
        note(92,y+32,'雙箭頭：多對多',{size:15});
        arrow(`M 28 ${y+62} H 78`,{color:'concept'});
        note(92,y+67,'單箭頭：引用或支持',{size:15});
      } else {
        note(40,y,'圖例｜方框：紀錄類型',{size:16,weight:600});
        arrow(`M 370 ${y-5} H 435`,{both:true,color:'concept'});
        note(452,y,'多對多',{size:16});
        arrow(`M 725 ${y-5} H 790`,{color:'concept'});
        note(807,y,'引用或支持',{size:16});
      }
    } else if(mobile) {
      pieces.push(`<rect x="26" y="${y-14}" width="18" height="18" rx="3" fill="#edf7f1" stroke="#398063"/>`);
      note(56,y,'綠色實框：已有紀錄或驗證',{size:15});
      pieces.push(`<rect x="26" y="${y+22}" width="18" height="18" rx="3" fill="#fff8e9" stroke="#a87b2d" stroke-dasharray="4 3"/>`);
      note(56,y+36,'黃色虛框：尚待審核或整合',{size:15});
      arrow(`M 28 ${y+68} H 74`);
      note(91,y+74,'實線：已有資料的傳遞',{size:15});
      arrow(`M 28 ${y+104} H 74`,{pending:true});
      note(91,y+110,'虛線：須補件或驗證後成立',{size:15});
    } else {
      pieces.push(`<rect x="40" y="${y-15}" width="18" height="18" rx="3" fill="#edf7f1" stroke="#398063"/>`);
      note(72,y,'綠色實框：已有紀錄或驗證',{size:16});
      pieces.push(`<rect x="545" y="${y-15}" width="18" height="18" rx="3" fill="#fff8e9" stroke="#a87b2d" stroke-dasharray="4 3"/>`);
      note(577,y,'黃色虛框：尚待審核或整合',{size:16});
      arrow(`M 43 ${y+33} H 98`);
      note(118,y+39,'實線：已有資料的傳遞',{size:16});
      arrow(`M 547 ${y+33} H 602`,{pending:true});
      note(622,y+39,'虛線：須補件或驗證後成立',{size:16});
    }
  };
  const finish=()=>{
    return `<svg xmlns="http://www.w3.org/2000/svg" xml:lang="${locale==='zh-hant'?'zh-Hant':'zh-Hans'}" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="${id}-title ${id}-desc">
<title id="${id}-title">${label(title)}</title><desc id="${id}-desc">${label(description)}</desc>
<defs>${Object.entries({known:'#398063',pending:'#9a742c',concept:'#688391'}).map(([kind,color])=>`<marker id="${id}-${kind}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${color}"/></marker>`).join('')}</defs>
<style>text{font-family:"Noto Sans CJK ${locale==='zh-hans'?'SC':'TC'}","PingFang ${locale==='zh-hans'?'SC':'TC'}","Microsoft JhengHei",Arial,sans-serif}.code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}</style>
<rect width="${width}" height="${height}" fill="#fff"/>
${text(mobile?26:36,36,title,{size:mobile?22:26,weight:700,fill:'#173c32'})}
${pieces.join('\n')}
</svg>\n`;
  };
  return {node,arrow,note,legend,finish};
}

function flowFigure(locale,mobile,model,helpers) {
  const report=model.report;
  const d=drawing('pipeline-flow',locale,mobile,'從原作到目錄，再到可評測發布',
    '上游工作限已收錄來源與已取得清單。標準目錄可以先發布；可評測版仍須經過語義對齊、素材建置及判分驗證。',mobile?420:1180,mobile?1670:880,helpers);
  const stages=[
    ['01 發現與篩選','已有來源審閱',[`${number(model.bibliographyCount)} 篇書目篩查`,`${number(report.counts.source)} 份來源審閱`]],
    ['02 固定版本','限已取得的快照',['原文、版本、hash','保留來源及取得紀錄']],
    ['03 擷取原作','已有部分來源清單',['任務、場景、題目 ID','原生單位與 split 保留']],
    ['04 統一格式','本次匯入驗證通過',[`${number(report.validation.schema_valid_records)} 筆目錄紀錄`,'可回查原始欄位']],
    ['05 語義對齊','尚待逐 ID 審核',['任務等價、用途對應','場景與素材重用']],
    ['06 建立測例','素材與協定待齊',['輸入、初態、目標','觀測、動作與預算']],
    ['07 驗證評測','尚未完成全庫驗證',['split、正例與近失敗','依類型檢查判分器']],
    ['08 發布評測版','可評測子集待建',['驗證通過才納入','固定協定及版本']],
  ];
  const positions=mobile
    ? [92,242,392,542,870,1020,1170,1320].map(y=>({x:34,y,w:352,h:130}))
    : [36,310,584,858].map(x=>({x,y:86,w:240,h:146}))
      .concat([36,310,584,858].map(x=>({x,y:512,w:240,h:146})));
  for(let i=0;i<stages.length;i++){
    const [title,kicker,lines]=stages[i];
    d.node({...positions[i],title,kicker,lines,kind:i<4?'known':'pending'});
  }
  for(const i of [0,1,2,4,5,6]) {
    const a=positions[i],b=positions[i+1];
    d.arrow(mobile?`M 210 ${a.y+a.h} V ${b.y-7}`:`M ${a.x+a.w} ${a.y+73} H ${b.x-7}`,{pending:i>=4});
  }
  if(mobile){
    d.node({x:34,y:705,w:352,h:112,title:'目錄版已發布',kicker:'08 的目錄支線',lines:['來源、定義與題目元資料']});
    d.arrow('M 210 672 V 698');
    d.arrow('M 386 607 H 404 V 935 H 393',{pending:true});
    d.note(38,859,'後續整合：需逐項補資料與證據',{size:15});
    d.note(34,1484,'驗證未過 → 回相關步驟補件與重審',{size:15});
    d.legend(1520);
  } else {
    d.node({x:790,y:290,w:308,h:112,title:'目錄版已發布',kicker:'08 的目錄支線',lines:['來源、定義與題目元資料']});
    d.arrow('M 978 232 V 283');
    d.note(756,265,'目錄可先發布',{size:16});
    d.arrow('M 1098 159 H 1134 V 465 H 156 V 505',{pending:true});
    d.note(352,449,'後續整合：需逐項補資料與證據',{size:17});
    d.arrow('M 704 658 V 714 H 156 V 665',{pending:true});
    d.note(305,704,'驗證未過 → 回相關步驟補件與重審',{size:16});
    d.note(40,764,'綠色限框內標示的範圍；不表示所有來源、素材或 task 映射都已完成。',{size:16});
    d.legend(808);
  }
  return d.finish();
}

function relationshipFigure(locale,mobile,model,helpers) {
  const r=model.report;
  const d=drawing('pipeline-relations',locale,mobile,'領域、環境、任務如何串成測例',
    '方框表示六種資料紀錄。任務與領域、任務與環境可以多對多；測例引用目標、相容環境或觀測歷史和判分器。連線表示資料模型，不宣稱全庫映射已完成。',mobile?420:1180,mobile?1310:720,helpers);
  const nodes={
    domain:{title:'領域：用途',kicker:'domains',lines:[`${r.counts.domain} 類來源用途`,'逐任務用途仍待對應']},
    task:{title:'任務：目標與規則',kicker:'tasks',lines:[`${number(r.task_kinds.robot_task_definition)} 個 robot 任務條目`,'另有資訊題型與人類活動']},
    environment:{title:'環境：場景／布局',kicker:'environments',lines:[`${number(r.counts.environment)} 個命名場景定義`,'相容性與重用需核對']},
    case:{title:'測例：條件與輸入',kicker:'cases',lines:[`${number(r.counts.case)} 筆題目元資料`,'保留 split；素材待齊']},
    evaluator:{title:'評估方式／判分器',kicker:'evaluators',lines:['4 類評分方式',`${r.counts.evaluator} 個原生判分器索引`]},
    source:{title:'來源：原作與證據',kicker:'sources',lines:[`${r.counts.source} 份已審閱來源`,'版本、原生 ID、引用']},
  };
  const positions=mobile?{
    source:{x:34,y:94,w:352,h:132},domain:{x:34,y:272,w:352,h:132},
    task:{x:34,y:456,w:352,h:132},environment:{x:34,y:644,w:352,h:132},
    case:{x:34,y:850,w:352,h:132},evaluator:{x:34,y:1054,w:352,h:132},
  }:{
    domain:{x:36,y:108,w:256,h:142},task:{x:440,y:108,w:304,h:142},
    environment:{x:890,y:108,w:256,h:142},source:{x:36,y:374,w:256,h:142},
    case:{x:440,y:374,w:304,h:142},evaluator:{x:890,y:374,w:256,h:142},
  };
  for(const [key,value]of Object.entries(nodes))d.node({...positions[key],...value,kind:'concept'});
  if(mobile) {
    d.note(35,253,'以下各筆皆保留來源、版本與證據',{size:15});
    d.arrow('M 210 412 V 448',{both:true,color:'concept'});
    d.note(234,436,'多對多',{size:15});
    d.arrow('M 210 596 V 636',{both:true,color:'concept'});
    d.note(234,620,'多對多',{size:15});
    d.arrow('M 210 776 V 842',{color:'concept'});
    d.note(230,814,'場景／初態',{size:15});
    d.arrow('M 34 522 H 14 V 916 H 27',{color:'concept'});
    d.note(34,817,'目標也直接被測例引用',{size:14});
    d.arrow('M 210 982 V 1046',{color:'concept'});
    d.note(234,1020,'依此判分',{size:15});
    d.legend(1220,true);
  } else {
    d.arrow('M 301 179 H 431',{both:true,color:'concept'});
    d.note(367,157,'多對多',{size:16,anchor:'middle'});
    d.arrow('M 753 179 H 881',{both:true,color:'concept'});
    d.note(817,157,'多對多',{size:16,anchor:'middle'});
    d.arrow('M 592 250 V 366',{color:'concept'});
    d.note(613,313,'引用目標／規則',{size:16});
    d.arrow('M 1018 250 V 307 H 792 V 445 H 752',{color:'concept'});
    d.note(854,290,'場景／初態',{size:16});
    d.arrow('M 164 374 V 258',{color:'concept'});
    d.note(178,315,'用途依據',{size:16});
    d.arrow('M 292 445 H 432',{color:'concept'});
    d.note(365,421,'來源與證據',{size:16,anchor:'middle'});
    d.arrow('M 744 479 H 882',{color:'concept'});
    d.note(822,500,'依此判分',{size:16,anchor:'middle'});
    d.note(40,571,'任務＋相容場景或觀測歷史＋具體輸入與預算＋判分約定 → 測例',{size:19,weight:650});
    d.note(40,607,'這是資料結構圖；連線不表示全庫映射已完成。領域 × 環境 × 任務不能直接當題數。',{size:16});
    d.legend(666,true);
  }
  return d.finish();
}

function walkthroughFigure(locale,mobile,model,helpers) {
  const w=model.walkthrough,t=w.task;
  const d=drawing('pipeline-example',locale,mobile,'範例：CALVIN 開抽屜如何入庫',
    '使用已匯入的 open_drawer 真實紀錄。原生身份、checker 與來源位置保留到標準目錄；domain_refs 和 canonical_task_id 仍待審核，不自動成為可評測題。',mobile?420:1180,mobile?1340:830,helpers);
  const blocks=[
    {title:'原作任務索引',kicker:`已取得 · ${w.source.data.paper_id}`,kind:'known',mono:true,lines:[
      `native_id: ${t.identity.native_id}`,
      `checker: ${t.native.checker_signature_name}`,
      `unit: ${t.data.native_unit}`,
      `commit: ${t.identity.revision.slice(0,10)}…`,
    ]},
    {title:'標準目錄紀錄',kicker:'已完成格式匯入',kind:'known',mono:true,lines:[
      `entity_type: ${t.entity_type}`,
      `namespace: ${t.identity.namespace}`,
      `native_id: ${t.identity.native_id}`,
      `release_tier: ${t.release_tier}`,
      'native + provenance + hash',
    ]},
    {title:'成為測例前還要補',kicker:'尚待審核與驗證',kind:'pending',lines:[
      '逐任務用途與等價判定',
      '相容場景、初態與素材',
      '觀測、預算、split 與判分',
      '可解性及近失敗檢查',
    ]},
  ];
  const positions=mobile?[{x:34,y:98,w:352,h:220},{x:34,y:366,w:352,h:246},{x:34,y:860,w:352,h:226}]
    :[{x:36,y:108,w:338,h:242},{x:426,y:108,w:338,h:242},{x:816,y:108,w:328,h:242}];
  for(let i=0;i<blocks.length;i++)d.node({...positions[i],...blocks[i]});
  if(mobile) {
    d.arrow('M 210 318 V 358');
    d.arrow('M 210 612 V 649');
    d.note(231,345,'轉換',{size:15});
    d.node({x:34,y:656,w:352,h:177,title:'保留真實狀態',kicker:'以下為目前欄位值',kind:'pending',mono:true,lines:[
      'canonical_task_id: null','domain_refs: []','evaluation_release_eligible:','  false',
    ]});
    d.arrow('M 386 477 H 404 V 839 H 210 V 852',{pending:true});
    d.note(34,1125,`同來源另收錄 ${w.other_collected_definitions.task_count} 任務、${w.other_collected_definitions.scene_ids.length} 場景。`,{size:15});
    d.note(34,1152,'這些清單不直接相乘成題數。',{size:15});
    d.legend(1186);
  } else {
    d.arrow('M 374 229 H 418');
    d.arrow('M 764 229 H 808',{pending:true});
    d.node({x:426,y:392,w:338,h:177,title:'保留真實狀態',kicker:'以下為目前欄位值',kind:'pending',mono:true,lines:[
      'canonical_task_id: null','domain_refs: []','evaluation_release_eligible:','  false',
    ]});
    d.arrow('M 595 350 V 383');
    d.arrow('M 494 350 V 375 H 204 V 356');
    d.note(43,420,`可回查來源 YAML 第 ${t.native.definition_line} 行`,{size:17});
    d.note(43,449,'原始紀錄保存在 native',{size:17});
    d.note(43,478,'欄位位置與 hash 保存在 provenance',{size:15});
    d.note(820,423,'來源層級用途已歸納；',{size:17});
    d.note(820,451,'逐任務對應仍需寫入。',{size:17});
    d.note(40,620,'1 個原生任務條目 → 1 個標準目錄紀錄；格式轉換不增加任務數。',{size:19,weight:650});
    d.note(40,658,`CALVIN 另有 ${w.other_collected_definitions.task_count} 個任務條目及 ${w.other_collected_definitions.scene_ids.length} 個場景定義；未建立合法配對前，不相乘成題數。`,{size:17});
    d.legend(741);
  }
  return d.finish();
}

export function buildPipelineFigures(model,helpers) {
  const specs=[
    {id:'flow',file:'pipeline-flow',title:'圖 1｜整條流程與兩種發布',caption:'沿箭頭看資料如何前進。目錄版可以先發布；可評測版需要經過語義對齊、素材建置與判分驗證。綠色限節點內標示的範圍。',create:flowFigure},
    {id:'relations',file:'pipeline-relations',title:'圖 2｜領域、環境、任務與測例',caption:'雙箭頭表示多對多，單箭頭表示引用或支持。圖中數字來自現有目錄；連線是資料模型，並非全庫已完成映射。互動題引用場景，影片題可引用觀測歷史。',create:relationshipFigure},
    {id:'example',file:'pipeline-example',title:'圖 3｜真實紀錄如何標準化',caption:'以 CALVIN 的 open_drawer 紀錄走一次轉換。原生 ID、版本與 checker 保留；空的用途對應、未決的共同任務 ID 和不可評測狀態也忠實保留。',create:walkthroughFigure},
  ];
  return specs.map(({create,...spec})=>({...spec,images:Object.fromEntries(
    ['zh-hant','zh-hans'].map(locale=>[locale,{
      desktop:create(locale,false,model,helpers),mobile:create(locale,true,model,helpers),
    }]))}));
}

export function renderPipelineFigure(figure,locale,{t}) {
  const base=`../downloads/collection-pipeline/figures/${figure.file}-${locale}`;
  const conceptual=figure.id==='relations';
  return `<figure class="pipeline-figure" id="pipeline-figure-${figure.id}" data-pipeline-figure="${figure.id}">
    <figcaption><h2>${t(figure.title,locale)}</h2><p>${t(figure.caption,locale)}</p></figcaption>
    <picture><source media="screen and (max-width: 650px)" srcset="${base}-mobile.svg"><img src="${base}.svg" alt="${t(figure.title+'。'+figure.caption,locale)}" decoding="async"></picture>
    <div class="pipeline-legend" aria-label="${t('圖例',locale)}">${conceptual
      ? `<span><i class="legend-concept" aria-hidden="true"></i>${t('方框：紀錄類型',locale)}</span><span><b aria-hidden="true">↔</b>${t('多對多關係',locale)}</span><span><b aria-hidden="true">→</b>${t('引用或支持',locale)}</span>`
      : `<span><i class="legend-known" aria-hidden="true"></i>${t('已有紀錄或驗證',locale)}</span><span><i class="legend-pending" aria-hidden="true"></i>${t('尚待審核或整合',locale)}</span><span><b aria-hidden="true">→</b>${t('實線傳遞資料；虛線需補條件',locale)}</span>`}
    </div>
    <div class="pipeline-figure-actions"><a href="${base}.svg" target="_blank" rel="noopener">${t('放大圖',locale)} ↗</a><a href="${base}.svg" download>${t('下載橫式 SVG',locale)}</a><a href="${base}-mobile.svg" download>${t('下載直式 SVG',locale)}</a><a href="#pipeline-visual-guide">${t('回到三張圖導覽',locale)} ↑</a></div>
  </figure>`;
}
