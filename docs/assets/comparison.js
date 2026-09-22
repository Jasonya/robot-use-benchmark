(() => {
  'use strict';
  const root = document.querySelector('.comparison-main');
  if (!root) return;
  const query = document.getElementById('comparison-query');
  const group = document.getElementById('comparison-group');
  const pin = document.getElementById('comparison-pin');
  const normalize = value => String(value || '').normalize('NFKC').toLowerCase().trim();
  const rows = Array.from(root.querySelectorAll('[data-comparison-row]'));
  const panels = Array.from(root.querySelectorAll('[data-comparison-panel]'));
  const buttons = Array.from(root.querySelectorAll('[data-comparison-view]'));
  const sources = Array.from(root.querySelectorAll('[data-comparison-evidence]'));
  const params = new URLSearchParams(location.search);
  let view = buttons.some(button=>button.dataset.comparisonView===params.get('view')) ? params.get('view') : 'scale';
  query.value = params.get('q') || '';
  if (Array.from(group.options).some(option=>option.value===params.get('group'))) group.value=params.get('group');
  pin.checked = params.get('pin') !== '0';
  function update(writeURL=true) {
    const terms=normalize(query.value).split(/\s+/).filter(Boolean);
    const visible = new Set();
    for (const row of rows) {
      const pinned = pin.checked && row.dataset.comparisonGroup==='ours';
      const match=pinned || ((!group.value || row.dataset.comparisonGroup===group.value) && terms.every(term=>normalize(row.dataset.comparisonSearch).includes(term)));
      row.hidden=!match;
      if (match) visible.add(row.dataset.comparisonRow);
    }
    sources.forEach(source=>{source.hidden=!visible.has(source.dataset.comparisonEvidence);});
    panels.forEach(panel=>{panel.hidden=panel.dataset.comparisonPanel!==view;});
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.comparisonView===view)));
    document.getElementById('comparison-count').textContent=`${visible.size} / 35 ${window.ROBOT_SITE.locale==='zh-hans'?'行':'列'}`;
    document.getElementById('comparison-empty').hidden=visible.size!==0;
    if (writeURL) {
      const url=new URL(location.href);
      if(query.value)url.searchParams.set('q',query.value);else url.searchParams.delete('q');
      if(group.value)url.searchParams.set('group',group.value);else url.searchParams.delete('group');
      if(view!=='scale')url.searchParams.set('view',view);else url.searchParams.delete('view');
      if(!pin.checked)url.searchParams.set('pin','0');else url.searchParams.delete('pin');
      history.replaceState(null,'',url);
    }
  }
  function openHash() {
    let id;
    try {id=decodeURIComponent(location.hash.slice(1));} catch {return;}
    const item=document.getElementById(id);
    if (!item?.matches('[data-comparison-evidence]')) return;
    if (item.hidden) {query.value='';group.value='';update();}
    item.open=true;
    requestAnimationFrame(()=>item.scrollIntoView({behavior:'instant',block:'start'}));
  }
  query.addEventListener('input',()=>update());
  group.addEventListener('change',()=>update());
  pin.addEventListener('change',()=>update());
  buttons.forEach(button=>button.addEventListener('click',()=>{view=button.dataset.comparisonView;update();}));
  document.getElementById('comparison-reset').addEventListener('click',()=>{query.value='';group.value='';pin.checked=true;update();});
  root.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#benchmark-"]');
    if (!link) return;
    const item=document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if(item) item.open=true;
    if(item?.hidden){query.value='';group.value='';update();}
  });
  window.addEventListener('hashchange',openHash);
  update(false);
  openHash();
})();
