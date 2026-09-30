// gumroad-bridge · Worker propio (NO es el Worker "website"). JFC 2026-09-30, v2 (docs oficiales leidas).
// Lee las dos tiendas de Gumroad y publica JSON de SOLO LECTURA. Nunca escribe en Gumroad.
// Fuente publica SIN token (docs Gumroad): https://<tienda>.gumroad.com/.json  y  /l/<permalink>.json
// Fuente privada CON token (Authorization: Bearer): /v2/sales  (solo para resumen de ventas)
// Secretos (Cloudflare > Worker > Settings > Variables, tipo Secret; NUNCA en repo, chat ni Notion):
//   GUMROAD_TOKEN_JFC, GUMROAD_TOKEN_ESCUELA   (solo para sales-summary)
//   BRIDGE_KEY                                 (clave larga; sin ella sales-summary responde 401)
// Rutas (GET, bajo jfcarpio.com/api/gumroad/):
//   products.json?store=jfc|escuela|all        PUBLICO: catalogo publico (nombre, enlace, precio, miniatura, calificaciones)
//   product?store=..&permalink=..              PUBLICO: detalle (descripcion, portadas, atributos, calificaciones)
//   img?u=<https imagen Gumroad>               PUBLICO: proxy de portadas (lista blanca estricta)
//   sales-summary?store=..&after=YYYY-MM-DD    PRIVADO (X-Bridge-Key): totales por producto y por utm_campaign, SIN datos de compradores
const STORES = {
  jfc: { host: "jfcarpio.gumroad.com", tokenVar: "GUMROAD_TOKEN_JFC" },
  escuela: { host: "escuela-dinero.gumroad.com", tokenVar: "GUMROAD_TOKEN_ESCUELA" },
};
const IMG_HOSTS = new Set(["public-files.gumroad.com", "assets.gumroad.com", "s3.amazonaws.com"]);
const json = (o, status = 200, extra = {}) =>
  new Response(JSON.stringify(o, null, 1), { status, headers: { "content-type": "application/json; charset=utf-8", "x-content-type-options": "nosniff", ...extra } });
const strip = (h) => String(h || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const pub = async (host, path) => {
  const r = await fetch("https://" + host + path, { headers: { accept: "application/json" } });
  if (!r.ok) throw new Error("Gumroad publico " + r.status);
  return r.json();
};
export function publicProduct(p, store) {
  return {
    store, id: p.id, permalink: p.permalink, name: p.name, url: p.url, native_type: p.native_type,
    price: p.price_formatted, price_cents: p.price_cents, currency: p.currency_code,
    pay_what_you_want: !!p.is_pay_what_you_want, thumbnail_url: p.thumbnail_url || null,
    ratings: p.ratings || null,
  };
}
async function products(which) {
  const list = which === "all" ? Object.keys(STORES) : [which]; const out = [];
  for (const s of list) { const d = await pub(STORES[s].host, "/.json"); for (const p of d.products || []) out.push(publicProduct(p, s)); }
  return out;
}
export function publicDetail(p, store) {
  return { ...publicProduct(p, store), summary: p.summary || null, description: strip(p.description_html).slice(0, 2000),
    covers: (p.covers || []).map((c) => ({ url: c.url, original_url: c.original_url, type: c.type, width: c.width, height: c.height })),
    attributes: p.attributes || [], is_published: p.is_published !== false };
}
export function imgAllowed(u) {
  try { const x = new URL(u); return x.protocol === "https:" && IMG_HOSTS.has(x.hostname) && !x.username && !x.password; } catch { return false; }
}
async function salesSummary(env, which, after) {
  const list = which === "all" ? Object.keys(STORES) : [which]; const out = {};
  for (const s of list) {
    const token = env[STORES[s].tokenVar]; if (!token) throw new Error("sin token para " + s);
    const by = {}, camp = {}; let key = null, pages = 0, truncated = false;
    do {
      const q = new URLSearchParams(); if (after) q.set("after", after); if (key) q.set("page_key", key);
      const r = await fetch("https://api.gumroad.com/v2/sales" + (q.toString() ? "?" + q : ""), { headers: { authorization: "Bearer " + token } });
      if (!r.ok) throw new Error("Gumroad ventas " + r.status);
      const d = await r.json();
      for (const x of d.sales || []) {
        if (x.chargedback || x.refunded) continue;
        const n = x.product_name || "?", c = Number(x.price) || 0;
        (by[n] ||= { ventas: 0, centavos: 0 }); by[n].ventas++; by[n].centavos += c;
        if (x.utm_campaign) { const k = x.utm_campaign; (camp[k] ||= { ventas: 0, centavos: 0 }); camp[k].ventas++; camp[k].centavos += c; }
      }
      key = d.next_page_key || null;
      if (key && ++pages >= 20) { truncated = true; break; }
    } while (key);
    out[s] = { por_producto: by, por_utm_campaign: camp, truncado: truncated };
  }
  return out;
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "GET") return json({ error: "solo GET" }, 405);
    const route = url.pathname.replace(/^\/api\/gumroad\//, "");
    const store = url.searchParams.get("store") || "all";
    if (store !== "all" && !STORES[store]) return json({ error: "store invalido" }, 400);
    try {
      if (route === "products.json") return json(await products(store), 200, { "cache-control": "public, max-age=600" });
      if (route === "product") {
        const pl = url.searchParams.get("permalink") || "";
        if (store === "all" || !/^[A-Za-z0-9_-]{1,80}$/.test(pl)) return json({ error: "store y permalink validos requeridos" }, 400);
        return json(publicDetail(await pub(STORES[store].host, "/l/" + pl + ".json"), store), 200, { "cache-control": "public, max-age=600" });
      }
      if (route === "img") {
        const u = url.searchParams.get("u") || "";
        if (!imgAllowed(u)) return json({ error: "host no permitido" }, 400);
        const r = await fetch(u, { redirect: "error" }); const ct = r.headers.get("content-type") || "";
        if (!r.ok || !ct.startsWith("image/")) return json({ error: "no es imagen" }, 502);
        return new Response(r.body, { headers: { "content-type": ct, "cache-control": "public, max-age=86400", "x-content-type-options": "nosniff" } });
      }
      if (route === "sales-summary") {
        if (!env.BRIDGE_KEY || request.headers.get("x-bridge-key") !== env.BRIDGE_KEY) return json({ error: "no autorizado" }, 401);
        const after = url.searchParams.get("after");
        if (after && !/^\d{4}-\d{2}-\d{2}$/.test(after)) return json({ error: "after debe ser YYYY-MM-DD" }, 400);
        return json(await salesSummary(env, store, after), 200, { "cache-control": "private, no-store" });
      }
      return json({ error: "ruta desconocida" }, 404);
    } catch (e) { return json({ error: "fallo del puente", detalle: String(e.message || e) }, 502); }
  },
};
