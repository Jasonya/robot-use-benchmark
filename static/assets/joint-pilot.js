(()=>{
  const root=document.querySelector('[data-joint-viewer]');
  if(!root||!window.JOINT_PILOT_DEMOS)return;
  const data=window.JOINT_PILOT_DEMOS;
  const selectors={sku:document.getElementById('joint-sku'),bay:document.getElementById('joint-bay'),fault:document.getElementById('joint-fault'),method:document.getElementById('joint-method')};
  const query=new URLSearchParams(location.search);
  for(const[k,el]of Object.entries(selectors)){
    const value=query.get(k);
    if(value&&Array.from(el.options).some(o=>o.value===value))el.value=value;
  }
  function update(changeURL){
    const choice=Object.fromEntries(Object.entries(selectors).map(([k,el])=>[k,el.value]));
    const record=data.find(r=>r.sku===choice.sku&&r.bay_id===choice.bay&&r.fault_mode===choice.fault&&r.method_id===choice.method);
    if(!record)return;
    document.getElementById('joint-initial-image').src=root.dataset.imageBase+record.initial_image_ref;
    document.getElementById('joint-final-image').src=root.dataset.imageBase+record.final_image_ref;
    for(const[id,key]of [['joint-physical','physical_success'],['joint-digital','digital_success'],['joint-success','joint_success']]){
      const el=document.getElementById(id);el.textContent=record[key]?root.dataset.pass:root.dataset.fail;el.dataset.passed=String(record[key]);
    }
    document.getElementById('joint-dispatch-count').textContent=record.dispatch_events;
    document.getElementById('joint-case-id').textContent=record.case_id;
    document.getElementById('joint-trial-id').textContent=record.trial_id;
    document.getElementById('joint-agent-status').textContent=record.agent_status;
    document.getElementById('joint-inventory').textContent=record.final_inventory.map(r=>`${r.sku} · ${root.dataset.available} ${r.available} · ${root.dataset.location} ${r.declared_location}`).join(' | ');
    root.dataset.selectedTrial=record.trial_id;
    if(changeURL){
      const url=new URL(location.href);for(const[k,v]of Object.entries(choice))url.searchParams.set(k,v);
      history.replaceState(null,'',url);
    }
  }
  for(const el of Object.values(selectors))el.addEventListener('change',()=>update(true));
  update(false);
})();
