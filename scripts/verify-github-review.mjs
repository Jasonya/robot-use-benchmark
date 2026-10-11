// Verify the published reading ledger without requesting remote sources.
// Exact source bytes and JSON selectors are checked by the local Python compiler.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = async file => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));
const requireComplete = process.argv.includes('--require-complete');
const [ledger, validation] = await Promise.all([
  read('content/github_review/compiled_reviews.json'),
  read('content/github_review/validation.json'),
]);
assert.equal(validation.status, 'passed', 'Local source evidence validation has errors.');
assert.deepEqual(validation.statistics, ledger.statistics);
const s = ledger.statistics;
assert.equal(ledger.rows.length, 250, 'This release covers the fixed250-paper cohort.');
assert.equal(new Set(ledger.rows.map(row => row.paper_id)).size, 250);
assert.equal(ledger.rows.filter(row => row.scope === 'benchmark_or_data_source').length, 183);
assert.equal(ledger.rows.filter(row => row.scope === 'related_reference').length, 67);
const reviewed = ledger.rows.filter(row => row.review);
assert.equal(reviewed.length, s.validated_review_records);
assert.equal(250 - reviewed.length, s.pending_review_records);
assert.equal(Object.keys(ledger.review_input_sha256).length, reviewed.length);
if (requireComplete) assert.equal(reviewed.length, 250, 'All250 source dispositions are required before publication.');
assert.equal(s.new_runtime_trials, 0);
assert.equal(s.source_only_audit, true);
for (const [file, hash] of Object.entries(ledger.input_files_sha256 || {})) {
  assert.equal(digest(await fs.readFile(path.join(root, file))), hash, `Stale ledger input: ${file}`);
}

const repos = new Set(), versions = new Set(), files = new Set();
const externalRepos = new Set(), externalVersions = new Set(), externalFiles = new Set();
for (const row of reviewed) {
  const note = row.review;
  const rawPath = `content/github_review/reviews/${row.paper_id}.json`;
  const raw = await fs.readFile(path.join(root, rawPath));
  assert.ok(!/\/Users\/wchj|github_pat_|ghp_[A-Za-z0-9]{20,}/.test(raw.toString()),
    `${row.paper_id}: private path or credential pattern in the versioned authored note.`);
  assert.equal(digest(raw), ledger.review_input_sha256[rawPath], `Stale authored note: ${row.paper_id}`);
  assert.equal(digest(raw), note.review_sha256);
  assert.equal(note.runtime_executed, false);
  assert.equal(note.paper_id, row.paper_id);
  if (requireComplete) {
    assert.equal(row.repository_binding_review_sha256, note.review_sha256,
      `${row.paper_id}: reconcile repositories with the final authored review before publication.`);
  }
  const selected = new Set(row.repository_bindings.flatMap(x =>
    [x.requested_repo, x.resolved_repo, ...(x.aliases_in_this_review || [])].filter(Boolean).map(s => s.toLowerCase())));
  for (const candidate of row.repository_candidates) {
    assert.match(candidate.requested_repo, /^[\w.-]+\/[\w.-]+$/);
    assert.ok(!selected.has(candidate.requested_repo.toLowerCase()), `${row.paper_id}: selected source is also a candidate.`);
    if (requireComplete) {
      assert.ok(candidate.exclusion_reason || candidate.disposition_note,
        `${row.paper_id}: explain every retained repository lead before publication.`);
    }
  }
  for (const field of ['summary', 'environment', 'tasks', 'data', 'evaluation', 'version_note']) {
    assert.ok(typeof note[field] === 'string' && note[field].trim(), `${row.paper_id}: missing${field}`);
  }
  for (const field of ['profile', 'reuse', 'transform', 'missing']) assert.ok(note.standardization[field]?.trim());
  assert.ok(!('source_files' in note), 'Private source-cache receipts must not be embedded in the public note.');
  for (const evidence of note.reading_order) {
    assert.match(evidence.commit, /^[0-9a-f]{40}$/);
    assert.match(evidence.sha256, /^[0-9a-f]{64}$/);
    assert.ok(evidence.path && !evidence.path.startsWith('/') && !evidence.path.split('/').includes('..'));
    assert.ok(evidence.ranges.length || evidence.json_pointers?.length);
    for (const [first, last] of evidence.ranges) {
      assert.ok(Number.isInteger(first) && first > 0 && first <= last && last <= evidence.line_count);
    }
    assert.equal(evidence.json_pointer_evidence.length, evidence.json_pointers.length);
    for (const entry of evidence.json_pointer_evidence) assert.match(entry.selected_value_sha256, /^[0-9a-f]{64}$/);
    const url = new URL(evidence.url);
    const provider = evidence.provider || 'github';
    assert.ok(['github', 'huggingface_dataset'].includes(provider), `Unknown provider: ${provider}`);
    assert.equal(url.hostname, provider === 'github' ? 'github.com' : 'huggingface.co');
    assert.match(evidence.repo, /^[\w.-]+\/[\w.-]+$/);
    const prefix = provider === 'github' ? '' : '/datasets';
    assert.ok(url.pathname.startsWith(`${prefix}/${evidence.repo}/blob/${evidence.commit}/`));
    assert.ok(url.pathname.includes(`/blob/${evidence.commit}/`));
    const fileKey = `${provider}:${evidence.repo.toLowerCase()}@${evidence.commit}/${evidence.path}`;
    if (provider === 'github') {
      repos.add(evidence.repo.toLowerCase());
      versions.add(`${evidence.repo.toLowerCase()}@${evidence.commit}`);
    } else {
      externalRepos.add(`${provider}:${evidence.repo.toLowerCase()}`);
      externalVersions.add(`${provider}:${evidence.repo.toLowerCase()}@${evidence.commit}`);
      externalFiles.add(fileKey);
    }
    files.add(fileKey);
  }
}
assert.equal(repos.size, s.reviewed_repositories);
assert.equal(versions.size, s.reviewed_repo_versions);
assert.equal(files.size, s.verified_source_files);
assert.equal(externalRepos.size, s.reviewed_external_repositories);
assert.equal(externalVersions.size, s.reviewed_external_versions);
assert.equal(externalFiles.size, s.verified_external_source_files);
assert.ok(!/\/Users\/wchj|github_pat_|ghp_[A-Za-z0-9]{20,}/.test(JSON.stringify(ledger)),
  'Private filesystem path or credential pattern in public ledger.');
const output = path.join(root, 'docs/downloads/github-review');
assert.deepEqual(await fs.readFile(path.join(output, 'compiled_reviews.json')),
  await fs.readFile(path.join(root, 'content/github_review/compiled_reviews.json')));
for (const row of ledger.rows) {
  const published = JSON.parse(await fs.readFile(path.join(output, 'papers', `${row.paper_id}.json`)));
  assert.equal(published.status, row.status);
  assert.deepEqual(published.review, row.review);
  assert.ok(!/\/Users\/wchj|github_pat_|ghp_[A-Za-z0-9]{20,}/.test(JSON.stringify(published)));
  for (const locale of ['zh-hant', 'zh-hans']) {
    const html = await fs.readFile(path.join(root, 'docs', locale, 'github', `${row.paper_id}.html`), 'utf8');
    assert.ok(html.includes('github-paper'));
    if (row.review) assert.ok(html.includes(row.review.reading_order[0]?.commit.slice(0, 10) || 'github-discovery'));
  }
}
const summary = JSON.parse(await fs.readFile(path.join(output, 'atlas-summary.json')));
assert.deepEqual(summary.fields.map(f => f.id), ['domain', 'environment', 'task', 'case', 'evaluation']);
assert.deepEqual(summary.fields.map(f => f.current), [21, 284, 2096, 114288, 4]);
assert.equal(summary.canonical_task_union, null);
assert.equal(summary.fully_integrated_union_evaluation_cases, null);
assert.equal(summary.domains.length, 21);
assert.equal(summary.categories.reduce((n, c) => n + c.reviewed_sources, 0), 183);
assert.equal(summary.categories.reduce((n, c) => n + c.bibliography_records, 0), 250);
for (const locale of ['zh-hant', 'zh-hans']) {
  const reportHTML = await fs.readFile(path.join(root, 'docs', locale, 'github-report.html'), 'utf8');
  assert.equal((reportHTML.match(/class="github-report-entry"/g) || []).length, 250);
  for (const section of ['report-whole', 'report-distribution', 'report-plan', 'report-standard', 'report-papers']) {
    assert.ok(reportHTML.includes(`id="${section}"`));
  }
}
if (requireComplete) {
  const assets = await read('content/github_review/report_assets.json');
  assert.equal(assets.assets.length, 2, 'Both Traditional and Simplified Chinese PDFs are required.');
  assert.deepEqual(await read('docs/downloads/github-review/report_assets.json'), assets);
  for (const [file, hash] of Object.entries(assets.input_files_sha256)) {
    assert.equal(digest(await fs.readFile(path.join(root, file))), hash, `Reprint stale PDF input: ${file}`);
  }
  for (const asset of assets.assets) {
    const pdf = await fs.readFile(path.join(output, asset.file));
    assert.equal(digest(pdf), asset.sha256);
    assert.equal(pdf.byteLength, asset.bytes);
    assert.ok(pdf.subarray(0, 5).equals(Buffer.from('%PDF-')));
    assert.equal(pdf.includes(Buffer.from('127.0.0.1')), false, 'PDF links must work away from the preview.');
    assert.equal(asset.html_paper_sections, 250);
    assert.equal(asset.all_250_paper_ids_present, true);
    assert.equal(asset.overview_structure_examples_present, true);
    assert.equal(asset.public_url_annotations_checked, true);
    assert.ok(asset.pages >= 250);
    assert.equal(digest(await fs.readFile(path.join(root, 'static/downloads/github-review', asset.file))), asset.sha256);
  }
}
const report = {
  status: 'passed', require_complete: requireComplete,
  scope: 'Public ledger, authored-note hashes, source locators and generated exports. No remote requests or upstream execution.',
  statistics: s,
};
await fs.writeFile(path.join(root, 'verification/github-review-check.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
