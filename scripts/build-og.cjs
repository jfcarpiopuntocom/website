// Dibuja la imagen al compartir (1200x630) de cada pagina por seccion y los PDF de las 17 consecuencias.
// Uso: python3 scripts/build-slide-pages.py && node scripts/build-og.cjs
// Diseno (no "slop"): fondo navy plano, una sola idea, titular grande Barlow, kicker dorado, marca abajo. Sin degradados ni emojis.
const fs=require('fs'),path=require('path');
let pw;try{pw=require('playwright')}catch(e){pw=require('/opt/node22/lib/node_modules/playwright')}
const R=path.join(__dirname,'..'),F=path.join(__dirname,'fonts');
const ff=(n,f,w)=>`@font-face{font-family:'${n}';font-weight:${w};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(F,f)).toString('base64')}) format('woff2')}`;
const FONTS=ff('Barlow Condensed','barlow-condensed-latin-800-normal.woff2',800)+ff('Barlow Condensed','barlow-condensed-latin-700-normal.woff2',700)+ff('Lora','lora-latin-400-normal.woff2',400)+ff('Lora','lora-latin-700-normal.woff2',700)+ff('Space Mono','space-mono-latin-700-normal.woff2',700)+ff('Space Mono','space-mono-latin-400-normal.woff2',400);
const e=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const card=m=>`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${FONTS}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#060E1D;color:#fff;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between;border-left:14px solid #E8A020}
.k{font:700 22px/1.3 'Space Mono';letter-spacing:.12em;text-transform:uppercase;color:#E8A020;max-width:1000px}
h1{font:800 ${m.title.length>70?64:m.title.length>45?76:92}px/.98 'Barlow Condensed';text-transform:uppercase;max-width:1020px}
.b{display:flex;justify-content:space-between;align-items:flex-end;font:700 30px 'Barlow Condensed';letter-spacing:.02em}.b span{font:400 20px 'Space Mono';color:#fff}
</style></head><body><p class="k">${e(m.kick)}</p><h1>${e(m.title)}</h1><p class="b">JFCarpio.com<span>${m.lang==='en'?'Research · Reports · Dashboards · Workshops':'Investigación · Reportes · Dashboards · Talleres'}</span></p></body></html>`;
(async()=>{const b=await pw.chromium.launch();const p=await b.newPage({viewport:{width:1200,height:630}});
const man=JSON.parse(fs.readFileSync(path.join(R,'og/manifest.json'),'utf8'));
for(const m of man){await p.setContent(card(m));await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:path.join(R,m.file)})}
for(const l of ['es','en']){const h=fs.readFileSync(path.join(R,`og/pdf-${l}.html`),'utf8').replace('<style>','<style>'+FONTS);await p.setContent(h);await p.evaluate(()=>document.fonts.ready);await p.pdf({path:path.join(R,`consecuencias-${l}.pdf`),format:'A4',printBackground:true})}
console.log('imagenes',man.length,'pdf 2');await b.close()})();
