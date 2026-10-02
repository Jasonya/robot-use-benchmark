(() => {
  function showDefinition(){
    let id;
    try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    if(!/^(?:g[0-5]|t[1-8]|symbols-(?:guide|g|t|environment))$/.test(id))return;
    const target=document.getElementById(id);
    if(target)requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant',block:'start'}));
  }
  document.fonts.ready.then(showDefinition);
  window.addEventListener('hashchange',showDefinition);
  const host=document.querySelector('[data-counting-demo]');
  const input=document.getElementById('counting-cases-per-definition');
  if(!host||!input)return;
  const params=new URLSearchParams(location.search);
  const initial=params.get('cases_per_definition');
  if(initial&&Array.from(input.options).some(o=>o.value===initial))input.value=initial;
  const definitions=Number(host.dataset.definitionCount);
  function update(updateURL){
    const perDefinition=Number(input.value);
    const total=definitions*perDefinition;
    host.querySelector('[data-example-count="cases-per-definition"]').textContent=perDefinition.toLocaleString('en-US');
    host.querySelector('[data-example-count="cases"]').textContent=total.toLocaleString('en-US');
    document.getElementById('counting-formula').textContent=`${definitions} × ${perDefinition.toLocaleString('en-US')} = ${total.toLocaleString('en-US')}`;
    if(updateURL){
      const url=new URL(location.href);
      url.searchParams.set('cases_per_definition',String(perDefinition));
      history.replaceState(null,'',url);
    }
  }
  input.addEventListener('change',()=>update(true));
  update(false);
})();
