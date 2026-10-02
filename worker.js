// jfcarpio.com · Cloudflare Worker v5 (JFC 2026-09-30)
// Todo el sitio sale de Cloudflare (static assets); GitHub solo guarda el codigo.
// Antes (v3) el Worker pedia cada ruta a www.jfcarpio.com, que iba DIRECTO a
// GitHub sin pasar por Cloudflare; con www en proxy eso hace un ciclo (error 1101).
// .assetsignore deja fuera todo lo privado (CLAUDE.md, wrangler.toml, backups...).
const GA4_MEASUREMENT_ID = "G-4E9KPCFR8E";

// friendly-123 promises device-local operation/privacy. Keep analytics out of the app route.
// All other public HTML is measured centrally here so future pages inherit GA4 without
// duplicating tags in dozens of static files.
function shouldInjectAnalytics(pathname) {
  return !(pathname === "/friendly123" || pathname.startsWith("/friendly123/"));
}

class GA4HeadInjector {
  element(element) {
    element.prepend(`
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_MEASUREMENT_ID}', { send_page_view: true });
</script>
`, { html: true });
  }
}

const SEC = {
  "X-Frame-Options":           "SAMEORIGIN",
  "X-Content-Type-Options":    "nosniff",
  "Referrer-Policy":           "strict-origin-when-cross-origin",
  "Permissions-Policy":        "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};
const CSP =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.googletagmanager.com; " + // Cloudflare Web Analytics + GA4
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "img-src 'self' data: https:; " +
  "connect-src 'self' https://api.anthropic.com https://cloudflareinsights.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com; " +
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
    // OpenAI plugin domain verification for Business Survival Score (2026-10-02).
    // The submission portal allows an eligible parent origin of the MCP hostname.
    if (url.pathname === "/.well-known/openai-apps-challenge") {
      const token = "YcAqQF2X6HWUHvVRd7hImDU0OxzFolxRJIeWMTpoX4s";
      if (request.method === "GET") {
        return new Response(token, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      }
      if (request.method === "HEAD") {
        return new Response(null, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      }
      return new Response("Method Not Allowed", { status: 405, headers: { "Allow": "GET, HEAD" } });
    }

    // 1b. Canonical puntual: el asset layer ya normaliza este .html a la URL limpia con 307.
    // Hacemos la señal permanente y explícita para usuarios y buscadores.
    if (url.pathname === "/working-paper-hidden-cost.html") {
      url.pathname = "/working-paper-hidden-cost";
      return Response.redirect(url.toString(), 301);
    }

    // 1c. Slides borrados por JFC 2026-09-30 (El dato, Dashboards: redundantes con Visores). 301 para no perder SEO.
    const GONE = { "/el-dato/": "/visores/", "/dashboards/": "/visores/", "/en/the-data-point/": "/en/business-viewers/",
      "/en/dashboards/": "/en/business-viewers/", "/17-consecuencias-es.pdf": "/consecuencias-es.pdf", "/17-consecuencias-en.pdf": "/consecuencias-en.pdf" };
    const to = GONE[url.pathname] || GONE[url.pathname + "/"];
    if (to) return Response.redirect("https://jfcarpio.com" + to, 301);

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
    const secured = new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });

    // 4. GA4 centralizado para el sitio editorial/comercial.
    //    No se inyecta en friendly-123 para no contradecir su promesa de operación local.
    if (
      request.method === "GET" &&
      ct.includes("text/html") &&
      shouldInjectAnalytics(url.pathname)
    ) {
      return new HTMLRewriter()
        .on("head", new GA4HeadInjector())
        .transform(secured);
    }

    return secured;
  },
  // 5. IndexNow (JFC 2026-09-30, SEO mundial): una vez al dia avisa a Bing/Yandex/Seznam/Naver
  //    las URLs del sitemap cambiadas en los ultimos 3 dias (lastmod). Bing alimenta a ChatGPT y Copilot.
  //    Clave publica: /c2d8b4e084c5a6e9498a037240f5da45.txt (NO borrar ese archivo).
  async scheduled(event, env, ctx) {
    const r = await env.ASSETS.fetch("https://jfcarpio.com/sitemap.xml");
    const xml = await r.text();
    const since = Date.now() - 3 * 864e5;
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)]
      .filter((m) => Date.parse(m[2]) >= since).map((m) => m[1]).slice(0, 10000);
    if (!urls.length) return;
    ctx.waitUntil(fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: "jfcarpio.com", key: "c2d8b4e084c5a6e9498a037240f5da45",
        keyLocation: "https://jfcarpio.com/c2d8b4e084c5a6e9498a037240f5da45.txt", urlList: urls }),
    }));
  },
};