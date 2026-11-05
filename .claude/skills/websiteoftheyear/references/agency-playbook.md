# Agency & studio site playbook

The studios that win Agency / Studio / Independent of the Year (and build the Sites of the Year) spend their best ideas on their own sites. This file turns each one into a pattern you can lift for a portfolio or studio site. Measurements marked **measured** came from a live runtime probe (2026-11-05, 1440×900) or from their CSS/bundles; **inferred** means read from bundle strings or press, not watched.

Copy the *pattern*, never the studio's assets, custom fonts, copy or brand marks. Re-skin every pattern in the client's own tokens (see `reskin` rules in SKILL.md).

## Contents
1. Quick chooser
2. Patterns by studio (12)
3. Shared grammar across all agency winners

---

## 1. Quick chooser

| If the site should feel… | Start from | Core move |
|---|---|---|
| Gallery-quiet, luxury, "museum" | Immersive Garden | Full-bleed monochrome 3D object, tiny corner labels, serif tagline centred |
| Editorial index, design-literate | Obys | Huge wordmark + 11px project index + centred filmstrip with bracket focus frame |
| Developer craft, archival | Aristide Benoist | 10px letter-spaced type, sage/charcoal/ochre, numbered "01 / 30" with A/B/C/D metadata rows |
| Playful, character-led | Unseen | Sound-gate preloader with a mascot, numbered overlay menu, text-roll hovers, draggable 3D world |
| Confident agency, lots of work | Locomotive | Wordmark ticker hero over processed video, stacked two-line project titles, manifesto paragraph |
| Bold, warm, Webflow-buildable | OFF+BRAND | % loader, big three-line statement, numbered featured list with discipline glyphs (● △ ⁂) |
| Dark, cinematic studio | Malvah | Black, one grotesk, fluid `calc(40px + 6.67vw)` display, video-heavy, click-to-copy email toast |
| Pure tech showcase | Lusion / Active Theory / abeto | Canvas is the site; DOM is a thin overlay; cursor drives a post-processing pass |
| Personal, minimal, writing-first | Louis Paquet | One family, one size (Inter 18px/650), no motion. Restraint as the statement |
| Art-director folio | Zhenya Rynzhuk | Serif display + geometric grotesk, giant initial letter per case, 8–12vw headlines, warm stone + orange-red |
| Canvas site that still works for screen readers | Bizarro | Fixed WebGL canvas + visually-hidden focusable project list that slides in on focus |

---

## 2. Patterns by studio

### Immersive Garden: "the corner frame" (Agency of the Year 2025, Studio of the Year 2020 + 2024)
**Measured:** Three r151, Nuxt/Vue, Howler. Body `#e8e8e8`, text `#030303`. Two faces only: a custom Times (`PSTimes`) for the centred tagline at 28px, Helvetica Neue for 14px UI. Sizes authored in vw on a 1440 base (.972vw = 14px, 1.944vw = 28px, 2.5vw = 36px, 3.889vw = 56px). The whole home page is one screen; scroll drives the 3D scene, not the document.
**Look:** a grey plaster bas-relief sculpture fills the frame. Logo mark + tiny letter-spaced wordmark mid-left, serif tagline centre, "Scroll down" mid-right, "Menu" top-right, "See all projects ↗" bottom-left. Nothing else.
**Eases (from bundle):** `cubic-bezier(.77,0,.175,1)` in-out, `(.165,.84,.44,1)` out, GSAP CustomEase.
**Pipeline (their Awwwards case study):** Blender/Houdini/ZBrush → gltf-transform → KTX2 textures with channel packing; Strapi CMS on Vercel; 3D Roman-numeral menu anchors; a hidden "Backstage" section of process notes.
**Borrow:** the four-corner label frame (works with an image or video too, no 3D needed), vw-on-1440 sizing, serif-over-grotesk pairing at tiny sizes, one-screen home.
```css
.frame{position:fixed;inset:0;pointer-events:none;font:400 .972vw/1.2 var(--grotesk);letter-spacing:.01em}
.frame>*{position:absolute;pointer-events:auto}
.frame .tl{top:2.2vw;left:2.2vw}.frame .tr{top:2.2vw;right:2.2vw}
.frame .ml{top:50%;left:2.2vw;translate:0 -50%}.frame .mr{top:50%;right:2.2vw;translate:0 -50%}
.frame .bl{bottom:2.2vw;left:2.2vw}.frame .br{bottom:2.2vw;right:2.2vw}
.tagline{position:fixed;top:50%;left:50%;translate:-50% -50%;font:400 1.944vw/1.1 var(--serif)}
@media (max-width:768px){.frame{font-size:12px}.tagline{font-size:22px}}
.frame{mix-blend-mode:difference;color:#fff} /* stays legible over whatever scrolls beneath */
```
On a scrolling page the bottom corners will sit on top of content, so fade them out after the hero (Immersive Garden's home doesn't scroll, so it never hits this).

### Obys: "index + filmstrip" (Studio of the Year 2023)
**Measured:** a single custom family at exactly two sizes: 11px (`letter-spacing:-.11px`) for 455 text nodes, and 80px (`-2.4px`, i.e. -3%) for display. Black on white. One full-viewport canvas.
**Look:** "OBYS" wordmark huge top-left; a left column lists every project as tiny text (current one highlighted); centre is a vertical strip of project thumbnails, and the active one sits inside bracket corners `[ ]`; meta columns (about, contact) top-right in 11px; a small "Scroll" hint.
**Borrow:** the two-size type system (it's the strongest single trick in this file: everything 11px except one display size), bracket focus frame, list + strip synced to one `--active` index.
```css
:root{--s:11px;--d:80px}
body{font:400 var(--s)/1.3 var(--face);letter-spacing:-.01em}
.display{font-size:var(--d);letter-spacing:-.03em;line-height:.9}
.strip figure.is-active{position:relative}
.strip figure.is-active::before,.strip figure.is-active::after{content:"";position:absolute;inset:-14px;border:2px solid currentColor;clip-path:polygon(0 0,18px 0,18px 2px,2px 2px,2px calc(100% - 2px),18px calc(100% - 2px),18px 100%,0 100%)}
.strip figure.is-active::after{transform:scaleX(-1)}
```

### Aristide Benoist: "the archive sheet" (Independent of the Year 2023)
**Measured:** custom font at 10px with `letter-spacing:.2px` on 290 nodes, 11–16px elsewhere. Palette sage `#bac4b8`, charcoal `#1e1e1e`, ochre `#cc9933`, bg `#141414`. Two canvases. Colours are kept in a JS config with normalised RGB, so CSS and shaders read one palette. `font-feature-settings:"liga" off`.
**Look:** projects are numbered "01 / 30". Titles are letter-spaced lowercase ("h o u s e o f G u c c I"), and each project has a metadata block lettered A COMPLETED / B TYPE / C ROLE / D CLIENT, then "EXPLORE".
**Borrow:** lettered metadata rows (instant "spec sheet" credibility), the n / total counter, three-colour palette shared with the shader.
```js
export const palette = { bg:'#141414', ink:'#bac4b8', accent:'#cc9933' };
export const toGL = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16)/255); // feed uniforms
Object.entries(palette).forEach(([k,v]) => document.documentElement.style.setProperty(`--${k}`, v));
```

### Unseen: "the sound gate" (Studio of the Year 2021)
**Measured:** Three r143, Howler, Neue Montreal only (verified alongside Saol Display in CSS), 10–19px, uppercase labels. Dark loader → blush-pink screen with a cartoon-eyes mascot, three-line blurb, pill "Enter" button.
**From HTML:** two buttons "Enter" / "Enter without audio"; overlay menu numbered 01 Index, 02 Projects, 03 Contact, 04 World; every menu label is two stacked spans (text-roll hover); home is a draggable 3D world ("Drag to explore", "Click & Hold"); filter chips All / Branding / Digital / Motion / Experiment; ease `cubic-bezier(.34,1.56,.64,1)` (back-out overshoot).
**Borrow:** the gate (solves autoplay-audio policy and builds anticipation while assets load), the text-roll hover, numbered overlay menu.
```html
<a class="roll" href="/work"><span>Projects</span><span aria-hidden="true">Projects</span></a>
```
```css
.roll{display:inline-grid;overflow:hidden;line-height:1.1}
.roll span{grid-area:1/1;transition:translate .5s cubic-bezier(.19,1,.22,1)}
.roll span+span{translate:0 100%}
.roll:hover span:first-child{translate:0 -100%}.roll:hover span+span{translate:0 0}
@media (prefers-reduced-motion:reduce){.roll span{transition:none}}
```

### Locomotive: "the dynasty home page" (Agency of the Year 2020–2024)
**Measured:** Three r165, Lenis, Vue, Barba transitions; Helvetica Now Display (57 nodes) + a custom serif display (`LocomotiveNew`). Everything weight 400; sizes 15/18/28/36/40px. White bg, black text, accents `#DA382E` / `#312DFB` in CSS. The fixed header holds only "Locomotive®" and "Menu".
**Look:** full-bleed hero video run through a WebGL pixel-mosaic treatment (red, dark), with a two-line wordmark bottom-left ("Locomotive® / Digital-first Design Agency") and tiny badges. The hero text builds one word at a time. Featured work is five projects with stacked two-line titles ("The / Drake Hotel"), then a one-paragraph manifesto, a hiring line and services.
**Borrow:** a processed-video hero (pixelate/dither shader on your reel), the word-by-word build, weight-400-only type, honest brag line ("Seven years running").

### OFF+BRAND: "the Webflow flagship" (built Lando Norris, SOTY 2025)
**Measured from CSS:** `--main-dark:#1d1d1d`, `--main-light:#e5e4e0`, `--main-light-alt:#f1f0ec`, `--primary-color:#ff642f`, pastel accents `#facb0e #f06ba8 #78bae6`, radii 6.25em / .4rem, label tracking .1–.15em, ease `cubic-bezier(.165,.84,.44,1)`. Webflow + Lenis + a custom WebGL "orb".
**Look:** a 5%→100% numeric loader; a three-line statement hero ("A Different / creative / approach" + "scroll ↓"); a numbered featured list where each row carries discipline glyphs (● Brand & Design, △ Development, ⁂ WebGL); every nav item ends in "->".
**Borrow:** the glyph legend for disciplines (cheap, distinctive), warm off-white + one hot orange, and the proof that a SOTY studio ships on Webflow.

### Malvah: "dark studio reel" (Studio of the Year 2025)
**Measured:** Three r173, Nuxt, Lenis, 8 videos, 10 screens tall. NeueHaasGroteskText Pro only: 16px body ×63, 52px display. Black bg, text `#e6e6e6`, secondary `#595959`. Loader "Ma / 0 %". Fluid display `calc(40px + 6.67vw)` capped at 1440; uppercase labels at .14em; GSAP CustomEase named `pageTransitionEase`.
**Look:** play reel, "What we do_" with 4 services, a "Recent Work(07)" counter, and a footer where clicking the email copies it and shows an "Email copied!" toast.
**Borrow:** the counter in headings, click-to-copy email, the underscore suffix on section titles, and one family at two sizes on black.

### Lusion: "post-process the cursor" (SOTY 2023, CSSDA WOTY 2023, Webby 2020 + 2022)
**Measured:** Three r158, Aeonik only, all-caps UI 13–26px, display 86px uppercase; a counter loader "000". The winning v3 palette was `#1a2ffb` electric blue + `#f0f1fa`.
**Known technique:** the cursor effect is a post-processing pass applied to the WebGL layer only, so HTML text stays crisp (three.js forum). Their 2019 site baked Houdini cloth to a ~220KB ArrayBuffer, stored vertex animation in two PNGs (positions, normals), and shipped 246KB to mobile against 983KB on desktop.
**Borrow:** one family set all-caps, the counter loader, a cursor that disturbs the scene rather than following as a dot, and baking anything expensive offline.

### Active Theory: "the canvas is the site" (built Prometheus, SOTY 2021; CSSDA WOTY 2021)
**Measured:** the DOM is an empty `#Stage` with a 1.8MB app bundle. NB Architekt + Times at 10–16px. UI is just "Toggle Audio / Work / Contact" plus a now-playing strip "<< Song — Artist >>".
**Engine habits (from bundle):** framerate-normalised lerps; GPU-tier detection with DPR scaling; worker threads for uploads; one shared renderer with scenes ping-ponged so only one renders per frame; a mouse fluid sim (128 sim grid / 512 dye grid); a live GUI config for designers; `.GLA11y` hidden layer for screen readers.
**Borrow:** a now-playing strip in the nav (personality for free), frame-rate-normalised lerp, GPU-tier quality switch.
```js
const lerpA = (a, dt) => 1 - Math.pow(1 - a, dt * 60);  // same feel at 30/60/120 Hz
x += (target - x) * lerpA(0.08, dt);
```

### Bizarro: "accessible canvas" (Independent of the Year 2021; source on GitHub: bizarro/bizar.ro)
**Measured from CSS:** fixed full-screen WebGL canvas (fades in over 1.2s on `.is-ready`, .3s under reduced motion), Inter 14px, `#000` / `#f2f2f2`, `cursor:none` with the cursor drawn in the canvas. A visually-hidden but focusable `.projects` list (`clip-path:inset(50%)`) becomes a 420px left-edge list on `:focus-within`, masked with a fade gradient. Old repo: plain JS + GSAP + OGL + Pug + Webpack, static on Vercel.
**Borrow:** this is the reference answer to "how does a WebGL portfolio stay accessible".
```css
.projects{position:fixed;left:0;top:0;width:420px;height:100vh;clip-path:inset(50%)}
.projects:focus-within{clip-path:none;mask-image:linear-gradient(transparent,#000 20%,#000 80%,transparent)}
.projects ul{transform:translateY(calc(132px - var(--active) * 22px));transition:transform .6s cubic-bezier(.19,1,.22,1)}
```

### Zhenya Rynzhuk: "art director's folio" (Independent of the Year 2020; designed Synchronized, Mobile SOTY 2020)
**Measured:** GT Walsheim + Schnyder L (serif display); headlines 8.7–12vw; uppercase labels tracked 3–6px. Palette `#191919`, `#f93700` / `#ff501e` orange-red, `#dbd5c9` warm stone, `#f9dddd` pink; "In red" / "In light" theme toggle; standard easings.net quad/cubic curves.
**Look:** each selected case gets a giant initial letter ("C", "R") beside its title, with "Check full case +" and "Showreel – Click click".
**Borrow:** the giant-initial case card, a theme toggle named by colour, and serif-display headlines at 10vw over a geometric grotesk.

### Louis Paquet: "restraint" (Independent of the Year 2025, 40 SOTDs)
**Measured:** Inter, one size, 18px / weight 650, `#1f1f1f` on `#e0deda`. No canvas, no motion library, 123KB bundle. Name, title, about paragraph, a list of ~25 project names, courses.
**Borrow:** proof that a jury-famous designer's own site can be a single text page. Use it when the work speaks elsewhere, or as the "about" page of a louder site.

---

## 3. Shared grammar across agency winners

- **Type:** one family (Obys, Malvah, Lusion, Louis Paquet) or one grotesk + one serif display (Immersive Garden, Locomotive, Unseen, Zhenya). Never three. Weight 400 almost everywhere; hierarchy comes from size and case, not boldness.
- **Size system:** few sizes, far apart. Obys uses 11 and 80; Malvah 16 and 52; Immersive Garden 14 and 28. Tiny UI text (10–14px) next to one huge display size is the agency look.
- **Colour:** near-black + one off-white (`#030303/#e8e8e8`, `#1d1d1d/#e5e4e0`, `#000/#f2f2f2`) plus at most one accent. Palettes live in one config shared by CSS and shaders.
- **Chrome:** fixed corner labels instead of a nav bar; "Menu" opens a numbered full-screen overlay; counters ("Recent Work(07)", "01 / 30", "0 %") everywhere.
- **Motion:** expo/quart-out curves: `cubic-bezier(.19,1,.22,1)`, `(.165,.84,.44,1)`, in-out `(.77,0,.175,1)`. Durations .5–1.2s. Lenis smooth scroll. Text-roll hovers with duplicated spans. Page transitions via Barba/Taxi/Nuxt.
- **Entry:** a preloader is near-universal (counter, letter drop, or sound gate). Use the wait for brand theatre, not a spinner.
- **Stack:** Nuxt/Vue + GSAP + Lenis + three.js is the modal agency stack. Webflow (OFF+BRAND, Lando Norris) and Astro (Lusion, Scout Motors) are proven alternatives.
- **Accessibility:** the best canvas sites keep a real DOM layer (Bizarro, Active Theory). Do this; the juries are starting to score it.
