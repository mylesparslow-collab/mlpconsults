# Motion & effects catalogue

Measured from screen recordings of 32 winning and agency sites (2026-11-05, 1440×900, real Chrome with GPU, `scripts/record-motion.mjs`), broken down frame by frame at 10–12 fps, so timings are good to about ±100 ms. Raw per-site notes are in `motion-notes/`. About a third of the recordings never got past a loader or entry gate (Resn, Igloo, Noomo, Aristide, Pioneer, Persepolis, Don't Board Me); those entries come from the case studies in `soty-teardowns.md` instead.

For naming effects, use the `animation-vocabulary` skill. For a larger effect library with parameters, use `awesome-ai-motion`; for WebGL transitions, use `gl-transitions`.

## Contents
1. The grammar (numbers to build with)
2. Loaders and loader exits
3. Text reveals
4. Hovers
5. Cursor
6. Scroll
7. Page transitions
8. Ambient motion
9. What separates the best motion
10. Code for the signature moves

---

## 1. The grammar

| Thing | Measured range | Use |
|---|---|---|
| Hover feedback | 150–300 ms (colour under 150 ms; fills and scrambles about 300 ms) | 200 ms colour, 300 ms roll/scramble |
| Element reveal (line, card, image) | 400–900 ms | 700–900 ms |
| Hero / scene reveal | 1.0–2.5 s | 1.2 s |
| Loader exit (graphic mask) | 350–500 ms | 450 ms |
| Loader exit (scene-based) | 0.8–1.5 s | 1.1 s |
| Page transition | about 0.3 s cover out, 0.5–1.2 s arrival | 0.35 s out / 1.0 s in |
| Stagger per character | 20–40 ms (random order); 70–80 ms for a typewriter | 30 ms, random order |
| Stagger per word | 60–80 ms | 70 ms |
| Stagger per line | 60–150 ms | 90 ms |
| Stagger per grid item | 50–100 ms | 70 ms |
| Stagger per big object | 300–400 ms | rare |
| Smooth-scroll lag | lerp 0.08–0.12 (0.3–0.5 s trailing) | Lenis `lerp:0.1` |
| Cursor follow lag | lerp 0.08–0.15 (0.1–0.5 s) | 0.12, frame-rate normalised |
| Parallax ratio | 0.85 / 1.0 / 1.2 columns; 1.3–2× on cut-outs | subtle: 0.9–1.15 |

**Easing shapes:**
- Reveals, scale-ups, dot pops and covers use **expo-out or quart-out** (fast start, long settle): `cubic-bezier(.19,1,.22,1)` or `(.165,.84,.44,1)`.
- Wipes, curtains, brush masks and scene morphs use **in-out** (slow-fast-slow): `(.77,0,.175,1)`.
- Fades and cross-dissolves are linear or sine.
- Overshoot appears only on playful brand moments (Mana's can toss, OFF+BRAND's dot pop, Messenger's logotype). There is no elastic anywhere else.
- **Hard cuts (0 ms)** are a deliberate effect, not a missing animation: Zhenya's pointer slideshow, Merci-Michel's scroll scenes.

**Rhythm rule:** exits are short and entrances are long (about 0.3 s out, about 1 s in). Uniform 0.6 s on everything reads as a template.

## 2. Loaders and loader exits

The strongest loaders don't fade out; they **turn into** the first scene.

| Pattern | Seen on | Timing | Notes |
|---|---|---|---|
| **Brand-shape mask exit** | Lando (slanted "4" grows from a point to fill the screen), Merci-Michel (stepped pixel logotype erases), Zhenya (circles scatter and grow into a blob mask) | 0.4 s expo-out (Lando); 1–1.2 s (blob) | The best general pattern: the mask is the logo. |
| **Mark becomes the actor** | OFF+BRAND: a "+" draws stem → bar → swell, collapses to a dot in 0.4 s, and the dot pops to 3× and becomes the persistent WebGL sphere | draw 2 s, collapse 0.4 s | One continuous object from loader to scroll. |
| **Viewfinder loader** | Obys: an image sequence flickers inside a bracketed square, then black flips to white in 0.4 s and the square becomes the column frame | flicker about 80 ms per image | Matches the index pattern. |
| **Flood wipe in brand colour** | Mana (about 12 circles bloom from random points), Buttermax (halftone dot grid from centre with RGB fringe), Mr. Pops (curved-top curtain rises and flattens), Hello Monday (liquid wavy-edge blob retreats) | 0.5–1.2 s, in-out | Four ways to cover the screen with one colour. |
| **Brush/ink mask** | abeto: a ragged brush mask grows from the centre to reveal the scene | 2.2 s slow-fast-slow | Use an SVG turbulence-displaced circle or a mask texture. |
| **Scramble copy** | Locomotive: loader copy resolves glyph by glyph | about 3 s total | Same scramble reused on hovers and list rows. |
| **Typed, colour-cycling** | Mana: letters type at about 75 ms, each flashes pastel colours then settles to ink | 75 ms per letter | Playful brands only. |
| **Counter** | Immersive Garden, Aristide, Lusion, Pioneer, Persepolis, Synchronized, Malvah | stepped, real progress | Weakest when it stalls; always cap it (4 s) and fail safe. |
| **Gate** | Unseen (Enter / without audio), Malvah (Enter Site), Don't Board Me (bounce a ball to enter) | n/a | A gate must have a skip and must not hide content from crawlers. |

**A risk the recordings exposed:** a third of the winners sat on a loader for over 30 s on a fast connection and never showed a juror anything. Cap loader holds (we use 4 s), show content behind it as soon as it's ready, and never block on a video or a 3D scene the first screen doesn't need.

## 3. Text reveals

| Pattern | Seen on | Timing |
|---|---|---|
| **Random-order letter pop-in** | OFF+BRAND headlines, Messenger logotype | 30 ms per char in shuffled order, each 200–300 ms expo-out from scale .6 or y+40% |
| **Scramble text** (glyphs cycle to the final letter) | Locomotive (loader, nav, list rows on enter), Echo (exit), Aristide counters | 300 ms on hover, 600–900 ms on enter |
| **Line mask slide-up** | Mr. Pops, Lando, Zhenya, most others | 600–900 ms per line, 90–150 ms stagger, expo-out |
| **Soft gradient-mask wipe** | Opal, Echo | 500–800 ms, left→right or top→bottom, mask-image gradient |
| **Per-letter colour cycle** | Mana | 75 ms per letter |
| **Glitch-block dissolve** | Echo ("E.C.H.O."), Buttermax console | about 1 s |
| **Physics letters** | The Other Side of Truth: giant letters drop under gravity and land with a tiny rebound | 350 ms apart |

Rule observed across the best sites: **jitter beats uniformity.** Random order and slightly varied durations read as alive; a perfect left-to-right stagger reads as a template.

## 4. Hovers

Hovers on winning sites are restrained, and the recordings caught fewer than expected.
- **Scramble + underline draw** (Locomotive nav): about 300 ms.
- **Text roll**, two stacked spans (Unseen menu): 400–500 ms expo-out.
- **Colour swap to accent** (Pangram nav, Zhenya "Work"): under 150 ms.
- **Soft pill background fade** (Scout nav): about 200 ms.
- **Fill rising inside a round button** (Persepolis): 500–700 ms.
- **Pixel-mosaic preview** that sharpens from blocks (Bizarro project hover): 400–600 ms, stepped.
- **Arrow nudge** on CTA links (OFF+BRAND): 4–6 px, 250 ms.
- Not observed: magnetic buttons, image-trail-on-hover, big scale-ups. These are 2019–21 tropes the current winners have dropped.

## 5. Cursor

The winners put the cursor *into* the scene, not on top of it:
- OFF+BRAND's sphere dents under the pointer.
- Active Theory's glass ring tilts and leaves pixel trails.
- Malvah's text cloud leans.
- Lusion's post-process pass displaces the WebGL layer.
- Zhenya's portrait **hard-cuts** through about 10 images as the pointer moves, which is cheap and memorable.
- Immersive Garden's "Click to enable sound" label trails the pointer with a heavy lag.

Lag is 0.1–0.5 s. Plain custom cursor dots were rare and add nothing.

## 6. Scroll

- **Heavy smooth scroll** (Lenis, lerp around 0.1) on every site that scrolls.
- **Pinned hero, next section slides over it** (Locomotive, Scout's white sheet over a sticky video).
- **Sticky card stack:** the previous card scales down to a thin strip at the top and dims while the next fills the viewport (Pangram). Grids below stagger 60–100 ms.
- **Fixed frame, moving content** (Obys viewfinder column). The item inside the brackets is full colour and larger; its neighbours are greyscale and smaller.
- **Scroll-scrubbed camera fly-through** (Active Theory: ring → point-cloud forest → title → glass cards, about 0.5 s of coasting). **Scrubbed 3D object rotation** (Mana's can).
- **Hard-cut scenes behind a fixed title** (Merci-Michel). Each section snaps in on a single frame.
- **Background colour bands** that change as sections slide over each other (Lando, Mr. Pops, The Other Side of Truth).
- **Hero type zooms past the camera** on the first scroll (The Other Side of Truth).
- **Velocity bend:** cards bend and bulge with scroll speed (Hello Monday). No plain velocity skew was observed.
- **Rotating ring of tilted photo frames** around a giant headline (Scout).
- Parallax: columns at 0.85 / 1.0 / 1.2 (OFF+BRAND); cut-outs at 1.3–2× (Mr. Pops).

## 7. Page transitions

These are short and text-led. No heavy WebGL dissolve was observed.
- Cream **cover panel** for about 0.3 s, then the new page's letters pop in (OFF+BRAND).
- **Scramble only** on a white page, with no curtain (Locomotive).
- A **liquid curtain** with a wavy edge rises from the bottom in 0.45 s (Hello Monday, the same shape as its loader exit).
- A **plate/fade** of about 1 s (Scout).

Reuse your loader's exit shape for the page transition, so the site has one motion signature.

## 8. Ambient motion

Ambient motion here means continuous drift in 3D (Bizarro's cassette pile, Merci-Michel), slow planet rotation (Messenger), looping marquees (Lando), keyword cycling every 1.2 s (Hello Monday), logo loops of 1.1 s (Buttermax), and light glints every 3–4 s (Echo). Keep ambient amplitude small and periods long (over 3 s), so it reads as alive but not busy.

## 9. What separates the best motion

1. **One continuous actor:** a dot, sphere, ring or frame that persists from loader to scroll (OFF+BRAND, Active Theory, Obys), so every state change is a transformation, not a swap.
2. **Asymmetric timing:** short exits, long arrivals.
3. **Jittered text:** random order, small variance.
4. **Brand-shaped masks:** the logo or brand shape (Lando's 4, Merci-Michel's pixels, Mana's circles) does the wipes.
5. **A deliberate hard cut** somewhere, so the smooth parts feel chosen.
6. **The loader never holds the juror hostage.**

## 10. Code for the signature moves

### Random-order letter pop-in (OFF+BRAND)
```js
function popLetters(el, { stagger = 0.03, dur = 0.28 } = {}) {
  const text = el.textContent; el.textContent = ''; el.setAttribute('aria-label', text);
  const spans = [...text].map(ch => { const s = document.createElement('span'); s.textContent = ch; s.setAttribute('aria-hidden','true'); s.style.display = 'inline-block'; if (ch === ' ') s.style.width = '.28em'; el.append(s); return s; });
  const order = spans.map((_, i) => i).sort(() => Math.random() - .5);
  return gsap.fromTo(spans, { opacity: 0, scale: .6, yPercent: 40 }, { opacity: 1, scale: 1, yPercent: 0, duration: dur, ease: 'expo.out',
    stagger: i => order.indexOf(i) * stagger }); // fromTo, never set+from (recipes §0)
}
```

### Scramble text (Locomotive)
```js
const GLYPHS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function scramble(el, { dur = 0.3 } = {}) {
  const final = el.dataset.text ??= el.textContent; const len = final.length; const t0 = performance.now();
  cancelAnimationFrame(el._raf);
  const step = now => {
    const p = Math.min(1, (now - t0) / (dur * 1000));
    el.textContent = [...final].map((c, i) => c === ' ' || i / len < p ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join('');
    if (p < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}
// keep width stable: use a monospace or tabular face, or set min-width to the final width
```

### Brand-shape mask exit (Lando "4", generalised)
```html
<svg width="0" height="0"><clipPath id="brandMask" clipPathUnits="objectBoundingBox">
  <path id="brandPath" d="M.5 .5 L.5 .5 L.5 .5 Z"/></clipPath></svg>
<!-- page content wrapper uses clip-path:url(#brandMask) until the exit finishes -->
```
```js
// scale your logo path (normalised 0–1 bounding box) from 0 to ~3× around its centre, expo-out 0.45 s, then remove the clip
gsap.fromTo('#brandPath', { scale: 0, transformOrigin: '50% 50%' }, { scale: 3.2, duration: .45, ease: 'expo.out',
  onComplete: () => document.querySelector('.page').style.clipPath = 'none' });
```
A plain CSS circle works the same way: `clip-path: circle(0% at 50% 50%)` → `circle(150% at 50% 50%)`.

### Curved curtain (Mr. Pops / Hello Monday)
```html
<svg class="curtain" viewBox="0 0 100 100" preserveAspectRatio="none"><path id="cur" fill="var(--accent)" d="M0 100 Q50 100 100 100 L100 100 L0 100Z"/></svg>
```
```js
const tl = gsap.timeline();
tl.to('#cur', { attr: { d: 'M0 40 Q50 0 100 40 L100 100 L0 100Z' }, duration: .35, ease: 'power3.in' })
  .to('#cur', { attr: { d: 'M0 0 Q50 0 100 0 L100 100 L0 100Z' }, duration: .3, ease: 'power3.out' });
// reverse the shape (bulge downwards) to uncover the new page
```

### Sticky card stack (Pangram)
```js
gsap.utils.toArray('.stack-card').forEach((card, i, all) => {
  if (i === all.length - 1) return;
  gsap.to(card, { scale: .9, opacity: .5, transformOrigin: '50% 0%', ease: 'none',
    scrollTrigger: { trigger: all[i + 1], start: 'top bottom', end: 'top top', scrub: true } });
});
// CSS: .stack-card{position:sticky;top:calc(var(--i) * 14px)}
```

### Pixel-mosaic dissolve (Locomotive images, Bizarro hover)
```js
// draw the image into a canvas at decreasing block sizes: 64 → 32 → 16 → 8 → 4 → 1, ~70 ms per step (stepped, not eased)
function mosaicIn(canvas, img, steps = [64, 32, 16, 8, 4, 1], ms = 70) {
  const ctx = canvas.getContext('2d'); const { width: w, height: h } = canvas; const tmp = document.createElement('canvas'); const t = tmp.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  steps.forEach((b, i) => setTimeout(() => { tmp.width = Math.ceil(w / b); tmp.height = Math.ceil(h / b); t.drawImage(img, 0, 0, tmp.width, tmp.height); ctx.drawImage(tmp, 0, 0, w, h); }, i * ms));
}
```

### Pointer hard-cut slideshow (Zhenya)
```js
const imgs = [...frame.querySelectorAll('img')]; let last = -1;
frame.addEventListener('pointermove', e => {
  const i = Math.floor((e.clientX / innerWidth) * imgs.length) % imgs.length;
  if (i !== last) { imgs.forEach((im, k) => im.hidden = k !== i); last = i; } // 0 ms on purpose
});
```

### Viewfinder column (Obys)
The playbook has the bracket CSS. The motion is that the frame stays fixed and the column moves under it. Inside the frame, `filter:none; scale:1`; outside it, `filter:grayscale(1) brightness(.7); scale:.82`. Both properties transition at 600 ms expo-out as the active index changes.
