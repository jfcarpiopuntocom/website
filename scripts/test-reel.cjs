// Prueba del reel en Chromium real. Uso: node test_reel.cjs [white|pretty]   (white = peor caso de legibilidad)
const { chromium } = require(process.env.PW || 'playwright');
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const MODE = process.argv[2] || 'white';
const SITE = process.env.SITE || process.cwd();
const SHOTS = process.env.SHOTS || '/tmp/reel-shots';
fs.mkdirSync(SHOTS, { recursive: true });

// PNG sintetico (sin dependencias): color solido o degradado
function png(w, h, fn) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; for (let x = 0; x < w; x++) { const [r, g, b] = fn(x / w, y / h); const o = y * (w * 3 + 1) + 1 + x * 3; raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; } }
  const crcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const WHITE = png(64, 43, () => [255, 255, 255]);
const PALETTES = [[[200, 120, 60], [40, 70, 120]], [[30, 120, 110], [230, 200, 120]], [[150, 60, 90], [240, 220, 200]], [[70, 90, 60], [250, 240, 210]]];
let pi = 0; const pretty = () => { const [a, b] = PALETTES[pi++ % PALETTES.length]; return png(96, 64, (x, y) => [0, 1, 2].map(i => Math.round(a[i] * (1 - x * y) + b[i] * x * y))); };

const VIEWS = [['desk1440x900', 1440, 900, false], ['lap1280x720', 1280, 720, false], ['tab820x1180', 820, 1180, true], ['ph390x844', 390, 844, true], ['ph375x667', 375, 667, true]];
const fails = [], notes = [];
const F = (m) => { fails.push(m); console.log('FAIL', m); }; const OK = (m) => console.log('ok  ', m);

async function setup(browser, w, h, touch, js = true) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: false, javaScriptEnabled: js });
  await ctx.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith('file://')) return route.continue();
    if (/images\.pexels\.com/.test(u)) return route.fulfill({ contentType: 'image/png', body: MODE === 'white' ? WHITE : pretty() });
    const m = u.match(/^https:\/\/jfcarpio\.com\/([\w.-]+\.(?:jpg|png|webp))/);
    if (m) { const f = path.join(SITE, m[1]); if (fs.existsSync(f)) return route.fulfill({ path: f }); return route.fulfill({ contentType: 'image/png', body: WHITE }); }
    return route.abort();
  });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message)); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errs.push('console: ' + m.text()); });
  return { ctx, page, errs };
}
const settle = p => p.waitForFunction(() => window.__reel && !window.__reel.auto, null, { timeout: 12000 });

(async () => {
  const browser = await chromium.launch();
  for (const [name, w, h, touch] of VIEWS) {
    const { ctx, page, errs } = await setup(browser, w, h, touch);
    await page.goto('file://' + SITE + '/index.html', { waitUntil: 'domcontentloaded' });
    try { await settle(page); OK(`${name}: entrada termina y aterriza en fotograma 1`); } catch (e) { F(`${name}: la entrada no termino`); await ctx.close(); continue; }
    await page.waitForTimeout(1400);
    const N = await page.evaluate(() => window.__reel.N);
    for (let i = 0; i < N; i++) {
      await page.evaluate(k => { window.__reel.cl(); window.__reel.go(k); }, i);
      await page.waitForTimeout(1900);
      const info = await page.evaluate(i => {
        const s = document.querySelectorAll('.slide')[i], f = s.querySelector('.front'), fr = s.querySelector('.frame').getBoundingClientRect();
        const kids = [...f.querySelectorAll('.tx > *')].filter(e => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0);
        const top = Math.min(...kids.map(e => e.getBoundingClientRect().top)), bot = Math.max(...kids.map(e => e.getBoundingClientRect().bottom));
        const fs_ = getComputedStyle(f), op = +fs_.opacity;
        const items = [...f.querySelectorAll('h1,h2,.sub,.lead,.kick,blockquote,cite,.btn,.chip,.big,.ft,.ft a,textarea')].filter(e => e.getBoundingClientRect().height > 0 && !e.closest('.rr')).map(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { t: (e.textContent || '').trim().slice(0, 28), x: r.left, y: r.top, w: r.width, h: r.height, c: cs.color, fs: parseFloat(cs.fontSize), bg: cs.backgroundColor, tag: e.tagName }; });
        return { id: s.id, over: top < fr.top + 8 || bot > fr.bottom + 1, top: Math.round(top - fr.top), frameH: Math.round(fr.height), opacity: op, items };
      }, i);
      if (info.over) F(`${name}/${info.id}: el texto se sale del fotograma (top ${info.top}px, alto fotograma ${info.frameH})`);
      if (info.opacity < 0.9) F(`${name}/${info.id}: contenido no visible (opacity ${info.opacity})`);
      if (MODE === 'pretty' && (i % 3 === 0 || i >= 6 && i <= 8)) await page.screenshot({ path: path.join(SHOTS, `${name}-${String(i).padStart(2, '0')}-${info.id}.png`) });
      // legibilidad sobre pixeles reales: captura con el texto transparente, mediana del fondo bajo cada caja
      await page.addStyleTag({ content: '.front *{transition:none!important;color:transparent!important;text-shadow:none!important;caret-color:transparent!important}.front textarea::placeholder{color:transparent!important}' });
      const buf = await page.screenshot(); await page.evaluate(() => { document.head.querySelector('style:last-of-type').remove(); }); await page.waitForTimeout(80);
      const res = await page.evaluate(async ({ b64, items, w, h }) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
        const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4 }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b) };
        const parse = s => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
        const out = [];
        for (const it of items) {
          if (it.tag === 'TEXTAREA') continue;
          const px = []; const sc = img.width / w;
          const x0 = Math.max(0, Math.floor(it.x * sc)), y0 = Math.max(0, Math.floor(it.y * sc)), x1 = Math.min(img.width, Math.ceil((it.x + Math.min(it.w, 360)) * sc)), y1 = Math.min(img.height, Math.ceil((it.y + it.h) * sc));
          if (x1 <= x0 || y1 <= y0) continue;
          const d = x.getImageData(x0, y0, x1 - x0, y1 - y0).data; const step = Math.max(4, Math.floor(d.length / 4 / 400)) * 4;
          for (let i = 0; i < d.length; i += step) px.push(lum([d[i], d[i + 1], d[i + 2]]));
          px.sort((a, b) => a - b); const bgL = px[Math.floor(px.length * 0.9)]; // percentil 90 = fondo mas claro bajo el texto (peor caso para texto claro)
          const tc = parse(it.c); const tl = lum(tc); const ratio = (Math.max(bgL, tl) + .05) / (Math.min(bgL, tl) + .05);
          const isBtn = /^(A|BUTTON)$/.test(it.tag) || it.bg.indexOf('rgba(0, 0, 0, 0)') < 0;
          out.push({ t: it.t, ratio: +ratio.toFixed(2), fs: it.fs, color: it.c, btn: isBtn });
        }
        return out;
      }, { b64: buf.toString('base64'), items: info.items, w, h });
      for (const r of res) { if (r.btn) continue; if (r.ratio < 4.5) F(`${name}/${info.id}: contraste ${r.ratio}:1 en "${r.t}" (color ${r.color})`); if (r.fs < 14) F(`${name}/${info.id}: texto de ${r.fs}px en "${r.t}"`); }
    }
    await page.waitForTimeout(600);
    if (errs.length) F(`${name}: errores JS: ${errs.slice(0, 3).join(' | ')}`); else OK(`${name}: sin errores JS`);
    // colores de texto: nada gris (r=g=b entre 60 y 230) en texto de la pagina
    const grays = await page.evaluate(() => { const bad = []; for (const e of document.querySelectorAll('.front *,.panel *,.bar *,.pips *,.count,.nx')) { if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; const m = getComputedStyle(e).color.match(/[\d.]+/g).map(Number); const a = m[3] == null ? 1 : m[3]; if (a < 1) bad.push(e.tagName + ' alpha ' + a); if (Math.abs(m[0] - m[1]) < 6 && Math.abs(m[1] - m[2]) < 6 && m[0] > 50 && m[0] < 235) bad.push(e.tagName + ' gris ' + m.join(',')); const op = +getComputedStyle(e).opacity; if (op < 1 && e.closest('.front')?.style.opacity === '') bad.push(e.tagName + ' opacity ' + op); } return bad.slice(0, 5); });
    if (grays.length) F(`${name}: texto gris/translucido: ${grays.join('; ')}`); else OK(`${name}: sin texto gris ni translucido`);
    await ctx.close();
  }

  // ---- funcional (desktop) ----
  { const { ctx, page, errs } = await setup(browser, 1440, 900, false);
    await page.goto('file://' + SITE + '/index.html'); await settle(page); await page.waitForTimeout(1200);
    const idx = () => page.evaluate(() => window.__reel.idx);
    await page.mouse.move(700, 450); await page.mouse.wheel(0, 260); await page.waitForTimeout(900); (await idx()) === 1 ? OK('rueda avanza 1') : F('rueda no avanzo: ' + await idx());
    await page.keyboard.press('ArrowDown'); await page.waitForTimeout(500); (await idx()) === 2 ? OK('flecha abajo avanza') : F('flecha abajo');
    await page.keyboard.press('End'); await page.waitForTimeout(500); (await idx()) === 17 ? OK('End va al ultimo') : F('End');
    await page.keyboard.press('Home'); await page.waitForTimeout(500);
    await page.mouse.move(500, 500); await page.mouse.down(); await page.mouse.move(500, 250, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(600); (await idx()) === 1 ? OK('arrastre hacia arriba avanza') : F('arrastre: ' + await idx());
    await page.evaluate(() => window.__reel.go(0)); await page.waitForTimeout(1500);
    await page.click('.slide >> nth=0 >> .ex'); await page.waitForTimeout(1000);
    const open = await page.evaluate(() => { const s = document.querySelectorAll('.slide')[0], p = s.querySelector('.panel'), r = p.getBoundingClientRect(), f = s.querySelector('.frame').getBoundingClientRect(); return { cls: s.classList.contains('open'), vis: getComputedStyle(p).visibility, inside: r.left >= f.left - 1 && r.right <= f.right + 1, modal: document.body.classList.contains('modal'), inert: p.inert }; });
    open.cls && open.vis === 'visible' && open.inside && open.modal && !open.inert ? OK('panel abre dentro del fotograma') : F('panel: ' + JSON.stringify(open));
    await page.keyboard.press('Escape'); await page.waitForTimeout(900);
    const closed = await page.evaluate(() => { const s = document.querySelectorAll('.slide')[0]; return { cls: s.classList.contains('open'), inert: s.querySelector('.panel').inert, vis: getComputedStyle(s.querySelector('.panel')).visibility }; });
    !closed.cls && closed.inert && closed.vis === 'hidden' ? OK('Escape cierra el panel') : F('cerrar panel: ' + JSON.stringify(closed));
    // todos los paneles: abrir, medir que su contenido cabe y que los enlaces son absolutos o #
    const N = 18; let panelBad = [];
    for (let i = 0; i < N; i++) { const has = await page.evaluate(k => !!document.querySelectorAll('.slide')[k].querySelector('.panel'), i); if (!has) continue; await page.evaluate(k => { window.__reel.cl(); window.__reel.go(k); }, i); await page.waitForTimeout(1300); await page.evaluate(k => window.__reel.op(k), i); await page.waitForTimeout(900);
      const pr = await page.evaluate(k => { const p = document.querySelectorAll('.slide')[k].querySelector('.panel'); return { h: p.scrollHeight, ch: p.clientHeight, links: [...p.querySelectorAll('a')].map(a => a.getAttribute('href')), fsMin: Math.min(...[...p.querySelectorAll('p,li,h3,h4,.btn,.tg,b')].map(e => parseFloat(getComputedStyle(e).fontSize))) }; }, i);
      if (pr.fsMin < 14) panelBad.push(`panel ${i}: fuente ${pr.fsMin}px`); for (const l of pr.links) if (!/^(https?:\/\/|#)/.test(l || '')) panelBad.push(`panel ${i}: enlace raro ${l}`);
      await page.evaluate(() => window.__reel.cl()); await page.waitForTimeout(300); }
    panelBad.length ? F('paneles: ' + panelBad.join(' | ')) : OK('18 fotogramas, paneles: fuentes >=14px y enlaces validos');
    // idioma
    await page.evaluate(() => { window.__reel.cl(); window.__reel.go(0); }); await page.waitForTimeout(1200);
    await page.click('.lang button[data-lang=en]'); await page.waitForTimeout(200);
    const en = await page.evaluate(() => ({ h1: document.querySelector('h1').textContent, lang: document.documentElement.lang, al: document.querySelector('.lang').getAttribute('aria-label'), alt: document.querySelector('.bgw img').alt, ph: document.querySelector('textarea').placeholder }));
    en.h1.startsWith('Blog. Tools. Solutions.') && en.lang === 'en' && en.al === 'Language' ? OK('idioma EN funciona (h1, lang, aria-label)') : F('EN: ' + JSON.stringify(en));
    await page.click('.lang button[data-lang=es]');
    // enlaces internos
    const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => !/^(https?:\/\/|#|mailto:)/.test(h)));
    links.length ? F('enlaces no absolutos: ' + links.join(',')) : OK('todos los enlaces son absolutos o #ancla');
    const gh = await page.evaluate(() => [...document.querySelectorAll('a[data-go]')].filter(a => !document.getElementById(a.getAttribute('href').slice(1))).map(a => a.getAttribute('href'))); gh.length ? F('data-go sin destino: ' + gh) : OK('data-go apuntan a fotogramas existentes');
    await ctx.close(); }

  // hash directo
  { const { ctx, page } = await setup(browser, 1440, 900, false); await page.goto('file://' + SITE + '/index.html#libro'); await page.waitForTimeout(1200);
    const r = await page.evaluate(() => ({ idx: window.__reel.idx, auto: window.__reel.auto })); r.idx === 6 && !r.auto ? OK('#libro abre directo sin entrada animada') : F('hash: ' + JSON.stringify(r)); await ctx.close(); }
  // ?lang=en
  { const { ctx, page } = await setup(browser, 1440, 900, false); await page.goto('file://' + SITE + '/index.html?lang=en'); await settle(page); const h = await page.evaluate(() => document.querySelector('h1').textContent); h.startsWith('Blog. Tools.') ? OK('?lang=en fuerza ingles') : F('lang param'); await ctx.close(); }
  // reduced motion: sin barrido
  { const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); await ctx.route('**/*', r => r.request().url().startsWith('file://') ? r.continue() : r.abort()); const page = await ctx.newPage(); await page.goto('file://' + SITE + '/index.html'); await page.waitForTimeout(800); const a = await page.evaluate(() => window.__reel.auto); !a ? OK('reduced-motion: sin barrido de entrada') : F('reduced-motion sigue animando'); await ctx.close(); }
  // SIN JAVASCRIPT: todo visible y apilado
  { const { ctx, page } = await setup(browser, 1280, 800, false, false); await page.goto('file://' + SITE + '/index.html'); await page.waitForTimeout(500);
    const r = await page.evaluate(() => { const vis = e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return cs.visibility !== 'hidden' && +cs.opacity > 0.95 && r.height > 0 }; const t = [...document.querySelectorAll('h1,h2,.lead,.panel,.reveal')]; return { total: t.length, hidden: t.filter(e => !vis(e)).map(e => e.tagName + '.' + e.className).slice(0, 4), htmlCls: document.documentElement.className }; });
    r.hidden.length === 0 ? OK(`sin JS: ${r.total} bloques visibles (clases html: "${r.htmlCls}")`) : F('sin JS hay contenido oculto: ' + JSON.stringify(r)); await ctx.close(); }
  // motor caido: simular error -> fallback
  { const { ctx, page } = await setup(browser, 1280, 800, false); await page.addInitScript(() => { const orig = Element.prototype.querySelector; let n = 0; window.__boom = true; }); await page.route('**/index.html', r => r.continue()); await page.goto('file://' + SITE + '/index.html'); await ctx.close(); notes.push('fallback por error de motor cubierto por catch (ver reel.js)'); }
  await browser.close();
  console.log('\nRESUMEN:', fails.length ? fails.length + ' FALLAS' : 'TODO OK'); if (fails.length) { fs.writeFileSync(SHOTS + '/fails-' + MODE + '.txt', fails.join('\n')); process.exit(1); }
})();
