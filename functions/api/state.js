// Synced dashboard state (manual deals + checklist ticks), stored in the
// DASH_STATE KV namespace so the Mac app and the web version match.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "X-Dash-Key, Content-Type",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
};
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
function sameKey(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (!env.DASH_KEY) return json({ error: "DASH_KEY not set" }, 503);
  if (!sameKey(request.headers.get("X-Dash-Key"), env.DASH_KEY)) return json({ error: "Wrong key" }, 401);
  if (!env.DASH_STATE) return json({ error: "DASH_STATE binding not set" }, 503);
  if (request.method === "GET") {
    return json((await env.DASH_STATE.get("state", "json")) || { deals: [], done: {} });
  }
  if (request.method === "PUT") {
    const body = await request.text();
    if (body.length > 200000) return json({ error: "Too large" }, 413);
    let s;
    try { s = JSON.parse(body); } catch { return json({ error: "Bad JSON" }, 400); }
    if (!Array.isArray(s.deals) || typeof s.done !== "object") return json({ error: "Bad shape" }, 400);
    await env.DASH_STATE.put("state", JSON.stringify({ deals: s.deals, done: s.done, saved: new Date().toISOString() }));
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, 405);
}
