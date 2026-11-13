// Record a site in motion for frame-by-frame analysis.
// Usage: node record-motion.mjs <out-dir> <name> <url> [--no-click]
// Output: <out-dir>/<name>.webm, <name>.json (action timeline, ms from page start),
//         <name>-sheet-N.jpg (contact sheets, 2 fps, 16 cells = 8 s each) via ffmpeg.
// Sequence: load → wait for loader → idle 3s → cursor sweep → hover first 6 links →
//           slow wheel scroll ~10 screens → scroll back up a bit → click a project link (page transition).
import { existsSync, readdirSync, mkdirSync, writeFileSync, renameSync } from 'fs';
import { homedir } from 'os';
import { execSync, execFileSync } from 'child_process';
import { pathToFileURL } from 'url';

let chromium;
try { ({ chromium } = await import('playwright')); } catch {
  const dirs = [];
  try { dirs.push(execSync('npm root -g').toString().trim() + '/playwright'); } catch {}
  const npx = homedir() + '/.npm/_npx';
  if (existsSync(npx)) for (const d of readdirSync(npx)) dirs.push(`${npx}/${d}/node_modules/playwright`);
  for (const d of dirs.filter(d => existsSync(d + '/index.mjs'))) { try { ({ chromium } = await import(pathToFileURL(d + '/index.mjs').href)); break; } catch {} }
}
if (!chromium) { console.error('Playwright not found: npx -y playwright install chromium'); process.exit(1); }

const [out, name, url, flag] = process.argv.slice(2);
if (!url) { console.log('usage: node record-motion.mjs <out-dir> <name> <url> [--no-click]'); process.exit(1); }
mkdirSync(out, { recursive: true });
const W = 1440, H = 900;
const chromeApp = '/Applications/Google Chrome.app';
// Real Chrome (H.264 + GPU) when installed; Playwright's Chromium otherwise. No UA spoofing: sites behind bot checks are reported, not bypassed.
const b = await chromium.launch({ ...(existsSync(chromeApp) ? { channel: 'chrome' } : {}), args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: out, size: { width: W, height: H } } });
const p = await ctx.newPage();
const t0 = Date.now(); const log = []; const mark = (a, extra = {}) => log.push({ t: Date.now() - t0, a, ...extra });
const wait = ms => p.waitForTimeout(ms);
// Watchdog: a frozen page (heavy canvas, stuck hover/click) must not block the run.
let timedOut = false;
const cap = new Promise(res => setTimeout(() => { timedOut = true; res(); }, 120000));
const session = (async () => {
try {
  mark('goto'); await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => mark('goto-error', { e: e.message }));
  await wait(9000); mark('loader-wait-done');
  // dismiss obvious cookie banners / enter gates without accepting tracking where possible
  for (const label of ['Enter without audio', 'Enter', 'Reject', 'Decline', 'Accept necessary', 'Only necessary', 'Close']) {
    const el = p.getByRole('button', { name: label, exact: false }).first();
    if (await el.isVisible().catch(() => false)) { await el.click({ timeout: 2000 }).catch(() => {}); mark('click-gate', { label }); await wait(2500); break; }
  }
  mark('idle'); await wait(3000);
  mark('cursor-sweep');
  for (let i = 0; i <= 30; i++) { await p.mouse.move(200 + i * 35, 300 + Math.sin(i / 4) * 200); await wait(40); }
  for (let i = 0; i <= 30; i++) { await p.mouse.move(1250 - i * 30, 650 - i * 12); await wait(40); }
  await wait(800);
  const links = await p.locator('a:visible, button:visible').all();
  let hovered = 0;
  for (const l of links.slice(0, 20)) {
    if (hovered >= 6) break;
    const bb = await l.boundingBox().catch(() => null);
    if (!bb || bb.y < 0 || bb.y > H || bb.width < 20) continue;
    mark('hover', { text: (await l.innerText().catch(() => '')).trim().slice(0, 30), x: Math.round(bb.x), y: Math.round(bb.y) });
    await l.hover({ timeout: 1500 }).catch(() => {}); await wait(1100); hovered++;
  }
  await p.mouse.move(W / 2, H / 2);
  mark('scroll-down');
  for (let i = 0; i < 45; i++) { await p.mouse.wheel(0, 200); await wait(260); }
  await wait(1500); mark('scroll-up');
  for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, -200); await wait(260); }
  await wait(1500);
  if (flag !== '--no-click') {
    const host = new URL(url).host;
    const cand = await p.locator(`a[href*="/work/"], a[href*="/project"], a[href*="/case"], a[href*="/cases/"], a[href^="/"]:not([href="/"]):visible`).all();
    for (const c of cand.slice(0, 12)) {
      const href = await c.getAttribute('href').catch(() => null);
      const bb = await c.boundingBox().catch(() => null);
      if (!href || !bb || href.startsWith('#') || /mailto|tel:/.test(href)) continue;
      if (/^https?:/.test(href) && !href.includes(host)) continue;
      if (bb.y < 0 || bb.y > H) { await c.scrollIntoViewIfNeeded().catch(() => {}); await wait(800); }
      mark('click-link', { href }); await c.click({ timeout: 3000 }).catch(e => mark('click-error', { e: e.message.slice(0, 60) }));
      await wait(5500); mark('after-click', { url: p.url() }); break;
    }
  }
  const blocked = await p.evaluate(() => /verify you are human|checking your browser|just a moment/i.test(document.body?.innerText || '')).catch(() => false);
  if (blocked) mark('bot-check-page');
  mark('end');
} catch (e) { mark('error', { e: e.message.slice(0, 120) }); }
})();
await Promise.race([session, cap]);
if (timedOut) mark('watchdog-timeout');
const video = p.video();
await Promise.race([ctx.close(), new Promise(r => setTimeout(r, 15000))]);
await b.close().catch(() => {});
const vpath = await video.path();
const dest = `${out}/${name}.webm`; renameSync(vpath, dest);
writeFileSync(`${out}/${name}.json`, JSON.stringify({ url, viewport: [W, H], log }, null, 1));
// contact sheets: 2 fps, 480px frames, 4x4 grid read left→right, top→bottom.
// Cell k (0-15) of sheet N (1-based) is at t = ((N-1)*16 + k) / 2 seconds from video start (≈ the 'goto' mark).
try {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', dest, '-vf',
    "fps=2,scale=480:-1,tile=4x4:padding=4:color=red",
    '-q:v', '4', `${out}/${name}-sheet-%02d.jpg`]);
} catch (e) { console.error('ffmpeg failed', e.message); }
console.log(name, 'done', log.length, 'actions', log.find(l => l.a === 'error')?.e || '');
