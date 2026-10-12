import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('BuscaClientes web entry uses approved transparent logo and 1.5s handoff',()=>{
 const html=read('buscaclientes/index.html');
 const svg=read('buscaclientes/brand-submarine-cutout-v2.svg');
 const target='https://buscaclientes-web.buscaclientes.workers.dev/?entry=splash';
 assert.match(html,/setTimeout\(function\(\)\{window\.location\.replace\(destination\);\},1500\)/);
 assert.ok(html.includes(target),'JS, meta refresh, and CTA share public target');
 assert.match(html,/http-equiv="refresh" content="3;url=https:\/\/buscaclientes-web\.buscaclientes\.workers\.dev\/\?entry=splash"/);
 assert.match(html,/src="\/buscaclientes\/brand-submarine-cutout-v2\.svg"/);
 assert.match(html,/7 contactos <em>validados<\/em> gratis por semana/);
 assert.match(svg,/viewBox="0 0 590 265"/);
 assert.match(svg,/data:image\/png;base64,iVBORw0KGgo/);
 assert.ok(!html.includes('src="/buscaclientes/brand-submarine-transparent.svg"'));
 const worker=read('worker.js');
 assert.ok(worker.includes('env.ASSETS.fetch(request)'));
});
