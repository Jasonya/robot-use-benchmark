(() => {
  const form = document.querySelector('[data-gh-filters]');
  if (!form) return;
  const rows = [...document.querySelectorAll('[data-gh-row]')];
  const count = document.querySelector('[data-gh-count]');
  const fields = ['q', 'scope', 'status', 'domain'];
  const parameters = new URLSearchParams(location.search);
  const normalize = text => text.normalize('NFKC').toLocaleLowerCase();
  const index = rows.map(row => ({
    row, search: normalize(row.dataset.search || ''),
    domains: (row.dataset.domains || '').split(' '),
  }));
  for (const field of fields) {
    if (!parameters.has(field)) continue;
    const control = form.elements.namedItem(field);
    const value = parameters.get(field);
    if (control.tagName !== 'SELECT' || [...control.options].some(option => option.value === value)) control.value = value;
  }
  function apply(updateURL = true) {
    const values = Object.fromEntries(fields.map(field => [field, form.elements.namedItem(field).value]));
    const terms = normalize(values.q).trim().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const item of index) {
      const match = (!values.scope || item.row.dataset.scope === values.scope) &&
        (!values.status || item.row.dataset.status === values.status) &&
        (!values.domain || item.domains.includes(values.domain)) &&
        terms.every(term => /^p\d{3}$/.test(term) ? item.row.dataset.paper.toLowerCase() === term : item.search.includes(term));
      item.row.hidden = !match;
      shown += Number(match);
    }
    count.textContent = `${count.dataset.countLabel}：${shown} / ${rows.length}`;
    if (updateURL) {
      const url = new URL(location.href);
      fields.forEach(field => url.searchParams.delete(field));
      for (const field of fields) {
        if (values[field] || field === 'scope') url.searchParams.set(field, values[field]);
      }
      history.replaceState(null, '', url);
    }
  }
  form.addEventListener('submit', event => { event.preventDefault(); apply(); });
  form.addEventListener('input', () => apply());
  form.addEventListener('change', () => apply());
  form.addEventListener('reset', () => setTimeout(() => apply(), 0));
  apply(false);
})();
