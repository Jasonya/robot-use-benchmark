// Reproducible bounded discovery, not an exhaustive or full-text review.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import {fileURLToPath} from 'node:url';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const output=path.join(project,'planning/literature_refresh');
await fs.mkdir(path.join(output,'search_html'),{recursive:true});
const queries=[
  ['robot-benchmark','robot benchmark','M'],
  ['human-video-robot','human video robot learning','T'],
  ['learning-observation','robot learning observation benchmark','T'],
  ['ego-anticipation','egocentric anticipation','P'],
  ['ego-forecasting','egocentric forecasting','P'],
  ['ego-prediction','egocentric prediction','P'],
  ['long-action-anticipation','"long-term action anticipation"','P'],
  ['short-interaction-anticipation','"short-term object interaction anticipation"','P'],
  ['hands-forecasting','egocentric hand trajectory prediction','P'],
  ['body-camera','body camera dataset activity','V'],
  ['vlog-procedure','vlog instructional dataset','V'],
  ['deformable-benchmark','deformable manipulation benchmark','D'],
  ['cloth-folding','cloth folding robot','D'],
  ['mobile-manipulation','mobile manipulation benchmark','N'],
  ['robot-collaboration','robot collaboration benchmark','C'],
  ['robot-recovery','robot recovery benchmark','R'],
  ['world-model-evaluation','robot world model benchmark','W'],
  ['ego-memory','egocentric memory benchmark','Q'],
  ['professional-robot','laboratory manipulation benchmark','M'],
  ['embodied-task-generation','embodied task generation benchmark','M'],
];
const results=[];
const strip=s=>String(s).replace(/\s+/g,' ').trim();
const existing=JSON.parse(await fs.readFile(path.join(project,'literature_snapshot.json'),'utf8'));
const existingIds=new Set(existing.map(r=>r.source_url?.match(/arxiv\.org\/abs\/([^/?#]+)/)?.[1]?.replace(/v\d+$/,'')).filter(Boolean));
async function discover([id,query,category]){
  const url=new URL('https://arxiv.org/search/');
  Object.entries({query,searchtype:'all',abstracts:'show',order:'-announced_date_first',size:'50'}).forEach(([k,v])=>url.searchParams.set(k,v));
  const file=path.join(output,'search_html',`${id}.html`);
  let raw,cached=true,status=200;
  try{raw=await fs.readFile(file,'utf8');}
  catch{
    cached=false;
    const response=await fetch(url,{headers:{'User-Agent':'RobotUseResearch/0.5 (bounded primary-source scoping review)'},signal:AbortSignal.timeout(40000)});
    status=response.status;
    if(!response.ok)throw new Error(`HTTP ${status}: ${id}`);
    raw=await response.text();await fs.writeFile(file,raw);
  }
  const $=cheerio.load(raw);
  const candidates=$('li.arxiv-result').toArray().map(el=>{
    const r=$(el),link=r.find('.list-title a').first().attr('href');
    const arxivId=link?.match(/\/abs\/([^/?#]+)/)?.[1]?.replace(/v\d+$/,'');
    const abstract=r.find('.abstract-full').clone();abstract.find('a').remove();
    return {arxiv_id:arxivId,url:link,title:strip(r.find('.title').text()),
      authors:strip(r.find('.authors').text()).replace(/^Authors:\s*/,''),
      abstract:strip(abstract.text()),dates:strip(r.find('.is-size-7').last().text()),
      date_context:strip(r.find('p').filter((i,p)=>/Submitted|Announced/.test($(p).text())).last().text()),
      existing_baseline:existingIds.has(arxivId),query_id:id,discovery_category_hint:category};
  }).filter(r=>r.arxiv_id&&r.title);
  const receipt={id,query,url:url.href,source:'arXiv search HTML',retrieved_on:'2026-09-25',
    status,returned_records:candidates.length,maximum_requested:50,ordering:'announced date descending',
    pagination_completed:false,cached,sha256:crypto.createHash('sha256').update(raw).digest('hex')};
  return {receipt,candidates};
}
for(let i=0;i<queries.length;i+=2){
  const batch=await Promise.allSettled(queries.slice(i,i+2).map(discover));
  for(let j=0;j<batch.length;j++){
    const r=batch[j];
    if(r.status==='fulfilled')results.push(r.value);
    else results.push({receipt:{id:queries[i+j][0],query:queries[i+j][1],status:'failed',error:String(r.reason)},candidates:[]});
  }
  await fs.writeFile(path.join(output,'search_receipts.json'),JSON.stringify(results.map(r=>r.receipt),null,2)+'\n');
  console.log(JSON.stringify(results.slice(-batch.length).map(r=>({query:r.receipt.id,status:r.receipt.status,records:r.candidates.length}))));
}
const unique=new Map();
for(const {candidates} of results)for(const r of candidates){
  if(!unique.has(r.arxiv_id))unique.set(r.arxiv_id,{...r,discovered_by:[]});
  unique.get(r.arxiv_id).discovered_by.push(r.query_id);
}
await fs.writeFile(path.join(output,'discovery_candidates.private.json'),JSON.stringify([...unique.values()],null,2)+'\n');
console.log(JSON.stringify({queries:results.length,successful:results.filter(r=>r.receipt.status===200).length,
  retrieved_records:results.reduce((n,r)=>n+r.candidates.length,0),unique_candidates:unique.size,
  already_in_baseline:[...unique.values()].filter(r=>r.existing_baseline).length,
  scope:'First 50 results per query on one primary preprint index. No exhaustive-search, inclusion or full-review claim.'},null,2));
