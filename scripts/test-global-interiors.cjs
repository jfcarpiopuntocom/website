// Real Chromium checks: commercial path, locale choice, no-JS reading and mobile layout.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const BASE=process.env.BASE||'http://127.0.0.1:8766';
const OUT=process.env.SHOTS||'C:/00 Projects/jfcarpio-release-evidence/global-interiors';
fs.mkdirSync(OUT,{recursive:true});
const assert=(ok,message)=>{if(!ok)throw Error(message)};
(async()=>{
 const browser=await chromium.launch();
 for(const width of [1440,390,375]){
  const context=await browser.newContext({viewport:{width,height:width===1440?900:844},reducedMotion:'reduce'});
  await context.route('**/*',r=>r.request().url().startsWith(BASE)?r.continue():r.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const route of ['/en/reports/','/reportes/','/workshops/','/publicaciones/','/en/apps/','/en/business-viewers/','/blog/']){
   await page.goto(BASE+route,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
   const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelectorAll('h1').length,nav:[...document.querySelectorAll('[data-commercial-nav] a')].map(a=>a.pathname),font:getComputedStyle(document.body).fontFamily}));
   assert(!result.overflow,route+' overflow '+width);assert(result.h1===1,route+' H1 count');assert(result.nav.length===5,route+' missing commercial path');
   if(route.includes('reports')||route==='/reportes/'){
    assert(await page.locator('main').innerText().then(t=>/USD 100/.test(t)&&/72/.test(t)&&/10/.test(t)),'report contract absent');
    assert((await page.locator('main a[href^="mailto:"]').first().getAttribute('href')).startsWith('mailto:jfcarpio@gmail.com'),'report email missing');
    await page.locator('main details').first().locator('summary').click();assert(await page.locator('main details').first().getAttribute('open')!==null,'supporting research cannot expand');
    await page.locator('main details').first().locator('summary').click();
   }
   await page.screenshot({path:path.join(OUT,route.replaceAll('/','_')+'-'+width+'.png'),fullPage:true});
   console.log('OK',width,route,result.font);
  }
  assert(errors.length===0,'JS errors '+errors.join(';'));await context.close();
 }
 for(const [route,lang] of [['/','en'],['/es/','es']]){
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:667}});await context.route('**/*',r=>r.request().url().startsWith(BASE)?r.continue():r.abort());
  const page=await context.newPage();await page.goto(BASE+route);assert(await page.locator('html').getAttribute('lang')===lang,'static locale');
  const headline=await page.locator('h1').innerText();assert(headline.startsWith(lang==='en'?'THERE ARE TWO KINDS OF BUSINESSES.':'HAY DOS TIPOS DE CREADORES DE NEGOCIOS.'),'full headline');
  assert(await page.locator('.lang button[data-lang='+lang+']').getAttribute('aria-pressed')==='true','static selected switch');
  const href=await page.locator('[data-report-route]').first().getAttribute('href');assert(href===(lang==='en'?'/en/reports/':'/reportes/'),'static report route '+href);
  await context.close();console.log('OK no JS',route);
 }
 const context=await browser.newContext({viewport:{width:375,height:667},reducedMotion:'reduce'});await context.route('**/*',r=>r.request().url().startsWith(BASE)?r.continue():r.abort());
 const page=await context.newPage();await page.goto(BASE+'/');assert(await page.locator('html').getAttribute('lang')==='en','default English');
 await page.locator('.lang button[data-lang=es]').click();await page.reload();assert(await page.locator('html').getAttribute('lang')==='es','saved Spanish choice');
 await page.goto(BASE+'/?lang=en');assert(await page.locator('html').getAttribute('lang')==='en','explicit English override');
 await page.goto(BASE+'/es/');assert(await page.locator('html').getAttribute('lang')==='es','Spanish URL override');
 await context.close();await browser.close();console.log('Global interiors: OK');
})().catch(e=>{console.error(e);process.exit(1)});
