import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mediaRange,MP4_BYTES} from './media-range.mjs';
const sample=Uint8Array.from({length:24},(_,i)=>i);
for(const [header,start,end] of [['bytes=0-4',0,4],['bytes=7-14',7,14],['bytes=-5',19,23],['bytes=20-',20,23]]){
 const body=new ReadableStream({start(c){c.enqueue(sample.slice(0,6));c.enqueue(sample.slice(6,15));c.enqueue(sample.slice(15));c.close()}});
 const result=mediaRange(new Response(body,{headers:{'Content-Length':'24'}}),new Request('https://jfcarpio.com/test.mp4',{headers:{Range:header}}));assert.equal(result.status,206);assert.deepEqual(new Uint8Array(await result.arrayBuffer()),sample.slice(start,end+1));assert.equal(Number(result.headers.get('Content-Length')),end-start+1);
}
for(const header of ['bytes=30-','bytes=3-1','bytes=','bytes=0-3,7-9']){const res=mediaRange(new Response(sample,{headers:{'Content-Length':'24'}}),new Request('https://jfcarpio.com/test.mp4',{headers:{Range:header}}));assert.equal(res.status,416);}
for(const [route,size] of Object.entries(MP4_BYTES))assert.equal(fs.statSync(new URL('..'+route,import.meta.url)).size,size,route+' manifest size');
console.log('Media ranges: OK — streamed chunk boundaries, suffix/open ranges, invalid requests and exact MP4 sizes.');
