const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const exists = name => fs.existsSync(path.join(root, name));

const home = read('index.html');
const generator = read('scripts/build-slide-pages.py');
const pages = read('slide-page.css');
const enHub = read('en/tale-of-two-businesses/index.html');
const publications = read('publicaciones/index.html');

assert.match(home, /"k467": "THERE ARE TWO KINDS OF BUSINESSES\./);
assert.ok(!home.includes('There are not two kinds of businesses.'), 'English conclusion must not contradict the main claim');
assert.match(enHub, /<h1>THERE ARE TWO KINDS OF BUSINESSES\.<\/h1>/);
assert.match(generator, /"hub_h1": "THERE ARE TWO KINDS OF BUSINESSES\./);
assert.match(home, /font-family:'Barlow Condensed'/);
assert.match(home, /font-family:'Space Mono'/);
assert.match(pages, /font-family:'Barlow Condensed'/);
assert.match(pages, /font-family:'Space Mono'/);
for (const name of ['barlow-condensed-700.woff2', 'barlow-condensed-800.woff2', 'barlow-condensed-900.woff2', 'space-mono-400.woff2', 'space-mono-700.woff2']) {
  assert.ok(exists(`assets/fonts/${name}`), `missing ${name}`);
}
assert.match(publications, /font-family:'Lora'/);
assert.match(publications, /family=Space\+Mono/);

for (const [file,canonical,contact] of [
  ['revision-de-lanzamiento/index.html','https://jfcarpio.com/revision-de-lanzamiento/','/contacto/'],
  ['en/launch-review/index.html','https://jfcarpio.com/en/launch-review/','/en/contact/'],
]) {
  assert.ok(exists(file), `missing ${file}`);
  const html = read(file);
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`), `${file}: canonical`);
  assert.ok(html.includes(`href="${contact}"`), `${file}: contact route`);
  assert.match(html, /<meta name="description"/);
  assert.match(html, /<meta property="og:image"/);
  assert.match(html, /<link rel="icon"/);
  assert.match(html, /<h1>/);
}
assert.match(home, /href="\/revision-de-lanzamiento\/"/);
assert.match(home, /href="\/en\/launch-review\/"/);
assert.match(read('apps/index.html'), /href="\/revision-de-lanzamiento\/"/);
assert.match(read('en/apps/index.html'), /href="\/en\/launch-review\/"/);

const es = read('revision-de-lanzamiento/index.html');
const en = read('en/launch-review/index.html');
for (const item of ['404','Meta title','Meta description','Favicon','robots.txt','sitemap.xml','Open Graph','Alt text','móvil','carga','error','Términos','Cookies','Analytics','contacto','WebP']) {
  assert.ok(es.toLowerCase().includes(item.toLowerCase()), `ES missing: ${item}`);
}
for (const item of ['404','title','description','favicon','robots.txt','sitemap.xml','Open Graph','alt text','mobile','loading','error','terms','cookies','analytics','contact','WebP']) {
  assert.ok(en.toLowerCase().includes(item.toLowerCase()), `EN missing: ${item}`);
}
console.log('brand + launch offer: OK');
