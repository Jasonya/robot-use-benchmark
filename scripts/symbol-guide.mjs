import * as cheerio from 'cheerio';

export function symbolTarget(symbol){
  return `counting.html#${symbol.toLowerCase()}`;
}

export function linkDefinitionSymbols(html,locale,guide,tracks,helpers){
  const {t,escape,routeLink}=helpers;
  const route=helpers.route;
  const labels=Object.fromEntries([
    ...guide.granularity_levels.map(g=>[g.id,`${g.id} · ${g.name}：${g.question}`]),
    ...Object.entries(tracks).map(([id,track])=>[id,`${id} · ${track.name}`])
  ]);
  const $=cheerio.load(html,{},false);
  const nodes=$.root().find('*').contents().toArray().filter(node=>node.type==='text');
  for(const node of nodes){
    if($(node).parent().closest('a,pre,code,script,style').length)continue;
    const value=node.data||'';
    const matches=[...value.matchAll(/\b(G[0-5]|T[1-8])\b/g)];
    if(!matches.length)continue;
    let result='',start=0;
    for(const match of matches){
      const code=match[0];
      result+=escape(value.slice(start,match.index));
      result+=`<a class="definition-symbol" data-definition-symbol="${code}" href="${routeLink(route,symbolTarget(code),locale)}" title="${t(labels[code],locale)}" aria-label="${t(labels[code],locale)}">${code}</a>`;
      start=match.index+code.length;
    }
    result+=escape(value.slice(start));
    $(node).replaceWith(result);
  }
  return $.html();
}

export function renderSymbolReaderNote(locale,route,helpers){
  const {t,routeLink}=helpers;
  return `<aside class="symbol-reader-note" data-symbol-reader-note><b>${t('先看代號：G是計數粒度，T是評測模組。',locale)}</b><p>${t('例如G2是任務規格、G4是一個測例；T3是預測、T5是實際執行。這些是本計畫的整理編號，數字不代表難度，也不要求依T1→T8順序執行。',locale)}</p><div class="symbol-guide-links"><a href="${routeLink(route,'counting.html#symbols-g',locale)}">${t('G0–G5完整定義',locale)} →</a><a href="${routeLink(route,'counting.html#symbols-t',locale)}">${t('T1–T8完整定義',locale)} →</a><a href="${routeLink(route,'counting.html#symbols-environment',locale)}">${t('與任務環境的關係',locale)} →</a></div></aside>`;
}

export function renderSymbolGuide(locale,guide,tracks,helpers){
  const {t,escape,relative,routeLink}=helpers;
  const route='counting.html';
  const grow=guide.granularity_levels.map(g=>`<tr id="${g.id.toLowerCase()}" data-g-definition="${g.id}"><th scope="row">${g.id} · ${t(g.name,locale)}</th><td>${t(g.question,locale)}<br><small>${t(g.definition,locale)}</small></td><td>${t(g.example,locale)}</td></tr>`).join('');
  const trow=Object.entries(tracks).map(([id,track])=>`<tr id="${id.toLowerCase()}" data-t-definition="${id}"><th scope="row">${id} · ${t(track.name,locale)}</th><td>${t(guide.track_examples[id],locale)}</td><td>${t(track.output,locale)}<br><small>${t(track.metric,locale)}</small><br><a href="${routeLink(route,`explore/metrics.html?track=${id}`,locale)}">${t('看此模組指標',locale)} →</a></td></tr>`).join('');
  return `<section class="counting-section symbol-guide" id="symbols-guide" data-symbol-guide>
    <h2>${t('G與T各自代表什麼',locale)}</h2>
    <p><strong>${t('G：在數哪一層。T：在測哪種能力。',locale)}</strong> ${t(guide.origin,locale)}</p>
    <div class="symbol-axis-cards"><div><b>G · Granularity</b><p>${t('領域、家族、規格、實例、測例、一次執行。',locale)}</p></div><div><b>T · Evaluation track</b><p>${t('理解、記憶、預測、規劃、執行、恢復、協作、世界模型。',locale)}</p></div></div>
    <h3 id="symbols-g">${t('G0–G5：規模的計數層級',locale)}</h3>
    <p>${t(guide.g_meaning,locale)} ${t(guide.g0_g1_relationship,locale)}</p>
    <div class="table-scroll"><table id="g-definitions-table"><thead><tr><th>${t('代號／單位',locale)}</th><th>${t('白話問題與定義',locale)}</th><th>${t('摺毛巾例子',locale)}</th></tr></thead><tbody>${grow}</tbody></table></div>
    <p><a href="${routeLink(route,'chapters/03.html',locale)}">${t('原始詳述：第03章的粒度與去重規則',locale)} →</a></p>
    <h3 id="symbols-t">${t('T1–T8：八種評測模組',locale)}</h3>
    <p>${t(guide.t_meaning,locale)} ${t('這八項可依研究問題選用；T的編號不是執行先後或難度等級。',locale)}</p>
    <div class="table-scroll"><table id="t-definitions-table"><thead><tr><th>${t('模組',locale)}</th><th>${t('用摺毛巾來理解',locale)}</th><th>${t('模型輸出／主要量測',locale)}</th></tr></thead><tbody>${trow}</tbody></table></div>
    <p><a href="${routeLink(route,guide.track_overview_route,locale)}">${t('第06章：八模組原定義與來源',locale)} →</a> · <a href="${routeLink(route,guide.track_scoring_route,locale)}">${t('第08章：計分分界',locale)} →</a></p>
    <p class="counting-note">${t(guide.module_applicability,locale)}</p>
    <h3 id="symbols-environment">${t('任務環境和G／T怎麼接起來',locale)}</h3>
    <p>${t(guide.environment_relationship,locale)}</p>
    <p>${t('G4告訴我們這是哪個具體測例，T5告訴我們這題測實際執行；兩者可以同時描述同一項評測。若改測T3，需要另外定義預測輸入與未來答案。',locale)}</p>
    <p class="counting-note">${t(guide.readiness_note,locale)} <a href="${routeLink(route,'appendices/axes.html#axes-readiness',locale)}">${t('Q0–Q4原定義',locale)} →</a></p>
    <div class="reader-actions"><a class="text-button" href="${relative(`${locale}/${route}`,'downloads/counting/G_T_GUIDE.md')}" download>${t('下載G／T白話速查表',locale)}</a><a class="text-button" href="${relative(`${locale}/${route}`,'downloads/counting/symbol_definitions.json')}" download>${t('下載完整G／T定義JSON',locale)}</a></div>
  </section>`;
}
