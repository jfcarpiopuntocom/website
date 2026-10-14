'use strict';
// Reel FX regression: run static guards every time, and the full GPU test when
// a real graphics context is available. Brave binary: BRAVE_PATH=/path/to/brave.
// Usage: node scripts/test-brave-webgl.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');

for (const file of ['index.html', 'es/index.html']) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert(html.includes('new MutationObserver(place)'), file + ': reel FX observer missing');
  assert(html.includes('webglcontextlost'), file + ': loss handling missing');
  assert(html.includes('webglcontextrestored'), file + ': GL restoration handling missing');
  assert(html.includes('window.jfcFX'), file + ': FX diagnostics missing');
  assert(html.includes('[?&]fx=1'), file + ': webdriver explicit GPU test missing');
  assert(html.includes('[?&]fx=0'), file + ': URL-scoped graceful fallback missing');
  assert(html.includes('prefers-reduced-motion:reduce'), file + ': reduced motion missing');
  assert(html.includes('const SCN='), file + ': per-slide shaders missing');
  assert(html.includes('.reel canvas.fx'), file + ': decorative overlay missing');
  assert(html.includes('window.__reel='), file + ': navigation API missing');
}
console.log('PASS static: both locale engines include GL recovery, opt-out and accessible fallbacks.');

let playwright;
try { playwright = require(process.env.PW || 'playwright'); }
catch (e) { console.log('SKIP GPU/browser: Playwright unavailable. This is not a browser pass.'); process.exit(0); }

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  let relative = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (!relative || relative === 'es/') relative += 'index.html';
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end(); }
  const types = {'.html':'text/html; charset=utf-8','.woff2':'font/woff2','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.js':'text/javascript'};
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  let browser;
  try {
    browser = await playwright.chromium.launch({
      ...(process.env.BRAVE_PATH ? {executablePath:process.env.BRAVE_PATH}:{}),
      headless: process.env.HEADFUL !== '1',
      args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']
    });
    for(const loc of ['/index.html','/es/index.html']){
      const ctx = await browser.newContext({viewport:{width:1365,height:800},reducedMotion:'reduce'});
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror',e=>errors.push(e.message));
      // Use reduced motion to avoid a long onboarding intro, but still draw one GPU frame.
      await page.goto(base+loc+'?fx=1#portada',{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>!!window.__reel,{timeout:15000});
      const status = await page.evaluate(() => ({
        gl: !!document.createElement('canvas').getContext('webgl'),
        fx: !!window.jfcFX,
        hasCanvas:!!document.querySelector('canvas.fx'),
        heading: !!document.querySelector('#portada h1, #portada h2'),
        noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+5
      }));
      assert(status.heading && status.noHorizontalOverflow, loc+': content/viewport failed: '+JSON.stringify(status));
      if(process.env.BRAVE_PATH && !status.gl)throw new Error('Brave GPU context unavailable: this browser has NOT passed the WebGL test');
      if(status.gl){
        assert(status.fx && status.hasCanvas, loc+': WebGL available but FX not running');
        const compiled = await page.evaluate(()=>window.jfcFX.compileAll());
        const failed=compiled.filter(([,ok])=>!ok);
        assert.equal(failed.length,0,loc+': shader compilation failed '+JSON.stringify(failed));
        const canvas = page.locator('canvas.fx');
        const before=await canvas.evaluate(e=>e.getBoundingClientRect().width);
        assert(before>100,loc+': canvas has no size');
        const loss=await page.evaluate(()=>{
          const c=document.querySelector('canvas.fx'),gl=c?.getContext('webgl');
          const ext=gl?.getExtension('WEBGL_lose_context');
          if(!ext)return false;
          window.__jfcGlLossExt=ext;
          ext.loseContext();
          return true;
        });
        if(loss){
          await page.waitForFunction(()=>window.jfcFX?.status==='lost' || window.jfcFX?.status==='disabled',{timeout:3500});
          assert(await page.locator('#portada h1, #portada h2').count(),loc+': content gone on loss');
          await page.evaluate(()=>{
            window.__jfcGlLossExt?.restoreContext();
          });
          await page.waitForFunction(()=>window.jfcFX?.status==='running',{timeout:8000});
          const resumed=await page.evaluate(()=>window.jfcFX.compileAll().every(([,ok])=>ok));
          assert(resumed,loc+': shaders failed after context restoration');
        } else console.log('SKIP GL loss extension: '+loc);
        console.log('PASS actual WebGL shader compilation and loss/restoration: '+loc);
      } else console.log('SKIP GPU not available in this environment (not proof of Brave compatibility): '+loc);
      await page.goto(base+loc+'?fx=0#portada',{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>!!window.__reel,{timeout:15000});
      assert.equal(await page.locator('canvas.fx').count(),0,loc+': fx=0 should keep original reel without WebGL');
      assert.equal(errors.length,0,loc+': JS errors '+errors.join(';'));
      await ctx.close();
      // Actual moving reel (not only a static reduced-motion frame).
      if(status.gl){
        const motionCtx=await browser.newContext({viewport:{width:1365,height:800},reducedMotion:'no-preference'});
        const motionPage=await motionCtx.newPage();
        const motionErrors=[];
        motionPage.on('pageerror',e=>motionErrors.push(e.message));
        await motionPage.goto(base+loc+'?fx=1#portada',{waitUntil:'domcontentloaded'});
        await motionPage.waitForFunction(()=>window.__reel && window.jfcFX?.status==='running',{timeout:15000});
        await motionPage.evaluate(()=>window.__reel.go(1));
        await motionPage.waitForTimeout(2100);
        const moving=await motionPage.evaluate(()=>{
          const slide=document.querySelector('#apps'),current=slide.classList.contains('is-current');
          const active=slide.querySelector('canvas.fx');
          const front=slide.querySelector('.front');
          const styles=front&&getComputedStyle(front);
          return {current,canvas:!!active,opacity:styles?Number(styles.opacity):0,
                  overlap:document.documentElement.scrollWidth>innerWidth+5};
        });
        assert(moving.current && moving.canvas && moving.opacity>.95 && !moving.overlap,loc+': moving slide degraded: '+JSON.stringify(moving));
        assert.deepEqual(motionErrors,[],loc+': animated reel errors');
        await motionCtx.close();
        console.log('PASS animated reel / Apps FX layer:',loc);
      }
    }
  } finally {
    if(browser)await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(err=>{console.error('FAIL GPU/reel:',err);process.exitCode=1;server.close();});
