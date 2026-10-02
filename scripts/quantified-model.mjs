import assert from 'node:assert/strict';

export function validateNumbers(contract, inventory) {
  const fields=contract.primary_fields;
  assert.deepEqual(fields.map(f=>f.id),['domain','environment','task','case','evaluation']);
  assert.deepEqual(fields.map(f=>f.target),[12,1000,5000,1000000,4]);
  const sum=(rows,key)=>rows.reduce((n,r)=>n+r[key],0);
  assert.equal(contract.domain_quotas.length,12);
  assert.equal(sum(contract.domain_quotas,'environments'),1000);
  assert.equal(sum(contract.domain_quotas,'base_tasks'),2000);
  assert.equal(sum(contract.domain_quotas,'rule_specs'),3000);
  assert.equal(sum(contract.domain_quotas,'task_specs'),5000);
  assert.equal(sum(contract.domain_quotas,'case_budget'),1000000);
  assert.ok(contract.domain_quotas.every(r=>r.base_tasks+r.rule_specs===r.task_specs));
  assert.equal(sum(contract.task_target_components.extension_components,'specs'),3000);
  assert.equal(sum(contract.case_target_components,'total'),1000000);
  assert.ok(contract.case_target_components.every(r=>r.train+r.validation+r.test===r.total));
  assert.equal(sum(contract.case_target_components,'train'),800000);
  assert.equal(sum(contract.case_target_components,'validation'),100000);
  assert.equal(sum(contract.case_target_components,'test'),100000);
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
  const fmt=v=>Number(v).toLocaleString('en-US');
  return [
    '# v0.9：本版規劃目標與目前清單實數','',`更新：${contract.effective_on}。唯一有效目標版本：${contract.version}。`,'',
    contract.planning_scope,'',contract.current_scope,'',
    '| 項目 | 本版規劃目標 | 目前清單實數 | 完成階段／界線 |','|---|---:|---:|---|',
    ...quantityRows(numbers).map(f=>`| ${f.label} | ${fmt(f.target)} ${f.target_unit} | ${fmt(f.current)} ${f.current_unit} | ${f.current_limit} |`),'',
    '目前114,288筆題目定義均通過原生ID、必需欄位、環境／觀測引用與判分程序引用的結構檢查；沒有宣稱已取得全體視覺素材、完成全資產載入或跑完模型。目標與實數的完成階段不同，不直接畫完成百分比。','',
    '## 環境實數怎麼來','',
    '| 原作來源 | 已列場景定義 |','|---|---:|',
    ...Object.entries(inventory.environment_counts).map(([k,v])=>`| ${k} | ${fmt(v)} |`),
    `| 合計 | ${fmt(inventory.source_named_environment_definitions)} |`,'',
    '同一原作layout或底層場景別名不因樣式、D_eval或另一adapter重複加總；尚不宣稱全庫幾何等價審核已完成。OpenEQA的152個history輸入ID不混入此284個場景定義。','',
    '## 任務實數與目標拆分','',
    '目前：原2,062條robot來源定義＋CALVIN34條＝2,096；另加入OpenEQA7個資訊題型，共2,103筆來源任務／題型條目。263个人類活動是示範／程序來源，另列。這些條目還不是共同去重後的任務規格。','',
    '目標：2,000個對齊後基本任務＋3,000份有效規則擴充＝5,000份規格。','',
    '| 規則規格預算 | 份數 |','|---|---:|',
    ...contract.task_target_components.extension_components.map(r=>`| ${r.name} | ${fmt(r.specs)} |`),'',
    '## 題目實數與split','',
    '| 來源 | 原生split | 類型 | 已取得定義數 |','|---|---|---|---:|',
    ...inventory.case_definitions_by_source_split.map(r=>`| ${r.source_id} | ${r.native_split} | ${r.case_kind} | ${fmt(r.count)} |`),
    `| 合計 | 保留原生split | 分類型報分 | ${fmt(inventory.case_definition_records)} |`,'',
    'PARTNR的train_mini、train_2k、val_mini、ci及未驗證池均未重加；公開repo沒有test檔。OpenEQA按question_id計一次，不按評測模式或影格數倍增。','',
    '## 100萬題規劃預算','',
    '| 類型 | 訓練／開發 | 驗證 | 測試 | 合計 |','|---|---:|---:|---:|---:|',
    ...contract.case_target_components.map(r=>`| ${r.name} | ${fmt(r.train)} | ${fmt(r.validation)} | ${fmt(r.test)} | ${fmt(r.total)} |`),'',
    contract.split_policy,'',
    '## 十二域配額：規劃量，不是現有分布','',
    '| 領域 | 場景 | 基本任務 | 規則規格 | 任務規格合計 | 題目預算 |','|---|---:|---:|---:|---:|---:|',
    ...contract.domain_quotas.map(r=>`| ${r.name} | ${fmt(r.environments)} | ${fmt(r.base_tasks)} | ${fmt(r.rule_specs)} | ${fmt(r.task_specs)} | ${fmt(r.case_budget)} |`),'',
    contract.quota_policy,'',
    '## 舊版數字怎麼處理','',
    '| 舊數字 | 原範圍 | 本版處理 |','|---|---|---|',
    ...contract.version_crosswalk.map(r=>`| ${r.old} | ${r.old_scope} | ${r.current} |`),'',
    '## 清單與重算','',
    '- domain_registry.json：12領域定義及來源支持。','- environment_registry.csv/json：284個命名場景定義。',
    '- task_registry.csv/json：2,096條robot來源任務；information_task_types.json另列7類資訊題型。',
    '- case_registry.csv.gz/jsonl.gz：114,288筆原生題目ID、split、input/label hash、來源及判分引用；不重新發布原始問題、指令或影像。',
    '- source_receipts.json/source_pins.json：固定來源版本、取得日期及SHA256。',
    '- audit/quantified/build_numeric_inventory.py：來源解析和結構驗證。','',
    '新實際模型試驗為0；已存在的Meta-World及小型聯合試作仍在工程附錄，未混入此清單。',''
  ].join('\n');
}
