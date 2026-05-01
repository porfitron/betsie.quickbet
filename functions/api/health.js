export async function onRequestGet() {
  return Response.json({
    ok: true,
    hint: "Pages Functions are live. Add D1 binding in wrangler.toml and test with SELECT 1 next.",
  });
}
