export function renderReadinessPage(locale, model, helpers) {
  const {t, escape, relative, routeLink, breadcrumb, chapterNav, shell, implementation} = helpers;
  const route='readiness.html';
  const stats={...model.statistics,...(implementation?{
    comparison_prior_works:implementation.comparison_evidence.prior_works,
    domain_matrix:implementation.comparison_evidence.domain_matrix,
    feature_matrix:implementation.comparison_evidence.feature_matrix}: {})};
  const d=stats.domain_matrix;
  const f=stats.feature_matrix;
  const downloads=relative(`${locale}/${route}`,'downloads/readiness/');
  const nav=chapterNav(route,locale);
  const issues=implementation?.issues||model.issues;
  const current=implementation?.current_execution;
  const remaining=issues.filter(issue=>!['documentation_fixed','documentation_complete'].includes(issue.status)).length;
  const progressDownloads=relative(`${locale}/${route}`,'downloads/implementation/');
  const gapId=issue=>issue.id.toLowerCase();
  const status=issue=>({documentation_fixed:'已修正文件入口',documentation_complete:'文件整合已完成',partial:'已有部分證據',rules_defined:'開發規則已定；全庫待驗',open:'待完成'}[issue.status]||issue.status);
  const table=`<div class="table-scroll"><table id="audit-gap-table"><thead><tr><th>ID／優先序</th><th>${t('缺口',locale)}</th><th>${t('下一份交付物',locale)}</th><th>${t('狀態',locale)}</th></tr></thead><tbody>${issues.map(issue=>`<tr><td><a href="#${gapId(issue)}">${escape(issue.id)}</a><br>${issue.priority} · ${t(model.category_labels[issue.category],locale)}</td><td>${t(issue.title,locale)}</td><td>${t(issue.deliverable,locale)}</td><td>${t(status(issue),locale)}</td></tr>`).join('')}</tbody></table></div>`;
  const details=issues.map(issue=>`<details class="audit-gap" id="${gapId(issue)}" data-audit-gap="${escape(issue.id)}"><summary><span class="pill ${issue.status==='documentation_fixed'||issue.status==='documentation_complete'?'green':'status'}">${issue.priority}</span><b>${t(issue.title,locale)}</b><small>${t(status(issue),locale)}</small></summary><div class="audit-gap-body"><p><strong>${t('目前：',locale)}</strong>${t(issue.current,locale)}</p><p><strong>${t('影響：',locale)}</strong>${t(issue.impact,locale)}</p><p><strong>${t('交付物：',locale)}</strong>${t(issue.deliverable,locale)}</p><p><strong>${t('驗收：',locale)}</strong>${t(issue.acceptance,locale)}</p><p>${t('階段：',locale)}${t(issue.milestone,locale)}</p><p><a href="${routeLink(route,issue.public_route,locale)}">${t('查看相關設計／比較內容',locale)} →</a></p><p class="audit-file-note">${t('專案依據：',locale)}${issue.evidence_paths.map(file=>`<code>${escape(file)}</code>`).join(' · ')}</p></div></details>`).join('');
  const body=`<div class="reading-progress" aria-hidden="true"></div><div class="reader-layout"><aside class="chapter-sidebar" aria-label="${t('章節導覽',locale)}">${nav}</aside><main class="reader" id="main-content">
    <details class="mobile-chapter-nav"><summary>${t('章節與資料庫',locale)}</summary>${nav}</details>${breadcrumb('待完善事項',route,locale)}
    <div class="eyebrow">DESIGN &amp; EVIDENCE REVIEW</div><h1>${t('還缺什麼，怎樣才算完成。',locale)}</h1>
    <p class="lede">${t('已有原生模擬執行、學習基線、來源索引與開發規則；完整G2、廣度與通用release仍待完成。這裡把新證據和剩餘工作逐項列出。',locale)}</p>
    <div class="page-meta"><span>${model.audit_date}</span><span class="pill status">${t('開發證據持續更新',locale)}</span><span>${t('整合更新 v0.5',locale)}</span></div>
    <div class="scale-target-grid audit-statistics"><div><strong data-audit-stat="domain-unknown">${d.unknown_percent}%</strong><span>${t(`前作領域 ${d.unknown_cells}／${d.total_cells} 格支撐仍未由已查範圍確定`,locale)}</span></div><div><strong data-audit-stat="feature-unknown">${f.unknown_percent}%</strong><span>${t(`前作能力 ${f.unknown_cells}／${f.total_cells} 格支撐仍未知`,locale)}</span></div><div><strong>${remaining}</strong><span>${t('尚待完成或持續擴展的事項；不是工程完成百分比',locale)}</span></div><div><strong>${current?current.recorded_development_trials.toLocaleString('en-US'):'0'}</strong><span>${t('已記錄原生開發執行；正式 G2 與 2× 分母仍未定',locale)}</span></div></div>
    ${current?`<div class="scope-notice"><b>${t('目前已有真正的模擬與模型驗證',locale)}</b><p>${t(`50個原生任務、${current.forward_consistent_native_initial_cases}個forward-consistent初態，本次新初態测试${current.heldout_test_trials.toLocaleString('en-US')}次。這些是Meta-World state-based開發證據，不是新造通用G2或全部材料／機體的驗證。`,locale)}</p><a href="${routeLink(route,'execution.html',locale)}">${t('查看實際結果與完整紀錄',locale)} →</a></div>`:''}
    <div class="scope-notice"><b>${t('支撐未知與審閱是否完成，是不同欄位。',locale)}</b><p>${t(`${implementation.comparison_evidence.cell_records}個格子已建立來源索引；自動定位字詞不是覆蓋證據。新增加的前作多以摘要作範圍查核，未知比例不能當工程未完成百分比。來源概覽、具體task定義、instance與runtime證據分層保留，正式覆蓋仍需足夠task／instance／expert／evaluator。`,locale)}</p><a href="${routeLink(route,'compare.html',locale)}">${t('對照 benchmark 矩陣',locale)} →</a></div>
    <div class="prose">
      <h2 id="audit-priorities">${t('先處理哪些缺口',locale)}</h2>
      <p>${t('P0 影響任務計數、覆蓋主張或可執行性；P1 要在正式實驗前完成；P2 改善發布與閱讀。每列可展開詳細依據與驗收方式。',locale)}</p>${table}
      <h2 id="audit-next">${t('接下來先交付三份可用產物',locale)}</h2>
      <ol><li><strong>${t('共同任務與增量表：',locale)}</strong>${t('來源 ID → G2、合併／拆分理由、復用／修改／新增，以及補足的場域和必需機制。',locale)}</li><li><strong>${t('主要前作的逐格證據：',locale)}</strong>${t('頁碼／表格／task IDs、支撐層級和未確定範圍，先完成影響規模分母的對照。',locale)}</li><li><strong>${t('跨 backend 閉環與成本：',locale)}</strong>${t('依 S2 做 6–8 個代表 anchors，量測可解性、判分和製作成本，再向 250／500／1,000 與正式全庫擴展。',locale)}</li></ol>
      <p>${t('大規模與廣覆蓋仍共同推進。2,000–3,000 是初始目標，不是上限；參照更大時需上調，而非用來源筆數或配置數代替獨立任務。',locale)}</p>
      <h2 id="audit-defined">${t('已有原則，接下來要落到資料與程式',locale)}</h2>
      <p>${t('G0–G5、跨場域／機體不重複增加G2、T5／T6主線與資料切分等原則已提供；開發codebook、schemas、typed count records及原生執行器也已建立。剩餘重點是全庫語義裁定、其他材料／機體、影片配對和完整評測。',locale)}</p>
      <p>${t('每域 8 個家族與 3 類機制不保證有 24 個有效交叉格。需要保存真正被任務支持的 D×F×K 聯集；共同分類改變時，前作也必須重編。',locale)}</p>
      <h2 id="audit-literature">${t('文獻與版本的界線',locale)}</h2>
      <p>${t('原168篇底稿保留；截至2026-09-25新增82篇完整摘要審閱，合計250篇書目、137篇摘要紀錄。比較表擴為68項前作，保留74份原始摘要／指定章節文件來源；這些集合互相重疊，不能相加。',locale)}</p>
      <p>${t('本次有20組有界arXiv檢索與700候選狀態，但仍未完成全分頁、跨資料庫和全文／引用追查。摘要審閱不是全文審計，也沒有宣稱找到所有robot-use或Ego prediction文獻。',locale)} <a href="${routeLink(route,'research.html',locale)}">${t('查看完整檢索與分類',locale)} →</a></p>
      <p>${t('最新單一PDF已整合目前設計、比較、實驗與文獻補充，原257頁逐頁標為歷史附錄。網站、計數與PDF分別核驗。',locale)} <a href="${relative(`${locale}/${route}`,'downloads/current-report-zh-hant.pdf')}">${t('開啟最新完整PDF',locale)} →</a></p>
      <h2 id="audit-details">${t('逐項交付物、驗收與依據',locale)}</h2>${details}
    </div>
    <div class="reader-actions"><a class="text-button" href="${progressDownloads}/IMPLEMENTATION_PROGRESS.md" download>${t('最新實作進度',locale)}</a><a class="text-button" href="${progressDownloads}/implementation_gap_status.csv" download>${t('最新待辦與驗收 CSV',locale)}</a><a class="text-button" href="${downloads}/READINESS_AUDIT_2026_09_25.md" download>${t('首次審查快照',locale)}</a><a class="text-button" href="${progressDownloads}/milestones_v0_5.csv" download>${t('最新S0–S6 CSV',locale)}</a><button class="text-button print-page">${t('列印本頁',locale)}</button></div>
    </main><aside class="on-this-page" aria-label="${t('本頁內容',locale)}"><div class="sidebar-label">${t('本頁內容',locale)}</div>${[
      ['audit-priorities','缺口與優先序'],['audit-next','三份優先交付'],['audit-defined','已有原則與待落地'],['audit-literature','文獻與版本界線'],['audit-details','逐項驗收與依據']
    ].map(([id,title])=>`<a href="#${id}">${t(title,locale)}</a>`).join('')}</aside></div>`;
  return shell({route,locale,title:'待完善事項：缺口、優先序與验收',description:'依既有資料量化比較表待核比例，列出正式任務、覆蓋、場景、影片、模擬、判分、基線、難度與文件的下一步交付。',body,kind:'readiness'});
}
