export function renderReadinessPage(locale, model, helpers) {
  const {t, escape, relative, routeLink, breadcrumb, chapterNav, shell} = helpers;
  const route='readiness.html';
  const stats=model.statistics;
  const d=stats.domain_matrix;
  const f=stats.feature_matrix;
  const downloads=relative(`${locale}/${route}`,'downloads/readiness/');
  const nav=chapterNav(route,locale);
  const gapId=issue=>issue.id.toLowerCase();
  const status=issue=>issue.status==='documentation_fixed'?'本次文件修正':'待完成';
  const table=`<div class="table-scroll"><table id="audit-gap-table"><thead><tr><th>ID／優先序</th><th>${t('缺口',locale)}</th><th>${t('下一份交付物',locale)}</th><th>${t('狀態',locale)}</th></tr></thead><tbody>${model.issues.map(issue=>`<tr><td><a href="#${gapId(issue)}">${escape(issue.id)}</a><br>${issue.priority} · ${t(model.category_labels[issue.category],locale)}</td><td>${t(issue.title,locale)}</td><td>${t(issue.deliverable,locale)}</td><td>${t(status(issue),locale)}</td></tr>`).join('')}</tbody></table></div>`;
  const details=model.issues.map(issue=>`<details class="audit-gap" id="${gapId(issue)}" data-audit-gap="${escape(issue.id)}"><summary><span class="pill ${issue.status==='documentation_fixed'?'green':'status'}">${issue.priority}</span><b>${t(issue.title,locale)}</b><small>${t(status(issue),locale)}</small></summary><div class="audit-gap-body"><p><strong>${t('目前：',locale)}</strong>${t(issue.current,locale)}</p><p><strong>${t('影響：',locale)}</strong>${t(issue.impact,locale)}</p><p><strong>${t('交付物：',locale)}</strong>${t(issue.deliverable,locale)}</p><p><strong>${t('驗收：',locale)}</strong>${t(issue.acceptance,locale)}</p><p>${t('階段：',locale)}${t(issue.milestone,locale)}</p><p><a href="${routeLink(route,issue.public_route,locale)}">${t('查看相關設計／比較內容',locale)} →</a></p><p class="audit-file-note">${t('專案依據：',locale)}${issue.evidence_paths.map(file=>`<code>${escape(file)}</code>`).join(' · ')}</p></div></details>`).join('');
  const body=`<div class="reading-progress" aria-hidden="true"></div><div class="reader-layout"><aside class="chapter-sidebar" aria-label="${t('章節導覽',locale)}">${nav}</aside><main class="reader" id="main-content">
    <details class="mobile-chapter-nav"><summary>${t('章節與資料庫',locale)}</summary>${nav}</details>${breadcrumb('待完善事項',route,locale)}
    <div class="eyebrow">DESIGN &amp; EVIDENCE REVIEW</div><h1>${t('還缺什麼，怎樣才算完成。',locale)}</h1>
    <p class="lede">${t('比較證據尚未核完、正式任務與覆蓋計數尚未定稿、可執行與評測證據尚未建立。這裡把待完成工作列成具體交付物與驗收條件。',locale)}</p>
    <div class="page-meta"><span>${model.audit_date}</span><span class="pill status">${t('既有專案審查，非新實驗',locale)}</span><span>${t('設計 v0.4',locale)}</span></div>
    <div class="scale-target-grid audit-statistics"><div><strong data-audit-stat="domain-unknown">${d.unknown_percent}%</strong><span>${t(`前作領域矩陣 ${d.unknown_cells}／${d.total_cells} 格待核`,locale)}</span></div><div><strong data-audit-stat="feature-unknown">${f.unknown_percent}%</strong><span>${t(`前作能力矩陣 ${f.unknown_cells}／${f.total_cells} 格待核`,locale)}</span></div><div><strong>${stats.issue_counts.open}</strong><span>${t('本次列出的待完成事項；不是全部工程量的百分比',locale)}</span></div><div><strong>G2 · TBD</strong><span>${t('正式任務數與 2× 分母未定；模擬驗證仍為 0',locale)}</span></div></div>
    <div class="scope-notice"><b>${t('待核比例表示我們的整理進度。',locale)}</b><p>${t('不能將未知解讀成前作沒有該領域／能力。矩陣中的正例目前也多是文獻、場景或題材映射；正式有效覆蓋還要有 task、instance、expert 和判分證據。',locale)}</p><a href="${routeLink(route,'compare.html',locale)}">${t('對照目前的 benchmark 矩陣',locale)} →</a></div>
    <div class="prose">
      <h2 id="audit-priorities">${t('先處理哪些缺口',locale)}</h2>
      <p>${t('P0 影響任務計數、覆蓋主張或可執行性；P1 要在正式實驗前完成；P2 改善發布與閱讀。每列可展開詳細依據與驗收方式。',locale)}</p>${table}
      <h2 id="audit-next">${t('接下來先交付三份可用產物',locale)}</h2>
      <ol><li><strong>${t('共同任務與增量表：',locale)}</strong>${t('來源 ID → G2、合併／拆分理由、復用／修改／新增，以及補足的場域和必需機制。',locale)}</li><li><strong>${t('主要前作的逐格證據：',locale)}</strong>${t('頁碼／表格／task IDs、支撐層級和未確定範圍，先完成影響規模分母的對照。',locale)}</li><li><strong>${t('跨 backend 閉環與成本：',locale)}</strong>${t('依 S2 做 6–8 個代表 anchors，量測可解性、判分和製作成本，再向 250／500／1,000 與正式全庫擴展。',locale)}</li></ol>
      <p>${t('大規模與廣覆蓋仍共同推進。2,000–3,000 是初始目標，不是上限；參照更大時需上調，而非用來源筆數或配置數代替獨立任務。',locale)}</p>
      <h2 id="audit-defined">${t('已有原則，接下來要落到資料與程式',locale)}</h2>
      <p>${t('G0–G5、任務與場域／機體綁定分計、T5／T6 主線、合法 packets、來源優先切分、恢復分母和難度依 contract／agent panel 定義，已有文件。下一步是共同代碼表、實際 manifests、可解實例、判分程式和結果。',locale)}</p>
      <p>${t('每域 8 個家族與 3 類機制不保證有 24 個有效交叉格。需要保存真正被任務支持的 D×F×K 聯集；共同分類改變時，前作也必須重編。',locale)}</p>
      <h2 id="audit-literature">${t('文獻與版本的界線',locale)}</h2>
      <p>${t(`原文獻快照 ${stats.literature_snapshot_date} 有 ${stats.bibliography_records} 篇，其中 ${stats.complete_abstract_review_flags} 篇標示完整摘要審閱。比較表快照 ${stats.comparison_snapshot_date} 核對 ${stats.comparison_prior_works} 項前作的 ${stats.comparison_source_documents} 份摘要／指定章節文件。集合重疊，不能相加；摘要審閱不是完整全文審計。`,locale)}</p>
      <p>${t('本次只審查既有專案，沒有宣稱找到所有 robot-use 或 Ego prediction 文獻。後續需要明確截止日、檢索／納排規則、引用追查和統一書目。',locale)}</p>
      <p>${t('目前 PDF 是 257 頁 v0.2 歷史快照，尚未包含 v0.4、35 列比較表和本次審查。入口與公開網站狀態已修正；最新完整單一 PDF 仍列為 GAP-14。',locale)}</p>
      <h2 id="audit-details">${t('逐項交付物、驗收與依據',locale)}</h2>${details}
    </div>
    <div class="reader-actions"><a class="text-button" href="${downloads}/READINESS_AUDIT_2026_09_25.md" download>${t('下載完整審查',locale)}</a><a class="text-button" href="${downloads}/gap_register.csv" download>${t('待辦與驗收 CSV',locale)}</a><a class="text-button" href="${downloads}/milestones_v0_4.csv" download>${t('S0–S6 CSV',locale)}</a><a class="text-button" href="${downloads}/version_index.json" download>${t('文件版本索引',locale)}</a><button class="text-button print-page">${t('列印本頁',locale)}</button></div>
    </main><aside class="on-this-page" aria-label="${t('本頁內容',locale)}"><div class="sidebar-label">${t('本頁內容',locale)}</div>${[
      ['audit-priorities','缺口與優先序'],['audit-next','三份優先交付'],['audit-defined','已有原則與待落地'],['audit-literature','文獻與版本界線'],['audit-details','逐項驗收與依據']
    ].map(([id,title])=>`<a href="#${id}">${t(title,locale)}</a>`).join('')}</aside></div>`;
  return shell({route,locale,title:'待完善事項：缺口、優先序與验收',description:'依既有資料量化比較表待核比例，列出正式任務、覆蓋、場景、影片、模擬、判分、基線、難度與文件的下一步交付。',body,kind:'readiness'});
}
