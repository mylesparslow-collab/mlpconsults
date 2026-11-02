// Private data feed for Myles's MLP dashboard file.
// Keys live in Cloudflare Pages environment variables, never in the browser:
//   DASH_KEY      a password of your choosing, typed once into the dashboard
//   CAL_API_KEY   Cal.com > Settings > Developer > API keys
//   HUBSPOT_TOKEN HubSpot > Settings > Integrations > Private apps (scope: crm.objects.deals.read)
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "X-Dash-Key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

async function cal(env) {
  if (!env.CAL_API_KEY) return { error: "CAL_API_KEY not set" };
  const r = await fetch("https://api.cal.com/v2/bookings?status=upcoming&take=20", {
    headers: { Authorization: `Bearer ${env.CAL_API_KEY}`, "cal-api-version": "2024-08-13" },
  });
  if (!r.ok) return { error: `Cal.com ${r.status}` };
  const { data = [] } = await r.json();
  return {
    bookings: data.map((b) => ({
      title: b.title,
      start: b.start,
      status: b.status,
      who: (b.attendees || []).map((a) => a.name || a.email).join(", "),
      email: b.attendees?.[0]?.email || "",
      fields: b.bookingFieldsResponses || {},
      url: b.meetingUrl || "",
    })),
  };
}

async function hubspot(env) {
  if (!env.HUBSPOT_TOKEN) return { error: "HUBSPOT_TOKEN not set" };
  const h = { Authorization: `Bearer ${env.HUBSPOT_TOKEN}` };
  const [p, d] = await Promise.all([
    fetch("https://api.hubapi.com/crm/v3/pipelines/deals", { headers: h }),
    fetch("https://api.hubapi.com/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,closedate", { headers: h }),
  ]);
  if (!p.ok || !d.ok) return { error: `HubSpot ${p.ok ? d.status : p.status}` };
  const stages = {};
  for (const pl of (await p.json()).results || []) for (const s of pl.stages || []) stages[s.id] = s.label;
  const deals = ((await d.json()).results || []).map((x) => ({
    id: x.id,
    name: x.properties.dealname,
    amount: Number(x.properties.amount) || 0,
    stage: stages[x.properties.dealstage] || x.properties.dealstage,
    close: (x.properties.closedate || "").slice(0, 10),
  }));
  return { deals };
}

export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (!env.DASH_KEY) return json({ error: "DASH_KEY not set" }, 503);
  if (!sameKey(request.headers.get("X-Dash-Key"), env.DASH_KEY)) return json({ error: "Wrong key" }, 401);
  const settle = (p) => p.catch((e) => ({ error: String(e.message || e) }));
  const [c, h] = await Promise.all([settle(cal(env)), settle(hubspot(env))]);
  return json({ at: new Date().toISOString(), cal: c, hubspot: h });
}
