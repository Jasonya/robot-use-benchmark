import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

export const REVIEW_GROUPS = {
  core: ['核心內容已核讀', ['selected_core_source_sections_reviewed']],
  docs: ['文件／網站', ['public_readme_only', 'readme_only_public_release', 'readme_only', 'website_only']],
  unresolved: ['實作尚未確認', ['no_confirmed_code_repository', 'identity_or_version_unresolved', 'repository_unavailable', 'source_link_unavailable']],
  pending: ['待核讀', ['pending_review']],
};
const groupOf = status => Object.entries(REVIEW_GROUPS).find(([, [, values]]) => values.includes(status))?.[0] || 'unresolved';
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const unique = values => [...new Set(values)];
const number = value => typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString('en-US') : String(value ?? '未報');
const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
const cleanHTML = value => value.replace(/^[ \t]+$/gm, '');
const pointerLabel = pointer => pointer === '' ? 'JSON root' : `JSON ${pointer}`;
const isGithub = reading => (reading.provider || 'github') === 'github';
const evidenceSummary = s => `GitHub證據：${s.reviewed_repositories}個倉庫、${s.reviewed_repo_versions}個固定版本；另有${s.reviewed_external_repositories || 0}個外部資料庫。合計${s.verified_source_files}個已核驗檔案，其中${s.verified_external_source_files || 0}個來自外部資料庫。`;
const pdfName = locale => `robot-use-source-atlas-${locale}.pdf`;

export async function loadGithubReview(root, sourceReview) {
  const folder = path.join(root, 'content/github_review');
  const [ledger, validation, guide] = await Promise.all([
    fs.readFile(path.join(folder, 'compiled_reviews.json'), 'utf8').then(JSON.parse),
    fs.readFile(path.join(folder, 'validation.json'), 'utf8').then(JSON.parse),
    fs.readFile(path.join(root, 'benchmark/collection/REPO_TO_STANDARD.md'), 'utf8'),
  ]);
  assert.equal(validation.status, 'passed', 'Correct source review validation errors before building.');
  assert.equal(ledger.rows.length, ledger.statistics.bibliography_records);
  for (const [file, hash] of Object.entries(ledger.review_input_sha256)) {
    assert.equal(digest(await fs.readFile(path.join(root, file))), hash, `Recompile changed review: ${file}`);
  }
  for (const [file, hash] of Object.entries(ledger.input_files_sha256 || {})) {
    assert.equal(digest(await fs.readFile(path.join(root, file))), hash, `Recompile changed source bindings: ${file}`);
  }
  const paperNotes = new Map(sourceReview.rows.map(row => [row.paper_id, row]));
  const domainNames = new Map(sourceReview.domains.map(row => [row.id, row.name]));
  const rows = ledger.rows.map(row => ({
    ...row,
    group: groupOf(row.status),
    domains: row.domain_ids.map(id => domainNames.get(id) || id),
    source_review: paperNotes.get(row.paper_id) || null,
    repositories: unique((row.review?.reading_order || []).filter(isGithub).map(read => read.repo)),
    external_repositories: unique((row.review?.reading_order || []).filter(read => !isGithub(read)).map(read => `${read.provider}:${read.repo}`)),
  }));
  const groups = Object.fromEntries(Object.keys(REVIEW_GROUPS).map(key => [key, rows.filter(row => row.group === key).length]));
  let reportAssets = null;
  try {
    reportAssets = JSON.parse(await fs.readFile(path.join(folder, 'report_assets.json'), 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  return {
    ledger, validation, guide, rows, groups, reportAssets, statistics: ledger.statistics,
    domains: sourceReview.domains,
    complete: ledger.statistics.pending_review_records === 0,
    date: [...new Set(rows.map(row => row.review?.reviewed_on).filter(Boolean))].sort().at(-1),
  };
}

export function githubReviewCSV(model) {
  const columns = ['paper_id', 'name', 'year', 'scope', 'domains', 'review_status', 'repositories', 'external_repositories', 'repository_candidates', 'repository_candidate_dispositions',
    'summary', 'environment', 'tasks', 'data', 'evaluation', 'reuse', 'transform', 'missing',
    'version_note', 'reading_evidence'];
  const rows = model.rows.map(row => {
    const note = row.review || {};
    const values = [row.paper_id, row.name, row.year, row.scope, row.domains.join('；'), row.status,
      row.repositories.join('；'), row.external_repositories.join('；'), (row.repository_candidates || []).map(x => x.requested_repo).join('；'),
      JSON.stringify((row.repository_candidates || []).map(x => ({ repo: x.requested_repo, status: x.selection_status, reason: x.exclusion_reason || x.disposition_note || null }))),
      note.summary, note.environment, note.tasks, note.data, note.evaluation,
      note.standardization?.reuse, note.standardization?.transform, note.standardization?.missing,
      note.version_note, (note.reading_order || []).map(read =>
        `${read.provider || 'github'}:${read.repo}/${read.path} @ ${read.commit} | ${read.ranges.map(x => x.join('-')).join(',')} ${read.json_pointers?.join(',') || ''} | ${read.sha256}`
      ).join('\n')];
    return values.map(csvCell).join(',');
  });
  return '\ufeff' + [columns.map(csvCell).join(','), ...rows].join('\r\n') + '\r\n';
}

export function githubReviewMarkdown(model) {
  const s = model.statistics;
  const text = [
    '# GitHub逐篇核讀與標準化報告', '',
    `資料快照：${model.date}。本次範圍${s.bibliography_records}篇：${s.benchmark_sources}份benchmark／資料／評測來源，${s.related_references}篇方法及綜述參考。`,
    `已完成${s.validated_review_records}篇處理，待處理${s.pending_review_records}篇。核心內容核讀${model.groups.core}篇，文件／網站${model.groups.docs}篇，實作尚未確認${model.groups.unresolved}篇。`,
    `${evidenceSummary(s)}閱讀限所列行段或JSON條目；沒有執行上游模型或機器人。`,
    '文獻、倉庫、檔案、任務、題目與試驗使用不同單位。下載快照不代表已讀，已讀不代表素材齊全或已可評測。', '',
  ];
  if (model.overview) {
    text.push('## 全庫數字與範圍', '',
      `用途分類：${model.overview.classification_version}；來源ID清單快照：${model.overview.inventory_date}；本次GitHub核讀：${model.date}。`, '',
      '| 項目 | 目前確認實數 | 範圍 | 規劃口徑 |', '|---|---:|---|---|',
      ...model.overview.fields.map(f => `| ${f.label} | ${number(f.current)} ${f.unit} | ${f.detail} | ${f.plan} |`), '',
      '全庫去重後的環境與語義任務聯集、完整可執行題數仍未確認；本次完成的是固定250篇書目的逐筆來源查核。', '',
      '### 用途分布', '', '| 用途 | 主來源數／183（可多選） | 支持來源 |', '|---|---:|---|',
      ...model.overview.domains.map(d => `| ${d.name} | ${d.source_count} | ${d.paper_ids.join('、')} |`), '',
      '來源級用途可多選，不按篇數比例配置任務；共同來源與父資料必須另行去重。', '',
      '### 文獻分類', '', '| 研究類型 | 主來源 | 全部書目 |', '|---|---:|---:|',
      ...model.overview.categories.map(c => `| ${c.name} | ${c.reviewed_sources} | ${c.bibliography_records} |`), '',
      '### 評估方式', '', '| 大類 | 主來源數／183（可多選） | 保留的原生判分 |', '|---|---:|---|',
      ...model.overview.evaluation_methods.map(m => `| ${m.name} | ${m.source_count} | ${m.metrics} |`), '',
      '### 論文與發布順序', '',
      ...model.overview.milestones.flatMap(m => [`- ${m.name}：${m.deliverable} 驗收：${m.acceptance} 狀態：${m.status}`]), '');
  }
  text.push(model.guide.replace(/^# .*\n/, '## 共同結構與閱讀方法\n'), '');
  for (const row of model.rows) {
    text.push(`## ${row.paper_id} · ${row.name}`, '', `原作：${row.paper_url}`,
      `範圍：${row.scope === 'benchmark_or_data_source' ? '主來源' : '方法／綜述參考'}；狀態：${REVIEW_GROUPS[row.group][0]}`, '');
    const note = row.review;
    if (!note) { text.push('待核讀。', ''); continue; }
    text.push(note.summary, '', `領域：${row.domains.join('、') || '方法參考，不另推定來源用途。'}`, '',
      `環境：${note.environment}`, '', `任務：${note.tasks}`, '', `題數與資料：${note.data}`, '',
      `評估方式：${note.evaluation}`, '', `版本與身份：${note.version_note}`, '');
    if (note.identity_note) text.push(note.identity_note, '');
    if (note.classification_note) text.push(`分類覆核：${note.classification_note}`, '');
    if (row.source_review?.counts.length) {
      text.push('原文數量摘錄（保留原生單位；不等於本案已取得量）：', '',
        ...row.source_review.counts.map(c => `- ${number(c.value)} ${c.unit}${c.qualifier ? `；${c.qualifier}` : ''}；PDF ${c.pages.join('、')}`), '');
    }
    text.push('### 閱讀順序', '');
    for (const [i, read] of note.reading_order.entries()) {
      const locations = [...read.ranges.map(([a, b]) => `L${a}–${b}`), ...(read.json_pointers || []).map(pointerLabel)];
      text.push(`${i + 1}. ${isGithub(read) ? 'GitHub' : 'Hugging Face'} · ${read.repo}/${read.path} · ${locations.join('、')}`,
        `   ${read.why}`, `   ${read.url}`, `   commit ${read.commit}；SHA256 ${read.sha256}`, '');
    }
    if (!note.reading_order.length) text.push('未確認可核读實作；檢索與原作依據見逐篇JSON紀錄。', '');
    if (row.repository_candidates?.length) {
      text.push('### 其他GitHub線索與排除紀錄', '', '保留找到的線索；可用性與論文關聯見逐篇確認紀錄。', '');
      for (const candidate of row.repository_candidates) {
        text.push(`- https://github.com/${candidate.requested_repo}${candidate.exclusion_reason ? ` — 已排除：${candidate.exclusion_reason}` : candidate.disposition_note ? ` — ${candidate.disposition_note}` : ' — 未納入本篇核心核讀'}`);
      }
      text.push('');
    }
    text.push('### 如何標準化', '', `可重用：${note.standardization.reuse}`, '',
      `需要轉換：${note.standardization.transform}`, '', `仍需補齊：${note.standardization.missing}`, '');
  }
  return text.join('\n').trimEnd() + '\n';
}

function pdfLink(model, locale, { t }, label = '完整整理PDF') {
  const asset = model.reportAssets?.assets?.find(a => a.locale === locale);
  if (!asset) return '';
  return `<a class="button secondary" href="../downloads/github-review/${pdfName(locale)}">${t(label, locale)} · ${asset.pages} ${t('頁', locale)} ↓</a>`;
}

function links(read, escape) {
  return `<a href="${escape(read.reading_url)}" target="_blank" rel="noopener noreferrer"><code>${escape(read.path)}</code> ↗</a>`;
}

function structureFigure(locale, { t }, captionId = 'github-structure-caption') {
  return `<figure class="github-structure" aria-labelledby="${captionId}">
    <ol class="github-layers">
      <li><span>${t('保留原作', locale)}</span><strong>${t('來源快照', locale)}</strong><p>${t('論文、GitHub、資料版本、實際閱讀證據', locale)}</p><code>paper → repo → commit / data release</code></li>
      <li><span>${t('整理成全庫', locale)}</span><strong>${t('共同目錄', locale)}</strong><p>${t('領域、環境、任務、題目、判分＋來源關係', locale)}</p><code>source · domain · environment<br>task · case · evaluator</code></li>
      <li><span>${t('逐項驗證後發布', locale)}</span><strong>${t('可評測子集', locale)}</strong><p>${t('有輸入、初態、協定、判分與可回查結果', locale)}</p><code>assets + protocol + evaluator + evidence</code></li>
    </ol>
    <figcaption id="${captionId}">${t('箭頭表示整理與驗證流程。進共同目錄、已取得素材、已能評測各有自己的狀態；不把上一層數量直接算成下一層完成量。', locale)}</figcaption>
  </figure>`;
}

export function renderGithubReview(locale, model, { t, escape, translate, shell, head }) {
  const route = 'github-review.html';
  const s = model.statistics;
  const countCards = [
    ['逐篇處理', `${s.validated_review_records} / ${s.bibliography_records}`, `${s.benchmark_sources}份主來源＋${s.related_references}篇方法／綜述`],
    ['核心內容已核讀', model.groups.core, '實際讀過所列程式或標註片段'],
    ['文件／網站', model.groups.docs, '保留可取得內容與發布狀態'],
    ['實作尚未確認', model.groups.unresolved, '未確認官方程式、不可取得或身份待決'],
  ];
  const rows = model.rows.map(row => {
    const note = row.review;
    const searchable = [row.paper_id, row.name, row.title, row.year, ...row.domains, ...row.repositories, ...row.external_repositories,
      ...(row.repository_candidates || []).map(x => x.requested_repo),
      note?.summary, note?.tasks, note?.data, note?.evaluation, note?.standardization?.transform].filter(Boolean).join(' ');
    return `<tr data-gh-row data-paper="${row.paper_id}" data-scope="${escape(row.scope)}" data-status="${row.group}" data-domains="${escape(row.domain_ids.join(' '))}" data-search="${escape(translate(searchable, 'zh-hant') + ' ' + translate(searchable, 'zh-hans'))}">
      <th scope="row"><a href="github/${row.paper_id}.html">${t(row.name, locale)}</a><small>${row.paper_id} · ${row.year} · ${t(row.scope === 'benchmark_or_data_source' ? '主來源' : '方法／綜述', locale)}</small></th>
      <td>${t(row.domains.join('、') || '方法參考', locale)}</td>
      <td><span class="github-status ${row.group}">${t(REVIEW_GROUPS[row.group][0], locale)}</span></td>
      <td>${row.repositories.length ? row.repositories.map(repo => `<a class="github-repo-link" href="https://github.com/${escape(repo)}" target="_blank" rel="noopener noreferrer">${escape(repo)} ↗</a>`).join('') : t(note ? '見來源確認紀錄' : '待核對', locale)}</td>
      <td><a href="github/${row.paper_id}.html">${t('怎麼讀與整理', locale)} →</a><small>${t(note?.summary || '尚未完成核心內容核讀。', locale)}</small></td>
    </tr>`;
  }).join('');
  const body = `<main class="wrap github-review" id="main-content">
    ${head('GitHub逐篇核讀', '每篇保留倉庫與版本、實際閱讀檔案、資料格式、判分規則，以及如何接入我們的benchmark。', route, locale)}
    <p class="github-snapshot">${t(`GitHub核讀 ${model.date} · 原作用途分类 v0.11 · ${model.complete ? '本次250篇均有處理結果' : '核讀進行中'}`, locale)}</p>
    <div class="github-counts">${countCards.map(([label, value, note]) => `<div><span>${t(label, locale)}</span><strong>${escape(value)}</strong><small>${t(note, locale)}</small></div>`).join('')}</div>
    <p class="github-scope">${t(`上方統計全250篇；下方可分別查看183份主來源與67篇方法／綜述。${evidenceSummary(s)}這些是來源審閱數，不是任務或題目數；本輪未執行上游模型。`, locale)}</p>
    <section class="github-start" id="standard">
      <div><h2>${t('先掌握一條路線', locale)}</h2><p>${t('找對原作與版本，讀任務、資料和真正的評分程式，再填進共同目錄。每篇的「怎麼讀與整理」都按這個順序說明。', locale)}</p></div>
      <a class="button secondary" href="github-standard.html">${t('看共同結構與實例', locale)} →</a>
      <ol class="github-flow" aria-label="${t('從GitHub到共同benchmark', locale)}">
        <li><b>1</b><strong>${t('固定來源', locale)}</strong><span>${t('原作、倉庫、commit', locale)}</span></li>
        <li><b>2</b><strong>${t('讀三處', locale)}</strong><span>${t('任務、資料、判分', locale)}</span></li>
        <li><b>3</b><strong>${t('統一目錄', locale)}</strong><span>${t('五欄總表、來源可追', locale)}</span></li>
        <li><b>4</b><strong>${t('建立評測', locale)}</strong><span>${t('補齊素材與協定後驗證', locale)}</span></li>
      </ol>
    </section>
    <section id="papers"><h2>${t('逐篇查閱', locale)}</h2>
      <p>${t('主來源183份與方法／綜述67篇分開。核心核讀包含程式或標註檔案；完整閱讀範圍、版本差異和缺口請點進每篇。', locale)}</p>
      <form class="github-filters js-only" data-gh-filters>
        <label>${t('搜尋', locale)}<input type="search" name="q" placeholder="${t('名稱、用途、檔案概念或ID', locale)}"></label>
        <label>${t('收錄範圍', locale)}<select name="scope"><option value="benchmark_or_data_source">${t('183份主來源', locale)}</option><option value="related_reference">${t('67篇方法／綜述', locale)}</option><option value="">${t('全部250篇', locale)}</option></select></label>
        <label>${t('核讀狀態', locale)}<select name="status"><option value="">${t('全部', locale)}</option>${Object.entries(REVIEW_GROUPS).map(([key, [label]]) => `<option value="${key}">${t(label, locale)} (${model.groups[key]})</option>`).join('')}</select></label>
        <label>${t('生活／工作用途', locale)}<select name="domain"><option value="">${t('全部用途', locale)}</option>${model.domains.map(domain => `<option value="${escape(domain.id)}">${t(domain.name, locale)}</option>`).join('')}</select></label>
        <button type="reset">${t('重設', locale)}</button>
      </form>
      <p class="github-result-count" data-gh-count aria-live="polite" data-count-label="${t('符合的來源', locale)}">${t(`完整名錄${s.bibliography_records}篇`, locale)}</p>
      <noscript><p>${t('以下顯示全部來源；逐篇閱讀不需要JavaScript。', locale)}</p></noscript>
      <div class="table-scroll github-table" tabindex="0" role="region" aria-label="${t('GitHub逐篇核讀表，可水平捲動', locale)}"><table><thead><tr>${['原作', '用途', '核讀狀態', '核讀來源倉庫', '閱讀與標準化'].map(label => `<th scope="col">${t(label, locale)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
    </section>
    <section class="github-downloads"><h2>${t('下載同一份整理', locale)}</h2><p>${t('JSON保存完整逐篇紀錄與檔案證據；CSV方便比較；報告按篇連續閱讀。原始上游程式與大型素材保留原作入口。', locale)}</p>
      <div class="cta-row"><a class="button" href="../downloads/github-review/github-review.csv" download>CSV ↓</a><a class="button secondary" href="../downloads/github-review/compiled_reviews.json" download>JSON ↓</a>${pdfLink(model, locale, { t })}<a class="button secondary" href="github-report.html">${t('完整閱讀報告', locale)} →</a><a class="button secondary" href="coverage.html#benchmarks">${t('領域／環境／任務／題數比較', locale)} →</a></div>
    </section>
  </main>`;
  return cleanHTML(shell({ route, locale, title: 'GitHub逐篇核讀與標準化', description: '250篇逐一處理，查固定版本、閱讀檔案、資料與評分格式，以及如何標準化。', body, kind: 'github-review' }));
}

function reviewBody(row, locale, { t, escape }, { report = false } = {}) {
  const note = row.review;
  if (!note) return `<p>${t('本篇尚待核心內容核讀。', locale)}</p>`;
  const hasDiscovery = note.discovery_evidence && Object.keys(note.discovery_evidence).length > 0;
  const prefix = report ? `${row.paper_id}-` : '';
  const fields = [['領域', row.domains.join('、') || '方法／綜述參考，未另作來源用途歸納。'],
    ['環境', note.environment], ['任務', note.tasks], ['題數與資料', note.data], ['評估方式', note.evaluation]];
  const counts = row.source_review?.counts || [];
  const candidates = row.repository_candidates || [];
  return `<p class="github-summary">${t(note.summary, locale)}</p>
    <aside class="github-version"><b>${t('版本與身份', locale)}</b><p>${t(note.version_note, locale)}</p>${note.identity_note ? `<p>${t(note.identity_note, locale)}</p>` : ''}${note.classification_note ? `<p><b>${t('分類覆核：', locale)}</b>${t(note.classification_note, locale)}</p>` : ''}</aside>
    <dl class="github-five-fields">${fields.map(([name, value]) => `<div><dt>${t(name, locale)}</dt><dd>${t(value, locale)}</dd></div>`).join('')}</dl>
    ${counts.length ? `<details class="github-native-counts"${report ? ' open' : ''}><summary>${t('原作數字：保留論文的單位與頁碼', locale)}</summary><p>${t('下列為既有原文審閱摘錄；GitHub快照和本庫取得範圍另見上文，不互相代替。', locale)}</p><ul>${counts.map(count => `<li><strong>${escape(number(count.value))}</strong> ${t(count.unit, locale)}${count.qualifier ? ` · ${t(count.qualifier, locale)}` : ''} · ${t('原文頁', locale)} ${escape(count.pages.join(', '))}</li>`).join('')}</ul></details>` : ''}
    <h2 id="${prefix}reading">${t('依這個順序讀', locale)}</h2>
    ${note.reading_order.length ? `<ol class="github-reading">${note.reading_order.map(read => `<li>
      <div class="github-file-head">${links(read, escape)}<span>${isGithub(read) ? 'GitHub' : 'Hugging Face'} · ${escape(read.repo)} · ${escape(read.commit.slice(0, 10))}</span></div>
      <p>${t(read.why, locale)}</p><small>${read.text_encoding && !read.text_encoding.startsWith('utf-8') ? `${escape(read.text_encoding)} ${t('解碼文字行號', locale)} · ` : ''}${escape([...read.ranges.map(([a, b]) => `L${a}–${b}`), ...(read.json_pointers || []).map(pointerLabel)].join(' · '))}</small>
      <details class="github-hash"><summary>${t('內容指紋', locale)}</summary><code>SHA256 ${escape(read.sha256)}</code></details>
    </li>`).join('')}</ol>` : `<p>${t('未確認可核讀的實作；下方保留已查過的原作、項目頁與檢索依據。', locale)}</p>`}
    ${candidates.length ? `<details class="github-discovery github-candidates"><summary>${t('其他GitHub線索與排除紀錄', locale)}</summary><p>${t('這裡保留未納入本篇核心核讀的入口，以及已排除的同名來源。', locale)}</p><ul>${candidates.map(candidate => {
      const proposal = candidate.link_evidence?.find(x => x.kind === 'authored_discovery_lead')?.proposal;
      const detail = candidate.exclusion_reason ? `已排除：${candidate.exclusion_reason}` : candidate.disposition_note || proposal && (proposal.reason || proposal.evidence || proposal.basis || proposal.role || proposal.suggested_role);
      return `<li><a href="https://github.com/${escape(candidate.requested_repo)}" target="_blank" rel="noopener noreferrer">${escape(candidate.requested_repo)} ↗</a>${detail ? `<p>${t(detail, locale)}</p>` : ''}</li>`;
    }).join('')}</ul></details>` : ''}
    <h2 id="${prefix}mapping">${t('怎麼接入我們的benchmark', locale)}</h2>
    <div class="github-mapping">${[['可重用', note.standardization.reuse], ['需要轉換', note.standardization.transform], ['仍需補齊', note.standardization.missing]].map(([name, value]) => `<section><h3>${t(name, locale)}</h3><p>${t(value, locale)}</p></section>`).join('')}</div>
    ${hasDiscovery ? `<details class="github-discovery"><summary>${t('查看來源確認紀錄', locale)}</summary><pre><code>${escape(JSON.stringify(note.discovery_evidence, null, 2))}</code></pre></details>` : ''}`;
}

export function renderGithubPaper(row, locale, model, helpers) {
  const { t, escape, shell, head } = helpers;
  const route = `github/${row.paper_id}.html`;
  const index = model.rows.indexOf(row);
  const adjacent = [[model.rows[index - 1], '← 上一篇'], [model.rows[index + 1], '下一篇 →']].filter(([value]) => value);
  const body = `<main class="wrap github-paper" id="main-content">
    ${head(`${row.paper_id} · ${row.name}`, row.title, route, locale)}
    <div class="github-paper-links"><a href="../github-review.html">${t('返回逐篇總表', locale)}</a><span class="github-status ${row.group}">${t(REVIEW_GROUPS[row.group][0], locale)}</span>
      <span>${t(row.scope === 'benchmark_or_data_source' ? 'benchmark／資料／評測主來源' : '方法／綜述參考', locale)}</span><a href="${escape(row.paper_url)}" target="_blank" rel="noopener noreferrer">${t('原作', locale)} ↗</a>
      ${row.source_review ? `<a href="../coverage.html#source-${row.paper_id.toLowerCase()}">${t('用途與原生規模依據', locale)}</a>` : ''}
    </div>
    <p class="github-scope">${t(`核讀快照 ${row.review?.reviewed_on || model.date}。已讀範圍限所列片段；本輪未執行上游程式。`, locale)}</p>
    ${reviewBody(row, locale, helpers)}
    <div class="github-paper-links"><a href="../github-standard.html">${t('共同結構與格式說明', locale)} →</a><a href="../../downloads/github-review/papers/${row.paper_id}.json" download>${t('本篇JSON與證據', locale)} ↓</a></div>
    <nav class="github-adjacent" aria-label="${t('逐篇閱讀', locale)}">${adjacent.map(([paper, label]) => `<a href="${paper.paper_id}.html">${t(label, locale)} · ${t(paper.name, locale)}</a>`).join('')}</nav>
  </main>`;
  return cleanHTML(shell({ route, locale, title: `${row.name}｜GitHub怎麼讀與整理`, description: row.review?.summary || row.title, body, kind: 'github-paper' }));
}

export function renderGithubReport(locale, model, helpers) {
  const { t, escape, shell, head } = helpers;
  const route = 'github-report.html';
  const overview = model.overview;
  const standard = guideContent(model.guide, locale, helpers, 'report-guide');
  const table = (headers, rows) => `<div class="table-scroll"><table><thead><tr>${headers.map(x => `<th scope="col">${t(x, locale)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  const sourceRefs = ids => ids.map(id => `<a href="#${id}">${id}</a>`).join('、');
  const body = `<main class="wrap github-report" id="main-content">
    ${head('Robot-use Benchmark完整整理', '先看整體數字、用途與研究分布、共同結構及實例，再查250篇來源的資料、判分、版本與證據。', route, locale)}
    <p>${t(`快照 ${model.date}：${model.statistics.validated_review_records}/${model.statistics.bibliography_records}篇已處理。183份主來源和67篇方法／綜述分開標明。`, locale)}</p>
    <p>${t(`${evidenceSummary(model.statistics)}核讀限所列片段；沒有執行上游模型或機器人。`, locale)}</p>
    <div class="cta-row"><a class="button secondary" href="github-review.html">${t('回到可篩選總表', locale)}</a>${pdfLink(model, locale, helpers)}<a class="button secondary" href="../downloads/github-review/GITHUB_REVIEW_REPORT.md" download>${t('下載Markdown報告', locale)}</a><button class="button secondary js-only" type="button" onclick="window.print()">${t('列印／另存PDF', locale)}</button></div>
    <nav class="github-report-contents" aria-label="${t('報告目錄', locale)}"><a href="#report-whole">${t('整體數字', locale)}</a><a href="#report-distribution">${t('分類與分布', locale)}</a><a href="#report-plan">${t('研究與發布順序', locale)}</a><a href="#report-standard">${t('共同格式與實例', locale)}</a><a href="#report-papers">${t('250篇逐篇索引', locale)}</a></nav>
    ${overview ? `<section class="github-report-overview" id="report-whole"><h2>${t('先看全庫：哪些數字已確認', locale)}</h2>
      <p>${t(`用途分類 ${overview.classification_version}；來源ID清單 ${overview.inventory_date}；GitHub核讀 ${model.date}。三份快照分開標明，舊12領域與早期任務配額只作歷史資料。`, locale)}</p>
      ${table(['項目', '目前確認實數', '實數範圍', '本版規劃口徑'], overview.fields.map(f => `<tr><th scope="row">${t(f.label, locale)}</th><td><b>${number(f.current)}</b> ${t(f.unit, locale)}</td><td>${t(f.detail, locale)}</td><td>${t(f.plan, locale)}</td></tr>`))}
      <p>${t('這是固定250篇書目的來源查核。全庫去重後的環境、語義任務和完整可執行題數仍待建立；新增規則要有父任務、差異與判分，不能以排列數當完成量。', locale)}</p></section>
      <section class="github-report-overview" id="report-distribution"><h2>${t('用途與文獻分布', locale)}</h2>
      <p>${t('用途回答做什麼生活／工作；研究類型回答論文測什麼。用途可多選，文獻主類一篇一類；來源共享影片或資產時仍需去重。', locale)}</p>
      ${table(['用途', '來源數／183', '來源支持'], overview.domains.map(d => `<tr><th scope="row">${t(d.name, locale)}</th><td>${d.source_count}</td><td class="github-report-refs">${sourceRefs(d.paper_ids)}</td></tr>`))}
      ${table(['研究類型', '主來源', '全部書目'], overview.categories.map(c => `<tr><th scope="row">${t(c.name, locale)}</th><td>${c.reviewed_sources}</td><td>${c.bibliography_records}</td></tr>`))}
      ${table(['評估方式', '來源數／183（可多選）', '原生判分'], overview.evaluation_methods.map(m => `<tr><th scope="row">${t(m.name, locale)}</th><td>${m.source_count}</td><td>${t(m.metrics, locale)}</td></tr>`))}
      <p>${t('四類評估方式不是四個已完成的通用評分器，也不應把不同單位的誤差混成單一分數。', locale)}</p></section>
      <section class="github-report-overview" id="report-plan"><h2>${t('從Survey到可投稿Benchmark', locale)}</h2>
      <p>${t('本次交付完成逐篇來源核讀。論文的规模與廣度主張仍需靠共同任務聯集、真正新增的規則及同協定模型結果驗證。', locale)}</p>
      <ol>${overview.milestones.map(m => `<li><b>${t(m.name, locale)}</b><p>${t(m.deliverable, locale)}</p><p>${t('驗收：' + m.acceptance, locale)}</p><small>${t(m.status, locale)}</small></li>`).join('')}</ol></section>` : ''}
    <section class="github-report-overview github-guide-body" id="report-standard"><h2>${t('共同結構、格式與實例', locale)}</h2>${structureFigure(locale, helpers, 'report-structure-caption')}${standard.html}</section>
    <section id="report-papers"><h2>${t('250篇逐篇索引', locale)}</h2><p>${t('每篇保留原文數量、固定程式版本、實際閱讀範圍、可重用內容與缺口。下列編號可跳到正文；PDF也可搜尋來源編號。', locale)}</p><ol class="github-report-paper-index">${model.rows.map(row => `<li><a href="#${row.paper_id}">${row.paper_id} · ${t(row.name, locale)}</a></li>`).join('')}</ol></section>
    ${model.rows.map(row => `<article class="github-report-entry" id="${row.paper_id}">
      <h1>${escape(row.paper_id)} · ${t(row.name, locale)}</h1><p>${t(row.title, locale)}</p>
      <p><span class="github-status ${row.group}">${t(REVIEW_GROUPS[row.group][0], locale)}</span> · ${t(row.scope === 'benchmark_or_data_source' ? '主來源' : '方法／綜述', locale)} · <a href="${escape(row.paper_url)}">${t('原作', locale)}</a> · <a href="github/${row.paper_id}.html">${t('獨立頁面', locale)}</a></p>
      ${reviewBody(row, locale, helpers, { report: true })}
    </article>`).join('')}
  </main>`;
  return cleanHTML(shell({ route, locale, title: 'Robot-use Benchmark完整整理：比較、結構與250篇來源', description: '全庫數字、分類分布、共同格式、實例、研究順序和全部來源的核讀與標準化證據。', body, kind: 'github-report' }));
}

function guideContent(markdown, locale, { t, escape }, prefix = 'standard') {
  const lines = markdown.split('\n');
  const content = [], contents = [];
  const inline = text => text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map(piece => {
    if (piece.startsWith('`')) return `<code>${escape(piece.slice(1, -1))}</code>`;
    if (piece.startsWith('**')) return `<strong>${t(piece.slice(2, -2), locale)}</strong>`;
    return t(piece, locale);
  }).join('');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.startsWith('# ')) continue;
    if (line.startsWith('```')) {
      const code = [];
      while (++i < lines.length && !lines[i].startsWith('```')) code.push(lines[i]);
      content.push(`<pre tabindex="0"><code>${escape(code.join('\n'))}</code></pre>`);
    } else if (line.startsWith('## ')) {
      const id = `${prefix}-${contents.length + 1}`, title = line.slice(3);
      contents.push({ id, title });
      content.push(`<h2 id="${id}">${inline(title)}</h2>`);
    } else if (line.startsWith('### ')) {
      content.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!/^[|\s:-]+$/.test(lines[i])) rows.push(lines[i].slice(1, -1).split('|').map(cell => cell.trim()));
        i++;
      }
      i--;
      content.push(`<div class="table-scroll" tabindex="0" role="region" aria-label="${t('格式對照表，可水平捲動', locale)}"><table><thead><tr>${rows[0].map(cell => `<th scope="col">${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row => `<tr>${row.map(cell => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    } else if (line.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) { items.push(`<li>${inline(lines[i].slice(2))}</li>`); i++; }
      i--; content.push(`<ul>${items.join('')}</ul>`);
    } else content.push(`<p>${inline(line)}</p>`);
  }
  return { html: content.join('\n'), contents };
}

export function renderGithubStandard(locale, model, { t, escape, shell, head }) {
  const route = 'github-standard.html';
  const content = guideContent(model.guide, locale, { t, escape });
  const body = `<main class="wrap github-standard" id="main-content">
    ${head('我們的benchmark怎麼整理', '三層結構、五個對外欄位。原作內容保留來源，任務與規則的擴充另有版本，素材及判分通過驗證後才進可評測子集。', route, locale)}
    ${structureFigure(locale, { t })}
    <div class="github-example-links"><b>${t('搭配三篇看差異', locale)}</b><a href="github/P105.html">${t('LIBERO-Plus：任務與擾動', locale)}</a><a href="github/P119.html">${t('EgoDex：影片與姿態', locale)}</a><a href="github/P123.html">${t('WatchAct：規劃與物理完成', locale)}</a></div>
    <p><a href="collection-pipeline.html#pipeline-examples">${t('用CALVIN和OpenEQA走完整匯入流程', locale)} →</a> · <a href="github-review.html">${t('回到250篇核讀總表', locale)}</a> · <a href="../downloads/github-review/REPO_TO_STANDARD.md" download>${t('下載結構規格', locale)} ↓</a></p>
    <nav class="github-guide-contents" aria-label="${t('本頁內容', locale)}">${content.contents.map(item => `<a href="#${item.id}">${t(item.title, locale)}</a>`).join('')}</nav>
    <article class="github-guide-body">${content.html}</article>
  </main>`;
  return cleanHTML(shell({ route, locale, title: 'GitHub到共同benchmark：結構與標準化', description: '用三層結構保留來源，統一五欄比較，逐步建立可評測題目。', body, kind: 'github-standard' }));
}
