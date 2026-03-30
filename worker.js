// jfcarpio.com · Cloudflare Worker v3
// www→apex · security headers · real CSP · smart cache
// Subrequests to same zone skip the Worker (CF loop prevention) — no resolveOverride needed

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

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 1. Canonical: www → apex
    if (url.hostname.startsWith("www.")) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }

    // 2. Proxy to GitHub Pages origin (subrequest bypasses this Worker — no loop)
    const origin = "https://www.jfcarpio.com" + url.pathname + url.search;
    const res = await fetch(origin, { method: request.method });

    // 3. Security headers on every response
    const h = new Headers(res.headers);
    for (const [k, v] of Object.entries(SEC)) h.set(k, v);

    // 4. HTML: real CSP + no cache. Static assets: 1yr immutable
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
