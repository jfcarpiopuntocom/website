import { mediaRange } from './media-range.mjs';
import LANDINGS from './landing-routes.json';
export {LANDINGS};
const HUB='https://jfcarpio.com';
export function landingURL(route,lang){return `https://${route.host}/`+(lang==='es'&&route.en?'es/':'');}
export function canonicalURL(value){
 let url;try{url=new URL(value,HUB)}catch{return value}
 if(url.origin!==HUB)return value;
 for(const route of LANDINGS)for(const lang of ['en','es']){
  if(route[lang]&&(url.pathname===route[lang]||url.pathname===route[lang]+'index.html'))return landingURL(route,lang)+url.search+url.hash;
 }
 return value;
}
export function rewriteLanding(html,source){
 // Only known, build-checked marketing HTML is buffered (under 2 MiB).
 html=html.replace(/\b(href|src|poster)="([^"]*)"/g,(all,attr,value)=>{
  if(!value||value.startsWith('#')||/^(mailto:|tel:|data:|javascript:)/.test(value))return all;
  let abs;try{abs=new URL(value,HUB+source).href}catch{return all}
  const route=LANDINGS.find(r=>r.en===source||r.es===source);
  if(route&&abs.startsWith(HUB+'/media/'))abs=abs.replace(HUB,'https://'+route.host);
  return `${attr}="${canonicalURL(abs)}"`;
 });
 html=html.replace(/(<meta\s+property="og:url"\s+content=")([^"]*)(")/g,(_,a,b,c)=>a+canonicalURL(b)+c);
 html=html.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g,(_,open,text,close)=>{
  function walk(v){if(typeof v==='string')return canonicalURL(v);if(Array.isArray(v))return v.map(walk);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,value])=>[k,walk(value)]));return v}
  return open+JSON.stringify(walk(JSON.parse(text))).replaceAll('<','\\u003c')+close;
 });
 return html;
}
export async function marketingResponse(request,env){
 const url=new URL(request.url),route=LANDINGS.find(r=>r.host===url.hostname);
 if(!route){
  if(url.hostname!=='jfcarpio.com')return null;
  const target=canonicalURL(url.href);return target!==url.href?Response.redirect(target,301):null;
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
 const pages=[['en',route.en],['es',route.es]].filter(([,path])=>path);
 if(url.pathname==='/robots.txt')return new Response(`User-agent: *\nAllow: /\nSitemap: https://${route.host}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
 if(url.pathname==='/sitemap.xml'){
  const links=pages.map(([lang])=>`<xhtml:link rel="alternate" hreflang="${lang}" href="${landingURL(route,lang)}"/>`).join('')+`<xhtml:link rel="alternate" hreflang="x-default" href="${landingURL(route,route.en?'en':'es')}"/>`;
  const xml='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+pages.map(([lang])=>`<url><loc>${landingURL(route,lang)}</loc><lastmod>2026-10-07</lastmod>${links}</url>`).join('')+'</urlset>';
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
 }
 const lang=url.pathname==='/es/'&&route.en&&route.es?'es':url.pathname==='/'?(route.en?'en':'es'):null;
 if(url.pathname==='/index.html'||(url.pathname==='/es/index.html'&&route.en&&route.es))return Response.redirect(`https://${route.host}/`+(url.pathname.startsWith('/es/')?'es/':'')+url.search,301);
 if(url.pathname==='/es'&&route.en&&route.es)return Response.redirect(`https://${route.host}/es/`+url.search,301);
 if(lang){
  const source=route[lang],res=await env.ASSETS.fetch(new Request(HUB+source,{method:'GET',headers:request.headers}));
  if(res.status!==200) return new Response('The page is temporarily unavailable. Visit jfcarpio.com.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Retry-After':'60'}});
  const size=Number(res.headers.get('Content-Length')||0);if(size>2*1024*1024)throw new Error('Marketing source exceeds its bounded size');
  const html=await res.text();if(html.length>2*1024*1024)throw new Error('Marketing HTML exceeds its bounded size');
  const headers=new Headers(res.headers);headers.delete('Content-Length');headers.delete('ETag');headers.set('Content-Type','text/html; charset=utf-8');headers.set('Cache-Control','public, max-age=0, must-revalidate');
  return new Response(request.method==='HEAD'?null:rewriteLanding(html,source),{headers});
 }
 // Shared static assets only; unrelated hub HTML never appears on an offer host.
 if(/\.(?:css|js|woff2?|png|jpe?g|webp|svg|ico|mp4|vtt|pdf)$/i.test(url.pathname)){const response=await env.ASSETS.fetch(new Request(HUB+url.pathname+url.search,request));return url.pathname.endsWith('.mp4')?mediaRange(response,request):response;}
 return new Response('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | JFCarpio.com</title><body style="background:#060E1D;color:#fff;font:20px/1.6 sans-serif;padding:32px"><h1>That page is not here.</h1><p><a style="color:#7FB0FF" href="/">Return to this offer</a> or <a style="color:#7FB0FF" href="https://jfcarpio.com/">explore JFCarpio.com</a>.</p></body></html>',{status:404,headers:{'Content-Type':'text/html; charset=utf-8','X-Robots-Tag':'noindex'}});
}
