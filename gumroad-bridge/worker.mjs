// gumroad-bridge · Worker propio (NO es el Worker "website"). JFC 2026-09-30.
// Lee las dos tiendas de Gumroad con la API v2 y publica JSON de SOLO LECTURA.
// Secretos (Cloudflare > Worker > Settings > Variables, tipo Secret; NUNCA en el repo ni en el chat):
//   GUMROAD_TOKEN_JFC        token de jfcarpio.gumroad.com
//   GUMROAD_TOKEN_ESCUELA    token de escuela-dinero.gumroad.com
//   BRIDGE_KEY               clave larga; sin ella las rutas privadas responden 401
// Rutas (todas GET, bajo jfcarpio.com/api/gumroad/):
//   products.json?store=jfc|escuela|all   PUBLICO: solo campos que ya son publicos en la tienda
//   img?u=<url https de imagen Gumroad>   PUBLICO: proxy de portadas (lista blanca estricta de hosts)
//   sales-summary?store=...               PRIVADO (cabecera X-Bridge-Key): totales por producto, SIN datos de compradores
// Nunca se exponen correos, nombres, IPs ni tarjetas de compradores. Nunca se escribe en Gumroad.
const API = "https://api.gumroad.com/v2";
const STORES = { jfc: "GUMROAD_TOKEN_JFC", escuela: "GUMROAD_TOKEN_ESCUELA" };
const IMG_HOSTS = new Set(["public-files.gumroad.com", "assets.gumroad.com", "s3.amazonaws.com"]);
const json = (o, status = 200, extra = {}) =>
  new Response(JSON.stringify(o, null, 1), { status, headers: { "content-type": "application/json; charset=utf-8", "x-content-type-options": "nosniff", ...extra } });

async function gr(env, store, path) {
  const token = env[STORES[store]];
  if (!token) throw new Error("sin token para " + store);
  const r = await fetch(API + path, { headers: { authorization: "Bearer " + token } });
  if (!r.ok) throw new Error("Gumroad " + r.status);
  return r.json();
}
const strip = (h) => String(h || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
// Los nombres de campo se leen con alternativas: verificar contra la respuesta real la primera vez.
export function publicProduct(p, store) {
  return {
    store, id: p.id, name: p.name, url: p.short_url || p.url || null,
    price: p.formatted_price || (typeof p.price === "number" ? (p.price / 100).toFixed(2) + " " + (p.currency || "USD") : null),
    thumbnail_url: p.thumbnail_url || null, preview_url: p.preview_url || null,
    description: strip(p.description).slice(0, 600),
    published: p.published !== false,
  };
}
async function products(env, which) {
  const list = which === "all" ? Object.keys(STORES) : [which];
  const out = [];
  for (const s of list) { const d = await gr(env, s, "/products"); for (const p of d.products || []) if (p.published !== false) out.push(publicProduct(p, s)); }
  return out;
}
async function salesSummary(env, which) {
  const list = which === "all" ? Object.keys(STORES) : [which]; const out = {};
  for (const s of list) {
    let page = 1, key = null; const by = {};
    for (let i = 0; i < 20; i++) { // tope de seguridad: 20 paginas
      const d = await gr(env, s, "/sales" + (key ? "?page_key=" + encodeURIComponent(key) : "?page=" + page));
      for (const x of d.sales || []) { const n = x.product_name || x.product_id || "?"; const b = (by[n] ||= { ventas: 0, centavos: 0 }); b.ventas++; b.centavos += Number(x.price) || 0; }
      key = d.next_page_key || null; page++;
      if (!key && !d.next_page_url) break;
    }
    out[s] = by;
  }
  return out;
}
export function imgAllowed(u) {
  try { const x = new URL(u); return x.protocol === "https:" && IMG_HOSTS.has(x.hostname) && !x.username && !x.password; } catch { return false; }
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "GET") return json({ error: "solo GET" }, 405);
    const route = url.pathname.replace(/^\/api\/gumroad\//, "");
    const store = url.searchParams.get("store") || "all";
    if (store !== "all" && !STORES[store]) return json({ error: "store invalido" }, 400);
    try {
      if (route === "products.json") return json(await products(env, store), 200, { "cache-control": "public, max-age=600" });
      if (route === "img") {
        const u = url.searchParams.get("u") || "";
        if (!imgAllowed(u)) return json({ error: "host no permitido" }, 400);
        const r = await fetch(u, { redirect: "error" });
        const ct = r.headers.get("content-type") || "";
        if (!r.ok || !ct.startsWith("image/")) return json({ error: "no es imagen" }, 502);
        return new Response(r.body, { headers: { "content-type": ct, "cache-control": "public, max-age=86400", "x-content-type-options": "nosniff" } });
      }
      if (route === "sales-summary") {
        if (!env.BRIDGE_KEY || request.headers.get("x-bridge-key") !== env.BRIDGE_KEY) return json({ error: "no autorizado" }, 401);
        return json(await salesSummary(env, store), 200, { "cache-control": "private, no-store" });
      }
      return json({ error: "ruta desconocida" }, 404);
    } catch (e) { return json({ error: "fallo del puente", detalle: String(e.message || e) }, 502); }
  },
};
