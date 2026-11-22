// node snap.mjs <url> <out.png> [w] [h] [dpr] [--full] [--scheme dark|light] [--y N] [--eval "js"] [--wait ms]
import { chromium } from '/Users/mylesparslow/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const a = process.argv.slice(2);
const flag = (n, d) => { const i = a.indexOf(n); if (i < 0) return d; const v = a[i + 1]; a.splice(i, 2); return v; };
const has = n => { const i = a.indexOf(n); if (i < 0) return false; a.splice(i, 1); return true; };
const full = has('--full'), scheme = flag('--scheme', 'light'), y = +flag('--y', 0), ev = flag('--eval', ''), wait = +flag('--wait', 600), reduce = has('--reduce');
const [url, out, w = 1440, h = 900, dpr = 1] = a;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dpr, colorScheme: scheme, reducedMotion: reduce ? 'reduce' : 'no-preference' });
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(url, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
if (ev) { const r = await p.evaluate(ev); if (r !== undefined) console.log(JSON.stringify(r)); }
if (y) await p.evaluate(v => scrollTo(0, v), y);
await p.waitForTimeout(wait);
await p.screenshot({ path: out, fullPage: full });
if (errs.length) console.log('ERRORS', errs);
await b.close();
