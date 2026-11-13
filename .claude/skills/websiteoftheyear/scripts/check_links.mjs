#!/usr/bin/env node
// Internal link, anchor and media checker for a SERVED site (run a static server first:
//   python3 -m http.server 8800 --directory <site-dir> &).
// Usage: node check_links.mjs <base-url> [--pages a.html,b/ ...] [--crawl]
//                             [--redirect-map-var map] [--no-external] [--concurrency 6]
//
// Pages checked: the base URL + --pages; with --crawl also every internal HTML page the
// base/--pages link to (one level). For every page:
//   - each same-site <a href> returns 200, and any #fragment exists as an id= / name= on the target
//   - each img/video/audio/source src, srcset, poster, <link href> and <script src> returns 200
//     (HEAD, then GET fallback; 3 retries; max --concurrency requests in flight, default 6)
// --redirect-map-var NAME: if the base page defines `var NAME = {"old-id": "area", ...}` (an old
//   #hash -> new page redirect map), each id must exist on <area>/ .
// External links are listed separately (status checked, never fails the run; --no-external skips).
// Exit 0 = PASS, 1 = FAIL.
// Cannot do: links/media created by JS at runtime, CSS url() assets, auth-walled pages.
// Needs Node 18+ (global fetch). No Playwright required.

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const valueFlags = new Set(['--pages', '--redirect-map-var', '--concurrency']);
const positional = args.filter((a, i) => !a.startsWith('--') && !valueFlags.has(args[i - 1]));
if (!positional[0]) {
  console.log('usage: node check_links.mjs <base-url> [--pages a.html,b/] [--crawl] [--redirect-map-var map] [--no-external] [--concurrency 6]');
  process.exit(1);
}
const base = new URL(positional[0].endsWith('/') || /\.\w+$/.test(positional[0]) ? positional[0] : positional[0] + '/');
const CONC = +opt('--concurrency', 6);
const extra = (opt('--pages', '') || '').split(',').map((s) => s.trim()).filter(Boolean);

// ---------- tiny concurrency-limited fetch layer ----------
let active = 0; const waiters = [];
const slot = async () => { if (active >= CONC) await new Promise((r) => waiters.push(r)); active++; };
const free = () => { active--; waiters.shift()?.(); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function req(url, method, wantBody = false) {
  let last;
  for (let a = 0; a < 3; a++) {
    await slot();
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
      const r = await fetch(url, { method, redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'Mozilla/5.0 check_links' } });
      const body = wantBody ? await r.text() : (r.body?.cancel?.(), '');
      clearTimeout(t);
      return { status: r.status, type: r.headers.get('content-type') || '', body };
    } catch (e) { last = e; } finally { free(); }
    await sleep(300 * (a + 1));
  }
  return { status: 0, type: '', body: '', err: String(last?.cause?.code || last?.message || last) };
}
const statusCache = new Map();
function headThenGet(url) {
  if (!statusCache.has(url)) statusCache.set(url, (async () => {
    let r = await req(url, 'HEAD');
    if (r.status !== 200) r = await req(url, 'GET');
    return r;
  })());
  return statusCache.get(url);
}
const pageCache = new Map();
function getPage(url) { // body text for HTML pages
  const u = url.split('#')[0];
  if (!pageCache.has(u)) pageCache.set(u, req(u, 'GET', true));
  return pageCache.get(u);
}

// ---------- extraction ----------
const stripBlocks = (h) => h.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => m.replace(/>[\s\S]*<\/script>/i, '></script>'));
function extract(html) {
  const h = stripBlocks(html);
  const links = [], media = [];
  for (const m of h.matchAll(/<a\b[^>]*?\shref\s*=\s*("([^"]*)"|'([^']*)')/gi)) links.push((m[2] ?? m[3]).trim());
  for (const m of h.matchAll(/<(img|video|audio|source|track|embed|link|script|iframe)\b[^>]*>/gi)) {
    const tag = m[1].toLowerCase(), t = m[0];
    const get = (n) => { const x = t.match(new RegExp('\\s' + n + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')', 'i')); return x ? (x[1] ?? x[2]).trim() : null; };
    if (tag === 'link') { const rel = get('rel') || ''; if (/stylesheet|icon|preload|manifest/i.test(rel) && get('href')) media.push(get('href')); continue; }
    for (const n of ['src', 'poster']) if (get(n)) media.push(get(n));
    const ss = get('srcset'); if (ss) ss.split(',').forEach((p) => { const u = p.trim().split(/\s+/)[0]; if (u) media.push(u); });
  }
  for (const m of h.matchAll(/<video\b[^>]*\sposter\s*=\s*("([^"]*)"|'([^']*)')/gi)) media.push((m[2] ?? m[3]).trim());
  return { links, media: [...new Set(media)] };
}
const idsOf = (html) => new Set([...html.matchAll(/\s(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map((m) => m[1] ?? m[2]));
const skipScheme = /^(mailto:|tel:|javascript:|data:|blob:|sms:|#?$)/i;
const isHtmlish = (u) => !/\.(?:jpe?g|png|gif|webp|avif|svg|mp4|webm|mov|mp3|wav|pdf|css|js|json|zip|woff2?|ico|txt|xml)$/i.test(u.pathname);

// ---------- run ----------
const fails = [], warns = [];
const fail = (page, msg) => fails.push(`${page}  ${msg}`);
const rel = (u) => { try { const x = new URL(u); return x.origin === base.origin ? x.pathname + x.search + x.hash : u; } catch { return u; } };

const startPages = [base.href, ...extra.map((p) => new URL(p, base).href)];
const pageSet = new Set(startPages.map((u) => u.split('#')[0]));
const pageInfo = new Map(); // url -> {links, media}
const external = new Map();  // url -> [pages]

async function load(url) {
  const r = await getPage(url);
  if (r.status !== 200) { fail(rel(url), `page returned ${r.status || r.err}`); return null; }
  const info = extract(r.body);
  pageInfo.set(url, info);
  return info;
}
await Promise.all([...pageSet].map(load));

if (flag('--crawl')) {
  const next = new Set();
  for (const [pu, info] of pageInfo) for (const l of info.links) {
    if (skipScheme.test(l)) continue;
    let u; try { u = new URL(l, pu); } catch { continue; }
    if (u.origin === base.origin && isHtmlish(u)) { u.hash = ''; if (!pageSet.has(u.href)) next.add(u.href); }
  }
  for (const u of next) pageSet.add(u);
  await Promise.all([...next].map(load));
}

let nLinks = 0, nMedia = 0, nAnchors = 0;
const jobs = [];
for (const [pu, info] of pageInfo) {
  const pn = rel(pu);
  for (const l of new Set(info.links)) {
    if (skipScheme.test(l)) continue;
    let u; try { u = new URL(l, pu); } catch { fail(pn, `unparseable href ${l}`); continue; }
    if (!/^https?:$/.test(u.protocol)) continue;
    if (u.origin !== base.origin) { (external.get(u.href) || external.set(u.href, []).get(u.href)).push(pn); continue; }
    nLinks++;
    jobs.push((async () => {
      const target = u.href.split('#')[0];
      const frag = decodeURIComponent(u.hash.slice(1));
      if (isHtmlish(u)) {
        const r = await getPage(target);
        if (r.status !== 200) return fail(pn, `link ${rel(l.startsWith('http') ? l : u.href)} -> ${r.status || r.err}`);
        if (frag && frag !== 'top') { nAnchors++; if (!idsOf(r.body).has(frag)) fail(pn, `anchor #${frag} missing on ${rel(target)}`); }
      } else {
        const r = await headThenGet(target);
        if (r.status !== 200) fail(pn, `link ${rel(u.href)} -> ${r.status || r.err}`);
      }
    })());
  }
  for (const m of info.media) {
    if (skipScheme.test(m)) continue;
    let u; try { u = new URL(m, pu); } catch { continue; }
    if (!/^https?:$/.test(u.protocol) || u.origin !== base.origin) continue;
    nMedia++;
    jobs.push((async () => { const r = await headThenGet(u.href.split('#')[0]); if (r.status !== 200) fail(pn, `media ${rel(u.href)} -> ${r.status || r.err}`); })());
  }
}
await Promise.all(jobs);

// redirect map
let mapMsg = '';
const mapVar = opt('--redirect-map-var');
if (mapVar) {
  const home = pageInfo.has(base.href) ? (await getPage(base.href)).body : '';
  const m = home.match(new RegExp('var\\s+' + mapVar.replace(/[^\w$]/g, '') + '\\s*=\\s*(\\{[\\s\\S]*?\\})\\s*;'));
  if (!m) { fail('redirect-map', `no \`var ${mapVar} = {...};\` found on ${rel(base.href)}`); }
  else {
    let map; try {
      // JSON first; else loosen a plain object literal (unquoted keys, single quotes, trailing commas) into JSON. Never eval page text.
      try { map = JSON.parse(m[1]); } catch {
        map = JSON.parse(m[1].replace(/'([^'\\]*)'/g, (_, x) => JSON.stringify(x)).replace(/([{,]\s*)([A-Za-z_$][\w$-]*)\s*:/g, '$1"$2":').replace(/,\s*([}\]])/g, '$1'));
      }
    } catch { fail('redirect-map', 'cannot parse object literal as JSON-like'); }
    if (map) {
      let ok = 0;
      for (const [id, area] of Object.entries(map)) {
        const target = new URL(String(area).replace(/\/?$/, '/'), base).href;
        const r = await getPage(target);
        if (r.status !== 200) fail('redirect-map', `#${id} -> ${area}/ returns ${r.status}`);
        else if (!idsOf(r.body).has(id)) fail('redirect-map', `#${id} -> ${area}/ : id not found`);
        else ok++;
      }
      mapMsg = `redirect map "${mapVar}": ${ok}/${Object.keys(map).length} ids resolve`;
    }
  }
}

// external (informational)
let extMsg = '';
if (!flag('--no-external') && external.size) {
  const bad = [];
  const ext = [...external.keys()];
  await Promise.all(ext.map(async (u) => { const r = await headThenGet(u); if (r.status === 0 || r.status >= 400) bad.push(`${r.status || r.err} ${u}  (on ${[...new Set(external.get(u))][0]})`); }));
  extMsg = `external links: ${ext.length} unique, ${bad.length} not-OK (informational)`;
  bad.slice(0, 10).forEach((b) => warns.push(b));
} else if (external.size) extMsg = `external links: ${external.size} unique (not checked)`;

console.log(`pages checked: ${pageInfo.size}   internal links: ${nLinks} (${nAnchors} with #fragment)   media refs: ${nMedia}`);
if (mapMsg) console.log(mapMsg);
if (extMsg) console.log(extMsg);
warns.forEach((w) => console.log('  warn ' + w));
const uniq = [...new Set(fails)];
uniq.slice(0, 40).forEach((f) => console.log('  FAIL ' + f));
if (uniq.length > 40) console.log(`  ... ${uniq.length - 40} more`);
console.log(uniq.length ? `FAIL: ${uniq.length} problem(s)` : 'PASS: all internal links, anchors and media resolve');
process.exit(uniq.length ? 1 : 0);
