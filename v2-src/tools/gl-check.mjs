// Smoke check for the v3 WebGL pages on the real GPU (headless Chromium, ANGLE Metal).
//   node v2-src/tools/gl-check.mjs scene|home|home-noscene|inner [--base http://127.0.0.1:8872] [--prefix /v3] [--out v3-src/shots]
// --prefix '' checks a promoted build served at the root; there the HubSpot tracker is answered with an empty script.
// For each page: loads it at 1440x900 and 390x844, fails on console/page errors, failed requests or
// horizontal overflow, measures frames over 2 s, prints window.__scene.info() if present, and saves
// screenshots to v3-src/shots/. Exit 0 = pass, 1 = fail.
import { chromium } from '/Users/mylesparslow/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const args = process.argv.slice(2);
const mode = args[0] || 'home';
const base = args.includes('--base') ? args[args.indexOf('--base') + 1] : 'http://127.0.0.1:8872';
const opt = (n, d) => args.includes(n) ? args[args.indexOf(n) + 1] : d;
const pre = opt('--prefix', '/v3'), out = opt('--out', 'v3-src/shots');
const pages = {
  scene: [['scene', '/v3-src/scene-test.html']],
  home: [['home', pre + '/']],
  'home-noscene': [['home-noscene', pre + '/?scene=off']],
  inner: [['how', pre + '/how-it-works/'], ['workflows', pre + '/workflows/'], ['referrals', pre + '/referrals/'], ['privacy', pre + '/privacy/']],
}[mode];
if (!pages) { console.log('usage: gl-check.mjs scene|home|inner'); process.exit(1); }
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-webgl'] });
let bad = 0;
for (const [name, path] of pages) {
  for (const [w, h, dpr, tag] of [[1440, 900, 1, 'desk'], [390, 844, 2, 'mob']]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
    const errs = [];
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    p.on('requestfailed', r => errs.push('requestfailed: ' + r.url()));
    p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
    await p.route(/hs-scripts\.com|hs-analytics|hs-banner|hscollectedforms/, r => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
    await p.goto(base + path, { waitUntil: 'load' });
    await p.waitForTimeout(2500);
    const r = await p.evaluate(async () => {
      const frames = await new Promise(res => { let n = 0; const t0 = performance.now(); (function f() { n++; performance.now() - t0 < 2000 ? requestAnimationFrame(f) : res(n); })(); });
      const c = document.querySelector('canvas');
      let gl = null; try { const x = document.createElement('canvas').getContext('webgl2'); const e = x && x.getExtension('WEBGL_debug_renderer_info'); gl = x ? (e ? x.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'webgl2') : null; } catch (e) {}
      return { fps: Math.round(frames / 2), overflow: document.documentElement.scrollWidth - innerWidth, canvas: c ? [c.width, c.height] : null, gpu: gl,
        info: window.__scene && window.__scene.info ? window.__scene.info() : null, h: document.documentElement.scrollHeight };
    });
    await p.screenshot({ path: `${out}/${name}-${tag}-0.png` });
    // scroll through in 5 steps for mid-page shots (pages drive the scene from scroll)
    for (let i = 1; i <= 5; i++) { await p.evaluate(([i, H]) => scrollTo(0, (H - innerHeight) * i / 5), [i, r.h]); await p.waitForTimeout(900); await p.screenshot({ path: `${out}/${name}-${tag}-${i}.png` }); }
    const fail = errs.length || r.overflow > 0;
    if (fail) bad++;
    console.log(`${fail ? 'FAIL' : 'ok  '} ${name} ${tag} fps=${r.fps} overflow=${r.overflow} canvas=${JSON.stringify(r.canvas)} gpu=${r.gpu} info=${JSON.stringify(r.info)}`);
    errs.slice(0, 8).forEach(e => console.log('     ' + e));
    await p.close();
  }
}
await b.close();
console.log(bad ? `FAIL: ${bad} page run(s) with problems` : 'PASS');
process.exit(bad ? 1 : 0);
