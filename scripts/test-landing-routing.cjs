const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.join(__dirname,'..');
(async()=>{
 const routes=JSON.parse(fs.readFileSync(path.join(__dirname,'landing-routes.json')));
 const code=fs.readFileSync(path.join(__dirname,'landing-routing.mjs'),'utf8').replace("import LANDINGS from './landing-routes.json';",'const LANDINGS='+JSON.stringify(routes)+';');
 const complete=code.replace("import { mediaRange } from './media-range.mjs';",fs.readFileSync(path.join(__dirname,'media-range.mjs'),'utf8').replace('export function','function').replace('export const','const'));
 const m=await import('data:text/javascript;base64,'+Buffer.from(complete).toString('base64'));
 const env={ASSETS:{fetch:async req=>{let route=new URL(typeof req==='string'?req:req.url).pathname;const file=path.join(ROOT,route,route.endsWith('/')?'index.html':'');return fs.existsSync(file)&&fs.statSync(file).isFile()?new Response(fs.readFileSync(file),{headers:{'Content-Type':route.endsWith('/')?'text/html':'application/octet-stream'}}):new Response('Missing',{status:404})}}};
 let pages=0;
 for(const route of routes){
  assert(!route.host.includes('friendly123.com'));const sitemap=await m.marketingResponse(new Request('https://'+route.host+'/sitemap.xml'),env);assert.equal(sitemap.status,200);
  const xml=await sitemap.text();assert(xml.includes('hreflang="x-default"'));assert(xml.includes(m.landingURL(route,route.en?'en':'es')));
  for(const lang of ['en','es'])if(route[lang]){
   const canon=m.landingURL(route,lang);const res=await m.marketingResponse(new Request(canon),env);assert.equal(res.status,200);const html=await res.text();assert(html.includes('rel="canonical" href="'+canon+'"'),canon);assert(html.includes('<html lang="'+lang+'"'),canon);assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);assert(!/href="\/(?:editorial|slide-page)\.css"/.test(html),'Cross-host styles must resolve');
   for(const schema of html.matchAll(/type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))JSON.parse(schema[1]);
   const old=new Request('https://jfcarpio.com'+route[lang]+'?source=test#offer');const redirect=await m.marketingResponse(old,env);assert.equal(redirect.status,301);assert.equal(redirect.headers.get('Location'),canon+'?source=test#offer');
   if(route.en&&route.es){assert(html.includes('hreflang="en" href="'+m.landingURL(route,'en')+'"'));assert(html.includes('hreflang="es" href="'+m.landingURL(route,'es')+'"'));}
   pages++;
  }
  assert.equal((await m.marketingResponse(new Request('https://'+route.host+'/publicaciones/'),env)).status,404,'Unrelated hub content must not be cloned');
  assert.equal((await m.marketingResponse(new Request('https://'+route.host+'/',{method:'POST'}),env)).status,405);
 }
 assert.equal(await m.marketingResponse(new Request('https://friendly123.com/index.html'),env),null);
 assert.equal(await m.marketingResponse(new Request('https://jfcarpio.com/friendly123/'),env),null);
 const home=fs.readFileSync(path.join(ROOT,'index.html'),'utf8').replace(/<!--[\s\S]*?-->/g,'');const ids=[...home.matchAll(/<section class="slide[^\"]*" id="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids[1],'apps');assert(home.includes('class="ap flagship"'));assert(!home.includes('up to 50–65%'));assert(home.includes('preload="none"'));assert(!/<video[^>]*autoplay/.test(home));
 console.log(`Landing routing: OK — ${routes.length} hosts, ${pages} locale pages, schema, redirects, isolation and Friendly priority.`);
})().catch(e=>{console.error(e);process.exit(1)});
