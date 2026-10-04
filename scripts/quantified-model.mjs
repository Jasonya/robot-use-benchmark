import assert from 'node:assert/strict';

export function validateNumbers(contract, inventory) {
  const fields=contract.primary_fields;
  assert.deepEqual(fields.map(f=>f.id),['domain','environment','task','case','evaluation']);
  assert.ok(fields.every(f=>f.target===null),'Retired quotas must not remain active');
  const sum=(rows,key)=>rows.reduce((n,r)=>n+r[key],0);
  assert.equal(contract.domain_quotas.length,0);
  assert.equal(contract.case_target_components.length,0);
  for(const field of fields)assert.ok(Number.isInteger(field.current_value??inventory[field.current_key]));
  assert.equal(inventory.source_task_and_information_records,inventory.robot_task_source_definitions+inventory.openeqa_information_categories_separate);
  assert.equal(sum(inventory.case_definitions_by_source_split,'count'),inventory.case_definition_records);
  assert.equal(Object.values(inventory.environment_counts).reduce((a,b)=>a+b,0),inventory.source_named_environment_definitions);
  return {contract,inventory};
}

export function quantityRows(numbers){
  return numbers.contract.primary_fields.map(field=>({
    ...field,current:field.current_value??numbers.inventory[field.current_key]
  }));
}

export function applySourceOverlay({stats,registry,sources,additions},numbers,newDefinitions,pins){
  const currentRegistry=structuredClone(registry);
  const currentSources=structuredClone(sources);
  for(const sourceId of ['calvin','openeqa']){
    const entries=newDefinitions.filter(r=>r.source_id===sourceId);
    const paperId=entries[0].paper_ids[0];
    const source=currentRegistry.find(r=>r.paper_id===paperId);
    const units=Object.fromEntries([...new Set(entries.map(r=>r.native_unit))].map(unit=>[unit,entries.filter(r=>r.native_unit===unit).length]));
    Object.assign(source,{
      source_records:entries.length,native_units:units,source_ids:[sourceId],
      task_list_status:'fixed_source_records_available',task_list_complete_for_whole_work:true,
      native_tasks:sourceId==='calvin'?'34個原作子任務定義，已連到goal checker簽名':'7個原作資訊題型，取自固定題目JSON的category欄',
      source_scope_note:sourceId==='calvin'?'CALVIN固定commit的34條task定義；不把1,000條指令鏈當作已取得。':'OpenEQA固定JSON中的7個category；題數按1,636個question_id另計，不能稱為7個機器人工作。',
      collection_snapshot:numbers.contract.effective_on
    });
    currentSources.push({
      source_id:sourceId,name:source.name,paper_ids:[paperId],records:entries.length,
      native_units:units,buckets:{[entries[0].inventory_bucket]:entries.length},
      repositories:[entries[0].repository],commits:[entries[0].commit],
      definition_url:entries[0].source_url,source_snapshot:numbers.contract.effective_on
    });
  }
  const partnr=currentRegistry.find(r=>r.paper_id==='P143');
  partnr.scenes='本版公開HSSD-partnr分支50個命名場景定義；所取train／val題目實際引用49個。論文60房屋另保留版本說明。';
  partnr.cases='本版固定公開檔案：111,652 train＋1,000 val題目定義；未取得公開test檔。完整3D資產與執行另驗證。';
  partnr.case_inventory_status='definition_metadata_acquired';
  partnr.case_records=112652;
  const openeqa=currentRegistry.find(r=>r.paper_id==='P038');
  openeqa.scenes='本版資料含152個episode_history觀測引用，未當作152個可交互場景；原文>180環境的說法保留歷史口徑。';
  openeqa.cases='固定open-eqa-v0.json：1,636題；152個episode_history輸入資源ID不算作互動場景。';
  openeqa.case_inventory_status='question_and_answer_metadata_acquired';
  openeqa.case_records=1636;
  const currentStats={
    ...structuredClone(stats),
    version:'survey-union-0.9',date:numbers.contract.effective_on,
    total_source_records:stats.total_source_records+newDefinitions.length,
    previous_source_records:stats.total_source_records,
    newly_extracted_source_records:newDefinitions.length,
    source_snapshots:stats.source_snapshots+2,source_repositories:stats.source_repositories+2,
    native_robot_task_candidates:numbers.inventory.robot_task_source_definitions,
    information_task_definitions:numbers.inventory.openeqa_information_categories_separate,
    benchmark_source_records_with_task_inventory:stats.benchmark_source_records_with_task_inventory+2,
    benchmark_source_records_awaiting_task_inventory:stats.benchmark_source_records_awaiting_task_inventory-2,
    records_by_bucket:{...stats.records_by_bucket,native_task_candidates:numbers.inventory.robot_task_source_definitions,information_task_definitions:7},
    new_source_counts:{calvin:34,openeqa:7},
    previous_source_addition_counts:stats.new_source_counts,
    quantity_contract_version:numbers.contract.version,
    categories:stats.categories.map(c=>({...c,task_source_paper_records:currentRegistry.filter(r=>r.category===c.id&&r.source_records>0).length})),
    case_definition_records:numbers.inventory.case_definition_records,
    scene_definition_records:numbers.inventory.source_named_environment_definitions,
    runtime_scope:'This update acquires source definitions and case metadata. No additional model/simulator trials or source visual assets are claimed.'
  };
  return {stats:currentStats,registry:currentRegistry,sources:currentSources,additions:[...additions,...newDefinitions]};
}

export function currentQuantityRecords(numbers, sourcePins){
  const record=(paper_id,id,field,value,term,unit,scope,url,note='')=>({
    record_id:`numbers09:${id}`,paper_id,field,native_term:term,unit,value,value_kind:'exact',
    scope,source_version:`本版固定清單 ${numbers.contract.effective_on}`,
    evidence:[{source:url,locator:'逐筆ID清單及inventory_summary.json；固定commit來源',basis:'counted_pinned_definitions'}],
    notes:note,eligible_for_global_sum:false
  });
  const {calvin,calvin_env,openeqa,partnr_episodes,hssd_partnr,robocasa}=sourcePins;
  return [
    record('P071','robocasa-layouts','environment',60,'命名layout定義（50 train＋10 test）','layout','available_source_snapshot',`https://github.com/${robocasa.repo}/tree/${robocasa.commit}/robocasa/models/assets/scenes/kitchen_layouts`,'2,500種預訓練樣式組合不改名為2,500個layout。'),
    record('P065','calvin-scenes','environment',4,'原作A–D場景定義','native_scene','available_source_snapshot',`https://github.com/${calvin_env.repo}/tree/${calvin_env.commit}/conf/scene`,'D_eval沿用D的layout，不加成第五個。'),
    record('P065','calvin-tasks','task',34,'原作子任務定義','native_task','available_source_snapshot',`https://github.com/${calvin.repo}/blob/${calvin.commit}/calvin_models/conf/callbacks/rollout/tasks/new_playtable_tasks.yaml`),
    record('P143','partnr-scenes','environment',50,'公開HSSD-partnr場景定義','native_scene','available_source_snapshot',`https://huggingface.co/datasets/${hssd_partnr.repo}/tree/${hssd_partnr.commit}/scenes-partnr-filtered`,'此公開版本有50個場景檔；所取train／val題目引用49個。論文60房屋是不同範圍。'),
    record('P143','partnr-train','case',111652,'train題目定義','episode','training',`https://huggingface.co/datasets/${partnr_episodes.repo}/resolve/${partnr_episodes.commit}/v0_0/train.json.gz`,'按原生episode_id實數；只表示定義元資料，不是已跑的模型試驗。'),
    record('P143','partnr-val','case',1000,'val題目定義','episode','validation',`https://huggingface.co/datasets/${partnr_episodes.repo}/resolve/${partnr_episodes.commit}/v0_0/val.json.gz`,'此固定repo未提供test.json.gz，不額外計入1,000 test。'),
    record('P038','openeqa-types','task',7,'原作資訊題型','information_task_schema','available_source_snapshot',`https://github.com/${openeqa.repo}/blob/${openeqa.commit}/data/open-eqa-v0.json`,'問答category，不是7個robot工作。'),
    record('P038','openeqa-cases','case',1636,'question_id題目定義','evaluation_case','available_source_snapshot',`https://github.com/${openeqa.repo}/blob/${openeqa.commit}/data/open-eqa-v0.json`,'已取得問題、答案與episode_history引用；未完整下載歷史影像。原作未分train／val／test。')
  ];
}

export function recordIsHistoricalForCurrentInventory(record){
  return (
    (record.work_id==='robocasa365'&&['native_scene','layout','style'].includes(record.unit))||
    (record.work_id==='calvin'&&['native_scene','native_task'].includes(record.unit))||
    (record.work_id==='partnr'&&['native_scene','episode'].includes(record.unit))||
    (record.paper_id==='P038'&&['case','environment'].includes(record.field)&&!record.record_id.startsWith('numbers09:'))
  );
}

export function sourceBridgeCSV(records){
  const keys=[...new Set(records.flatMap(r=>Object.keys(r)))];
  const cell=v=>`"${String(v==null?'':typeof v==='object'?JSON.stringify(v):v).replaceAll('"','""')}"`;
  return '\uFEFF'+[keys.join(','),...records.map(r=>keys.map(k=>cell(r[k])).join(','))].join('\n')+'\n';
}

export function quantityReportMarkdown(numbers){
  const {contract,inventory}=numbers;
  return [
    '# 固定來源ID清單：v0.11說明','',
    'v0.9的建設配額已撤回。此檔保留先前取得的ID清單數；完整183來源逐篇比較與21用途分類見 ../coverage/COVERAGE_REPORT.md。','',
    '| 項目 | 已取得清單 | 界線 |','|---|---:|---|',
    ...quantityRows(numbers).map(f=>`| ${f.label} | ${f.current.toLocaleString('en-US')} ${f.current_unit} | ${f.current_limit} |`),'',
    '284是命名場景條目；未完成跨來源幾何去重。2,096robot任務、7資訊題型、263人類活動各自計數；不是共同去重後的任務總量。','',
    '| 題目來源 | 原生split | 元資料筆數 |','|---|---|---|',
    ...inventory.case_definitions_by_source_split.map(r=>`| ${r.source_id} | ${r.native_split} | ${r.count.toLocaleString('en-US')} |`),'',
    '114,288筆含train/val，不是已整合的114,288道測試題。原生ID、必需欄位、輸入及判分引用已作結構檢查；完整視覺素材、3D資產和runtime未全部驗證。','',
    '完整case_registry.csv.gz/jsonl.gz及source_pins保留下載。本輪沒有新增模型試驗；既有試作仍為工程附錄。','',
    '| 舊數字 | 原範圍 | 現在處理 |','|---|---|---|',
    ...contract.version_crosswalk.map(r=>`| ${r.old} | ${r.old_scope} | ${r.current} |`),'',
    '全庫環境／任務聯集和整合可評題數尚未確認，未知值不填0，也不先設配額。',''
  ].join('\n');
}
