export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health" || url.pathname === "/api/health/") {
      return Response.json({
        ok: true,
        service: "betsie-quickbet",
        hint: "Worker + static assets. Add D1 in wrangler.jsonc and use env.DB in this file.",
      });
    }
    return env.ASSETS.fetch(request);
  },
};
