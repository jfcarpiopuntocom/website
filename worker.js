// jfcarpio.com · Cloudflare Worker v2
// Handles: www→apex redirect · security headers · smart caching · real CSP

const SEC = {
  "X-Frame-Options":           "SAMEORIGIN",
  "X-Content-Type-Options":    "nosniff",
  "X-XSS-Protection":          "1; mode=block",
  "Referrer-Policy":           "strict-origin-when-cross-origin",
  "Permissions-Policy":        "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

// Real CSP — scoped to what the site actually loads
const CSP =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline'; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "img-src 'self' data: https:; " +
  "connect-src 'self' https://api.anthropic.com; " +
  "frame-ancestors 'self'; " +
  "upgrade-insecure-requests";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Canonical domain: www → apex (matches <link rel="canonical">)
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }

    // 2. Serve static asset
    const res = await env.ASSETS.fetch(request);
    const h   = new Headers(res.headers);

    // 3. Security headers on every response
    for (const [k, v] of Object.entries(SEC)) h.set(k, v);

    // 4. Content-type-aware cache + CSP
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
