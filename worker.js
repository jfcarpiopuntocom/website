// jfcarpio.com · Cloudflare Worker v2
// www→apex · security headers · real CSP · smart cache
// Proxy mode: resolveOverride bypasses Cloudflare routing → no loop

const SEC = {
  "X-Frame-Options":           "SAMEORIGIN",
  "X-Content-Type-Options":    "nosniff",
  "X-XSS-Protection":          "1; mode=block",
  "Referrer-Policy":           "strict-origin-when-cross-origin",
  "Permissions-Policy":        "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

const CSP =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline'; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "img-src 'self' data: https:; " +
  "connect-src 'self' https://api.anthropic.com; " +
  "frame-ancestors 'self'; " +
  "upgrade-insecure-requests";

// GitHub Pages anycast IP — connect directly to skip Cloudflare routing
const GH_IP = "185.199.108.153";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 1. Canonical: www → apex (matches <link rel="canonical">)
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }

    // 2. Proxy to GitHub Pages via direct IP (no loop: bypasses Cloudflare routing)
    const origin = "https://www.jfcarpio.com" + url.pathname + url.search;
    const res = await fetch(origin, {
      method:  request.method,
      cf:      { resolveOverride: GH_IP },
    });

    // 3. Security headers on every response
    const h = new Headers(res.headers);
    for (const [k, v] of Object.entries(SEC)) h.set(k, v);

    // 4. Content-aware cache + CSP only on HTML
    const ct = res.headers.get("Content-Type") ?? "";
    if (ct.includes("text/html")) {
      h.set("Content-Security-Policy", CSP);
      h.set("Cache-Control", "public, max-age=0, must-revalidate");
    } else if (/image\/|font\/|text\/css|application\/javascript/.test(ct)) {
      h.set("Cache-Control", "public, max-age=31536000, immutable");
    }

    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
  },
};
