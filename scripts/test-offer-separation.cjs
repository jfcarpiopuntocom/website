const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
for(const name of ['index.html','es/index.html']){
 const source=read(name).replace(/<template\b[^>]*>.*?<\/template>/gs,''),ids=[...source.matchAll(/<section class="slide[^"]*" id="([a-z0-9]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,20);assert.equal(ids[ids.indexOf('apps')+1],'reportes');assert(ids.indexOf('pbiu')>ids.indexOf('publicaciones'));
 const micro=source.match(/<section class="slide[^"]*" id="reportes".*?<\/section>/s)[0];
 assert(!/Critical Minerals|Minerales Críticos|Macroeconomic research|Research macro|research-feedback|macroec[oó]n[oó]mic|brilla-group\.com/i.test(micro));
 assert(micro.includes('USD 100'));assert(micro.includes('72'));assert(micro.includes('10'));
}
for(const name of ['reportes/index.html','en/reports/index.html'])assert(!/research-feedback|Diego Peñaherrera|Critical Minerals/.test(read(name)));
const page=read('pacific-basin/index.html');
assert.equal((page.match(/<h1(?:\s|>)/g)||[]).length,1);
assert.equal((page.match(/class="pbiu-document en-mode"/g)||[]).length,15);
assert(!page.includes(String.fromCharCode(1)));assert(page.includes('14,500')||page.includes('14.500'));assert(page.includes('3,800')||page.includes('3.800'));
const ids=[...page.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'duplicate IDs');
for(const m of page.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]),'Missing internal destination '+m[1]);
for(const m of page.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g))assert(fs.existsSync(path.join(root,m[1])),'Missing asset '+m[1]);
assert(read('worker.js').includes('"/api/pbiu/fx"'));assert(!read('wrangler.toml').includes('friendly123.com'));
console.log('Offer separation: 20 slides, adjacent microreports, lower PBIU, 15 complete documents, prices, anchors, assets and domain boundary OK');
