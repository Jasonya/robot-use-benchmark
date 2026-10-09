import {renderPipelineFigure} from './collection-pipeline-figures.mjs';

// Render only our authored pipeline document; code and identifiers are not translated.
export function renderCollectionPipeline(locale, model, {t, escape, shell, head}) {
  const {markdown, report, references} = model;
  const lines = markdown.split('\n');
  const output = [], contents = [];
  const inline = value => value.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map(part => {
    if (part.startsWith('`')) return `<code>${escape(part.slice(1,-1))}</code>`;
    if (part.startsWith('**')) return `<strong>${t(part.slice(2,-2),locale)}</strong>`;
    return t(part,locale);
  }).join('');
  for (let i=0; i<lines.length; i++) {
    const line=lines[i];
    if (!line.trim() || line.startsWith('# ')) continue;
    const figureMatch=line.match(/^!\[.*\]\(figures\/(pipeline-[a-z]+)-zh-hant\.svg\)$/);
    if (figureMatch) {
      const figure=model.figures.find(item=>item.file===figureMatch[1]);
      if(!figure)throw new Error(`Unknown pipeline figure: ${figureMatch[1]}`);
      // The first figure is placed above the chapter contents for quick reading.
      if(figure.id!=='flow')output.push(renderPipelineFigure(figure,locale,{t}));
      if(figure.id==='example'){
        const task=model.walkthrough.task;
        const excerpt={
          entity_type:task.entity_type,identity:task.identity,
          data:{title:task.data.title,domain_refs:task.data.domain_refs,canonical_task_id:task.data.canonical_task_id},
          native:{native_id:task.native.native_id,checker_signature_name:task.native.checker_signature_name,definition_line:task.native.definition_line},
          provenance:task.provenance,release_tier:task.release_tier,evaluation_release_eligible:task.evaluation_release_eligible,
        };
        output.push(`<details class="pipeline-record-example"><summary>${t('展開：圖中真實 JSON 欄位',locale)}</summary><p>${t('以下是已匯入紀錄的欄位節錄；完整紀錄與來源另外提供。',locale)}</p><pre><code>${escape(JSON.stringify(excerpt,null,2))}</code></pre><p><a href="../downloads/collection-pipeline/calvin-walkthrough.json" download>${t('下載完整範例及來源證據',locale)}</a> · <a href="${escape(task.native.source_url)}" target="_blank" rel="noopener noreferrer">${t('原作固定版本的任務定義',locale)} ↗</a></p></details>`);
      }
    } else if (line.startsWith('```')) {
      const code=[];
      while (++i<lines.length && !lines[i].startsWith('```')) code.push(lines[i]);
      output.push(`<pre tabindex="0"><code>${escape(code.join('\n'))}</code></pre>`);
    } else if (line.startsWith('## ')) {
      const label=line.slice(3), number=label.match(/^(\d{2})/);
      const id=number?`pipeline-${number[1]}`:'pipeline-summary';
      contents.push({id,label});
      output.push(`<h2 id="${id}">${inline(label)}</h2>`);
    } else if (line.startsWith('|')) {
      const rows=[];
      while (i<lines.length && lines[i].startsWith('|')) {
        if (!/^[|\s:-]+$/.test(lines[i]))
          rows.push(lines[i].slice(1,-1).split('|').map(cell=>cell.trim()));
        i++;
      }
      i--;
      output.push(`<div class="table-scroll" tabindex="0" role="region" aria-label="${t('資料表，可水平捲動',locale)}"><table><thead><tr>${rows[0].map(cell=>`<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row=>`<tr>${row.map(cell=>`<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    } else if (line.startsWith('- ')) {
      const items=[];
      while (i<lines.length && lines[i].startsWith('- ')) {
        items.push(`<li>${inline(lines[i].slice(2))}</li>`); i++;
      }
      i--; output.push(`<ul>${items.join('')}</ul>`);
    } else {
      output.push(`<p>${inline(line)}</p>`);
    }
  }
  const quantities=[
    ['來源審閱',report.counts.source,'來源紀錄；資料素材仍分開取得'],
    ['用途分類',report.counts.domain,'來源層級分類；逐任務用途仍待審核'],
    ['原生場景',report.counts.environment,'命名場景定義；跨來源幾何等價待決'],
    ['Robot 任務來源',report.task_kinds.robot_task_definition,'原作條目；共同任務聯集尚未完成'],
    ['資訊題型',report.task_kinds.information_task_type,'與 robot 任務分項'],
    ['人類程序活動',report.task_kinds.human_activity_definition,'與 robot 任務分項'],
    ['題目元資料',report.counts.case,'保留原生 split；本次匯入的可評測發布量為 0'],
    ['判分器索引',report.counts.evaluator,'原生程式引用；尚未由本次匯入執行'],
  ];
  const flow=[['找來源','02'],['固定版本','02'],['擷取紀錄','03'],['統一欄位','04'],['語義對齊','06'],['題目建置','08'],['驗證切分與判分','07'],['發布與更新','09']];
  const downloads=[
    ['PIPELINE_SPEC.md','完整流程規格 Markdown'],
    ['catalog_record.schema.json','共同格式 JSON Schema'],
    ['examples.json','六種紀錄與各任務型態示例'],
    ['import-report.json','本次完整驗證報告'],
    ['input_manifest.json','固定輸入與 hashes'],
    ['run_snapshot.py','可重跑的匯入程式'],
    ['test_catalog.py','10 項資料契約檢查'],
    ['requirements.txt','Python 依賴'],
    ['references.json','官方格式依據與讀取紀錄'],
  ];
  const route='collection-pipeline.html';
  const body=`<main class="wrap source-report collection-pipeline" id="main-content">
    ${head('標準化蒐集與整合流程','把不同 benchmark 的來源、環境、任務、題目及判分整理成可追溯、可重跑的共同目錄。',route,locale)}
    <p class="pipeline-version">${t('圖解 0.1 · 2026-10-09｜流程規格 0.1 · 10/08｜來源分類 v0.11',locale)}</p>
    <nav class="pipeline-visual-guide" id="pipeline-visual-guide" aria-label="${t('三張圖導覽',locale)}">${model.figures.map(figure=>`<a href="#pipeline-figure-${figure.id}">${t(figure.title,locale)}</a>`).join('')}</nav>
    ${renderPipelineFigure(model.figures.find(figure=>figure.id==='flow'),locale,{t})}
    <details class="pipeline-stage-links"><summary>${t('依八個步驟跳到詳細說明',locale)}</summary><nav class="pipeline-flow" aria-label="${t('資料流程',locale)}">${flow.map(([label,id],index)=>`<a href="#pipeline-${id}"><small>${String(index+1).padStart(2,'0')}</small>${t(label,locale)}</a>`).join('')}</nav></details>
    <p class="pipeline-lede">${t('格式一致 → 語義對齊 → 可評測發布，各有自己的通過條件。對外仍只看領域、環境、任務、題數、評估方式。',locale)}</p>
    <details class="pipeline-toc" open><summary>${t('依問題深入閱讀',locale)}</summary><nav>${model.figures.map(figure=>`<a href="#pipeline-figure-${figure.id}">${t(figure.title,locale)}</a>`).join('')}${contents.map(({id,label})=>`<a href="#${id}">${t(label,locale)}</a>`).join('')}<a href="#pipeline-import">${t('本次驗證實數與下載',locale)}</a><a href="#pipeline-references">${t('官方格式文件',locale)}</a></nav></details>
    <article>${output.join('\n')}</article>
    <section id="pipeline-import"><h2>${t('本次驗證實數與下載',locale)}</h2>
      <p>${t(`共 ${report.validation.schema_valid_records.toLocaleString('en-US')} 筆目錄紀錄通過 schema、唯一身份、外鍵、輸入 hash 及原始 payload 保留檢查。這是原有資料的格式匯入，沒有新增模型實驗或已去重任務。`,locale)}</p>
      <div class="table-scroll"><table id="pipeline-counts"><thead><tr>${['項目','標準格式輸出量','代表什麼'].map(label=>`<th>${t(label,locale)}</th>`).join('')}</tr></thead><tbody>${quantities.map(([label,n,scope])=>`<tr><th scope="row">${t(label,locale)}</th><td data-import-count="${n}">${n.toLocaleString('en-US')}</td><td>${t(scope,locale)}</td></tr>`).join('')}</tbody></table></div>
      <p>${t(`逐來源的完整性仍要補齊：183 份來源中，${report.source_coverage.environment.reviewed_sources_with_entries} 份有本次匯入的場景條目，${report.source_coverage.task.reviewed_sources_with_entries} 份有任務／資訊題型／活動條目，${report.source_coverage.case.reviewed_sources_with_entries} 份有題目元資料。這裡只表示至少一筆已入庫；各來源是否全數提取、哪些來源適用該項，須由取得矩陣確認。`,locale)}</p>
      <p>${t('本次未做：跨來源語義合併、全部影像與場景素材驗證、共同 split 洩漏審核、模型或 evaluator 重現。原有 118 頁來源審閱 PDF 保持其 10/04 快照；這份 10/08 流程規格另外提供。',locale)}</p>
      <ul class="pipeline-downloads">${downloads.map(([name,label])=>`<li><a href="../downloads/collection-pipeline/${name}" download>${t(label,locale)}</a></li>`).join('')}</ul>
      <details><summary>${t('下載本次六種標準目錄資料（JSONL.gz）',locale)}</summary><p>${t('資料帶有原始紀錄、引用及待整合狀態；其中 tasks 集合的 robot 任務、資訊題型、人類活動必須分項計數。',locale)}</p><ul>${['source','domain','environment','task','case','evaluator'].map(kind=>{const name=`${kind}s.jsonl.gz`;return `<li><a href="../downloads/collection-pipeline/${name}" download>${name}</a> · ${(report.outputs[name].bytes/1024/1024).toFixed(2)} MB</li>`;}).join('')}</ul></details>
    </section>
    <section id="pipeline-references"><h2>${t('官方格式文件',locale)}</h2><p>${t('2026-10-08 讀取；連結指向官方文件，讀取內容的 SHA-256 另存於 references.json。',locale)}</p><ul>${references.map(ref=>`<li><a href="${escape(ref.url)}" target="_blank" rel="noopener noreferrer">${escape(ref.name)} ↗</a></li>`).join('')}</ul></section>
    <p><a href="coverage.html">${t('回到來源與五欄比較',locale)} →</a></p>
    </main>`;
  return shell({route,locale,title:'標準化蒐集與整合流程',description:'八步資料生產線、共同 schema、不同資料形態、任務與環境對齊、驗收規則及可重跑的實數匯入。',body,kind:'collection-pipeline'});
}
