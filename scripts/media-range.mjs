export const MP4_BYTES={"/media/friendly-123-30s.mp4": 1970781, "/media/friendly-123-60s.mp4": 3712693};
// Single byte ranges for the small public MP4 explainers; stream without buffering.
export function mediaRange(response,request){
 const range=request.headers.get('Range');if(!range||response.status!==200)return response;
 const size=Number(response.headers.get('Content-Length'))||MP4_BYTES[new URL(request.url).pathname];if(!size||!response.body)return response;
 const match=/^bytes=(\d*)-(\d*)$/.exec(range);let start,end;
 if(match&&(match[1]||match[2])){start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));end=match[1]&&match[2]?Math.min(size-1,Number(match[2])):size-1;}
 if(!match||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size){void response.body.cancel().catch(()=>{});return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});}
 const headers=new Headers(response.headers);headers.set('Accept-Ranges','bytes');headers.set('Content-Range',`bytes ${start}-${end}/${size}`);headers.set('Content-Length',String(end-start+1));
 const reader=response.body.getReader();let offset=0,closed=false;
 const body=new ReadableStream({async pull(controller){try{while(!closed){const {value,done}=await reader.read();if(done){closed=true;controller.close();return;}const next=offset+value.byteLength;if(next>start&&offset<=end)controller.enqueue(value.slice(Math.max(0,start-offset),Math.min(value.byteLength,end-offset+1)));offset=next;if(offset>end){closed=true;controller.close();await reader.cancel();return;}if(next>start)return;}}catch(error){closed=true;controller.error(error);await reader.cancel().catch(()=>{});}},cancel(reason){closed=true;return reader.cancel(reason);}});
 return new Response(body,{status:206,headers});
}
