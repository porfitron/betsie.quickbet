/**
 * Maps API / URL-style keys (t, cn, …) to D1 column names.
 */
const PATCH_KEYS = [
  "mode",
  "t",
  "cn",
  "chn",
  "p1",
  "p2",
  "d",
  "tt",
  "ct",
  "w",
  "src",
  "cs",
  "inv",
  "cr",
  "hf",
  "ev",
  "ee",
  "eab",
  "cv",
  "chv",
  "vr",
  "dr",
];

const COL = {
  mode: "mode",
  t: "title",
  cn: "creator_name",
  chn: "challenger_name",
  p1: "p1",
  p2: "p2",
  d: "deadline",
  tt: "creator_trash",
  ct: "challenger_trash",
  w: "winner",
  src: "source",
  cs: "creator_step",
  inv: "invited",
  cr: "challenger_responded",
  hf: "handoff_flash",
  ev: "early_vote",
  ee: "early_ended_at",
  eab: "early_called_by",
  cv: "creator_vote_choice",
  chv: "challenger_vote_choice",
  vr: "vote_round",
  dr: "draw_reason",
};

/**
 * Minimal fields for `GET /api/bets` (public discovery feed).
 * Omits names, vote payloads, handoff flags, and other operational keys — see `rowToApi`.
 */
function rowToPublicFeedListApi(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    mode: row.mode ?? "",
    t: row.title ?? "",
    p1: row.p1 ?? "",
    p2: row.p2 ?? "",
    d: row.deadline ?? "",
    tt: row.creator_trash ?? "",
    ct: row.challenger_trash ?? "",
    w: row.winner ?? "",
  };
}

function publicBetListDisabled(env) {
  const raw = env.PUBLIC_BET_LIST_DISABLED;
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return false;
  }
  return ["1", "true", "yes", "on"].includes(String(raw).trim().toLowerCase());
}

function rowToApi(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    mode: row.mode ?? "",
    t: row.title ?? "",
    cn: row.creator_name ?? "",
    chn: row.challenger_name ?? "",
    p1: row.p1 ?? "",
    p2: row.p2 ?? "",
    d: row.deadline ?? "",
    tt: row.creator_trash ?? "",
    ct: row.challenger_trash ?? "",
    w: row.winner ?? "",
    src: row.source ?? "",
    cs: row.creator_step ?? "",
    inv: row.invited ?? "",
    cr: row.challenger_responded ?? "",
    hf: row.handoff_flash ?? "",
    ev: row.early_vote ?? "",
    ee: row.early_ended_at ?? "",
    eab: row.early_called_by ?? "",
    cv: row.creator_vote_choice ?? "",
    chv: row.challenger_vote_choice ?? "",
    vr: row.vote_round ?? "",
    dr: row.draw_reason ?? "",
  };
}

async function readJsonObject(request, maxBytes = 32768) {
  const len = Number(request.headers.get("content-length") || 0);
  if (len > maxBytes) {
    throw new Error("Payload too large");
  }
  const text = await request.text();
  if (text.length > maxBytes) {
    throw new Error("Payload too large");
  }
  const trimmed = text.trim();
  if (!trimmed) {
    return {};
  }
  const ct = (request.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) {
    throw new Error("Expected Content-Type: application/json");
  }
  let body;
  try {
    body = JSON.parse(trimmed);
  } catch {
    throw new Error("Invalid JSON");
  }
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("JSON body must be an object");
  }
  return body;
}

function extractPatch(body) {
  const patch = {};
  for (const key of PATCH_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(body, key)) {
      continue;
    }
    const v = body[key];
    if (v === null || v === undefined) {
      patch[key] = null;
      continue;
    }
    if (typeof v !== "string") {
      return { error: `Field "${key}" must be a string or null` };
    }
    patch[key] = v;
  }
  return { patch };
}

export async function handleBetRoutes(request, env, url) {
  const pathname = url.pathname.replace(/\/$/, "") || "/";
  const db = env.DB;
  if (!db) {
    return Response.json({ error: "Database binding DB is not configured" }, { status: 503 });
  }

  const betsPrefix = "/api/bets";
  if (!pathname.startsWith(betsPrefix)) {
    return null;
  }

  const rest = pathname.slice(betsPrefix.length);
  const idMatch = rest.match(/^\/([^/]+)$/);
  let id = idMatch ? idMatch[1] : null;
  if (id) {
    try {
      id = decodeURIComponent(id);
    } catch {
      return Response.json({ error: "Invalid bet id" }, { status: 400 });
    }
  }
  const isCollection = rest === "" || rest === "/";

  const method = request.method.toUpperCase();

  if (method === "POST" && isCollection) {
    let body;
    try {
      body = await readJsonObject(request);
    } catch (e) {
      return Response.json({ error: String(e.message || e) }, { status: 400 });
    }
    const { patch, error: patchErr } = extractPatch(body);
    if (patchErr) {
      return Response.json({ error: patchErr }, { status: 400 });
    }
    const betId = crypto.randomUUID();
    const now = Date.now();

    const columns = ["id", "created_at", "updated_at"];
    const placeholders = ["?", "?", "?"];
    const values = [betId, now, now];

    for (const key of PATCH_KEYS) {
      columns.push(COL[key]);
      placeholders.push("?");
      values.push(patch[key] !== undefined ? patch[key] : null);
    }

    await db
      .prepare(`INSERT INTO bets (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`)
      .bind(...values)
      .run();

    const row = await db.prepare("SELECT * FROM bets WHERE id = ?").bind(betId).first();
    return Response.json(rowToApi(row), { status: 201 });
  }

  if (method === "GET" && isCollection) {
    if (publicBetListDisabled(env)) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    let limit = Number(url.searchParams.get("limit"));
    if (!Number.isFinite(limit) || limit < 1) {
      limit = 10;
    }
    limit = Math.min(Math.floor(limit), 50);
    const { results } = await db
      .prepare(
        `SELECT id, created_at, updated_at, mode, title, p1, p2, deadline, creator_trash, challenger_trash, winner
         FROM bets ORDER BY updated_at DESC LIMIT ?`,
      )
      .bind(limit)
      .all();
    const rows = Array.isArray(results) ? results : [];
    return Response.json(rows.map((row) => rowToPublicFeedListApi(row)));
  }

  if (!id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (method === "GET") {
    const row = await db.prepare("SELECT * FROM bets WHERE id = ?").bind(id).first();
    if (!row) {
      return Response.json({ error: "Bet not found" }, { status: 404 });
    }
    return Response.json(rowToApi(row));
  }

  if (method === "PATCH") {
    let body;
    try {
      body = await readJsonObject(request);
    } catch (e) {
      return Response.json({ error: String(e.message || e) }, { status: 400 });
    }
    const { patch, error: patchErr } = extractPatch(body);
    if (patchErr) {
      return Response.json({ error: patchErr }, { status: 400 });
    }
    const keys = Object.keys(patch);
    if (keys.length === 0) {
      const row = await db.prepare("SELECT * FROM bets WHERE id = ?").bind(id).first();
      if (!row) {
        return Response.json({ error: "Bet not found" }, { status: 404 });
      }
      return Response.json(rowToApi(row));
    }

    const now = Date.now();
    const sets = keys.map((k) => `${COL[k]} = ?`).join(", ");
    const values = keys.map((k) => patch[k]);
    const result = await db
      .prepare(`UPDATE bets SET ${sets}, updated_at = ? WHERE id = ?`)
      .bind(...values, now, id)
      .run();

    const changed = (result.meta && (result.meta.changes ?? result.meta.rows_written)) || 0;
    if (!changed) {
      const exists = await db.prepare("SELECT 1 AS ok FROM bets WHERE id = ?").bind(id).first();
      if (!exists) {
        return Response.json({ error: "Bet not found" }, { status: 404 });
      }
    }

    const row = await db.prepare("SELECT * FROM bets WHERE id = ?").bind(id).first();
    return Response.json(rowToApi(row));
  }

  if (method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
