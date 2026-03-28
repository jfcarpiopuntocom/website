export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const newHeaders = new Headers(response.headers);

    newHeaders.set("X-Frame-Options", "SAMEORIGIN");
    newHeaders.set("X-Content-Type-Options", "nosniff");
    newHeaders.set("X-XSS-Protection", "1; mode=block");
    newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
    newHeaders.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
    newHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    newHeaders.set("Content-Security-Policy", "upgrade-insecure-requests");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
