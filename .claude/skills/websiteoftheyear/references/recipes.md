# Recipes: the moves that recur across 2020–2026 winners

Each recipe names the winners it comes from, then gives minimal working code. Versions below are pinned to releases older than two weeks (GSAP 3.12.5, Lenis 1.1.13, three 0.160.0). Check them before you ship.

## Contents
0. Pitfalls (read first)
1. Base stack: Lenis + GSAP ScrollTrigger
2. Loader as the first scene (counter, letter drop, sound gate)
3. Line-mask text reveal
4. Page transitions
5. DOM-synced WebGL (canvas follows the layout)
6. Cursor that disturbs the scene
7. Quality tiers, budgets, reduced motion
8. Canvas accessibility layer
9. Scroll-scrubbed image sequence
10. Sound
11. Three themes (light, dark from the system, an accent theme)
12. Sticky stacks that scroll smoothly

---

## 0. Pitfalls that cost a debug round (found in testing)
- **`gsap.set` then `.from` does nothing.** If you hide lines with `gsap.set(el,{yPercent:110})` and then call `.from(el,{yPercent:110})`, the "from" and "to" values are both 110. Use `.fromTo(el,{yPercent:110},{yPercent:0})`, or don't pre-set.
- **Never put a CSS `transition` on a property GSAP animates** (opacity, transform, clip-path). The transition fights GSAP's per-frame writes and the element sticks.
- **Content must exist without JS and under reduced motion.** Hide things for an entrance only from JS, and only when animating: add `document.documentElement.classList.add('anim')` at the top of the script, and scope initial hidden states to `.anim`. Under reduced motion, skip the loader, Lenis and the ticker, and render one settled frame of any canvas.
- **Fixed corner chrome collides with content** once the page scrolls under it. Use `mix-blend-mode:difference` with a light colour on the chrome, or give it a background strip, or fade the lower corners out after the hero with a ScrollTrigger. Check a mid-page screenshot, not just the hero.
- **Mobile hero:** if the hero art (canvas or stage) is hidden on small screens, close the gap. Either move the headline up or stack the art above it at a reduced height. Never leave the desktop's vertical spacing with nothing in it.
- **Labels on canvas art** (scene captions, hints) need a safe area or a backdrop; they will overlap the art at some sizes.
- **Pinned versions:** check the current release before shipping with `npm view gsap version`, `npm view lenis version` and `npm view three version`. Then pin a release that is at least two weeks old.

Found by an independent review of the mylesparslow.com redesign (Nov 2026). Each one shipped to a mockup before it was caught:
- **In-page jumps must move focus, not just scroll.** A skip link or a list item that calls `lenis.scrollTo()` leaves keyboard focus behind, so the next Tab jumps back up the page. After scrolling: `if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex','-1'); t.focus({preventScroll:true})`, and hide the outline on those targets only (`[tabindex="-1"]:focus{outline:none}`).
- **Lenis swallows wheel events on overlays.** `lenis.stop()` while a menu is open also stops the menu itself scrolling on short screens. Put `data-lenis-prevent` on every scrollable overlay (menu, modal, drawer), and give the overlay `overflow-y:auto; overscroll-behavior:contain; justify-content:safe center`.
- **A scramble or split-text effect must not touch accessible names.** Scrambling a focused link's text means screen readers announce gibberish. Give the control a fixed `aria-label`, put the animated text in an `aria-hidden` span, and trigger on `pointerenter` only, never `focus`. When splitting an h1 into letters, set its `aria-label` from the lines joined with spaces, or it reads "Myles Parslowmakes things".
- **Scroll reveals at the page bottom never fire.** A footer row with `start:'top 85%'` can't reach 85% because the page ends first, so its links stay translated away. Use `start:'clamp(top 85%)'` (ScrollTrigger 3.12+).
- **Toggling a stateful label while a scramble runs** loses the update. The running rAF overwrites "Close" with "Menu". `cancelAnimationFrame` before setting the new text.
- **Filtering a list must clear the old active item before resetting the pointer,** or two items stay `aria-current` and highlighted.
- **Loaders replay on Back and on every visit.** Skip the loader on `performance.getEntriesByType('navigation')[0].type === 'back_forward'` or a `sessionStorage` "seen" flag (in try/catch), and set `pointer-events:none` on the loader the moment its exit starts, not when it finishes.
- **Fixed bottom-corner labels over body text on phones.** On mobile, show them only at the very top (`scrollY < 24`), or move the context into the top bar (B's "Myles Parslow · Business" strip). Check 375 and 768 mid-scroll shots.
- **A frame shape that fights the images.** A portrait 3:4 frame cropped 16:10 screenshots badly. Match the frame's aspect to the content.
- **Pointer-driven image cuts read as random.** Zhenya's hard-cut-on-mouse-x slideshow felt broken on a portfolio hero. A slow crossfade (3.5s, paused on hover) with previous/next buttons and a counter read as deliberate.
- **Multi-page sites drop content outside the main blocks.** See `site-migration.md` §2, and run `scripts/parity.py`.

## 1. Base stack (Locomotive, OFF+BRAND/Lando, Malvah, Don't Board Me, Scout)
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
<script>
gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis = reduce ? null : new Lenis({ lerp: 0.1, smoothWheel: true });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
// house easings (from winners' CSS/bundles)
gsap.registerEase?.('expoOut', p => p === 1 ? 1 : 1 - Math.pow(2, -10 * p));
</script>
<style>
html.lenis,html.lenis body{height:auto}.lenis.lenis-smooth{scroll-behavior:auto!important}
:root{--ease-out:cubic-bezier(.19,1,.22,1);--ease-quart:cubic-bezier(.165,.84,.44,1);--ease-inout:cubic-bezier(.77,0,.175,1);--ease-lando:cubic-bezier(.65,.05,0,1)}
</style>
```

## 2. Loader as the first scene (KPR, Persepolis, Igloo, Mana, Malvah "Ma / 0 %", OFF+BRAND 5→100%, Lusion "000", Unseen gate)
Rules: it must show brand within 300ms, report real progress (not a fake timer), and hand off into the hero with one continuous move. The wordmark should *become* the hero rather than fade out.
```html
<div class="loader" aria-live="polite"><span class="loader__n">000</span></div>
<script>
const n = document.querySelector('.loader__n');
const assets = [...document.images].map(i => i.decode?.().catch(()=>{}) ?? Promise.resolve());
let done = 0; const total = assets.length + 1; // +1 for fonts
const tick = () => { done++; gsap.to(n, { textContent: Math.round(done/total*100), duration:.4, snap:{textContent:1}, onUpdate(){ n.textContent = String(Math.round(+n.textContent)).padStart(3,'0'); } }); };
assets.forEach(p => p.then(tick)); document.fonts.ready.then(tick);
Promise.all([...assets, document.fonts.ready]).then(() =>
  gsap.timeline()
    .to('.loader__n', { yPercent:-100, duration:.8, ease:'expo.in' })
    .to('.loader', { clipPath:'inset(0 0 100% 0)', duration:1.1, ease:'expo.inOut' }, '<.2')
    .from('.hero [data-line]', { yPercent:110, stagger:.08, duration:1.2, ease:'expo.out' }, '-=.5'));
</script>
<style>.loader{position:fixed;inset:0;z-index:99;display:grid;place-items:end start;padding:2vw;background:var(--ink);color:var(--paper);clip-path:inset(0)}
.loader__n{font:400 clamp(64px,14vw,220px)/.8 var(--display);overflow:hidden;display:block}</style>
```
**Sound gate (Unseen, Active Theory):** two buttons, "Enter" and "Enter without sound". This satisfies the browser autoplay policy, and the click is the user gesture that unlocks the AudioContext. Keep the gate under one screen, with the mascot or wordmark centred.

## 3. Line-mask text reveal (nearly every winner: Locomotive, Obys, Malvah, Lando)
Split by line, not by character, for body and headings. Character staggers only for one hero word.
```js
function splitLines(el){
  const words = el.textContent.trim().split(/\s+/); el.textContent = '';
  const spans = words.map(w => { const s = document.createElement('span'); s.textContent = w + ' '; s.style.display='inline-block'; el.append(s); return s; });
  const lines = []; let top = null;
  spans.forEach(s => { if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop; } lines.at(-1).push(s); });
  el.textContent = '';
  lines.forEach(ws => { const mask = document.createElement('span'); mask.className='mask'; const inner = document.createElement('span'); inner.dataset.line=''; inner.textContent = ws.map(s=>s.textContent).join(''); mask.append(inner); el.append(mask); });
}
document.querySelectorAll('[data-split]').forEach(el => {
  splitLines(el);
  gsap.from(el.querySelectorAll('[data-line]'), { yPercent:110, duration:1.1, stagger:.07, ease:'expo.out', scrollTrigger:{ trigger:el, start:'top 85%' } });
});
// CSS: .mask{display:block;overflow:hidden} .mask>span{display:block}
```
Re-split on resize (debounced), or use GSAP SplitText if licensed. It's now free in GSAP 3.13+, so check the version.

## 4. Page transitions (Locomotive/Barba, Lando/Taxi, Nuxt winners)
In a multi-page static site, use the View Transitions API first: no library, and it degrades to normal navigation.
```css
@view-transition { navigation: auto; }
::view-transition-old(root){animation:.6s var(--ease-inout) both vt-out}
::view-transition-new(root){animation:.9s var(--ease-out) both vt-in}
@keyframes vt-out{to{clip-path:inset(0 0 100% 0);opacity:.6}}
@keyframes vt-in{from{clip-path:inset(100% 0 0 0)}}
.project-thumb{view-transition-name:var(--vtn)} /* shared-element: thumb → case hero */
```
For an SPA or a single-file artifact, swap sections with a GSAP clip-path wipe and keep the URL in sync with `history.pushState`.

## 5. DOM-synced WebGL (Lusion v3 recreation, Noomo, Locomotive image hovers)
DOM decides layout; the canvas follows it. One fixed full-screen canvas; each `[data-gl]` image gets a plane sized and positioned from `getBoundingClientRect()` every frame (cheap) or on scroll/resize.
```js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, tier.dpr)); // see §7
document.body.prepend(renderer.domElement); Object.assign(renderer.domElement.style,{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'});
const scene = new THREE.Scene();
const cam = new THREE.OrthographicCamera(0, innerWidth, 0, -innerHeight, -1000, 1000); // pixel units, y down
const planes = [...document.querySelectorAll('[data-gl]')].map(img => {
  const tex = new THREE.TextureLoader().load(img.currentSrc || img.src);
  const mat = new THREE.ShaderMaterial({ uniforms:{ uTex:{value:tex}, uHover:{value:0}, uTime:{value:0} }, transparent:true,
    vertexShader:`varying vec2 vUv;uniform float uHover;void main(){vUv=uv;vec3 p=position;p.z+=sin(uv.x*3.14)*uHover*20.;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader:`varying vec2 vUv;uniform sampler2D uTex;uniform float uHover;void main(){vec2 uv=vUv;uv.x+=sin(uv.y*10.)*.01*uHover;gl_FragColor=texture2D(uTex,uv);}` });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1,1,16,16), mat); scene.add(m);
  img.style.opacity = 0; // DOM keeps layout + alt text; GL draws it
  img.addEventListener('pointerenter',()=>gsap.to(mat.uniforms.uHover,{value:1,duration:.8,ease:'expo.out'}));
  img.addEventListener('pointerleave',()=>gsap.to(mat.uniforms.uHover,{value:0,duration:.8,ease:'expo.out'}));
  return { img, m };
});
gsap.ticker.add(() => {
  planes.forEach(({img,m}) => { const r = img.getBoundingClientRect(); m.scale.set(r.width, r.height, 1); m.position.set(r.left + r.width/2, -(r.top + r.height/2), 0); });
  renderer.render(scene, cam);
});
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); Object.assign(cam,{right:innerWidth,bottom:-innerHeight}); cam.updateProjectionMatrix(); });
renderer.setSize(innerWidth, innerHeight);
```
If WebGL fails, set the images back to `opacity:1`, so the site still works as plain DOM.

## 6. Cursor that disturbs the scene (Lusion, Active Theory MouseFluid, Lando blob masks)
A dot that trails the pointer is 2019. Current winners make the pointer *act on* something:
- **Post-process displacement** on the GL layer only (HTML stays crisp): render the scene to a target, then apply a full-screen pass that offsets UVs by a decaying trail texture written at the mouse position.
- **Blob mask over a hero image** (Lando): an SVG `<mask>` with a few circles following the pointer with different lerps, plus `feGaussianBlur` + `feColorMatrix` "gooey" threshold. No WebGL needed.
- Frame-rate-normalised follow, so 120Hz screens feel the same: `x += (tx - x) * (1 - Math.pow(1 - 0.12, dt*60))`.
- Touch devices have no hover: switch to scroll-velocity or device-tilt as the driver.

## 7. Quality tiers, budgets, reduced motion (Active Theory, Noomo, Lusion, Igloo, Messenger)
```js
const gl = document.createElement('canvas').getContext('webgl2');
const cores = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4;
const mobile = matchMedia('(pointer:coarse)').matches;
const tier = !gl ? {gl:false} : (mobile || cores <= 4 || mem <= 4) ? {gl:true,dpr:1.25,particles:2e3,post:false} : {gl:true,dpr:2,particles:2e4,post:true};
```
- Budgets winners actually shipped: Kode 7.6MB (2020); Messenger 5.7MB initial / 17.5MB total (2025); Lusion 2019 cloth 246KB mobile vs 983KB desktop. Target ≤ 3MB before first interaction for a portfolio.
- Compress geometry with Draco/meshopt and textures with KTX2/Basis (via `gltf-transform optimize`). Bake lighting, AO and cloth/fluids offline; ship data, not simulations.
- Compile shaders and upload textures after first paint (`requestIdleCallback`); keep only one heavy scene rendering per frame.
- `prefers-reduced-motion`: keep the layout and the content, drop smooth scroll, parallax and auto camera moves; crossfade instead of slide.

## 8. Canvas accessibility layer (Bizarro, Active Theory `.GLA11y`)
Juries score accessibility lowest for every SOTY (5.8–7.6). This is the cheap way to beat the field:
- Real `<h1>`, nav and project links in the DOM even when the canvas draws everything. Visually hide them with `clip-path:inset(50%)`, never `display:none`, and reveal them on `:focus-within`.
- Keyboard: arrow keys and Tab move the same `--active` index the canvas reads.
- Every canvas-only control (sound, drag-to-explore) also gets a DOM button with a label.

## 9. Scroll-scrubbed image sequence (Scout Motors "Sequence/Treadmill", Opal hand flip, product winners)
```js
const frames = 120, imgs = [], c = document.querySelector('#seq'), ctx = c.getContext('2d');
for (let i = 0; i < frames; i++) { const im = new Image(); im.src = `/seq/${String(i).padStart(4,'0')}.webp`; imgs.push(im); }
const state = { f: 0 };
const draw = () => { const im = imgs[Math.round(state.f)]; if (im?.complete) { c.width = c.clientWidth*devicePixelRatio; c.height = c.clientHeight*devicePixelRatio; const s = Math.max(c.width/im.width, c.height/im.height); ctx.drawImage(im, (c.width-im.width*s)/2, (c.height-im.height*s)/2, im.width*s, im.height*s); } };
gsap.to(state, { f: frames-1, ease:'none', onUpdate:draw, scrollTrigger:{ trigger:'.seq-wrap', start:'top top', end:'+=300%', scrub:.5, pin:true } });
imgs[0].onload = draw;
```
Export the sequence at 1600px webp, quality around 70. Serve half the frames on mobile.

## 10. Sound (narrative winners: Persepolis, Dark, Igloo, Noomo, Messenger, Unseen, Active Theory)
- Off by default unless the user goes through a gate; a persistent, labelled toggle sits in a corner.
- Use sound in three layers: an ambient bed, UI ticks on hover and click (quiet, under 80ms), and stingers on scene changes. Duck the bed during transitions.
- Commerce winners skip sound entirely. Do the same unless the brief is a story.
- Use real recorded sounds (see the `bbc-sfx` skill), never synth beeps.

## 11. Three themes (mylesparslow.com "five rooms", Nov 2026)
Light, dark and one accent theme (red), shipped on a live site. The user asked for dark mode twice, so offer it by default on editorial builds.
- **Default follows the system.** With no saved choice, `prefers-color-scheme` decides. A toggle cycles Light → Dark → Accent; its label names the current theme ("In dark") and its `aria-label` names current and next. Save with `localStorage` in try/catch.
- **No flash.** Set the theme in `<head>` before the CSS loads:
```html
<script>(function(){var t=null;try{t=localStorage.getItem('site-theme')}catch(e){}
if(!/^(light|dark|red)$/.test(t||''))t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
document.documentElement.setAttribute('data-theme',t);})();</script>
```
- **Tokens, not inversion.** Define every colour on `:root`, then redefine under `[data-theme="dark"]` and `[data-theme="red"]`. Design the dark palette: ground near `#141312`, warm paper text `#ebe5da`, accent lifted from `#f23c0d` to `#ff5a30` so it passes on dark (5.97:1). Section grounds keep their hue at low lightness (pink → `#432a26`, sage → `#2a3426`, butter → `#403718`, sky → `#26303f`, lilac → `#322a43`).
- **CSS fallback for no JS:** `@media (prefers-color-scheme: dark){:root:not([data-theme]){…dark tokens…}}`.
- **Check contrast in every theme and record it.** Compute every text/ground pair (96 on this site) and keep the table in the project's notes. The accent theme is where it fails: a bright red ground (`#f23c0d`) gives only 3.09:1 for paper body text, so the red theme uses a deeper ground (`#bf2400`, 4.83:1), full paper (not tinted) for muted text, and the room's own foreground on chips.
- **Update `<meta name="theme-color">`** when the theme changes.
- **If the page is also published as a Claude Artifact,** the host sets its own `data-theme` (light/dark) on the root. Only ever set your own values and treat unknown values as "follow the system", so the two don't fight.

## 12. Sticky stacks that scroll smoothly
A stack of sticky, rounded, image-heavy cards that scale down and dim as the next arrives (Pangram's pattern) felt laggy on the live site. `scripts/frame_perf.mjs` showed why: the trouble was raster, not layout. Chrome re-rasterised each whole card on every frame of the scale scrub, at about 2.3ms of raster per frame, with 11 frames over 20ms and a 69ms worst frame. Layout, the chrome-strip CSS-variable writes and `getBoundingClientRect` reads were all small.
- **Fix:** give each card a stable compositor layer only where the scrub runs:
```css
@media (min-width:901px) and (prefers-reduced-motion:no-preference){
  .js .card{will-change:transform} .js .card__shade{will-change:opacity}
}
```
  That took raster from about 590ms to 39ms per pass, frames over 20ms from 11 to 0, and the worst frame from 69ms to 19ms. Text can look slightly softer mid-scale, and is crisp at rest.
- **Decode thumbnails before the user scrolls into them:** on `load` plus about 1.5s, set `loading='eager'` and call `img.decode()` on the stack's images, so decoding doesn't land mid-scroll.
- **Removing the radius made raster worse** (1263ms), so don't trade design for speed blindly. Measure first.
- **Measure on uncapped frames.** Some Macs cap rAF at about 30Hz in automation, so every frame reads 33ms. Launch Chrome with `--disable-frame-rate-limit --disable-gpu-vsync` and judge by raster time and frames over 20ms. `frame_perf.mjs` does this.
- If it still feels floaty after the frames are clean, that's Lenis `lerp` latency, not jank: 0.1 to 0.14–0.18 tightens it.
