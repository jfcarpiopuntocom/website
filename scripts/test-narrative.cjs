const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
let failed = 0;
const ok = (cond, msg) => cond ? console.log('ok  ' + msg) : (console.error('FAIL ' + msg), failed++);
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

const index = read('index.html');
const build = read('scripts/build-slide-pages.py');
const buildOg = read('scripts/build-og.cjs');
const manifest = JSON.parse(read('og/manifest.json'));
const stageStart = index.indexOf('<main class="stage"');
const stageEnd = index.indexOf('</main>', stageStart);
const stage = index.slice(stageStart, stageEnd >= 0 ? stageEnd + 7 : index.length);

ok(index.includes('HAY DOS TIPOS DE CREADORES DE NEGOCIOS.'), 'hero usa el headline aprobado literalmente');
ok(index.includes('Los que se enteran después (con dolores y hasta quiebras).'), 'hero conserva la primera línea aprobada');
ok(index.includes('Y los que encuentran maneras de ver con claridad mucho antes.'), 'hero conserva la segunda línea aprobada');

ok(!/class="snow\\b/.test(stage), 'el reel ya no muestra la bola de nieve acumulativa');
ok(!/class="sum\\b/.test(stage), 'el cierre ya no muestra la lista acumulada de consecuencias');
ok(!stage.includes('El segundo negocio, hasta aquí:'), 'no queda el contador narrativo viejo visible');
ok(!stage.includes('Historia de dos negocios ·'), 'los puentes ya no se rotulan como Historia de dos negocios');

ok(index.includes('"k529": "Ve antes"'), 'la vía positiva ES se llama Ve antes');
ok(index.includes('"k530": "Se entera después"'), 'la vía reactiva ES se llama Se entera después');
ok(index.includes('"k529": "Sees earlier"'), 'la vía positiva EN se llama Sees earlier');
ok(index.includes('"k530": "Finds out later"'), 'la vía reactiva EN se llama Finds out later');

ok(build.includes('("historia-de-dos-negocios", "Dos tipos de creadores")'), 'se conserva el slug ES y cambia sólo la etiqueta visible');
ok(build.includes('("en/tale-of-two-businesses", "Two kinds of business builders")'), 'se conserva el slug EN y cambia sólo la etiqueta visible');
ok(!build.includes('/consecuencias-{lang}.pdf'), 'el generador ya no enlaza el PDF retirado');
ok(!build.includes('# PDF de las 17 consecuencias'), 'el generador ya no recrea la fuente del PDF retirado');
ok(!buildOg.includes('consecuencias-'), 'build-og ya no regenera los PDFs retirados');

const generated = [
  'historia-de-dos-negocios/index.html',
  'historia-de-dos-negocios/dos-maneras-de-operar/index.html',
  'apps/index.html',
  'historia-de-dos-negocios/la-informacion-sola-no-basta/index.html',
  'articulos/index.html',
  'libro/index.html',
  'historia-de-dos-negocios/lo-que-pasa-afuera/index.html',
  'reportes/index.html',
  'trayectoria/index.html',
  'historia-de-dos-negocios/datos-no-es-ver/index.html',
  'visores/index.html',
  'tienda-gumroad/index.html',
  'la-escuela-del-dinero/index.html',
  'recursos-gratuitos/index.html',
  'clientes/index.html',
  'historia-de-dos-negocios/la-decision/index.html',
  'contacto/index.html',
  'en/tale-of-two-businesses/index.html',
  'en/tale-of-two-businesses/two-ways-to-operate/index.html',
  'en/apps/index.html',
  'en/tale-of-two-businesses/information-alone-is-not-enough/index.html',
  'en/articles/index.html',
  'en/book/index.html',
  'en/tale-of-two-businesses/what-happens-outside/index.html',
  'en/reports/index.html',
  'en/track-record/index.html',
  'en/tale-of-two-businesses/data-is-not-seeing/index.html',
  'en/business-viewers/index.html',
  'en/gumroad-store/index.html',
  'en/money-school/index.html',
  'en/free-resources/index.html',
  'en/clients/index.html',
  'en/tale-of-two-businesses/the-decision/index.html',
  'en/contact/index.html'
];

for (const p of generated) {
  const html = read(p);
  ok(!/class="snow\\b/.test(html), p + ' no muestra bola de nieve');
  ok(!html.includes('Historia de dos negocios'), p + ' no muestra el nombre narrativo ES retirado');
  ok(!html.includes('A tale of two businesses'), p + ' no muestra el nombre narrativo EN retirado');
  ok(!/consecuencias-(?:es|en)\\.pdf/.test(html), p + ' no enlaza el PDF retirado');
}
ok(read('historia-de-dos-negocios/index.html').includes('HAY DOS TIPOS DE CREADORES DE NEGOCIOS.'), 'hub ES refleja el nuevo eje');
ok(read('en/tale-of-two-businesses/index.html').includes('TWO KINDS OF BUSINESS BUILDERS.'), 'hub EN refleja el nuevo eje');

const retiredOg = /og\/(?:historia|c1|c4|c5|c8|c9)-(?:es|en)\.png/;
ok(!manifest.some(x => retiredOg.test(x.file || '')), 'manifest no regenera tarjetas OG de la narrativa retirada');
for (const p of [
  'historia-de-dos-negocios/index.html',
  'historia-de-dos-negocios/dos-maneras-de-operar/index.html',
  'historia-de-dos-negocios/la-informacion-sola-no-basta/index.html',
  'historia-de-dos-negocios/lo-que-pasa-afuera/index.html',
  'historia-de-dos-negocios/datos-no-es-ver/index.html',
  'historia-de-dos-negocios/la-decision/index.html',
  'en/tale-of-two-businesses/index.html',
  'en/tale-of-two-businesses/two-ways-to-operate/index.html',
  'en/tale-of-two-businesses/information-alone-is-not-enough/index.html',
  'en/tale-of-two-businesses/what-happens-outside/index.html',
  'en/tale-of-two-businesses/data-is-not-seeing/index.html',
  'en/tale-of-two-businesses/the-decision/index.html'
]) ok(read(p).includes('https://jfcarpio.com/og-jfcarpio-v2.png'), p + ' usa OG estable y no la tarjeta narrativa vieja');

ok(index.includes('/historia-de-dos-negocios/'), 'se preservan las URLs ES existentes');
ok(index.includes('/en/tale-of-two-businesses/'), 'se preservan las URLs EN existentes');
ok(index.includes('friendly123/'), 'Apps permanece enlazada');
ok(index.includes('/talleres/'), 'Talleres permanece enlazado');
ok(index.includes('/publicaciones/'), 'Publicaciones permanece enlazada');

if (failed) {
  console.error('\nRESUMEN: ' + failed + ' FALLAS');
  process.exit(1);
}
console.log('\nRESUMEN: TODO OK');
