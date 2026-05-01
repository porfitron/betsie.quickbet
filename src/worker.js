import { handleBetRoutes } from "./bets.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/$/, "") || "/";

    if (pathname === "/api/health") {
      let dbOk = false;
      try {
        if (env.DB) {
          const row = await env.DB.prepare("SELECT 1 AS ok").first();
          dbOk = row?.ok === 1;
        }
      } catch {
        dbOk = false;
      }
      return Response.json({
        ok: true,
        service: "betsie-quickbet",
        db: dbOk,
      });
    }

    if (pathname.startsWith("/api/bets")) {
      try {
        const res = await handleBetRoutes(request, env, url);
        if (res) {
          return res;
        }
      } catch (error) {
        return Response.json(
          {
            error: "bets_api_error",
            detail: String(error && error.message ? error.message : error),
          },
          { status: 500 },
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
