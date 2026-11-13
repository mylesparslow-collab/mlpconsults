#!/usr/bin/env node
// Scroll-jank profiler: scrolls a page the way a user does and reports frame times plus
// where the time went (main thread vs raster/GPU), ending in a one-line verdict.
// Usage: node frame_perf.mjs <url-or-file> [--viewport 1440x900] [--selector-scroll body]
//                            [--passes wheel,scripted] [--trace out.json] [--no-trace]
//                            [--cpu 1] [--settle 4000]
// Passes: wheel    = 60 x 120px mouse-wheel steps, one every 16ms (a trackpad-ish scroll)
//         fast     = 400px wheel steps every 8ms down the whole scroll range (a hard flick)
//         scripted = scrollBy 14px per animation frame down the whole range (no input latency)
// --selector-scroll: CSS selector of the scrolling element; default `body` = the page itself.
// --cpu N: CPU throttling (e.g. 4) to expose problems a fast machine hides.
// With vsync off rAF can free-run (thousands of 'frames' at <1ms): judge by the >20/>33ms counts and max, not frame totals.
// Reports per pass: frames, >20ms, >33ms, max, p50, p95. Then, from one extra TRACED wheel
// pass (skip with --no-trace; the JSON trace is kept at --trace PATH for chrome://tracing /
// Perfetto), main-thread self time by category (Layout, Recalc Style, Paint, Scripting) and
// raster/GPU time. Verdict: clean | raster-bound | layout-bound | script-bound, with numbers.
//
// Lesson built in: real Chrome on a Mac can cap rAF at ~30Hz so every frame reads 33ms.
// We launch Chrome (channel 'chrome', else bundled Chromium) with GPU args plus
// --disable-frame-rate-limit --disable-gpu-vsync, and warn if frames still look capped.
// Cannot do: measure real-device/Safari performance, or input-to-photon latency; headless GPU
// numbers differ from a headed laptop - use --cpu 4 as a stress proxy for weaker machines.
// Needs Playwright (npm i -g playwright && npx playwright install chromium).
import { execSync } from 'child_process';
import { pathToFileURL } from 'url';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'fs';
import { homedir, tmpdir, platform } from 'os';
import { resolve, join } from 'path';

let chromium;
const candidates = () => {
  const out = [];
  try { out.push(execSync('npm root -g').toString().trim() + '/playwright'); } catch {}
  const npx = homedir() + '/.npm/_npx';
  if (existsSync(npx)) for (const d of readdirSync(npx)) out.push(`${npx}/${d}/node_modules/playwright`);
  return out.filter((d) => existsSync(d + '/index.mjs'));
};
try { ({ chromium } = await import('playwright')); }
catch {
  for (const dir of candidates()) {
    try { ({ chromium } = await import(pathToFileURL(dir + '/index.mjs').href)); break; } catch {}
  }
}
if (!chromium) { console.error('Playwright not found. Run: npx -y playwright install chromium  (or npm i -g playwright)'); process.exit(1); }

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const valueFlags = ['--viewport', '--selector-scroll', '--passes', '--trace', '--cpu', '--settle'];
const target = argv.find((a, i) => !a.startsWith('--') && !valueFlags.includes(argv[i - 1]));
if (!target) { console.log('usage: node frame_perf.mjs <url-or-file> [--viewport 1440x900] [--selector-scroll body] [--passes wheel,scripted] [--trace out.json] [--no-trace] [--cpu 1]'); process.exit(1); }
const url = /^https?:|^file:/.test(target) ? target : 'file://' + resolve(target);
const [VW, VH] = opt('--viewport', '1440x900').split('x').map(Number);
const SEL = opt('--selector-scroll', 'body');
const PASSES = opt('--passes', 'wheel,scripted').split(',').map((s) => s.trim()).filter(Boolean);
const CPU = +opt('--cpu', 1);
const SETTLE = +opt('--settle', 4000);
const TRACE_OUT = opt('--trace');
const DO_TRACE = !argv.includes('--no-trace');

const gpuArgs = ['--enable-gpu', '--ignore-gpu-blocklist', '--disable-frame-rate-limit', '--disable-gpu-vsync'];
if (platform() === 'darwin') gpuArgs.unshift('--use-angle=metal');
let browser, which = 'chrome';
try { browser = await chromium.launch({ channel: 'chrome', args: gpuArgs }); }
catch { which = 'bundled chromium (Chrome not installed)'; browser = await chromium.launch({ args: gpuArgs }); }

const ctx = await browser.newContext({ viewport: { width: VW, height: VH } });
const page = await ctx.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(SETTLE);
const cdp = await ctx.newCDPSession(page);
await cdp.send('Performance.enable');
if (CPU > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
const getM = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));

// scroll geometry for the chosen scroller
const geo = await page.evaluate((sel) => {
  const el = sel === 'body' || sel === 'html' ? null : document.querySelector(sel);
  if (sel !== 'body' && sel !== 'html' && !el) return { error: 'selector not found: ' + sel };
  const r = el ? el.getBoundingClientRect() : { left: 0, top: 0, width: innerWidth, height: innerHeight };
  const total = el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - innerHeight;
  return { total, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
}, SEL);
if (geo.error) { console.error(geo.error); await browser.close(); process.exit(1); }
if (geo.total < 200) { console.error(`FAIL: scroll range is only ${Math.round(geo.total)}px for "${SEL}" - nothing to profile (wrong --selector-scroll?)`); await browser.close(); process.exit(1); }

const resetScroll = async () => {
  await page.evaluate((sel) => { const el = sel === 'body' || sel === 'html' ? null : document.querySelector(sel); el ? (el.scrollTop = 0) : window.scrollTo(0, 0); }, SEL);
  await page.waitForTimeout(1200);
};
const startLogger = () => page.evaluate(() => { window.__f = []; let l = performance.now(); (function t(n) { window.__f.push(n - l); l = n; window.__r = requestAnimationFrame(t); })(l); });
const stopLogger = () => page.evaluate(() => { cancelAnimationFrame(window.__r); return window.__f.slice(2); });

async function runPass(name) {
  await resetScroll();
  await page.mouse.move(geo.cx, geo.cy);
  await startLogger();
  if (name === 'wheel') { for (let i = 0; i < 60; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(16); } }
  else if (name === 'fast') { const n = Math.min(120, Math.ceil(geo.total / 400)); for (let i = 0; i < n; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(8); } }
  else if (name === 'scripted') {
    await page.evaluate(([sel, total]) => new Promise((res) => {
      const el = sel === 'body' || sel === 'html' ? null : document.querySelector(sel);
      let y = 0; (function s() { y += 14; el ? (el.scrollTop = y) : window.scrollTo(0, y); y < total ? requestAnimationFrame(s) : res(); })();
    }), [SEL, geo.total]);
  } else throw new Error('unknown pass: ' + name);
  await page.waitForTimeout(500);
  return stopLogger();
}
const pct = (s, p) => s[Math.min(s.length - 1, Math.floor(s.length * p))];
function stats(f) {
  const s = [...f].sort((a, b) => a - b);
  return { frames: f.length, gt20: f.filter((x) => x > 20).length, gt33: f.filter((x) => x > 33).length, max: s[s.length - 1] || 0, p50: pct(s, 0.5) || 0, p95: pct(s, 0.95) || 0 };
}

console.log(`${target}  ${VW}x${VH}  scroller=${SEL} (${Math.round(geo.total)}px)  ${which}${CPU > 1 ? `  cpu x${CPU}` : ''}`);
console.log(`${'pass'.padEnd(9)} ${'frames'.padStart(6)} ${'>20ms'.padStart(6)} ${'>33ms'.padStart(6)} ${'max'.padStart(7)} ${'p50'.padStart(6)} ${'p95'.padStart(6)}   main-thread ms (task/script/layout/style)`);
const results = {};
for (const name of PASSES) {
  const m0 = await getM();
  const f = await runPass(name);
  const m1 = await getM();
  const d = (k) => Math.round((m1[k] - m0[k]) * 1000);
  const st = stats(f); results[name] = { ...st, task: d('TaskDuration'), script: d('ScriptDuration'), layout: d('LayoutDuration'), style: d('RecalcStyleDuration') };
  console.log(`${name.padEnd(9)} ${String(st.frames).padStart(6)} ${String(st.gt20).padStart(6)} ${String(st.gt33).padStart(6)} ${st.max.toFixed(1).padStart(7)} ${st.p50.toFixed(1).padStart(6)} ${st.p95.toFixed(1).padStart(6)}   ${results[name].task}/${results[name].script}/${results[name].layout}/${results[name].style}`);
}
const med = Object.values(results).map((r) => r.p50).sort((a, b) => a - b);
if (med.length && med[med.length >> 1] > 30 && med[med.length >> 1] < 36) console.log('  note: median frame ~33ms - rAF may be capped at 30Hz by the machine; the numbers below are suspect (try a different display/power state).');

// ---------- traced pass ----------
let tr = null;
if (DO_TRACE) {
  const tmp = mkdtempSync(join(tmpdir(), 'fp-'));
  const path = TRACE_OUT ? resolve(TRACE_OUT) : join(tmp, 'trace.json');
  await resetScroll(); await page.mouse.move(geo.cx, geo.cy);
  await browser.startTracing(page, { path, categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'cc', 'gpu', 'viz'] });
  const t0 = Date.now();
  await startLogger();
  for (let i = 0; i < 60; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(16); }
  await page.waitForTimeout(500);
  const wall = Date.now() - t0;
  await stopLogger();
  await browser.stopTracing();
  tr = summariseTrace(JSON.parse(readFileSync(path, 'utf8')), wall);
  rmSync(tmp, { recursive: true, force: true });
  console.log(`\ntraced wheel pass (${wall}ms wall${TRACE_OUT ? ', trace saved to ' + path : ''}):`);
  console.log(`  main thread self time  layout ${tr.layout}ms | recalc style ${tr.style}ms | paint ${tr.paint}ms | scripting ${tr.script}ms`);
  console.log(`  raster/GPU             raster tasks ${tr.raster}ms | GPU process tasks ${tr.gpu}ms`);
}
if (errs.length) console.log(`page errors: ${errs.length} (${errs[0].slice(0, 120)})`);
await browser.close();

// ---------- verdict ----------
const allBad = Object.values(results);
const frames = allBad.reduce((a, r) => a + r.frames, 0);
const slow20 = allBad.reduce((a, r) => a + r.gt20, 0), slow33 = allBad.reduce((a, r) => a + r.gt33, 0);
const worst = Math.max(...allBad.map((r) => r.max)), p95 = Math.max(...allBad.map((r) => r.p95));
const nums = `${slow20}/${frames} frames >20ms, ${slow33} >33ms, max ${worst.toFixed(0)}ms, worst p95 ${p95.toFixed(1)}ms`;
let verdict, why;
if (slow20 <= frames * 0.02 && slow33 <= frames * 0.005) { verdict = 'clean'; why = nums + (slow33 ? ' (isolated hitch, see max)' : ''); }
else if (tr) {
  const mainLayout = tr.layout + tr.style, scripts = tr.script, gpu = tr.raster + tr.gpu;
  const top = Math.max(mainLayout, scripts, gpu);
  if (top === gpu) { verdict = 'raster-bound'; why = `raster ${tr.raster}ms + GPU ${tr.gpu}ms vs layout+style ${mainLayout}ms, script ${scripts}ms; ${nums}`; }
  else if (top === mainLayout) { verdict = 'layout-bound'; why = `layout+style ${mainLayout}ms (${tr.layout} layout, ${tr.style} style) vs script ${scripts}ms, raster+GPU ${gpu}ms; ${nums}`; }
  else { verdict = 'script-bound'; why = `scripting ${scripts}ms vs layout+style ${mainLayout}ms, raster+GPU ${gpu}ms; ${nums}`; }
} else {
  const sum = (k) => allBad.reduce((a, r) => a + r[k], 0);
  const scr = sum('script'), lay = sum('layout') + sum('style'), task = sum('task');
  verdict = scr >= lay ? 'script-bound' : 'layout-bound';
  if (Math.max(scr, lay) < task * 0.25) verdict = 'raster-bound'; // main thread mostly busy elsewhere (paint/compositing)
  why = `no trace: script ${scr}ms, layout+style ${lay}ms of ${task}ms main-thread task time; ${nums}`;
}
console.log(`\nVERDICT: ${verdict} - ${why}`);
process.exit(verdict === 'clean' ? 0 : 1);

// ---------- trace analysis ----------
function summariseTrace(d, wall) {
  const ev = Array.isArray(d) ? d : d.traceEvents;
  const tname = {};
  for (const e of ev) if (e.name === 'thread_name') tname[`${e.pid}:${e.tid}`] = e.args.name;
  const byThread = {};
  for (const e of ev) if (e.ph === 'X' && e.dur != null) (byThread[`${e.pid}:${e.tid}`] ||= []).push(e);
  const LAYOUT = new Set(['Layout']), STYLE = new Set(['UpdateLayoutTree', 'RecalcStyle']);
  const PAINT = new Set(['Paint', 'PrePaint', 'Layerize', 'UpdateLayer', 'UpdateLayerTree', 'Commit']);
  const SCRIPT = new Set(['FunctionCall', 'EvaluateScript', 'FireAnimationFrame', 'v8.callFunction', 'TimerFire', 'EventDispatch', 'v8.run', 'RunMicrotasks', 'ScheduledAction::execute']);
  const out = { layout: 0, style: 0, paint: 0, script: 0, raster: 0, gpu: 0 };
  for (const [k, list] of Object.entries(byThread)) {
    const n = tname[k] || '';
    if (n === 'CrRendererMain') {
      // self time via a nesting sweep so FunctionCall inside FireAnimationFrame is not double counted
      list.sort((a, b) => a.ts - b.ts || b.dur - a.dur);
      const stack = [];
      const self = new Map();
      for (const e of list) {
        while (stack.length && stack[stack.length - 1].ts + stack[stack.length - 1].dur <= e.ts) stack.pop();
        if (stack.length) self.set(stack[stack.length - 1], (self.get(stack[stack.length - 1]) ?? stack[stack.length - 1].dur) - e.dur);
        stack.push(e);
      }
      for (const e of list) {
        const s = self.has(e) ? self.get(e) : e.dur;
        if (LAYOUT.has(e.name)) out.layout += s; else if (STYLE.has(e.name)) out.style += s;
        else if (PAINT.has(e.name)) out.paint += s; else if (SCRIPT.has(e.name)) out.script += s;
      }
    } else if (/^CompositorTileWorker/.test(n)) {
      for (const e of list) if (e.name === 'RasterTask') out.raster += e.dur;
    } else if (n === 'CrGpuMain') {
      for (const e of list) if (e.name === 'GPUTask') out.gpu += e.dur;
    }
  }
  for (const k of Object.keys(out)) out[k] = Math.round(out[k] / 1000);
  return out;
}
