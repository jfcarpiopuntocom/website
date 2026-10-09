// Public daily indicative rates. No credentials, user data or arbitrary upstream URLs.
export async function exchangeRates(fetcher = fetch) {
 const sources = [
  ['https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json', 'Fawaz Ahmed Currency API', d => [d.usd, d.date]],
  ['https://open.er-api.com/v6/latest/USD', 'ExchangeRate-API', d => [Object.fromEntries(Object.entries(d.rates || {}).map(([k,v]) => [k.toLowerCase(),v])), new Date(d.time_last_update_unix * 1000).toISOString().slice(0,10)]]
 ];
 for (const [url, source, read] of sources) {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 5000);
  try {
   const response = await fetcher(url, {signal: controller.signal, headers:{Accept:'application/json'}, cf:{cacheTtl:900,cacheEverything:true}});
   if (!response.ok) throw new Error('Upstream unavailable');
   const [rates, asOf] = read(await response.json());
   if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf) || !['clp','pen','cop'].every(k => Number.isFinite(rates?.[k]) && rates[k] > 0)) throw new Error('Invalid rates');
   return {base:'USD', rates:{CLP:rates.clp,PEN:rates.pen,COP:rates.cop}, asOf, source, sourceURL:source.startsWith('Fawaz')?'https://github.com/fawazahmed0/exchange-api':'https://www.exchangerate-api.com', fetchedAt:new Date().toISOString(), frequency:'daily'};
  } catch {} finally {clearTimeout(timer)}
 }
 throw new Error('Exchange rates are temporarily unavailable');
}
export async function fxResponse(request) {
 if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
 try {
  const data = await exchangeRates();
  return new Response(request.method === 'HEAD'?null:JSON.stringify(data),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public,max-age=300','X-Content-Type-Options':'nosniff'}});
 } catch {
  return new Response(JSON.stringify({error:'Exchange rates are temporarily unavailable'}),{status:503,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Retry-After':'300'}});
 }
}
