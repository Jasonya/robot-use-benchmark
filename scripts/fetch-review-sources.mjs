import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import {fileURLToPath} from 'node:url';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const dir=path.join(project,'planning/literature_refresh');
const selected=JSON.parse(await fs.readFile(path.join(dir,'selected_scope.json'),'utf8'));
await fs.mkdir(path.join(dir,'primary_html'),{recursive:true});
const output=[];
async function fetchOne(spec){
  const url=`https://arxiv.org/abs/${spec.arxiv_id}`;
  const file=path.join(dir,'primary_html',spec.arxiv_id+'.html');
  let text,status=200,cached=true;
  try{text=await fs.readFile(file,'utf8');}
  catch{
    cached=false;
    const response=await fetch(url,{headers:{'User-Agent':'RobotUseResearch/0.5 (primary-source review)'},signal:AbortSignal.timeout(40000)});
    status=response.status;
    if(!response.ok)throw new Error(`${spec.arxiv_id}: HTTP ${status}`);
    text=await response.text();await fs.writeFile(file,text);
  }
  const $=cheerio.load(text),meta=name=>$(`meta[name="${name}"]`).attr('content');
  const title=meta('citation_title')||$('h1.title').text().replace(/^Title:\s*/,'').trim();
  const abstract=$('blockquote.abstract').clone();abstract.find('.descriptor').remove();
  const value={
    ...spec,url,status,cached,title,authors:$('meta[name="citation_author"]').toArray().map(el=>$(el).attr('content')),
    abstract:abstract.text().replace(/\s+/g,' ').trim(),
    citation_date:meta('citation_date'),citation_online_date:meta('citation_online_date'),
    dateline:$('.dateline').text().replace(/\s+/g,' ').trim(),
    submission_history:$('.submission-history').text().replace(/\s+/g,' ').trim(),
    license_url:$('a[href*="creativecommons.org"],a[href*="arxiv.org/licenses"]').first().attr('href')||null,
    html_sha256:crypto.createHash('sha256').update(text).digest('hex'),
    retrieved_on:'2026-09-25',
  };
  if(!value.abstract||!value.title||!value.authors.length)throw new Error(`Incomplete primary metadata: ${spec.arxiv_id}`);
  return value;
}
for(let i=0;i<selected.length;i+=2){
  const settled=await Promise.allSettled(selected.slice(i,i+2).map(fetchOne));
  for(let j=0;j<settled.length;j++){
    const r=settled[j];
    output.push(r.status==='fulfilled'?r.value:{...selected[i+j],status:'failed',error:String(r.reason)});
  }
  await fs.writeFile(path.join(dir,'review_sources.private.json'),JSON.stringify(output,null,2)+'\n');
  console.log(JSON.stringify({processed:output.length,total:selected.length,failures:output.filter(r=>r.status!==200).length}));
}
