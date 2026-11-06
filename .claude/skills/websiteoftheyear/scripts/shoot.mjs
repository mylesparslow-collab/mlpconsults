// Headless check of a built page: screenshots at desktop + mobile (hero, mid-scroll,
// deeper), reduced-motion pass, console/page errors, horizontal overflow.
// Usage: node shoot.mjs <file-or-url> <out-dir>
// Needs Playwright (npm i -g playwright && npx playwright install chromium).
import { execSync } from 'child_process';
import { pathToFileURL } from 'url';
let chromium;
// Find Playwright: local install, then global npm, then the npx cache. ESM ignores NODE_PATH.
import { existsSync, readdirSync } from 'fs';
import { homedir } from 'os';
const candidates = () => {
  const out = [];
  try { out.push(execSync('npm root -g').toString().trim() + '/playwright'); } catch {}
  const npx = homedir() + '/.npm/_npx';
  if (existsSync(npx)) for (const d of readdirSync(npx)) out.push(`${npx}/${d}/node_modules/playwright`);
  return out.filter(d => existsSync(d + '/index.mjs'));
};
try { ({ chromium } = await import('playwright')); }
catch {
  for (const dir of candidates()) {
    try { ({ chromium } = await import(pathToFileURL(dir + '/index.mjs').href)); break; } catch {}
  }
}
if (!chromium) { console.error('Playwright not found. Run: npx -y playwright install chromium  (or npm i -g playwright)'); process.exit(1); }
import { mkdirSync } from 'fs';
import { resolve } from 'path';
const [target, out = './shots'] = process.argv.slice(2);
if (!target) { console.log('usage: node shoot.mjs <file-or-url> <out-dir>'); process.exit(1); }
const url = /^https?:/.test(target) ? target : 'file://' + resolve(target);
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const runs = [[1440, 900, 'desk', 'no-preference'], [375, 812, 'mob', 'no-preference'], [1440, 900, 'reduced', 'reduce']];
for (const [w, h, tag, motion] of runs) {
  const p = await b.newPage({ viewport: { width: w, height: h }, reducedMotion: motion });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(4500);           // let the loader finish
  await p.screenshot({ path: `${out}/${tag}-1-hero.png` });
  await p.mouse.move(w * 0.3, h * 0.5);
  for (const n of [2, 3]) { await p.mouse.wheel(0, h * 1.5); await p.waitForTimeout(1800); await p.screenshot({ path: `${out}/${tag}-${n}-scroll.png` }); }
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`${tag}: errors=${errs.length}${errs.length ? ' ' + errs.slice(0, 3).join(' | ') : ''} overflowX=${overflow}px`);
  await p.close();
}
await b.close();
console.log(`screenshots in ${out}: look at every one, especially the mid-scroll ones (fixed chrome collisions) and mob-1 (empty hero space).`);
