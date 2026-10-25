'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('scripts/landing_conversion.py','utf8');
const pages=[['contacto','es','contacto/index.html'],['contacto','en','en/contact/index.html'],['trayectoria','es','trayectoria/index.html'],['trayectoria','en','en/track-record/index.html']];
for(const [section,lang,path] of pages){
 const anchor='('+JSON.stringify(section)+', '+JSON.stringify(lang)+'): """';
 const i=source.indexOf(anchor);assert.ok(i>=0,anchor);
 const end=source.indexOf('"""',i+anchor.length);assert.ok(end>i);
 const page=fs.readFileSync(path,'utf8');
 assert.ok(page.includes(source.slice(i+anchor.length,end)),'Generator drift: '+path);
 assert.equal((page.match(/<!doctype/gi)||[]).length,1);
}
for(const p of ['revision-de-lanzamiento/index.html','en/launch-review/index.html']){
 const html=fs.readFileSync(p,'utf8');assert.match(html,/conversion-process/);assert.match(html,/conversion-limits/);
}
let listener,redirect,form={getAttribute:()=> 'es',addEventListener:(_,fn)=>listener=fn,reportValidity:()=>true};
class F{get(k){return {name:'Alex',decision:'Test project',project:'Dashboard'}[k]||''}}
const env={document:{querySelectorAll:()=>[form]},FormData:F,window:{location:{assign:v=>redirect=v}}};
vm.runInNewContext(fs.readFileSync('contact-brief.js','utf8'),env);
assert.equal(redirect,undefined);listener({preventDefault(){}});
assert.match(redirect,/^https:\/\/wa\.me\/593999905080\?text=/);
assert.ok(decodeURIComponent(redirect).includes('Test project'));
console.log('Section landings ES/EN and deliberate form submit: OK');
