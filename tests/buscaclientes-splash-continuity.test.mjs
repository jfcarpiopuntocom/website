import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../buscaclientes/index.html',import.meta.url),'utf8');
test('standalone splash cannot inherit global editorial layout',()=>{
  assert.doesNotMatch(html,/rel="stylesheet" href="\/editorial\.css"/);
  assert.doesNotMatch(html,/<body class="editorial">/);
  assert.match(html,/<body>/);
  assert.match(html,/\.commercial-nav\{/);
  assert.match(html,/brand-submarine-cutout-v2\.svg/);
  assert.match(html,/Made In Cuenca: intuitive business apps/);
});
test('entry is reversible, locale explicit and CRM quota copy accurate',()=>{
  assert.match(html,/window\.location\.replace\(destination\)/);
  assert.match(html,/http-equiv="refresh"/);
  assert.match(html,/\?entry=splash&lang="\+l/);
  assert.match(html,/CRM: 7 contactos/);
  assert.match(html,/CRM: 7 validated contacts free every week/);
  assert.match(html,/CRM: 7 contactos validados grátis por semana/);
  assert.doesNotMatch(html,/localStorage\.|indexedDB|sessionStorage\./);
});
