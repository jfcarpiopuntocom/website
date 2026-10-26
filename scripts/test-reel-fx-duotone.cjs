'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
for(const page of ['index.html','es/index.html']){
 const h=fs.readFileSync(page,'utf8');
 assert(h.includes('#define FX_ORANGE vec3(1.,.53,.015)'));
 assert(h.includes('#define FX_BLUE vec3(.055,.20,.42)'));
 const m=h.match(/const SCN=\{([\s\S]*?)\n\};\n\/\* Motion design:/);assert(m,page+': scenes');
 const parts=[...m[1].matchAll(/\b([a-z]+):\`([\s\S]*?)\`(?=,|$)/gm)];assert.equal(parts.length,20,page+': scene count');
 for(const [,name,shader] of parts){
  if(['shelves','apps'].includes(name)){assert(!/\bFX_(ORANGE|BLUE)\b/.test(shader),page+': stock statuses modified');}
  else{
   assert(/\bFX_(BLUE|ORANGE)\b/.test(shader),page+': '+name+' no duotone');
   assert(!/\b(BLUE|CYAN|MINT|CORAL|GOLD|CRIM)\b/.test(shader),page+': '+name+' retains old color');
  }
 }
 assert(h.includes('mark.hl-blue')&&h.includes('const BLEND_NORMAL={apps:1}'));
 console.log('PASS WebGL two-tone FX, untouched app status palette:',page);
}