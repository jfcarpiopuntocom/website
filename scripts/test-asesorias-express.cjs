'use strict';
// Focused contract for the JFC commercial pivot (2026-10-25).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const data = JSON.parse(read('scripts/asesorias-express-content.json'));
const categoriesEs = [
  'Experiencia del Cliente (CX)', 'Estrategia Comercial',
  'Transformación Digital', 'Finanzas para Negocios',
  'Embudos de Valor para Atracción Orgánica de Clientes'
];
const categoriesEn = [
  'Customer Experience', 'Commercial Strategy', 'Digital Transformation',
  'Business Finance', 'Value Funnels'
];
assert(read('scripts/asesorias-express-gamma-source.md').includes('5 Asesorías Express para Evitar la Quiebra Temprana'));
for (const c of categoriesEs) assert(data.es.includes(c), 'Spanish Gamma offer category: ' + c);
for (const c of categoriesEn) assert(data.en.includes(c), 'Translated category: ' + c);
for (const [file, lang, title] of [
  ['reportes/index.html', 'es', 'Asesorías Express'],
  ['en/reports/index.html', 'en', 'Express Business Advisories']
]) {
  const h = read(file);
  assert.equal((h.match(/<!DOCTYPE html>/g) || []).length, 1, file + ': valid doctype');
  assert.equal((h.match(/<h1(?:\\s|>)/g) || []).length, 1, file + ': one h1');
  assert(h.includes('<title>') && h.includes(title), file + ': advisory title');
  assert(h.includes('href="/asesorias-express.css"'), file + ': scoped CSS');
  const first = h.indexOf('class="express-offer"'), secondary = h.indexOf('class="express-secondary"');
  assert(first > 0 && secondary > first, file + ': advisory must lead; report last');
  assert(h.includes('id="microreportes"') && h.includes('<summary>') && h.includes('id="report-example"'), file + ': legacy report preserved');
  assert(h.includes('USD 100') && (lang === 'es' ? h.includes('2–3') : h.includes('2–3')), file + ': faithful session price and hours');
  const script = (h.match(/<script type="application\\/ld\\+json">([\\s\\S]*?)<\\/script>/) || [])[1];
  assert(script, file + ': valid structured data must exist');
  const ld = JSON.parse(script);
  const service = ld['@graph'].find(n => n['@type'] === 'Service');
  assert(service && service.name.toLowerCase().includes(lang === 'es' ? 'asesorías' : 'advisories'), file + ': advisory schema primary');
  assert.equal(service.offers.price, '100');
  assert(!h.includes('chrome-extension://') && !h.includes('Juan%20Fernando'), file + ': no browser-save');
}
const routes = JSON.parse(read('scripts/landing-routes.json'));
const offer = routes.find(x => x.host === 'consultor.jfcarpio.com');
assert.equal(offer.en, '/en/reports/');
assert.equal(offer.es, '/reportes/');
const generator = read('scripts/report_offer.py');
assert(generator.includes('def report_body(lang, old_body):') && generator.includes('*express_body(lang)'), 'generator prioritizes advisory');
assert(generator.includes('id="microreportes"') && generator.includes('_legacy_report_body'), 'generator preserves reports');
const home = read('index.html');
assert(home.includes('mark.hl-cyan{color:#3DE0F5') && home.includes('mark.hl-crimson{color:#FF3B5C'), 'approved reel highlights unchanged');
console.log('Asesorías Express: five offerings, source, EN/ES, schema, legacy report and routes verified.');
