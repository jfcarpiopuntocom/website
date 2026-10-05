const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

let failed = 0;
const ok = (cond, msg) => {
  if (cond) console.log('ok  ' + msg);
  else { console.error('FAIL ' + msg); failed++; }
};
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

const index = read('index.html');
const stage = index.slice(index.indexOf('<main class="stage"'));
const build = read('scripts/build-slide-pages.py');

ok(index.includes('HAY DOS TIPOS DE CREADORES DE NEGOCIOS.'), 'hero usa el headline aprobado literalmente');
ok(index.includes('Los que se enteran después (con dolores y hasta quiebras).'), 'hero conserva la primera línea aprobada');
ok(index.includes('Y los que encuentran maneras de ver con claridad mucho antes.'), 'hero conserva la segunda línea aprobada');

ok(!/class="snow\b/.test(stage), 'el reel ya no muestra la bola de nieve acumulativa');
ok(!/class="sum\b/.test(stage), 'el cierre ya no muestra la lista acumulada de consecuencias');
ok(!stage.includes('El segundo negocio, hasta aquí:'), 'no queda el contador narrativo viejo visible');
ok(!stage.includes('Historia de dos negocios ·'), 'los puentes ya no se rotulan como Historia de dos negocios');
ok(stage.includes('data-t="k529"') && stage.includes('data-t="k530"'), 'se conserva la gramática comparativa A/B sin rediseñar el reel');

ok(index.includes('"k529": "Ve antes"'), 'la vía positiva se llama Ve antes');
ok(index.includes('"k530": "Se entera después"'), 'la vía reactiva se llama Se entera después');
ok(index.includes('"k529": "Sees earlier"') || index.includes('"k529": "Sees it earlier"'), 'la comparación existe también en inglés');

ok(build.includes('("historia-de-dos-negocios", "Dos tipos de creadores")'), 'se conserva el slug ES y cambia sólo la etiqueta visible');
ok(build.includes('("en/tale-of-two-businesses", "Two kinds of business builders")'), 'se conserva el slug EN y cambia sólo la etiqueta visible');
ok(!build.includes('btns.append(f\'<a class="btn" href="/consecuencias-'), 'las páginas generadas ya no enlazan el PDF de consecuencias');

const generated = [
  'historia-de-dos-negocios/index.html',
  'historia-de-dos-negocios/dos-maneras-de-operar/index.html',
  'apps/index.html',
  'en/tale-of-two-businesses/index.html',
  'en/tale-of-two-businesses/two-ways-to-operate/index.html',
  'en/apps/index.html'
];
for (const p of generated) {
  if (!fs.existsSync(path.join(ROOT, p))) { ok(false, p + ' existe'); continue; }
  const html = read(p);
  ok(!/class="snow\b/.test(html), p + ' no muestra bola de nieve');
}
ok(read('historia-de-dos-negocios/index.html').includes('HAY DOS TIPOS DE CREADORES DE NEGOCIOS.'), 'hub ES refleja el nuevo eje');
ok(read('en/tale-of-two-businesses/index.html').includes('TWO KINDS OF BUSINESS BUILDERS'), 'hub EN refleja el nuevo eje');

ok(index.includes('/historia-de-dos-negocios/'), 'las URLs ES existentes se preservan');
ok(index.includes('/en/tale-of-two-businesses/'), 'las URLs EN existentes se preservan');
ok(index.includes('friendly123/'), 'Apps permanece enlazada');
ok(index.includes('/talleres/'), 'Talleres permanece enlazado');
ok(index.includes('/publicaciones/'), 'Publicaciones permanece enlazada');

if (failed) {
  console.error('\nRESUMEN: ' + failed + ' FALLAS');
  process.exit(1);
}
console.log('\nRESUMEN: TODO OK');
