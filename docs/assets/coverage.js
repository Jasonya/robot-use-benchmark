(()=>{
  const table=document.querySelector('#coverage-benchmarks');
  if(!table)return;
  const rows=[...table.querySelectorAll('tbody > tr')];
  const q=document.querySelector('#coverage-q');
  const method=document.querySelector('#coverage-method');
  const domain=document.querySelector('#coverage-domain-filter');
  const type=document.querySelector('#coverage-type');
  const status=document.querySelector('#coverage-count');
  const pageStatus=document.querySelector('#coverage-page-status');
  const previous=document.querySelector('#coverage-prev');
  const next=document.querySelector('#coverage-next');
  const allButton=document.querySelector('#coverage-all');
  const hans=document.documentElement.lang==='zh-Hans';
  const words=hans?{source:'笔来源',show:'显示',all:'显示全部',pages:'恢复分页'}:{source:'筆來源',show:'顯示',all:'顯示全部',pages:'恢復分頁'};
  let page=1;
  let showAll=false;
  const pageSize=12;
  const restore=()=>{
    const params=new URLSearchParams(location.search);
    q.value=params.get('q')||'';
    method.value=params.get('method')||'';
    if(domain)domain.value=params.get('domain')||'';
    if(type)type.value=params.get('type')||'';
    page=Math.max(1,parseInt(params.get('page')||'1',10)||1);
    showAll=params.get('all')==='1';
  };
  const matching=()=>{
    const terms=q.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    return rows.filter(row=>{
      const methods=row.dataset.methods.split(' ').filter(Boolean);
      const domains=(row.dataset.domains||'').split(' ').filter(Boolean);
      return terms.every(term=>row.dataset.search.toLocaleLowerCase().includes(term)) &&
        (!domain?.value||(domain.value==='unspecified'?!domains.length:domains.includes(domain.value))) &&
        (!type?.value||row.dataset.type===type.value) &&
        (!method.value || (method.value==='pending'?!methods.length:methods.includes(method.value)));
    });
  };
  function render(update=true,keepSourceHash=false){
    const filtered=matching();
    const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
    page=Math.max(1,Math.min(page,pages));
    const shown=showAll?filtered:filtered.slice((page-1)*pageSize,page*pageSize);
    const shownSet=new Set(shown);
    rows.forEach(row=>row.hidden=!shownSet.has(row));
    status.textContent=`${words.show} ${shown.length} / ${filtered.length} ${words.source}（${rows.length}）`;
    status.dataset.matched=String(filtered.length);
    status.dataset.shown=String(shown.length);
    pageStatus.textContent=showAll?`${filtered.length} ${words.source}`:`${page} / ${pages}`;
    previous.disabled=showAll||page===1;
    next.disabled=showAll||page===pages;
    allButton.textContent=showAll?words.pages:words.all;
    document.querySelector('#coverage-empty').hidden=filtered.length!==0;
    if(update){
      const params=new URLSearchParams();
      if(q.value.trim())params.set('q',q.value.trim());
      if(method.value)params.set('method',method.value);
      if(domain?.value)params.set('domain',domain.value);
      if(type?.value)params.set('type',type.value);
      if(page>1&&!showAll)params.set('page',String(page));
      if(showAll)params.set('all','1');
      const hash=location.hash.startsWith('#source-')&&!keepSourceHash?'':location.hash;
      history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+hash);
    }
    document.dispatchEvent(new CustomEvent('robot:filterschange'));
  }
  async function revealHash(){
    if(!location.hash.startsWith('#source-'))return;
    const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if(!target||!rows.includes(target))return;
    q.value='';method.value='';if(domain)domain.value='';if(type)type.value='';
    page=Math.floor(rows.indexOf(target)/pageSize)+1;
    render(true,true);
    await document.fonts.ready;
    target.scrollIntoView({block:'start',behavior:'instant'});
  }
  q.addEventListener('input',()=>{page=1;render();});
  method.addEventListener('change',()=>{page=1;render();});
  domain?.addEventListener('change',()=>{page=1;render();});
  type?.addEventListener('change',()=>{page=1;render();});
  document.querySelector('#coverage-reset').addEventListener('click',()=>{q.value='';method.value='';if(domain)domain.value='';if(type)type.value='';page=1;showAll=false;render();});
  previous.addEventListener('click',()=>{page--;render();document.querySelector('.coverage-table-scroll').scrollIntoView({behavior:'instant',block:'start'});});
  next.addEventListener('click',()=>{page++;render();document.querySelector('.coverage-table-scroll').scrollIntoView({behavior:'instant',block:'start'});});
  allButton.addEventListener('click',()=>{showAll=!showAll;render();});
  addEventListener('hashchange',revealHash);
  addEventListener('popstate',()=>{restore();render(false);revealHash();});
  addEventListener('beforeprint',()=>{const selected=new Set(matching());rows.forEach(row=>row.hidden=!selected.has(row));status.textContent=`${selected.size} ${words.source}`;});
  addEventListener('afterprint',()=>render(false));
  restore();render(false);revealHash();
})();
