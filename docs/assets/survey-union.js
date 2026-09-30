(() => {
  const rows=Array.from(document.querySelectorAll('[data-union-row]'));
  if(!rows.length)return;
  const controls=Object.fromEntries(['q','category','pool','inventory'].map(k=>[k,document.getElementById('union-'+k)]));
  const params=new URLSearchParams(location.search);
  for(const[key,node]of Object.entries(controls)){
    const value=params.get(key);
    if(value!==null&&(node.tagName!=='SELECT'||Array.from(node.options).some(o=>o.value===value)))node.value=value;
  }
  const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
  const count=document.getElementById('union-count');
  function render(updateURL){
    const v=Object.fromEntries(Object.entries(controls).map(([k,node])=>[k,node.value]));
    const terms=normalize(v.q).split(' ').filter(Boolean);
    let n=0;
    for(const row of rows){
      const match=(!v.category||row.dataset.category===v.category)&&
        (v.pool==='all'||row.dataset.pool===v.pool)&&
        (!v.inventory||row.dataset.inventory===v.inventory)&&
        terms.every(term=>normalize(row.dataset.search+' '+row.textContent).includes(term));
      row.hidden=!match;if(match)n++;
    }
    count.textContent=`${n} / ${rows.length}`;
    count.dataset.visibleCount=String(n);
    if(updateURL){
      const url=new URL(location.href);
      for(const[k,value]of Object.entries(v)){if(value)url.searchParams.set(k,value);else url.searchParams.delete(k);}
      history.replaceState(null,'',url);
    }
  }
  for(const node of Object.values(controls))node.addEventListener(node.tagName==='SELECT'?'change':'input',()=>render(true));
  render(false);
})();
