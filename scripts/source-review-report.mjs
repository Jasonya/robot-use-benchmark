import {sourceReviewMarkdown} from './source-review-model.mjs';

// The report is generated exclusively from our authored notes and count ledgers.
export function renderSourceReport(locale,model,{t,shell}) {
  const lines=sourceReviewMarkdown(model).split('\n');
  const output=[];
  const inline=text=>t(text,locale).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(https?:\/\/[^\s<>]+)/g,'<a href="$1">$1</a>');
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(!line.trim())continue;
    if(line.startsWith('|')){
      const rows=[];
      while(i<lines.length&&lines[i].startsWith('|')){
        if(!/^[|\s:-]+$/.test(lines[i]))rows.push(lines[i].slice(1,-1).split('|').map(x=>x.trim()));
        i++;
      }
      i--;
      output.push(`<div class="table-scroll"><table><thead><tr>${rows[0].map(x=>`<th>${inline(x)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row=>`<tr>${row.map(x=>`<td>${inline(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    }else if(/^#{1,3} /.test(line)){
      const level=line.match(/^#+/)[0].length;
      output.push(`<h${level}>${inline(line.slice(level+1))}</h${level}>`);
    }else if(line.startsWith('- ')){
      const items=[];
      while(i<lines.length&&lines[i].startsWith('- ')){items.push(`<li>${inline(lines[i].slice(2))}</li>`);i++;}
      i--;output.push(`<ul>${items.join('')}</ul>`);
    }else output.push(`<p>${inline(line)}</p>`);
  }
  return shell({route:'source-report.html',locale,title:`${model.fulltext.version.replace('source-review-','v')}完整來源審閱與用途歸納報告`,description:'183份來源全部歸類，附逐篇用途依據、數量出處、來源分布和benchmark整合設計。',body:`<main class="wrap source-report" id="main-content">${output.join('\n')}</main>`,kind:'source-report'});
}
