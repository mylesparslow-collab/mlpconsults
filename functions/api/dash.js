// Private data feed for Myles's MLP dashboard file.
// Keys live in Cloudflare Pages environment variables, never in the browser:
//   DASH_KEY      a password of your choosing, typed once into the dashboard
//   CAL_API_KEY   Cal.com > Settings > Developer > API keys
//   HUBSPOT_TOKEN HubSpot > Settings > Integrations > Private apps (scope: crm.objects.deals.read)
//   CF_API_TOKEN  Cloudflare API token with Account > Account Analytics > Read (demo view counts)
//   CF_ACCOUNT_ID Cloudflare account ID (demo view counts)
//   CF_WA_SITE_TAG optional: the Web Analytics site tag for mlpconsults.com, to ignore other sites
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
    headers: { Authorization: `Bearer ${env.CAL_API_KEY.trim()}`, "cal-api-version": "2024-08-13" },
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
  const h = { Authorization: `Bearer ${env.HUBSPOT_TOKEN.trim()}` };
  const [p, d] = await Promise.all([
    fetch("https://api.hubapi.com/crm/v3/pipelines/deals", { headers: h }),
    fetch("https://api.hubapi.com/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,closedate", { headers: h }),
  ]);
  if (!p.ok || !d.ok) {
    const bad = p.ok ? d : p;
    let msg = "";
    try { msg = (await bad.json()).message || ""; } catch {}
    return { error: `HubSpot ${bad.status}${msg ? ": " + msg.slice(0, 160) : ""}` };
  }
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

// Demo page views from Cloudflare Web Analytics (cookie-free, no personal data).
// Only page paths and counts are read; nothing about visitors.
function demoLabel(path) {
  const m = path.match(/^\/work\/(sites\/[^/]+|brokerage|client-system)/);
  return m ? "/work/" + m[1] : null;
}
async function views(env) {
  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) return { error: "CF_API_TOKEN / CF_ACCOUNT_ID not set" };
  const now = Date.now();
  const iso = (d) => new Date(now - d * 864e5).toISOString();
  const site = env.CF_WA_SITE_TAG ? `siteTag: "${String(env.CF_WA_SITE_TAG).replace(/[^\w-]/g, "")}", ` : "";
  const grp = (alias, days) => `${alias}: rumPageloadEventsAdaptiveGroups(filter: { ${site}datetime_geq: "${iso(days)}", datetime_leq: "${iso(0)}" }, limit: 5000, orderBy: [count_DESC]) { count dimensions { requestPath } }`;
  const q = `query { viewer { accounts(filter: { accountTag: "${String(env.CF_ACCOUNT_ID).replace(/[^\w-]/g, "")}" }) { ${grp("d30", 30)} ${grp("d7", 7)} } } }`;
  const r = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.CF_API_TOKEN.trim()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: q }),
  });
  if (!r.ok) return { error: `Cloudflare ${r.status}` };
  const j = await r.json();
  if (j.errors && j.errors.length) return { error: "Cloudflare: " + String(j.errors[0].message || "query failed").slice(0, 160) };
  const acc = j.data?.viewer?.accounts?.[0] || {};
  const sum = (rows) => {
    const out = {};
    for (const x of rows || []) {
      const l = demoLabel(x.dimensions?.requestPath || "");
      if (l) out[l] = (out[l] || 0) + x.count;
    }
    return out;
  };
  const a = sum(acc.d30), b = sum(acc.d7);
  const total = (rows) => (rows || []).reduce((n, x) => n + x.count, 0);
  return {
    demos: Object.keys(a).map((p) => ({ path: p, d30: a[p], d7: b[p] || 0 })).sort((x, y) => y.d30 - x.d30),
    site30: total(acc.d30),
    site7: total(acc.d7),
  };
}

export async function onRequest({ request, env }) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (!env.DASH_KEY) return json({ error: "DASH_KEY not set" }, 503);
  if (!sameKey(request.headers.get("X-Dash-Key"), env.DASH_KEY)) return json({ error: "Wrong key" }, 401);
  const settle = (p) => p.catch((e) => ({ error: String(e.message || e) }));
  const [c, h, v] = await Promise.all([settle(cal(env)), settle(hubspot(env)), settle(views(env))]);
  return json({ at: new Date().toISOString(), cal: c, hubspot: h, views: v });
}
