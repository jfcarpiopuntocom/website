import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
const read=p=>fs.readFileSync(p,'utf8');
const sections=s=>[...s.matchAll(/<section class="slide[^"]*" id="([a-z0-9]+)"[^>]*>([\s\S]*?)<\/section>/g)];
test('commercial work precedes the intellectual archive without retiring routes',()=>{
 const s=sections(read('index.html')),ids=s.map(m=>m[1]);
 assert.equal(ids.length,20);assert.equal(new Set(ids).size,20);
 for(const id of ['apps','reportes','talleres','visores','pbiu'])assert(ids.indexOf(id)<ids.indexOf('publicaciones'),id);
});
test('macro offers do not leak into the shop or the fixed-price report',()=>{
 for(const f of ['index.html','es/index.html'])for(const s of sections(read(f)).filter(m=>['gumroad','reportes'].includes(m[1])))assert(!/minerals|minerales|macroecon[oó]mic/i.test(s[2]),f+' '+s[1]);
});
test('the report demonstrates its deliverable without presenting an invented customer result',()=>{
 for(const f of ['reportes/index.html','en/reports/index.html']){
  const s=read(f);assert.match(s,/data-report-example/);assert.match(s,/USD 100/);assert.match(s,/72/);assert.match(s,/mailto:jfcarpio@gmail.com/);
 }
});
test('legacy reading documents point to extant publication and workshop routes',()=>{
 for(const f of ['working-paper-hidden-cost.html','mindos-talleres.html','guia-indicadores-marketing.html'])assert(!/(?:href="(?:https:\/\/jfcarpio.com\/)?(?:blog|publicaciones)\.html|index\.html#workshops)/.test(read(f)),f);
});
