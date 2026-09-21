import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../docs');
const settings=JSON.parse(await fs.readFile(path.join(root,'../site.config.json'),'utf8'));
const prefix=new URL(settings.siteUrl).pathname.replace(/\/$/,'')+'/';
const port=Number(process.env.ROBOT_SITE_PORT||8768);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/'){res.writeHead(302,{Location:prefix});res.end();return;}
    if(!url.pathname.startsWith(prefix)){res.writeHead(404);res.end('Not found');return;}
    let local=decodeURIComponent(url.pathname.slice(prefix.length));
    if(!local||local.endsWith('/'))local+='index.html';
    const file=path.resolve(root,local);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
    const data=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    if(req.method==='HEAD')res.end();else res.end(data);
  }catch{
    res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});
    res.end(await fs.readFile(path.join(root,'404.html'),'utf8').catch(()=> 'Not found'));
  }
});
server.listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}${prefix}`));
