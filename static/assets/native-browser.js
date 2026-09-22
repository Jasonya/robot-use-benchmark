/* Browse public, static source records. This does not run any robot environment. */
(() => {
  'use strict';
  const host = document.querySelector('[data-native-browser]');
  const data = window.NATIVE_SOURCE_DATA;
  const config = window.ROBOT_SITE;
  if (!host || !data || !config) return;
  const text = config.text.native;
  const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
  const controls = Array.from(document.querySelectorAll('[data-native-filter]'));
  const records = data.records;
  const size = 24;
  const input = new URLSearchParams(location.search);
  let page = Math.max(1, parseInt(input.get('page') || '1', 10) || 1);
  let matches = [];
  let highlight = null;
  for (const control of controls) {
    const value = input.get(control.dataset.nativeFilter);
    if (control.type === 'checkbox') control.checked = value === '1';
    else if (value !== null) {
      if (control.tagName === 'SELECT' && !Array.from(control.options).some(option => option.value === value)) continue;
      control.value = value;
    }
  }
  const field = (label, value, className = '') => {
    const p = document.createElement('p');
    p.className = className;
    const b = document.createElement('b');
    b.textContent = label + ' ';
    p.append(b, document.createTextNode(value));
    return p;
  };
  function sourceURL(record, file = record.p) {
    const source = data.sources[record.s];
    const encoded = file.split('/').map(encodeURIComponent).join('/');
    const line = file === record.p && record.line ? '#L' + record.line : '';
    return `https://github.com/${source.repo}/blob/${source.commit}/${encoded}${line}`;
  }
  function external(label, href) {
    const a = document.createElement('a');
    a.textContent = label;
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  }
  function card(record) {
    const source = data.sources[record.s];
    const article = document.createElement('article');
    article.className = 'record-card native-card';
    article.id = record.id;
    article.dataset.nativeRecord = record.id;
    article.dataset.source = record.s;
    const badge = document.createElement('span');
    badge.className = 'entry-badge';
    badge.textContent = text.units[record.u] || record.u;
    const title = document.createElement('h3');
    title.textContent = record.n;
    article.append(badge, title, field(text.source, source.work), field(text.definition, record.p, 'meta'));
    if (record.v) {
      const flag = document.createElement('p');
      flag.className = 'native-variant-note';
      flag.textContent = text.configOnly;
      article.append(flag);
    }
    if (typeof record.ds === 'boolean') {
      const membership = document.createElement('p');
      membership.className = 'meta';
      membership.textContent = record.ds ? text.datasetYes : text.datasetNo;
      article.append(membership);
    }
    const primary = external(text.viewSource + ' ↗', sourceURL(record));
    primary.className = 'section-link';
    article.append(primary);
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = text.details;
    const body = document.createElement('div');
    body.className = 'detail-content';
    body.append(field('Repository', source.repo), field('Commit', source.commit, 'meta'));
    if (record.a.length) body.append(field(text.aliases, record.a.join(' · '), 'meta'));
    if (record.ar.length) {
      const p = document.createElement('p');
      const b = document.createElement('b');
      b.textContent = text.assets + ' ';
      p.append(b);
      record.ar.forEach((asset, i) => {
        if (i) p.append(document.createTextNode(' · '));
        p.append(external(asset, sourceURL(record, asset)));
      });
      body.append(p);
    }
    const note = document.createElement('p');
    note.className = 'meta';
    note.textContent = text.staticOnly;
    body.append(note);
    details.append(summary, body);
    details.open = highlight === record.id;
    article.append(details);
    return article;
  }
  const searchable = new Map(records.map(record => [
    record.id,
    normalize([record.n, record.t, data.sources[record.s].work, record.p, record.a.join(' '), record.h].join(' '))
  ]));
  function values() {
    return Object.fromEntries(controls.map(control => [
      control.dataset.nativeFilter,
      control.type === 'checkbox' ? control.checked ? '1' : '' : control.value
    ]));
  }
  function filter() {
    const v = values();
    const words = normalize(v.q).split(' ').filter(Boolean);
    matches = records.filter(record =>
      (!v.source || record.s === v.source) &&
      (!v.unit || record.u === v.unit) &&
      (!v.bucket || record.b === v.bucket) &&
      (v.hide_config !== '1' || !record.v) &&
      words.every(word => searchable.get(record.id).includes(word)));
  }
  function render({ preserveURL = false } = {}) {
    filter();
    const pages = Math.max(1, Math.ceil(matches.length / size));
    page = Math.min(Math.max(1, page), pages);
    const target = document.getElementById('native-records');
    target.replaceChildren(...matches.slice((page - 1) * size, page * size).map(card));
    const first = matches.length ? (page - 1) * size + 1 : 0;
    const last = Math.min(page * size, matches.length);
    document.getElementById('native-count').textContent = `${text.showing} ${first}–${last} / ${matches.length.toLocaleString()} ${text.records}`;
    document.getElementById('native-page').textContent = `${page} / ${pages}`;
    document.getElementById('native-empty').hidden = matches.length !== 0;
    document.getElementById('native-prev').disabled = page <= 1;
    document.getElementById('native-next').disabled = page >= pages;
    if (!preserveURL) {
      const url = new URL(location.href);
      url.search = '';
      url.hash = highlight || '';
      for (const [key, value] of Object.entries(values())) if (value) url.searchParams.set(key, value);
      if (page > 1) url.searchParams.set('page', String(page));
      history.replaceState(null, '', url);
    }
  }
  function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const row = records.find(record => record.id === id);
    if (!row) return;
    filter();
    if (!matches.some(record => record.id === id)) {
      controls.forEach(control => {
        if (control.type === 'checkbox') control.checked = false; else control.value = '';
      });
      filter();
    }
    page = Math.floor(matches.findIndex(record => record.id === id) / size) + 1;
    highlight = id;
    render({ preserveURL: true });
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }
  let searchTimer;
  for (const control of controls) {
    const update = () => { page = 1; highlight = null; render(); };
    control.addEventListener(control.tagName === 'SELECT' || control.type === 'checkbox' ? 'change' : 'input', () => {
      clearTimeout(searchTimer);
      if (control.type === 'search') searchTimer = setTimeout(update, 80); else update();
    });
  }
  document.getElementById('native-reset').addEventListener('click', () => {
    controls.forEach(control => { if (control.type === 'checkbox') control.checked = false; else control.value = ''; });
    page = 1; highlight = null; render();
  });
  document.getElementById('native-prev').addEventListener('click', () => { page--; highlight = null; render(); host.scrollIntoView({ block: 'start' }); });
  document.getElementById('native-next').addEventListener('click', () => { page++; highlight = null; render(); host.scrollIntoView({ block: 'start' }); });
  window.addEventListener('hashchange', revealHash);
  render({ preserveURL: true });
  revealHash();
})();
