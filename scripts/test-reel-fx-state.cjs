'use strict';
// Self-contained behavior test of the ACTUAL inline FX engine, with a deterministic
// WebGL/DOM harness. No browser/GPU required. The real GPU test is test-brave-webgl.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function run(html, search) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const fx = scripts.map(m => m[2]).find(s => s.includes('const SCN='));
  assert(fx, 'FX engine script must exist');
  const listeners = {};
  let draws = 0, placements = 0;
  const gl = {
    VERTEX_SHADER:1, FRAGMENT_SHADER:2, COMPILE_STATUS:1, LINK_STATUS:2,
    ARRAY_BUFFER:34962, STATIC_DRAW:35044, TRIANGLES:4, BLEND:3042,
    ONE:1, ONE_MINUS_SRC_ALPHA:771, COLOR_BUFFER_BIT:16384,
    createShader:type=>({type}), shaderSource:(s,src)=>{s.src=src}, compileShader(){},
    getShaderParameter:()=>true,getShaderInfoLog:()=>'',createProgram:()=>({}),
    attachShader(){},bindAttribLocation(){},linkProgram(){},
    getProgramParameter:()=>true,getProgramInfoLog:()=>'',getUniformLocation:()=>0,
    createBuffer:()=>({}),bindBuffer(){},bufferData(){},enableVertexAttribArray(){},
    vertexAttribPointer(){},enable(){},blendFunc(){},viewport(){},useProgram(){},
    clearColor(){},clear(){},uniform2f(){},uniform1f(){},drawArrays(){draws++}
  };
  const scrim={nextSibling:{}},face={
    offsetWidth:960,offsetHeight:600,
    querySelector:s=>s==='.sc'?scrim:null,insertBefore(){placements++}
  };
  const slide={
    id:'portada',classList:{contains:s=>s==='is-current'||s==='slide'},
    querySelector:s=>s==='.face'?face:null,
    getBoundingClientRect:()=>({left:0,top:0,width:960,height:600})
  };
  const canvas={
    style:{},classList:{add(){},remove(){}},offsetWidth:960,removed:false,
    setAttribute(){},getContext:()=>gl,addEventListener:(name,fn)=>{listeners[name]=fn},
    getBoundingClientRect:()=>({left:0,top:0,width:960,height:600}),
    remove(){this.removed=true}
  };
  const doc={
    documentElement:{classList:{contains:s=>s==='reel'}},body:{},hidden:false,
    createElement:s=>{assert.equal(s,'canvas');return canvas},
    querySelectorAll:s=>s==='.reel .slide'?[slide]:[],
    querySelector:s=>s==='.track'?{}:null
  };
  const win={};
  const env={
    document:doc,window:win,navigator:{webdriver:true},location:{search},
    matchMedia:s=>({matches:s.includes('reduce')}),
    devicePixelRatio:1,performance:{now:()=>5000},
    requestAnimationFrame:()=>123,cancelAnimationFrame(){},addEventListener(){},
    MutationObserver:class{observe(){}},
    console:{warn(){}},
    Float32Array
  };
  vm.runInNewContext(fx,env,{timeout:2000});
  return {window:win,canvas,gl,listeners,get draws(){return draws},get placements(){return placements}};
}
for(const file of ['index.html','es/index.html']){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const off=run(html,'?fx=0');assert(!off.window.jfcFX&&off.placements===0,file+': no-FX fallback');
  const app=run(html,'?fx=1');assert.equal(app.window.jfcFX.status,'running');
  assert.equal(app.window.jfcFX.scenes.length,20,file+': FX scenes count');
  assert.equal(app.window.jfcFX.compileAll().filter(([,ok])=>!ok).length,0);
  assert(app.placements>0&&app.draws>0,file+': must draw initially');
  for(let i=0;i<3;i++){
    let prevented=false;
    app.listeners.webglcontextlost({preventDefault(){prevented=true}});
    assert(prevented,file+': loss must prevent default');
    assert.equal(app.window.jfcFX.status,i===2?'disabled':'lost');
    assert.equal(app.canvas.style.display,'none');
    app.listeners.webglcontextrestored();
    assert.equal(app.window.jfcFX.status,i===2?'disabled':'running');
  }
  console.log('PASS deterministic WebGL loss + restoration + bounded fallback:',file);
}
