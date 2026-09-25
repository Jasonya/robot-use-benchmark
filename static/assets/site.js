/* The site is fully readable without JavaScript. This adds search and navigation. */
(() => {
  'use strict';
  const config = window.ROBOT_SITE || {};
  const text = config.text || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };
  const localeURL = path => new URL(config.localeRoot + path, location.href).href;
  document.documentElement.classList.add('js');

  $$('.language-switch a').forEach(link => {
    const url = new URL(link.href);
    url.search = location.search;
    url.hash = location.hash;
    link.href = url.href;
    link.addEventListener('click', () => {
      const current = new URL(link.href);
      current.search = location.search;
      current.hash = location.hash;
      link.href = current.href;
      storage.set('robot-use-language', link.dataset.locale);
    });
  });
  storage.set('robot-use-language', config.locale);

  const menu = $('.menu-button');
  menu?.addEventListener('click', () => {
    const open = $('.site-header').classList.toggle('menu-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && $('.site-header.menu-open')) {
      $('.site-header').classList.remove('menu-open');
      menu?.setAttribute('aria-expanded', 'false');
    }
  });

  let toastTimer;
  function toast(message) {
    const node = $('#toast');
    if (!node) return;
    clearTimeout(toastTimer);
    node.textContent = message;
    node.hidden = false;
    toastTimer = setTimeout(() => { node.hidden = true; }, 2600);
  }
  $$('.copy-link').forEach(button => button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      toast(text.copied);
    } catch { toast(text.copyFallback); }
  }));
  $$('.print-page').forEach(button => button.addEventListener('click', () => window.print()));

  const modal = $('#global-search');
  const searchInput = $('#global-search-input');
  const searchResults = $('#global-search-results');
  const searchHelp = $('#global-search-help');
  let lastFocus = null;
  let searchIndex = window.SEARCH_INDEX || [];
  let searchPromise = null;
  const searchSequences = new WeakMap();
  function ensureSearchIndex() {
    if (Array.isArray(window.SEARCH_INDEX)) {
      searchIndex = window.SEARCH_INDEX;
      return Promise.resolve();
    }
    if (searchPromise) return searchPromise;
    searchPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = config.searchIndexURL;
      script.async = true;
      script.onload = () => {
        if (!Array.isArray(window.SEARCH_INDEX)) {
          searchPromise = null;
          reject(new Error('Invalid search index'));
          return;
        }
        searchIndex = window.SEARCH_INDEX;
        resolve();
      };
      script.onerror = () => { searchPromise = null; script.remove(); reject(new Error('Search index unavailable')); };
      document.head.append(script);
    });
    return searchPromise;
  }
  function resultsFor(query) {
    const terms = normalize(query).split(' ').filter(Boolean);
    if (!terms.length) return searchIndex.filter(entry => entry.kind === 'chapter').slice(0, 6);
    return searchIndex.map(entry => {
      const body = normalize(entry.search);
      if (!terms.every(term => body.includes(term))) return null;
      const title = normalize(entry.title);
      const score = terms.reduce((total, term) => total + (title === term ? 100 : title.includes(term) ? 12 : 1), 0);
      return { ...entry, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 60);
  }
  async function renderSearch(query, output, help) {
    if (!output) return;
    const sequence = (searchSequences.get(output) || 0) + 1;
    searchSequences.set(output, sequence);
    if (!searchIndex.length && help) help.textContent = text.searchLoading;
    try {
      await ensureSearchIndex();
    } catch {
      if (searchSequences.get(output) === sequence && help) help.textContent = text.searchLoadFailed;
      return;
    }
    if (searchSequences.get(output) !== sequence) return;
    const matches = resultsFor(query);
    output.replaceChildren();
    if (help) help.textContent = normalize(query) ? `${text.searchMatches} ${matches.length}${matches.length === 60 ? '+' : ''}` : text.searchHint;
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'search-help';
      empty.textContent = text.noSearch;
      output.append(empty);
      return;
    }
    for (const entry of matches) {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = localeURL(entry.path);
      const kind = document.createElement('span');
      kind.className = 'kind';
      kind.textContent = text.kinds[entry.kind] || entry.kind;
      const heading = document.createElement('h3');
      heading.textContent = entry.title;
      const description = document.createElement('p');
      description.textContent = entry.summary;
      link.append(kind, heading, description);
      link.addEventListener('click', () => modal?.close());
      output.append(link);
    }
  }
  function openSearch() {
    if (!modal || modal.open) return;
    lastFocus = document.activeElement;
    modal.showModal();
    renderSearch(searchInput.value, searchResults, searchHelp);
    searchInput.focus();
  }
  $$('.search-trigger').forEach(button => button.addEventListener('click', openSearch));
  $('#close-search')?.addEventListener('click', () => modal.close());
  modal?.addEventListener('close', () => { if (lastFocus?.isConnected) lastFocus.focus(); });
  modal?.addEventListener('click', event => {
    const rect = modal.getBoundingClientRect();
    if (event.target === modal && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) modal.close();
  });
  searchInput?.addEventListener('input', () => renderSearch(searchInput.value, searchResults, searchHelp));
  document.addEventListener('keydown', event => {
    const editing = /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable;
    if ((!editing && event.key === '/') || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')) {
      event.preventDefault();
      openSearch();
    }
  });
  const standalone = $('#site-search-input');
  if (standalone) {
    standalone.value = new URLSearchParams(location.search).get('q') || '';
    const update = () => {
      renderSearch(standalone.value, $('#site-search-results'), $('#site-search-help'));
      const url = new URL(location.href);
      if (standalone.value) url.searchParams.set('q', standalone.value); else url.searchParams.delete('q');
      history.replaceState(null, '', url);
    };
    standalone.addEventListener('input', update);
    update();
  }

  const catalogue = $('[data-catalogue]');
  if (catalogue) {
    const entries = $$('[data-entry]', catalogue);
    const controls = $$('[data-filter]');
    const size = Number(catalogue.dataset.pageSize || 12);
    const params = new URLSearchParams(location.search);
    let page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
    let all = params.get('all') === '1';
    let matching = [];
    for (const control of controls) {
      const value = params.get(control.dataset.filter);
      if (value !== null) {
        if (control.tagName === 'SELECT' && !Array.from(control.options).some(option => option.value === value)) continue;
        control.value = value;
      }
    }
    function applyFilters(options = {}) {
      const values = Object.fromEntries(controls.map(control => [control.dataset.filter, control.value]));
      const terms = normalize(values.q).split(' ').filter(Boolean);
      matching = entries.filter(entry => {
        const matchesText = terms.every(term => normalize(entry.dataset.search).includes(term));
        return matchesText && Object.entries(values).every(([key, value]) =>
          key === 'q' || !value || String(entry.dataset[key] || '').split('|').includes(value));
      });
      const pages = Math.max(1, Math.ceil(matching.length / size));
      page = Math.min(Math.max(page, 1), pages);
      const visible = new Set(all ? matching : matching.slice((page - 1) * size, page * size));
      entries.forEach(entry => { entry.hidden = !visible.has(entry); });
      $('#no-results').hidden = matching.length !== 0;
      const start = matching.length ? all ? 1 : (page - 1) * size + 1 : 0;
      const end = all ? matching.length : Math.min(page * size, matching.length);
      $('#result-count').textContent = `${text.showing} ${start}–${end} / ${matching.length} ${text.records}`;
      $('#page-status').textContent = all ? text.allShown : `${page} / ${pages}`;
      $('#previous-page').disabled = all || page <= 1;
      $('#next-page').disabled = all || page >= pages;
      $('#show-all').textContent = all ? text.paginate : text.showAll;
      $('#share-results').setAttribute('aria-label', text.shareResults);
      if (!options.preserveURL) {
        const url = new URL(location.href);
        url.search = '';
        for (const [key, value] of Object.entries(values)) if (value) url.searchParams.set(key, value);
        if (page > 1 && !all) url.searchParams.set('page', String(page));
        if (all) url.searchParams.set('all', '1');
        if (!options.keepHash) url.hash = '';
        history.replaceState(null, '', url);
      }
    }
    function showHash() {
      if (!location.hash) return false;
      let id;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return false; }
      const node = document.getElementById(id);
      const entry = node?.matches('[data-entry]') ? node : node?.closest('[data-entry]');
      if (!entry) return false;
      if (!matching.includes(entry)) controls.forEach(control => { control.value = ''; });
      applyFilters({ preserveURL: true });
      page = Math.floor(matching.indexOf(entry) / size) + 1;
      applyFilters({ preserveURL: true });
      const detail = $('details', entry);
      if (detail) detail.open = true;
      requestAnimationFrame(() => entry.scrollIntoView({ behavior: 'instant', block: 'start' }));
      return true;
    }
    controls.forEach(control => control.addEventListener(control.tagName === 'SELECT' ? 'change' : 'input', () => {
      page = 1;
      applyFilters();
    }));
    $('#reset-filters')?.addEventListener('click', () => {
      controls.forEach(control => { control.value = ''; });
      page = 1; all = false; applyFilters();
    });
    $('#previous-page')?.addEventListener('click', () => { page--; applyFilters(); catalogue.scrollIntoView({ block: 'start' }); });
    $('#next-page')?.addEventListener('click', () => { page++; applyFilters(); catalogue.scrollIntoView({ block: 'start' }); });
    $('#show-all')?.addEventListener('click', () => { all = !all; page = 1; applyFilters(); });
    $('#share-results')?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); toast(text.copied); } catch { toast(text.copyFallback); }
    });
    window.addEventListener('hashchange', showHash);
    applyFilters({ preserveURL: true });
    showHash();
  }

  const goalButtons = $$('[data-demo-goal]');
  goalButtons.forEach(button => button.addEventListener('click', () => {
    const goal = button.dataset.demoGoal;
    goalButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    $('#towel-fold-a')?.setAttribute('visibility', goal === 'a' ? 'visible' : 'hidden');
    $('#towel-fold-b')?.setAttribute('visibility', goal === 'b' ? 'visible' : 'hidden');
    $('#fold-pairs').textContent = goal === 'a' ? 'D → A · C → B' : 'B → A · C → D';
    $('#demo-message').textContent = goal === 'a' ? text.demoA : text.demoB;
  }));

  const capacity = $('[data-capacity-bindings]');
  if (capacity) {
    const controls = $$('[data-capacity-input]', capacity);
    const updateCapacity = () => {
      const values = Object.fromEntries(controls.map(control => [control.dataset.capacityInput, Number(control.value)]));
      const instances = Number(capacity.dataset.capacityBindings) * values.instances;
      const cases = instances * values.conditions;
      const perMethod = cases * values.repeats;
      const outputs = { instances, cases, 'per-method': perMethod, total: perMethod * values.methods };
      for (const [key, value] of Object.entries(outputs)) {
        $(`[data-capacity-output="${key}"]`, capacity).textContent = value.toLocaleString('en-US');
      }
    };
    controls.forEach(control => control.addEventListener('change', updateCapacity));
    updateCapacity();
  }

  if (config.kind === 'readiness') {
    const openAuditHash = () => {
      let id;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      const node = document.getElementById(id);
      if (!node?.matches('[data-audit-gap]')) return;
      node.open = true;
      requestAnimationFrame(() => node.scrollIntoView({ behavior: 'instant', block: 'start' }));
    };
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#gap-"]');
      if (!link) return;
      const node = document.getElementById(link.hash.slice(1));
      if (node?.matches('[data-audit-gap]')) node.open = true;
    });
    window.addEventListener('hashchange', openAuditHash);
    openAuditHash();
  }

  if (['chapter', 'design', 'readiness'].includes(config.kind)) {
    if (config.kind === 'chapter') storage.set('robot-use-reading', JSON.stringify({ path: config.route, title: config.title }));
    const headingLinks = $$('.on-this-page a');
    const headings = headingLinks.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(items => {
        const item = items.find(entry => entry.isIntersecting);
        if (!item) return;
        headingLinks.forEach(link => {
          const active = decodeURIComponent(link.hash.slice(1)) === item.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      }, { rootMargin: '-100px 0px -65% 0px' });
      headings.forEach(heading => observer.observe(heading));
    }
    const progress = $('.reading-progress');
    const updateProgress = () => {
      const prose = $('.reader');
      if (!prose || !progress) return;
      const top = prose.getBoundingClientRect().top + scrollY;
      const distance = prose.scrollHeight - innerHeight + 120;
      const fraction = Math.min(1, Math.max(0, (scrollY - top + 100) / Math.max(distance, 1)));
      progress.style.width = `${fraction * 100}%`;
    };
    document.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }
  const resume = $('#resume-reading');
  if (resume) {
    try {
      const recent = JSON.parse(storage.get('robot-use-reading') || 'null');
      if (recent && /^chapters\/\d{2}\.html$/.test(recent.path)) {
        resume.href = localeURL(recent.path);
        resume.textContent = `${text.continueReading} →`;
        resume.hidden = false;
      }
    } catch {}
  }
})();
