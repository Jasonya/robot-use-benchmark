import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';

export const walkthroughStages=['找來源','固定版本','擷取原作','統一欄位','語義對齊','建立測例','驗證評測','發布更新'];
const step=(number,status,title,input,action,output,why,extra={})=>({
  number,stage:walkthroughStages[number-1],status,title,input,action,output,why,...extra,
});

export async function loadWorkedExamples(downloads,calvin,evidence) {
  const read=async kind=>gunzipSync(await fs.readFile(path.join(downloads,`${kind}s.jsonl.gz`))).toString('utf8').trim().split('\n').map(JSON.parse);
  const [samples,tasks,sources,evaluators]=await Promise.all([
    fs.readFile(path.join(downloads,'examples.json'),'utf8').then(JSON.parse),
    read('task'),read('source'),read('evaluator'),
  ]);
  const qa=samples.find(row=>row.entity_type==='case'&&row.identity.native_id===evidence.openeqa.question_id);
  const qaTask=tasks.find(row=>row.id===qa?.data.task_ref);
  const qaSource=sources.find(row=>row.data.paper_id==='P038');
  const qaEvaluator=evaluators.find(row=>row.id===qa?.data.evaluator_ref);
  assert.ok(qa&&qaTask&&qaSource&&qaEvaluator);
  assert.equal(qa.data.source_record_sha256,evidence.openeqa.source_record_sha256);
  assert.equal(qa.data.observation_ref,evidence.openeqa.episode_history);
  assert.equal(qa.data.environment_ref,null);
  assert.equal(qa.evaluation_release_eligible,false);
  assert.ok(qa.source_refs.includes(qaSource.id));
  assert.equal(calvin.task.identity.native_id,evidence.calvin.native_id);
  assert.equal(calvin.task.native.checker_signature_name,evidence.calvin.checker);
  assert.equal(calvin.task.native.definition_sha256,evidence.calvin.task_definition.sha256);
  assert.ok(calvin.evaluator.data.source_files.some(file=>file.sha256===evidence.calvin.checker_definition.sha256));
  assert.ok(qaEvaluator.data.source_files.some(file=>file.sha256===evidence.openeqa.evaluator_definition.sha256));

  const examples=[
    {
      id:'calvin',name:'CALVIN：機器人把抽屜拉開',short_name:'開抽屜',
      kind:'互動操作任務',mission:'把「開抽屜」這個原作任務收進總庫，最後讓機器人能接受相同條件的評測。',
      anchor:'這八步追蹤同一個 open_drawer 任務；後面的測例建置與實測仍是待辦。',
      current:'已有原作任務、場景與 checker 引用；尚未由本次匯入建立可評測測例。',
      source_ref:calvin.source.id,record_ref:calvin.task.id,
      steps:[
        step(1,'known','先找到「開抽屜」是誰定義的',
          'CALVIN 論文、官方程式庫，以及其中的開抽屜任務。',
          '確認原作收了什麼任務、怎麼提供場景、如何判斷完成。',
          '一筆 CALVIN 來源紀錄 P065，連到原作及任務清單。',
          '先把來源找對，後面每個目標、參數和判分條件才有依據。',
          {state:'本例來源已審閱',evidence_keys:['calvin.task_definition']}),
        step(2,'known','把這一版原作固定下來',
          '官方任務 YAML，以及 calvin_env 的成功檢查程式。',
          '保存各自的版本與檔案 hash。任務設定和環境程式可能來自不同 commit。',
          '可重找的任務檔、checker 檔及版本紀錄。',
          '日後原作更新成功門檻，舊結果仍能對回當時用的規則。',
          {state:'相關來源檔案已固定',evidence_keys:['calvin.task_definition','calvin.checker_definition']}),
        step(3,'known','讀出「拉開多少才算完成」',
          'open_drawer 這一行設定，以及 move_door_rel 的程式內容。',
          '核對抽屜關節 base__drawer 和門檻 0.12；實作檢查的是終值減初值，必須大於門檻。',
          '帶有原作位置的任務條件筆記：目標關節、checker、0.12 與嚴格大於的關係。',
          '「看起來打開」太模糊；這一步讓任務有可檢查的完成條件。0.12 保留原作關節座標單位。',
          {state:'本輪已核對原作條件；未跑模擬',evidence_keys:['calvin.task_definition','calvin.checker_definition']}),
        step(4,'known','把這條任務放進共同目錄',
          '原生任務 ID、名稱、來源、checker 引用和剛才的固定版本。',
          '保存成一條 task 紀錄，保留 native 原始欄位與 provenance 出處。',
          '一條標準化的 open_drawer 任務紀錄，原生 ID 仍可查。',
          '這樣可以和其他來源一起搜尋、比對；格式轉換本身不增加任務數，也不等於能執行。',
          {state:'標準目錄已有這條紀錄',record:{
            entity_type:calvin.task.entity_type,namespace:calvin.task.identity.namespace,
            native_id:calvin.task.identity.native_id,release_tier:calvin.task.release_tier,
            canonical_task_id:calvin.task.data.canonical_task_id,domain_refs:calvin.task.data.domain_refs,
          }}),
        step(5,'pending','再判斷它跟其他「開抽屜」是否相同',
          '這條 CALVIN 任務，以及其他 benchmark 的開抽屜定義。',
          '比較對象、起終狀態、必要過程和成功容差；再寫入逐任務用途與等價／衍生關係。',
          '後續應產生：有依據的任務對照表，並保留規則差異。',
          '來源層級已能歸納居家用途；逐任務的用途綁定和跨來源合併仍需明確記錄，不能只靠名稱。',
          {state:'共同任務與逐任務用途對應待完成'}),
        step(6,'pending','把「任務定義」做成一個具體考題',
          'open_drawer 任務、可用場景清單及 checker 引用。',
          '選定相容場景，取得資產，設定抽屜初態、機器人觀測、控制方式及動作預算。',
          '後續應產生：一份可重建同樣條件的開抽屜 case。',
          '同一個任務可有不同初態；每題都要有合法且可重現的設定，不能把任務數與場景數直接相乘。',
          {state:'場景／初態／素材／評測約定待整合'}),
        step(7,'pending','檢查判分器是否真的分得出完成與未完成',
          '上一個步驟的具體測例、原作 checker，以及應通過和不應通過的狀態。',
          '先核對邊界，再用實際執行留下的狀態／軌跡驗證，並檢查跨 split 重用。',
          '後續應產生：判分驗證報告、執行證據與固定的評測協定。',
          '有一段 checker 程式，還需要證明它在我們接好的環境與資料上運作正確。',
          {state:'完整環境與執行驗證尚未完成',
            illustration:'以下只是原作條件的手算示意，使用假設關節座標；不是機器人實測成績。',
            arithmetic:evidence.calvin.arithmetic_examples}),
        step(8,'partial','最後分開發布「目錄」與「可評測題」',
          '目前已有的任務紀錄，以及未來通過驗證的 case 和 evaluator。',
          '目錄可先收錄原作定義；可評測版等素材、協定及判分驗證完成後再納入。',
          '現在：可查 open_drawer 的來源與標準紀錄。之後：再發布已驗證的開抽屜測例。',
          '讀者因此能分清「收錄了這個任務」與「已經可以拿來測模型」。',
          {state:'目錄已發布；本次沒有新增可評測題'}),
      ],
    },
    {
      id:'openeqa',name:'OpenEQA：辨認電視上方的物體',short_name:'看觀測回答',
      kind:'觀測問答',mission:`看房間的觀測紀錄，回答「${evidence.openeqa.question_zh}」；來源參考答案是「${evidence.openeqa.reference_answer_zh}」。`,
      anchor:'這八步追蹤同一個 question_id。本例採「看觀測紀錄回答」的路徑；題幹依原作改寫，答案來自來源標註。',
      current:'題目與參考答案已核對，題目元資料已入庫；對應觀測素材與模型評測仍待整合。',
      source_ref:qaSource.id,record_ref:qa.id,
      steps:[
        step(1,'known','先找到這道題的原作',
          'OpenEQA 論文與官方題目檔中的一題物件辨識問答。',
          '確認這是依房間觀測回答問題的 benchmark，並保存原作身份。',
          '一筆 OpenEQA 來源紀錄 P038，能追到題目檔和評測程式。',
          '同樣放進 Robot-use 總庫，這題要求輸出答案；它的資料與判分需求會沿著自己的型別處理。',
          {state:'來源與題目身份已核對',evidence_keys:['openeqa.question_definition']}),
        step(2,'known','固定題目檔與評測程式的版本',
          '官方 open-eqa-v0.json，以及使用 LLM-match 的評測入口。',
          '保存版本、檔案 hash 和題目位置；後續裁判模型與設定也需要固定。',
          '可重找的題目定義與判分程式引用。',
          '日後題幹、答案或裁判改版，才不會把不同規則下的分數混在一起。',
          {state:'來源檔案已固定；裁判執行設定未凍結',evidence_keys:['openeqa.question_definition','openeqa.evaluator_definition']}),
        step(3,'known','把「問題、答案、觀測」三者連起來',
          `題目問電視上方的白色物體；來源參考答案是${evidence.openeqa.reference_answer_zh}。`,
          '保留 question_id、物件辨識題型、episode_history 觀測引用，以及問題與答案的來源位置。',
          '一條能指出「哪道問題、對應哪段觀測、依哪個答案評分」的題目紀錄。',
          '只有答案文字還不夠，模型必須看到該題允許的觀測。參考答案是從來源標註取得，並非本次模型辨識結果。',
          {state:'題目與答案已核對；觀測尚未完整整合',evidence_keys:['openeqa.question_definition']}),
        step(4,'known','存成共同格式中的一道 QA 元資料',
          '原生 question_id、觀測引用、題型、來源及 evaluator 引用。',
          '保存成 case_kind=qa；保留原作未分 split 的狀態，並將參考答案與模型輸入分開。',
          '一條標準 QA 元資料，連到原生物件辨識題型和判分器索引。',
          'episode_history 是觀測引用；目前沒有互動場景綁定，所以不把它計成新的可操作環境。',
          {state:'標準目錄已有這題元資料',record:{
            case_kind:qa.data.case_kind,native_id:qa.identity.native_id,
            native_split:qa.data.native_split,observation_ref:qa.data.observation_ref,
            environment_ref:qa.data.environment_ref,task_link_kind:qa.data.task_link_kind,
            evaluation_release_eligible:qa.evaluation_release_eligible,
          }}),
        step(5,'partial','核對題型與同源重複',
          '這題的 object recognition 題型，以及可能重用同一觀測的其他問題。',
          '保留已有的原生題型關聯，再檢查跨來源是否重複收錄，並區分同觀測中的不同問題。',
          '目前已有原生題型引用；後續還要補共同分類與同源關係的審核紀錄。',
          '同一段觀測可以有多道不同問題；同一道題換了來源名稱，也不能因此當成全新的題目。',
          {state:'原生題型已接；跨來源對齊與去重待完成'}),
        step(6,'pending','準備模型真的會收到的輸入',
          '這道題，以及 episode_history 指向的觀測資料。',
          '取得對應影像／觀測，固定模型可讀的內容與預算；問題送給模型，參考答案留給評分端。',
          '後續應產生：輸入素材完整、評測約定固定的 QA case。',
          '這條問答路徑不必先跑機器人，但仍要有完整的觀測與判分依據，才能正式評測。',
          {state:'觀測素材與評測約定待整合'}),
        step(7,'pending','檢查開放式答案怎麼判分',
          '模型回答、來源參考答案，以及原作的 LLM-match 評分入口。',
          '固定裁判模型與設定，檢查同義表達和明顯錯答，再核對題目／觀測是否跨 split 重用。',
          '後續應產生：實際裁判分數、評審設定、抽查與切分紀錄。',
          '例如「冷氣機」與「壁掛空調」是需要檢查的同義表達情況。此處列出驗證項目，沒有呼叫裁判或產生分數。',
          {state:'裁判與模型評測尚未執行',evidence_keys:['openeqa.evaluator_definition']}),
        step(8,'partial','發布時把題目元資料和可評版本分清楚',
          '目前已有的題目元資料，以及未來通過驗證的完整輸入與判分約定。',
          '目錄先保留同一個 question_id；完整評測版另外列出素材、版本及適用的評分器。',
          '現在：能查到這題的來源與觀測引用。之後：才能按固定條件比較模型答案。',
          '這題原作身份仍只計一次；不同評測設定與重跑結果各自記錄，不能混進來源題數。',
          {state:'目錄已發布；本例仍未成為本庫可評測題'}),
      ],
    },
  ];
  for(const example of examples)assert.deepEqual(example.steps.map(row=>row.number),[1,2,3,4,5,6,7,8]);
  return {
    version:'pipeline-worked-examples-0.1',date:evidence.date,
    scope:'Teaching walkthrough of existing records and explicitly pending work. No new benchmark cases, model trials or judge scores.',
    examples,evidence,records:{calvin_task:calvin.task,openeqa_case:qa,openeqa_task_type:qaTask,openeqa_evaluator:qaEvaluator},
  };
}

export function renderWorkedExamples(locale,model,{t,escape}) {
  const e=model.workedExamples;
  const statusClass=status=>status==='known'?'known':'pending';
  const evidenceLink=key=>{
    const [group,field]=key.split('.');
    const record=e.evidence[group][field];
    return `<a href="${escape(record.url)}" target="_blank" rel="noopener noreferrer">${t(`${group==='calvin'?'CALVIN':'OpenEQA'} · ${record.locator}`,locale)} ↗</a>`;
  };
  return `<section class="pipeline-walkthroughs" id="pipeline-examples" data-worked-examples>
    <div class="walk-heading"><div class="eyebrow">${t('先跟著一筆資料走',locale)}</div><h2>${t('用兩個案例，順過同一條流程',locale)}</h2><p>${t('選一個案例，按「下一步」走完；也可以切換案例，比較同一步怎麼處理。前半段用已取得的紀錄，後半段接上仍待完成的評測工作。',locale)}</p></div>
    <div class="walk-controls walk-case-select" aria-label="${t('選擇案例',locale)}">${e.examples.map((example,index)=>`<button type="button" data-walk-case="${example.id}" aria-pressed="${index===0?'true':'false'}"><span>${t(example.kind,locale)}</span><strong>${t(example.name,locale)}</strong></button>`).join('')}</div>
    <nav class="walk-controls walk-steps" aria-label="${t('選擇閱讀步驟',locale)}">${walkthroughStages.map((stage,index)=>`<button type="button" data-walk-step="${index+1}"${index===0?' aria-current="step"':''}><span>${String(index+1).padStart(2,'0')}</span>${t(stage,locale)}</button>`).join('')}</nav>
    <p class="walk-controls walk-position" role="status" aria-live="polite" data-walk-position data-label="${t('目前閱讀',locale)}"></p>
    ${e.examples.map(example=>`<article class="walkthrough-case" data-walkthrough-case="${example.id}" data-case-name="${t(example.short_name,locale)}">
      <div class="walk-mission"><span class="walk-unit">${t(example.kind,locale)}</span><h3>${t(example.name,locale)}</h3><p>${t(example.mission,locale)}</p><small>${t(example.anchor,locale)}</small><p class="walk-current">${t('本庫目前：'+example.current,locale)}</p></div>
      ${example.steps.map(row=>`<section class="walkthrough-step" data-walkthrough-step="${row.number}" data-step-status="${row.status}" aria-labelledby="walk-${example.id}-${row.number}">
        <div class="walk-step-heading"><span class="walk-step-number">${String(row.number).padStart(2,'0')} / 08</span><span class="walk-state ${statusClass(row.status)}">${t(row.state,locale)}</span></div>
        <h4 id="walk-${example.id}-${row.number}">${t(row.title,locale)}</h4>
        <div class="walk-transformation" aria-label="${t('本步資料如何改變',locale)}">${[['拿到什麼',row.input],['這一步做什麼',row.action],['留下什麼',row.output]].map(([label,text],index)=>`<div class="walk-transform-cell${index===2?' output':''}"><b>${t(label,locale)}</b><p>${t(text,locale)}</p></div>${index<2?'<span class="walk-arrow" aria-hidden="true">→</span>':''}`).join('')}</div>
        <p class="walk-why"><b>${t('為什麼需要這一步：',locale)}</b>${t(row.why,locale)}</p>
        ${row.arithmetic?`<div class="walk-rule-example"><p>${t(row.illustration,locale)}</p><div class="table-scroll"><table><thead><tr>${['初值','終值','差值 > 0.12？'].map(label=>`<th>${t(label,locale)}</th>`).join('')}</tr></thead><tbody>${row.arithmetic.map(item=>`<tr><td>${item.start}</td><td>${item.end}</td><td>${t(item.satisfies_native_condition?'符合原作條件':'不符合原作條件',locale)}</td></tr>`).join('')}</tbody></table></div></div>`:''}
        ${row.record?`<details class="walk-record"><summary>${t('看這一步實際保留的欄位',locale)}</summary><pre><code>${escape(JSON.stringify(row.record,null,2))}</code></pre></details>`:''}
        ${row.evidence_keys?`<p class="walk-evidence">${t('原作依據：',locale)} ${row.evidence_keys.map(evidenceLink).join(' · ')}</p>`:''}
      </section>`).join('')}
    </article>`).join('')}
    <div class="walk-controls walk-navigation"><button type="button" data-walk-prev disabled>← ${t('上一步',locale)}</button><button type="button" data-walk-next>${t('下一步',locale)} →</button></div>
    <p class="walk-legend"><span><i class="legend-known" aria-hidden="true"></i>${t('本例已有資料或紀錄',locale)}</span><span><i class="legend-pending" aria-hidden="true"></i>${t('仍有審核、素材或驗證待辦',locale)}</span></p>
    <details class="walk-full-comparison"><summary>${t('一次比較：兩個案例的八步差別',locale)}</summary><div class="table-scroll"><table><thead><tr><th>${t('同一步',locale)}</th>${e.examples.map(example=>`<th>${t(example.name,locale)}</th>`).join('')}</tr></thead><tbody>${walkthroughStages.map((stage,index)=>`<tr><th scope="row">${index+1}. ${t(stage,locale)}</th>${e.examples.map(example=>`<td>${t(example.steps[index].output,locale)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>
    <p class="walk-downloads"><a href="../downloads/collection-pipeline/WORKED_EXAMPLES.md" download>${t('下載兩個案例的完整講解',locale)}</a> · <a href="../downloads/collection-pipeline/worked-examples.json" download>${t('下載步驟、實際紀錄與來源依據',locale)}</a></p>
  </section>`.replace(/^[ \t]+$/gm,'');
}

export function workedExamplesMarkdown(model) {
  const e=model.workedExamples;
  const lines=[
    '# 用兩個案例走完標準化蒐集流程','',`案例導讀 0.1 · ${e.date}`,'',
    '以 CALVIN 開抽屜和 OpenEQA 物件辨識題，追蹤同一筆資料如何經過八步。這是已有紀錄與後續待辦的導讀，不是新增的模擬或模型評測結果。','',
  ];
  for(const example of e.examples) {
    lines.push(`## ${example.name}`,'',example.mission,'',example.anchor,'',`本庫目前：${example.current}`,'');
    for(const row of example.steps) {
      lines.push(`### ${row.number}. ${row.stage}：${row.title}`,'',`進度：${row.state}`,'',
        `拿到什麼：${row.input}`,'',`這一步做什麼：${row.action}`,'',`留下什麼：${row.output}`,'',`為什麼：${row.why}`,'');
      if(row.arithmetic)lines.push(row.illustration,'','| 初值 | 終值 | 原作條件 |','|---|---|---|',...row.arithmetic.map(r=>`| ${r.start} | ${r.end} | ${r.satisfies_native_condition?'符合':'不符合'} |`),'');
      if(row.record)lines.push('```json',JSON.stringify(row.record,null,2),'```','');
      for(const key of row.evidence_keys||[]) {
        const[group,field]=key.split('.');const ref=e.evidence[group][field];
        lines.push(`來源：${ref.url} · ${ref.locator} · SHA-256 ${ref.sha256}`,'');
      }
    }
  }
  return lines.join('\n').trimEnd()+'\n';
}
