// Screenshot a page on the real GPU (headless Chromium, ANGLE Metal).
//   node v2-src/tools/gl-snap.mjs <url> <out.png> [w] [h] [dpr] [--wait ms] [--y px] [--eval js]
import { chromium } from '/Users/mylesparslow/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const a = process.argv.slice(2);
const flag = (n, d) => { const i = a.indexOf(n); if (i < 0) return d; const v = a[i + 1]; a.splice(i, 2); return v; };
const wait = +flag('--wait', 3000), y = +flag('--y', 0), ev = flag('--eval', '');
const [url, out, w = 1440, h = 900, dpr = 1] = a;
const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-webgl'] });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dpr });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(url, { waitUntil: 'load' });
if (y) await p.evaluate(v => scrollTo(0, v), y);
if (ev) { const r = await p.evaluate(ev); if (r !== undefined) console.log(JSON.stringify(r)); }
await p.waitForTimeout(wait);
await p.screenshot({ path: out });
if (errs.length) console.log('ERRORS', errs);
await b.close();
