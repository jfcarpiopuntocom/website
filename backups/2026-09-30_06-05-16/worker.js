// jfcarpio.com · Cloudflare Worker v4 (JFC 2026-09-25)
// Todo el sitio sale de Cloudflare (static assets); GitHub solo guarda el codigo.
// Antes (v3) el Worker pedia cada ruta a www.jfcarpio.com, que iba DIRECTO a
// GitHub sin pasar por Cloudflare; con www en proxy eso hace un ciclo (error 1101).
// .assetsignore deja fuera todo lo privado (CLAUDE.md, wrangler.toml, backups...).
const SEC = {
  "X-Frame-Options":           "SAMEORIGIN",
  "X-Content-Type-Options":    "nosniff",
  "Referrer-Policy":           "strict-origin-when-cross-origin",
  "Permissions-Policy":        "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};
const CSP =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; " + // Web Analytics (antes bloqueado: cero datos de visitas)
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "img-src 'self' data: https:; " +
  "connect-src 'self' https://api.anthropic.com https://cloudflareinsights.com; " +
  "frame-ancestors 'self'; " +
  "upgrade-insecure-requests";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // 0. blog.jfcarpio.com -> jfcarpio.com/blog/ (JFC 2026-09-25): antes iba a github.io y
    //    regalaba autoridad SEO a otro dominio. Redireccion permanente al blog del sitio.
    if (url.hostname === "blog.jfcarpio.com") {
      return Response.redirect("https://jfcarpio.com/blog/", 301);
    }
    // 1. Canonico: www -> apex
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }
    // 2. Archivos del sitio desde Cloudflare (sin volver a GitHub)
    const res = await env.ASSETS.fetch(request);
    // 3. Cabeceras de seguridad en todo
    const h = new Headers(res.headers);
    for (const [k, v] of Object.entries(SEC)) h.set(k, v);
    const ct = res.headers.get("Content-Type") ?? "";
    if (ct.includes("text/html")) {
      h.set("Content-Security-Policy", CSP);
      h.set("Cache-Control", "public, max-age=0, must-revalidate");
    } else if (/image\/|font\//.test(ct)) {
      h.set("Cache-Control", "public, max-age=2592000");
    }
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
  },
};
