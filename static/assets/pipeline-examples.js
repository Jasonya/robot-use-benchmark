/* The full walkthrough remains readable if this script is unavailable. */
(() => {
  'use strict';
  const root=document.querySelector('[data-worked-examples]');
  if(!root)return;
  const cases=[...root.querySelectorAll('[data-walkthrough-case]')];
  const caseButtons=[...root.querySelectorAll('[data-walk-case]')];
  const stepButtons=[...root.querySelectorAll('[data-walk-step]')];
  const previous=root.querySelector('[data-walk-prev]');
  const next=root.querySelector('[data-walk-next]');
  const position=root.querySelector('[data-walk-position]');
  const knownCases=new Set(cases.map(node=>node.dataset.walkthroughCase));
  let selectedCase='calvin',selectedStep=1;

  function readURL() {
    const params=new URLSearchParams(location.search);
    const candidate=params.get('example');
    selectedCase=knownCases.has(candidate)?candidate:'calvin';
    const value=Number(params.get('step'));
    selectedStep=Number.isInteger(value)&&value>=1&&value<=8?value:1;
  }
  function render(updateURL=false) {
    let current;
    for(const item of cases) {
      item.hidden=item.dataset.walkthroughCase!==selectedCase;
      if(!item.hidden)current=item;
      for(const panel of item.querySelectorAll('[data-walkthrough-step]'))
        panel.hidden=Number(panel.dataset.walkthroughStep)!==selectedStep;
    }
    for(const button of caseButtons)
      button.setAttribute('aria-pressed',String(button.dataset.walkCase===selectedCase));
    for(const button of stepButtons) {
      const active=Number(button.dataset.walkStep)===selectedStep;
      if(active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    }
    previous.disabled=selectedStep===1;
    next.disabled=selectedStep===8;
    position.textContent=`${position.dataset.label}：${current.dataset.caseName} · ${selectedStep} / 8`;
    root.dataset.activeExample=selectedCase;
    root.dataset.activeStep=String(selectedStep);
    if(updateURL) {
      const url=new URL(location.href);
      url.searchParams.set('example',selectedCase);
      url.searchParams.set('step',String(selectedStep));
      url.hash='pipeline-examples';
      history.replaceState(null,'',url);
    }
  }
  function revealStep(){
    const panel=root.querySelector(`[data-walkthrough-case="${selectedCase}"] [data-walkthrough-step="${selectedStep}"]`);
    if(window.matchMedia('(max-width: 700px)').matches)
      panel.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  for(const button of caseButtons)button.addEventListener('click',()=>{
    selectedCase=button.dataset.walkCase;
    render(true);
  });
  for(const button of stepButtons)button.addEventListener('click',()=>{
    selectedStep=Number(button.dataset.walkStep);
    render(true);
    revealStep();
  });
  previous.addEventListener('click',()=>{
    selectedStep=Math.max(1,selectedStep-1);
    render(true);
    revealStep();
  });
  next.addEventListener('click',()=>{
    selectedStep=Math.min(8,selectedStep+1);
    render(true);
    revealStep();
  });
  window.addEventListener('popstate',()=>{readURL();render();});
  readURL();
  render();
  root.classList.add('walk-enhanced');
})();
